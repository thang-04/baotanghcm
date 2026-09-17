"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";
import { BaseRoom, BaseRoomProps } from "./BaseRoom";
import { Html } from "@react-three/drei";

// ─────────────────────────────────────────────────────────────────────────────
// Ghế đại biểu
// ─────────────────────────────────────────────────────────────────────────────
interface DelegateChairProps {
  localX: number;
  localZ: number;
  localY?: number;
  rotationY?: number;
}

const DelegateChair: React.FC<DelegateChairProps> = ({
  localX,
  localZ,
  localY = 0,
  rotationY = -Math.PI / 2,
}) => {
  return (
    <group position={[localX, localY, localZ]} rotation={[0, rotationY, 0]}>
      {/* Chân ghế kim loại */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Chân đế sao */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Đệm ngồi màu đỏ */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.68, 0.08, 0.6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.65} />
      </mesh>

      {/* Tựa lưng ghế */}
      <mesh position={[0, 0.78, -0.26]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.65, 0.68, 0.08]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.65} />
      </mesh>

      {/* Tay vịn hai bên */}
      {[-0.36, 0.36].map((xSide, i) => (
        <group key={i} position={[xSide, 0.58, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.24, 0.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.06, 0.03, 0.52]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Đèn lồng đỏ kiểu cổ
// ─────────────────────────────────────────────────────────────────────────────
const RedLantern: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => (
  <group position={position}>
    {/* Dây treo */}
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
      <meshStandardMaterial color="#4a2508" />
    </mesh>
    {/* Thân đèn lồng */}
    <mesh position={[0, -0.12, 0]}>
      <sphereGeometry args={[0.14, 10, 10]} />
      <meshStandardMaterial
        color="#cc1010"
        emissive="#ff4400"
        emissiveIntensity={0.5}
        roughness={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
    {/* Vòng vàng trên/dưới */}
    {[-0.05, -0.19].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <torusGeometry args={[0.1, 0.012, 6, 16]} />
        <meshStandardMaterial color="#c89a00" metalness={0.7} />
      </mesh>
    ))}
    {/* Tua đỏ dưới đèn */}
    <mesh position={[0, -0.32, 0]}>
      <cylinderGeometry args={[0.02, 0.005, 0.15, 6]} />
      <meshStandardMaterial color="#cc0000" roughness={0.9} />
    </mesh>
  </group>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOM TWO — Hội nghị thành lập Đảng CSVN, Cửu Long (Hồng Kông), 3/2/1930
// ─────────────────────────────────────────────────────────────────────────────
export const RoomTwo: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
}) => {
  const {
    activeGallery,
    nickname,
    sittingPosition,
    otherUsers,
    roomTwoDocOpen,
  } = useMuseum();

  const ceilingHeight =
    (customSettings?.room_height ?? activeGallery?.room_height ?? 6) + 1;

  const getSittingUserNickname = (chairX: number, chairZ: number) => {
    if (
      sittingPosition &&
      Math.abs(sittingPosition.x - chairX) < 0.1 &&
      Math.abs(sittingPosition.z - chairZ) < 0.1
    ) {
      return nickname;
    }
    const found = otherUsers.find(
      (u) => Math.abs(u.x - chairX) < 0.15 && Math.abs(u.z - chairZ) < 0.15
    );
    return found ? found.nickname : null;
  };

  // ── Slide texture ─────────────────────────────────────────────────────────
  const slideTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Nền đỏ đậm
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(0, 0, 2048, 1280);

      // Viền vàng
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 28;
      ctx.strokeRect(36, 36, 1976, 1208);
      ctx.lineWidth = 6;
      ctx.strokeRect(64, 64, 1920, 1152);

      // Ngôi sao vàng trung tâm trên
      const drawStar = (
        cx: number,
        cy: number,
        r: number,
        color: string
      ) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };
      drawStar(1024, 190, 96, "#FFD700");

      // Tiêu đề chính
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD700";
      ctx.font = 'bold 84px "Segoe UI", Arial, sans-serif';
      ctx.fillText("HỘI NGHỊ THÀNH LẬP", 1024, 390);
      ctx.fillText("ĐẢNG CỘNG SẢN VIỆT NAM", 1024, 500);

      // Đường kẻ vàng
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(160, 556);
      ctx.lineTo(1888, 556);
      ctx.stroke();

      // Thông tin phụ
      ctx.fillStyle = "#FFFDE7";
      ctx.font = '60px "Segoe UI", Arial, sans-serif';
      ctx.fillText("Cửu Long — Hồng Kông, Trung Quốc", 1024, 670);

      ctx.fillStyle = "#FFD700";
      ctx.font = 'bold 72px "Segoe UI", Arial, sans-serif';
      ctx.fillText("03 tháng 02 năm 1930", 1024, 790);

      // Đường kẻ vàng
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, 850);
      ctx.lineTo(1888, 850);
      ctx.stroke();

      // Chủ trì
      ctx.fillStyle = "#FFF9C4";
      ctx.font = '48px "Segoe UI", Arial, sans-serif';
      ctx.fillText("Chủ trì: Nguyễn Ái Quốc (Hồ Chí Minh)", 1024, 950);
      ctx.fillText("Hợp nhất 3 tổ chức Cộng sản Việt Nam", 1024, 1040);

      // Khẩu hiệu
      ctx.fillStyle = "#FF8F00";
      ctx.font = 'bold italic 44px "Segoe UI", Arial, sans-serif';
      ctx.fillText(
        "\"Độc lập — Tự do — Hạnh phúc\"",
        1024,
        1160
      );
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // ── Texture cờ Việt Nam (nền đỏ + ngôi sao vàng 5 cánh chính xác) ────────
  const flagTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Nền đỏ
      ctx.fillStyle = "#DA0000";
      ctx.fillRect(0, 0, 600, 400);

      // Ngôi sao vàng 5 cánh chính xác
      const cx = 300;
      const cy = 200;
      const outerR = 110;
      const innerR = 45;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "#FFFF00";
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Tọa độ X của 5 dãy bàn dọn (xếp từ trái sang phải)
  const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];

  // Vị trí Z của 12 ghế trong mỗi cột bàn
  const frontChairZs = [-14.5, -12.5, -10.5, -8.5, -6.5, -4.5];
  const backChairZs = [4.5, 6.5, 8.5, 10.5, 12.5, 14.5];

  return (
    <BaseRoom
      galleryId={galleryId}
      customSettings={customSettings}
      isVisible={isVisible}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          1. SÀN KHẤU — Bục gỗ phát biểu bên trái phòng
      ═══════════════════════════════════════════════════════════════════ */}
      <group position={[-10.5, 0, 0]}>
        {/* Bục gỗ cao 0.5m chạy dọc */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[3.8, 0.5, 14.0]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.5} />
        </mesh>
        {/* Sàn bục mặt trên */}
        <mesh position={[0, 0.51, 0]}>
          <boxGeometry args={[3.6, 0.04, 13.6]} />
          <meshStandardMaterial color="#5c2d0e" roughness={0.35} />
        </mesh>
        {/* Thảm đỏ trên bục */}
        <mesh position={[0, 0.535, 0]}>
          <boxGeometry args={[3.0, 0.02, 13.2]} />
          <meshStandardMaterial color="#8B0000" roughness={0.9} />
        </mesh>

        {/* Phông vải đỏ phía sau sân khấu */}
        <mesh position={[-2.1, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[14.0, 5.5, 0.06]} />
          <meshStandardMaterial color="#8B0000" roughness={0.9} />
        </mesh>
        {/* Chữ trên phông — dải vải vàng ngang */}
        <mesh position={[-2.05, 4.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[10.0, 0.6, 0.02]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.5} />
        </mesh>
        <mesh position={[-2.05, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[10.0, 0.45, 0.02]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.5} />
        </mesh>

        {/* Cột cờ trái/phải của bục */}
        {[-5.5, 5.5].map((zPos, idx) => (
          <group key={`flag-${idx}`} position={[0.4, 0.5, zPos]}>
            <mesh position={[0, 2.2, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 4.4, 8]} />
              <meshStandardMaterial color="#C8A000" metalness={0.7} />
            </mesh>
            {/* Cờ Việt Nam (nền đỏ + ngôi sao vàng 5 cánh) */}
            <mesh
              position={[0, 4.0, idx === 0 ? -0.65 : 0.65]}
              rotation={[0, idx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.3, 0.85]} />
              <meshBasicMaterial
                map={flagTexture || undefined}
                color={flagTexture ? "#ffffff" : "#DA0000"}
                side={2}
              />
            </mesh>
          </group>
        ))}

        {/* ── BỤC PHÁT BIỂU NHỎ (Podium) tại trung tâm bục ── */}
        <group position={[0.5, 0.5, -1.5]} rotation={[0, Math.PI / 2, 0]}>
          {/* Thân bục */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.7, 1.1, 0.55]} />
            <meshStandardMaterial color="#4a1e08" roughness={0.4} />
          </mesh>
          {/* Mặt bục nghiêng */}
          <mesh position={[0, 1.12, 0.06]} rotation={[Math.PI / 10, 0, 0]}>
            <boxGeometry args={[0.72, 0.06, 0.58]} />
            <meshStandardMaterial color="#2e1005" roughness={0.2} />
          </mesh>
          {/* Micro */}
          <mesh position={[0, 1.28, -0.02]}>
            <cylinderGeometry args={[0.016, 0.016, 0.22, 8]} />
            <meshStandardMaterial color="#111" metalness={0.9} />
          </mesh>
          <mesh position={[0, 1.4, 0.04]} rotation={[-Math.PI / 5, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.022, 0.09, 8]} />
            <meshStandardMaterial color="#222" metalness={0.7} />
          </mesh>
        </group>

        {/* Bàn chủ tọa bên cạnh bục phát biểu */}
        <group position={[0.3, 0.5, 2.0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[3.5, 0.72, 0.7]} />
            <meshStandardMaterial color="#5c2d0e" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.73, 0]}>
            <boxGeometry args={[3.55, 0.04, 0.75]} />
            <meshStandardMaterial color="#3b1a08" roughness={0.3} />
          </mesh>
          {/* Bình hoa trên bàn */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.07, 0.05, 0.3, 10]} />
            <meshStandardMaterial color="#b07020" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#cc2222" roughness={0.8} />
          </mesh>
          {/* Micro trên bàn */}
          {[-1.0, 0, 1.0].map((xm, mi) => (
            <group key={mi} position={[xm, 0.78, -0.18]}>
              <mesh>
                <cylinderGeometry args={[0.018, 0.018, 0.14, 8]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.13, 0.04]} rotation={[-Math.PI / 5, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
                <meshStandardMaterial color="#0f0f0f" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          2. MÀN HÌNH CHIẾU (banner hội nghị) trên tường sau sân khấu
      ═══════════════════════════════════════════════════════════════════ */}
      <group position={[-11.85, 4.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Khung màn hình */}
        <mesh>
          <boxGeometry args={[14.4, 4.8, 0.04]} />
          <meshStandardMaterial color="#2e1005" roughness={0.7} />
        </mesh>
        {/* Banner mặc định; được thay bằng video chỉ trong lúc người chơi xem. */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[13.8, 4.4]} />
          <meshBasicMaterial
            map={slideTexture || undefined}
            color={slideTexture ? "#ffffff" : "#8B0000"}
          />
        </mesh>
        {roomTwoDocOpen && sittingPosition && (
          <>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[13.8, 4.4]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <Html
              transform
              center
              position={[0, 0, 0.07]}
              distanceFactor={3.26}
              className="pointer-events-none select-none"
              zIndexRange={[20, 0]}
            >
              <div
                style={{
                  position: "relative",
                  width: "960px",
                  height: "540px",
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <iframe
                  width="960"
                  height="540"
                  src="https://www.youtube-nocookie.com/embed/7FtGvLISpIk?autoplay=1&controls=0&cc_load_policy=0&iv_load_policy=3&disablekb=1&fs=0&rel=0&playsinline=1"
                  title="Video Hội nghị thành lập Đảng Cộng sản Việt Nam"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    display: "block",
                    border: 0,
                    background: "#000",
                  }}
                />
              </div>
            </Html>
          </>
        )}
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          3. ĐÈN LỒNG ĐỎ treo trên trần
      ═══════════════════════════════════════════════════════════════════ */}
      {[-12, -6, 0, 6, 12].map((z) =>
        [-8, 2].map((x) => (
          <RedLantern
            key={`lantern-${z}-${x}`}
            position={[x, ceilingHeight - 0.3, z]}
          />
        ))
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          4. BẬC THANG BÊ TÔNG HỘI TRƯỜNG (giữ nguyên bản gốc)
      ═══════════════════════════════════════════════════════════════════ */}
      <group>

        {/* BẬ 2 */}
        <mesh position={[-1.8, 0.15, 0]}>
          <boxGeometry args={[3.2, 0.3, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* BẬ 3 */}
        <mesh position={[1.4, 0.3, 0]}>
          <boxGeometry args={[3.2, 0.6, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* BẬ 4 */}
        <mesh position={[4.6, 0.45, 0]}>
          <boxGeometry args={[3.2, 0.9, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* BẬ 5 */}
        <mesh position={[9.1, 0.6, 0]}>
          <boxGeometry args={[5.8, 1.2, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>

      {/* LAN CAN AN TOÀN GIỮ A CÁC BẬC THỀM */}
      <group>
        {[
          { x: -3.4, tierY: 0.0 },
          { x: -0.2, tierY: 0.3 },
          { x: 3.0, tierY: 0.6 },
          { x: 6.2, tierY: 0.9 },
        ].map((rail, rIdx) => (
          <group key={`railing-${rIdx}`} position={[rail.x, rail.tierY, 0]}>
            {[-10.75, 10.75].map((zCenter, sIdx) => (
              <group key={`sec-${sIdx}`} position={[0, 0, zCenter]}>
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[0.02, 0.65, 12.5]} />
                  <meshStandardMaterial color="#0891b2" transparent opacity={0.25} roughness={0.1} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.74, 0]}>
                  <boxGeometry args={[0.06, 0.04, 12.55]} />
                  <meshStandardMaterial color="#2d1708" roughness={0.3} />
                </mesh>
                {[-6.25, -3.125, 0, 3.125, 6.25].map((zPost, pIdx) => (
                  <mesh key={`post-${pIdx}`} position={[0, 0.36, zPost]}>
                    <boxGeometry args={[0.04, 0.72, 0.04]} />
                    <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* LAN CAN BIÊN AN TOÀN 2 ĐẦU */}
      <group>
        {[
          { xCenter: -1.8, width: 3.2, tierY: 0.3 },
          { xCenter: 1.4, width: 3.2, tierY: 0.6 },
          { xCenter: 4.6, width: 3.2, tierY: 0.9 },
          { xCenter: 9.1, width: 5.8, tierY: 1.2 },
        ].map((rail, rIdx) => (
          <group key={`end-rail-${rIdx}`} position={[0, 0, 0]}>
            {[-17.0, 17.0].map((zPos, sIdx) => (
              <group key={`end-sec-${sIdx}`} position={[rail.xCenter, rail.tierY, zPos]}>
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[rail.width, 0.65, 0.02]} />
                  <meshStandardMaterial color="#0891b2" transparent opacity={0.25} roughness={0.1} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.74, 0]}>
                  <boxGeometry args={[rail.width + 0.02, 0.04, 0.06]} />
                  <meshStandardMaterial color="#2d1708" roughness={0.3} />
                </mesh>
                {rail.width > 4.0 ? (
                  [-2.4, 0, 2.4].map((xPost, pIdx) => (
                    <mesh key={`post-${pIdx}`} position={[xPost, 0.36, 0]}>
                      <boxGeometry args={[0.04, 0.72, 0.04]} />
                      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
                    </mesh>
                  ))
                ) : (
                  [-1.2, 1.2].map((xPost, pIdx) => (
                    <mesh key={`post-${pIdx}`} position={[xPost, 0.36, 0]}>
                      <boxGeometry args={[0.04, 0.72, 0.04]} />
                      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
                    </mesh>
                  ))
                )}
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          5. KHU VỰC GHẾNGỔI ĐẠI BIỂU + TERMINAL (bản gốc)
      ═══════════════════════════════════════════════════════════════════ */}
      <group>
        {deskXCoords.map((xCol, colIndex) => {
          const getTierY = (xVal: number) => {
            if (xVal < -3.4) return 0.0;
            if (xVal < -0.2) return 0.3;
            if (xVal < 3.0) return 0.6;
            if (xVal < 6.2) return 0.9;
            return 1.2;
          };
          const tierY = getTierY(xCol);

          return (
            <group key={`col-${colIndex}`}>
              {/* BÀN DÃY TRƯỚC */}
              <group position={[xCol - 1.0, tierY, -9.5]}>
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.7, 11.0]} />
                  <meshStandardMaterial color="#653b1b" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.725, 0]}>
                  <boxGeometry args={[0.56, 0.05, 11.06]} />
                  <meshStandardMaterial color="#3a1e0b" roughness={0.3} />
                </mesh>
                {frontChairZs.map((zChair, idx) => {
                  const chairX = xCol - 0.4;
                  const chairZ = zChair;
                  const sittingName = getSittingUserNickname(chairX, chairZ);
                  return (
                    <group
                      key={`term-front-${idx}`}
                      position={[0.05, 0.75, zChair - -9.5]}
                      rotation={[0, -Math.PI / 2, -Math.PI / 8]}
                    >
                      <mesh position={[0, 0.08, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.04]} />
                        <meshStandardMaterial color="#1e293b" metalness={0.8} />
                      </mesh>
                      <mesh position={[0, 0.08, 0.022]}>
                        <planeGeometry args={[0.26, 0.17]} />
                        <meshStandardMaterial color="#0f172a" emissive={sittingName ? "#22d3ee" : "#334155"} emissiveIntensity={1.2} roughness={0.2} />
                      </mesh>
                      <Html
                        position={[0, 0.082, 0.024]}
                        transform
                        occlude
                        distanceFactor={0.4}
                        className="select-none pointer-events-none"
                      >
                        <div style={{
                          width: '90px', height: '60px', background: '#fffaf0',
                          border: `1px solid ${sittingName ? '#06b6d4' : '#334155'}`,
                          borderRadius: '4px', display: 'flex', flexDirection: 'column',
                          justifyContent: 'space-between', padding: '4px',
                          boxSizing: 'border-box', color: '#164e63',
                          fontFamily: 'monospace', textAlign: 'center'
                        }}>
                          {sittingName ? (
                            <>
                              <div style={{ fontSize: '6px', color: '#0e7490', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                                🎤 ĐẠI BIỂU ĐANG HỌ P
                              </div>
                              <div style={{ fontSize: '8px', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                                {sittingName}
                              </div>
                              <div style={{ fontSize: '5px', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <span style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                KẾT NỐI ONLINE
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '6px', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                                HỆ THỐNG ĐẠI BIỂU
                              </div>
                              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#0369a1', margin: '3px 0' }}>
                                GHẾT RỘNG
                              </div>
                              <div style={{ fontSize: '5px', color: '#64748b' }}>
                                ẤN F ĐỂ NGỒI HỌ P
                              </div>
                            </>
                          )}
                        </div>
                      </Html>
                      <mesh position={[0, 0.01, -0.05]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
                        <meshStandardMaterial color="#334155" />
                      </mesh>
                    </group>
                  );
                })}
              </group>

              {/* BÀN DÃY SAU */}
              <group position={[xCol - 1.0, tierY, 9.5]}>
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.7, 11.0]} />
                  <meshStandardMaterial color="#653b1b" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.725, 0]}>
                  <boxGeometry args={[0.56, 0.05, 11.06]} />
                  <meshStandardMaterial color="#3a1e0b" roughness={0.3} />
                </mesh>
                {backChairZs.map((zChair, idx) => {
                  const chairX = xCol - 0.4;
                  const chairZ = zChair;
                  const sittingName = getSittingUserNickname(chairX, chairZ);
                  return (
                    <group
                      key={`term-back-${idx}`}
                      position={[0.05, 0.75, zChair - 9.5]}
                      rotation={[0, -Math.PI / 2, -Math.PI / 8]}
                    >
                      <mesh position={[0, 0.08, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.04]} />
                        <meshStandardMaterial color="#1e293b" metalness={0.8} />
                      </mesh>
                      <mesh position={[0, 0.08, 0.022]}>
                        <planeGeometry args={[0.26, 0.17]} />
                        <meshStandardMaterial color="#0f172a" emissive={sittingName ? "#22d3ee" : "#334155"} emissiveIntensity={1.2} roughness={0.2} />
                      </mesh>
                      <Html
                        position={[0, 0.082, 0.024]}
                        transform
                        occlude
                        distanceFactor={0.4}
                        className="select-none pointer-events-none"
                      >
                        <div style={{
                          width: '90px', height: '60px', background: '#fffaf0',
                          border: `1px solid ${sittingName ? '#06b6d4' : '#334155'}`,
                          borderRadius: '4px', display: 'flex', flexDirection: 'column',
                          justifyContent: 'space-between', padding: '4px',
                          boxSizing: 'border-box', color: '#164e63',
                          fontFamily: 'monospace', textAlign: 'center'
                        }}>
                          {sittingName ? (
                            <>
                              <div style={{ fontSize: '6px', color: '#0e7490', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                                🎤 ĐẠI BIỂU ĐANG HỌ P
                              </div>
                              <div style={{ fontSize: '8px', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                                {sittingName}
                              </div>
                              <div style={{ fontSize: '5px', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <span style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                KẾT NỐI ONLINE
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '6px', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                                HỆ THỐNG ĐẠI BIỂU
                              </div>
                              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#0369a1', margin: '3px 0' }}>
                                GHẾT RỘNG
                              </div>
                              <div style={{ fontSize: '5px', color: '#64748b' }}>
                                ẤN F ĐỂ NGỒI HỌ P
                              </div>
                            </>
                          )}
                        </div>
                      </Html>
                      <mesh position={[0, 0.01, -0.05]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
                        <meshStandardMaterial color="#334155" />
                      </mesh>
                    </group>
                  );
                })}
              </group>

              {/* GHẾ ĐẠI BIỂU */}
              {frontChairZs.map((zChair, idx) => (
                <DelegateChair
                  key={`chair-front-${idx}`}
                  localX={xCol - 0.4}
                  localY={tierY}
                  localZ={zChair}
                  rotationY={-Math.PI / 2}
                />
              ))}
              {backChairZs.map((zChair, idx) => (
                <DelegateChair
                  key={`chair-back-${idx}`}
                  localX={xCol - 0.4}
                  localY={tierY}
                  localZ={zChair}
                  rotationY={-Math.PI / 2}
                />
              ))}
            </group>
          );
        })}
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          6. TRANG TRÍ CỘT TRỤ GỘ + BĂNG RÔN
      ═══════════════════════════════════════════════════════════════════ */}
      {[-14, -7, 0, 7, 14].map((z) =>
        [13.5].map((x) => (
          <group key={`pillar-${z}-${x}`} position={[x, 0, z]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.28, 0.32, 5.0, 10]} />
              <meshStandardMaterial color="#5c2d0e" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.7, 0.24, 0.7]} />
              <meshStandardMaterial color="#3b1a08" roughness={0.6} />
            </mesh>
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[0.72, 0.2, 0.72]} />
              <meshStandardMaterial color="#3b1a08" roughness={0.6} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.12, 10]} />
              <meshStandardMaterial color="#8B0000" roughness={0.7} />
            </mesh>
          </group>
        ))
      )}
      {/* Băng rôn đỏ */}
      <mesh position={[13.9, 3.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[28.0, 1.2, 0.04]} />
        <meshStandardMaterial color="#8B0000" roughness={0.8} />
      </mesh>
      {[-0.65, 0.65].map((dy, i) => (
        <mesh key={i} position={[13.85, 3.0 + dy * 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[28.0, 0.06, 0.02]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.4} />
        </mesh>
      ))}
    </BaseRoom>
  );
};

export default RoomTwo;
