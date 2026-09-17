'use client';

import React, { useEffect, useRef, useState, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Exhibit, Gallery } from '@/lib/db';
import { ExhibitionRoom } from '@/components/3d/ExhibitionRoom';
import { ExhibitObject } from '@/components/3d/ExhibitObject';
import { ArrowLeft, Save, Sliders, Move, RotateCw, Maximize, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';

const FreeBuilderCamera: React.FC<{ roomWidth: number; roomLength: number; roomHeight: number; focus?: THREE.Vector3 }> = ({
  roomWidth,
  roomLength,
  roomHeight,
  focus,
}) => {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false, shift: false });
  const yaw = useRef(0);
  const pitch = useRef(-0.16);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const forward = useRef(new THREE.Vector3()).current;
  const right = useRef(new THREE.Vector3()).current;
  const move = useRef(new THREE.Vector3()).current;
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const target = focus ?? new THREE.Vector3(0, Math.min(2.2, roomHeight - 0.8), 0);
    camera.position.set(
      THREE.MathUtils.clamp(target.x, -roomWidth / 2 + 1, roomWidth / 2 - 1),
      Math.min(roomHeight - 0.6, Math.max(1.6, target.y + 0.2)),
      THREE.MathUtils.clamp(target.z + 5.5, -roomLength / 2 + 1, roomLength / 2 - 1)
    );
    camera.rotation.order = 'YXZ';
    camera.lookAt(target);
    pitch.current = camera.rotation.x;
    yaw.current = camera.rotation.y;
  }, [camera, focus, roomHeight, roomLength, roomWidth]);

  useEffect(() => {
    const canvas = gl.domElement;

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;
      if (e.code === 'KeyW') keys.current.w = true;
      else if (e.code === 'KeyA') keys.current.a = true;
      else if (e.code === 'KeyS') keys.current.s = true;
      else if (e.code === 'KeyD') keys.current.d = true;
      else if (e.code === 'KeyQ') keys.current.q = true;
      else if (e.code === 'KeyE') keys.current.e = true;
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.shift = true;
      else return;
      e.preventDefault();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = false;
      else if (e.code === 'KeyA') keys.current.a = false;
      else if (e.code === 'KeyS') keys.current.s = false;
      else if (e.code === 'KeyD') keys.current.d = false;
      else if (e.code === 'KeyQ') keys.current.q = false;
      else if (e.code === 'KeyE') keys.current.e = false;
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.shift = false;
      else return;
      e.preventDefault();
    };

    const resetKeys = () => {
      keys.current = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
      dragging.current = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const insideCanvas = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!insideCanvas) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.003;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.003, -1.35, 1.25);
      camera.rotation.set(pitch.current, yaw.current, 0);
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      canvas.releasePointerCapture?.(e.pointerId);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetKeys);
    document.addEventListener('visibilitychange', resetKeys);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetKeys);
      document.removeEventListener('visibilitychange', resetKeys);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const k = keys.current;
    move.set(0, 0, 0);
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.set(-forward.z, 0, forward.x).normalize();
    if (k.w) move.add(forward);
    if (k.s) move.sub(forward);
    if (k.d) move.add(right);
    if (k.a) move.sub(right);
    if (k.e) move.y += 1;
    if (k.q) move.y -= 1;
    if (move.lengthSq() === 0) return;
    move.normalize().multiplyScalar((k.shift ? 8.5 : 4.2) * delta);
    camera.position.add(move);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -roomWidth / 2 + 0.4, roomWidth / 2 - 0.4);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -roomLength / 2 + 0.4, roomLength / 2 - 0.4);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.1, Math.max(1.4, roomHeight - 0.4));
  });

  return null;
};

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exhibitId = searchParams.get('exhibitId');

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Hàm chọn một exhibit và tự động chọn dây đỏ tương ứng
  const handleSelectExhibit = (exhibit: Exhibit) => {
    setSelectedExhibit(exhibit);
    // Cập nhật giá trị slider
    setPosX(exhibit.coordinate_x);
    setPosY(exhibit.coordinate_y);
    setPosZ(exhibit.coordinate_z);
    setRotX(exhibit.rotation_x);
    setRotY(exhibit.rotation_y);
    setRotZ(exhibit.rotation_z);
    setScaleX(exhibit.scale_x);
    setScaleY(exhibit.scale_y);
    setScaleZ(exhibit.scale_z);

    // Tự động chọn dây đỏ (6 dây tương ứng với tọa độ)
    const { coordinate_x: x, coordinate_z: z } = exhibit;
    if (x < 0) {
      if (z < -8) setSelectedRope(0);
      else if (z < 8) setSelectedRope(1);
      else setSelectedRope(2);
    } else {
      if (z < -8) setSelectedRope(3);
      else if (z < 8) setSelectedRope(4);
      else setSelectedRope(5);
    }
  };

  // Hàm chọn dây đỏ và tự động chọn exhibit tương ứng
  const handleSelectRope = (ropeIndex: number) => {
    setSelectedRope(ropeIndex);
    // Tìm exhibit tương ứng với dây đỏ
    const targetExhibit = exhibits.find(e => {
      const { coordinate_x: x, coordinate_z: z } = e;
      if (ropeIndex === 0) return x < 0 && z < -8;
      if (ropeIndex === 1) return x < 0 && z >= -8 && z < 8;
      if (ropeIndex === 2) return x < 0 && z >= 8;
      if (ropeIndex === 3) return x > 0 && z < -8;
      if (ropeIndex === 4) return x > 0 && z >= -8 && z < 8;
      if (ropeIndex === 5) return x > 0 && z >= 8;
      return false;
    });
    
    if (targetExhibit) {
      handleSelectExhibit(targetExhibit);
    }
  };

  // Tọa độ đang điều chỉnh
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [scaleZ, setScaleZ] = useState(1);

  // Vị trí từng dây đỏ riêng biệt (6 dây: left x3, right x3)
  const ROPE_LABELS = [
    'Trái — đoạn sau (Z ≈ −16)',
    'Trái — đoạn giữa (Z ≈ 0)',
    'Trái — đoạn trước (Z ≈ 16)',
    'Phải — đoạn sau (Z ≈ −16)',
    'Phải — đoạn giữa (Z ≈ 0)',
    'Phải — đoạn trước (Z ≈ 16)',
  ];
  const DEFAULT_ROPES = Array(6).fill(null).map(() => ({ xOffset: 0, zOffset: 0 }));
  type RopeConfig = { xOffset: number; zOffset: number };
  const [ropes, setRopes] = useState<RopeConfig[]>(DEFAULT_ROPES);
  const [selectedRope, setSelectedRope] = useState<number | null>(null);
  const [savingRope, setSavingRope] = useState(false);
  const [ropeMessage, setRopeMessage] = useState('');

  const roomWidthValue = gallery?.room_width ?? 24;
  const roomLengthValue = gallery?.room_length ?? 46;
  const roomHeightValue = gallery?.room_height ?? 6;
  const xLimit = Math.max(12, roomWidthValue / 2 + 1);
  const zLimit = Math.max(22, roomLengthValue / 2 + 1);
  const yLimit = Math.max(8, roomHeightValue + 2);

  useEffect(() => {
    if (!exhibitId) {
      router.push('/admin');
      return;
    }

    setLoading(true);
    // Tải thông tin hiện vật
    fetch('/api/exhibits', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Exhibit[]) => {
        const found = data.find(e => e.id === exhibitId);
        if (found) {
          handleSelectExhibit(found);

          // Tải toàn bộ các hiện vật trong cùng phòng để xem bối cảnh
          return Promise.all([
            fetch(`/api/exhibits?galleryId=${found.gallery_id}`, { cache: 'no-store' }).then(res => res.json()),
            fetch('/api/galleries', { cache: 'no-store' }).then(res => res.json())
          ]).then(([roomExhibits, galleries]: [Exhibit[], Gallery[]]) => {
            setExhibits(roomExhibits);
            const gal = galleries.find(g => g.id === found.gallery_id);
            if (gal) {
              setGallery(gal);
              // Parse rope config từ DB nếu có
              try {
                if (gal.rope_barriers_config) {
                  const parsed = JSON.parse(gal.rope_barriers_config);
                  if (Array.isArray(parsed) && parsed.length === 6) {
                    setRopes(parsed);
                  }
                }
              } catch { /* dùng mặc định */ }
            }
            setLoading(false);
          });
        } else {
          throw new Error('Không tìm thấy hiện vật cần định vị');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Lỗi tải dữ liệu định vị.');
        setLoading(false);
      });
  }, [exhibitId, router]);

  // Cập nhật tọa độ hiện vật được chỉnh sửa trong danh sách để Canvas re-render
  useEffect(() => {
    if (!selectedExhibit) return;

    setExhibits(prev => 
      prev.map(e => e.id === selectedExhibit.id ? {
        ...e,
        coordinate_x: posX,
        coordinate_y: posY,
        coordinate_z: posZ,
        rotation_x: rotX,
        rotation_y: rotY,
        rotation_z: rotZ,
        scale_x: scaleX,
        scale_y: scaleY,
        scale_z: scaleZ
      } : e)
    );
  }, [posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, selectedExhibit]);

  // Lưu tọa độ vào Database JSON (Lưu đồng loạt tất cả các tác phẩm)
  const handleSaveCoordinates = async () => {
    if (!selectedExhibit) return;
    setSaving(true);
    setMessage('');
    setError('');

    // Đảm bảo lấy state mới nhất của tác phẩm đang được chọn hiện tại
    const exhibitsToSave = exhibits.map(e => e.id === selectedExhibit.id ? {
      ...e,
      coordinate_x: posX,
      coordinate_y: posY,
      coordinate_z: posZ,
      rotation_x: rotX,
      rotation_y: rotY,
      rotation_z: rotZ,
      scale_x: scaleX,
      scale_y: scaleY,
      scale_z: scaleZ
    } : e);

    try {
      // Gửi request PATCH tuần tự (sequential) thay vì Promise.all
      // Lý do: Node.js đọc/ghi file JSON đồng thời sẽ bị đè dữ liệu (race condition)
      for (const exhibitData of exhibitsToSave) {
        const res = await fetch(`/api/exhibits/${exhibitData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinate_x: exhibitData.coordinate_x,
            coordinate_y: exhibitData.coordinate_y,
            coordinate_z: exhibitData.coordinate_z,
            rotation_x: exhibitData.rotation_x,
            rotation_y: exhibitData.rotation_y,
            rotation_z: exhibitData.rotation_z,
            scale_x: exhibitData.scale_x,
            scale_y: exhibitData.scale_y,
            scale_z: exhibitData.scale_z
          })
        });
        
        if (!res.ok) {
          throw new Error(`Failed to save ${exhibitData.id}`);
        }
      }

      setMessage('Đã lưu tọa độ không gian cho TOÀN BỘ tác phẩm thành công!');
      // Phóng hiệu ứng pháo hoa chúc mừng nghệ thuật
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      setError('Lỗi khi lưu. Một số tác phẩm có thể chưa được cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  // Lưu vị trí từng dây đỏ vào gallery
  const handleSaveRope = async () => {
    if (!gallery) return;
    setSavingRope(true);
    setRopeMessage('');
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rope_barriers_config: JSON.stringify(ropes),
        })
      });
      if (res.ok) {
        setRopeMessage('Đã lưu vị trí dây đỏ!');
        setTimeout(() => setRopeMessage(''), 3000);
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      }
    } catch { /* silent */ } finally {
      setSavingRope(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang mở không gian thiết kế 3D...</p>
      </div>
    );
  }

  if (error && !selectedExhibit) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl max-w-md shadow-2xl text-center">
          <h2 className="text-lg font-bold mb-2">⚠️ Lỗi mở công cụ</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform"
          >
            Quay về CMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0d] flex text-slate-200 relative select-none">
      
      {/* CỘT TRÁI: INTERACTIVE 3D CANVAS (BÊN TRÁI CHIẾM 3/4 MÀN HÌNH) */}
      <div className="flex-1 h-full relative">
        <Canvas
          shadows
          camera={{ position: [posX, Math.max(1.8, posY), posZ + 5.5], fov: 62 }}
        >
          <color attach="background" args={['#15151c']} />
          <fog attach="fog" args={['#15151c', 10, 34]} />
          
          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#f8fafc', '#4b2a19', 0.8]} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <directionalLight position={[-6, 5, -6]} intensity={0.45} />

          <Suspense fallback={null}>
            {gallery && (
              <ExhibitionRoom
                galleryId={gallery.id}
                exhibits={exhibits}
                customSettings={{
                  rope_barriers_config: JSON.stringify(ropes),
                } as any}
                onRopeClick={handleSelectRope}
              />
            )}
            
            {/* Render các tác phẩm, cái nào được chỉnh sẽ được cập nhật tọa độ động bằng React state */}
            {exhibits.map((exhibit) => (
              <ExhibitObject key={exhibit.id} exhibit={exhibit} onClick={handleSelectExhibit} />
            ))}
          </Suspense>

          <FreeBuilderCamera
            roomWidth={roomWidthValue}
            roomLength={roomLengthValue}
            roomHeight={roomHeightValue}
            focus={new THREE.Vector3(posX, posY, posZ)}
          />
        </Canvas>

        {/* Thông tin phòng trưng bày góc trên trái */}
        <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md flex items-center gap-3">
          <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
            <Sliders size={16} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">3D WYSIWYG Builder</span>
            <span className="text-xs font-bold text-slate-200 block">{gallery?.name}</span>
          </div>
        </div>

        {/* Hướng dẫn di chuyển camera builder */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] py-1 px-3 rounded-full pointer-events-none">
          💡 WASD di chuyển camera | Kéo chuột trái để xoay | Q/E lên xuống | Shift để đi nhanh
        </div>
      </div>

      {/* CỘT PHẢI: SLIDERS & CONTROLS SIDEBAR (CHIẾM 1/4 MÀN HÌNH - Z-INDEX: 20) */}
      <div className="w-[360px] h-full bg-slate-950 border-l border-slate-900 flex flex-col p-6 overflow-y-auto space-y-6 shadow-2xl relative z-10 pointer-events-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            CMS Admin
          </button>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            BUILD MODE
          </span>
        </div>

        {selectedExhibit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={selectedExhibit.thumbnail_url} 
                alt="" 
                className="w-14 h-14 object-cover rounded-xl border border-slate-800 shadow-md"
              />
              <div>
                <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{selectedExhibit.title.vi}</h2>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{selectedExhibit.author.vi}</p>
                <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 mt-1 inline-block">
                  {selectedExhibit.model_3d_url ? 'Điêu Khắc 3D' : 'Tranh Treo Tường'}
                </span>
              </div>
            </div>

            <hr className="border-slate-900" />

            {/* Cảnh báo lưu / lỗi */}
            {message && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* NHÓM SLIDERS VỊ TRÍ (POSITION X, Y, Z) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <Move size={12} />
                Vị trí không gian (XYZ)
              </h3>
              
              {/* X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục X (Trái / Phải)</span>
                  <span className="text-white font-bold">{posX.toFixed(2)}m</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="range" min={-xLimit} max={xLimit} step="0.05"
                    value={posX} onChange={(e) => setPosX(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number" min={-xLimit} max={xLimit} step="0.05"
                    value={posX}
                    onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục Y (Độ Cao)</span>
                  <span className="text-white font-bold">{posY.toFixed(2)}m</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="range" min="0" max={yLimit} step="0.05"
                    value={posY} onChange={(e) => setPosY(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number" min="0" max={yLimit} step="0.05"
                    value={posY}
                    onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Z */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục Z (Sâu / Trước)</span>
                  <span className="text-white font-bold">{posZ.toFixed(2)}m</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="range" min={-zLimit} max={zLimit} step="0.05"
                    value={posZ} onChange={(e) => setPosZ(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number" min={-zLimit} max={zLimit} step="0.05"
                    value={posZ}
                    onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* NHÓM SLIDERS GÓC XOAY (ROTATION X, Y, Z) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCw size={12} />
                Góc xoay vật lý (Rotation)
              </h3>

              {/* Yaw - Rot Y (Góc xoay quan trọng nhất) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Xoay quanh trục đứng (Y - Yaw)</span>
                  <span className="text-white font-bold">{((rotY * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotY} onChange={(e) => setRotY(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Pitch - Rot X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Gập trước sau (X)</span>
                  <span className="text-white font-bold">{((rotX * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotX} onChange={(e) => setRotX(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Roll - Rot Z */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Nghiêng trái phải (Z)</span>
                  <span className="text-white font-bold">{((rotZ * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotZ} onChange={(e) => setRotZ(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* NHÓM SLIDERS TỈ LỆ KÍCH THƯỚC (SCALE X, Y, Z) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Maximize size={12} />
                Tỉ lệ kích thước (Scale)
              </h3>

              {/* Scale X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Độ rộng (X)</span>
                  <span className="text-white font-bold">{scaleX.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="5.0" step="0.05"
                  value={scaleX} onChange={(e) => setScaleX(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Độ cao (Y)</span>
                  <span className="text-white font-bold">{scaleY.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="5.0" step="0.05"
                  value={scaleY} onChange={(e) => setScaleY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {selectedExhibit.model_3d_url && (
                /* Scale Z chỉ hiển thị cho Tượng 3D */
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Độ dày (Z)</span>
                    <span className="text-white font-bold">{scaleZ.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" min="0.2" max="5.0" step="0.05"
                    value={scaleZ} onChange={(e) => setScaleZ(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            <hr className="border-slate-900" />

            <button
              onClick={handleSaveCoordinates}
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600/40 text-slate-950 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Save size={14} />
              {saving ? 'Đang Lưu...' : 'Lưu Tọa Độ Không Gian'}
            </button>
          </div>
        )}

        {/* DÂY ĐỎ NHUNG - ROPE BARRIER */}
        <hr className="border-slate-900" />
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <Minus size={12} />
            Dây Nhung Đỏ (Rope Barrier)
          </h3>

          {ropeMessage && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl text-[10px] font-semibold">
              {ropeMessage}
            </div>
          )}

          {/* Danh sách 6 dây — click chọn */}
          <div className="space-y-1">
            {ROPE_LABELS.map((label, i) => {
              const isSelected = selectedRope === i;
              const rope = ropes[i];
              const hasOffset = rope.xOffset !== 0 || rope.zOffset !== 0;
              return (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectRope(isSelected ? -1 : i)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-rose-500/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      {label}
                    </span>
                    <span className={`font-mono text-[9px] ${hasOffset ? 'text-rose-400' : 'text-slate-600'}`}>
                      {hasOffset ? `X${rope.xOffset >= 0 ? '+' : ''}${rope.xOffset.toFixed(1)} Z${rope.zOffset >= 0 ? '+' : ''}${rope.zOffset.toFixed(1)}` : 'mặc định'}
                    </span>
                  </button>

                  {/* Sliders hiện ra khi được chọn */}
                  {isSelected && (
                    <div className="mt-1 mb-1 ml-3 pl-3 border-l-2 border-rose-500/40 space-y-3 py-2">
                      {/* X Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Trục X (vào / ra tường)</span>
                          <span className="text-white font-bold">
                            {rope.xOffset >= 0 ? '+' : ''}{rope.xOffset.toFixed(2)}m
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="range" min="-4" max="4" step="0.05"
                            value={rope.xOffset}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setRopes(prev => prev.map((r, idx) => idx === i ? { ...r, xOffset: val } : r));
                            }}
                            className="flex-1 accent-rose-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number" min="-4" max="4" step="0.05"
                            value={rope.xOffset}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setRopes(prev => prev.map((r, idx) => idx === i ? { ...r, xOffset: val } : r));
                            }}
                            className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <p className="text-[9px] text-slate-600">Âm = sát tường · Dương = vào giữa phòng</p>
                      </div>

                      {/* Z Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Trục Z (trước / sau)</span>
                          <span className="text-white font-bold">
                            {rope.zOffset >= 0 ? '+' : ''}{rope.zOffset.toFixed(2)}m
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="range" min="-10" max="10" step="0.1"
                            value={rope.zOffset}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setRopes(prev => prev.map((r, idx) => idx === i ? { ...r, zOffset: val } : r));
                            }}
                            className="flex-1 accent-rose-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number" min="-10" max="10" step="0.1"
                            value={rope.zOffset}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setRopes(prev => prev.map((r, idx) => idx === i ? { ...r, zOffset: val } : r));
                            }}
                            className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRopes(prev => prev.map((r, idx) => idx === i ? { xOffset: 0, zOffset: 0 } : r))}
                        className="text-[9px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer underline underline-offset-2"
                      >
                        Reset dây này
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveRope}
            disabled={savingRope || !gallery}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 text-white py-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/10"
          >
            <Save size={14} />
            {savingRope ? 'Đang Lưu...' : 'Lưu Vị Trí Dây Đỏ'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default function CoordinateBuilder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang mở không gian thiết kế 3D...</p>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
