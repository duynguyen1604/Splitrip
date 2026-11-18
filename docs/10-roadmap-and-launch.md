# Tripmate — Lộ trình, Rủi ro và Ra mắt

- **Mục đích:** Lên lịch theo tuần cho solo dev, quản lý rủi ro triển khai, kế hoạch thử nghiệm kín, ra mắt và tăng trưởng không tốn tiền, cách đo lường và hướng đi sau MVP.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Phát triển MVP trong 10 tuần (6 phase, khớp `04`), thử nghiệm kín với 10–20 nhóm bạn thật từ tuần 9, ra mắt công khai mềm vào khoảng tuần 13. Tăng trưởng dựa vào vòng lặp tự nhiên: mỗi link mời là một lần quảng bá cho sản phẩm, cộng với nội dung ngắn trong các cộng đồng du lịch. Đo lường tối giản, tôn trọng riêng tư, phần lớn KPI lấy trực tiếp từ dữ liệu của chính hệ thống. Các tính năng sau MVP chỉ bắt đầu khi đạt điều kiện cụ thể.

---

## 1. Lộ trình theo tuần

Giả định: làm việc khoảng 25–35 giờ/tuần. Nếu ít hơn, kéo dài mốc theo tỷ lệ. Mỗi phase có 20% thời gian đệm cho sửa lỗi (D-15).

| Tuần | Phase | Công việc chính | Mốc kiểm tra cuối giai đoạn |
|------|-------|-----------------|-----------------------------|
| 1 | P0 Nền tảng | Khởi tạo dự án, Supabase (dev/staging/prod), CI, đăng nhập ẩn danh, Sentry, cron giữ Supabase hoạt động và backup | **M0:** push `main` tự triển khai; tạo được phiên ẩn danh; migration chạy từ DB trống |
| 2–3 | P1 Lát cắt mỏng nhất | Tạo chuyến, mời, vào nhóm, thêm khoản chi chia đều, số dư | **M1:** bạn và 2–3 người thân dùng thử cho một chuyến thật; E2E-01/02 đạt; RLS test đạt |
| 4–5 | P2 Quyết toán và VietQR | 4 kiểu chia, tối giản nợ, QR, đánh dấu đã trả, thành viên ảo, sửa/xóa khoản chi | **M2:** TC/PT đạt; **QR quét được trên 4 app ngân hàng thật**; một nhóm nội bộ quyết toán xong một chuyến |
| 6–7 | P3 Ý tưởng, vote, poll ngày | Ý tưởng, vote, poll ngày, chốt kèo, khôi phục danh tính, đổi mã mời | **M3:** realtime vote dưới 3 giây; E2E-05/06 đạt |
| 8 | P4 Lịch trình và dự toán | Lịch trình theo ngày, tạo từ ý tưởng, kéo thả, dự toán | **M4:** vòng "trước, trong, sau chuyến" chạy trọn vẹn |
| 9–10 | P5 PWA và chất lượng | PWA, offline đọc, liên kết Google, QA thủ công, chính sách riêng tư, sửa lỗi | **M5:** checklist MVP (`09` mục 5) đạt; bắt đầu thử nghiệm kín |
| 9–12 | Thử nghiệm kín | 10–20 nhóm dùng thật, thu phản hồi, sửa lỗi nóng | **M6:** đạt tiêu chí kết thúc thử nghiệm (mục 3.5) |
| 13 | Ra mắt mềm | Công bố ở cộng đồng nhỏ, theo dõi sát tải và lỗi | **M7:** không có sự cố nghiêm trọng trong 7 ngày |
| 14+ | Tăng trưởng | Nội dung, cải tiến theo dữ liệu | Theo KPI ở `01` mục 6 |

**Quy tắc cắt giảm phạm vi** khi chậm tiến độ (theo thứ tự cắt đầu tiên): FR-28 (đề nghị chỉnh phần chia), FR-17 (kéo thả, dùng nút lên/xuống), FR-08 (liên kết Google), NFR-11 (ghi offline), FR-25/FR-26. **Không cắt:** chia tiền đúng, RLS, VietQR, vào bằng link.

---

## 2. Rủi ro triển khai và kế hoạch

Rủi ro sản phẩm/kinh doanh nằm ở `01` mục 8 (RK-xx). Dưới đây là rủi ro về kế hoạch và triển khai (RM-xx).

| ID | Rủi ro | Xác suất | Tác động | Cách giảm thiểu |
|----|--------|----------|----------|-----------------|
| RM-01 | Quá tải vì làm một mình, trễ tiến độ | Cao | Cao | Quy tắc cắt phạm vi (mục 1); đệm 20%; làm lát cắt mỏng trước |
| RM-02 | QR không quét được ở một số ngân hàng | Trung bình | Cao | Thử từ P2, không đợi cuối; luôn kèm số tài khoản dạng văn bản; có cách dự phòng dùng dịch vụ tạo ảnh bên thứ ba |
| RM-03 | Lỗi làm tròn gây sai tiền | Thấp (nếu test tốt) | Rất cao | TC/PT bắt buộc; đối chiếu SQL và client; kiểm toán số dư trước khi cho thử nghiệm kín |
| RM-04 | Realtime vượt giới hạn gói free khi lan truyền | Trung bình | Trung bình | Chỉ subscribe khi đang mở trang chuyến; theo dõi 150/200 kết nối; kế hoạch nâng gói |
| RM-05 | Supabase tạm dừng hoặc mất dữ liệu | Trung bình | Cao | Cron giữ hoạt động; backup hằng tuần; đã thử khôi phục |
| RM-06 | Vi phạm điều khoản hosting khi có thu nhập | Trung bình | Trung bình | Chuyển host trước khi bật nguồn thu (D-01, D-20) |
| RM-07 | iOS Safari có hành vi khác (PWA, lưu trữ, bàn phím) | Cao | Trung bình | Test iPhone thật sớm (từ P1); hạn chế phụ thuộc tính năng PWA nâng cao |
| RM-08 | Thử nghiệm kín không tuyển được đủ nhóm | Trung bình | Trung bình | Bắt đầu tuyển từ tuần 6; nhắm 20 nhóm để ít nhất 10 nhóm dùng thật |
| RM-09 | Người dùng không quay lại sau chuyến đầu | Trung bình | Cao | Thông điệp "chuyến sau" khi quyết toán xong; theo dõi KPI-07 |
| RM-10 | Vấn đề pháp lý dữ liệu cá nhân | Thấp–Trung bình | Trung bình | Thu thập tối thiểu; chính sách tiếng Việt; tham khảo ý kiến chuyên môn trước ra mắt công khai |

---

## 3. Kế hoạch thử nghiệm kín (10–20 nhóm)

### 3.1 Mục tiêu

Chứng minh vòng giá trị hoạt động ngoài tay người làm ra nó: nhóm thật, chuyến thật, quyết toán thật. Tìm lỗi sai tiền, điểm bối rối khi vào bằng link và QR không quét được.

### 3.2 Cách tuyển

| Nguồn | Số nhóm mục tiêu | Cách làm |
|-------|-------------------|----------|
| Mạng lưới cá nhân (bạn bè, đồng nghiệp, người thân sắp đi chơi) | 6–8 | Hỏi trực tiếp ai sắp có chuyến trong 4–6 tuần tới |
| Bạn của bạn bè | 4–6 | Nhờ giới thiệu nhóm có người hay tổ chức |
| Cộng đồng du lịch/phượt trực tuyến | 4–6 | Đăng bài xin tester, **tuân thủ quy định của từng nhóm**, không spam |
| Đồng nghiệp/CLB (team building) | 2–3 | Thử nhóm đồng nghiệp để kiểm chứng nhóm phụ |

Tiêu chí chọn nhóm: sắp có chuyến thật trong khung thử nghiệm; từ 3 người trở lên; ưu tiên nhóm có người ngại việc chia tiền (đúng persona). Tặng huy hiệu "Nhóm sáng lập" trong app (chỉ mang tính tượng trưng, không tốn chi phí).

### 3.3 Cách thu phản hồi

| Kênh | Mục đích |
|------|----------|
| Nút "Góp ý" trong app (biểu mẫu ngắn có chụp màn hình) | Lỗi và ý kiến tức thời |
| Cuộc gọi 15 phút với người tổ chức sau chuyến | Hiểu trải nghiệm trọn vẹn, nhất là quyết toán |
| Khảo sát ngắn gửi mọi thành viên sau khi quyết toán | Đo mức hài lòng của cả nhóm, không chỉ organizer |
| Theo dõi hành vi tối giản (không cá nhân hóa) | Biết bước nào bị bỏ ngang |
| Nhóm chat riêng cho tester | Hỗ trợ nhanh |

### 3.4 Câu hỏi khảo sát (sau quyết toán)

1. Bạn đã mở link mời như thế nào, mất bao lâu để vào được? Có chỗ nào bạn lưỡng lự không?
2. Trước khi dùng Tripmate, nhóm bạn dùng gì để chia tiền? So với đó, lần này dễ hơn hay khó hơn? (thang 1–5, kèm lý do)
3. Bạn có tin các con số trong màn hình quyết toán không? Có khoản nào làm bạn thấy sai hoặc khó hiểu?
4. Việc quét QR chuyển khoản như thế nào? Bạn dùng ngân hàng nào, có quét được không?
5. Bạn có phải nhắc ai đó trả tiền không? App có giúp việc đó bớt khó chịu không?
6. Tính năng nào bạn dùng nhiều nhất? Tính năng nào bạn bỏ qua?
7. Điều gì khiến bạn muốn bỏ app giữa chừng?
8. Nếu app biến mất ngày mai, bạn thấy tiếc mức nào? (rất tiếc / tiếc / không sao)
9. Bạn sẽ dùng cho chuyến sau và giới thiệu cho bạn bè chứ?
10. Một điều bạn muốn app làm tốt hơn?

### 3.5 Tiêu chí kết thúc thử nghiệm (đề xuất, điều chỉnh sau)

| Tiêu chí | Ngưỡng |
|----------|--------|
| Số nhóm dùng thật (có ít nhất 5 khoản chi) | Ít nhất 10 |
| Nhóm hoàn tất quyết toán | Ít nhất 6 trên 10 |
| Lỗi sai tiền / mất dữ liệu | 0 |
| Người được mời vào nhóm thành công | Ít nhất 70% |
| Trả lời "rất tiếc nếu app biến mất" (câu 8) | Ít nhất 40% |

---

## 4. Ra mắt và tăng trưởng không tốn tiền

### 4.1 Cơ chế lan truyền sẵn có

| Cơ chế | Mô tả |
|--------|-------|
| **Link mời** | Mỗi người được mời thấy trang giới thiệu ngắn và nút "Tạo chuyến của bạn" sau khi vào nhóm |
| **Tổng kết chuyến** | Màn hình hoàn tất quyết toán có lời mời chia sẻ app cho nhóm khác (không ép) |
| **QR thanh toán** | Người chuyển tiền lần đầu thấy thương hiệu Tripmate trên màn hình |
| **Người tổ chức quay lại** | Mỗi organizer hài lòng tạo thêm chuyến (KPI-07) |

### 4.2 Kênh tăng trưởng

| Kênh | Cách làm | Lưu ý |
|------|----------|-------|
| Nhóm Facebook du lịch/phượt | Bài chia sẻ kinh nghiệm "chia tiền 8 người sau chuyến đi" kèm bản dùng thử, **xin phép admin** | Không spam; ưu tiên nội dung có giá trị |
| Reddit (cộng đồng du lịch Việt Nam) | Bài chia sẻ chân thực, kể quá trình làm | Đọc quy định từng cộng đồng |
| TikTok/Reels ngắn | Video 15–30 giây: "Quyết toán 6 người trong 10 giây", demo quét QR | Nội dung hài hước, tình huống có thật |
| Zalo/Messenger | Gửi link vào nhóm chat; tạo ảnh bản xem trước (Open Graph) đẹp cho link mời | Quan trọng: ảnh xem trước giúp tăng tỷ lệ bấm |
| Truyền miệng từ thử nghiệm kín | Nhờ tester giới thiệu | |
| SEO trang giới thiệu | Bài viết "Cách chia tiền đi du lịch nhóm", "Mẫu bảng chia tiền" | Dài hạn |

### 4.3 Kế hoạch ra mắt

1. Tuần 13: ra mắt mềm trong các nhóm đã xin phép; theo dõi Sentry và KPI hằng ngày.
2. Giữ ngưỡng cảnh báo hạ tầng (80% DB/MAU/realtime).
3. Chỉ mở rộng quảng bá sau khi 7 ngày không có sự cố nghiêm trọng (M7).
4. Công bố cam kết "miễn phí, không giới hạn số khoản chi" (xem `01` mục 7.3).

---

## 5. Đo lường (analytics tối giản, ưu tiên riêng tư)

| Nguyên tắc | Chi tiết |
|-----------|----------|
| Không cookie theo dõi, không bán/chia sẻ dữ liệu | Công bố trong chính sách riêng tư |
| Không ghi nội dung nhạy cảm (số tài khoản, tên, số tiền chi tiết) vào analytics | Chỉ ghi tên sự kiện và số đếm |
| Ưu tiên lấy KPI **từ chính cơ sở dữ liệu** | KPI-01, 02, 05, 06 lấy bằng truy vấn tổng hợp, không cần theo dõi người dùng |
| Phân tích trang cho trang giới thiệu | Công cụ không cookie (ví dụ Cloudflare Web Analytics hoặc Umami tự host); cần kiểm tra điều khoản gói miễn phí hiện hành |
| Sự kiện sản phẩm tối thiểu | `trip_created`, `invite_opened`, `member_joined`, `expense_added`, `settlement_viewed`, `qr_opened`, `payment_confirmed` (không kèm định danh cá nhân) |
| Kích thước dữ liệu | Nếu lưu sự kiện trong Supabase, giới hạn lưu 90 ngày để không ăn vào hạn mức 500 MB |

| KPI (`01`) | Nguồn dữ liệu |
|-----------|---------------|
| KPI-01, 02, 05, 06 | Truy vấn tổng hợp trên DB |
| KPI-03, 04 | Sự kiện `invite_opened` so với `member_joined`, thời gian giữa hai sự kiện |
| KPI-07 | Số organizer có từ 2 chuyến (tính từ DB) |
| KPI-08 | Sentry |

---

## 6. Sau MVP

| Hạng mục | Mô tả | Điều kiện bắt đầu |
|----------|-------|-------------------|
| Gợi ý bằng AI | Gợi ý lịch trình/ý tưởng từ điểm đến và ngân sách | Có ít nhất 200 chuyến; tab Lịch trình được dùng đều; đã có cách xử lý chi phí gọi mô hình mà không phá cam kết miễn phí |
| OCR hóa đơn | Chụp hóa đơn, tự điền khoản chi | Thấy nhiều khoản chi nhập tay chậm/sai trong phản hồi; đã giải quyết lưu ảnh (Storage free chỉ 1 GB) |
| Đa tiền tệ | Chuyến đi nước ngoài, quy đổi tỷ giá | Ít nhất 10% nhóm yêu cầu; có nguồn tỷ giá đáng tin cậy |
| Affiliate | Gợi ý khách sạn/vé có gắn nhãn | Từ khoảng 500 chuyến/tháng; **đã chuyển host cho phép thương mại**; tuân thủ nguyên tắc ở `01` mục 7.3 |
| Push notification | Nhắc nợ, thông báo vote | Có người dùng thực sự cài PWA; xử lý hạn chế trên iOS |
| Hợp nhất tài khoản (`merge_user`) | Đăng nhập Google trên máy mới | Có người dùng thật gặp tình huống này (D-25) |
| Quỹ chung / chia theo hộ | Nhu cầu của nhóm gia đình, đồng nghiệp | Xác nhận qua phản hồi |
| Chế độ tối, ảnh bìa, xuất PDF | Cải thiện trải nghiệm | Theo phản hồi |

---

## Câu hỏi mở

1. Thời gian làm việc thực tế mỗi tuần của bạn là bao nhiêu? Lộ trình 10 tuần phụ thuộc mạnh vào con số này.
2. Có chuyến đi thật nào của chính bạn trong 4–8 tuần tới có thể dùng làm bài thử nội bộ đầu tiên (M1, M2)?
3. Bạn sẵn sàng đăng bài ở nhóm/cộng đồng nào, và đã xin phép admin chưa?
4. Công cụ analytics không cookie nào được dùng, phụ thuộc quyết định hosting (D-01)?
5. Có cần đăng ký tên miền và email hỗ trợ riêng trước ra mắt? Ngân sách nhỏ dành cho việc này là bao nhiêu?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-41 | Thời lượng MVP | 10 tuần dev, thử nghiệm kín từ tuần 9 |
| D-42 | Thứ tự cắt phạm vi khi trễ | Theo mục 1 |
| D-43 | Tiêu chí kết thúc thử nghiệm kín | Theo mục 3.5 |
| D-44 | Cách làm analytics | KPI chủ yếu từ DB; sự kiện tối giản không định danh; công cụ trang không cookie |
| D-45 | Thời điểm ra mắt mềm | Tuần 13, sau M6 |
