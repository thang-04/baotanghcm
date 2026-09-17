'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Exhibit, Gallery } from '@/lib/db';
import { ExhibitionRoom } from '@/components/3d/ExhibitionRoom';
import { ExhibitObject } from '@/components/3d/ExhibitObject';
import { ArrowLeft, Save, Sliders, Palette, Expand, Layers, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const WALL_PRESETS = [
  { name: 'Đỏ Cổ Điển', value: '#8a1923' },
  { name: 'Xanh Hoàng Gia', value: '#1e3a8a' },
  { name: 'Xanh Rừng Sâu', value: '#14532d' },
  { name: 'Xám Than Lịch Lãm', value: '#1e293b' },
  { name: 'Trắng Kem Cổ Điển', value: '#eae5dc' },
  { name: 'Đen Huyền Bí', value: '#0f0f12' },
];

const WAINSCOTING_PRESETS = [
  { name: 'Trắng Sữa', value: '#eae5dc' },
  { name: 'Trắng Tinh Khôi', value: '#f8fafc' },
  { name: 'Gỗ Óc Chó', value: '#3e2723' },
  { name: 'Đồng Cổ', value: '#856404' },
];

const FLOOR_PRESETS = [
  { name: 'GỗMun Sẫm', value: '#4e3629' },
  { name: 'Đá Cẩm Thạch', value: '#a29587' },
  { name: 'Thảm Đỏ Nhung', value: '#601118' },
  { name: 'Thảm Xanh Rêu', value: '#1e3328' },
];

const FreeMapCamera: React.FC<{ roomWidth: number; roomLength: number; roomHeight: number }> = ({
  roomWidth,
  roomLength,
  roomHeight,
}) => {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false, shift: false });
  const yaw = useRef(0);
  const pitch = useRef(-0.18);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const forward = useRef(new THREE.Vector3()).current;
  const right = useRef(new THREE.Vector3()).current;
  const move = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    camera.position.set(0, Math.min(roomHeight - 0.6, 3.2), Math.min(roomLength / 2 - 3, 9));
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch.current, yaw.current, 0);
  }, [camera, roomHeight, roomLength]);

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
    move.normalize().multiplyScalar((k.shift ? 9 : 4.5) * delta);
    camera.position.add(move);

    const halfW = roomWidth / 2 - 0.4;
    const halfL = roomLength / 2 - 0.4;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -halfW, halfW);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -halfL, halfL);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.2, Math.max(1.4, roomHeight - 0.4));
  });

  return null;
};

function MapBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const galleryId = searchParams.get('galleryId');

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Tùy chọn cấu trúc bản đồ
  const [roomWidth, setRoomWidth] = useState(12);
  const [roomLength, setRoomLength] = useState(30);
  const [roomHeight, setRoomHeight] = useState(6);
  const [floorColor, setFloorColor] = useState('#4e3629');
  const [wallColor, setWallColor] = useState('#8a1923');
  const [wainscotingColor, setWainscotingColor] = useState('#eae5dc');
  const [floorType, setFloorType] = useState<'wood' | 'marble' | 'carpet'>('wood');

  useEffect(() => {
    if (!galleryId) {
      router.push('/admin');
      return;
    }

    setLoading(true);
    // Tải thông tin gallery
    Promise.all([
      fetch('/api/galleries', { cache: 'no-store' }).then(res => res.json()),
      fetch(`/api/exhibits?galleryId=${galleryId}`, { cache: 'no-store' }).then(res => res.json())
    ])
      .then(([galleries, roomExhibits]: [Gallery[], Exhibit[]]) => {
        const found = galleries.find(g => g.id === galleryId);
        if (found) {
          setGallery(found);
          setExhibits(roomExhibits);
          
          // Nạp cấu hình từ DB
          setRoomWidth(found.room_width ?? 12);
          setRoomLength(found.room_length ?? 30);
          setRoomHeight(found.room_height ?? 6);
          setFloorColor(found.floor_color ?? '#4e3629');
          setWallColor(found.wall_color ?? '#8a1923');
          setWainscotingColor(found.wainscoting_color ?? '#eae5dc');
          setFloorType(found.floor_type ?? 'wood');
          
          setLoading(false);
        } else {
          throw new Error('Không tìm thấy phòng triển lãm');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Lỗi tải dữ liệu phòng triển lãm.');
        setLoading(false);
      });
  }, [galleryId, router]);

  // Lưu cấu hình bản đồ
  const handleSaveMap = async () => {
    if (!gallery) return;
    setSaving(true);
    setMessage('');
    setError('');

    const mapData = {
      room_width: roomWidth,
      room_length: roomLength,
      room_height: roomHeight,
      floor_color: floorColor,
      wall_color: wallColor,
      wainscoting_color: wainscotingColor,
      floor_type: floorType,
    };

    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapData)
      });

      if (res.ok) {
        setMessage('Đã lưu cấu trúc bản đồ 3D thành công!');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Lưu cấu trúc bản đồ thất bại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang nạp mô hình phòng 3D...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0d] flex text-slate-200 relative select-none">
      
      {/* TRÁI: LIVE 3D CANVAS MAP VIEW */}
      <div className="flex-1 h-full relative">
        <Canvas
          shadows
          camera={{ position: [0, Math.min(roomHeight - 0.6, 3.2), Math.min(roomLength / 2 - 3, 9)], fov: 62 }}
        >
          <color attach="background" args={['#14141a']} />
          <fog attach="fog" args={['#14141a', 10, 32]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={0.9} />

          <Suspense fallback={null}>
            {gallery && (
              <ExhibitionRoom 
                galleryId={gallery.id} 
                exhibits={exhibits}
                customSettings={{
                  room_width: roomWidth,
                  room_length: roomLength,
                  room_height: roomHeight,
                  floor_color: floorColor,
                  wall_color: wallColor,
                  wainscoting_color: wainscotingColor,
                  floor_type: floorType,
                }}
              />
            )}
            
            {/* Vẽ các tác phẩm của phòng ở vị trí hiện tại để admin căn chỉnh dễ hơn */}
            {exhibits.map((exhibit) => (
              <ExhibitObject key={exhibit.id} exhibit={exhibit} />
            ))}
          </Suspense>

          <FreeMapCamera roomWidth={roomWidth} roomLength={roomLength} roomHeight={roomHeight} />
        </Canvas>

        {/* Info panel */}
        <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md flex items-center gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
            <Sliders size={16} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">3D Room Customizer</span>
            <span className="text-xs font-bold text-slate-200 block">{gallery?.name}</span>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] py-1 px-3 rounded-full pointer-events-none">
          💡 WASD di chuyển camera | Kéo chuột trái để xoay | Q/E lên xuống | Shift để đi nhanh
        </div>
      </div>

      {/* PHẢI: MAP CONTROLS SIDEBAR */}
      <div className="w-[360px] h-full bg-slate-950 border-l border-slate-900 flex flex-col p-6 overflow-y-auto space-y-6 shadow-2xl relative z-10 pointer-events-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            CMS Dashboard
          </button>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            MAP EDITOR
          </span>
        </div>

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

        {/* 1. KÍCH THƯỚC PHÒNG */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Expand size={12} />
            Kích thước phòng (Dimensions)
          </h3>

          {/* Width */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Chiều rộng (X)</span>
              <span className="text-white font-bold">{roomWidth}m</span>
            </div>
            <input 
              type="range" min="8" max="20" step="1"
              value={roomWidth} onChange={(e) => setRoomWidth(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Length */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Chiều dài (Z)</span>
              <span className="text-white font-bold">{roomLength}m</span>
            </div>
            <input 
              type="range" min="15" max="50" step="2"
              value={roomLength} onChange={(e) => setRoomLength(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Height */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Chiều cao trần (Y)</span>
              <span className="text-white font-bold">{roomHeight}m</span>
            </div>
            <input 
              type="range" min="4" max="8" step="0.5"
              value={roomHeight} onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <hr className="border-slate-900" />

        {/* 2. CHẤT LIỆU SÀN */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={12} />
            Chất liệu & màu sàn (Floor)
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block mb-1">Loại vật liệu sàn</label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {(['wood', 'marble', 'carpet'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFloorType(type);
                    // Chọn nhanh màu sàn tương ứng loại
                    if (type === 'wood') setFloorColor('#4e3629');
                    else if (type === 'marble') setFloorColor('#a29587');
                    else if (type === 'carpet') setFloorColor('#601118');
                  }}
                  className={`text-[9px] font-black py-2 rounded-xl border transition-all cursor-pointer ${floorType === type ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  {type === 'wood' && 'Gỗ Sồi'}
                  {type === 'marble' && 'Đá Hoa Cương'}
                  {type === 'carpet' && 'Thảm Trải'}
                </button>
              ))}
            </div>
          </div>

          {/* Color pickers */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Màu sắc sàn</span>
              <span className="text-white font-mono font-bold uppercase">{floorColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={floorColor} 
                onChange={(e) => setFloorColor(e.target.value)}
                className="w-10 h-8 bg-transparent border-0 outline-none cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 flex-1">
                {FLOOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFloorColor(p.value)}
                    style={{ backgroundColor: p.value }}
                    className="w-5 h-5 rounded-full border border-slate-700/60 flex items-center justify-center cursor-pointer"
                    title={p.name}
                  >
                    {floorColor === p.value && <Check size={10} className="text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-900" />

        {/* 3. MÀU SƠN TƯỜNG */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={12} />
            Màu sơn tường (Walls)
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Màu tường chính</span>
              <span className="text-white font-mono font-bold uppercase">{wallColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={wallColor} 
                onChange={(e) => setWallColor(e.target.value)}
                className="w-10 h-8 bg-transparent border-0 outline-none cursor-pointer"
              />
              <div className="grid grid-cols-6 gap-1 flex-1">
                {WALL_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setWallColor(p.value)}
                    style={{ backgroundColor: p.value }}
                    className="w-5 h-5 rounded-full border border-slate-700/60 flex items-center justify-center cursor-pointer"
                    title={p.name}
                  >
                    {wallColor === p.value && <Check size={10} className="text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wainscoting Color */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Màu phào ốp chân tường</span>
              <span className="text-white font-mono font-bold uppercase">{wainscotingColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={wainscotingColor} 
                onChange={(e) => setWainscotingColor(e.target.value)}
                className="w-10 h-8 bg-transparent border-0 outline-none cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 flex-1">
                {WAINSCOTING_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setWainscotingColor(p.value)}
                    style={{ backgroundColor: p.value }}
                    className="w-5 h-5 rounded-full border border-slate-700/60 flex items-center justify-center cursor-pointer"
                    title={p.name}
                  >
                    {wainscotingColor === p.value && <Check size={10} className="text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-900 mt-auto" />


        <button
          onClick={handleSaveMap}
          disabled={saving}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600/40 text-slate-950 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <Save size={14} />
          {saving ? 'Đang Lưu...' : 'Lưu Cấu Trúc Bản Đồ'}
        </button>
      </div>

    </div>
  );
}

export default function MapBuilder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang nạp mô hình phòng 3D...</p>
      </div>
    }>
      <MapBuilderContent />
    </Suspense>
  );
}
