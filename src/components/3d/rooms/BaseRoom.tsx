import React from 'react';
import * as THREE from 'three';
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
  showPilasters?: boolean;
  onRopeClick?: (ropeIndex: number) => void;
  children?: React.ReactNode;
}

export const BaseRoom: React.FC<BaseRoomProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  showPilasters = true,
  children 
}) => {
  const { activeGallery, settings, currentRoom } = useMuseum();

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
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#e8e1d4';
  const floorType = customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood';

  // Kích thước giếng trời
  const skylightWidth = Math.min(roomWidth * 0.4, 5);

  return (
    <group>
      {/* Hộp chứa meshes, được ẩn/hiện tức thì mà không unmount để tránh lag WebGL */}
      <group visible={isVisible}>
        {/* Neutral daylight fill keeps pale walls readable without extra lights. */}
        <ambientLight intensity={currentRoom === galleryId ? 1.05 : 0} color="#fffaf2" />
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

        {/* 3. BỨC TƯỜNG & PHÀO CHÂN TƯỜNG (Dynamic Walls & Wainscoting) */}
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

        {/* Ốp gỗ chân tường (Wainscoting) màu kem sáng cao 1.2m */}
        {/* Wainscoting tường trái */}
        <mesh position={[-roomWidth / 2 + 0.14, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-roomWidth / 2 + 0.16, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Wainscoting tường phải */}
        <mesh position={[roomWidth / 2 - 0.14, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[roomWidth / 2 - 0.16, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Wainscoting tường trước bên trái */}
        <mesh position={[-(roomWidth / 4 + 1.056), 0.6, -roomLength / 2 + 0.01 + 0.112]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-(roomWidth / 4 + 1.056), 1.2, -roomLength / 2 + 0.01 + 0.124]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        {/* Wainscoting tường trước bên phải */}
        <mesh position={[roomWidth / 4 + 1.056, 0.6, -roomLength / 2 + 0.01 + 0.112]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[roomWidth / 4 + 1.056, 1.2, -roomLength / 2 + 0.01 + 0.124]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Wainscoting tường sau bên trái */}
        <mesh position={[-(roomWidth / 4 + 1.056), 0.6, roomLength / 2 - 0.01 - 0.112]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-(roomWidth / 4 + 1.056), 1.2, roomLength / 2 - 0.01 - 0.124]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        {/* Wainscoting tường sau bên phải */}
        <mesh position={[roomWidth / 4 + 1.056, 0.6, roomLength / 2 - 0.01 - 0.112]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[roomWidth / 4 + 1.056, 1.2, roomLength / 2 - 0.01 - 0.124]}>
          <boxGeometry args={[roomWidth / 2 - 2.112, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Các cột trang trí ốp tường (Pilasters) — ẩn nếu showPilasters=false */}
        {showPilasters && Array.from({ length: 6 }).map((_, idx) => {
          const zPos = -roomLength / 2 + 2.5 + idx * ((roomLength - 5) / 5);
          // Bỏ qua cột ở vị trí vách ngăn hành lang (Z = -3, Z = 3) hoặc vách ngăn phụ (Z = 13) để tránh va chạm hình ảnh
          if (Math.abs(zPos - 3) < 2 || Math.abs(zPos + 3) < 2 || Math.abs(zPos - 13) < 2) return null;

          return (
            <group key={`pilasters-${idx}`}>
              {/* Cột trái */}
              <mesh position={[-roomWidth / 2 + 0.13, roomHeight / 2, zPos]}>
                <boxGeometry args={[0.1, roomHeight, 0.4]} />
                <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
              </mesh>
              {/* Cột phải */}
              <mesh position={[roomWidth / 2 - 0.13, roomHeight / 2, zPos]}>
                <boxGeometry args={[0.1, roomHeight, 0.4]} />
                <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
              </mesh>
            </group>
          );
        })}

        {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG - MESHES ONLY */}
        {[-roomLength * 0.4, -roomLength * 0.2, 0, roomLength * 0.2, roomLength * 0.4].map((zPos, idx) => (
          <group key={`hall-light-mesh-${idx}`} position={[0, roomHeight - 0.26, zPos]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}

        {/* Render các phần tử riêng biệt của phòng con */}
        {children}
      </group>

      {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG - ÁNH SÁNG THỰC TẾ */}
      {/* Ultra-low: chỉ dùng 1 directional light thay vì 5 point lights */}
      {settings.reducedLights ? (
        <directionalLight
          position={[0, roomHeight - 1.0, 0]}
          intensity={isVisible && isAdjacent ? (galleryId === 'gallery-paintings' ? 3.5 : 2.5) : 0}
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
            position={[0, roomHeight - 1.0, zPos]}
            intensity={isVisible && isAdjacent ? (galleryId === 'gallery-paintings' ? (settings.preset === 'low' ? 9.5 : 6.5) : (settings.preset === 'low' ? 7.0 : 4.5)) : 0} 
            distance={roomLength * (galleryId === 'gallery-paintings' ? (settings.preset === 'low' ? 1.15 : 0.8) : (settings.preset === 'low' ? 0.9 : 0.6))} 
            color="#fffaf2"
          />
        ))
      )}
    </group>
  );
};

export default BaseRoom;
