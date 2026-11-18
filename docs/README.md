# Tripmate — Bộ tài liệu dự án

- **Mục đích:** Mục lục, thứ tự đọc, tổng hợp "Câu hỏi mở" và kết quả rà soát chéo của toàn bộ tài liệu Tripmate.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Bộ tài liệu gồm 10 tài liệu chính, một bảng thuật ngữ và README này. Chúng được viết **trước khi có code** và là bản nháp đầu tiên (v0.1) để bạn đọc, chỉnh và trả lời các câu hỏi mở. Trong lúc rà soát chéo đã phát hiện **7 điểm mâu thuẫn hoặc thiếu sót thật** giữa các tài liệu (mục 3), trong đó **3 điểm cần sửa trước khi viết code** (R-01, R-03, R-04).

Số liệu thị trường và hạ tầng (giá Splitwise/Wanderlog/TripIt, giới hạn Supabase/Vercel) được tra cứu ngày 18/11/2026 từ các nguồn thứ cấp và **cần kiểm chứng lại** trên trang chính thức trước khi ra quyết định.

---

## 1. Mục lục và thứ tự đọc

| # | Tài liệu | Nội dung | Đọc khi |
|---|----------|----------|---------|
| 1 | [01-product-brief.md](01-product-brief.md) | Vấn đề, đối thủ, giá trị, KPI, mô hình bền vững, rủi ro | Bắt đầu |
| 2 | [02-personas-and-journeys.md](02-personas-and-journeys.md) | 3 persona, hành trình, khoảnh khắc quyết định | Sau 1 |
| 3 | [03-prd.md](03-prd.md) | Yêu cầu FR/NFR, quy tắc nghiệp vụ, trường hợp biên, ma trận truy vết | Sau 2 |
| 4 | [04-user-stories-and-backlog.md](04-user-stories-and-backlog.md) | User story, epic, phase, lát cắt mỏng nhất | Sau 3 |
| 5 | [05-ux-and-screens.md](05-ux-and-screens.md) | Nguyên tắc UX, sitemap, màn hình, wireframe, design tokens, nội dung | Sau 3 |
| 6 | [06-architecture.md](06-architecture.md) | Kiến trúc, xác thực, realtime, PWA, bảo mật, giới hạn free, CI/CD | Trước khi code |
| 7 | [07-database.md](07-database.md) | ERD, bảng, RLS, RPC, migration | Trước khi code |
| 8 | [08-settlement-algorithm.md](08-settlement-algorithm.md) | Chia tiền, làm tròn, tối giản nợ, 18 test case, VietQR | Trước khi code |
| 9 | [09-test-plan.md](09-test-plan.md) | Chiến lược test, test case, QA thủ công, tiêu chí ra mắt | Song song với code |
| 10 | [10-roadmap-and-launch.md](10-roadmap-and-launch.md) | Lộ trình tuần, rủi ro, thử nghiệm kín, ra mắt, sau MVP | Trước khi bắt đầu tuần 1 |
| — | [glossary.md](glossary.md) | Bảng thuật ngữ dùng nhất quán | Tra cứu |

Sau tài liệu 7 và 8 bạn đã đủ ngữ cảnh để chuyển sang prompt viết code (`PROMPT.md`) và đưa các tài liệu này làm ngữ cảnh cho AI viết code.

**Quy ước:** ID `FR-xx` và `NFR-xx` (PRD), `US-xx` (user story), `S-xx` (màn hình), `TC-xx`/`PT-xx` (test thuật toán), `T-xx` (test kế hoạch), `EC-xx` (trường hợp biên), `BR-xx` (quy tắc nghiệp vụ), `D-xx` (quyết định), `RK-xx`/`RM-xx` (rủi ro).

---

## 2. Câu hỏi mở gộp từ tất cả các bước

Nhóm theo chủ đề. Cột "Nguồn" là tài liệu và số thứ tự câu hỏi trong tài liệu đó. Ưu tiên: **A** = cần trả lời trước khi code, **B** = trước khi ra mắt, **C** = có thể để sau.

### 2.1 Thị trường và sản phẩm

| # | Câu hỏi | Nguồn | Ưu tiên |
|---|---------|-------|:-------:|
| Q-01 | Tricount thực sự đã bỏ gói trả phí và không giới hạn? Cần kiểm tra trực tiếp | 01-1 | B |
| Q-02 | Có app chia tiền/lập chuyến nào đáng kể ở Việt Nam chưa tìm thấy (kể cả mini-app Zalo, ví MoMo/ZaloPay)? | 01-2 | A |
| Q-03 | Nhóm mục tiêu có thực sự cần "bình chọn + lịch trình" hay chỉ cần chia tiền? Cần phỏng vấn khoảng 10 người | 01-3 | A |
| Q-04 | Tên "Tripmate" đã có ai đăng ký thương hiệu/tên miền? | 01-4 | A |
| Q-05 | Nhóm đồng nghiệp và gia đình có cần tính năng riêng ngay MVP? | 01-5 | C |
| Q-06 | Donate qua VietQR cá nhân có phát sinh nghĩa vụ thuế hoặc bị coi là doanh thu theo điều khoản hosting? | 01-6 | B |

### 2.2 Trải nghiệm và yêu cầu

| # | Câu hỏi | Nguồn | Ưu tiên |
|---|---------|-------|:-------:|
| Q-07 | Poll ngày: ba trạng thái (rảnh/có thể/bận) hay hai? Ngày cụ thể hay khoảng ngày? Có cần giờ? | 02-1, 03-2 | A |
| Q-08 | Thành viên có được tự loại mình khỏi khoản chi hay chỉ người nhập/owner sửa? | 02-2 | A |
| Q-09 | Nhắc nợ: push hay chỉ trong app? (push iOS PWA hạn chế) | 02-3, 04-2 | B |
| Q-10 | Cách khôi phục phiên ẩn danh ngoài Google (mã khôi phục, link cá nhân)? | 02-4, 06-1 | **A** |
| Q-11 | Có cho owner xem "ai chưa vote" theo tên không (tránh làm người thụ động ngại)? | 02-5 | C |
| Q-12 | Giới hạn 30 ngày/chuyến, 1 tỷ VND/khoản chi, số thành viên tối đa (đề xuất 30) có hợp lý? | 03-1 | A |
| Q-13 | Có cần vai trò `admin` giữa owner và member cho nhóm đông? | 03-3 | C |
| Q-14 | Ai được thêm thành viên ảo: mọi thành viên hay chỉ owner? | 03-4 | A |
| Q-15 | Mức offline tối thiểu cho MVP: chỉ đọc hay cả ghi? | 03-5 | A |
| Q-16 | Sửa đồng thời: khóa lạc quan theo `version` có đủ hay cần hợp nhất theo trường? | 03-6 | B |
| Q-17 | Thứ tự phase: nếu thử nghiệm sớm thấy cần vote trước thì có đảo không? | 04-1 | C |
| Q-18 | Ước lượng size đã gồm rủi ro (VietQR thử trên nhiều ngân hàng) chưa? | 04-3 | A |
| Q-19 | Tên tab "Quyết toán" vs "Chia tiền"; "chốt kèo", "quyết toán" có dễ hiểu với mọi tuổi? | 05-1 | B |
| Q-20 | Dark mode trong MVP? (đề xuất hoãn) | 05-2 | C |
| Q-21 | Font: tự host Be Vietnam Pro hay Inter qua `next/font`? | 05-3 | C |
| Q-22 | Poll ngày dạng lưới có đọc được trên 360 px với 10+ người? | 05-4 | B |
| Q-23 | Màn "Việc cần làm" cá nhân hóa bằng dữ liệu nào? | 05-5 | C |

### 2.3 Kỹ thuật và dữ liệu

| # | Câu hỏi | Nguồn | Ưu tiên |
|---|---------|-------|:-------:|
| Q-24 | Quy định bảo vệ dữ liệu cá nhân hiện hành tại Việt Nam yêu cầu gì với tên và số tài khoản? | 06-2 | B |
| Q-25 | Có cần hợp nhất tài khoản khi đăng nhập Google trên máy mới ở MVP? | 06-3 | C |
| Q-26 | 2 dự án Supabase free cho staging + prod có đủ, hay dùng Supabase local làm staging? | 06-4 | A |
| Q-27 | Điều khoản Cloudflare/Netlify bản free về thương mại có đúng như nguồn nói? | 06-5 | **A** |
| Q-28 | Danh mục BIN ngân hàng lấy từ đâu và cập nhật thế nào? | 06-6, 08 | A |
| Q-29 | `member_bank_accounts` gắn theo `member_id` hay `user_id`? | 07-1 | A |
| Q-30 | Khoản `marked_paid` người nhận không xác nhận: để nguyên, tự xác nhận sau N ngày, hay owner ép? | 07-2 | A |
| Q-31 | `trip_budgets` ai được sửa? | 07-3 | B |
| Q-32 | Có cần bảng `activity_log` cho thông báo trong app ngay MVP? | 07-4 | C |
| Q-33 | Giới hạn tốc độ `join_trip_by_code` lưu ở đâu? | 07-5 | A |
| Q-34 | Chặn đổi `role/status/user_id` ở policy `members_update_self` bằng trigger hay quyền theo cột? | 07-6 | A |
| Q-35 | Thứ tự người tham gia `P` theo thời điểm tham gia có hợp lý? | 08-1 | B |
| Q-36 | Có cho người dùng chọn thủ công người nhận phần dư 1₫? | 08-2 | C |
| Q-37 | Giới hạn nội dung chuyển khoản thực tế của các ngân hàng phổ biến? Cần thử | 08-3 | **A** |
| Q-38 | Có làm tối ưu chính xác (bitmask) ngay MVP với nhóm ≤ 12 người? | 08-4 | C |
| Q-39 | QR đến thẻ (`QRIBFTTC`) có hỗ trợ? (đề xuất không) | 08-5 | C |
| Q-40 | QR có số tiền cố định: có cần cảnh báo vì một số app cho sửa tiền? | 08-6 | B |

### 2.4 Kiểm thử và ra mắt

| # | Câu hỏi | Nguồn | Ưu tiên |
|---|---------|-------|:-------:|
| Q-41 | Có sẵn những thiết bị thật nào để test? | 09-1 | A |
| Q-42 | Ai có tài khoản ở 4 ngân hàng khác nhau để quét thử QR? | 09-2 | A |
| Q-43 | pgTAP hay Vitest với JWT giả cho test RLS? | 09-3 | A |
| Q-44 | Mức chấp nhận test E2E flaky với realtime? | 09-4 | C |
| Q-45 | Ngưỡng cảnh báo 80% gửi qua kênh nào? | 09-5 | B |
| Q-46 | Thời gian làm việc thực tế mỗi tuần? (lộ trình 10 tuần phụ thuộc mạnh) | 10-1 | **A** |
| Q-47 | Có chuyến đi thật trong 4–8 tuần tới để làm bài thử nội bộ đầu tiên? | 10-2 | A |
| Q-48 | Sẽ đăng bài ở nhóm/cộng đồng nào; đã xin phép admin? | 10-3 | B |
| Q-49 | Công cụ analytics không cookie nào, phụ thuộc quyết định hosting? | 10-4 | B |
| Q-50 | Có cần đăng ký tên miền và email hỗ trợ; ngân sách nhỏ cho việc này? | 10-5 | B |

---

## 3. Rà soát chéo: mâu thuẫn và thiếu sót

Phương pháp: đối chiếu từng cặp tài liệu liên quan (yêu cầu ↔ bảng/RPC ↔ test; thuật toán ↔ dữ liệu; hosting ↔ doanh thu). Dưới đây là các điểm tìm thấy, **xếp theo mức độ cần sửa**.

| ID | Mức | Mâu thuẫn / thiếu sót | Tài liệu liên quan | Đề xuất sửa |
|----|-----|------------------------|--------------------|-------------|
| R-01 | **Cao** | **Khôi phục danh tính thành viên thật chưa có đường đi trong dữ liệu.** PRD (FR-36, BR-09) và kiến trúc (4.4) cho phép người ẩn danh mất phiên chọn "Tôi là…" để lấy lại danh tính. Nhưng RPC `claim_member` ở `07` chỉ cập nhật khi `user_id IS NULL`, tức chỉ xử lý **thành viên ảo**. Một thành viên thật đã có `user_id` (của phiên đã mất) sẽ không nhận lại được, và `list_claimable_members` cũng không trả họ. | 03, 04 (US-07), 06, 07 | Bổ sung RPC kiểu `request_rebind(member_id)` và `approve_rebind(...)` (chủ phiên cũ hoặc owner duyệt), hoặc "link khôi phục cá nhân" dùng một lần do owner cấp. Cần chốt Q-10 trước. Ghi thêm vào bảng RPC và test T-A10 |
| R-02 | Trung bình | **Hosting và doanh thu mâu thuẫn.** Brief (mục 7) lên kế hoạch donate/affiliate/quảng cáo, trong khi gói Vercel Hobby chỉ cho phép dự án phi thương mại. Đã được nêu ở `01` mục 7.4 và `06` mục 9.3 nhưng quyết định bị trùng ở hai nơi (D-01, D-20). | 01, 06, 10 | Gộp D-01 và D-20 thành một quyết định duy nhất; đặt mốc "trước khi bật bất kỳ nguồn thu nào" vào checklist ra mắt (đã có ở `09`) |
| R-03 | **Cao** | **Nội dung chuyển khoản cần "mã ngắn chuyến" nhưng bảng `trips` không có cột đó.** `08` mục 6.4 định dạng `TM <mã ngắn chuyến> <tên>`. Không nên dùng `invite_code` (là bí mật mời vào nhóm). | 07, 08 | Thêm cột `trips.short_code` (4–6 ký tự, không bí mật, unique) vào `07` và RPC `create_trip` |
| R-04 | **Cao** | **Số dư "chuẩn" khác nhau giữa DB và client khi có khoản chờ xác nhận.** `07` (D-28) chỉ tính thanh toán `confirmed`; `08` (D-34) gợi ý quyết toán có tính khoản `marked_paid`; kiến trúc (D-22) coi RPC là nguồn chuẩn và test PT-06 yêu cầu client và SQL cho cùng `net`. Khi có khoản chờ xác nhận, hai nơi sẽ lệch. | 06, 07, 08, 09 | Định nghĩa hai đại lượng rõ ràng: `net` (chỉ `confirmed`, đối chiếu PT-06) và `net_with_pending` (dùng cho gợi ý). RPC trả cả hai. Cập nhật `08` mục 3 và `07` mục 6 |
| R-05 | Thấp | **Chỗ ghi sẵn trong SQL nháp chưa hoàn chỉnh:** `get_trip_balances` trả `net = 0` tạm thời. | 07 | Viết lại bằng truy vấn bọc ngoài hoặc cột tính toán trước khi dùng (đã ghi chú trong tài liệu) |
| R-06 | Thấp | **`trip_budgets` ai sửa chưa nhất quán:** bảng quyền ghi "Owner (hoặc mọi thành viên nếu muốn)", còn quyết định D-31 đề xuất mọi thành viên. | 07 | Chốt Q-31, sửa bảng quyền cho khớp |
| R-07 | Thấp | **Đặt tên gây nhầm:** bảng `settlements` thực chất là các **khoản thanh toán**, trong khi "settlement" ở `08` và "quyết toán" ở PRD là cả quá trình. Một số ID cũng bị trùng/ghi hai lần (D-21 và D-35 giống nhau; D-01 và D-20 giống nhau). Hàm "ping giữ Supabase hoạt động" ở `06` chưa có trong danh sách RPC của `07`. Đánh số `FR-29a` (ảnh hóa đơn) hơi gượng. | 03, 06, 07, 08 | Đổi tên bảng thành `payments` (cập nhật `06`, `07`, `09`) hoặc giữ nguyên nhưng ghi rõ trong thuật ngữ; hợp nhất quyết định trùng; thêm RPC/endpoint ping; đánh lại số FR ảnh hóa đơn thành FR-38 |

### Điểm đã kiểm tra và **khớp**

- Danh sách bảng subscribe realtime (`06`) trùng tên với bảng ở `07`.
- Quy tắc làm tròn ở PRD (EC-03) trùng với thuật toán ở `08`; test TC-01 đến TC-18 ở `08` được tham chiếu đúng ở `09`.
- Các phase ở `04` khớp với lịch tuần ở `10` (P0 tuần 1 đến P5 tuần 9–10).
- Ví dụ tối giản nợ ở PRD FR-30 (+200k, −25k, −175k) trùng với TC-11 ở `08`.
- Ma trận truy vết ở PRD tham chiếu đúng ID màn hình ở `05` (S01–S17).

### Lưu ý về độ tin cậy của số liệu

- Giới hạn Supabase (200 kết nối realtime, 2 triệu thông điệp) lấy từ **một** nguồn; một nguồn khác cho số khác ở gói Pro. Cần xác nhận tại trang chính thức.
- Giá/giới hạn Splitwise không được công bố rõ và các nguồn lệch nhau.
- Cấu trúc trường VietQR (GUID `A000000727`, service code `QRIBFTTA`) dựa trên kiến thức về chuẩn NAPAS và tài liệu cộng đồng; chuỗi mẫu đã tính CRC đúng nhưng **chưa quét thử bằng app ngân hàng thật**.
- Các con số KPI ở `01` là giả định khởi điểm, không phải dự báo.

---

## Câu hỏi mở của README

1. Bạn muốn xử lý các điểm R-01, R-03, R-04 ngay (cập nhật `03`, `06`, `07`, `08`) hay trả lời Q-10, Q-29, Q-30 trước rồi sửa một lượt?
2. Có đổi tên `settlements` thành `payments` (R-07) không?
3. Bạn có muốn một tài liệu quyết định gộp (decision log) để theo dõi D-01 đến D-45 ở một nơi?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-46 | Sửa R-01, R-03, R-04 trước khi viết code | Có |
| D-47 | Đổi tên bảng `settlements` thành `payments` | Có, đổi sớm khi chưa có code |
| D-48 | Tạo decision log gộp | Có, một tệp `docs/decision-log.md` |
