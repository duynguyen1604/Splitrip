# Tripmate — Định hướng mở rộng sản phẩm

## Tầm nhìn

Tripmate giúp một nhóm đi từ ý tưởng đến khi kết thúc chuyến: chọn nơi và ngày, tìm hoạt động hoặc tour, dựng lịch trình trên bản đồ, theo dõi ngân sách và chi tiêu, rồi chia khoản cần thanh toán. Trải nghiệm ưu tiên điện thoại và có thể cài như ứng dụng web.

## Người dùng và quyền

- **Người dùng:** tạo tài khoản, đăng nhập, quản lý hồ sơ và các chuyến của mình.
- **Owner chuyến:** mời thành viên, quản lý lịch trình, ngân sách và quyết toán.
- **Thành viên:** cùng đề xuất, bình chọn, xem kế hoạch và ghi nhận chi tiêu theo quyền được cấp.
- **Quản trị hệ thống:** hỗ trợ tài khoản, kiểm duyệt nội dung công khai và xử lý báo cáo; không mặc định có quyền xem tài khoản ngân hàng riêng tư.

## Các giai đoạn

### P0 — Nền tảng tài khoản và vận hành

- Mobile-first web app, đăng nhập email/mật khẩu, phiên bền vững và khôi phục mật khẩu.
- PostgreSQL chỉ được truy cập từ server; phân quyền thành viên và quyền quản trị được kiểm tra ở server.
- Trang quản trị tài khoản, vai trò, khóa/mở tài khoản và nhật ký thao tác quản trị.
- Hoàn thiện chuyến, mời nhóm, chi tiêu, VietQR; chuyển mã mời sang mã ngắn công khai riêng trong nội dung chuyển khoản.
- PWA có manifest, cài lên màn hình chính và trạng thái mất kết nối rõ ràng.

### P1 — Cùng nhau chọn chuyến

- Danh sách ý tưởng, bình chọn, bình chọn ngày và chốt lựa chọn.
- Thành viên nhận biết thay đổi quan trọng trong chuyến.
- Quyền owner/member và trạng thái khóa được áp dụng nhất quán ở giao diện lẫn API.

### P2 — Lịch trình và bản đồ

- Hoạt động theo ngày, giờ, địa điểm, chi phí dự kiến, liên kết bản đồ và thứ tự di chuyển.
- Bản đồ có ghim điểm đến, lưu trú, ăn uống và hoạt động; hỗ trợ mở chỉ đường trong ứng dụng bản đồ của điện thoại.
- Ước tính quãng đường/thời gian giữa các điểm và dự toán theo hạng mục.

### P3 — Khám phá điểm đến và tour

- Tìm kiếm điểm đến, hoạt động và tour theo khu vực, ngày, ngân sách, thời lượng và loại hình chuyến đi.
- Kết quả phải cho biết nguồn, lần cập nhật và liên kết đặt dịch vụ; chỉ tích hợp nguồn có quyền sử dụng dữ liệu.
- Có thể thêm đánh dấu yêu thích và đưa kết quả vào lịch trình nhóm.

### P4 — Phượt và leo núi

- Tuyến đường, độ dài, độ cao, thời lượng dự kiến, điểm xuất phát/kết thúc và điểm dừng.
- Thông tin thời tiết, cảnh báo và quy định khu vực từ nguồn có thể kiểm chứng; hiển thị thời điểm cập nhật.
- Danh sách chuẩn bị, người liên hệ khẩn cấp, chia sẻ kế hoạch tuyến và check-in tùy chọn.
- Không lưu vị trí nền liên tục mặc định; bản đồ offline chỉ triển khai sau khi chọn nhà cung cấp và xác minh điều khoản dữ liệu.

### P5 — Hoàn thiện và mở rộng

- Đồng bộ thiết bị, offline có kiểm soát, thông báo, hỗ trợ tiếp cận, sao lưu/khôi phục và quan sát lỗi.
- Đánh giá nhu cầu đóng gói native app cho App Store/Google Play sau khi PWA được dùng thử với nhóm thật.

## Nguyên tắc kỹ thuật và sản phẩm

- Giữ số tiền là số nguyên VND và mọi ghi nhận quan trọng có lịch sử.
- Không kết nối PostgreSQL từ trình duyệt; mọi thao tác đi qua API server có xác thực, kiểm tra quyền và giới hạn tốc độ.
- Không biến admin hệ thống thành owner của mọi chuyến; quyền hỗ trợ phải có phạm vi và nhật ký.
- Không cung cấp lời khẳng định an toàn cho cung đường nếu dữ liệu nguồn đã cũ hoặc không xác minh được.
- Tìm tour không scrape trang bên thứ ba; ưu tiên API/đối tác được phép và hiển thị liên kết nguồn.

## Trạng thái so với code hiện tại

Code hiện có nền tảng chuyến, chi tiêu, số dư, quyết toán và VietQR. Tài khoản email/mật khẩu, quản trị người dùng và PostgreSQL trực tiếp đang được bổ sung. Ý tưởng/bình chọn, lịch trình/bản đồ, tìm tour, trekking, PWA offline và thông báo chưa triển khai.
