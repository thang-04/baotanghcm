'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { CheckCircle2, XCircle, AlertCircle, FileText, Vote, Volume2, LogOut, Info } from 'lucide-react';

export const DelegateTerminalModal: React.FC = () => {
  const { language, nickname, sittingPosition, setSittingPosition, socket } = useMuseum();
  const [activeTab, setActiveTab] = useState<'home' | 'docs' | 'vote' | 'speak'>('home');
  
  // Voting states
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteChoice, setVoteChoice] = useState<'approve' | 'disapprove' | 'abstain' | null>(null);
  const [tally, setTally] = useState({ approve: 88, disapprove: 2, abstain: 1 });
  
  // Speaking states
  const [speakRegistered, setSpeakRegistered] = useState<boolean>(false);

  // Play a UI audio effect
  const playSound = (type: 'click' | 'vote' | 'bell' | 'exit') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'vote') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'bell') {
        // Congress chime sound (gong/bell)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'exit') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn('Audio Context is not supported or blocked by browser policy');
    }
  };

  // Reset states when standing up or sitting down
  useEffect(() => {
    if (!sittingPosition) {
      setHasVoted(false);
      setVoteChoice(null);
      setSpeakRegistered(false);
      setActiveTab('home');
    }
  }, [sittingPosition]);

  if (!sittingPosition) return null;

  const handleVote = (choice: 'approve' | 'disapprove' | 'abstain') => {
    if (hasVoted) return;
    playSound('vote');
    setVoteChoice(choice);
    setHasVoted(true);
    
    // Increment local simulated tally
    setTally(prev => ({
      ...prev,
      [choice]: prev[choice] + 1
    }));

    // Broadcast vote event to other users via socket
    socket?.emit('send-message', {
      text: `🗳️ [BIỂU QUYẾT] Đại biểu ${nickname} đã biểu quyết "${
        choice === 'approve' ? 'TÁN THÀNH' : choice === 'disapprove' ? 'KHÔNG TÁN THÀNH' : 'Ý KIẾN KHÁC'
      }"!`,
    });
  };

  const handleRegisterSpeak = () => {
    if (speakRegistered) return;
    playSound('bell');
    setSpeakRegistered(true);

    // Broadcast speaking status to other users
    socket?.emit('send-message', {
      text: `🎤 [ĐĂNG KÝ PHÁT BIỂU] Đại biểu ${nickname} đăng ký phát biểu ý kiến thảo luận về học phần MLN122!`,
    });
  };

  const handleStandUp = () => {
    playSound('exit');
    setSittingPosition(null);
  };

  // Total simulated votes
  const totalVotes = tally.approve + tally.disapprove + tally.abstain;
  const pctApprove = ((tally.approve / totalVotes) * 100).toFixed(1);
  const pctDisapprove = ((tally.disapprove / totalVotes) * 100).toFixed(1);
  const pctAbstain = ((tally.abstain / totalVotes) * 100).toFixed(1);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in select-none">
      {/* Tablet Terminal Frame */}
      <div className="w-full max-w-3xl bg-slate-900 border-4 border-slate-750 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/20 flex flex-col h-[520px] sm:h-[480px]">
        {/* Terminal Header Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase">
              {language === 'vi' ? 'THIẾT BỊ ĐẠI BIỂU HỘI NGHỊ DIÊN HỒNG' : 'DELEGATE TERMINAL SYSTEM'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-900 text-slate-400 px-3 py-1 rounded-full font-bold border border-slate-800">
              👤 {nickname}
            </span>
          </div>
        </div>

        {/* Outer Tabs / Main Grid */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Menu */}
          <div className="w-48 bg-slate-950/65 border-r border-slate-850 p-3 flex flex-col gap-1.5 justify-between">
            <div className="space-y-1.5">
              <button
                onClick={() => { playSound('click'); setActiveTab('home'); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'home' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Info size={14} />
                {language === 'vi' ? 'Tổng quan' : 'Overview'}
              </button>

              <button
                onClick={() => { playSound('click'); setActiveTab('docs'); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'docs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <FileText size={14} />
                {language === 'vi' ? 'Tài liệu Đại hội' : 'Documents'}
              </button>

              <button
                onClick={() => { playSound('click'); setActiveTab('vote'); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'vote' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Vote size={14} />
                {language === 'vi' ? 'Biểu quyết điện tử' : 'E-Voting'}
              </button>

              <button
                onClick={() => { playSound('click'); setActiveTab('speak'); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'speak' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Volume2 size={14} />
                {language === 'vi' ? 'Đăng ký phát biểu' : 'Request Speech'}
              </button>
            </div>

            <button
              onClick={handleStandUp}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 transition-all border border-rose-500/20 hover:border-rose-400 cursor-pointer"
            >
              <LogOut size={14} />
              {language === 'vi' ? 'Đứng dậy' : 'Stand Up'}
            </button>
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
            {/* OVERVIEW TAB */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                <div className="bg-cyan-950/20 border border-cyan-800/30 p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-cyan-400">
                    {language === 'vi' ? 'Thông tin phiên họp' : 'Session Status'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {language === 'vi' 
                      ? 'Chào mừng đại biểu đến với Hội trường Quốc hội mô phỏng phục vụ chuyên đề nghiên cứu lịch sử cách mạng & lý luận đường lối của Đảng (Học phần MLN122).'
                      : 'Welcome to the Assembly Hall simulation for revolutionary history & ideological study projects (Course MLN122).'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                      {language === 'vi' ? 'Mã số đại biểu' : 'Delegate ID'}
                    </span>
                    <span className="text-sm font-mono text-white block mt-1 font-bold">
                      #DEL-{Math.floor(1000 + Math.random() * 9000)}
                    </span>
                  </div>
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                      {language === 'vi' ? 'Tình trạng thiết bị' : 'Device Health'}
                    </span>
                    <span className="text-sm text-emerald-400 block mt-1 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {language === 'vi' ? 'KẾT NỐI TỐT' : 'CONNECTED'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/20 border border-slate-850/60 p-4 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    {language === 'vi' ? 'Hãy chọn các thẻ bên trái để đọc tài liệu học tập hoặc biểu quyết thảo luận.' : 'Choose tabs on the left to read resources or vote on resolutions.'}
                  </p>
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'docs' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  📚 {language === 'vi' ? 'Văn kiện lý luận chính trị tiêu biểu' : 'Revolutionary Documents'}
                </h3>
                
                <div className="space-y-3">
                  {/* Doc 1 */}
                  <div className="bg-slate-950/45 border border-slate-850/80 p-4 rounded-xl space-y-2 hover:border-cyan-500/25 transition-all">
                    <h4 className="text-xs font-bold text-cyan-400">
                      1. Đề cương về Văn hóa Việt Nam (1943)
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {language === 'vi' 
                        ? 'Do Tổng Bí thư Trường Chinh soạn thảo, xác định ba nguyên tắc phát triển văn hóa cách mạng: Dân tộc hóa, Đại chúng hóa và Khoa học hóa. Đây là bản cương lĩnh văn hóa đầu tiên đặt nền móng lý luận bền vững.'
                        : 'Drafted by Sec. Truong Chinh, establishing three core principles of revolutionary culture: Nationalization, Popularization, and Scientification.'}
                    </p>
                  </div>

                  {/* Doc 2 */}
                  <div className="bg-slate-950/45 border border-slate-850/80 p-4 rounded-xl space-y-2 hover:border-cyan-500/25 transition-all">
                    <h4 className="text-xs font-bold text-cyan-400">
                      2. Nghị quyết TW 5 Khóa VIII (1998)
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {language === 'vi' 
                        ? 'Nghị quyết lịch sử về xây dựng và phát triển nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc, định hướng mục tiêu đoàn kết toàn dân và bảo tồn di sản bền vững.'
                        : 'Historic resolution focusing on developing an advanced Vietnamese culture deeply imbued with national identity.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VOTING TAB */}
            {activeTab === 'vote' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Vote size={16} className="text-cyan-400" />
                  {language === 'vi' ? 'Phiên biểu quyết trực tuyến' : 'Live Voting Session'}
                </h3>

                <div className="bg-slate-950/45 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {language === 'vi' ? 'Nghị quyết biểu quyết' : 'Current Draft'}
                  </span>
                  
                  <p className="text-xs text-white font-semibold leading-relaxed">
                    {language === 'vi'
                      ? 'Nghị quyết số 122/NQ-DH: Tán thành việc áp dụng công nghệ số, thực tế ảo (VR) và AI để bảo tồn toàn bộ di sản lịch sử cách mạng hào hùng của dân tộc?'
                      : 'Resolution 122/NQ-DH: Approve the complete digitalization, VR, and AI deployment to preserve all historic revolutionary sites national-wide?'}
                  </p>
                </div>

                {!hasVoted ? (
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <button
                      onClick={() => handleVote('approve')}
                      className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 hover:border-emerald-400 py-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      {language === 'vi' ? 'TÁN THÀNH' : 'APPROVE'}
                    </button>
                    <button
                      onClick={() => handleVote('disapprove')}
                      className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border border-rose-500/20 hover:border-rose-400 py-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={16} />
                      {language === 'vi' ? 'KHÔNG TÁN THÀNH' : 'DISAPPROVE'}
                    </button>
                    <button
                      onClick={() => handleVote('abstain')}
                      className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 hover:border-amber-400 py-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle size={16} />
                      {language === 'vi' ? 'Ý KIẾN KHÁC' : 'ABSTAIN'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4 animate-scale-in">
                    <div className="text-center">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        ✓ {language === 'vi' ? 'Đã ghi nhận biểu quyết' : 'Vote Submitted'}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-2.5">
                        {language === 'vi' 
                          ? `Lựa chọn của bạn: ${voteChoice === 'approve' ? 'Tán thành' : voteChoice === 'disapprove' ? 'Không tán thành' : 'Không biểu quyết'}`
                          : `Your choice: ${voteChoice?.toUpperCase()}`}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-2 border-t border-slate-850">
                      {/* Bar 1 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-emerald-400">{language === 'vi' ? 'Tán thành' : 'Approve'}</span>
                          <span className="text-white font-mono">{pctApprove}% ({tally.approve})</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pctApprove}%` }} />
                        </div>
                      </div>

                      {/* Bar 2 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-rose-400">{language === 'vi' ? 'Không tán thành' : 'Disapprove'}</span>
                          <span className="text-white font-mono">{pctDisapprove}% ({tally.disapprove})</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pctDisapprove}%` }} />
                        </div>
                      </div>

                      {/* Bar 3 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-amber-400">{language === 'vi' ? 'Ý kiến khác' : 'Abstain'}</span>
                          <span className="text-white font-mono">{pctAbstain}% ({tally.abstain})</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pctAbstain}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SPEAK TAB */}
            {activeTab === 'speak' && (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/25 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                  <Volume2 size={28} />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {language === 'vi' ? 'Đăng ký phát biểu thảo luận' : 'Discussion Registration'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'vi'
                      ? 'Đăng ký quyền phát biểu của bạn tại Hội trường. Ý kiến đóng góp sẽ được ghi nhận và hiển thị trong kênh chat chung để cùng trao đổi học thuật.'
                      : 'Request to raise your hand to speak in the hall. Your request will notify other delegates via general chat.'}
                  </p>
                </div>

                {!speakRegistered ? (
                  <button
                    onClick={handleRegisterSpeak}
                    className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-transform hover:scale-103 active:scale-97 cursor-pointer uppercase tracking-wider shadow-md shadow-cyan-500/15"
                  >
                    {language === 'vi' ? 'Đăng ký ngay' : 'Request to Speak'}
                  </button>
                ) : (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl max-w-sm mx-auto text-emerald-400 text-xs font-bold animate-scale-in">
                    🎤 {language === 'vi' ? 'Đã đăng ký! Vui lòng chờ Chủ tọa gọi tên.' : 'Registered! Please wait for the chairperson.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegateTerminalModal;
