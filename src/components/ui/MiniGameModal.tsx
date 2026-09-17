import React, { useState } from 'react';
import { X, Star, Handshake, Compass, Briefcase, Globe, Heart, RotateCcw, Trophy, AlertTriangle, GripVertical, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { useMuseum } from '@/context/MuseumContext';

const CARD_TEMPLATES = [
  { iconId: 1, Icon: Star, color: '#fbbf24' },
  { iconId: 2, Icon: Heart, color: '#ec4899' },
  { iconId: 3, Icon: Compass, color: '#10b981' },
  { iconId: 4, Icon: Handshake, color: '#3b82f6' },
  { iconId: 5, Icon: Briefcase, color: '#a855f7' },
  { iconId: 6, Icon: Globe, color: '#06b6d4' }
];

export const MiniGameModal: React.FC = () => {
  const {
    miniGameOpen,
    setMiniGameOpen,
    language,
    leaderboard,
    gameState,
    orderedEvents,
    score,
    timeLeft,
    lastCheckResults,
    initializeGame,
    swapEvents,
    checkOrder
  } = useMuseum();

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  if (!miniGameOpen) return null;

  const getTemplate = (iconId: number) => {
    return CARD_TEMPLATES.find((t) => t.iconId === iconId) || CARD_TEMPLATES[0];
  };

  // Trình xử lý kéo thả (Drag and Drop)
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (gameState !== 'playing') return;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      swapEvents(draggedIdx, idx);
    }
    setDraggedIdx(null);
  };

  // Trình xử lý click-to-swap (Dành cho Mobile/Tablet)
  const handleItemClick = (idx: number) => {
    if (gameState !== 'playing') return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      if (selectedIdx !== idx) {
        swapEvents(selectedIdx, idx);
      }
      setSelectedIdx(null);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none pointer-events-auto">
      <div className="w-full max-w-[1100px] bg-slate-950/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative flex flex-col gap-5 md:gap-6 overflow-hidden">
        
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3.5 z-10">
          <div>
            <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">
              {language === 'vi' ? 'DÒNG CHẢY LỊCH SỬ' : 'HISTORY FLOW'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold tracking-wider uppercase">
              {language === 'vi' ? 'Sắp xếp thứ tự thời gian' : 'Chronological sorting'}
            </p>
          </div>
          <button
            onClick={() => setMiniGameOpen(false)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-3 rounded-full border border-slate-800 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* BỐ CỤC CHƠI GAME: 2 CỘT SONG SONG */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch z-10 max-h-[75vh] md:max-h-none overflow-y-auto md:overflow-y-visible pr-1">
            
            {/* Cột trái: Danh sách sự kiện kéo thả (Chiếm 7/12 chiều rộng) */}
            <div className="md:col-span-7 flex flex-col justify-center gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase px-4 pb-1.5 border-b border-slate-900">
                <span>{language === 'vi' ? 'Sự kiện lịch sử' : 'Historical Event'}</span>
                <span>{language === 'vi' ? 'Thứ tự (Sớm → Muộn)' : 'Timeline (Old → New)'}</span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-none md:max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
                {orderedEvents.map((event, idx) => {
                  const template = getTemplate(event.iconId);
                  const IconComponent = template.Icon;
                  const isSelected = selectedIdx === idx;
                  
                  // Kiểm tra kết quả check trước đó
                  const isChecked = lastCheckResults !== null;
                  const isCorrect = isChecked && lastCheckResults[idx];

                  let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
                  if (isSelected) {
                    borderClass = 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500';
                  } else if (isChecked) {
                    borderClass = isCorrect 
                      ? 'border-emerald-500/40 bg-emerald-950/15 shadow-sm shadow-emerald-500/5' 
                      : 'border-rose-500/40 bg-rose-950/15 shadow-sm shadow-rose-500/5';
                  }

                  return (
                    <div
                      key={event.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onClick={() => handleItemClick(idx)}
                      className={`flex items-center justify-between py-1.5 px-4 border rounded-xl cursor-grab active:cursor-grabbing transition-all ${borderClass}`}
                    >
                      {/* Tiêu đề & Icon */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="text-slate-500 cursor-move pr-1">
                          <GripVertical size={20} />
                        </div>
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${template.color}15` }}>
                          <IconComponent size={22} color={template.color} />
                        </div>
                        <span className="text-sm text-slate-200 font-bold truncate pr-3">
                          {language === 'vi' ? event.titleVi : event.titleEn}
                        </span>
                      </div>

                      {/* Trạng thái xác minh */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isChecked && (
                          isCorrect ? (
                            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="text-xs font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 flex items-center gap-1.5">
                              <AlertCircle size={12} /> ?
                            </span>
                          )
                        )}
                        <span className="font-mono text-slate-400 text-xs font-black bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-900">
                          #{idx + 1}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải: Bảng thông tin & Luật chơi (Chiếm 5/12 chiều rộng) */}
            <div className="md:col-span-5 flex flex-col justify-between bg-slate-900/40 border border-slate-900/80 p-5 rounded-2xl gap-4">
              
              {/* Stats Dashboard */}
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {language === 'vi' ? 'Thời gian làm bài' : 'Time Spent'}
                  </span>
                  <span className="font-mono text-2xl font-black tracking-tight text-slate-200">
                    {180 - timeLeft}s
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {language === 'vi' ? 'Điểm số' : 'Score'}
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-400 tracking-tight">
                    {score}
                  </span>
                </div>
              </div>

              {/* Hướng dẫn/Luật chơi */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850/50 text-[11px] text-slate-400 space-y-2">
                <span className="font-bold text-cyan-400 uppercase block tracking-wider">
                  💡 {language === 'vi' ? 'LUẬT CHƠI TIẾN TRÌNH' : 'HOW TO PLAY'}
                </span>
                <p className="leading-relaxed text-slate-300">
                  {language === 'vi'
                    ? 'Kéo thả hoặc nhấn chọn lần lượt 2 ô để tráo đổi vị trí sao cho các sự kiện được xếp từ sớm nhất (trên cùng) đến muộn nhất (dưới cùng). Nhấn nút phía dưới để kết thúc và tính điểm.'
                    : 'Drag & drop or click 2 cards to swap. Order events from earliest (top) to latest (bottom). Click the button below to finish and calculate score.'}
                </p>
              </div>

              {/* Nút xác nhận kiểm tra */}
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
              >
                <Check size={16} strokeWidth={3} />
                {language === 'vi' ? 'XÁC NHẬN SẮP XẾP' : 'VERIFY TIMELINE'}
              </button>

            </div>

          </div>
        )}

        {/* Win Screen (Bố cục 2 cột rộng) */}
        {gameState === 'won' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-center z-10 py-2">
            
            {/* Cột trái: Thông báo Thắng */}
            <div className="md:col-span-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative">
                <Trophy size={32} />
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-35" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {language === 'vi' ? 'CHIẾN THẮNG BẢO TÀNG!' : 'VICTORY!'}
                </h3>
                <p className="text-slate-300 text-[11px] leading-normal max-w-[240px]">
                  {language === 'vi'
                    ? 'Tuyệt vời! Bạn đã sắp xếp chính xác trục thời gian lịch sử.'
                    : 'Excellent! You have ordered the historical timeline perfectly.'}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-900/80 p-3.5 rounded-2xl w-full flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">{language === 'vi' ? 'Điểm của bạn' : 'Final Score'}</span>
                  <span className="font-mono text-xl font-black text-amber-400 tracking-tight">{score}</span>
                </div>
                <div className="h-px bg-slate-800/80 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">{language === 'vi' ? 'Thời gian làm bài' : 'Time Spent'}</span>
                  <span className="font-mono text-lg font-bold text-slate-200 tracking-tight">{180 - timeLeft}s</span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-1">
                <button
                  onClick={() => setMiniGameOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/10"
                >
                  {language === 'vi' ? 'Hoàn thành' : 'Done'}
                </button>
              </div>
            </div>

            {/* Cột phải: Bảng xếp hạng trực tuyến */}
            <div className="md:col-span-6 bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3 text-left self-stretch flex flex-col justify-center">
              <span className="text-sm md:text-base text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-2">
                🏆 {language === 'vi' ? 'BẢNG XẾP HẠNG' : 'LEADERBOARD'}
              </span>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar text-sm flex-1">
                {leaderboard.length === 0 ? (
                  <p className="text-slate-400 italic text-xs text-center py-4">
                    {language === 'vi' ? 'Chưa có kỷ lục nào.' : 'No records yet.'}
                  </p>
                ) : (
                  leaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-900/40 last:border-0">
                      <span className="text-slate-100 flex items-center gap-2.5 text-sm font-black">
                        <span className="font-mono text-slate-500 w-5 font-bold">#{idx + 1}</span>
                        <span className="truncate max-w-[140px]">{entry.nickname}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg text-amber-400 font-black">{entry.score}</span>
                        <span className="text-xs text-slate-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">{entry.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Lose Screen (Bố cục 2 cột rộng) */}
        {gameState === 'lost' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-center z-10 py-2">
            
            {/* Cột trái: Thông báo Thua */}
            <div className="md:col-span-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center border border-rose-500/20 animate-pulse">
                <AlertTriangle size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {language === 'vi' ? 'HẾT THỜI GIAN!' : 'GAME OVER!'}
                </h3>
                <p className="text-slate-300 text-[11px] leading-normal max-w-[240px]">
                  {language === 'vi'
                    ? 'Bạn đã hết 3 phút thời gian quy định.'
                    : 'You ran out of the 3-minute time limit.'}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-900/80 p-3.5 rounded-2xl w-full flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">{language === 'vi' ? 'Điểm của bạn' : 'Final Score'}</span>
                  <span className="font-mono text-xl font-black text-amber-400 tracking-tight">{score} / 100</span>
                </div>
                <div className="h-px bg-slate-800/80 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">{language === 'vi' ? 'Thời gian làm bài' : 'Time Spent'}</span>
                  <span className="font-mono text-lg font-bold text-slate-200 tracking-tight">180s</span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-1">
                <button
                  onClick={() => setMiniGameOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/10"
                >
                  {language === 'vi' ? 'Thoát' : 'Exit'}
                </button>
              </div>
            </div>

            {/* Cột phải: Bảng xếp hạng trực tuyến */}
            <div className="md:col-span-6 bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3 text-left self-stretch flex flex-col justify-center">
              <span className="text-sm md:text-base text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-2">
                🏆 {language === 'vi' ? 'BẢNG XẾP HẠNG' : 'LEADERBOARD'}
              </span>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar text-sm flex-1">
                {leaderboard.length === 0 ? (
                  <p className="text-slate-400 italic text-xs text-center py-4">
                    {language === 'vi' ? 'Chưa có kỷ lục nào.' : 'No records yet.'}
                  </p>
                ) : (
                  leaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-900/40 last:border-0">
                      <span className="text-slate-100 flex items-center gap-2.5 text-sm font-black">
                        <span className="font-mono text-slate-500 w-5 font-bold">#{idx + 1}</span>
                        <span className="truncate max-w-[140px]">{entry.nickname}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg text-amber-400 font-black">{entry.score}</span>
                        <span className="text-xs text-slate-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">{entry.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Form xác nhận nộp bài */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />
              
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center border border-cyan-500/20 mx-auto">
                <HelpCircle size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">
                  {language === 'vi' ? 'XÁC NHẬN NỘP BÀI?' : 'CONFIRM SUBMISSION?'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  {language === 'vi' 
                    ? 'Bạn có chắc chắn muốn nộp kết quả sắp xếp này? Lượt chơi sẽ kết thúc ngay lập tức.' 
                    : 'Are you sure you want to submit your timeline? The game will end immediately.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    checkOrder();
                  }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/10"
                >
                  {language === 'vi' ? 'Xác nhận' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MiniGameModal;
