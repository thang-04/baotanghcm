const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const roomFourSpatial = require('./src/lib/roomFourSpatial.json');
const { createCompetitionTransport } = require('./server/competition/transport.cjs');
const competition = createCompetitionTransport();

// Giới hạn số người tham quan đồng thời tối đa trong một phòng
const MAX_USERS_PER_ROOM = 65;

// Lưu trữ thông tin người chơi trực tuyến trong bộ nhớ
// Cấu trúc: { [socketId]: { id, nickname, galleryId, x, y, z, yaw } }
const activeUsers = {};

// Lưu trữ danh sách socket ID xếp hàng chờ cho từng phòng
// Cấu trúc: { [socketRoom]: [socketId1, socketId2, ...] }
const waitingQueues = {};

// ═══════════════════════════════════════════════════════════════════════════
// BATCH BROADCAST — Gom vị trí dirty, flush 10Hz thay vì broadcast từng cái
// Giảm outbound messages từ ~33,000/s → ~6,500/s cho 65 người
// ═══════════════════════════════════════════════════════════════════════════
const dirtyUsers = new Set(); // Tập hợp socketId có vị trí thay đổi

setInterval(() => {
  if (dirtyUsers.size === 0) return;
  // Gom tất cả user dirty thành 1 mảng
  const batch = [];
  for (const sid of dirtyUsers) {
    if (activeUsers[sid]) batch.push(activeUsers[sid]);
  }
  dirtyUsers.clear();
  if (batch.length > 0) {
    // Gửi 1 lần duy nhất thay vì N lần riêng lẻ
    io.to('museum-unified').emit('users-batch-moved', batch);
  }
}, 100); // 10Hz flush

// Lưu trữ bảng xếp hạng game gốm sứ trong file/bộ nhớ
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');
let leaderboard = [];
try {
  if (fs.existsSync(LEADERBOARD_FILE)) {
    leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    console.log(`[LEADERBOARD] Đã tải ${leaderboard.length} kỷ lục từ file.`);
  }
} catch (e) {
  console.error('Lỗi đọc file leaderboard.json:', e);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI CỬA PHÒNG (Door States) — Admin điều khiển mở/đóng
// Cấu trúc: { [doorId]: { isOpen: boolean, targetRoom: string } }
// ═══════════════════════════════════════════════════════════════════════════
// Cửa luôn mở sẵn theo tuyến 01 → 02 → 03 → 04 → 05.
// Người chơi chỉ cần đứng gần cửa và nhấn E, không cần quản trị viên duyệt.
const doorStates = {
  'door-room1': { isOpen: true, targetRoom: 'gallery-subsidy' },
  'door-room2': { isOpen: true, targetRoom: 'gallery-three' },
  'door-room3': { isOpen: true, targetRoom: 'gallery-ceramics' },
  'door-room4': { isOpen: true, targetRoom: 'gallery-market-economy' },
  'door-room5': { isOpen: true, targetRoom: 'gallery-paintings' },
};
const closingTimers = {};

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI PHÒNG TRIỂN LÃM (Room States) — Admin điều khiển bật/tắt (mở/đóng)
// Cấu trúc: { [roomId]: { isOpen: boolean } }
// ═══════════════════════════════════════════════════════════════════════════
const roomStates = {
  'gallery-subsidy': { isOpen: true },
  'gallery-paintings': { isOpen: true },
  'gallery-ceramics': { isOpen: true },
  'gallery-market-economy': { isOpen: true },
  'gallery-three': { isOpen: true }
};

// Trạng thái đồng bộ của phòng 1
let roomOneState = 'waiting'; // 'waiting', 'countdown', 'started'
let roomOneCountdownTimer = null;
let roomOneStartTimestamp = null;

// Trạng thái đồng bộ của phòng 5 (Hội nghị)
let roomTwoSessionState = 'waiting'; // 'waiting', 'session1'

const updateRoomOneReadyStatus = () => {
  // Tìm tất cả user đang ở trong phòng 1
  const usersInRoomOne = Object.values(activeUsers).filter(
    u => u.galleryId === 'gallery-subsidy' && u.nickname
  );

  const totalPlayers = usersInRoomOne.length;
  const readyPlayers = usersInRoomOne.filter(u => u.room1Ready).length;

  console.log(`[ROOM-1-STATUS] Sẵn sàng: ${readyPlayers}/${totalPlayers}. Trạng thái hiện tại: ${roomOneState}`);

  if (totalPlayers === 0) {
    // Reset về waiting nếu không còn ai
    roomOneState = 'waiting';
    if (roomOneCountdownTimer) {
      clearTimeout(roomOneCountdownTimer);
      roomOneCountdownTimer = null;
    }
    return;
  }

  if (roomOneState === 'waiting') {
    if (readyPlayers === totalPlayers && totalPlayers > 0) {
      roomOneState = 'countdown';
      io.to('museum-unified').emit('room1:countdown-start', { duration: 5 });
      console.log(`[ROOM-1] Tự động bắt đầu đếm ngược 5 giây vì tất cả người chơi (${readyPlayers}/${totalPlayers}) đã sẵn sàng.`);

      roomOneCountdownTimer = setTimeout(() => {
        roomOneState = 'started';
        roomOneStartTimestamp = Date.now();
        io.to('museum-unified').emit('room1:start-game', { roomOneStartTimestamp });
        console.log(`[ROOM-1] Trò chơi tự động bắt đầu. Start time: ${roomOneStartTimestamp}`);
        roomOneCountdownTimer = null;
      }, 5000);
    } else {
      io.to('museum-unified').emit('room1:waiting-status', { readyPlayers, totalPlayers });
    }
  }
};

const broadcastRoomOnePlayers = () => {
  const usersInRoomOne = Object.values(activeUsers)
    .filter(u => (u.galleryId === 'gallery-subsidy' || u.galleryId === 'lobby') && u.nickname)
    .map(u => ({
      socketId: u.id,
      nickname: u.nickname,
      galleryId: u.galleryId,
      ready: !!u.room1Ready,
      completed: !!u.room1Completed,
      cluesCollectedCount: u.cluesCollectedCount || 0,
      baseScore: u.room1BaseScore || 0,
      timeSpent: u.room1TimeSpent || 0
    }));
  
  io.emit('admin:room1-players-update', usersInRoomOne);
};
const broadcastRoomTwoPlayers = () => {
  const usersInRoomTwo = Object.values(activeUsers)
    .filter(u => u.galleryId === 'gallery-paintings' && u.nickname)
    .map(u => ({
      socketId: u.id,
      nickname: u.nickname,
      submitted1: u.room2Score1 !== undefined,
      score1: u.room2Score1 || 0,
      submitted2: u.room2Score2 !== undefined,
      score2: u.room2Score2 || 0,
      submitted3: u.room2Score3 !== undefined,
      score3: u.room2Score3 || 0,
      submitted4: u.room2Score4 !== undefined,
      score4: u.room2Score4 || 0,
      totalScore: (u.room2Score1 || 0) + (u.room2Score2 || 0) + (u.room2Score3 || 0) + (u.room2Score4 || 0)
    }));
  
  io.emit('admin:room2-players-update', usersInRoomTwo);
};


// Thời gian đếm ngược trước khi đóng cửa hoàn toàn (ms)
const DOOR_CLOSE_COUNTDOWN_MS = 5000;

// Hàm ánh xạ phòng triển lãm sang phòng socket hợp nhất
const getSocketRoom = (galleryId) => {
  // Tất cả phòng trong bảo tàng giờ chung 1 socket room (vì chúng nối liền nhau)
  return 'museum-unified';
};

const server = http.createServer((req, res) => {
  if (competition.http(req, res)) return;
  // CORS Headers để cho phép gọi API từ client ở cổng khác (cổng 3000) hoặc production URL
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API lấy thống kê số lượng người đang xem online
  if (req.url.startsWith('/stats')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Phân tích tham số query để lấy galleryId
    const urlParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const galleryId = urlParams.searchParams.get('galleryId') || 'gallery-paintings';
    
    // Đếm số người hiện đang ở trong phòng hợp nhất (hoặc phòng tương ứng)
    const socketRoom = getSocketRoom(galleryId);
    const activeCount = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom).length;
    
    res.end(JSON.stringify({
      activeCount,
      limit: MAX_USERS_PER_ROOM
    }));
    return;
  }

  // API lấy trạng thái cửa
  if (req.url.startsWith('/door-status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ doors: doorStates }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ortus 3D Museum Multiplayer Server is running\n');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Tối ưu cho 65 người — giảm băng thông, tăng độ ổn định
  pingInterval: 25000,   // 25s thay vì 25s mặc định
  pingTimeout: 20000,    // 20s timeout
  transports: ['websocket'], // Bỏ polling, chỉ dùng WebSocket thuần
  perMessageDeflate: {
    threshold: 256,      // Nén payload > 256 bytes (batch ~65 users = ~3KB)
    zlibDeflateOptions: { level: 1 }, // Nén nhanh, ít CPU nhất
  }
});

competition.attach(io);

io.on('connection', (socket) => {
  console.log(`Du khách kết nối: ${socket.id}`);

  // Gửi trạng thái cửa hiện tại cho client mới kết nối
  socket.emit('door-states', doorStates);
  // Gửi trạng thái phòng hiện tại cho client mới kết nối
  socket.emit('room-states', roomStates);
  // Gửi bảng xếp hạng hiện tại cho client
  socket.emit('leaderboard-updated', leaderboard);

  // Lắng nghe sự kiện cập nhật trạng thái chơi game của user
  socket.on('update-status', (status) => {
    const user = activeUsers[socket.id];
    if (!user) return;
    
    user.status = status;
    const socketRoom = getSocketRoom(user.galleryId);
    
    // Broadcast trạng thái mới cho toàn bộ người chơi trong phòng
    io.to(socketRoom).emit('user-status-updated', { id: socket.id, status });
    console.log(`[STATUS-UPDATE] ${user.nickname} (${socket.id}) cập nhật trạng thái: "${status}"`);
  });

  socket.on('room1:ready', () => {
    const user = activeUsers[socket.id];
    if (!user || user.galleryId !== 'gallery-subsidy') return;
    user.room1Ready = true;
    console.log(`[ROOM-1] ${user.nickname} (${socket.id}) đã sẵn sàng khám phá.`);
    updateRoomOneReadyStatus();
    broadcastRoomOnePlayers();
  });

  // Lắng nghe gửi điểm số lên bảng xếp hạng
  socket.on('submit-score', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    // Thêm điểm vào danh sách
    leaderboard.push({
      nickname: user.nickname,
      score: data.score,
      time: data.timeSpent !== undefined ? `${data.timeSpent}s` : '180s'
    });

    // Sắp xếp giảm dần theo điểm và tăng dần theo thời gian (giây) làm bài
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aSec = parseInt(a.time) || 180;
      const bSec = parseInt(b.time) || 180;
      return aSec - bSec;
    });

    if (leaderboard.length > 10) {
      leaderboard.splice(10);
    }

    // Ghi bảng xếp hạng mới vào file để lưu trữ lâu dài
    try {
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2), 'utf8');
    } catch (e) {
      console.error('Lỗi khi ghi file leaderboard.json:', e);
    }

    // Phát sóng bảng xếp hạng mới nhất cho mọi người
    io.emit('leaderboard-updated', leaderboard);
    console.log(`[LEADERBOARD] ${user.nickname} gửi điểm: ${data.score}, thời gian: ${data.timeSpent}s. Bảng xếp hạng đã cập nhật.`);
  });

  // 1. Khi người chơi tham gia phòng
  socket.on('join-room', (data) => {
    const { nickname, galleryId, x, y, z, yaw } = data;
    const socketRoom = getSocketRoom(galleryId);
    
    // Nếu chưa có nickname -> Chỉ cho phép quan sát (Spectator), không chiếm vị trí trong phòng
    if (!nickname) {
      socket.join(socketRoom);
      console.log(`[SPECTATE] Du khách ẩn danh (${socket.id}) đang quan sát phòng ${galleryId} (socket room: ${socketRoom}).`);
      
      // Gửi danh sách người chơi hiện tại cho spectator
      const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
      socket.emit('users-list', usersInRoom);
      return;
    }

    if (!waitingQueues[socketRoom]) {
      waitingQueues[socketRoom] = [];
    }

    // Đếm số người hiện đang ở trong phòng triển lãm này (hợp nhất)
    const activeInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);

    // Lưu thông tin người dùng mới
    const newUser = {
      id: socket.id,
      outfitId: ['student', 'baba', 'aodai', 'casual'].includes(data.outfitId) ? data.outfitId : 'student',
      nickname: nickname !== undefined ? nickname : 'Anonymous',
      galleryId,
      x: x || 0,
      y: y || 1.7,
      z: z || 5,
      yaw: yaw || 0,
      status: '',
      score: 0,
      timeSpent: 9999
    };

    if (activeInRoom.length < MAX_USERS_PER_ROOM) {
      // Cho phép vào phòng trực tiếp
      activeUsers[socket.id] = newUser;
      socket.join(socketRoom);
      console.log(`[JOIN] ${newUser.nickname} (${socket.id}) vào phòng ${galleryId} (socket: ${socketRoom}) trực tiếp. (${activeInRoom.length + 1}/${MAX_USERS_PER_ROOM})`);
      
      // Phản hồi thành công
      socket.emit('join-success');

      // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
      const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
      socket.emit('users-list', usersInRoom);

      // Phát thông báo cho những người khác trong phòng
      socket.to(socketRoom).emit('user-joined', newUser);

      if (galleryId === 'gallery-subsidy') {
        newUser.room1Ready = false;
        socket.emit('room1:state-sync', { roomOneState });
        updateRoomOneReadyStatus();
        broadcastRoomOnePlayers();
      }
    } else {
      // Phòng đầy -> Đưa vào hàng chờ
      if (!waitingQueues[socketRoom].includes(socket.id)) {
        waitingQueues[socketRoom].push(socket.id);
      }
      
      // Lưu tạm thông tin người dùng để duyệt vào sau này
      socket.tempUserData = newUser;

      const position = waitingQueues[socketRoom].indexOf(socket.id) + 1;
      console.log(`[QUEUE] ${newUser.nickname} (${socket.id}) xếp hàng chờ phòng ${galleryId} (socket: ${socketRoom}). Vị trí: #${position}`);

      // Gửi vị trí xếp hàng thời gian thực
      socket.emit('queue-status', { inQueue: true, position, limit: MAX_USERS_PER_ROOM });
    }
  });

  // 2. Khi người chơi di chuyển (Cập nhật vị trí liên tục)
  socket.on('move', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    user.x = data.x;
    user.y = data.y;
    user.z = data.z;
    user.yaw = data.yaw;
    user.isSitting = data.isSitting;
    user.headYaw = data.headYaw;

    const oldRoom = user.galleryId;
    let newRoom = oldRoom;

    // Cập nhật galleryId thời gian thực dựa vào tọa độ z để server biết user đang ở phòng nào
    if (data.z <= 8.0) {
      newRoom = 'lobby';
    } else if (data.z > 8.0 && data.z <= 54.0) {
      newRoom = 'gallery-subsidy';
    } else if (data.z > 54.0 && data.z <= 104.0) {
      newRoom = 'gallery-three';
    } else if (data.z > 104.0 && data.z <= 150.0) {
      newRoom = 'gallery-paintings';
    } else if (data.z > 150.0 && data.z <= 180.0) {
      newRoom = 'gallery-ceramics';
    } else if (data.z > roomFourSpatial.worldStartZ && data.z <= roomFourSpatial.worldEndZ) {
      newRoom = 'gallery-market-economy';
    }

    if (newRoom !== oldRoom) {
      user.galleryId = newRoom;
      console.log(`[ROOM-CHANGE] ${user.nickname} (${socket.id}) chuyển sang phòng: ${newRoom}`);
      
      if (newRoom === 'gallery-subsidy') {
        user.room1Ready = false;
        socket.emit('room1:state-sync', { roomOneState, roomOneStartTimestamp });
        updateRoomOneReadyStatus();
        broadcastRoomOnePlayers();
      }
      
      if (oldRoom === 'gallery-subsidy') {
        updateRoomOneReadyStatus();
        broadcastRoomOnePlayers();
      }

      if (newRoom === 'gallery-paintings') {
        socket.emit('room2:state-sync', { roomTwoSessionState });
        broadcastRoomTwoPlayers();
      }
      
      if (oldRoom === 'gallery-paintings') {
        broadcastRoomTwoPlayers();
      }
    }

    // Đánh dấu user này là dirty — sẽ được batch-broadcast sau 100ms
    dirtyUsers.add(socket.id);
  });

  // 2.5. Khi người chơi hoàn thành minigame và cập nhật điểm số
  socket.on('update-score', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;
    user.score = data.score;
    const socketRoom = getSocketRoom(user.galleryId);
    const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
    io.to(socketRoom).emit('users-list', usersInRoom);
    console.log(`[SCORE] ${user.nickname} (${socket.id}) cập nhật điểm: ${user.score}`);
  });

  // 3. Khi người chơi gửi tin nhắn Chat
  socket.on('send-message', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const chatMsg = {
      userId: socket.id,
      nickname: user.nickname,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const socketRoom = getSocketRoom(user.galleryId);
    // Phát tin nhắn cho những người khác trong cùng phòng
    socket.to(socketRoom).emit('receive-message', chatMsg);
    console.log(`[CHAT] [Room ${user.galleryId}] (socket: ${socketRoom}) ${user.nickname}: ${data.text}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ADMIN: MỞ CỬA PHÒNG (Admin opens a door to a gallery room)
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:open-door', (data) => {
    const { doorId, targetRoom } = data;
    console.log(`[ADMIN] Yêu cầu mở cửa "${doorId}" → phòng "${targetRoom}"`);

    // Kiểm tra điều kiện mở cửa: Các phòng hiện tại hoạt động độc lập và luôn sẵn sàng
    let canOpen = true;

    // Hủy timer đóng cửa nếu có
    if (closingTimers[doorId]) {
      clearTimeout(closingTimers[doorId]);
      delete closingTimers[doorId];
    }

    doorStates[doorId] = {
      isOpen: true,
      targetRoom,
    };

    // Phát sóng cho tất cả client
    io.emit('door-opened', { doorId, targetRoom });
    // Gửi lại toàn bộ trạng thái cửa
    io.emit('door-states', doorStates);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ADMIN: ĐÓNG CỬA PHÒNG (Admin closes a door instantly, no warnings/teleports)
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:close-door', (data) => {
    const { doorId } = data;
    console.log(`[ADMIN] Đóng cửa "${doorId}" ngay lập tức`);

    doorStates[doorId] = {
      isOpen: false,
      targetRoom: '',
    };

    if (closingTimers[doorId]) {
      clearTimeout(closingTimers[doorId]);
      delete closingTimers[doorId];
    }

    // Phát sóng cho tất cả client: Cửa đã đóng ngay lập tức
    io.emit('door-closed', { doorId });
    io.emit('door-states', doorStates);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. ADMIN: LẤY TRẠNG THÁI CỬA VÀ PHÒNG
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:get-door-status', () => {
    socket.emit('door-states', doorStates);
    socket.emit('room-states', roomStates);
  });

  socket.on('admin:start-room1-countdown', () => {
    console.log(`[ADMIN] Yêu cầu bắt đầu đếm ngược Phòng 1 từ admin.`);
    if (roomOneState === 'waiting') {
      roomOneState = 'countdown';
      io.to('museum-unified').emit('room1:countdown-start', { duration: 5 });
      console.log(`[ROOM-1] Bắt đầu đếm ngược 5 giây cho tất cả người chơi theo lệnh Admin.`);

      roomOneCountdownTimer = setTimeout(() => {
        roomOneState = 'started';
        roomOneStartTimestamp = Date.now();
        io.to('museum-unified').emit('room1:start-game', { roomOneStartTimestamp });
        console.log(`[ROOM-1] Trò chơi đã bắt đầu theo lệnh Admin. Start time: ${roomOneStartTimestamp}`);
        roomOneCountdownTimer = null;
      }, 5000);
    }
  });

  socket.on('room1:update-clues-count', (data) => {
    const user = activeUsers[socket.id];
    if (user) {
      user.cluesCollectedCount = data.count || 0;
      console.log(`[ROOM-1] ${user.nickname} thu thập được ${user.cluesCollectedCount}/6 vật phẩm.`);
      broadcastRoomOnePlayers();
    }
  });

  socket.on('room1:submit-results', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const { baseScore, clientElapsedMs } = data;
    const serverElapsedMs = roomOneStartTimestamp ? (Date.now() - roomOneStartTimestamp) : 0;

    // Tăng cường bảo mật: Chống hack client-side time
    let finalTimeSpent = 0;
    if (clientElapsedMs === undefined || clientElapsedMs < 0 || clientElapsedMs > serverElapsedMs + 2000 || clientElapsedMs < serverElapsedMs - 6000) {
      finalTimeSpent = Math.floor(serverElapsedMs / 1000);
      console.warn(`[ROOM-1-SECURITY] Desync/Cheating detected for ${user.nickname}. Fallback to server elapsed time: ${finalTimeSpent}s`);
    } else {
      finalTimeSpent = Math.floor(clientElapsedMs / 1000);
    }

    user.room1Completed = true;
    user.room1BaseScore = baseScore;
    user.room1TimeSpent = finalTimeSpent;

    console.log(`[ROOM-1-SUBMIT] ${user.nickname} nộp kết quả. BaseScore: ${baseScore}, Time: ${finalTimeSpent}s`);
    broadcastRoomOnePlayers();

    // Kiểm tra xem tất cả người chơi trong phòng 1 đã hoàn thành chưa
    const usersInRoomOne = Object.values(activeUsers).filter(
      u => u.galleryId === 'gallery-subsidy' && u.nickname
    );

    const everyoneFinished = usersInRoomOne.every(u => u.room1Completed);

    if (everyoneFinished && usersInRoomOne.length > 0) {
      console.log(`[ROOM-1-COMPLETE] Tất cả người chơi trong phòng đã hoàn thành! Bắt đầu tính xếp hạng.`);

      // 1. Sắp xếp danh sách người chơi
      const participants = usersInRoomOne.map(u => ({
        nickname: u.nickname,
        baseScore: u.room1BaseScore || 0,
        timeSpent: u.room1TimeSpent || 0,
        socketId: u.id
      }));

      participants.sort((a, b) => {
        if (b.baseScore !== a.baseScore) {
          return b.baseScore - a.baseScore;
        }
        return a.timeSpent - b.timeSpent;
      });

      // 2. Trao thưởng Top 5
      const bonusMap = [10, 8, 6, 4, 2];
      const results = participants.map((p, idx) => {
        const bonus = idx < 5 ? bonusMap[idx] : 0;
        const finalScore = p.baseScore + bonus;

        // Cập nhật điểm cho user trực tuyến
        const targetUser = activeUsers[p.socketId];
        if (targetUser) {
          targetUser.score = finalScore;
        }

        // Đẩy điểm vào bảng xếp hạng chung
        leaderboard.push({
          nickname: p.nickname,
          score: finalScore,
          time: `${p.timeSpent}s`
        });

        return {
          nickname: p.nickname,
          baseScore: p.baseScore,
          timeSpent: p.timeSpent,
          bonus,
          finalScore
        };
      });

      // Sắp xếp lại bảng xếp hạng chung
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aSec = parseInt(a.time) || 180;
        const bSec = parseInt(b.time) || 180;
        return aSec - bSec;
      });
      if (leaderboard.length > 10) {
        leaderboard.splice(10);
      }

      // Lưu bảng xếp hạng vào file
      try {
        fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2), 'utf8');
      } catch (e) {
        console.error('Lỗi khi ghi file leaderboard.json:', e);
      }

      // Phát sóng bảng xếp hạng mới cho toàn bộ người chơi
      io.emit('leaderboard-updated', leaderboard);

      // Phát sóng sự kiện kết thúc phiên chơi phòng 1 kèm kết quả xếp hạng
      io.to('museum-unified').emit('room1:session-ended', { results });

      // Cửa Phòng 02 (Bến Nhà Rồng) luôn mở sẵn để người chơi đi tiếp ngay.
      doorStates['door-room2'] = { isOpen: true, targetRoom: 'gallery-three' };
      io.emit('door-opened', { doorId: 'door-room2', targetRoom: 'gallery-three' });
      io.emit('door-states', doorStates);

      roomStates['gallery-three'] = { isOpen: true };
      io.emit('room-states', roomStates);

      // Reset các trường đồng bộ Phòng 1 cho phiên chơi mới
      usersInRoomOne.forEach(u => {
        u.room1Ready = false;
        u.room1Completed = false;
        u.room1BaseScore = 0;
        u.room1TimeSpent = 0;
      });
      roomOneState = 'waiting';
      io.to('museum-unified').emit('room1:state-sync', { roomOneState, roomOneStartTimestamp: null });
    }
  });

  socket.on('admin:force-end-room1', () => {
    console.log('[ADMIN] Yêu cầu KẾT THÚC trò chơi Phòng 1 từ admin.');
    if (roomOneState === 'started') {
      const usersInRoomOne = Object.values(activeUsers).filter(
        u => u.galleryId === 'gallery-subsidy' && u.nickname
      );

      if (usersInRoomOne.length === 0) {
        roomOneState = 'waiting';
        io.to('museum-unified').emit('room1:state-sync', { roomOneState, roomOneStartTimestamp: null });
        return;
      }

      const serverElapsedMs = roomOneStartTimestamp ? (Date.now() - roomOneStartTimestamp) : 0;
      const finalTimeSpent = Math.floor(serverElapsedMs / 1000);

      // Ép buộc tính điểm cho những người chưa hoàn thành
      usersInRoomOne.forEach(u => {
        if (!u.room1Completed) {
          u.room1Completed = true;
          // Điểm cơ bản = Số hiện vật thu thập * 5đ
          const cluesCount = u.cluesCollectedCount || 0;
          u.room1BaseScore = cluesCount * 5; 
          u.room1TimeSpent = finalTimeSpent;
        }
      });

      // Tính toán kết quả & phát thưởng Top 5
      const participants = usersInRoomOne.map(u => ({
        nickname: u.nickname,
        baseScore: u.room1BaseScore || 0,
        timeSpent: u.room1TimeSpent || 0,
        socketId: u.id
      }));

      participants.sort((a, b) => {
        if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
        return a.timeSpent - b.timeSpent;
      });

      const bonusMap = [10, 8, 6, 4, 2];
      const results = participants.map((p, idx) => {
        const bonus = idx < 5 ? bonusMap[idx] : 0;
        const finalScore = p.baseScore + bonus;

        const targetUser = activeUsers[p.socketId];
        if (targetUser) {
          targetUser.score = finalScore;
        }

        leaderboard.push({
          nickname: p.nickname,
          score: finalScore,
          time: `${p.timeSpent}s`
        });

        return {
          nickname: p.nickname,
          baseScore: p.baseScore,
          timeSpent: p.timeSpent,
          bonus,
          finalScore
        };
      });

      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aSec = parseInt(a.time) || 180;
        const bSec = parseInt(b.time) || 180;
        return aSec - bSec;
      });
      if (leaderboard.length > 10) leaderboard.splice(10);

      try {
        fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2), 'utf8');
      } catch (e) {
        console.error('Lỗi ghi file leaderboard:', e);
      }

      io.emit('leaderboard-updated', leaderboard);
      io.to('museum-unified').emit('room1:session-ended', { results });

      // Cửa Phòng 02 (Bến Nhà Rồng) luôn mở sẵn để người chơi đi tiếp ngay.
      doorStates['door-room2'] = { isOpen: true, targetRoom: 'gallery-three' };
      io.emit('door-opened', { doorId: 'door-room2', targetRoom: 'gallery-three' });
      io.emit('door-states', doorStates);

      roomStates['gallery-three'] = { isOpen: true };
      io.emit('room-states', roomStates);

      // Reset Trạng thái phòng 1
      usersInRoomOne.forEach(u => {
        u.room1Ready = false;
        u.room1Completed = false;
        u.room1BaseScore = 0;
        u.room1TimeSpent = 0;
      });
      roomOneState = 'waiting';
      io.to('museum-unified').emit('room1:state-sync', { roomOneState, roomOneStartTimestamp: null });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROOM 5: CONFERENCE SESSION SYNC EVENTS
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:start-room2-session1', () => {
    console.log('[ADMIN] Yêu cầu bắt đầu Phiên thứ nhất ở Phòng 5 từ admin.');
    roomTwoSessionState = 'session1';
    io.emit('room2:session1-start');
    broadcastRoomTwoPlayers();
  });

  socket.on('admin:start-room2-session2', () => {
    console.log('[ADMIN] Yêu cầu bắt đầu Phiên thứ hai ở Phòng 5 từ admin.');
    roomTwoSessionState = 'session2';
    io.emit('room2:session2-start');
    broadcastRoomTwoPlayers();
  });

  socket.on('admin:start-room2-session3', () => {
    console.log('[ADMIN] Yêu cầu bắt đầu Phiên thứ ba ở Phòng 5 từ admin.');
    roomTwoSessionState = 'session3';
    io.emit('room2:session3-start');
    broadcastRoomTwoPlayers();
  });

  socket.on('admin:start-room2-session4', () => {
    console.log('[ADMIN] Yêu cầu bắt đầu Phiên thứ tư ở Phòng 5 từ admin.');
    roomTwoSessionState = 'session4';
    io.emit('room2:session4-start');
    broadcastRoomTwoPlayers();
  });

  socket.on('admin:start-room2-completed', () => {
    console.log('[ADMIN] Yêu cầu HOÀN THÀNH họp Phòng 5 từ admin.');
    roomTwoSessionState = 'completed';
    io.emit('room2:completed-start');

    // Tự động mở cửa Phòng 3 để cho phép đi tiếp
    doorStates['door-room3'] = { isOpen: true, targetRoom: 'gallery-ceramics' };
    io.emit('door-opened', { doorId: 'door-room3', targetRoom: 'gallery-ceramics' });
    io.emit('door-states', doorStates);

    // Tự động bật phòng 3 (gallery-ceramics) hoạt động
    roomStates['gallery-ceramics'] = { isOpen: true };
    io.emit('room-states', roomStates);

    broadcastRoomTwoPlayers();
  });

  socket.on('admin:get-room2-players', () => {
    broadcastRoomTwoPlayers();
  });

  socket.on('room2:submit-score', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const { session, value, selectedPolicies } = data;
    let calculatedScore = 0;

    if (session === 1) {
      const val = value || 0;
      if (val >= 0 && val <= 30) calculatedScore = 2;
      else if (val >= 31 && val <= 50) calculatedScore = 5;
      else if (val >= 51 && val <= 70) calculatedScore = 8;
      else if (val >= 71 && val <= 80) calculatedScore = 12;
      else if (val >= 81 && val <= 90) calculatedScore = 15;
      else if (val >= 91 && val <= 100) calculatedScore = 10;

      user.room2Score1 = calculatedScore;
      user.score = (user.score || 0) + calculatedScore;
      console.log(`[ROOM-2-SUBMIT] Session 1: ${user.nickname} nộp đánh giá: ${val}. Điểm đạt: ${calculatedScore}`);
    } 
    else if (session === 2) {
      // Session 2: Báo cáo sản xuất - kéo nguyên nhân chính
      const selectedCauses = Array.isArray(value) ? value : [];
      const correctCauses = ['machinery', 'materials', 'incentives', 'market_demand'];
      let matchCount = 0;
      correctCauses.forEach(c => {
        if (selectedCauses.includes(c)) matchCount++;
      });
      calculatedScore = matchCount * 2.5;

      user.room2Score2 = calculatedScore;
      user.score = (user.score || 0) + calculatedScore;
      console.log(`[ROOM-2-SUBMIT] Session 2: ${user.nickname} chọn đúng ${matchCount}/4 nguyên nhân. Điểm đạt: ${calculatedScore}`);
    } 
    else if (session === 3) {
      // Session 3: Báo cáo nông nghiệp - Cải tổ mô hình
      const model = value || '';
      const policies = Array.isArray(selectedPolicies) ? selectedPolicies : [];

      if (model === 'C') calculatedScore += 4;

      const correctPolicies = ['policy1', 'policy2', 'policy3'];
      let policyMatchCount = 0;
      correctPolicies.forEach(p => {
        if (policies.includes(p)) policyMatchCount++;
      });
      calculatedScore += policyMatchCount * 1;

      // Giải thích tác động (tất cả 3 chính sách hỗ trợ đúng được chọn)
      if (policyMatchCount === 3 && model === 'C') {
        calculatedScore += 3;
      }

      user.room2Score3 = calculatedScore;
      user.score = (user.score || 0) + calculatedScore;
      console.log(`[ROOM-2-SUBMIT] Session 3: ${user.nickname} chọn mô hình: ${model}, đúng ${policyMatchCount}/3 chính sách. Điểm đạt: ${calculatedScore}`);
    } 
    else if (session === 4) {
      // Session 4: Bỏ phiếu đường lối phát triển
      const path = value || '';
      const policies = Array.isArray(selectedPolicies) ? selectedPolicies : [];

      if (path === '3') calculatedScore += 8;

      const correctPolicies = ['A', 'B', 'C'];
      let policyMatchCount = 0;
      correctPolicies.forEach(p => {
        if (policies.includes(p)) policyMatchCount++;
      });
      calculatedScore += policyMatchCount * 4; // 2đ cho chính sách + 2đ cho đổi mới cơ chế

      user.room2Score4 = calculatedScore;
      user.score = (user.score || 0) + calculatedScore;
      console.log(`[ROOM-2-SUBMIT] Session 4: ${user.nickname} chọn đường lối: ${path}, đúng ${policyMatchCount}/3 chính sách. Điểm đạt: ${calculatedScore}`);
    }

    socket.emit('room2:submit-success', { session, score: calculatedScore });
    broadcastRoomTwoPlayers();
  });

  const roomClosingTimers = {};

  socket.on('admin:toggle-room', (data) => {
    const { roomId } = data;
    console.log(`[ADMIN] Yêu cầu toggle room "${roomId}" bị bỏ qua vì toàn bộ phòng được kích hoạt mặc định.`);
    socket.emit('room-states', roomStates);
  });

  socket.on('admin:get-room1-players', () => {
    broadcastRoomOnePlayers();
  });

  // 6.5. ADMIN: TELEPORT TOÀN BỘ NGƯỜI CHƠI SANG PHÒNG ĐÍCH
  socket.on('admin:teleport-all', (data) => {
    const { targetRoom } = data;
    console.log(`[ADMIN] Yêu cầu teleport toàn bộ người chơi sang phòng: "${targetRoom}"`);

    // Kiểm tra xem phòng đích có đang bật không
    if (targetRoom !== 'lobby' && (!roomStates[targetRoom] || !roomStates[targetRoom].isOpen)) {
      socket.emit('admin:error', { message: 'Không thể dịch chuyển mọi người tới phòng đang tắt!' });
      return;
    }

    let spawnPos = { x: 0, y: 0, z: -5.0 }; // lobby mặc định
    if (targetRoom === 'gallery-subsidy') spawnPos = { x: 0, y: 3.0, z: 10.0 };
    else if (targetRoom === 'gallery-paintings') spawnPos = { x: 0, y: 3.0, z: 56.0 };
    else if (targetRoom === 'gallery-ceramics') spawnPos = { x: 0, y: 3.0, z: 102.0 };
    else if (targetRoom === 'gallery-market-economy') spawnPos = { x: 0, y: 3.0, z: roomFourSpatial.spawnWorldZ };
    else if (targetRoom === 'gallery-three') spawnPos = { x: 0, y: 3.0, z: roomFourSpatial.roomFiveSpawnZ };

    let count = 0;
    Object.keys(activeUsers).forEach(sid => {
      const u = activeUsers[sid];
      if (u.galleryId !== targetRoom) {
        u.galleryId = targetRoom;
        u.x = spawnPos.x;
        u.y = spawnPos.y;
        u.z = spawnPos.z;
        
        io.to(sid).emit('admin:teleported-by-force', { targetRoom, spawnPos });
        count++;
      }
    });

    // Cập nhật lại danh sách toàn bộ người chơi cho phòng để đồng bộ client
    io.emit('users-list', Object.values(activeUsers));
    console.log(`[ADMIN] Đã ép buộc dịch chuyển ${count} người chơi sang "${targetRoom}"`);
  });

  // 7. Khi người chơi ngắt kết nối
  socket.on('disconnect', () => {
    // A. Nếu người dùng ngắt kết nối khi đang xếp hàng chờ
    for (const socketRoom in waitingQueues) {
      const idx = waitingQueues[socketRoom].indexOf(socket.id);
      if (idx !== -1) {
        waitingQueues[socketRoom].splice(idx, 1);
        console.log(`[QUEUE-LEFT] ${socket.id} đã thoát khỏi hàng chờ phòng (socket: ${socketRoom})`);

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[socketRoom].forEach((sid, index) => {
          io.to(sid).emit('queue-status', { inQueue: true, position: index + 1, limit: MAX_USERS_PER_ROOM });
        });
      }
    }

    // B. Nếu người dùng ngắt kết nối khi đang ở trong phòng
    const user = activeUsers[socket.id];
    if (user) {
      const galleryId = user.galleryId;
      const socketRoom = getSocketRoom(galleryId);
      console.log(`[LEFT] ${user.nickname} (${socket.id}) đã thoát khỏi phòng ${galleryId} (socket: ${socketRoom})`);
      
      // Phát thông báo cho những người còn lại trong phòng
      socket.to(socketRoom).emit('user-left', socket.id);
      
      // Xóa khỏi danh sách active
      delete activeUsers[socket.id];

      if (galleryId === 'gallery-subsidy') {
        updateRoomOneReadyStatus();
        broadcastRoomOnePlayers();
      }

      if (galleryId === 'gallery-paintings') {
        broadcastRoomTwoPlayers();
      }

      // C. Tự động duyệt người đầu tiên trong hàng chờ (nếu có)
      if (waitingQueues[socketRoom] && waitingQueues[socketRoom].length > 0) {
        const nextSocketId = waitingQueues[socketRoom].shift();
        const nextSocket = io.sockets.sockets.get(nextSocketId);

        if (nextSocket && nextSocket.tempUserData) {
          const nextUser = nextSocket.tempUserData;

          // Thêm người chơi mới vào phòng hoạt động
          activeUsers[nextSocketId] = nextUser;
          nextSocket.join(socketRoom);
          console.log(`[QUEUE-ADMIT] ${nextUser.nickname} (${nextSocketId}) được duyệt vào phòng ${nextUser.galleryId} (socket: ${socketRoom}) từ hàng chờ.`);

          // Gửi thông báo phê duyệt
          nextSocket.emit('admitted');

          // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
          const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
          nextSocket.emit('users-list', usersInRoom);

          // Phát thông báo cho những người khác trong phòng
          nextSocket.to(socketRoom).emit('user-joined', nextUser);
        }

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[socketRoom].forEach((sid, index) => {
          io.to(sid).emit('queue-status', { inQueue: true, position: index + 1, limit: MAX_USERS_PER_ROOM });
        });
      }
    }
  });
});

const PORT = process.env.PORT || process.env.WS_PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`WebSocket server đang chạy trên cổng http://0.0.0.0:${PORT}`);
  console.log(`===================================================`);
});
