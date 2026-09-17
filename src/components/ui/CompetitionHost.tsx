'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { competitionSocket, hostRequest, sendCompetition } from '@/context/CompetitionContext';
import type { CompetitionSnapshot, CompetitionParticipant } from '@/lib/competitionTypes';
import { competitionRooms, competitionStatus, csvCell, formatRaceTime } from '@/lib/competitionPresentation';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';
import { CompetitionPodium } from './CompetitionPodium';
import QRCode from 'qrcode';

type PrivateQuestion = { id: string; roomId: string; prompt: string; options: { id: string; text: string }[]; correctOptionId: string; explanation: string; source: string };

export function HostEntry() {
  const router = useRouter();
  const [title, setTitle] = useState('Theo dấu chân Người');
  const [hostName, setHostName] = useState('');
  const [duration, setDuration] = useState(30);
  const [limit, setLimit] = useState(65);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState('');
  const [created, setCreated] = useState<{ code: string; secret: string } | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const reply = await hostRequest('create', { title, hostName, durationMinutes: duration, maxPlayers: limit });
    setBusy(false);
    if (reply.ok && reply.session && reply.recoveryCode) setCreated({ code: reply.session.code, secret: reply.recoveryCode });
    else setError(reply.error || 'Không tạo được phòng.');
  }
  async function recover(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const reply = await hostRequest('recover', { code: code.trim().toUpperCase(), recoveryCode: recovery.trim() });
    setBusy(false);
    if (reply.ok && reply.session) {
      if (reply.recoveryCode) setCreated({ code: reply.session.code, secret: reply.recoveryCode });
      else router.push(`/host/${reply.session.code}`);
    } else setError(reply.error || 'Không khôi phục được quyền chủ phòng.');
  }
  return <main className="race-page"><header className="race-header"><Link href="/">← Bảo tàng</Link><Link href="/play">Tham gia cuộc thi</Link></header><div className="race-intro"><p className="race-eyebrow">Không gian người tổ chức</p><h1>Cùng nhau khám phá.<br />Cùng nhau về đích.</h1><p>Tạo một cuộc thi qua 5 phòng lịch sử. Bạn điều phối; thí sinh khám phá và hoàn thành 10 câu hỏi.</p></div>
    {error && <p className="race-alert" role="alert">{error}</p>}
    {created ? <section className="race-panel"><span className="race-badge">Bạn là chủ phòng</span><h2>Phòng {created.code} đã sẵn sàng</h2><p>Lưu mã khôi phục dưới đây vào nơi riêng tư. Mã này dùng để lấy lại quyền chủ phòng trên máy khác; không gửi cho thí sinh.</p><code className="race-secret">{created.secret}</code><button className="race-button" onClick={() => router.push(`/host/${created.code}`)}>Đã lưu mã · Mở bảng điều khiển</button></section> : <div className="race-entry-grid"><form className="race-panel race-form" onSubmit={create}><h2>Tạo phòng thi</h2><label>Tên cuộc thi<input value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} /></label><label>Tên người tổ chức<input value={hostName} onChange={e => setHostName(e.target.value)} required maxLength={40} placeholder="Ví dụ: Cô Lan" /></label><div className="race-fields"><label>Thời lượng (phút)<input type="number" min={1} max={180} value={duration} onChange={e => setDuration(+e.target.value)} required /></label><label>Tối đa thí sinh<input type="number" min={1} max={65} value={limit} onChange={e => setLimit(+e.target.value)} required /></label></div><div className="race-note"><strong>Bộ câu hỏi: Hành trình 1911–1930</strong><p>5 phòng · 2 câu đúng/phòng · Xếp hạng theo thời gian. Bộ câu được chốt khi bắt đầu.</p></div><button className="race-button" disabled={busy}>{busy ? 'Đang xử lý…' : 'Tạo phòng · Nhận mã mời'}</button></form>
    <aside className="race-panel"><h2>Đã có phòng?</h2><p>Mở lại bảng điều khiển trên trình duyệt đã tạo phòng hoặc dùng mã khôi phục riêng.</p><form className="race-form" onSubmit={recover}><label>Mã phòng<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={12} required /></label><label>Mã khôi phục<input type="password" autoComplete="off" value={recovery} onChange={e => setRecovery(e.target.value)} required /></label><button disabled={busy} className="race-button race-secondary">Khôi phục quyền chủ phòng</button></form><button className="race-link" disabled={!code.trim()} onClick={() => router.push(`/host/${code.trim().toUpperCase()}`)}>Mở phòng bằng phiên đăng nhập hiện tại</button></aside></div>}
  </main>;
}

export function useHostSession(code: string, publicView = false) {
  const [session, setSession] = useState<CompetitionSnapshot | null>(null);
  const [connected, setConnected] = useState(false); const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  useEffect(() => {
    const socket = competitionSocket();
    const update = (next: CompetitionSnapshot) => { setSession(next); setLastUpdate(Date.now()); };
    socket.on('comp:snapshot', update);
    socket.on('connect', async () => {
      const reply = await sendCompetition(socket, publicView ? 'comp:public' : 'comp:host-watch', { code });
      setConnected(reply.ok); setError(reply.ok ? '' : reply.error || 'Bạn chưa có quyền chủ phòng.');
      if (reply.ok && reply.session) update(reply.session);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => { setConnected(false); setError('Mất kết nối máy chủ. Đang thử lại…'); });
    socket.on('comp:revoked', () => { setConnected(false); setSession(null); setError('Quyền chủ phòng đã được khôi phục ở trình duyệt khác.'); });
    socket.connect(); return () => { socket.disconnect(); };
  }, [code, publicView]);
  return { session, setSession, connected, error, setError, lastUpdate };
}

export function HostDashboard({ code }: { code: string }) {
  const { session, setSession, connected, error, setError, lastUpdate } = useHostSession(code);
  const [tab, setTab] = useState('roster'); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState<string | null>(null); const [questions, setQuestions] = useState<PrivateQuestion[]>([]);
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<{ action: 'end' | 'withdraw'; participantId?: string; name?: string } | null>(null);
  const [reason, setReason] = useState(''); const [now, setNow] = useState(Date.now());
  const [qr, setQr] = useState('');
  useEffect(() => { let alive = true; void QRCode.toDataURL(`${location.origin}/play?code=${encodeURIComponent(code)}`, { width: 160, margin: 1, color: { dark: '#292a27', light: '#ffffff' } }).then(data => { if (alive) setQr(data); }); return () => { alive = false; }; }, [code]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const act = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    setBusy(true); setNotice(''); const reply = await hostRequest(action, { code, ...data }); setBusy(false);
    if (!reply.ok) { setError(reply.error || 'Thao tác không thành công.'); return; }
    setError(''); if (reply.session) setSession(reply.session);
    if (reply.questions) setQuestions(reply.questions as PrivateQuestion[]);
    setConfirmation(null); setReason('');
  }, [code, setError, setSession]);
  async function copyInvite() {
    try { await navigator.clipboard.writeText(`${location.origin}/play?code=${code}`); setNotice('Đã sao chép link mời.'); }
    catch { setNotice(`Link mời: ${location.origin}/play?code=${code}`); }
  }
  function exportCsv() {
    if (!session) return;
    const rows = [['Hạng', 'Tên', 'Mã', 'Điểm', 'Thời gian ms', 'Trạng thái', ...competitionRooms.map(r => r.name)], ...session.participants.map(p => [p.rank || '', p.nickname, p.id, p.score, p.elapsedMs ?? '', competitionStatus[p.status], ...competitionRooms.map(r => p.progress[r.id] || 0)])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `ket-qua-${code}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  const selected = session?.participants.find(p => p.id === detail);
  const visible = session?.participants.filter(p => `${p.nickname} ${p.id}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'offline' ? !p.connected : p.status === filter))) || [];
  const readyCount = session?.participants.filter(p => p.ready && p.status !== 'withdrawn').length || 0;
  const activeCount = session?.participants.filter(p => p.status !== 'withdrawn').length || 0;
  return <main className="race-page"><header className="race-header"><Link href="/host">← Người tổ chức</Link><span className="race-badge">{connected ? 'Bạn là chủ phòng · Trực tiếp' : 'Chưa kết nối / xác thực'}</span></header>
    {error && <p className="race-alert" role="alert">{error} <Link href="/host">Khôi phục quyền chủ phòng</Link></p>}
    {!session ? <section className="race-panel"><h1>Phòng {code}</h1><p>Đang xác thực quyền điều phối…</p></section> : <>
    <section className="race-dashboard-title"><div><p className="race-eyebrow">{competitionStatus[session.status]}</p><h1>{session.title}</h1><p>Chủ phòng: {session.hostName}</p></div><div className="race-invite"><span>Mã tham gia</span><strong>{session.code}</strong><button className="race-button race-secondary" onClick={copyInvite}>Sao chép lời mời</button><Link target="_blank" href={`/host/${code}/screen`}>Mở màn hình công khai ↗</Link></div></section>
    {qr && <div className="race-action-bar"><img className="race-qr" src={qr} alt={`Mã QR tham gia phòng ${code}`} width={128} height={128} /><p>Quét QR để tham gia · Mã phòng <strong>{code}</strong><br /><small>Chỉ chia sẻ mã mời này, không chia sẻ mã khôi phục chủ phòng.</small></p></div>}
    {!connected && <p className="race-alert">Dữ liệu đang tạm dừng cập nhật. Lần cuối: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('vi') : '—'}.</p>}
    {notice && <p className="race-note" role="status">{notice}</p>}
    <div className="race-stats"><div><strong>{session.participants.length}/{session.maxPlayers}</strong><span>Thí sinh</span></div><div><strong>{readyCount}</strong><span>Sẵn sàng</span></div><div><strong>{session.participants.filter(p => p.status === 'finished').length}</strong><span>Đã hoàn thành</span></div><div><strong>{session.participants.filter(p => !p.connected).length}</strong><span>Mất kết nối</span></div><div><strong>{session.endsAt && ['running', 'countdown'].includes(session.status) ? formatRaceTime(Math.max(0, session.endsAt - (session.serverNow + now - (lastUpdate || now)))).slice(0, 5) : `${session.durationMinutes}:00`}</strong><span>Thời gian còn lại</span></div></div>
    <div className="race-action-bar">{session.status === 'lobby' && <button className="race-button" disabled={busy || !connected || !activeCount || readyCount !== activeCount} onClick={() => void act('start')}>Bắt đầu chung · {readyCount}/{activeCount} sẵn sàng</button>}{['running', 'countdown'].includes(session.status) && <button className="race-button race-danger" disabled={busy || !connected} onClick={() => setConfirmation({ action: 'end' })}>Kết thúc sớm</button>}{session.status === 'finalized' && <><button className="race-button" onClick={() => setTab('podium')}>Vinh danh Top 3</button><button className="race-button race-secondary" onClick={exportCsv}>Tải kết quả CSV</button><Link href="/host/new">Tạo cuộc thi mới</Link></>}</div>
    <nav className="race-tabs" aria-label="Bảng điều khiển">{[['roster', 'Thí sinh'], ['questions', 'Bộ câu hỏi'], ['ranking', 'Xếp hạng trực tiếp'], ...(session.status === 'finalized' ? [['podium', 'Vinh danh']] : [])].map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); if (id === 'questions') void act('questions'); }}>{label}</button>)}</nav>
    {tab === 'roster' && <section className="race-panel"><div className="race-fields"><input aria-label="Tìm thí sinh" placeholder="Tìm theo tên hoặc mã thí sinh…" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Lọc trạng thái" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="offline">Mất kết nối</option>{['waiting', 'racing', 'finished', 'withdrawn', 'timed_out'].map(s => <option key={s} value={s}>{competitionStatus[s]}</option>)}</select></div><div className="race-table-wrap"><table className="race-table"><thead><tr><th>Thí sinh</th><th>Trạng thái</th>{competitionRooms.map((r, i) => <th key={r.id} title={r.name}>P{i + 1}</th>)}<th>Đúng</th><th>Thời gian</th><th>Chi tiết</th></tr></thead><tbody>{visible.map(p => <tr key={p.id}><td><strong>{p.nickname}</strong><small>{p.id.slice(0, 6)} · {p.connected ? 'Online' : 'Mất mạng'}</small></td><td>{p.status === 'waiting' && p.ready ? 'Đã sẵn sàng' : competitionStatus[p.status]}</td>{competitionRooms.map(r => <td key={r.id} className={p.progress[r.id] === 2 ? 'race-success-text' : ''}>{p.progress[r.id] || 0}/2</td>)}<td>{p.score}/10</td><td>{formatRaceTime(p.elapsedMs)}</td><td><button className="race-link" onClick={() => setDetail(p.id)}>Xem</button></td></tr>)}{!visible.length && <tr><td colSpan={10}>Chưa có thí sinh phù hợp.</td></tr>}</tbody></table></div></section>}
    {tab === 'questions' && <section className="race-panel"><h2>Bộ câu hỏi · Hành trình 1911–1930</h2><p>{session.status === 'lobby' ? 'Bộ câu duy nhất đã chuẩn bị: 2 câu/phòng, 10 câu cho mọi thí sinh.' : 'Bộ câu đã được chốt. Không sửa giữa cuộc thi.'} Đáp án chỉ dành cho chủ phòng.</p>{competitionRooms.map((room, i) => <div className="race-question-group" key={room.id}><h3>Phòng {i + 1} · {room.name}</h3>{questions.filter(q => q.roomId === room.id).map(q => <article key={q.id}><h4>{q.prompt}</h4><ul>{q.options.map(o => <li key={o.id} className={q.correctOptionId === o.id ? 'race-success-text' : ''}>{q.correctOptionId === o.id ? '✓ ' : ''}{o.text}</li>)}</ul><p>{q.explanation}</p><small>{q.source}</small><p>{session.participants.filter(p => p.correctQuestionIds.includes(q.id)).length}/{session.participants.length} thí sinh đã trả lời đúng</p></article>)}</div>)}</section>}
    {tab === 'ranking' && <section className="race-panel"><CompetitionLeaderboard session={session} /></section>}
    {tab === 'podium' && <CompetitionPodium session={session} />}
    </>}
    {selected && <div className="race-modal-backdrop"><section className="race-modal" role="dialog" aria-modal="true" aria-label="Chi tiết thí sinh"><button className="race-close" onClick={() => setDetail(null)} aria-label="Đóng">×</button><h2>{selected.nickname}</h2><p>Mã: {selected.id}</p><p>{competitionStatus[selected.status]} · {selected.connected ? 'Đang kết nối' : 'Mất kết nối'}</p><p>Phòng hiện tại: {competitionRooms.find(r => r.id === selected.currentRoomId)?.name || 'Sảnh'}</p><p>{selected.score}/10 câu đúng · {selected.wrongAttempts} lượt sai · {selected.attempts} lượt trả lời</p><p>Thời gian hoàn thành: {formatRaceTime(selected.elapsedMs)}</p><ul>{competitionRooms.map(r => <li key={r.id}>{r.name}: {selected.progress[r.id] || 0}/2 câu đúng</li>)}</ul>{session && ['lobby', 'running', 'countdown'].includes(session.status) && selected.status !== 'finished' && selected.status !== 'withdrawn' && <button className="race-button race-danger" onClick={() => { setConfirmation({ action: 'withdraw', participantId: selected.id, name: selected.nickname }); setDetail(null); }}>Đánh dấu rút lui</button>}</section></div>}
    {confirmation && <div className="race-modal-backdrop"><form className="race-modal race-form" role="dialog" aria-modal="true" onSubmit={e => { e.preventDefault(); void act(confirmation.action, { participantId: confirmation.participantId, reason }); }}><h2>{confirmation.action === 'end' ? 'Kết thúc cuộc thi sớm?' : `${confirmation.name} rút lui?`}</h2><p>Kết quả đã ghi nhận được giữ lại. Người chưa hoàn thành không tranh Top 3.</p><label>Lý do<textarea value={reason} onChange={e => setReason(e.target.value)} required minLength={3} maxLength={200} /></label><div className="race-actions"><button type="button" className="race-button race-secondary" onClick={() => setConfirmation(null)}>Quay lại</button><button disabled={busy} className="race-button race-danger">Xác nhận</button></div></form></div>}
  </main>;
}

export function PublicCompetitionScreen({ code }: { code: string }) {
  const { session, connected, error } = useHostSession(code, true);
  return <main className="race-page race-public"><header className="race-header"><Link href="/">Theo dấu chân Người</Link><span>{connected ? 'Đang cập nhật trực tiếp' : 'Đang nối lại…'}</span></header>{error && <p className="race-alert">{error}</p>}{session ? <><p className="race-eyebrow">Mã phòng {code} · {competitionStatus[session.status]}</p><h1>{session.title}</h1><p>{session.participants.filter(p => p.status === 'finished').length}/{session.participants.length} thí sinh đã hoàn thành</p>{session.status === 'finalized' ? <CompetitionPodium session={session} /> : null}<CompetitionLeaderboard session={session} /></> : <p>Đang mở cuộc thi…</p>}</main>;
}
