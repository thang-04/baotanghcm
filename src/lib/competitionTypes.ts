export const COMPETITION_ROOMS = ['gallery-subsidy', 'gallery-three', 'gallery-ceramics', 'gallery-market-economy', 'gallery-paintings'] as const;
export type CompetitionRoomId = typeof COMPETITION_ROOMS[number];
export type CompetitionOutfitId = 'student' | 'baba' | 'aodai' | 'casual';
export interface PublicCompetitionQuestion { id: string; roomId: CompetitionRoomId; prompt: string; options: { id: string; text: string }[] }
export interface PrivateCompetitionQuestion extends PublicCompetitionQuestion { correctOptionId: string; explanation: string; source: string }
export interface CompetitionParticipant {
  id: string; nickname: string; outfitId: CompetitionOutfitId; ready: boolean; connected: boolean; currentRoomId: CompetitionRoomId | 'lobby';
  status: 'waiting' | 'racing' | 'finished' | 'withdrawn' | 'timed_out'; correctQuestionIds: string[];
  progress: Record<CompetitionRoomId, number>; score: number; attempts: number; wrongAttempts: number;
  finishedAt: number | null; elapsedMs: number | null; rank: number | null;
}
export interface CompetitionSnapshot {
  id: string; code: string; title: string; hostName: string; status: 'lobby' | 'countdown' | 'running' | 'finalized' | 'aborted';
  durationMinutes: number; maxPlayers: number; createdAt: number; startedAt: number | null; endsAt: number | null;
  finalizedAt: number | null; endReason: string | null; serverNow: number; questionBankVersion: string;
  questions: PublicCompetitionQuestion[]; participants: CompetitionParticipant[]; ranking: CompetitionParticipant[]; topThree: CompetitionParticipant[];
}
export type CompetitionAck = { ok: false; error: string } | { ok: true; session: CompetitionSnapshot; participantId?: string; participantToken?: string; recoveryCode?: string; correct?: boolean; duplicate?: boolean; questions?: PrivateCompetitionQuestion[] };
