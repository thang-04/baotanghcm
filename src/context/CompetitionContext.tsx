'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CompetitionSnapshot } from '@/lib/competitionTypes';

export type CompetitionReply = { ok: boolean; error?: string; session?: CompetitionSnapshot; participantId?: string; participantToken?: string; correct?: boolean; duplicate?: boolean; recoveryCode?: string };
type Identity = { code: string; nickname: string; outfitId: string; participantToken?: string; participantId?: string };
type CompetitionValue = {
  session: CompetitionSnapshot | null; participantId: string | null; connected: boolean; error: string;
  join: (identity: Identity) => Promise<CompetitionReply>;
  command: (event: string, data?: Record<string, unknown>) => Promise<CompetitionReply>;
  leave: () => void;
  activeQuestionId: string | null;
  setActiveQuestionId: (id: string | null) => void;
};
const CompetitionContext = createContext<CompetitionValue | null>(null);
export function competitionSocket() {
  return io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', { transports: ['websocket'], withCredentials: true, autoConnect: false });
}
export function sendCompetition(socket: Socket, event: string, data: Record<string, unknown> = {}): Promise<CompetitionReply> {
  return new Promise(resolve => {
    if (!socket.connected) { resolve({ ok: false, error: 'Mất kết nối. Đang thử nối lại…' }); return; }
    socket.timeout(10000).emit(event, data, (error: Error | null, reply: CompetitionReply) => {
      resolve(error ? { ok: false, error: 'Máy chủ chưa phản hồi. Hãy thử lại; đáp án trùng không cộng thêm điểm.' } : reply);
    });
  });
}
export async function hostRequest(action: string, data: Record<string, unknown> = {}): Promise<CompetitionReply & { questions?: unknown[] }> {
  try {
    const res = await fetch('/api/competition', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...data }), signal: AbortSignal.timeout(12000) });
    return await res.json();
  } catch { return { ok: false, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' }; }
}

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const identityRef = useRef<Identity | null>(null);
  const [session, setSession] = useState<CompetitionSnapshot | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const accept = useCallback((reply: CompetitionReply, identity?: Identity) => {
    if (!reply.ok) { setError(reply.error || 'Yêu cầu không thành công.'); return; }
    setError('');
    if (reply.session) setSession(reply.session);
    if (reply.participantId) setParticipantId(reply.participantId);
    if (identity && reply.participantToken) {
      const saved = { ...identity, participantToken: reply.participantToken, participantId: reply.participantId };
      identityRef.current = saved;
      localStorage.setItem(`hcm-competition:${identity.code}`, JSON.stringify(saved));
      sessionStorage.setItem('hcm-competition-entry', JSON.stringify(saved));
    }
  }, []);

  useEffect(() => {
    const socket = competitionSocket(); socketRef.current = socket;
    socket.on('comp:snapshot', (next: CompetitionSnapshot) => setSession(next));
    socket.on('connect', () => {
      setConnected(true); setError('');
      const saved = identityRef.current;
      if (saved?.participantToken) void sendCompetition(socket, 'comp:join', saved).then(r => accept(r, saved));
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => { setConnected(false); setError('Không kết nối được máy chủ cuộc thi.'); });
    socket.on('comp:revoked', () => { identityRef.current = null; setParticipantId(null); setSession(null); setError('Phiên chơi đã được mở ở tab khác.'); sessionStorage.removeItem('hcm-competition-entry'); });
    try {
      const stored = JSON.parse(sessionStorage.getItem('hcm-competition-entry') || 'null') as Identity | null;
      if (stored?.participantToken && window.location.pathname === '/lobby') { identityRef.current = stored; socket.connect(); }
    } catch { sessionStorage.removeItem('hcm-competition-entry'); }
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [accept]);

  const join = useCallback(async (identity: Identity) => {
    const socket = socketRef.current;
    if (!socket) return { ok: false, error: 'Đang chuẩn bị kết nối, hãy thử lại.' };
    if (!socket.connected) {
      socket.connect();
      await new Promise<void>(resolve => {
        const timer = setTimeout(() => { socket.off('connect', onConnect); resolve(); }, 8000);
        function onConnect() { clearTimeout(timer); resolve(); }
        socket.once('connect', onConnect);
      });
    }
    let stored: Identity | null = null;
    try { stored = JSON.parse(localStorage.getItem(`hcm-competition:${identity.code}`) || 'null'); } catch { /* ignore malformed old data */ }
    const data = { ...identity, participantToken: stored?.participantToken };
    const reply = await sendCompetition(socket, 'comp:join', data);
    accept(reply, data); return reply;
  }, [accept]);
  const command = useCallback(async (event: string, data: Record<string, unknown> = {}) => {
    if (!socketRef.current) return { ok: false, error: 'Chưa kết nối.' };
    const reply = await sendCompetition(socketRef.current, event, data);
    if (event !== 'comp:position') accept(reply);
    return reply;
  }, [accept]);
  const leave = useCallback(() => {
    // Disconnect preserves the roster and elapsed time; only the host may mark withdrawal.
    identityRef.current = null; socketRef.current?.disconnect(); setSession(null); setParticipantId(null);
    sessionStorage.removeItem('hcm-competition-entry');
  }, []);
  return <CompetitionContext.Provider value={{ session, participantId, connected, error, join, command, leave, activeQuestionId, setActiveQuestionId }}>{children}</CompetitionContext.Provider>;
}
export function useCompetition() {
  const value = useContext(CompetitionContext); if (!value) throw new Error('CompetitionProvider missing'); return value;
}
