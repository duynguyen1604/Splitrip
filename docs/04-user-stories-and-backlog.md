# Tripmate — User Stories và Backlog

- **Mục đích:** Chuyển PRD thành các câu chuyện người dùng, gom theo epic, chia phase cho một lập trình viên làm một mình, và xác định lát cắt dọc mỏng nhất.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Có 6 epic, 38 user story, chia thành 6 phase (P0–P5) tương ứng 10 tuần. Lát cắt dọc mỏng nhất (Phase 1) là: tạo chuyến, mời bằng link, ghi khoản chi chia đều, xem số dư. Đây là phần nhỏ nhất mà một nhóm bạn thật có thể dùng được cho một chuyến đi. Quyết toán và VietQR đến ngay sau (Phase 2) vì đó là điểm khác biệt chính.

Quy ước kích thước: **S** ≤ 0,5 ngày, **M** 1–2 ngày, **L** 3–5 ngày (một người làm).

---

## 1. Epic

| Epic | Tên | Yêu cầu liên quan |
|------|-----|-------------------|
| E1 | Chuyến đi, thành viên, danh tính | FR-01 đến FR-08, FR-36, FR-37 |
| E2 | Chi tiêu và chia tiền | FR-22 đến FR-28 |
| E3 | Quyết toán và VietQR | FR-29 đến FR-34 |
| E4 | Ý tưởng và bình chọn | FR-09 đến FR-14 |
| E5 | Lịch trình và dự toán | FR-15 đến FR-21 |
| E6 | Nền tảng, PWA, chất lượng | NFR-01 đến NFR-18 |

---

## 2. User story

Định dạng: "Là một [persona], tôi muốn [hành động] để [lợi ích]". Ưu tiên theo MoSCoW (M/S/C).

### E1 — Chuyến đi, thành viên, danh tính

| ID | Story | FR | Ưu tiên | Size |
|----|-------|----|---------|------|
| US-01 | Là Minh Anh, tôi muốn tạo chuyến chỉ bằng tên để bắt đầu rủ bạn trong dưới 1 phút. | FR-01 | M | S |
| US-02 | Là Đức, tôi muốn bấm link và nhập tên để vào nhóm mà không phải đăng ký. | FR-02 | M | M |
| US-03 | Là Minh Anh, tôi muốn sao chép link và QR mời để gửi vào group Zalo. | FR-03 | M | S |
| US-04 | Là Minh Anh, tôi muốn đổi mã mời để vô hiệu hóa link bị lộ. | FR-03 | M | S |
| US-05 | Là Minh Anh, tôi muốn thêm thành viên ảo cho người chưa dùng app để vẫn chia tiền cho họ. | FR-04 | M | M |
| US-06 | Là Minh (người thật), tôi muốn nhận lại thành viên ảo của mình để giữ lịch sử chi tiêu. | FR-37 | M | M |
| US-07 | Là Đức, tôi muốn chọn "Tôi là Đức" khi mất phiên để vào lại mà không mất dữ liệu. | FR-36 | M | M |
| US-08 | Là Lan, tôi muốn rời nhóm mà khoản nợ của tôi vẫn được ghi nhận minh bạch. | FR-07 | M | S |
| US-09 | Là Minh Anh, tôi muốn phân biệt owner và member để tránh người khác xóa nhầm chuyến. | FR-05 | M | S |
| US-10 | Là Minh Anh, tôi muốn sửa, lưu trữ hoặc xóa chuyến sau khi xong. | FR-06 | S | S |
| US-11 | Là Đức, tôi muốn liên kết Google để không mất dữ liệu khi đổi máy. | FR-08 | S | M |

### E2 — Chi tiêu và chia tiền

| ID | Story | FR | Ưu tiên | Size |
|----|-------|----|---------|------|
| US-12 | Là Minh Anh, tôi muốn ghi một khoản chi với số tiền, người trả và người tham gia để theo dõi chi tiêu. | FR-22 | M | M |
| US-13 | Là Minh Anh, tôi muốn chia đều một khoản chi để không phải tính tay. | FR-23 | M | M |
| US-14 | Là Lan, tôi muốn chia theo số tiền cụ thể khi mỗi người ăn khác nhau. | FR-24 | M | M |
| US-15 | Là Minh Anh, tôi muốn chia theo phần trăm cho các khoản chia theo tỷ lệ. | FR-25 | S | S |
| US-16 | Là một thành viên gia đình, tôi muốn chia theo phần (người lớn 2, trẻ em 1) để công bằng giữa các hộ. | FR-26 | S | S |
| US-17 | Là Minh Anh, tôi muốn sửa hoặc xóa khoản chi và thấy lịch sử sửa để tránh tranh cãi. | FR-27 | M | M |
| US-18 | Là Lan, tôi muốn đề nghị chỉnh phần chia của mình mà không phải nhắn riêng. | FR-28 | S | M |
| US-19 | Là Đức, tôi muốn thấy ngay số tiền gợi ý chia và tổng khi nhập để yên tâm đúng. | FR-22 | M | S |

### E3 — Quyết toán và VietQR

| ID | Story | FR | Ưu tiên | Size |
|----|-------|----|---------|------|
| US-20 | Là Đức, tôi muốn xem số dư của mình và của từng người để biết mình nợ hay được nợ. | FR-29 | M | M |
| US-21 | Là Minh Anh, tôi muốn app đề xuất cách chuyển khoản ít giao dịch nhất cuối chuyến. | FR-30 | M | M |
| US-22 | Là Đức, tôi muốn quét QR có sẵn số tiền và nội dung để chuyển khoản không sai. | FR-31 | M | L |
| US-23 | Là Minh Anh, tôi muốn nhập thông tin nhận tiền một lần để mọi người chuyển cho tôi dễ dàng. | FR-32 | M | S |
| US-24 | Là Minh Anh, tôi muốn đánh dấu "đã nhận" khi bạn chuyển để không phải nhớ. | FR-33 | M | M |
| US-25 | Là Đức, tôi muốn đánh dấu "đã chuyển" sau khi trả tiền. | FR-33 | M | S |
| US-26 | Là Minh Anh, tôi muốn chốt quyết toán để khóa số liệu cuối cùng. | FR-34 | S | S |
| US-27 | Là Lan, tôi muốn nhận nhắc nhở lịch sự từ app thay vì do bạn bè đòi. | FR-30 | S | M |

### E4 — Ý tưởng và bình chọn

| ID | Story | FR | Ưu tiên | Size |
|----|-------|----|---------|------|
| US-28 | Là Minh Anh, tôi muốn thêm ý tưởng điểm đến, chỗ ở, hoạt động. | FR-09 | M | M |
| US-29 | Là Đức, tôi muốn vote một chạm cho ý tưởng mình thích. | FR-10 | M | S |
| US-30 | Là Minh Anh, tôi muốn mở poll ngày và thấy phương án nhiều người rảnh nhất. | FR-11 | M | L |
| US-31 | Là Lan, tôi muốn báo ngày bận mà không phải giải thích. | FR-11 | M | S |
| US-32 | Là Minh Anh, tôi muốn "Chốt kèo" để khóa lựa chọn cuối cùng. | FR-12 | M | S |
| US-33 | Là thành viên, tôi muốn bình luận dưới ý tưởng. | FR-13 | C | S |

### E5 — Lịch trình và dự toán

| ID | Story | FR | Ưu tiên | Size |
|----|-------|----|---------|------|
| US-34 | Là Minh Anh, tôi muốn xếp hoạt động theo từng ngày của chuyến. | FR-15, FR-18 | M | L |
| US-35 | Là Minh Anh, tôi muốn tạo hoạt động từ ý tưởng đã chốt. | FR-16 | S | S |
| US-36 | Là Minh Anh, tôi muốn kéo thả để đổi thứ tự hoạt động. | FR-17 | S | M |
| US-37 | Là Minh Anh, tôi muốn đặt dự toán theo hạng mục và xem đã chi bao nhiêu. | FR-20, FR-21 | M | M |
| US-38 | Là Đức, tôi muốn xem lịch trình khi không có mạng. | NFR-10 | M | M |

---

## 3. Lát cắt dọc mỏng nhất (Thinnest Vertical Slice)

**Mục tiêu:** Một nhóm bạn thật có thể làm trọn vòng "tạo chuyến, mời, ghi chi tiêu, xem ai nợ ai" trong một cuối tuần.

| Lớp | Phạm vi lát cắt |
|-----|-----------------|
| UI | Trang chủ (danh sách chuyến), Tạo chuyến, Tham gia bằng link, Tab Chi phí, Thêm chi tiêu (chỉ chia đều), Số dư |
| API/RPC | `create_trip`, `join_trip_by_code`, `add_expense`, `get_trip_balances` |
| DB | `trips`, `trip_members`, `expenses`, `expense_splits` + RLS |
| Auth | Đăng nhập ẩn danh |
| Không có | Vote, lịch trình, tối giản nợ, VietQR, PWA offline, các kiểu chia khác |

Story trong lát cắt: US-01, US-02, US-03, US-12, US-13, US-19, US-20.

Dùng được trong 2–3 tuần. Sau đó thêm tối giản nợ và VietQR (Phase 2) để đi hết vòng giá trị.

---

## 4. Phase (Sprint) cho solo dev

Mỗi phase 1–2 tuần. Tuần tính từ ngày bắt đầu code.

### Phase 0 — Nền tảng (tuần 1)

- **Mục tiêu:** Dự án chạy được, triển khai tự động, có luồng đăng nhập ẩn danh trống.
- **Story/Công việc:** khởi tạo Next.js + Tailwind + shadcn/ui, Supabase project, CI, môi trường dev/prod, đăng nhập ẩn danh, Sentry, schema cơ bản.
- **DoD:** push lên `main` tự triển khai; tạo được phiên ẩn danh; migration chạy được từ đầu; README hướng dẫn chạy local.

### Phase 1 — Lát cắt mỏng nhất (tuần 2–3)

- **Mục tiêu:** Nhóm dùng được để theo dõi chi tiêu.
- **Story:** US-01, US-02, US-03, US-09, US-12, US-13, US-19, US-20.
- **DoD:** E2E (Playwright) pass cho "tạo chuyến, mời, 2 người ghi chi tiêu, thấy số dư"; RLS test pass; không có lỗi nghiêm trọng khi 2 trình duyệt cùng dùng; tổng số dư luôn 0 trên test thuộc tính.

### Phase 2 — Quyết toán và VietQR (tuần 4–5)

- **Mục tiêu:** Khép vòng giá trị: nợ tối giản, QR, đánh dấu đã trả.
- **Story:** US-14, US-21, US-22, US-23, US-24, US-25, US-17, US-05, US-06, US-08.
- **DoD:** 10+ test case thuật toán pass (xem `08`); QR quét được trên ít nhất 4 app ngân hàng thật; thông tin tài khoản chỉ lấy qua RPC; sửa khoản chi tính lại đúng.

### Phase 3 — Ý tưởng, vote, poll ngày (tuần 6–7)

- **Mục tiêu:** Ra quyết định chung trong app.
- **Story:** US-28, US-29, US-30, US-31, US-32, US-07, US-04.
- **DoD:** realtime vote hiển thị dưới 3 giây; poll ngày hiển thị đúng phương án tốt nhất; chốt kèo khóa vote; khôi phục danh tính hoạt động.

### Phase 4 — Lịch trình và dự toán (tuần 8)

- **Mục tiêu:** Hoàn thiện vòng "trước chuyến đi".
- **Story:** US-34, US-35, US-36, US-37, US-15, US-16, US-10.
- **DoD:** thêm/sửa hoạt động theo ngày; kéo thả hoạt động hoặc nút lên/xuống; dự toán hiển thị đã chi/dự toán.

### Phase 5 — PWA, chất lượng, thử nghiệm kín (tuần 9–10)

- **Mục tiêu:** Sẵn sàng thử nghiệm kín với 10–20 nhóm.
- **Story:** US-38, US-11, US-18, US-26, US-27 (nếu còn thời gian), NFR-12, NFR-14.
- **DoD:** cài được về màn hình chính; lịch trình xem offline; QA thủ công trên iOS Safari và Android Chrome; checklist ra mắt ở `09` đạt; chính sách riêng tư tiếng Việt có mặt.

---

## 5. Backlog sau MVP (Could/Won't)

| Mục | Điều kiện bắt đầu |
|-----|-------------------|
| US-33 bình luận, FR-14 xem trước link, FR-19 chia sẻ lịch trình | Người dùng thật yêu cầu nhiều |
| FR-29a ảnh hóa đơn | Có chỗ lưu trữ rẻ; dung lượng Storage free chỉ 1 GB |
| FR-35 chia sẻ tổng kết | Sau khi KPI-06 đạt |
| Đa tiền tệ, OCR, AI gợi ý | Xem `10-roadmap-and-launch.md` |

---

## Câu hỏi mở

1. Thứ tự Phase 2 và Phase 3: đã đặt quyết toán trước vote vì đó là điểm khác biệt. Nếu thử nghiệm sớm cho thấy nhóm cần vote trước thì có nên đảo không?
2. Có cần nhắc nhở (US-27) trong MVP không, khi push trên iOS PWA bị hạn chế?
3. Ước lượng size đã tính cho một người; có rủi ro nào làm giãn thời gian (ví dụ VietQR kiểm thử trên nhiều ngân hàng) cần thêm buffer?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-13 | Thứ tự phase | Giữ: chi tiêu, quyết toán, vote, lịch trình, PWA |
| D-14 | Có làm US-27 (nhắc nợ) không | Chỉ nhắc trong app ở MVP; push để sau |
| D-15 | Buffer thời gian | Chừa 20% tuần cho sửa lỗi và thử nghiệm VietQR |
