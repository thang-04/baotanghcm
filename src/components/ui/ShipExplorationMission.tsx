'use client';

import React, { useState } from 'react';
import { Check, CircleDot, Compass, Ship, Utensils } from 'lucide-react';
import type { RoomFiveShipHotspotId } from '@/context/MuseumContext';

type Language = 'vi' | 'en';

interface ShipExplorationMissionProps {
  language: Language;
  visitedHotspots: RoomFiveShipHotspotId[];
  onVisit: (hotspotId: RoomFiveShipHotspotId) => void;
}

const HOTSPOTS: Array<{
  id: RoomFiveShipHotspotId;
  label: Record<Language, string>;
  fact: Record<Language, string>;
  icon: typeof Ship;
}> = [
  {
    id: 'hull',
    label: { vi: 'Thân tàu', en: 'Hull' },
    fact: {
      vi: 'Thân tàu hơi nước chở hàng và thủy thủ đoàn vượt các tuyến biển dài; đây là không gian lao động chứ không phải một chuyến du lịch.',
      en: 'The steamship hull carried cargo and crew across long sea routes; this was a working environment, not a leisure voyage.',
    },
    icon: Ship,
  },
  {
    id: 'funnel',
    label: { vi: 'Ống khói', en: 'Funnel' },
    fact: {
      vi: 'Ống khói cho thấy tàu vận hành bằng hơi nước, phụ thuộc vào guồng máy công nghiệp và sức lao động của thủy thủ đoàn.',
      en: 'The funnel identifies a steam-powered vessel, dependent on industrial machinery and crew labour.',
    },
    icon: CircleDot,
  },
  {
    id: 'galley',
    label: { vi: 'Khu bếp', en: 'Galley' },
    fact: {
      vi: 'Khu bếp là nơi Văn Ba làm phụ bếp, bắt đầu từ khoảng 4 giờ sáng và làm việc trong điều kiện nặng nhọc.',
      en: 'The galley was where Văn Ba worked as a kitchen assistant, beginning around 4 a.m. under demanding conditions.',
    },
    icon: Utensils,
  },
  {
    id: 'deck',
    label: { vi: 'Boong tàu', en: 'Deck' },
    fact: {
      vi: 'Từ boong tàu và các cảng ghé qua, Người có cơ hội trực tiếp quan sát nhiều vùng đất, con người và xã hội khác nhau.',
      en: 'From the deck and ports of call, he could directly observe different lands, people and societies.',
    },
    icon: Compass,
  },
];

export function ShipExplorationMission({ visitedHotspots, onVisit }: ShipExplorationMissionProps) {
  const language: Language = 'vi';
  const [activeHotspot, setActiveHotspot] = useState<RoomFiveShipHotspotId | null>(visitedHotspots[0] ?? null);
  const active = HOTSPOTS.find((hotspot) => hotspot.id === activeHotspot);
  const completed = HOTSPOTS.every((hotspot) => visitedHotspots.includes(hotspot.id));

  const inspect = (id: RoomFiveShipHotspotId) => {
    setActiveHotspot(id);
    onVisit(id);
  };

  return (
    <div className="space-y-5">
      <div className="pr-12">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          <Ship size={15} />
          {language === 'vi' ? 'Trạm 3 · Khám phá hiện vật' : 'Station 3 · Explore the object'}
        </div>
        <h2 className="font-sans text-2xl font-black leading-tight text-white lg:text-3xl">
          {language === 'vi' ? 'Tìm hiểu tàu Amiral Latouche-Tréville' : 'Explore the Amiral Latouche-Tréville'}
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071824]">
        <div className="relative aspect-[16/8] overflow-hidden">
          <img src="/exhibits/nha-rong-amiral-photo.png" alt="Tàu Amiral Latouche-Tréville" className="h-full w-full object-contain p-3" />
          <div className="absolute inset-x-3 bottom-3 grid grid-cols-4 gap-1.5">
            {HOTSPOTS.map((hotspot, index) => {
              const seen = visitedHotspots.includes(hotspot.id);
              const selected = activeHotspot === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => inspect(hotspot.id)}
                  className={`cursor-pointer rounded-lg border px-2 py-3 text-center font-sans text-sm font-bold backdrop-blur transition-colors ${selected ? 'border-cyan-300 bg-cyan-400 text-slate-950' : seen ? 'border-emerald-400/50 bg-emerald-500/85 text-slate-950' : 'border-white/20 bg-slate-950/80 text-slate-200 hover:border-cyan-400/60'}`}
                >
                  <span className="mb-1 flex items-center justify-center">{seen ? <Check size={13} /> : <span className="font-mono">0{index + 1}</span>}</span>
                  {hotspot.label[language]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {active ? (
        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300"><active.icon size={20} /></div>
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-300">{active.label[language]}</span>
              <p className="mt-1.5 font-sans text-base leading-relaxed text-slate-200">{active.fact[language]}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-slate-800 bg-slate-900/45 p-4 text-center font-sans text-sm text-slate-400">
          {language === 'vi' ? 'Chọn một bộ phận trên sơ đồ để bắt đầu.' : 'Select an area on the diagram to begin.'}
        </p>
      )}

      <div className={`rounded-xl border p-3 text-center font-sans text-xs ${completed ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-900/45 text-slate-400'}`}>
        {completed
          ? (language === 'vi' ? 'Đã khám phá 4/4. Bạn nhận mảnh hồ sơ: PHƯƠNG TIỆN.' : 'Explored 4/4. You received the VESSEL record fragment.')
          : (language === 'vi' ? `Đã khám phá ${visitedHotspots.length}/4 bộ phận` : `${visitedHotspots.length}/4 areas inspected`)}
      </div>
    </div>
  );
}

export default ShipExplorationMission;
