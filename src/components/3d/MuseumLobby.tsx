import React from 'react';
import * as THREE from 'three';
import { Text, useTexture } from '@react-three/drei';
import { useMuseum } from '@/context/MuseumContext';

const LOBBY_ARTWORK_TEXTURES = [
  '/images/lobby/ho-chi-minh-journey.png',
  '/images/lobby/van-ba-latouche-treville.png',
];
const LOBBY_ARTWORK_WIDTH = 6.88;
const LOBBY_ARTWORK_HEIGHT = 3.88;
const LOBBY_ARTWORK_ASPECT_RATIO = LOBBY_ARTWORK_WIDTH / LOBBY_ARTWORK_HEIGHT;

interface FramedLobbyArtworkProps {
  positionX: number;
  sourceAspectRatio: number;
  texture: THREE.Texture;
}

const FramedLobbyArtwork: React.FC<FramedLobbyArtworkProps> = ({
  positionX,
  sourceAspectRatio,
  texture,
}) => {
  const fittedTexture = React.useMemo(() => {
    const clone = texture.clone();
    clone.wrapS = THREE.ClampToEdgeWrapping;
    clone.wrapT = THREE.ClampToEdgeWrapping;

    // CSS `object-fit: cover` equivalent: crop centrally without stretching.
    if (sourceAspectRatio > LOBBY_ARTWORK_ASPECT_RATIO) {
      const visibleWidth = LOBBY_ARTWORK_ASPECT_RATIO / sourceAspectRatio;
      clone.repeat.set(visibleWidth, 1);
      clone.offset.set((1 - visibleWidth) / 2, 0);
    } else {
      const visibleHeight = sourceAspectRatio / LOBBY_ARTWORK_ASPECT_RATIO;
      clone.repeat.set(1, visibleHeight);
      clone.offset.set(0, (1 - visibleHeight) / 2);
    }

    clone.needsUpdate = true;
    return clone;
  }, [sourceAspectRatio, texture]);

  React.useEffect(() => () => fittedTexture.dispose(), [fittedTexture]);

  return (
    <group position={[positionX, 6.8, 7.82]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <boxGeometry args={[7.2, 4.2, 0.12]} />
        <meshStandardMaterial color="#3b2415" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[LOBBY_ARTWORK_WIDTH, LOBBY_ARTWORK_HEIGHT]} />
        <meshBasicMaterial map={fittedTexture} toneMapped={false} />
      </mesh>

      {/* Raised dark-wood rails make the former lattice openings read as picture frames. */}
      {[-2.05, 2.05].map((y) => (
        <mesh key={`artwork-horizontal-rail-${y}`} position={[0, y, 0.12]}>
          <boxGeometry args={[7.38, 0.18, 0.16]} />
          <meshStandardMaterial color="#24150d" roughness={0.42} metalness={0.08} />
        </mesh>
      ))}
      {[-3.6, 3.6].map((x) => (
        <mesh key={`artwork-vertical-rail-${x}`} position={[x, 0, 0.12]}>
          <boxGeometry args={[0.18, 4.12, 0.16]} />
          <meshStandardMaterial color="#24150d" roughness={0.42} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * MuseumLobby - Không gian Sảnh Bảo tàng 3D
 * Lấy cảm hứng từ Bảo tàng Đà Nẵng
 * 
 * Kích thước: 30m rộng × 20m dài × 12m cao
 * Hệ trục: X [-15, 15], Z [-10, 10], Y [0, 12]
 */
export const MuseumLobby: React.FC = () => {
  const { settings, currentRoom } = useMuseum();
  const [hoChiMinhJourneyTexture, vanBaTexture] = useTexture(LOBBY_ARTWORK_TEXTURES);

  React.useEffect(() => {
    [hoChiMinhJourneyTexture, vanBaTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    });
  }, [hoChiMinhJourneyTexture, vanBaTexture]);

  const isLobbyLightActive = currentRoom === 'lobby' || currentRoom === 'gallery-subsidy';
  const W = 30;   // Chiều rộng (trục X)
  const L = 18;   // Chiều dài rút ngắn thành 18m để không đè lên Room 1 (Z=8)
  const H = 12;   // Chiều cao (trục Y)

  // Bảng màu kiến trúc
  const sandstone      = '#f2ecdf';   // Ivory sandstone walls
  const sandstoneAlt   = '#e3d8c5';   // Pale stone trim
  const sandstoneDark  = '#d5c7ae';   // Warm light ceiling and architectural details
  const woodFloor      = '#e2d4bb';   // Pale oak floor
  const redCarpet      = '#8b1a1a';   // Thảm đỏ đậm
  const glassColor     = '#a8d8ea';   // Kính xanh nhạt
  const metalGray      = '#2a2a2a';   // Kim loại xám
  const creamWhite     = '#fffaf0';   // Kem trắng (cột, ốp)
  const goldAccent     = '#d4af37';   // Vàng trang trí

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════
          1. SÀN NHÀ GỖ SỌC (Wood Strip Floor)
      ═══════════════════════════════════════════════════════════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.0]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={woodFloor} roughness={0.35} metalness={0.1} />
      </mesh>
      <gridHelper
        args={[L, 36, '#3d2817', '#2d1f10']}
        position={[0, 0.008, -1.0]}
      />

      {/* ═══════════════════════════════════════════════════════════════
          2. THẢM ĐỎ TRẢI DỌC TRỤC CHÍNH (Red Carpet)
      ═══════════════════════════════════════════════════════════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -2.5]}>
        <planeGeometry args={[4.5, 13]} />
        <meshStandardMaterial color={redCarpet} roughness={0.92} metalness={0} />
      </mesh>
      {/* Viền vàng hai bên thảm */}
      {[-2.35, 2.35].map((x) => (
        <mesh key={`carpet-trim-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, -2.5]}>
          <planeGeometry args={[0.12, 13]} />
          <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          3. HỆ THỐNG TƯỜNG CHÍNH (Main Walls)
      ═══════════════════════════════════════════════════════════════ */}

      {/* --- Tường sau (Z = 8.0) - Được phân đoạn để tạo ô cửa rỗng cho Door 1 --- */}
      {/* Tường sau bên trái (X: -15 đến -2) */}
      <mesh position={[-8.5, H / 2, 8.0]}>
        <boxGeometry args={[13.0, H, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>
      {/* Tường sau bên phải (X: 2 đến 15) */}
      <mesh position={[8.5, H / 2, 8.0]}>
        <boxGeometry args={[13.0, H, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>
      {/* Tường sau phía dưới cửa (X: -2 đến 2, Y: 0 đến 3.0) */}
      <mesh position={[0, 1.5, 8.12]}>
        <boxGeometry args={[4.0, 3.0, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>
      {/* Tường sau phía trên cửa */}
      <mesh position={[0, 9.5, 8.12]}>
        <boxGeometry args={[4.0, 5.0, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>

      {/* Hai tranh lịch sử lấp đúng hai khung trống ở tường sau. */}
      <FramedLobbyArtwork
        positionX={-9.5}
        texture={hoChiMinhJourneyTexture}
        sourceAspectRatio={1600 / 1125}
      />
      <FramedLobbyArtwork
        positionX={9.5}
        texture={vanBaTexture}
        sourceAspectRatio={510 / 287}
      />

      {/* Biển tiêu đề cố định phía trên lối vào Phòng 1, giữa hai tranh. */}
      <group position={[0, 9.65, 7.68]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[12.2, 1.35, 0.12]} />
          <meshStandardMaterial color="#2d1a10" roughness={0.42} metalness={0.08} />
        </mesh>
        {[-0.55, 0.55].map((y) => (
          <mesh key={`room-one-title-trim-${y}`} position={[0, y, 0.16]}>
            <boxGeometry args={[11.85, 0.07, 0.04]} />
            <meshStandardMaterial color={goldAccent} metalness={0.88} roughness={0.14} />
          </mesh>
        ))}
        <Text
          position={[0, 0, 0.17]}
          anchorX="center"
          anchorY="middle"
          color="#ffe6a3"
          fontSize={0.6}
          letterSpacing={0.015}
          maxWidth={11.4}
          textAlign="center"
        >
          BẢO TÀNG THEO DẤU CHÂN NGƯỜI
        </Text>
      </group>

      {/* --- Tường trước (Z = -10) - Tường có cổng vào --- */}
      {/* Phần tường trái */}
      <mesh position={[-10, H / 2, -L / 2]}>
        <boxGeometry args={[10, H, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>
      {/* Phần tường phải */}
      <mesh position={[10, H / 2, -L / 2]}>
        <boxGeometry args={[10, H, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>
      {/* Phần trên cổng vào */}
      <mesh position={[0, H - 2, -L / 2]}>
        <boxGeometry args={[10, 4, 0.3]} />
        <meshStandardMaterial color={sandstone} roughness={0.7} />
      </mesh>

      {/* --- CỬA GỖ LỐI VÀO LỚN (Z = -10) --- */}
      <group position={[0, 0, -L / 2]}>
        {/* Khung cửa gỗ bao quanh - đẩy về phía sảnh để không chồng tường */}
        <mesh position={[0, 4.0, 0.12]}>
          <boxGeometry args={[10.2, 8.1, 0.45]} />
          <meshStandardMaterial color={sandstoneDark} roughness={0.55} />
        </mesh>
        
        {/* Cánh cửa bên trái */}
        <group position={[-2.45, 3.95, 0.1]}>
          {/* Thân cửa chính - đẩy ra phía trước để không chồng khung */}
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[4.8, 7.8, 0.15]} />
            <meshStandardMaterial color="#3e2723" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Các ô panel trang trí nổi (3 ô dọc mỗi cánh) */}
          {[1.6, 3.9, 6.2].map((panelY, idx) => (
            <group key={`door-panel-l-${idx}`} position={[0, panelY - 3.9, 0.08]}>
              {/* Viền vàng nền */}
              <mesh position={[0, 0, 0.005]}>
                <boxGeometry args={[3.9, 1.8, 0.015]} />
                <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.15} />
              </mesh>
              {/* Gỗ lòng trong màu tối hơn */}
              <mesh position={[0, 0, 0.015]}>
                <boxGeometry args={[3.7, 1.6, 0.02]} />
                <meshStandardMaterial color="#2d1a10" roughness={0.45} />
              </mesh>
            </group>
          ))}
          {/* Tay nắm cửa lớn bằng vàng/đồng */}
          <group position={[2.1, -1.3, 0.12]}>
            {/* Thanh tay cầm dọc */}
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
              <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Đầu tròn trang trí */}
            {[-0.5, 0.5].map((py) => (
              <mesh key={`handle-end-l-${py}`} position={[0, py, 0]}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
            {/* Khớp gắn vào cửa */}
            {[-0.4, 0.4].map((py) => (
              <mesh key={`handle-joint-l-${py}`} position={[-0.06, py, -0.06]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
                <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
          </group>
        </group>

        {/* Cánh cửa bên phải */}
        <group position={[2.45, 3.95, 0.1]}>
          {/* Thân cửa chính - đẩy ra phía trước để không chồng khung */}
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[4.8, 7.8, 0.15]} />
            <meshStandardMaterial color="#3e2723" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Các ô panel trang trí nổi (3 ô dọc mỗi cánh) */}
          {[1.6, 3.9, 6.2].map((panelY, idx) => (
            <group key={`door-panel-r-${idx}`} position={[0, panelY - 3.9, 0.08]}>
              {/* Viền vàng nền */}
              <mesh position={[0, 0, 0.005]}>
                <boxGeometry args={[3.9, 1.8, 0.015]} />
                <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.15} />
              </mesh>
              {/* Gỗ lòng trong màu tối hơn */}
              <mesh position={[0, 0, 0.015]}>
                <boxGeometry args={[3.7, 1.6, 0.02]} />
                <meshStandardMaterial color="#2d1a10" roughness={0.45} />
              </mesh>
            </group>
          ))}
          {/* Tay nắm cửa lớn bằng vàng/đồng */}
          <group position={[-2.1, -1.3, 0.12]}>
            {/* Thanh tay cầm dọc */}
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
              <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Đầu tròn trang trí */}
            {[-0.5, 0.5].map((py) => (
              <mesh key={`handle-end-r-${py}`} position={[0, py, 0]}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
            {/* Khớp gắn vào cửa */}
            {[-0.4, 0.4].map((py) => (
              <mesh key={`handle-joint-r-${py}`} position={[0.06, py, -0.06]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
                <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* --- Tường trái (X = -15) - TƯỜNG KÍNH LỚN --- */}
      {/* Khung kính dọc */}
      {[-10.0, -5.5, -1.0, 3.5, 8.0].map((zPos, i) => (
        <mesh key={`glass-vframe-${i}`} position={[-W / 2, H / 2, zPos]}>
          <boxGeometry args={[0.15, H, 0.15]} />
          <meshStandardMaterial color={metalGray} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* Tấm kính */}
      {[-7.75, -3.25, 1.25, 5.75].map((zPos, i) => (
        <mesh key={`glass-panel-${i}`} position={[-W / 2 + 0.05, H / 2, zPos]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.5, H - 0.5]} />
          <meshStandardMaterial
            color={glassColor}
            transparent
            opacity={0.25}
            roughness={0.05}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Khung kính ngang */}
      {[3, 6, 9].map((y) => (
        <mesh key={`glass-hframe-${y}`} position={[-W / 2 + 0.05, y, -1.0]}>
          <boxGeometry args={[0.15, 0.06, L]} />
          <meshStandardMaterial color={metalGray} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* --- Tường phải (X = +15) - Tường đá sa thạch tối --- */}
      <mesh position={[W / 2, H / 2, -1.0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[L, H, 0.3]} />
        <meshStandardMaterial color={sandstoneAlt} roughness={0.75} />
      </mesh>
      {/* Bệ nhô ra (canopy) phía trên quầy lễ tân bên phải */}
      <mesh position={[W / 2 - 1.0, 3.8, -3.0]}>
        <boxGeometry args={[2.0, 0.15, 8.0]} />
        <meshStandardMaterial color={sandstoneDark} roughness={0.4} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          4. CẦU THANG HOÀNH TRÁNG (Grand Staircase)
          10 bậc, mỗi bậc: 8m rộng × 0.3m cao × 0.5m sâu
          Từ Z=2 (Y=0) đến Z=7 (Y=3)
      ═══════════════════════════════════════════════════════════════ */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`stair-step-${i}`}
          position={[0, i * 0.3 + 0.15, 2.0 + i * 0.5 + 0.25]}
        >
          <boxGeometry args={[8.0, 0.3, 0.5]} />
          <meshStandardMaterial color={sandstone} roughness={0.45} metalness={0.05} />
        </mesh>
      ))}
      {/* Thành bậc thang hai bên dốc theo cầu thang (Z = 1.75 đến 8.0) */}
      {[-4.15, 4.15].map((x) => (
        <group key={`stair-wall-group-${x}`}>
          {/* Đoạn 1: Z 1.75 -> 3.0 (tâm 2.375), Y_stair=0.225, H_stone=1.225 */}
          <mesh position={[x, 1.225 / 2, 2.375]}>
            <boxGeometry args={[0.3, 1.225, 1.25]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>
          {/* Đoạn 2: Z 3.0 -> 4.25 (tâm 3.625), Y_stair=0.975, H_stone=1.975 */}
          <mesh position={[x, 1.975 / 2, 3.625]}>
            <boxGeometry args={[0.3, 1.975, 1.25]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>
          {/* Đoạn 3: Z 4.25 -> 5.5 (tâm 4.875), Y_stair=1.725, H_stone=2.725 */}
          <mesh position={[x, 2.725 / 2, 4.875]}>
            <boxGeometry args={[0.3, 2.725, 1.25]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>
          {/* Đoạn 4: Z 5.5 -> 6.75 (tâm 6.125), Y_stair=2.475, H_stone=3.475 */}
          <mesh position={[x, 3.475 / 2, 6.125]}>
            <boxGeometry args={[0.3, 3.475, 1.25]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>
          {/* Đoạn 5: Z 6.75 -> 8.0 (tâm 7.375), Y_stair=2.925, H_stone=3.925 */}
          <mesh position={[x, 3.925 / 2, 7.375]}>
            <boxGeometry args={[0.3, 3.925, 1.25]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>

          {/* Trụ đứng lan can mạ vàng */}
          {[2.0, 3.2, 4.4, 5.6, 6.8, 7.9].map((postZ, idx) => {
            // Xác định postY dựa trên đoạn thành đá
            let postY = 3.925; // Đoạn 5
            if (postZ <= 3.0) postY = 1.225; // Đoạn 1
            else if (postZ <= 4.25) postY = 1.975; // Đoạn 2
            else if (postZ <= 5.5) postY = 2.725; // Đoạn 3
            else if (postZ <= 6.75) postY = 3.475; // Đoạn 4

            // Độ cao tay vịn chéo tại postZ
            const handrailY = 1.9 + ((postZ - 1.75) / 6.25) * 3.0;

            // Chiều cao cột đứng
            const postH = handrailY - postY;
            const postCenterY = postY + postH / 2;

            return (
              <mesh key={`post-${idx}`} position={[x, postCenterY, postZ]}>
                <cylinderGeometry args={[0.02, 0.02, postH, 8]} />
                <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
              </mesh>
            );
          })}

          {/* Thanh tay vịn lan can mạ vàng chạy chéo */}
          <mesh
            position={[x, 1.9 + 3.0 / 2, 1.75 + 6.25 / 2]}
            rotation={[-Math.atan2(3.0, 6.25), 0, 0]}
          >
            <boxGeometry args={[0.06, 0.06, Math.sqrt(6.25 * 6.25 + 3.0 * 3.0)]} />
            <meshStandardMaterial color={goldAccent} metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      ))}
      {/* Thảm đỏ phủ lên cầu thang */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`stair-carpet-${i}`}
          position={[0, i * 0.3 + 0.305, 2.0 + i * 0.5 + 0.25]}
        >
          <boxGeometry args={[3.5, 0.02, 0.48]} />
          <meshStandardMaterial color={redCarpet} roughness={0.9} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          5. SÀN TẦNG 2 - MEZZANINE (Y = 3m, phía sau sảnh)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Khoảng nghỉ (landing platform) ở đỉnh cầu thang (X = -4 đến 4, Z = 7.0 đến 8.0) */}
      <mesh position={[0, 3.0, 7.5]}>
        <boxGeometry args={[8.0, 0.3, 1.0]} />
        <meshStandardMaterial color={sandstoneAlt} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3.16, 7.5]}>
        <planeGeometry args={[8.0, 1.0]} />
        <meshStandardMaterial color={woodFloor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          5b. CỔNG VÀO HOÀNH TRÁNG CHÍNH DIỆN (Grand Entrance Gate)
          Đặt tại Z = 8.0m, ngay đỉnh cầu thang để đi thẳng vào
      ═══════════════════════════════════════════════════════════════ */}
      {/* Trụ đá lớn hai bên cổng để tạo sự uy nghi */}
      {[-2.3, 2.3].map((x) => (
        <group key={`gate-pillar-${x}`}>
          {/* Trụ chính */}
          <mesh position={[x, 5.0, 7.8]}>
            <boxGeometry args={[0.5, 4.0, 0.5]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.5} />
          </mesh>
          {/* Chân cột */}
          <mesh position={[x, 3.25, 7.8]}>
            <boxGeometry args={[0.65, 0.5, 0.65]} />
            <meshStandardMaterial color={sandstoneDark} roughness={0.4} />
          </mesh>
          {/* Đầu cột mạ vàng */}
          <mesh position={[x, 7.1, 7.8]}>
            <boxGeometry args={[0.6, 0.2, 0.6]} />
            <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Mái đón cổng (arch lintel) phía trên cửa */}
      <mesh position={[0, 7.2, 7.8]}>
        <boxGeometry args={[5.2, 0.4, 0.6]} />
        <meshStandardMaterial color={sandstoneDark} roughness={0.5} />
      </mesh>
      {/* Hoa văn viền vàng trên mái đón */}
      <mesh position={[0, 7.2, 8.11]}>
        <planeGeometry args={[4.8, 0.15]} />
        <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          6. QUẦY LỄ TÂN & MÀN HÌNH THÔNG TIN BÊN PHẢI (Reception Desk & Screens)
          Xoay dọc theo trục Z, hướng mặt ra thảm đỏ ở giữa (X-)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Vách tường gỗ/đá backdrop phía sau quầy */}
      <mesh position={[14.8, 2.0, -3.0]}>
        <boxGeometry args={[0.2, 4.0, 8.0]} />
        <meshStandardMaterial color={sandstoneDark} roughness={0.45} />
      </mesh>

      {/* Quầy chính dọc theo Z */}
      <mesh position={[13.5, 0.55, -3.0]}>
        <boxGeometry args={[0.8, 1.1, 7.0]} />
        <meshStandardMaterial color={sandstoneDark} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Mặt quầy vàng ánh kim */}
      <mesh position={[13.5, 1.12, -3.0]}>
        <boxGeometry args={[0.85, 0.04, 7.1]} />
        <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Đế quầy */}
      <mesh position={[13.5, 0.04, -3.0]}>
        <boxGeometry args={[0.9, 0.08, 7.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cột chắn dây (Stanchion posts) - đặt dọc bên trái quầy, chắn phía thảm đỏ */}
      {[-2.0, 0, 2.0].map((offset) => (
        <group key={`stanchion-${offset}`}>
          <mesh position={[12.3, 0.5, -3.0 + offset]}>
            <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
            <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[12.3, 1.0, -3.0 + offset]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[12.3, 0.02, -3.0 + offset]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Màn hình thông tin (Information Screens) - Treo trên backdrop bên phải, hướng ra X- */}
      {Array.from({ length: 4 }).map((_, i) => {
        const screenColors = ['#4fc3f7', '#ffd54f', '#81c784', '#ffab91'];
        const zPos = -5.5 + i * 1.7; // phân bố đều dọc Z
        return (
          <group key={`screen-${i}`}>
            {/* Khung màn hình */}
            <mesh position={[14.6, 2.5, zPos]} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[1.5, 1.0, 0.08]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
            </mesh>
            {/* Màn hình phát sáng */}
            <mesh position={[14.55, 2.5, zPos]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[1.35, 0.85]} />
              <meshStandardMaterial
                color={screenColors[i]}
                emissive={screenColors[i]}
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Màn hình nghiêng trên bàn (kiểu kiosk) - quay nghiêng hướng về phía thảm đỏ X- */}
      {[-1.8, 0, 1.8].map((offset, i) => (
        <group key={`kiosk-${i}`}>
          <mesh position={[13.3, 1.3, -3.0 + offset]} rotation={[0, -Math.PI / 2, -0.5]}>
            <boxGeometry args={[1.0, 0.7, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          <mesh position={[13.28, 1.32, -3.0 + offset]} rotation={[0, -Math.PI / 2, -0.5]}>
            <planeGeometry args={[0.85, 0.55]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#e8f5e9' : '#fff3e0'}
              emissive={i % 2 === 0 ? '#a5d6a7' : '#ffcc80'}
              emissiveIntensity={0.4}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          7. TRẦN TRANG TRÍ LƯỚI (Lattice Ceiling)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Tấm trần chính (bán trong suốt) */}
      <mesh position={[0, H - 0.1, -1.0]}>
        <boxGeometry args={[W, 0.08, L]} />
        <meshStandardMaterial color={sandstoneDark} roughness={0.8} transparent opacity={0.7} />
      </mesh>
      {/* Thanh lưới ngang (chạy dọc X) */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`ceil-bar-x-${i}`} position={[0, H - 0.25, -1.0 - L / 2 + i * (L / 20)]}>
          <boxGeometry args={[W, 0.05, 0.05]} />
          <meshStandardMaterial color={sandstoneDark} roughness={0.6} />
        </mesh>
      ))}
      {/* Thanh lưới dọc (chạy dọc Z) */}
      {Array.from({ length: 31 }).map((_, i) => (
        <mesh key={`ceil-bar-z-${i}`} position={[-W / 2 + i * (W / 30), H - 0.25, -1.0]}>
          <boxGeometry args={[0.05, 0.05, L]} />
          <meshStandardMaterial color={sandstoneDark} roughness={0.6} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          8. CỘT TRANG TRÍ (Decorative Pillars)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Cột bên trái (cạnh tường kính) */}
      {[-7, -2, 3, 8].map((z) => (
        <group key={`pillar-left-${z}`}>
          <mesh position={[-W / 2 + 0.65, H / 2, z]}>
            <boxGeometry args={[0.5, H, 0.5]} />
            <meshStandardMaterial color={creamWhite} roughness={0.55} />
          </mesh>
          {/* Đế cột */}
          <mesh position={[-W / 2 + 0.65, 0.15, z]}>
            <boxGeometry args={[0.65, 0.3, 0.65]} />
            <meshStandardMaterial color={creamWhite} roughness={0.4} />
          </mesh>
          {/* Đầu cột */}
          <mesh position={[-W / 2 + 0.65, H - 0.15, z]}>
            <boxGeometry args={[0.65, 0.3, 0.65]} />
            <meshStandardMaterial color={creamWhite} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Cột bên phải */}
      {[-7, 3, 8].map((z) => (
        <group key={`pillar-right-${z}`}>
          <mesh position={[W / 2 - 0.65, H / 2, z]}>
            <boxGeometry args={[0.5, H, 0.5]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.55} />
          </mesh>
          <mesh position={[W / 2 - 0.65, 0.15, z]}>
            <boxGeometry args={[0.65, 0.3, 0.65]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.4} />
          </mesh>
          <mesh position={[W / 2 - 0.65, H - 0.15, z]}>
            <boxGeometry args={[0.65, 0.3, 0.65]} />
            <meshStandardMaterial color={sandstoneAlt} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          9. BIỂN CHỈ DẪN TẦNG (Floor Level Sign "L1")
      ═══════════════════════════════════════════════════════════════ */}
      <mesh position={[-W / 2 + 0.22, 3.0, -8.0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.6, 0.9, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[-W / 2 + 0.26, 3.0, -8.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 0.7]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          10. NỘI THẤT TRANG TRÍ (Furniture & Decor)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Ghế băng dài bên trái */}
      <group position={[-10, 0, -4]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.0, 0.12, 0.8]} />
          <meshStandardMaterial color="#3e2723" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[3.1, 0.08, 0.85]} />
          <meshStandardMaterial color="#1b110b" roughness={0.3} />
        </mesh>
        {[-1.2, 1.2].map((lx) => (
          <mesh key={`bench-leg-${lx}`} position={[lx, 0.14, 0]}>
            <boxGeometry args={[0.15, 0.28, 0.7]} />
            <meshStandardMaterial color="#1b110b" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Chậu cây trang trí cạnh cầu thang */}
      {[-5.5, 5.5].map((x) => (
        <group key={`plant-${x}`} position={[x, 0, 1.5]}>
          {/* Chậu */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.35, 0.28, 0.7, 12]} />
            <meshStandardMaterial color="#4a3c2a" roughness={0.5} />
          </mesh>
          {/* Đế chậu */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 12]} />
            <meshStandardMaterial color="#2d2015" roughness={0.4} />
          </mesh>
          {/* Cây (hình cầu xanh) */}
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#2e7d32" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
            <meshStandardMaterial color="#5d4037" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          11. HỆ THỐNG CHIẾU SÁNG (Lighting System)
      ═══════════════════════════════════════════════════════════════ */}
      {/* Ánh sáng môi trường ấm */}
      <ambientLight intensity={currentRoom === 'lobby' ? 0.85 : 0} color="#fffaf2" />

      {/* Ánh nắng tự nhiên xuyên qua tường kính bên trái */}
      <directionalLight
        position={[-12, 10, 0]}
        intensity={isLobbyLightActive ? 1.2 : 0}
        color="#fff5e8"
      />

      {/* Ánh sáng từ trên xuống (giếng trời) */}
      <directionalLight position={[0, 12, 0]} intensity={isLobbyLightActive ? (settings.reducedLights ? 1.5 : 0.5) : 0} color="#fff8f0" />

      {/* Hàng đèn spotlight gắn trên trần — giảm số lượng theo preset */}
      {!settings.reducedLights && Array.from({ length: settings.preset === 'low' ? 4 : 10 }).map((_, i) => {
        const x = settings.preset === 'low' ? (-9 + i * 6) : (-13 + i * 3);
        return (
          <group key={`spotlight-${i}`}>
            {/* Thân đèn */}
            <mesh position={[x, H - 0.4, -2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
              <meshStandardMaterial color={metalGray} metalness={0.8} />
            </mesh>
            {/* Bóng đèn */}
            <mesh position={[x, H - 0.48, -2]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
            <pointLight
              position={[x, H - 0.6, -2]}
              intensity={isLobbyLightActive ? (settings.preset === 'low' ? 5.0 : 3.5) : 0}
              distance={settings.preset === 'low' ? 20 : 14}
              color="#fff1e0"
            />
          </group>
        );
      })}

      {/* Hàng đèn spotlight thứ 2 (giữa sảnh) — bỏ hoàn toàn ở low/ultra-low */}
      {settings.preset === 'medium' && Array.from({ length: 8 }).map((_, i) => {
        const x = -10.5 + i * 3;
        return (
          <group key={`spotlight2-${i}`}>
            <mesh position={[x, H - 0.4, 3]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
              <meshStandardMaterial color={metalGray} metalness={0.8} />
            </mesh>
            <mesh position={[x, H - 0.47, 3]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
            <pointLight
              position={[x, H - 0.55, 3]}
              intensity={isLobbyLightActive ? 2.5 : 0}
              distance={12}
              color="#fff1e0"
            />
          </group>
        );
      })}

      {/* Ánh sáng xanh nhạt từ tường kính — bỏ ở ultra-low */}
      {!settings.reducedLights && (
        <>
          <pointLight position={[-14, 6, 0]} intensity={isLobbyLightActive ? 2.5 : 0} distance={22} color="#a8d8ea" />
          <pointLight position={[-14, 3, -5]} intensity={isLobbyLightActive ? 1.5 : 0} distance={15} color="#a8d8ea" />
        </>
      )}

      {/* Ánh sáng ấm khu vực lễ tân — bỏ ở ultra-low */}
      {!settings.reducedLights && (
        <>
          <pointLight position={[10.5, 3.5, -3]} intensity={isLobbyLightActive ? 2.0 : 0} distance={10} color="#ffd54f" />
          <pointLight position={[10.5, 3.5, 0]} intensity={isLobbyLightActive ? 1.5 : 0} distance={8} color="#ffd54f" />
        </>
      )}
    </group>
  );
};

export default MuseumLobby;
