# Tripmate — Product Requirements Document (PRD)

- **Mục đích:** Định nghĩa chính xác Tripmate MVP phải làm gì, không làm gì, và thế nào là "đạt".
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

MVP gồm 5 module: (1) Chuyến đi và thành viên, (2) Ý tưởng và bình chọn, (3) Lịch trình, (4) Chi phí và dự toán, (5) Quyết toán. Có 38 yêu cầu chức năng (FR) và 18 yêu cầu phi chức năng (NFR), kèm quy tắc nghiệp vụ và trường hợp biên. Tiền luôn là số nguyên VND. Ưu tiên MoSCoW: **Must** là điều kiện để ra mắt, **Should** nên có trong MVP nếu còn thời gian, **Could** làm sau, **Won't** không làm trong MVP.

---

## 1. Tổng quan và phạm vi

### 1.1 Trong phạm vi MVP

Tạo chuyến, mời qua link/QR, vào bằng tên, thành viên ảo, bình chọn ý tưởng, poll ngày, chốt lựa chọn, lịch trình theo ngày, hạng mục dự toán, ghi chi tiêu với 4 kiểu chia, số dư, tối giản nợ, VietQR, đánh dấu đã trả, PWA cơ bản.

### 1.2 Ngoài phạm vi (Non-goals)

| ID | Không làm trong MVP | Lý do |
|----|---------------------|-------|
| NG-01 | Thanh toán thật trong app, giữ hộ tiền | Rủi ro pháp lý, giấy phép |
| NG-02 | Đa tiền tệ | Thị trường mục tiêu dùng VND; hoãn sau MVP |
| NG-03 | OCR hóa đơn, AI gợi ý lịch trình | Tốn công, hoãn sau MVP |
| NG-04 | Đặt phòng, vé trong app | Chỉ có thể là liên kết ngoài |
| NG-05 | App native iOS/Android | PWA đủ cho MVP |
| NG-06 | Chat trong app | Nhóm đã có Zalo/Messenger |
| NG-07 | Bản đồ tương tác, tối ưu tuyến | Chỉ lưu link Google Maps |
| NG-08 | Đồng bộ ngân hàng tự động, tự xác nhận đã nhận tiền | Cần tích hợp ngân hàng; xác nhận bằng tay |
| NG-09 | Chi tiêu định kỳ, nhiều nhóm gộp nợ | Ngoài phạm vi chuyến đi |

---

## 2. Yêu cầu chức năng

Cột "Tiêu chí chấp nhận" dùng định dạng Given/When/Then (G/W/T).

### 2.1 Module A — Chuyến đi và thành viên

| ID | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|----|-------|--------|--------------------|
| FR-01 | Tạo chuyến với tên (bắt buộc); điểm đến, ngày dự kiến, emoji bìa là tùy chọn. Người tạo là `owner`. | Must | G: người dùng chưa có tài khoản. W: nhập tên chuyến và bấm Tạo. T: chuyến được tạo, người dùng thành `owner`, vào trang chuyến trong dưới 3 giây. |
| FR-02 | Tham gia chuyến qua link bằng đăng nhập ẩn danh và tên hiển thị (1–30 ký tự). | Must | G: có link mời hợp lệ. W: mở link, nhập tên, bấm Vào nhóm. T: tạo phiên ẩn danh, tạo `trip_members`, hiển thị trang chuyến. Không yêu cầu email hay mật khẩu. |
| FR-03 | Link mời và mã QR; owner có thể đổi mã mời (làm link cũ hết hiệu lực) và bật/tắt tham gia. | Must | G: owner mở màn Mời. W: bấm Đổi mã mời. T: link cũ trả về "link đã hết hiệu lực"; link mới hoạt động; thành viên cũ không bị ảnh hưởng. |
| FR-04 | Thành viên ảo: owner/member tạo thành viên chưa có tài khoản (chỉ có tên) để gán khoản chi. | Must | G: có thành viên ảo "Bố Minh". W: ghi chi tiêu có "Bố Minh" tham gia. T: khoản chi tính nợ cho "Bố Minh" như thành viên thật. |
| FR-05 | Vai trò: `owner` và `member`. Owner chốt quyết toán, xóa chuyến, quản lý thành viên. | Must | G: người dùng là member. W: cố xóa chuyến. T: bị từ chối với thông báo quyền. |
| FR-06 | Sửa thông tin chuyến, lưu trữ (archive), xóa chuyến (owner). | Should | G: owner. W: bấm Xóa chuyến và xác nhận. T: chuyến chuyển sang trạng thái xóa mềm, ẩn khỏi mọi thành viên. |
| FR-07 | Rời nhóm hoặc xóa thành viên. Thành viên còn nợ/được nợ vẫn giữ trong tính toán, chuyển trạng thái `left`. | Must | G: Lan còn nợ 85.000₫. W: Lan rời nhóm. T: Lan hiển thị "đã rời", khoản nợ vẫn trong quyết toán, không bị xóa. |
| FR-08 | Nâng cấp phiên ẩn danh lên tài khoản Google, giữ nguyên danh tính và dữ liệu. | Should | G: thành viên ẩn danh. W: bấm Liên kết Google. T: cùng `user_id`, mọi dữ liệu giữ nguyên, thiết bị khác đăng nhập Google vào được chuyến. |
| FR-36 | Khôi phục danh tính khi mất phiên: chọn "Tôi là…" từ danh sách thành viên chưa gắn thiết bị, hoặc dùng link cá nhân. | Must | G: Đức xóa cookie và mở lại link mời. W: chọn "Tôi là Đức". T: gắn phiên mới vào thành viên Đức; thiết bị cũ mất quyền. Có cơ chế chống mạo danh (xem BR-09). |
| FR-37 | Thành viên ảo được "nhận" bởi người thật khi họ vào nhóm (claim) và gộp dữ liệu. | Must | G: có thành viên ảo "Bố Minh". W: Minh mở link, chọn "Tôi là Bố Minh". T: thành viên ảo gắn `user_id` của Minh, lịch sử chi tiêu giữ nguyên. |

### 2.2 Module B — Ý tưởng và bình chọn

| ID | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|----|-------|--------|--------------------|
| FR-09 | Thêm ý tưởng thuộc 1 trong 3 loại: điểm đến, chỗ ở, hoạt động. Có tên, ghi chú, link, ước giá tùy chọn. | Must | G: thành viên trong chuyến. W: thêm ý tưởng "Homestay Cầu Đất". T: ý tưởng hiển thị trong danh sách với 0 vote. |
| FR-10 | Mỗi thành viên bình chọn (thích/bỏ thích) nhiều ý tưởng; hiển thị số vote và ai đã vote. | Must | G: thành viên chưa vote. W: bấm vote. T: số vote +1, bấm lần nữa thì bỏ vote; một thành viên tối đa 1 vote mỗi ý tưởng. |
| FR-11 | Poll ngày: owner/member đề xuất các khoảng ngày; mỗi người chọn rảnh/có thể/bận; hiển thị tổng hợp. | Must | G: poll có 4 phương án. W: 6 thành viên trả lời. T: phương án có nhiều "rảnh" nhất được đánh dấu nổi bật; hiển thị ai chưa trả lời. |
| FR-12 | Khóa lựa chọn ("Chốt kèo") cho một ý tưởng hoặc một phương án ngày; chỉ owner chốt/mở lại. | Must | G: owner. W: bấm Chốt kèo trên "Đà Lạt". T: mục thành "đã chốt", vote bị khóa, thành viên nhận thông báo trong app; owner có thể Mở lại. |
| FR-13 | Bình luận ngắn dưới ý tưởng. | Could | G: thành viên. W: gửi bình luận. T: hiển thị dưới ý tưởng với tên và thời gian. |
| FR-14 | Xem trước link (tiêu đề/ảnh). | Could | Hoãn nếu thiếu thời gian. |

### 2.3 Module C — Lịch trình

| ID | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|----|-------|--------|--------------------|
| FR-15 | Lịch trình chia theo ngày, theo khoảng ngày của chuyến; thêm/sửa/xóa hoạt động. | Must | G: chuyến 3 ngày. W: thêm hoạt động vào ngày 2. T: hoạt động hiển thị dưới ngày 2, đúng thứ tự. |
| FR-16 | Tạo hoạt động từ ý tưởng đã chốt. | Should | G: ý tưởng đã chốt. W: bấm Thêm vào lịch trình, chọn ngày. T: hoạt động được tạo, giữ liên kết tới ý tưởng. |
| FR-17 | Sắp xếp lại hoạt động trong ngày và giữa các ngày (kéo thả; có nút lên/xuống thay thế). | Should | G: 3 hoạt động. W: kéo hoạt động 3 lên đầu. T: thứ tự lưu và đồng bộ cho người khác. |
| FR-18 | Hoạt động có giờ (tùy chọn), địa điểm, link Google Maps, ghi chú, ước giá. | Must | G: thêm hoạt động. W: nhập link Maps. T: hiển thị nút "Mở bản đồ" mở app bản đồ. |
| FR-19 | Chia sẻ lịch trình chỉ đọc qua link. | Could | Hoãn nếu thiếu thời gian. |

### 2.4 Module D — Chi phí và dự toán

| ID | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|----|-------|--------|--------------------|
| FR-20 | Hạng mục dự toán (lưu trú, di chuyển, ăn uống, vé, khác) với số tiền dự toán. | Must | G: chuyến. W: đặt dự toán Ăn uống 3.000.000₫. T: tab Chi phí hiển thị đã chi/dự toán và thanh tiến độ. |
| FR-21 | Dự toán trên đầu người (tự tính từ tổng dự toán / số thành viên). | Should | G: dự toán tổng 12.000.000₫, 6 thành viên. T: hiển thị 2.000.000₫/người. |
| FR-22 | Ghi khoản chi: số tiền (VND nguyên > 0), tên khoản, người trả (mặc định là mình), người tham gia, hạng mục, ngày, kiểu chia. | Must | G: thành viên. W: nhập 450.000₫, chọn người tham gia, Lưu. T: khoản chi lưu, số dư cập nhật ngay cho mọi người. |
| FR-23 | Kiểu chia đều. | Must | G: 100.000₫ chia 3 người. T: 33.334/33.333/33.333 theo quy tắc làm tròn (xem `08`). |
| FR-24 | Kiểu chia theo số tiền cụ thể; tổng phải bằng tổng khoản chi. | Must | G: nhập tổng các phần ≠ tổng khoản chi. W: Lưu. T: bị chặn, hiển thị còn thiếu/thừa bao nhiêu. |
| FR-25 | Kiểu chia theo phần trăm (độ chính xác 0,01%); tổng phải bằng 100%. | Should | G: 33,33% / 33,33% / 33,34%. T: tính đúng, không lệch 1₫. |
| FR-26 | Kiểu chia theo phần (shares), ví dụ 1 người lớn = 2 phần, 1 trẻ em = 1 phần. | Should | G: 900.000₫, phần 1/2/3. T: 150.000₫/300.000₫/450.000₫. |
| FR-27 | Sửa/xóa khoản chi; lưu lịch sử sửa (ai, khi nào, thay đổi gì). Chỉ người tạo hoặc owner được sửa. | Must | G: khoản chi đã lưu. W: người tạo sửa số tiền. T: số dư tính lại, lịch sử ghi nhận. |
| FR-28 | Thành viên có thể "đề nghị chỉnh phần chia" của mình; người tạo khoản chi hoặc owner chấp nhận/từ chối. | Should | G: Lan thấy khoản hải sản có tên mình. W: bấm Đề nghị chỉnh. T: người tạo nhận đề nghị, chấp nhận thì phần chia đổi. |
| FR-29a | Ảnh hóa đơn đính kèm khoản chi. | Could | Hoãn; Supabase Storage free chỉ 1 GB. |

> Ghi chú đánh số: các ID FR-29 đến FR-35 thuộc module Quyết toán ở mục 2.5. Chức năng ảnh hóa đơn dùng FR-29a để không trùng.

### 2.5 Module E — Quyết toán

| ID | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|----|-------|--------|--------------------|
| FR-29 | Số dư mỗi thành viên = đã trả − phải chịu ± các khoản đã chuyển. | Must | G: có khoản chi. W: mở tab Quyết toán. T: số dư mỗi người có tổng đại số bằng 0. |
| FR-30 | Tối giản nợ: đề xuất danh sách chuyển khoản ít giao dịch (heuristic, xem `08`). | Must | G: số dư +200k, −25k, −175k. T: 2 giao dịch: người −175k → +200k, người −25k → +200k. |
| FR-31 | Hiển thị mã VietQR cho từng giao dịch, điền sẵn số tiền và nội dung. | Must | G: người nợ bấm "Thanh toán". T: hiển thị QR + số tài khoản + nút sao chép; QR quét được trong app ngân hàng. |
| FR-32 | Thành viên nhập thông tin nhận tiền (ngân hàng, số tài khoản, tên chủ tài khoản). | Must | G: người nhận chưa nhập. W: người nợ mở QR. T: hiển thị "Chưa có thông tin nhận tiền" và nút nhắc người nhận. |
| FR-33 | Đánh dấu đã trả: người trả đánh dấu "đã chuyển", người nhận xác nhận "đã nhận"; ghi thành khoản thanh toán. | Must | G: có giao dịch B → A 33.333₫. W: B đánh dấu đã chuyển, A xác nhận. T: số dư cập nhật, giao dịch chuyển sang hoàn tất. |
| FR-34 | Chốt quyết toán (khóa), có thể mở lại. | Should | G: owner. W: bấm Chốt quyết toán. T: mọi sửa khoản chi hiển thị cảnh báo và cần mở khóa (xem EC-02). |
| FR-35 | Chia sẻ bản tổng kết chuyến (ảnh/link). | Could | Hoãn. |

---

## 3. Yêu cầu phi chức năng

| ID | Nhóm | Yêu cầu | Chỉ tiêu |
|----|------|---------|----------|
| NFR-01 | Hiệu năng | Tải trang chuyến lần đầu trên 4G | LCP dưới 2,5 giây (p75) |
| NFR-02 | Hiệu năng | Phản hồi thao tác (vote, thêm chi tiêu) | Cập nhật giao diện lạc quan dưới 100 ms |
| NFR-03 | Hiệu năng | Dung lượng JS ban đầu | Dưới 200 KB gzip cho trang chuyến |
| NFR-04 | Realtime | Thay đổi của người khác xuất hiện | Dưới 3 giây trong điều kiện bình thường |
| NFR-05 | Bảo mật | Mọi bảng bật RLS; không có truy cập theo `anon` key ngoài chính sách | 100% bảng có policy, kiểm thử tự động |
| NFR-06 | Bảo mật | Mã mời ngẫu nhiên, đủ dài, có giới hạn tốc độ | Tối thiểu 10 ký tự, 60+ bit entropy |
| NFR-07 | Bảo mật | Chống lạm dụng tạo phiên ẩn danh | CAPTCHA và giới hạn theo IP |
| NFR-08 | Quyền riêng tư | Số tài khoản chỉ lộ cho người cần chuyển tiền cho chủ tài khoản đó | Không SELECT trực tiếp được; chỉ qua RPC |
| NFR-09 | Quyền riêng tư | Người dùng xóa được dữ liệu của mình | Chức năng xóa/ẩn danh hóa tên và tài khoản ngân hàng |
| NFR-10 | Offline | Xem lịch trình và số dư đã tải khi mất mạng | Dữ liệu đã mở gần đây có sẵn |
| NFR-11 | Offline | Thêm khoản chi khi offline và đồng bộ lại | Hàng đợi ghi, giải quyết xung đột an toàn (Should) |
| NFR-12 | Truy cập | WCAG 2.1 AA ở các luồng chính | Tương phản tối thiểu 4.5:1, vùng chạm 44×44 px, hỗ trợ cỡ chữ lớn |
| NFR-13 | SEO | Chỉ trang giới thiệu cần SEO; trang chuyến không index | `noindex` cho trang chuyến |
| NFR-14 | Tương thích | iOS Safari 16.4+, Android Chrome 110+, Chrome/Safari/Edge desktop 2 bản mới nhất | Kiểm thử thủ công |
| NFR-15 | Tính đúng đắn | Tổng các phần chia luôn bằng tổng khoản chi, tổng số dư bằng 0 | Test thuộc tính trên 100% phép chia |
| NFR-16 | Khả dụng | Gói free không làm gián đoạn trải nghiệm | Có cơ chế chống Supabase tạm dừng; backup hằng tuần |
| NFR-17 | Ngôn ngữ | Giao diện tiếng Việt; số tiền định dạng `1.234.567₫` | Mọi chuỗi qua một nơi quản lý |
| NFR-18 | Quan sát | Báo lỗi và analytics tối giản, ưu tiên riêng tư | Sentry free; không theo dõi cá nhân |

---

## 4. Quy tắc nghiệp vụ và trường hợp biên

### 4.1 Quy tắc nghiệp vụ

| ID | Quy tắc |
|----|---------|
| BR-01 | Tiền là số nguyên VND (`bigint`), lớn hơn 0; không có số thập phân. |
| BR-02 | Phần dư khi chia lẻ được phân bổ từng 1₫ theo quy tắc ở `08-settlement-algorithm.md`; tổng các phần luôn bằng tổng khoản chi. |
| BR-03 | Số dư thành viên = Σ đã trả − Σ phải chịu + Σ đã chuyển đi − Σ đã nhận về. Tổng số dư của chuyến luôn bằng 0. |
| BR-04 | Một khoản chi phải có ít nhất 1 người tham gia; người trả không nhất thiết là người tham gia. |
| BR-05 | Chỉ owner được: xóa chuyến, đổi mã mời, chốt quyết toán, xóa thành viên khác, chốt kèo. |
| BR-06 | Xóa là xóa mềm; dữ liệu xóa không tham gia tính toán. |
| BR-07 | Thành viên rời nhóm/bị xóa vẫn giữ trong tính toán nợ nếu còn số dư khác 0. |
| BR-08 | Số tài khoản ngân hàng thuộc về một thành viên và không hiển thị cho người khác trừ khi người đó cần chuyển tiền cho họ. |
| BR-09 | Nhận lại danh tính ("Tôi là…"): thành viên đã có thiết bị đang hoạt động cần xác nhận hoặc owner duyệt; thành viên ảo thì nhận trực tiếp (xem EC-06). |
| BR-10 | Ngày chuyến đi: ngày bắt đầu ≤ ngày kết thúc, tối đa 30 ngày cho MVP. |

### 4.2 Trường hợp biên

| ID | Tình huống | Xử lý |
|----|-----------|-------|
| EC-01 | **Người rời nhóm khi còn nợ** | Giữ nguyên số dư; trạng thái `left`; vẫn xuất hiện trong gợi ý quyết toán; owner có thể đánh dấu "đã thỏa thuận ngoài app". |
| EC-02 | **Sửa khoản chi sau khi đã chốt quyết toán** | Cần owner mở khóa; sau khi sửa, hệ thống tính lại. Các khoản thanh toán đã ghi vẫn giữ nguyên, nên số dư mới có thể ra số dư còn lại khác 0; gợi ý quyết toán được tạo lại cho phần chênh lệch. Lịch sử sửa lưu đầy đủ. |
| EC-03 | **Chia lẻ 100.000₫ cho 3 người** | 33.334/33.333/33.333; người nhận 1₫ dư xoay vòng theo quy tắc ở `08` để không ai luôn bị thiệt. |
| EC-04 | **Thành viên ảo sau này đăng nhập thật** | Chọn "Tôi là…"; thành viên ảo gắn `user_id`; không tạo bản ghi trùng; lịch sử giữ nguyên (FR-37). |
| EC-05 | **Hai người cùng sửa một khoản chi** | Ghi đè theo phiên bản (`version`); người sau nhận cảnh báo xung đột và xem thay đổi của người trước. |
| EC-06 | **Hai người cùng nhận một thành viên ảo** | Người đầu tiên thành công; người thứ hai nhận thông báo "đã được nhận". Nếu nhầm, owner có thể giải phóng lại. |
| EC-07 | **Số tiền rất lớn** | Giới hạn mỗi khoản chi 1 tỷ VND; số lớn hơn bị từ chối. |
| EC-08 | **Người trả không tham gia khoản chi** | Hợp lệ (trả hộ); người trả có số dư dương toàn bộ. |
| EC-09 | **Thanh toán vượt số cần trả** | Cho phép; số dư người nhận âm tương ứng, hiển thị cảnh báo. |
| EC-10 | **Xóa khoản chi đã có thanh toán liên quan** | Cho phép xóa mềm; thanh toán giữ lại; số dư tính lại. |
| EC-11 | **Chuyến chỉ có một thành viên** | Quyết toán trống, hiển thị "Chưa có ai để chia". |
| EC-12 | **Phiên ẩn danh hết hạn/bị xóa** | Xem FR-36. |
| EC-13 | **Người dùng mở link mời của chuyến đã xóa/đã khóa** | Hiển thị thông báo rõ ràng, không lộ thông tin chuyến. |

---

## 5. Ma trận truy vết

Persona: P1 Minh Anh, P2 Đức, P3 Lan. Màn hình định nghĩa ở `05-ux-and-screens.md`.

| Yêu cầu | Persona | Màn hình |
|---------|---------|----------|
| FR-01 | P1 | S02 Tạo chuyến |
| FR-02 | P2, P3 | S03 Tham gia chuyến |
| FR-03 | P1 | S14 Thành viên và mời |
| FR-04 | P1 | S14, S10 |
| FR-05 | P1 | S15 Cài đặt chuyến |
| FR-06 | P1 | S15 |
| FR-07 | P2, P3 | S14 |
| FR-08 | P2 | S16 Hồ sơ và tài khoản |
| FR-36 | P2 | S03, S04 Chọn danh tính |
| FR-37 | P1, P2 | S04 |
| FR-09 | P1, P2 | S06 Ý tưởng |
| FR-10 | P2 | S06 |
| FR-11 | P1, P2, P3 | S07 Poll ngày |
| FR-12 | P1 | S06, S07 |
| FR-15, FR-16, FR-17, FR-18 | P1, P2 | S08 Lịch trình |
| FR-20, FR-21 | P1 | S09 Chi phí |
| FR-22, FR-23 đến FR-26 | P1, P2, P3 | S10 Thêm chi tiêu |
| FR-27, FR-28 | P1, P3 | S11 Chi tiết chi tiêu |
| FR-29, FR-30 | P1, P2, P3 | S12 Quyết toán |
| FR-31, FR-33 | P1, P2 | S13 Thanh toán QR |
| FR-32 | P1, P2, P3 | S16 |
| FR-34 | P1 | S12 |

---

## Câu hỏi mở

1. Giới hạn 30 ngày và 1 tỷ VND mỗi khoản chi có hợp lý? Số thành viên tối đa mỗi chuyến là bao nhiêu (đề xuất 30)?
2. Poll ngày dùng ngày cụ thể hay khoảng ngày? Có cần giờ không?
3. Có cần phân quyền `admin` (giữa owner và member) cho nhóm đông không?
4. Ai được thêm thành viên ảo: mọi thành viên hay chỉ owner?
5. Mức độ "offline" tối thiểu cho MVP: chỉ đọc, hay cả ghi (NFR-11)?
6. EC-05: dùng khóa lạc quan theo `version` có đủ hay cần cơ chế hợp nhất theo trường?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-08 | Số thành viên tối đa mỗi chuyến | 30 |
| D-09 | Giới hạn khoản chi | 1.000.000.000₫ |
| D-10 | Quyền thêm thành viên ảo | Mọi thành viên |
| D-11 | Offline trong MVP | Chỉ đọc (NFR-10 Must); ghi offline (NFR-11) làm ở phase cuối nếu còn thời gian |
| D-12 | Có đưa FR-25, FR-26, FR-28 vào MVP không | Có FR-25 và FR-26 vì dùng cho gia đình; FR-28 nếu còn thời gian |
