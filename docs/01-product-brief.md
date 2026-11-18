# Tripmate — Product Brief

- **Mục đích:** Xác định vấn đề, đối tượng, giá trị cốt lõi, thị trường và hướng đi của Tripmate trước khi viết bất kỳ dòng code nào.
- **Phiên bản:** 0.1 (bản nháp để duyệt)
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Tripmate là web app (PWA) miễn phí, ưu tiên điện thoại, giúp một nhóm bạn lên kế hoạch chuyến đi cùng nhau: bình chọn điểm đến và ngày đi, dựng lịch trình theo ngày, ước tính ngân sách, ghi chi tiêu thật và quyết toán với số giao dịch chuyển khoản ít nhất, kèm mã VietQR. Thành viên vào nhóm chỉ bằng link và một cái tên hiển thị, không cần cài app hay đăng ký.

Khoảng trống cần nhắm: các app chia tiền quốc tế (Splitwise, Tricount) giải bài toán tiền nhưng không lên kế hoạch chuyến đi; các app lập kế hoạch (Wanderlog, TripIt) giải bài toán lịch trình nhưng yếu hoặc không có chia tiền; và không công cụ nào xây quanh VietQR và thói quen nhóm bạn Việt Nam (Zalo/Messenger).

> **Lưu ý về nguồn dữ liệu:** Giá và giới hạn của đối thủ dưới đây tổng hợp từ các bài so sánh/đánh giá năm 2026 (nguồn thứ cấp, một số do đối thủ cạnh tranh viết). Splitwise không công bố rõ giới hạn gói free nên các nguồn lệch nhau. Mọi con số cần kiểm tra lại trên trang chính thức trước khi dùng ra ngoài tài liệu nội bộ.

---

## 1. Vấn đề và nỗi đau của người dùng

| ID | Nỗi đau | Tình huống thật |
|----|---------|-----------------|
| PP-01 | Thông tin bị trôi trong group chat | Nhóm 8 người rủ nhau đi Đà Lạt. Sau 3 ngày có 400 tin nhắn, ba địa điểm được đề xuất nhưng không ai nhớ ai đã đồng ý cái nào. Người tổ chức phải tự "kéo lại" từng ý. |
| PP-02 | Chốt ngày đi rất khó | Có 4 ngày cuối tuần khả dĩ, mỗi người bận một kiểu. Người tổ chức nhắn riêng từng người rồi tự ghi vào giấy. Cuối cùng 2 người nói "sao cũng được" rồi lại không đi được. |
| PP-03 | Người ứng tiền phải nhớ hết | Minh Anh đặt homestay 4.800.000₫ và thuê xe 3.200.000₫ bằng thẻ của mình. Sau chuyến cô phải lội lại lịch sử chat và ảnh hóa đơn để tính ai nợ bao nhiêu. |
| PP-04 | Chia tiền không đều và dễ sai | Bữa hải sản 1.350.000₫ có người dị ứng không ăn, 2 người ở lại thêm đêm thứ ba. Chia đều thì không công bằng, chia riêng thì máy tính bấm lệch vài nghìn và cãi nhau. |
| PP-05 | Ngại nhắc nợ | Một bạn còn nợ 85.000₫ sau 2 tuần. Nhắn đòi thì ngại, bỏ qua thì người ứng tiền thấy bất công. Con số nhỏ nhưng làm căng quan hệ. |
| PP-06 | Chuyển khoản chéo nhau, tốn công | Nhóm 6 người cuối chuyến chuyển qua lại 9–10 lần, trong khi thực tế chỉ cần 4–5 lần. Nhập tay số tài khoản và nội dung dễ sai. |
| PP-07 | Excel / Google Sheets khó dùng trên điện thoại | Ai cũng sửa được nên có người vô tình xóa công thức. Nhập một dòng chi tiêu trên điện thoại mất cả phút giữa lúc đang đứng ở quán. |
| PP-08 | App chia tiền đòi đăng ký, giới hạn | Bạn bè lười cài app. Splitwise bản free bị giới hạn số khoản chi mỗi ngày và có quảng cáo, đúng lúc nhóm đang ghi nhiều chi tiêu nhất trong chuyến. |

---

## 2. Đối tượng người dùng

| Nhóm | Mô tả | Vai trò | Ưu tiên |
|------|-------|---------|---------|
| **Chính — Nhóm bạn 20–35 tuổi** | Đi chơi cuối tuần, 3–10 người, thường 2–4 chuyến mỗi năm. Dùng Zalo/Messenger/TikTok hằng ngày, chuyển khoản qua app ngân hàng quen thuộc. | Người tổ chức (1 người), thành viên (còn lại) | P0 |
| **Phụ — Đồng nghiệp** | Team building, du lịch công ty nhỏ. Chi tiêu nhiều, cần minh bạch. | Người tổ chức thường là HR hoặc trưởng nhóm | P1 |
| **Phụ — Gia đình** | Đi chung nhiều gia đình (ông bà, cô dì, họ hàng), nhiều độ tuổi. Chi tiêu chia theo hộ. | Người tổ chức là người trẻ trong nhà | P2 |

MVP tối ưu cho nhóm bạn. Gia đình cần chia theo "phần" (shares) để xử lý hộ có nhiều người, đã nằm trong phạm vi.

---

## 3. Giá trị cốt lõi (1 câu)

> **Cả nhóm cùng chốt chuyến đi và chia tiền công bằng chỉ bằng một đường link, không cần cài app, không cần đăng ký, không tốn đồng nào.**

---

## 4. Phân tích đối thủ

### 4.1 Bảng so sánh

| Tiêu chí | Splitwise | Tricount | Wanderlog | TripIt | Messenger/Zalo + Excel | **Tripmate (mục tiêu)** |
|----------|-----------|----------|-----------|--------|------------------------|-------------------------|
| Trọng tâm | Chia tiền | Chia tiền | Lập lịch trình trên bản đồ | Gom đặt chỗ thành 1 lịch trình | Trò chuyện + bảng tính | Lập kế hoạch + chia tiền |
| Bình chọn điểm đến/ngày | Không | Không | Hạn chế | Không | Làm thủ công bằng poll chat | **Có (vote + poll ngày)** |
| Lịch trình theo ngày | Không | Không | **Rất mạnh** | Mạnh (nhập từ email) | Thủ công | Có (đơn giản) |
| Ghi chi tiêu, chia tiền | **Mạnh** | **Mạnh** | Ngân sách thủ công, hạn chế bản free | Không có theo dõi chi tiêu | Thủ công | Có |
| Tối giản nợ | Có | Có | Không | Không | Không | Có |
| Mã thanh toán VietQR | Không | Không | Không | Không | Không | **Có** |
| Vào nhóm không cần tài khoản | Cần tài khoản | Có thể tham gia khá nhẹ | Cần tài khoản để sửa | Cần tài khoản | Có | **Có (ẩn danh bằng link)** |
| Gói miễn phí | Có, nhưng giới hạn khoảng 3–5 khoản/ngày, quảng cáo (nguồn không thống nhất) | Theo các bài 2026: miễn phí, đã bỏ gói trả phí | Có, rộng rãi cho lập kế hoạch và cộng tác | Có, cơ bản | Miễn phí | **Miễn phí** |
| Gói trả phí | Pro khoảng 39,99–49,99 USD/năm | Không còn (theo nguồn trên) | Pro khoảng 39,99 USD/năm: offline, tối ưu tuyến, xuất PDF, AI không giới hạn | Pro 49 USD/năm: cảnh báo chuyến bay, theo dõi ghế | Không | Không (xem mục 7) |
| Tiếng Việt, VND | Hạn chế | Hạn chế | Hạn chế | Không | Có | **Có, thiết kế riêng** |

### 4.2 Điểm mạnh và yếu

| Đối thủ | Điểm mạnh | Điểm yếu |
|---------|-----------|----------|
| **Splitwise** | Thương hiệu lớn, đủ kiểu chia, tối giản nợ, nhóm không giới hạn | Gói free bị siết (giới hạn số khoản/ngày, quảng cáo, quét hóa đơn thuộc Pro); không có lập kế hoạch; không có VietQR; bắt tạo tài khoản |
| **Tricount** | Miễn phí, đơn giản, phù hợp chuyến đi | Không lập kế hoạch; không có VietQR; giao diện và ngân hàng thanh toán hướng châu Âu |
| **Wanderlog** | Trình lập lịch trình theo bản đồ tốt nhất, cộng tác thời gian thực, gói free rộng | Chia tiền gần như không có; tính năng quan trọng khi đi (offline, tối ưu tuyến) nằm ở gói trả phí; người dùng phàn nàn thấy rối, onboarding dài |
| **TripIt** | Tự gom email đặt chỗ thành lịch trình, rất hợp người bay nhiều | Không có theo dõi chi tiêu; không hướng tới quyết định nhóm; giá trị chính ở gói 49 USD/năm cho khách công tác |
| **Messenger/Zalo + Excel** | Có sẵn, ai cũng biết | Thông tin trôi, Excel dễ hỏng, không tính nợ tối giản, nhập liệu trên điện thoại chậm |

Khác trong phạm vi Việt Nam: một số ngân hàng (ví dụ MyVIB, Techcombank Mobile) có tính năng "quỹ nhóm" để góp và chia tiền trong app ngân hàng, và có vài app nhỏ trên App Store (ví dụ Bill Share, GroupBill). Các giải pháp này gắn với một ngân hàng hoặc chỉ làm chia bill, không làm bình chọn và lịch trình. (Cần khảo sát sâu hơn, xem Câu hỏi mở.)

### 4.3 Khoảng trống thị trường

1. **Không ai nối "quyết định chung" với "tiền".** Người dùng phải dùng 2–3 công cụ cho một chuyến đi.
2. **Rào cản tham gia.** Bạn bè lười đăng ký/cài app là lý do chính khiến nhóm bỏ app chia tiền.
3. **Thanh toán cục bộ.** VietQR đã là chuẩn chuyển khoản liên ngân hàng và đang được dùng cực rộng (các số liệu báo chí cuối 2025 nói khoảng 15 triệu giao dịch VietQR mỗi ngày), nhưng các app chia tiền quốc tế không tận dụng được.
4. **Gói miễn phí ngày càng bị siết** ở các app lớn, tạo cơ hội cho một sản phẩm cam kết miễn phí thật sự.

---

## 5. Điểm khác biệt của Tripmate

| ID | Điểm khác biệt | Vì sao khó sao chép nhanh |
|----|----------------|---------------------------|
| DF-01 | **Vào nhóm bằng link + tên hiển thị**, không cài app, không đăng ký | Đối thủ lớn dựa vào tài khoản để làm kinh doanh |
| DF-02 | **Một nơi cho cả hành trình**: vote → lịch trình → chi tiêu → quyết toán | Phải giữ sản phẩm nhỏ gọn, không chạy theo tính năng của từng mảng |
| DF-03 | **Quyết toán ra đúng số lần chuyển khoản ít nhất, kèm VietQR** đã điền sẵn số tiền và nội dung | Cần hiểu chuẩn VietQR và thói quen ngân hàng Việt |
| DF-04 | **Thành viên ảo**: nhập người chưa vào app, về sau nhận lại khi họ tham gia | Là thiết kế dữ liệu, không phải tính năng bề mặt |
| DF-05 | **Giao diện tiếng Việt, VND nguyên (không số thập phân), giọng văn thân thiện** | Địa phương hóa thật, không phải bản dịch |

---

## 6. Mục tiêu và KPI (3 tháng đầu sau ra mắt)

Các ngưỡng dưới đây là **giả định khởi điểm** cho một dự án solo dev, cần điều chỉnh sau thử nghiệm kín.

| ID | KPI | Mục tiêu tháng 1 | Mục tiêu tháng 3 | Cách đo |
|----|-----|------------------|------------------|---------|
| KPI-01 | Số chuyến đi được tạo (tích lũy) | 40 | 200 | Đếm bản ghi `trips` |
| KPI-02 | Tỷ lệ chuyến có từ 3 thành viên trở lên | 50% | 60% | `trip_members` đã vào (không tính thành viên ảo) |
| KPI-03 | Tỷ lệ người được mời bấm link và vào nhóm | 55% | 65% | Lượt mở link mời so với lượt join thành công |
| KPI-04 | Thời gian từ mở link đến vào nhóm | dưới 30 giây | dưới 20 giây (trung vị) | Sự kiện client |
| KPI-05 | Số chuyến có ít nhất 5 khoản chi | 20 | 100 | `expenses` |
| KPI-06 | Số chuyến hoàn tất quyết toán (mọi khoản chuyển đã đánh dấu đã trả) | 8 | 50 | `settlements` |
| KPI-07 | Tỷ lệ organizer quay lại tạo chuyến thứ hai | — | 25% | Theo định danh organizer |
| KPI-08 | Lỗi nghiêm trọng (Sentry) trên mỗi 1.000 phiên | dưới 5 | dưới 2 | Sentry |

Chỉ số "ngôi sao dẫn đường" (North Star): **số chuyến hoàn tất quyết toán**, vì nó chứng minh app đi hết vòng giá trị.

---

## 7. Mô hình bền vững khi app miễn phí

### 7.1 Chi phí vận hành dự kiến

Chạy trên gói free của Supabase và hosting. Chi phí tiền mặt gần bằng 0 ở giai đoạn đầu, chủ yếu là tên miền (khoảng vài trăm nghìn đồng mỗi năm).

### 7.2 Các nguồn thu tiềm năng

| Nguồn thu | Cách làm | Mức độ phù hợp | Điều kiện bắt đầu |
|-----------|----------|----------------|-------------------|
| **Donate (tự nguyện)** | Mã VietQR "mời cà phê" ở màn hình tổng kết, không bắt buộc | Cao, ít xung đột trải nghiệm | Có người dùng thật |
| **Affiliate** | Gợi ý khách sạn/xe/vé (ví dụ qua nền tảng đặt phòng có chương trình liên kết) ở tab Ý tưởng, gắn nhãn rõ "liên kết giới thiệu" | Trung bình, cần lưu lượng | Từ 500 chuyến/tháng |
| **Đối tác địa phương** | Homestay, tour nhỏ trả phí để xuất hiện trong gợi ý | Trung bình | Có dữ liệu điểm đến |
| **Quảng cáo nhẹ** | Một banner tĩnh ở trang chủ, không bao giờ ở màn chi tiêu/quyết toán | Thấp, ưu tiên cuối | Cân nhắc kỹ |

### 7.3 Nguyên tắc không làm hỏng trải nghiệm

1. **Không chặn tính năng cốt lõi bằng tiền.** Vote, lịch trình, ghi chi tiêu, quyết toán, VietQR luôn miễn phí và không giới hạn số khoản/ngày.
2. **Không quảng cáo ở màn hình tiền và quyết toán.**
3. **Không bán dữ liệu cá nhân**, đặc biệt thông tin ngân hàng.
4. **Gợi ý thương mại phải gắn nhãn rõ và không đẩy lên trên nội dung của nhóm.**
5. **Không thu thập thêm dữ liệu chỉ để phục vụ thương mại.**

### 7.4 Ràng buộc quan trọng về hosting (phát hiện khi nghiên cứu)

Gói **Vercel Hobby chỉ dành cho dự án cá nhân, phi thương mại**; mọi hoạt động có doanh thu (kể cả quảng cáo, affiliate) cần gói Pro 20 USD/người/tháng. Điều này có nghĩa:

- MVP chưa có doanh thu vẫn nằm trong phạm vi Hobby.
- **Trước khi bật bất kỳ nguồn thu nào** (kể cả donate nếu bị coi là doanh thu) phải chuyển sang host cho phép thương mại (Cloudflare Pages/Netlify) hoặc nâng lên Vercel Pro. Chi tiết ở `06-architecture.md` và mục "Quyết định cần chốt" bên dưới.

---

## 8. Rủi ro và cách giảm thiểu

| ID | Rủi ro | Xác suất | Tác động | Cách giảm thiểu |
|----|--------|----------|----------|-----------------|
| RK-01 | Người dùng ẩn danh mất phiên (xóa cookie, đổi máy) và mất quyền vào nhóm | Cao | Cao | Gợi ý nâng cấp lên Google sau khoản chi đầu tiên; link khôi phục cá nhân; chọn lại "Tôi là…" |
| RK-02 | Supabase free: dự án bị **tạm dừng sau 7 ngày không hoạt động**; không có backup tự động | Trung bình | Cao | Cron ping định kỳ (GitHub Actions); `pg_dump` hằng tuần lưu ngoài; theo dõi dung lượng, nâng gói khi tới khoảng 400 MB |
| RK-03 | Vi phạm điều khoản Vercel Hobby khi bắt đầu thu tiền | Trung bình | Trung bình | Quyết định host dài hạn sớm (mục 7.4) |
| RK-04 | Lạm dụng link mời (spam, đoán mã, bot tạo tài khoản ẩn danh) | Trung bình | Trung bình | Mã mời dài ngẫu nhiên, giới hạn tốc độ, CAPTCHA, chủ nhóm đổi mã mời |
| RK-05 | Lộ thông tin ngân hàng | Thấp | Rất cao | Chỉ người nợ mới thấy số tài khoản người nhận qua RPC; RLS chặt; không log |
| RK-06 | Sai số tiền khi chia (làm tròn) gây mất niềm tin | Trung bình | Cao | Quy tắc làm tròn rõ ràng + bộ test (xem `08`) |
| RK-07 | Mã VietQR không quét được ở một số ngân hàng | Trung bình | Trung bình | Test trên nhiều app ngân hàng; luôn kèm số tài khoản dạng văn bản để sao chép |
| RK-08 | Solo dev quá tải, scope phình | Cao | Cao | Lát cắt dọc mỏng nhất trước; hoãn kéo thả, OCR, đa tiền tệ |
| RK-09 | Luật bảo vệ dữ liệu cá nhân (số tài khoản, tên) | Trung bình | Trung bình | Thu thập tối thiểu, chính sách riêng tư tiếng Việt, tính năng xóa dữ liệu |
| RK-10 | Người dùng thấy app giống app chia tiền thông thường, không có lý do chuyển | Trung bình | Cao | Nhấn mạnh DF-01 và DF-03 trong thông điệp; thử nghiệm kín để kiểm chứng |

---

## 9. Nguồn tham khảo (tra cứu 11/2026)

- Giá và giới hạn Splitwise: các bài tổng hợp/so sánh năm 2026 (getfinny.app, localsinsider.com, split-circle, splitty).
- Wanderlog: các bài đánh giá 2026 (endlesstravelplans.com, monkeytravel.app, stippl.io, pilotplans.com).
- TripIt: tripit.com/web/pro/pricing (qua xpay.sh), các bài so sánh 2026.
- Chuẩn VietQR: bài viết kỹ thuật trên Viblo, tin của VTV/Tuổi Trẻ/VnEconomy về NAPAS.
- Giới hạn Supabase: cloudzero.com, jetadmin.io, makerkit.dev (kiểm tra lại tại supabase.com/pricing).
- Giới hạn Vercel: vercel.com/docs/limits/fair-use-guidelines và các bài tổng hợp 2026.

---

## Câu hỏi mở

1. Tricount thực sự đã bỏ gói trả phí và không giới hạn? Nguồn có thể lệch, cần kiểm tra trực tiếp trên app/trang chính thức.
2. Có app chia tiền/lập chuyến nào đang có lượng người dùng đáng kể ở Việt Nam mà chưa tìm thấy không (ví dụ app trong nước, mini-app trên Zalo, ví MoMo/ZaloPay)?
3. Nhóm mục tiêu chính có thực sự ưu tiên "bình chọn + lịch trình" hay chỉ cần chia tiền? Cần xác nhận qua phỏng vấn 10 người.
4. Tên "Tripmate" đã có ai đăng ký thương hiệu/tên miền chưa?
5. Nhóm đồng nghiệp và gia đình có cần tính năng riêng (xuất báo cáo, chia theo hộ) ngay MVP không?
6. Donate qua VietQR cá nhân có phát sinh nghĩa vụ thuế hoặc bị coi là doanh thu theo điều khoản hosting không?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-01 | Hosting dài hạn: Vercel Hobby (tạm) rồi chuyển, hay chọn host cho phép thương mại ngay từ đầu (Cloudflare Pages/Netlify)? | Bắt đầu trên host cho phép thương mại nếu chi phí migrate thấp; nếu không, ghi rõ mốc chuyển trước khi bật thu tiền |
| D-02 | KPI tháng 1 và tháng 3 ở mục 6 có chấp nhận làm mục tiêu không? | Chấp nhận làm giả định, điều chỉnh sau thử nghiệm kín |
| D-03 | Thứ tự ưu tiên nguồn thu | Donate, rồi affiliate, rồi đối tác; quảng cáo để cuối |
| D-04 | Nhóm chính của MVP | Nhóm bạn 20–35 tuổi |
