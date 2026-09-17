'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAvatarOutfit } from '@/lib/avatarCatalog';
import { io, Socket } from 'socket.io-client';
import { Gallery, Exhibit } from '@/lib/db';
import { getRealtimeEndpoint } from '@/lib/realtimeEndpoint';
import roomFourSpatial from '@/lib/roomFourSpatial.json';
import roomFiveSpatial from '@/lib/roomFiveSpatial.json';

export interface GraphicsSettings {
  preset: 'ultra-low' | 'low' | 'medium';
  shadows: boolean;
  animations: boolean;
  maxAvatars: number;
  reducedLights: boolean;
}

export interface MultiplayerUser {
  outfitId?: string;
  id: string;
  nickname: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  galleryId: string;
  status?: string;
  score?: number;
  timeSpent?: number;
  isSitting?: boolean;
  headYaw?: number;
}

// Vị trí spawn của các phòng trưng bày
const SPAWN_POINTS: Record<string, { x: number; y: number; z: number }> = {
  'lobby': { x: 0, y: 0, z: -5.0 },
  'gallery-subsidy': { x: 0, y: 3.0, z: 10.0 },
  'gallery-paintings': { x: 0, y: 3.0, z: 106.0 },
  'gallery-ceramics': { x: 0, y: 3.0, z: 152.0 },
  'gallery-market-economy': { x: 0, y: 3.0, z: roomFourSpatial.spawnWorldZ },
  'gallery-three': { x: 0, y: 3.0, z: roomFiveSpatial.spawnWorldZ },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI CỬA (Door State)
// ═══════════════════════════════════════════════════════════════════════════
export interface DoorState {
  isOpen: boolean;
  targetRoom: string;
}

export interface RoomState {
  isOpen: boolean;
}

export interface RoomClosingAlert {
  roomId: string;
  teleportTo: string;
  countdownMs: number;
}

// Thông tin phòng đang được tải động
export interface LoadedRoom {
  galleryId: string;
  exhibits: Exhibit[];
  gallery: Gallery | null;
}

export type RoomFiveFragmentId = 'departure' | 'identity' | 'vessel' | 'labour' | 'voyage';
export type RoomFiveShipHotspotId = 'hull' | 'funnel' | 'galley' | 'deck';

export interface RoomFiveMissionProgress {
  fragments: RoomFiveFragmentId[];
  shipHotspots: RoomFiveShipHotspotId[];
  completed: boolean;
}

const ROOM_FIVE_FRAGMENT_IDS: RoomFiveFragmentId[] = ['departure', 'identity', 'vessel', 'labour', 'voyage'];
const ROOM_FIVE_SHIP_HOTSPOT_IDS: RoomFiveShipHotspotId[] = ['hull', 'funnel', 'galley', 'deck'];
const EMPTY_ROOM_FIVE_PROGRESS: RoomFiveMissionProgress = {
  fragments: [],
  shipHotspots: [],
  completed: false,
};

interface MuseumContextType {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  nickname: string;
  setNickname: (name: string) => void;
  outfitId: string;
  setOutfitId: (id: string) => void;
  competitionMode: boolean;
  setCompetitionMode: (enabled: boolean) => void;
  selectedExhibit: Exhibit | null;
  setSelectedExhibit: (exhibit: Exhibit | null) => void;
  exhibitModalMode: 'game' | 'info';
  setExhibitModalMode: (mode: 'game' | 'info') => void;
  activeGallery: Gallery | null;
  setActiveGallery: (gallery: Gallery | null) => void;
  audioPlaying: boolean;
  setAudioPlaying: (playing: boolean) => void;
  otherUsers: MultiplayerUser[];
  otherUsersPositions: React.MutableRefObject<Record<string, MultiplayerUser>>;
  socket: Socket | null;
  localUserPos: [number, number, number];
  playerPositionRef: React.MutableRefObject<[number, number, number]>;
  setLocalUserPos: (pos: [number, number, number]) => void;
  localUserYaw: number;
  setLocalUserYaw: (yaw: number) => void;
  inQueue: boolean;
  setInQueue: (inQueue: boolean) => void;
  queuePosition: number;
  setQueuePosition: (pos: number) => void;
  isAdmitted: boolean;
  setIsAdmitted: (admitted: boolean) => void;
  settings: GraphicsSettings;
  updateSettings: (newSettings: Partial<GraphicsSettings>) => void;
  updatePreset: (preset: GraphicsSettings['preset']) => void;

  // ═══ Door & Room State ═══
  doorStates: Record<string, DoorState>;
  roomStates: Record<string, RoomState>;
  loadedRooms: LoadedRoom[];
  currentRoom: string; // 'lobby' hoặc gallery ID
  setCurrentRoom: (room: string) => void;
  doorClosingAlert: { doorId: string; teleportTo: string; countdownMs: number } | null;
  roomClosingAlert: RoomClosingAlert | null;
  teleportTarget: { x: number; y: number; z: number } | null;
  setTeleportTarget: (target: { x: number; y: number; z: number } | null) => void;
  clearTeleport: () => void;
  miniGameOpen: boolean;
  setMiniGameOpen: (open: boolean) => void;
  roomFourInteractionOpen: boolean;
  setRoomFourInteractionOpen: (open: boolean) => void;
  leaderboard: Array<{ nickname: string; score: number; time: string }>;
  hasPlayed: boolean;
  setHasPlayed: (played: boolean) => void;
  gameState: 'idle' | 'playing' | 'won' | 'lost';
  orderedEvents: GameEvent[];
  score: number;
  timeLeft: number;
  lastCheckResults: boolean[] | null;
  initializeGame: () => void;
  swapEvents: (idx1: number, idx2: number) => void;
  checkOrder: () => void;

  // --- Gameplay ---
  cluesCollected: string[];
  roomOneCompleted: boolean;
  addClue: (clueId: string) => void;
  setRoomOneCompleted: (completed: boolean) => void;
  resetRoomOne: () => void;
  sittingPosition: { x: number; y: number; z: number; rotationY?: number } | null;
  setSittingPosition: (pos: { x: number; y: number; z: number; rotationY?: number } | null) => void;
  sittingPrompt: 'sit' | 'stand' | null;
  setSittingPrompt: (prompt: 'sit' | 'stand' | null) => void;

  talkedNpcs: string[];
  addTalkedNpc: (npcId: string) => void;

  // --- Room 5: Hành trình Văn Ba năm 1911 ---
  roomFiveProgress: RoomFiveMissionProgress;
  completeRoomFiveFragment: (fragmentId: RoomFiveFragmentId) => void;
  resetRoomFiveFragment: (fragmentId: RoomFiveFragmentId) => void;
  visitRoomFiveShipHotspot: (hotspotId: RoomFiveShipHotspotId) => void;
  completeRoomFiveMission: () => void;
  resetRoomFiveMission: () => void;

  // --- Room 1 Game Start Synchronizer ---
  roomOneLocked: boolean;
  roomOneWaitingPlayers: number;
  roomOneTotalPlayers: number;
  roomOneCountdownTime: number;
  roomOneState: 'waiting' | 'countdown' | 'started';
  roomOneStartTimestamp: number | null;
  roomOneSessionResults: any[] | null;
  setRoomOneSessionResults: (results: any[] | null) => void;

  // --- Room 2 Conference Session Synchronizer ---
  roomTwoSessionState: 'waiting' | 'session1' | 'session2' | 'session3' | 'session4' | 'completed';
  roomTwoDocOpen: boolean;
  setRoomTwoDocOpen: React.Dispatch<React.SetStateAction<boolean>>;
  roomTwoScore: number | null;
  setRoomTwoScore: React.Dispatch<React.SetStateAction<number | null>>;
  roomTwoScore2: number | null;
  setRoomTwoScore2: React.Dispatch<React.SetStateAction<number | null>>;
  roomTwoScore3: number | null;
  setRoomTwoScore3: React.Dispatch<React.SetStateAction<number | null>>;
  roomTwoScore4: number | null;
  setRoomTwoScore4: React.Dispatch<React.SetStateAction<number | null>>;

}

export interface GameEvent {
  id: string;
  year: string;
  sortOrder: number;
  titleVi: string;
  titleEn: string;
  iconId: number;
  color: string;
}

const MuseumContext = createContext<MuseumContextType | undefined>(undefined);

export const MuseumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [nickname, setNickname] = useState<string>('');
  const [outfitId, setOutfitState] = useState('student');
  const [competitionMode, setCompetitionMode] = useState(false);
  const competitionModeRef = React.useRef(false);
  useEffect(() => { competitionModeRef.current = competitionMode; }, [competitionMode]);
  useEffect(() => {
    try { setOutfitState(getAvatarOutfit(localStorage.getItem('museum_outfit_id')).id); } catch { /* Storage unavailable: school uniform remains the default. */ }
  }, []);
  const setOutfitId = useCallback((id: string) => {
    const resolvedId = getAvatarOutfit(id).id;
    setOutfitState(resolvedId);
    try { localStorage.setItem('museum_outfit_id', resolvedId); } catch { /* Keep the selection for this visit. */ }
  }, []);

  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [exhibitModalMode, setExhibitModalMode] = useState<'game' | 'info'>('game');
  const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [otherUsers, setOtherUsers] = useState<MultiplayerUser[]>([]);
  const otherUsersPositions = React.useRef<Record<string, MultiplayerUser>>({});
  const hasJoinedRef = React.useRef<boolean>(false);
  const loadedRoomIdsRef = React.useRef<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localUserPos, setLocalUserPos] = useState<[number, number, number]>([0, 1.7, 5]);
  const playerPositionRef = React.useRef<[number, number, number]>([0, 3, 10]);
  const [localUserYaw, setLocalUserYaw] = useState<number>(0);

  const [inQueue, setInQueue] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [isAdmitted, setIsAdmitted] = useState<boolean>(false);

  // ═══ Door & Room State ═══
  const [doorStates, setDoorStates] = useState<Record<string, DoorState>>({
    'door-room1': { isOpen: true, targetRoom: 'gallery-subsidy' },
    'door-room2': { isOpen: true, targetRoom: 'gallery-three' },
    'door-room3': { isOpen: true, targetRoom: 'gallery-ceramics' },
    'door-room4': { isOpen: true, targetRoom: 'gallery-market-economy' },
    'door-room5': { isOpen: true, targetRoom: 'gallery-paintings' },
  });
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>({
    'gallery-subsidy': { isOpen: true },
    'gallery-paintings': { isOpen: true },
    'gallery-ceramics': { isOpen: true },
    'gallery-market-economy': { isOpen: true },
    'gallery-three': { isOpen: true }
  });
  const [loadedRooms, setLoadedRooms] = useState<LoadedRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [doorClosingAlert, setDoorClosingAlert] = useState<{ doorId: string; teleportTo: string; countdownMs: number } | null>(null);
  const [roomClosingAlert, setRoomClosingAlert] = useState<RoomClosingAlert | null>(null);

  // --- Room 1 Game Start Synchronizer ---
  const [roomOneLocked, setRoomOneLocked] = useState(false);
  const [roomOneWaitingPlayers, setRoomOneWaitingPlayers] = useState(0);
  const [roomOneTotalPlayers, setRoomOneTotalPlayers] = useState(0);
  const [roomOneCountdownTime, setRoomOneCountdownTime] = useState(0);
  const [roomOneState, setRoomOneState] = useState<'waiting' | 'countdown' | 'started'>('waiting');
  const [roomOneStartTimestamp, setRoomOneStartTimestamp] = useState<number | null>(null);
  const [roomOneSessionResults, setRoomOneSessionResults] = useState<any[] | null>(null);

  // --- Room 2 Conference Session Synchronizer ---
  const [roomTwoSessionState, setRoomTwoSessionState] = useState<'waiting' | 'session1' | 'session2' | 'session3' | 'session4' | 'completed'>('waiting');
  const [roomTwoDocOpen, setRoomTwoDocOpen] = useState<boolean>(false);
  const [roomTwoScore, setRoomTwoScore] = useState<number | null>(null);
  const [roomTwoScore2, setRoomTwoScore2] = useState<number | null>(null);
  const [roomTwoScore3, setRoomTwoScore3] = useState<number | null>(null);
  const [roomTwoScore4, setRoomTwoScore4] = useState<number | null>(null);

  const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const [miniGameOpen, setMiniGameOpen] = useState<boolean>(false);
  const [roomFourInteractionOpen, setRoomFourInteractionOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ nickname: string; score: number; time: string }>>([]);
  const [hasPlayed, setHasPlayedState] = useState<boolean>(false);

  // Load hasPlayed from localStorage when nickname changes
  useEffect(() => {
    if (typeof window !== 'undefined' && nickname) {
      const played = localStorage.getItem(`museum_has_played_game_${nickname}`);
      if (played === 'true') {
        setHasPlayedState(true);
        const savedState = localStorage.getItem(`museum_game_state_${nickname}`) as 'won' | 'lost' | null;
        const savedScore = localStorage.getItem(`museum_game_score_${nickname}`);
        const savedTimeLeft = localStorage.getItem(`museum_game_time_left_${nickname}`);
        
        if (savedState) setGameState(savedState);
        if (savedScore) setScore(parseInt(savedScore) || 0);
        if (savedTimeLeft) setTimeLeft(parseInt(savedTimeLeft) || 0);
      } else {
        setHasPlayedState(false);
        setGameState('idle');
        setScore(0);
        setTimeLeft(180);
      }
    } else {
      setHasPlayedState(false);
      setGameState('idle');
    }
  }, [nickname]);

  const setHasPlayed = useCallback((val: boolean) => {
    setHasPlayedState(val);
    if (typeof window !== 'undefined' && nickname) {
      localStorage.setItem(`museum_has_played_game_${nickname}`, val ? 'true' : 'false');
    }
  }, [nickname]);

  // --- Gameplay States ---
  const [cluesCollected, setCluesCollected] = useState<string[]>([]);
  const [roomOneCompleted, setRoomOneCompleted] = useState<boolean>(false);
  const [sittingPosition, setSittingPosition] = useState<{ x: number; y: number; z: number; rotationY?: number } | null>(null);
  const [sittingPrompt, setSittingPrompt] = useState<'sit' | 'stand' | null>(null);
  const [talkedNpcs, setTalkedNpcs] = useState<string[]>([]);
  const [roomFiveProgress, setRoomFiveProgress] = useState<RoomFiveMissionProgress>(EMPTY_ROOM_FIVE_PROGRESS);

  // Reset gameplay progress khi đổi người chơi trong phiên hiện tại.
  // Không lưu localStorage để người chơi mới không bị kế thừa sổ điều tra/câu hỏi từ người trước.
  useEffect(() => {
    setCluesCollected([]);
    setRoomOneCompleted(false);
  }, [nickname]);

  const addClue = useCallback((clueId: string) => {
    setCluesCollected((prev) => {
      if (prev.includes(clueId)) return prev;
      const updated = [...prev, clueId];
      if (socket && socket.connected) {
        socket.emit('room1:update-clues-count', { count: updated.length });
      }
      return updated;
    });
  }, [socket]);

  const handleSetRoomOneCompleted = useCallback((completed: boolean) => {
    setRoomOneCompleted(completed);
  }, []);

  // Sync Room 4 gameplay progress (talkedNpcs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!nickname) {
      setTalkedNpcs([]);
      return;
    }

    const progressKey = `roomFourProgress:${nickname.trim().toLowerCase()}`;
    const savedProgress = localStorage.getItem(progressKey);

    if (!savedProgress) {
      setTalkedNpcs([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedProgress) as {
        talkedNpcs?: string[];
      };
      setTalkedNpcs(Array.isArray(parsed.talkedNpcs) ? parsed.talkedNpcs : []);
    } catch (e) {
      console.error('Lỗi phân tích tiến trình Room 4:', e);
      setTalkedNpcs([]);
    }
  }, [nickname]);

  const addTalkedNpc = useCallback((npcId: string) => {
    setTalkedNpcs((prev) => {
      if (prev.includes(npcId)) return prev;
      const updated = [...prev, npcId];
      if (typeof window !== 'undefined' && nickname) {
        const progressKey = `roomFourProgress:${nickname.trim().toLowerCase()}`;
        localStorage.setItem(progressKey, JSON.stringify({
          talkedNpcs: updated,
        }));
      }
      return updated;
    });
  }, [nickname]);

  const persistRoomFiveProgress = useCallback((progress: RoomFiveMissionProgress) => {
    if (typeof window === 'undefined' || !nickname) return;
    localStorage.setItem(
      `roomFiveProgress:${nickname.trim().toLowerCase()}`,
      JSON.stringify(progress),
    );
  }, [nickname]);

  // Mỗi khách có một hồ sơ Room 5 riêng. Đồng thời nhập kết quả nhiệm vụ phụ bếp
  // từ key cũ để các lượt chơi trước khi có nhiệm vụ chung không bị mất tiến độ.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!nickname) {
      const resetTimer = window.setTimeout(() => setRoomFiveProgress(EMPTY_ROOM_FIVE_PROGRESS), 0);
      return () => window.clearTimeout(resetTimer);
    }

    const progressKey = `roomFiveProgress:${nickname.trim().toLowerCase()}`;
    const legacyGalleyCompleted = localStorage.getItem(`room5_galley_mission_${nickname}`) === 'completed';
    const savedProgress = localStorage.getItem(progressKey);

    let restored: RoomFiveMissionProgress = EMPTY_ROOM_FIVE_PROGRESS;
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) as Partial<RoomFiveMissionProgress>;
        const fragments = Array.isArray(parsed.fragments)
          ? parsed.fragments.filter((id): id is RoomFiveFragmentId => ROOM_FIVE_FRAGMENT_IDS.includes(id as RoomFiveFragmentId))
          : [];
        const shipHotspots = Array.isArray(parsed.shipHotspots)
          ? parsed.shipHotspots.filter((id): id is RoomFiveShipHotspotId => ROOM_FIVE_SHIP_HOTSPOT_IDS.includes(id as RoomFiveShipHotspotId))
          : [];
        restored = {
          fragments: [...new Set(fragments)],
          shipHotspots: [...new Set(shipHotspots)],
          completed: Boolean(parsed.completed),
        };
      } catch (error) {
        console.error('Lỗi phân tích tiến trình Room 5:', error);
      }
    }

    if (legacyGalleyCompleted && !restored.fragments.includes('labour')) {
      restored = { ...restored, fragments: [...restored.fragments, 'labour'] };
      localStorage.setItem(progressKey, JSON.stringify(restored));
    }
    const restoreTimer = window.setTimeout(() => setRoomFiveProgress(restored), 0);
    return () => window.clearTimeout(restoreTimer);
  }, [nickname]);

  const completeRoomFiveFragment = useCallback((fragmentId: RoomFiveFragmentId) => {
    setRoomFiveProgress((previous) => {
      if (previous.fragments.includes(fragmentId)) return previous;
      const next = {
        ...previous,
        fragments: [...previous.fragments, fragmentId],
        completed: false,
      };
      persistRoomFiveProgress(next);
      return next;
    });
  }, [persistRoomFiveProgress]);

  const resetRoomFiveFragment = useCallback((fragmentId: RoomFiveFragmentId) => {
    setRoomFiveProgress((previous) => {
      const next: RoomFiveMissionProgress = {
        fragments: previous.fragments.filter((id) => id !== fragmentId),
        shipHotspots: fragmentId === 'vessel' ? [] : previous.shipHotspots,
        completed: false,
      };
      persistRoomFiveProgress(next);
      return next;
    });
  }, [persistRoomFiveProgress]);

  const visitRoomFiveShipHotspot = useCallback((hotspotId: RoomFiveShipHotspotId) => {
    setRoomFiveProgress((previous) => {
      if (previous.shipHotspots.includes(hotspotId) && previous.fragments.includes('vessel')) return previous;
      const shipHotspots = previous.shipHotspots.includes(hotspotId)
        ? previous.shipHotspots
        : [...previous.shipHotspots, hotspotId];
      const inspectedAll = ROOM_FIVE_SHIP_HOTSPOT_IDS.every((id) => shipHotspots.includes(id));
      const fragments = inspectedAll && !previous.fragments.includes('vessel')
        ? [...previous.fragments, 'vessel' as const]
        : previous.fragments;
      const next = { ...previous, shipHotspots, fragments, completed: false };
      persistRoomFiveProgress(next);
      return next;
    });
  }, [persistRoomFiveProgress]);

  const completeRoomFiveMission = useCallback(() => {
    setRoomFiveProgress((previous) => {
      if (previous.fragments.length < ROOM_FIVE_FRAGMENT_IDS.length) return previous;
      const next = { ...previous, completed: true };
      persistRoomFiveProgress(next);
      return next;
    });
  }, [persistRoomFiveProgress]);

  const resetRoomFiveMission = useCallback(() => {
    setRoomFiveProgress(EMPTY_ROOM_FIVE_PROGRESS);
    if (typeof window === 'undefined' || !nickname) return;
    localStorage.removeItem(`roomFiveProgress:${nickname.trim().toLowerCase()}`);
    localStorage.removeItem(`room5_galley_mission_${nickname}`);
  }, [nickname]);

  const resetRoomOne = useCallback(() => {
    setCluesCollected([]);
    setRoomOneCompleted(false);
    setTalkedNpcs([]);
    if (typeof window !== 'undefined') {
      if (nickname) {
        localStorage.removeItem(`roomOneProgress:${nickname.trim().toLowerCase()}`);
        localStorage.removeItem(`roomFourProgress:${nickname.trim().toLowerCase()}`);
      }
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('roomOneProgress:') ||
          key.startsWith('roomFourProgress:') ||
          key.startsWith('museum_room1_failed_quizzes')
        ) {
          localStorage.removeItem(key);
        }
      });
      // Dọn key cũ để tránh người chơi mới bị kế thừa tiến trình global.
      localStorage.removeItem('cluesCollected');
      localStorage.removeItem('roomOneCompleted');
      localStorage.removeItem('roomFourProgress');
    }
  }, [nickname]);

  const clearTeleport = useCallback(() => setTeleportTarget(null), []);

  // --- Game State ---
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [orderedEvents, setOrderedEvents] = useState<GameEvent[]>([]);
  const [score, setScore] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastCheckResults, setLastCheckResults] = useState<boolean[] | null>(null);

  const HISTORY_EVENTS = useMemo(() => [
    { id: 'vn-left-1', year: '1986', sortOrder: 0, titleVi: 'Đại hội VI - Đổi mới', titleEn: '6th Party Congress - Doi Moi', iconId: 1, color: '#fbbf24' },
    { id: 'vn-left-2', year: '1988', sortOrder: 1, titleVi: 'Khoán 10', titleEn: 'Resolution 10 (Khoan 10)', iconId: 2, color: '#ec4899' },
    { id: 'vn-left-3', year: '1989', sortOrder: 2, titleVi: 'Việt Nam rút quân khỏi Campuchia', titleEn: 'Withdrawal from Cambodia', iconId: 4, color: '#3b82f6' },
    { id: 'vn-right-1', year: '1989', sortOrder: 3, titleVi: 'Việt Nam trở thành nước xuất khẩu gạo', titleEn: 'VN becomes a major rice exporter', iconId: 3, color: '#10b981' },
    { id: 'vn-back-left', year: '1991', sortOrder: 4, titleVi: 'Liên Xô tan rã', titleEn: 'Soviet Union dissolution', iconId: 5, color: '#a855f7' },
    { id: 'vn-right-2', year: '03/02/1994', sortOrder: 5, titleVi: 'Hoa Kỳ bãi bỏ cấm vận', titleEn: 'US lifts trade embargo', iconId: 6, color: '#06b6d4' },
    { id: 'vn-right-3', year: '11/07/1995', sortOrder: 6, titleVi: 'Bình thường hóa quan hệ Việt Nam – Hoa Kỳ', titleEn: 'Normalization of US-VN relations', iconId: 1, color: '#f59e0b' },
    { id: 'vn-door-left', year: '28/07/1995', sortOrder: 7, titleVi: 'Việt Nam gia nhập ASEAN', titleEn: 'VN joins ASEAN', iconId: 3, color: '#ef4444' },
    { id: 'vn-door-right', year: '24/10/1995', sortOrder: 8, titleVi: 'Nhật thực toàn phần tại Việt Nam', titleEn: 'Total solar eclipse in Vietnam', iconId: 6, color: '#6366f1' }
  ], []);

  const orderedEventsRef = React.useRef(orderedEvents);
  useEffect(() => {
    orderedEventsRef.current = orderedEvents;
  }, [orderedEvents]);

  // Khởi tạo game mới và trộn 9 ô ngẫu nhiên
  const initializeGame = useCallback(() => {
    let shuffled = [...HISTORY_EVENTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOrderedEvents(shuffled);
    setScore(0); // Bắt đầu từ 0 điểm
    setTimeLeft(180); // 3 phút = 180 giây
    setGameState('playing');
    setLastCheckResults(null);
    socket?.emit('update-status', 'playing-game');
  }, [socket, HISTORY_EVENTS]);

  // Bộ đếm thời gian chạy nền
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tính điểm dựa trên số ô đúng khi hết giờ
          const currentEvents = orderedEventsRef.current;
          const correctCount = currentEvents.filter((event, idx) => event.sortOrder === idx).length;
          const finalScore = correctCount * 10;

          setScore(finalScore);
          setGameState('lost');
          setHasPlayed(true);
          if (typeof window !== 'undefined' && nickname) {
            localStorage.setItem(`museum_game_state_${nickname}`, 'lost');
            localStorage.setItem(`museum_game_score_${nickname}`, finalScore.toString());
            localStorage.setItem(`museum_game_time_left_${nickname}`, '0');
          }
          socket?.emit('submit-score', { score: finalScore, timeSpent: 180 });
          socket?.emit('update-status', '');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, socket, nickname, setHasPlayed]);

  // Tráo đổi vị trí giữa 2 ô sự kiện
  const swapEvents = useCallback((idx1: number, idx2: number) => {
    setOrderedEvents((prev) => {
      const copy = [...prev];
      const temp = copy[idx1];
      copy[idx1] = copy[idx2];
      copy[idx2] = temp;
      return copy;
    });
    setLastCheckResults(null); // Reset kết quả check trước đó khi người chơi thay đổi vị trí
  }, []);

  // Xác nhận kiểm tra thứ tự
  const checkOrder = useCallback(() => {
    const results = orderedEvents.map((event, idx) => event.sortOrder === idx);
    setLastCheckResults(results);

    const correctCount = results.filter(r => r === true).length;
    const finalScore = correctCount === 9 ? 100 : correctCount * 10;

    const timeSpent = 180 - timeLeft;

    setScore(finalScore);
    setGameState('won'); // Kết thúc game và chuyển thẳng sang màn hình kết quả luôn
    setHasPlayed(true);
    if (typeof window !== 'undefined' && nickname) {
      localStorage.setItem(`museum_game_state_${nickname}`, 'won');
      localStorage.setItem(`museum_game_score_${nickname}`, finalScore.toString());
      localStorage.setItem(`museum_game_time_left_${nickname}`, timeLeft.toString());
    }
    socket?.emit('submit-score', { score: finalScore, timeSpent });
    socket?.emit('update-status', '');
  }, [orderedEvents, timeLeft, socket, nickname, setHasPlayed]);

  const [settings, setSettings] = useState<GraphicsSettings>({
    preset: 'medium',
    shadows: false,
    animations: true,
    maxAvatars: 99,    // Cho phép hiển thị tối đa 99 người để 64 người thấy nhau
    reducedLights: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('museum_graphics_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Luôn tắt shadows bất kể giá trị lưu trữ
          parsed.shadows = false;
          setSettings(parsed);
        } catch (e) {
          console.error('Lỗi phân tích settings từ localStorage:', e);
        }
      }
    }
  }, []);

  const getPresetSettings = (preset: GraphicsSettings['preset']) => {
    switch (preset) {
      case 'ultra-low':
        return { shadows: false, animations: false, maxAvatars: 0, reducedLights: true };
      case 'low':
        return { shadows: false, animations: false, maxAvatars: 10, reducedLights: false };
      case 'medium':
      default:
        return { shadows: false, animations: true, maxAvatars: 99, reducedLights: false };
    }
  };

  const updatePreset = (preset: GraphicsSettings['preset']) => {
    setSettings(() => {
      const presetSettings = getPresetSettings(preset);
      const updated = {
        preset,
        ...presetSettings
      };
      localStorage.setItem('museum_graphics_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<GraphicsSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('museum_graphics_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TẢI PHÒNG ĐỘNG KHI CỬA MỞ (Dynamic Room Loading)
  // ═══════════════════════════════════════════════════════════════════════════
  const loadRoom = useCallback(async (galleryId: string) => {
    if (loadedRoomIdsRef.current.has(galleryId)) return;
    loadedRoomIdsRef.current.add(galleryId);

    try {
      const [galleriesRes, exhibitsRes] = await Promise.all([
        fetch('/api/galleries'),
        fetch(`/api/exhibits?galleryId=${galleryId}`),
      ]);

      const galleries: Gallery[] = await galleriesRes.json();
      const exhibits: Exhibit[] = await exhibitsRes.json();
      const gallery = galleries.find(g => g.id === galleryId) || null;

      setLoadedRooms(prev => {
        // Kiểm tra nếu phòng đã được tải rồi thì bỏ qua
        if (prev.some(r => r.galleryId === galleryId)) return prev;
        console.log(`[ROOM-LOADED] Phòng "${galleryId}" đã được tải thành công (${exhibits.length} hiện vật).`);
        return [...prev, { galleryId, exhibits, gallery }];
      });
    } catch (err) {
      loadedRoomIdsRef.current.delete(galleryId);
      console.error(`[ROOM-LOAD-ERROR] Lỗi tải phòng "${galleryId}":`, err);
    }
  }, []);

  const unloadRoom = useCallback((galleryId: string) => {
    loadedRoomIdsRef.current.delete(galleryId);
    setLoadedRooms(prev => prev.filter(r => r.galleryId !== galleryId));
    console.log(`[ROOM-UNLOADED] Phòng "${galleryId}" đã được dỡ bỏ.`);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCKET.IO — KẾT NỐI & LẮNG NGHE SỰ KIỆN
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Kết nối socket ngay khi provider mount (cho cả lobby và gallery)
    const endpoint = getRealtimeEndpoint();
    const newSocket = io(endpoint.origin, {
      path: endpoint.socketPath,
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Đã kết nối Socket.io server:', newSocket.id);
      hasJoinedRef.current = false;
    });

    // ── Door Events ──
    newSocket.on('door-states', (states: Record<string, DoorState>) => {
      // Loại bỏ closingTimer từ server (không serialize được)
      const cleanStates: Record<string, DoorState> = {};
      for (const [key, val] of Object.entries(states)) {
        cleanStates[key] = {
          isOpen: (val as any).isOpen,
          targetRoom: (val as any).targetRoom,
        };
      }
      setDoorStates(cleanStates);
    });

    newSocket.on('door-opened', (data: { doorId: string; targetRoom: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: true, targetRoom: data.targetRoom },
      }));
    });

    newSocket.on('door-closing', (data: { doorId: string; teleportTo: string; countdownMs: number }) => {
      setDoorClosingAlert(data);
      // Tự động clear alert sau countdown
      setTimeout(() => setDoorClosingAlert(null), data.countdownMs + 500);
    });

    newSocket.on('door-closed', (data: { doorId: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: false, targetRoom: '' },
      }));
      setDoorClosingAlert(null);
      console.log(`[DOOR] Cửa "${data.doorId}" đã đóng.`);
    });

    // ── Room Events ──
    newSocket.on('room-states', (states: Record<string, RoomState>) => {
      setRoomStates(states);
    });

    newSocket.on('room-closing', (data: RoomClosingAlert) => {
      setRoomClosingAlert(data);
      // Tự động clear alert sau countdown
      setTimeout(() => setRoomClosingAlert(null), data.countdownMs + 500);
    });

    newSocket.on('room-closed', (data: { roomId: string; teleportTo: string }) => {
      setRoomClosingAlert(null);
      setCurrentRoom((prevRoom) => {
        if (prevRoom === data.roomId) {
          const target = data.teleportTo || 'lobby';
          const spawn = SPAWN_POINTS[target] || SPAWN_POINTS['lobby'];
          setTeleportTarget(spawn);
          console.log(`[TELEPORT] Phòng "${data.roomId}" bị tắt. Di chuyển người chơi về phòng "${target}" tại tọa độ Z = ${spawn.z}`);
          return target;
        }
        return prevRoom;
      });
    });

    newSocket.on('admin:teleported-by-force', (data: { targetRoom: string; spawnPos: { x: number; y: number; z: number } }) => {
      setCurrentRoom(data.targetRoom);
      setTeleportTarget(data.spawnPos);
      console.log(`[ADMIN-TELEPORT] Bạn đã bị admin dịch chuyển bắt buộc sang phòng "${data.targetRoom}" tại tọa độ:`, data.spawnPos);
    });

    // ── Multiplayer Events ──
    newSocket.on('join-success', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
    });

    newSocket.on('queue-status', (data: { inQueue: boolean; position: number }) => {
      setInQueue(data.inQueue);
      setQueuePosition(data.position);
      setIsAdmitted(false);
    });

    newSocket.on('admitted', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
    });

    newSocket.on('users-list', (users: MultiplayerUser[]) => {
      const filtered = users.filter(u => u.id !== newSocket.id);
      setOtherUsers(filtered);
      otherUsersPositions.current = {};
      filtered.forEach(u => {
        otherUsersPositions.current[u.id] = u;
      });
    });

    newSocket.on('user-joined', (user: MultiplayerUser) => {
      setOtherUsers(prev => {
        if (prev.some(u => u.id === user.id)) return prev;
        return [...prev, user];
      });
      otherUsersPositions.current[user.id] = user;
    });

    newSocket.on('user-moved', (user: MultiplayerUser) => {
      otherUsersPositions.current[user.id] = user;
    });

    // Batch handler — nhận tất cả vị trí thay đổi trong 1 event (10Hz flush từ server)
    newSocket.on('users-batch-moved', (users: MultiplayerUser[]) => {
      for (const user of users) {
        otherUsersPositions.current[user.id] = user;
      }
    });

    newSocket.on('user-left', (userId: string) => {
      setOtherUsers(prev => prev.filter(u => u.id !== userId));
      delete otherUsersPositions.current[userId];
    });

    newSocket.on('user-status-updated', (data: { id: string; status: string }) => {
      setOtherUsers(prev => prev.map(u => u.id === data.id ? { ...u, status: data.status } : u));
      if (otherUsersPositions.current[data.id]) {
        otherUsersPositions.current[data.id].status = data.status;
      }
    });

    newSocket.on('leaderboard-updated', (board: Array<{ nickname: string; score: number; time: string }>) => {
      setLeaderboard(board);
    });

    // ── Room 1 Multiplayer Sync Events ──
    newSocket.on('room1:state-sync', (data: { roomOneState: 'waiting' | 'countdown' | 'started'; roomOneStartTimestamp?: number }) => {
      if (competitionModeRef.current) return;
      setRoomOneState(data.roomOneState);
      setRoomOneLocked(false);
      if (data.roomOneStartTimestamp) {
        setRoomOneStartTimestamp(data.roomOneStartTimestamp);
      } else {
        setRoomOneStartTimestamp(null);
      }
    });

    newSocket.on('room1:waiting-status', (data: { readyPlayers: number; totalPlayers: number }) => {
      if (competitionModeRef.current) return;
      setRoomOneState('waiting');
      setRoomOneWaitingPlayers(data.readyPlayers);
      setRoomOneTotalPlayers(data.totalPlayers);
      setRoomOneLocked(false);
    });

    newSocket.on('room1:countdown-start', (data: { duration: number }) => {
      if (competitionModeRef.current) return;
      setRoomOneState('countdown');
      setRoomOneCountdownTime(data.duration);
      setRoomOneLocked(false);
    });

    newSocket.on('room1:countdown-cancelled', () => {
      if (competitionModeRef.current) return;
      setRoomOneState('waiting');
      setRoomOneCountdownTime(0);
      setRoomOneLocked(false);
    });

    newSocket.on('room1:start-game', (data?: { roomOneStartTimestamp?: number }) => {
      if (competitionModeRef.current) return;
      setRoomOneState('started');
      setRoomOneCountdownTime(0);
      setRoomOneLocked(false);
      setRoomOneStartTimestamp(data?.roomOneStartTimestamp || Date.now());
      setRoomOneSessionResults(null);
    });

    newSocket.on('room1:session-ended', (data: { results: any[] }) => {
      if (competitionModeRef.current) return;
      setRoomOneSessionResults(data.results);
      setRoomOneCompleted(true);
    });

    // ── Room 2 Conference Session Sync Events ──
    newSocket.on('room2:state-sync', (data: { roomTwoSessionState: any }) => {
      setRoomTwoSessionState(data.roomTwoSessionState);
    });

    newSocket.on('room2:session1-start', () => {
      setRoomTwoSessionState('session1');
    });

    newSocket.on('room2:session2-start', () => {
      setRoomTwoSessionState('session2');
    });

    newSocket.on('room2:session3-start', () => {
      setRoomTwoSessionState('session3');
    });

    newSocket.on('room2:session4-start', () => {
      setRoomTwoSessionState('session4');
    });

    newSocket.on('room2:completed-start', () => {
      setRoomTwoSessionState('completed');
    });

    newSocket.on('room2:submit-success', (data: { session: number; score: number }) => {
      if (data.session === 1) setRoomTwoScore(data.score);
      else if (data.session === 2) setRoomTwoScore2(data.score);
      else if (data.session === 3) setRoomTwoScore3(data.score);
      else if (data.session === 4) setRoomTwoScore4(data.score);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(false);
      otherUsersPositions.current = {};
    };
  }, []);

  // Join room khi có nickname (chỉ join một lần duy nhất lúc khởi động/kết nối)
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (!nickname) return;
    if (hasJoinedRef.current) return;

    hasJoinedRef.current = true;
    const initialRoomId = activeGallery?.id || 'lobby';
    const spawn = SPAWN_POINTS[initialRoomId] || { x: 0, y: 3.0, z: -5.0 };

    socket.emit('join-room', {
      nickname,
      outfitId,
      galleryId: initialRoomId,
      x: spawn.x,
      y: 0,
      z: spawn.z,
      yaw: localUserYaw,
    });
  }, [socket, nickname, outfitId, activeGallery?.id]);

  // Pre-load all rooms ngầm lúc rảnh rỗi nếu cấu hình là 'medium' và phòng đó đang bật
  useEffect(() => {
    if (settings.preset !== 'medium') return;

    const idleCallback = typeof window !== 'undefined'
      ? (window.requestIdleCallback || ((cb: any) => setTimeout(cb, 2000)))
      : null;

    if (!idleCallback) return;

    const idleId = idleCallback(() => {
      if (roomStates['gallery-subsidy']?.isOpen) loadRoom('gallery-subsidy');
      if (roomStates['gallery-paintings']?.isOpen) loadRoom('gallery-paintings');
      if (roomStates['gallery-ceramics']?.isOpen) loadRoom('gallery-ceramics');
      if (roomStates['gallery-market-economy']?.isOpen) loadRoom('gallery-market-economy');
      if (roomStates['gallery-three']?.isOpen) loadRoom('gallery-three');
      console.log('[PRELOAD] [MEDIUM-PRESET] Tải trước ngầm các phòng triển lãm đang bật.');
    }, { timeout: 5000 });

    const cancelCallback = typeof window !== 'undefined'
      ? (window.cancelIdleCallback || ((id: any) => clearTimeout(id)))
      : null;

    return () => {
      if (cancelCallback && idleId) {
        cancelCallback(idleId);
      }
    };
  }, [settings.preset, roomStates, loadRoom]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TỰ ĐỘNG TẢI/DỠ PHÒNG TRIỂN LÃM ĐỘNG (GIẢI PHÓNG GPU KHI TẮT PHÒNG)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Tải phòng vào bộ nhớ/GPU nếu phòng đó được Admin bật, dỡ bỏ ngay lập tức nếu bị tắt
    for (const [galleryId, rState] of Object.entries(roomStates)) {
      if (rState.isOpen) {
        loadRoom(galleryId);
      } else {
        unloadRoom(galleryId);
      }
    }
  }, [roomStates, loadRoom, unloadRoom]);

  // Hiệu ứng đếm ngược Room 1 cục bộ
  useEffect(() => {
    if (roomOneState !== 'countdown' || roomOneCountdownTime <= 0) return;

    const timer = setInterval(() => {
      setRoomOneCountdownTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roomOneState, roomOneCountdownTime]);

  // Phòng 1 luôn cho phép di chuyển; trạng thái phiên không còn là điều kiện duyệt vào phòng.
  useEffect(() => {
    setRoomOneLocked(false);
  }, [activeGallery?.id, roomOneState]);

  // Reset Room 2 states when leaving Room 2
  useEffect(() => {
    if (currentRoom !== 'gallery-paintings') {
      setRoomTwoDocOpen(false);
      setRoomTwoScore(null);
      setRoomTwoScore2(null);
      setRoomTwoScore3(null);
      setRoomTwoScore4(null);
    }
  }, [currentRoom]);

  return (
    <MuseumContext.Provider
      value={{
        language,
        setLanguage,
        nickname,
        outfitId,
        setOutfitId,
        competitionMode,
        setCompetitionMode,        setNickname,
        selectedExhibit,
        setSelectedExhibit,
        exhibitModalMode,
        setExhibitModalMode,
        activeGallery,
        setActiveGallery,
        audioPlaying,
        setAudioPlaying,
        localUserPos,
        playerPositionRef,
        setLocalUserPos,
        localUserYaw,
        setLocalUserYaw,
        socket,
        otherUsers,
        otherUsersPositions,
        inQueue,
        setInQueue,
        queuePosition,
        setQueuePosition,
        isAdmitted,
        setIsAdmitted,
        settings,
        updateSettings,
        updatePreset,

        // Door & Room
        doorStates,
        roomStates,
        loadedRooms,
        currentRoom,
        setCurrentRoom,
        doorClosingAlert,
        roomClosingAlert,
        teleportTarget,
        setTeleportTarget,
        clearTeleport,
        miniGameOpen,
        setMiniGameOpen,
        roomFourInteractionOpen,
        setRoomFourInteractionOpen,
        leaderboard,
        hasPlayed,
        setHasPlayed,
        gameState,
        orderedEvents,
        score,
        timeLeft,
        lastCheckResults,
        initializeGame,
        swapEvents,
        checkOrder,

        // --- Gameplay ---
        cluesCollected,
        roomOneCompleted,
        addClue,
        setRoomOneCompleted: handleSetRoomOneCompleted,
        resetRoomOne,
        sittingPosition,
        setSittingPosition,
        sittingPrompt,
        setSittingPrompt,
        talkedNpcs,
        addTalkedNpc,
        roomFiveProgress,
        completeRoomFiveFragment,
        resetRoomFiveFragment,
        visitRoomFiveShipHotspot,
        completeRoomFiveMission,
        resetRoomFiveMission,

        // --- Room 1 Game Start Synchronizer ---
        roomOneLocked: competitionMode ? false : roomOneLocked,
        roomOneWaitingPlayers,
        roomOneTotalPlayers,
        roomOneCountdownTime,
        roomOneState,
        roomOneStartTimestamp,
        roomOneSessionResults,
        setRoomOneSessionResults,

        // --- Room 2 Conference Session Synchronizer ---
        roomTwoSessionState,
        roomTwoDocOpen,
        setRoomTwoDocOpen,
        roomTwoScore,
        setRoomTwoScore,
        roomTwoScore2,
        setRoomTwoScore2,
        roomTwoScore3,
        setRoomTwoScore3,
        roomTwoScore4,
        setRoomTwoScore4,

      }}
    >
      {children}
    </MuseumContext.Provider>
  );
};

export const useMuseum = () => {
  const context = useContext(MuseumContext);
  if (!context) {
    throw new Error('useMuseum phải được sử dụng trong MuseumProvider');
  }
  return context;
};
