# Kế hoạch trang phục, phiên thi nhiều người và hướng dẫn tiến độ

Ngày: 15/09/2026. Trạng thái: kế hoạch sản phẩm và phân rã công việc; chưa triển khai.

## 1. Những lựa chọn người dùng đã xác nhận

- Lần đầu vào, nhân vật mặc đồng phục học sinh mặc định.
- Có một số trang phục để lựa chọn; chọn trang phục rồi nhập tên để tham gia.
- Chủ phòng bấm bắt đầu chung cho cả nhóm.
- Người chơi phải hoàn thành đủ số câu đúng; xếp hạng theo thời gian hoàn thành.
- Có bảng nhỏ ở góc màn hình chỉ dẫn nhiệm vụ, phòng hiện tại và tiến độ câu hỏi.
- Sau khi toàn bộ người dự thi hoàn thành, vinh danh Top 3.
- Cần mô tả rõ nơi tạo phiên, cách nhận biết chủ phòng, danh sách thí sinh, bộ câu hỏi và bảng xếp hạng real-time cho chủ phòng.
- Phạm vi kế hoạch là toàn hành trình 5 phòng. Không sửa code, triển khai hay tác động dịch vụ VPS trong giai đoạn lập kế hoạch.

## 2. Thiết kế đề xuất cho bản đầu

Các chi tiết trong phần này là đề xuất triển khai, không phải tất cả đã được người dùng xác nhận riêng.

### 2.1. Chọn nhân vật trước khi vào

Luồng: chọn/xem trước trang phục -> nhập tên và mã phiên -> vào phòng chờ -> sẵn sàng.

- Đồng phục học sinh được chọn sẵn ở lần đầu.
- Bộ lựa chọn đề xuất: đồng phục học sinh, áo bà ba, áo dài cách điệu, trang phục thường ngày. Mẫu và màu cụ thể cần chốt trước khi làm hình ảnh.
- Mỗi lựa chọn có tên và bản xem trước; không cần tạo tài khoản hay cửa hàng trang phục.
- Lưu lựa chọn trang phục cho lần sau trên cùng trình duyệt. Không dùng tên hoặc trang phục làm định danh người dự thi.
- Đồng bộ outfitId theo participantId; mọi người nhìn thấy cùng một bộ đồ.
- Khóa thay tên/trang phục trong lúc thi; cho thay ở phòng chờ để kết quả dễ nhận diện.
- Chia sẻ mô hình nhân vật giữa sảnh, phòng và avatar từ xa; vật liệu/hình học nhẹ, không mô phỏng vải. Chế độ đồ họa thấp vẫn nhận diện được trang phục.

### 2.2. Một phiên thi chung

- Chủ phòng tạo phiên có mã, tên, danh sách người dự thi và thời lượng.
- Trạng thái: phòng chờ -> đếm ngược -> đang thi -> đã tổng kết; có trạng thái hủy cho phiên bị lỗi.
- Chủ phòng bấm bắt đầu; đếm ngược chung 5 giây. Server chốt danh sách dự thi và mốc bắt đầu.
- Chưa thi thì xem hướng dẫn được, nhưng không nộp câu thi để lấy điểm trước.
- Người vào sau mốc bắt đầu chỉ tham quan/chờ phiên sau, không thay đổi danh sách đang thi.
- Dùng mã người chơi ổn định và thông tin nối lại phiên để tải lại trang không sinh thêm suất dự thi. Socket ID chỉ đại diện kết nối tạm thời.
- Người chơi thông thường không được gọi lệnh chủ phòng. Quyền bắt đầu/kết thúc phải được xác thực trên server, không dựa vào việc ẩn nút.

### 2.2a. Tạo phòng ở đâu và ai là chủ phòng?

Trong tài liệu này, "phòng thi" là một phiên tổ chức cho cả nhóm đi qua 5 phòng triển lãm; không phải tạo thêm một phòng 3D.

Các màn hình/đường dẫn dưới đây là thiết kế mới, chưa có trong bản chạy hiện tại:

| Điểm vào | Mục đích |
|---|---|
| Trang chủ: nút "Tổ chức cuộc thi" | Mở khu điều phối `/host` |
| `/host/new`: "Tạo phòng thi" | Nhập tên cuộc thi, tên người tổ chức, thời lượng, giới hạn thí sinh và chọn bộ câu hỏi |
| `/host/[sessionId]` | Bảng điều khiển dành cho chủ phòng của phiên đó |
| Trang chủ: "Tham gia cuộc thi" | Nhập mã phiên hoặc mở link mời; chọn trang phục, nhập tên và vào phòng chờ |

- Người thực hiện tạo phiên thành công được server cấp quyền chủ phòng của phiên đó; không lấy người vào đầu tiên làm chủ phòng.
- Trên bảng điều khiển hiện huy hiệu "Bạn là chủ phòng", tên cuộc thi, mã phiên và trạng thái. Trên phòng chờ thí sinh hiện "Chủ phòng: <tên người tổ chức>".
- Chủ phòng có vai trò điều phối riêng, không được tính là thí sinh và không tranh Top 3 vì có thể xem đáp án.
- Tên hiển thị, mã mời và đường dẫn `/host/[sessionId]` không phải bằng chứng có quyền chủ phòng.
- Đề xuất bản đầu chưa bắt thí sinh tạo tài khoản. Khi tạo phiên, server cấp phiên đăng nhập chủ phòng bằng cookie HttpOnly và mã khôi phục riêng chỉ hiển thị một lần; server chỉ lưu bản băm mã khôi phục, giới hạn số lần thử và cho thu hồi/đổi mã. Không đặt mã khôi phục vào URL hoặc link mời.
- Link/mã mời chỉ cho quyền tham gia. Người khác mở đường dẫn điều phối nhưng không có phiên chủ phòng hợp lệ sẽ thấy màn hình xác thực, không nhận roster chi tiết/đáp án/lệnh điều khiển.
- Tải lại trang ở cùng trình duyệt vẫn giữ quyền khi phiên đăng nhập còn hiệu lực. Máy khác dùng mã khôi phục qua màn hình "Khôi phục quyền chủ phòng"; khôi phục thành công thu hồi quyền điều khiển cũ.
- Nếu mất cả phiên đăng nhập lẫn mã khôi phục, cần người quản trị hỗ trợ; không tự chuyển quyền cho một thí sinh.
- Quyền điều phối cuộc thi tách khỏi CMS hiện tại ở `/admin`: chủ phòng không vì thế có quyền sửa hiện vật hoặc cấu hình bảo tàng.
- Bản đầu chỉ cho một cuộc thi đang chờ/đang chạy tại một thời điểm trên server. Nếu đã có cuộc thi hoạt động, màn tạo mới báo bận, không ghi đè hoặc chiếm phiên của người tổ chức khác.

### 2.2b. Bảng điều khiển chủ phòng

**Thanh tổng quan cố định:** tên cuộc thi, huy hiệu chủ phòng, mã phiên, sao chép link mời, QR tham gia, trạng thái, đồng hồ và số lượng đã vào/sẵn sàng/hoàn thành/mất kết nối. Bộ đếm phân biệt thí sinh chính thức với khách vào muộn.

**Tab 1 — Thí sinh**

| Cột | Nội dung |
|---|---|
| Thí sinh | Avatar, tên và mã ngắn để phân biệt tên trùng |
| Kết nối | Online, mất kết nối, thời điểm cập nhật cuối |
| Trạng thái | Chưa sẵn sàng, sẵn sàng, đang thi, hoàn thành, rút lui, hết giờ |
| Vị trí | Phòng triển lãm hiện tại |
| Tiến độ | Phòng 1–5: `0/2`, `1/2`, `2/2`; tổng số phòng đã xong |
| Kết quả | Số câu đúng, số lượt sai/thử lại và tổng điểm |
| Thời gian | Thời gian đang chạy hoặc thời gian hoàn thành đã chốt |

- Tìm theo tên/mã, lọc theo trạng thái hoặc phòng đang đứng.
- Nhấp một thí sinh để xem chi tiết từng phòng, các câu đã trả lời, kết quả và thời điểm server ghi nhận.
- Trước giờ thi: có thể loại thí sinh đăng ký nhầm; sau khi bắt đầu chỉ đánh dấu rút lui với xác nhận và lý do, không xóa lịch sử thi.
- Chủ phòng không sửa điểm/giờ thủ công. Mọi loại bỏ, bắt đầu hoặc kết thúc sớm đều có lịch sử thao tác.
- Nếu có người chưa sẵn sàng, nút bắt đầu nêu rõ số người chưa sẵn sàng. Đề xuất yêu cầu tất cả thí sinh chính thức sẵn sàng; chủ phòng có thể loại người chưa tham gia trước khi chốt roster.

**Tab 2 — Bộ câu hỏi**

- Xem bộ câu, phiên bản và danh sách theo đúng 5 phòng; hiển thị câu hỏi, các lựa chọn, đáp án, giải thích và căn cứ nội dung cho chủ phòng.
- Bản đầu chọn từ các bộ đã được duyệt; việc soạn/sửa ngân hàng câu hỏi là quyền quản trị nội dung riêng, không ngầm bổ sung một CMS mới cho mọi chủ phòng.
- Trước khi bắt đầu: xem trước và đổi bộ; kiểm tra đủ 2 câu hợp lệ mỗi phòng, tổng 10 câu, không trùng questionId.
- Khi bắt đầu: chốt snapshot bộ câu và luật cho phiên. Không sửa đáp án, đổi câu hay tăng số câu bắt buộc giữa cuộc thi.
- Trong lúc thi: thống kê mỗi câu có bao nhiêu người làm, bao nhiêu lượt đúng/sai và số thí sinh đã vượt qua. Dữ liệu chi tiết này chỉ dành cho chủ phòng.
- Nếu chiếu màn hình cho cả lớp, dùng "Màn hình công khai" chỉ có tiến độ/bảng xếp hạng, không dùng tab đáp án.

**Tab 3 — Bảng xếp hạng real-time**

- Hai nhóm rõ ràng: "Đã hoàn thành — xếp theo thời gian" và "Đang thi — tiến độ tạm thời".
- Người đã hoàn thành được đánh hạng theo elapsedMs. Nhóm đang thi sắp theo số phòng hoàn thành rồi số câu đúng giảm dần; bằng tiến độ giữ thứ tự ổn định, không gọi đó là thứ hạng về đích.
- Cột: thứ hạng (chỉ người đã về đích), tên/avatar, số phòng hoàn thành, số câu đúng/10 và thời gian.
- Cập nhật khi người chơi tham gia, sẵn sàng, trả lời, hoàn thành hoặc mất/nối lại kết nối. Mục tiêu đề xuất: thay đổi xuất hiện trong 1 giây với mạng bình thường; phải đo khi nghiệm thu.
- Server phát sự kiện tiến độ/kết quả riêng, không đẩy lại toàn bộ dashboard theo mỗi gói di chuyển 3D. Vị trí phòng chỉ cần cập nhật khi đổi phòng.
- Khi dashboard mất kết nối, hiện cảnh báo và thời điểm cập nhật cuối; khi nối lại lấy snapshot mới trước khi tiếp tục nhận sự kiện, không giả vờ bảng đang live.
- Trước khi kết thúc, mọi hạng đều ghi "Tạm thời". Khi phiên đã chốt, kết quả đóng băng và không nhận điểm bổ sung.

**Tab 4 — Điều khiển và tổng kết**

- Phòng chờ: chia sẻ lời mời, xem hướng dẫn, theo dõi sẵn sàng, bắt đầu chung.
- Đang thi: xem thời gian còn lại, đánh dấu rút lui, kết thúc sớm có xác nhận và lý do. Không có chức năng tạm dừng thi ở bản đầu để tránh mơ hồ về đồng hồ và mất kết nối.
- Sau khi đủ điều kiện kết thúc: tự chốt kết quả và mở Top 3 trên máy thí sinh; chủ phòng có thể chiếu lại màn vinh danh mà không tính lại điểm.
- Cho tải kết quả CSV sau tổng kết: tên, mã thí sinh, điểm, thời gian, hạng, trạng thái và tiến độ từng phòng; không xuất token/mã khôi phục.
- "Tạo cuộc thi mới" tạo phiên mới, không xóa kết quả phiên vừa kết thúc.
- Nếu chủ phòng mất kết nối, cuộc thi tiếp tục theo thời lượng đã chốt, người chơi vẫn nộp được; server vẫn tự tổng kết khi tất cả xong hoặc hết giờ.

### 2.3. Luật câu hỏi và điểm

- Đề xuất bản đầu: 2 câu đúng khác nhau mỗi phòng, 5 phòng = 10 câu đúng cần hoàn thành.
- Trả lời đúng một câu chưa được ghi nhận: cộng 1 điểm. Sai: 0 điểm, được thử lại, đồng hồ vẫn chạy.
- Mỗi câu chỉ được cộng điểm một lần trong một phiên; nộp lặp, reconnect hay đổi tab không cộng thêm.
- Không cộng thưởng tốc độ vào điểm. Khi hoàn thành, mọi người đều đạt 10/10; thời gian là tiêu chí xếp hạng.
- Phân biệt rõ: lượt trả lời (gồm sai và thử lại), số câu đúng duy nhất, và số câu đúng còn thiếu. HUD ưu tiên số câu đúng duy nhất.
- Tất cả người trong một phiên có cùng bộ câu theo phòng; có thể đảo thứ tự lựa chọn bằng cấu hình cố định của phiên. Không tùy ý bốc câu dễ/khó khác nhau giữa người dự thi.
- Server giữ đáp án và chấm theo questionId/optionId. Client không gửi tổng điểm hay tự khai báo hoàn thành.
- Câu thi dùng nguồn nội dung riêng phía server; không lấy đáp án từ dữ liệu câu hỏi có sẵn trong bundle trình duyệt để làm cơ chế chấm thi.
- Chỉ chấp nhận câu thuộc phòng/nhiệm vụ hiện tại theo trạng thái hợp lệ trên server. Không coi tọa độ do client gửi là bằng chứng chống gian lận tuyệt đối.
- Hoàn thành 2 câu đúng của phòng nào thì đánh dấu phòng đó hoàn thành. Đủ cả 5 phòng thì server ghi finishedAt ngay khi chấm câu đúng cuối.

### 2.4. Quan hệ với nhiệm vụ cũ

- Tách chế độ tham quan hiện tại và chế độ thi theo phiên; không trộn bảng điểm cũ vào bảng điểm thi.
- Giữ các nội dung khám phá hiện vật, hồ sơ và hành trình cũ. Bản thi đề xuất lấy tiêu chí 2 câu đúng/phòng làm điều kiện kết thúc phòng, không mặc định bắt làm mọi minigame cũ.
- Phòng 1 vẫn cần đủ 6 manh mối để mở tủ cuối trong luồng khám phá hiện có. Đủ 2 câu thi không tự mở tủ hoặc xóa điều kiện này.
- Bố trí điểm câu thi có thể tiếp cận hợp lệ; không đặt câu bắt buộc sau một nhiệm vụ chưa được ghi vào luật và HUD.
- Nếu muốn nhiệm vụ khám phá nào cũng là bắt buộc để hoàn thành thi, phải liệt kê rõ vào hợp đồng từng phòng trước khi thực hiện.
- Các handler điểm cũ không được tác động dữ liệu phiên thi mới.

### 2.5. Thời gian, bảng xếp hạng, Top 3

- elapsedMs = finishedAt - startedAt, cả hai do server quyết định.
- Thời gian hiển thị cập nhật ở client từ mốc server; không phát socket mỗi frame để chạy đồng hồ.
- Mất mạng không dừng thời gian. Nối lại vẫn giữ điểm, danh tính và mốc bắt đầu.
- Người hoàn thành đủ 5 phòng được xếp theo elapsedMs tăng dần. Người chưa hoàn thành nằm ở nhóm riêng.
- Thời gian hiển thị có thể làm tròn, nhưng thứ hạng dùng mili giây. Nếu bằng chính xác, đề xuất hiển thị đồng hạng; chủ phòng cần chốt cách trao giải khi đồng hạng ở vị trí 3.
- Trong lúc thi, bảng ghi rõ kết quả tạm thời. Người hoàn thành sớm không sửa đáp án nữa và thấy số người đã xong/tổng số dự thi.
- Khi toàn bộ danh sách dự thi đã hoàn thành: đóng kết quả, phát thông báo tổng kết đúng một lần và mở màn vinh danh.
- Không tự xóa người mất kết nối khỏi danh sách để kích hoạt vinh danh sớm.
- Nhánh kết thúc ngoại lệ: hết thời lượng hoặc chủ phòng xác nhận người rút lui/kết thúc sớm. Những người chưa xong mang trạng thái chưa hoàn thành/rút lui và không tranh Top 3.
- Nếu ít hơn 3 người hoàn thành, chỉ vinh danh số người thực tế đủ điều kiện.
- Lưu kết quả và dữ liệu cần nối lại phiên theo sessionId. Bản đầu có thể chỉ cho một phiên thi hoạt động trên mỗi server, nhưng kết quả các phiên không lẫn nhau.
- Nếu server khởi động lại giữa phiên, đề xuất hủy tính xếp hạng phiên đang thi và báo rõ; giữ dữ liệu để xem lại. Không âm thầm tạo thời gian mới rồi xếp hạng như phiên bình thường.

### 2.6. HUD hướng dẫn

Vị trí đề xuất: góc trên bên trái, có nút thu gọn; không che câu hỏi, cửa hoặc điều khiển.

Ví dụ khi đang thi:

```text
PHÒNG 2 · BẾN CẢNG RA KHƠI
Mục tiêu: trả lời đúng 2 câu tại phòng này
Đã đúng: 1/2 · Còn thiếu: 1
Hành trình: 1/5 phòng · Điểm: 3/10
Thời gian: 04:12
Tiếp theo: đến điểm câu hỏi được đánh dấu
```

- Khi chưa bắt đầu: hiển thị sẵn sàng và hướng dẫn thao tác.
- Khi đổi phòng: đổi mục tiêu và tiến độ theo roomId.
- Cho mở danh sách 5 phòng và trạng thái hoàn thành.
- Khi mất kết nối: thông báo đang nối lại, tạm khóa gửi đáp án; không hiển thị điểm chưa được server xác nhận.
- Khi hoàn thành: thông báo đã ghi nhận thời gian, số người hoàn thành và bảng tạm thời.
- Chế độ điện thoại/khung nhìn nhỏ: thu gọn mặc định; hỗ trợ bàn phím và tôn trọng giảm chuyển động.

## 3. Ánh xạ phòng cần dùng thống nhất

| Phòng hiển thị | ID | Hướng nội dung câu thi |
|---|---|---|
| 1. Dấu chân tìm đường | gallery-subsidy | Tổng quan 1911–1930 |
| 2. Bến cảng ra khơi | gallery-three | Bến Nhà Rồng, Văn Ba, hành trình đầu tiên |
| 3. Tiếng nói dân tộc | gallery-ceramics | Yêu sách năm 1919 và các quyền cơ bản |
| 4. Những điểm dừng cách mạng | gallery-market-economy | Liên Xô, Quảng Châu, chuẩn bị lực lượng |
| 5. Hội tụ tại Hương Cảng | gallery-paintings | Hội nghị hợp nhất và năm 1930 |

Tên kỹ thuật RoomTwo/RoomFive và một số sự kiện cũ không theo thứ tự hiển thị. Không suy ra phòng từ tên file. Bộ câu thi cần kiểm chứng nội dung trước khi dùng chính thức.

## 4. Phân rã thực hiện

### Giai đoạn A — Hợp đồng phiên thi và luật

- [ ] Chốt mẫu trang phục, 2 câu đúng/phòng, nhiệm vụ khám phá bắt buộc hay tùy chọn, thời lượng và chính sách đồng hạng.
- [ ] Lập danh sách câu hỏi theo ID phòng, đáp án và căn cứ nội dung; cố định phiên bản bộ câu theo phiên thi.
- [ ] Xác định các sự kiện session:create/join/start, answer:submit, progress:update, session:finalized và lỗi tương ứng; client chỉ yêu cầu, server quyết định.
- [ ] Chốt hành vi vào muộn, reconnect, hai tab cùng danh tính, rút lui và server restart.

### Giai đoạn B — Server điều phối và chấm điểm

Các tệp dự kiến: chỉnh ws-server.js; tạo server/competition/sessionService.cjs, questionBank.cjs, resultStore.cjs và bộ test tương ứng.

- [ ] Tách logic phiên/chấm điểm khỏi handler socket dài hiện tại; giữ các sự kiện tham quan cũ hoạt động.
- [ ] Triển khai quyền chủ phòng, roster đóng băng, participantId và thông tin reconnect.
- [ ] Chấm đúng/sai, chống ghi nhận trùng, yêu cầu 2 câu đúng/phòng và thời gian kết thúc do server ghi.
- [ ] Lưu sự kiện/kết quả an toàn, phân biệt phiên đang hoạt động và kết quả đã chốt; đưa dữ liệu vào volume khi triển khai sau này.
- [ ] Kiểm thử sai rồi đúng, nộp đúng lặp, nộp ngoài phiên, client gửi điểm giả, reconnect, kết thúc đồng thời và tổng kết chỉ một lần.

### Giai đoạn C — Giao diện tham gia và trang phục

Các tệp dự kiến: src/app/lobby/page.tsx, src/app/gallery/[id]/page.tsx, src/components/3d/PlayerCharacter.tsx, src/components/3d/MultiplayerAvatars.tsx; tạo src/components/3d/AvatarAppearance.tsx, src/components/ui/AvatarSelector.tsx và src/lib/avatarCatalog.ts.

- [ ] Dựng đồng phục mặc định và các mẫu được duyệt; dùng chung phần tạo hình.
- [ ] Thêm xem trước, chọn trang phục, nhập tên/mã phiên và trạng thái sẵn sàng.
- [ ] Đồng bộ trang phục khi vào/reconnect; kiểm tra bản thân và người từ xa ở cả chế độ đồ họa thấp.
- [ ] Không đổi va chạm, kích thước đi qua cửa hoặc điều khiển chỉ vì thay trang phục.

### Giai đoạn D — Tích hợp 5 phòng và HUD

Các tệp dự kiến: src/context/MuseumContext.tsx, src/components/ui/ExhibitModal.tsx, InvestigationNotebook.tsx, RoomTwoDocumentModal.tsx, RoomFiveMissionHud.tsx, các điểm tương tác phòng; tạo CompetitionHud.tsx, CompetitionQuestionPanel.tsx và src/lib/competitionRoomCatalog.ts.

- [ ] Dùng snapshot tiến độ server; tách khỏi score/localStorage cũ.
- [ ] Bố trí 2 điểm câu thi mỗi phòng hoặc panel câu thi gắn điểm tương tác đã xác định.
- [ ] Thêm checklist, mục tiêu kế tiếp, số câu đúng, điểm và đồng hồ; xử lý các HUD cũ để không chồng lấp.
- [ ] Đánh dấu hoàn thành và kết thúc cá nhân khi đủ 5 phòng, không cho kết thúc bằng nút client không được kiểm chứng.
- [ ] Kiểm tra quy tắc 6 manh mối/tủ cuối phòng 1 vẫn hoạt động trong luồng khám phá.

### Giai đoạn E — Điều phối, kết quả và vinh danh

Các tệp dự kiến: thêm lối vào tại src/app/page.tsx; tạo src/app/host/page.tsx, src/app/host/new/page.tsx, src/app/host/[sessionId]/page.tsx, CompetitionHostDashboard.tsx, CompetitionRoster.tsx, CompetitionQuestionSetPanel.tsx, CompetitionLeaderboard.tsx và CompetitionPodium.tsx. Giữ `/admin` phục vụ CMS; quyền host và quyền quản trị nội dung tách riêng. Bổ sung xác thực HTTP/socket, lưu phiên chủ phòng, khôi phục/thu hồi quyền và kiểm tra phân quyền ở server/competition.

- [ ] Tạo luồng tổ chức cuộc thi, cấp quyền chủ phòng, mã/link/QR mời và xác thực khi quay lại dashboard; mã mời không cấp quyền điều phối.
- [ ] Thêm roster với avatar, mã thí sinh, kết nối, sẵn sàng, tiến độ từng phòng, thời gian; tìm/lọc/xem chi tiết và lịch sử thao tác.
- [ ] Hiển thị bộ câu hỏi phía host, chốt snapshot khi bắt đầu; không gửi đáp án cho socket thí sinh hoặc màn hình công khai.
- [ ] Đồng bộ dashboard theo sự kiện có thứ tự và snapshot khi reconnect; hiển thị rõ dữ liệu bị gián đoạn, đo mục tiêu cập nhật trong 1 giây.
- [ ] Chủ phòng xem người sẵn sàng, tiến độ, mất kết nối và trạng thái hoàn thành.
- [ ] Điều khiển bắt đầu/kết thúc/rút lui có kiểm tra quyền server và xác nhận khi kết thúc sớm.
- [ ] Bảng tạm thời và bảng cuối tách nhóm hoàn thành/chưa hoàn thành; xếp hạng theo thời gian.
- [ ] Top 3 có trang phục, tên và thời gian; hạn chế hiệu ứng nặng, chỉ phát sau khi server chốt phiên.
- [ ] Thêm màn hình công khai không chứa đáp án, xuất kết quả CSV và tạo phiên mới không ghi đè lịch sử.

### Giai đoạn F — Kiểm thử và triển khai sau khi được cho phép

- [ ] Test luật: đúng đủ 2 mỗi phòng, câu trùng không cộng, sai được thử lại, điểm không vượt 10, không sửa giờ từ client.
- [ ] Test lifecycle: bắt đầu chung, vào muộn, mất mạng, hai tab, chủ phòng mất kết nối, người bỏ cuộc, hết giờ, ít hơn 3 người và đồng hạng.
- [ ] Test quyền host: đổi tên thành tên chủ phòng hoặc biết mã mời/URL dashboard không lấy được quyền; client không đọc được bộ đáp án; khôi phục quyền thu hồi phiên cũ; host không sửa được phiên của người khác hoặc gọi API CMS chỉ nhờ quyền host.
- [ ] Test dashboard: roster khớp danh sách server, câu hỏi bị khóa khi bắt đầu, bảng đang thi không giả làm bảng về đích, snapshot sau reconnect không thiếu sự kiện, màn chiếu và CSV không lộ thông tin khôi phục.
- [ ] Kiểm thử socket theo các mức 10/30/65 kết nối; đo độ trễ đồng bộ, lỗi, CPU và RAM. 65 là cấu hình mục tiêu cần đo, không phải bảo đảm hiệu năng.
- [ ] Đo FPS/frame time trên máy chơi thực ở cùng phòng và đường di chuyển; so sánh trước/sau với cùng cấu hình. Test socket không thay thế test GPU hoặc tải trang 3D.
- [ ] Kiểm tra trình duyệt với hai người thực, HUD thu gọn, cỡ màn hình nhỏ và kết quả đồng nhất.
- [ ] Chạy npm.cmd test, npm.cmd run build và lint phù hợp; phân biệt lỗi tồn tại trước với lỗi phát sinh. Cài dependency và đọc tài liệu Next.js cục bộ trước khi viết mã Next.js.
- [ ] Cập nhật hướng dẫn tổ chức buổi chơi và vận hành; triển khai chỉ khi người dùng cho phép. Không kill/chiếm cổng dịch vụ khác.

## 5. Ranh giới bằng chứng

Kế hoạch dựa trên đọc mã nguồn hiện tại và lựa chọn người dùng. Chưa có prototype trang phục, test luật thi, benchmark nhiều người hay triển khai các tính năng này. Không coi các bước checklist là công việc đã hoàn thành.
