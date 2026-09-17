'use client';

import { AvatarSelector } from '@/components/ui/AvatarSelector';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { Gallery, Exhibit } from '@/lib/db';
import GalleryCanvas from '@/components/3d/GalleryCanvas';
import ExhibitModal from '@/components/ui/ExhibitModal';
import MiniGameModal from '@/components/ui/MiniGameModal';
import { RoomFiveMissionHud } from '@/components/ui/RoomFiveMissionHud';
import { RoomOneSoundtrack } from '@/components/ui/RoomOneSoundtrack';
import { Users, MessageSquare, ArrowLeft, SendHorizontal, Settings } from 'lucide-react';

interface ChatMessage {
  userId: string;
  nickname: string;
  text: string;
  timestamp: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GalleryPage({ params }: PageProps) {
  const router = useRouter();
  const { id: galleryId } = use(params);

  const {
    nickname,
    outfitId,
    setOutfitId,
    setNickname,
    activeGallery,
    setActiveGallery,
    socket,
    otherUsers,
    language,
    inQueue,
    queuePosition,
    isAdmitted,
    settings,
    updateSettings,
    updatePreset,
    miniGameOpen,
    roomFiveProgress,
  } = useMuseum();

  const leaveGallery = () => {
    const leavingUnfinishedRoomFive = galleryId === 'gallery-three'
      && roomFiveProgress.fragments.length > 0
      && !roomFiveProgress.completed;
    if (leavingUnfinishedRoomFive) {
      const shouldLeave = window.confirm(
        language === 'vi'
          ? 'Hồ sơ hành trình Văn Ba chưa hoàn tất. Tiến độ đã được lưu; bạn có muốn về sảnh không?'
          : 'The Văn Ba journey record is unfinished. Your progress is saved; return to the lobby?',
      );
      if (!shouldLeave) return;
    }
    setNickname('');
    setActiveGallery(null);
    router.push('/');
  };

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trạng thái Form Nhập biệt danh tại cổng phòng
  const [inputNickname, setInputNickname] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputError, setInputError] = useState('');
  const [roomStats, setRoomStats] = useState<{ activeCount: number; limit: number } | null>(null);

  // Trạng thái Chatbox
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Trạng thái Modal Cài đặt đồ họa
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 1. Tải thông tin phòng triển lãm và các hiện vật
  useEffect(() => {
    setLoading(true);

    fetch('/api/galleries')
      .then((res) => res.json())
      .then((galleries: Gallery[]) => {
        const current = galleries.find(g => g.id === galleryId);
        if (current) {
          setActiveGallery(current);
          return fetch(`/api/exhibits?galleryId=${galleryId}`);
        } else {
          throw new Error('Không tìm thấy phòng trưng bày');
        }
      })
      .then((res) => res.json())
      .then((exhibitsData: Exhibit[]) => {
        setExhibits(exhibitsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(language === 'vi' ? 'Không thể tải phòng triển lãm.' : 'Failed to load gallery.');
        setLoading(false);
      });
  }, [galleryId, setActiveGallery, language]);

  // 2. Tự động truy vấn số lượng người online của riêng phòng này (4 giây một lần)
  useEffect(() => {
    if (nickname) return; // Nếu đã vào phòng rồi thì dừng fetch stats

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        const statsUrl = `${wsUrl.replace(/\/$/, '')}/stats?galleryId=${galleryId}`;

        const res = await fetch(statsUrl);
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setRoomStats(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Lỗi kết nối tải stats phòng triển lãm:', err.message);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [galleryId, nickname]);

  // 3. Lắng nghe các sự kiện Chat từ Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!chatOpen) setChatOpen(true);
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket, chatOpen]);

  // Tự động cuộn xuống cuối chatbox
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Gửi tin nhắn chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    const msgData = {
      text: chatInput.trim()
    };

    socket.emit('send-message', msgData);

    setChatMessages((prev) => [
      ...prev,
      {
        userId: 'me',
        nickname: nickname,
        text: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setChatInput('');
  };

  // Xác nhận tham gia phòng sau khi nhập biệt danh và mật khẩu
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      setInputError(language === 'vi' ? 'Vui lòng nhập biệt danh của bạn!' : 'Please enter your nickname!');
      return;
    }
    if (inputPassword !== 'sjkc21jdx2k23') {
      setInputError(language === 'vi' ? 'Mật khẩu phòng không chính xác!' : 'Incorrect room password!');
      return;
    }
    setInputError('');
    setNickname(inputNickname.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider animate-pulse uppercase">
          {language === 'vi' ? 'Đang chuẩn bị không gian 3D...' : 'Preparing 3D Space...'}
        </p>
      </div>
    );
  }

  if (error || !activeGallery) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200 p-6 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl max-w-md shadow-2xl">
          <h2 className="text-lg font-bold mb-2">⚠️ Lỗi không gian</h2>
          <p className="text-sm text-slate-400 mb-4">{error || 'Không tìm thấy phòng trưng bày này.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#725b29] text-white font-bold px-5 py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Quay về sảnh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0d] flex flex-col">

      {/* 1. LỚP CANVAS 3D TRẢI RỘNG TOÀN DIỆN TÍCH (Z-INDEX: 0) */}
      <div className="absolute inset-0 z-0">
        {!inQueue && (nickname ? isAdmitted : true) ? (
          <GalleryCanvas exhibits={exhibits} galleryId={activeGallery.id} />
        ) : (
          <div className="w-full h-full bg-[#0a0a0d] flex items-center justify-center">
            {/* Giữ chỗ trống khi chưa vào phòng để tối ưu hóa tài nguyên đồ họa */}
          </div>
        )}
      </div>

      {/* 2. THANH ĐIỀU KHIỂN TRÊN CÙNG (HEADER OVERLAY) */}
      {nickname && !inQueue && isAdmitted && (
        <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent p-4 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            {/* Nút quay lại */}
            <button
              onClick={leaveGallery}
              className="flex items-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-805 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
            >
              <ArrowLeft size={14} />
              {language === 'vi' ? 'Sảnh chính' : 'Lobby'}
            </button>

            {/* Tên phòng triển lãm */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-slate-900/50 py-1.5 px-4 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                {activeGallery.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Số lượng du khách trực tuyến */}
              <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 py-2.5 px-4 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                  <Users size={14} />
                  <span>{otherUsers.length + 1} {language === 'vi' ? 'Online' : 'Users'}</span>
                </div>
                <div className="w-px h-3 bg-slate-800" />
                <span className="text-[11px] text-slate-300 font-bold max-w-[80px] sm:max-w-[120px] truncate">
                  {nickname}
                </span>
              </div>

              {/* Nút Cài đặt Đồ họa */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
                title={language === 'vi' ? 'Cấu hình đồ họa' : 'Graphics Settings'}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 3. CHATBOX THỜI GIAN THỰC (MULTIPLAYER CHAT - Z-INDEX: 50) */}
      {nickname && !inQueue && isAdmitted && (
        <div className="absolute left-4 bottom-16 sm:bottom-20 z-40 flex flex-col pointer-events-auto max-w-[320px] sm:max-w-[350px]">
          {chatOpen ? (
            <div className="w-[300px] sm:w-[330px] h-[320px] bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
              {/* Header chatbox */}
              <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageSquare size={14} className="text-cyan-400" />
                  {language === 'vi' ? 'Trò chuyện phòng' : 'Gallery Chat'}
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
                >
                  [Ẩn]
                </button>
              </div>

              {/* Danh sách tin nhắn */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar text-xs">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-600 text-center py-8 italic">
                    {language === 'vi' ? 'Chưa có tin nhắn nào. Hãy gửi lời chào!' : 'No messages yet. Say hello!'}
                  </p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.userId === 'me' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-500 font-semibold mb-0.5 px-0.5">
                        {msg.nickname} <span className="text-[8px] font-normal font-mono opacity-80">{msg.timestamp}</span>
                      </span>
                      <div className={`px-3 py-1.8 rounded-2xl max-w-[85%] leading-relaxed ${msg.userId === 'me' ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input gửi tin */}
              <form onSubmit={handleSendChat} className="p-2 bg-slate-900/30 border-t border-slate-850 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={language === 'vi' ? 'Nhập tin nhắn...' : 'Type message...'}
                  maxLength={80}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 text-xs"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <SendHorizontal size={14} />
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
            >
              <MessageSquare size={16} className="text-cyan-400" />
              {language === 'vi' ? 'Trò chuyện' : 'Chat'}
              {chatMessages.length > 0 && (
                <span className="bg-cyan-500 text-slate-950 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {chatMessages.length}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* 4. MODAL THUYẾT MINH HIỆN VẬT (Z-INDEX: 50) */}
      {nickname && !inQueue && isAdmitted && <ExhibitModal />}
      {nickname && !inQueue && isAdmitted && <RoomFiveMissionHud />}
      {nickname && !inQueue && isAdmitted && <RoomOneSoundtrack />}
      {nickname && !inQueue && isAdmitted && miniGameOpen && <MiniGameModal />}

      {/* 5. MÀN HÌNH HÀNG CHỜ KHI PHÒNG ĐẦY (QUEUE OVERLAY) */}
      {nickname && inQueue && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          {/* Vòng sáng trang trí nền */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-slate-950/80 border border-slate-850 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative z-10">
            {/* Biểu tượng đồng hồ cát phát sáng */}
            <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20 animate-pulse relative">
              <span className="text-4xl">⏳</span>
              <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-35" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Hàng chờ trực tuyến' : 'Waiting Queue'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-2">
                {activeGallery.name}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                {language === 'vi'
                  ? 'Phòng triển lãm hiện đã đầy du khách (Tối đa 30 người). Vui lòng đợi trong giây lát.'
                  : 'The exhibition room is currently full (Max 30 visitors). Please wait a moment.'}
              </p>
            </div>

            {/* Hiển thị số thứ tự xếp hàng */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {language === 'vi' ? 'Vị trí của bạn trong hàng chờ' : 'Your position in line'}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-amber-400 mt-2 font-mono tracking-tight animate-bounce">
                #{queuePosition}
              </span>
              <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                {language === 'vi' ? 'Sẽ tự động chuyển vào khi có người rời đi' : 'Will auto-admit when someone leaves'}
              </span>
            </div>

            {/* Nút rời hàng chờ quay lại sảnh */}
            <button
              onClick={() => {
                setNickname(''); // Reset biệt danh
                setActiveGallery(null);
                router.push('/');
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              {language === 'vi' ? 'Rời hàng chờ & Về Sảnh chính' : 'Leave Queue & Return to Lobby'}
            </button>
          </div>
        </div>
      )}

      {/* 6. MÀN HÌNH ĐĂNG KÝ BIỆT DANH TẠI PHÒNG (NICKNAME PROMPT OVERLAY) */}
      {!nickname && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          {/* Vòng sáng trang trí nền */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#725b29]/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-slate-950/80 border border-slate-850 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative z-10">
            {/* Biểu tượng phòng */}
            <div className="w-20 h-20 bg-[#725b29]/10 text-[#725b29] rounded-full flex items-center justify-center border border-[#725b29]/20 relative">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] bg-[#725b29]/15 text-[#725b29] border border-[#725b29]/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Cổng tham quan' : 'Gallery Entrance'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-2">
                {activeGallery.name}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                {language === 'vi'
                  ? 'Vui lòng điền biệt danh của bạn để bắt đầu tham gia và đồng hành cùng các du khách khác.'
                  : 'Please enter your nickname to start visiting and companion with other visitors.'}
              </p>
            </div>

            {/* Form nhập biệt danh */}
            <form onSubmit={handleJoinSubmit} className="w-full space-y-4">
              <AvatarSelector value={outfitId} onChange={setOutfitId} />
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Biệt danh của bạn' : 'Your Nickname'}
                </label>
                <input
                  type="text"
                  value={inputNickname}
                  onChange={(e) => setInputNickname(e.target.value)}
                  placeholder={language === 'vi' ? 'Ví dụ: Nghệ Sĩ Trẻ...' : 'E.g., Explorer...'}
                  maxLength={20}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#725b29]/50 transition-colors text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Mật khẩu phòng' : 'Room Password'}
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder={language === 'vi' ? 'Nhập mật khẩu phòng...' : 'Enter room password...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#725b29]/50 transition-colors text-sm font-semibold"
                />
              </div>

              {/* Thống kê số người trong phòng hiện tại */}
              <div className="bg-slate-900/50 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between text-left text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {language === 'vi' ? 'Trạng thái phòng' : 'Room Status'}
                </span>
                {roomStats ? (
                  <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${roomStats.activeCount >= roomStats.limit ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {roomStats.activeCount} / {roomStats.limit} {language === 'vi' ? 'đang xem' : 'visitors'}
                  </span>
                ) : (
                  <span className="text-slate-500 animate-pulse text-[10px]">{language === 'vi' ? 'Đang tải...' : 'Connecting...'}</span>
                )}
              </div>

              {roomStats && roomStats.activeCount >= roomStats.limit && (
                <p className="text-[10px] text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-normal text-left">
                  ⚠️ {language === 'vi'
                    ? 'Phòng hiện đã đầy. Bạn sẽ xếp vào hàng chờ sau khi nhấn tham gia.'
                    : 'The room is full. You will enter a queue after joining.'}
                </p>
              )}

              {inputError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 py-1.8 rounded-lg border border-rose-500/20">
                  ⚠️ {inputError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveGallery(null);
                    router.push('/');
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={12} />
                  {language === 'vi' ? 'Quay về sảnh' : 'Back to Lobby'}
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <span>{language === 'vi' ? 'Tham quan' : 'Enter Gallery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MÀN HÌNH CÀI ĐẶT ĐỒ HỌA (GRAPHICS SETTINGS OVERLAY) */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-950/90 border border-slate-800/80 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 relative z-10 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings size={16} className="text-cyan-400 animate-spin-slow" />
                {language === 'vi' ? 'Cài đặt cấu hình' : 'Graphics Settings'}
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-500 hover:text-slate-350 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Presets Selection */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Mức cấu hình đề xuất' : 'Graphics Quality Preset'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['ultra-low', 'low', 'medium'] as const).map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => updatePreset(presetName)}
                      className={`text-[10px] font-black py-2.5 px-1 rounded-xl border transition-all cursor-pointer ${settings.preset === presetName ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'}`}
                    >
                      {presetName === 'ultra-low' && (language === 'vi' ? 'Siêu Thấp' : 'Ultra Low')}
                      {presetName === 'low' && (language === 'vi' ? 'Thấp' : 'Low')}
                      {presetName === 'medium' && (language === 'vi' ? 'Trung Bình' : 'Medium')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Max Visible Players */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
                  {language === 'vi' ? 'Giới hạn số lượng người chơi hiển thị' : 'Visible Players Limit'}
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {([0, 10, 30, 64, 99] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateSettings({ maxAvatars: count })}
                      className={`text-[10px] font-mono font-bold py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer ${
                        settings.maxAvatars === count 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-sm' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                      }`}
                    >
                      {count === 99 ? (language === 'vi' ? 'Tất cả' : 'All') : count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Description Card */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {language === 'vi' ? 'Chi tiết cấu hình' : 'Preset Details'}
                </span>

                <p className="text-[11px] text-slate-300 leading-relaxed min-h-[64px]">
                  {settings.preset === 'ultra-low' && (
                    language === 'vi'
                      ? '⚡ Tối ưu tối đa cho máy yếu. 🔦 Tắt toàn bộ đèn điểm (dùng đèn hướng). 📉 Độ phân giải cực thấp. 🚫 Ẩn tất cả người chơi khác. 🌫️ Sương mù gần hơn để giảm tải GPU.'
                      : '⚡ Maximum optimization for weak devices. 🔦 All point lights disabled (directional only). 📉 Ultra-low resolution. 🚫 Hide all other players. 🌫️ Closer fog for GPU relief.'
                  )}
                  {settings.preset === 'low' && (
                    language === 'vi'
                      ? '♟️ Hiển thị hình quân cờ đơn giản. 🔒 Tắt đổ bóng. 🚶 Tắt vung tay chân. 👥 Chỉ hiện tối đa 10 người. Đảm bảo hoạt động mượt mà tuyệt đối trên mọi máy yếu.'
                      : '♟️ Pawn mesh. 🔒 Shadows Off. 🚶 Animations Off. 👥 Max 10 players visible. Guaranteed absolute smoothness for low-end mobile/PC devices.'
                  )}
                  {settings.preset === 'medium' && (
                    language === 'vi'
                      ? '🚶 Hiển thị hình nhân di chuyển bình thường. ☀️ Bật đổ bóng động sắc nét. 🏃 Bật vung tay chân. 👥 Hiện đầy đủ người chơi. Trải nghiệm đồ họa sống động, mượt mà.'
                      : '🚶 Mannequin mesh. ☀️ Full Dynamic Shadows. 🏃 Limb animations On. 👥 Show all players. Premium and complete 3D interactive experience.'
                  )}
                </p>

                {/* Technical details list */}
                <div className="border-t border-slate-850 pt-2.5 space-y-1.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Bóng đổ (Shadows):' : 'Shadows:'}</span>
                    <span className={settings.shadows ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.shadows ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Cử động nhân vật (Animations):' : 'Limb Animations:'}</span>
                    <span className={settings.animations ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.animations ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Số người tối đa hiển thị (Max CCU):' : 'Max Displayed Users:'}</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {settings.maxAvatars === 99 ? (language === 'vi' ? 'Không giới hạn' : 'Unlimited') : `${settings.maxAvatars}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
