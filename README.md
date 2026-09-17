# HỆ THỐNG BẢO TÀNG ẢO 3D (3D VIRTUAL MUSEUM PLATFORM)

Dự án này là một nền tảng Bảo tàng ảo 3D trực quan, tương tác thời gian thực trên môi trường Web, cho phép nhiều người dùng cùng tham quan các phòng triển lãm, nhìn thấy nhau di chuyển, chat trực tiếp và nghe thuyết minh nghệ thuật tự động.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

1. **Lõi Đồ Họa 3D Mượt Mà (Core 3D Engine):**
   * Sử dụng **React Three Fiber (Three.js)** mang lại hiệu năng cao và chạy cực mượt trực tiếp trên trình duyệt Web (kể cả trên di động).
   * Dựng không gian triển lãm sống động với hệ thống đổ bóng vật lý (shadows), ánh sáng nghệ thuật và sương mù tạo chiều sâu.
   * Cơ chế **Click-to-inspect** tự động xoay và zoom camera mượt mà đến góc nhìn tốt nhất để chiêm ngưỡng hiện vật.

2. **Tham Quan Đồng Hành Thời Gian Thực (Multiplayer Co-visiting):**
   * Đồng bộ hóa di chuyển của các du khách trong cùng một phòng thông qua **WebSockets (Socket.io)**.
   * Hiển thị avatar của những người chơi khác dưới dạng mô hình Robot phát sáng di chuyển trực quan.
   * Tích hợp **Chatbox thời gian thực** theo từng phòng để mọi người dễ dàng tương tác trò chuyện.

3. **Giao Diện Kính Mờ Cao Cấp (Premium UI Overlay):**
   * Thiết kế theo phong cách **Glassmorphism** sang trọng sử dụng Tailwind CSS.
   * **Audio Guide Thuyết Minh:** Hỗ trợ trình phát bài nghe thuyết minh nghệ thuật giả lập sinh động.
   * **Đa ngôn ngữ (i18n):** Hỗ trợ chuyển đổi nhanh thông tin thuyết minh giữa **Tiếng Việt (VI)** và **Tiếng Anh (EN)**.

4. **Trang Quản Trị CMS & Công Cụ Định Vị 3D Trực Quan (3D Visual Builder):**
   * Quản lý CRUD (thêm, sửa, xóa) thông tin hiện vật qua trang admin.
   * **WYSIWYG 3D Builder:** Cho phép quản trị viên kéo thả các thanh trượt vị trí (X, Y, Z), góc xoay (Rotation) và kích thước (Scale) để di chuyển bức tranh/tượng trong không gian 3D và thấy kết quả cập nhật trực tiếp trước khi lưu.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án (How to Run)

### 1. Yêu Cầu Hệ Thống
* Đã cài đặt **Node.js** (Khuyến nghị phiên bản LTS 18 hoặc 20 trở lên).

### 2. Cài Đặt Thư Viện (Nếu chưa chạy)
Mở terminal tại thư mục gốc của dự án và chạy lệnh:
```bash
npm install
```

### 3. Khởi Chạy Dự Án
Chạy câu lệnh duy nhất dưới đây để khởi động đồng thời cả **Next.js Web Server** và **WebSocket Server**:
```bash
npm run dev
```

Server sẽ tự động kích hoạt:
* **Next.js Frontend & API:** [http://localhost:3000](http://localhost:3000)
* **WebSocket Server:** [http://localhost:3001](http://localhost:3001) (dùng để đồng bộ multiplayer)

---

## 📂 Cấu Trúc Thư Mục Chính (Project Structure)

```text
├── src/
│   ├── app/
│   │   ├── page.tsx               # Sảnh chờ chính (Lobby)
│   │   ├── layout.tsx             # Cấu hình RootLayout và Provider
│   │   ├── admin/
│   │   │   ├── page.tsx           # CMS Admin quản lý hiện vật (CRUD)
│   │   │   └── builder/
│   │   │       └── page.tsx       # Công cụ định vị vị trí 3D trực quan
│   │   ├── gallery/[id]/
│   │   │   └── page.tsx           # Không gian phòng triển lãm 3D + Chatbox
│   │   └── api/                   # Các API endpoints
│   │       ├── galleries/         # API lấy danh sách phòng trưng bày
│   │       └── exhibits/          # API lấy/xóa/sắp xếp vị trí hiện vật
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── GalleryCanvas.tsx  # Lõi R3F Canvas & Camera điều khiển
│   │   │   ├── ExhibitionRoom.tsx # Kiến trúc tường, sàn phòng 3D
│   │   │   ├── ExhibitObject.tsx  # Render tranh 2D, tượng điêu khắc 3D động
│   │   │   └── MultiplayerAvatars.tsx # Render người chơi khác trong phòng
│   │   └── ui/
│   │       └── ExhibitModal.tsx   # Modal kính mờ hiển thị chi tiết & Audio Guide
│   ├── context/
│   │   └── MuseumContext.tsx      # Quản lý React Context & Socket.io client
│   └── lib/
│       ├── db.json                # Cơ sở dữ liệu JSON cục bộ
│       └── db.ts                  # Helper CRUD DB & In-memory Caching (mô phỏng Redis)
├── ws-server.js                   # WebSocket Server Socket.io
└── package.json                   # Cấu hình dự án và scripts
```

---

## 🎮 Hướng Dẫn Trải Nghiệm Thực Tế

1. **Kiểm tra di chuyển 3D:** Truy cập [http://localhost:3000](http://localhost:3000), nhập biệt danh và chọn phòng **Tranh Sơn Dầu**. Nhấp vào các bức tranh để camera tự động zoom mượt mà đến tác phẩm và mở bảng thuyết minh.
2. **Kiểm tra Multiplayer:** Mở hai tab trình duyệt khác nhau (hoặc một tab ẩn danh), cùng vào một phòng triển lãm. Di chuyển camera ở tab 1, bạn sẽ thấy Avatar Robot của tab 1 di chuyển trực tiếp trên tab 2! Hãy thử gửi tin nhắn chat ở góc dưới trái.
3. **Thử nghiệm CMS & Builder:** 
   * Vào trang [http://localhost:3000/admin](http://localhost:3000/admin) để thêm hiện vật mới hoặc sửa thông tin.
   * Nhấn nút **Định vị 3D** cạnh hiện vật để mở giao diện Sliders chỉnh vị trí trực quan. Hãy thử kéo thanh trượt X, Y, Z để dịch chuyển tranh/tượng trong phòng 3D và nhấn **Lưu Tọa Độ Không Gian**.
