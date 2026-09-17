'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import {
  FileText,
  Award,
  Loader2,
  X,
  CheckCircle2,
  GripVertical,
  BookOpen,
  Lightbulb,
  Sparkles,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Clock,
  Check,
  Compass
} from 'lucide-react';
import { ROOM_THREE_DISPLAY_NAME } from '@/lib/roomThreeNarrative';

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu sự kiện — Game Session 1: Ghép thứ tự thời gian
// ─────────────────────────────────────────────────────────────────────────────
interface HistoryEvent {
  id: string;
  icon: string;
  title: string;
  shortDesc: string;
  hint: string;
  correctOrder: number; // 1-indexed
}

const HISTORY_EVENTS: HistoryEvent[] = [
  {
    id: 'ev1',
    icon: '🚢',
    title: 'Nguyễn Ái Quốc từ Xiêm La (Thái Lan) sang Hồng Kông chuẩn bị hội nghị',
    shortDesc: 'Cuối năm 1929, Người bí mật vượt biển sang Hồng Kông với tư cách đại diện Quốc tế Cộng sản.',
    hint: 'Sự kiện đầu tiên: Nguyễn Ái Quốc phải bí mật rời Xiêm sang Hồng Kông trước tiên thì mới có thể tổ chức hội nghị.',
    correctOrder: 1,
  },
  {
    id: 'ev2',
    icon: '📜',
    title: 'Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn được triệu tập đến họp',
    shortDesc: 'Chủ động gửi thư triệu tập đại biểu các tổ chức cộng sản trong nước sang họp bàn việc thống nhất.',
    hint: 'Sự kiện thứ 2: Sau khi tới Hồng Kông, Người triệu tập đại diện của các tổ chức cộng sản đang hoạt động riêng rẽ.',
    correctOrder: 2,
  },
  {
    id: 'ev3',
    icon: '🏛️',
    title: 'Hội nghị hợp nhất khai mạc tại Cửu Long, Hồng Kông (3/2/1930)',
    shortDesc: 'Khai mạc tại một căn phòng nhỏ ở bán đảo Cửu Long dưới sự chủ trì trực tiếp của Nguyễn Ái Quốc.',
    hint: 'Sự kiện thứ 3: Ngày 3/2/1930, Hội nghị hợp nhất chính thức khai mạc tại bán đảo Cửu Long.',
    correctOrder: 3,
  },
  {
    id: 'ev4',
    icon: '🔨',
    title: 'Thông qua Cương lĩnh chính trị đầu tiên của Đảng',
    shortDesc: 'Thông qua Chính cương vắn tắt, Sách lược vắn tắt do Nguyễn Ái Quốc khởi thảo.',
    hint: 'Sự kiện thứ 4: Ngay sau khi khai mạc, văn kiện quan trọng nhất được thông qua là Cương lĩnh chính trị đầu tiên.',
    correctOrder: 4,
  },
  {
    id: 'ev5',
    icon: '✍️',
    title: 'Thông qua Điều lệ Đảng và các văn kiện quan trọng',
    shortDesc: 'Quy định cơ cấu tổ chức, nguyên tắc tập trung dân chủ và điều lệ sinh hoạt Đảng.',
    hint: 'Sự kiện thứ 5: Sau Cương lĩnh chính trị, Hội nghị tiếp tục thông qua Điều lệ Đảng và các điều lệ đoàn thể.',
    correctOrder: 5,
  },
  {
    id: 'ev6',
    icon: '🎉',
    title: 'Đặt tên chính thức: Đảng Cộng sản Việt Nam',
    shortDesc: 'Bác bỏ các tên gọi phân tán, nhất trí đặt tên là Đảng Cộng sản Việt Nam theo đề nghị của Nguyễn Ái Quốc.',
    hint: 'Sự kiện thứ 6: Hội nghị đi đến thống nhất lịch sử về tên gọi chính thức là Đảng Cộng sản Việt Nam.',
    correctOrder: 6,
  },
  {
    id: 'ev7',
    icon: '📢',
    title: 'Nguyễn Ái Quốc đọc "Lời kêu gọi" nhân dịp thành lập Đảng',
    shortDesc: 'Kêu gọi công nhân, nông dân, binh lính và đồng bào yêu nước đoàn kết dưới ngọn cờ của Đảng.',
    hint: 'Sự kiện thứ 7: Sau khi hoàn thành các quyết sách, Người ra Lời kêu gọi gửi toàn thể đồng bào chiến sĩ cả nước.',
    correctOrder: 7,
  },
  {
    id: 'ev8',
    icon: '🌟',
    title: 'Đảng CSVN trở thành chính đảng duy nhất lãnh đạo cách mạng Việt Nam',
    shortDesc: 'Chấm dứt hoàn toàn cuộc khủng hoảng về đường lối cứu nước kéo dài hơn 2/3 thế kỷ.',
    hint: 'Sự kiện thứ 8 (Kết quả): Đánh dấu bước ngoặt vĩ đại, Đảng trở thành chính đảng duy nhất dẫn dắt cách mạng.',
    correctOrder: 8,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT CHÍNH
// ─────────────────────────────────────────────────────────────────────────────
export const RoomTwoDocumentModal: React.FC = () => {
  const {
    roomTwoSessionState,
    roomTwoDocOpen,
    setRoomTwoDocOpen,
    roomTwoScore,
    roomTwoScore2,
    roomTwoScore3,
    roomTwoScore4,
    nickname,
    socket,
  } = useMuseum();

  // Tab điều hướng: 'study' (Xem tài liệu) hoặc 'game' (Làm bài tập/ghép dòng thời gian)
  const [activeTab, setActiveTab] = useState<'study' | 'game'>('study');

  const [submitting, setSubmitting] = useState<boolean>(false);

  // ── Session 1: Drag & Drop thứ tự sự kiện ────────────────────────────────
  const [orderedIds, setOrderedIds] = useState<string[]>(
    () => [...HISTORY_EVENTS].sort(() => Math.random() - 0.5).map((e) => e.id)
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Gợi ý (Hints)
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Tự động mở tab 'game' nếu đã nộp bài session 1
  useEffect(() => {
    if (roomTwoScore !== null) {
      setActiveTab('game');
    }
  }, [roomTwoScore]);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggedId) setDragOverId(id);
    },
    [draggedId]
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      setOrderedIds((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(draggedId);
        const toIdx = next.indexOf(targetId);
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, draggedId);
        return next;
      });
      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId]
  );

  // Di chuyển lên / xuống bằng nút
  const moveItem = (id: string, dir: -1 | 1) => {
    setOrderedIds((prev) => {
      const next = [...prev];
      const idx = next.indexOf(id);
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Tính số lượng thẻ khớp đúng vị trí hiện tại
  const countCorrect = () => {
    let count = 0;
    orderedIds.forEach((id, idx) => {
      const ev = HISTORY_EVENTS.find((e) => e.id === id);
      if (ev && ev.correctOrder === idx + 1) count++;
    });
    return count;
  };

  const calcS1Score = () => {
    const correct = countCorrect();
    // Thang điểm: mỗi đúng +1.25 → max 10
    return Math.round(correct * 1.25 * 10) / 10;
  };

  // Xử lý khi nhấn nút "Nhận Gợi Ý"
  const handleUseHint = () => {
    if (hintsUsed >= 3) return;

    // Tìm sự kiện đầu tiên chưa ở đúng vị trí
    let targetEvent: HistoryEvent | null = null;
    let targetIndex = -1;

    for (let i = 0; i < HISTORY_EVENTS.length; i++) {
      const expectedEvent = HISTORY_EVENTS[i]; // Sự kiện cần ở vị trí index i (correctOrder = i + 1)
      if (orderedIds[i] !== expectedEvent.id) {
        targetEvent = expectedEvent;
        targetIndex = i;
        break;
      }
    }

    if (targetEvent && targetIndex !== -1) {
      // Hoán đổi vị trí thẻ đó về đúng chỗ
      setOrderedIds((prev) => {
        const next = [...prev];
        const currentIndex = next.indexOf(targetEvent!.id);
        if (currentIndex !== -1) {
          next.splice(currentIndex, 1);
          next.splice(targetIndex, 0, targetEvent!.id);
        }
        return next;
      });

      setHintsUsed((prev) => prev + 1);
      setHintMessage(targetEvent.hint);
      setHighlightedId(targetEvent.id);

      // Tự tắt highlight sau 3.5 giây
      setTimeout(() => {
        setHighlightedId(null);
      }, 3500);
    } else {
      setHintMessage('🎉 Tuyệt vời! Tất cả các sự kiện hiện tại đều đã ở đúng thứ tự!');
    }
  };

  // Reset xáo trộn lại từ đầu
  const handleResetOrder = () => {
    setOrderedIds([...HISTORY_EVENTS].sort(() => Math.random() - 0.5).map((e) => e.id));
    setHintMessage(null);
  };

  const handleS1Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    const score = calcS1Score();
    socket.emit('room2:submit-score', { session: 1, value: score });
    setTimeout(() => setSubmitting(false), 800);
  };

  // ── Session 2: Xác nhận đơn giản ────────────────────────────────────────
  const handleS2Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 2, value: 10 });
    setTimeout(() => setSubmitting(false), 800);
  };

  // ── Sessions 3 & 4: Giữ nguyên socket nhưng nộp score mặc định ──────────
  const handleS3Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 3, value: 'C', selectedPolicies: [] });
    setTimeout(() => setSubmitting(false), 800);
  };
  const handleS4Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 4, value: '3', selectedPolicies: [] });
    setTimeout(() => setSubmitting(false), 800);
  };

  if (!roomTwoDocOpen) return null;

  const correctMatches = countCorrect();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => setRoomTwoDocOpen(false)}
      />

      {/* Panel chính */}
      <div
        className="relative w-[min(96vw,1080px)] max-h-[92vh] bg-[#fdfaf2] border-4 border-[#8B0000] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up font-sans transition-all duration-300"
      >
        {/* Góc trang trí mạ vàng cổ kính */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl pointer-events-none z-10" />

        {/* ════════════════════════════════════════════
            HEADER CỦA MODAL
        ════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-[#7a0000] via-[#8B0000] to-[#5e0000] text-[#fdfaf2] px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center justify-center shadow-inner">
              <FileText size={20} className="text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-amber-300 uppercase font-black flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Hội nghị Thành lập Đảng Cộng sản Việt Nam — 3/2/1930
              </p>
              <h2 className="text-base sm:text-lg font-bold leading-tight uppercase font-serif mt-0.5 tracking-wide text-white drop-shadow-sm">
                Tài Liệu Lịch Sử & Thử Thách Đại Biểu
              </h2>
            </div>
          </div>

          {/* Tab Switcher: Xem tư liệu vs Chơi game */}
          {(roomTwoSessionState === 'waiting' || roomTwoSessionState === 'session1') && (
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-amber-400/30 shadow-inner">
              <button
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'study'
                    ? 'bg-amber-400 text-slate-900 shadow-md scale-[1.02]'
                    : 'text-amber-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen size={14} />
                <span>1. Xem Tư Liệu</span>
              </button>

              <button
                onClick={() => setActiveTab('game')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === 'game'
                    ? 'bg-amber-400 text-slate-900 shadow-md scale-[1.02]'
                    : 'text-amber-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles size={14} />
                <span>2. Thử Thách Ghép Sự Kiện</span>
                {roomTwoSessionState === 'session1' && roomTwoScore === null && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5"></span>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => setRoomTwoDocOpen(false)}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Đóng tài liệu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ════════════════════════════════════════════
            BODY CỦA MODAL
        ════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 space-y-6">

          {/* ════════════════════════════════════════════
              TAB 1: TƯ LIỆU HỘI NGHỊ (HỌC & GHI NHỚ TRƯỚC)
          ════════════════════════════════════════════ */}
          {activeTab === 'study' && (
            <div className="animate-fade-in space-y-6">
              
              {/* Banner giới thiệu */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#8B0000] via-[#700000] to-[#520000] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-amber-500/40">
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 font-serif select-none pointer-events-none">
                  🏛️
                </div>
                <div className="relative z-10 max-w-3xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 uppercase tracking-wider">
                    🌟 Cẩm nang Lịch sử dành cho Đại biểu
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                    Bối cảnh & Diễn biến Hội nghị Hợp nhất 3/2/1930
                  </h3>
                  <p className="text-xs sm:text-[13px] text-amber-100/90 leading-relaxed">
                    Hãy đọc kỹ các mốc tư liệu dưới đây để nắm trọn vẹn diễn biến lịch sử trước khi bước vào phần thử thách ghép nối dòng thời gian.
                  </p>
                </div>
              </div>

              {/* Bối cảnh lịch sử tóm tắt */}
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Compass size={16} className="text-amber-700" />
                  <span>Bối cảnh trước thềm Hội nghị</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                  Vào cuối năm 1929, phong trào cách mạng Việt Nam phát triển mạnh mẽ dẫn đến sự ra đời của <strong>3 tổ chức cộng sản</strong> riêng rẽ: <em>Đông Dương Cộng sản Đảng</em>, <em>An Nam Cộng sản Đảng</em> và <em>Đông Dương Cộng sản Liên đoàn</em>. Tuy nhiên, sự hoạt động thiếu thống nhất đã làm nảy sinh nguy cơ chia rẽ. Trước tình hình cấp bách đó, đồng chí <strong>Nguyễn Ái Quốc</strong> với tư cách là phái viên của Quốc tế Cộng sản đã chủ động sang Hồng Kông để hợp nhất các tổ chức thành một Đảng duy nhất.
                </p>
              </div>

              {/* 8 Mốc Diễn Biến Cốt Lõi (Timeline trực quan) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#8B0000] uppercase font-serif tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    8 Mốc Diễn Biến Hội Nghị Theo Thứ Tự Thời Gian
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">Chuỗi 8 sự kiện cốt lõi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HISTORY_EVENTS.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3.5 border-2 border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B0000] to-[#5a0000] text-amber-300 font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{item.icon}</span>
                          <h5 className="text-xs font-bold text-slate-800 leading-snug">
                            {item.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {item.shortDesc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mẹo ghi nhớ nhanh */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb size={16} className="text-emerald-700" />
                  <span>Mẹo ghi nhớ nhanh để đạt 10/10 điểm:</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>Khởi đầu:</strong> Rời Xiêm sang Hồng Kông $\rightarrow$ Triệu tập đại biểu $\rightarrow$ Khai mạc ngày 3/2/1930.</li>
                  <li><strong>Văn kiện:</strong> Thông qua Cương lĩnh chính trị đầu tiên $\rightarrow$ Thông qua Điều lệ Đảng.</li>
                  <li><strong>Kết quả:</strong> Thống nhất đặt tên <em>Đảng Cộng sản Việt Nam</em> $\rightarrow$ Bác đọc Lời kêu gọi $\rightarrow$ Trở thành chính đảng duy nhất lãnh đạo cách mạng.</li>
                </ul>
              </div>

              {/* Nút chuyển sang làm bài tập */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setActiveTab('game')}
                  className="px-8 py-4 bg-gradient-to-r from-[#8B0000] via-[#a31515] to-[#8B0000] hover:from-[#700000] hover:to-[#5e0000] text-amber-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center gap-3 cursor-pointer border border-amber-400/40"
                >
                  <Sparkles size={18} className="text-amber-300 animate-spin" />
                  <span>Tôi đã sẵn sàng — Bắt đầu Thử Thách Ghép Sự Kiện</span>
                  <ArrowRight size={18} />
                </button>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB 2: GAME SESSION 1 (HOẶC CÁC PHIÊN TIẾP THEO)
          ════════════════════════════════════════════ */}
          {activeTab === 'game' && (
            <>
              {/* ════════════════════════════════════════════
                  TRẠNG THÁI: CHỜ KHAI MẠC (WAITING)
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'waiting' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-6 animate-fade-in">
                  <div className="relative">
                    <div className="w-20 h-20 bg-amber-50 border-2 border-amber-300/60 rounded-full flex items-center justify-center shadow-md text-3xl">
                      🏛️
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                      <span className="text-white text-[10px] font-black">!</span>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-md">
                    <h3 className="text-lg font-bold text-[#8B0000] uppercase font-serif tracking-wider">
                      Hội nghị chưa khai mạc
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam tại Cửu Long (Hồng Kông)
                      chưa được khai mạc bởi Ban Chủ tọa.
                    </p>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-inner space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đại biểu đã đăng ký:</p>
                        <p className="text-base font-black text-amber-800 font-mono mt-0.5">
                          🪪 {nickname || 'Chưa đăng ký'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-2.5 border border-amber-200/50">
                        <p className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1.5">
                          <Loader2 size={12} className="animate-spin" />
                          Đang chờ Nguyễn Ái Quốc khai mạc hội nghị...
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('study')}
                        className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer transition-colors border border-amber-300"
                      >
                        <BookOpen size={14} />
                        <span>Đọc trước tài liệu tư liệu lịch sử</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════
                  SESSION 1 — Ghép sự kiện theo thứ tự thời gian
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'session1' && (
                roomTwoScore === null ? (
                  <div className="animate-fade-in flex flex-col lg:flex-row gap-5">

                    {/* Cột trái — Bảng điều khiển & Hướng dẫn & Gợi ý */}
                    <div className="lg:w-[330px] shrink-0 space-y-4">
                      
                      {/* Thẻ nhiệm vụ */}
                      <div className="bg-[#8B0000] text-white p-4 rounded-2xl shadow-md border border-amber-400/30">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-1.5">
                          <Clock size={14} />
                          Nhiệm vụ: Sắp xếp dòng thời gian
                        </h4>
                        <p className="text-[11px] text-amber-100/90 leading-relaxed">
                          Kéo-thả (hoặc dùng nút ▲ ▼) để sắp xếp 8 sự kiện theo <strong>đúng thứ tự diễn ra</strong> của Hội nghị 3/2/1930.
                        </p>
                      </div>

                      {/* Tiến độ khớp sự kiện thời gian thực */}
                      <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">Tiến độ sắp xếp:</span>
                          <span className="text-xs font-black text-amber-700 font-mono">
                            {correctMatches}/8 Sự kiện đúng
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${(correctMatches / 8) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Hộp công cụ trợ giúp: Gợi ý & Xem lại tài liệu */}
                      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb size={14} className="text-amber-600" />
                            Trợ Giúp Đại Biểu
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                            Gợi ý: {3 - hintsUsed}/3
                          </span>
                        </div>

                        {/* Nút nhận gợi ý */}
                        <button
                          onClick={handleUseHint}
                          disabled={hintsUsed >= 3}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Lightbulb size={14} />
                          <span>{hintsUsed >= 3 ? 'Đã hết lượt gợi ý' : '💡 Nhận Gợi Ý (+Tự xếp 1 thẻ)'}</span>
                        </button>

                        <div className="flex gap-2">
                          {/* Nút xem lại tài liệu */}
                          <button
                            onClick={() => setActiveTab('study')}
                            className="flex-1 py-2 px-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <BookOpen size={13} className="text-amber-600" />
                            <span>Đọc lại tư liệu</span>
                          </button>

                          {/* Nút xáo trộn lại */}
                          <button
                            onClick={handleResetOrder}
                            className="py-2 px-2.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] rounded-xl border border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                            title="Xáo trộn lại danh sách"
                          >
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Hiển thị câu gợi ý nếu có */}
                      {hintMessage && (
                        <div className="bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-3.5 shadow-md animate-fade-in space-y-1.5 relative">
                          <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px] uppercase">
                            <Sparkles size={13} className="text-amber-600" />
                            <span>Manh mối lịch sử:</span>
                          </div>
                          <p className="text-[11px] text-amber-950 leading-relaxed font-medium">
                            {hintMessage}
                          </p>
                        </div>
                      )}

                      {/* Bảng điểm dự kiến */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1.5 text-[10px]">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-600">8/8 đúng thứ tự:</span>
                          <span className="font-black text-emerald-600">10 điểm (Tuyệt đối)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-600">6–7 sự kiện đúng:</span>
                          <span className="font-black text-blue-600">7.5 – 8.75 điểm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dưới 4 sự kiện:</span>
                          <span className="font-black text-red-600">&lt; 5 điểm</span>
                        </div>
                      </div>

                      {/* Nút nộp bài */}
                      <button
                        onClick={handleS1Submit}
                        disabled={submitting}
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-[#8B0000] to-[#5a0000] hover:from-[#700000] hover:to-[#440000] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : '📝 Nộp kết quả sắp xếp'}
                      </button>
                    </div>

                    {/* Cột phải — Danh sách thẻ kéo thả tương tác */}
                    <div className="flex-1 space-y-2">
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl px-3 py-2 text-[11px] text-slate-600 text-center flex items-center justify-center gap-2">
                        <GripVertical size={14} className="text-slate-400" />
                        <span>Kéo-thả thẻ để thay đổi vị trí, hoặc nhấn nút ▲ ▼ ở bên phải mỗi thẻ</span>
                      </div>

                      {orderedIds.map((id, idx) => {
                        const ev = HISTORY_EVENTS.find((e) => e.id === id)!;
                        const isDragging = draggedId === id;
                        const isOver = dragOverId === id;
                        const isCorrectSlot = ev.correctOrder === idx + 1;
                        const isHighlighted = highlightedId === id;

                        return (
                          <div
                            key={id}
                            draggable
                            onDragStart={() => handleDragStart(id)}
                            onDragOver={(e) => handleDragOver(e, id)}
                            onDrop={() => handleDrop(id)}
                            onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                              isHighlighted
                                ? 'border-amber-500 bg-amber-100/90 shadow-lg scale-[1.02] ring-4 ring-amber-300/60'
                                : isDragging
                                ? 'opacity-40 scale-[0.98] border-amber-400 bg-amber-50'
                                : isOver
                                ? 'border-[#8B0000] bg-red-50 scale-[1.01] shadow-md'
                                : isCorrectSlot
                                ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-400 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm'
                            }`}
                          >
                            {/* Số thứ tự */}
                            <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-sm ${
                              isCorrectSlot ? 'bg-emerald-600 text-white' : 'bg-[#8B0000] text-white'
                            }`}>
                              {idx + 1}
                            </div>

                            {/* Tay cầm kéo thả */}
                            <GripVertical size={16} className="text-slate-300 shrink-0" />

                            {/* Icon sự kiện */}
                            <span className="text-xl shrink-0">{ev.icon}</span>

                            {/* Nội dung sự kiện & trạng thái */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-slate-800 leading-snug">
                                {ev.title}
                              </p>
                              {isCorrectSlot && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                                  <Check size={12} />
                                  Khớp mốc thời gian
                                </span>
                              )}
                            </div>

                            {/* Nút di chuyển lên / xuống */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                onClick={() => moveItem(id, -1)}
                                disabled={idx === 0}
                                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 text-[10px] disabled:opacity-20 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title="Đưa lên trên"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveItem(id, 1)}
                                disabled={idx === orderedIds.length - 1}
                                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 text-[10px] disabled:opacity-20 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title="Đưa xuống dưới"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Đã nộp bài Session 1 */
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                    <CheckCircle2 size={52} className="text-emerald-600 animate-pulse" />
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-[#5c3d1a] uppercase font-serif">Đã nộp kết quả sắp xếp!</h3>
                      <p className="text-xs text-slate-500">Bạn đã hoàn thành thử thách sắp xếp dòng thời gian Hội nghị 3/2/1930.</p>
                    </div>
                    <div className="bg-[#f0fdf4] border-2 border-emerald-300 rounded-3xl p-6 shadow-lg max-w-xs mx-auto">
                      <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM SẮP XẾP SỰ KIỆN</span>
                      <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore}đ</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin text-amber-600" />
                      <span>Vui lòng chờ Ban Chủ tọa kích hoạt phiên tiếp theo...</span>
                    </div>
                  </div>
                )
              )}

              {/* ════════════════════════════════════════════
                  SESSION 2 — Xác nhận tham dự phiên thảo luận
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'session2' && (
                roomTwoScore2 === null ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-fade-in">
                    <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center text-3xl shadow-md">📜</div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-lg font-bold text-[#8B0000] uppercase font-serif">Phiên thông qua Cương lĩnh Chính trị</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Hội nghị đang tiến hành thông qua <strong>Cương lĩnh chính trị đầu tiên</strong> và <strong>Điều lệ Đảng</strong> do Nguyễn Ái Quốc khởi thảo. Vui lòng giữ trật tự và chú ý lắng nghe.
                      </p>
                    </div>
                    <button
                      onClick={handleS2Submit}
                      disabled={submitting}
                      className="px-8 py-3.5 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-400/30"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : '✅ Xác nhận đã nghe bài phát biểu'}
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                    <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                    <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành phiên 2</h3>
                    <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                      <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN 2</span>
                      <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore2}đ</span>
                    </div>
                    <p className="text-xs text-slate-500">Chờ phiên tiếp theo từ Chủ tọa.</p>
                  </div>
                )
              )}

              {/* ════════════════════════════════════════════
                  SESSION 3 — Thảo luận Cương lĩnh
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'session3' && (
                roomTwoScore3 === null ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-fade-in">
                    <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center text-3xl shadow-md">🔖</div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-lg font-bold text-[#8B0000] uppercase font-serif">Phiên thảo luận ý nghĩa Cương lĩnh 1930</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Phiên thảo luận về ý nghĩa lịch sử của Cương lĩnh chính trị đầu tiên. Cương lĩnh đã vạch rõ con đường: tiến hành cách mạng tư sản dân quyền và thổ địa cách mạng để đi tới xã hội cộng sản.
                      </p>
                    </div>
                    <button
                      onClick={handleS3Submit}
                      disabled={submitting}
                      className="px-8 py-3.5 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-400/30"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : '✅ Xác nhận tham dự thảo luận'}
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                    <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                    <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành phiên 3</h3>
                    <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                      <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN 3</span>
                      <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore3}đ</span>
                    </div>
                    <p className="text-xs text-slate-500">Chờ phiên bế mạc.</p>
                  </div>
                )
              )}

              {/* ════════════════════════════════════════════
                  SESSION 4 — Kết thúc Hội nghị & Lời kêu gọi
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'session4' && (
                roomTwoScore4 === null ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-fade-in">
                    <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center text-3xl shadow-md">🗳️</div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-lg font-bold text-[#8B0000] uppercase font-serif">Phiên bế mạc Hội nghị</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tuyên bố thành lập Đảng Cộng sản Việt Nam và Nguyễn Ái Quốc đọc "Lời kêu gọi" nhân dịp thành lập Đảng gửi toàn thể nhân dân cả nước.
                      </p>
                    </div>
                    <button
                      onClick={handleS4Submit}
                      disabled={submitting}
                      className="px-8 py-3.5 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-400/30"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : '🎉 Xác nhận tham dự bế mạc'}
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                    <Award size={48} className="text-amber-500 animate-bounce" />
                    <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành Hội nghị!</h3>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                      <span className="text-[10px] text-amber-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN BẾ MẠC</span>
                      <span className="text-4xl font-black text-amber-700 font-mono block mt-1">+{roomTwoScore4}đ</span>
                    </div>
                    <p className="text-xs text-slate-500 italic max-w-sm">
                      "Đảng Cộng sản Việt Nam được thành lập — một bước ngoặt vĩ đại trong lịch sử cách mạng Việt Nam."
                    </p>
                  </div>
                )
              )}

              {/* ════════════════════════════════════════════
                  COMPLETED — Hoàn thành toàn bộ
              ════════════════════════════════════════════ */}
              {roomTwoSessionState === 'completed' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10 animate-scale-up">
                  <div className="text-5xl animate-bounce">🏆</div>
                  <h3 className="text-xl font-bold text-[#8B0000] uppercase font-serif tracking-wider">
                    Bạn đã hoàn thành toàn bộ Hội nghị!
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                    {[
                      { label: 'Sắp xếp sự kiện', score: roomTwoScore },
                      { label: 'Thông qua CL', score: roomTwoScore2 },
                      { label: 'Thảo luận', score: roomTwoScore3 },
                      { label: 'Bế mạc HN', score: roomTwoScore4 },
                    ].map((s, i) => (
                      <div key={i} className="bg-white border-2 border-amber-200 rounded-2xl p-3 shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{s.label}</span>
                        <span className="text-2xl font-black text-[#8B0000] font-mono block">+{s.score ?? 0}đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#8B0000] text-white rounded-2xl px-6 py-3 shadow-md border border-amber-400/30">
                    <span className="text-[11px] uppercase tracking-wider block text-amber-300">Tổng điểm tích lũy phòng 5</span>
                    <span className="text-3xl font-black font-mono">
                      {((roomTwoScore ?? 0) + (roomTwoScore2 ?? 0) + (roomTwoScore3 ?? 0) + (roomTwoScore4 ?? 0)).toFixed(1)}đ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic max-w-xs">
                    Cảm ơn bạn đã tham gia tái hiện Hội nghị thành lập Đảng Cộng sản Việt Nam, 3 tháng 2 năm 1930.
                  </p>
                  <p className="text-xs text-slate-500">
                    Vui lòng đóng bảng tài liệu, đứng dậy (phím F) và sẵn sàng đi tiếp sang {ROOM_THREE_DISPLAY_NAME}!
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
