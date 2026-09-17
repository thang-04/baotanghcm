'use client';

import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import Image from 'next/image';
import {
  ROOM_FOUR_JOURNEY_CONTENT,
  type RoomFourLanguage,
  type RoomFourStationId,
} from '@/lib/roomFourJourney';

interface RoomFourJourneyOverlayProps {
  language: RoomFourLanguage;
  activeStationId: RoomFourStationId | null;
  onClose: () => void;
}

const FONT_STACK = 'var(--font-hanken-grotesk), var(--font-manrope), sans-serif';
const DISPLAY_STACK = 'var(--font-eb-garamond), Georgia, serif';
const LABEL_STACK = 'var(--font-space-grotesk), ui-monospace, monospace';

/**
 * A quiet archival reading view for a station. The visitor can freely open any
 * station; there is deliberately no completion state, task, progress card, or
 * branching journey logic in this overlay.
 */
export const RoomFourJourneyOverlay: React.FC<RoomFourJourneyOverlayProps> = ({
  language,
  activeStationId,
  onClose,
}) => {
  const portalRef = useRef<HTMLElement>(null!);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  useEffect(() => {
    if (!activeStationId) return;

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [activeStationId, onClose]);

  if (!activeStationId) return null;

  const content = ROOM_FOUR_JOURNEY_CONTENT[activeStationId];
  const isVietnamese = language === 'vi';
  const eyebrow = isVietnamese ? content.eyebrowVi : content.eyebrowEn;
  const title = isVietnamese ? content.before.vi : content.before.en;
  const lead = isVietnamese ? content.leadVi : content.leadEn;
  const history = isVietnamese ? content.historyVi : content.historyEn;
  const illustration = content.illustration;
  const closingIllustration = content.closingIllustration;

  return (
    <Html
      fullscreen
      portal={portalRef}
      zIndexRange={[20_000_000, 19_000_000]}
      calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]}
      // Html normally hides itself when its 3D anchor is behind the camera.
      // This is a fullscreen DOM dialog, not a world label, so that behavior
      // would lock the camera while making the only close control invisible.
      onOcclude={() => undefined}
      style={{ pointerEvents: 'none', fontFamily: FONT_STACK }}
    >
      <div
        className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[#071015]/78 p-4 text-slate-100 sm:p-7"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-four-station-title"
          onPointerDown={(event) => event.stopPropagation()}
          className="pointer-events-auto relative max-h-[min(860px,calc(100vh-32px))] w-[72vw] max-w-none overflow-y-auto border border-slate-400/25 bg-[#0d171c]/[0.98] px-6 py-11 text-center shadow-[0_28px_90px_rgba(0,0,0,0.58)] max-sm:w-full sm:max-h-[calc(100vh-56px)] sm:px-12 sm:py-14 lg:px-20"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-slate-500/45 text-lg text-slate-300 transition-colors hover:border-[#d7a768] hover:bg-[#d7a768]/10 hover:text-[#f4dfbc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a768] sm:right-6 sm:top-6"
            aria-label={isVietnamese ? 'Đóng tư liệu' : 'Close archive'}
          >
            ×
          </button>

          <header className="mx-auto max-w-3xl">
            <p
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#a9c9d4] sm:text-[11px]"
              style={{ fontFamily: LABEL_STACK }}
            >
              {eyebrow}
            </p>
            <div className="mx-auto mt-5 h-px w-16 bg-[#d7a768]" />
            <h2
              id="room-four-station-title"
              className="mt-6 text-3xl leading-[1.08] text-[#f4ead8] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: DISPLAY_STACK }}
            >
              {title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-8">
              {lead}
            </p>
          </header>

          {illustration && (
            <figure className="mx-auto mt-10 max-w-3xl overflow-hidden border border-slate-500/40 bg-[#070c0f] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
              <Image
                src={illustration.src}
                alt={isVietnamese ? illustration.altVi : illustration.altEn}
                width={960}
                height={640}
                sizes="(max-width: 1024px) calc(100vw - 64px), 760px"
                className="h-auto w-full object-contain"
              />
              <figcaption className="border-t border-slate-600/45 px-5 py-4 text-xs leading-5 text-slate-400 sm:px-8 sm:text-[13px]">
                {isVietnamese ? illustration.captionVi : illustration.captionEn}
              </figcaption>
            </figure>
          )}

          <div className="mx-auto mt-10 max-w-3xl border-t border-slate-600/45 pt-8 text-center">
            <div className="space-y-5 text-[15px] leading-8 text-slate-200 sm:text-base sm:leading-8">
              {history.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          {closingIllustration && (
            <figure className="mx-auto mt-10 max-w-xl overflow-hidden border border-slate-500/40 bg-[#070c0f] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
              <Image
                src={closingIllustration.src}
                alt={isVietnamese ? closingIllustration.altVi : closingIllustration.altEn}
                width={600}
                height={878}
                sizes="(max-width: 768px) calc(100vw - 64px), 576px"
                className="h-auto w-full object-contain"
              />
              <figcaption className="border-t border-slate-600/45 px-5 py-4 text-xs leading-5 text-slate-400 sm:px-8 sm:text-[13px]">
                {isVietnamese ? closingIllustration.captionVi : closingIllustration.captionEn}
              </figcaption>
            </figure>
          )}
        </section>
      </div>
    </Html>
  );
};
