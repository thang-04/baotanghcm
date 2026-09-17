import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Html, Text, useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Object3D } from 'three';

interface RoomThreeHistoricExhibitsProps {
  isVisible?: boolean;
}

type HistoricArtwork = {
  src: string;
  size: readonly [number, number];
};

type HistoricDisplayData = {
  id: string;
  title: string;
  source: string;
  timeline: string;
  event: string;
  position: readonly [number, number, number];
  rotationY: number;
  framed?: boolean;
  artwork?: HistoricArtwork;
  excerpt: string;
  context: string;
  citation: string;
  contentSourceUrl: string;
  imageSourceUrl?: string;
  imageCredit?: string;
};

const petitionSourceUrl = 'https://vi.wikisource.org/wiki/Y%C3%AAu_s%C3%A1ch_c%E1%BB%A7a_nh%C3%A2n_d%C3%A2n_An_Nam';
const ignoreRaycast: Object3D['raycast'] = () => null;

const historicDisplays: readonly HistoricDisplayData[] = [
  {
    id: 'room-three-legal-equality',
    title: 'Bình đẳng trước pháp luật',
    source: 'Người dân thuộc địa · 1908',
    timeline: '1908',
    event: 'Phong trào chống thuế Trung Kỳ',
    position: [-14.25, 2.7, -8],
    rotationY: Math.PI / 2,
    framed: true,
    artwork: {
      src: '/exhibits/room-three/room-three-legal-equality-arrests-1908.png',
      size: [1.18, 1.82],
    },
    excerpt: '“Công lý phải bảo vệ người bản xứ ngang hàng với người Âu châu.”',
    context: 'Một yêu cầu về cải cách pháp lý: chấm dứt hệ thống tòa án đặc biệt và đặt người dân thuộc địa dưới cùng những bảo đảm pháp luật.',
    citation: 'Diễn giải triển lãm từ điểm 2 của “Yêu sách của nhân dân An Nam” (1919).',
    contentSourceUrl: petitionSourceUrl,
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Arrests_of_the_anti-_taxation_revolts_having_occured_in_the_central_Vietnam_in_1908.png',
    imageCredit: 'Những người bị bắt sau phong trào chống thuế Trung Kỳ năm 1908 · Wikimedia Commons · phạm vi công cộng.',
  },
  {
    id: 'room-three-press-freedom',
    title: 'Tự do báo chí, ngôn luận',
    source: 'Le Paria · Paris · 1922',
    timeline: '1922',
    event: 'Le Paria — diễn đàn chống thực dân',
    position: [-14.25, 2.7, 0],
    rotationY: Math.PI / 2,
    framed: true,
    artwork: {
      src: '/exhibits/room-three/room-three-press-freedom.png',
      size: [1.28, 1.82],
    },
    excerpt: '“Một tiếng nói công khai là điều kiện để một dân tộc được lắng nghe.”',
    context: 'Yêu cầu tự do báo chí và ngôn luận đặt việc nói ra sự thật về đời sống thuộc địa vào không gian công luận, thay vì dưới sự kiểm duyệt.',
    citation: 'Diễn giải triển lãm từ điểm 3 của “Yêu sách của nhân dân An Nam” (1919).',
    contentSourceUrl: petitionSourceUrl,
    imageCredit: 'Số báo Le Paria do nhóm triển lãm cung cấp.',
  },
  {
    id: 'room-three-assembly-freedom',
    title: 'Tự do lập hội, hội họp',
    source: 'Nguyễn Ái Quốc · Marseille · 1921',
    timeline: '1921',
    event: 'Nguyễn Ái Quốc tại Đại hội Marseille',
    position: [14.25, 2.7, 0],
    rotationY: -Math.PI / 2,
    framed: true,
    artwork: {
      src: '/exhibits/room-three/room-three-assembly-marseille-1921.jpg',
      size: [1.12, 1.82],
    },
    excerpt: '“Quyền gặp gỡ và liên kết biến tiếng nói riêng lẻ thành một cộng đồng.”',
    context: 'Điểm yêu sách về lập hội và hội họp mở ra một không gian chính trị chung, nơi người Việt ở Pháp và các dân tộc thuộc địa có thể tổ chức, trao đổi và hành động.',
    citation: 'Diễn giải triển lãm từ điểm 4 của “Yêu sách của nhân dân An Nam” (1919).',
    contentSourceUrl: petitionSourceUrl,
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Nguyen_A%C3%AFn_Nu%C3%A4%27C_(Ho-Chi-Minh),_d%C3%A9l%C3%A9gu%C3%A9_indochinois,_Congr%C3%A8s_communiste_de_Marseille,_1921,_Meurisse,_BNF_Gallica.jpg',
    imageCredit: 'Nguyễn Ái Quốc, đại biểu Đông Dương tại Đại hội Marseille năm 1921 · Meurisse / BnF Gallica · Wikimedia Commons.',
  },
  {
    id: 'room-three-movement-freedom',
    title: 'Tự do cư trú, đi lại',
    source: 'Không gian Đông Dương thuộc Pháp',
    timeline: '1919',
    event: 'Quyền cư trú, đi lại và xuất dương',
    position: [-7, 2.1, 12.8],
    rotationY: Math.PI,
    artwork: {
      src: '/exhibits/room-three/room-three-movement-map-french-indochina.png',
      size: [1.08, 1.5],
    },
    excerpt: '“Đi lại và cư trú không thể là đặc quyền bị giới hạn bởi chế độ thuộc địa.”',
    context: 'Yêu cầu này hướng tới quyền rời khỏi lãnh thổ, học tập và làm việc ở nước ngoài — một điều kiện để người dân thuộc địa tiếp cận thế giới và công luận quốc tế.',
    citation: 'Diễn giải triển lãm từ điểm 5 của “Yêu sách của nhân dân An Nam” (1919).',
    contentSourceUrl: petitionSourceUrl,
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:French_Indochina_1900-1945-fr.svg',
    imageCredit: 'Bản đồ Đông Dương thuộc Pháp, giai đoạn 1900–1945 · Flappiefh · CC BY-SA 4.0 · Wikimedia Commons.',
  },
  {
    id: 'room-three-versailles-conference',
    title: 'Đại diện trong Nghị viện Pháp',
    source: 'Hội nghị Versailles · 1919',
    timeline: '1919',
    event: 'Yêu sách gửi Hội nghị Versailles',
    position: [14.25, 2.7, -8],
    rotationY: -Math.PI / 2,
    framed: true,
    artwork: {
      src: '/exhibits/room-three/room-three-versailles-conference.png',
      size: [2.5, 1.82],
    },
    excerpt: '“Một dân tộc không thể được nói thay; họ phải có đại diện của chính mình.”',
    context: 'Yêu sách kết thúc bằng đòi hỏi về đại diện thường trực của người bản xứ tại Nghị viện Pháp — chuyển tiếng nói phản kháng thành một yêu cầu về vị thế chính trị.',
    citation: 'Diễn giải triển lãm từ điểm 8 của “Yêu sách của nhân dân An Nam” (1919).',
    contentSourceUrl: petitionSourceUrl,
    imageCredit: 'Ảnh tư liệu Hội nghị Versailles do nhóm triển lãm cung cấp.',
  },
];

const ROOM_FOUR_GOLD = {
  button: '#b27a25',
  buttonText: '#1e1608',
  face: '#2a1b08',
  frame: '#9a6e24',
  glow: '#ffd778',
  highlight: '#ffe6aa',
  text: '#fff7df',
};

type ExhibitFootPlaqueProps = Pick<HistoricDisplayData, 'event' | 'id' | 'timeline'> & {
  onExplore: () => void;
};

const ExhibitFootPlaque: React.FC<ExhibitFootPlaqueProps> = ({ event, id, timeline, onExplore }) => {
  const openExhibit = (pointerEvent: { stopPropagation: () => void }) => {
    pointerEvent.stopPropagation();
    onExplore();
  };

  return (
  <group name={`room-three-${id}-foot-plaque`} position={[0, -1.84, 0.28]}>
    <group rotation={[-Math.PI / 4, 0, 0]}>
    <mesh position={[0, 0, 0.04]} raycast={ignoreRaycast} renderOrder={2}>
      <boxGeometry args={[2.34, 1.02, 0.025]} />
      <meshBasicMaterial color={ROOM_FOUR_GOLD.glow} depthWrite={false} opacity={0.44} toneMapped={false} transparent />
    </mesh>
    <mesh position={[0, 0, 0]} raycast={ignoreRaycast} renderOrder={3}>
      <boxGeometry args={[2.22, 0.94, 0.1]} />
      <meshStandardMaterial color={ROOM_FOUR_GOLD.frame} emissive="#5c3c0c" emissiveIntensity={0.32} metalness={0.78} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.13, 0.065]} raycast={ignoreRaycast} renderOrder={4}>
      <boxGeometry args={[2.02, 0.6, 0.025]} />
      <meshStandardMaterial color={ROOM_FOUR_GOLD.face} metalness={0.08} roughness={0.7} />
    </mesh>
    <mesh position={[0, -0.23, 0.075]} raycast={ignoreRaycast} renderOrder={5}>
      <boxGeometry args={[2.06, 0.024, 0.03]} />
      <meshBasicMaterial color={ROOM_FOUR_GOLD.highlight} toneMapped={false} />
    </mesh>
    <Text
      anchorX="left"
      anchorY="middle"
      color={ROOM_FOUR_GOLD.text}
      fontSize={0.135}
      letterSpacing={0.018}
      position={[-0.92, 0.335, 0.085]}
      raycast={ignoreRaycast}
    >
      {timeline}
    </Text>
    <Text
      anchorX="center"
      anchorY="middle"
      color={ROOM_FOUR_GOLD.text}
      fontSize={0.1}
      lineHeight={1.1}
      maxWidth={1.84}
      overflowWrap="break-word"
      position={[0, 0.065, 0.085]}
      raycast={ignoreRaycast}
      textAlign="center"
    >
      {event}
    </Text>
    <mesh
      name={`room-three-${id}-explore-button`}
      onClick={openExhibit}
      onPointerDown={openExhibit}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      position={[0, -0.355, 0.086]}
      renderOrder={5}
    >
      <boxGeometry args={[1.9, 0.16, 0.06]} />
      <meshStandardMaterial color={ROOM_FOUR_GOLD.button} emissive="#d99624" emissiveIntensity={0.58} metalness={0.68} roughness={0.3} />
    </mesh>
    <Text
      anchorX="center"
      anchorY="middle"
      color={ROOM_FOUR_GOLD.buttonText}
      fontSize={0.105}
      letterSpacing={0.02}
      position={[0, -0.355, 0.12]}
      raycast={ignoreRaycast}
    >
      KHÁM PHÁ
    </Text>
    <mesh
      name={`room-three-${id}-explore-hit-area`}
      onClick={openExhibit}
      onPointerDown={openExhibit}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      position={[0, 0, 0.16]}
      renderOrder={6}
    >
      <boxGeometry args={[2.22, 0.94, 0.01]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} transparent opacity={0} />
    </mesh>
    </group>
    {[-0.82, 0.82].map((x) => (
      <mesh key={`room-three-${id}-plaque-post-${x}`} position={[x, -0.235, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[0.05, 0.11, 0.06]} />
        <meshStandardMaterial color={ROOM_FOUR_GOLD.frame} emissive="#5c3c0c" emissiveIntensity={0.32} metalness={0.78} roughness={0.28} />
      </mesh>
    ))}
  </group>
  );
};

type HistoricArtworkProps = HistoricArtwork & {
  onSelect: () => void;
};

const HistoricArtwork: React.FC<HistoricArtworkProps> = ({ src, size, onSelect }) => {
  const artworkTexture = useTexture(src, (texture) => {
    texture.colorSpace = SRGBColorSpace;
  });

  const selectArtwork = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <mesh position={[0, 0, 0.155]} onClick={selectArtwork} onPointerDown={selectArtwork}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={artworkTexture} toneMapped={false} />
    </mesh>
  );
};

type HistoricDisplayProps = HistoricDisplayData & {
  onSelect: (displayId: string) => void;
};

const HistoricDisplay: React.FC<HistoricDisplayProps> = ({
  id,
  timeline,
  event,
  position,
  rotationY,
  framed = false,
  artwork,
  onSelect,
}) => (
  <group position={position} rotation={[0, rotationY, 0]} onClick={(event) => {
    event.stopPropagation();
    onSelect(id);
  }} onPointerDown={(event) => {
    event.stopPropagation();
    onSelect(id);
  }}>
    <mesh castShadow>
      <boxGeometry args={framed ? [4.1, 2.7, 0.16] : [3.6, 2.25, 0.12]} />
      <meshStandardMaterial color={framed ? '#5b3a24' : '#2b3a4b'} roughness={0.7} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0, 0.1]}>
      <boxGeometry args={framed ? [3.7, 2.3, 0.04] : [3.2, 1.85, 0.04]} />
      <meshStandardMaterial color={framed ? '#d6b77a' : '#d8c49b'} roughness={0.82} />
    </mesh>
    <mesh position={[0, 0, 0.13]}>
      <boxGeometry args={framed ? [3.35, 1.95, 0.02] : [2.9, 1.5, 0.02]} />
      <meshStandardMaterial color={framed ? '#4a3b2b' : '#7b6041'} roughness={0.9} />
    </mesh>
    {artwork && <HistoricArtwork {...artwork} onSelect={() => onSelect(id)} />}
    <ExhibitFootPlaque event={event} id={id} timeline={timeline} onExplore={() => onSelect(id)} />
  </group>
);

const ExhibitStoryCard: React.FC<{
  exhibit: HistoricDisplayData;
  onClose: () => void;
  portalRef: React.RefObject<HTMLElement>;
}> = ({ exhibit, onClose, portalRef }) => (
  <Html
    calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]}
    fullscreen
    onOcclude={() => undefined}
    portal={portalRef}
    style={{ fontFamily: 'Hanken Grotesk, Manrope, sans-serif', pointerEvents: 'none' }}
    zIndexRange={[20_000_000, 19_000_000]}
  >
    <div style={{ alignItems: 'center', background: 'rgba(7, 16, 21, 0.78)', boxSizing: 'border-box', color: '#f4ead8', display: 'flex', height: '100vh', justifyContent: 'center', overflowY: 'auto', padding: '32px', width: '100vw' }}>
      <article
        aria-label={`Tư liệu triển lãm: ${exhibit.title}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        style={{
          background: 'rgba(13, 23, 28, 0.98)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: 0,
          boxShadow: '0 28px 90px rgba(0, 0, 0, 0.58)',
          boxSizing: 'border-box',
          color: '#f8e9c9',
          fontFamily: 'Hanken Grotesk, Manrope, sans-serif',
          maxWidth: '72vw',
          maxHeight: 'min(860px, calc(100vh - 32px))',
          overflowY: 'auto',
          padding: '56px 80px',
          pointerEvents: 'auto',
          position: 'relative',
          textAlign: 'center',
          width: '72vw',
        }}
      >
        <button
          aria-label="Đóng tư liệu"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          style={{
            background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: 0, color: '#cbd5e1', cursor: 'pointer',
            fontFamily: 'Hanken Grotesk, Manrope, sans-serif', fontSize: '18px', height: '40px', padding: 0, position: 'absolute', right: '24px', top: '24px', width: '40px',
          }}
          type="button"
        >
          ×
        </button>
        <p style={{ color: '#a9c9d4', fontFamily: 'Space Grotesk, ui-monospace, monospace', fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', margin: 0, textTransform: 'uppercase' }}>
          {exhibit.timeline} · Phòng trưng bày 03
        </p>
        <div style={{ background: '#d7a768', height: 1, margin: '20px auto 0', width: '64px' }} />
        <h2 style={{ color: '#f4ead8', fontFamily: 'EB Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, lineHeight: 1.08, margin: '24px 0 0' }}>{exhibit.title}</h2>
        <blockquote style={{ color: '#cbd5e1', fontFamily: 'Hanken Grotesk, Manrope, sans-serif', fontSize: 'clamp(15px, 2vw, 17px)', fontStyle: 'normal', lineHeight: 1.75, margin: '24px auto 0', maxWidth: '640px', padding: 0 }}>
          {exhibit.excerpt}
        </blockquote>
        {exhibit.artwork && <figure style={{ background: '#070c0f', border: '1px solid rgba(148, 163, 184, 0.4)', boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)', margin: '40px auto 0', maxWidth: '760px', overflow: 'hidden' }}>
          <Image alt={exhibit.title} className="h-auto w-full object-contain" height={640} sizes="(max-width: 1024px) calc(100vw - 64px), 760px" src={exhibit.artwork.src} width={960} />
          <figcaption style={{ borderTop: '1px solid rgba(100, 116, 139, 0.45)', color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, padding: '16px 20px' }}>{exhibit.event}</figcaption>
        </figure>}
        <div style={{ borderTop: '1px solid rgba(100, 116, 139, 0.45)', color: '#e2e8f0', fontSize: '16px', lineHeight: 2, margin: '40px auto 0', maxWidth: '760px', paddingTop: '32px' }}>
          <p style={{ margin: 0 }}>{exhibit.context}</p>
          <p style={{ color: '#a9c9d4', fontFamily: 'Space Grotesk, ui-monospace, monospace', fontSize: '12px', lineHeight: 1.5, margin: '24px 0 0' }}>{exhibit.citation}</p>
        </div>
        <div style={{ borderTop: '1px solid rgba(100, 116, 139, 0.45)', fontFamily: 'Hanken Grotesk, Manrope, sans-serif', fontSize: '12px', lineHeight: 1.5, margin: '32px auto 0', maxWidth: '760px', paddingTop: '16px' }}>
          <a href={exhibit.contentSourceUrl} rel="noreferrer" target="_blank" style={{ color: '#d7a768' }}>Đọc văn bản gốc</a>
          {exhibit.imageSourceUrl && <>
            <span style={{ color: '#64748b' }}> · </span>
            <a href={exhibit.imageSourceUrl} rel="noreferrer" target="_blank" style={{ color: '#d7a768' }}>Nguồn ảnh</a>
          </>}
          {exhibit.imageCredit && <p style={{ color: '#94a3b8', margin: '10px 0 0' }}>{exhibit.imageCredit}</p>}
        </div>
      </article>
    </div>
  </Html>
);

const Desk: React.FC = () => (
  <group position={[7.1, 0, 10.9]}>
    <mesh position={[0, 1.05, 0]} castShadow>
      <boxGeometry args={[5.4, 0.28, 2.3]} />
      <meshStandardMaterial color="#6b3f24" roughness={0.58} />
    </mesh>
    {[-2.15, 2.15].map((x) => (
      <mesh key={`room-three-desk-leg-${x}`} position={[x, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 1.0, 1.8]} />
        <meshStandardMaterial color="#4a2b1a" roughness={0.65} />
      </mesh>
    ))}
    <mesh position={[0, 1.25, 0.05]} rotation={[0, 0, -0.015]}>
      <boxGeometry args={[2.1, 0.035, 1.45]} />
      <meshStandardMaterial color="#d9c29a" roughness={0.95} />
    </mesh>
    <mesh position={[0.45, 1.27, 0.05]} rotation={[0, 0, 0.03]}>
      <boxGeometry args={[1.1, 0.04, 1.45]} />
      <meshStandardMaterial color="#8f6b46" roughness={0.95} />
    </mesh>
    <group position={[-1.35, 1.33, -0.28]}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 0.38, 0.9]} />
        <meshStandardMaterial color="#20252b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0.04]}>
        <boxGeometry args={[1.3, 0.45, 0.12]} />
        <meshStandardMaterial color="#303944" metalness={0.5} roughness={0.35} />
      </mesh>
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <mesh key={`room-three-typewriter-key-${x}`} position={[x, 0.22, 0.34]}>
          <boxGeometry args={[0.16, 0.04, 0.16]} />
          <meshStandardMaterial color="#d6b77a" roughness={0.6} />
        </mesh>
      ))}
    </group>
    <mesh position={[-0.4, 1.28, 0.75]} rotation={[0.03, 0.15, -0.08]}>
      <boxGeometry args={[1.15, 0.04, 0.75]} />
      <meshStandardMaterial color="#efe0bd" roughness={0.95} />
    </mesh>
    <mesh position={[-1.85, 1.27, 0.72]} rotation={[0, -0.18, 0.05]}>
      <boxGeometry args={[1.35, 0.035, 0.9]} />
      <meshStandardMaterial color="#b5a17d" roughness={1} />
    </mesh>
    <mesh position={[-1.6, 1.3, 0.72]}>
      <boxGeometry args={[0.08, 0.09, 0.08]} />
      <meshStandardMaterial color="#2b1d16" roughness={0.5} />
    </mesh>
    <mesh position={[1.25, 1.39, 0.35]} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.22, 20]} />
      <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.2} />
    </mesh>
    <mesh position={[1.25, 1.58, 0.35]}>
      <cylinderGeometry args={[0.09, 0.12, 0.28, 16]} />
      <meshStandardMaterial color="#4a2518" roughness={0.5} />
    </mesh>
    <mesh position={[1.9, 1.35, -0.55]}>
      <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
      <meshStandardMaterial color="#c59b45" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[1.9, 1.8, -0.55]}>
      <coneGeometry args={[0.4, 0.38, 20, 1, true]} />
      <meshStandardMaterial color="#f4c95d" emissive="#6b4a10" emissiveIntensity={0.35} side={2} />
    </mesh>
    <pointLight position={[1.9, 1.65, -0.55]} color="#ffd86b" intensity={1.3} distance={4} />
    <Html position={[0, 2.35, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
      <div style={{ color: '#fde68a', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>
        BÀN LÀM VIỆC CỦA NGUYỄN ÁI QUỐC
      </div>
    </Html>
  </group>
);

export const RoomThreeHistoricExhibits: React.FC<RoomThreeHistoricExhibitsProps> = ({ isVisible = true }) => {
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | null>(null);
  const portalRef = useRef<HTMLElement>(null!);
  const selectedExhibit = historicDisplays.find((display) => display.id === selectedDisplayId);

  useEffect(() => {
    portalRef.current = document.body;
  }, []);

  return (
    <group visible={isVisible}>
      {historicDisplays.map((display) => <HistoricDisplay key={display.id} {...display} onSelect={setSelectedDisplayId} />)}
      <Desk />
      {selectedExhibit && (
        <ExhibitStoryCard
          exhibit={selectedExhibit}
          onClose={() => setSelectedDisplayId(null)}
          portalRef={portalRef}
        />
      )}
    </group>
  );
};

export default RoomThreeHistoricExhibits;
