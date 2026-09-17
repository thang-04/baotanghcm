import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { useMuseum } from '@/context/MuseumContext';

export interface BaseRoomProps {
  galleryId: string;
  customSettings?: {
    room_width: number;
    room_length: number;
    room_height: number;
    floor_color: string;
    wall_color: string;
    wainscoting_color: string;
    floor_type: 'wood' | 'marble' | 'carpet';
  };
  isVisible?: boolean;
  /** Whether the visitor is actively inside this room, rather than viewing it through an adjacent door. */
  isInteractive?: boolean;
  /** Standalone gallery pages provide a global light rig; connected rooms light their own threshold. */
  lightingContext?: 'standalone' | 'connected';
  children?: React.ReactNode;
}

const PaintingMesh: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0, 0.06]}>
      <planeGeometry args={[3.0, 2.0]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FIRST ROOM EXHIBITS (5 MODELS & 10 PAINTINGS DATA)
// ═══════════════════════════════════════════════════════════════════════════
const FIRST_ROOM_EXHIBITS = [
  {
    z: -71.0,
    left: {
      titleVi: "Kinh tế Nhà nước (Viettel)",
      titleEn: "State Economy (Viettel)",
      descVi: "Doanh nghiệp nhà nước giữ vai trò chủ đạo trong nền kinh tế, dẫn dắt hạ tầng số và công nghệ quốc gia.",
      descEn: "State-owned enterprises play a leading role, driving digital and technological national infrastructure.",
      imageUrl: "/images/room4/viettel.jpg"
    },
    right: {
      titleVi: "Kinh tế có vốn FDI (Samsung)",
      titleEn: "Foreign FDI Sector (Samsung)",
      descVi: "Thành phần kinh tế có vốn đầu tư nước ngoài đóng vai trò quan trọng trong việc thúc đẩy xuất khẩu và tạo việc làm công nghệ cao.",
      descEn: "Foreign-invested sector plays an important role in boosting exports and generating high-tech employment.",
      imageUrl: "/images/room4/samsung.jpg"
    }
  },
  {
    z: -66.5,
    left: {
      titleVi: "Kinh tế Tư nhân (VinFast)",
      titleEn: "Private Economy (VinFast)",
      descVi: "Kinh tế tư nhân là động lực quan trọng của nền kinh tế thị trường định hướng XHCN, năng động và bứt phá mạnh mẽ.",
      descEn: "Private economy is a key engine of the socialist-oriented market economy, highly dynamic and growing rapidly.",
      imageUrl: "/images/room4/vinfast.jpg"
    },
    right: {
      titleVi: "Thương mại Hiện đại (Siêu thị)",
      titleEn: "Modern Retail (Supermarket)",
      descVi: "Sự hiện diện đa dạng của các thành phần kinh tế trong hoạt động phân phối bán lẻ hàng tiêu dùng hiện đại.",
      descEn: "The diverse presence of economic sectors in modern consumer retail distribution networks.",
      imageUrl: "/images/room4/sieu-thi.jpg"
    }
  },
  {
    z: -62.0,
    left: {
      titleVi: "Bảo hiểm y tế (An sinh xã hội)",
      titleEn: "Health Insurance (Social Security)",
      descVi: "Hệ thống bảo hiểm y tế toàn dân, bảo đảm an sinh xã hội và hỗ trợ chăm sóc sức khỏe cho mọi người dân.",
      descEn: "Universal health insurance system, ensuring social security and healthcare support for all citizens.",
      imageUrl: "/images/room4/bao-hiem-y-te.jpg"
    },
    right: {
      titleVi: "Cảng biển quốc tế (Mở cửa giao thương)",
      titleEn: "International Port (Open Trade)",
      descVi: "Cảng biển quốc tế hiện đại, cửa ngõ kết nối giao thương hàng hóa giữa Việt Nam và thế giới.",
      descEn: "Modern international seaport, the gateway connecting trade between Vietnam and the world.",
      imageUrl: "/images/room4/cang-bien.jpg"
    }
  },
  {
    z: -57.5,
    left: {
      titleVi: "Cao tốc Bắc – Nam (Đầu tư công)",
      titleEn: "North-South Expressway (Public Investment)",
      descVi: "Dự án đầu tư công quy mô lớn, phát triển hạ tầng giao thông huyết mạch, kết nối các vùng kinh tế trọng điểm.",
      descEn: "Large-scale public investment project, developing traffic infrastructure connecting key economic regions.",
      imageUrl: "/images/room4/cao-toc-bac-nam.jpg"
    },
    right: {
      titleVi: "Chợ truyền thống (Cơ chế cung cầu)",
      titleEn: "Traditional Market (Supply & Demand)",
      descVi: "Mô hình kinh tế hộ gia đình, tiểu thương phản ánh sinh động cơ chế cung - cầu và tiêu dùng đời sống.",
      descEn: "Household business model reflecting supply, demand, and daily consumer activities.",
      imageUrl: "/images/room4/cho-truyen-thong.jpg"
    }
  },
  {
    z: -53.0,
    left: {
      titleVi: "Container xuất khẩu (Hội nhập toàn cầu)",
      titleEn: "Export Container (Global Integration)",
      descVi: "Hoạt động đóng gói và xuất khẩu hàng hóa ra thị trường quốc tế, thúc đẩy hội nhập toàn cầu.",
      descEn: "Packaging and exporting goods to international markets, driving global integration.",
      imageUrl: "/images/room4/container-xuat-khau.jpg"
    },
    right: {
      titleVi: "Tập đoàn Điện lực EVN (An ninh năng lượng)",
      titleEn: "EVN Electricity Group (Energy Security)",
      descVi: "Tập đoàn Điện lực Việt Nam, bảo đảm an ninh năng lượng quốc gia, cung cấp nguồn điện ổn định cho sản xuất.",
      descEn: "Electricity Vietnam Group, ensuring national energy security and stable power supply for production.",
      imageUrl: "/images/room4/evn.jpg"
    }
  }
];

const FloatingModel: React.FC<{
  type: string;
  z: number;
  onClick?: (e: any) => void;
}> = ({ type, z, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1.6 + Math.sin(state.clock.getElapsedTime() * 2 + z) * 0.12;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.6, z]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {type === 'torus' && <torusGeometry args={[0.25, 0.08, 12, 32]} />}
      {type === 'box' && <boxGeometry args={[0.35, 0.35, 0.35]} />}
      {type === 'scale' && <coneGeometry args={[0.25, 0.5, 4]} />}
      {type === 'cylinder' && <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />}
      {type === 'globe' && <sphereGeometry args={[0.28, 16, 16]} />}

      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={1.2}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPAWN GUIDE NPC – Nguyễn Minh Tâm (Hướng dẫn viên)
// ═══════════════════════════════════════════════════════════════════════════
const SpawnGuideNPC: React.FC<{ language: string }> = ({ language }) => {
  const [showGuide, setShowGuide] = useState(false);
  const isVi = language === 'vi';

  useEffect(() => {
    if (!showGuide) return;
    const timer = setTimeout(() => setShowGuide(false), 30000);
    return () => clearTimeout(timer);
  }, [showGuide]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setShowGuide(prev => !prev);
  };

  const sentences = [
    "Nhiều người cho rằng Việt Nam là nền kinh tế thị trường tư bản chủ nghĩa.",
    "Một số người khác lại nghĩ Việt Nam vẫn là nền kinh tế kế hoạch hóa tập trung.",
    "Theo bạn, đâu mới là câu trả lời đúng?",
  ];

  return (
    <group
      position={[0, 0, -60]}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Glow ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[0.62, 0.72, 32]} />
        <meshBasicMaterial color="#a78bfa" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      {/* NPC Body */}
      <group scale={1.5}>
        {/* Head */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#a78bfa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0.74, -0.17]}>
          <boxGeometry args={[0.25, 0.05, 0.08]} />
          <meshBasicMaterial color="#e9d5ff" />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.16, 0.28, 8, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Left hand */}
        <mesh position={[-0.2, 0.38, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#a78bfa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Right hand */}
        <mesh position={[0.2, 0.38, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#a78bfa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Base Cylinder */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* Thought-provoking popup */}
      {showGuide ? (
        <Html position={[0, 2.1, 0]} center occlude distanceFactor={8} zIndexRange={[16777271, 0]} className="pointer-events-none select-none">
          <div
            className="w-[300px] bg-slate-950/97 border border-violet-500/40 px-5 py-4 rounded-2xl shadow-2xl text-slate-100 font-sans backdrop-blur-md"
            style={{ boxShadow: '0 0 32px #a78bfa40', zIndex: 9999, position: 'relative' }}
          >
            <span className="text-[8px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded font-bold tracking-widest block w-max mx-auto mb-3 uppercase">
              Nguyễn Minh Tâm
            </span>
            <div className="space-y-2.5">
              {sentences.map((s, i) => (
                <p
                  key={i}
                  className={`text-[10px] leading-relaxed ${i === 2
                    ? 'text-violet-300 font-bold italic text-center pt-1 border-t border-violet-500/20'
                    : 'text-slate-300'
                    }`}
                >
                  {i < 2 && <span className="text-violet-400 font-bold mr-1">{i === 0 ? '🤔' : '💭'}</span>}
                  {s}
                </p>
              ))}
            </div>
            <p className="text-[7px] text-slate-600 text-center mt-3">
              (Tự động đóng sau 30 giây)
            </p>
          </div>
        </Html>
      ) : (
        <Html position={[0, 1.7, 0]} center occlude distanceFactor={8} className="pointer-events-none select-none">
          <div
            className="w-8 h-8 rounded-full border bg-slate-950/90 flex items-center justify-center font-black text-sm shadow-2xl backdrop-blur-md animate-bounce select-none"
            style={{
              borderColor: '#a78bfa',
              color: '#a78bfa',
              boxShadow: '0 0 12px #a78bfa30'
            }}
          >
            !
          </div>
        </Html>
      )}
    </group>
  );
};

export const BaseRoomPlain: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
  children
}) => {
  const { activeGallery, setSelectedExhibit, language, currentRoom, settings } = useMuseum();

  // Xác định các phòng kề cận với currentRoom để bật đèn rọi/pointLight (Ngăn ánh sáng chồng lấn chói mắt)
  const isAdjacent = React.useMemo(() => {
    if (!currentRoom) return false;
    if (currentRoom === galleryId) return true;

    const adjacencies: Record<string, string[]> = {
      'lobby': ['gallery-subsidy'],
      'gallery-subsidy': ['lobby', 'gallery-three'],
      'gallery-three': ['gallery-subsidy', 'gallery-paintings'],
      'gallery-paintings': ['gallery-three', 'gallery-ceramics'],
      'gallery-ceramics': ['gallery-paintings', 'gallery-market-economy'],
      'gallery-market-economy': ['gallery-ceramics'],
    };

    return adjacencies[currentRoom]?.includes(galleryId) ?? false;
  }, [currentRoom, galleryId]);

  // Đọc cấu hình động hoặc fallback về mặc định
  const roomWidth = customSettings?.room_width ?? activeGallery?.room_width ?? 12;
  const roomLength = customSettings?.room_length ?? activeGallery?.room_length ?? 30;
  const roomHeight = (customSettings?.room_height ?? activeGallery?.room_height ?? 6) + 1;
  const floorColor = customSettings?.floor_color ?? activeGallery?.floor_color ?? '#e4d8c5';
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#f7f3ea';
  const floorType = customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood';

  // Tính toán offset dọc theo trục Z nếu phòng dài hơn 150 (ví dụ 175) để giữ mốc spawn bắt đầu tại Z = -75
  const zOffset = galleryId === 'gallery-market-economy' ? (roomLength - 150) / 2 : 0;

  // Tính toán kích thước trần vòm và giếng trời
  const skylightWidth = Math.min(roomWidth * 0.4, 5);
  const sideWidth = (roomWidth - skylightWidth) / 2;
  const panelWidth = sideWidth / Math.cos(Math.PI / 12);
  const leftPanelX = -(skylightWidth / 2 + sideWidth / 2);
  const rightPanelX = skylightWidth / 2 + sideWidth / 2;
  const panelHeightY = roomHeight - 0.6;

  const handleExhibitClick = (
    e: any,
    item: typeof FIRST_ROOM_EXHIBITS[0],
    idx: number,
    type: 'model' | 'painting',
    side?: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const coordX = type === 'model' ? 0 : (side === 'left' ? -roomWidth / 2 : roomWidth / 2);
    const rotY = type === 'model' ? 0 : (side === 'left' ? Math.PI / 2 : -Math.PI / 2);

    const sideKey = side || 'left';
    const data = (item as any)[sideKey];

    setSelectedExhibit({
      id: `${type}-${idx}-${side ?? 'center'}`,
      gallery_id: galleryId,
      title: {
        vi: data.titleVi,
        en: data.titleEn
      },
      author: {
        vi: type === 'model' ? "Mô hình 3D" : "Tranh trưng bày",
        en: type === 'model' ? "3D Model" : "Exhibit Painting"
      },
      description: {
        vi: data.descVi,
        en: data.descEn
      },
      model_3d_url: "",
      thumbnail_url: data.imageUrl || "",
      coordinate_x: coordX,
      coordinate_y: type === 'model' ? 1.6 : 2.3,
      coordinate_z: item.z,
      rotation_x: 0,
      rotation_y: rotY,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  return (
    <group>
      {/* Hộp chứa meshes, được ẩn/hiện tức thì mà không unmount để tránh lag WebGL */}
      <group visible={isVisible}>
        <group position={[0, 0, zOffset]}>
          {/* 1. SÀN NHÀ & THẢM TRẢI SÀN (Floor & Center Carpet) */}
          {floorType === 'wood' && (
            <>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[roomWidth, roomLength]} />
                <meshStandardMaterial
                  color={floorColor}
                  roughness={0.4}
                  metalness={0.1}
                />
              </mesh>
              <gridHelper args={[roomLength, Math.round(roomLength), '#c7baa7', '#d1c5b3']} position={[0, 0.005, 0]} />
            </>
          )}

          {floorType === 'marble' && (
            <>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[roomWidth, roomLength]} />
                <meshStandardMaterial
                  color={floorColor}
                  roughness={0.15}
                  metalness={0.25}
                />
              </mesh>
              <gridHelper args={[roomLength, Math.round(roomLength / 2), '#cbd5e1', '#94a3b8']} position={[0, 0.005, 0]} />
            </>
          )}

          {floorType === 'carpet' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[roomWidth, roomLength]} />
              <meshStandardMaterial
                color={floorColor}
                roughness={0.95}
                metalness={0.0}
              />
            </mesh>
          )}

          {/* Tấm thảm dài màu xám-be cổ điển ở trục chính hành lang (chỉ hiển thị nếu sàn chính không phải thảm) */}
          {floorType !== 'carpet' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[Math.min(roomWidth / 2, 6), roomLength]} />
              <meshStandardMaterial
                color="#d7cbb7"
                roughness={0.95}
                metalness={0.0}
              />
            </mesh>
          )}

          {/* 2. TRẦN NHÀ PHẲNG & GIẾNG TRỜI (Flat Ceiling & Glass Skylight) */}
          {/* Tấm trần phẳng toàn phòng */}
          <mesh position={[0, roomHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[roomWidth, roomLength]} />
            <meshStandardMaterial
              color="#fbf9f3"
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Trần giếng trời kính (Skylight) ở chính giữa trục dọc hành lang */}
          <mesh position={[0, roomHeight - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[skylightWidth, roomLength]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#bae6fd"
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
              roughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Khung sắt giếng trời cổ điển chạy dọc */}
          {Array.from({ length: 11 }).map((_, i) => (
            <mesh key={`skylight-grid-${i}`} position={[0, roomHeight - 0.19, -roomLength / 2 + i * (roomLength / 10)]}>
              <boxGeometry args={[skylightWidth, 0.05, 0.05]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, roomHeight - 0.19, 0]}>
            <boxGeometry args={[0.05, 0.05, roomLength]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          <mesh position={[-skylightWidth / 2, roomHeight - 0.19, 0]}>
            <boxGeometry args={[0.05, 0.05, roomLength]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          <mesh position={[skylightWidth / 2, roomHeight - 0.19, 0]}>
            <boxGeometry args={[0.05, 0.05, roomLength]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* 3. BỨC TƯỜNG (Dynamic Walls) */}
          {/* Tường trái */}
          <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[roomLength, roomHeight, 0.2]} />
            <meshStandardMaterial
              color={wallColor}
              roughness={0.7}
            />
          </mesh>

          {/* Tường phải */}
          <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[roomLength, roomHeight, 0.2]} />
            <meshStandardMaterial
              color={wallColor}
              roughness={0.7}
            />
          </mesh>

          {/* --- TƯỜNG TRƯỚC (Front Wall with Doorway) --- */}
          {/* Tường trước bên trái */}
          <mesh position={[-(roomWidth / 4 + 1), roomHeight / 2, -roomLength / 2 + 0.01]}>
            <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          {/* Tường trước bên phải */}
          <mesh position={[roomWidth / 4 + 1, roomHeight / 2, -roomLength / 2 + 0.01]}>
            <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          {/* Tường trước phía trên cửa */}
          <mesh position={[0, (roomHeight + 4) / 2, -roomLength / 2 + 0.01]}>
            <boxGeometry args={[4.0, roomHeight - 4.0, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>

          {/* --- TƯỜNG SAU (Back Wall with Doorway) --- */}
          {/* Tường sau bên trái */}
          <mesh position={[-(roomWidth / 4 + 1), roomHeight / 2, roomLength / 2 - 0.01]}>
            <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          {/* Tường sau bên phải */}
          <mesh position={[roomWidth / 4 + 1, roomHeight / 2, roomLength / 2 - 0.01]}>
            <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          {/* Tường sau phía trên cửa */}
          <mesh position={[0, (roomHeight + 4) / 2, roomLength / 2 - 0.01]}>
            <boxGeometry args={[4.0, roomHeight - 4.0, 0.2]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Vách ngăn phân chia thành các phòng nhỏ (chỉ áp dụng cho gallery-market-economy) */}
        {galleryId === 'gallery-market-economy' && (() => {
          const carpetWidth = Math.min(roomWidth / 2, 6);
          const partitionWidth = (roomWidth - carpetWidth) / 2;
          const partitionX = (carpetWidth + partitionWidth) / 2;

          return [-50].map((zPos, i) => {
            return (
              <group key={`partition-${i}`}>
                {/* Vách ngăn bên trái */}
                <mesh position={[-partitionX, roomHeight / 2, zPos]}>
                  <boxGeometry args={[partitionWidth, roomHeight, 0.25]} />
                  <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Vách ngăn bên phải */}
                <mesh position={[partitionX, roomHeight / 2, zPos]}>
                  <boxGeometry args={[partitionWidth, roomHeight, 0.25]} />
                  <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Vách ngăn phía trên cửa */}
                <mesh position={[0, (roomHeight + 4) / 2, zPos]}>
                  <boxGeometry args={[carpetWidth, roomHeight - 4.0, 0.25]} />
                  <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
              </group>
            );
          });
        })()}

        {/* Exhibits & Models inside the first room of gallery-market-economy */}
        {galleryId === 'gallery-market-economy' && FIRST_ROOM_EXHIBITS.map((item, idx) => (
          <group key={`first-room-item-${idx}`}>
            {/* Ảnh tường Trái */}
            <group
              position={[-roomWidth / 2 + 0.1, 2.3, item.z]}
              rotation={[0, Math.PI / 2, 0]}
              onClick={(e) => handleExhibitClick(e, item, idx, 'painting', 'left')}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <mesh>
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
              </mesh>
              <PaintingMesh url={item.left.imageUrl} />

              {/* Bảng nhãn thông tin 3D có chân nghiêng giống Room 1 */}
              <group
                position={[0, -1.65, 0.35]}
                rotation={[-Math.PI / 10, 0, 0]}
              >
                {/* Trụ chân trái */}
                <mesh position={[-0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
                  <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
                </mesh>
                {/* Trụ chân phải */}
                <mesh position={[0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
                  <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
                </mesh>
                {/* Hộp đế gỗ gắn dưới đất */}
                <mesh position={[0, -0.62, -0.28]}>
                  <boxGeometry args={[1.25, 0.08, 0.34]} />
                  <meshStandardMaterial color="#16100b" roughness={0.42} metalness={0.55} />
                </mesh>
                {/* Tấm ốp gỗ sau bảng nhãn */}
                <mesh position={[0, 0, -0.015]}>
                  <boxGeometry args={[1.9, 0.72, 0.05]} />
                  <meshStandardMaterial color="#17120d" roughness={0.5} metalness={0.18} />
                </mesh>
                {/* Tấm giấy nhãn màu vàng kem sáng */}
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[1.74, 0.56, 0.035]} />
                  <meshStandardMaterial color="#f1e3c7" roughness={0.82} metalness={0.02} />
                </mesh>

                <Html
                  position={[0, 0.02, 0.04]}
                  center
                  transform
                  occlude
                  distanceFactor={2.4}
                  className="pointer-events-none select-none text-center font-sans"
                >
                  <div className="w-[150px] text-slate-900 flex flex-col items-center gap-0.5 select-none">
                    <p className="text-[10px] font-bold truncate leading-tight w-full text-center">
                      {language === 'vi' ? item.left.titleVi : item.left.titleEn}
                    </p>
                    <p className="text-[6.5px] leading-snug text-slate-600 italic line-clamp-2 w-full text-center mt-0.5">
                      {language === 'vi' ? item.left.descVi : item.left.descEn}
                    </p>
                    <p className="text-[7px] text-amber-700 font-extrabold uppercase tracking-wide mt-1 animate-pulse">
                      {language === 'vi' ? 'Nhấp để xem' : 'Click to view'}
                    </p>
                  </div>
                </Html>
              </group>
            </group>

            {/* Ảnh tường Phải */}
            <group
              position={[roomWidth / 2 - 0.1, 2.3, item.z]}
              rotation={[0, -Math.PI / 2, 0]}
              onClick={(e) => handleExhibitClick(e, item, idx, 'painting', 'right')}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <mesh>
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
              </mesh>
              <PaintingMesh url={item.right.imageUrl} />

              {/* Bảng nhãn thông tin 3D có chân nghiêng giống Room 1 */}
              <group
                position={[0, -1.65, 0.35]}
                rotation={[-Math.PI / 10, 0, 0]}
              >
                {/* Trụ chân trái */}
                <mesh position={[-0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
                  <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
                </mesh>
                {/* Trụ chân phải */}
                <mesh position={[0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
                  <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
                </mesh>
                {/* Hộp đế gỗ gắn dưới đất */}
                <mesh position={[0, -0.62, -0.28]}>
                  <boxGeometry args={[1.25, 0.08, 0.34]} />
                  <meshStandardMaterial color="#16100b" roughness={0.42} metalness={0.55} />
                </mesh>
                {/* Tấm ốp gỗ sau bảng nhãn */}
                <mesh position={[0, 0, -0.015]}>
                  <boxGeometry args={[1.9, 0.72, 0.05]} />
                  <meshStandardMaterial color="#17120d" roughness={0.5} metalness={0.18} />
                </mesh>
                {/* Tấm giấy nhãn màu vàng kem sáng */}
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[1.74, 0.56, 0.035]} />
                  <meshStandardMaterial color="#f1e3c7" roughness={0.82} metalness={0.02} />
                </mesh>

                <Html
                  position={[0, 0.02, 0.04]}
                  center
                  transform
                  occlude
                  distanceFactor={2.4}
                  className="pointer-events-none select-none text-center font-sans"
                >
                  <div className="w-[150px] text-slate-900 flex flex-col items-center gap-0.5 select-none">
                    <p className="text-[10px] font-bold truncate leading-tight w-full text-center">
                      {language === 'vi' ? item.right.titleVi : item.right.titleEn}
                    </p>
                    <p className="text-[6.5px] leading-snug text-slate-600 italic line-clamp-2 w-full text-center mt-0.5">
                      {language === 'vi' ? item.right.descVi : item.right.descEn}
                    </p>
                    <p className="text-[7px] text-amber-700 font-extrabold uppercase tracking-wide mt-1 animate-pulse">
                      {language === 'vi' ? 'Nhấp để xem' : 'Click to view'}
                    </p>
                  </div>
                </Html>
              </group>
            </group>
          </group>
        ))}

        {/* Spawn Guide NPC – Nguyễn Minh Tâm (only for gallery-market-economy) */}
        {galleryId === 'gallery-market-economy' && (
          <SpawnGuideNPC language={language} />
        )}

        {/* Render các phần tử riêng biệt của phòng con */}
        {children}
      </group>

      {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG - ÁNH SÁNG THỰC TẾ */}
      {/* Ultra-low: chỉ dùng 1 directional light thay vì 5 point lights */}
      {settings.reducedLights ? (
        <directionalLight
          position={[0, roomHeight - 1.0, zOffset]}
          intensity={isVisible && isAdjacent ? 2.5 : 0}
          color="#fffaf2"
        />
      ) : (
        // Low: 2 point lights đủ sáng. Medium: 5 point lights đầy đủ.
        (settings.preset === 'low'
          ? [0, roomLength * 0.35]
          : [-roomLength * 0.4, -roomLength * 0.2, 0, roomLength * 0.2, roomLength * 0.4]
        ).map((zPos, idx) => (
          <pointLight
            key={`hall-light-source-${idx}`}
            position={[0, roomHeight - 1.0, zPos + zOffset]}
            intensity={isVisible && isAdjacent ? (settings.preset === 'low' ? 7.0 : 4.5) : 0}
            distance={roomLength * (settings.preset === 'low' ? 0.9 : 0.6)}
            color="#fffaf2"
          />
        ))
      )}
    </group>
  );
};

export default BaseRoomPlain;
