import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, X, Sparkles, Lock, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestTask {
  id: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
}

const ROOM4_QUEST_TASKS: QuestTask[] = [
  { id: 'expert-1', nameVi: 'Đặc trưng 1: Kinh tế đa thành phần', nameEn: 'Feature 1: Multi-sector Economy', descVi: 'Nói chuyện với Chuyên gia Sở sở hữu', descEn: 'Talk to Ownership Expert' },
  { id: 'expert-2', nameVi: 'Đặc trưng 2: Cơ chế thị trường', nameEn: 'Feature 2: Market Mechanism', descVi: 'Nói chuyện với Chuyên gia Thị trường', descEn: 'Talk to Market Expert' },
  { id: 'expert-3', nameVi: 'Đặc trưng 3: Nhà nước quản lý vĩ mô', nameEn: 'Feature 3: State Regulation', descVi: 'Nói chuyện với Chuyên gia Kinh tế vĩ mô', descEn: 'Talk to Macroeconomy Expert' },
  { id: 'expert-4', nameVi: 'Đặc trưng 4: Công bằng xã hội', nameEn: 'Feature 4: Social Justice', descVi: 'Nói chuyện với Chuyên gia An sinh', descEn: 'Talk to Social Welfare Expert' },
  { id: 'expert-5', nameVi: 'Đặc trưng 5: Hội nhập quốc tế', nameEn: 'Feature 5: Global Integration', descVi: 'Nói chuyện với Chuyên gia Hội nhập', descEn: 'Talk to Integration Expert' }
];

export const MarketEconomyQuest: React.FC = () => {
  const { activeGallery, talkedNpcs, nickname, language } = useMuseum();
  const [isOpen, setIsOpen] = useState(false);

  // Check if player is in Room 4 (gallery-market-economy)
  const isRoomFour = activeGallery?.id === 'gallery-market-economy';

  // Confetti when all items are talked to
  useEffect(() => {
    if (talkedNpcs.length === ROOM4_QUEST_TASKS.length && isRoomFour) {
      const showSuccessConfetti = () => {
        confetti({ particleCount: 150, spread: 80, scalar: 1.2 });
      };
      const key = `room_four_quest_completed_confetti:${nickname}`;
      if (localStorage.getItem(key) !== 'true') {
        showSuccessConfetti();
        localStorage.setItem(key, 'true');
      }
    }
  }, [talkedNpcs.length, isRoomFour, nickname]);

  if (!isRoomFour || !nickname) return null;

  return (
    <>
      {/* FLOATING ACTION BUTTON - BOTTOM RIGHT FIXED */}
      <div className="absolute right-4 bottom-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
            talkedNpcs.length === ROOM4_QUEST_TASKS.length
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold'
              : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-slate-950 font-bold animate-pulse'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-xs uppercase tracking-wider">
            {language === 'vi' ? 'Sổ tay Nhiệm vụ' : 'Quest Log'}
          </span>
          <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {talkedNpcs.length}/{ROOM4_QUEST_TASKS.length}
          </span>
        </button>
      </div>

      {/* DETAILED ALBUM MODAL OVERLAY */}
      {isOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pointer-events-auto font-sans">
          <div className="w-full max-w-2xl h-[80vh] bg-[#0c0d12] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 relative select-none animate-fade-in">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    {language === 'vi' ? 'SỔ TAY KHẢO SÁT KINH TẾ' : 'ECONOMIC SURVEY LOG'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono leading-none mt-1">
                    {language === 'vi' ? 'Phòng 04 • Phòng thị trường' : 'Room 04 • Market Room'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full border border-slate-850 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Collection Progress & Instruction */}
            <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                <span>
                  {language === 'vi' 
                    ? 'Nói chuyện với 5 chuyên gia kinh tế ở các phân khu để thu thập thông tin.' 
                    : 'Talk to 5 economic experts in the zones to gather information.'}
                </span>
              </div>
              <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono text-[10px] shrink-0">
                {language === 'vi' ? 'Tiến độ: ' : 'Progress: '}{talkedNpcs.length}/{ROOM4_QUEST_TASKS.length}
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/20">
              {talkedNpcs.length === ROOM4_QUEST_TASKS.length && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-center text-emerald-400 max-w-xl mx-auto mb-2 animate-bounce">
                  <Award size={20} />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {language === 'vi' 
                      ? 'Nhiệm vụ hoàn thành! Bạn đã sẵn sàng thử thách với Ronaldo.' 
                      : 'Quest completed! You are ready to challenge Ronaldo.'}
                  </span>
                </div>
              )}

              {/* Progress visual bar */}
              <div className="bg-slate-900/40 border border-slate-850/50 p-4 rounded-2xl">
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out" 
                    style={{ width: `${(talkedNpcs.length / ROOM4_QUEST_TASKS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grid tasks */}
              <div className="flex flex-col gap-3">
                {ROOM4_QUEST_TASKS.map((task) => {
                  const isDone = talkedNpcs.includes(task.id);
                  const title = language === 'vi' ? task.nameVi : task.nameEn;
                  const desc = language === 'vi' ? task.descVi : task.descEn;

                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                        isDone 
                          ? 'bg-slate-900/40 border-emerald-500/20 text-slate-100' 
                          : 'bg-slate-950/20 border-dashed border-slate-850/80 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                        {isDone ? <Sparkles size={18} /> : <Lock size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isDone ? 'text-white' : 'text-slate-400'}`}>
                          {title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {desc}
                        </p>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {isDone ? (language === 'vi' ? 'Đã tìm hiểu' : 'Learned') : (language === 'vi' ? 'Chưa mở' : 'Locked')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Ronaldo final task status */}
              <div 
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                  talkedNpcs.length === ROOM4_QUEST_TASKS.length
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-80'
                }`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${
                  talkedNpcs.length === ROOM4_QUEST_TASKS.length 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-900 text-slate-600'
                }`}>
                  <Award size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold ${talkedNpcs.length === ROOM4_QUEST_TASKS.length ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {language === 'vi' ? 'Mở khóa Minigame từ Ronaldo' : 'Unlock Ronaldo\'s Minigame'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {talkedNpcs.length === ROOM4_QUEST_TASKS.length
                      ? (language === 'vi' ? 'Hãy đến nói chuyện với Ronaldo ở cuối hành lang để bắt đầu thử thách!' : 'Talk to Ronaldo at the end of the corridor to start the challenge!')
                      : (language === 'vi' ? 'Bạn cần tìm hiểu đủ 5 đặc trưng kinh tế để kích hoạt minigame.' : 'You must learn all 5 economic features to trigger the minigame.')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketEconomyQuest;
