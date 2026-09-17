# Room4 — Phase 2: Spatial masterplan “Từ bàn học đến mạng lưới trở về”

**Tài liệu nguồn có thẩm quyền:** `ROOM4_TRAM_HANH_TRINH_LIEN_XO_QUANG_CHAU.md`  
**Baseline kỹ thuật:** `ROOM4_PHASE1_AUDIT.md`  
**Đối tượng triển khai Phase 3:** `src/components/3d/rooms/RoomFour.tsx` và các contract room dùng chung  
**Ngày thiết kế:** 12/08/2026  
**Trạng thái:** Hoàn thành Phase 2 — spatial masterplan, chưa triển khai code 3D

## 1. Kết luận thiết kế

Masterplan giữ nguyên hành trình:

`Phòng 03 → Nhận Thẻ → Liên Xô (Trạm 1–3) → chuyển cảnh Moscow–Quảng Châu → Quảng Châu (Trạm 4–8) → cửa ra Phòng 05`.

Không gian mới được tổ chức như một **đường dây tư tưởng dần trở thành đường dây hành động**. Phần Liên Xô là chuỗi ba khoảng dừng có nhịp chậm, sắc lạnh và tập trung vào một vật thể; hành lang giữa nén tầm nhìn và đổi nhiệt độ ánh sáng; phần Quảng Châu mở thành một cơ sở hoạt động liên hoàn, nơi khách mở nhiệm vụ, nối tổ chức, in báo, huấn luyện và kích hoạt mạng lưới trở về.

Thiết kế không xếp tám trạm thành một hàng. Các điểm dừng luân phiên trái–phải quanh một **spine ánh sáng liên tục**, có ba focal point lớn làm mốc định hướng: địa cầu Trạm 2, máy in Trạm 6 và bản đồ tuyến Trạm 8. Khách luôn tiến về phía `+Z`, không gặp ngõ cụt và không phải quay ngược hành trình.

## 2. Các ràng buộc đã khóa

### 2.1. Boundary và hệ tọa độ

| Hạng mục | Baseline Phase 2 | Trạng thái |
|---|---:|---|
| Room ID | `gallery-market-economy` | Giữ nguyên |
| Kích thước mặt bằng | `18 × 80` | Giữ nguyên |
| Local X | `-9 → +9` | Giữ nguyên |
| Local Z | `-75 → +5` | Giữ nguyên |
| Trục tiến | Z tăng dần | Giữ nguyên |
| Cửa vào từ Phòng 03 | tâm `(0, -75)`, khẩu độ X `-2 → +2` | Giữ nguyên |
| Spawn integrated | local xấp xỉ `(0, -72)` / world `(0, 133)` | Giữ nguyên nguyên tắc |
| Cửa ra sang Phòng 05 | tâm local `(0, +5)` / world `(0, 210)` | Khóa cho Phase 3 |
| Clear door axis | X `-2.2 → +2.2` trong 3 m đầu/cuối phòng | Không đặt vật thể |

Quy đổi khi chạy trong integrated lobby:

```text
worldX = localX
worldY = localY + 3
worldZ = localZ + 205
```

Chiều cao không được dùng để thay đổi boundary mặt bằng trong phase này. Phase 3 phải chuẩn hóa lỗi cộng `room_height` hai lần tại đúng một nguồn, sau đó giữ clear height theo shell đã duyệt.

### 2.2. Defect cửa ra phải xử lý ở Phase 3

Shell 18 × 80 kết thúc tại world Z `210`, nhưng một số contract cũ vẫn đặt Room5/door 5 tại Z `280`. Masterplan khóa cửa ra ở **world Z `210`** vì đây là rear boundary thật của shell đã duyệt. Phase 3 phải đồng bộ cùng một hằng số boundary cho:

- `DynamicRoom.tsx` / room offset và spawn;
- `src/app/lobby/page.tsx` / door portal, interactive door, room detection, ground height, collision;
- `MuseumContext.tsx` / spawn;
- `PlayerCharacter.tsx` / standalone bounds;
- `ws-server.js` / room range;
- door/admin state liên quan.

Phase 2 không sửa các file trên và không kéo dài room để “đuổi theo” tọa độ sai.

## 3. Zoning tổng thể

| Khu | Local Z | Chiều dài | Vai trò trải nghiệm | Dấu hiệu không gian |
|---|---:|---:|---|---|
| A. Ngưỡng nhận vai | `-75 → -67` | 8 m | Nhận Thẻ hành trình, hiểu hướng đi | Khe sáng mảnh bắt đầu tại cửa; một bàn dispatch áp tường trái; nhìn thấy đèn bàn Trạm 1 |
| B. Liên Xô | `-67 → -42` | 25 m | Học hỏi, diễn đàn, nhận vé Quảng Châu | Sàn xanh than, thép tối, kính mờ, pool ánh sáng lạnh; ba khoảng dừng tách nhịp |
| C. Chuyển cảnh | `-42 → -34` | 8 m | Chuyển tư tưởng và nhiệm vụ; không phải phần lịch sử thứ ba | Hai lớp cánh xiên nén tầm nhìn; map-line trừu tượng; gradient lạnh → hổ phách; biển `QUẢNG CHÂU — 11.11.1924` ở cuối |
| D. Quảng Châu | `-34 → +2` | 36 m | Biến tư tưởng thành tổ chức, báo chí, cán bộ, mạng lưới | Giấy in, gỗ, đỏ son và xanh đen; không khí cơ sở hoạt động; nhịp thao tác nhanh hơn |
| E. Ngưỡng kết | `+2 → +5` | 3 m | Tổng hợp hành trang và đi tiếp sang Room5 | Spine nhập lại trục cửa; biển kết đặt trên portal, không có NPC/minigame |

Ranh giới giữa các khu là thay đổi nhịp, ánh sáng và vật liệu; không dựng thêm “phòng lịch sử” ngoài hai phần Liên Xô và Quảng Châu.

## 4. Sơ đồ mặt bằng

### 4.1. Diagram quy ước

```text
                              +Z / PHÒNG 05
                 ┌───────────────┬───────────────┐
 z +5            │               CỬA RA          │
                 │      HÀNH TRANG ĐÃ SẴN SÀNG   │
 z -1            │ [S8 BẢN ĐỒ] ◀── P8 ──────────┤  focal cuối
                 │                               │
 z -9            ├──────────── P7 ──▶ [S7 LỚP]  │
                 │                               │
 z -16           │ [S6 MÁY IN] ◀─ P6            │  focal giữa
                 │                               │
 z -23           ├──────────── P5 ─▶ [S5 MẠNG]  │
                 │                               │
 z -31           │ [S4 LÝ THỤY] ◀ P4            │
 z -34           ├──── QUẢNG CHÂU 11.11.1924 ───┤
                 │       chuyển cảnh 8 m         │
 z -42           ├────── lạnh ─────── ấm ───────┤
 z -46           │             P3 ─▶ [S3 VÉ]    │
                 │                               │
 z -55           │ [S2 ĐỊA CẦU] ◀ P2            │  focal đầu
                 │                               │
 z -63           ├──────────── P1 ─▶ [S1 BÀN]   │
                 │                               │
 z -70           │ [NHẬN THẺ] ◀ P0              │
 z -72           │             SPAWN             │
 z -75           │             CỬA VÀO           │
                 └───────────────┴───────────────┘
                    X -9       X 0       X +9
                              -Z / PHÒNG 03
```

`P0…P8` là tâm khoảng dừng, không phải vật thể. Mũi tên là hướng nhìn chính tại điểm dừng. Spine không nối bằng đường gấp khúc cứng; Phase 3 dùng đường cong bán kính lớn, bề rộng rõ và liên tục.

### 4.2. Tọa độ vật thể, điểm dừng và hướng nhìn

Quy ước yaw: `0° = +Z`, `+90° = +X`, `-90° = -X`. Footprint là envelope quy hoạch trước khi cộng khoảng an toàn collider.

| Mốc | Vật thể trung tâm `(local X, Z)` | World Z | Footprint dự kiến | Điểm dừng `(local X, Z)` | Hướng nhìn | Khoảng thở chính |
|---|---:|---:|---:|---:|---:|---|
| Nhận Thẻ | `(-5.8, -70.2)` | `134.8` | `2.4 × 1.4 m` | `P0 (-2.8, -70.2)` | `-90°` | Spawn và trục cửa vẫn trống; 3 m từ điểm dừng đến bàn |
| Trạm 1 — Bàn học Moscow | `(+4.9, -63.0)` | `142.0` | `3.6 × 3.2 m` | `P1 (+1.8, -63.0)` | `+90°` | Vùng thao tác ba sách nằm trong một cụm bàn, không tách thành ba booth |
| Trạm 2 — Diễn đàn Quốc tế | `(-3.6, -54.8)` | `150.2` | `Ø 4.4 m` | `P2 (-0.3, -54.8)` | `-90°` | Có vòng đi bán nguyệt; phần treo bắt đầu trên cao độ camera |
| Trạm 3 — Vé Quảng Châu | `(+4.9, -46.2)` | `158.8` | `3.5 × 2.6 m` | `P3 (+1.8, -46.2)` | `+90°` | Cạnh sau bàn hướng ánh mắt vào transition, không tạo ngõ cụt |
| Transition datum | `(0, -38.0)` | `167.0` | clear path `≥ 3.0 m` | Không có điểm dừng bắt buộc | `0°` | Không đặt hiện vật, quiz hoặc dấu hành trình mới |
| Trạm 4 — Bàn Lý Thụy | `(-5.0, -30.7)` | `174.3` | `3.3 × 2.8 m` | `P4 (-1.8, -30.7)` | `-90°` | Ba phong bì đọc như một hành động trên cùng một bàn; tia sáng hướng về phía trước |
| Trạm 5 — Hạt nhân tổ chức | `(+3.9, -23.2)` | `181.8` | `Ø 4.2 m` | `P5 (+0.5, -23.2)` | `+90°` | Mạng treo nhìn xuyên; chân đế/collider không chiếm hết vòng nhìn |
| Trạm 6 — Xưởng in *Thanh Niên* | `(-5.0, -16.2)` | `188.8` | `3.8 × 3.0 m` | `P6 (-1.6, -16.2)` | `-90°` | Chừa vùng kéo cần 1.2 m ở cạnh tiếp cận và đường giấy chuyển động hướng sang Trạm 7 |
| Trạm 7 — Lớp học bí mật | `(+4.7, -8.8)` | `196.2` | `4.0 × 3.2 m` | `P7 (+1.3, -8.8)` | `+90°` | Ghế là dấu gợi không gian; bảng và bản đồ là một focal assembly, không dựng lớp học dày |
| Trạm 8 — Mạng lưới trở về | `(-4.9, -1.3)` | `203.7` | `4.2 × 3.0 m` | `P8 (-1.6, -1.3)` | `-90°` | Bốn tuyến đọc cùng lúc; sau tương tác, ánh sáng nhập về trục cửa |
| Cửa ra | `(0, +5.0)` | `210.0` | khẩu độ `4 × 4 m` | `P-exit (0, +3.3)` | `0°` | Clear approach X `-2.2 → +2.2`; biển kết ở trên portal |

Các tọa độ là datum cho Phase 3, sai số tinh chỉnh cho geometry tối đa `±0.35 m` nếu không làm đổi thứ tự, vùng, clear path hoặc sightline.

## 5. Circulation, khoảng dừng và collision envelope

### 5.1. Centerline bắt buộc

```text
E  (0.0, -74.0)
→ P0 (-2.8, -70.2)
→ P1 (+1.8, -63.0)
→ P2 (-0.3, -54.8)
→ P3 (+1.8, -46.2)
→ T1 (+0.5, -42.0)
→ T2 (-0.5, -34.8)
→ P4 (-1.8, -30.7)
→ P5 (+0.5, -23.2)
→ P6 (-1.6, -16.2)
→ P7 (+1.3, -8.8)
→ P8 (-1.6, -1.3)
→ X  (0.0, +4.0)
```

Đường đi tạo nhịp trái–phải nhưng luôn có vector tiến `+Z`. Không có nhánh bắt buộc, cul-de-sac hoặc thao tác yêu cầu quay lại trạm trước.

### 5.2. Quy tắc bề rộng và khoảng dừng

- Spine rõ bằng ánh sáng: `0.12–0.18 m`; vùng đi bộ liên tục quanh spine rộng tối thiểu `2.8 m`.
- Tại mỗi `P`, mở passing pocket tối thiểu `3.6 × 3.6 m` để một khách dừng không khóa lối.
- Khoảng xem từ `P` đến mép vật thể: `1.2–1.8 m`; từ `P` đến tâm focal: khoảng `3.0–3.5 m`.
- Collider quy hoạch bằng footprint + đệm `0.35 m`; collider không lấn centerline clearance.
- Vật thể treo Trạm 2 và 5 phải có clearance dưới phần thấp nhất đủ cho camera/người chơi; phần collider sàn chỉ bao chân/bệ thật.
- Không đặt ghế, dây chắn hoặc chân nhãn độc lập trên spine.
- Tại cửa vào/ra, giữ corridor X `-2.2 → +2.2` hoàn toàn trống trong tối thiểu 3 m theo Z.

### 5.3. Cơ chế giữ thứ tự mà không khóa cứng circulation

Mặt bằng không dùng tường kín để ép khách. Thứ tự được giữ bằng:

1. điểm sáng kế tiếp chỉ nổi rõ sau khi trạm hiện tại phản hồi;
2. vật thể nằm luân phiên trong tầm nhìn phía trước, không nằm sau lưng;
3. lớp tư liệu sâu chỉ mở tại trạm tương ứng;
4. Thẻ hành trình hiển thị mốc hiện tại và dấu đã nhận;
5. Phase 4 kiểm soát completion logic, không dùng chướng ngại vật hoặc quiz phạt.

## 6. Sightline và visual hierarchy

### 6.1. Chuỗi reveal

| Từ vị trí | Focal được thấy | Nội dung được che có chủ đích | Mục đích |
|---|---|---|---|
| Cửa Phòng 03 | Bàn nhận Thẻ và quầng đèn Trạm 1 | Trạm 2–8 | Khóa nghi thức bắt đầu và tránh lộ toàn bộ phòng |
| P0 | Đèn bàn Moscow | Địa cầu chỉ hiện như glow xa | Dẫn tự nhiên sang học tập |
| P1 | Địa cầu phát sáng, thấy một phần vòng treo | Bàn vé Trạm 3 | Tạo focal đầu tiên mạnh hơn bàn học |
| P2 | Mép bàn hồ sơ và con dấu đỏ Trạm 3 | Không thấy bàn Lý Thụy | Chuyển từ diễn đàn sang quyết định lên đường |
| P3 | Khe gradient và dòng `QUẢNG CHÂU — 11.11.1924` | Trạm 4 chưa lộ toàn bộ | Làm transition thành một reveal, không phải khu nội dung |
| Cuối transition | Bàn `Lý Thụy` trong pool ánh sáng ấm | Máy in và lớp học chỉ là silhouette | Xác nhận đổi trạng thái từ lý luận sang hành động |
| P4 | Mạng tổ chức treo | Trạm 6 bị che một phần bởi plane giấy | Ba nhiệm vụ mở ra một chuỗi hành động phía trước |
| P5 | Bánh đà/cần máy in | Bản đồ cuối phòng | Tạo lực hút động ở giữa phần Quảng Châu |
| P6 | Bảng đen và dải giấy dẫn sang lớp học | Chỉ thấy glow tuyến cuối | Nối báo chí với huấn luyện |
| P7 | Bản đồ nổi và đầu bốn tuyến | Biển cửa ra chỉ hiện sau khi bước tới P8 | Chuẩn bị culmination |
| P8 | Toàn bộ tuyến sáng nhập về Việt Nam và biển cửa ra | Không còn focal cạnh tranh | Kết hành trình bằng hành trang để lại |

Các reveal dùng cánh trưng bày xiên, mesh giấy, khung treo và tương phản ánh sáng; không dùng tường đặc cắt room thành nhiều box.

### 6.2. Ba cấp focal point

- **Cấp 1 — mốc định hướng toàn phòng:** Trạm 2 (địa cầu), Trạm 6 (máy in), Trạm 8 (bản đồ mạng lưới).
- **Cấp 2 — mốc kể chuyện:** Trạm 1, 3, 4, 5, 7; mỗi mốc có một pool sáng riêng nhưng không sáng hơn focal cấp 1 kế tiếp.
- **Cấp 3 — wayfinding:** Thẻ hành trình, mốc năm trên tường, spine sàn, nhãn khu và biển cửa.

Không dùng tám màu accent cho tám trạm. Cấp bậc đến từ kích thước, độ tương phản, khoảng thở và chuyển động có chủ đích.

## 7. Art direction

### 7.1. Bảng màu

| Vai trò | Liên Xô | Transition | Quảng Châu |
|---|---|---|---|
| Nền tối | Navy than `#111A24` | Navy → xanh đen | Xanh đen `#172326` |
| Bề mặt chính | Thép xanh `#2B3A46` | Thép oxy hóa / giấy chuyển sắc | Gỗ nâu `#5A3828` |
| Giấy | Trắng giấy cũ `#D8D0BF` | Giấy ngả hổ phách | Vàng giấy in `#D8B878` |
| Accent duy nhất | Đỏ trầm `#8E3437` | Đỏ trầm tăng dần | Đỏ son trầm `#A44333` |
| Line dẫn hướng | Xanh băng nhạt `#AFC9D3` | Xanh băng → hổ phách | Hổ phách `#D39A55` |
| Mực/chữ tối | `#182127` | `#202226` | Mực xanh đen `#182326` |

Màu đỏ là một accent xuyên suốt, đổi nhiệt chứ không đổi vai trò: con dấu/luận điểm ở Liên Xô trở thành mực in/tổ chức ở Quảng Châu.

### 7.2. Vật liệu

| Thành phần | Liên Xô | Quảng Châu | Nguyên tắc chung |
|---|---|---|---|
| Sàn | Bề mặt khoáng/xám xanh mờ, inlay spine | Gỗ sẫm hoặc bề mặt nâu mờ, spine hổ phách | Cùng cao độ; chuyển vật liệu bằng dải chéo trong transition, không tạo bậc |
| Khung | Thép blued, roughness cao | Thép mực đen và gỗ | Tái sử dụng module khung, thay skin vật liệu |
| Tư liệu | Giấy cũ sau kính mờ | Giấy in, giấy sáp, phong bì | Không phủ tường bằng text dài |
| Bề mặt xuyên sáng | Kính mờ ở Trạm 2 và transition | Giấy xuyên sáng ở Trạm 5/8 | Hạn chế transparency; ưu tiên emissive map/alpha test |
| Gỗ | Gỗ hun sẫm | Gỗ thao tác, có dấu mòn | Matte, tránh bóng showroom |

Không dùng chrome bóng, hologram, glass-panel UI, neon đa màu, logo doanh nghiệp hoặc mô-típ thành phố Hoa chung chung.

### 7.3. Ánh sáng

- Liên Xô: key `4300–4800 K`, ambient thấp, biên sáng gọn; cảm giác phân tích và tĩnh.
- Quảng Châu: key `2800–3200 K`, pool sáng rộng hơn, phản xạ giấy/gỗ; cảm giác đang làm việc.
- Transition: gradient kéo dài đủ 8 m, không đổi màu đột ngột tại một portal.
- Spine dùng emissive strip/decal, không tạo một point light cho mỗi đoạn.
- Budget Phase 3: tối đa **3 active scene lights** cho Room4 — một ambient/fill rất thấp, một key lạnh và một key ấm; focal phụ dùng emissive/baked light pool.
- Chỉ một nguồn được phép đổ shadow ở preset cao; low/ultra-low tắt shadow và dùng fake contact shadow.
- Không animate cường độ light qua React state trong `useFrame`; animation liên tục dùng ref hoặc state chuyển trạm rời rạc.

### 7.4. Typography trong không gian

| Cấp | Nội dung | Font direction | Quy tắc |
|---|---|---|---|
| Display | `LIÊN XÔ`, `QUẢNG CHÂU`, thông điệp cửa ra | Serif có hỗ trợ tiếng Việt, ưu tiên `Noto Serif Display` | Dùng thưa, kích thước lớn, sentence case trừ portal/exit |
| Mốc năm | `1923`, `17.10.1923`, `21.6.1925`, `1927` | Mono, ưu tiên `IBM Plex Mono` | Tabular figures, tracking dương, luôn đi kèm tên trạm ngắn |
| Nhãn/hướng dẫn | Tên trạm, một hành động | Sans hỗ trợ tiếng Việt, ưu tiên `Be Vietnam Pro` | Tương phản cao, câu ngắn, không all-caps hàng loạt |
| Tư liệu sâu | Nội dung lịch sử dài trong interaction | Sans regular/medium | Đoạn tối đa khoảng 65 ký tự mỗi dòng, `vi/en` đồng bộ |

Mỗi bề mặt chỉ giữ: **mốc thời gian + tên trạm + một kết luận ngắn**. Không dùng badge/pill, text 3D siêu nhỏ hoặc bảng chú giải lặp lại.

## 8. Mục đích trải nghiệm của từng khu và trạm

| Khu / trạm | Mục đích trong journey | Cách bố trí mới | Hành động chính giữ nguyên | Chuyển tiếp có chủ đích |
|---|---|---|---|---|
| Nhận Thẻ | Biến khách thành người đang mang hành trang | Dispatch desk lệch trái, không phải popup giữa màn hình | Nhận Thẻ hành trình 1923–1927 | Spine trên thẻ khớp với spine thật trên sàn và dẫn sang đèn bàn |
| Trạm 1 | Cho thấy lý luận được học và hệ thống hóa | Bàn học nằm trong một “island of concentration” bên phải, phần còn lại tối | Khám phá đủ ba quyển sách | Khi đủ ba, quầng đèn bàn thu gọn và glow địa cầu tăng nhẹ |
| Trạm 2 | Mở quy mô quốc tế và quan hệ chính quốc–thuộc địa | Bệ tròn lệch trái, có thể đi bán nguyệt; vòng treo tạo chiều cao | Chạm ba vòng tư liệu | Ba tuyến sáng hội tụ thành một đường đỏ dẫn đến con dấu Trạm 3 |
| Trạm 3 | Biến tri thức thành nhiệm vụ đi Quảng Châu | Bàn hồ sơ bên phải sát ngưỡng chuyển cảnh; vé là bề mặt duy nhất nổi | Đóng dấu vé Quảng Châu | Dấu in kích hoạt spine chạy xuyên hành lang và đổi nhiệt độ màu |
| Transition | Cho khách cảm nhận đổi chiến lược mà không thêm nội dung | Cánh xiên, map-line trừu tượng và dải vật liệu 8 m; không có pedestal | Chỉ đi qua | Cuối corridor reveal bàn `Lý Thụy` và mốc `11.11.1924` |
| Trạm 4 | Đặt ba nhiệm vụ làm nền cho phần Quảng Châu | Bàn làm việc lệch trái như một command desk; ba phong bì thuộc cùng focal | Mở ba phong bì | Ba tia sáng không tạo nhánh rẽ; chúng lần lượt chạm silhouette Trạm 5–7 |
| Trạm 5 | Thấy tổ chức hình thành theo trình tự | Mạng treo lệch phải, nhìn xuyên và có điểm sáng rời trước thao tác | Đặt ba điểm theo thứ tự | Điểm cuối của mạng kéo thành line giấy chạy tới máy in |
| Trạm 6 | Biến lý luận thành vật liệu truyền bá | Xưởng in lệch trái, động tác kéo cần đọc rõ từ spine | Kéo cần/chạm bàn in | Tờ báo ảo trượt theo dải dẫn hướng sang lớp học, không bay rối trong room |
| Trạm 7 | Cho thấy báo chí và lý luận được chuyển thành cán bộ | Lớp học cô đọng bên phải: một bảng–bản đồ assembly, rất ít ghế | Đặt bốn thẻ bài giảng | Bốn vùng sáng trên bản đồ thu thành bốn tia hướng tới bản đồ Trạm 8 |
| Trạm 8 | Tổng hợp toàn bộ hành trang thành mạng lưới trở về | Bản đồ nổi lớn lệch trái, đủ khoảng lùi để đọc cả bốn tuyến | Kích hoạt bốn tuyến | Dấu trên Thẻ bay lên bản đồ; tuyến cuối nhập về spine cửa ra |
| Cửa ra | Kết bằng di sản tiếp tục phát triển | Portal trống, biển kết phía trên; không đặt người chặn cửa | Đi tiếp Phòng 05 | `HÀNH TRANG ĐÃ SẴN SÀNG — CON ĐƯỜNG VỀ TỔ QUỐC` |

## 9. Thẻ hành trình — quyết định quy hoạch, chưa code

Thẻ được xem là lớp wayfinding cá nhân, không phải quest log có điểm.

### 9.1. Hai nhóm trạng thái

- **Dấu hành trang cốt lõi:** `Lý luận`, `Quan hệ`, `Phương pháp`, `Tổ chức`, `Báo chí`, `Cán bộ`, `Mạng lưới`.
- **Mốc chuyển hành trình:** vé `Quảng Châu — 11/1924` và ba nhiệm vụ của `Lý Thụy`.

Trạm 2 củng cố `Lý luận`, mở mới `Quan hệ` và `Phương pháp`. Trạm 8 hiển thị năm kết quả cuối theo visitor journey nhưng Thẻ vẫn giữ lịch sử đầy đủ bảy dấu. Không thêm dấu thứ tám hoặc trạm thứ chín.

### 9.2. Quan hệ với không gian

- Màu line trên Thẻ luôn trùng màu spine tại vùng hiện tại.
- Trạng thái chưa khám phá dùng giấy mờ, không dùng khóa đỏ/cảnh báo.
- Khi hoàn thành trạm, phản hồi gồm một chuyển động vật thể, một thay đổi light pool và một cập nhật Thẻ; không confetti, điểm số hoặc countdown.
- Khi quay lại Room4, Thẻ phục hồi tiến trình nhưng focal kế tiếp vẫn nằm phía trước, không teleport khách giữa hành trình.

## 10. Nguyên tắc triển khai cho Phase 3

### 10.1. Kiến trúc và dựng hình

- Dựng một room shell mới cho Room4 theo đúng 18 × 80 nhưng giữ contract `RoomFour → BaseRoomPlain` hoặc tách shell chuyên dụng mà không đổi `ExhibitionRoom` contract.
- Xóa/không render toàn bộ `FIRST_ROOM_EXHIBITS`, năm zone kinh tế, sáu NPC, Ronaldo và vách Z `-50` cũ.
- Dùng các datum trong mục 4.2 cho placeholder pedestal/footprint; Phase 3 chưa dựng interaction chi tiết.
- Module hóa cold zone, transition, warm zone và exit; không tạo tám component nặng chỉ để lặp geometry khung.
- Reuse geometry/material cho spine, frame, label rail và cánh trưng bày.
- Dùng opaque/alpha-test trước transparent; tránh nhiều `Html occlude`.

### 10.2. Camera, collision và hiệu năng

- Kiểm tra camera FOV hiện tại `65°` từ mọi `P`; focal không bị cắt trên laptop nhỏ.
- Collider lấy từ cùng data layout với geometry, không chép tay một danh sách tọa độ thứ hai.
- Không gọi React `setState` trong `useFrame`; animation dùng delta và ref.
- Không tạo material/vector/array mới mỗi frame.
- Preset low/ultra-low giữ nguyên hành trình, chỉ giảm shadow, texture resolution và chi tiết phụ.
- Integrated lobby và standalone gallery phải dùng cùng local layout và cùng exit boundary Z `210` world.

## 11. Protocol demo/nghiệm thu Phase 2

Phase 2 được review bằng sơ đồ/tọa độ, không bằng scene 3D.

1. Bắt đầu tại `E (0, -74)` và lần theo centerline ở mục 5.1 tới `X (0, +4)`.
2. Xác nhận không có segment quay về `-Z`, không có điểm cụt và cửa X `±2.2` luôn trống.
3. Đọc lần lượt nhãn: `Nhận Thẻ → 1 → 2 → 3 → transition → 4 → 5 → 6 → 7 → 8 → cửa ra`.
4. Xác nhận ba trạm Liên Xô nằm trước transition và năm trạm Quảng Châu nằm sau transition.
5. Xác nhận transition không có station, dấu, quiz hoặc nội dung lịch sử độc lập.
6. Kiểm tra các object center luân phiên trái–phải và ba focal cấp 1 ở Trạm 2, 6, 8; không có một hàng pedestal đều nhau.
7. Kiểm tra mỗi trạm chỉ có một central object, một hành động và một thông điệp.
8. Đối chiếu palette/vật liệu/light: lạnh–phân tích ở Liên Xô, ấm–hoạt động ở Quảng Châu, gradient dài 8 m ở giữa.
9. Xác nhận cửa ra local Z `+5` = world Z `210`, được ghi thành defect đồng bộ Phase 3 thay vì làm sai boundary 18 × 80.
10. Xác nhận không có thay đổi code 3D trong Phase 2.

## 12. Ma trận nghiệm thu Phase 2

| Tiêu chí | Bằng chứng trong masterplan | Kết quả |
|---|---|---|
| Giữ room boundary, cửa và trục chính | Mục 2, 3, 4 | Đạt |
| Đúng thứ tự hành trình | Mục 1, 4, 5, 8 | Đạt |
| Có vị trí, hướng nhìn, khoảng dừng cho mọi trạm | Mục 4.2 | Đạt |
| Không xếp trạm thành một hàng | Sơ đồ 4.1 và tọa độ X luân phiên | Đạt |
| Circulation liên tục, không cul-de-sac | Centerline mục 5.1 | Đạt |
| Có focal point, sightline, khoảng thở và spine | Mục 5–6 | Đạt |
| Hai art direction lạnh–ấm rõ | Mục 7 | Đạt |
| Transition không thành phần lịch sử thứ ba | Mục 3, 6, 8 | Đạt |
| Mỗi khu có mục đích trải nghiệm rõ | Mục 8 | Đạt |
| Chưa triển khai code 3D | Phạm vi thay đổi mục 13 | Đạt |

## 13. Phạm vi thay đổi của Phase 2

Phase 2 chỉ thêm tài liệu spatial masterplan này và một visualization review tách khỏi repository. Không thay đổi:

- `RoomFour.tsx`;
- room shell hoặc 3D assets;
- UI, Journey Card, quest/minigame;
- collision, spawn, door, navigation hoặc server;
- dữ liệu gallery và persistence.

Phase 3 chỉ bắt đầu sau khi các datum, tọa độ cửa ra world Z `210`, art direction và circulation trong tài liệu này được duyệt.
