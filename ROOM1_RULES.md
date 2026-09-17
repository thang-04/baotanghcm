# Quy tắc phạm vi mặc định: Room 1

## Mục tiêu

Mọi yêu cầu chỉnh sửa code từ người dùng mặc định chỉ phục vụ **Room 1** (gallery ID: `gallery-subsidy`). Người dùng không cần nhắc lại phạm vi này trong từng prompt.

Chỉ thay đổi khi nó cần thiết để đáp ứng yêu cầu Room 1. Không chủ động sửa, làm sạch, tối ưu, hoặc đồng bộ hành vi cho các phòng khác.

## Ranh giới thay đổi

### Tệp ưu tiên (có thể sửa trực tiếp)

- `src/components/3d/rooms/RoomOne.tsx` — không gian 3D Room 1, rào dây nhung và tủ trưng bày trung tâm.
- `src/lib/db/gallery-subsidy.json` — cấu hình gallery và hiện vật của Room 1.
- `src/lib/roomOneGameplay.ts` — dữ liệu/câu hỏi gameplay Room 1.
- `src/components/ui/RoomOneSoundtrack.tsx` — âm thanh riêng của Room 1.

### Tệp dùng chung (chỉ sửa nhánh Room 1 khi thật sự cần)

- `src/components/3d/ExhibitionRoom.tsx`, `src/components/3d/DynamicRoom.tsx`, `src/components/3d/GalleryCanvas.tsx`
- `src/app/gallery/[id]/page.tsx`, `src/components/ui/ExhibitModal.tsx`, `src/components/ui/InvestigationNotebook.tsx`
- `src/context/MuseumContext.tsx`, `src/app/lobby/page.tsx`, `src/app/admin/page.tsx`, `ws-server.js`

Khi cần sửa tệp dùng chung, thay đổi phải được giới hạn bằng định danh/điều kiện Room 1 (`gallery-subsidy`, `room1`, hoặc dữ liệu Room 1 tương ứng), giữ nguyên hợp đồng của phần dùng chung và không làm đổi hành vi Room 2–5 hay Lobby. Nếu không thể cô lập an toàn, dừng và xin người dùng xác nhận trước khi mở rộng phạm vi.

### Ngoài phạm vi mặc định

- Logic, UI, dữ liệu và tài sản của Room 2, Room 3, Room 4, Room 5.
- Refactor toàn cục, đổi kiến trúc, đổi dependency, đổi giao thức socket chung hoặc đổi schema chung chỉ vì Room 1 có thể dùng chúng.
- `BaseRoom.tsx` và các hạ tầng render dùng chung, trừ khi không còn cách truyền cấu hình/props an toàn hơn và tác động được chứng minh là chỉ cho Room 1.

## Bất biến nghiệp vụ Room 1

- Room 1 dùng gallery ID `gallery-subsidy`; không đổi ID này hoặc ID hiện vật nếu chưa cập nhật mọi tham chiếu Room 1 liên quan.
- `cluesCollected` là nguồn dữ liệu cho tiến độ. Tủ trung tâm chỉ mở khi đã thu thập đủ toàn bộ `REQUIRED_CLUES_FOR_CENTRAL_ARCHIVE`.
- Cấu hình rào dây nhung có đúng 6 phần tử, theo thứ tự trái `[-19,-13]`, trái `[-3,3]`, trái `[13,19]`, phải `[-19,-13]`, phải `[-3,3]`, phải `[13,19]`. Dữ liệu cấu hình lỗi phải an toàn fallback về mặc định.
- Luồng đa người chơi Room 1 phải giữ tương thích với trạng thái sẵn sàng/hoàn thành, điểm, thời gian và các sự kiện socket Room 1 đang có. Không đổi tên hoặc ý nghĩa event/payload khi chưa cập nhật cả client và server Room 1 trong cùng thay đổi.
- Với scene 3D, ưu tiên truyền `customSettings` và dữ liệu Room 1 hơn là sửa component nền dùng chung; không làm đổi tọa độ, va chạm, ánh sáng hay lối đi của phòng khác.

## Quy trình bắt buộc cho mọi prompt code

1. Diễn giải yêu cầu là yêu cầu Room 1, trừ khi người dùng nói rõ phạm vi khác.
2. Xác định entry point và các dependency trực tiếp trước khi sửa; dùng thay đổi nhỏ nhất đáp ứng yêu cầu.
3. Với tệp dùng chung, chỉ thêm/chỉnh nhánh Room 1 và kiểm tra rằng các nhánh phòng khác không thay đổi.
4. Giữ nguyên API, kiểu dữ liệu, local storage và socket contract không liên quan Room 1.
5. Chạy kiểm tra phù hợp (lint/typecheck/test hoặc luồng Room 1 liên quan) sau khi sửa, rồi báo rõ tệp đã đổi và ảnh hưởng Room 1.

## Ngoại lệ

Quy tắc này được thay thế cho một yêu cầu nếu người dùng **nói rõ** muốn sửa phòng khác, sửa liên phòng, hoặc thay đổi hạ tầng toàn dự án. Khi đó phải nêu phạm vi mở rộng trước khi thực hiện.
