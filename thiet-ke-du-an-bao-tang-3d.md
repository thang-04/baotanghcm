# TÀI LIỆU THIẾT KẾ DỰ ÁN: HỆ THỐNG BẢO TÀNG ẢO 3D (3D VIRTUAL MUSEUM PLATFORM)

Tài liệu này mô tả chi tiết kiến trúc kỹ thuật, thiết kế hệ thống và chiến lược triển khai cho nền tảng Bảo tàng ảo 3D. Hệ thống hướng tới việc cung cấp trải nghiệm tham quan không gian triển lãm sống động trên môi trường web, kết hợp giữa tương tác thời gian thực và quản lý nội dung số động.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

Nền tảng Bảo tàng 3D bao gồm ba khối thành phần chính:
1. **Không gian trải nghiệm 3D (Core 3D Engine):** Không gian tương tác nhúng trực tiếp trên giao diện web, chịu trách nhiệm xử lý đồ họa, vật lý di chuyển và va chạm.
2. **Hệ thống Giao diện ứng dụng (Frontend Web App):** Lớp bọc UI xử lý luồng người dùng, hiển thị thông tin chi tiết (metadata) của hiện vật, quản lý trạng thái tải (loading state) và kết nối với Backend API.
3. **Hệ thống Quản trị & Cơ sở dữ liệu (Backend CMS & Storage):** Hệ thống API quản lý thông tin, lưu trữ tài nguyên mô hình 3D (asset management), phân quyền người dùng và tối ưu hóa hiệu năng truy vấn.

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình kiến trúc phân lớp hướng dịch vụ (Service-Oriented Architecture), đảm bảo tính module hóa cao và khả năng mở rộng (scalability).

```
[ Người dùng / Trình duyệt ]
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │                   FRONTEND PLATFORM                    │
 │  Next.js (React Framework)                             │
 │  ├── Core 3D Layer: Unity WebGL / React Three Fiber    │
 │  └── UI Overlay: Tailwind CSS / State Management       │
 └───────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API / WebSockets
                         ▼
 ┌────────────────────────────────────────────────────────┐
 │                    BACKEND CORE API                    │
 │  NestJS Framework (TypeScript)                         │
 │  ├── REST & GraphQL Controllers                        │
 │  └── Business Logic Services (Repository Pattern)       │
 └───────┬───────────────────────┬────────────────────────┘
         │                       │
         ▼                       ▼
 ┌──────────────────────┐┌────────────────────────────────┐
 │     CACHING LAYER    ││        DATABASE LAYER          │
 │  Redis               ││  PostgreSQL                    │
 │  (Session & Metadata)││  (Relational Data / Storage)   │
 └──────────────────────┘└────────────────────────────────┘
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │               ASSET MANAGEMENT & CONTENT DELIVERY      │
 │  Cloud Storage (AWS S3 / Cloudflare R2)                │
 │  └── CDN (Cloudflare) -> Caching 3D Models (.glb)      │
 └────────────────────────────────────────────────────────┘
```

### 2.1. Công nghệ Lựa chọn (Technology Stack)
* **Client-side UI:** Next.js (App Router), Tailwind CSS.
* **3D Graphics Engine:** Unity 3D (xuất bản WebGL) hoặc Three.js (React Three Fiber) để dựng không gian tương tác trực tiếp.
* **Server-side Server:** NestJS (kiến trúc Modular, quản lý Dependency Injection chặt chẽ).
* **Database:** PostgreSQL (lưu trữ quan hệ đảm bảo tính toàn vẹn dữ liệu).
* **Caching & Message Broker:** Redis.
* **Storage & CDN:** Cloudflare R2 / AWS S3 kết hợp Cloudflare CDN để tăng tốc độ truyền tải các tệp đồ họa nặng.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

Cơ sở dữ liệu PostgreSQL được thiết kế chuẩn hóa để quản lý cấu trúc không gian bảo tàng, danh mục triển lãm và thông tin chi tiết của từng hiện vật.

### 3.1. Sơ đồ Thực thể Quan hệ (Entity Relationship - RDBMS)

#### Bảng `users` (Quản lý tài khoản quản trị và người dùng)
| Trường dữ liệu | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Định danh duy nhất |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Địa chỉ email đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu băm (bcrypt) |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'user' | Phân quyền (admin, moderator, user) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Thời gian khởi tạo |

#### Bảng `galleries` (Quản lý các phòng/không gian triển lãm)
| Trường dữ liệu | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Định danh phòng triển lãm |
| `name` | VARCHAR(255) | NOT NULL | Tên phòng (Ví dụ: Tranh Sơn Dầu) |
| `description` | TEXT | NULL | Mô tả về chủ đề không gian |
| `scene_asset_url`| VARCHAR(512) | NOT NULL | Đường dẫn file cấu hình 3D (.glb/WebGL binary) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Trạng thái hiển thị |

#### Bảng `exhibits` (Danh mục hiện vật trưng bày)
| Trường dữ liệu | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Định danh hiện vật |
| `gallery_id` | UUID | FOREIGN KEY REFERENCES `galleries(id)`| Thuộc không gian triển lãm nào |
| `title` | VARCHAR(255) | NOT NULL | Tên tác phẩm/hiện vật |
| `author` | VARCHAR(255) | DEFAULT 'Unknown' | Tác giả |
| `description` | TEXT | NOT NULL | Nội dung thuyết minh chi tiết |
| `model_3d_url` | VARCHAR(512) | NULL | Đường dẫn file 3D chi tiết của hiện vật |
| `thumbnail_url`| VARCHAR(512) | NOT NULL | Ảnh 2D xem trước của hiện vật |
| `coordinate_x` | FLOAT | NOT NULL, DEFAULT 0.0 | Tọa độ đặt hiện vật trong không gian 3D (X) |
| `coordinate_y` | FLOAT | NOT NULL, DEFAULT 0.0 | Tọa độ đặt hiện vật trong không gian 3D (Y) |
| `coordinate_z` | FLOAT | NOT NULL, DEFAULT 0.0 | Tọa độ đặt hiện vật trong không gian 3D (Z) |

---

## 4. KIẾN TRÚC MÃ NGUỒN BACKEND (NESTJS)

Mã nguồn Backend áp dụng **Repository Pattern** kết hợp với kiến trúc Module để tách biệt lớp xử lý dữ liệu khỏi Logic nghiệp vụ.

```
src/
├── app.module.ts
├── common/
│   ├── interceptors/
│   └── middleware/
├── modules/
│   ├── auth/
│   ├── galleries/
│   └── exhibits/
│       ├── exhibits.module.ts
│       ├── exhibits.controller.ts
│       ├── exhibits.service.ts
│       ├── entities/
│       │   └── exhibit.entity.ts
│       └── repositories/
│           └── exhibit.repository.ts
└── config/
```

### 4.1. Chiến lược Tối ưu hóa với Redis Caching
Để tránh thắt nút cổ chai (bottleneck) tại Database khi hàng ngàn client cùng lúc truy cập và bóc tách tọa độ dữ liệu hiện vật khi tải map 3D, hệ thống áp dụng cơ chế Caching:
* Khi người dùng vào một `gallery`, hệ thống kiểm tra Redis Cache trước qua Key `gallery:{id}:exhibits`.
* Nếu có (Cache Hit): Trả về dữ liệu ngay lập tức với độ trễ < 2ms.
* Nếu không có (Cache Miss): Truy vấn PostgreSQL, ghi dữ liệu vào Redis với thời gian hết hạn (TTL: 2 giờ), sau đó trả về client.

---

## 5. THIẾT KẾ PHÂN RÃ CHỨC NĂNG (FUNCTIONAL BREAKDOWN)

### 5.1. Luồng Tương tác giữa 3D Không gian và UI Web
Một trong những thách thức lớn nhất là đồng bộ hóa trạng thái giữa môi trường đồ họa 3D (WebGL/Three.js) và ứng dụng Next.js.

```
[ Người dùng click vào Hiện vật 3D ]
                 │
                 ▼
 [ 3D Engine phát hiện sự kiện Raycast ]
                 │
                 ▼
 [ Gửi Event chứa Exhibit_ID qua Web Bridge (window.dispatch) ]
                 │
                 ▼
 [ Next.js lắng nghe Event -> Kích hoạt State Pop-up ]
                 │
                 ▼
 [ Next.js gọi API đến NestJS để lấy chi tiết hiện vật (hoặc lấy từ Cache) ]
                 │
                 ▼
 [ Hiển thị Modal thông tin chi tiết mượt mà trên UI 2D ]
```

### 5.2. Chức năng Quản trị (Admin CMS)
* **Quản lý không gian:** Upload cấu hình phòng triển lãm, thiết lập sơ đồ mặt bằng trực quan.
* **Định vị hiện vật trực quan:** Admin có thể cấu hình trực tiếp tọa độ (X, Y, Z) của hiện vật trên trang quản trị hoặc kéo thả vật thể trong chế độ thiết kế trước khi lưu vào database.

---

## 6. CHIẾN LƯỢC TRIỂN KHAI VÀ DEPLOYMENT

Để đảm bảo hiệu năng tải trang tốt nhất cho một ứng dụng nặng về đồ họa, hạ tầng được chia nhỏ và tối ưu hóa chuyên biệt.

### 6.1. Quy trình CI/CD và Phân phối Tĩnh (Assets Deployment)
1. **Build WebGL/Static Assets:** Toàn bộ dữ liệu mô hình 3D (.glb, .gltf) và file build nhị phân của lõi 3D được nén chặt bằng thuật toán **Brotli** hoặc **Gzip** để giảm dung lượng file xuống tối đa (đảm bảo file map < 20MB).
2. **CDN Distribution:** Đẩy toàn bộ assets tĩnh lên Cloudflare R2 / AWS S3. Thiết lập chính sách `Cache-Control: public, max-age=31536000` tại tầng Cloudflare CDN để người dùng ở bất kỳ khu vực nào cũng có thể tải tài nguyên từ các Edge Server gần nhất với tốc độ cao.

### 6.2. Triển khai Ứng dụng (App Deployment)

* **Frontend (Next.js):**
  * Deploy trên nền tảng **Vercel** để tối ưu hóa khả năng phân phối Server-Side Rendering (SSR) cho các trang tĩnh tĩnh (SEO hiện vật) và tự động cân bằng tải.
* **Backend API (NestJS):**
  * Đóng gói ứng dụng bằng **Docker Container**.
  * Triển khai trên các dịch vụ Cloud Cloud (như AWS EC2, Railway, hoặc Render) hỗ trợ cơ chế tự động khởi động lại và giám sát log.
* **Database & Caching:**
  * Sử dụng Cloud Managed PostgreSQL (ví dụ: Supabase hoặc Neon) để tận dụng tính năng tự động sao lưu và mở rộng dung lượng.
  * Triển khai cụm Redis Cloud instance tách biệt để phục vụ lưu trữ đệm tốc độ cao.
