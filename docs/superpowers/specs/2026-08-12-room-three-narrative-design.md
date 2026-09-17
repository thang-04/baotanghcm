# Phòng 3 — Tiếng nói dân tộc: nội dung chuyển phòng và hướng dẫn chơi

## Mục tiêu

Cập nhật toàn bộ nội dung hiển thị của phòng `gallery-ceramics` để định vị phòng là **PHÒNG 3: TIẾNG NÓI DÂN TỘC**, lấy bối cảnh Paris 1919 và hướng dẫn người chơi khôi phục Bản Yêu sách của nhân dân An Nam.

## Tên và phạm vi hiển thị

- Tên hiển thị thống nhất: `PHÒNG 3: TIẾNG NÓI DÂN TỘC`.
- Áp dụng cho tên phòng trong sảnh, nhãn cửa, HUD nhấn E, màn hình chuyển phòng, popup chào mừng và metadata hiển thị trong context.
- Giữ nguyên ID kỹ thuật `gallery-ceramics`, route, dữ liệu gallery, cửa phòng, vị trí spawn và logic điều hướng.

## Màn hình chuyển phòng

Khi người chơi xác nhận đi vào phòng 3, màn hình chuyển phòng hiển thị riêng nội dung nhiều dòng:

- Tên phòng: `PHÒNG 3: TIẾNG NÓI DÂN TỘC`
- Bối cảnh: `PARIS · 1919`
- Mô tả: `Khôi phục Bản Yêu sách của nhân dân An Nam`

Các phòng khác giữ nguyên hành vi và nội dung chuyển phòng hiện tại.

## Popup khi bước vào phòng

Sau khi dịch chuyển hoàn tất và không gian phòng 3 đã hiện ra, popup lớn hiện theo cơ chế `RoomWelcomeModal` hiện có. Popup khóa di chuyển trong lúc mở, có nút chuyển qua từng bước và nút đóng.

Nội dung mở đầu:

> “Một dân tộc muốn cất lên tiếng nói của mình.”

Tiếp theo là lời dẫn:

`Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.`

Popup trình bày cơ chế nhiệm vụ thành 4 bước:

1. **Vào phòng Paris 1919, đọc bối cảnh.**
2. **Xem video về Bản Yêu sách.**
3. **Tìm các mảnh văn kiện trong phòng.**
4. **Ghép đúng mục lục/yêu sách để hoàn thành văn kiện.**

Phần tóm tắt luồng chơi hiển thị:

`Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo`

## Kiến trúc thay đổi

- Mở rộng cấu hình nội dung `gallery-ceramics` trong `RoomWelcomeModal.tsx`; không tạo popup mới.
- Bổ sung dữ liệu chuyển phòng có cấu trúc cho màn chuyển phòng trong `lobby/page.tsx`, chỉ áp dụng nội dung đặc biệt cho `gallery-ceramics` và có fallback cho các phòng còn lại.
- Thay các label hiển thị phòng 3 đang dùng tên cũ; không đổi các giá trị ID/điều kiện kỹ thuật.
- Giữ nguyên video pillar, bộ sưu tập hiện vật, mini game hiện tại và các cơ chế gameplay khác ngoài nội dung hướng dẫn.

## Kiểm thử và xác minh

- Tìm toàn bộ label cũ còn sót trong các UI thuộc luồng phòng 3 và thay bằng tên mới hoặc nội dung bối cảnh phù hợp.
- Chạy targeted lint cho `lobby/page.tsx` và `RoomWelcomeModal.tsx`.
- Chạy test hiện có và build Next.js.
- Kiểm tra thủ công: chuyển vào phòng 3 thấy màn chuyển phòng mới; sau dịch chuyển popup hiện đúng câu dẫn, 4 bước và luồng chơi; nhấn đóng vẫn điều khiển được nhân vật.
