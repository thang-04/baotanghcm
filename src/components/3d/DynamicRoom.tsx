import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ExhibitionRoom } from './ExhibitionRoom';
import { ExhibitObject } from './ExhibitObject';
import { LoadedRoom } from '@/context/MuseumContext';
import roomFourSpatial from '@/lib/roomFourSpatial.json';
import roomFiveSpatial from '@/lib/roomFiveSpatial.json';
import { ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID } from '@/lib/roomOneGameplay';

/**
 * DynamicRoom — Component tải phòng triển lãm động tại offset Z cho trước
 * 
 * Được mount/unmount bởi hệ thống cửa:
 * - Admin mở cửa → DynamicRoom mount → ExhibitionRoom + exhibits render tại offset
 * - Admin đóng cửa → DynamicRoom unmount → giải phóng GPU resources
 */

interface DynamicRoomProps {
  room: LoadedRoom;
  /** Offset tọa độ Z để đặt phòng nối tiếp sảnh/phòng trước đó */
  offsetZ: number;
  /** Offset tọa độ Y (mặc định = 0) */
  offsetY?: number;
  /** Trạng thái hiển thị của phòng */
  isVisible?: boolean;
  /** Chỉ bật tương tác khi người chơi đã hoàn tất chuyển vào phòng này. */
  isInteractive?: boolean;
}

// Bản đồ offset cho mỗi phòng (Gallery ID → Z offset từ sảnh)
// Mỗi phòng dài 46 đơn vị. Phòng 1 bắt đầu ngay Z=8 (sau tường sảnh):
//   center = 8 + 46/2 = 31  →  offset = 31, spans Z 8..54
// Phòng 2 (Bến Nhà Rồng): bắt đầu Z=54  →  center = 79, spans Z 54..104.
// Phòng 5 (Hội nghị): bắt đầu Z=104 →  center = 127, spans Z 104..150.
// Phòng 3: bắt đầu Z=150 →  center = 165, spans Z 150..180.
// Phòng 4 dùng hệ local bất đối xứng -75..+5, đặt tại offset 255 → world Z 180..260.
export const ROOM_OFFSETS: Record<string, { z: number; y: number }> = {
  'gallery-subsidy': { z: 31.0, y: 3.0 },      // Phòng 1: Bao cấp    (Z 8  → 54)
  'gallery-three': { z: roomFiveSpatial.worldCenterZ, y: 3.0 },
  'gallery-paintings': { z: 127.35, y: 3.0 },  // Phòng 5: Z 104 → 150
  'gallery-ceramics': { z: 165.7, y: 3.0 },    // Phòng 3: Z 150 → 180
  'gallery-market-economy': { z: roomFourSpatial.worldOffsetZ, y: 3.0 }, // Phòng 4: Z 180 → 260
};

// Spawn point mặc định khi người chơi bước vào phòng
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number]> = {
  'gallery-subsidy': [0, 3.0, 10.0],           // Spawn gần cửa vào phòng 1 (Z=10)
  'gallery-three': [0, 3.0, roomFiveSpatial.spawnWorldZ],
  'gallery-paintings': [0, 3.0, 106.0],         // Spawn gần cửa vào phòng 5 (Z=106)
  'gallery-ceramics': [0, 3.0, 152.0],          // Spawn gần cửa vào phòng 3 (Z=152)
  'gallery-market-economy': [0, 3.0, roomFourSpatial.spawnWorldZ],
  'lobby': [0, 0, -5.0],                        // Spawn giữa sảnh
};

export const DynamicRoom: React.FC<DynamicRoomProps> = ({
  room,
  offsetZ,
  offsetY = 0,
  isVisible = true,
  isInteractive = true,
}) => {
  const { galleryId, exhibits, gallery } = room;
  const groupRef = useRef<THREE.Group>(null);
  // The 1930 image is reserved for the locked final archive in the middle of Room 1.
  const roomExhibits = useMemo(
    () => galleryId === 'gallery-subsidy'
      ? exhibits.filter((exhibit) => exhibit.id !== ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID)
      : exhibits,
    [galleryId, exhibits],
  );
  const roomCullCenterZ = useMemo(
    () => galleryId === 'gallery-market-economy'
      ? (roomFourSpatial.worldStartZ + roomFourSpatial.worldEndZ) / 2
      : offsetZ,
    [galleryId, offsetZ],
  );
  const roomCullDistance = useMemo(
    () => galleryId === 'gallery-market-economy'
      ? roomFourSpatial.roomLength / 2 + 8
      : 48,
    [galleryId],
  );

  // Cơ chế đếm số hiện vật được phép hiển thị để load từ từ (staggered loading)
  const [visibleCount, setVisibleCount] = useState(() => isVisible ? Math.min(1, roomExhibits.length) : 0);

  // Khi phòng được hiển thị, tăng dần số lượng hiện vật để tránh giật lag đột ngột
  useEffect(() => {
    const initialCount = isVisible ? Math.min(1, roomExhibits.length) : 0;
    const resetTimer = window.setTimeout(() => setVisibleCount(initialCount), 0);

    if (!isVisible || roomExhibits.length <= 1) {
      return () => window.clearTimeout(resetTimer);
    }

    // Cứ mỗi 150ms mount thêm 1 hiện vật để chia đều tải tải lưới (geometry) và tải hoạ tiết (texture)
    const interval = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= roomExhibits.length) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearInterval(interval);
    };
  }, [isVisible, roomExhibits.length]);

  // Cơ chế Occlusion Culling (LOD): ẩn phòng nếu người chơi đi quá xa để giảm tải GPU vẽ hình
  useFrame((state) => {
    if (!groupRef.current) return;

    if (!isVisible) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      return;
    }

    const player = state.scene.getObjectByName('lobby-player');
    if (player) {
      const playerZ = player.position.z;
      const dist = Math.abs(playerZ - roomCullCenterZ);

      // Nếu người chơi ở khoảng cách > 48 đơn vị Z (không nằm gần phòng này hoặc phòng liền kề),
      // ta ẩn phòng đi để giảm thiểu tối đa số lệnh vẽ (draw calls) và số lượng đỉnh đa giác.
      const shouldBeVisible = dist < roomCullDistance;
      if (groupRef.current.visible !== shouldBeVisible) {
        groupRef.current.visible = shouldBeVisible;
        console.log(`[LOD-CULLING] Phòng "${galleryId}" chuyển trạng thái visible = ${shouldBeVisible}`);
      }
    } else {
      if (!groupRef.current.visible) groupRef.current.visible = true;
    }
  });

  // Build custom settings từ gallery data
  const customSettings = gallery ? {
    room_width: gallery.room_width ?? 12,
    room_length: gallery.room_length ?? 30,
    room_height: gallery.room_height ?? 6,
    floor_color: gallery.floor_color ?? '#e4d8c5',
    wall_color: gallery.wall_color ?? '#f7f3ea',
    wainscoting_color: gallery.wainscoting_color ?? '#e8e1d4',
    floor_type: (gallery.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  } : undefined;

  return (
    <group ref={groupRef} position={[0, offsetY, offsetZ]} visible={isVisible}>
      <Suspense fallback={null}>
        {/* Phòng triển lãm */}
        <ExhibitionRoom
          galleryId={galleryId}
          customSettings={customSettings}
          isVisible={isVisible}
          isInteractive={isInteractive}
          lightingContext="connected"
          ropeBarriersConfig={gallery?.rope_barriers_config}
          exhibits={exhibits}
        />

        {/* Các hiện vật trong phòng - Load từ từ từng cái một để giảm lag */}
        {roomExhibits.slice(0, visibleCount).map((exhibit) => (
          <ExhibitObject key={exhibit.id} exhibit={exhibit} isVisible={isVisible} />
        ))}
      </Suspense>
    </group>
  );
};

export default DynamicRoom;
