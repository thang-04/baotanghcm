# Room 4 — Phase 3 Implementation & Acceptance Report

## 1. Kết quả

Phase 3 đã hoàn tất việc tái thiết kế **Trạm hành trình Liên Xô — Quảng Châu** theo nguyên tắc:

> Keep the journey, redesign the experience.

Nguồn nội dung và thứ tự tham quan có thẩm quyền là `ROOM4_TRAM_HANH_TRINH_LIEN_XO_QUANG_CHAU.md`. Thiết kế mới giữ nguyên ranh giới phòng, hướng đi từ Room 3 sang Room 5, Card mở đầu, tám trạm lịch sử và vùng chuyển tiếp Liên Xô → Quảng Châu; phần được thay đổi hoàn toàn là tổ chức nội thất, ngôn ngữ không gian, tiêu điểm thị giác, nhịp dừng và cách dẫn đường.

Phase 3 chỉ triển khai kiến trúc, trưng bày nền, circulation và visual hierarchy. Các tương tác chi tiết tại từng hiện vật thuộc Phase 4.

## 2. Spatial contract được giữ nguyên

| Hạng mục | Giá trị triển khai |
|---|---:|
| Kích thước Room 4 | 18 m × 80 m |
| Local Z | -75 → +5 |
| World Z | 130 → 210 |
| Điểm vào từ Room 3 | world Z 130; spawn Z 133 |
| Điểm ra sang Room 5 | world Z 210; spawn Z 212 |
| Vùng Liên Xô | Card + S1–S3 |
| Vùng chuyển tiếp | local Z -42 → -34 |
| Vùng Quảng Châu | S4–S8 |

Các giá trị trên nằm trong một spatial datum dùng chung tại `src/lib/roomFourSpatial.json`; bố trí trạm, portal, centerline và collider nằm tại `src/lib/roomFourLayout.ts`.

## 3. Thiết kế trải nghiệm đã triển khai

### Threshold — nhận hành trang

- Mở bằng một threshold tối, có nhãn nhận diện hành trình.
- Thẻ hành trình được đặt thành tiêu điểm đầu tiên trước S1, không bị biến thành một trạm lịch sử mới.
- Tuyến sáng trên sàn bắt đầu ngay tại spawn để người xem hiểu hướng đi mà không cần đoán.

### Liên Xô — học để mở đường

- S1 Bàn học Moscow, S2 Diễn đàn Quốc tế và S3 Vé đi Quảng Châu vẫn đúng thứ tự tài liệu gốc.
- Ngôn ngữ lạnh, khung thép, ánh sáng xanh-trắng và các bay xen kẽ trái/phải tạo nhịp khám phá nhưng không đổi circulation.
- Mỗi trạm có date/index, title và purpose line; mức độ nổi bật thay đổi theo vai trò kể chuyện.

### Transition — tư tưởng trở thành hành động

- Khoảng -42 → -34 là một hành lang chuyển cảnh, không bị hiểu sai thành “trạm thứ chín”.
- Hai portal lạnh/ấm, các cánh tường lệch và màu vật liệu chuyển dần tạo một ngưỡng có chủ ý.
- Mốc “Quảng Châu — 11.11.1924” xác lập thay đổi địa điểm và nhịp kể chuyện.

### Quảng Châu — hành động và truyền bá

- S4 Lý Thụy, S5 Hạt nhân tổ chức, S6 Xưởng in Thanh Niên, S7 Lớp học bí mật và S8 Mạng lưới về Tổ quốc giữ đúng thứ tự.
- Vật liệu ấm, gỗ, giấy, đồng và ánh sáng hổ phách phân biệt rõ nửa sau của hành trình.
- Hình khối trưng bày được dựng riêng theo từng ý nghĩa: bàn nhiệm vụ, mạng lưới tổ chức, máy in, lớp học và bản đồ hồi hương; không phải thao tác dời cùng một loại hiện vật.

### Exit — hành trang trở về

- S8 được nâng thành tiêu điểm kết thúc bằng mạng tuyến hội tụ.
- Portal thoát và thông điệp “Con đường về Tổ quốc” chuẩn bị rõ ràng cho Room 5 mà không làm thay đổi cửa hoặc hướng đi hiện hữu.

## 4. Wayfinding, circulation và an toàn di chuyển

- Một Catmull-Rom route spine liên tục nối Card → S1 → … → S8 → exit.
- Station bay luân phiên hai bên centerline để người xem khám phá có nhịp nhưng luôn trở lại trục chính.
- Collider được sinh từ cùng dữ liệu footprint với station/portal, có thêm player safety margin 0,28 m.
- Giới hạn tường, cửa, spawn, camera range, Room 4/Room 5 detection và WebSocket room detection đều dùng chung spatial contract.
- Room 4 LOD dùng tâm world Z 170 và bán kính hiển thị 48 m, vì vậy phòng luôn được tải tại spawn Z 133, tại cửa vào và tại cửa ra Z 210.

## 5. Performance contract

- Tối đa ba nguồn sáng động trong Room 4: ambient, cold point light và warm point light.
- Vật liệu line/connector được dùng chung, tránh tạo material riêng cho từng đoạn.
- Route geometry được tạo một lần và dispose khi unmount.
- Các texture chữ dùng lại cơ chế cache hiện có.
- Không dùng shadow động trong Room 4.

## 6. Acceptance matrix

| Tiêu chí | Trạng thái | Bằng chứng |
|---|---|---|
| Tài liệu journey là nguồn chính | Đạt | Nội dung, mốc thời gian và thứ tự trạm lấy từ journey file |
| Giữ room boundary/structure | Đạt | 18 × 80 m; local -75 → +5; world 130 → 210 |
| Giữ journey và circulation | Đạt | Card → S1–S3 → transition → S4–S8 → exit |
| Không tạo journey mới | Đạt | Transition chỉ là ngưỡng; không thêm station |
| Interior visibly redesigned | Đạt | Shell, bay, portal, route spine và exhibit forms được dựng lại |
| Spatial hierarchy rõ ràng | Đạt | focal levels, alternating bays, section headers, terminal focus |
| Chuyển tiếp có chủ ý | Đạt | cold steel → compression portals → warm wood/paper |
| Historical + immersive balance | Đạt | date/title/purpose kết hợp spatial props và route lighting |
| Wayfinding rõ | Đạt | tuyến sáng liên tục, station rings, headers và exit portal |
| Không cản đường | Đạt | 2.001 điểm trên centerline: 0 collision, 0 out-of-bounds, 0 reverse step |
| Tích hợp standalone + lobby | Đạt | Shared spatial/collision data trong cả hai runtime |
| Build production | Đạt | `npm run build` thành công với Next.js 16.2.9 |

## 7. Verification đã chạy

- `npx tsc --noEmit`: pass.
- Scoped ESLint cho các module Phase 3: 0 error; còn 3 warning cũ trong `PlayerCharacter.tsx` về state Room 1 không sử dụng.
- `git diff --check`: pass; chỉ có cảnh báo line-ending LF/CRLF của working tree.
- `npm run build`: pass, gồm compile, TypeScript và static generation.
- Route simulation: 2.001 điểm, 0 collider hit, 0 out-of-bounds, 0 bước Z đi ngược, 0 portal blocker.
- Browser smoke test tại 1280 × 720: scene render, Card/S1–S8/transition/exit labels xuất hiện đúng thứ tự, HUD hiển thị “Đi theo đường sáng qua tám trạm”, không có runtime error do Phase 3.

Lưu ý: lint toàn repository vẫn có lỗi tồn tại từ trước trong các module ngoài phạm vi Room 4. Những lỗi đó không làm hỏng type-check hoặc production build của Phase 3.

## 8. Cách chạy demo nghiệm thu

1. Chạy `npm run dev` tại thư mục dự án.
2. Mở bản kiểm tra trực tiếp: `http://localhost:3000/gallery/gallery-market-economy`.
3. Hoặc kiểm tra luồng tích hợp tại `http://localhost:3000/lobby`, đi qua Room 3 và cửa Room 4.
4. Dùng W/A/S/D và kiểm tra lần lượt:
   - Card tại threshold;
   - S1, S2, S3 trong vùng Liên Xô;
   - hành lang chuyển tiếp lạnh → ấm;
   - S4, S5, S6, S7, S8 trong vùng Quảng Châu;
   - portal thoát sang Room 5.
5. Xác nhận người chơi không xuyên hiện vật, không mắc tại portal và tuyến sáng luôn dẫn đúng thứ tự.

