import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Exhibit } from "@/lib/db";
import { useMuseum } from "@/context/MuseumContext";

interface ExhibitObjectProps {
  exhibit: Exhibit;
  isVisible?: boolean;
  onClick?: (exhibit: Exhibit) => void;
}

// ═══════════════════════════════════════════════════════════════
// STATIC GEOMETRIES & MATERIALS FOR REUSE (CÁCH B)
// ═══════════════════════════════════════════════════════════════
const pedestalLegGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.72, 12);
const pedestalBaseGeom = new THREE.BoxGeometry(1.25, 0.08, 0.34);
const frameBackGeom = new THREE.BoxGeometry(1.9, 0.72, 0.05);
const canvasBackGeom = new THREE.BoxGeometry(1.74, 0.56, 0.035);
const circleHotspotGeom = new THREE.CircleGeometry(0.075, 28);
const ringHotspotMidGeom = new THREE.RingGeometry(0.095, 0.125, 28);
const ringHotspotOuterGeom = new THREE.RingGeometry(0.13, 0.15, 28);

const torusKnotGeom = new THREE.TorusKnotGeometry(0.4, 0.12, 120, 16);
const octahedronGeom = new THREE.OctahedronGeometry(0.5);
const helixCylinderGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
const helixSphereGeom = new THREE.SphereGeometry(0.08, 16, 16);
const baseRingGeom = new THREE.RingGeometry(0.45, 0.5, 32);

const pedestalLegMat = new THREE.MeshStandardMaterial({
  color: "#15100c",
  roughness: 0.35,
  metalness: 0.72,
});
const pedestalBaseMat = new THREE.MeshStandardMaterial({
  color: "#16100b",
  roughness: 0.42,
  metalness: 0.55,
});
const frameBackMat = new THREE.MeshStandardMaterial({
  color: "#17120d",
  roughness: 0.5,
  metalness: 0.18,
});
const canvasBackMat = new THREE.MeshStandardMaterial({
  color: "#f1e3c7",
  roughness: 0.82,
  metalness: 0.02,
});

const hotspotInnerMat = new THREE.MeshBasicMaterial({
  color: "#ef4444",
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
});
const hotspotMidMat = new THREE.MeshBasicMaterial({
  color: "#f87171",
  transparent: true,
  opacity: 0.32,
  side: THREE.DoubleSide,
});
const hotspotOuterMat = new THREE.MeshBasicMaterial({
  color: "#fecaca",
  transparent: true,
  opacity: 0.16,
  side: THREE.DoubleSide,
});

const torusNormalMat = new THREE.MeshStandardMaterial({
  color: "#c59b27",
  roughness: 0.1,
  metalness: 0.95,
});
const torusHoveredMat = new THREE.MeshStandardMaterial({
  color: "#ffd700",
  roughness: 0.1,
  metalness: 0.95,
});

const octahedronNormalMat = new THREE.MeshStandardMaterial({
  color: "#06b6d4",
  roughness: 0.05,
  metalness: 0.9,
  transparent: true,
  opacity: 0.85,
});
const octahedronHoveredMat = new THREE.MeshStandardMaterial({
  color: "#a5f3fc",
  roughness: 0.05,
  metalness: 0.9,
  transparent: true,
  opacity: 0.85,
});

const helixCylinderMat = new THREE.MeshStandardMaterial({
  color: "#661966",
  metalness: 0.8,
  roughness: 0.2,
});
const helixSphereRedMat = new THREE.MeshStandardMaterial({
  color: "#e11d48",
  roughness: 0.1,
  metalness: 0.5,
});
const helixSphereRedHoveredMat = new THREE.MeshStandardMaterial({
  color: "#fb7185",
  roughness: 0.1,
  metalness: 0.5,
});
const helixSphereBlueMat = new THREE.MeshStandardMaterial({
  color: "#0284c7",
  roughness: 0.1,
  metalness: 0.5,
});
const helixSphereBlueHoveredMat = new THREE.MeshStandardMaterial({
  color: "#38bdf8",
  roughness: 0.1,
  metalness: 0.5,
});

const baseRingNormalMat = new THREE.MeshBasicMaterial({
  color: "#475569",
  side: THREE.DoubleSide,
});
const baseRingHoveredMat = new THREE.MeshBasicMaterial({
  color: "#fff",
  side: THREE.DoubleSide,
});
const baseRingSelectedMat = new THREE.MeshBasicMaterial({
  color: "#d4af37",
  side: THREE.DoubleSide,
});

const ROOM5_FIRST_VOYAGE_IMAGE_URL = "/exhibits/nha-rong-first-voyage.png";
const ROOM5_FIRST_VOYAGE_IMAGE_ASPECT = 335 / 597;
const ROOM5_VAN_BA_PROFILE_IMAGE_URL = "/exhibits/nha-rong-van-ba-profile.png";
const ROOM5_GALLEY_ARCHIVE_IMAGE_URL = "/exhibits/nha-rong-galley-archive.png";
const ROOM5_GALLEY_ARCHIVE_IMAGE_ASPECT = 450 / 260;

// Hàm tự động vẽ tranh thủ công giả lập thời bao cấp khi gặp lỗi CORS tải ảnh từ Unsplash
function createProceduralTexture(title: string, id: string): string {
  if (typeof window === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Phông nền giấy cũ ố vàng cổ xưa
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 360);
  grad.addColorStop(0, "#fdfcf7");
  grad.addColorStop(0.7, "#f4ecd8");
  grad.addColorStop(1, "#dfceab");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Khung viền vẽ tay mỹ thuật
  ctx.strokeStyle = "#5c4033";
  ctx.lineWidth = 14;
  ctx.strokeRect(25, 25, 462, 462);
  ctx.strokeStyle = "#8b5a2b";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 432, 432);

  // 3. Vẽ hình vẽ phác thảo mô phỏng hiện vật dựa trên ID
  ctx.fillStyle = "#2b1a08";
  ctx.strokeStyle = "#2b1a08";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const drawStamp = (x: number, y: number, text: string) => {
    ctx.strokeRect(x - 50, y - 35, 100, 70);
    ctx.font = "10px Courier New";
    ctx.fillText("TEM PHIẾU", x, y - 15);
    ctx.font = "bold 12px Courier New";
    ctx.fillText(text, x, y + 10);
  };

  if (id.includes("coupon")) {
    drawStamp(160, 180, "GAO");
    drawStamp(352, 180, "THIT");
    drawStamp(160, 330, "DUONG");
    drawStamp(352, 330, "VAI");
    ctx.beginPath();
    ctx.moveTo(60, 256);
    ctx.lineTo(452, 256);
    ctx.moveTo(256, 60);
    ctx.lineTo(256, 452);
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (id.includes("ricebook")) {
    ctx.strokeRect(170, 130, 172, 252);
    ctx.beginPath();
    ctx.moveTo(195, 130);
    ctx.lineTo(195, 382);
    ctx.stroke();
    ctx.font = "bold 20px Georgia";
    ctx.fillText("SO GAO", 260, 180);
    ctx.font = "12px Courier New";
    ctx.fillText("HO GIA DINH", 260, 220);
    ctx.fillText("Dinh muc: 13kg", 260, 265);
    ctx.fillText("So: 1042-HN", 260, 310);
  } else if (id.includes("priceboard")) {
    ctx.strokeRect(130, 120, 252, 272);
    ctx.font = "bold 18px Georgia";
    ctx.fillText("BANG GIA MAU DICH", 256, 160);
    ctx.beginPath();
    ctx.moveTo(150, 190);
    ctx.lineTo(362, 190);
    ctx.stroke();
    ctx.font = "13px Courier New";
    ctx.fillText("Gao te: 0.40d/kg", 256, 225);
    ctx.fillText("Thit heo: 2.20d/kg", 256, 265);
    ctx.fillText("Duong cat: 1.80d/kg", 256, 305);
    ctx.fillText("Xe phuong hoang: 80d", 256, 345);
  } else if (id.includes("factory")) {
    ctx.beginPath();
    ctx.moveTo(130, 340);
    ctx.lineTo(130, 220);
    ctx.lineTo(190, 260);
    ctx.lineTo(190, 220);
    ctx.lineTo(250, 260);
    ctx.lineTo(250, 220);
    ctx.lineTo(310, 260);
    ctx.lineTo(310, 340);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(325, 170, 25, 170);
    ctx.font = "bold 16px Georgia";
    ctx.fillText("KE HOACH NHA MAY", 256, 375);
  } else if (id.includes("shop")) {
    ctx.strokeRect(120, 160, 272, 192);
    ctx.strokeRect(145, 220, 95, 132);
    ctx.strokeRect(272, 220, 95, 132);
    ctx.font = "bold 15px Georgia";
    ctx.fillText("MAU DICH QUOC DOANH", 256, 190);
  } else {
    ctx.font = "bold 24px Georgia";
    ctx.fillText("NHAN CHUNG", 256, 210);
    ctx.font = "italic 16px Georgia";
    ctx.fillText("Ky uc bao cap", 256, 250);
    ctx.font = "12px Courier New";
    ctx.fillText("Viet Nam 1976 - 1985", 256, 300);
  }

  return canvas.toDataURL();
}

const PaintingComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setSelectedExhibit: (e: Exhibit | null) => void;
  setExhibitModalMode: (mode: "game" | "info") => void;
  language: "vi" | "en";
  isVisible?: boolean;
  isNear: boolean;
  groupRef: React.RefObject<THREE.Group | null>;
  onClick?: (exhibit: Exhibit) => void;
}> = ({
  exhibit,
  isSelected,
  hovered,
  setSelectedExhibit,
  setExhibitModalMode,
  language,
  isVisible = true,
  isNear,
  groupRef,
  onClick,
}) => {
  const { settings, roomFiveProgress } = useMuseum();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const hotspotRef = useRef<THREE.Group>(null);
  const isRoomFiveFirstVoyage = exhibit.id === "nha-rong-first-voyage";
  const isRoomFiveVanBaProfile = exhibit.id === "nha-rong-latouche-treville";
  const isRoomFiveGalleyMission = exhibit.id === "nha-rong-galley-work";
  const isRoomFiveDeparture = exhibit.id === "nha-rong-departure-1911";
  const roomFiveFragment = isRoomFiveDeparture
    ? "departure"
    : isRoomFiveVanBaProfile
      ? "identity"
      : isRoomFiveGalleyMission
        ? "labour"
        : isRoomFiveFirstVoyage
          ? "voyage"
          : null;
  const roomFiveOrder = ["departure", "identity", "vessel", "labour", "voyage"] as const;
  const nextRoomFiveFragment = roomFiveOrder.find((id) => !roomFiveProgress.fragments.includes(id));
  const roomFiveCompleted = roomFiveFragment ? roomFiveProgress.fragments.includes(roomFiveFragment) : false;
  const frameColor = roomFiveCompleted
    ? "#34d399"
    : roomFiveFragment === nextRoomFiveFragment
      ? "#22d3ee"
      : isSelected ? "#d4af37" : "#100f0d";
  const thumbnailUrl = isRoomFiveFirstVoyage
    ? ROOM5_FIRST_VOYAGE_IMAGE_URL
    : isRoomFiveVanBaProfile
      ? ROOM5_VAN_BA_PROFILE_IMAGE_URL
      : isRoomFiveGalleyMission
        ? ROOM5_GALLEY_ARCHIVE_IMAGE_URL
        : exhibit.thumbnail_url;
  const imagePlaneWidth = isRoomFiveFirstVoyage
    ? exhibit.scale_y * ROOM5_FIRST_VOYAGE_IMAGE_ASPECT
    : isRoomFiveGalleyMission
      ? exhibit.scale_y * ROOM5_GALLEY_ARCHIVE_IMAGE_ASPECT
      : exhibit.scale_x;

  useEffect(() => {
    if (!matRef.current) return;
    if (texture && !textureError) {
      matRef.current.map = texture;
      matRef.current.color.set("#ffffff");
    } else {
      matRef.current.map = null;
      matRef.current.color.set("#1a1a1a");
    }
    matRef.current.needsUpdate = true;
  }, [texture, textureError]);

  useFrame((state) => {
    if (!hotspotRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.18;
    hotspotRef.current.scale.set(pulse, pulse, 1);
  });

  useEffect(() => {
    if (!thumbnailUrl) return;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const fallbackUrl = createProceduralTexture(
      language === "vi" ? exhibit.title.vi : exhibit.title.en,
      exhibit.id,
    );

    loader.load(
      thumbnailUrl,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        setTextureError(false);
        setTexture(t);
      },
      undefined,
      () => {
        if (fallbackUrl) {
          loader.load(
            fallbackUrl,
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              setTextureError(false);
              setTexture(t);
            },
            undefined,
            () => setTextureError(true),
          );
        } else {
          setTextureError(true);
        }
      },
    );
  }, [thumbnailUrl, exhibit.id, exhibit.title.en, exhibit.title.vi, language]);

  return (
    <group>
      <group
        ref={groupRef}
        position={[
          exhibit.coordinate_x,
          exhibit.coordinate_y + 0.35,
          exhibit.coordinate_z,
        ]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        <mesh
          onPointerDown={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else {
              setExhibitModalMode("game");
              setSelectedExhibit(exhibit);
            }
          }}
          onPointerOver={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            // Ở component ngoài, hovered do cha kiểm soát bằng state hoặc prop
          }}
        >
          <boxGeometry
            args={[exhibit.scale_x + 0.2, exhibit.scale_y + 0.2, 0.15]}
          />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        <mesh
          position={[0, 0, 0.08]}
          onPointerDown={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else {
              setExhibitModalMode("game");
              setSelectedExhibit(exhibit);
            }
          }}
        >
          <planeGeometry args={[imagePlaneWidth, exhibit.scale_y]} />
          <meshBasicMaterial
            ref={matRef}
            color="#1a1a1a"
            side={THREE.DoubleSide}
          />
        </mesh>

        <group
          position={[0, -exhibit.scale_y / 2 - 0.55, 0.35]}
          rotation={[-Math.PI / 10, 0, 0]}
          onPointerDown={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else {
              setExhibitModalMode(isRoomFiveDeparture || isRoomFiveVanBaProfile || isRoomFiveGalleyMission || isRoomFiveFirstVoyage ? "game" : "info");
              setSelectedExhibit(exhibit);
            }
          }}
        >
          <mesh position={[0, 0, 0.14]}>
            <planeGeometry args={[2.25, 1.05]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
              colorWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[-0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]} geometry={pedestalLegGeom} material={pedestalLegMat} />
          <mesh position={[0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]} geometry={pedestalLegGeom} material={pedestalLegMat} />
          <mesh position={[0, -0.62, -0.28]} geometry={pedestalBaseGeom} material={pedestalBaseMat} />
          <mesh position={[0, 0, -0.015]} geometry={frameBackGeom} material={frameBackMat} />
          <mesh position={[0, 0, 0.02]} geometry={canvasBackGeom} material={canvasBackMat} />

          {/* Nội dung thông tin trên bảng khi đứng gần */}
          {isNear && (
            <Html
              position={[0, 0.02, 0.03]}
              center
              transform
              occlude
              distanceFactor={2.4}
              className="pointer-events-none select-none text-center font-sans"
            >
              <div className="w-[150px] text-slate-900 flex flex-col items-center gap-0.5 select-none">
                <p className="text-[10px] font-bold truncate leading-tight w-full text-center">
                  {isRoomFiveVanBaProfile
                    ? (language === "vi" ? "Hồ sơ Văn Ba" : "The Văn Ba profile")
                    : (language === "vi" ? exhibit.title.vi : exhibit.title.en)}
                </p>
                <p className="text-[8px] text-slate-600 italic truncate leading-none w-full text-center">
                  {isRoomFiveVanBaProfile
                    ? (language === "vi" ? "Ba ngày trước khi rời bến" : "Three days before departure")
                    : (language === "vi" ? exhibit.author.vi : exhibit.author.en)}
                </p>
                <p className="text-[7px] text-amber-700 font-extrabold uppercase tracking-wide mt-1 animate-pulse">
                  {language === "vi" ? "Nhấp để xem" : "Click to view"}
                </p>
              </div>
            </Html>
          )}

          {/* Vòng tròn hiệu ứng chỉ hiển thị khi ở xa */}
          {!isNear && (
            <group ref={hotspotRef} position={[0, 0.02, 0.065]}>
              <mesh geometry={circleHotspotGeom} material={hotspotInnerMat} />
              <mesh position={[0, 0, 0.005]} scale={[1.55, 1.55, 1]} geometry={ringHotspotMidGeom} material={hotspotMidMat} />
              <mesh position={[0, 0, 0.01]} scale={[2.05, 2.05, 1]} geometry={ringHotspotOuterGeom} material={hotspotOuterMat} />
            </group>
          )}
        </group>
      </group>

      <group
        position={[
          exhibit.coordinate_x,
          exhibit.coordinate_y,
          exhibit.coordinate_z,
        ]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        {!settings.reducedLights && (
          <spotLight
            position={[0, 3, 2]}
            target-position={[0, 0, 0]}
            intensity={isVisible ? (isNear ? 5.0 : 1.2) : 0}
            distance={8}
            angle={Math.PI / 6}
            penumbra={0.5}
          />
        )}
      </group>
    </group>
  );
};

// 2. Tách biệt SculptureComponent ra ngoài
const SculptureComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setSelectedExhibit: (e: Exhibit | null) => void;
  setExhibitModalMode?: (mode: "game" | "info") => void;
  language: "vi" | "en";
  meshRef: React.RefObject<THREE.Group | null>;
  isVisible?: boolean;
  isNear: boolean;
  groupRef: React.RefObject<THREE.Group | null>;
  onClick?: (exhibit: Exhibit) => void;
}> = ({
  exhibit,
  isSelected,
  hovered,
  setSelectedExhibit,
  setExhibitModalMode,
  language,
  meshRef,
  isVisible = true,
  isNear,
  groupRef,
  onClick,
}) => {
  const { settings } = useMuseum();

  const rgbMaterial = React.useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f43f5e"),
      emissive: new THREE.Color("#f43f5e"),
      emissiveIntensity: 3.0,
      toneMapped: false,
    });
  }, []);

  useFrame((state) => {
    if (exhibit.model_3d_url === "procedural-arcade") {
      const hue = (state.clock.getElapsedTime() * 0.25) % 1.0;
      rgbMaterial.color.setHSL(hue, 1.0, 0.5);
      rgbMaterial.emissive.setHSL(hue, 1.0, 0.5);
    }
  });

  return (
    <group>
      {/* Group meshes: luôn hiển thị để người chơi thấy tượng trong phòng */}
      <group
        ref={groupRef}
        position={[
          exhibit.coordinate_x,
          exhibit.coordinate_y,
          exhibit.coordinate_z,
        ]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
        onClick={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          if (onClick) {
            onClick(exhibit);
          } else {
            if (exhibit.id === "vn-back-right") {
              setExhibitModalMode?.("game");
            }
            setSelectedExhibit(exhibit);
          }
        }}
        onPointerOver={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          // Hover do parent kiểm soát hoặc bỏ qua nếu không dùng state
        }}
      >
        <group ref={meshRef}>
          {exhibit.model_3d_url === "procedural-torusknot" && (
            /* Vòng xoắn hoàng kim */
            <mesh
              geometry={torusKnotGeom}
              material={hovered || isSelected ? torusHoveredMat : torusNormalMat}
            />
          )}

          {exhibit.model_3d_url === "procedural-octahedron" && (
            /* Tinh thể đa diện */
            <mesh
              geometry={octahedronGeom}
              material={hovered || isSelected ? octahedronHoveredMat : octahedronNormalMat}
            />
          )}

          {exhibit.model_3d_url === "procedural-helix" && (
            /* Trụ xoắn sinh học ghép từ các sphere */
            <group>
              <mesh geometry={helixCylinderGeom} material={helixCylinderMat} />
              {Array.from({ length: 10 }).map((_, idx) => {
                const angle = (idx / 10) * Math.PI * 4;
                const y = -0.5 + idx / 9;
                const r = 0.35;
                const x1 = Math.sin(angle) * r;
                const z1 = Math.cos(angle) * r;
                const x2 = Math.sin(angle + Math.PI) * r;
                const z2 = Math.cos(angle + Math.PI) * r;

                return (
                  <group key={idx}>
                    <mesh position={[x1, y, z1]} geometry={helixSphereGeom} material={hovered || isSelected ? helixSphereRedHoveredMat : helixSphereRedMat} />
                    <mesh position={[x2, y, z2]} geometry={helixSphereGeom} material={hovered || isSelected ? helixSphereBlueHoveredMat : helixSphereBlueMat} />
                  </group>
                );
              })}
            </group>
          )}

          {exhibit.model_3d_url === "procedural-arcade" && (
            <group position={[0, -0.38, 0]} scale={[2.2, 2.2, 2.2]}>
              {/* Thân tủ máy chính giữa */}
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.86, 0.8, 0.74]} />
                <meshStandardMaterial color="#ec4899" roughness={0.4} />
              </mesh>

              {/* Vách hông TRÁI (Left Side Wing Panel) */}
              <group>
                <mesh position={[-0.44, 0.4, 0]}>
                  <boxGeometry args={[0.03, 0.8, 0.8]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>
                <mesh position={[-0.44, 1.2, -0.1]}>
                  <boxGeometry args={[0.03, 0.8, 0.6]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>
                <mesh position={[-0.44, 1.15, 0.25]}>
                  <boxGeometry args={[0.03, 0.9, 0.12]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>

                {/* Dải đèn Neon viền hông trái (Left Neon Contour) */}
                <mesh position={[-0.46, 0.4, 0.41]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
                </mesh>
                <mesh position={[-0.46, 0.85, 0.31]} rotation={[Math.PI / 6, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.28, 8]} />
                </mesh>
                <mesh position={[-0.46, 1.3, 0.19]} rotation={[-Math.PI / 16, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
                </mesh>
                <mesh position={[-0.46, 1.73, 0.2]} rotation={[Math.PI / 5, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.32, 8]} />
                </mesh>
              </group>

              {/* Vách hông PHẢI (Right Side Wing Panel) */}
              <group>
                <mesh position={[0.44, 0.4, 0]}>
                  <boxGeometry args={[0.03, 0.8, 0.8]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>
                <mesh position={[0.44, 1.2, -0.1]}>
                  <boxGeometry args={[0.03, 0.8, 0.6]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>
                <mesh position={[0.44, 1.15, 0.25]}>
                  <boxGeometry args={[0.03, 0.9, 0.12]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.4} />
                </mesh>

                {/* Dải đèn Neon viền hông phải (Right Neon Contour) */}
                <mesh position={[0.46, 0.4, 0.41]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
                </mesh>
                <mesh position={[0.46, 0.85, 0.31]} rotation={[Math.PI / 6, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.28, 8]} />
                </mesh>
                <mesh position={[0.46, 1.3, 0.19]} rotation={[-Math.PI / 16, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
                </mesh>
                <mesh position={[0.46, 1.73, 0.2]} rotation={[Math.PI / 5, 0, 0]} material={rgbMaterial}>
                  <cylinderGeometry args={[0.01, 0.01, 0.32, 8]} />
                </mesh>
              </group>

              {/* Cửa nhét xu (Coin Door) phía dưới */}
              <group>
                <mesh position={[0, 0.4, 0.38]}>
                  <boxGeometry args={[0.45, 0.42, 0.02]} />
                  <meshStandardMaterial color="#0c0c12" roughness={0.7} metalness={0.9} />
                </mesh>
                {/* 2 Khe phát sáng màu hồng neon khi nhét xu (Coin insert slot lights) */}
                <mesh position={[-0.1, 0.46, 0.395]} material={rgbMaterial}>
                  <boxGeometry args={[0.06, 0.07, 0.018]} />
                </mesh>
                <mesh position={[0.1, 0.46, 0.395]} material={rgbMaterial}>
                  <boxGeometry args={[0.06, 0.07, 0.018]} />
                </mesh>
              </group>

              {/* Bảng điều khiển màu hồng neon phát sáng (Control Panel Board) */}
              <group>
                <mesh position={[0, 0.81, 0.2]} rotation={[-Math.PI / 12, 0, 0]}>
                  <boxGeometry args={[0.86, 0.06, 0.4]} />
                  <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.5} toneMapped={false} />
                </mesh>

                {/* Joystick 1 (Trái - Orange) */}
                <group position={[-0.2, 0.88, 0.25]} rotation={[-Math.PI / 12, 0, 0]}>
                  <mesh>
                    <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
                  </mesh>
                  <mesh position={[0, 0.07, 0]}>
                    <sphereGeometry args={[0.038, 16, 16]} />
                    <meshStandardMaterial color="#f97316" roughness={0.15} />
                  </mesh>
                </group>

                {/* Joystick 2 (Phải - Orange) */}
                <group position={[0.2, 0.88, 0.25]} rotation={[-Math.PI / 12, 0, 0]}>
                  <mesh>
                    <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
                  </mesh>
                  <mesh position={[0, 0.07, 0]}>
                    <sphereGeometry args={[0.038, 16, 16]} />
                    <meshStandardMaterial color="#f97316" roughness={0.15} />
                  </mesh>
                </group>

                {/* Hàng nút bấm Player 1 (Màu vàng/xanh phát sáng) */}
                <group position={[-0.06, 0.84, 0.22]} rotation={[-Math.PI / 12, 0, 0]}>
                  <mesh position={[-0.06, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                  <mesh position={[-0.02, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#cbd5e1" />
                  </mesh>
                  <mesh position={[-0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                  <mesh position={[-0.02, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                </group>

                {/* Hàng nút bấm Player 2 (Màu vàng/xanh phát sáng) */}
                <group position={[0.06, 0.84, 0.22]} rotation={[-Math.PI / 12, 0, 0]}>
                  <mesh position={[0.02, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                  <mesh position={[0.06, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#cbd5e1" />
                  </mesh>
                  <mesh position={[0.02, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                  <mesh position={[0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 8]} />
                    <meshBasicMaterial color="#eab308" />
                  </mesh>
                </group>
              </group>

              {/* Thùng loa và giá đỡ màn hình phía trên */}
              <mesh position={[0, 1.3, -0.16]}>
                <boxGeometry args={[0.86, 0.82, 0.44]} />
                <meshStandardMaterial color="#ec4899" roughness={0.5} />
              </mesh>

              {/* Màn hình Bezel và màn hình phát sáng chính (Neon Bezel & Screen HUD) */}
              <group position={[0, 1.28, 0.18]} rotation={[-Math.PI / 12, 0, 0]}>
                {/* Viền bezel tối */}
                <mesh>
                  <boxGeometry args={[0.82, 0.64, 0.02]} />
                  <meshStandardMaterial color="#07070b" roughness={0.7} />
                </mesh>
                {/* Màn hình chính màu cyan phát sáng (Screen Glass) */}
                <mesh position={[0, 0, 0.015]}>
                  <planeGeometry args={[0.74, 0.48]} />
                  <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.4} toneMapped={false} />
                </mesh>
                {/* Khung HUD 1 (Trò chơi ở giữa - màu hồng sậm) */}
                <mesh position={[0, -0.02, 0.02]}>
                  <planeGeometry args={[0.56, 0.36]} />
                  <meshStandardMaterial color="#db2777" emissive="#db2777" emissiveIntensity={1.0} toneMapped={false} />
                </mesh>
                {/* Dải thông số trên cùng (Cyan neon bar) */}
                <mesh position={[0, 0.17, 0.02]}>
                  <planeGeometry args={[0.66, 0.05]} />
                  <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.6} toneMapped={false} />
                </mesh>
              </group>

              {/* Hộp đèn Bảng hiệu trên cùng (Marquee Box) */}
              <mesh position={[0, 1.76, -0.06]}>
                <boxGeometry args={[0.86, 0.22, 0.44]} />
                <meshStandardMaterial color="#ec4899" />
              </mesh>

              {/* Biển hiệu Arcade phát sáng (Neon Marquee Sign) */}
              <group position={[0, 1.76, 0.22]}>
                <mesh material={rgbMaterial}>
                  <planeGeometry args={[0.82, 0.18]} />
                </mesh>

                {/* Dữ liệu Chữ Neon Cursive viết tay "Arcade" sử dụng HTML + CSS text-shadow */}
                <Html
                  position={[0, 0.01, 0.015]}
                  center
                  transform
                  occlude
                  distanceFactor={0.88}
                  className="pointer-events-none select-none"
                >
                  <div style={{
                    fontFamily: "'Pacifico', cursive",
                    fontSize: '28px',
                    color: '#fffbeb',
                    textShadow: '0 0 4px #ea580c, 0 0 12px #ea580c, 0 0 24px #ea580c',
                    whiteSpace: 'nowrap',
                    transform: 'rotate(-2deg)'
                  }}>
                    <style dangerouslySetInnerHTML={{
                      __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
                  `}} />
                    Arcade
                  </div>
                </Html>
              </group>
            </group>
          )}
        </group>

        {/* Vòng tròn hiệu ứng hào quang phát sáng dưới chân tượng */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.38, 0]}
          geometry={baseRingGeom}
          material={isSelected ? baseRingSelectedMat : hovered ? baseRingHoveredMat : baseRingNormalMat}
        />
      </group>

      {/* Đèn spotlight rọi tượng: luôn trong scene graph để tránh recompilation, chỉ đổi intensity, loại bỏ để tránh lag */}
      <group
        position={[
          exhibit.coordinate_x,
          exhibit.coordinate_y,
          exhibit.coordinate_z,
        ]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        {!settings.reducedLights && (
          <spotLight
            position={[0, 4, 0]}
            target-position={[0, 0, 0]}
            intensity={isVisible ? (isNear ? 5.0 : 1.2) : 0}
            distance={6}
            angle={Math.PI / 6}
            penumbra={0.3}
          />
        )}
      </group>
    </group>
  );
};

export const ExhibitObject: React.FC<ExhibitObjectProps> = ({
  exhibit,
  isVisible = true,
  onClick,
}) => {
  const { selectedExhibit, setSelectedExhibit, setExhibitModalMode, language } =
    useMuseum();
  const hovered = false;
  const meshRef = useRef<THREE.Group>(null);
  const isSelected = selectedExhibit?.id === exhibit.id;

  const groupRef = useRef<THREE.Group>(null);
  const [isNear, setIsNear] = useState(false);
  const worldPos = useRef(new THREE.Vector3()).current;
  const playerPos = useRef(new THREE.Vector3()).current;
  const lastProximityCheck = useRef(0);

  // Xoay các tượng điêu khắc 3D tự động để tạo chuyển động sinh động
  useFrame((state) => {
    if (isVisible && meshRef.current && exhibit.model_3d_url) {
      if (exhibit.model_3d_url !== "procedural-arcade") {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      }
      // Thêm chuyển động nhấp nhô nhẹ cho tượng
      if (exhibit.id === "sculpture-octahedron") {
        meshRef.current.position.y =
          exhibit.coordinate_y +
          Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      }
    }

    // Tính khoảng cách đến nhân vật người chơi để hiển thị nút Xem chi tiết
    const elapsed = state.clock.elapsedTime;
    if (isVisible && groupRef.current && elapsed - lastProximityCheck.current > 0.18) {
      lastProximityCheck.current = elapsed;
      const player =
        state.scene.getObjectByName("player-character") ||
        state.scene.getObjectByName("lobby-player");
      if (player) {
        groupRef.current.getWorldPosition(worldPos);
        player.getWorldPosition(playerPos);
        const near = worldPos.distanceToSquared(playerPos) < 25; // Khoảng cách 5 mét
        if (near !== isNear) {
          setIsNear(near);
        }
      }
    }
  });

  // Thay đổi con trỏ chuột khi hover vào vật thể tương tác
  useEffect(() => {
    document.body.style.cursor =
      hovered && isVisible && isNear ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, isVisible, isNear]);

  if (exhibit.model_3d_url) {
    return (
      <SculptureComponent
        exhibit={exhibit}
        isSelected={isSelected}
        hovered={hovered}
        setSelectedExhibit={setSelectedExhibit}
        setExhibitModalMode={setExhibitModalMode}
        language={language}
        meshRef={meshRef}
        isVisible={isVisible}
        isNear={isNear}
        groupRef={groupRef}
        onClick={onClick}
      />
    );
  } else {
    return (
      <PaintingComponent
        exhibit={exhibit}
        isSelected={isSelected}
        hovered={hovered}
        setSelectedExhibit={setSelectedExhibit}
        setExhibitModalMode={setExhibitModalMode}
        language={language}
        isVisible={isVisible}
        isNear={isNear}
        groupRef={groupRef}
        onClick={onClick}
      />
    );
  }
};
