'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCompetition } from '@/context/CompetitionContext';
import { useMuseum } from '@/context/MuseumContext';
import { AvatarSelector } from './AvatarSelector';
import { competitionRooms, competitionStatus, formatRaceTime } from '@/lib/competitionPresentation';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';
import { CompetitionPodium } from './CompetitionPodium';
import stations from '@/lib/competitionStations.json';

export function CompetitionJoin() {
  const params = useSearchParams(); const router = useRouter(); const { join } = useCompetition();
  const { outfitId, setOutfitId } = useMuseum();
  const [code, setCode] = useState(params.get('code') || ''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <main className="race-page"><header className="race-header"><Link href="/">← Bảo tàng</Link><Link href="/host">Bạn là người tổ chức?</Link></header><div className="race-intro"><p className="race-eyebrow">Theo dấu chân Người</p><h1>Sẵn sàng cho<br />hành trình của bạn?</h1><p>Chọn trang phục, nhập tên và gặp các bạn trong phòng chờ. Chủ phòng sẽ bắt đầu cuộc thi cho cả nhóm.</p></div><form className="race-panel race-join race-form" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('');
    const reply = await join({ code: code.trim().toUpperCase(), nickname: name.trim(), outfitId });
    setBusy(false); if (reply.ok && reply.session) router.push(`/lobby?competition=${reply.session.code}`); else setError(reply.error || 'Không tham gia được.');
  }}><AvatarSelector value={outfitId} onChange={setOutfitId} /><div className="race-fields"><label>Tên của bạn<input required maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="Bạn muốn mọi người gọi là…" /></label><label>Mã phòng thi<input required maxLength={12} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Mã từ người tổ chức" /></label></div><p className="race-note">Mỗi phòng cần 2 câu đúng. Trả lời sai được thử lại; thời gian vẫn chạy. Đủ 5 phòng, người về đích nhanh nhất dẫn đầu.</p>{error && <p className="race-alert" role="alert">{error}</p>}<button className="race-button" disabled={busy}>{busy ? 'Đang vào phòng…' : 'Vào phòng chờ'}</button><Link href="/lobby" className="race-link">Chỉ tham quan bảo tàng</Link></form></main>;
}

export function CompetitionPlayerHud() {
  const path = usePathname(); const router = useRouter();
  const { session, participantId, connected, error, command, leave, activeQuestionId, setActiveQuestionId } = useCompetition();
  const { currentRoom, setRoomFourInteractionOpen, setCompetitionMode } = useMuseum();
  const [collapsed, setCollapsed] = useState(false); const [ranking, setRanking] = useState(false);
  const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState(''); const [selected, setSelected] = useState('');
  const [now, setNow] = useState(0); const [dismissedFinal, setDismissedFinal] = useState('');
  const playing = path === '/lobby' && !!session && !!participantId;
  const participant = session?.participants.find(p => p.id === participantId);
  const room = competitionRooms.find(r => r.id === currentRoom);
  const quiz = Boolean(activeQuestionId);
  const nextQuestion = session?.questions.find(q => q.id === activeQuestionId && q.roomId === currentRoom && !participant?.correctQuestionIds.includes(q.id));
  const activeStation = stations.find(station => station.questionId === activeQuestionId);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t); }, []);
  useEffect(() => { if (playing && connected) void command('comp:room', { roomId: currentRoom }); }, [playing, connected, currentRoom, command]);
  useEffect(() => {
    if (!playing) return;
    setCompetitionMode(true);
    setRoomFourInteractionOpen(quiz || ranking || ['lobby', 'countdown'].includes(session!.status));
    return () => setRoomFourInteractionOpen(false);
  }, [playing, quiz, ranking, session, setRoomFourInteractionOpen, setCompetitionMode]);
  if (!playing || !session || !participant) return null;
  const elapsed = participant.elapsedMs ?? (session.startedAt ? Math.max(0, now - session.startedAt) : 0);
  const completed = competitionRooms.filter(r => participant.progress[r.id] === 2).length;
  const isFinal = session.status === 'finalized' && dismissedFinal !== session.code;
  const nextStation = stations.find(station => station.roomId === currentRoom && !participant.correctQuestionIds.includes(station.questionId));
  const nextRoom = competitionRooms.find(r => participant.progress[r.id] !== 2);
  const toggleReady = async () => { setBusy(true); await command('comp:ready', { ready: !participant.ready }); setBusy(false); };
  return <div className="race-hud-root"><aside className={`race-hud ${collapsed ? 'race-hud-small' : ''}`} aria-label="Hướng dẫn cuộc thi"><div className="race-hud-heading"><div><small>Phòng thi {session.code}</small><strong>{participant.nickname}</strong></div><button aria-label={collapsed ? 'Mở hướng dẫn' : 'Thu gọn hướng dẫn'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '+' : '−'}</button></div><p className="race-clock">{formatRaceTime(elapsed).slice(0, 5)} <span>· {participant.score}/10 điểm</span></p>{session.status === 'lobby' && <button className={`race-ready-button ${participant.ready ? 'race-ready-button-on' : ''}`} disabled={!connected || busy} onClick={() => void toggleReady()}>{participant.ready ? '✓ Đã sẵn sàng' : 'Tôi đã sẵn sàng'}</button>}{!collapsed && <>
    <p className="race-connect" role="status">{connected ? competitionStatus[session.status] : 'Mất kết nối — đang nối lại…'}</p>{error && <p className="race-alert">{error}</p>}
    {session.status === 'lobby' ? <><h2>Chờ chủ phòng bắt đầu</h2><p>Chủ phòng: {session.hostName}</p><p>{session.participants.filter(p => p.ready).length}/{session.participants.length} thí sinh sẵn sàng.</p><p className="race-ready-hint">Nút sẵn sàng luôn ở ngay trên đây, kể cả khi bạn thu gọn bảng.</p></> : session.status === 'countdown' ? <><h2>Bắt đầu sau</h2><p className="race-countdown">{Math.max(0, Math.ceil(((session.startedAt || 0) - now) / 1000))}</p></> : <>
    <h2>{room ? `Phòng ${competitionRooms.indexOf(room) + 1} · ${room.name}` : 'Sảnh bảo tàng'}</h2><p>{room?.hint || 'Đi vào phòng để khám phá và trả lời câu hỏi.'}</p><p><strong>Đã đúng: {room ? participant.progress[room.id] || 0 : 0}/2</strong> · Hành trình {completed}/5 phòng</p>
    {participant.status === 'racing' && session.status === 'running' && <p className="race-note">{nextStation ? <>Đi tới tranh <strong>“{nextStation.title}”</strong>, đứng gần rồi nhấp vào tranh để đọc tư liệu và trả lời.</> : nextRoom ? <>Bạn đã hoàn thành phòng này. Hãy tự đi qua cửa để đến <strong>{nextRoom.name}</strong>.</> : 'Bạn đã hoàn thành mọi điểm tương tác.'}</p>}
    {participant.status === 'finished' && <p className="race-note">Bạn đã về đích! {session.participants.filter(p => p.status === 'finished').length}/{session.participants.length} thí sinh hoàn thành. Đang chờ tổng kết.</p>}
    {['withdrawn', 'timed_out'].includes(participant.status) && <p className="race-note">{competitionStatus[participant.status]}. Kết quả đã ghi nhận được giữ lại.</p>}
    {session.status === 'aborted' && <p className="race-alert">Máy chủ đã khởi động lại. Phiên này đã hủy để đảm bảo công bằng; chờ chủ phòng tạo phiên mới.</p>}
    <ol className="race-room-list">{competitionRooms.map((r, i) => <li key={r.id} className={r.id === currentRoom ? 'active' : ''}><span>{participant.progress[r.id] === 2 ? '✓' : i + 1}</span><span>{r.name}</span><strong>{participant.progress[r.id] || 0}/2</strong></li>)}</ol>
    </>}<button className="race-link" onClick={() => setRanking(true)}>Xem bảng xếp hạng</button><Link className="race-link" href={`/host/${session.code}/screen`} target="_blank">Màn hình công khai ↗</Link>
    </>}</aside>
    {quiz && <div className="race-modal-backdrop"><section className="race-modal" role="dialog" aria-modal="true" aria-label="Câu hỏi cuộc thi"><button className="race-close" aria-label="Đóng câu hỏi" onClick={() => { setSelected(''); setFeedback(''); setActiveQuestionId(null); }}>×</button><p className="race-eyebrow">{room?.name} · {room ? participant.progress[room.id] || 0 : 0}/2 câu đúng</p>{nextQuestion ? <>{activeStation && <figure className="race-station-source"><Image src={activeStation.image} alt={activeStation.title} width={640} height={360} sizes="(max-width: 700px) 90vw, 600px" /><figcaption>{activeStation.caption}</figcaption></figure>}<h2>{nextQuestion.prompt}</h2><div className="race-answers">{nextQuestion.options.map(o => <button key={o.id} className={selected === o.id ? 'selected' : ''} onClick={() => setSelected(o.id)} disabled={busy}>{o.text}</button>)}</div>{feedback && <p className="race-note" role="status">{feedback}</p>}<button className="race-button" disabled={!selected || busy || !connected || session.status !== 'running'} onClick={async () => { setBusy(true); const result = await command('comp:answer', { roomId: currentRoom, questionId: nextQuestion.id, optionId: selected, requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}` }); setBusy(false); setSelected(''); setFeedback(result.ok ? result.correct ? 'Chính xác! Đã ghi nhận 1 điểm.' : 'Chưa đúng. Hãy xem lại tư liệu và thử lại; thời gian vẫn chạy.' : result.error || 'Không gửi được câu trả lời.'); }}>Xác nhận đáp án</button></> : <><h2>Điểm tương tác đã hoàn thành ✓</h2><p>Điểm và tiến độ đã được máy chủ ghi nhận.</p><button className="race-button" onClick={() => { setSelected(''); setFeedback(''); setActiveQuestionId(null); }}>Tiếp tục hành trình</button></>}</section></div>}
    {(ranking || isFinal) && <div className="race-modal-backdrop"><section className="race-modal race-modal-wide" role="dialog" aria-modal="true" aria-label="Kết quả cuộc thi"><button className="race-close" aria-label="Đóng kết quả" onClick={() => { setRanking(false); setDismissedFinal(session.code); }}>×</button>{session.status === 'finalized' && <CompetitionPodium session={session} />}<CompetitionLeaderboard session={session} compact />{['finalized', 'aborted'].includes(session.status) && <button className="race-button" onClick={() => { leave(); setCompetitionMode(false); router.push('/play'); }}>Tham gia cuộc thi khác</button>}</section></div>}
  </div>;
}

