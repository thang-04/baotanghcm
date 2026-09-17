# Room4 — Phase 1: Phân tích hành trình và audit hiện trạng

**Tài liệu nguồn có thẩm quyền:** `ROOM4_TRAM_HANH_TRINH_LIEN_XO_QUANG_CHAU.md`  
**Đối tượng audit chính:** `src/components/3d/rooms/RoomFour.tsx`  
**Ngày audit:** 12/08/2026  
**Trạng thái:** Hoàn thành Phase 1 — không sửa code sản phẩm

## 1. Kết luận điều hành

Visitor journey đích là một hành trình lịch sử tuyến tính gồm hai phần nội dung, tám trạm và một hành lang chuyển cảnh:

`Phòng 03 → Nhận Thẻ hành trình → Liên Xô (Trạm 1–3) → chuyển cảnh Moscow–Quảng Châu → Quảng Châu (Trạm 4–8) → Hành trang về Tổ quốc → Phòng 05`.

Hiện trạng Room4 chưa thể hiện hành trình này. Không gian hiện tại kể câu chuyện **Kinh tế thị trường định hướng xã hội chủ nghĩa Việt Nam (1996–nay)** bằng năm phân khu, sáu NPC, một quest log và một minigame phân loại có điểm. Vì vậy, phần nội dung, hiện vật, hình ảnh, NPC, tiến trình và UI hiện tại đều xung đột trực tiếp với tài liệu nguồn 1923–1927.

Tuy nhiên, một số nền tảng kỹ thuật có thể giữ lại và tái sử dụng:

- ID phòng `gallery-market-economy`, cơ chế `DynamicRoom → ExhibitionRoom → RoomFour`.
- Room shell hiện hành rộng 18, dài 80, có cửa giữa ở hai đầu và trục di chuyển dọc Z.
- Cơ chế chọn hiện vật qua `setSelectedExhibit`, modal thông tin song ngữ, pointer interaction và camera inspect.
- Hạ tầng lưu tiến trình theo nickname, hỗ trợ `vi/en`, cửa do admin điều khiển, teleport, multiplayer và graphics presets.
- Mẫu animation bằng ref trong `useFrame`, Suspense, visibility/LOD và texture loading.

Kết luận thiết kế cho các phase sau: **giữ shell, trục lưu thông, quan hệ cửa và hạ tầng dùng chung; thay toàn bộ nội dung và trải nghiệm bên trong bằng đúng tám trạm của hành trình Liên Xô–Quảng Châu.**

## 2. Nguồn và phạm vi đã kiểm tra

### 2.1. Nguồn nội dung bắt buộc

- Toàn bộ visitor journey trong `ROOM4_TRAM_HANH_TRINH_LIEN_XO_QUANG_CHAU.md`.
- Hai phần nội dung: Liên Xô và Quảng Châu.
- Tám trạm theo đúng thứ tự.
- Hành lang chuyển cảnh Moscow → Quảng Châu.
- Thẻ hành trình 1923–1927 và hệ dấu ấn.
- Thông điệp cửa ra: **“HÀNH TRANG ĐÃ SẴN SÀNG — CON ĐƯỜNG VỀ TỔ QUỐC”.**

### 2.2. Code và dữ liệu hiện trạng đã kiểm tra

- `src/components/3d/rooms/RoomFour.tsx`
- `src/components/3d/rooms/BaseRoomPlain.tsx`
- `src/components/3d/DynamicRoom.tsx`
- `src/components/3d/ExhibitionRoom.tsx`
- `src/components/3d/PlayerCharacter.tsx`
- `src/components/3d/GalleryCanvas.tsx`
- `src/components/ui/MarketEconomyQuest.tsx`
- `src/context/MuseumContext.tsx`
- `src/app/lobby/page.tsx`
- `src/lib/db/gallery-market-economy.json`
- `ws-server.js`
- Asset hiện có trong `public/images/room4/`

## 3. Visitor journey chuẩn hóa từ tài liệu nguồn

### 3.1. Cấu trúc kể chuyện

| Chặng | Vai trò trong hành trình | Trạng thái trải nghiệm cần đạt |
|---|---|---|
| Cửa vào từ Phòng 03 | Trao Thẻ hành trình 1923–1927, thiết lập mục tiêu | Khách hiểu mình đang bắt đầu một hành trình, không chỉ xem một gallery |
| Phần I — Liên Xô | Học hỏi, phát biểu, kết nối quốc tế | Lạnh, phân tích, lý luận; vật liệu thép tối, giấy, kính mờ, gỗ sẫm |
| Trạm 1–3 | Tích lũy lý luận, quan hệ, phương pháp và nhiệm vụ đi Quảng Châu | Mỗi trạm có một vật thể trung tâm, một hành động chính, một kết luận ngắn |
| Hành lang chuyển cảnh | Chuyển tư tưởng và nhiệm vụ từ Moscow sang Quảng Châu | Gradient lạnh → hổ phách/đỏ; không được trở thành “phần lịch sử thứ ba” |
| Phần II — Quảng Châu | Biến hành trang thành tổ chức, báo chí, cán bộ và mạng lưới | Ấm, giàu hoạt động; cảm giác cơ sở bí mật, xưởng in và lớp huấn luyện |
| Trạm 4–8 | Biến tư tưởng thành lực lượng trở về Việt Nam | Khách trực tiếp mở, nối, in, đặt và kích hoạt thay vì trả lời trắc nghiệm |
| Cửa ra Phòng 05 | Tổng hợp những gì còn tiếp tục phát triển sau 1927 | Kết bằng di sản để lại, không kết bằng việc rời Quảng Châu |

### 3.2. Nhịp trải nghiệm bắt buộc

1. **Nhận vai:** nhận Thẻ hành trình.
2. **Khám phá:** mở ba lớp tri thức tại bàn học Moscow.
3. **Kết nối:** kích hoạt ba diễn đàn quốc tế.
4. **Chuyển nhiệm vụ:** đóng dấu vé Quảng Châu.
5. **Chuyển trạng thái:** đi qua hành lang lạnh–ấm.
6. **Nhận nhiệm vụ:** mở ba phong bì của Lý Thụy.
7. **Hình thành tổ chức:** nối hạt nhân bí mật đến cơ sở trong nước.
8. **Truyền bá:** vận hành xưởng in báo *Thanh Niên*.
9. **Huấn luyện:** đặt bốn thẻ bài giảng lên bản đồ.
10. **Trở về:** kích hoạt bốn tuyến liên lạc.
11. **Tổng hợp:** đưa toàn bộ dấu ấn lên bản đồ và mở thông điệp cửa ra.

## 4. Ma trận tám trạm — baseline bắt buộc cho các phase sau

| # | Phần / mốc | Nội dung lịch sử bắt buộc | Vật thể trung tâm duy nhất | Hành động khám phá chính | Thông điệp ngắn / kết quả | Phản hồi trên Thẻ hành trình | Yêu cầu không gian |
|---|---|---|---|---|---|---|---|
| 1 | Liên Xô — Moscow, 1923 | Nguyễn Ái Quốc học tại Trường Đại học Cộng sản của những người lao động phương Đông; củng cố lý luận và nghiên cứu thực tiễn Xô-viết | Bàn học Moscow với sách, bản đồ, thẻ sinh viên và đèn bàn | Khám phá đủ ba quyển: `Học lý luận`, `Nghiên cứu thực tiễn`, `Kết nối các dân tộc thuộc địa` | Học để hệ thống hóa con đường cách mạng | Dấu **Lý luận** | Điểm dừng đầu tiên sau nhận thẻ; ánh sáng bàn là focal point; đủ chỗ tiếp cận ba cuốn nhưng đọc như một cụm thống nhất |
| 2 | Liên Xô — 1923–1924 | Hội đồng Quốc tế Nông dân 17/10/1923; Đại hội V Quốc tế Cộng sản 23/6/1924; Đại hội III Quốc tế Công hội Đỏ 21/7/1924 | Địa cầu phát sáng trên bệ tròn thấp, ba vòng tư liệu treo phía trên | Chạm lần lượt ba vòng để mở các tuyến sáng nối chính quốc với thuộc địa | Cách mạng thuộc địa gắn với phong trào quốc tế | Hiện ba từ khóa **Lý luận — Quan hệ — Phương pháp**; tối thiểu bổ sung **Quan hệ** và **Phương pháp** sau dấu của Trạm 1 | Không gian tròn hoặc bán tròn, có thể đi quanh; cao độ vòng treo không cản camera; địa cầu là focal point thứ hai |
| 3 | Liên Xô — 11/1924 | Nguyễn Ái Quốc được cử đến Quảng Châu với tư cách Ủy viên Ban Phương Đông Quốc tế Cộng sản và Ủy viên Đoàn Chủ tịch Quốc tế Nông dân | Bàn hồ sơ và vé hành trình | Đóng dấu Quốc tế Cộng sản lên vé Quảng Châu — 11/1924 | “Từ đây, tư tưởng được chuyển thành kế hoạch tổ chức cách mạng Việt Nam.” | Vé hành trình **Quảng Châu — 11/1924** là trạng thái chuyển tiếp | Đặt sát đầu hành lang chuyển cảnh; hướng nhìn phải kéo khách về phía gradient Moscow → Quảng Châu |
| 4 | Quảng Châu — 11/11/1924 | Bí danh Lý Thụy; danh nghĩa công khai trong phái bộ Bôrôđin; ba nhiệm vụ: đào tạo thanh niên, xây dựng tổ chức, theo dõi và báo cáo phong trào | Bàn làm việc `Lý Thụy` với ba phong bì niêm phong | Mở đủ ba phong bì nhiệm vụ | Một căn cứ hoạt động bắt đầu từ ba nhiệm vụ rõ ràng | Dấu **Nhiệm vụ** theo mô tả trạm | Điểm neo đầu phần ấm; ba tia sáng sau hoàn thành phải dẫn thị giác tới các khu tiếp theo, không tạo ba lối rẽ bắt buộc |
| 5 | Quảng Châu — 1925 | Nhóm bí mật/Cộng sản đoàn hình thành từ thành viên tích cực Tâm Tâm xã; tháng 6/1925 thành lập Hội Việt Nam Cách mạng Thanh niên | Mô hình mạng lưới treo với các điểm sáng rời | Đặt ba điểm đúng trình tự: `Cộng sản đoàn → Hội Việt Nam Cách mạng Thanh niên → cơ sở trong nước` | “Tổ chức là cách biến lý tưởng thành lực lượng.” | Dấu **Tổ chức** | Có khoảng trống nhìn xuyên qua mạng treo; thao tác tuần tự nhưng không dùng điểm số; lối đi tiếp tục tiến về phía trước |
| 6 | Quảng Châu — 21/6/1925 | Số đầu tiên báo *Thanh Niên*; báo tiếng Việt truyền bá chủ nghĩa Mác–Lênin, đường lối cách mạng và được bí mật đưa về nước | Máy in mô phỏng với giấy sáp, con lăn, tiêu đề *Thanh Niên* | Kéo cần hoặc chạm bàn in để tạo một tờ báo ảo | `Truyền bá lý luận` · `Thức tỉnh lòng yêu nước` · `Đưa tư tưởng về nước`; mốc `21/6/1925` | Dấu **Báo chí** | Cảm giác xưởng hoạt động; cần khoảng tiếp cận rõ cho cần in; giấy in tạo chuyển động dẫn sang lớp học |
| 7 | Quảng Châu — giữa 1925 đến trước 4/1927 | Hơn 10 lớp, khoảng 75 hội viên; lý luận, bí mật, tuyên truyền, quần chúng; bài giảng tập hợp thành *Đường Kách mệnh* (1927) | Bảng đen/lớp học bí mật với bàn giảng nhỏ | Đặt bốn thẻ `Lý luận`, `Bí mật`, `Tuyên truyền`, `Quần chúng` lên bản đồ Việt Nam để làm sáng Bắc Kỳ, Trung Kỳ, Nam Kỳ, Xiêm | Đào tạo cán bộ để tri thức có thể đi tiếp | Dấu **Cán bộ** | Không gian tập trung, kín đáo; camera đọc được bảng và bản đồ; ghế chỉ gợi lớp học, không biến thành vật cản dày đặc |
| 8 | Quảng Châu — mạng lưới trở về | Quảng Châu là đầu mối tiếp nhận, huấn luyện, đưa cán bộ và báo chí về nước; các tuyến qua Móng Cái, Lạng Sơn, Hồng Kông và Xiêm | Bản đồ nổi Quảng Châu — Việt Nam — Xiêm — Hồng Kông | Kích hoạt bốn tuyến liên lạc để chúng sáng như mạch máu | Tư tưởng đã trở thành tổ chức, báo chí, cán bộ và mạng lưới trở về Việt Nam | Dấu **Mạng lưới**; tổng hợp dấu ấn lên bản đồ | Focal point cuối phòng; đủ chiều rộng để đọc bốn tuyến; hướng nhìn cuối phải kết thúc tại biển cửa ra Room5 |

## 5. Audit hiện trạng kỹ thuật và không gian

### 5.1. Room shell thực tế

| Hạng mục | Hiện trạng xác minh | Đánh giá / quyết định Phase 1 |
|---|---|---|
| Gallery ID | `gallery-market-economy` | **Giữ.** Đây là khóa tích hợp với DB, context, admin, doors và multiplayer |
| Kích thước dữ liệu | `room_width: 18`, `room_length: 80`, `room_height: 6` trong JSON | **Giữ boundary 18 × 80** trừ khi chủ dự án phê duyệt thay đổi ở ngoài phạm vi journey |
| Kích thước render | `RoomFour` cộng 1 vào height rồi `BaseRoomPlain` cộng thêm 1 lần nữa; chiều cao shell thực tế thành 8 thay vì 7 | **Lỗi hiện trạng.** Phase sau phải chuẩn hóa một nơi tính chiều cao nhưng không đổi boundary đã duyệt |
| Hệ tọa độ local | Shell dài 80 có `zOffset = (80 - 150) / 2 = -35`, nên chạy từ local Z `-75` đến `5`; X từ `-9` đến `9` | **Giữ làm baseline mặt bằng.** Trục tiến chính là Z tăng dần |
| Hệ tọa độ world trong lobby | `ROOM_OFFSETS['gallery-market-economy'].z = 205`, nên shell chạy world Z `130` đến `210` | **Giữ entrance Z 130 và rear boundary Z 210** cho spatial masterplan; phải đồng bộ cửa ra |
| Cửa shell | Hai đầu có khẩu độ giữa rộng 4 (X `-2` đến `2`), cao 4 | **Giữ vị trí và quan hệ cửa.** Không đặt trạm chắn trục cửa |
| Spawn standalone | Local `[0, baseY, -70]` | **Giữ nguyên tắc spawn gần cửa vào**, nhưng tọa độ dùng chung cần thống nhất |
| Spawn integrated | World `[0, 3, 133]` từ lobby/context/server | **Giữ.** Cách cửa vào 3 đơn vị, phù hợp vùng nhận Thẻ hành trình |
| Vách hiện tại | Một vách tại local Z `-50`, cửa giữa rộng 6 (X `-3` đến `3`) | Có thể **cải tiến** thành ngưỡng phân phần hoặc loại bỏ trong masterplan; không phải boundary ngoài |
| Trục lưu thông | Đi thẳng từ local `-75` tới `5`; content chia hai bên ở các mốc dọc | **Giữ hướng tiến một chiều** nhưng thiết kế lại nhịp dừng, sightline và chuyển cảnh |

### 5.2. Cửa và điều hướng liên phòng

| Hệ thống | Hiện trạng | Mức độ |
|---|---|---|
| Cửa Phòng 03 → Room4 | `door-room4` ở world Z 130; transition spawn Room4 tại Z 133 | Phù hợp shell hiện tại; **giữ** |
| Cửa Room4 → Room5 | `door-room5` được cấu hình ở world Z 280; Room5 spawn Z 282 | **Không khớp** với rear boundary Room4 ở Z 210 |
| Room4 current-room update | Trong lobby, Z `130–210` là Room4; khi Z > 210 người chơi bị đưa về lobby | **Xung đột nghiêm trọng** với journey bắt buộc đi tiếp Room5 |
| Collision tổng quát | Một nhánh coi Room4 chạy Z `130–280`, tường sau/cửa Room5 tại Z 280 | **Không khớp** với shell render và current-room update |
| WebSocket room detection | Server coi Room4 chạy Z `130–280` | **Không khớp** với shell 80 và client update |
| Ground-height helper | Một nhánh chỉ gán sàn Room4 đến Z 245 | **Không khớp** với cả mốc 210 và 280 |
| LOD | `DynamicRoom` ẩn khi player cách tâm room hơn 48; tâm là Z 205 | Hợp với shell Z 130–210 khi chỉ render room hiện tại; cần kiểm tra lại sau khi đồng bộ exit |

**Defect cấu trúc P0 cho Phase 2/3:** cần chọn một hệ tọa độ duy nhất cho cửa ra Room5. Với yêu cầu “giữ room boundary” và shell hiện tại 18 × 80, lựa chọn ít phá vỡ nhất là đặt quan hệ exit Room4 tại rear boundary Z 210 và cập nhật đồng bộ door/transition/collision/server. Phase 1 chỉ ghi nhận, không sửa.

### 5.3. Bố trí nội dung hiện tại

| Vùng local Z | Hiện trạng | Đối chiếu journey mới |
|---|---|---|
| `-75 → -50` | 10 tranh về Viettel, Samsung, VinFast, siêu thị, BHYT, cảng biển, cao tốc, chợ, container, EVN; NPC hướng dẫn Nguyễn Minh Tâm ở Z `-60` | Toàn bộ nội dung sai giai đoạn và sai câu chuyện; **loại khỏi Room4 mới** |
| `-50` | Vách giữa có cửa rộng 6 | Có thể tái diễn giải thành ngưỡng vào Phần I hoặc bỏ; không được tự động coi là hành lang Moscow–Quảng Châu nếu không đúng nhịp Trạm 3 → Trạm 4 |
| `-41`, hai bên | Zone 1: ba bệ Viettel/VinFast/Samsung; Zone 2: cân cung–cầu và giá động; hai NPC chuyên gia | Sai nội dung; **thay hoàn toàn** bằng các trạm lịch sử theo đúng thứ tự |
| `-23`, hai bên | Zone 3: sa bàn cao tốc, điện gió, sách luật; Zone 4: cây ánh sáng và ba khung an sinh; hai NPC | Sai nội dung; **thay hoàn toàn** |
| `-9.5` | Zone 5: địa cầu, cảng container, logo ASEAN/WTO/Intel; NPC hội nhập | Sai nội dung; **thay hoàn toàn**. Chỉ mô-típ mạng/tuyến sáng có thể tái dùng ở cấp kỹ thuật, không tái dùng nội dung |
| `2` | NPC Ronaldo mở minigame phân loại | Xung đột nghiêm trọng với thông điệp cửa ra; **loại bỏ** |

### 5.4. Nội dung, tương tác và UI hiện tại

| Thành phần | Hiện trạng | Giữ / cải tiến / loại bỏ |
|---|---|---|
| Năm zone kinh tế | Nhiều thành phần; cung–cầu; Nhà nước quản lý; công bằng xã hội; hội nhập quốc tế | **Loại bỏ nội dung và bố cục** |
| Sáu NPC | Năm chuyên gia mở tuần tự + Ronaldo cuối phòng | **Loại bỏ nhân vật và lời thoại.** Không dùng NPC làm xương sống mới vì nguồn yêu cầu vật thể/hành động tại từng trạm |
| Quest log | `MarketEconomyQuest` theo dõi `talkedNpcs` 0/5, có confetti | **Thay** bằng Thẻ hành trình 1923–1927; có thể tái sử dụng hạ tầng panel/progress |
| Minigame | Kéo-thả tình huống vào năm nhóm; countdown, điểm số, đúng/sai, localStorage score | **Loại bỏ hoàn toàn.** Vi phạm nguyên tắc không trắc nghiệm, không điểm số, không trừng phạt |
| Modal hiện vật | Click mesh gọi `setSelectedExhibit`, mở thông tin dài song ngữ và camera inspect | **Giữ và cải tiến** làm lớp tư liệu sâu cho tám trạm |
| Tiến trình | `talkedNpcs` lưu theo nickname trong `roomFourProgress:*` | **Giữ hạ tầng persistence**, đổi schema sang journey card + station discoveries; cần migration/namespace mới để không kế thừa dữ liệu cũ |
| Ngôn ngữ | Nhiều content có `vi/en`; một số minigame/hướng dẫn trong lobby hard-code tiếng Việt | **Giữ language context**, yêu cầu toàn bộ nội dung mới song ngữ |
| Phản hồi | Glow ring, emissive, animation, bubble, modal, confetti | Giữ nguyên tắc phản hồi bằng ánh sáng/chuyển động; bỏ confetti và neon đa màu không phù hợp art direction lịch sử |

### 5.5. Ánh sáng, vật liệu và visual hierarchy

| Hạng mục | Hiện trạng | Khoảng cách tới yêu cầu |
|---|---|---|
| Shell | Sàn marble sáng, tường gần trắng, thảm xám-be, giếng trời xanh, đèn hành lang trắng ấm | Không tạo hai nửa lạnh–ấm rõ ràng; cảm giác gallery chung thay vì hành trình lịch sử |
| RoomFour lights | Thêm ambient, directional và point light lên hệ đèn của `BaseRoomPlain` | Nguồn sáng chồng lớp; khó kiểm soát focal point và hiệu năng |
| Zone palette | Đỏ, vàng, cyan, cam, xanh dương, xanh lá; vòng neon và emissive riêng từng zone | Quá nhiều accent, phân mảnh narrative; không bám palette Liên Xô lạnh / Quảng Châu ấm |
| Material language | Kim loại bóng, hologram, neon, HTML glass panel, logo doanh nghiệp | Sai thời kỳ và dễ tạo cảm giác công nghệ/AI generic |
| Wayfinding | Vị trí zone theo Z và đèn sáng khi đến gần; không có đường sáng xuyên suốt | Có tín hiệu cục bộ nhưng thiếu spine liên tục từ Phòng 03 tới Phòng 05 |
| Sightline | Các zone đặt thành cặp đối xứng ở cùng Z, tâm hành lang trống | Dễ đọc đường đi nhưng tạo cảm giác “hành lang chứa vật thể”; cần masterplan bất đối xứng có nhịp và focal point |
| Typography | Nhiều HTML label nhỏ, uppercase, badge/pill, text cỡ 6–10px trong không gian | Khó đọc, thiếu phân cấp; cần mốc thời gian lớn, thông điệp ngắn và thông tin dài trong interaction |

### 5.6. Collision và khả năng walkthrough

| Hạng mục | Hiện trạng | Rủi ro |
|---|---|---|
| Side boundary integrated | X khoảng `-8.7 → 8.7` | Khớp gần đúng shell rộng 18 |
| Side boundary standalone | Dựa vào `activeGallery.room_width`; với dữ liệu đầy đủ là khoảng `-8.4 → 8.4` | Khác integrated 0.3 mỗi bên |
| Z boundary standalone | Local `-74.4 → 4.4` | Khớp shell local hiện tại |
| Partition collision standalone | Chặn vách Z `-50 ± 0.4` ngoài cửa X `±3` | Có khai báo |
| Partition collision integrated | Không có collision riêng cho vách Z -50/world 155 | Người chơi có thể xuyên phần đặc của vách trong lobby walkthrough |
| Exhibit collision | Không có collider riêng cho các bệ, sa bàn, NPC, tranh/chân nhãn | Player có thể xuyên vật thể chính; Phase 3 phải bổ sung collider tối thiểu theo masterplan |
| Door traversal | Integrated yêu cầu bấm E/transition; standalone bị clamp trong shell | Hai đường chạy có hành vi khác nhau; cần test cả gallery route và lobby route |

### 5.7. Ràng buộc React Three Fiber / Three.js

**Điểm tốt nên giữ**

- Animation phần lớn mutate refs trong `useFrame` thay vì tạo object mới liên tục.
- Assets dùng `useTexture`; scene dùng `Suspense`.
- `DynamicRoom` có staggered exhibit loading và visibility/LOD.
- Room dùng graphics preset và reduced lights.
- Các room chỉ render theo `currentRoom` trong lobby.

**Vấn đề phải xử lý ở phase triển khai**

- `Zone2BalanceScale` gọi `setPrices` trong `useFrame`, gây React re-render trong render loop.
- `RoomFour` đẩy `zoneIntensities` và `entranceLight` vào React state mỗi năm frame; vẫn tạo re-render thường xuyên cho một scene chủ yếu tĩnh.
- Mỗi zone tạo nhiều geometry/material/HTML overlay riêng; chưa reuse material/geometry hoặc instance các chi tiết lặp.
- `BaseRoomPlain` và `RoomFour` cùng tạo light, dẫn tới số light hoạt động cao hơn cần thiết.
- Nhiều `Html` dùng `occlude` và nội dung rất nhỏ; chi phí DOM/occlusion cao, khả năng đọc thấp.
- Có nhiều mảng/state không dùng hoặc trùng: slideshow, game situations/categories, minigame constants và state cục bộ; minigame còn bị nhân đôi giữa `GalleryCanvas` và lobby page.
- `FloatingModel` trong `BaseRoomPlain` được khai báo nhưng không render.
- Texture slideshow dùng URL Unsplash từ xa, tạo phụ thuộc network; nội dung này cũng không còn phù hợp.
- Height bị cộng hai lần qua `RoomFour` và `BaseRoomPlain`.
- Hệ tọa độ và room ranges bị nhân bản ở client, context, lobby, DynamicRoom và server, dẫn tới drift 210/245/280.

## 6. Ma trận đối chiếu hiện trạng → hành trình đích

| Thành phần bắt buộc | Hiện trạng có tương đương? | Mức phù hợp | Hành động phase sau |
|---|---|---|---|
| Nhận Thẻ hành trình tại cửa vào | Quest log 0/5 chỉ xuất hiện theo Room4 | Thấp | Thiết kế Thẻ hành trình mới và nghi thức nhận thẻ tại spawn |
| Phần I — Liên Xô | Không có | Không phù hợp | Dựng mới trong shell hiện tại |
| Trạm 1 — Bàn học Moscow | Không có; chỉ có ảnh kinh tế/NPC | Không phù hợp | Dựng mới |
| Trạm 2 — Diễn đàn Quốc tế | Có địa cầu ở zone hội nhập nhưng sai nội dung, sai vị trí và sai interaction | Chỉ tái dùng mô-típ kỹ thuật | Dựng mới theo ba vòng tư liệu |
| Trạm 3 — Vé Quảng Châu | Không có | Không phù hợp | Dựng mới sát chuyển cảnh |
| Hành lang Moscow → Quảng Châu | Có một vách giữa nhưng không có gradient, map morph hay rail light | Rất thấp | Thiết kế lại thành transition, không thêm phần lịch sử |
| Phần II — Quảng Châu | Không có | Không phù hợp | Dựng mới trong nửa ấm |
| Trạm 4 — Lý Thụy và ba nhiệm vụ | Không có | Không phù hợp | Dựng mới |
| Trạm 5 — Hạt nhân tổ chức | Không có; có UI/procedural network motifs rời rạc | Thấp | Dựng mới theo chuỗi ba điểm |
| Trạm 6 — Xưởng in *Thanh Niên* | Không có | Không phù hợp | Dựng mới |
| Trạm 7 — Lớp học bí mật | Không có | Không phù hợp | Dựng mới |
| Trạm 8 — Mạng lưới trở về | Không có; địa cầu/cảng hiện tại kể hội nhập kinh tế | Thấp | Dựng mới bằng bản đồ tuyến liên lạc lịch sử |
| Cửa ra Room5 | NPC Ronaldo + minigame; actual Room5 portal lệch boundary | Xung đột | Loại minigame, đồng bộ exit và đặt thông điệp kết |

## 7. Ràng buộc không được thay đổi trong Phase 2–5

### 7.1. Ràng buộc nội dung và trình tự

1. Chỉ có **hai phần lịch sử chính**: Liên Xô và Quảng Châu.
2. Hành lang Moscow → Quảng Châu chỉ là chuyển cảnh, không phải phần lịch sử thứ ba.
3. Giữ đúng thứ tự: `Nhận Thẻ → Trạm 1 → 2 → 3 → hành lang → 4 → 5 → 6 → 7 → 8 → cửa ra`.
4. Không thêm trạm thứ chín, không gộp hai trạm thành một, không đảo thứ tự.
5. Giữ nguyên các mốc, tên, bí danh, tổ chức và số liệu đã nêu trong tài liệu nguồn.
6. Kết thúc bằng những gì được để lại và tiếp tục phát triển, không kết bằng việc Nguyễn Ái Quốc rời Quảng Châu.
7. Thông điệp tổng: **“Từ tư tưởng quốc tế đến lực lượng cách mạng Việt Nam.”**
8. Biển cửa ra: **“HÀNH TRANG ĐÃ SẴN SÀNG — CON ĐƯỜNG VỀ TỔ QUỐC”.**

### 7.2. Ràng buộc trải nghiệm

1. Mỗi trạm có đúng một vật thể biểu tượng, một hành động chính và một thông điệp ngắn.
2. Nội dung dài nằm trong lớp tương tác; tường chỉ giữ mốc thời gian, từ khóa và kết luận.
3. Không dùng câu hỏi đúng/sai, điểm số, countdown hoặc cơ chế phạt.
4. Tiến trình mở bằng hành động khám phá: mở, chạm, đóng dấu, nối, kéo cần, đặt thẻ, kích hoạt tuyến.
5. Thẻ hành trình là cơ chế xuyên suốt; phản hồi phải rõ bằng ánh sáng, chuyển động và cập nhật dấu ấn.
6. Phần Liên Xô phải lạnh, phân tích, thiên về lý luận; phần Quảng Châu phải ấm, giàu hoạt động và tổ chức.
7. Đường sáng trên sàn phải tạo wayfinding liên tục từ Phòng 03 qua Room4 tới Phòng 05.
8. Không biến Quảng Châu thành phố Hoa trang trí chung chung; phải là cơ sở hoạt động, xưởng in và lớp học bí mật.
9. Không tái dựng phương tiện hoặc tuyến đường cụ thể ở hành lang; chuyển cảnh biểu tượng cho tư tưởng, nhiệm vụ và chiến lược.

### 7.3. Ràng buộc không gian và kỹ thuật

1. Giữ ID `gallery-market-economy` và contract của `ExhibitionRoom`/`DynamicRoom`.
2. Giữ room boundary hiện hành rộng 18, dài 80 và trục tiến Z; không tự ý nới shell trong masterplan.
3. Giữ cửa vào giữa từ Phòng 03, spawn gần cửa và cửa ra giữa sang Phòng 05.
4. Không đặt focal object/collider chắn khẩu độ cửa hoặc trục lưu thông chính.
5. Thiết kế phải chạy trong cả gallery route và integrated lobby route.
6. Duy trì `vi/en`, graphics presets, multiplayer visibility, admin door/room state và persistence theo người chơi.
7. Không cập nhật React state trong `useFrame`; animation liên tục dùng ref/transient state.
8. Hạn chế active lights, HTML overlays, transparent materials và draw calls; reuse geometry/material cho chi tiết lặp.
9. Collision phải khớp geometry thật và có một nguồn tọa độ duy nhất dùng chung giữa client/server.
10. Không kế thừa localStorage quest/minigame cũ vào Thẻ hành trình mới.

## 8. Điểm chưa nhất quán trong chính tài liệu nguồn cần khóa cách hiểu

Các điểm dưới đây không làm thay đổi journey, nhưng Phase 4 cần một data model nhất quán:

1. Bảng “Dấu ấn” liệt kê bảy dấu: `Lý luận`, `Quan hệ`, `Phương pháp`, `Tổ chức`, `Báo chí`, `Cán bộ`, `Mạng lưới`.
2. Trạm 4 lại trao dấu **Nhiệm vụ**, nhưng dấu này không có trong bảng tổng.
3. Trạm 2 hiển thị lại **Lý luận** cùng `Quan hệ` và `Phương pháp`, trong khi Trạm 1 đã trao `Lý luận`.
4. Trạm 3 trao vé Quảng Châu nhưng không gọi đó là một dấu trong bảng tổng.
5. Trạm 8 tổng hợp năm dấu `Lý luận`, `Tổ chức`, `Báo chí`, `Cán bộ`, `Mạng lưới`, không hiển thị `Quan hệ`, `Phương pháp`, `Nhiệm vụ`.

**Baseline không làm đổi nội dung:** Thẻ nên lưu hai loại trạng thái riêng ở Phase 4:

- **Dấu hành trang cốt lõi:** bảy dấu trong bảng chính.
- **Mốc chuyển hành trình:** vé Quảng Châu và ba nhiệm vụ của Lý Thụy.

Trạm 2 chỉ củng cố `Lý luận`, đồng thời mở mới `Quan hệ` và `Phương pháp`. Trạm 8 có thể nêu năm kết quả cuối theo tài liệu nhưng vẫn giữ đầy đủ lịch sử dấu trên Thẻ. Đây là cách chuẩn hóa dữ liệu, không thay đổi trạm, thứ tự hay thông điệp.

## 9. Danh sách ưu tiên cho Phase 2

1. Vẽ spatial masterplan trong boundary local X `-9..9`, Z `-75..5`.
2. Xác định rõ vùng nhận Thẻ gần Z `-72..-68` mà không cản spawn/cửa.
3. Phân bổ Trạm 1–3 vào nửa Liên Xô, sau đó dành một nhịp chuyển cảnh thực sự trước Trạm 4.
4. Phân bổ Trạm 4–8 vào nửa Quảng Châu, bảo đảm Trạm 8 và biển kết có sightline tới rear door.
5. Thiết kế circulation không quay đầu, khoảng dừng và collider clearance cho từng trạm.
6. Định nghĩa cold/warm palette, material language, light budget và typography hierarchy.
7. Chốt một tọa độ exit Room4 → Room5 khớp rear boundary Z 210 và lập danh sách file đồng bộ cho Phase 3.
8. Xác định Journey Card state model từ baseline ở mục 8, chưa triển khai code.

## 10. Checklist nghiệm thu Phase 1

- [x] Đã đọc và chuẩn hóa toàn bộ visitor journey từ tài liệu nguồn.
- [x] Đã kiểm kê cấu trúc hai phần, tám trạm, hành lang chuyển cảnh, Thẻ hành trình và cửa ra.
- [x] Đã kiểm kê room size, shell, door aperture, spawn, trục di chuyển, collision, lighting, 3D content và UI liên quan.
- [x] Đã đối chiếu từng thành phần hiện tại với journey Liên Xô–Quảng Châu.
- [x] Đã lập ma trận tám trạm có nội dung, vật thể, hành động, thông điệp, dấu ấn và yêu cầu không gian.
- [x] Đã lập danh sách ràng buộc không được thay đổi.
- [x] Đã ghi nhận các ràng buộc R3F/Three.js và defect điều hướng liên phòng.
- [x] Không thêm trạm, không thay đổi thứ tự journey.
- [x] Không sửa code sản phẩm trong Phase 1.

## 11. Phạm vi thay đổi của Phase 1

Phase 1 chỉ thêm tài liệu audit này. Không thay đổi `RoomFour.tsx`, room shell, UI, asset, collision, navigation, context, server hoặc dữ liệu gallery.
