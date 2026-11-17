# Tripmate — Test Plan và Quality Strategy

**Mục đích:** Định nghĩa cách kiểm thử chức năng, dữ liệu tiền, quyền truy cập, UX mobile và các tiêu chí release cho MVP.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** Chất lượng Tripmate tập trung vào bốn rủi ro: tính tiền sai, lộ dữ liệu cross-trip, anonymous join thất bại và trạng thái thanh toán gây hiểu nhầm. Unit test bao phủ money/settlement; integration test bao phủ RPC/RLS; Playwright kiểm tra journey thật; manual QA chạy trên iOS Safari và Android Chrome trước pilot.

## 1. Chiến lược test theo lớp

| Lớp | Công cụ gợi ý | Phạm vi | Chạy khi |
|---|---|---|---|
| Unit | Vitest/Jest | Split allocation, rounding, balance, greedy transfer, validation, copy/format VND | Mỗi PR; coverage logic tiền ≥95%. |
| Component | Testing Library | Expense sheet, poll, settlement status, accessibility state | Mỗi PR có UI thay đổi. |
| Integration | Supabase local + test client | RPC, transaction, identity merge, idempotency, error mapping | Mỗi PR ảnh hưởng DB/API. |
| RLS/security | Supabase local với nhiều user | Cross-trip isolation, owner/member/recipient policy, revoked invite | Mỗi schema/policy change; bắt buộc trước deploy. |
| E2E | Playwright | Create → join → poll → itinerary → expense → settlement | PR smoke; nightly full suite. |
| Visual/manual | iOS Safari, Android Chrome | Keyboard, bottom sheet, QR, network transition, PWA install | Mỗi release candidate. |
| Performance | Lighthouse + scripted timing | Invite preview, overview, quick add, settlement | Trước pilot và khi schema/query đổi. |
| Abuse | API test/rate-limit script | Invite guessing, payload size, duplicate submit, unauthorized mutation | Trước public launch. |

## 2. Test data và môi trường

### Dataset chuẩn

| Dataset | Nội dung | Mục đích |
|---|---|---|
| `minimal-trip` | 1 owner + 1 member, 1 invite, 1 expense | Vertical slice. |
| `full-trip` | 1 owner + 6 members + 2 virtual, 3 poll, 10 itinerary, 20 expense | E2E và UX. |
| `rounding-trip` | Amount 1/2/3/100000, equal/percentage/shares | Money invariant. |
| `settlement-trip` | Nhiều debtor/creditor, paid/confirmed/disputed | Status và transfer. |
| `security-two-trips` | User A/B, Trip A/B, membership khác nhau | RLS. |
| `stale-concurrency` | Hai client cùng edit poll/itinerary/expense | Conflict/realtime. |

Quy tắc: dataset không dùng bank account thật, không dùng tên người thật có thể nhận diện, seed deterministic và reset được.

## 3. Test case ưu tiên theo module

### Trip, join và identity

| ID | Scenario | Liên kết | Expected |
|---|---|---|---|
| TC-TRIP-01 | Create trip với tên hợp lệ | FR-TRIP-01, US-01 | Trip + owner membership tạo atomic. |
| TC-TRIP-02 | Create thiếu tên | FR-TRIP-01 | Field error; không tạo record rác. |
| TC-TRIP-03 | Mở invite active và join display name | FR-TRIP-03/04, US-04/05 | Một membership active; redirect overview. |
| TC-TRIP-04 | Redeem cùng invite hai lần cùng identity | FR-TRIP-04, BR-12 | Idempotent; không duplicate. |
| TC-TRIP-05 | Revoked/expired invite | FR-SHARE-02, BR-12 | Reject, không leak member list. |
| TC-TRIP-06 | Merge virtual member với Google identity | FR-AUTH-01, BR-09 | Merge atomic, không duplicate expense participation. |
| TC-TRIP-07 | Trip đạt member limit | DEC-PRD-07 | Message giới hạn; không insert quá limit. |

### Poll và itinerary

| ID | Scenario | Liên kết | Expected |
|---|---|---|---|
| TC-POLL-01 | Create destination/date poll ≥2 options | FR-POLL-01 | Poll open và options đúng order. |
| TC-POLL-02 | Single-choice vote rồi đổi vote | FR-POLL-02/03 | Chỉ còn lựa chọn mới. |
| TC-POLL-03 | Member vote sau lock | FR-POLL-04, BR-11 | Server reject; UI refresh locked state. |
| TC-POLL-04 | Owner lock và non-owner lock | FR-POLL-04 | Owner thành công; member denied. |
| TC-ITIN-01 | Add item date-less bằng Day 1 | FR-ITIN-01/02, BR-13 | Day index đúng, item position cuối. |
| TC-ITIN-02 | Reorder hai client stale | FR-ITIN-03, BR-10 | Một request thắng; request stale yêu cầu reload. |
| TC-ITIN-03 | Add option poll lần hai | FR-ITIN-04 | Không duplicate theo source option. |

### Expense và split

| ID | Scenario | Liên kết | Expected |
|---|---|---|---|
| TC-EXP-01 | Equal 100000 cho 3 người | FR-EXP-03/05, ROUND-04, ALG-02 | 33334/33333/33333; tổng 100000. |
| TC-EXP-02 | Exact sum thiếu/thừa | FR-EXP-03, BR-06 | Reject, nêu chênh lệch. |
| TC-EXP-03 | Percentage không bằng 100% | BR-05 | Reject trước server và server. |
| TC-EXP-04 | Shares 1:2 với 100000 | FR-EXP-03, ALG-07 | 33333/66667. |
| TC-EXP-05 | Payer không nằm trong participants | FR-EXP-02, ALG-13 | Save hợp lệ; balance tính đúng. |
| TC-EXP-06 | Không có participant/amount âm | BR-08, BR-14 | Reject. |
| TC-EXP-07 | Duplicate submit do retry | FR-REAL-02, architecture idempotency | Chỉ một expense. |
| TC-EXP-08 | Edit sau settlement marked_paid | FR-EXP-04, BR-03 | Revision + warning/dispute. |
| TC-EXP-09 | Void expense | FR-EXP-07 | Không tính settlement mới; audit giữ lại. |
| TC-EXP-10 | Draft đóng sheet và quay lại | FR-EXP-06, NFR-OFF-01 | Draft giữ đúng user/trip. |

### Settlement và VietQR

| ID | Scenario | Liên kết | Expected |
|---|---|---|---|
| TC-SET-01 | Tổng balances bằng 0 | FR-SET-01, ALG invariants | Không có rounding drift. |
| TC-SET-02 | Một debtor, hai creditor | FR-SET-02, ALG-09 | Hai transfer đúng amount. |
| TC-SET-03 | Hai debtor, hai creditor | FR-SET-02, ALG-10 | Greedy deterministic, tất cả residual 0. |
| TC-SET-04 | Tất cả balance zero | ALG-11 | No-op/completed theo rule. |
| TC-SET-05 | Mark paid bởi debtor | FR-SET-04 | Chỉ status marked_paid, chưa confirmed. |
| TC-SET-06 | Confirm bởi creditor | FR-SET-04 | Status confirmed_received + actor/time. |
| TC-SET-07 | Member khác cố confirm | DB-RLS-04 | Reject. |
| TC-SET-08 | Expense revision sau snapshot | FR-SET-07, ALG-15 | needs_recalculation, transfer cũ không biến mất. |
| TC-QR-01 | Profile đầy đủ | FR-SET-05/06, ALG-16 | QR/payload có amount/addInfo, không log secret. |
| TC-QR-02 | Thiếu bankBin/account | FR-SET-06 | Không render QR; fallback copy. |
| TC-QR-03 | Amount immutable | FR-SET-06 | QR lấy amount snapshot, không cho sửa client. |

### RLS và privacy

| ID | Scenario | Liên kết | Expected |
|---|---|---|---|
| TC-RLS-01 | User A query Trip B | DB-RLS-01, NFR-SEC-01 | Empty/denied, không leak. |
| TC-RLS-02 | Member update owner-only poll lock | DB-RLS-02 | Denied. |
| TC-RLS-03 | User A insert expense với trip_id B | FR-PRIV-01 | Denied dù client gửi role hợp lệ. |
| TC-RLS-04 | Payment profile ngoài context | DB-RLS-05 | Mask/denied. |
| TC-RLS-05 | Raw bank data xuất hiện Sentry/analytics | NFR-SEC-03 | Automated redaction test pass. |
| TC-RLS-06 | Invite token đoán tuần tự | NFR-SEC-02 | Token không enumerable; rate limit. |

## 4. E2E scenarios bắt buộc

| ID | Flow | Pass condition |
|---|---|---|
| E2E-01 | Creator tạo trip trên browser A, member join trên browser B | Hai session thấy cùng trip/members. |
| E2E-02 | Tạo poll, vote bằng 3 member, owner lock | Result/locked state nhất quán sau reload. |
| E2E-03 | Thêm itinerary item và reorder | Mobile layout giữ order sau refresh. |
| E2E-04 | Tạo 3 expense bằng equal/exact/percentage | Preview và settlement khớp expected fixtures. |
| E2E-05 | Mở settlement, copy transfer, mark paid, confirm | Timeline status đúng actor. |
| E2E-06 | QR thiếu profile và đủ profile | Fallback/QR đúng, warning hiển thị. |
| E2E-07 | Refresh khi realtime disconnect | Snapshot refetch, không duplicate. |
| E2E-08 | Anonymous upgrade Google mock/fixture | Membership không mất sau upgrade. |

## 5. Checklist QA thủ công trên thiết bị thật

### iOS Safari

- Mở invite từ Messenger/Zalo, back/forward không mất context.
- Bàn phím số không che amount/save; decimal key không tạo giá trị sai.
- Bottom sheet vuốt/đóng, focus và safe area đúng với notch.
- Share sheet/Web Share và copy link hoạt động.
- Add to Home Screen/PWA launch giữ session hợp lệ.
- Tắt mạng: badge stale, không giả success; bật lại refetch.
- QR scan bằng banking app thật nếu được phép dùng test profile; kiểm tra copy fallback.

### Android Chrome

- Join link mở đúng khi browser cold start.
- Back gesture/Android back đóng sheet/dialog đúng thứ tự.
- Numeric keyboard, autofill và long display name không phá layout.
- Realtime thay đổi từ browser khác cập nhật hoặc có refresh rõ.
- PWA install prompt/icon/launch; service worker update không xóa draft.
- Camera/QR share permission không làm app crash.

### Cả hai

- Font tiếng Việt, dấu và format `1.200.000₫`.
- Touch target ≥44px; focus visible trên keyboard.
- Contrast/status không chỉ dựa vào màu.
- Lỗi mạng, permission denied, invite hết hạn đều có hướng dẫn.
- Không hiển thị account number đầy đủ ngoài màn hình cần thiết.

## 6. Tiêu chí chấp nhận MVP

| Nhóm | Tiêu chí |
|---|---|
| Core flow | E2E-01 → E2E-05 pass trên Chrome + ít nhất một iOS/Android thật. |
| Money | Unit/integration split + settlement đạt 100% cases trong tài liệu; invariant không fail. |
| Security | TC-RLS-01..06 pass; không có cross-trip leak hoặc raw bank secret trong logs. |
| Performance | Invite/overview p95 mục tiêu <2 giây trong test dataset full-trip, không có request dài bất thường. |
| Accessibility | Keyboard/semantic label/focus/bottom sheet checklist pass; không có blocker axe ở core flow. |
| Reliability | Retry/refresh/realtime disconnect không duplicate expense hoặc transfer. |
| Privacy | Analytics event allowlist review; privacy copy và delete/recovery guidance có mặt. |
| Scope | Non-goals không xuất hiện như dependency bắt buộc; app chạy core flow trong free-tier budget. |
| Release | P0=0, P1=0 hoặc có owner/date/workaround được chấp nhận; rollback đã thử ở staging. |

## 7. Checklist trước khi ra mắt

- [ ] Production env variables và Supabase project đã kiểm tra.
- [ ] Migration backup/rollback note và seed staging đã chạy.
- [ ] RLS policy không còn `using (true)` trên private table.
- [ ] Invite token, rate limit và member/expense limits hoạt động.
- [ ] Sentry scrubber và analytics allowlist đã test.
- [ ] Privacy/terms tối thiểu và contact support hiển thị ở landing/account.
- [ ] PWA manifest/icons/service worker chạy trên iOS/Android.
- [ ] VietQR provider/danh sách bank BIN có owner cập nhật; fallback copy đã test.
- [ ] E2E smoke pass sau production deploy.
- [ ] Có runbook xử lý sai settlement, revoke invite và data deletion request.
- [ ] Pilot feedback form và event dashboard sẵn sàng.

## Câu hỏi mở

1. Dùng Playwright device emulation đủ cho CI hay bắt buộc có real-device cloud/device lab?
2. Coverage threshold cụ thể cho mọi module là bao nhiêu ngoài money logic ≥95%?
3. Có bật visual regression screenshot cho wireframe/component chính không?
4. Ai được phép dùng bank profile test và QR scan trong QA; có cần tài khoản ngân hàng sandbox không?
5. Release blocker nào cho phép workaround trong closed pilot?

## Quyết định cần chốt

| Mã | Quyết định | Đề xuất mặc định |
|---|---|---|
| DEC-TEST-01 | Test priority | Money + RLS + join là P0; visual polish không được che lấp ba rủi ro này. |
| DEC-TEST-02 | Device gate | CI emulation mỗi PR; real iOS Safari/Android Chrome trước mỗi release candidate. |
| DEC-TEST-03 | Data | Chỉ synthetic data trong test/preview; không dùng bank data thật. |
| DEC-TEST-04 | E2E | Giữ một smoke suite <5 phút và full suite nightly/RC. |
