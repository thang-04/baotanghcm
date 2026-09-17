'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, HelpCircle, CheckCircle, ChevronRight, X, AlertCircle, Sparkles, Award, Lock, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShaftConfig {
  id: number;
  title: string;
  desc: string;
  requiredGears: string[];
  requiredConclusion: string;
}

const SHAFTS_CONFIG: ShaftConfig[] = [
  {
    id: 1,
    title: 'Trục Khởi Hành & Khảo Nghiệm',
    desc: 'Từ Bến Nhà Rồng đến hành trình quan sát và khảo nghiệm thế giới.',
    requiredGears: ['exhibit-coupon', 'exhibit-world-1911-1917'],
    requiredConclusion: 'Hành trình từ năm 1911 giúp Nguyễn Tất Thành khảo nghiệm thực tiễn, nhận ra sự áp bức có tính phổ biến và từng bước tìm kiếm một con đường cứu nước mới.'
  },
  {
    id: 2,
    title: 'Trục Đấu Tranh Dân Tộc',
    desc: 'Đưa quyền lợi của dân tộc Việt Nam ra một diễn đàn quốc tế.',
    requiredGears: ['exhibit-versailles-1919'],
    requiredConclusion: 'Yêu sách năm 1919 đưa quyền lợi của dân tộc Việt Nam ra diễn đàn quốc tế, đồng thời cho thấy không thể trông chờ các cường quốc tự trao quyền tự do cho thuộc địa.'
  },
  {
    id: 3,
    title: 'Trục Bước Ngoặt Tư Tưởng',
    desc: 'Từ tìm kiếm lời giải đến xác định con đường cách mạng vô sản.',
    requiredGears: ['exhibit-lenin-theses-1920'],
    requiredConclusion: 'Luận cương của Lênin giúp Nguyễn Ái Quốc xác định cách mạng vô sản là phương hướng cơ bản cho sự nghiệp giải phóng dân tộc Việt Nam.'
  },
  {
    id: 4,
    title: 'Trục Lựa Chọn Chính Trị',
    desc: 'Chính thức lựa chọn Quốc tế III và con đường cách mạng vô sản.',
    requiredGears: ['exhibit-tours-1920'],
    requiredConclusion: 'Tại Đại hội Tours, Nguyễn Ái Quốc chính thức lựa chọn Quốc tế III và con đường cách mạng vô sản, chuyển từ người yêu nước thành người cộng sản.'
  },
  {
    id: 5,
    title: 'Trục Chuẩn Bị Lực Lượng',
    desc: 'Chuẩn bị tư tưởng, lý luận, cán bộ và tổ chức tại Quảng Châu.',
    requiredGears: ['exhibit-guangzhou-1925-1927'],
    requiredConclusion: 'Hoạt động tại Quảng Châu đã chuẩn bị tư tưởng, lý luận, cán bộ và tổ chức cho phong trào cách mạng Việt Nam.'
  },
  {
    id: 6,
    title: 'Trục Hội Tụ & Thống Nhất',
    desc: 'Giải quyết sự phân tán của ba tổ chức cộng sản và hình thành sự lãnh đạo thống nhất.',
    requiredGears: ['exhibit-convergence-1930'],
    requiredConclusion: 'Việc thống nhất các tổ chức cộng sản đã khắc phục tình trạng phân tán, tạo nên một chính đảng duy nhất lãnh đạo cách mạng Việt Nam.'
  }
];

const EXHIBIT_LABELS: Record<string, string> = {
  'exhibit-coupon': '🚢 Người ra đi',
  'exhibit-world-1911-1917': '🌍 Nhìn ra thế giới',
  'exhibit-versailles-1919': '📜 Tiếng nói của một dân tộc',
  'exhibit-lenin-theses-1920': '💡 Ánh sáng của con đường',
  'exhibit-tours-1920': '🗳️ Sự lựa chọn lịch sử',
  'exhibit-guangzhou-1925-1927': '📖 Chuẩn bị cho cách mạng',
  'exhibit-convergence-1930': '🤝 Hội tụ',
};

const EXHIBIT_THUMBNAILS: Record<string, string> = {
  'exhibit-coupon': '/exhibits/nguoi-ra-di.jpg',
  'exhibit-world-1911-1917': '/exhibits/nhin-ra-the-gioi.gif',
  'exhibit-versailles-1919': '/exhibits/tieng-noi-mot-dan-toc.jpg',
  'exhibit-lenin-theses-1920': '/exhibits/anh-sang-cua-con-duong.jpg',
  'exhibit-tours-1920': '/exhibits/su-lua-chon-lich-su.jpg',
  'exhibit-guangzhou-1925-1927': '/exhibits/chuan-bi-cho-cach-mang.jpg',
  'exhibit-convergence-1930': '/exhibits/hoi-tu-1930.jpg'
};

const CONCLUSION_OPTIONS = [
  'Hành trình từ năm 1911 giúp Nguyễn Tất Thành khảo nghiệm thực tiễn, nhận ra sự áp bức có tính phổ biến và từng bước tìm kiếm một con đường cứu nước mới.',
  'Yêu sách năm 1919 đưa quyền lợi của dân tộc Việt Nam ra diễn đàn quốc tế, đồng thời cho thấy không thể trông chờ các cường quốc tự trao quyền tự do cho thuộc địa.',
  'Luận cương của Lênin giúp Nguyễn Ái Quốc xác định cách mạng vô sản là phương hướng cơ bản cho sự nghiệp giải phóng dân tộc Việt Nam.',
  'Tại Đại hội Tours, Nguyễn Ái Quốc chính thức lựa chọn Quốc tế III và con đường cách mạng vô sản, chuyển từ người yêu nước thành người cộng sản.',
  'Hoạt động tại Quảng Châu đã chuẩn bị tư tưởng, lý luận, cán bộ và tổ chức cho phong trào cách mạng Việt Nam.',
  'Việc thống nhất các tổ chức cộng sản đã khắc phục tình trạng phân tán, tạo nên một chính đảng duy nhất lãnh đạo cách mạng Việt Nam.',
];

const EXHIBITS_LIST = [
  { id: 'exhibit-coupon', label: 'Người ra đi', clue: 'BẾN NHÀ RỒNG · 1911 · RA ĐI', desc: 'Ngày 5/6/1911, Nguyễn Tất Thành rời Tổ quốc từ Bến Nhà Rồng, mở đầu hành trình tìm đường cứu nước.' },
  { id: 'exhibit-world-1911-1917', label: 'Nhìn ra thế giới', clue: 'PHÁP · CHÂU PHI · HOA KỲ · ANH · LAO ĐỘNG · QUAN SÁT', desc: 'Giai đoạn 1911–1917 giúp Nguyễn Tất Thành khảo nghiệm thực tiễn và nhận ra sự gần gũi giữa các dân tộc bị áp bức.' },
  { id: 'exhibit-versailles-1919', label: 'Tiếng nói của một dân tộc', clue: 'VERSAILLES 1919 · NGUYỄN ÁI QUỐC · 8 ĐIỂM YÊU SÁCH · TỰ DO · DÂN CHỦ · BÌNH ĐẲNG', desc: 'Năm 1919, Nguyễn Ái Quốc đưa vấn đề quyền lợi của dân tộc Việt Nam ra một diễn đàn quốc tế.' },
  { id: 'exhibit-lenin-theses-1920', label: 'Ánh sáng của con đường', clue: 'LUẬN CƯƠNG LÊNIN · DÂN TỘC & THUỘC ĐỊA · 1920 · CÁCH MẠNG VÔ SẢN', desc: 'Luận cương của Lênin giúp Nguyễn Ái Quốc xác định phương hướng cơ bản cho con đường giải phóng dân tộc Việt Nam.' },
  { id: 'exhibit-tours-1920', label: 'Sự lựa chọn lịch sử', clue: 'ĐẠI HỘI TOURS · QUỐC TẾ III · ĐẢNG CỘNG SẢN PHÁP · CÁCH MẠNG VÔ SẢN · LỰA CHỌN', desc: 'Tại Đại hội Tours, Nguyễn Ái Quốc chính thức lựa chọn con đường cách mạng vô sản để giải phóng dân tộc.' },
  { id: 'exhibit-guangzhou-1925-1927', label: 'Chuẩn bị cho cách mạng', clue: 'QUẢNG CHÂU · HỘI VIỆT NAM CÁCH MẠNG THANH NIÊN · HUẤN LUYỆN CÁN BỘ · ĐƯỜNG KÁCH MỆNH · CHUẨN BỊ TỔ CHỨC', desc: 'Hoạt động tại Quảng Châu chuẩn bị về tư tưởng, chính trị, cán bộ và tổ chức cho cách mạng Việt Nam.' },
  { id: 'exhibit-convergence-1930', label: 'Hội tụ', clue: '1929 · BA TỔ CHỨC CỘNG SẢN · PHÂN TÁN · THỐNG NHẤT · HỒNG KÔNG 1930', desc: 'Nguyễn Ái Quốc triệu tập và chủ trì hội nghị nhằm thống nhất các tổ chức cộng sản, mở đường cho sự ra đời của Đảng Cộng sản Việt Nam.' },
];

export const InvestigationNotebook: React.FC = () => {
  const { 
    competitionMode,
    cluesCollected, 
    roomOneCompleted, 
    setRoomOneCompleted, 
    resetRoomOne,
    activeGallery, 
    nickname,
    socket,
    language,
    roomOneStartTimestamp,
    roomOneSessionResults,
    setRoomOneSessionResults
  } = useMuseum();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clues' | 'deduction'>('clues');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'to-deduction' | 'to-clues'>('to-deduction');

  const handleTabChange = (tab: 'clues' | 'deduction') => {
    if (tab === activeTab || isFlipping) return;
    
    setFlipDirection(tab === 'deduction' ? 'to-deduction' : 'to-clues');
    setIsFlipping(true);
    
    setTimeout(() => {
      setActiveTab(tab);
    }, 250);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 500);
  };

  // States for Clues tab details
  const [selectedClueId, setSelectedClueId] = useState<string>('exhibit-coupon');

  // States for Deduction Game (Bảng điều khiển hành trình)
  const [insertedGears, setInsertedGears] = useState<Record<number, string[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });
  const [insertedConclusions, setInsertedConclusions] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: ''
  });
  const [activeToolboxItem, setActiveToolboxItem] = useState<{ type: 'gear' | 'conclusion'; id: string } | null>(null);
  const [correctShafts, setCorrectShafts] = useState<number[]>([]);
  const [hasCheckedMachine, setHasCheckedMachine] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [finalQuestionOpen, setFinalQuestionOpen] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // States mới cho Báo cáo đúc kết & Đóng dấu phê duyệt
  const [isReportApproved, setIsReportApproved] = useState(false);
  const [isStamped, setIsStamped] = useState(false);

  // Open notebook automatically when all clues are collected
  useEffect(() => {
    if (cluesCollected.length === 7 && !roomOneCompleted) {
      setIsOpen(true);
      setActiveTab('deduction');
    }
  }, [cluesCollected.length, roomOneCompleted]);

  if (competitionMode || !activeGallery || activeGallery.id !== 'gallery-subsidy' || !nickname) return null;

  const handleSnapGear = (shaftId: number, gearId: string) => {
    // If clicking an already inserted gear, we remove it
    if (gearId) {
      setInsertedGears(prev => {
        const current = prev[shaftId] || [];
        const updated = current.filter(g => g !== gearId);
        return { ...prev, [shaftId]: updated };
      });
      return;
    }

    // Snapping logic: if active toolbox gear is selected
    if (activeToolboxItem && activeToolboxItem.type === 'gear') {
      const gId = activeToolboxItem.id;
      setInsertedGears(prev => {
        const current = prev[shaftId] || [];
        if (current.includes(gId)) return prev;
        const shaftLimit = SHAFTS_CONFIG.find(s => s.id === shaftId)?.requiredGears.length || 1;
        if (current.length >= shaftLimit) return prev; // Full
        return { ...prev, [shaftId]: [...current, gId] };
      });
      setActiveToolboxItem(null); // Clear selection
    }
  };

  const handleSnapConclusion = (shaftId: number, currentConcl: string) => {
    // If clicking an already inserted conclusion, we remove it
    if (currentConcl) {
      setInsertedConclusions(prev => ({ ...prev, [shaftId]: '' }));
      return;
    }

    // Snapping logic: if active toolbox conclusion is selected
    if (activeToolboxItem && activeToolboxItem.type === 'conclusion') {
      const conclText = activeToolboxItem.id;
      setInsertedConclusions(prev => ({ ...prev, [shaftId]: conclText }));
      setActiveToolboxItem(null); // Clear selection
    }
  };

  const handleCheckMachine = () => {
    let currentScore = 0;
    const correctIds: number[] = [];

    SHAFTS_CONFIG.forEach(s => {
      const inserted = [...(insertedGears[s.id] || [])].sort();
      const required = [...s.requiredGears].sort();
      
      const gearsMatch = inserted.length === required.length && inserted.every((v, i) => v === required[i]);
      const conclMatch = insertedConclusions[s.id] === s.requiredConclusion;

      if (gearsMatch && conclMatch) {
        currentScore += 10; // 10đ mỗi trục khớp đúng
        correctIds.push(s.id);
      }
    });

    const cluePoints = cluesCollected.length * 5; // 5đ mỗi hiện vật thu thập thực tế
    const totalScore = currentScore + cluePoints;

    setScore(totalScore);
    setCorrectShafts(correctIds);
    setHasCheckedMachine(true);

    if (correctIds.length === SHAFTS_CONFIG.length) {
      setFinalQuestionOpen(true);
      setShowError(false);
      confetti({ particleCount: 80, spread: 60 });
    } else {
      setShowError(true);
    }
  };

  const playStampSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.18);
      
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  const handleStampApproval = () => {
    if (isStamped || isSubmitting) return;
    
    playStampSound();
    setIsStamped(true);
    setIsSubmitting(true);
    
    confetti({ 
      particleCount: 150, 
      spread: 85,
      scalar: 1.2,
      origin: { y: 0.6 }
    });

    const clientElapsedMs = roomOneStartTimestamp ? (Date.now() - roomOneStartTimestamp) : 0;
    const finalBaseScore = (score ?? 95) + 10; // 95đ kết nối hành trình + 10đ đóng dấu = 105đ tối đa

    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('room1:submit-results', { baseScore: finalBaseScore, clientElapsedMs });
      } else {
        setRoomOneCompleted(true);
        setIsOpen(false);
      }
    }, 1500);
  };

  const handleFinalSubmit = () => {
    if (finalAnswer === 'yes') {
      setIsReportApproved(true);
      confetti({ particleCount: 60, spread: 50 });
    } else {
      alert(language === 'vi' ? 'Hãy suy nghĩ lại dựa trên các manh mối đã thu thập!' : 'Think again based on the clues collected!');
    }
  };

  const handleResetProgress = () => {
    if (confirm(language === 'vi' ? 'Bạn có muốn làm lại từ đầu không?' : 'Do you want to reset and start over?')) {
      resetRoomOne();
      setInsertedGears({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
      setInsertedConclusions({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });
      setActiveToolboxItem(null);
      setCorrectShafts([]);
      setHasCheckedMachine(false);
      setScore(null);
      setFinalQuestionOpen(false);
      setFinalAnswer(null);
      setIsReportApproved(false);
      setIsStamped(false);
      setIsSubmitting(false);
      setRoomOneSessionResults(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-slow 10s linear infinite reverse;
        }
        @keyframes flip-to-deduction {
          0% {
            transform: perspective(1600px) rotateY(0deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to right, #fdfaf2 90%, #ebd9bd 100%);
            border-radius: 0 8px 8px 0;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
          40% {
            background: linear-gradient(to right, #ebd9bd 0%, #fffdec 50%, #dcd1be 100%);
            border-radius: 0 16px 16px 0;
            box-shadow: -20px 20px 35px rgba(0,0,0,0.3);
          }
          50% {
            transform: perspective(1600px) rotateY(-90deg) skewY(-3.5deg) scaleY(0.97);
            background: #e2d2ba;
          }
          60% {
            background: linear-gradient(to left, #2b2f36 0%, #444a54 50%, #1c1e22 100%);
            border-radius: 16px 0 0 16px;
            box-shadow: 20px 20px 35px rgba(0,0,0,0.3);
          }
          100% {
            transform: perspective(1600px) rotateY(-180deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to left, #22252a 90%, #15171a 100%);
            border-radius: 8px 0 0 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.15);
          }
        }
        @keyframes flip-to-clues {
          0% {
            transform: perspective(1600px) rotateY(-180deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to left, #22252a 90%, #15171a 100%);
            border-radius: 8px 0 0 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.15);
          }
          40% {
            background: linear-gradient(to left, #2b2f36 0%, #444a54 50%, #1c1e22 100%);
            border-radius: 16px 0 0 16px;
            box-shadow: 20px 20px 35px rgba(0,0,0,0.3);
          }
          50% {
            transform: perspective(1600px) rotateY(-90deg) skewY(3.5deg) scaleY(0.97);
            background: #e2d2ba;
          }
          60% {
            background: linear-gradient(to right, #ebd9bd 0%, #fffdec 50%, #dcd1be 100%);
            border-radius: 0 16px 16px 0;
            box-shadow: -20px 20px 35px rgba(0,0,0,0.3);
          }
          100% {
            transform: perspective(1600px) rotateY(0deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to right, #fdfaf2 90%, #ebd9bd 100%);
            border-radius: 0 8px 8px 0;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
        }
        .animate-flip-to-deduction {
          animation: flip-to-deduction 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
          transform-origin: left center;
        }
        .animate-flip-to-clues {
          animation: flip-to-clues 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
          transform-origin: left center;
        }
      `}} />

      {/* FLOATING ACTION BUTTON */}
      <div className="absolute right-4 bottom-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
            cluesCollected.length === 7 && !roomOneCompleted
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-bold animate-pulse'
              : roomOneCompleted
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-805 text-slate-100'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-xs uppercase tracking-wider">
            {language === 'vi' ? 'Sổ điều tra' : 'Investigation Log'}
          </span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {cluesCollected.length}/7
          </span>
        </button>
      </div>

      {/* NOTEBOOK MODAL SCREEN */}
      {isOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
          
          {/* Leather Book Cover Frame */}
          <div className="relative w-full max-w-6xl h-[88vh] bg-[#3a1f10] border-[10px] border-[#2b170c] rounded-[24px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.95)] flex overflow-visible p-2.5 select-none animate-fade-in font-sans">
            
            {/* Stitching effect border */}
            <div className="absolute inset-1.5 border border-[#4d2d1b] border-dashed rounded-[16px] pointer-events-none z-30" />
            
            {/* Close Button on the top right cover corner */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-40 bg-[#1a0a03] hover:bg-[#2b170c] text-amber-500 hover:text-amber-400 p-2 rounded-full border border-amber-900/50 shadow-md transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Metal Spiral Binder in the middle split */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 bg-gradient-to-r from-[#1a0a03] via-[#2b170c] to-[#1a0a03] z-20 flex flex-col items-center justify-between py-6 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-9 h-2.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full shadow-md border-y border-slate-500/30 transform -rotate-[5deg]" />
              ))}
            </div>

            {/* The Flipping Page Sheet Overlay */}
            {isFlipping && (
              <div 
                className={`absolute top-2.5 bottom-2.5 left-1/2 w-[calc(50%-2.5px)] z-35 pointer-events-none border border-black/15 shadow-2xl ${
                  flipDirection === 'to-deduction' 
                    ? 'animate-flip-to-deduction' 
                    : 'animate-flip-to-clues'
                }`}
              />
            )}

            {/* Tab Leather Bookmarks Sticking out of the Left Page */}
            <div className="absolute top-16 left-[-38px] z-30 flex flex-col gap-4 pointer-events-auto">
              <button
                onClick={() => handleTabChange('clues')}
                className={`w-10 py-7 text-[10.5px] font-mono font-bold uppercase text-center rounded-l-2xl border-y border-l transition-all shadow-md write-vertical cursor-pointer ${
                  activeTab === 'clues' 
                    ? 'bg-[#fdfaf2] text-[#4e3629] border-[#d8d3c5] scale-110 pl-2 shadow-2xl z-40' 
                    : 'bg-[#b69f7e] hover:bg-[#c7b08f] text-[#3a1f10] border-amber-900/40 shadow-sm'
                }`}
              >
                Manh Mối
              </button>
              <button
                onClick={() => handleTabChange('deduction')}
                className={`w-10 py-7 text-[10.5px] font-mono font-bold uppercase text-center rounded-l-2xl border-y border-l transition-all shadow-md write-vertical cursor-pointer ${
                  activeTab === 'deduction' 
                    ? 'bg-[#fdfaf2] text-[#4e3629] border-[#d8d3c5] scale-110 pl-2 shadow-2xl z-40' 
                    : 'bg-[#b69f7e] hover:bg-[#c7b08f] text-[#3a1f10] border-amber-900/40 shadow-sm'
                }`}
              >
                Hành Trình
              </button>
            </div>

            {/* -------------------- PAGE 1: LEFT PAGE -------------------- */}
            <div className="flex-1 bg-[#fdfaf2] rounded-l-[12px] p-6 pr-8 shadow-inner overflow-y-auto custom-scrollbar relative flex flex-col h-full border-r border-[#e2d5c0]/50 z-10">
              {/* Vertical margins lined paper style */}
              <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-red-200/50 pointer-events-none" />

              {/* Title Section inside the page */}
              <div className="border-b border-[#ebd9bd] pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold font-sans text-[#4e3629] tracking-tight uppercase flex items-center gap-1.5">
                    <span>📒</span>
                    {activeTab === 'clues' ? 'Danh sách Manh mối' : 'Hòm Tư Liệu Lập Luận'}
                  </h3>
                  <p className="text-[10px] text-[#523d14] font-mono font-bold tracking-widest leading-none mt-1">
                    {activeTab === 'clues' ? 'VIETNAM BEFORE DOI MOI' : 'CHỌN THÀNH PHẦN ĐỂ LẮP RÁP'}
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#ebd9bd]/30 text-[#4e3629] px-2 py-0.5 rounded-full font-bold">
                  {cluesCollected.length}/7 Manh mối
                </span>
              </div>

              {/* TAB 1 LEFT PAGE: Clues List */}
              {activeTab === 'clues' && (
                <div className="flex-1 space-y-3.5 pr-2">
                  <div className="bg-[#ebd9bd]/20 border border-[#e5d5be] p-3.5 rounded-xl text-[12px] text-slate-900 font-medium italic leading-relaxed">
                    &ldquo;Hãy khám phá 6 hiện vật trên tường để mở khóa tủ kính trung tâm, sau đó hoàn thành tư liệu thứ 7 và thu thập đủ bằng chứng cho Bảng điều khiển hành trình.&rdquo;
                  </div>

                  <div className="space-y-2">
                    {EXHIBITS_LIST.map((item) => {
                      const collected = cluesCollected.includes(item.id);
                      const isSelected = selectedClueId === item.id;
                      
                      return (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedClueId(item.id)}
                          className={`p-3 rounded-xl transition-all border cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-amber-100/50 border-amber-400/60 shadow-xs' 
                              : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-xs">
                              {collected ? EXHIBIT_LABELS[item.id].split(' ')[0] : '❓'}
                            </span>
                            <div className="truncate">
                              <h4 className="text-[13px] font-extrabold text-slate-950">
                                {collected ? item.label : '❓ Manh mối bí ẩn'}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-600 truncate max-w-[210px]">
                                {collected ? item.clue : 'Chưa được thu thập trong phòng 3D'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            collected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {collected ? 'Đã có' : 'Chưa có'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2 LEFT PAGE: Toolbox for Gears & Conclusions */}
              {activeTab === 'deduction' && (
                <div className="flex-1 flex flex-col space-y-4 pr-2">
                  <div className="bg-amber-50/50 border border-amber-200/65 p-3 rounded-xl text-[12px] leading-relaxed text-[#5c4314] font-medium">
                    <span className="font-bold">Hướng dẫn:</span> Chọn 1 thẻ Manh mối hoặc 1 Thẻ Kết luận bên dưới, sau đó nhấp vào <b>ổ khuyết bánh răng hoặc ổ kết luận</b> ở trang phải để lắp ghép.
                  </div>

                  {/* Category A: Gears (Polaroids / Blueprints) */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold font-mono text-[#4e3629] uppercase tracking-wider">
                      ⚙️ Bánh răng bằng chứng (Gears)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {EXHIBITS_LIST.map((item) => {
                        const collected = cluesCollected.includes(item.id);
                        const isSelected = activeToolboxItem?.type === 'gear' && activeToolboxItem.id === item.id;
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => setActiveToolboxItem({ type: 'gear', id: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer relative flex flex-col items-center justify-between aspect-[1/1.05] ${
                              isSelected 
                                ? 'bg-amber-100 border-amber-500 scale-105 shadow-md ring-2 ring-amber-400/50' 
                                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                            }`}
                          >
                            {/* Polaroid image or Pencil Blueprint Outline */}
                            <div className="w-full aspect-square rounded-sm overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center relative">
                              {collected ? (
                                <img src={EXHIBIT_THUMBNAILS[item.id]} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#e8e3d7] flex flex-col items-center justify-center p-1 border border-dashed border-slate-400">
                                  <Lock size={12} className="text-slate-500 mb-0.5" />
                                  <span className="text-[7.5px] text-slate-500 uppercase leading-none font-bold">Chưa tìm</span>
                                </div>
                              )}
                              {/* Selection overlay */}
                              {isSelected && <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-500 pointer-events-none" />}
                            </div>

                            <span className="text-[10px] font-extrabold text-slate-900 truncate w-full mt-1">
                              {collected ? item.label : `Nháp: ${item.label}`}
                            </span>

                            {/* Indicator point values */}
                            <div className="absolute top-1 right-1 bg-black/40 text-[7px] font-mono text-white px-1 rounded-sm leading-none py-0.5 scale-75">
                              {collected ? '+5đ' : '+0đ'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category B: Conclusions (Paper yellow notes) */}
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[11px] font-extrabold font-mono text-[#4e3629] uppercase tracking-wider">
                      📌 Bản đúc kết logic (Conclusions)
                    </h4>
                    <div className="space-y-1.5">
                      {CONCLUSION_OPTIONS.map((option, idx) => {
                        const isSelected = activeToolboxItem?.type === 'conclusion' && activeToolboxItem.id === option;
                        
                        // Check if this conclusion is already inserted somewhere to grey it out slightly
                        const isUsed = Object.values(insertedConclusions).includes(option);

                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveToolboxItem({ type: 'conclusion', id: option })}
                            className={`p-3 rounded-lg border text-[11px] leading-relaxed font-semibold transition-all cursor-pointer relative font-sans shadow-xs ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-500 scale-[1.01] shadow-md ring-2 ring-amber-400/40 text-slate-900 font-medium'
                                : isUsed
                                ? 'bg-slate-100/60 border-slate-200 text-slate-400'
                                : 'bg-[#fffde6]/90 border-yellow-250/70 hover:bg-[#fffdd0] text-slate-700'
                            }`}
                          >
                            <div className="absolute top-1 left-1.5 text-[9px] font-mono text-amber-900 opacity-90 font-extrabold uppercase">
                              Nhãn #{idx + 1}
                            </div>
                            <p className="pl-6 pt-1.5 leading-snug text-slate-900">{option}</p>
                            
                            {/* Tape graphical styling */}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-200/50 border border-yellow-300/40 opacity-30 transform -rotate-[2deg] pointer-events-none" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* -------------------- PAGE 2: RIGHT PAGE -------------------- */}
            <div className={`flex-1 rounded-r-[12px] p-6 pl-8 shadow-inner overflow-y-auto custom-scrollbar relative flex flex-col h-full z-10 transition-colors duration-350 ${
              activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                ? 'bg-gradient-to-br from-[#2a2d34] to-[#121316] border-l border-black/80 shadow-[inset_10px_0_20px_rgba(0,0,0,0.8)] text-slate-200'
                : 'bg-[#fdfaf2]'
            }`}>
              {/* Vertical margins lined paper style (only on paper mode) */}
              {!(activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved) && (
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-red-200/50 pointer-events-none" />
              )}

              {/* Title Section inside the page */}
              <div className={`pb-3 mb-4 flex items-center justify-between border-b ${
                activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                  ? 'border-slate-800'
                  : 'border-[#ebd9bd]'
              }`}>
                <div>
                  <h3 className={`text-md font-bold font-sans tracking-tight uppercase flex items-center gap-1.5 ${
                    activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                      ? 'text-amber-500'
                      : 'text-[#4e3629]'
                  }`}>
                    <span>{activeTab === 'clues' ? '⚙️' : '🎮'}</span>
                    {activeTab === 'clues' ? 'Dữ liệu điều tra' : 'Bảng Điều Khiển Hành Trình'}
                  </h3>
                  <p className={`text-[9px] font-mono tracking-widest leading-none mt-1 ${
                    activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                      ? 'text-slate-500'
                      : 'text-[#725b29]'
                  }`}>
                    {activeTab === 'clues' ? 'DETAILED INVESTIGATION DOSSIER' : 'KẾT NỐI HÀNH TRÌNH TÌM ĐƯỜNG'}
                  </p>
                </div>
                {activeTab === 'deduction' && score !== null && (
                  <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Điểm hiện tại: {score}/105đ
                  </span>
                )}
              </div>

              {/* TAB 1 RIGHT PAGE: Clue Details */}
              {activeTab === 'clues' && (() => {
                const item = EXHIBITS_LIST.find(i => i.id === selectedClueId);
                const collected = cluesCollected.includes(selectedClueId);
                
                return (
                  <div className="flex-1 flex flex-col justify-between h-full pl-2">
                    {collected ? (
                      <div className="space-y-4">
                        {/* Polaroid mockup photo frame */}
                        <div className="bg-white border border-[#ebd9bd] p-3 shadow-md rounded-sm w-52 mx-auto rotate-1 hover:rotate-0 transition-transform">
                          <div className="w-full aspect-square overflow-hidden bg-slate-100 border border-slate-150">
                            <img src={EXHIBIT_THUMBNAILS[selectedClueId]} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[11px] font-mono text-[#725b29] font-bold text-center mt-2.5">
                            {EXHIBIT_LABELS[selectedClueId]}
                          </p>
                        </div>

                        {/* Handwriting lined paper details */}
                        <div className="space-y-2.5 font-sans text-slate-800 leading-relaxed text-justify">
                          <h4 className="text-sm font-bold text-[#4e3629] font-sans uppercase border-b border-dashed border-[#e2d5c0] pb-1">
                            Ý nghĩa lịch sử của hiện vật:
                          </h4>
                          <p className="text-[11px] leading-relaxed">
                            {item?.desc}
                          </p>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg font-sans text-[10.5px] text-[#725b29] italic">
                            <span className="font-bold uppercase tracking-wider block mb-0.5 text-[9px]">Ghi chép nhanh:</span>
                            "{item?.clue}"
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3.5 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                          <Lock size={26} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-700 uppercase">
                            Tập tin này đang bị khóa
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Bạn chưa trực tiếp tìm thấy manh mối <b>{item?.label}</b> trong phòng triển lãm 3D. Hãy đóng sổ lại, di chuyển thám hiểm và nhấp vào hiện vật để mở khóa tệp tin này!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 font-mono text-center pt-4">
                      Hồ sơ mật - Ban quản lý bảo tàng MLN122
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2 RIGHT PAGE: Journey Timeline Machine Puzzle */}
              {activeTab === 'deduction' && (
                <div className="flex-1 flex flex-col justify-between h-full pl-2">
                  
                  {roomOneCompleted ? (
                    /* TRẠNG THÁI ĐÃ HOÀN THÀNH PHÒNG */
                    <div className="bg-[#fffde6]/50 border-2 border-[#d9cdb6] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-fade-in text-slate-800">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono">
                          HỒ SƠ ĐÃ HOÀN THÀNH & TỔNG KẾT
                        </span>
                        <h3 className="text-md font-bold font-sans text-slate-900 mt-2">
                          Bảng Tổng Sắp Đặc Vụ Phòng 01
                        </h3>
                        <p className="text-[9px] text-slate-500 font-sans">
                          Danh sách đặc vụ giải mật Phòng 01 trong phiên chơi hiện tại
                        </p>
                      </div>

                      {/* Bảng xếp hạng kết quả từ server */}
                      {roomOneSessionResults && roomOneSessionResults.length > 0 ? (
                        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs relative z-10 font-sans">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-200 tracking-wider">
                                <th className="py-2 px-3 text-center">Hạng</th>
                                <th className="py-2 px-3">Đặc vụ</th>
                                <th className="py-2 px-3 text-center">Cơ bản</th>
                                <th className="py-2 px-3 text-center">Thời gian</th>
                                <th className="py-2 px-3 text-center">Thưởng</th>
                                <th className="py-2 px-3 text-center font-bold text-slate-950">Tổng điểm</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {roomOneSessionResults.map((p, idx) => {
                                const isSelf = p.nickname === nickname;
                                return (
                                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-amber-500/10 font-medium' : ''}`}>
                                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                                      {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                                    </td>
                                    <td className="py-2 px-3 truncate max-w-[100px] font-sans">
                                      {p.nickname} {isSelf && <span className="text-[8px] bg-amber-500 text-slate-950 px-1 py-0.5 rounded-sm font-bold uppercase ml-1">Tôi</span>}
                                    </td>
                                    <td className="py-2 px-3 text-center font-mono text-slate-600">{p.baseScore}đ</td>
                                    <td className="py-2 px-3 text-center font-mono text-slate-600">{p.timeSpent}s</td>
                                    <td className="py-2 px-3 text-center font-mono text-emerald-600 font-bold">
                                      {p.bonus > 0 ? `+${p.bonus}đ` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-950">{p.finalScore}đ</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-white/80 border border-emerald-100 p-4 rounded-xl text-left space-y-2.5 font-sans relative z-10">
                          <h4 className="text-xs font-bold text-emerald-950 uppercase border-b border-emerald-100 pb-1 font-mono">
                            KẾT LUẬN CỦA ĐIỀU TRA VIÊN
                          </h4>
                          <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                            Từ năm 1911 đến đầu năm 1930, Nguyễn Ái Quốc đã trải qua một hành trình liên tục: ra đi khảo nghiệm thế giới, đưa quyền dân tộc ra diễn đàn quốc tế, xác định và lựa chọn con đường cách mạng vô sản, chuẩn bị lực lượng rồi thống nhất các tổ chức cộng sản. Chuỗi sự kiện ấy tạo tiền đề trực tiếp cho sự ra đời của Đảng Cộng sản Việt Nam.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 justify-center relative z-10 pt-2">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2.5 px-6 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono"
                        >
                          Tiếp tục tham quan
                        </button>
                      </div>
                    </div>
                  ) : isSubmitting ? (
                    /* TRẠNG THÁI CHỜ CÁC BẠN CHƠI KHÁC */
                    <div className="bg-[#fffde6]/55 border border-[#d9cdb6] rounded-2xl p-6 text-center space-y-4 my-2 shadow-xs relative overflow-hidden text-slate-800 animate-pulse flex-1 flex flex-col justify-center">
                      <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                          HỒ SƠ ĐÃ NỘP & CHỜ PHÊ DUYỆT
                        </span>
                        <h3 className="text-sm font-bold font-sans text-slate-900 mt-2">
                          Đang chờ các Đặc vụ khác...
                        </h3>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-sans max-w-sm mx-auto text-justify">
                          Hồ sơ điều tra của bạn đã được gửi lên Ban Thanh Tra. Vui lòng chờ tất cả người chơi trong phòng hoàn thành để tổng hợp bảng điểm và thưởng điểm tốc độ Top 5.
                        </p>
                      </div>
                    </div>
                  ) : isReportApproved ? (
                    /* HỒ SƠ PHÊ DUYỆT CHÍNH THỨC CỦA ĐẠI TÁ / BAN THANH TRA */
                    <div className="bg-[#fffdf2] border border-[#d9cdb6] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-fade-in text-slate-850 flex-1 flex flex-col justify-between">
                      {/* CSS Mộc đóng dấu động inline */}
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes stamp-scale {
                          0% {
                            transform: scale(3.5) rotate(-35deg);
                            opacity: 0;
                          }
                          100% {
                            transform: scale(1) rotate(-12deg);
                            opacity: 0.9;
                          }
                        }
                        .animate-stamp {
                          animation: stamp-scale 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
                        }
                      `}} />

                      <div className="space-y-3">
                        <div className="text-center border-b border-double border-slate-300 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-widest text-[#725b29] uppercase">
                            HỒ SƠ BÁO CÁO CUỐI CÙNG
                          </h4>
                          <span className="text-[8px] font-mono opacity-50 block">Mã số hồ sơ: #MLN122-R01</span>
                        </div>

                        <div className="space-y-1.5 text-[11px] leading-relaxed font-sans text-slate-800 text-justify">
                          <p>
                            Qua quá trình khảo sát và kết nối các tư liệu, tôi xác nhận hành trình tìm đường cứu nước của Nguyễn Ái Quốc từ năm 1911 đến năm 1930 là một quá trình phát triển liên tục từ <b>khảo nghiệm thực tiễn</b> đến <b>xác định con đường, chuẩn bị lực lượng và thống nhất tổ chức</b>.
                          </p>
                          <p>
                            Những bước chuyển đó tạo nền tảng tư tưởng, chính trị, cán bộ và tổ chức cho cách mạng Việt Nam, đồng thời dẫn tới sự ra đời của Đảng Cộng sản Việt Nam đầu năm 1930.
                          </p>
                        </div>
                      </div>

                      {/* Stamp Seal Area */}
                      <div className="relative h-24 flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                        {isStamped ? (
                          <div className="absolute flex flex-col items-center justify-center border-4 border-dashed border-red-600 rounded-full w-20 h-20 text-red-600 font-black uppercase tracking-widest font-mono text-[9px] select-none pointer-events-none opacity-90 animate-stamp shadow-sm bg-white/10">
                            <span className="transform -rotate-[5deg]">Đã Duyệt</span>
                            <span className="text-[7px] leading-none mt-1">R01 APPROVED</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleStampApproval}
                            className="bg-red-600/10 hover:bg-red-600/20 text-red-700 text-[10px] font-mono font-bold py-2.5 px-5 rounded-full border border-red-500/30 transition-all cursor-pointer shadow-xs animate-bounce"
                          >
                            🖱️ Bấm để Đóng Dấu Phê Duyệt (+10đ)
                          </button>
                        )}
                        <span className="absolute bottom-1 right-2 text-[8px] font-mono opacity-40">Phê chuẩn bởi Ban thanh tra</span>
                      </div>
                    </div>
                  ) : (
                    /* DEDUCTION MACHINE PUZZLE LAYOUT (RETRO INDUSTRIAL CONTROL PANEL) */
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Control Panel Header Gauges */}
                      <div className="flex justify-between items-center bg-[#181a1e] border border-slate-800 rounded-xl p-3 shadow-md relative overflow-hidden">
                        {/* Copper pipes background effect */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#8c6b39]/20 -translate-y-1/2 pointer-events-none" />

                        {/* Gauge 1: Machine Pressure Gauge */}
                        <div className="flex items-center gap-2.5 relative z-10">
                          <div className="w-11 h-11 rounded-full bg-[#f4ebd0] border-4 border-[#25282f] relative flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]">
                            {/* Tick marks */}
                            <div className="absolute inset-1 border border-slate-700/20 rounded-full border-dashed" />
                            {/* Needle */}
                            <div 
                              className="absolute bottom-1/2 left-1/2 w-0.5 h-4.5 bg-red-600 origin-bottom transform -translate-x-1/2 transition-transform duration-700" 
                              style={{ transform: `translateX(-50%) rotate(${-60 + (correctShafts.length / SHAFTS_CONFIG.length) * 150}deg)` }}
                            />
                            {/* Center pin */}
                            <div className="w-2 h-2 rounded-full bg-[#181a1d] absolute" />
                          </div>
                          <div>
                            <span className="text-[7.5px] font-mono text-slate-400 block leading-none">MỨC ĐỘ HOÀN THIỆN</span>
                            <span className="text-[9px] font-mono text-amber-500 font-bold leading-none mt-1 block">
                              {Math.round((correctShafts.length / SHAFTS_CONFIG.length) * 100)}% TIMELINE LINKED
                            </span>
                          </div>
                        </div>

                        {/* Gauge 2: LEDs system */}
                        <div className="flex gap-2 relative z-10">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${correctShafts.length === SHAFTS_CONFIG.length ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-850'}`} />
                            <span className="text-[6px] font-mono text-slate-500 mt-1 uppercase">Online</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${hasCheckedMachine && correctShafts.length < SHAFTS_CONFIG.length ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse' : 'bg-slate-850'}`} />
                            <span className="text-[6px] font-mono text-slate-500 mt-1 uppercase">Fault</span>
                          </div>
                        </div>
                      </div>

                      {/* Machine Gear Slots Container */}
                      <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        
                        {SHAFTS_CONFIG.map((shaft) => {
                          const gears = insertedGears[shaft.id] || [];
                          const concl = insertedConclusions[shaft.id];
                          const isCorrect = correctShafts.includes(shaft.id);
                          const isError = hasCheckedMachine && !isCorrect;

                          return (
                            <div 
                              key={shaft.id}
                              className={`p-3 rounded-xl border transition-all relative ${
                                isCorrect 
                                  ? 'bg-gradient-to-b from-[#1b2f25] to-[#122019] border-emerald-500/40 shadow-xs' 
                                  : isError 
                                  ? 'bg-gradient-to-b from-[#341b1d] to-[#251314] border-rose-500/40 shadow-xs animate-shake'
                                  : 'bg-gradient-to-b from-[#24272e] to-[#181a1f] border-slate-700/50 shadow-md'
                              }`}
                            >
                              {/* LED dome indicator */}
                              <div className={`absolute top-2 right-3 w-2.5 h-2.5 rounded-full border border-black/35 ${
                                isCorrect 
                                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                                  : isError 
                                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping' 
                                  : 'bg-slate-750 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]'
                              }`} />

                              <h4 className={`text-[11.5px] font-extrabold font-mono leading-none mb-1.5 flex items-center gap-1.5 uppercase ${
                                isCorrect ? 'text-emerald-400' : isError ? 'text-rose-400' : 'text-amber-500'
                              }`}>
                                <span>🕹️</span>
                                {shaft.title}
                              </h4>
                              
                              <p className="text-[10.5px] font-medium text-slate-300 mb-2 leading-relaxed">
                                {shaft.desc}
                              </p>

                              {/* Interactive Mechanical Sockets */}
                              <div className="flex flex-col gap-2.5">
                                
                                {/* Slot A: Brass Gear recess sockets */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 w-16 leading-none">Bánh răng:</span>
                                  <div className="flex items-center gap-2">
                                    {Array.from({ length: shaft.requiredGears.length }).map((_, idx) => {
                                      const insertedGearId = gears[idx];
                                      const collected = insertedGearId ? cluesCollected.includes(insertedGearId) : false;

                                      return (
                                        <div
                                          key={idx}
                                          onClick={() => handleSnapGear(shaft.id, insertedGearId)}
                                          className={`w-11 h-11 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                                            insertedGearId
                                              ? 'border-[#a5804c] bg-[#1e2025] shadow-xs'
                                              : 'border-dashed border-slate-700 bg-black/50 hover:bg-black/70'
                                          }`}
                                          title={insertedGearId ? 'Gỡ bánh răng' : 'Lắp bánh răng'}
                                        >
                                          {insertedGearId ? (
                                            <div className={`w-[90%] h-[90%] rounded-full overflow-hidden p-0.5 relative ${isCorrect ? (idx % 2 === 0 ? 'animate-spin-slow' : 'animate-spin-reverse') : ''}`}>
                                              {collected ? (
                                                <img src={EXHIBIT_THUMBNAILS[insertedGearId]} className="w-full h-full object-cover rounded-full" />
                                              ) : (
                                                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                                                  <Lock size={10} className="text-slate-500" />
                                                </div>
                                              )}
                                              {/* Cog teeth outlines overlay */}
                                              <div className="absolute inset-0 border-2 border-[#8c6b39] border-dashed rounded-full pointer-events-none scale-105" />
                                            </div>
                                          ) : (
                                            <div className="w-2.5 h-2.5 rounded-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-slate-800" />
                                          )}

                                          {/* Mini indicator tag for pencil sketch nháp */}
                                          {insertedGearId && !collected && (
                                            <span className="absolute -bottom-1 -right-1 bg-slate-700 border border-slate-600 text-white text-[5.5px] font-mono px-0.5 rounded-xs leading-none">NHÁP</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Slot B: Nixie tube conclusion display screens */}
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 w-16 pt-1.5 leading-none">Đúc kết:</span>
                                  <div
                                    onClick={() => handleSnapConclusion(shaft.id, concl)}
                                    className={`flex-1 min-h-[42px] p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative text-[10.5px] leading-tight font-medium ${
                                      concl
                                        ? 'border-[#2d3035] bg-black text-[#ffa600] drop-shadow-[0_0_3.5px_#ff9000] font-sans italic tracking-wide'
                                        : 'border-dashed border-slate-700 bg-black/40 hover:bg-black/60 text-slate-500 text-center font-mono'
                                    }`}
                                    title={concl ? 'Bấm để gỡ nhãn đúc kết' : 'Chọn nhãn kết luận ở trang trái rồi lắp vào'}
                                  >
                                    {concl ? (
                                      <p className="leading-snug pr-2 text-justify">{concl}</p>
                                    ) : (
                                      <span className="text-[9.5px] tracking-wider font-bold text-slate-500">[ CHƯA CÓ BẢN ĐÚC KẾT ]</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Error text if deduction incorrect */}
                      {showError && (
                        <div className="bg-rose-950/40 border border-rose-900 p-2.5 rounded-xl text-rose-300 text-[10px] leading-relaxed flex items-center gap-2 animate-pulse font-mono">
                          <AlertCircle size={13} className="shrink-0 text-rose-400" />
                           <span>LIÊN KẾT CHƯA HOÀN CHỈNH: Một vài bằng chứng chưa đúng trục hoặc bản đúc kết chưa chính xác. Hãy kiểm tra lại dòng thời gian.</span>
                        </div>
                      )}

                      {/* Verify button */}
                      {!finalQuestionOpen && (
                        <div className="pt-0.5 flex justify-center">
                          <button
                            onClick={handleCheckMachine}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[10px] py-2.5 px-6 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase"
                          >
                             ⚙️ Hoàn tất dòng chảy lịch sử
                          </button>
                        </div>
                      )}

                      {/* CÂU HỎI QUYẾT ĐỊNH KHÓA CỔNG */}
                      {finalQuestionOpen && (
                        <div className="border border-amber-500 bg-[#161a1d] p-3.5 rounded-xl space-y-3.5 animate-fade-in relative shadow-md text-slate-200">
                          <div className="absolute -top-2.5 left-4 bg-amber-500 text-slate-950 font-mono font-bold text-[7.5px] uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                             <Sparkles size={8} /> HÀNH TRÌNH ĐÃ ĐƯỢC KẾT NỐI
                          </div>
                          
                          <div className="space-y-1 pt-1">
                            <h3 className="text-[8.5px] font-bold font-mono text-slate-400 uppercase tracking-widest leading-none">
                               KẾT LUẬN HÀNH TRÌNH:
                            </h3>
                            <p className="text-[10.5px] font-bold text-slate-100 leading-snug">
                               Chuỗi tư liệu từ năm 1911 đến năm 1930 có cho thấy con đường cứu nước của Nguyễn Ái Quốc được hình thành qua khảo nghiệm thực tiễn, xác định tư tưởng, lựa chọn chính trị, chuẩn bị lực lượng và thống nhất tổ chức hay không?
                            </p>
                          </div>

                          <div className="space-y-1.5 text-[9.5px]">
                            <button
                              onClick={() => setFinalAnswer('yes')}
                                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  finalAnswer === 'yes'
                                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 font-bold'
                                  : 'bg-[#22252a] border-slate-800 text-slate-300 hover:bg-[#2b2f36]'
                              }`}
                            >
                               ○ Có. Đây là một quá trình phát triển liên tục, trong đó mỗi giai đoạn chuẩn bị cho bước chuyển tiếp theo.
                            </button>
                            <button
                              onClick={() => setFinalAnswer('no')}
                                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  finalAnswer === 'no'
                                  ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold'
                                  : 'bg-[#22252a] border-slate-800 text-slate-300 hover:bg-[#2b2f36]'
                              }`}
                            >
                               ○ Không. Các sự kiện tồn tại rời rạc và không tạo thành một quá trình phát triển có liên hệ với nhau.
                            </button>
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={handleFinalSubmit}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-sans font-bold text-[9px] py-2 px-5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono shadow-xs"
                            >
                              Nộp báo cáo thám tử
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Footer Book binding details */}
            <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[9px] font-mono text-[#a89575]/50 z-20 pointer-events-none">
              <span>Đại học FPT - MLN122 Project</span>
              {!roomOneCompleted && (
                <button 
                  onClick={handleResetProgress}
                  className="hover:underline hover:text-rose-600 font-bold pointer-events-auto cursor-pointer"
                >
                  [Xóa tiến trình điều tra]
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default InvestigationNotebook;
