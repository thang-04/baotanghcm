'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { MuseumLobby } from '@/components/3d/MuseumLobby';
import { DoorPortal } from '@/components/3d/DoorPortal';
import { DynamicRoom, ROOM_OFFSETS } from '@/components/3d/DynamicRoom';
import { AvatarAppearance } from '@/components/3d/AvatarAppearance';
import { AvatarSelector } from '@/components/ui/AvatarSelector';
import { MultiplayerAvatars } from '@/components/3d/MultiplayerAvatars';
import { CompetitionQuestionStations } from '@/components/3d/CompetitionQuestionStations';
import { ArrowLeft, AlertTriangle, Settings } from 'lucide-react';
import { ExhibitModal } from '@/components/ui/ExhibitModal';
import MiniGameModal from '@/components/ui/MiniGameModal';
import { InvestigationNotebook } from '@/components/ui/InvestigationNotebook';
import { RoomOneSoundtrack } from '@/components/ui/RoomOneSoundtrack';
import { RoomFiveMissionHud } from '@/components/ui/RoomFiveMissionHud';
import {
  isPointInsideRoomFourCollider,
  ROOM_FOUR_PLAYER_COLLISION_MARGIN,
  ROOM_FOUR_WALL_INSET,
  worldToRoomFourLocalZ,
} from '@/lib/roomFourLayout';
import roomFourSpatial from '@/lib/roomFourSpatial.json';
import roomFiveSpatial from '@/lib/roomFiveSpatial.json';
import {
  ROOM_THREE_DISPLAY_NAME,
} from '@/lib/roomThreeNarrative';
import { createTeleportMovePayload } from '@/lib/teleportSync';

// ═══════════════════════════════════════════════════════════════════════════
// CÁC HẰNG SỐ CỦA SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const LOBBY_W = 30;
const LOBBY_L = 20;
const LOBBY_H = 12;



// This is intentionally identical to the reference light rig on /gallery/[id].
// It is enabled only while Room 4 is active so the connected journey keeps the
// same readable presentation without flattening the other gallery rooms.
const RoomFourReferenceLightRig: React.FC = () => (
  <>
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 12, 5]} intensity={0.7} />
    <directionalLight position={[0, 10, 0]} intensity={1.2} color="#f0f9ff" />
  </>
);

// Tuyến tham quan bắt buộc: 01 -> 02 (Bến Nhà Rồng) -> 03 -> 04 -> 05 (Hội nghị).
// Các phòng được tách bằng chuyển cảnh để giữ đúng thứ tự dù vị trí 3D cũ khác nhau.
const DOOR_CONFIGS = [
  {
    doorId: 'door-room1',
    targetRoom: 'gallery-subsidy',
    // Cửa đặt ở tường sau sảnh, tầng 2 (Y=3, Z=8)
    position: [0, 3.0, 8.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 01: Dấu chân tìm đường',
  },
  {
    doorId: 'door-room2',
    targetRoom: 'gallery-three',
    position: [0, 3.0, roomFiveSpatial.worldStartZ] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 02: Bến Nhà Rồng 1911',
  },
  {
    doorId: 'door-room3',
    targetRoom: 'gallery-ceramics',
    position: [0, 3.0, roomFiveSpatial.worldEndZ] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: ROOM_THREE_DISPLAY_NAME,
  },
  {
    doorId: 'door-room4',
    targetRoom: 'gallery-market-economy',
    position: [0, 3.0, roomFourSpatial.worldStartZ] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 04: Liên Xô — Quảng Châu',
  },
  {
    doorId: 'door-room5',
    targetRoom: 'gallery-paintings',
    position: [0, 3.0, roomFourSpatial.worldEndZ] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 05: Phòng Hội Nghị',
  },
];

const TRANSITION_ROOM_TITLES: Record<string, string> = {
  'gallery-subsidy': 'Phòng 1: DẤU CHÂN TÌM ĐƯỜNG',
  'gallery-three': 'Phòng 2: BẾN CẢNG RA KHƠI',
  'gallery-ceramics': 'Phòng 3: TIẾNG NÓI TỪ AN NAM',
  'gallery-market-economy': 'Phòng 4: NHỮNG ĐIỂM DỪNG CÁCH MẠNG',
  'gallery-paintings': 'Phòng 5: HỘI TỤ TẠI HƯƠNG CẢNG',
};

// Cấu hình các cổng cửa dịch chuyển tương tác khi đứng gần và nhấn E (Tách phòng độc lập)
const INTERACTIVE_DOORS = [
  // --- LOBBY <-> ROOM 1 ---
  {
    id: 'lobby-to-room1',
    fromRoom: 'lobby',
    toRoom: 'gallery-subsidy',
    doorId: 'door-room1',
    check: (x: number, z: number) => z >= 6.0 && z <= 8.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 10.0] as [number, number, number],
    promptVi: 'vào Phòng 01: Dấu chân tìm đường',
    promptEn: 'enter Room 01: Subsidy Room'
  },
  {
    id: 'room1-to-lobby',
    fromRoom: 'gallery-subsidy',
    toRoom: 'lobby',
    doorId: 'door-room1',
    check: (x: number, z: number) => z >= 8.0 && z <= 10.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 0, 6.5] as [number, number, number],
    promptVi: 'quay lại Sảnh chính',
    promptEn: 'return to Lobby'
  },
  // --- ROOM 1 <-> ROOM 2 (NHÀ RỒNG) ---
  {
    id: 'room1-to-room2',
    fromRoom: 'gallery-subsidy',
    toRoom: 'gallery-three',
    doorId: 'door-room2',
    check: (x: number, z: number) => z >= 52.0 && z <= 54.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, roomFiveSpatial.spawnWorldZ] as [number, number, number],
    promptVi: 'vào Phòng 02: Bến Nhà Rồng 1911',
    promptEn: 'enter Room 02: Nhà Rồng Wharf 1911'
  },
  {
    id: 'room2-to-room1',
    fromRoom: 'gallery-three',
    toRoom: 'gallery-subsidy',
    doorId: 'door-room2',
    check: (x: number, z: number) => z >= 54.0 && z <= 56.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, roomFiveSpatial.returnToRoomOneWorldZ] as [number, number, number],
    promptVi: 'quay lại Phòng 01',
    promptEn: 'return to Room 01'
  },
  // --- ROOM 2 (NHÀ RỒNG) <-> ROOM 3 ---
  {
    id: 'room2-to-room3',
    fromRoom: 'gallery-three',
    toRoom: 'gallery-ceramics',
    doorId: 'door-room3',
    check: (x: number, z: number) => z >= roomFiveSpatial.worldEndZ - 2 && z <= roomFiveSpatial.worldEndZ && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 152.0] as [number, number, number],
    promptVi: `vào ${ROOM_THREE_DISPLAY_NAME}`,
    promptEn: 'enter Room 03: Integration Room'
  },
  {
    id: 'room3-to-room2',
    fromRoom: 'gallery-ceramics',
    toRoom: 'gallery-three',
    doorId: 'door-room3',
    check: (x: number, z: number) => z >= 150.0 && z <= 152.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, roomFiveSpatial.returnToRoomTwoWorldZ] as [number, number, number],
    promptVi: 'quay lại Phòng 02',
    promptEn: 'return to Room 02'
  },
  // --- ROOM 3 <-> ROOM 4 ---
  {
    id: 'room3-to-room4',
    fromRoom: 'gallery-ceramics',
    toRoom: 'gallery-market-economy',
    doorId: 'door-room4',
    check: (x: number, z: number) => z >= roomFourSpatial.worldStartZ - 2 && z <= roomFourSpatial.worldStartZ && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, roomFourSpatial.spawnWorldZ] as [number, number, number],
    promptVi: 'vào Phòng 04: Hành trình Liên Xô — Quảng Châu',
    promptEn: 'enter Room 04: The Soviet–Guangzhou Journey'
  },
  {
    id: 'room4-to-room3',
    fromRoom: 'gallery-market-economy',
    toRoom: 'gallery-ceramics',
    doorId: 'door-room4',
    check: (x: number, z: number) => z >= roomFourSpatial.worldStartZ && z <= roomFourSpatial.worldStartZ + 2 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 178.0] as [number, number, number],
    promptVi: `quay lại ${ROOM_THREE_DISPLAY_NAME}`,
    promptEn: 'return to Room 03'
  },
  // --- ROOM 4 <-> ROOM 5 (HỘI NGHỊ) ---
  {
    id: 'room4-to-room5',
    fromRoom: 'gallery-market-economy',
    toRoom: 'gallery-paintings',
    doorId: 'door-room5',
    check: (x: number, z: number) => z >= roomFourSpatial.worldEndZ - 2 && z <= roomFourSpatial.worldEndZ && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 106.0] as [number, number, number],
    promptVi: 'vào Phòng 05: Phòng Hội Nghị',
    promptEn: 'enter Room 05: Conference Room'
  },
  {
    id: 'room5-to-room4',
    fromRoom: 'gallery-paintings',
    toRoom: 'gallery-market-economy',
    doorId: 'door-room5',
    check: (x: number, z: number) => z >= 104.0 && z <= 106.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, roomFourSpatial.worldEndZ - 2] as [number, number, number],
    promptVi: 'quay lại Phòng 04',
    promptEn: 'return to Room 04'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// HÀM HỖ TRỢ TÍNH TOÀN ĐỘ CAO MẶT ĐẤT/CẦU THANG CHO SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const getLobbyGroundY = (x: number, z: number, doorStates: Record<string, { isOpen: boolean }>): number => {
  // Sảnh chờ cầu thang
  if (x > -4.0 && x < 4.0) {
    if (z > 2.0 && z <= 7.0) {
      // Nội suy tuyến tính (smooth slope): từ Z=2.0 (Y=0.0) lên Z=7.0 (Y=3.0)
      const ratio = (z - 2.0) / 5.0;
      return ratio * 3.0;
    }
    if (z > 7.0 && z <= 8.5) return 3.0; // Mezzanine
  }

  // Bậc thang và sàn các phòng triển lãm
  if (z > 8.0 && z <= roomFourSpatial.worldEndZ) {
    // Phòng 5 (Hội trường / Paintings): 104.0 < Z <= 150.0
    if (z > 104.0 && z <= 150.0) {
      // Chỉ áp dụng độ cao bậc thang ở khu vực có các tấm bê tông (Z từ 110.0 đến 144.0)
      if (z >= 110.0 && z <= 144.0) {
        if (x < -3.4) return 3.0;
        if (x < -0.2) return 3.3;
        if (x < 3.0) return 3.6;
        if (x < 6.2) return 3.9;
        return 4.2;
      }
      return 3.0;
    }
    return 3.0;
  }

  if (
    (z > roomFiveSpatial.worldStartZ && z <= roomFiveSpatial.worldEndZ)
    || (z > roomFourSpatial.worldStartZ && z <= roomFourSpatial.worldEndZ)
  ) {
    return 3.0;
  }

  return 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// BỘ ĐIỀU KHIỂN CAMERA CHO SẢNH (Lobby Camera Controller)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyCameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const {
    doorStates,
    activeGallery,
    sittingPosition,
    roomFourInteractionOpen,
  } = useMuseum();
  const theta = useRef(Math.PI);
  const phi = useRef(Math.PI / 2.3);
  const isMouseDown = useRef(false);
  const isZooming = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3()).current;
  const targetLookAt = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    const canvas = gl.domElement;

    // Ngăn chặn menu chuột phải để sử dụng nút RMB làm ống kính Zoom phóng to màn hình
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (roomFourInteractionOpen) return;
      if (e.button === 2) {
        isZooming.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isZooming.current = false;
      }
    };

    // Hỗ trợ phím tắt Z/C cho những máy dùng Touchpad không click chuột phải được dễ dàng
    const handleKeyDown = (e: KeyboardEvent) => {
      if (roomFourInteractionOpen) return;
      if (e.code === 'KeyZ' || e.code === 'KeyC') {
        isZooming.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' || e.code === 'KeyC') {
        isZooming.current = false;
      }
    };

    const isInsideCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (roomFourInteractionOpen) return;
      if (e.button !== 0 || !isInsideCanvas(e)) return;
      isMouseDown.current = true;
    };

    const handlePointerUp = () => {
      isMouseDown.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (roomFourInteractionOpen) return;
      const isLeftButtonHeld = (e.buttons & 1) === 1;
      if (!isLeftButtonHeld || !isInsideCanvas(e)) {
        if (!isLeftButtonHeld) isMouseDown.current = false;
        return;
      }

      isMouseDown.current = true;
      const sensitivity = 0.003;
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;
      phi.current = Math.max(0.3, Math.min(Math.PI / 2 + 0.35, phi.current));
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl, roomFourInteractionOpen]);

  useFrame((state, delta) => {
    // Thực hiện hiệu ứng Zoom mềm mại bằng cách thay đổi FOV (ép kiểu PerspectiveCamera)
    const persCam = camera as THREE.PerspectiveCamera;
    const targetFov = isZooming.current ? 20 : 65;
    if (persCam.fov !== undefined && Math.abs(persCam.fov - targetFov) > 0.1) {
      persCam.fov = THREE.MathUtils.lerp(persCam.fov, targetFov, 0.15);
      persCam.updateProjectionMatrix();
    }

    const player = state.scene.getObjectByName('lobby-player');
    if (!player) return;

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;

    let sitOffsetX = 0;
    let sitOffsetZ = 0;
    let sitOffsetY = 0;

    // Giới hạn hướng xoay ngang của đầu tối đa 90 độ sang 2 bên khi ngồi ghế
    if (sittingPosition && sittingPosition.rotationY !== undefined) {
      const bodyYaw = sittingPosition.rotationY;
      const forwardTheta = bodyYaw + Math.PI; // Bù 180 độ vì camera hướng ngược chiều với mặt trước của body mặc định
      
      let diff = theta.current - forwardTheta;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const clampedDiff = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, diff));
      theta.current = forwardTheta + clampedDiff;

      // Dịch camera ra phía trước mặt 0.35m để tránh che khuất, và nâng cao thêm 0.08m
      sitOffsetX = -0.35 * Math.sin(forwardTheta);
      sitOffsetZ = -0.35 * Math.cos(forwardTheta);
      sitOffsetY = 0.08;
    }

    // Nếu đang Zoom hoặc Ngồi (First Person), đặt camera cao ngang tầm mắt/đầu thật của nhân vật (1.12m)
    // Nếu đi lại bình thường (Third Person), đặt camera nhìn vào vùng lưng/cổ (0.6m)
    const isFirstPerson = !!(isZooming.current || sittingPosition);
    const targetHeight = py + (isFirstPerson ? 1.12 : 0.6);

    // Khi zoom hoặc khi đang ngồi ghế, thu nhỏ khoảng cách camera về 0 (góc nhìn thứ nhất) để không bị cản bởi đầu nhân vật
    const idealDist = isFirstPerson ? 0.0 : 5.5;

    // Khi zoom thì ẩn nhân vật để tránh clipping, nhưng khi ngồi thì vẫn hiện nhân vật (chỉ ẩn đầu) để người chơi nhìn thấy tay chân, thân thể mình
    if (isZooming.current) {
      player.visible = false;
    } else {
      player.visible = true;
    }

    const xOff = idealDist * Math.sin(theta.current) * Math.sin(phi.current);
    const yOff = idealDist * Math.cos(phi.current);
    const zOff = idealDist * Math.cos(theta.current) * Math.sin(phi.current);

    // Xác định ranh giới camera dựa trên vị trí người chơi và trạng thái các cửa để tránh camera nhìn xuyên qua cửa đóng
    const isDoor1Open = doorStates['door-room1']?.isOpen || false;
    const isDoor2Open = doorStates['door-room2']?.isOpen || false;
    const isDoor3Open = doorStates['door-room3']?.isOpen || false;
    const isDoor4Open = doorStates['door-room4']?.isOpen || false;
    const isDoor5Open = doorStates['door-room5']?.isOpen || false;

    let minX = -LOBBY_W / 2 + 0.5; // -14.5
    let maxX = LOBBY_W / 2 - 0.5;  // 14.5
    let minZ = -9.4;
    let maxZ = 7.8;

    if (pz <= 8.0) {
      // Đang ở Sảnh
      minX = -LOBBY_W / 2 + 0.5;
      maxX = LOBBY_W / 2 - 0.5;
      minZ = -9.4;
      maxZ = isDoor1Open ? 8.2 : 7.8;
    } 
    else if (pz > 8.0 && pz <= 54.0) {
      // Đang ở Phòng 1
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor1Open ? -9.4 : 8.2;
      maxZ = isDoor2Open ? roomFiveSpatial.worldStartZ + 0.2 : 53.8;
    }
    else if (pz > roomFiveSpatial.worldStartZ && pz <= roomFiveSpatial.worldEndZ) {
      // Đang ở Phòng 2 (Bến Nhà Rồng)
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor2Open ? roomFiveSpatial.worldStartZ - 0.2 : roomFiveSpatial.worldStartZ + 0.2;
      maxZ = isDoor3Open ? roomFiveSpatial.worldEndZ + 0.2 : roomFiveSpatial.worldEndZ - 0.2;
    } 
    else if (pz > 104.0 && pz <= 150.0) {
      // Đang ở Phòng 5 (Hội nghị)
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor5Open ? 103.8 : 104.2;
      maxZ = 149.8;
    } 
    else if (pz > 150.0 && pz <= 180.0) {
      // Đang ở Phòng 3
      minX = -14.5;
      maxX = 14.5;
      minZ = isDoor3Open ? 149.8 : 150.2;
      maxZ = isDoor4Open ? roomFourSpatial.worldStartZ + 0.2 : 179.8;
    }
    else if (pz > roomFourSpatial.worldStartZ && pz <= roomFourSpatial.worldEndZ) {
      // Đang ở Phòng 4 — hành trình Liên Xô đến Quảng Châu
      minX = -roomFourSpatial.roomWidth / 2 + 0.5;
      maxX = roomFourSpatial.roomWidth / 2 - 0.5;
      minZ = isDoor4Open ? roomFourSpatial.worldStartZ - 0.2 : roomFourSpatial.worldStartZ + 0.2;
      maxZ = isDoor5Open ? roomFourSpatial.worldEndZ + 0.2 : roomFourSpatial.worldEndZ - 0.2;
    }

    const camX = Math.max(minX, Math.min(maxX, px + xOff + sitOffsetX));
    const camZ = Math.max(minZ, Math.min(maxZ, pz + zOff + sitOffsetZ));

    // Tính toán độ cao sàn nhà thực tế tại vị trí camera để kẹp độ cao tối thiểu
    const groundYAtCam = getLobbyGroundY(camX, camZ, doorStates);
    const minCamY = groundYAtCam + 0.45;

    // Giới hạn camera không vượt quá trần nhà để chống nhìn xuyên trần
    let maxCamY = LOBBY_H - 0.5; // Sảnh mặc định 11.5m
    if (camZ > 8.0) {
      const activeRoomHeight = activeGallery?.room_height ?? 6.0;
      maxCamY = 3.0 + activeRoomHeight - 0.5;
    }
    const camY = Math.max(minCamY, Math.min(maxCamY, targetHeight + yOff + sitOffsetY));

    targetCamPos.set(camX, camY, camZ);

    // Khi zoom hoặc đang ngồi ghế, hướng nhìn của camera sẽ nhìn thẳng ra phía trước tầm nhìn thay vì nhìn vào đầu nhân vật
    if (isZooming.current || sittingPosition) {
      const lookAtX = px - 10 * Math.sin(theta.current) * Math.sin(phi.current);
      const lookAtY = targetHeight - 10 * Math.cos(phi.current);
      const lookAtZ = pz - 10 * Math.cos(theta.current) * Math.sin(phi.current);
      targetLookAt.set(lookAtX, lookAtY, lookAtZ);
    } else {
      targetLookAt.set(px, targetHeight, pz);
    }

    const camAlpha = 1.0 - Math.exp(-8.0 * Math.min(0.1, delta));
    camera.position.lerp(targetCamPos, camAlpha);
    camera.lookAt(targetLookAt);
  });

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// BỘ TIỀN BIÊN DỊCH SHADER PHÒNG (Room Shader Precompiler)
// ═══════════════════════════════════════════════════════════════════════════
const RoomPrecompiler: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const { loadedRooms } = useMuseum();

  useEffect(() => {
    if (loadedRooms.length === 0) return;
    // Ép GPU compile/upload các vật liệu và hình học của phòng trước khi hiển thị
    gl.compile(scene, camera);
    console.log(`[PRECOMPILE] GPU đã biên dịch trước các vật liệu cho ${loadedRooms.length} phòng.`);
  }, [loadedRooms, gl, scene, camera]);

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// NHÂN VẬT NGƯỜI CHƠI TRONG SẢNH + PHÒNG (Player Character)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyPlayer: React.FC<{
  onActiveDoorChange: (door: any) => void;
  activeDoor: any;
  activeDoorRef: React.RefObject<any>;
  transitionLoading: boolean;
  onTransitionLoadingChange: (loading: boolean) => void;
  onTransitionRoomChange: (roomId: string, fallbackName: string) => void;
}> = ({
  onActiveDoorChange,
  activeDoor,
  activeDoorRef,
  transitionLoading,
  onTransitionLoadingChange,
  onTransitionRoomChange,
}) => {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, e: false, shift: false, space: false });
  const isMoving = useRef(false);
  const jumpVelocity = useRef(0);
  const isJumping = useRef(false);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const { playerPositionRef, outfitId, settings, doorStates, loadedRooms, teleportTarget, setTeleportTarget, clearTeleport, currentRoom, setCurrentRoom, socket, selectedExhibit, sittingPosition, setSittingPosition, sittingPrompt, setSittingPrompt, roomOneLocked, roomOneCompleted, roomTwoDocOpen, setRoomTwoDocOpen, roomTwoScore, language, roomFourInteractionOpen } = useMuseum();
  const isPawn = settings.preset === 'low';
  const baseY = isPawn ? 0.24 : 0.472;
  const lastUpdate = useRef(0);

  const frontVec = useRef(new THREE.Vector3()).current;
  const rightVec = useRef(new THREE.Vector3()).current;
  const moveDir = useRef(new THREE.Vector3()).current;

  // Khởi tạo danh sách 60 ghế ngồi trong Phòng 5 bậc thang để check khoảng cách và tọa độ ngồi
  const ROOM2_CHAIRS = useMemo(() => {
    const chairs: Array<{ x: number; y: number; z: number }> = [];
    const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];
    const frontChairZs = [-14.5, -12.5, -10.5, -8.5, -6.5, -4.5];
    const backChairZs = [4.5, 6.5, 8.5, 10.5, 12.5, 14.5];

    const getTierY = (xVal: number) => {
      if (xVal < -3.4) return 0.0;
      if (xVal < -0.2) return 0.3;
      if (xVal < 3.0) return 0.6;
      if (xVal < 6.2) return 0.9;
      return 1.2;
    };

    for (const xCol of deskXCoords) {
      const tierY = getTierY(xCol);
      for (const zVal of [...frontChairZs, ...backChairZs]) {
        chairs.push({
          x: xCol - 0.4,
          y: 3.35 + tierY, // Độ cao ngồi = 3.35 (đệm ghế) + độ cao bậc thang
          z: 127.0 + zVal
        });
      }
    }
    return chairs;
  }, []);

  const nearestChairRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const sittingPositionRef = useRef<any>(null);
  const exitPositionRef = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    sittingPositionRef.current = sittingPosition;
  }, [sittingPosition]);

  // Thiết lập vị trí spawn ban đầu khi mount sảnh
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, baseY, -5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý teleport
  useEffect(() => {
    if (teleportTarget && playerRef.current) {
      playerRef.current.position.set(teleportTarget.x, teleportTarget.y + baseY, teleportTarget.z);
      socket?.emit('move', createTeleportMovePayload(teleportTarget, playerRef.current.rotation.y));
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, baseY, socket]);

  /**
   * Kiểm tra va chạm mở rộng (sảnh + phòng triển lãm)
   */
  const checkCollision = useCallback(
    (x: number, z: number, currentY: number): boolean => {
      // Tự động phát hiện phòng hiện tại dựa trên tọa độ Z thực tế của người chơi (khắc phục lỗi khóa di chuyển do trễ state React)
      const playerZ = playerRef.current ? playerRef.current.position.z : 0;
      let activeRoom = 'lobby';
      if (playerZ > 8.0 && playerZ <= 54.0) {
        activeRoom = 'gallery-subsidy';
      } else if (playerZ > roomFiveSpatial.worldStartZ && playerZ <= roomFiveSpatial.worldEndZ) {
        activeRoom = 'gallery-three';
      } else if (playerZ > 104.0 && playerZ <= 150.0) {
        activeRoom = 'gallery-paintings';
      } else if (playerZ > 150.0 && playerZ <= 180.0) {
        activeRoom = 'gallery-ceramics';
      } else if (playerZ > roomFourSpatial.worldStartZ && playerZ <= roomFourSpatial.worldEndZ) {
        activeRoom = 'gallery-market-economy';
      }

      // Ranh giới vật lý cứng giữa các phòng triển lãm để ngăn người chơi đi bộ xuyên phòng (bắt buộc nhấn E)
      if (activeRoom === 'lobby' && z > 7.7) return true;
      if (activeRoom === 'gallery-subsidy' && (z < 8.3 || z > 53.7)) return true;
      if (activeRoom === 'gallery-three' && (z < roomFiveSpatial.worldStartZ + 0.3 || z > roomFiveSpatial.worldEndZ - 0.3)) return true;
      if (activeRoom === 'gallery-paintings' && (z < 104.3 || z > 149.7)) return true;
      if (activeRoom === 'gallery-ceramics' && (z < 150.3 || z > 179.7)) return true;
      if (
        activeRoom === 'gallery-market-economy' &&
        (z < roomFourSpatial.worldStartZ + ROOM_FOUR_WALL_INSET ||
          z > roomFourSpatial.worldEndZ - ROOM_FOUR_WALL_INSET)
      ) return true;

      // ── VÙNG SẢNH (Lobby) ──
      if (z <= 8.0) {
        // Biên giới sảnh
        if (x < -14.4 || x > 14.4 || z < -9.4) return true;

        // Tường sau sảnh Z = 8.0 — CHỈ chặn nếu cửa 1 ĐÓNG
        if (z > 7.3) {
          // Kiểm tra nếu người chơi đang đi qua cửa mở
          const passingDoor1 = doorStates['door-room1']?.isOpen && x > -2.2 && x < 2.2 && currentY >= 2.5;
          if (!passingDoor1) {
            return true;
          }
        }

        // Quầy lễ tân bên phải
        if (x > 12.0 && x < 15.0 && z > -6.7 && z < 0.7) return true;


        // Thành cầu thang
        if (z > 1.5 && z <= 8.0) {
          const onStairX = x > -4.0 && x < 4.0;
          if (!onStairX) {
            if (x > -4.5 && x < 4.5) return true;
          }
        }

        // Rơi từ tầng 2
        if (currentY > 2.0 && (x < -4.0 || x > 4.0)) return true;

        // Ghế băng
        if (x > -12.0 && x < -8.5 && z > -4.7 && z < -3.3) return true;

        // Chậu cây
        if ((Math.abs(x - 5.5) < 0.7 || Math.abs(x + 5.5) < 0.7) && Math.abs(z - 1.5) < 0.7) return true;

        return false;
      }

      // ── PHÒNG TRIỂN LÃM 1 (gallery-subsidy: Z 8.0 -> 54.0) ──
      if (z > 8.0 && z <= 54.0) {
        // Chỉ chặn khi đi lùi về sảnh qua cửa 1 đang đóng
        if (z < 8.6) {
          const passingDoor1 = doorStates['door-room1']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor1) return true;
        }

        // Tường chính bên trái/phải
        if (x < -11.7 || x > 11.7) return true;

        // 1. Ghế gỗ băng cũ trong phòng (local Z = -12.0 & 12.0 => Global Z = 19.0 & 43.0)
        // Khi đang nhảy cao hơn mặt ghế thì cho vượt qua.
        const canJumpOverBench = currentY > 3.75;
        if (!canJumpOverBench && z > 18.5 && z < 19.5 && x > -1.7 && x < 1.7) {
          return true;
        }
        if (!canJumpOverBench && z > 42.5 && z < 43.5 && x > -1.7 && x < 1.7) {
          return true;
        }

        // 5. Dãy ghế ngồi giữa phòng (local Z = -4.0, 4.0 => Global Z = 27.0, 35.0)
        const centralBenchZs = [27.0, 35.0];
        for (const benchZ of centralBenchZs) {
          if (!canJumpOverBench && z > benchZ - 0.65 && z < benchZ + 0.65 && x > -2.15 && x < 2.15) {
            return true;
          }
        }

        // 6. Bàn lọ hoa trang trí (mỗi bên 3 bàn => Global Z = 15.0, 31.0, 47.0)
        const decorTables = [
          { x: -7.2, z: 15.0 },
          { x: -7.2, z: 31.0 },
          { x: -7.2, z: 47.0 },
          { x: 7.2, z: 15.0 },
          { x: 7.2, z: 31.0 },
          { x: 7.2, z: 47.0 },
        ];
        for (const table of decorTables) {
          const dx = x - table.x;
          const dz = z - table.z;
          if (Math.sqrt(dx * dx + dz * dz) < 0.75) {
            return true;
          }
        }

        // Cửa cuối phòng nối sang Phòng 2 (Bến Nhà Rồng)
        if (z > 53.3) {
          const passingDoor2 = doorStates['door-room2']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor2) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 2 — Bến Nhà Rồng (gallery-three: Z 54.0 -> 104.0) ──
      if (z > roomFiveSpatial.worldStartZ && z <= roomFiveSpatial.worldEndZ) {
        if (z < roomFiveSpatial.worldStartZ + 0.6) {
          const passingDoor2 = doorStates['door-room2']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor2) return true;
        }
        if (x < -11.7 || x > 11.7) return true;

        if (z > roomFiveSpatial.worldEndZ - 0.7) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 5 — Hội nghị (gallery-paintings: Z 104.0 -> 150.0) ──
      if (z > 104.0 && z <= 150.0) {
        // Phòng Hội nghị được vào từ Phòng 4 bằng cửa 5.
        if (z < 104.6) {
          const passingDoor5 = doorStates['door-room5']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor5) return true;
        }

        if (x < -11.7 || x > 11.7) return true;

        // Chặn các bàn đại biểu và ghế trong Phòng 5 (X xoay dọc, 5 dãy bàn bậc thang)
        const localZ = z - 127.0;
        const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];
        // Chặn bục sân khấu bên trái và lan can 2 đầu sân khấu (local X: -12.0 đến -7.6, local Z: -7.6 đến 7.6)
        if (x < -7.6 && localZ > -7.6 && localZ < 7.6) return true;

        // Chặn các dãy bàn dọc
        for (const rowX of deskXCoords) {
          // Kiểm tra xem người chơi có đè lên X của hàng bàn ghế không (đã dịch sang trái 1.0m)
          if (x > rowX - 1.4 && x < rowX - 0.1) {
            // Kiểm tra theo trục dọc Z (Front block & Back block)
            const inFrontBlock = localZ > -15.2 && localZ < -3.8;
            const inBackBlock = localZ > 3.8 && localZ < 15.2;
            if (inFrontBlock || inBackBlock) return true;
          }
        }

        // Chặn va chạm của lan can (Railing Collisions) ngăn nhảy qua các bậc thềm
        const railXCoords = [-3.4, -0.2, 3.0, 6.2];
        const inFrontRailZ = localZ >= -14.5 && localZ <= -4.5;
        const inBackRailZ = localZ >= 4.5 && localZ <= 14.5;
        if (inFrontRailZ || inBackRailZ) {
          for (const railX of railXCoords) {
            if (x > railX - 0.2 && x < railX + 0.2) {
              return true;
            }
          }
        }

        // Chặn va chạm ở 2 đầu lan can biên Z (Z global = 110.0 và 144.0) khi đứng trên các bậc (X > -3.4)
        if (x > -3.4) {
          if (z >= 109.6 && z <= 110.4) return true;
          if (z >= 143.6 && z <= 144.4) return true;
        }

        if (z > 149.3) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 3 (gallery-ceramics: Z 150.0 -> 180.0) ──
      if (z > 150.0 && z <= 180.0) {
        // Chỉ chặn khi đi lùi về phòng 2 qua cửa 3 đang đóng
        if (z < 150.6) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }

        if (x < -14.7 || x > 14.7) return true;

        // 1. Va chạm với máy chơi game tại X = 8.0, Z = 178.6 (global)
        if (x > 6.6 && x < 9.4 && z > 177.4 && z < 179.5) {
          return true;
        }

        // 2. Va chạm với hàng rào bên trái (X = -13.2)
        if (x < -12.4) {
          if ((z > 154.2 && z < 159.8) || (z > 162.2 && z < 167.8) || (z > 170.2 && z < 175.8)) {
            return true;
          }
        }

        // 3. Va chạm với hàng rào bên phải (X = 13.2)
        if (x > 12.4) {
          if ((z > 154.2 && z < 159.8) || (z > 162.2 && z < 167.8) || (z > 170.2 && z < 175.8)) {
            return true;
          }
        }

        // 4. Va chạm với hàng rào cửa vào trước (Z = 151.8 global)
        if (z < 152.6) {
          if ((x > -10.8 && x < -5.2) || (x > 5.2 && x < 10.8)) {
            return true;
          }
        }

        // 5. Va chạm với hàng rào phía sau bên trái (Z = 178.2 global)
        if (z > 177.4) {
          if (x > -10.8 && x < -5.2) {
            return true;
          }
        }

        if (z > 179.3) {
          const passingDoor4 = doorStates['door-room4']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor4) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 4 (gallery-market-economy: Z 180.0 -> 260.0) ──
      if (z > roomFourSpatial.worldStartZ && z <= roomFourSpatial.worldEndZ) {
        // Chỉ chặn khi đi lùi về phòng 3 qua cửa 4 đang đóng
        if (z < roomFourSpatial.worldStartZ + 0.6) {
          const passingDoor4 = doorStates['door-room4']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor4) return true;
        }

        // Biên giới tường bên (rộng 18m, X = ±9m)
        const roomFourHalfWidth = roomFourSpatial.roomWidth / 2 - ROOM_FOUR_WALL_INSET;
        if (x < -roomFourHalfWidth || x > roomFourHalfWidth) return true;

        // Collider dùng cùng layout datum với station bay và transition wings của RoomFour.
        if (
          isPointInsideRoomFourCollider(
            x,
            worldToRoomFourLocalZ(z),
            ROOM_FOUR_PLAYER_COLLISION_MARGIN,
          )
        ) return true;

        if (z > roomFourSpatial.worldEndZ - 0.7) {
          const passingDoor5 = doorStates['door-room5']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor5) return true;
        }

        return false;
      }

      return false;
    },
    [doorStates]
  );

  // Bắt phím WASD
  useEffect(() => {
    const movementKeyMap: Record<string, 'w' | 'a' | 's' | 'd' | 'e' | 'shift' | 'space'> = {
      KeyW: 'w',
      KeyA: 'a',
      KeyS: 's',
      KeyD: 'd',
      KeyE: 'e',
      Space: 'space',
      ArrowUp: 'w',
      ArrowLeft: 'a',
      ArrowDown: 's',
      ArrowRight: 'd',
      ShiftLeft: 'shift',
      ShiftRight: 'shift',
    };

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;

      if (e.code === 'KeyE') {
        e.preventDefault();
        if (sittingPositionRef.current) {
          // Chỉ cho phép bật/tắt video trên banner khi đang ngồi ở phòng 5.
          if (playerRef.current && playerRef.current.position.z > 104.0 && playerRef.current.position.z <= 150.0) {
            setRoomTwoDocOpen((prev: boolean) => !prev);
          }
        } else if (activeDoorRef.current) {
          const door = activeDoorRef.current;
          const targetRoomName = language === 'vi' ? door.promptVi : door.promptEn;
          onTransitionRoomChange(door.toRoom, targetRoomName);
          onTransitionLoadingChange(true);

          setTimeout(() => {
            // Dịch chuyển người chơi tới vị trí spawn của phòng mới
            setTeleportTarget({
              x: door.spawnPos[0],
              y: door.spawnPos[1],
              z: door.spawnPos[2]
            });
            setCurrentRoom(door.toRoom);

            setTimeout(() => {
              onTransitionLoadingChange(false);
              onTransitionRoomChange('', '');
            }, 800);
          }, 1200);
        }
        return;
      }

      if (e.code === 'KeyF') {
        e.preventDefault();
        if (sittingPositionRef.current) {
          // Lưu vị trí dịch chuyển để đứng dậy (trục X dịch sang phải +1.2m)
          const exitX = sittingPositionRef.current.x + 1.2;
          const exitZ = sittingPositionRef.current.z;
          // Tính toán độ cao đứng lên dựa trên vị trí bậc thang tại tọa độ exitX
          const exitY = getLobbyGroundY(exitX, exitZ, doorStates) + baseY;
          exitPositionRef.current = { x: exitX, y: exitY, z: exitZ };
          setRoomTwoDocOpen(false);
          setSittingPosition(null);
        } else if (nearestChairRef.current) {
          // Ngồi xuống ghế: Lấy đúng tọa độ y từ vật thể ghế đã tính độ cao bậc thang
          setSittingPosition({
            x: nearestChairRef.current.x,
            y: nearestChairRef.current.y,
            z: nearestChairRef.current.z,
            rotationY: -Math.PI / 2
          });
          setSittingPrompt('stand');
        }
        return;
      }

      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();

      if (key === 'space') {
        if (!isJumping.current) {
          isJumping.current = true;
          jumpVelocity.current = 7.5;
        }
        keys.current.space = true;
        return;
      }

      keys.current[key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keys.current[key] = false;
    };
    // Reset tất cả phím khi trang bị mất focus (tránh nhân vật tự di chuyển)
    const resetAllKeys = () => {
      keys.current.w = false;
      keys.current.a = false;
      keys.current.s = false;
      keys.current.d = false;
      keys.current.e = false;
      keys.current.shift = false;
      keys.current.space = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetAllKeys);
    document.addEventListener('visibilitychange', resetAllKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetAllKeys);
      document.removeEventListener('visibilitychange', resetAllKeys);
    };
  }, [baseY, language, setCurrentRoom, setRoomTwoDocOpen, setSittingPosition, setSittingPrompt, setTeleportTarget]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    playerPositionRef.current = [playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z];
    if (selectedExhibit || transitionLoading || roomFourInteractionOpen || roomOneLocked) return;

    // Xử lý dịch chuyển tức thời khi đứng dậy để tránh trễ đồng bộ React state
    if (exitPositionRef.current) {
      playerRef.current.position.set(exitPositionRef.current.x, exitPositionRef.current.y, exitPositionRef.current.z);
      exitPositionRef.current = null;
      return;
    }

    // Check khoảng cách ghế ngồi và cập nhật sittingPrompt
    const pPos = playerRef.current.position;
    if (sittingPosition) {
      if (sittingPrompt !== 'stand') setSittingPrompt('stand');
    } else {
      if (pPos.z > 104.0 && pPos.z <= 150.0) {
        let minDist = Infinity;
        let closest: { x: number; y: number; z: number } | null = null;
        for (const chair of ROOM2_CHAIRS) {
          const dx = pPos.x - chair.x;
          const dz = pPos.z - chair.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < minDist) {
            minDist = dist;
            closest = chair;
          }
        }

        if (minDist < 1.3) {
          if (sittingPrompt !== 'sit') setSittingPrompt('sit');
          nearestChairRef.current = closest;
        } else {
          if (sittingPrompt !== null) setSittingPrompt(null);
          nearestChairRef.current = null;
        }
      } else {
        if (sittingPrompt !== null) setSittingPrompt(null);
        nearestChairRef.current = null;
      }
    }

    // Kiểm tra khoảng cách đến các cửa dịch chuyển tương tác
    let foundDoor = null;
    if (!sittingPosition) {
      for (const door of INTERACTIVE_DOORS) {
        if (door.fromRoom === currentRoom && door.check(pPos.x, pPos.z)) {
          if (doorStates[door.doorId]?.isOpen) {
            foundDoor = door;
            break;
          }
        }
      }
    }

    if (foundDoor) {
      if (activeDoor?.id !== foundDoor.id) {
        onActiveDoorChange(foundDoor);
      }
    } else {
      if (activeDoor !== null) {
        onActiveDoorChange(null);
      }
    }

    if (sittingPosition) {
      playerRef.current.position.set(sittingPosition.x, sittingPosition.y, sittingPosition.z);
      const bodyYaw = sittingPosition.rotationY !== undefined ? sittingPosition.rotationY : -Math.PI / 2;
      playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, bodyYaw, 0.15);

      // Xoay chân gập vuông góc 90 độ về phía trước và để tay đặt lên đùi
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 4.0;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI / 4.0;
        rightArmRef.current.rotation.z = -0.1;
      }

      // Tính góc xoay đầu thực tế của camera so với hướng thẳng của thân
      const camDir = new THREE.Vector3();
      state.camera.getWorldDirection(camDir);
      const camYaw = Math.atan2(-camDir.x, -camDir.z);
      let hDiff = camYaw - (bodyYaw + Math.PI); // Bù 180 độ vì camera hướng ngược chiều với mặt trước của body mặc định
      hDiff = Math.atan2(Math.sin(hDiff), Math.cos(hDiff));

      // Xoay đầu local (mặc dù local head bị ẩn khi ngồi để tránh clip camera, nhưng vẫn quay đúng hướng)
      if (headRef.current) {
        headRef.current.rotation.y = hDiff;
      }

      // Phát tọa độ ngồi cố định góc nhìn thân cho người khác, kèm góc xoay đầu relative
      const now = state.clock.getElapsedTime() * 1000;
      if (now - lastUpdate.current > 80) {
        socket?.emit('move', {
          x: sittingPosition.x,
          y: sittingPosition.y - baseY, // Gửi tọa độ Y tương đối để server đồng bộ đúng độ cao
          z: sittingPosition.z,
          yaw: bodyYaw, // Gửi yaw cố định của ghế
          isSitting: true,
          headYaw: hDiff, // Gửi góc xoay ngang relative của đầu
        });
        lastUpdate.current = now;
      }

      return;
    }

    const { w, a, s, d, shift } = keys.current;
    const moving = w || a || s || d;
    isMoving.current = moving;

    if (moving) {
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();

      rightVec.set(-frontVec.z, 0, frontVec.x).normalize();

      moveDir.set(0, 0, 0);
      if (w) moveDir.add(frontVec);
      if (s) moveDir.sub(frontVec);
      if (d) moveDir.add(rightVec);
      if (a) moveDir.sub(rightVec);
      moveDir.normalize();

      const speed = shift ? 10.0 : 6.0;
      const curPos = playerRef.current.position;
      const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

      const movementDelta = Math.min(0.04, delta);
      const nextX = curPos.x + moveDir.x * speed * movementDelta;
      const nextZ = curPos.z + moveDir.z * speed * movementDelta;

      if (!checkCollision(nextX, curPos.z, curGroundY)) {
        curPos.x = nextX;
      }
      if (!checkCollision(curPos.x, nextZ, curGroundY)) {
        curPos.z = nextZ;
      }

      const targetRot = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRot - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * 12 * movementDelta;
    }

    const curPos = playerRef.current.position;
    const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

    let bobY = 0;
    const t = state.clock.getElapsedTime();
    if (moving && settings.animations) {
      bobY = Math.sin(t * (shift ? 16 : 11)) * 0.032;
    }
    const baseGroundY = curGroundY + baseY;

    if (isJumping.current) {
      jumpVelocity.current -= 24.0 * delta;
      curPos.y += jumpVelocity.current * delta;

      if (curPos.y <= baseGroundY) {
        curPos.y = baseGroundY;
        jumpVelocity.current = 0;
        isJumping.current = false;
      }
    } else {
      const targetY = baseGroundY + bobY;
      const lerpAlphaY = 1.0 - Math.exp(-15.0 * delta);
      curPos.y = THREE.MathUtils.lerp(curPos.y, targetY, lerpAlphaY);
    }

    // Chỉ kẹp cứng nếu người chơi bị hẫng chân quá sâu (ví dụ > 0.4 đơn vị) dưới sàn thực tế
    const minAllowedY = curGroundY + baseY - 0.05;
    if (curPos.y < minAllowedY) {
      curPos.y = minAllowedY;
    }

    // Cập nhật phòng hiện tại dựa trên vị trí tuần tự trục Z
    if (curPos.z <= 8.0) {
      setCurrentRoom('lobby');
    } else if (curPos.z > 8.0 && curPos.z <= 54.0) {
      setCurrentRoom('gallery-subsidy');
    } else if (curPos.z > roomFiveSpatial.worldStartZ && curPos.z <= roomFiveSpatial.worldEndZ) {
      setCurrentRoom('gallery-three');
    } else if (curPos.z > 104.0 && curPos.z <= 150.0) {
      setCurrentRoom('gallery-paintings');
    } else if (curPos.z > 150.0 && curPos.z <= 180.0) {
      setCurrentRoom('gallery-ceramics');
    } else if (curPos.z > roomFourSpatial.worldStartZ && curPos.z <= roomFourSpatial.worldEndZ) {
      setCurrentRoom('gallery-market-economy');
    }

    // Arm/Leg swing
    const swingSpeed = shift ? 16 : 11;
    const swingAmp = 0.45;

    if (moving && settings.animations) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * swingSpeed) * swingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t * swingSpeed) * swingAmp;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x += (0 - leftLegRef.current.rotation.x) * 0.15;
      if (rightLegRef.current) rightLegRef.current.rotation.x += (0 - rightLegRef.current.rotation.x) * 0.15;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x += (0 - leftArmRef.current.rotation.x) * 0.15;
        leftArmRef.current.rotation.z += (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x += (0 - rightArmRef.current.rotation.x) * 0.15;
        rightArmRef.current.rotation.z += (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }

    // Trả đầu về vị trí thẳng khi đứng dậy/đi lại
    if (headRef.current) {
      headRef.current.rotation.y += (0 - headRef.current.rotation.y) * 0.15;
    }

    // Gửi tọa độ qua socket (12.5Hz — tối ưu mượt mà và nhẹ tải cho 65 người)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 80) {
      if (socket && socket.connected) {
        socket.emit("move", {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y - baseY, // Gửi tọa độ Y logic (bàn chân chạm đất)
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
          isSitting: false,
        });
      }
      lastUpdate.current = now;
    }
  });

  // Mannequin dimensions
  return (
    <group ref={playerRef} name="lobby-player">
      <AvatarAppearance outfitId={outfitId} lowDetail={isPawn} hideHead={!!sittingPosition} headRef={headRef} leftArmRef={leftArmRef} rightArmRef={rightArmRef} leftLegRef={leftLegRef} rightLegRef={rightLegRef} />
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TRANG SẢN CHÍNH (Lobby Page)
// ═══════════════════════════════════════════════════════════════════════════
export default function LobbyPage() {
  const router = useRouter();
  const {
    nickname,
    setNickname,
    outfitId,
    setOutfitId,
    setCompetitionMode,
    language,
    settings,
    setActiveGallery,
    doorStates,
    roomStates,
    loadedRooms,
    roomClosingAlert,
    currentRoom,
    setCurrentRoom,
    setTeleportTarget,
    clearTeleport,
    updatePreset,
    updateSettings,
    miniGameOpen,
    sittingPrompt,
    otherUsers,
  } = useMuseum();
  const [inputNickname, setInputNickname] = useState('');
  const [inputError, setInputError] = useState('');
  const [entered, setEntered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('competition');
    if (!code) { setCompetitionMode(false); return; }
    try {
      const entry = JSON.parse(sessionStorage.getItem('hcm-competition-entry') || 'null');
      if (!entry || entry.code !== code || typeof entry.nickname !== 'string' || !entry.nickname.trim()) return;
      setOutfitId(entry.outfitId);
      setNickname(entry.nickname.trim());
      setCompetitionMode(true);
      setCurrentRoom('gallery-subsidy');
      setTeleportTarget({ x: 0, y: 3, z: 10 });
      setEntered(true);
    } catch { /* Invalid saved entry falls back to the regular entrance form. */ }
    return () => setCompetitionMode(false);
  }, [setNickname, setOutfitId, setCompetitionMode, setCurrentRoom, setTeleportTarget]);


  // Trạng thái chuyển phòng mượt mà qua màn hình loading (Tách không gian các phòng độc lập)
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionRoomName, setTransitionRoomName] = useState('');
  const [transitionRoomId, setTransitionRoomId] = useState<string | null>(null);
  const [activeDoorInfo, setActiveDoorInfo] = useState<any | null>(null);
  const activeDoorInfoRef = useRef<any>(null);
  useEffect(() => {
    activeDoorInfoRef.current = activeDoorInfo;
  }, [activeDoorInfo]);

  // Sync activeGallery với currentRoom trong sảnh + phòng triển lãm 3D liên tục
  useEffect(() => {
    if (!entered || !nickname) {
      setActiveGallery(null);
      return;
    }
    const ROOM_GALLERY_MAP: Record<string, { id: string; name: string }> = {
      'lobby': { id: 'lobby', name: 'Sảnh Bảo Tàng' },
      'gallery-subsidy': { id: 'gallery-subsidy', name: 'Phòng 01: Dấu chân tìm đường' },
      'gallery-paintings': { id: 'gallery-paintings', name: 'Phòng 05: Phòng Hội Nghị' },
      'gallery-ceramics': { id: 'gallery-ceramics', name: ROOM_THREE_DISPLAY_NAME },
      'gallery-market-economy': { id: 'gallery-market-economy', name: 'Phòng 04: Liên Xô — Quảng Châu' },
      'gallery-three': { id: 'gallery-three', name: 'Phòng 02: Bến Nhà Rồng 1911' },
    };
    const meta = ROOM_GALLERY_MAP[currentRoom] ?? { id: currentRoom, name: currentRoom };
    setActiveGallery({ id: meta.id, name: meta.name, description: '', scene_asset_url: '', is_active: true });
    return () => { setActiveGallery(null); };
  }, [entered, nickname, currentRoom, setActiveGallery]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      setInputError(language === 'vi' ? 'Vui lòng nhập biệt danh!' : 'Please enter a nickname!');
      return;
    }
    setInputError('');
    setNickname(inputNickname.trim());

    const requestedRoom = new URLSearchParams(window.location.search).get('room');
    const directRoomSpawns: Record<string, { x: number; y: number; z: number }> = {
      'gallery-subsidy': { x: 0, y: 3.0, z: 10.0 },
      'gallery-three': { x: 0, y: 3.0, z: roomFiveSpatial.spawnWorldZ },
      'gallery-ceramics': { x: 0, y: 3.0, z: 152.0 },
      'gallery-market-economy': { x: 0, y: 3.0, z: roomFourSpatial.spawnWorldZ },
      'gallery-paintings': { x: 0, y: 3.0, z: 106.0 },
    };

    if (requestedRoom && directRoomSpawns[requestedRoom]) {
      setCurrentRoom(requestedRoom);
      setTeleportTarget(directRoomSpawns[requestedRoom]);
    }

    setEntered(true);
  };

  const isRoomFourPresentation = currentRoom === 'gallery-market-economy';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f4f0e7] flex flex-col">
      {/* ═══ LỚP CANVAS 3D TOÀN MÀN HÌNH ═══ */}
      <div className="absolute inset-0 z-0">
        {entered && nickname ? (
          <div className="w-full h-full">
            <Canvas
              shadows={false}
              dpr={settings.preset === 'ultra-low' ? [0.3, 0.5] : settings.preset === 'low' ? [0.5, 1.0] : [0.5, 1.25]}
              gl={{ antialias: settings.preset === 'medium', powerPreference: 'high-performance' }}
              camera={{ position: [0, 3, -2], fov: 65 }}
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <color attach="background" args={[isRoomFourPresentation ? '#14141a' : '#ece5d8']} />
              <fog
                attach="fog"
                args={isRoomFourPresentation
                  ? ['#14141a', 15, 60]
                  : ['#ece5d8', settings.preset === 'ultra-low' ? 10 : settings.preset === 'low' ? 20 : 30, settings.preset === 'ultra-low' ? 60 : settings.preset === 'low' ? 80 : 120]}
              />
              {isRoomFourPresentation && <RoomFourReferenceLightRig />}

              <Suspense fallback={null}>
                {/* Sảnh bảo tàng - Chỉ render khi người chơi đang ở Sảnh để tối ưu hóa hiệu năng vẽ */}
                {currentRoom === 'lobby' && <MuseumLobby />}

                {/* Nhân vật người chơi với các prop tương tác chuyển phòng */}
                <LobbyPlayer
                  onActiveDoorChange={setActiveDoorInfo}
                  activeDoor={activeDoorInfo}
                  activeDoorRef={activeDoorInfoRef}
                  transitionLoading={transitionLoading}
                  onTransitionLoadingChange={setTransitionLoading}
                  onTransitionRoomChange={(roomId, fallbackName) => {
                    setTransitionRoomId(roomId || null);
                    setTransitionRoomName(fallbackName);
                  }}
                />

                {/* Multiplayer avatars */}
                <MultiplayerAvatars />
                <CompetitionQuestionStations />

                {/* Bộ precompiler ép GPU tải trước vật liệu */}
                <RoomPrecompiler />

                {/* ═══ CỬA NỐI PHÒNG (Door Portals) - Chỉ render cửa thuộc phòng hiện tại ═══ */}
                {DOOR_CONFIGS.filter(config => {
                  if (config.doorId === 'door-room1') return currentRoom === 'lobby' || currentRoom === 'gallery-subsidy';
                  if (config.doorId === 'door-room2') return currentRoom === 'gallery-subsidy' || currentRoom === 'gallery-three';
                  if (config.doorId === 'door-room3') return currentRoom === 'gallery-three' || currentRoom === 'gallery-ceramics';
                  if (config.doorId === 'door-room4') return currentRoom === 'gallery-ceramics' || currentRoom === 'gallery-market-economy';
                  if (config.doorId === 'door-room5') return currentRoom === 'gallery-market-economy' || currentRoom === 'gallery-paintings';
                  return false;
                }).map((config) => (
                  <DoorPortal
                    key={config.doorId}
                    doorId={config.doorId}
                    position={config.position}
                    rotation={config.rotation}
                    isOpen={doorStates[config.doorId]?.isOpen || false}
                    label={config.label}
                  />
                ))}

                {/* ═══ PHÒNG TRIỂN LÃM ĐỘNG (Dynamic Rooms) - Chỉ mount phòng sau khi đã chuyển vào ═══ */}
                {loadedRooms.map((room) => {
                  const offset = ROOM_OFFSETS[room.galleryId];
                  if (!offset) return null;

                  const isCurrentRoom = currentRoom === room.galleryId;
                  if (!isCurrentRoom) return null;

                  return (
                    <DynamicRoom
                      key={room.galleryId}
                      room={room}
                      offsetZ={offset.z}
                      offsetY={offset.y}
                      isVisible={true}
                      isInteractive={isCurrentRoom}
                    />
                  );
                })}
              </Suspense>

              <LobbyCameraController />
            </Canvas>
          </div>
        ) : (
          <div className="w-full h-full bg-[#f4f0e7] flex items-center justify-center" />
        )}
      </div>

      {/* ═══ HEADER OVERLAY ═══ */}
      {entered && nickname && (
        <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent p-4 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => {
                setNickname('');
                setEntered(false);
                router.push('/');
              }}
              className="flex items-center gap-2 bg-white/90 hover:bg-stone-100 border border-stone-300 text-stone-700 hover:text-stone-900 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
            >
              <ArrowLeft size={14} />
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-stone-50/40 border border-slate-900/50 py-1.5 px-4 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h1 className="text-xs font-bold text-stone-800 tracking-wider uppercase">
                {currentRoom === 'lobby'
                  ? (language === 'vi' ? 'Sảnh Bảo Tàng' : 'Museum Lobby')
                  : (language === 'vi' ? 'Phòng Triển Lãm' : 'Exhibition Room')}
              </h1>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-white/90 border border-stone-300 py-2.5 px-4 rounded-xl backdrop-blur-md text-xs font-bold text-amber-400">
                <span>👤</span>
                <span className="max-w-[120px] truncate text-stone-700">{nickname}</span>
              </div>

              {/* Nút Cài đặt Đồ họa */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="bg-white/90 hover:bg-stone-100 border border-stone-300 hover:border-slate-700 text-stone-700 hover:text-stone-900 p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
                title={language === 'vi' ? 'Cấu hình đồ họa' : 'Graphics Settings'}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ═══ CẢNH BÁO TẮT PHÒNG (Room Closing Alert) ═══ */}
      {roomClosingAlert && currentRoom === roomClosingAlert.roomId && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-950/95 border-2 border-red-500/80 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-3 max-w-sm">
            <AlertTriangle size={24} className="text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-sm">
                {language === 'vi' ? '⚠️ PHÒNG SẮP TẮT!' : '⚠️ ROOM CLOSING!'}
              </p>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">
                {language === 'vi'
                  ? `Vui lòng di chuyển ra khỏi phòng! Bạn sẽ bị tự động dịch chuyển trong ${Math.ceil(roomClosingAlert.countdownMs / 1000)} giây...`
                  : `Please leave this room! You will be automatically teleported in ${Math.ceil(roomClosingAlert.countdownMs / 1000)} seconds...`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HƯỚNG DẪN TƯƠNG TÁC DƯỚI CÙNG ═══ */}
      {entered && nickname && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md text-stone-900 text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
          <span>🏃 <b>W-A-S-D</b> di chuyển</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🖱️ <b>Nhấn giữ &amp; Rê chuột</b> xoay camera</span>
          <div className="w-px h-3 bg-white/20" />
          <span>
            {currentRoom === 'gallery-market-economy' ? (
              language === 'vi' ? <>🧭 <b>Đi theo đường sáng</b> qua tám trạm</> : <>🧭 <b>Follow the light path</b> through eight stations</>
            ) : (
              language === 'vi' ? <>🚪 <b>Đi qua cửa mở</b> → vào phòng triển lãm</> : <>🚪 <b>Use an open door</b> to enter the next gallery</>
            )}
          </span>
        </div>
      )}

      {/* ═══ MÀN HÌNH ĐĂNG KÝ BIỆT DANH ═══ */}
      {!entered && (
        <div className="absolute inset-0 z-50 bg-[#f4f0e7]/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-white/95 border border-stone-200 p-5 rounded-3xl max-h-[95dvh] overflow-y-auto shadow-2xl flex flex-col items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-800 rounded-full flex items-center justify-center border border-amber-500/20 relative">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
              <div className="absolute inset-0 rounded-full border border-amber-500/15 animate-ping opacity-30" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] bg-amber-500/15 text-amber-800 border border-amber-500/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Sảnh bảo tàng 3D' : '3D Museum Lobby'}
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-2">
                {language === 'vi' ? 'Bảo tàng Theo Dấu Chân Người' : 'Museum of Economic Evolution'}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                {language === 'vi'
                  ? 'Nhập biệt danh để bước vào sảnh bảo tàng 3D tương tác. Khám phá kiến trúc hoành tráng và tham quan các phòng triển lãm.'
                  : 'Enter your nickname to explore the interactive 3D museum lobby and visit exhibition rooms.'}
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="w-full space-y-4">
              <AvatarSelector value={outfitId} onChange={setOutfitId} />
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Biệt danh của bạn' : 'Your Nickname'}
                </label>
                <input
                  type="text"
                  value={inputNickname}
                  onChange={(e) => setInputNickname(e.target.value)}
                  placeholder={language === 'vi' ? 'Ví dụ: Nhà khám phá...' : 'E.g., Explorer...'}
                  maxLength={20}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-stone-900 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-semibold"
                />
              </div>

              {inputError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">
                  ⚠️ {inputError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-stone-50 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={12} />
                  {language === 'vi' ? 'Quay về' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <span>{language === 'vi' ? 'Bước vào Sảnh' : 'Enter Lobby'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 7. MÀN HÌNH CÀI ĐẶT ĐỒ HỌA (GRAPHICS SETTINGS OVERLAY) */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-auto">
          <div className="w-full max-w-sm bg-stone-50/90 border border-stone-300/80 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 relative z-10 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Settings size={16} className="text-cyan-400" />
                {language === 'vi' ? 'Cài đặt cấu hình' : 'Graphics Settings'}
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-500 hover:text-slate-350 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Presets Selection */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Mức cấu hình đề xuất' : 'Graphics Quality Preset'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['ultra-low', 'low', 'medium'] as const).map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => updatePreset(presetName)}
                      className={`text-[10px] font-black py-2.5 px-1 rounded-xl border transition-all cursor-pointer ${settings.preset === presetName ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10' : 'bg-stone-100 border-stone-300 text-stone-600 hover:border-slate-750'}`}
                    >
                      {presetName === 'ultra-low' && (language === 'vi' ? 'Siêu Thấp' : 'Ultra Low')}
                      {presetName === 'low' && (language === 'vi' ? 'Thấp' : 'Low')}
                      {presetName === 'medium' && (language === 'vi' ? 'Trung Bình' : 'Medium')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Max Visible Players */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
                  {language === 'vi' ? 'Giới hạn số lượng người chơi hiển thị' : 'Visible Players Limit'}
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {([0, 10, 30, 64, 99] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateSettings({ maxAvatars: count })}
                      className={`text-[10px] font-mono font-bold py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer ${
                        settings.maxAvatars === count 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-sm' 
                          : 'bg-stone-100 border-stone-300 text-stone-600 hover:border-slate-750'
                      }`}
                    >
                      {count === 99 ? (language === 'vi' ? 'Tất cả' : 'All') : count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Description Card */}
              <div className="bg-stone-100/50 border border-stone-300/80 p-4 rounded-2xl space-y-3">
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {language === 'vi' ? 'Chi tiết cấu hình' : 'Preset Details'}
                </span>

                <p className="text-[11px] text-stone-700 leading-relaxed min-h-[64px]">
                  {settings.preset === 'ultra-low' && (
                    language === 'vi'
                      ? '⚡ Tối ưu tối đa cho máy yếu. 🔦 Tắt toàn bộ đèn điểm (dùng đèn hướng). 📉 Độ phân giải cực thấp. 🚫 Ẩn tất cả người chơi khác. 🌫️ Sương mù gần hơn để giảm tải GPU.'
                      : '⚡ Maximum optimization for weak devices. 🔦 All point lights disabled (directional only). 📉 Ultra-low resolution. 🚫 Hide all other players. 🌫️ Closer fog for GPU relief.'
                  )}
                  {settings.preset === 'low' && (
                    language === 'vi'
                      ? '♟️ Hiển thị hình quân cờ đơn giản. 🔒 Tắt đổ bóng. 🚶 Tắt vung tay chân. 👥 Chỉ hiện tối đa 10 người. Đảm bảo hoạt động mượt mà tuyệt đối trên mọi máy yếu.'
                      : '♟️ Pawn mesh. 🔒 Shadows Off. 🚶 Animations Off. 👥 Max 10 players visible. Guaranteed absolute smoothness for low-end mobile/PC devices.'
                  )}
                  {settings.preset === 'medium' && (
                    language === 'vi'
                      ? '🚶 Hiển thị hình nhân di chuyển bình thường. ☀️ Bật đổ bóng động sắc nét. 🏃 Bật vung tay chân. 👥 Hiện đầy đủ người chơi. Trải nghiệm đồ họa sống động, mượt mà.'
                      : '🚶 Mannequin mesh. ☀️ Full Dynamic Shadows. 🏃 Limb animations On. 👥 Show all players. Premium and complete 3D interactive experience.'
                  )}
                </p>

                {/* Technical details list */}
                <div className="border-t border-stone-200 pt-2.5 space-y-1.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Bóng đổ (Shadows):' : 'Shadows:'}</span>
                    <span className={settings.shadows ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.shadows ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Cử động nhân vật (Animations):' : 'Limb Animations:'}</span>
                    <span className={settings.animations ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.animations ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Số người tối đa hiển thị (Max CCU):' : 'Max Displayed Users:'}</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {settings.maxAvatars === 99 ? (language === 'vi' ? 'Không giới hạn' : 'Unlimited') : `${settings.maxAvatars}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL CHI TIẾT HIỆN VẬT (Exhibit Modal) ═══ */}
      <ExhibitModal />
      <RoomFiveMissionHud />
      {miniGameOpen && <MiniGameModal />}




      {/* ═══ SỔ NHIỆM VỤ ĐIỀU TRA PHÒNG BAO CẤP ═══ */}
       <InvestigationNotebook />

       <RoomOneSoundtrack />

      {/* ═══ HUD HƯỚNG DẪN NGỒI GHẾ ĐẠI BIỂU ═══ */}
      {sittingPrompt && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-stone-50/95 border-2 border-cyan-500/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase font-mono">
            {sittingPrompt === 'sit' ? (
              language === 'vi' ? 'Ấn F để ngồi' : 'Press F to Sit'
            ) : (
              currentRoom === 'gallery-paintings' ? (
                language === 'vi' ? 'Ấn F để đứng dậy | Ấn E để xem/dừng video' : 'Press F to Stand Up | Press E to play/stop video'
              ) : (
                language === 'vi' ? 'Ấn F để đứng dậy | Giữ chuột phải hoặc Z/C để Zoom' : 'Press F to Stand Up | Hold Right Click or Z/C to Zoom'
              )
            )}
          </span>
        </div>
      )}

      {/* ═══ HUD HƯỚNG DẪN DỊCH CHUYỂN PHÒNG (E) ═══ */}
      {activeDoorInfo && !transitionLoading && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-stone-50/95 border-2 border-amber-500/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase font-mono">
            {language === 'vi' ? (
              <>Ấn <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-xs mx-1">E</span> để {activeDoorInfo.promptVi}</>
            ) : (
              <>Press <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-xs mx-1">E</span> to {activeDoorInfo.promptEn}</>
            )}
          </span>
        </div>
      )}

      {/* ═══ MÀN HÌNH CHỜ CHUYỂN PHÒNG (Transition Loading Overlay) ═══ */}
      {transitionLoading && (
        <div className="absolute inset-0 z-50 bg-[#07070a] flex flex-col items-center justify-center text-center select-none pointer-events-auto">
          {/* Vòng sáng trang trí nền */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none" />

          <div className="flex flex-col items-center gap-6 relative z-10">
            {/* Vòng xoay spinner */}
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin relative">
              <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-ping opacity-30" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Đang chuyển phòng' : 'Transitioning Room'}
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-2">
                {language === 'vi' && transitionRoomId
                  ? TRANSITION_ROOM_TITLES[transitionRoomId] ?? transitionRoomName
                  : transitionRoomName}
              </h2>
              <p className="text-stone-600 text-xs font-semibold italic animate-pulse">
                {language === 'vi'
                  ? 'Đang chuẩn bị không gian triển lãm 3D...'
                  : 'Preparing 3D exhibition space...'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
