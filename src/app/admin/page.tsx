'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Exhibit, Gallery } from '@/lib/db';
import { Shield, Lock, Plus, Trash2, Sliders, ArrowLeft, Save, Edit3, Compass, Sparkles, DoorOpen, DoorClosed, Loader2, Zap, Power, Clock, Users, Award, X } from 'lucide-react';
import { ROOM_THREE_DISPLAY_NAME } from '@/lib/roomThreeNarrative';
import { fetchAdminData } from '@/lib/adminData';

// Cấu hình cửa phòng
const DOOR_CONFIGS = [
  { doorId: 'door-room1', targetRoom: 'gallery-subsidy', label: 'Cửa 1: Sảnh ↔ Phòng 01', color: 'amber' },
  { doorId: 'door-room2', targetRoom: 'gallery-three', label: 'Cửa 2: Phòng 01 ↔ Phòng 02', color: 'cyan' },
  { doorId: 'door-room3', targetRoom: 'gallery-ceramics', label: `Cửa 3: Phòng 02 ↔ ${ROOM_THREE_DISPLAY_NAME}`, color: 'emerald' },
  { doorId: 'door-room4', targetRoom: 'gallery-market-economy', label: `Cửa 4: ${ROOM_THREE_DISPLAY_NAME} ↔ Phòng 04`, color: 'rose' },
  { doorId: 'door-room5', targetRoom: 'gallery-paintings', label: 'Cửa 5: Phòng 04 ↔ Phòng 05', color: 'amber' },
];

interface DoorState {
  isOpen: boolean;
  targetRoom: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExhibit, setEditingExhibit] = useState<Partial<Exhibit> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Kiểm tra trạng thái xác thực đã lưu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('admin_authorized');
      if (auth === 'true') {
        setIsAuthorized(true);
      }
    }
  }, []);

  // ═══ Door Control State ═══
  const [adminSocket, setAdminSocket] = useState<Socket | null>(null);
  const [doorStates, setDoorStates] = useState<Record<string, DoorState>>({});
  const [doorLoading, setDoorLoading] = useState<string | null>(null);

  // ═══ Room Control State ═══
  const [roomStates, setRoomStates] = useState<Record<string, { isOpen: boolean }>>({
    'gallery-subsidy': { isOpen: true },
    'gallery-paintings': { isOpen: true },
    'gallery-ceramics': { isOpen: true },
    'gallery-market-economy': { isOpen: true },
    'gallery-three': { isOpen: true }
  });
  const [roomLoading, setRoomLoading] = useState<string | null>(null);
  const [roomOnePlayers, setRoomOnePlayers] = useState<any[]>([]);
  const [roomTwoPlayers, setRoomTwoPlayers] = useState<any[]>([]);
  const [roomTwoSessionState, setRoomTwoSessionState] = useState<'waiting' | 'session1' | 'session2' | 'session3' | 'session4' | 'completed'>('waiting');
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isRoomTwoResultsModalOpen, setIsRoomTwoResultsModalOpen] = useState(false);

  // Kết nối Socket.io cho admin
  useEffect(() => {
    if (!isAuthorized) return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const sock = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    sock.on('connect', () => {
      console.log('[ADMIN] Connected to WS:', sock.id);
      sock.emit('admin:get-door-status');
      sock.emit('admin:get-room1-players');
      sock.emit('admin:get-room2-players');
    });

    sock.on('admin:room1-players-update', (players: any[]) => {
      setRoomOnePlayers(players);
    });

    sock.on('admin:room2-players-update', (players: any[]) => {
      setRoomTwoPlayers(players);
    });

    sock.on('room2:session1-start', () => {
      setRoomTwoSessionState('session1');
    });

    sock.on('room2:state-sync', (data: { roomTwoSessionState: 'waiting' | 'session1' }) => {
      setRoomTwoSessionState(data.roomTwoSessionState);
    });

    sock.on('door-states', (states: Record<string, DoorState>) => {
      const clean: Record<string, DoorState> = {};
      for (const [key, val] of Object.entries(states)) {
        clean[key] = { isOpen: (val as any).isOpen, targetRoom: (val as any).targetRoom };
      }
      setDoorStates(clean);
      setDoorLoading(null);
    });

    sock.on('room-states', (states: Record<string, { isOpen: boolean }>) => {
      setRoomStates(states);
      setRoomLoading(null);
    });

    sock.on('admin:error', (data: { message: string }) => {
      alert(data.message);
      setDoorLoading(null);
      setRoomLoading(null);
    });

    sock.on('door-opened', (data: { doorId: string; targetRoom: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: true, targetRoom: data.targetRoom },
      }));
      setDoorLoading(null);
    });

    sock.on('door-closed', (data: { doorId: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: false, targetRoom: '' },
      }));
      setDoorLoading(null);
    });

    setAdminSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, [isAuthorized]);

  const handleOpenDoor = (doorId: string, targetRoom: string) => {
    if (!adminSocket) return;
    setDoorLoading(doorId);
    adminSocket.emit('admin:open-door', { doorId, targetRoom });
  };

  const handleCloseDoor = (doorId: string) => {
    if (!adminSocket) return;
    setDoorLoading(doorId);

    // Xác định phòng giữ lại để teleport người chơi khi đóng cửa phòng cũ
    let teleportTo = 'lobby';
    if (doorId === 'door-room2') {
      teleportTo = 'gallery-subsidy';
    } else if (doorId === 'door-room3') {
      teleportTo = 'gallery-three';
    } else if (doorId === 'door-room4') {
      teleportTo = 'gallery-ceramics';
    } else if (doorId === 'door-room5') {
      teleportTo = 'gallery-market-economy';
    }

    adminSocket.emit('admin:close-door', { doorId, teleportTo });
  };


  const handleTeleportAll = (targetRoom: string) => {
    if (!adminSocket) return;
    const roomName = targetRoom === 'lobby' 
      ? 'Sảnh chờ' 
      : targetRoom === 'gallery-subsidy' ? 'Phòng 01 (Dấu chân tìm đường)'
      : targetRoom === 'gallery-three' ? 'Phòng 02 (Bến Nhà Rồng 1911)'
      : targetRoom === 'gallery-ceramics' ? ROOM_THREE_DISPLAY_NAME
      : targetRoom === 'gallery-market-economy' ? 'Phòng 04 (Kinh tế thị trường)'
      : 'Phòng 05 (Phòng Hội nghị)';

    const confirmMsg = `Bạn có chắc chắn muốn DỊCH CHUYỂN TOÀN BỘ người chơi đang ở ngoài phòng này lập tức vào: ${roomName}?`;
    if (window.confirm(confirmMsg)) {
      adminSocket.emit('admin:teleport-all', { targetRoom });
    }
  };

  const handleStartRoomOne = () => {
    if (!adminSocket) return;
    if (window.confirm('Bắt đầu Phòng 1? Trò chơi sẽ bắt đầu sau 5 giây đếm ngược.')) {
      adminSocket.emit('admin:start-room1-countdown');
    }
  };

  const roomOnePlayersInRoom = roomOnePlayers.filter(
    (player) => player.galleryId === 'gallery-subsidy'
  );
  const canStartRoomOne =
    roomOnePlayersInRoom.length > 0 &&
    roomOnePlayersInRoom.every((player) => player.ready);

  const handleForceEndRoomOne = () => {
    if (!adminSocket) return;
    if (window.confirm('Bạn có chắc chắn muốn KẾT THÚC trò chơi Phòng 1 và TÍNH ĐIỂM lập tức cho mọi người?')) {
      adminSocket.emit('admin:force-end-room1');
    }
  };

  const handleStartRoomTwoSessionOne = () => {
    if (!adminSocket) return;
    if (window.confirm('Khai mạc Đại hội VI và bắt đầu Phiên họp thứ nhất ở Phòng 5?')) {
      adminSocket.emit('admin:start-room2-session1');
    }
  };

  const handleStartRoomTwoSessionTwo = () => {
    if (!adminSocket) return;
    if (window.confirm('Bắt đầu Phiên họp thứ hai (Báo cáo sản xuất) ở Phòng 5?')) {
      adminSocket.emit('admin:start-room2-session2');
    }
  };

  const handleStartRoomTwoSessionThree = () => {
    if (!adminSocket) return;
    if (window.confirm('Bắt đầu Phiên họp thứ ba (Báo cáo nông nghiệp) ở Phòng 5?')) {
      adminSocket.emit('admin:start-room2-session3');
    }
  };

  const handleStartRoomTwoSessionFour = () => {
    if (!adminSocket) return;
    if (window.confirm('Bắt đầu Phiên họp thứ tư (Đường lối phát triển) ở Phòng 5?')) {
      adminSocket.emit('admin:start-room2-session4');
    }
  };

  const handleStartRoomTwoCompleted = () => {
    if (!adminSocket) return;
    if (window.confirm(`Chốt nội dung Đại hội VI và mở cửa ${ROOM_THREE_DISPLAY_NAME}?`)) {
      adminSocket.emit('admin:start-room2-completed');
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    // Tải toàn bộ galleries và exhibits, có giới hạn thời gian để không kẹt spinner.
    fetchAdminData()
      .then(({ galleries: galleriesData, exhibits: exhibitsData }) => {
        setGalleries(galleriesData as Gallery[]);
        setExhibits(exhibitsData as Exhibit[]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải dữ liệu admin:', err);
        setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
        setLoading(false);
      });
  }, [isAuthorized]);

  const handleEdit = (exhibit: Exhibit) => {
    setEditingExhibit({ ...exhibit });
    setIsNew(false);
    setMessage('');
    setError('');
  };

  const handleAddNew = () => {
    setEditingExhibit({
      id: `exhibit-${Date.now()}`,
      gallery_id: galleries[0]?.id || '',
      title: { vi: '', en: '' },
      author: { vi: '', en: '' },
      description: { vi: '', en: '' },
      model_3d_url: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      coordinate_x: 0,
      coordinate_y: 2,
      coordinate_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
    setIsNew(true);
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hiện vật này không?')) return;
    
    try {
      const res = await fetch(`/api/exhibits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExhibits(prev => prev.filter(e => e.id !== id));
        setMessage('Xóa hiện vật thành công!');
        if (editingExhibit?.id === id) setEditingExhibit(null);
      } else {
        setError('Xóa thất bại.');
      }
    } catch (err) {
      setError('Lỗi khi xóa hiện vật.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExhibit) return;

    // Validate dữ liệu
    if (
      !editingExhibit.id || 
      !editingExhibit.gallery_id || 
      !editingExhibit.title?.vi || 
      !editingExhibit.title?.en ||
      !editingExhibit.author?.vi ||
      !editingExhibit.author?.en
    ) {
      setError('Vui lòng nhập đầy đủ thông tin tiêu đề, tác giả bằng 2 ngôn ngữ.');
      return;
    }

    try {
      const res = await fetch('/api/exhibits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExhibit)
      });

      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          setExhibits(prev => [...prev, data.exhibit]);
          setMessage('Tạo hiện vật mới thành công!');
        } else {
          setExhibits(prev => prev.map(e => e.id === editingExhibit.id ? data.exhibit : e));
          setMessage('Cập nhật hiện vật thành công!');
        }
        setEditingExhibit(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Lỗi khi lưu hiện vật.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    }
  };

  const renderAdminDoor = (doorId: string, targetRoom: string, label: string) => {
    const state = doorStates[doorId];
    const isOpen = state?.isOpen || false;
    const isLoading = doorLoading === doorId;

    let isPrereqMet = true;
    if (doorId === 'door-room1') {
      isPrereqMet = roomStates['gallery-subsidy']?.isOpen || false;
    } else if (doorId === 'door-room2') {
      isPrereqMet = (roomStates['gallery-subsidy']?.isOpen && roomStates['gallery-three']?.isOpen) || false;
    } else if (doorId === 'door-room3') {
      isPrereqMet = (roomStates['gallery-three']?.isOpen && roomStates['gallery-ceramics']?.isOpen) || false;
    } else if (doorId === 'door-room4') {
      isPrereqMet = (roomStates['gallery-ceramics']?.isOpen && roomStates['gallery-market-economy']?.isOpen) || false;
    } else if (doorId === 'door-room5') {
      isPrereqMet = (roomStates['gallery-market-economy']?.isOpen && roomStates['gallery-paintings']?.isOpen) || false;
    }

    return (
      <div
        key={doorId}
        className={`p-3 rounded-xl border border-dashed transition-all w-full max-w-2xl mx-auto relative ${
          isOpen
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-slate-900/20 border-slate-800'
        }`}
      >
        <div className="absolute top-[-16px] left-[50%] translate-x-[-50%] w-0.5 h-4 bg-slate-800 pointer-events-none" />
        <div className="absolute bottom-[-16px] left-[50%] translate-x-[-50%] w-0.5 h-4 bg-slate-800 pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <DoorOpen size={16} className="text-emerald-400" />
            ) : (
              <DoorClosed size={16} className="text-slate-500" />
            )}
            <div>
              <h4 className="text-xs font-bold text-slate-300">{label}</h4>
              {!isPrereqMet && !isOpen && (
                <p className="text-[9px] text-amber-500 font-semibold mt-0.5">
                  ⚠️ Yêu cầu các phòng liên quan phải bật
                </p>
              )}
            </div>
          </div>

          {isOpen ? (
            <button
              type="button"
              onClick={() => handleCloseDoor(doorId)}
              disabled={isLoading}
              className="py-1 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <DoorClosed size={10} />
              )}
              Đóng cửa
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenDoor(doorId, targetRoom)}
              disabled={isLoading || !isPrereqMet}
              className={`py-1 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                isPrereqMet
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
                  : 'bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <DoorOpen size={10} />
              )}
              Mở cửa
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAdminRoom = (roomId: string, name: string, desc: string, relatedDoors: string[]) => {
    const isRoomOpen = roomStates[roomId]?.isOpen ?? true;
    const isLoading = roomLoading === roomId;
    const hasOpenDoor = relatedDoors.some(doorId => doorStates[doorId]?.isOpen);

    return (
      <div
        key={roomId}
        className={`p-4 rounded-xl border transition-all w-full max-w-2xl mx-auto ${
          isRoomOpen
            ? 'bg-cyan-500/5 border-cyan-500/20'
            : 'bg-slate-900/10 border-slate-850 opacity-60'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🏛️</span>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRoomOpen ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50' : 'bg-slate-600'}`} />
                {name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRoomOpen && (
              <>
                {roomId === 'gallery-subsidy' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (adminSocket) {
                          adminSocket.emit('admin:get-room1-players');
                        }
                        setIsResultsModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/25 text-cyan-400"
                    >
                      <Users size={12} />
                      Danh sách kết quả
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomOne}
                      disabled={!canStartRoomOne}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                        canStartRoomOne
                          ? 'cursor-pointer bg-violet-500/10 hover:bg-violet-500/25 border-violet-500/25 text-violet-400'
                          : 'cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Clock size={12} />
                      Bắt đầu đếm ngược (7s)
                    </button>
                    <button
                      type="button"
                      onClick={handleForceEndRoomOne}
                      className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400"
                    >
                      <Power size={12} />
                      Kết thúc & Tính điểm
                    </button>
                  </>
                )}
                {roomId === 'gallery-paintings' && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (adminSocket) {
                          adminSocket.emit('admin:get-room2-players');
                        }
                        setIsRoomTwoResultsModalOpen(true);
                      }}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/25 text-cyan-400"
                    >
                      <Users size={10} />
                      Đại biểu
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomTwoSessionOne}
                      disabled={roomTwoSessionState === 'session1'}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                        roomTwoSessionState === 'session1'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750 cursor-pointer'
                      }`}
                    >
                      Phiên 1
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomTwoSessionTwo}
                      disabled={roomTwoSessionState === 'session2'}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                        roomTwoSessionState === 'session2'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750 cursor-pointer'
                      }`}
                    >
                      Phiên 2
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomTwoSessionThree}
                      disabled={roomTwoSessionState === 'session3'}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                        roomTwoSessionState === 'session3'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750 cursor-pointer'
                      }`}
                    >
                      Phiên 3
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomTwoSessionFour}
                      disabled={roomTwoSessionState === 'session4'}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                        roomTwoSessionState === 'session4'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750 cursor-pointer'
                      }`}
                    >
                      Phiên 4
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRoomTwoCompleted}
                      disabled={roomTwoSessionState === 'completed'}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                        roomTwoSessionState === 'completed'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350 cursor-not-allowed'
                          : 'bg-amber-500/10 hover:bg-amber-500/25 border-amber-500/25 text-amber-400 cursor-pointer'
                      }`}
                    >
                      Chốt Đổi Mới
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleTeleportAll(roomId)}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/25 text-amber-400"
                >
                  <Compass size={12} />
                  Dịch chuyển mọi người
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'sjkc21jdx2k23') {
      sessionStorage.setItem('admin_authorized', 'true');
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-md bg-slate-950/60 border border-slate-900 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg tracking-wider text-white uppercase">XÁC THỰC QUẢN TRỊ VIÊN</h2>
              <p className="text-xs text-slate-500 mt-1">Hệ thống yêu cầu mật khẩu để truy cập CMS Quản trị</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Nhập mật khẩu truy cập..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600"
              />
            </div>

            {authError && (
              <p className="text-[11px] text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/15 p-2.5 rounded-lg text-center">
                ⚠️ {authError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-1.5"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang tải CMS Quản trị...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Lobby
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-500" />
            <h1 className="font-sans font-bold tracking-wider text-base uppercase">CMS QUẢN TRỊ BẢO TÀNG</h1>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Thêm Hiện Vật Mới
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ═══ PANEL ĐIỀU KHIỂN PHÒNG & CỬA (Real-time Timeline Flow) ═══ */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                Bố Cục Sơ Đồ & Điều Khiển Không Gian Bảo Tàng (Lobby ➡️ Cửa ➡️ Phòng)
              </h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${adminSocket?.connected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
              {adminSocket?.connected ? '🟢 Trực tuyến' : '🔴 Ngoại tuyến'}
            </span>
          </div>

          <div className="flex flex-col gap-6 py-2 relative">
            {/* 1. SẢNH CHÍNH (LOBBY) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 w-full max-w-2xl mx-auto flex items-center justify-between relative">
              <div className="absolute bottom-[-16px] left-[50%] translate-x-[-50%] w-0.5 h-4 bg-slate-800 pointer-events-none" />
              <div className="flex items-center gap-3">
                <span className="text-lg">🏛️</span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                    Sảnh Bảo Tàng (Museum Lobby)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Khu vực trung tâm đón tiếp khách tham quan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTeleportAll('lobby')}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/25 text-amber-400"
                >
                  <Compass size={12} />
                  Dịch chuyển mọi người
                </button>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                  Mặc định bật
                </span>
              </div>
            </div>

            {/* 2. CỬA 1 */}
            {renderAdminDoor('door-room1', 'gallery-subsidy', 'Cửa số 01: Sảnh ↔ Phòng 01')}

            {/* 3. PHÒNG 1 */}
            {renderAdminRoom('gallery-subsidy', 'Phòng 01: Dấu chân tìm đường', 'Hành trình tìm đường cứu nước của Nguyễn Ái Quốc, 1911–1930', ['door-room1', 'door-room2'])}

            {/* 4. CỬA 2 */}
            {renderAdminDoor('door-room2', 'gallery-three', 'Cửa số 02: Phòng 01 ↔ Phòng 02')}

            {/* 5. PHÒNG 2 */}
            {renderAdminRoom('gallery-three', 'Phòng 02: Bến Nhà Rồng 1911', 'Bến Nhà Rồng, tàu Amiral Latouche-Tréville và công việc phụ bếp của Văn Ba', ['door-room2', 'door-room3'])}

            {/* 6. CỬA 3 */}
            {renderAdminDoor('door-room3', 'gallery-ceramics', `Cửa số 03: Phòng 02 ↔ ${ROOM_THREE_DISPLAY_NAME}`)}

            {/* 7. PHÒNG 3 */}
            {renderAdminRoom('gallery-ceramics', ROOM_THREE_DISPLAY_NAME, 'PARIS · 1919 — Tiếng nói từ An Nam', ['door-room3', 'door-room4'])}

            {/* 8. CỬA 4 */}
            {renderAdminDoor('door-room4', 'gallery-market-economy', `Cửa số 04: ${ROOM_THREE_DISPLAY_NAME} ↔ Phòng 04`)}

            {/* 9. PHÒNG 4 */}
            {renderAdminRoom('gallery-market-economy', 'Phòng 04: Liên Xô — Quảng Châu', 'Hành trình Nguyễn Ái Quốc từ Liên Xô đến Quảng Châu (1923-1927)', ['door-room4', 'door-room5'])}

            {/* 10. CỬA 5 */}
            {renderAdminDoor('door-room5', 'gallery-paintings', 'Cửa số 05: Phòng 04 ↔ Phòng 05')}

            {/* 11. PHÒNG 5 */}
            {renderAdminRoom('gallery-paintings', 'Phòng 05: Phòng Hội Nghị', 'Tái hiện Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam tại Cửu Long, Hồng Kông', ['door-room5'])}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BẢNG DANH SÁCH HIỆN VẬT (2 CỘT RỘNG LÊN TOÀN MÀN HÌNH LỚN) */}
        <div className="lg:col-span-2 space-y-6">
          {message && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold animate-pulse">
              🎉 {message}
            </div>
          )}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {galleries.map((gallery) => {
            const galleryExhibits = exhibits.filter(e => e.gallery_id === gallery.id);
            return (
              <div key={gallery.id} className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                    <Compass size={14} />
                    {gallery.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/map-builder?galleryId=${gallery.id}`)}
                      className="py-1 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sliders size={10} />
                      Thiết kế Bản đồ 3D
                    </button>
                    <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold">
                      {galleryExhibits.length} hiện vật
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-900/60">
                  {galleryExhibits.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs italic">
                      Chưa có hiện vật nào trong phòng này.
                    </div>
                  ) : (
                    galleryExhibits.map((exhibit) => (
                      <div key={exhibit.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <img 
                            src={exhibit.thumbnail_url} 
                            alt={exhibit.title.vi} 
                            className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                          />
                          <div className="max-w-[200px] sm:max-w-[320px]">
                            <h4 className="text-xs font-bold text-white truncate">{exhibit.title.vi}</h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{exhibit.author.vi}</p>
                            <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 mt-1 inline-block font-mono">
                              ID: {exhibit.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/builder?exhibitId=${exhibit.id}`)}
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg border border-indigo-550/20 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                            title="Chỉnh sửa tọa độ 3D"
                          >
                            <Sliders size={12} />
                            Định vị 3D
                          </button>
                          
                          <button
                            onClick={() => handleEdit(exhibit)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
                            title="Sửa chi tiết"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => handleDelete(exhibit.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-550/20 transition-colors cursor-pointer"
                            title="Xóa hiện vật"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: FORM THÊM / CHỈNH SỬA CHI TIẾT (1 CỘT) */}
        <div className="lg:col-span-1">
          {editingExhibit ? (
            <form onSubmit={handleSave} className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4 shadow-xl sticky top-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                  <Sparkles size={14} className="text-amber-500" />
                  {isNew ? 'Thêm Hiện Vật' : 'Sửa Hiện Vật'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingExhibit(null)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                >
                  Đóng
                </button>
              </div>

              {/* ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã hiện vật (ID)</label>
                <input
                  type="text"
                  value={editingExhibit.id}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, id: e.target.value } : null)}
                  disabled={!isNew}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {/* Gallery ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn phòng trưng bày</label>
                <select
                  value={editingExhibit.gallery_id}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, gallery_id: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {galleries.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Tiêu đề VI & EN */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tác phẩm (VI)</label>
                  <input
                    type="text"
                    value={editingExhibit.title?.vi || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      title: { vi: e.target.value, en: prev.title?.en || '' }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tác phẩm (EN)</label>
                  <input
                    type="text"
                    value={editingExhibit.title?.en || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      title: { vi: prev.title?.vi || '', en: e.target.value }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Tác giả VI & EN */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tác giả (VI)</label>
                  <input
                    type="text"
                    value={editingExhibit.author?.vi || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      author: { vi: e.target.value, en: prev.author?.en || '' }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tác giả (EN)</label>
                  <input
                    type="text"
                    value={editingExhibit.author?.en || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      author: { vi: prev.author?.vi || '', en: e.target.value }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ảnh Thumbnail */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đường dẫn ảnh preview</label>
                <input
                  type="text"
                  value={editingExhibit.thumbnail_url || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, thumbnail_url: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slide ảnh (mỗi dòng một đường dẫn)</label>
                <textarea
                  value={editingExhibit.image_urls?.join('\n') || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? {
                    ...prev,
                    image_urls: e.target.value.split(/\r?\n/).map(url => url.trim()).filter(Boolean)
                  } : null)}
                  rows={3}
                  placeholder="/exhibits/anh-1.png&#10;/exhibits/anh-2.png"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>

              {/* Loại / Link 3D */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã 3D (Bỏ trống nếu là tranh 2D)</label>
                <select
                  value={editingExhibit.model_3d_url || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, model_3d_url: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Tranh vẽ 2D (Không có mô hình 3D)</option>
                  <option value="procedural-torusknot">Tượng: Vòng Xoắn Hoàng Kim</option>
                  <option value="procedural-octahedron">Tượng: Tinh Thể Đa Diện</option>
                  <option value="procedural-helix">Tượng: Mầm Sống Sinh Học</option>
                </select>
              </div>

              {/* Thuyết minh VI */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nội dung thuyết minh (VI)</label>
                <textarea
                  value={editingExhibit.description?.vi || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? {
                    ...prev,
                    description: { vi: e.target.value, en: prev.description?.en || '' }
                  } : null)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Thuyết minh EN */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nội dung thuyết minh (EN)</label>
                <textarea
                  value={editingExhibit.description?.en || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? {
                    ...prev,
                    description: { vi: prev.description?.vi || '', en: e.target.value }
                  } : null)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                Lưu Dữ Liệu
              </button>
            </form>
          ) : (
            <div className="bg-slate-950/20 border border-slate-900/50 border-dashed rounded-2xl p-8 text-center text-slate-500 text-xs italic sticky top-8">
              Chọn nút sửa [✏️] hoặc thêm mới để bắt đầu nhập dữ liệu hiện vật.
            </div>
          )}
        </div>

        </div>
      </main>

      {/* MODAL DANH SÁCH KẾT QUẢ PHÒNG 1 REALTIME */}
      {isResultsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                <Users size={16} />
                <span>Tiến độ & Kết quả Giải mật Phòng 01</span>
              </div>
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {roomOnePlayers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Không có người chơi nào đang ở trong Phòng 01 (Bao cấp).
                </div>
              ) : (
                <div className="border border-slate-800 bg-slate-950/50 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 tracking-wider">
                        <th className="py-3 px-4">Đặc vụ</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                        <th className="py-3 px-4 text-center">Manh mối</th>
                        <th className="py-3 px-4 text-center">Điểm máy</th>
                        <th className="py-3 px-4 text-center">Thời gian</th>
                        <th className="py-3 px-4 text-center font-bold text-cyan-400">Tổng điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-350">
                      {roomOnePlayers.map((p) => {
                        return (
                          <tr key={p.socketId} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-white max-w-[120px] truncate">
                              {p.nickname}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {p.completed ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                                  Đã Stamp
                                </span>
                              ) : p.ready ? (
                                <span className="bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse">
                                  Đang chơi
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                                  Đợi bắt đầu
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-300">
                              {p.cluesCollectedCount}/6 vật
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-slate-400">
                              {p.baseScore}đ
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-slate-400">
                              {p.completed ? `${p.timeSpent}s` : '-'}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-cyan-400">
                              {p.completed ? `${p.baseScore}đ` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                Số người trong Phòng 01: {roomOnePlayers.length}
              </span>
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] py-2 px-4 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
      {/* MODAL DANH SÁCH KẾT QUẢ PHÒNG 2 REALTIME */}
      {isRoomTwoResultsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <Users size={16} />
                <span>Đại biểu & Biểu quyết Phòng 05 (Đại hội VI)</span>
              </div>
              <button
                onClick={() => setIsRoomTwoResultsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {roomTwoPlayers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Không có đại biểu nào đang ở trong Phòng 05 (Đại hội VI).
                </div>
              ) : (
                <div className="border border-slate-800 bg-slate-950/50 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-mono text-[9px] uppercase border-b border-slate-800 tracking-wider">
                        <th className="py-3 px-4">Đại biểu</th>
                        <th className="py-3 px-3 text-center">Phiên 1 (Giá)</th>
                        <th className="py-3 px-3 text-center">Phiên 2 (Sản xuất)</th>
                        <th className="py-3 px-3 text-center">Phiên 3 (Nông nghiệp)</th>
                        <th className="py-3 px-3 text-center">Phiên 4 (Đường lối)</th>
                        <th className="py-3 px-4 text-center font-bold text-amber-400">Tổng điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-350">
                      {roomTwoPlayers.map((p) => {
                        return (
                          <tr key={p.socketId} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-white max-w-[120px] truncate">
                              {p.nickname}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {p.submitted1 ? (
                                <span className="text-emerald-400 font-bold">+{p.score1}đ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Chờ</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {p.submitted2 ? (
                                <span className="text-emerald-400 font-bold">+{p.score2}đ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Chờ</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {p.submitted3 ? (
                                <span className="text-emerald-400 font-bold">+{p.score3}đ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Chờ</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {p.submitted4 ? (
                                <span className="text-emerald-400 font-bold">+{p.score4}đ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Chờ</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                              {p.totalScore || 0}đ
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                Số đại biểu trong Phòng 05: {roomTwoPlayers.length}
              </span>
              <button
                onClick={() => setIsRoomTwoResultsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] py-2 px-4 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
