# Tripmate — Documentation Index

**Mục đích:** Là mục lục và điểm vào duy nhất cho bộ tài liệu sản phẩm Tripmate; ghi rõ thứ tự đọc, quyết định nền và các mâu thuẫn cần xử lý trước khi code.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** Bộ tài liệu đi từ vấn đề và persona đến PRD, backlog, UX, kiến trúc, database, thuật toán tiền, test và launch. Các tài liệu đã dùng một bộ thuật ngữ và ID chung; phần rà soát chéo bên dưới ghi các điểm còn phải chốt, đặc biệt anonymous recovery, payment profile và phạm vi offline.

## 1. Thứ tự đọc

| Bước | Tài liệu | Mục tiêu |
|---:|---|---|
| 1 | [01-product-brief.md](./01-product-brief.md) | Định vị, pain points, đối thủ, KPI, rủi ro và baseline requirements. |
| 2 | [02-personas-and-journeys.md](./02-personas-and-journeys.md) | Hiểu người dùng, journey và critical moments. |
| 3 | [03-prd.md](./03-prd.md) | Chốt phạm vi MVP, FR/NFR, acceptance criteria và edge cases. |
| 4 | [04-user-stories-and-backlog.md](./04-user-stories-and-backlog.md) | Chia yêu cầu thành story, phase và vertical slice. |
| 5 | [05-ux-and-screens.md](./05-ux-and-screens.md) | Điều hướng, màn hình, wireframe và UI copy. |
| 6 | [06-architecture.md](./06-architecture.md) | Dịch vụ, runtime, auth, realtime, offline và vận hành. |
| 7 | [07-database.md](./07-database.md) | ERD, schema, RLS, RPC và migration. |
| 8 | [08-settlement-algorithm.md](./08-settlement-algorithm.md) | Split, rounding, balance, transfer và VietQR. |
| 9 | [09-test-plan.md](./09-test-plan.md) | Test strategy, cases, device QA và release gate. |
| 10 | [10-roadmap-and-launch.md](./10-roadmap-and-launch.md) | Lộ trình 8–10 tuần, pilot và launch. |
| 11 | `README.md` + [glossary.md](./glossary.md) | Rà soát chéo, thuật ngữ và checklist chốt trước code. |

## 2. Quyết định nền đang được dùng

| Chủ đề | Quyết định hiện tại | Nguồn |
|---|---|---|
| Primary segment | Nhóm bạn 3–10 người tại Việt Nam; nhóm đồng nghiệp là pilot phụ | Product Brief, PRD |
| Auth | Anonymous Supabase Auth; Google upgrade là Should | Product Brief, Architecture |
| Frontend/hosting | React + Vite + TypeScript trên Cloudflare Pages Free; Docker chỉ local/CI | Architecture, Roadmap |
| Money | VND integer `bigint`, không decimal/float | PRD, Database, Algorithm |
| Core flow | Create → join → poll → itinerary → expense → settlement | Personas, Backlog, UX |
| Roles | `owner`, `member`, virtual member là trạng thái dữ liệu | PRD, Database |
| Settlement | Greedy deterministic; QR không xác nhận giao dịch | Algorithm, Architecture |
| Offline | Read cache + draft; chưa có offline write queue | Product Brief, Architecture |
| Monetization | Không quảng cáo/affiliate trong MVP | Product Brief, Roadmap |
| Timeline | 8 tuần build + 2 tuần closed pilot | Backlog, Roadmap |

## 3. Rà soát chéo và đề xuất sửa

| ID | Mâu thuẫn/rủi ro | Tài liệu liên quan | Đề xuất sửa/chốt |
|---|---|---|---|
| X-01 | Product Brief nói Google upgrade là Should nhưng UX/Architecture cần recovery khi anonymous session mất; chưa có cơ chế chắc chắn. | 01, 02, 03, 06 | Giữ Google upgrade là Should cho core flow, nhưng coi recovery copy + session warning là Must trước pilot; export code chỉ là quyết định riêng. |
| X-02 | PRD/UX nói owner có thể đóng settlement theo rule, còn Product Brief còn mở câu hỏi xác nhận người nhận. | 01, 03, 05 | Chốt mặc định: chỉ completed khi mọi transfer `confirmed_received`; thêm manual close với warning/audit nếu owner được cấp sau này. |
| X-03 | Database `payment_profiles` chứa encrypted fields nhưng Architecture chưa chốt encryption key management. | 06, 07, 08 | MVP chỉ lưu profile nếu provider/Supabase encryption và secret management đủ; nếu chưa, nhập bank data mỗi lần tạo QR. Không code trước khi chốt. |
| X-04 | PRD có `member_status=pending_merge` và virtual member, nhưng RLS policy mẫu dùng `user_id IS NULL` chưa bao phủ mọi merge case. | 03, 06, 07 | Tạo RPC `merge_virtual_member`, khóa transaction, test duplicate member/expense; không cho client update `user_id`. |
| X-05 | UX cho phép share QR image nhưng privacy rules hạn chế lưu/chia sẻ bank data. | 05, 06, 09 | MVP ưu tiên show/copy; share/download QR chỉ bật sau privacy review và không lưu lâu dài. |
| X-06 | PRD đặt FR-REAL-01 là Should nhưng backlog/quality muốn realtime/fallback sớm. | 03, 04, 06, 09 | Core flow không phụ thuộc realtime; refresh fallback là Must. Realtime scoped là Should nhưng nên ship trước pilot nếu quota ổn. |
| X-07 | “Minimum transfers” có thể được hiểu là optimum tuyệt đối, trong khi Algorithm dùng greedy heuristic. | 01, 03, 08 | UI/copy dùng “tối giản theo heuristic”; tài liệu giải thích invariant và giới hạn; không tuyên bố optimum tuyệt đối. |
| X-08 | `FR-EXP-03` yêu cầu percentage/shares Must nhưng vertical slice chỉ equal, dễ làm backlog hiểu là phải có ngay tuần 2. | 03, 04 | Ghi rõ Must của MVP, không Must của vertical slice; giữ exact/percentage/shares ở Phase 3. |
| X-09 | `itinerary_days` có cả `day_date` và `day_index`, cần rule khi trip date được thêm sau. | 03, 07, 08 | MVP dùng day_index; nếu thêm date, migration explicit và không tự đổi item nếu chưa có mapping. |
| X-10 | Product Brief nói 10–20 nhóm closed pilot, Roadmap nói 5–10 nhóm ở tuần 9 rồi 10–20 lũy kế. | 01, 10 | Đây không phải mâu thuẫn: tuần 9 pilot soft launch 5–10, tuần 10 đạt 10–20 lũy kế; ghi rõ trong launch checklist. |
| X-11 | RLS sample cho `expenses` cho phép payer member update, nhưng PRD nói creator có thể sửa. | 03, 07 | Thêm `created_by_member_id` vào schema hoặc quyết định creator = payer; đề xuất thêm cột creator để đúng journey. |
| X-12 | `auth.users` xuất hiện trong ERD nhưng không phải bảng app migration. | 06, 07 | Ghi chú đây là Supabase managed table; migration chỉ tạo FK tham chiếu/không alter trực tiếp ngoài policy cần thiết. |
| X-13 | Product Brief/architecture cũ dùng Next.js/Vercel, trong khi phương án triển khai mới dùng React/Vite/Cloudflare Pages. | 01, 03, 04, 06, 10 | Đã cập nhật stack mới; Next.js chỉ còn là phương án thay thế nếu sau này cần SSR/Workers runtime. |

### Các sửa cần thực hiện trước khi viết code

1. Chốt settlement close rule và payment profile strategy.
2. Bổ sung `created_by_member_id` vào `expenses` hoặc sửa policy/PRD cho thống nhất.
3. Viết data retention/recovery policy cho anonymous identity.
4. Xác nhận VietQR provider/library và bank BIN source.
5. Cập nhật schema/API contract sau các quyết định trên; coi tài liệu hiện tại là v0.1.

## 4. Câu hỏi mở gộp

### Sản phẩm và người dùng

1. Primary segment có chỉ nhóm bạn 3–10 người trong MVP hay cùng tối ưu nhóm đồng nghiệp 4–20 người?
2. Có cần co-owner không?
3. Invite preview được xem những dữ liệu nào trước join?
4. Display name trùng xử lý thế nào?
5. Có cần budget estimate trong pilot không?
6. Pilot có dùng chuyến thật và thu consent feedback/screenshot thế nào?

### Quyết toán và thanh toán

7. Trip chỉ đóng khi recipient xác nhận tất cả transfer hay owner có manual close?
8. Có cần exact optimization sau greedy không?
9. Remainder theo participant order hay member id?
10. Payer không tham gia expense có phải rule chính thức không?
11. VietQR static/dynamic và provider/BIN source nào?
12. Bank profile lưu lâu dài hay nhập mỗi lần tạo QR?
13. QR có được download/share ảnh không?

### Identity, privacy và dữ liệu

14. Anonymous recovery dựa trên Google upgrade, invite rejoin hay export code?
15. Có cần bảng profile riêng không?
16. Payment profile encryption/key management dùng cách nào?
17. Retention/hard delete bao lâu và ai chạy job?
18. Có cần receipt image storage/OCR ở MVP không?
19. Có cần snapshot breakdown trong settlement không?

### Kỹ thuật và vận hành

20. Realtime dùng Postgres Changes hay Broadcast?
21. Preview dùng project/branch database riêng hay staging namespace?
22. Offline MVP chỉ cache/draft hay cần write queue sớm?
23. Map/geocoding khi nào bắt buộc?
24. Device lab thật hay Playwright emulation đủ cho CI?
25. Ngưỡng quota/cost nào dừng acquisition?

## 5. Quyết định cần chốt trước khi code

| Mã | Quyết định | Owner đề xuất | Trạng thái |
|---|---|---|---|
| DEC-FINAL-01 | Settlement close rule | Product | Cần chốt |
| DEC-FINAL-02 | Payment profile/encryption | Architecture + Security | Cần chốt |
| DEC-FINAL-03 | `created_by_member_id` | Database | Cần chốt |
| DEC-FINAL-04 | VietQR provider/BIN source | Architecture | Cần chốt |
| DEC-FINAL-05 | Anonymous recovery/retention | Product + Privacy | Cần chốt |
| DEC-FINAL-06 | Realtime transport | Architecture | Có thể chốt sau vertical slice |
| DEC-FINAL-07 | Pilot cohort/incentive | Product | Cần chốt trước tuần 6 |

## 6. Definition of ready cho bước viết code

- [ ] Các quyết định `DEC-FINAL-01..05` đã có câu trả lời.
- [ ] PRD, UX và database dùng cùng tên field/trạng thái.
- [ ] Settlement test cases được chấp nhận, đặc biệt rounding và greedy limitation.
- [ ] RLS policy đã được chuyển thành test cases với ít nhất hai user/hai trip.
- [ ] Vertical slice `create → join → expense → balance` có story và E2E acceptance rõ.
- [ ] Không có secret/bank data thật trong repo, seed hoặc analytics design.
- [ ] Người review hiểu đây là MVP và non-goals không phải backlog bị bỏ quên.

## 7. Câu hỏi mở

Các câu hỏi mở đầy đủ được gộp tại mục 4 của tài liệu này. Những câu có ảnh hưởng trực tiếp đến schema hoặc payment phải được trả lời trước khi tạo migration production: settlement close rule, payment profile/encryption, anonymous recovery/retention và VietQR provider.

## Quyết định cần chốt

| Mã | Quyết định cuối cần ghi nhận | Tài liệu cập nhật sau khi chốt |
|---|---|---|
| DEC-FINAL-01 | Settlement close rule | `03-prd.md`, `05-ux-and-screens.md`, `07-database.md`, `09-test-plan.md` |
| DEC-FINAL-02 | Payment profile/encryption | `06-architecture.md`, `07-database.md`, `08-settlement-algorithm.md` |
| DEC-FINAL-03 | `created_by_member_id` trong expense | `03-prd.md`, `07-database.md`, RLS tests |
| DEC-FINAL-04 | VietQR provider/BIN source | `06-architecture.md`, `08-settlement-algorithm.md`, `10-roadmap-and-launch.md` |
| DEC-FINAL-05 | Anonymous recovery/retention | `01-product-brief.md`, `06-architecture.md`, `07-database.md` |
