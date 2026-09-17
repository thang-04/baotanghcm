'use client';

import React, { useState } from 'react';
import {
  Check,
  ClipboardCheck,
  Clock3,
  History,
  RotateCcw,
  Utensils,
  X,
} from 'lucide-react';

type Language = 'vi' | 'en';

interface GalleyWorkMissionProps {
  language: Language;
  setLanguage: (language: Language) => void;
  nickname?: string;
  completed?: boolean;
  onComplete?: () => void;
  onReset?: () => void;
}

interface HistoricalField {
  id: 'name' | 'job' | 'hours' | 'meaning';
  label: Record<Language, string>;
  question: Record<Language, string>;
  options: Array<Record<Language, string>>;
  correctIndex: number;
}

const HISTORICAL_FIELDS: HistoricalField[] = [
  {
    id: 'name',
    label: { vi: 'Tên sử dụng', en: 'Name used aboard' },
    question: {
      vi: 'Nguyễn Tất Thành sử dụng tên nào khi làm việc trên tàu?',
      en: 'Which name did Nguyễn Tất Thành use while working aboard?',
    },
    options: [
      { vi: 'Nguyễn Ái Quốc', en: 'Nguyễn Ái Quốc' },
      { vi: 'Văn Ba', en: 'Văn Ba' },
      { vi: 'Nguyễn Sinh Cung', en: 'Nguyễn Sinh Cung' },
    ],
    correctIndex: 1,
  },
  {
    id: 'job',
    label: { vi: 'Công việc', en: 'Occupation' },
    question: {
      vi: 'Văn Ba được nhận làm công việc gì?',
      en: 'What job was Văn Ba hired to do?',
    },
    options: [
      { vi: 'Hành khách', en: 'Passenger' },
      { vi: 'Thủy thủ lái tàu', en: 'Helmsman' },
      { vi: 'Phụ bếp', en: 'Kitchen assistant' },
    ],
    correctIndex: 2,
  },
  {
    id: 'hours',
    label: { vi: 'Thời gian lao động', en: 'Working hours' },
    question: {
      vi: 'Theo tư liệu, một ngày lao động của Văn Ba kéo dài khoảng bao lâu?',
      en: 'According to the historical account, how long was Văn Ba\'s working day?',
    },
    options: [
      { vi: 'Khoảng 4 giờ sáng đến 9 giờ tối', en: 'About 4 a.m. to 9 p.m.' },
      { vi: 'Khoảng 8 giờ sáng đến 5 giờ chiều', en: 'About 8 a.m. to 5 p.m.' },
      { vi: 'Chỉ làm việc khi tàu cập cảng', en: 'Only while the ship was in port' },
    ],
    correctIndex: 0,
  },
  {
    id: 'meaning',
    label: { vi: 'Ý nghĩa', en: 'Historical meaning' },
    question: {
      vi: 'Công việc phụ bếp có ý nghĩa gì đối với hành trình?',
      en: 'What did kitchen work mean for the journey?',
    },
    options: [
      {
        vi: 'Lao động để thực hiện và duy trì chuyến đi tìm hiểu thế giới',
        en: 'Working to undertake and sustain the journey of learning about the world',
      },
      {
        vi: 'Tham gia chuyến đi với tư cách một hành khách du lịch',
        en: 'Joining the voyage as a tourist passenger',
      },
      {
        vi: 'Chỉ học kỹ thuật nấu ăn để trở về nước',
        en: 'Only learning cooking techniques before returning home',
      },
    ],
    correctIndex: 0,
  },
];

export function GalleyWorkMission({
  nickname,
  completed: externallyCompleted = false,
  onComplete,
  onReset,
}: GalleyWorkMissionProps) {
  const language: Language = 'vi';
  const storageKey = `room5_galley_mission_${nickname || 'guest'}`;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(() => (
    externallyCompleted || (typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === 'completed')
  ));

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === HISTORICAL_FIELDS.length;
  const allCorrect = HISTORICAL_FIELDS.every((field) => answers[field.id] === field.correctIndex);

  const selectAnswer = (fieldId: HistoricalField['id'], optionIndex: number) => {
    if (completed) return;
    setAnswers((current) => ({ ...current, [fieldId]: optionIndex }));
    setChecked(false);
  };

  const checkProfile = () => {
    if (!allAnswered) return;
    setChecked(true);
    if (!allCorrect) return;

    setCompleted(true);
    onComplete?.();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, 'completed');
    }
  };

  const resetMission = () => {
    setAnswers({});
    setChecked(false);
    setCompleted(false);
    onReset?.();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="space-y-5">
      <div className="pr-12">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
          <ClipboardCheck size={15} />
          {language === 'vi' ? 'Nhiệm vụ lịch sử' : 'Historical mission'}
        </div>
        <h2 className="font-sans text-2xl font-black leading-tight text-white lg:text-3xl">
          {language === 'vi' ? 'Khôi phục hồ sơ lao động' : 'Restore the employment record'}
        </h2>
      </div>

      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/8 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-400/10 text-orange-300">
            <History size={20} />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-orange-300">
              {language === 'vi' ? 'Tư liệu cần phục dựng' : 'Record to restore'}
            </span>
            <p className="mt-1.5 font-sans text-xs leading-relaxed text-slate-300">
              {language === 'vi'
                ? 'Ngày 03/06/1911, Nguyễn Tất Thành được nhận làm việc trên tàu Amiral Latouche-Tréville. Hãy chọn đúng dữ kiện để hoàn thiện hồ sơ.'
                : 'On 3 June 1911, Nguyễn Tất Thành was hired aboard the Amiral Latouche-Tréville. Select the correct facts to complete his record.'}
            </p>
          </div>
        </div>
      </div>

      {!completed ? (
        <>
          <div className="space-y-3">
            {HISTORICAL_FIELDS.map((field, fieldIndex) => {
              const selected = answers[field.id];
              const fieldCorrect = selected === field.correctIndex;
              const showIncorrect = checked && !fieldCorrect;

              return (
                <section
                  key={field.id}
                  className={`rounded-2xl border p-4 transition-colors ${showIncorrect ? 'border-rose-500/35 bg-rose-500/5' : 'border-slate-800 bg-slate-900/45'}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        {language === 'vi' ? `Dữ kiện ${fieldIndex + 1}/4` : `Fact ${fieldIndex + 1}/4`} · {field.label[language]}
                      </span>
                      <p className="mt-2 font-sans text-lg font-semibold leading-relaxed text-white">{field.question[language]}</p>
                    </div>
                    {checked && fieldCorrect && <Check className="mt-1 shrink-0 text-emerald-400" size={18} />}
                    {showIncorrect && <X className="mt-1 shrink-0 text-rose-400" size={18} />}
                  </div>

                  <div className="grid gap-2 lg:grid-cols-3">
                    {field.options.map((option, optionIndex) => {
                      const isSelected = selected === optionIndex;
                      return (
                        <button
                          key={option.vi}
                          type="button"
                          onClick={() => selectAnswer(field.id, optionIndex)}
                          className={`min-h-16 cursor-pointer rounded-xl border p-4 text-left font-sans text-base leading-relaxed transition-colors ${
                            isSelected
                              ? showIncorrect
                                ? 'border-rose-400/55 bg-rose-500/15 text-rose-100'
                                : 'border-amber-400/55 bg-amber-500/15 text-amber-100'
                              : 'border-slate-800 bg-slate-950/45 text-slate-400 hover:border-amber-400/35 hover:text-slate-200'
                          }`}
                        >
                          {option[language]}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {checked && !allCorrect && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-rose-200" aria-live="polite">
              <X className="mt-0.5 shrink-0" size={15} />
              <p className="font-sans text-xs leading-relaxed">
                {language === 'vi'
                  ? 'Một số dữ kiện chưa đúng. Các ô cần sửa đã được đánh dấu; hãy chọn lại rồi kiểm tra.'
                  : 'Some facts are incorrect. Review the marked fields, change your choices and check again.'}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!allAnswered}
            onClick={checkProfile}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 font-sans text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ClipboardCheck size={17} />
            {language === 'vi'
              ? (allAnswered ? 'Kiểm tra hồ sơ' : `Đã điền ${answeredCount}/4 dữ kiện`)
              : (allAnswered ? 'Check the record' : `${answeredCount}/4 facts completed`)}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
            <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
              <Check size={26} strokeWidth={3} />
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              {language === 'vi' ? 'Hồ sơ đã được khôi phục' : 'Record restored'}
            </span>
            <h3 className="mt-2 font-sans text-xl font-black text-white">
              {language === 'vi' ? 'LAO ĐỘNG — PHỤ BẾP' : 'LABOUR — KITCHEN ASSISTANT'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              [language === 'vi' ? 'Tên sử dụng' : 'Name', 'Văn Ba'],
              [language === 'vi' ? 'Công việc' : 'Occupation', language === 'vi' ? 'Phụ bếp' : 'Kitchen assistant'],
              [language === 'vi' ? 'Thời gian' : 'Hours', language === 'vi' ? '04:00 — 21:00' : '4 a.m. — 9 p.m.'],
              [language === 'vi' ? 'Vai trò' : 'Role', language === 'vi' ? 'Duy trì hành trình' : 'Sustained the journey'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <span className="block font-mono text-[8px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                <strong className="mt-1 block font-sans text-xs text-amber-200">{value}</strong>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="font-sans text-xs leading-relaxed text-slate-300">
              {language === 'vi'
                ? 'Trên tàu Amiral Latouche-Tréville, Nguyễn Tất Thành sử dụng tên Văn Ba và làm phụ bếp. Công việc nặng nhọc giúp Người tự trang trải, tiếp tục hành trình và có điều kiện quan sát thế giới.'
                : 'Aboard the Amiral Latouche-Tréville, Nguyễn Tất Thành used the name Văn Ba and worked as a kitchen assistant. This demanding labour helped sustain his journey and enabled him to observe the wider world.'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-teal-500/25 bg-teal-500/10 p-3 text-teal-200">
            <Clock3 className="shrink-0" size={16} />
            <p className="font-sans text-xs leading-relaxed">
              {language === 'vi'
                ? 'Mảnh hồ sơ đã hoàn thành. Điểm tiếp theo: Hải trình đầu tiên.'
                : 'Record fragment completed. Next stop: The first voyage.'}
            </p>
          </div>

          <button
            type="button"
            onClick={resetMission}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-sans text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw size={15} />
            {language === 'vi' ? 'Làm lại nhiệm vụ' : 'Restart mission'}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-slate-600">
        <Utensils size={13} />
        {language === 'vi' ? 'Trạm 4 · Lao động trên tàu' : 'Station 4 · Labour aboard ship'}
      </div>
    </div>
  );
}

export default GalleyWorkMission;
