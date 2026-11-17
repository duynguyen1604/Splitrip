# Tripmate — Glossary

**Mục đích:** Chuẩn hóa thuật ngữ sản phẩm, UX, database và test để mọi tài liệu/code dùng cùng một nghĩa.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** Bảng này ưu tiên tên tiếng Việt trong giao diện và giữ English identifier ở database/code. Các từ liên quan tiền và trạng thái thanh toán được định nghĩa chặt để tránh hiểu nhầm.

| Thuật ngữ tiếng Việt | English/code | Định nghĩa chuẩn | Không nên dùng thay thế |
|---|---|---|---|
| Chuyến đi | Trip | Không gian chung của một nhóm, gồm member, poll, itinerary, expense và settlement. | Project, group chat |
| Người tổ chức | Owner | Member có quyền tạo/quản lý trip và các action owner-only. | Admin nếu không nói về hệ thống |
| Thành viên | Member | Người thuộc trip và có thể xem/thao tác theo role. | User (user là auth identity) |
| Thành viên ảo | Virtual member | Member record chưa gắn identity thật, do owner thêm để tính người chưa vào app. | Guest nếu guest được hiểu là người đã join |
| Identity ẩn danh | Anonymous identity | Supabase Auth identity không yêu cầu email/password trước khi dùng core flow. | Anonymous user nếu cần phân biệt auth user và display name |
| Nâng cấp tài khoản | Identity upgrade | Liên kết anonymous identity với Google/account thật mà không mất dữ liệu. | Register lại |
| Link mời | Invite link | URL chứa token/code để một identity redeem và join trip. | Public URL; link không phải quyền vĩnh viễn |
| Mã mời | Invite code/token | Giá trị ngẫu nhiên dùng redeem; raw token không lưu DB/log. | Trip ID |
| Chốt kèo | Lock/decision lock | Hành động biến poll mở thành kết quả đã thống nhất; thay đổi sau đó cần quyền/cảnh báo. | Final forever |
| Bình chọn | Poll | Tập option để member chọn destination/date/custom idea. | Survey nếu không có quyết định |
| Lựa chọn | Poll option | Một phương án trong poll. | Vote |
| Phiếu | Vote | Lựa chọn của một member cho một poll option. | Like |
| Lịch trình | Itinerary | Danh sách hoạt động theo ngày/thứ tự của trip. | Booking |
| Ngày lịch trình | Itinerary day | Ngày theo date hoặc day index (`Day 1`) chứa các item. | Calendar event |
| Hoạt động | Itinerary item | Một điểm đến/sự kiện/việc cần làm trong lịch trình. | Expense |
| Dự toán | Budget estimate | Ước tính chi phí theo category; không tham gia số nợ thực tế. | Balance |
| Khoản chi | Expense | Chi phí thực tế do một payer trả và được phân bổ cho participants. | Bill nếu không rõ data model |
| Người trả | Payer | Member đã thanh toán expense ban đầu. | Debtor; payer có thể là creditor ròng |
| Người tham gia khoản chi | Participant | Member chịu một share của expense. | Payer (hai khái niệm có thể khác) |
| Cách chia | Split method | Quy tắc phân bổ expense: `equal`, `exact`, `percentage`, `shares`. | Settlement method |
| Chia đều | Equal split | Chia amount cho participant, phần dư theo stable order. | Chia gần đều nếu không nói rounding |
| Chia theo số tiền | Exact split | Nhập amount cụ thể cho từng participant; tổng phải khớp expense. | Manual override không validation |
| Chia theo phần trăm | Percentage split | Nhập basis points tổng 10000 (100%). | Float percentage |
| Chia theo phần | Shares split | Mỗi participant có số phần nguyên dương; share theo tỷ lệ. | Weight nếu UI không giải thích |
| Phần chịu | Share | Số VND một participant phải chịu của expense. | Balance |
| Phần dư làm tròn | Rounding remainder | Số đồng còn lại sau floor; phân bổ deterministic. | Sai số |
| Số dư | Balance | `paid - owed`; dương là sẽ nhận, âm là cần trả. | Tổng tiền đã chi |
| Sẽ nhận | Creditor balance | Net balance dương của member. | Profit |
| Cần trả | Debtor balance | Net balance âm của member; amount phải trả là trị tuyệt đối. | Con nợ |
| Quyết toán | Settlement | Snapshot/tính toán biến balances thành transfer cần thực hiện. | Payment processing |
| Giao dịch chuyển khoản | Transfer | Một nghĩa vụ từ một debtor sang một creditor với amount VND. | Bank transaction; app chưa xác nhận ngân hàng |
| Tối giản nợ | Transfer minimization | Tạo ít transfer hơn bằng cách ghép debtor/creditor; MVP dùng greedy heuristic. | Optimal proof |
| Heuristic tham lam | Greedy heuristic | Luôn ghép residual lớn nhất hiện tại; deterministic nhưng không đảm bảo optimum tuyệt đối. | Exact algorithm |
| Đánh dấu đã trả | Marked paid | Debtor tự báo đã thực hiện chuyển khoản. | Đã nhận tiền |
| Xác nhận đã nhận | Confirmed received | Creditor xác nhận tiền đã vào. | Marked paid |
| Tranh chấp | Disputed | Transfer/expense cần review vì thay đổi hoặc không đồng thuận. | Error tự động |
| VietQR | VietQR | Payload/QR hướng dẫn chuyển khoản theo chuẩn ecosystem Việt Nam. | Payment confirmation |
| Nội dung chuyển khoản | Add info/transfer note | Chuỗi ngắn để recipient nhận diện transfer. | Secret/token |
| Hồ sơ nhận tiền | Payment profile | Bank BIN, account number/name dùng tạo payment instruction, được bảo vệ riêng. | User profile |
| Chốt settlement | Close settlement/trip | Đánh dấu trip đã hoàn tất theo rule xác nhận; không xóa lịch sử. | Delete trip |
| Bản chụp quyết toán | Settlement snapshot | Kết quả balances/transfers immutable tại một revision. | Live calculation nếu đã đóng |
| Phiên bản quyết toán | Settlement revision | Lần tính lại sau khi expense thay đổi. | Database migration |
| Realtime | Realtime update | Tín hiệu thay đổi từ Supabase; client refetch snapshot. | Source of truth |
| Dữ liệu cũ | Stale data | Cache không chắc còn mới, phải hiển thị timestamp/badge. | Offline = luôn stale |
| Bản nháp | Draft | Input local chưa được server xác nhận. | Saved expense |
| Soft delete | Soft delete/void | Ẩn/đánh dấu không hoạt động nhưng giữ record cho audit/history. | Hard delete |
| Row Level Security | RLS | Policy Postgres kiểm soát row theo auth identity/membership. | UI permission |
| Member scope | Trip membership scope | Quyền dữ liệu bắt nguồn từ member active của trip. | Invite code auth |
| Audit event | Audit event | Log actor/action/time/entity đã redact để giải thích thay đổi. | Analytics event |
| Core flow | Core flow | Luồng tối thiểu create → join → expense → balance/settlement. | Tất cả tính năng |
| Lát cắt dọc | Vertical slice | Một luồng chạy end-to-end qua UI, API, DB, auth và test. | Module mock |
| Free tier guardrail | Quota guardrail | Giới hạn member/expense/realtime/payload để không vượt dịch vụ miễn phí. | SLA |
| React | React | UI library dùng để xây các màn hình tương tác của Tripmate. | Backend framework |
| Vite | Vite | Build tool/dev server cho React; tạo static assets để deploy lên Cloudflare Pages. | Runtime production |
| Cloudflare Pages | Cloudflare Pages | Nền tảng hosting static/CDN và preview deployment cho frontend Tripmate. | Container runtime |
| Cloudflare Workers | Cloudflare Workers | Runtime edge tùy chọn cho server/API; không phải lựa chọn bắt buộc của MVP. | Cloudflare Pages static hosting |
| Docker image | Docker image | Artifact đóng gói môi trường build/chạy; Tripmate dùng chủ yếu cho local/CI. | Production container trên Cloudflare Free |
| Docker Compose | Docker Compose | Cấu hình chạy nhiều service local, ví dụ frontend + tooling/Supabase local. | Cloud deployment |
| PWA shell | PWA shell | HTML/JS/CSS/icon tối thiểu được cache để app mở nhanh và có thể install. | Full offline app |
| Static hosting | Static hosting | Phục vụ file build đã tạo; không tự chạy Node.js server hoặc Docker container. | SSR hosting |
| Edge Function | Edge Function | Function chạy gần người dùng, dùng tùy chọn cho mutation cần server validation; core vẫn dựa trên Supabase RLS/RPC. | Browser-only validation |

## Quy tắc dùng thuật ngữ

1. UI dùng “Bạn cần trả” và “Bạn sẽ nhận”, không dùng “con nợ” hoặc chỉ dấu âm/dương.
2. `marked_paid` không bao giờ được dịch là “đã nhận tiền”; chỉ `confirmed_received` mới có nghĩa đó.
3. “Chốt kèo” chỉ áp dụng cho poll/decision; “đóng quyết toán” là trạng thái tài chính khác.
4. “Expense” là dữ liệu chi thực tế; “budget estimate” là dự toán và không được trộn trong settlement.
5. “Anonymous” mô tả auth identity, không có nghĩa dữ liệu trip được công khai.

## Câu hỏi mở

1. Có cần thêm thuật ngữ chính thức cho `co-owner` nếu role này được bật sau MVP không?
2. Trong UI, dùng “khoản chi” hay “chi tiêu” làm nhãn chính cho expense?
3. Có cần phân biệt “hoàn tất chuyến đi” và “đóng quyết toán” bằng hai trạng thái riêng trong toàn bộ tài liệu không?

## Quyết định cần chốt

| Mã | Quyết định | Đề xuất mặc định |
|---|---|---|
| DEC-GLOSS-01 | Thuật ngữ UI tiền | Dùng “Bạn cần trả”, “Bạn sẽ nhận”, “Đã đánh dấu đã trả”, “Đã xác nhận đã nhận”. |
| DEC-GLOSS-02 | Expense label | Dùng “Khoản chi” trong UI; giữ `expense` trong code/database. |
| DEC-GLOSS-03 | Trip completion | Dùng “Đóng quyết toán” cho financial state và “Hoàn tất chuyến đi” cho trip state nếu cả hai cùng tồn tại. |
