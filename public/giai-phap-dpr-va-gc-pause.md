# Giải pháp: Giảm độ phân giải (DPR) + sửa lag ngẫu nhiên trên máy khỏe

## 1. Giảm độ phân giải render cho máy yếu ("làm mờ" có chủ đích)

### Vấn đề

`<Canvas>` ở cả `lobby/page.tsx` và `GalleryCanvas.tsx` **không set `dpr`**, nên React Three Fiber dùng mặc định `dpr={[1, 2]}` — tự động render theo `window.devicePixelRatio` của máy, tối đa 2x.

Rất nhiều điện thoại tầm trung có `devicePixelRatio = 2` hoặc `3` dù màn hình vật lý nhỏ → app đang **render gấp 4–9 lần số pixel cần thiết** trên những máy đó mà không ai biết. Đây là một trong những chỗ tốn GPU nhất nhưng lại dễ sửa nhất.

### Giải pháp — giảm `dpr` theo preset

```tsx
<Canvas
  shadows={settings.shadows}
  dpr={settings.preset === 'low' ? 0.75 : [1, 2]}  // render ở 0.75x rồi CSS upscale lên
  gl={{ antialias: settings.preset !== 'low' }}     // tắt AA cho máy yếu
  camera={{ position: [0, 3, -2], fov: 65 }}
>
```

Render ở `dpr=0.75` thay vì `1` giảm số pixel cần tô màu xuống còn ~56% — chi phí fragment shader giảm gần một nửa. Ảnh hơi mờ nhẹ (đúng kiểu "làm mờ có chủ đích") nhưng FPS tăng rõ rệt, đổi lại hoàn toàn hợp lý cho máy yếu.

## 2. Adaptive DPR — tự động giảm khi máy đuối, không cần biết trước máy yếu hay khỏe

Thay vì cố định theo preset, dùng `<AdaptiveDpr>`/`<AdaptiveEvents>` của `@react-three/drei` — tự giảm `dpr` khi phát hiện frame-time tụt, tự tăng lại khi ổn:

```tsx
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';

<Canvas dpr={[0.5, 2]} ...>
  <AdaptiveDpr pixelated />   {/* tự giảm dpr khi frame-time vượt ngưỡng */}
  <AdaptiveEvents />          {/* giảm tải xử lý raycasting/event khi đang hạ chất lượng */}
  ...
</Canvas>
```

Cơ chế này giải quyết cả trường hợp **máy khỏe đôi lúc vẫn lag**: khi CPU/GPU bị spike tạm thời (nhiều người cùng lúc, mở phòng, hiệu ứng...), `AdaptiveDpr` tự hạ tạm độ phân giải đúng lúc đó rồi trả lại bình thường — không cần phân loại máy yếu/khỏe trước, nó phản ứng theo tình huống thực tế mỗi giây.

## 3. Nguyên nhân khiến máy khỏe vẫn lag đột xuất — không liên quan dpr/preset

### Vấn đề: tạo object mới mỗi frame trong `useFrame` → GC pause

`lobby/page.tsx` tạo mới `THREE.Vector3()` ngay trong `useFrame` — chạy lại **mỗi frame, 60 lần/giây**:

```tsx
// lobby/page.tsx — dòng 152-153, 308-314, chạy trong useFrame()
const targetCamPos = new THREE.Vector3(camX, camY, camZ);
const targetLookAt = new THREE.Vector3(px, targetHeight, pz);
...
const frontVec = new THREE.Vector3();
const rightVec = new THREE.Vector3(-frontVec.z, 0, frontVec.x).normalize();
const moveDir = new THREE.Vector3();
```

Tối thiểu **5 object mới mỗi frame × 60 frame/giây = 300+ object/giây** chỉ riêng đoạn di chuyển nhân vật. Đây là nguyên nhân kinh điển gây **GC pause** (garbage collector dừng đột ngột để dọn rác) — xảy ra **bất kể máy mạnh hay yếu**, vì không phải do thiếu sức mạnh xử lý, mà do JS engine phải dừng lại dọn hàng nghìn object rác tích lũy. Đây chính là loại lag mà preset/độ phân giải không giúp được gì.

### Giải pháp — tái sử dụng vector bằng `useRef`, không tạo mới mỗi frame

```tsx
// Khai báo 1 lần ngoài useFrame
const frontVec = useRef(new THREE.Vector3()).current;
const rightVec = useRef(new THREE.Vector3()).current;
const moveDir = useRef(new THREE.Vector3()).current;
const targetCamPos = useRef(new THREE.Vector3()).current;
const targetLookAt = useRef(new THREE.Vector3()).current;

useFrame((state, delta) => {
  // Dùng .set()/.copy() để GHI ĐÈ giá trị, không new Vector3() nữa
  frontVec.set(Math.sin(yaw), 0, Math.cos(yaw));
  rightVec.set(-frontVec.z, 0, frontVec.x).normalize();
  moveDir.set(0, 0, 0);
  // ...
  targetCamPos.set(camX, camY, camZ);
  targetLookAt.set(px, targetHeight, pz);
});
```

Đây là sửa **miễn phí về mặt hình ảnh** (không đổi gì người dùng thấy), chỉ đổi cách viết code, nhưng loại bỏ hẳn một nguồn gây giật ngẫu nhiên — nên áp dụng cho **mọi preset, mọi máy**, không cần phân biệt.

## 4. Tóm tắt

| Vấn đề | Giải pháp | Áp dụng cho |
|---|---|---|
| Máy yếu không chạy mượt | `dpr` thấp hơn + tắt antialias ở preset `low` | Chỉ preset `low` |
| Máy khỏe/yếu đều lag lúc tải đột xuất | `<AdaptiveDpr>`/`<AdaptiveEvents>` (drei) tự hạ độ phân giải tạm thời | Mọi máy, tự động |
| Máy khỏe vẫn giật ngẫu nhiên do GC | Bỏ `new THREE.Vector3()` trong `useFrame`, dùng `useRef` tái sử dụng | Mọi máy, luôn nên sửa |
