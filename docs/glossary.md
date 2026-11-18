# Tripmate — Bảng thuật ngữ

- **Mục đích:** Chốt cách gọi thống nhất cho khái niệm sản phẩm, giao diện và kỹ thuật trong toàn bộ dự án.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Cột "Dùng" là cách gọi chính thức trong tài liệu và giao diện. Cột "Không dùng" liệt kê các cách gọi dễ gây nhầm cần tránh. Mã/định danh kỹ thuật giữ tiếng Anh theo quy ước dự án.

---

## 1. Khái niệm sản phẩm

| Dùng | Định nghĩa | Không dùng / dễ nhầm | Định danh kỹ thuật |
|------|-----------|----------------------|--------------------|
| **Chuyến đi** | Một nhóm cùng lên kế hoạch, ghi chi tiêu và quyết toán | Nhóm, sự kiện, dự án | `trips` |
| **Thành viên** | Một người trong chuyến, thật hoặc ảo | Người dùng (khi nói về vai trò trong chuyến) | `trip_members` |
| **Người tổ chức (owner)** | Thành viên tạo chuyến, có quyền chốt kèo, đổi mã mời, chốt quyết toán, xóa chuyến | Admin, chủ nhóm | `role = 'owner'` |
| **Thành viên thường (member)** | Thành viên không phải owner | — | `role = 'member'` |
| **Thành viên ảo** | Người chưa có tài khoản/phiên, chỉ có tên, do người khác thêm để gán vào khoản chi | Khách, người dùng giả | `user_id is null` |
| **Nhận thành viên (claim)** | Người thật chọn "Tôi là…" để gắn mình vào một thành viên ảo, giữ nguyên lịch sử | Gộp tài khoản (merge) — chỉ dùng cho hợp nhất hai tài khoản | `claim_member` |
| **Khôi phục danh tính** | Lấy lại quyền vào chuyến sau khi mất phiên ẩn danh | Đăng nhập lại | FR-36 |
| **Phiên ẩn danh** | Phiên đăng nhập tạm không cần email/mật khẩu | Tài khoản khách | Supabase anonymous auth |
| **Liên kết Google** | Nâng cấp phiên ẩn danh lên tài khoản Google giữ nguyên dữ liệu | Đăng ký | `linkIdentity` |
| **Link mời / Mã mời** | Đường dẫn và mã ngẫu nhiên để vào chuyến | Link chia sẻ | `trips.invite_code` |
| **Ý tưởng** | Đề xuất điểm đến, chỗ ở hoặc hoạt động để nhóm bình chọn | Gợi ý, đề cử | `ideas` |
| **Vote** | Bình chọn "thích" một ý tưởng (mỗi người một vote mỗi ý tưởng) | Phiếu, upvote | `idea_votes` |
| **Poll ngày** | Cuộc thăm dò ngày đi: mỗi người chọn rảnh/có thể/bận | Lịch hẹn | `date_poll_options`, `date_votes` |
| **Chốt kèo** | Khóa một lựa chọn cuối cùng (điểm đến hoặc ngày); chỉ owner làm được và mở lại được | Chọn, xác nhận | `is_locked` |
| **Lịch trình** | Các hoạt động sắp theo ngày của chuyến | Kế hoạch (nghĩa rộng hơn) | `itinerary_items` |
| **Hoạt động** | Một mục trong lịch trình | Sự kiện | `itinerary_items` |
| **Dự toán** | Số tiền dự kiến chi cho từng hạng mục | Ngân sách (dùng thay được trong lời nói nhưng ghi "dự toán" trong tài liệu) | `trip_budgets` |
| **Hạng mục** | Nhóm chi tiêu: lưu trú, di chuyển, ăn uống, vé, khác | Danh mục | `expense_category` |
| **Khoản chi** | Một lần chi tiền có người trả và người cùng chịu | Hóa đơn, giao dịch (tránh nhầm với thanh toán) | `expenses` |
| **Người trả** | Thành viên đã bỏ tiền ra cho khoản chi | Người ứng tiền (dùng được trong lời nói) | `expenses.paid_by` |
| **Phần chia** | Số tiền mỗi người phải chịu trong một khoản chi | Phần, share (nhầm với kiểu chia theo phần) | `expense_splits.owed_amount` |
| **Kiểu chia** | Cách chia: đều, theo số tiền, theo %, theo phần | Chế độ chia | `split_type` |
| **Chia theo phần (shares)** | Mỗi người có số phần nguyên, tiền chia tỷ lệ theo phần (ví dụ người lớn 2, trẻ em 1) | — | `shares` |
| **Phần dư (làm tròn)** | Số đồng lẻ (1₫) còn lại khi chia không chẵn, được phân bổ theo quy tắc ở `08` | Số lẻ | `largest remainder` |
| **Số dư** | Số tiền một thành viên được nhận (dương) hoặc cần trả (âm) = đã trả − phải chịu ± thanh toán | Công nợ (dùng thay trong lời nói) | `net` |
| **Chủ nợ / Con nợ** | Thành viên có số dư dương / âm | Người nợ cũ, người bị nợ (gây nhầm) | `net > 0` / `net < 0` |
| **Tối giản nợ** | Thuật toán tìm ít giao dịch chuyển khoản nhất để mọi số dư về 0 (heuristic) | Cấn trừ, bù trừ | `simplify` |
| **Quyết toán** | Cả quá trình cuối chuyến: xem số dư, chuyển khoản, đánh dấu đã trả | Thanh toán (nghĩa hẹp hơn, chỉ một lần chuyển) | Tab "Quyết toán" |
| **Giao dịch đề xuất** | Một lần chuyển "A trả B số tiền X" do thuật toán gợi ý | Khoản nợ | kết quả `simplify` |
| **Thanh toán** | Một lần chuyển tiền thực tế giữa hai thành viên đã được ghi nhận | Quyết toán (nghĩa rộng) | bảng `settlements` (đề xuất đổi tên `payments`, xem README R-07) |
| **Đã chuyển / Đã nhận** | Trạng thái thanh toán: người trả đánh dấu đã chuyển; người nhận xác nhận đã nhận | Hoàn tất | `marked_paid`, `confirmed` |
| **Chờ xác nhận** | Thanh toán đã đánh dấu chuyển nhưng người nhận chưa xác nhận | Đang xử lý | `marked_paid` |
| **Chốt quyết toán** | Khóa chuyến để chặn sửa khoản chi; owner mở khóa được | Đóng chuyến | `trip_status = 'locked'` |
| **VietQR** | Chuẩn mã QR chuyển khoản liên ngân hàng của NAPAS, theo chuẩn EMVCo | QR ngân hàng, QR chuyển tiền (chung chung) | `lib/vietqr` |
| **Thông tin nhận tiền** | Ngân hàng, số tài khoản, tên chủ tài khoản của thành viên | Thông tin thẻ | `member_bank_accounts` |
| **Mã BIN** | Mã 6 chữ số định danh ngân hàng trong VietQR | Mã ngân hàng (dễ nhầm với tên viết tắt) | `bank_bin` |

---

## 2. Thuật ngữ kỹ thuật và quy trình

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **PWA** | Web app có thể cài về màn hình chính, chạy toàn màn hình và dùng được một phần khi offline |
| **RLS (Row Level Security)** | Cơ chế Postgres kiểm quyền theo từng dòng; nền tảng bảo mật của dự án |
| **RPC** | Hàm Postgres gọi từ client; mọi ghi dữ liệu tiền đều đi qua RPC |
| **SECURITY DEFINER** | Hàm chạy với quyền của người tạo hàm; bắt buộc đặt `search_path` và tự kiểm quyền bằng `auth.uid()` |
| **Xóa mềm** | Đánh dấu `deleted_at` thay vì xóa hẳn; dữ liệu đã xóa mềm không tham gia tính toán |
| **Khóa lạc quan** | Cơ chế dùng cột `version` để phát hiện hai người sửa cùng lúc |
| **Điểm cơ bản (basis point, bp)** | 1/100 của 1%; 33,33% = 3333 bp; tổng bằng 10000 |
| **`seq_no`** | Số thứ tự khoản chi trong một chuyến, dùng để xoay vòng người nhận phần dư |
| **`client_id`** | UUID do client sinh để một khoản chi gửi lại nhiều lần không bị tạo trùng |
| **Lát cắt dọc mỏng nhất** | Phần nhỏ nhất xuyên qua mọi tầng (UI, API, DB) vẫn dùng được thật |
| **MoSCoW** | Phân loại ưu tiên: Must, Should, Could, Won't |
| **DoD (Definition of Done)** | Định nghĩa hoàn thành của một phase |
| **Thử nghiệm kín** | Giai đoạn 10–20 nhóm thật dùng trước khi ra mắt công khai |
| **Ra mắt mềm** | Công bố hạn chế ở một số cộng đồng trước khi quảng bá rộng |

---

## 3. Quy tắc định dạng

| Chủ đề | Quy tắc |
|--------|---------|
| Tiền | Số nguyên VND, định dạng `1.234.567₫`, dấu chấm phân cách nghìn, không số thập phân |
| Ngày | `dd/mm/yyyy` hoặc `dd/mm` trong giao diện |
| Dấu số dư | Luôn kèm `+` hoặc `−` và chữ ("được nhận", "cần trả"); không chỉ dựa vào màu |
| Xưng hô trong giao diện | "bạn"; câu ngắn, thân thiện, chuyên nghiệp |
| Ngôn ngữ mã | Tên bảng, cột, biến, RPC bằng tiếng Anh `snake_case`/`camelCase`; chuỗi hiển thị nằm trong `lib/i18n/vi.ts` |

---

## Câu hỏi mở

1. "Quyết toán" và "Chia tiền" nên là tên tab nào cho người dùng thật? (liên quan Q-19)
2. Có nên đổi tên bảng `settlements` thành `payments` để khớp thuật ngữ "Thanh toán"? (R-07)
3. "Chốt kèo" là cách nói phổ biến ở mọi vùng/độ tuổi hay chủ yếu giới trẻ? Cần hỏi người dùng thử.

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-49 | Dùng "Thanh toán" cho một lần chuyển, "Quyết toán" cho cả quá trình | Có |
| D-50 | Dùng "Thành viên ảo" thay cho "khách" | Có |
| D-51 | Giữ "Chốt kèo" trong giao diện, thử trong giai đoạn kín | Có |
