'use client';
import type { CompetitionSnapshot } from '@/lib/competitionTypes';
import { formatRaceTime } from '@/lib/competitionPresentation';
import { AvatarPreview } from '@/components/ui/AvatarSelector';

export function CompetitionPodium({ session }: { session: CompetitionSnapshot }) {
  return <section className="race-podium" aria-label="Vinh danh Top 3"><p className="race-eyebrow">Hành trình đã khép lại</p><h2>Vinh danh những người về đích</h2><p>{session.title}</p>
    <div className="race-winners">{session.topThree.map(p => <article className={`race-winner race-place-${p.rank}`} key={p.id}><span className="race-medal">{p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'}</span><AvatarPreview outfitId={p.outfitId} /><h3>{p.nickname}</h3><p>{p.score}/10 câu đúng</p><strong>{formatRaceTime(p.elapsedMs)}</strong></article>)}</div>
    {!session.topThree.length && <p>Chưa có thí sinh hoàn thành đủ 5 phòng để vinh danh.</p>}
  </section>;
}
