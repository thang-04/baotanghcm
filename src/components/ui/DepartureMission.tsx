'use client';

import React, { useState } from 'react';
import { CalendarDays, Check, Eye, Images, MapPin, RotateCcw, X } from 'lucide-react';

type Language = 'vi' | 'en';

interface DepartureMissionProps {
  language: Language;
  completed?: boolean;
  onComplete?: () => void;
  onReset?: () => void;
}

const SOURCES = [
  {
    src: '/exhibits/nha-rong-harbor-1911.png',
    caption: {
      vi: 'Bến cảng Sài Gòn và Nhà Rồng đầu thế kỷ XX',
      en: 'Saigon harbour and Nhà Rồng in the early twentieth century',
    },
  },
  {
    src: '/exhibits/nha-rong-postcard-1911.png',
    caption: {
      vi: 'Bưu ảnh khu vực Nhà Rồng nhìn từ bờ sông',
      en: 'A postcard view of the Nhà Rồng waterfront',
    },
  },
] as const;

const ANSWERS = [
  {
    vi: 'Bến Nhà Rồng, Sài Gòn — ngày 05/06/1911',
    en: 'Nhà Rồng Wharf, Saigon — 5 June 1911',
  },
  {
    vi: 'Cảng Marseille, Pháp — ngày 06/07/1911',
    en: 'Port of Marseille, France — 6 July 1911',
  },
  {
    vi: 'Cảng Keppel, Singapore — ngày 08/06/1911',
    en: 'Keppel Harbour, Singapore — 8 June 1911',
  },
] as const;

export function DepartureMission({ completed = false, onComplete, onReset }: DepartureMissionProps) {
  const language: Language = 'vi';
  const [activeSource, setActiveSource] = useState(0);
  const [viewedSources, setViewedSources] = useState<number[]>(completed ? [0, 1] : [0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(completed ? 0 : null);
  const [checked, setChecked] = useState(completed);

  const openedAll = viewedSources.length === SOURCES.length;
  const correct = completed || (checked && selectedAnswer === 0);

  const showSource = (index: number) => {
    setActiveSource(index);
    setViewedSources((current) => current.includes(index) ? current : [...current, index]);
  };

  const checkAnswer = () => {
    setChecked(true);
    if (selectedAnswer === 0) onComplete?.();
  };

  const retry = () => {
    setSelectedAnswer(null);
    setChecked(false);
  };

  const reset = () => {
    setActiveSource(0);
    setViewedSources([0]);
    setSelectedAnswer(null);
    setChecked(false);
    onReset?.();
  };

  return (
    <div className="space-y-5">
      <div className="pr-12">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
          <Images size={15} />
          {language === 'vi' ? 'Trạm 1 · Tư liệu khởi hành' : 'Station 1 · Departure sources'}
        </div>
        <h2 className="font-sans text-2xl font-black leading-tight text-white lg:text-3xl">
          {language === 'vi' ? 'Xác định thời khắc khởi hành' : 'Identify the departure moment'}
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/65">
        <div className="relative aspect-[16/8] bg-black">
          <img
            src={SOURCES[activeSource].src}
            alt={SOURCES[activeSource].caption[language]}
            className="h-full w-full object-contain"
          />
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/80 px-2.5 py-1 font-mono text-[9px] text-white backdrop-blur">
            {activeSource + 1}/2
          </span>
        </div>
        <div className="border-t border-slate-800 p-3">
          <p className="mb-3 font-sans text-xs text-slate-300">{SOURCES[activeSource].caption[language]}</p>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((source, index) => (
              <button
                key={source.src}
                type="button"
                onClick={() => showSource(index)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 font-sans text-xs font-bold transition-colors ${activeSource === index ? 'border-amber-400 bg-amber-500/15 text-amber-200' : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                {viewedSources.includes(index) ? <Check size={14} className="text-emerald-400" /> : <Eye size={14} />}
                {language === 'vi' ? `Tư liệu ${index + 1}` : `Source ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!openedAll ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900/45 p-3 text-center font-sans text-xs text-slate-400">
          {language === 'vi' ? 'Hãy mở tư liệu còn lại để đối chiếu bối cảnh.' : 'Open the remaining source to compare the setting.'}
        </p>
      ) : (
        <div className="space-y-3 rounded-2xl border border-teal-500/25 bg-teal-500/8 p-4">
          <div className="flex items-center gap-2 text-teal-300">
            <MapPin size={15} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
              {language === 'vi' ? 'Câu hỏi xác minh' : 'Verification question'}
            </span>
          </div>
          <p className="font-sans text-lg font-bold leading-relaxed text-white">
            {language === 'vi' ? 'Nguyễn Tất Thành rời Tổ quốc từ đâu và vào ngày nào?' : 'From where and on what date did Nguyễn Tất Thành leave Vietnam?'}
          </p>
          <div className="space-y-2">
            {ANSWERS.map((answer, index) => {
              const selected = selectedAnswer === index;
              const showCorrect = checked && index === 0;
              const showWrong = checked && selected && index !== 0;
              return (
                <button
                  key={answer.vi}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full cursor-pointer rounded-xl border p-4 text-left font-sans text-base leading-relaxed transition-colors disabled:cursor-default ${showCorrect ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100' : showWrong ? 'border-rose-400/50 bg-rose-500/15 text-rose-100' : selected ? 'border-teal-400/50 bg-teal-500/15 text-white' : 'border-slate-800 bg-slate-950/45 text-slate-300 hover:border-teal-400/40'}`}
                >
                  {answer[language]}
                </button>
              );
            })}
          </div>

          {!checked ? (
            <button
              type="button"
              disabled={selectedAnswer === null}
              onClick={checkAnswer}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 font-sans text-xs font-black uppercase text-slate-950 hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CalendarDays size={15} />
              {language === 'vi' ? 'Xác nhận mốc lịch sử' : 'Confirm historical marker'}
            </button>
          ) : (
            <div className={`rounded-xl border p-3 font-sans text-xs leading-relaxed ${correct ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-rose-500/30 bg-rose-500/10 text-rose-100'}`} aria-live="polite">
              <div className="flex items-start gap-2">
                {correct ? <Check size={15} className="shrink-0" /> : <X size={15} className="shrink-0" />}
                <p>{correct
                  ? (language === 'vi' ? 'Chính xác. Bạn đã nhận mảnh hồ sơ: KHỞI HÀNH.' : 'Correct. You received the DEPARTURE record fragment.')
                  : (language === 'vi' ? 'Chưa đúng. Hãy đối chiếu địa danh và ngày trên hai tư liệu.' : 'Not yet. Compare the place and date shown by both sources.')}</p>
              </div>
              {!correct && <button type="button" onClick={retry} className="mt-2 font-bold underline underline-offset-2">{language === 'vi' ? 'Thử lại' : 'Try again'}</button>}
            </div>
          )}
        </div>
      )}

      {completed && (
        <button type="button" onClick={reset} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-sans text-xs font-bold text-slate-300 hover:bg-slate-800">
          <RotateCcw size={15} />
          {language === 'vi' ? 'Làm lại trạm này' : 'Restart this station'}
        </button>
      )}
    </div>
  );
}

export default DepartureMission;
