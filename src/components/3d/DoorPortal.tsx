import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DoorPortal — Cửa gỗ vật lý 3D nối giữa 2 phòng
 * 
 * - Khi đóng: 2 cánh cửa khép kín, chặn va chạm
 * - Khi mở: 2 cánh xoay ra ngoài với animation mượt mà
 * - Ánh sáng vàng phát ra từ khe cửa khi mở
 */

interface DoorPortalProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  doorId: string;
  isOpen: boolean;
  label?: string;
}

// Bảng màu cửa gỗ
const DOOR_WOOD = '#3e2723';
const DOOR_WOOD_DARK = '#2d1a10';
const DOOR_FRAME = '#1a1108';
const GOLD_ACCENT = '#d4af37';
const LIGHT_GLOW = '#ffd54f';

export const DoorPortal: React.FC<DoorPortalProps> = ({
  position,
  rotation = [0, 0, 0],
  doorId,
  isOpen,
  label,
}) => {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Kích thước cửa
  const DOOR_WIDTH = 2.0; // Mỗi cánh rộng 2m
  const DOOR_HEIGHT = 4.0; // Cao 4m
  const FRAME_THICKNESS = 0.3;
  const DOOR_THICKNESS = 0.12;
  const OPENING_ANGLE = Math.PI / 2.2; // ~82 độ

  useFrame((_state, delta) => {
    // Giới hạn delta để tránh lỗi trồi sụt FPS hoặc chuyển tab làm alpha > 1 gây "nổ" góc quay
    const alphaDoor = Math.min(1.0, 4.0 * delta);
    const alphaLight = Math.min(1.0, 3.0 * delta);

    // Animation mở/đóng cánh cửa trái
    if (leftDoorRef.current) {
      const targetAngle = isOpen ? OPENING_ANGLE : 0;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        leftDoorRef.current.rotation.y,
        targetAngle,
        alphaDoor
      );
    }

    // Animation mở/đóng cánh cửa phải
    if (rightDoorRef.current) {
      const targetAngle = isOpen ? -OPENING_ANGLE : 0;
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        rightDoorRef.current.rotation.y,
        targetAngle,
        alphaDoor
      );
    }

    // Animation ánh sáng
    if (lightRef.current) {
      const targetIntensity = isOpen ? 8 : 0;
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        alphaLight
      );
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ═══ KHUNG CỬA (Door Frame) ═══ */}
      {/* Thanh trên */}
      <mesh position={[0, DOOR_HEIGHT + FRAME_THICKNESS / 2, 0]}>
        <boxGeometry args={[DOOR_WIDTH * 2 + FRAME_THICKNESS * 2, FRAME_THICKNESS, FRAME_THICKNESS]} />
        <meshStandardMaterial color={DOOR_FRAME} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Thanh trái */}
      <mesh position={[-(DOOR_WIDTH + FRAME_THICKNESS / 2), DOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[FRAME_THICKNESS, DOOR_HEIGHT, FRAME_THICKNESS]} />
        <meshStandardMaterial color={DOOR_FRAME} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Thanh phải */}
      <mesh position={[DOOR_WIDTH + FRAME_THICKNESS / 2, DOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[FRAME_THICKNESS, DOOR_HEIGHT, FRAME_THICKNESS]} />
        <meshStandardMaterial color={DOOR_FRAME} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Viền vàng trang trí khung */}
      <mesh position={[0, DOOR_HEIGHT + FRAME_THICKNESS / 2, FRAME_THICKNESS / 2 + 0.01]}>
        <boxGeometry args={[DOOR_WIDTH * 2 + FRAME_THICKNESS * 1.5, FRAME_THICKNESS * 0.6, 0.02]} />
        <meshStandardMaterial color={GOLD_ACCENT} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ═══ CÁNH CỬA TRÁI (Left Door Leaf) ═══ */}
      {/* Pivot ở cạnh trái cánh cửa */}
      <group ref={leftDoorRef} position={[-DOOR_WIDTH, 0, 0]}>
        <group position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0]}>
          {/* Thân cửa */}
          <mesh>
            <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS]} />
            <meshStandardMaterial color={DOOR_WOOD} roughness={0.35} metalness={0.05} />
          </mesh>

          {/* Panel trang trí nổi (3 ô dọc) */}
          {[-1.2, 0, 1.2].map((py, idx) => (
            <group key={`panel-l-${idx}`} position={[0, py, DOOR_THICKNESS / 2 + 0.01]}>
              <mesh>
                <boxGeometry args={[DOOR_WIDTH * 0.75, 0.85, 0.015]} />
                <meshStandardMaterial color={GOLD_ACCENT} metalness={0.85} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[DOOR_WIDTH * 0.68, 0.72, 0.02]} />
                <meshStandardMaterial color={DOOR_WOOD_DARK} roughness={0.45} />
              </mesh>
            </group>
          ))}

          {/* Tay nắm cửa trái */}
          <group position={[DOOR_WIDTH / 2 - 0.25, -0.3, DOOR_THICKNESS / 2 + 0.04]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.7, 10]} />
              <meshStandardMaterial color={GOLD_ACCENT} metalness={0.9} roughness={0.1} />
            </mesh>
            {[-0.35, 0.35].map((py) => (
              <mesh key={`handle-l-${py}`} position={[0, py, 0]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial color={GOLD_ACCENT} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ═══ CÁNH CỬA PHẢI (Right Door Leaf) ═══ */}
      {/* Pivot ở cạnh phải cánh cửa */}
      <group ref={rightDoorRef} position={[DOOR_WIDTH, 0, 0]}>
        <group position={[-DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0]}>
          {/* Thân cửa */}
          <mesh>
            <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS]} />
            <meshStandardMaterial color={DOOR_WOOD} roughness={0.35} metalness={0.05} />
          </mesh>

          {/* Panel trang trí nổi (3 ô dọc) */}
          {[-1.2, 0, 1.2].map((py, idx) => (
            <group key={`panel-r-${idx}`} position={[0, py, DOOR_THICKNESS / 2 + 0.01]}>
              <mesh>
                <boxGeometry args={[DOOR_WIDTH * 0.75, 0.85, 0.015]} />
                <meshStandardMaterial color={GOLD_ACCENT} metalness={0.85} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[DOOR_WIDTH * 0.68, 0.72, 0.02]} />
                <meshStandardMaterial color={DOOR_WOOD_DARK} roughness={0.45} />
              </mesh>
            </group>
          ))}

          {/* Tay nắm cửa phải */}
          <group position={[-(DOOR_WIDTH / 2 - 0.25), -0.3, DOOR_THICKNESS / 2 + 0.04]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.7, 10]} />
              <meshStandardMaterial color={GOLD_ACCENT} metalness={0.9} roughness={0.1} />
            </mesh>
            {[-0.35, 0.35].map((py) => (
              <mesh key={`handle-r-${py}`} position={[0, py, 0]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial color={GOLD_ACCENT} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ═══ ÁNH SÁNG TỪ KHE CỬA (Light glow when opening) ═══ */}
      <pointLight
        ref={lightRef}
        position={[0, DOOR_HEIGHT / 2, 0.5]}
        intensity={0}
        distance={10}
        color={LIGHT_GLOW}
      />

      {/* Ánh sáng bên trong nền (luôn có nhẹ nhàng) */}
      <pointLight
        position={[0, DOOR_HEIGHT / 2, -1]}
        intensity={isOpen ? 3 : 0.5}
        distance={8}
        color="#fff3e0"
      />

      {/* ═══ TẤM CỔNG DỊCH CHUYỂN PHÁT SÁNG (Portal Energy Sheet) ═══ */}
      {isOpen && (
        <mesh position={[0, DOOR_HEIGHT / 2, 0]}>
          <planeGeometry args={[DOOR_WIDTH * 2, DOOR_HEIGHT]} />
          <meshStandardMaterial 
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={3.0}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ═══ BIỂN TÊN PHÒNG (Room Label Sign) ═══ */}
      {label && (
        <group position={[0, DOOR_HEIGHT + FRAME_THICKNESS + 0.5, 0]}>
          {/* Nền biển */}
          <mesh>
            <boxGeometry args={[3.5, 0.6, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          {/* Mặt sáng */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[3.3, 0.45]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.4}
              roughness={0.1}
            />
          </mesh>
          {/* Đèn spotlight */}
          <pointLight position={[0, 0.5, 0.3]} intensity={2} distance={4} color={LIGHT_GLOW} />
        </group>
      )}
    </group>
  );
};

export default DoorPortal;
