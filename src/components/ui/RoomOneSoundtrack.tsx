'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Music2, Volume2, VolumeX } from 'lucide-react';
import { useMuseum } from '@/context/MuseumContext';

const NORMAL_VOLUME = 0.18;
const DUCKED_VOLUME = 0.055;
const FADE_STEP = 0.018;

export const RoomOneSoundtrack: React.FC = () => {
  const {
    currentRoom,
    activeGallery,
    selectedExhibit,
    audioPlaying,
  } = useMuseum();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const isInRoomOne = currentRoom === 'gallery-subsidy' || activeGallery?.id === 'gallery-subsidy';
  const shouldDuck = Boolean(selectedExhibit) || audioPlaying;
  const targetVolume = !enabled || !isInRoomOne
    ? 0
    : shouldDuck
      ? DUCKED_VOLUME
      : NORMAL_VOLUME;

  useEffect(() => {
    const storedPreference = window.localStorage.getItem('roomOneSoundtrackEnabled');
    if (storedPreference === 'false') setEnabled(false);

    const audio = new Audio('/audio/room-one-soundtrack.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unlockAudio = () => setHasUserInteracted(true);
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (targetVolume > 0 && hasUserInteracted) {
      void audio.play().catch(() => {
        // Trình duyệt sẽ cho phép phát sau tương tác tiếp theo của người chơi.
      });
    }

    const fadeTimer = window.setInterval(() => {
      const difference = targetVolume - audio.volume;
      if (Math.abs(difference) <= FADE_STEP) {
        audio.volume = targetVolume;
        if (targetVolume === 0) audio.pause();
        window.clearInterval(fadeTimer);
        return;
      }

      audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(difference) * FADE_STEP));
    }, 70);

    return () => window.clearInterval(fadeTimer);
  }, [hasUserInteracted, targetVolume]);

  const toggleSoundtrack = () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    window.localStorage.setItem('roomOneSoundtrackEnabled', String(nextEnabled));
    if (nextEnabled) setHasUserInteracted(true);
  };

  if (!isInRoomOne) return null;

  return (
    <button
      type="button"
      onClick={toggleSoundtrack}
      className="absolute right-5 top-20 z-40 flex items-center gap-2 rounded-full border border-amber-500/30 bg-slate-950/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-xl backdrop-blur-md transition-all hover:border-amber-400/60 hover:bg-slate-900 pointer-events-auto"
      title={enabled ? 'Tắt nhạc nền Phòng 1' : 'Bật nhạc nền Phòng 1'}
    >
      <Music2 size={14} className={enabled ? 'text-amber-400' : 'text-slate-500'} />
      <span className="hidden sm:inline">Nhạc hành trình</span>
      {enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
    </button>
  );
};

export default RoomOneSoundtrack;
