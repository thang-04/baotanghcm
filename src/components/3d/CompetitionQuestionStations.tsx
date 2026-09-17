'use client';
/* eslint-disable @next/next/no-img-element */
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useCompetition } from '@/context/CompetitionContext';
import { useMuseum } from '@/context/MuseumContext';
import stations from '@/lib/competitionStations.json';

export function CompetitionQuestionStations() {
  const { session, participantId, connected, command, setActiveQuestionId } = useCompetition();
  const { currentRoom, playerPositionRef } = useMuseum();
  const lastSent = useRef(0); const [nearby, setNearby] = useState<string[]>([]); const [notice, setNotice] = useState('');
  const me = session?.participants.find(p => p.id === participantId);
  useFrame(({ clock }) => {
    if (!session || !me || !connected || clock.elapsedTime - lastSent.current < .3) return;
    lastSent.current = clock.elapsedTime;
    const [x, y, z] = playerPositionRef.current;
    void command('comp:position', { x, y, z });
    const near = stations.filter(s => s.roomId === currentRoom && Math.hypot(x - s.position[0], z - s.position[2]) <= 3.2).map(s => s.questionId);
    setNearby(previous => previous.join(',') === near.join(',') ? previous : near);
  });
  if (!session || !me || !['countdown', 'running', 'finalized'].includes(session.status)) return null;
  return <group name="competition-question-stations">{stations.filter(s => s.roomId === currentRoom).map((station, index) => {
    const completed = me.correctQuestionIds.includes(station.questionId); const near = nearby.includes(station.questionId);
    return <group key={station.questionId} position={station.position as [number, number, number]}>
      <mesh position={[0,-1.1,0]}><boxGeometry args={[.12,2.2,.12]} /><meshStandardMaterial color="#7e6c54" roughness={.9} /></mesh>
      <mesh position={[0,-1.78,0]}><boxGeometry args={[1.4,.08,.7]} /><meshStandardMaterial color="#b8a58a" /></mesh>
      <Html center distanceFactor={7} position={[0,.25,0]} style={{ pointerEvents: 'auto' }}>
        <button className={`race-station ${completed ? 'race-station-done' : ''}`} aria-label={`Điểm câu hỏi ${index + 1}: ${station.title}`} onClick={async e => {
          e.stopPropagation();
          if (!near) { setNotice('Hãy đi tới gần tranh (trong khoảng 3 mét) để mở.'); return; }
          if (session.status !== 'running') { setNotice('Chờ chủ phòng bắt đầu cuộc thi.'); return; }
          if (completed) { setNotice('Bạn đã trả lời đúng câu hỏi tại điểm này.'); return; }
          const [x,y,z] = playerPositionRef.current; await command('comp:position', { x,y,z });
          const reply = await command('comp:question', { roomId: station.roomId, questionId: station.questionId });
          if (reply.ok) { setNotice(''); setActiveQuestionId(station.questionId); } else setNotice(reply.error || 'Chưa mở được câu hỏi.');
        }}><img src={station.image} alt={station.title} width={220} height={135} /><strong>{completed ? '✓ ' : `${index + 1}. `}{station.title}</strong><span>{completed ? 'Đã hoàn thành' : near ? 'Nhấp tranh để đọc và trả lời' : 'Đi tới gần tranh để tương tác'}</span></button>
      </Html>
    </group>;
  })}{notice && <Html fullscreen style={{pointerEvents:'none'}}><div className="race-station-notice" role="status">{notice}<button style={{pointerEvents:'auto'}} onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div></Html>}</group>;
}
