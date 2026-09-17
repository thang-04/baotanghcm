'use client';

import React, { useState } from 'react';
import { Check, Clock3, HelpCircle, IdCard, Ship, UserRound } from 'lucide-react';

type Language = 'vi' | 'en';

interface VanBaProfileProps {
  language: Language;
  setLanguage: (language: Language) => void;
  completed?: boolean;
  onComplete?: () => void;
}

const PROFILE_DATES = [
  {
    date: '02.06.1911',
    title: { vi: 'Xin làm việc trên tàu', en: 'Applied to work aboard' },
    text: {
      vi: 'Nguyễn Tất Thành gặp thuyền trưởng Louis Édouard Maisen và xin một công việc trên tàu Amiral Latouche-Tréville.',
      en: 'Nguyễn Tất Thành met Captain Louis Édouard Maisen and asked for work aboard the Amiral Latouche-Tréville.',
    },
    icon: UserRound,
  },
  {
    date: '03.06.1911',
    title: { vi: 'Nhận tên mới: Văn Ba', en: 'A new name: Văn Ba' },
    text: {
      vi: 'Anh được nhận làm phụ bếp, mang tên Văn Ba trên thẻ nhân viên và nhận mức lương 45 franc mỗi tháng.',
      en: 'He was hired as a kitchen assistant, listed as Văn Ba on his employee card, with a monthly wage of 45 francs.',
    },
    icon: IdCard,
  },
  {
    date: '05.06.1911',
    title: { vi: 'Rời Bến Nhà Rồng', en: 'Departure from Nhà Rồng Wharf' },
    text: {
      vi: 'Tàu rời bến sông Sài Gòn với 72 thủy thủ. Công việc lao động trên tàu mở đường cho chuyến đi tìm hiểu thế giới.',
      en: 'The ship left Sài Gòn with 72 crew members. Working aboard made the journey to observe the world possible.',
    },
    icon: Ship,
  },
];

const ANSWERS = [
  {
    vi: 'Được cấp học bổng để sang Pháp học tập',
    en: 'He received a scholarship to study in France',
  },
  {
    vi: 'Xin làm phụ bếp và lao động để tự trang trải chuyến đi',
    en: 'He worked as a kitchen assistant to support his journey',
  },
  {
    vi: 'Được mời lên tàu với tư cách hành khách',
    en: 'He was invited aboard as a passenger',
  },
];

export function VanBaProfile({ completed = false, onComplete }: VanBaProfileProps) {
  const language: Language = 'vi';
  const [activeDate, setActiveDate] = useState(0);
  const [visitedDates, setVisitedDates] = useState<number[]>(completed ? [0, 1, 2] : [0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(completed ? 1 : null);
  const [answerChecked, setAnswerChecked] = useState(completed);

  const activeItem = PROFILE_DATES[activeDate];
  const ActiveIcon = activeItem.icon;
  const allDatesVisited = visitedDates.length === PROFILE_DATES.length;
  const isCorrect = completed || (answerChecked && selectedAnswer === 1);

  const checkAnswer = () => {
    setAnswerChecked(true);
    if (selectedAnswer === 1) onComplete?.();
  };

  const openDate = (index: number) => {
    setActiveDate(index);
    setVisitedDates((dates) => dates.includes(index) ? dates : [...dates, index]);
  };

  return (
    <div className="space-y-5">
      <div className="pr-12">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
          <IdCard size={15} />
          {language === 'vi' ? 'Hồ sơ tương tác' : 'Interactive profile'}
        </div>
        <h2 className="font-sans text-2xl font-black leading-tight text-white lg:text-3xl">
          {language === 'vi' ? 'Hồ sơ Văn Ba' : 'The Văn Ba profile'}
        </h2>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
          <Clock3 size={13} />
          {language === 'vi' ? 'Chọn từng mốc để mở hồ sơ' : 'Select each date to reveal the profile'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PROFILE_DATES.map((item, index) => {
            const visited = visitedDates.includes(index);
            const active = activeDate === index;
            return (
              <button
                key={item.date}
                type="button"
                onClick={() => openDate(index)}
                className={`relative cursor-pointer rounded-xl border px-2 py-3 text-center transition-colors ${active ? 'border-amber-400 bg-amber-500/15 text-amber-200' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-amber-400/40 hover:text-white'}`}
              >
                {visited && <Check className="absolute right-1.5 top-1.5 text-emerald-400" size={11} />}
                <span className="font-mono text-xs font-black">{item.date.slice(0, 5)}</span>
                <span className="mt-1 block font-mono text-[8px] text-slate-500">1911</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
            <ActiveIcon size={22} />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold tracking-widest text-amber-400">{activeItem.date}</span>
            <h3 className="mt-1 font-sans text-lg font-bold text-white">{activeItem.title[language]}</h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-300">{activeItem.text[language]}</p>
          </div>
        </div>
      </div>

      {!allDatesVisited ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900/35 p-3 text-center font-sans text-xs text-slate-400">
          {language === 'vi'
            ? `Đã mở ${visitedDates.length}/3 mốc. Hãy xem đủ ba ngày để mở câu hỏi.`
            : `${visitedDates.length}/3 dates opened. View all three to unlock the question.`}
        </p>
      ) : (
        <div className="space-y-3 rounded-2xl border border-teal-500/25 bg-teal-500/8 p-4">
          <div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest text-teal-300">
            <HelpCircle size={14} />
            {language === 'vi' ? 'Câu hỏi kết nối' : 'Reflection question'}
          </div>
          <p className="font-sans text-lg font-bold leading-relaxed text-white">
            {language === 'vi'
              ? 'Điều gì giúp Văn Ba có thể bắt đầu hành trình trên con tàu này?'
              : 'What enabled Văn Ba to begin his journey aboard this ship?'}
          </p>
          <div className="space-y-2">
            {ANSWERS.map((answer, index) => {
              const selected = selectedAnswer === index;
              const correctOption = answerChecked && index === 1;
              const wrongOption = answerChecked && selected && index !== 1;
              return (
                <button
                  key={answer.vi}
                  type="button"
                  disabled={answerChecked}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full cursor-pointer rounded-xl border p-4 text-left font-sans text-base leading-relaxed transition-colors disabled:cursor-default ${correctOption ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' : wrongOption ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' : selected ? 'border-teal-400/50 bg-teal-500/15 text-teal-100' : 'border-slate-800 bg-slate-950/45 text-slate-300 hover:border-teal-400/40'}`}
                >
                  {answer[language]}
                </button>
              );
            })}
          </div>
          {!answerChecked ? (
            <button
              type="button"
              disabled={selectedAnswer === null}
              onClick={checkAnswer}
              className="w-full cursor-pointer rounded-xl bg-teal-400 px-4 py-3 font-sans text-xs font-black uppercase text-slate-950 hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {language === 'vi' ? 'Kiểm tra câu trả lời' : 'Check answer'}
            </button>
          ) : (
            <div className={`rounded-xl border p-3 font-sans text-xs leading-relaxed ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`} aria-live="polite">
              {isCorrect
                ? (language === 'vi' ? 'Chính xác. Văn Ba lên tàu với tư cách một người lao động, tự làm việc để thực hiện hành trình của mình.' : 'Correct. Văn Ba boarded as a worker, earning his way through the journey.')
                : (language === 'vi' ? 'Chưa đúng. Hãy xem lại mốc 03/06/1911 rồi thử lại.' : 'Not quite. Review 3 June 1911 and try again.')}
              {!isCorrect && (
                <button
                  type="button"
                  onClick={() => { setSelectedAnswer(null); setAnswerChecked(false); }}
                  className="mt-2 block cursor-pointer font-bold underline underline-offset-2"
                >
                  {language === 'vi' ? 'Thử lại' : 'Try again'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VanBaProfile;
