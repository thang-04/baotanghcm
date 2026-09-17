# Phòng 3 — Trụ màn hình video 4 mặt

## Mục tiêu

Thêm một trụ trình chiếu ở chính giữa Phòng 3 (`gallery-ceramics`). Trụ có màn hình ở cả bốn mặt để người chơi có thể xem video từ mọi hướng.

## Trải nghiệm người chơi

- Video nguồn là file local `1786471815039_191732243237186469_g6970148838092397238.mp4`, được phục vụ từ thư mục `public/videos/` với tên ổn định `room-three-pillar.mp4`.
- Khi người chơi bước vào bán kính khoảng 3 mét quanh tâm trụ, cả bốn màn hình tự phát video từ đầu.
- Video ưu tiên tự phát có tiếng. Nếu trình duyệt từ chối autoplay có tiếng, video chuyển sang phát hình ảnh ở chế độ tắt tiếng và hiển thị nút **Bật tiếng**.
- Khi người chơi rời vùng kích hoạt, video tạm dừng. Khi vào lại, video phát lại từ đầu.
- Không bổ sung thao tác mở bằng phím E; việc kích hoạt hoàn toàn theo vị trí người chơi.

## Thiết kế 3D

- Tạo component riêng `VideoPillar` để giữ toàn bộ hình học và logic trình chiếu.
- Đặt component tại tọa độ cục bộ `[0, 0, 0]` của `RoomThree`; `DynamicRoom` hiện đã đặt phòng 3 ở offset Z phù hợp nên trụ sẽ nằm đúng tâm theo không gian thế giới.
- Thân trụ là khối đứng có đế và viền trang trí, với bốn mặt TV bố trí quanh trục Y.
- Một `HTMLVideoElement` dùng chung làm nguồn cho `THREE.VideoTexture`; texture được áp lên cả bốn màn hình để các mặt luôn đồng bộ.
- Màn hình có vật liệu phát sáng nhẹ để dễ nhận biết trong phòng có ánh sáng thấp.

## Luồng trạng thái

1. Component theo dõi vị trí `lobby-player` trong `useFrame`.
2. Khi khoảng cách XZ tới tâm trụ chuyển từ ngoài vào trong vùng kích hoạt, component đặt lại thời gian video về 0 và gọi `play()`.
3. Nếu `play()` bị từ chối do chính sách autoplay, component phát lại ở chế độ muted và bật trạng thái hiển thị nút **Bật tiếng**.
4. Khi người chơi ra ngoài vùng, component gọi `pause()` và đặt lại video về đầu.
5. Nút **Bật tiếng** bỏ muted, gọi lại `play()` và ẩn thông báo khi trình duyệt cho phép.
6. Khi component unmount hoặc đổi phòng, video được pause và giải phóng `VideoTexture`.

## Phạm vi thay đổi

- Thêm file video vào `public/videos/`.
- Thêm component trình chiếu và gắn vào `RoomThree`.
- Thêm phần điều khiển tối thiểu cho trạng thái autoplay bị chặn.
- Không thay đổi dữ liệu gallery, hệ thống hiện vật, nhiệm vụ, multiplayer hoặc các phòng khác.

## Kiểm thử và xác minh

- Kiểm thử logic vùng kích hoạt: ngoài vùng không phát, đi vào phát từ đầu, ra ngoài thì dừng/reset, vào lại thì phát lại.
- Chạy lint và build Next.js.
- Chạy server dev, truy cập Phòng 3, đi tới tâm phòng và xác nhận cả bốn mặt đều phát cùng video; thử trường hợp autoplay bị chặn để kiểm tra nút **Bật tiếng**.

## Quyết định và giả định

- Bán kính kích hoạt mặc định là 3 mét, có thể điều chỉnh trong component nếu khi thử thực tế vùng đứng chưa hợp lý.
- Video được phát inline trên TV 3D, không mở thêm modal toàn màn hình.
- Video được copy vào project thay vì tham chiếu đường dẫn tuyệt đối trên máy phát triển, để khi chạy trên máy khác vẫn hoạt động.
