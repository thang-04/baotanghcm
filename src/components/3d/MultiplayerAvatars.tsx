import { AvatarAppearance } from "./AvatarAppearance";
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMuseum, MultiplayerUser } from "@/context/MuseumContext";

interface MultiplayerAvatarItemProps {
  user: MultiplayerUser;
}

const MultiplayerAvatarItem: React.FC<MultiplayerAvatarItemProps> = ({
  user,
}) => {
  const { otherUsersPositions, settings } = useMuseum();
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const nameTagRef = useRef<HTMLDivElement>(null);

  const isPawn = settings.preset === 'low';
  const baseY = isPawn ? 0.24 : 0.472; // Phóng to 1.6x (0.15 * 1.6 và 0.295 * 1.6)

  const lastPos = useRef(new THREE.Vector3(user.x, user.y + baseY, user.z));
  const isMoving = useRef(false);
  const targetPos = useRef(new THREE.Vector3(user.x, user.y + baseY, user.z));
  const targetYaw = useRef(user.yaw);

  const headRef = useRef<THREE.Group>(null);
  const targetHeadYaw = useRef(user.headYaw || 0);

  useEffect(() => {
    targetPos.current.set(user.x, user.y + baseY, user.z);
    targetYaw.current = user.yaw;
    targetHeadYaw.current = user.headYaw || 0;
  }, [user.x, user.y, user.z, user.yaw, user.headYaw, baseY]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(user.x, user.y + baseY, user.z);
      groupRef.current.rotation.set(0, user.yaw, 0);
    }
  }, [baseY]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Đọc dữ liệu tọa độ thời gian thực trực tiếp từ ref
    const realTimeData = otherUsersPositions.current[user.id];
    if (realTimeData) {
      targetPos.current.set(realTimeData.x, realTimeData.y + baseY, realTimeData.z);
      targetYaw.current = realTimeData.yaw;
      targetHeadYaw.current = realTimeData.headYaw || 0;
    }

    // Giảm từ 12 xuống 7 để nội suy vị trí mượt hơn khi tần suất sync qua mạng giảm
    const lf = Math.min(1, 7 * delta);
    groupRef.current.position.lerp(targetPos.current, lf);

    let diff = targetYaw.current - groupRef.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    groupRef.current.rotation.y += diff * lf;

    const isSitting = !!(realTimeData?.isSitting || user.isSitting);

    // Nội suy mượt mà cho xoay ngang của đầu
    if (headRef.current) {
      const targetHY = isSitting ? targetHeadYaw.current : 0;
      let hDiff = targetHY - headRef.current.rotation.y;
      hDiff = Math.atan2(Math.sin(hDiff), Math.cos(hDiff));
      headRef.current.rotation.y += hDiff * lf;
    }

    const dist = groupRef.current.position.distanceTo(lastPos.current);
    isMoving.current = dist > 0.002;
    lastPos.current.copy(groupRef.current.position);

    // Tối ưu hiệu năng: Ẩn nhãn tên của người chơi ở quá xa (15m) để tránh lag reflow trình duyệt
    if (nameTagRef.current) {
      const localPlayer = state.scene.getObjectByName('lobby-player');
      if (localPlayer) {
        const d = groupRef.current.position.distanceTo(localPlayer.position);
        nameTagRef.current.style.visibility = d > 15 ? 'hidden' : 'visible';
      }
    }

    const t = state.clock.getElapsedTime();
    const amp = 0.45,
      spd = 10;



    if (isSitting) {
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
    } else if (isMoving.current && settings.animations) {
      leftLegRef.current &&
        (leftLegRef.current.rotation.x = Math.sin(t * spd) * amp);
      rightLegRef.current &&
        (rightLegRef.current.rotation.x = -Math.sin(t * spd) * amp);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * spd) * amp * 0.75;
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * spd) * amp * 0.75;
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      leftLegRef.current && (leftLegRef.current.rotation.x *= 0.85);
      rightLegRef.current && (rightLegRef.current.rotation.x *= 0.85);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x *= 0.85;
        leftArmRef.current.rotation.z +=
          (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x *= 0.85;
        rightArmRef.current.rotation.z +=
          (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <AvatarAppearance outfitId={user.outfitId} lowDetail={isPawn} headRef={headRef} leftArmRef={leftArmRef} rightArmRef={rightArmRef} leftLegRef={leftLegRef} rightLegRef={rightLegRef} />
      {/* Nhãn tên người chơi */}
      <Html
        position={[0, 1.8, 0]}
        center
        distanceFactor={8}
        className="pointer-events-none select-none"
      >
        <div ref={nameTagRef} className="text-center flex flex-col items-center gap-1">
          {user.status === 'playing-game' && (
            <div className="bg-amber-500/95 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-md animate-pulse">
              🎮 ĐANG CHƠI GAME
            </div>
          )}
          <div className="bg-cyan-500/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap border border-cyan-300">
            {user.nickname}
          </div>
        </div>
      </Html>
    </group>
  );
};

export const MultiplayerAvatars: React.FC = () => {
  const { otherUsers, settings, activeGallery } = useMuseum();
  
  // Lọc hiển thị: chỉ vẽ người chơi trong CÙNG PHÒNG và giới hạn số lượng tối đa hiển thị
  const currentRoomId = activeGallery?.id || 'lobby';
  const visibleUsers = otherUsers
    .filter((u) => u.nickname !== "" && (u.galleryId || "lobby") === currentRoomId)
    .slice(0, settings.maxAvatars);

  return (
    <group>
      {visibleUsers.map((u) => (
        <MultiplayerAvatarItem key={u.id} user={u} />
      ))}
    </group>
  );
};
