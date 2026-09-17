'use client';

import React, { useMemo, useRef } from 'react';
import { Html, Line } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Exhibit } from '@/lib/db';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

const ROOM_ID = 'gallery-three';
const SHIP_DISPLAY_POSITION: [number, number, number] = [-7.4, 1.15, -2];
const GALLEY_DISPLAY_POSITION: [number, number, number] = [-9.2, 1.38, 7.2];
const ROUTE_DISPLAY_POSITION: [number, number, number] = [9.2, 1.32, 7.2];
const SHIP_DISPLAY_ROTATION_Y = Math.PI;
const GALLEY_DISPLAY_ROTATION_Y = Math.PI / 2;
const ROUTE_DISPLAY_ROTATION_Y = -Math.PI / 2;
const BANNER_HTML_STYLE = { backfaceVisibility: 'hidden' } as const;
const ROOM_FIVE_FRAGMENT_ORDER = ['departure', 'identity', 'vessel', 'labour', 'voyage'] as const;

const SHIP_EXPLORATION_EXHIBIT: Exhibit = {
  id: 'nha-rong-ship-exploration',
  gallery_id: ROOM_ID,
  title: { vi: 'Khám phá tàu Amiral Latouche-Tréville', en: 'Explore the Amiral Latouche-Tréville' },
  author: { vi: 'Nhiệm vụ hiện vật', en: 'Object exploration mission' },
  description: {
    vi: 'Khám phá bốn khu vực của con tàu để hiểu môi trường lao động và hành trình của Văn Ba năm 1911.',
    en: 'Explore four areas of the ship to understand Văn Ba’s working environment and voyage in 1911.',
  },
  model_3d_url: '',
  thumbnail_url: '/exhibits/nha-rong-ship.svg',
  coordinate_x: SHIP_DISPLAY_POSITION[0],
  coordinate_y: SHIP_DISPLAY_POSITION[1],
  coordinate_z: SHIP_DISPLAY_POSITION[2],
  rotation_x: 0,
  rotation_y: 0,
  rotation_z: 0,
  scale_x: 1,
  scale_y: 1,
  scale_z: 1,
};

interface TwoSidedBannerProps {
  position: [number, number, number];
  distanceFactor: number;
  className: string;
  children: React.ReactNode;
}

function TwoSidedBanner({ position, distanceFactor, className, children }: TwoSidedBannerProps) {
  return (
    <group position={position}>
      <Html position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]} center transform distanceFactor={distanceFactor} className={className} style={BANNER_HTML_STYLE}>{children}</Html>
      <Html position={[0, 0, 0.012]} center transform distanceFactor={distanceFactor} className={className} style={BANNER_HTML_STYLE}>{children}</Html>
    </group>
  );
}

const ARTIFACTS: Array<{
  id: string;
  title: Exhibit['title'];
  author: Exhibit['author'];
  description: Exhibit['description'];
  position: [number, number, number];
  bannerPosition: [number, number, number];
  rotationY: number;
  accent: string;
}> = [
  {
    id: 'nha-rong-latouche-treville',
    title: { vi: 'Mô hình tàu Amiral Latouche-Tréville', en: 'Amiral Latouche-Tréville model' },
    author: { vi: 'Tư liệu hàng hải', en: 'Maritime archive' },
    description: {
      vi: 'Ngày 5/6/1911, người thanh niên Nguyễn Tất Thành rời Bến Nhà Rồng trên tàu Amiral Latouche-Tréville. Mô hình gợi nhắc điểm khởi đầu của hành trình tìm đường cứu nước.',
      en: 'On 5 June 1911, young Nguyễn Tất Thành departed Nhà Rồng Wharf aboard the Amiral Latouche-Tréville. This model recalls the beginning of his journey to seek a path for national liberation.',
    },
    position: [-7.4, 0.78, -2],
    bannerPosition: [0, 1.45, 0],
    rotationY: SHIP_DISPLAY_ROTATION_Y,
    accent: '#d4af37',
  },
  {
    id: 'nha-rong-galley-work',
    title: { vi: 'Góc bếp trên tàu', en: 'Shipboard kitchen' },
    author: { vi: 'Tư liệu lao động', en: 'Labour archive' },
    description: {
      vi: 'Với tên Văn Ba, Nguyễn Tất Thành làm phụ bếp trên tàu. Công việc gồm chuẩn bị bếp, vận chuyển than và thực phẩm, dọn khu vực phục vụ — những trải nghiệm lao động khắc nghiệt trên hành trình biển.',
      en: 'Using the name Văn Ba, Nguyễn Tất Thành worked as a kitchen assistant on board. The work included preparing the galley, carrying coal and provisions, and cleaning service areas — demanding labour at sea.',
    },
    position: [-9.2, 0.56, 7.2],
    bannerPosition: [0, 0.72, 1.15],
    rotationY: GALLEY_DISPLAY_ROTATION_Y,
    accent: '#d97706',
  },
  {
    id: 'nha-rong-first-voyage',
    title: { vi: 'Bản đồ hành trình đầu tiên', en: 'Map of the first voyage' },
    author: { vi: 'Bản đồ tư liệu', en: 'Archival map' },
    description: {
      vi: 'Từ Sài Gòn, tàu đi qua nhiều cảng ở châu Á và châu Phi trước khi đến Pháp. Bản đồ ghi dấu hành trình quan sát thế giới và tìm kiếm con đường giải phóng dân tộc.',
      en: 'From Sài Gòn, the ship called at ports in Asia and Africa before reaching France. The map marks a journey of observing the world and seeking a path to national liberation.',
    },
    position: [9.2, 0.56, 7.2],
    bannerPosition: [0, 0.72, 1.15],
    rotationY: ROUTE_DISPLAY_ROTATION_Y,
    accent: '#0f766e',
  },
];

function ArtifactHotspot({ artifact }: { artifact: typeof ARTIFACTS[number] }) {
  const { language, setExhibitModalMode, setSelectedExhibit, roomFiveProgress } = useMuseum();
  const ringRef = useRef<THREE.Mesh>(null);
  const fragmentId = artifact.id === 'nha-rong-latouche-treville'
    ? 'vessel'
    : artifact.id === 'nha-rong-galley-work'
      ? 'labour'
      : 'voyage';
  const firstIncomplete = ROOM_FIVE_FRAGMENT_ORDER.find((id) => !roomFiveProgress.fragments.includes(id));
  const completed = roomFiveProgress.fragments.includes(fragmentId);
  const statusColor = completed ? '#34d399' : firstIncomplete === fragmentId ? '#22d3ee' : artifact.accent;
  const hasDisplayPedestal = artifact.id !== 'nha-rong-latouche-treville';

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.9;
  });

  const openArtifact = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (artifact.id === 'nha-rong-latouche-treville') {
      setExhibitModalMode('game');
      setSelectedExhibit(SHIP_EXPLORATION_EXHIBIT);
      return;
    }
    const opensMission = artifact.id === 'nha-rong-first-voyage' || artifact.id === 'nha-rong-galley-work';
    setExhibitModalMode(opensMission ? 'game' : 'info');
    setSelectedExhibit({
      id: artifact.id,
      gallery_id: ROOM_ID,
      title: artifact.title,
      author: artifact.author,
      description: artifact.description,
      model_3d_url: '',
      thumbnail_url: '',
      coordinate_x: artifact.position[0], coordinate_y: artifact.position[1], coordinate_z: artifact.position[2],
      rotation_x: 0, rotation_y: 0, rotation_z: 0, scale_x: 1, scale_y: 1, scale_z: 1,
    });
  };

  return (
    // Trụ tàu giữ hướng về cửa; hai trụ cuối phòng nằm ngang, song song với tường bên tương ứng.
    <group position={artifact.position} rotation={[0, artifact.rotationY, 0]}>
      {hasDisplayPedestal && (
        <>
          <mesh onPointerDown={openArtifact} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
            <cylinderGeometry args={[1.2, 1.35, 0.22, 32]} />
            <meshStandardMaterial color="#20150f" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.13, 0]} onPointerDown={openArtifact}>
            <cylinderGeometry args={[0.92, 0.92, 0.08, 32]} />
            <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={firstIncomplete === fragmentId ? 0.75 : 0.3} metalness={0.55} roughness={0.3} />
          </mesh>
          <mesh ref={ringRef} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.02, 0.025, 8, 40]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.8} />
          </mesh>
        </>
      )}
      <TwoSidedBanner position={artifact.bannerPosition} distanceFactor={6} className="pointer-events-none select-none">
        <div className="museum-room-sign nha-rong-typography w-40 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center shadow-xl">
          <p className="text-[10px] font-bold leading-tight text-stone-900">{language === 'vi' ? artifact.title.vi : artifact.title.en}</p>
          <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-amber-800">
            {artifact.id === 'nha-rong-first-voyage' || artifact.id === 'nha-rong-galley-work'
              ? (language === 'vi' ? 'Nhấp làm nhiệm vụ' : 'Click for mission')
              : (language === 'vi' ? 'Nhấp để khám phá' : 'Click to explore')}
          </p>
        </div>
      </TwoSidedBanner>
    </group>
  );
}

function ShipModel() {
  const { setExhibitModalMode, setSelectedExhibit } = useMuseum();
  const { hullShape, waterlineShape } = useMemo(() => {
    const hull = new THREE.Shape();
    hull.moveTo(-3.35, -0.28);
    hull.lineTo(-3.25, -0.72);
    hull.quadraticCurveTo(-3.0, -1.02, -2.62, -1.1);
    hull.lineTo(2.45, -0.86);
    hull.quadraticCurveTo(3.15, -0.6, 3.5, -0.18);
    hull.lineTo(3.3, 0.16);
    hull.lineTo(-3.22, 0.16);
    hull.closePath();

    const waterline = new THREE.Shape();
    waterline.moveTo(-3.27, -0.68);
    waterline.quadraticCurveTo(-3.0, -1.02, -2.62, -1.1);
    waterline.lineTo(2.45, -0.86);
    waterline.quadraticCurveTo(3.12, -0.61, 3.42, -0.25);
    waterline.lineTo(3.05, -0.55);
    waterline.lineTo(-3.05, -0.82);
    waterline.closePath();
    return { hullShape: hull, waterlineShape: waterline };
  }, []);

  const railingPosts = [-2.7, -2.05, -1.4, -0.75, -0.1, 0.55, 1.2, 1.85, 2.5];
  const rigging = [
    [[-1.85, 4.18, 0], [-3.12, 0.25, 0]],
    [[-1.85, 4.18, 0], [0.12, 0.6, 0]],
    [[1.85, 3.82, 0], [3.08, 0.18, 0]],
    [[1.85, 3.82, 0], [0.35, 0.6, 0]],
    [[-1.85, 2.28, 0], [1.85, 2.12, 0]],
    [[-1.85, 3.78, -0.04], [1.85, 3.42, -0.04]],
  ] as [THREE.Vector3Tuple, THREE.Vector3Tuple][];

  const openShipMission = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setExhibitModalMode('game');
    setSelectedExhibit(SHIP_EXPLORATION_EXHIBIT);
  };

  return (
    <group
      position={SHIP_DISPLAY_POSITION}
      onPointerDown={openShipMission}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Thân tàu được dựng theo ảnh tham chiếu: mạn đen, sống nước đỏ, mũi hướng về bên phải. */}
      <mesh position={[0, 0, -0.64]}>
        <extrudeGeometry args={[hullShape, { depth: 1.28, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 10 }]} />
        <meshStandardMaterial color="#12171a" metalness={0.58} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.655]}>
        <extrudeGeometry args={[waterlineShape, { depth: 1.31, bevelEnabled: false, curveSegments: 10 }]} />
        <meshStandardMaterial color="#8f241d" metalness={0.32} roughness={0.44} />
      </mesh>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[6.4, 0.16, 1.26]} /><meshStandardMaterial color="#e5d2a6" roughness={0.5} /></mesh>
      <mesh position={[-0.15, 0.61, 0]}><boxGeometry args={[2.25, 0.7, 1.0]} /><meshStandardMaterial color="#ead9b8" roughness={0.58} /></mesh>
      <mesh position={[0.5, 1.04, 0]}><boxGeometry args={[1.45, 0.24, 0.88]} /><meshStandardMaterial color="#f4e8ca" roughness={0.5} /></mesh>
      {[-0.06, 0.42, 0.9].map((x) => <mesh key={x} position={[x, 0.73, -0.52]}><boxGeometry args={[0.23, 0.25, 0.04]} /><meshStandardMaterial color="#1c2426" roughness={0.3} /></mesh>)}

      {/* Ống khói đỏ với đai trắng và các dấu sao xanh của mô hình tham chiếu. */}
      <mesh position={[0.1, 1.42, 0]}><cylinderGeometry args={[0.28, 0.32, 1.46, 20]} /><meshStandardMaterial color="#aa3826" metalness={0.35} roughness={0.36} /></mesh>
      <mesh position={[0.1, 1.42, -0.01]}><cylinderGeometry args={[0.325, 0.325, 0.31, 20]} /><meshStandardMaterial color="#f4eee0" roughness={0.5} /></mesh>
      {[-0.12, 0.1, 0.32].map((x) => <mesh key={x} position={[x, 1.42, -0.33]}><sphereGeometry args={[0.045, 10, 10]} /><meshBasicMaterial color="#2563a6" /></mesh>)}
      <mesh position={[0.1, 2.19, 0]}><cylinderGeometry args={[0.33, 0.33, 0.1, 20]} /><meshStandardMaterial color="#25282a" metalness={0.7} roughness={0.22} /></mesh>

      {/* Hai cột buồm đen - vàng, cần hàng và dây chằng. */}
      {[-1.85, 1.85].map((x, index) => {
        const mastTop = index === 0 ? 4.18 : 3.82;
        return (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[0.1, 0.13, 2.7, 12]} /><meshStandardMaterial color="#171b1d" metalness={0.72} roughness={0.22} /></mesh>
            <mesh position={[0, (2.9 + mastTop) / 2, 0]}><cylinderGeometry args={[0.085, 0.1, mastTop - 2.9, 12]} /><meshStandardMaterial color="#e4b72c" metalness={0.48} roughness={0.3} /></mesh>
            <mesh position={[0, 2.78, 0]}><boxGeometry args={[0.64, 0.12, 0.2]} /><meshStandardMaterial color="#242728" metalness={0.72} roughness={0.22} /></mesh>
            <mesh position={[0.67, 1.38, 0]} rotation={[0, 0, -0.46]}><cylinderGeometry args={[0.055, 0.065, 1.9, 10]} /><meshStandardMaterial color="#e3bd42" metalness={0.42} roughness={0.34} /></mesh>
            <mesh position={[-0.67, 1.28, 0]} rotation={[0, 0, 0.45]}><cylinderGeometry args={[0.055, 0.065, 1.75, 10]} /><meshStandardMaterial color="#e3bd42" metalness={0.42} roughness={0.34} /></mesh>
          </group>
        );
      })}
      {rigging.map(([start, end], index) => <Line key={index} points={[start, end]} color="#4b3525" lineWidth={1} transparent opacity={0.85} />)}

      {/* Lan can boong tàu. */}
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.53, z]}><boxGeometry args={[5.8, 0.035, 0.035]} /><meshStandardMaterial color="#ece2c6" metalness={0.4} roughness={0.4} /></mesh>
          {railingPosts.map((x) => <mesh key={x} position={[x, 0.38, z]}><cylinderGeometry args={[0.025, 0.025, 0.34, 8]} /><meshStandardMaterial color="#ece2c6" metalness={0.4} roughness={0.4} /></mesh>)}
        </group>
      ))}
      <Html position={[2.0, -0.04, -0.71]} rotation={[0, Math.PI, 0]} transform distanceFactor={7} className="pointer-events-none select-none">
        <span className="museum-room-sign whitespace-nowrap text-[7px] font-bold tracking-wider text-sky-200">AMIRAL LATOUCHE-TRÉVILLE</span>
      </Html>
    </group>
  );
}

function GalleyAndMap() {
  return (
    <>
      <group position={GALLEY_DISPLAY_POSITION} rotation={[0, GALLEY_DISPLAY_ROTATION_Y, 0]}><mesh position={[0, 0.7, 0]}><boxGeometry args={[1.45, 1.25, 0.86]} /><meshStandardMaterial color="#24201c" metalness={0.6} roughness={0.32} /></mesh><mesh position={[0, 1.38, 0]}><cylinderGeometry args={[0.46, 0.5, 0.16, 28]} /><meshStandardMaterial color="#68635c" metalness={0.85} roughness={0.18} /></mesh><mesh position={[0, 1.63, 0]}><sphereGeometry args={[0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#99938a" metalness={0.85} roughness={0.2} /></mesh><mesh position={[-0.82, 0.4, 0.12]}><boxGeometry args={[0.6, 0.7, 0.62]} /><meshStandardMaterial color="#6f4424" roughness={0.75} /></mesh></group>
      <group position={ROUTE_DISPLAY_POSITION} rotation={[0, ROUTE_DISPLAY_ROTATION_Y, 0]}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.62, 1.2, 0.16]} />
          <meshStandardMaterial color="#1f4c55" metalness={0.4} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.64, 0.1]}>
          <planeGeometry args={[1.35, 0.94]} />
          <meshBasicMaterial color="#c3e6dc" />
        </mesh>
        {[-0.45, -0.1, 0.28].map((x, index) => (
          <mesh key={x} position={[x, 0.65 + (index - 1) * 0.15, 0.13]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#b45309" />
          </mesh>
        ))}
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.75, 0.85, 0.8]} />
          <meshStandardMaterial color="#6f4424" roughness={0.72} />
        </mesh>
      </group>
    </>
  );
}

interface RoomNhaRongProps extends BaseRoomProps {
  exhibits?: Exhibit[];
}

export const RoomNhaRong: React.FC<RoomNhaRongProps> = ({ galleryId, customSettings, isVisible = true, exhibits }) => {
  const { currentRoom } = useMuseum();
  const isCurrentRoom = currentRoom === ROOM_ID;
  // Liên kết hotspot mô hình với bản ghi JSON để nội dung sửa trong CMS được dùng ngay trong phòng.
  const hotspotArtifacts = useMemo(() => ARTIFACTS.map((artifact) => {
    const editedExhibit = exhibits?.find((exhibit) => exhibit.id === artifact.id);
    return editedExhibit
      ? { ...artifact, title: editedExhibit.title, author: editedExhibit.author, description: editedExhibit.description }
      : artifact;
  }), [exhibits]);
  return (
    <BaseRoom galleryId={galleryId} customSettings={customSettings} isVisible={isVisible}>
      <ambientLight intensity={isCurrentRoom ? 0.18 : 0} color="#fffaf2" />
      <directionalLight position={[-5, 8, 3]} intensity={isCurrentRoom ? 0.9 : 0} color="#fffaf2" />
      <pointLight position={[0, 4.8, 0]} intensity={isCurrentRoom ? 14 : 0} distance={14} color="#fff3df" />
      <group visible={isVisible}>
        <ShipModel />
        <GalleyAndMap />
        {hotspotArtifacts.map((artifact) => <ArtifactHotspot key={artifact.id} artifact={artifact} />)}
        <TwoSidedBanner position={[0, 5.1, -9.8]} distanceFactor={9} className="pointer-events-none select-none">
          <div className="museum-room-sign nha-rong-typography w-80 border-y border-amber-200/70 bg-stone-950 px-5 py-3 text-center shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">05.06.1911</p>
            <p className="nha-rong-display mt-1.5 text-[20px] text-amber-50">Bến Nhà Rồng — Khởi đầu một hành trình</p>
          </div>
        </TwoSidedBanner>
      </group>
    </BaseRoom>
  );
};

export default RoomNhaRong;
