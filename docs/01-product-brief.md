# Tripmate — Product Brief

**Mục đích:** Chốt vấn đề, người dùng mục tiêu, định vị, phạm vi giá trị và các giả định kinh doanh ban đầu của Tripmate trước khi viết PRD và code.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** Tripmate là web app mobile-first dạng PWA, miễn phí, dành cho nhóm bạn tại Việt Nam. App giúp nhóm đi từ “đang bàn trong chat” đến một chuyến đi có lịch trình, dự toán, chi tiêu thực tế và quyết toán nợ rõ ràng, với số lần chuyển khoản tối thiểu và VietQR.

## 1. Bối cảnh và định vị

Một chuyến đi nhóm thường thất bại ở ba điểm: nhóm không chốt được nơi/ngày, kế hoạch bị phân tán trong nhiều tin nhắn, và tiền bạc trở thành việc phải “nhớ rồi tính sau”. Tripmate gom ba việc đó vào một không gian nhẹ, không yêu cầu cài app hay tạo tài khoản trước.

### Giá trị cốt lõi

> Tripmate giúp nhóm bạn chốt kèo nhanh, đi đúng kế hoạch và chia tiền công bằng mà không biến chuyến đi thành một dự án hành chính.

### Nguyên tắc sản phẩm

| ID | Nguyên tắc | Hệ quả thiết kế/ưu tiên |
|---|---|---|
| PRP-01 | Vào được trước, đăng nhập sau | Người nhận link có thể tham gia bằng display name; chỉ yêu cầu nâng cấp tài khoản khi cần giữ dữ liệu lâu dài hoặc đổi thiết bị. |
| PRP-02 | Mọi thao tác nhóm phải dễ chia sẻ | Trip, poll và lời mời phải có link/QR; kết quả có thể đọc được ngay trong trình duyệt di động. |
| PRP-03 | Tiền phải minh bạch | Mỗi khoản chi có người trả, người chịu phần và cách chia; không ẩn công thức sau một con số tổng. |
| PRP-04 | Ít nhập liệu nhưng không mơ hồ | Mặc định hợp lý, nút thêm chi tiêu nhanh, nhưng luôn cho phép xem và sửa chi tiết. |
| PRP-05 | Miễn phí không đánh đổi niềm tin | Không bán dữ liệu thành viên, không ép quảng cáo chen vào luồng lập kế hoạch/quyết toán. |
| PRP-06 | Solo developer phải vận hành được | MVP chỉ dùng các dịch vụ free tier và các luồng có thể debug bằng log, migration và test tự động. |

## 1.1. Định hướng kỹ thuật và triển khai

| Thành phần | Quyết định MVP | Vai trò |
|---|---|---|
| Frontend | React + Vite + TypeScript | PWA mobile-first, build static assets nhanh và dễ deploy trên Cloudflare Pages. |
| UI | Tailwind CSS + shadcn/ui | Component nhất quán, responsive và có accessibility baseline. |
| Backend/data | Supabase Auth + Postgres + RLS + Realtime + RPC | Anonymous auth, dữ liệu relational, quyền truy cập và settlement transaction. |
| Hosting | Cloudflare Pages Free | CDN/static hosting, Git preview và production deploy. |
| Docker | Dockerfile + Docker Compose cho local/CI | Reproducible build/test; không dùng Docker container runtime trên Cloudflare Free. |
| Optional server | Supabase Edge Functions hoặc Cloudflare Workers | Chỉ thêm khi mutation/QR cần server-side secret hoặc logic không phù hợp browser. |

Tripmate không cần SSR cho private app ở MVP; dữ liệu được đọc qua Supabase với RLS. Nếu sau này cần SSR hoặc chạy Docker production, đó là một quyết định kiến trúc mới, không phải dependency của MVP.

## 2. Vấn đề và nỗi đau người dùng

| ID | Nỗi đau | Tình huống thực tế | Hậu quả |
|---|---|---|---|
| PAIN-01 | Không chốt được điểm đến và ngày đi | Nhóm 6 người có 3 ý tưởng; mỗi người trả lời một thời điểm trong Messenger, sau hai ngày vẫn không biết phương án nào được chọn. | Mất động lực, người tổ chức phải nhắn riêng từng người và tự quyết thay cả nhóm. |
| PAIN-02 | Thông tin kế hoạch bị phân mảnh | Vé xe ở một tin nhắn, địa chỉ homestay trong ảnh chụp, lịch trình trong Google Sheet, còn giờ tập trung trong chat. | Thành viên xem nhầm phiên bản hoặc không tìm được thông tin khi đang ở ngoài đường. |
| PAIN-03 | Người tổ chức gánh việc tổng hợp | Một người copy tên, ngày, địa điểm và danh sách việc từ chat sang spreadsheet; mỗi thay đổi phải sửa nhiều nơi. | Chi phí phối hợp cao; người tổ chức dễ bỏ cuộc hoặc áp đặt quyết định. |
| PAIN-04 | Ngại ghi và nhắc tiền | Một bạn trả 1.200.000₫ tiền xe, bạn khác trả 850.000₫ tiền phòng; mọi người ngại nói “bạn chuyển mình bao nhiêu?”. | Chi phí chưa được ghi đầy đủ, nợ bị nhớ sai và dễ gây khó xử sau chuyến đi. |
| PAIN-05 | Cách chia tiền không đồng đều | Hóa đơn 600.000₫ có 3 người ăn đủ, 2 người chỉ uống nước; chia đều khiến một số người thấy không công bằng. | Phải tự tính thủ công; số lẻ và các khoản miễn/không tham gia dễ gây tranh cãi. |
| PAIN-06 | Quyết toán tạo quá nhiều giao dịch | 8 người cùng chi các khoản nhỏ; nếu ai cũng chuyển trực tiếp cho từng người đã trả tiền thì phát sinh hàng chục giao dịch. | Mất phí/thời gian, khó theo dõi ai đã trả, ai còn thiếu. |
| PAIN-07 | Công cụ hiện có quá nặng hoặc không đúng ngữ cảnh | Splitwise mạnh về expense nhưng thiếu luồng chốt điểm đến/lịch trình; Wanderlog/TripIt thiên về itinerary; spreadsheet linh hoạt nhưng không có quyền và realtime. | Nhóm phải ghép nhiều công cụ, làm tăng ma sát tham gia. |
| PAIN-08 | Rào cản cài đặt và tài khoản | Một thành viên chỉ muốn tham gia chuyến đi cuối tuần, không muốn cài thêm app hoặc xác minh email. | Người tổ chức phải nhập hộ dữ liệu hoặc thành viên bị đứng ngoài. |

## 3. Đối tượng người dùng

### Đối tượng chính

| Nhóm | Quy mô điển hình | Bối cảnh | Nhu cầu chính |
|---|---:|---|---|
| Nhóm bạn | 3–10 người | Du lịch cuối tuần, đi biển, trekking, road trip | Chốt kèo nhanh, thống nhất lịch, ghi tiền không ngại. |
| Nhóm đồng nghiệp | 4–20 người | Team outing, company trip nhỏ, ăn uống nhiều đợt | Phân quyền đơn giản, theo dõi người tham gia, quyết toán rõ. |

### Đối tượng phụ

| Nhóm | Bối cảnh | Nhu cầu/giới hạn |
|---|---|---|
| Gia đình | 3–8 người, nhiều thế hệ | Giao diện dễ hiểu; có thể thêm thành viên không dùng công nghệ thường xuyên; chia theo hộ hoặc cá nhân. |
| Người được mời nhưng ít tương tác | Không muốn tham gia thảo luận dài | Xem tóm tắt, vote một chạm, ghi nhận mình có/không tham gia khoản chi. |
| Người quản lý chi phí | Thường là người trả tiền trước | Nhập nhanh, xem số dư, tạo nội dung chuyển khoản và theo dõi đã trả. |

### Không phải đối tượng ưu tiên của MVP

- Doanh nghiệp cần approval workflow, hóa đơn VAT, ngân sách phòng ban hoặc audit log cấp doanh nghiệp.
- Công ty lữ hành cần quản lý tour, booking và khách hàng.
- Người dùng đi một mình hoặc cần quản lý tài chính cá nhân dài hạn.
- Nhóm quốc tế cần đa tiền tệ, timezone và đa ngôn ngữ ngay từ phiên bản đầu.

## 4. Phân tích đối thủ và giải pháp thay thế

Đánh giá dưới đây tập trung vào việc một nhóm bạn Việt Nam cần chuẩn bị và quyết toán một chuyến đi. Đây là phân tích định hướng sản phẩm, không phải tuyên bố đầy đủ về mọi tính năng hiện tại của từng dịch vụ.

### Bảng so sánh tính năng

| Giải pháp | Chốt điểm đến/ngày | Itinerary theo ngày | Ghi chi tiêu & chia tiền | Tối giản nợ | VietQR/ngữ cảnh Việt Nam | Vào nhóm không cần cài app | Điểm mạnh | Điểm yếu/khoảng trống |
|---|---|---|---|---|---|---|---|---|
| **Tripmate** | **Có: poll và khóa lựa chọn** | **Có: MVP** | **Có: MVP** | **Có: MVP** | **Có: nội dung chuyển khoản + QR** | **Có: PWA + anonymous join** | Một luồng liền mạch, local-first cho VND và nhóm bạn | Sản phẩm mới; chưa có hệ sinh thái booking/map sâu |
| Splitwise | Hạn chế; không phải trọng tâm | Không phải trọng tâm | Mạnh, nhiều cách chia | Mạnh | Không tối ưu riêng cho VietQR/VND | Có web/app nhưng trải nghiệm phụ thuộc tài khoản/luồng sản phẩm | Expense sharing lâu đời, mô hình số dư rõ | Không giải quyết từ ý tưởng đến lịch trình; một số tính năng nâng cao có thể phụ thuộc gói trả phí |
| Tricount | Không phải trọng tâm | Không | Mạnh cho nhóm nhỏ và nhập nhanh | Có | Không phải trọng tâm | Tương đối phù hợp cho chia bill | Đơn giản, dễ bắt đầu | Thiếu poll điểm đến/ngày và kế hoạch theo ngày |
| Wanderlog | Có ở mức lập kế hoạch | Mạnh | Có nhưng không phải trọng tâm quyết toán nhóm | Không phải điểm mạnh | Không ưu tiên VietQR | Có web/app | Itinerary, địa điểm và bản đồ trực quan | Luồng expense/settlement không phải trung tâm; có thể quá nhiều cho chuyến ngắn |
| TripIt | Không | Mạnh về tổng hợp booking | Không phải trọng tâm | Không | Không | Có web/app | Quản lý reservation và lịch trình cá nhân | Không tối ưu cho đồng quyết định, chi tiêu chung và nhóm bạn tự tổ chức |
| Messenger + Excel/Google Sheets | Có qua chat, thủ công | Có nếu tự làm | Có nhưng tự tính | Không tự động | Có thể dán QR nhưng không theo dõi trạng thái | Rất dễ tiếp cận | Không cần học công cụ mới; mọi người đã dùng | Dữ liệu phân mảnh, quyền chỉnh sửa khó kiểm soát, không realtime có cấu trúc, lỗi công thức và thiếu audit |

### Khoảng trống thị trường

1. **Khoảng trống theo luồng:** các công cụ thường tối ưu một đoạn (itinerary hoặc expense), trong khi nhóm bạn cần một luồng liên tục: đề xuất → vote → chốt → lên lịch → chi tiền → quyết toán.
2. **Khoảng trống về ma sát tham gia:** thành viên chỉ cần display name và link để tham gia một chuyến đi ngắn; không nên bị chặn bởi app install hoặc onboarding dài.
3. **Khoảng trống bản địa hóa thanh toán:** VND nguyên số, tên ngân hàng, nội dung chuyển khoản và VietQR cần được coi là một phần của settlement chứ không phải ghi chú ngoài hệ thống.
4. **Khoảng trống về tính công bằng có thể giải thích:** nhóm cần thấy khoản nào được chia đều, theo phần hay theo người tham gia; một con số nợ cuối cùng không đủ tạo niềm tin.
5. **Khoảng trống về nhóm nhỏ:** nhóm 3–10 người cần workflow nhanh hơn spreadsheet nhưng không cần bộ tính năng của một nền tảng travel hoặc expense enterprise.

## 5. Điểm khác biệt của Tripmate

| ID | Khác biệt | Vì sao có giá trị | Cách kiểm chứng trong MVP |
|---|---|---|---|
| DIF-01 | Một workspace cho cả quyết định, lịch trình và tiền | Giảm việc copy dữ liệu giữa chat, sheet và app khác | Một trip hoàn chỉnh có poll, itinerary, expense và settlement trong cùng URL. |
| DIF-02 | Join bằng link/QR với display name | Tăng tỷ lệ người được mời thực sự tham gia | Đo tỷ lệ invite link mở → hoàn tất join. |
| DIF-03 | “Chốt kèo” là trạng thái rõ ràng | Tránh lịch trình tiếp tục thay đổi sau khi đã thống nhất | Có action khóa poll/ngày/điểm đến và hiển thị trạng thái đã chốt. |
| DIF-04 | Settlement tối giản giao dịch | Giảm số lần chuyển khoản và công sức đối chiếu | So sánh số transfer trước/sau tối giản; mỗi transfer có trạng thái đã trả. |
| DIF-05 | VietQR và VND là mặc định | Phù hợp hành vi thanh toán phổ biến tại Việt Nam | Sinh được nội dung/QR cho từng khoản phải trả; không dùng số thập phân. |
| DIF-06 | Giao diện mobile-first, nhập chi tiêu trong vài giây | Ghi đúng lúc phát sinh thay vì nhớ đến cuối chuyến | Theo dõi thời gian từ mở form đến lưu expense trong test người dùng. |

## 6. Mục tiêu và chỉ số thành công trong 3 tháng đầu

### Mục tiêu sản phẩm

| ID | Mục tiêu | Kết quả kỳ vọng sau 3 tháng |
|---|---|---|
| GOAL-01 | Chứng minh nhóm bạn có thể tổ chức chuyến đi bằng một công cụ duy nhất | Ít nhất 100 nhóm tạo trip; ít nhất 40 nhóm có itinerary hoặc poll đã chốt. |
| GOAL-02 | Chứng minh lời mời có thể lan truyền tự nhiên | Tỷ lệ link được mời → người hoàn tất join đạt tối thiểu 60%. |
| GOAL-03 | Chứng minh tính năng tiền giải quyết nỗi đau thật | Ít nhất 30 chuyến có từ 3 expense trở lên; ít nhất 20 chuyến hoàn tất settlement. |
| GOAL-04 | Giữ trải nghiệm đủ đơn giản cho người dùng không kỹ thuật | Ít nhất 80% người test kín hoàn tất join và thêm một expense mà không cần hướng dẫn trực tiếp. |
| GOAL-05 | Vận hành trong phạm vi solo developer | Chi phí dịch vụ cốt lõi bằng 0 hoặc trong free tier; không có lỗi P0 chưa xử lý ở bản public MVP. |

### KPI định nghĩa cụ thể

| KPI | Công thức | Mục tiêu tháng 1 | Mục tiêu tháng 3 | Ghi chú đo lường |
|---|---|---:|---:|---|
| Nhóm tạo trip | Số trip mới có tên và người tạo hợp lệ | 20 | 100 lũy kế | Không tính trip test nội bộ. |
| Invite join rate | Thành viên hoàn tất join / số lượt mở invite link | 50% | 60% | Theo trip, báo cáo median và phân vị; không lưu nội dung link thô nếu không cần. |
| Activation rate | Trip có ít nhất 1 poll hoặc 1 itinerary item hoặc 1 expense / trip tạo | 40% | 65% | Dùng để phát hiện onboarding quá khó. |
| Expense adoption | Trip có ≥3 expense / trip đã active | 30% | 50% | ≥3 giúp phân biệt dùng thử với nhu cầu thật. |
| Settlement completion | Trip đã đánh dấu hoàn tất settlement / trip có số dư khác 0 | 30% | 50% | “Hoàn tất” cần toàn bộ transfer được đánh dấu đã trả hoặc nhóm chọn đóng sổ. |
| Time to first value | Thời gian từ join đến vote/expense đầu tiên | ≤5 phút | ≤3 phút | Đo trên cohort test kín; không đặt mục tiêu tuyệt đối cho mọi người dùng. |
| Retention theo trip | Người tạo quay lại mở trip trong 7 ngày / người tạo trip | 25% | 35% | Chỉ là chỉ báo sớm, không coi là product-market fit. |
| Reliability | Tỷ lệ request không lỗi 5xx | ≥99% | ≥99.5% | Đo theo server logs/Sentry, loại trừ sự cố của bên thứ ba nếu đã ghi nhận. |
| Feedback usefulness | Feedback có hành động cụ thể / tổng feedback hợp lệ | ≥60% | ≥70% | Dùng để ưu tiên backlog, không phải vanity metric. |

### Guardrail metrics

- Không có incident làm lộ dữ liệu của trip này sang trip khác.
- Tỷ lệ báo cáo “không biết ai có thể xem khoản chi” dưới 5% trong test kín.
- Tỷ lệ expense bị sửa/xóa trong 24 giờ đầu không vượt 25%; nếu cao, form nhập đang gây hiểu nhầm.
- Không chèn quảng cáo vào màn hình join, thêm expense hoặc settlement trong giai đoạn MVP.

## 7. Mô hình bền vững khi app miễn phí

Tripmate chưa cần kiếm tiền trong MVP. Mục tiêu trước mắt là chứng minh retention theo trip và chi phí vận hành. Các phương án sau chỉ được triển khai khi không phá vỡ niềm tin và tốc độ sử dụng.

| Phương án | Thời điểm phù hợp | Cách triển khai nhẹ | Rủi ro | Nguyên tắc bảo vệ trải nghiệm |
|---|---|---|---|---|
| Affiliate travel | Sau khi có dữ liệu nhu cầu đủ lớn và nội dung rõ ràng | Hiển thị gợi ý chỗ ở/hoạt động liên quan đến điểm đã chốt, gắn nhãn tài trợ/affiliate | Làm người dùng nghi ngờ app ưu tiên nơi có hoa hồng | Không thay đổi kết quả vote; không hiển thị trước khi nhóm chốt hoặc khi chưa có ngữ cảnh. |
| Đối tác địa phương | Sau pilot ở một vài địa điểm | Mã ưu đãi cho dịch vụ phù hợp nhóm nhỏ | Khó kiểm soát chất lượng | Chỉ hợp tác với đối tác có điều khoản rõ, không bán dữ liệu thành viên. |
| Quảng cáo nhẹ | Chỉ cân nhắc khi DAU và chi phí tăng | Một vị trí tĩnh ở trang tổng quan, không dùng quảng cáo theo dữ liệu nhạy cảm | Làm app mất cảm giác tối giản | Không quảng cáo trong luồng thanh toán/quyết toán; frequency cap; có thể đóng. |
| Donate/tip jar | Có thể thử sớm với nhóm yêu thích sản phẩm | Nút ủng hộ không gây áp lực | Doanh thu thấp, tạo thêm payment flow | Không khóa tính năng; hiển thị thưa và minh bạch. |
| Gói hỗ trợ nhóm lớn | Sau khi xác định nhu cầu thật | Dung lượng/lưu trữ/retention dài hơn hoặc export nâng cao | Làm rối định vị “free” | Core workflow vẫn miễn phí; chỉ thu phí chi phí hạ tầng tăng thêm. |

### Nguyên tắc monetization

| ID | Nguyên tắc |
|---|---|
| MON-01 | Không bán hoặc chia sẻ dữ liệu cá nhân, dữ liệu ngân hàng, lịch sử chi tiêu cho bên thứ ba. |
| MON-02 | Không dùng quảng cáo để chặn thao tác cần thiết hoặc làm nhầm với nút chức năng. |
| MON-03 | Gắn nhãn rõ cho affiliate/sponsored content; không can thiệp vào vote và settlement. |
| MON-04 | Người dùng luôn có thể hoàn tất chuyến đi và quyết toán ở gói miễn phí. |
| MON-05 | Chỉ mở rộng monetization sau khi chi phí free tier và tỷ lệ sử dụng được đo bằng dữ liệu thật. |

## 8. Rủi ro và cách giảm thiểu

| ID | Rủi ro | Xác suất | Tác động | Dấu hiệu sớm | Giảm thiểu trong MVP |
|---|---|---|---|---|---|
| RISK-01 | Thành viên không join vì ngại tài khoản hoặc link lạ | Cao | Cao | Invite open cao nhưng join thấp | Join bằng anonymous auth, hiển thị tên trip/người mời trước khi nhập tên, link có preview rõ. |
| RISK-02 | Người dùng mất dữ liệu khi anonymous session đổi thiết bị | Cao | Cao | Hỏi hỗ trợ “trip biến mất” | Hiển thị hướng dẫn nâng cấp Google; cho chủ trip export/backup tối thiểu; nêu rõ giới hạn anonymous. |
| RISK-03 | Tính toán chia tiền sai hoặc không giải thích được | Trung bình | Rất cao | Người dùng sửa tay kết quả hoặc không dám đánh dấu trả | Unit test nhiều edge case, hiển thị breakdown, mọi số tiền là integer VND, audit lịch sử sửa. |
| RISK-04 | RLS cấu hình sai làm lộ trip | Trung bình | Rất cao | Test môi trường staging truy cập chéo thất bại | Viết policy theo trip membership, test bằng nhiều user/session, deny-by-default. |
| RISK-05 | Phạm vi quá rộng với solo developer | Cao | Cao | Các module đều dang dở sau tuần 4 | Chốt vertical slice; non-goals rõ; chưa làm booking, chat riêng, OCR, đa tiền tệ. |
| RISK-06 | Free tier bị vượt do realtime hoặc abuse link | Trung bình | Cao | Spike request, database size, bandwidth | Rate limit, giới hạn kích thước trip, pagination, unsubscribe realtime khi rời màn hình, theo dõi quota. |
| RISK-07 | Poll và itinerary không được dùng vì nhóm vẫn ở Messenger | Cao | Trung bình | Trip tạo nhưng không có activation event | Link chia sẻ phải mở thẳng đúng context; cho phép copy summary và invite; tối ưu một-tap action. |
| RISK-08 | Mâu thuẫn trong nhóm về khoản chi | Trung bình | Cao | Expense bị sửa/xóa nhiều hoặc dispute | Lưu người tạo, thời điểm, lịch sử thay đổi; phân biệt “đã trả” và “đã xác nhận”. |
| RISK-09 | VietQR/ngân hàng thay đổi hoặc QR không quét được | Trung bình | Cao | Người dùng báo mã lỗi | Chỉ tạo payload theo chuẩn đã kiểm chứng, cho phép copy thông tin chuyển khoản thủ công, ghi rõ QR không tự xác nhận giao dịch. |
| RISK-10 | PWA/offline làm hiển thị dữ liệu cũ gây hiểu nhầm | Trung bình | Trung bình | Expense trùng hoặc trạng thái sai khi online lại | MVP offline ưu tiên read cache và draft; queue ghi dữ liệu chỉ làm sau khi có conflict strategy và idempotency. |
| RISK-11 | Dữ liệu nhạy cảm trong QR/expense bị chụp hoặc chia sẻ | Trung bình | Cao | User concern về số tài khoản | Mặc định che bớt thông tin, chỉ hiện khi người dùng yêu cầu; không log raw bank data; tài liệu hóa quyền xem. |
| RISK-12 | Đo lường quá nhiều làm ảnh hưởng quyền riêng tư | Trung bình | Trung bình | Người dùng phản ứng với analytics | Event tối thiểu, không ghi nội dung expense/ghi chú hoặc tên thành viên vào analytics. |

## 9. Các yêu cầu cấp sản phẩm cho tài liệu sau

Các ID dưới đây là baseline. PRD phải mở rộng chúng thành acceptance criteria cụ thể; kiến trúc và database không được mâu thuẫn với các cam kết này.

| ID | Yêu cầu cấp cao | Mức ưu tiên ban đầu |
|---|---|---|
| FR-01 | Người dùng có thể tạo một trip với tên, điểm đến tùy chọn, ngày tùy chọn và display name của người tạo. | Must |
| FR-02 | Người được mời có thể tham gia trip bằng link hoặc QR với display name, không cần cài app hoặc đăng ký email trước. | Must |
| FR-03 | Thành viên có thể đề xuất và bình chọn điểm đến/ngày; người có quyền có thể khóa lựa chọn. | Must |
| FR-04 | Nhóm có thể tạo và sắp xếp itinerary theo ngày, gồm địa điểm, thời gian, ghi chú và ý tưởng nguồn. | Must |
| FR-05 | Thành viên có thể tạo expense bằng VND integer, người trả, danh mục, thời gian, ghi chú và danh sách người chịu phần. | Must |
| FR-06 | Expense hỗ trợ ít nhất chia đều, chia theo số tiền và loại trừ người không tham gia; PRD sẽ chốt thêm %/shares. | Must |
| FR-07 | Trip hiển thị số dư ròng của từng thành viên và danh sách transfer đã tối giản. | Must |
| FR-08 | Người nhận tiền có thể hiển thị thông tin chuyển khoản/VietQR và người trả có thể đánh dấu đã trả; app không tự tuyên bố giao dịch ngân hàng thành công. | Must |
| FR-09 | Chủ trip có thể quản lý vai trò tối thiểu: owner và member; mọi quyền nhạy cảm phải kiểm tra ở server/RLS. | Must |
| FR-10 | Các thay đổi quan trọng của cùng một trip được cập nhật realtime hoặc có cơ chế refresh rõ ràng. | Should |
| FR-11 | Thành viên có thể nâng cấp anonymous identity lên tài khoản Google mà không mất trip/member history. | Should |
| FR-12 | App hỗ trợ VND không có số thập phân, định dạng dễ đọc theo locale Việt Nam và không dùng floating point cho tiền. | Must |
| NFR-01 | Dùng được trên màn hình di động phổ biến, luồng join và thêm expense có thể hoàn tất bằng một tay. | Must |
| NFR-02 | RLS bảo đảm user chỉ đọc/ghi dữ liệu của trip mà identity của họ là thành viên hợp lệ. | Must |
| NFR-03 | Không ghi raw bank credentials hoặc nội dung nhạy cảm vào analytics/logs; dữ liệu tối thiểu cần thiết cho MVP. | Must |
| NFR-04 | Các thao tác đọc chính có p95 mục tiêu dưới 2 giây trong điều kiện mạng 4G ổn định và dữ liệu trip nhỏ. | Should |
| NFR-05 | MVP chạy được trong free tier dự kiến của Supabase và Cloudflare Pages với quota monitoring; Docker chỉ phục vụ local/CI. | Must |
| NFR-06 | App có thể cài như PWA và có trạng thái offline tối thiểu không gây mất hoặc nhân đôi expense. | Should |

## 10. Tiêu chí thành công của Product Brief

Bước tiếp theo chỉ nên bắt đầu khi các điểm sau đã được chốt hoặc chuyển rõ sang “Câu hỏi mở”:

- Tripmate được định vị là công cụ điều phối chuyến đi nhóm, không phải banking app và không phải booking marketplace.
- MVP ưu tiên nhóm 3–10 người tại Việt Nam, tiền VND, mobile-first.
- Anonymous join là cam kết trải nghiệm, nhưng dữ liệu dài hạn và đổi thiết bị cần một cơ chế nâng cấp identity.
- Settlement phải giải thích được và tối giản số transfer, nhưng không xác nhận giao dịch ngân hàng tự động.
- KPI tập trung vào trip active và settlement completion thay vì chỉ đếm lượt đăng ký.

## Câu hỏi mở

1. Tripmate ưu tiên trước nhóm bạn 3–10 người hay nhóm đồng nghiệp 4–20 người? Hai nhóm này có thể cần quyền và ngôn ngữ khác nhau.
2. Chủ trip có được xem và chỉnh mọi expense không, hay chỉ người tạo expense mới được sửa/xóa?
3. “Đã quyết toán” nghĩa là tất cả transfer đã được người nhận xác nhận, hay cho phép owner đóng sổ dù còn transfer chưa xác nhận?
4. Có cho phép một người tham gia nhiều vai trò/“hộ” trong cùng trip không, ví dụ một thành viên nhập chi phí cho cả gia đình?
5. Thành viên anonymous có thể truy cập trip trong bao lâu nếu không nâng cấp tài khoản? Có cần cơ chế khôi phục bằng invite link không?
6. VietQR MVP sẽ hỗ trợ các ngân hàng phổ biến qua `bankBin`/`accountNumber`/`accountName` do người dùng nhập, hay chỉ copy nội dung chuyển khoản trước và hoãn QR?
7. Có cần cho phép trip không có điểm đến/ngày ở thời điểm tạo, hay bắt buộc tối thiểu một trong hai trường?
8. Người dùng có quyền xóa hoàn toàn trip và dữ liệu liên quan ngay từ MVP không, hay chỉ soft delete/ẩn khỏi danh sách?
9. Có cần export CSV/JSON cho trip ở MVP để giảm rủi ro anonymous session mất dữ liệu không?
10. KPI 100 trip trong 3 tháng là mục tiêu bắt buộc hay chỉ là mục tiêu thăm dò; có cohort test kín riêng với nhóm thật không?
11. Phạm vi “offline” ở MVP chỉ là xem cache và lưu draft, hay phải cho phép tạo expense khi mất mạng rồi đồng bộ sau?
12. Cho phép hiển thị affiliate/đối tác trong 3 tháng đầu hay giữ hoàn toàn không thương mại cho đến sau pilot?

## Quyết định cần chốt

| Mã | Quyết định | Đề xuất mặc định |
|---|---|---|
| DEC-01 | Primary segment | Nhóm bạn 3–10 người; validate nhóm đồng nghiệp trong pilot nhưng không tối ưu quyền doanh nghiệp. |
| DEC-02 | MVP scope | Poll điểm đến/ngày + itinerary ngày + expense + settlement + VietQR payload + anonymous join. |
| DEC-03 | Authentication | Anonymous Supabase Auth cho join; Google upgrade là Should, không chặn core flow. |
| DEC-04 | Money model | VND integer `bigint`; không hỗ trợ đa tiền tệ hoặc số thập phân trong MVP. |
| DEC-05 | Settlement confirmation | QR chỉ hỗ trợ thanh toán thủ công; người dùng tự đánh dấu và người nhận xác nhận, không tích hợp đối soát ngân hàng. |
| DEC-06 | Offline | MVP chỉ cache đọc và draft an toàn; offline write queue là phạm vi sau khi đã có idempotency/conflict design. |
| DEC-07 | Monetization | Không quảng cáo/affiliate trong MVP; chỉ đo usage và chi phí để quyết định sau pilot. |
| DEC-08 | Data deletion | Soft delete cho dữ liệu nghiệp vụ; cần bổ sung flow xóa tài khoản/xóa dữ liệu theo yêu cầu riêng tư trước public launch. |
