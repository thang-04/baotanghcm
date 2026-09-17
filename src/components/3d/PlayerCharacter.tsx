import { AvatarAppearance } from "./AvatarAppearance";
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";
import {
  isPointInsideRoomFourCollider,
  ROOM_FOUR_PLAYER_COLLISION_MARGIN,
  ROOM_FOUR_SPATIAL,
  ROOM_FOUR_WALL_INSET,
} from "@/lib/roomFourLayout";

export const PlayerCharacter: React.FC = () => {
  const {
    selectedExhibit,
    socket,
    activeGallery,
    nickname,
    outfitId,
    settings,
    miniGameOpen,
    roomFourInteractionOpen,
    roomOneLocked,
    roomOneCompleted
  } = useMuseum();
  const playerRef = useRef<THREE.Group>(null);

  const isPawn = settings.preset === "low";
  const baseY = isPawn ? 0.24 : 0.472; // Phóng to 1.6x (0.15 * 1.6 và 0.295 * 1.6)

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Trạng thái phím điều khiển
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });

  const lastUpdate = useRef(0);
  const lastSent = useRef({ x: Number.NaN, y: Number.NaN, z: Number.NaN, yaw: Number.NaN });
  // Cache vectors for useFrame to prevent GC pauses
  const frontVec = useRef(new THREE.Vector3()).current;
  const rightVec = useRef(new THREE.Vector3()).current;
  const moveDirection = useRef(new THREE.Vector3()).current;

  // Thiết lập vị trí ban đầu (Spawn Point linh hoạt dựa trên phòng người chơi bấm vào)
  useEffect(() => {
    if (playerRef.current) {
      let spawnZ = 12;
      if (activeGallery?.id === "gallery-ceramics") {
        spawnZ = -10;
      } else if (activeGallery?.id === "gallery-market-economy") {
        spawnZ = ROOM_FOUR_SPATIAL.spawnLocalZ;
      }
      playerRef.current.position.set(0, baseY, spawnZ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGallery?.id]);

  // Lắng nghe bàn phím di chuyển
  useEffect(() => {
    const movementKeyMap: Record<string, "w" | "a" | "s" | "d" | "shift"> = {
      KeyW: "w",
      KeyA: "a",
      KeyS: "s",
      KeyD: "d",
      ArrowUp: "w",
      ArrowLeft: "a",
      ArrowDown: "s",
      ArrowRight: "d",
      ShiftLeft: "shift",
      ShiftRight: "shift",
    };

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return (
        tagName === "input" || tagName === "textarea" || el.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keysPressed.current[key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keysPressed.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Kiểm tra va chạm với các vật thể trong phòng — chỉ áp dụng đúng theo galleryId
  const checkCollision = (x: number, z: number): boolean => {
    const galleryId = activeGallery?.id;

    // ── Phòng 1: gallery-paintings ──────────────────────────────────────────
    if (galleryId === "gallery-paintings") {
      // 1. Tường ngăn tại Z = 3.0: Cổng mở X từ -5.0 đến -2.0
      if (z > 2.7 && z < 3.3) {
        if (x < -5.0 || x > -2.0) return true;
      }

      // 2. Vách ngăn phụ tại Z = 13.0
      if (x > -6.3 && x < 6.3 && z > 12.6 && z < 13.4) return true;

      // 3. Ghế băng tại Z = 8.0 và Z = 18.0
      if (x > -2.3 && x < 2.3 && z > 7.3 && z < 8.7) return true;
      if (x > -2.3 && x < 2.3 && z > 17.3 && z < 18.7) return true;
    }

    // ── Phòng 3: gallery-ceramics ──────────────────────────────────────────
    if (galleryId === "gallery-ceramics") {
      // 1. Va chạm với máy chơi game tại X = 8.0, Z = 13.6 (local)
      if (x > 6.6 && x < 9.4 && z > 12.4 && z < 14.5) {
        return true;
      }

      // 2. Va chạm với hàng rào bên trái (X = -13.2)
      if (x < -12.4) {
        if ((z > -10.8 && z < -5.2) || (z > -2.8 && z < 2.8) || (z > 5.2 && z < 10.8)) {
          return true;
        }
      }

      // 3. Va chạm với hàng rào bên phải (X = 13.2)
      if (x > 12.4) {
        if ((z > -10.8 && z < -5.2) || (z > -2.8 && z < 2.8) || (z > 5.2 && z < 10.8)) {
          return true;
        }
      }

      // 4. Va chạm với hàng rào cửa vào trước (Z = -13.2)
      if (z < -12.4) {
        if ((x > -10.8 && x < -5.2) || (x > 5.2 && x < 10.8)) {
          return true;
        }
      }

      // 5. Va chạm với hàng rào phía sau bên trái (Z = 13.2)
      if (z > 12.4) {
        if (x > -10.8 && x < -5.2) {
          return true;
        }
      }

      return false;
    }

    // ── Phòng 4: gallery-market-economy ──────────────────────────────────────
    if (galleryId === "gallery-market-economy") {
      return isPointInsideRoomFourCollider(x, z, ROOM_FOUR_PLAYER_COLLISION_MARGIN);
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (selectedExhibit || !nickname || miniGameOpen || roomFourInteractionOpen || roomOneLocked) return;

    const { w, a, s, d, shift } = keysPressed.current;

    if (w || a || s || d) {
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();

      rightVec.set(-frontVec.z, 0, frontVec.x).normalize();
      moveDirection.set(0, 0, 0);

      if (w) moveDirection.add(frontVec);
      if (s) moveDirection.sub(frontVec);
      if (d) moveDirection.add(rightVec);
      if (a) moveDirection.sub(rightVec);

      moveDirection.normalize();

      const moveSpeed = shift ? 10.0 : 6.0; // Đi bộ (6.0), chạy nhanh khi nhấn shift (10.0)
      const stepX = moveDirection.x * moveSpeed * delta;
      const stepZ = moveDirection.z * moveSpeed * delta;

      const currentPos = playerRef.current.position;
      let nextX = currentPos.x + stepX;
      let nextZ = currentPos.z + stepZ;

      const isRoomFour = activeGallery?.id === "gallery-market-economy";
      const roomFourBoundaryMargin = ROOM_FOUR_WALL_INSET + ROOM_FOUR_PLAYER_COLLISION_MARGIN;
      const limitX = isRoomFour
        ? ROOM_FOUR_SPATIAL.roomWidth / 2 - roomFourBoundaryMargin
        : (activeGallery?.room_width ?? 12) / 2 - 0.6;
      const roomLength = activeGallery?.room_length ?? 30;
      const minZ = isRoomFour
        ? ROOM_FOUR_SPATIAL.localStartZ + roomFourBoundaryMargin
        : -roomLength / 2 + 0.6;
      const maxZ = isRoomFour
        ? ROOM_FOUR_SPATIAL.localEndZ - roomFourBoundaryMargin
        : roomLength / 2 - 0.6;

      nextX = Math.max(-limitX, Math.min(limitX, nextX));
      nextZ = Math.max(minZ, Math.min(maxZ, nextZ));

      if (!checkCollision(nextX, currentPos.z)) {
        currentPos.x = nextX;
      }
      if (!checkCollision(currentPos.x, nextZ)) {
        currentPos.z = nextZ;
      }

      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      const rotationSpeed = 12;
      let diff = targetRotation - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * rotationSpeed * delta;
    }

    const isMoving = w || a || s || d;
    const t = state.clock.getElapsedTime();

    // Chỉ nhún nhảy nhẹ khi di chuyển, đứng yên thì đứng thẳng trên mặt đất (tránh say sóng camera)
    if (isMoving && settings.animations) {
      playerRef.current.position.y = baseY + Math.sin(t * 10) * 0.032; // Phóng to 1.6x nhún nhảy
    } else {
      playerRef.current.position.y = baseY;
    }
    const swingSpeed = shift ? 16 : 11; // Chạy nhanh thì tay chân vung nhanh hơn
    const swingAmp = 0.45;

    if (isMoving && settings.animations) {
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = Math.sin(t * swingSpeed) * swingAmp;
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = -Math.sin(t * swingSpeed) * swingAmp;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          -Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      if (leftLegRef.current)
        leftLegRef.current.rotation.x +=
          (0 - leftLegRef.current.rotation.x) * 0.15;
      if (rightLegRef.current)
        rightLegRef.current.rotation.x +=
          (0 - rightLegRef.current.rotation.x) * 0.15;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x +=
          (0 - leftArmRef.current.rotation.x) * 0.15;
        leftArmRef.current.rotation.z +=
          (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x +=
          (0 - rightArmRef.current.rotation.x) * 0.15;
        rightArmRef.current.rotation.z +=
          (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }

    // Gửi tọa độ qua socket (12.5Hz — tối ưu mượt mà và nhẹ tải cho 65 người)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 80) {
      const sent = lastSent.current;
      const movedEnough =
        Math.abs(playerRef.current.position.x - sent.x) > 0.01 ||
        Math.abs(playerRef.current.position.y - sent.y) > 0.01 ||
        Math.abs(playerRef.current.position.z - sent.z) > 0.01 ||
        Math.abs(playerRef.current.rotation.y - sent.yaw) > 0.01;

      if (movedEnough && socket && socket.connected) {
        socket.emit("move", {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y - baseY, // Gửi tọa độ Y logic (bàn chân chạm đất)
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
        });
        sent.x = playerRef.current.position.x;
        sent.y = playerRef.current.position.y;
        sent.z = playerRef.current.position.z;
        sent.yaw = playerRef.current.rotation.y;
      }
      lastUpdate.current = now;
    }
  });

  return (
    <group ref={playerRef} name="player-character">
      <AvatarAppearance outfitId={outfitId} lowDetail={isPawn} leftArmRef={leftArmRef} rightArmRef={rightArmRef} leftLegRef={leftLegRef} rightLegRef={rightLegRef} />
    </group>
  );
};
export default PlayerCharacter;
