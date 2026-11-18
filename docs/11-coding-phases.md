# Tripmate — Lộ trình triển khai code

- **Mục đích:** Chia bộ thiết kế sản phẩm thành các lát cắt code có thứ tự, đầu ra và tiêu chí hoàn thành rõ ràng.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Nguyên tắc triển khai

- Mỗi giai đoạn phải để lại một ứng dụng chạy được và không phá dữ liệu/giao diện của giai đoạn trước.
- Các thao tác ghi tiền đi qua PostgreSQL RPC; RLS vẫn là ranh giới bảo mật.
- Tiền dùng số nguyên VND. Không tính tiền bằng số thực dấu phẩy động.
- Tài liệu `06-architecture.md` và `04-user-stories-and-backlog.md` chọn Next.js; `01-product-brief.md` còn ghi React + Vite. Lộ trình này tạm theo Next.js để thống nhất với architecture/backlog; cần cập nhật product brief khi chốt stack.

## Các giai đoạn

| Giai đoạn | Mục tiêu | Phạm vi chính | Đầu ra / điều kiện hoàn thành |
|---|---|---|---|
| **1 — Lát cắt chi tiêu tối thiểu** | Một nhóm dùng app để tạo chuyến, mời người khác, ghi chi tiêu và xem số dư. | Bootstrap Next.js + TypeScript; anonymous auth; trang danh sách/tạo chuyến; join bằng mã mời; thành viên và quyền owner/member cơ bản; ghi khoản chi chia đều; tính số dư từ khoản chi; SQL migration, RPC và RLS. | `npm run dev` khởi chạy; sau khi cấu hình Supabase và chạy migration, owner tạo chuyến, người khác join bằng link, thành viên ghi khoản chi và cả nhóm thấy số dư có tổng bằng 0. |
| **2 — Quyết toán và VietQR** | Hoàn tất vòng chuyển tiền sau chuyến đi. | Tối giản nợ; nhập thông tin nhận tiền; QR VietQR; đánh dấu đã chuyển/xác nhận; chốt/mở quyết toán. | Đề xuất giao dịch bảo toàn số dư; QR được quét thử trên ngân hàng thật; xác nhận thanh toán cập nhật số dư theo quy tắc. |
| **3 — Ý tưởng và bình chọn** | Cả nhóm cùng chọn nơi và ngày đi. | Ý tưởng, vote, poll ngày, chốt/mở lựa chọn, realtime và thông báo trạng thái. | Vote/poll đồng bộ; owner có quyền chốt; luồng mobile dễ dùng. |
| **4 — Lịch trình và dự toán** | Chuẩn bị kế hoạch chuyến đi trong cùng workspace. | Hoạt động theo ngày, địa điểm/Maps, sắp xếp, dự toán theo hạng mục, so sánh dự toán với chi thực tế. | Tạo/sửa/xóa hoạt động; tổng dự toán và thực chi hiển thị chính xác. |
| **5 — Hoàn thiện và thử nghiệm kín** | Sẵn sàng cho 10–20 nhóm sử dụng thực tế. | PWA/offline, khôi phục danh tính, xử lý xung đột, accessibility, quyền riêng tư, giám sát, QA đa thiết bị và checklist launch. | Hoàn thành tiêu chí MVP trong `09-test-plan.md`; không còn lỗi nghiêm trọng trong luồng vàng. |

## Giai đoạn 1 — Chi tiết thực hiện

### Trong phạm vi

1. Khởi tạo Next.js App Router, TypeScript, CSS responsive và hướng dẫn cấu hình môi trường.
2. Tạo/khôi phục phiên Supabase anonymous; mọi route nội bộ cần phiên hợp lệ.
3. Trang chủ: liệt kê chuyến của thành viên hiện tại, tạo chuyến và sao chép link mời.
4. Tham gia chuyến bằng invite code và display name.
5. Trang chuyến: danh sách thành viên, khoản chi, form thêm chi chia đều.
6. Số dư = đã trả − phải chịu; người trả có thể không nằm trong danh sách chia. Phần dư 1₫ phân bổ theo thứ tự thành viên ổn định.
7. Migration tạo bảng tối thiểu, RLS, helper quyền và RPC `create_trip`, `join_trip_by_code`, `add_expense`, `get_trip_balances`.

### Chưa làm trong giai đoạn 1

Thanh toán/VietQR, tối giản nợ, thành viên ảo, khôi phục danh tính, sửa/xóa khoản chi, nhiều kiểu chia, ý tưởng/poll, lịch trình, dự toán, offline ghi và triển khai cloud.

### Cấu hình để chạy

1. Cài Node.js 20.9 trở lên và chạy `npm install`.
2. Tạo Supabase project, bật Anonymous Sign-ins.
3. Chạy migration `supabase/migrations/0001_phase1_core.sql` trên project.
4. Sao chép `.env.example` thành `.env.local`, điền Project URL và anon/publishable key.
5. Chạy `npm run dev`.

## Ghi chú kỹ thuật

- Giai đoạn 1 dùng browser Supabase client; không có service-role key trong client.
- Invite code là mã ngẫu nhiên không tuần tự; endpoint tham gia chỉ trả thông tin chuyến cần cho màn hình tham gia.
- Chưa bật realtime ở lát cắt đầu: dữ liệu tải lại khi mở trang hoặc sau mutation.
- Xác thực anonymous không đồng nghĩa với cơ chế khôi phục danh tính. Mất storage trình duyệt sẽ mất phiên; giải quyết ở giai đoạn 5 sau khi chốt phương án R-01.

