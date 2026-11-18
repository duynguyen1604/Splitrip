# Tripmate — Kế hoạch kiểm thử và chất lượng

- **Mục đích:** Quy định chiến lược test, danh sách test case ưu tiên gắn với yêu cầu, checklist QA thủ công và tiêu chí ra mắt MVP.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Một lập trình viên làm một mình nên kế hoạch tập trung vào **thứ dễ sai và đắt nhất khi sai**: tiền (chia, số dư, tối giản nợ), quyền truy cập (RLS, thông tin ngân hàng) và luồng đầu tiên của người dùng (vào bằng link). Kim tự tháp test: nhiều unit test thuần (thuật toán), vừa đủ integration/RLS test trên Supabase local, ít nhưng ổn định E2E bằng Playwright cho các luồng vàng, cộng QA thủ công trên điện thoại thật.

---

## 1. Chiến lược test

| Tầng | Công cụ | Phạm vi | Mục tiêu độ phủ | Chạy khi |
|------|---------|---------|-----------------|----------|
| Unit | Vitest | `lib/settlement` (split, balances, simplify), `lib/vietqr` (TLV, CRC), `lib/money` (format/parse), schema Zod | 100% nhánh của `lib/settlement` và `lib/vietqr`; còn lại theo nhu cầu | Mỗi commit |
| Property-based | Vitest + fast-check | PT-01 đến PT-05 trong `08` | 10.000 ca ngẫu nhiên mỗi thuộc tính | Mỗi commit (rút gọn), hằng đêm (đầy đủ) |
| Integration (DB/RPC) | Vitest + Supabase local | RPC (`add_expense`, `join_trip_by_code`, `claim_member`...), ràng buộc CHECK, trigger tổng chia | Mọi RPC có ít nhất ca thành công + ca lỗi | Mỗi PR |
| **Kiểm thử RLS** | Script SQL (pgTAP hoặc test đặt vai `set role`/`set request.jwt.claims`) | Mọi bảng: thử đọc/ghi với vai trò (chủ, thành viên, người ngoài, ẩn danh chưa vào chuyến) | 100% bảng có test "người ngoài không đọc/ghi được" | Mỗi PR |
| Component | Vitest + Testing Library | Bottom sheet thêm chi tiêu, bộ chọn kiểu chia, hiển thị tiền | Các thành phần có logic | Mỗi PR |
| E2E | Playwright (Chromium + WebKit + mô phỏng mobile) | Các luồng vàng ở mục 3 | 6–8 luồng | Mỗi PR vào `main` và trước ra mắt |
| Hiệu năng | Lighthouse CI | Trang chủ, trang chuyến | LCP, kích thước JS (NFR-01, NFR-03) | Hằng tuần |
| Truy cập | axe-core trong Playwright | Màn hình chính | Không có lỗi nghiêm trọng (NFR-12) | Mỗi PR |
| Thủ công | Điện thoại thật | Mục 4 | Danh sách kiểm | Cuối mỗi phase, trước ra mắt |

Dữ liệu test: dùng `seed.sql` (xem `07`), mỗi E2E tạo chuyến riêng để chạy song song.

---

## 2. Test case ưu tiên theo module

Ưu tiên: **P0** chặn ra mắt, **P1** nên đạt, **P2** nếu còn thời gian. Cột "Loại": U (unit), I (integration), R (RLS), E (E2E).

### 2.1 Chuyến đi và thành viên

| ID | Test | Yêu cầu | Loại | Ưu tiên |
|----|------|---------|------|---------|
| T-A01 | Tạo chuyến chỉ với tên; người tạo là owner | FR-01, FR-05 | I, E | P0 |
| T-A02 | Mở link, nhập tên, vào nhóm không cần email/mật khẩu | FR-02 | E | P0 |
| T-A03 | Link sai/đã đổi mã trả thông báo, không lộ thông tin chuyến | FR-03, EC-13 | I, E | P0 |
| T-A04 | Đổi mã mời: link cũ vô hiệu, thành viên cũ vẫn vào được | FR-03 | I | P0 |
| T-A05 | Thêm thành viên ảo và gán vào khoản chi | FR-04 | I | P0 |
| T-A06 | Nhận thành viên ảo: gắn `user_id`, giữ lịch sử | FR-37, EC-04 | I, E | P0 |
| T-A07 | Hai người cùng nhận một thành viên ảo: chỉ một thành công | EC-06 | I | P0 |
| T-A08 | Rời nhóm khi còn nợ: vẫn trong số dư và gợi ý | FR-07, EC-01 | I | P0 |
| T-A09 | Member không xóa được chuyến, không đổi mã mời | FR-05 | R, I | P0 |
| T-A10 | Mất phiên ẩn danh, khôi phục bằng "Tôi là…" | FR-36 | E | P0 |
| T-A11 | Liên kết Google giữ nguyên `user_id` và dữ liệu | FR-08 | I | P1 |
| T-A12 | Giới hạn số thành viên mỗi chuyến | D-08 | I | P1 |
| T-A13 | Xóa mềm chuyến: ẩn với mọi người, không tính toán | FR-06, BR-06 | I, R | P1 |

### 2.2 Ý tưởng và bình chọn

| ID | Test | Yêu cầu | Loại | Ưu tiên |
|----|------|---------|------|---------|
| T-B01 | Thêm ý tưởng, hiển thị cho mọi thành viên | FR-09 | E | P0 |
| T-B02 | Mỗi người tối đa 1 vote mỗi ý tưởng; bấm lại bỏ vote | FR-10 | I | P0 |
| T-B03 | Không vote hộ người khác (RLS) | FR-10 | R | P0 |
| T-B04 | Vote của người này xuất hiện ở người kia dưới 3 giây | NFR-04 | E | P1 |
| T-B05 | Poll ngày: tổng hợp đúng, phương án tốt nhất nổi bật | FR-11 | U, E | P0 |
| T-B06 | Chốt kèo khóa vote; chỉ owner chốt/mở lại | FR-12 | I, R | P0 |

### 2.3 Lịch trình

| ID | Test | Yêu cầu | Loại | Ưu tiên |
|----|------|---------|------|---------|
| T-C01 | Thêm hoạt động vào đúng ngày, đúng thứ tự | FR-15 | E | P0 |
| T-C02 | Hoạt động có link Maps mở được | FR-18 | E | P1 |
| T-C03 | Tạo hoạt động từ ý tưởng đã chốt | FR-16 | I | P1 |
| T-C04 | Sắp xếp lại (kéo thả hoặc nút) lưu và đồng bộ | FR-17 | E | P1 |
| T-C05 | Xem lịch trình khi offline | NFR-10 | E | P0 |

### 2.4 Chi phí và dự toán

| ID | Test | Yêu cầu | Loại | Ưu tiên |
|----|------|---------|------|---------|
| T-D01 | Thêm khoản chi chia đều, mặc định người trả là mình, chia cho tất cả | FR-22, FR-23 | E | P0 |
| T-D02 | Các test chia tiền TC-01 đến TC-09 (xem `08`) | FR-23 đến FR-26 | U | P0 |
| T-D03 | Chia theo số tiền sai tổng bị chặn kèm thông báo thiếu/thừa | FR-24 | U, E | P0 |
| T-D04 | Khoản chi có tổng phần chia khác tổng tiền bị DB từ chối | BR-02, NFR-15 | I | P0 |
| T-D05 | Gửi trùng `client_id` không tạo bản sao | FR-22, NFR-11 | I | P0 |
| T-D06 | Sửa khoản chi tăng `version`, ghi lịch sử | FR-27 | I | P0 |
| T-D07 | Hai người sửa cùng lúc: người sau nhận xung đột | EC-05 | I | P0 |
| T-D08 | Số tiền ngoài [1; 1.000.000.000] bị từ chối | EC-07 | I | P0 |
| T-D09 | Người trả không tham gia khoản chi | EC-08 | U, I | P1 |
| T-D10 | Dự toán và thanh tiến độ đúng | FR-20 | E | P1 |
| T-D11 | Thành viên đề nghị chỉnh phần chia | FR-28 | E | P2 |
| T-D12 | Ghi chi tiêu offline, đồng bộ lại không trùng | NFR-11 | E | P2 |

### 2.5 Quyết toán

| ID | Test | Yêu cầu | Loại | Ưu tiên |
|----|------|---------|------|---------|
| T-E01 | Test số dư và tối giản nợ TC-10 đến TC-18 (xem `08`) | FR-29, FR-30 | U | P0 |
| T-E02 | Property-based PT-01 đến PT-06 | NFR-15 | U, I | P0 |
| T-E03 | `get_trip_balances` (SQL) khớp bản tính ở client trên dữ liệu seed | PT-06 | I | P0 |
| T-E04 | Mã VietQR có CRC đúng; chuỗi đúng định dạng TLV | FR-31 | U | P0 |
| T-E05 | Quét QR bằng app của ít nhất 4 ngân hàng khác nhau, số tiền và nội dung điền đúng | FR-31 | Thủ công | P0 |
| T-E06 | Người không nợ không lấy được thông tin ngân hàng qua `get_payment_target` | NFR-08 | R, I | P0 |
| T-E07 | Không thể SELECT trực tiếp `member_bank_accounts` của người khác | NFR-08 | R | P0 |
| T-E08 | Đánh dấu đã chuyển rồi người nhận xác nhận: số dư đổi | FR-33 | I, E | P0 |
| T-E09 | Chưa xác nhận: số dư DB chưa đổi, gợi ý hiển thị "chờ xác nhận" | D-28, D-34 | I | P1 |
| T-E10 | Chốt quyết toán chặn sửa khoản chi; mở khóa thì sửa được và tính lại | FR-34, EC-02 | I, E | P1 |
| T-E11 | Người nhận chưa nhập thông tin: hiển thị thông báo, không lỗi | FR-32 | E | P0 |
| T-E12 | Thông tin ngân hàng không xuất hiện trong log hoặc báo cáo Sentry | NFR-08, NFR-18 | Thủ công, I | P0 |

### 2.6 Phi chức năng

| ID | Test | Yêu cầu | Ưu tiên |
|----|------|---------|---------|
| T-N01 | LCP p75 dưới 2,5 giây trên mô phỏng 4G | NFR-01 | P1 |
| T-N02 | JS ban đầu dưới 200 KB gzip | NFR-03 | P1 |
| T-N03 | Mọi bảng đều có RLS bật (truy vấn catalog) | NFR-05 | P0 |
| T-N04 | Giới hạn tốc độ tham gia bằng mã | NFR-06 | P1 |
| T-N05 | axe: không có lỗi nghiêm trọng ở màn hình chính; tương phản đạt 4.5:1 | NFR-12 | P1 |
| T-N06 | Xóa dữ liệu cá nhân (`delete_my_data`) hoạt động | NFR-09 | P1 |
| T-N07 | Cron giữ Supabase hoạt động và backup hằng tuần chạy được, có thử khôi phục | NFR-16 | P0 |

---

## 3. Luồng E2E vàng (Playwright)

| ID | Luồng | Ghi chú |
|----|-------|---------|
| E2E-01 | Organizer tạo chuyến, sao chép link; người thứ hai mở link ở ngữ cảnh trình duyệt khác, vào nhóm | Hai ngữ cảnh = hai người |
| E2E-02 | Hai người cùng ghi chi tiêu; cả hai thấy số dư giống nhau dưới 3 giây | Realtime |
| E2E-03 | Quyết toán: gợi ý đúng, đánh dấu đã chuyển, xác nhận, số dư về 0 | |
| E2E-04 | Thành viên ảo được nhận qua "Tôi là…" | |
| E2E-05 | Vote và poll ngày, chốt kèo | |
| E2E-06 | Mất phiên và khôi phục | |
| E2E-07 | Offline: mở lịch trình khi tắt mạng | |
| E2E-08 | Người ngoài mở link đã đổi mã: thấy thông báo, không lộ dữ liệu | |

---

## 4. Checklist QA thủ công trên điện thoại thật

Thiết bị tối thiểu: **một iPhone** (iOS Safari, ưu tiên 16.4 trở lên), **một Android tầm trung** (Chrome). Nếu có, thêm một máy Android cũ hoặc màn hình nhỏ (360 px).

| # | Hạng mục | iOS Safari | Android Chrome |
|---|----------|:---------:|:--------------:|
| 1 | Mở link mời từ Zalo/Messenger (trình duyệt trong app) và từ trình duyệt ngoài | ☐ | ☐ |
| 2 | Vào nhóm không đăng ký, dưới 20 giây | ☐ | ☐ |
| 3 | Bàn phím số hiện đúng ở ô số tiền; định dạng `1.234.567₫` | ☐ | ☐ |
| 4 | Bottom sheet không bị bàn phím che nút Lưu | ☐ | ☐ |
| 5 | Vùng chạm đủ lớn, không bấm nhầm | ☐ | ☐ |
| 6 | Vote một chạm, thấy cập nhật từ máy khác | ☐ | ☐ |
| 7 | Kéo thả lịch trình bằng cảm ứng, không xung đột với cuộn trang | ☐ | ☐ |
| 8 | Mở QR thanh toán, quét bằng ít nhất 4 app ngân hàng khác nhau (ghi tên app) | ☐ | ☐ |
| 9 | Sao chép số tài khoản và nội dung chuyển khoản | ☐ | ☐ |
| 10 | Cài về màn hình chính; mở ở chế độ standalone | ☐ | ☐ |
| 11 | Tắt mạng: xem lịch trình và số dư; dải "Đang offline" hiện | ☐ | ☐ |
| 12 | Mạng yếu (giả lập 3G): vẫn dùng được, có skeleton | ☐ | ☐ |
| 13 | Xoay ngang, cỡ chữ hệ thống lớn: không vỡ giao diện | ☐ | ☐ |
| 14 | Xóa dữ liệu trình duyệt rồi mở lại link: khôi phục bằng "Tôi là…" | ☐ | ☐ |
| 15 | Chế độ tiết kiệm pin/dữ liệu: không mất kết nối realtime quá lâu | ☐ | ☐ |
| 16 | Hiển thị tiếng Việt có dấu đúng ở mọi màn hình | ☐ | ☐ |

Ghi mỗi lỗi: thiết bị, hệ điều hành, các bước, ảnh/quay màn hình.

---

## 5. Tiêu chí chấp nhận MVP

MVP đủ điều kiện **thử nghiệm kín** khi:

| # | Tiêu chí |
|---|----------|
| 1 | Mọi test **P0** ở mục 2 đạt |
| 2 | Không còn lỗi nghiêm trọng (mất dữ liệu, sai tiền, lộ dữ liệu) |
| 3 | 100% bảng có RLS và test "người ngoài" đạt |
| 4 | Thông tin ngân hàng chỉ lấy được qua RPC có kiểm quyền |
| 5 | Thuật toán chia và tối giản nợ: toàn bộ TC và PT đạt; `Σ net = 0` trong mọi test |
| 6 | QR quét được trên ít nhất 4 app ngân hàng (ghi danh sách) |
| 7 | LCP p75 dưới 2,5 giây, JS ban đầu dưới 200 KB gzip |
| 8 | Checklist QA thủ công ở mục 4 đạt trên cả iOS và Android |
| 9 | Một nhóm nội bộ (nhóm bạn của chính bạn) dùng thật cho một chuyến đi và quyết toán thành công |

### Checklist trước khi ra mắt công khai

| # | Hạng mục |
|---|----------|
| 1 | Hosting phù hợp điều khoản thương mại nếu có nguồn thu (xem D-01, D-20) |
| 2 | Cron giữ Supabase hoạt động và backup hằng tuần chạy; đã thử khôi phục từ backup |
| 3 | Theo dõi dung lượng DB, MAU và kết nối realtime; có cảnh báo ở 80% |
| 4 | Chính sách riêng tư và điều khoản bằng tiếng Việt; chức năng xóa dữ liệu |
| 5 | Sentry bật và đã lọc dữ liệu nhạy cảm |
| 6 | Trang giới thiệu có SEO cơ bản; trang chuyến `noindex` |
| 7 | Dữ liệu đối thủ và số liệu trong thông điệp quảng bá đã kiểm chứng lại |
| 8 | Kênh nhận phản hồi (biểu mẫu hoặc email) hoạt động |
| 9 | Đã chạy toàn bộ E2E trên bản triển khai thật |

---

## Câu hỏi mở

1. Có sẵn những thiết bị thật nào để test (đời iOS, hãng Android)? Nếu thiếu, dùng dịch vụ test thiết bị nào (có gói miễn phí)?
2. Test quét QR cần tài khoản ở 4 ngân hàng khác nhau; ai có sẵn? Có thể nhờ bạn bè trong thử nghiệm kín.
3. Có dùng pgTAP hay tự viết test RLS bằng Vitest đặt vai qua JWT giả? Cái nào dễ duy trì hơn cho một người?
4. Mức độ chấp nhận cho test E2E không ổn định (flaky) với realtime là gì (thử lại bao nhiêu lần)?
5. Ngưỡng cảnh báo ở 80% cho DB/MAU/realtime gửi qua kênh nào (email, Telegram)?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-37 | Công cụ test RLS | Vitest + vai/JWT giả trên Supabase local |
| D-38 | Độ phủ bắt buộc | 100% nhánh cho `lib/settlement` và `lib/vietqr`; không đặt ngưỡng chung |
| D-39 | Thiết bị tối thiểu | 1 iPhone + 1 Android tầm trung |
| D-40 | Số app ngân hàng phải quét thử | Tối thiểu 4 |
