# Kế hoạch sửa lỗi modal “KHÁM PHÁ” — Phòng TIẾNG NÓI TỪ AN NAM

## 1. Mục tiêu

Sửa lỗi các modal tư liệu của Room 3 (`gallery-ceramics`) không hiện ra khi người dùng bấm **KHÁM PHÁ** ở góc nhìn thông thường gần các bức tường.

Kết quả mong muốn:

- Modal luôn hiển thị ở giữa màn hình sau khi bấm **KHÁM PHÁ**, không phụ thuộc vị trí hoặc hướng camera.
- Modal nằm trên Canvas 3D và các lớp giao diện khác của phòng.
- Nút đóng, nội dung, hình ảnh và liên kết nguồn tiếp tục hoạt động bình thường.
- Không thay đổi component dùng chung, camera, nhân vật, điều hướng hoặc bất kỳ room nào khác.

## 2. Nguyên nhân đã xác định

Sự kiện click và state lựa chọn hiện vật vẫn hoạt động. `ExhibitStoryCard` thực sự được mount sau khi bấm nút.

Lỗi nằm ở việc modal đang dùng `Html fullscreen` của `@react-three/drei` nhưng vẫn bị xem như một phần tử neo trong không gian 3D tại gốc phòng. Khi người dùng đứng gần tường và nhìn vào hiện vật, điểm neo này nằm phía sau camera nên Drei tự ẩn lớp DOM của modal.

Modal hiện tại cũng chưa được portal ra `document.body`, nên vẫn bị giới hạn bởi stacking context của lớp Canvas.

## 3. Phạm vi file

### File cần sửa để triển khai

| File | Thay đổi dự kiến | Lý do |
| --- | --- | --- |
| `src/components/3d/rooms/RoomThreeHistoricExhibits.tsx` | Tách lớp modal khỏi cơ chế ẩn theo camera và portal modal ra `document.body` | Đây là component riêng quản lý hiện vật và modal của Room 3 |

### File được tạo cho kế hoạch

| File | Mục đích |
| --- | --- |
| `PhongTrang.md` | Ghi lại nguyên nhân, phạm vi, các bước sửa và tiêu chí kiểm tra |

### File chỉ dùng để tham khảo, không sửa

- `src/components/3d/rooms/room-four/RoomFourJourneyOverlay.tsx`: tham khảo cách một modal fullscreen đang xử lý `portal` và `onOcclude`.
- `docs/ROOM_THREE_3D_EDITING_RULES.md`: kiểm tra ranh giới chỉnh sửa an toàn của Room 3.

### Các file không được sửa

- `src/components/3d/GalleryCanvas.tsx`
- `src/components/3d/ExhibitionRoom.tsx`
- `src/components/3d/rooms/BaseRoom.tsx`
- `src/components/3d/rooms/BaseRoomPlain.tsx`
- `src/components/3d/PlayerCharacter.tsx`
- `src/context/MuseumContext.tsx`
- `src/app/gallery/[id]/page.tsx`
- Mọi component hoặc asset của các room khác

Nếu quá trình triển khai phát hiện bắt buộc phải thay đổi một trong các file trên, phải dừng lại và hỏi người dùng trước.

## 4. Các bước triển khai

### Bước 1 — Chuẩn bị portal riêng cho modal Room 3

Trong `RoomThreeHistoricExhibits`:

1. Tạo một `portalRef` dành cho DOM overlay.
2. Sau khi component Room 3 được mount ở client, gán `portalRef.current = document.body`.
3. Chuẩn bị portal ở component cha để nó đã sẵn sàng trước khi người dùng mở modal.
4. Truyền `portalRef` vào `ExhibitStoryCard` qua props.

### Bước 2 — Ngăn modal fullscreen bị ẩn theo camera

Trong `ExhibitStoryCard`:

1. Truyền `portal={portalRef}` cho `<Html>` để lớp modal được render bên ngoài stacking context của Canvas.
2. Thêm xử lý `onOcclude` dành cho fullscreen overlay để Drei không tự đổi `display` dựa trên việc điểm neo nằm trước hay sau camera.
3. Giữ `fullscreen`, cách căn giữa và `zIndexRange` hiện có để không thay đổi bố cục nội dung.

### Bước 3 — Giữ nguyên hành vi Room 3

Không thay đổi:

- Dữ liệu của năm hiện vật lịch sử.
- Tọa độ, rotation, frame, artwork hoặc hit-area của hiện vật.
- Nội dung và đường dẫn nguồn trong modal.
- State `selectedDisplayId` và callback `onExplore` hiện có.
- Camera, raycast chung, player movement hoặc cấu trúc phòng.

Chỉ điều chỉnh cách lớp DOM của modal Room 3 được gắn và hiển thị.

## 5. Kiểm tra sau khi sửa

### Kiểm tra chức năng trong Room 3

Mở Room 3 bằng môi trường development và kiểm tra cả năm hiện vật:

1. **1908 — Phong trào chống thuế Trung Kỳ**.
2. **1922 — Le Paria — diễn đàn chống thực dân**.
3. **1921 — Nguyễn Ái Quốc tại Đại hội Marseille**.
4. **1919 — Quyền cư trú, đi lại và xuất dương**.
5. **1919 — Yêu sách gửi Hội nghị Versailles**.

Với mỗi hiện vật:

- Đứng gần bảng thông tin và hướng camera trực tiếp về phía tường.
- Bấm phần tranh, bảng hoặc nút **KHÁM PHÁ**.
- Xác nhận modal xuất hiện ngay và phủ đúng toàn màn hình.
- Xác nhận modal không biến mất khi hướng camera khiến gốc phòng nằm phía sau camera.
- Xác nhận nút `×` đóng được modal.
- Xác nhận nội dung, ảnh và các liên kết nguồn hiển thị đúng.
- Mở lại modal sau khi đóng để kiểm tra state được reset đúng.

### Kiểm tra lớp giao diện

- Modal nằm trên Canvas, header và chatbox.
- Có thể tương tác với nút đóng và liên kết bên trong modal.
- Khi modal đã đóng, điều khiển nhân vật và camera hoạt động như trước.
- Không xuất hiện lỗi JavaScript mới trong console.

### Kiểm tra mã nguồn

- Chạy ESLint riêng cho `src/components/3d/rooms/RoomThreeHistoricExhibits.tsx` nếu cần.
- Không chạy production build; người dùng sẽ tự chạy build trên máy.

## 6. Tiêu chí hoàn thành

- Cả năm modal của Room 3 luôn mở được ở mọi góc camera thực tế.
- Không còn trường hợp dialog tồn tại trong DOM nhưng bị Drei đặt ẩn.
- Chỉ file `src/components/3d/rooms/RoomThreeHistoricExhibits.tsx` được sửa để triển khai bản fix.
- Không có thay đổi trong component chung hoặc room khác.
- Không chạy production build.
