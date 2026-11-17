# Tripmate — Product Requirements Document

**Mục đích:** Chuyển định vị và user journey thành phạm vi MVP, yêu cầu có thể kiểm thử, quy tắc nghiệp vụ và ma trận truy vết để thiết kế và triển khai.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** MVP của Tripmate cho phép một nhóm tạo trip, mời thành viên bằng link/QR, chốt điểm đến/ngày bằng poll, dựng itinerary theo ngày, ghi expense VND bằng nhiều cách chia và quyết toán bằng danh sách transfer tối giản có VietQR. Anonymous join là đường đi mặc định; authentication nâng cấp và offline write không chặn core flow.

## 1. Mục tiêu và phạm vi

### Mục tiêu MVP

| ID | Mục tiêu | Kết quả cần đạt |
|---|---|---|
| OBJ-01 | Một nhóm 3–10 người tạo được trip và cùng tham gia | Creator tạo trip trong ≤2 phút; member join bằng link trong ≤1 phút. |
| OBJ-02 | Nhóm có thể chuyển từ thảo luận sang quyết định | Có poll điểm đến/ngày, vote và trạng thái locked. |
| OBJ-03 | Nhóm có một lịch trình chung dễ xem trên điện thoại | Itinerary có ngày, thứ tự, thời gian, địa điểm và ghi chú. |
| OBJ-04 | Nhóm ghi được chi phí thật và hiểu cách chia | Expense có payer, participants, split method và breakdown. |
| OBJ-05 | Nhóm quyết toán với ít transfer và ít tranh cãi | Net balance, greedy settlement, VietQR/copy transfer message và trạng thái thanh toán. |
| OBJ-06 | Solo developer vận hành được trong free tier | Không có service bắt buộc ngoài React/Vite, Cloudflare Pages, Supabase và dịch vụ QR/map có phương án fallback; Docker chỉ dùng local/CI. |

### Phạm vi trong MVP

- PWA responsive, UI tiếng Việt, VND integer.
- Anonymous Supabase Auth cho session; Google upgrade là luồng Should.
- Trip có owner/member; member ảo là record trong trip chưa gắn identity thật.
- Invite link và QR chứa short code/redeem token có giới hạn và có thể revoke.
- Poll cho destination/date, có thể khóa bởi owner.
- Itinerary theo ngày, tạo item thủ công hoặc từ ý tưởng/poll.
- Budget estimate theo category và expense thực tế.
- Expense với split đều, amount, percentage và shares; bỏ qua participant không liên quan.
- Settlement tối giản transfer, VietQR payload nếu member cung cấp bank details; không đối soát ngân hàng.
- Realtime cho dữ liệu trip đang mở; read cache và draft an toàn khi offline.

### Ngoài phạm vi (non-goals)

| ID | Không làm trong MVP | Lý do |
|---|---|---|
| NG-01 | Booking vé, phòng, thanh toán online | Cần đối tác, pháp lý và support ngoài năng lực solo developer. |
| NG-02 | Chat riêng hoặc mạng xã hội trong trip | Messenger/Zalo đã giải quyết; Tripmate tập trung vào quyết định, kế hoạch và tiền. |
| NG-03 | OCR hóa đơn, AI itinerary, gợi ý tự động | Có giá trị nhưng chưa cần để kiểm chứng core loop. |
| NG-04 | Đa tiền tệ và tỷ giá | Tăng độ phức tạp cho expense và settlement; MVP chỉ VND. |
| NG-05 | Bank API/auto-confirm payment | Rủi ro bảo mật, phụ thuộc ngân hàng; VietQR chỉ tạo payment instruction. |
| NG-06 | Enterprise approval, VAT invoice, SSO | Không phục vụ primary segment 3–10 người. |
| NG-07 | Offline write queue hoàn chỉnh | Chỉ làm sau khi có idempotency và conflict resolution đủ tin cậy. |
| NG-08 | Notification email/push bắt buộc | MVP dùng in-app status và share message; tránh chi phí/vận hành notification. |

## 2. Vai trò và thuật ngữ nghiệp vụ

| Vai trò | Quyền chính |
|---|---|
| `owner` | Tạo trip, quản lý invite, khóa/mở poll, quản lý member ảo, sửa/xóa mọi dữ liệu nghiệp vụ theo policy, tạo/đóng settlement. |
| `member` | Xem trip sau khi join, vote, thêm itinerary item/expense, sửa/xóa dữ liệu do mình tạo trong giới hạn, đánh dấu transfer đã trả. |
| `virtual_member` | Thành viên được owner thêm thay cho người chưa join thật; có thể được merge vào identity sau này. Không tự đăng nhập hay thao tác. |
| `recipient` | Member đang nhận một transfer; đây là ngữ cảnh của transfer, không phải role riêng trong trip. |

### Trạng thái chính

| Đối tượng | Trạng thái |
|---|---|
| Trip | `active`, `settling`, `completed`, `archived` |
| Poll | `draft`, `open`, `locked`, `cancelled` |
| Invite | `active`, `revoked`, `expired` |
| Expense | `active`, `voided` |
| Transfer | `pending`, `marked_paid`, `confirmed_received`, `disputed`, `cancelled` |

## 3. Yêu cầu chức năng

Mỗi yêu cầu có acceptance criteria theo Given/When/Then. Các ID `FR-01`–`FR-12` là cam kết cấp sản phẩm trong Product Brief; ID module bên dưới là đặc tả chi tiết.

### 3.1 Trip, member và authentication

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-TRIP-01 | Creator tạo trip với tên bắt buộc, destination/date tùy chọn, timezone mặc định `Asia/Ho_Chi_Minh` và display name. | Must |
| FR-TRIP-02 | App tự tạo anonymous identity khi người dùng chưa đăng nhập; không hiển thị bước đăng ký. | Must |
| FR-TRIP-03 | Owner tạo/revoke invite link hoặc QR; invite có trạng thái và thời hạn cấu hình được. | Must |
| FR-TRIP-04 | Member join bằng invite code với display name; cùng một identity không tạo duplicate membership. | Must |
| FR-MEM-01 | Owner thêm virtual member và đặt display name; virtual member có thể được chọn trong expense/itinerary. | Must |
| FR-MEM-02 | Owner/member xem danh sách thành viên, trạng thái joined/pending, role và avatar chữ cái. | Must |
| FR-MEM-03 | Owner đổi role, deactivate member hoặc rời trip theo business rules; không xóa lịch sử tiền bằng thao tác thông thường. | Should |
| FR-AUTH-01 | Member nâng cấp anonymous identity lên Google mà giữ trip memberships, expenses và member history. | Should |
| FR-AUTH-02 | App hiển thị hướng dẫn khôi phục khi anonymous session không còn tồn tại trên thiết bị. | Should |

**Acceptance criteria tiêu biểu**

- **FR-TRIP-01:** Given người dùng đã có anonymous identity, When nhập tên trip hợp lệ và bấm “Tạo chuyến đi”, Then hệ thống tạo trip, membership owner và chuyển đến `Trip Overview`.
- **FR-TRIP-04:** Given invite còn active, When người dùng nhập display name và xác nhận join, Then tạo đúng một membership và hiển thị trip summary.
- **FR-MEM-01:** Given owner đang ở trip, When thêm virtual member với tên không rỗng, Then member xuất hiện với `virtual=true` và được chọn trong participant list.
- **FR-AUTH-01:** Given anonymous user có một hoặc nhiều trip, When OAuth Google thành công, Then `auth.users.id` mới được liên kết mà không tạo member duplicate.

### 3.2 Ý tưởng và bình chọn

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-POLL-01 | Member tạo poll loại `destination` hoặc `date`, thêm các option có label và metadata tùy chọn. | Must |
| FR-POLL-02 | Member vote/unvote hoặc đổi vote trước khi poll locked; app cho biết current user đã chọn gì. | Must |
| FR-POLL-03 | Poll hỗ trợ một lựa chọn hoặc nhiều lựa chọn; loại poll phải rõ trên UI. | Must |
| FR-POLL-04 | Owner khóa poll, lưu winning option/selected options và hiển thị timestamp/người khóa. | Must |
| FR-POLL-05 | Owner mở lại poll chỉ khi chưa có settlement ảnh hưởng; mọi thay đổi lock/unlock có audit event. | Should |
| FR-POLL-06 | Poll có empty/loading/error state và deep link chia sẻ tới đúng poll. | Must |

**Acceptance criteria**

- **FR-POLL-01:** Given member thuộc trip, When tạo poll có title, type và ≥2 options, Then poll ở trạng thái `open` và tất cả member có thể xem.
- **FR-POLL-02:** Given poll `open`, When Minh chọn option A, Then vote của Minh được lưu; When Minh chọn option B, Then lựa chọn trước được thay thế nếu poll single-choice.
- **FR-POLL-04:** Given owner xác nhận khóa, When poll được khóa, Then không member nào được sửa vote; overview hiển thị kết quả và trạng thái `Đã chốt`.

### 3.3 Lịch trình

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-ITIN-01 | Tạo itinerary day trong date range của trip hoặc day index nếu trip chưa có ngày. | Must |
| FR-ITIN-02 | Tạo item với title, start/end time tùy chọn, location, note, category và source poll/idea tùy chọn. | Must |
| FR-ITIN-03 | Reorder item trong cùng ngày bằng drag/drop và có nút tăng/giảm thứ tự cho accessibility. | Must |
| FR-ITIN-04 | Copy selected poll option thành itinerary item; không tạo duplicate nếu đã liên kết cùng source. | Should |
| FR-ITIN-05 | Member sửa item do mình tạo; owner sửa/xóa mọi item; thay đổi hiển thị last updated. | Must |
| FR-ITIN-06 | Xem itinerary theo tab ngày và có quick view “Hôm nay/tiếp theo”. | Must |

**Acceptance criteria**

- **FR-ITIN-02:** Given một day hợp lệ, When member lưu item có title, Then item hiển thị đúng ngày và thứ tự cuối.
- **FR-ITIN-03:** Given hai item trong cùng ngày, When owner kéo item B lên trước A và save, Then thứ tự mới tồn tại sau reload và được phát realtime cho member khác.
- **FR-ITIN-04:** Given option đã có source poll, When owner bấm “Thêm vào lịch”, Then item giữ `source_poll_option_id` và action lần hai không tạo duplicate.

### 3.4 Budget và expense

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-BUDGET-01 | Owner/member tạo budget estimate theo category, amount VND integer và participant scope tùy chọn. | Should |
| FR-BUDGET-02 | Overview so sánh estimate với actual expense theo category; không trộn estimate vào số nợ thực tế. | Should |
| FR-EXP-01 | Tạo expense với title, amount `bigint` VND >0, payer, category, incurred_at, note tùy chọn. | Must |
| FR-EXP-02 | Chọn participant là member active hoặc virtual member; mặc định tất cả member active nhưng cho phép bỏ chọn. | Must |
| FR-EXP-03 | Hỗ trợ split `equal`, `exact`, `percentage`, `shares`; preview phải khớp tổng amount trước save. | Must |
| FR-EXP-04 | Sửa/xóa expense theo quyền; expense ảnh hưởng transfer đã trả phải tạo warning và settlement revision. | Must |
| FR-EXP-05 | Hiển thị breakdown từng participant và rounding remainder từng đồng. | Must |
| FR-EXP-06 | Quick add dùng numeric keyboard, payer mặc định current member và giữ draft khi form bị đóng ngoài ý muốn. | Must |
| FR-EXP-07 | Owner có thể void expense nhưng không xóa cứng khỏi lịch sử; void không tính vào settlement mới. | Should |

**Acceptance criteria**

- **FR-EXP-01:** Given member thuộc trip, When nhập amount `100000` và payer hợp lệ, Then lưu expense với currency `VND` và không có decimal.
- **FR-EXP-03:** Given amount 100000 và 3 participant equal, When mở preview, Then các phần là 33,334; 33,333; 33,333 theo deterministic remainder rule và tổng bằng 100000.
- **FR-EXP-04:** Given expense đã góp vào transfer `marked_paid`, When owner sửa participant, Then app không âm thầm cập nhật trạng thái; hiển thị cảnh báo settlement cần review và ghi revision.

### 3.5 Settlement và VietQR

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-SET-01 | Tính gross paid, fair share và net balance theo active expense; tổng net balance phải bằng 0. | Must |
| FR-SET-02 | Sinh transfer từ debtor → creditor với số lần thấp theo greedy heuristic deterministic. | Must |
| FR-SET-03 | Cho phép mở breakdown từ member balance đến expense contribution. | Must |
| FR-SET-04 | Transfer có trạng thái pending/marked_paid/confirmed_received/disputed/cancelled và actor/timestamp. | Must |
| FR-SET-05 | Recipient nhập bank details tùy chọn; chỉ recipient và người có quyền xem settlement được đọc dữ liệu cần thiết. | Must |
| FR-SET-06 | Tạo VietQR payload/image hoặc fallback copy bank details; QR không xác nhận giao dịch. | Must |
| FR-SET-07 | Owner mở settlement snapshot; expense revision sau snapshot đánh dấu “Cần tính lại”. | Must |
| FR-SET-08 | Owner đóng trip khi settlement thỏa rule đã chốt; lịch sử settlement vẫn read-only. | Should |

**Acceptance criteria**

- **FR-SET-01:** Given tổng paid và fair share hợp lệ, When tính balances, Then mỗi member có net balance VND integer và tổng bằng 0.
- **FR-SET-02:** Given A cần trả 100000, B cần nhận 60000, C cần nhận 40000, When generate transfers, Then tạo A→B 60000 và A→C 40000.
- **FR-SET-04:** Given transfer pending, When debtor bấm “Tôi đã chuyển”, Then trạng thái thành `marked_paid`; recipient mới có thể chuyển thành `confirmed_received`.
- **FR-SET-06:** Given recipient có bankBin/accountNumber/accountName hợp lệ, When bấm “Hiện VietQR”, Then payload chứa amount, addInfo và beneficiary data; không ghi secret vào analytics.

### 3.6 Realtime, share và dữ liệu an toàn

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-REAL-01 | Trip Overview, Poll, Itinerary và Settlement nhận thay đổi realtime khi tab đang active. | Should |
| FR-REAL-02 | Khi reconnect, client refetch snapshot và hiển thị last synced time; không tự ghi draft cũ đè dữ liệu mới. | Must |
| FR-SHARE-01 | Share link deep-link tới trip/poll/settlement mà không đưa raw database ID vào nội dung hiển thị nếu có thể. | Must |
| FR-SHARE-02 | Owner revoke invite; link cũ không thể join sau revoke. | Must |
| FR-PRIV-01 | Server/RLS kiểm tra membership cho mọi read/write; client hide UI không được coi là security control. | Must |

## 4. Yêu cầu phi chức năng

| ID | Nhóm | Yêu cầu đo được |
|---|---|---|
| NFR-PERF-01 | Performance | p95 load trip overview <2 giây trong 4G ổn định với trip ≤10 member, ≤100 expense, ≤100 itinerary item. |
| NFR-PERF-02 | Performance | Quick add phản hồi UI trong <100ms khi client validate local; save có loading state và timeout rõ. |
| NFR-SEC-01 | Security | RLS deny-by-default; cross-trip read/write test phải fail với HTTP/API error phù hợp. |
| NFR-SEC-02 | Security | Invite token không tuần tự đoán được, rate limit join, revoke được và không expose membership list trước join. |
| NFR-SEC-03 | Security | Không log raw accountNumber, bank payload, expense note hoặc display name vào analytics ngoài dữ liệu cần thiết. |
| NFR-SEC-04 | Security | Supabase client/session và RPC/Edge Function dùng cấu hình an toàn; mutation validate schema bằng Zod hoặc tương đương, không tin input client. |
| NFR-PRIV-01 | Privacy | Cho phép người dùng xem dữ liệu đang lưu, rời trip và yêu cầu xóa dữ liệu theo policy; soft delete không đồng nghĩa giữ vô hạn. |
| NFR-REL-01 | Reliability | Khi realtime lỗi, app vẫn cho đọc snapshot và có nút refresh; không hiển thị trạng thái “đã lưu” trước khi server xác nhận. |
| NFR-OFF-01 | Offline | Read cache hiển thị badge offline/stale; draft expense không tự submit nếu chưa có mạng. |
| NFR-A11Y-01 | Accessibility | Keyboard navigation, focus visible, semantic labels, contrast đạt WCAG 2.1 AA cho luồng chính; không dùng màu là tín hiệu duy nhất. |
| NFR-A11Y-02 | Accessibility | Drag/drop itinerary có nút thay thế; bottom sheet có focus trap và đóng bằng Escape/back. |
| NFR-SEO-01 | SEO | Landing và invite preview có title/description/share metadata; dữ liệu private trip không index. |
| NFR-COMP-01 | Compatibility | Hỗ trợ hai phiên bản gần nhất của iOS Safari/Android Chrome và desktop Chrome/Edge/Safari hiện hành. |
| NFR-COMP-02 | PWA | Có manifest, service worker, installable shell và icon; update SW không làm mất draft. |
| NFR-COST-01 | Cost | Có quota alert cho Supabase/Cloudflare; không dùng realtime subscription toàn database; pagination cho collection lớn. |
| NFR-OBS-01 | Observability | Error có correlation id; Sentry/log không chứa secret, account number hoặc raw invite token. |

## 5. Quy tắc nghiệp vụ và edge cases

| ID | Quy tắc/edge case | Hành vi bắt buộc |
|---|---|---|
| BR-01 | Người rời nhóm khi còn nợ | Không xóa member/expense; owner phải chọn chuyển balance sang member khác, giữ member inactive hoặc đóng settlement thủ công. |
| BR-02 | Member rời nhóm khi đang là payer/creditor | Không cho deactivate nếu còn transfer pending trừ khi owner xác nhận phương án thay thế; lịch sử vẫn giữ payer cũ. |
| BR-03 | Sửa expense sau khi đã quyết toán | Tạo settlement revision; các transfer bị ảnh hưởng chuyển `disputed` hoặc `needs_review`, không tự coi đã trả là hợp lệ. |
| BR-04 | Chia 100000₫ cho 3 người | Tất cả phần là integer; remainder 1₫ phân bổ theo thứ tự participant ổn định, tổng luôn 100000₫. |
| BR-05 | Percentage không cộng 100% | Không cho save; hiển thị phần thiếu/thừa và số tiền preview. |
| BR-06 | Exact split không bằng amount | Không cho save; hiển thị chênh lệch cần sửa. |
| BR-07 | Shares bằng 0 hoặc âm | Không tính member shares bằng 0; reject âm; nếu tất cả bằng 0 thì reject toàn bộ. |
| BR-08 | Không có participant | Reject expense; payer không tự động là participant nếu người đó không được chọn. |
| BR-09 | Virtual member đăng nhập thật | Merge khi owner/member xác nhận matching; không tạo duplicate share hoặc duplicate expense participation. |
| BR-10 | Hai người cùng edit một item | Optimistic update phải kiểm tra `updated_at/version`; conflict hiển thị reload/choose, không last-write-silently. |
| BR-11 | Poll locked bị vote | Reject server-side; client refresh trạng thái mới. |
| BR-12 | Invite bị revoke/expire | Join fail với message và đường dẫn liên hệ owner; không tiết lộ code mới. |
| BR-13 | Trip chưa có date | Cho phép day index (`Day 1`) trong MVP; khi thêm date phải migrate mapping rõ. |
| BR-14 | Amount vượt giới hạn | Reject số âm, zero, quá `BIGINT` an toàn ở client/server; MVP giới hạn một expense ≤10 tỷ VND để tránh lỗi nhập. |
| BR-15 | Làm tròn settlement | Sử dụng integer arithmetic; nếu dữ liệu không cân bằng do rounding, phân bổ remainder deterministic và assert tổng net=0. |
| BR-16 | VietQR thiếu bank details | Không render QR giả; cho phép copy transfer message và yêu cầu recipient bổ sung thông tin. |
| BR-17 | Người dùng mở tab cũ | Hiển thị stale/conflict; mutation phải gửi version hoặc refetch trước khi commit. |
| BR-18 | Xóa trip | MVP soft delete owner-only; không xóa cứng ngay nếu còn settlement/audit; data retention phải có policy riêng. |

## 6. Ma trận truy vết yêu cầu ↔ persona ↔ màn hình

Mã màn hình dùng trong ma trận sẽ được đặc tả đầy đủ ở [UX và Screens](./05-ux-and-screens.md).

| Yêu cầu | Persona chính/phụ | Màn hình liên quan |
|---|---|---|
| FR-TRIP-01, FR-TRIP-02 | Linh / Minh | `SCR-HOME`, `SCR-CREATE`, `SCR-JOIN` |
| FR-TRIP-03, FR-SHARE-01, FR-SHARE-02 | Linh / Minh | `SCR-INVITE`, `SCR-MEMBERS` |
| FR-MEM-01, FR-MEM-02, FR-MEM-03 | Linh / Huyền | `SCR-MEMBERS`, `SCR-TRIP-SETTINGS` |
| FR-AUTH-01, FR-AUTH-02 | Linh / Huyền | `SCR-ACCOUNT`, `SCR-RECOVERY` |
| FR-POLL-01..06 | Linh / Minh | `SCR-OVERVIEW`, `SCR-POLL`, `SCR-POLL-RESULT` |
| FR-ITIN-01..06 | Linh / Minh | `SCR-ITINERARY`, `SCR-ITINERARY-ITEM` |
| FR-BUDGET-01..02 | Linh / Huyền | `SCR-BUDGET`, `SCR-OVERVIEW` |
| FR-EXP-01..07 | Huyền / Minh / Linh | `SCR-EXPENSE-SHEET`, `SCR-EXPENSE-DETAIL`, `SCR-EXPENSE-LIST` |
| FR-SET-01..08 | Huyền / Linh / Minh | `SCR-SETTLEMENT`, `SCR-TRANSFER`, `SCR-VIETQR` |
| FR-REAL-01..02 | Cả ba persona | Tất cả màn hình trip có dữ liệu realtime |
| NFR-SEC-01..04, NFR-PRIV-01 | Cả ba persona | Toàn bộ flow; đặc biệt `SCR-JOIN`, `SCR-VIETQR`, `SCR-ACCOUNT` |
| NFR-OFF-01, NFR-COMP-01..02 | Minh / Huyền | `SCR-OVERVIEW`, `SCR-ITINERARY`, `SCR-EXPENSE-SHEET` |

## 7. Câu hỏi mở

1. Có chốt `owner` là người duy nhất được lock poll và close settlement hay thêm `co-owner` trong MVP?
2. Member có được xóa expense do mình tạo sau khi settlement snapshot đã mở không, hay chỉ được void?
3. Có cần budget estimate trong MVP thật sự, hay đưa xuống Should để rút ngắn vertical slice?
4. Ranh giới một trip là theo `date range` hay cho phép chuyến không có ngày và chỉ dùng `Day 1/Day 2`?
5. “Confirm received” do recipient thực hiện hay owner cũng được thực hiện thay?
6. Có cần cho phép một transfer gộp nhiều debtor cùng nhận vào một account không, hay mỗi transfer luôn map 1 debtor → 1 recipient?
7. Có cần giới hạn tối đa số poll/expense/member để bảo vệ free tier ngay ở UI hay chỉ rate limit ở API?
8. Chính sách retention của trip hoàn tất là bao lâu trước khi ẩn/archive hoặc xóa dữ liệu?

## Quyết định cần chốt

| Mã | Quyết định | Đề xuất mặc định |
|---|---|---|
| DEC-PRD-01 | Quyền MVP | Chỉ `owner` và `member`; không có co-owner. |
| DEC-PRD-02 | Expense history | Cho edit/void trong quyền; expense đã ảnh hưởng transfer thì chỉ void hoặc tạo revision, không hard delete. |
| DEC-PRD-03 | Budget | Giữ budget estimate ở Should; không chặn expense/settlement. |
| DEC-PRD-04 | Trip không có date | Cho phép `Day 1`/day index; date là optional ở create. |
| DEC-PRD-05 | Transfer mapping | Mỗi transfer có đúng một debtor và một creditor; tối ưu số cặp bằng heuristic greedy. |
| DEC-PRD-06 | Confirmation | Debtor đánh dấu `marked_paid`; creditor/recipient xác nhận `confirmed_received`; owner không tự xác nhận thay mặc định. |
| DEC-PRD-07 | Quota guardrail | MVP giới hạn 10 member, 20 poll, 200 itinerary item và 500 expense/trip; hiển thị message khi đạt giới hạn. |
| DEC-PRD-08 | Delete | Soft delete nghiệp vụ; hard delete chỉ qua data retention/admin flow sau khi chốt policy riêng tư. |
