'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileCheck2,
  Flag,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useMuseum, type RoomFiveFragmentId } from '@/context/MuseumContext';

type SummaryPhase = 'ordering' | 'question' | 'passport';

const FRAGMENTS: Array<{
  id: RoomFiveFragmentId;
  label: { vi: string; en: string };
  station: { vi: string; en: string };
  guidance: { vi: string; en: string };
}> = [
  {
    id: 'departure',
    label: { vi: 'Khởi hành', en: 'Departure' },
    station: { vi: 'Tư liệu Bến Nhà Rồng', en: 'Nhà Rồng source display' },
    guidance: { vi: 'Tìm màn hình hai ảnh lịch sử gần lối vào.', en: 'Find the two-image historical display near the entrance.' },
  },
  {
    id: 'identity',
    label: { vi: 'Danh tính', en: 'Identity' },
    station: { vi: 'Hồ sơ Văn Ba', en: 'Văn Ba profile' },
    guidance: { vi: 'Mở màn hình Hồ sơ Văn Ba và xem đủ ba ngày.', en: 'Open the Văn Ba profile and inspect all three dates.' },
  },
  {
    id: 'vessel',
    label: { vi: 'Phương tiện', en: 'Vessel' },
    station: { vi: 'Mô hình con tàu', en: 'Ship model' },
    guidance: { vi: 'Chạm mô hình tàu hoặc bệ trưng bày, khám phá 4 bộ phận.', en: 'Select the ship or its plinth and inspect four areas.' },
  },
  {
    id: 'labour',
    label: { vi: 'Lao động', en: 'Labour' },
    station: { vi: 'Công việc phụ bếp', en: 'Kitchen-assistant work' },
    guidance: { vi: 'Khôi phục bốn dữ kiện trong hồ sơ lao động.', en: 'Restore four facts in the employment record.' },
  },
  {
    id: 'voyage',
    label: { vi: 'Hải trình', en: 'Voyage' },
    station: { vi: 'Hải trình đầu tiên', en: 'The first voyage' },
    guidance: { vi: 'Dựng lại sáu chặng cảng trên bản đồ.', en: 'Reconstruct six port legs on the map.' },
  },
];

const HISTORY_CHAIN = [
  {
    id: 'aspiration',
    vi: 'Mang khát vọng tìm một con đường mới cho dân tộc',
    en: 'Carried the aspiration to seek a new path for the nation',
  },
  {
    id: 'departure',
    vi: 'Rời Bến Nhà Rồng ngày 05/06/1911',
    en: 'Departed Nhà Rồng Wharf on 5 June 1911',
  },
  {
    id: 'identity',
    vi: 'Dùng tên Văn Ba và lên tàu với tư cách người lao động',
    en: 'Used the name Văn Ba and boarded as a worker',
  },
  {
    id: 'labour',
    vi: 'Làm phụ bếp để tự trang trải và duy trì hành trình',
    en: 'Worked as a kitchen assistant to sustain the journey',
  },
  {
    id: 'voyage',
    vi: 'Qua nhiều cảng để trực tiếp quan sát thế giới',
    en: 'Travelled through many ports to observe the world directly',
  },
] as const;

const SHUFFLED_CHAIN_IDS = ['identity', 'voyage', 'aspiration', 'labour', 'departure'] as const;

const FINAL_ANSWERS = [
  {
    vi: 'Người đi du lịch bằng tàu để học kỹ thuật nấu ăn ở nước ngoài.',
    en: 'He travelled by ship as a tourist to study cooking abroad.',
  },
  {
    vi: 'Người rời Bến Nhà Rồng, dùng tên Văn Ba, xin làm phụ bếp trên tàu để tự lao động, đi qua nhiều cảng và quan sát thế giới nhằm tìm con đường giải phóng dân tộc.',
    en: 'He left Nhà Rồng Wharf, used the name Văn Ba, worked aboard as a kitchen assistant, travelled through many ports and observed the world while seeking a path to national liberation.',
  },
  {
    vi: 'Người được mời sang Pháp với tư cách hành khách và bắt đầu hoạt động sau khi tàu cập bến.',
    en: 'He was invited to France as a passenger and began his work only after arrival.',
  },
] as const;

export function RoomFiveMissionHud() {
  const {
    competitionMode,
    nickname,
    activeGallery,
    currentRoom,
    roomFiveProgress,
    completeRoomFiveMission,
    resetRoomFiveMission,
  } = useMuseum();
  const [expanded, setExpanded] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryPhase, setSummaryPhase] = useState<SummaryPhase>('ordering');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [wrongOrderId, setWrongOrderId] = useState<string | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const isRoomFive = currentRoom === 'gallery-three' || activeGallery?.id === 'gallery-three';
  if (!isRoomFive || competitionMode) return null;

  const completedCount = roomFiveProgress.fragments.length;
  const collectedAll = completedCount === FRAGMENTS.length;
  const nextFragment = FRAGMENTS.find((item) => !roomFiveProgress.fragments.includes(item.id));
  const lang = 'vi' as const;

  const openSummary = () => {
    setSummaryPhase(roomFiveProgress.completed ? 'passport' : 'ordering');
    setSummaryOpen(true);
    setConfirmReset(false);
  };

  const chooseOrderItem = (id: string) => {
    const expected = HISTORY_CHAIN[orderedIds.length]?.id;
    if (id !== expected) {
      setWrongOrderId(id);
      return;
    }
    setWrongOrderId(null);
    setOrderedIds((current) => [...current, id]);
  };

  const checkFinalAnswer = () => {
    setAnswerChecked(true);
    if (finalAnswer !== 1) return;
    completeRoomFiveMission();
    setSummaryPhase('passport');
  };

  const resetEverything = () => {
    resetRoomFiveMission();
    setOrderedIds([]);
    setWrongOrderId(null);
    setFinalAnswer(null);
    setAnswerChecked(false);
    setSummaryPhase('ordering');
    setSummaryOpen(false);
    setConfirmReset(false);
  };

  return (
    <>
      <aside className="nha-rong-typography pointer-events-auto absolute left-3 top-24 z-40 w-[min(310px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-amber-400/25 bg-slate-950/90 text-slate-100 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
          aria-expanded={expanded}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300"><FileCheck2 size={18} /></div>
          <div className="min-w-0 flex-1">
            <span className="block truncate font-sans text-xs font-black uppercase tracking-wide">
              {lang === 'vi' ? 'Hồ sơ hành trình Văn Ba' : 'Văn Ba journey record'}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] text-amber-300">{completedCount}/5 {lang === 'vi' ? 'mảnh hồ sơ' : 'fragments'}</span>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="h-1 bg-slate-800"><div className="h-full bg-gradient-to-r from-amber-400 to-teal-400 transition-all" style={{ width: `${completedCount * 20}%` }} /></div>

        {expanded && (
          <div className="space-y-3 border-t border-slate-800/80 p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {FRAGMENTS.map((fragment, index) => {
                const collected = roomFiveProgress.fragments.includes(fragment.id);
                const isNext = nextFragment?.id === fragment.id;
                return (
                  <div key={fragment.id} title={fragment.label[lang]} className={`flex h-8 items-center justify-center rounded-lg border font-mono text-[9px] font-bold ${collected ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : isNext ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-600'}`}>
                    {collected ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </div>
                );
              })}
            </div>

            {nextFragment ? (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 p-3">
                <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-cyan-300">{lang === 'vi' ? 'Trạm tiếp theo' : 'Next station'}</span>
                <strong className="mt-1 block font-sans text-xs text-white">{nextFragment.station[lang]}</strong>
                <p className="mt-1 font-sans text-[10px] leading-relaxed text-slate-400">{nextFragment.guidance[lang]}</p>
              </div>
            ) : (
              <button type="button" onClick={openSummary} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 font-sans text-xs font-black uppercase text-slate-950 hover:bg-amber-300">
                <Flag size={14} />
                {roomFiveProgress.completed
                  ? (lang === 'vi' ? 'Xem hộ chiếu 1911' : 'View 1911 passport')
                  : (lang === 'vi' ? 'Tổng kết nhiệm vụ' : 'Complete mission')}
              </button>
            )}
          </div>
        )}
      </aside>

      {summaryOpen && collectedAll && (
        <div className="nha-rong-typography pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <section className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-400/25 bg-[#07101f] p-5 text-slate-100 shadow-2xl md:p-8">
            <button type="button" onClick={() => setSummaryOpen(false)} className="absolute right-4 top-4 cursor-pointer rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:text-white"><X size={18} /></button>

            {summaryPhase === 'ordering' && (
              <div className="space-y-5">
                <div className="pr-10">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">{lang === 'vi' ? 'Tổng kết · Bước 1/2' : 'Summary · Step 1/2'}</span>
                  <h2 className="mt-2 font-sans text-2xl font-black md:text-3xl">{lang === 'vi' ? 'Dựng lại mạch lịch sử' : 'Rebuild the historical chain'}</h2>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
                  {HISTORY_CHAIN.map((item, index) => {
                    const placed = orderedIds[index] === item.id;
                    return (
                      <div key={item.id} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 ${placed ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-dashed border-slate-700 bg-slate-900/30'}`}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${placed ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>{placed ? <Check size={14} /> : index + 1}</span>
                        <span className={`font-sans text-base leading-relaxed ${placed ? 'text-slate-100' : 'text-slate-600'}`}>{placed ? item[lang] : (lang === 'vi' ? 'Chưa xác định' : 'Not identified')}</span>
                      </div>
                    );
                  })}
                </div>

                {orderedIds.length < HISTORY_CHAIN.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SHUFFLED_CHAIN_IDS.filter((id) => !orderedIds.includes(id)).map((id) => {
                      const item = HISTORY_CHAIN.find((entry) => entry.id === id)!;
                      return (
                        <button key={id} type="button" onClick={() => chooseOrderItem(id)} className={`cursor-pointer rounded-xl border p-4 text-left font-sans text-base leading-relaxed transition-colors ${wrongOrderId === id ? 'border-rose-400/50 bg-rose-500/15 text-rose-100' : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-amber-400/45 hover:bg-amber-500/8'}`}>{item[lang]}</button>
                      );
                    })}
                  </div>
                ) : (
                  <button type="button" onClick={() => setSummaryPhase('question')} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 font-sans text-sm font-black uppercase text-slate-950 hover:bg-amber-300">
                    {lang === 'vi' ? 'Trả lời câu hỏi trung tâm' : 'Answer the central question'} <ArrowRight size={16} />
                  </button>
                )}

                {wrongOrderId && <p className="font-sans text-xs text-rose-300" aria-live="polite">{lang === 'vi' ? 'Mốc này chưa đứng ở vị trí tiếp theo. Hãy dựa vào quan hệ nguyên nhân — hành động — trải nghiệm.' : 'This is not the next event. Follow motivation — action — experience.'}</p>}
              </div>
            )}

            {summaryPhase === 'question' && (
              <div className="space-y-5">
                <div className="pr-10">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300">{lang === 'vi' ? 'Tổng kết · Bước 2/2' : 'Summary · Step 2/2'}</span>
                  <h2 className="mt-2 font-sans text-2xl font-black md:text-3xl">{lang === 'vi' ? 'Câu hỏi xuyên suốt phòng' : 'The room’s central question'}</h2>
                  <p className="mt-3 rounded-2xl border border-teal-500/25 bg-teal-500/8 p-5 font-sans text-xl font-bold leading-relaxed text-white">
                    {lang === 'vi' ? 'Nguyễn Tất Thành đã bắt đầu hành trình tìm đường cứu nước bằng cách nào?' : 'How did Nguyễn Tất Thành begin his journey to seek a path for national liberation?'}
                  </p>
                </div>
                <div className="space-y-2">
                  {FINAL_ANSWERS.map((answer, index) => {
                    const selected = finalAnswer === index;
                    const correct = answerChecked && index === 1;
                    const wrong = answerChecked && selected && index !== 1;
                    return <button key={answer.vi} type="button" disabled={answerChecked} onClick={() => setFinalAnswer(index)} className={`w-full cursor-pointer rounded-xl border p-5 text-left font-sans text-base leading-relaxed disabled:cursor-default ${correct ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100' : wrong ? 'border-rose-400/50 bg-rose-500/15 text-rose-100' : selected ? 'border-teal-400/50 bg-teal-500/15 text-white' : 'border-slate-800 bg-slate-900/55 text-slate-300 hover:border-teal-400/40'}`}>{answer[lang]}</button>;
                  })}
                </div>
                {!answerChecked ? (
                  <button type="button" disabled={finalAnswer === null} onClick={checkFinalAnswer} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 font-sans text-sm font-black uppercase text-slate-950 hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-40"><ShieldCheck size={17} />{lang === 'vi' ? 'Hoàn thiện hồ sơ' : 'Complete the record'}</button>
                ) : finalAnswer !== 1 ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 font-sans text-xs text-rose-200"><p>{lang === 'vi' ? 'Câu trả lời chưa kết nối đủ nơi khởi hành, danh tính, lao động và trải nghiệm hải trình.' : 'The answer does not connect departure, identity, labour and voyage experience.'}</p><button type="button" onClick={() => { setAnswerChecked(false); setFinalAnswer(null); }} className="mt-2 font-bold underline underline-offset-2">{lang === 'vi' ? 'Chọn lại' : 'Choose again'}</button></div>
                ) : null}
              </div>
            )}

            {summaryPhase === 'passport' && (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400 text-slate-950"><Compass size={30} /></div>
                <div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300">{lang === 'vi' ? 'Nhiệm vụ hoàn thành' : 'Mission completed'}</span>
                  <h2 className="mt-2 font-sans text-3xl font-black text-white">{lang === 'vi' ? 'Hộ chiếu hành trình 1911' : 'Journey passport 1911'}</h2>
                  <p className="mt-2 font-sans text-sm text-slate-400">{nickname || (lang === 'vi' ? 'Khách tham quan' : 'Visitor')}</p>
                </div>
                <div className="grid grid-cols-5 gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                  {FRAGMENTS.map((fragment) => <div key={fragment.id} className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-1 py-3"><CheckCircle2 className="mx-auto text-emerald-300" size={18} /><span className="mt-1.5 block font-mono text-[7px] font-bold uppercase text-slate-300">{fragment.label[lang]}</span></div>)}
                </div>
                <blockquote className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 font-sans text-sm leading-relaxed text-slate-200">
                  {lang === 'vi' ? 'Từ Bến Nhà Rồng, bằng danh tính Văn Ba và công việc phụ bếp, Nguyễn Tất Thành tự lao động để bước vào hành trình quan sát thế giới và tìm con đường giải phóng dân tộc.' : 'From Nhà Rồng Wharf, using the name Văn Ba and working as a kitchen assistant, Nguyễn Tất Thành sustained a journey of observing the world and seeking a path to national liberation.'}
                </blockquote>
                <button type="button" onClick={() => setSummaryOpen(false)} className="w-full cursor-pointer rounded-xl bg-amber-400 px-4 py-3 font-sans text-sm font-black uppercase text-slate-950 hover:bg-amber-300">{lang === 'vi' ? 'Trở lại phòng trưng bày' : 'Return to gallery'}</button>
              </div>
            )}

            <div className="mt-6 border-t border-slate-800 pt-4 text-left">
              {!confirmReset ? (
                <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex cursor-pointer items-center gap-2 font-sans text-xs text-slate-500 hover:text-rose-300"><RotateCcw size={14} />{lang === 'vi' ? 'Làm lại toàn bộ nhiệm vụ phòng này' : 'Reset this room mission'}</button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/8 p-3"><span className="mr-auto font-sans text-xs text-rose-200">{lang === 'vi' ? 'Xóa 5 mảnh và hộ chiếu đã lưu?' : 'Clear all five fragments and the saved passport?'}</span><button type="button" onClick={() => setConfirmReset(false)} className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 font-sans text-xs text-slate-300">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button><button type="button" onClick={resetEverything} className="cursor-pointer rounded-lg bg-rose-500 px-3 py-1.5 font-sans text-xs font-bold text-white">{lang === 'vi' ? 'Xóa tiến độ' : 'Clear progress'}</button></div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default RoomFiveMissionHud;
