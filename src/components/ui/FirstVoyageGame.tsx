'use client';

import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Check,
  Flag,
  Lightbulb,
  MapPinned,
  RotateCcw,
  Ship,
  X,
} from 'lucide-react';

type Language = 'vi' | 'en';
type GamePhase = 'intro' | 'playing' | 'complete';
type AnswerStatus = 'idle' | 'correct' | 'wrong';

interface VoyageStop {
  id: string;
  name: Record<Language, string>;
  country: Record<Language, string>;
  date?: Record<Language, string>;
  fact: Record<Language, string>;
  hint: Record<Language, string>;
}

interface FirstVoyageGameProps {
  language: Language;
  setLanguage: (language: Language) => void;
  onClose: () => void;
  completed?: boolean;
  onComplete?: () => void;
  onReset?: () => void;
}

const VOYAGE_ROUTE: VoyageStop[] = [
  {
    id: 'saigon',
    name: { vi: 'Bến Nhà Rồng, Sài Gòn', en: 'Nhà Rồng Wharf, Sài Gòn' },
    country: { vi: 'Việt Nam', en: 'Vietnam' },
    date: { vi: '05/06/1911', en: '5 June 1911' },
    fact: {
      vi: 'Tàu Amiral Latouche-Tréville rời bến sông Sài Gòn, mở đầu hành trình.',
      en: 'The Amiral Latouche-Tréville left Sài Gòn, beginning the voyage.',
    },
    hint: { vi: '', en: '' },
  },
  {
    id: 'keppel',
    name: { vi: 'Cảng Keppel', en: 'Keppel Harbour' },
    country: { vi: 'Singapore', en: 'Singapore' },
    date: { vi: '08/06/1911', en: '8 June 1911' },
    fact: {
      vi: 'Sau ba ngày rời Sài Gòn, tàu cập cảng Keppel tại Singapore.',
      en: 'Three days after leaving Sài Gòn, the ship reached Keppel Harbour in Singapore.',
    },
    hint: {
      vi: 'Sau ba ngày, tàu cập một thương cảng ở Đông Nam Á.',
      en: 'After three days, the ship reached a Southeast Asian trading port.',
    },
  },
  {
    id: 'sri-lanka',
    name: { vi: 'Một cảng tại Sri Lanka', en: 'A port in Sri Lanka' },
    country: { vi: 'Sri Lanka', en: 'Sri Lanka' },
    fact: {
      vi: 'Từ Singapore, tàu vượt Ấn Độ Dương để tới quốc đảo Sri Lanka.',
      en: 'From Singapore, the ship crossed the Indian Ocean to reach Sri Lanka.',
    },
    hint: {
      vi: 'Tàu tiếp tục vượt Ấn Độ Dương tới một quốc đảo Nam Á.',
      en: 'The ship crossed the Indian Ocean toward a South Asian island nation.',
    },
  },
  {
    id: 'port-said',
    name: { vi: 'Cảng Said', en: 'Port Said' },
    country: { vi: 'Ai Cập', en: 'Egypt' },
    fact: {
      vi: 'Tàu đi vào Biển Đỏ, qua kênh đào và cập cảng Said ở phía bắc Ai Cập.',
      en: 'The ship entered the Red Sea, passed through the canal and reached Port Said in northern Egypt.',
    },
    hint: {
      vi: 'Qua Biển Đỏ và kênh đào, điểm dừng tiếp theo nằm ở phía bắc Ai Cập.',
      en: 'After the Red Sea and the canal, the next stop was in northern Egypt.',
    },
  },
  {
    id: 'marseille',
    name: { vi: 'Cảng Marseille', en: 'Port of Marseille' },
    country: { vi: 'Pháp', en: 'France' },
    date: { vi: '06/07/1911', en: '6 July 1911' },
    fact: {
      vi: 'Vượt Địa Trung Hải, tàu tới Marseille ở miền nam nước Pháp.',
      en: 'Crossing the Mediterranean, the ship reached Marseille in southern France.',
    },
    hint: {
      vi: 'Tàu vượt Địa Trung Hải để tới một cảng ở miền nam nước Pháp.',
      en: 'The ship crossed the Mediterranean to a port in southern France.',
    },
  },
  {
    id: 'le-havre',
    name: { vi: 'Cảng Le Havre', en: 'Port of Le Havre' },
    country: { vi: 'Pháp', en: 'France' },
    date: { vi: '15/07/1911', en: '15 July 1911' },
    fact: {
      vi: 'Tàu tiếp tục lên phía bắc và cập Le Havre, cảng đăng ký chính của tàu.',
      en: 'The ship continued north to Le Havre, its principal port of registry.',
    },
    hint: {
      vi: 'Sau Marseille, tàu đi lên một cảng chính ở phía bắc nước Pháp.',
      en: 'After Marseille, the ship headed to a major port in northern France.',
    },
  },
  {
    id: 'dunkerque',
    name: { vi: 'Cảng Dunkerque', en: 'Port of Dunkerque' },
    country: { vi: 'Pháp', en: 'France' },
    fact: {
      vi: 'Dunkerque là điểm cuối của chặng hải trình kéo dài 40 ngày.',
      en: 'Dunkerque marked the end of the 40-day voyage.',
    },
    hint: {
      vi: 'Điểm kết thúc 40 ngày lênh đênh là một cảng ở cực bắc nước Pháp.',
      en: 'The 40-day voyage ended at a port in the far north of France.',
    },
  },
];

const OPTION_ORDER = ['port-said', 'dunkerque', 'keppel', 'le-havre', 'sri-lanka', 'marseille'];

export function FirstVoyageGame({
  onClose,
  completed = false,
  onComplete,
  onReset,
}: FirstVoyageGameProps) {
  const language: Language = 'vi';
  const [phase, setPhase] = useState<GamePhase>(completed ? 'complete' : 'intro');
  const [currentLeg, setCurrentLeg] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [mistakes, setMistakes] = useState(0);

  const currentStop = VOYAGE_ROUTE[currentLeg];
  const expectedStop = VOYAGE_ROUTE[currentLeg + 1];
  const remainingOptions = useMemo(
    () => OPTION_ORDER
      .map((id) => VOYAGE_ROUTE.find((stop) => stop.id === id))
      .filter((stop): stop is VoyageStop => Boolean(stop) && VOYAGE_ROUTE.indexOf(stop!) > currentLeg),
    [currentLeg],
  );

  const resetGame = () => {
    onReset?.();
    setPhase('intro');
    setCurrentLeg(0);
    setSelectedStopId(null);
    setAnswerStatus('idle');
    setMistakes(0);
  };

  const startGame = () => {
    setPhase('playing');
    setCurrentLeg(0);
    setSelectedStopId(null);
    setAnswerStatus('idle');
    setMistakes(0);
  };

  const chooseStop = (stopId: string) => {
    if (!expectedStop || answerStatus === 'correct') return;
    setSelectedStopId(stopId);
    if (stopId === expectedStop.id) {
      setAnswerStatus('correct');
    } else {
      setAnswerStatus('wrong');
      setMistakes((value) => value + 1);
    }
  };

  const continueVoyage = () => {
    if (currentLeg === VOYAGE_ROUTE.length - 2) {
      setPhase('complete');
      onComplete?.();
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.72 }, colors: ['#f59e0b', '#14b8a6', '#f8fafc'] });
      return;
    }
    setCurrentLeg((value) => value + 1);
    setSelectedStopId(null);
    setAnswerStatus('idle');
  };

  return (
    <div className="space-y-5">
      <div className="pr-12">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
          <MapPinned size={15} />
          {language === 'vi' ? 'Trò chơi bản đồ tương tác' : 'Interactive map game'}
        </div>
        <h2 className="font-sans text-2xl font-black leading-tight text-white lg:text-3xl">
          {language === 'vi' ? 'Hải trình đầu tiên' : 'The first voyage'}
        </h2>
      </div>

      {phase === 'intro' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-teal-500/25 bg-teal-500/8 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-teal-400/30 bg-teal-400/10 text-teal-300">
              <Ship size={25} />
            </div>
            <h3 className="mb-2 font-sans text-lg font-bold text-slate-50">
              {language === 'vi' ? 'Tìm đường đến nước Pháp' : 'Chart the course to France'}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-slate-300">
              {language === 'vi'
                ? 'Tàu đã rời Bến Nhà Rồng. Dựa vào gợi ý, hãy chọn đúng cảng tiếp theo và hoàn thành sáu chặng của chuyến hải trình năm 1911.'
                : 'The ship has left Nhà Rồng Wharf. Follow the clues, choose each next port and complete the six legs of the 1911 voyage.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [language === 'vi' ? '6 chặng' : '6 legs', language === 'vi' ? 'HẢI TRÌNH' : 'ROUTE'],
              [language === 'vi' ? '4 quốc gia' : '4 countries', language === 'vi' ? 'ĐI QUA' : 'VISITED'],
              [language === 'vi' ? '40 ngày' : '40 days', language === 'vi' ? 'TRÊN BIỂN' : 'AT SEA'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/45 px-2 py-3">
                <strong className="block font-sans text-sm text-amber-300">{value}</strong>
                <span className="mt-1 block font-mono text-[8px] tracking-wider text-slate-500">{label}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={startGame}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 font-sans text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-amber-400"
          >
            <Ship size={17} />
            {language === 'vi' ? 'Bắt đầu hải trình' : 'Begin the voyage'}
          </button>
        </div>
      )}

      {phase === 'playing' && expectedStop && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-hidden" aria-label={language === 'vi' ? 'Tiến độ hải trình' : 'Voyage progress'}>
            {VOYAGE_ROUTE.map((stop, index) => {
              const reached = index <= currentLeg;
              const active = index === currentLeg;
              return (
                <React.Fragment key={stop.id}>
                  {index > 0 && <span className={`h-px min-w-2 flex-1 ${reached ? 'bg-teal-400' : 'bg-slate-700'}`} />}
                  <span
                    title={stop.name[language]}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[8px] font-bold ${
                      reached
                        ? 'border-teal-300 bg-teal-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900 text-slate-500'
                    } ${active ? 'ring-2 ring-teal-400/25' : ''}`}
                  >
                    {reached ? <Check size={11} strokeWidth={3} /> : index + 1}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {language === 'vi' ? `Chặng ${currentLeg + 1}/6 · Tàu đang ở` : `Leg ${currentLeg + 1}/6 · Current port`}
            </span>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-sans text-lg font-bold text-white">{currentStop.name[language]}</h3>
                <p className="mt-0.5 font-sans text-xs text-slate-400">
                  {currentStop.country[language]}{currentStop.date ? ` · ${currentStop.date[language]}` : ''}
                </p>
              </div>
              <Ship className="shrink-0 text-amber-400" size={26} />
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3.5">
            <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
              <Lightbulb size={13} />
              {language === 'vi' ? 'Gợi ý chặng tiếp theo' : 'Next-leg clue'}
            </span>
            <p className="font-sans text-sm leading-relaxed text-slate-200">{expectedStop.hint[language]}</p>
          </div>

          <div>
            <p className="mb-3 font-sans text-lg font-bold text-white">
              {language === 'vi' ? 'Điểm dừng tiếp theo là đâu?' : 'Where did the ship stop next?'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {remainingOptions.map((stop) => {
                const selected = selectedStopId === stop.id;
                const isCorrectSelection = selected && answerStatus === 'correct';
                const isWrongSelection = selected && answerStatus === 'wrong';
                return (
                  <button
                    key={stop.id}
                    type="button"
                    disabled={answerStatus === 'correct'}
                    onClick={() => chooseStop(stop.id)}
                    className={`min-h-16 cursor-pointer rounded-xl border p-4 text-left font-sans transition-colors disabled:cursor-default ${
                      isCorrectSelection
                        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                        : isWrongSelection
                          ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
                          : 'border-slate-800 bg-slate-900/55 text-slate-300 hover:border-teal-400/45 hover:bg-teal-500/8 hover:text-white'
                    }`}
                  >
                    <span className="block text-base font-bold leading-tight">{stop.name[language]}</span>
                    <span className="mt-1.5 block text-xs uppercase tracking-wide text-slate-500">{stop.country[language]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div aria-live="polite">
            {answerStatus === 'wrong' && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-rose-200">
                <X className="mt-0.5 shrink-0" size={15} />
                <p className="font-sans text-xs leading-relaxed">
                  {language === 'vi' ? 'Chưa đúng thứ tự. Hãy đọc lại gợi ý và thử một điểm dừng khác.' : 'That is not the next stop. Read the clue and try another port.'}
                </p>
              </div>
            )}
            {answerStatus === 'correct' && (
              <div className="space-y-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
                <div className="flex items-start gap-2 text-emerald-200">
                  <Check className="mt-0.5 shrink-0" size={16} />
                  <p className="font-sans text-xs leading-relaxed"><strong>{language === 'vi' ? 'Chính xác.' : 'Correct.'}</strong> {expectedStop.fact[language]}</p>
                </div>
                <button
                  type="button"
                  onClick={continueVoyage}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 font-sans text-xs font-black uppercase text-slate-950 hover:bg-emerald-300"
                >
                  {currentLeg === VOYAGE_ROUTE.length - 2
                    ? (language === 'vi' ? 'Hoàn thành hải trình' : 'Complete voyage')
                    : (language === 'vi' ? 'Đi tiếp' : 'Continue')}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'complete' && (
        <div className="space-y-4 text-center">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
              <Flag size={27} />
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              {language === 'vi' ? 'Hải trình hoàn tất' : 'Voyage complete'}
            </span>
            <h3 className="mt-2 font-sans text-xl font-black text-white">
              {language === 'vi' ? 'Bạn đã đưa tàu đến Dunkerque!' : 'You reached Dunkerque!'}
            </h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-300">
              {language === 'vi'
                ? `Bạn đã tái hiện sáu chặng qua bốn quốc gia trong 40 ngày${mistakes === 0 ? ' mà không chọn sai lần nào' : ` với ${mistakes} lần thử lại`}.`
                : `You reconstructed six legs across four countries in 40 days${mistakes === 0 ? ' without a wrong choice' : ` with ${mistakes} retr${mistakes === 1 ? 'y' : 'ies'}`}.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetGame}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-sans text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              <RotateCcw size={15} />
              {language === 'vi' ? 'Chơi lại' : 'Play again'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-sans text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              {language === 'vi' ? 'Trở lại phòng' : 'Return to room'}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FirstVoyageGame;
