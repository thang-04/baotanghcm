'use client';
import type { CompetitionSnapshot } from '@/lib/competitionTypes';
import { competitionStatus, formatRaceTime } from '@/lib/competitionPresentation';

export function CompetitionLeaderboard({ session, compact = false }: { session: CompetitionSnapshot; compact?: boolean }) {
  const finished = session.ranking.filter(p => p.status === 'finished');
  const racing = session.participants.filter(p => p.status !== 'finished').sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return <div className="race-table-wrap">
    <table className="race-table"><caption>{session.status === 'finalized' ? 'Kết quả chính thức' : 'Bảng xếp hạng tạm thời'}</caption><thead><tr><th>Hạng</th><th>Thí sinh</th><th>Tiến độ</th>{!compact && <th>Trạng thái</th>}<th>Thời gian</th></tr></thead><tbody>
      {[...finished, ...racing].map(p => <tr key={p.id}><td>{p.status === 'finished' ? p.rank : '—'}</td><td><strong>{p.nickname}</strong><small>{p.id.slice(0, 6)}</small></td><td>{p.score}/10</td>{!compact && <td>{competitionStatus[p.status] || p.status}</td>}<td>{p.status === 'finished' ? formatRaceTime(p.elapsedMs) : 'Chưa về đích'}</td></tr>)}
      {session.participants.length === 0 && <tr><td colSpan={compact ? 4 : 5}>Chưa có thí sinh. Chia sẻ mã phòng để mời mọi người.</td></tr>}
    </tbody></table>
  </div>;
}
