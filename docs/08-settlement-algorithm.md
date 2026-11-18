# Tripmate — Đặc tả thuật toán chia tiền và tối giản nợ

- **Mục đích:** Định nghĩa chính xác cách chia một khoản chi, làm tròn, tính số dư, tối giản số giao dịch và tạo nội dung VietQR, để code và test không còn chỗ hiểu mơ hồ.
- **Phiên bản:** 0.1
- **Cập nhật lần cuối:** 18/11/2026

## Tóm tắt

Mọi phép tính dùng **số nguyên VND**. Một khoản chi được chia theo 4 kiểu (đều, số tiền, %, phần). Phần dư khi chia lẻ được phân bổ từng 1₫ theo phương pháp "phần dư lớn nhất" (largest remainder), hòa thì xoay vòng theo số thứ tự khoản chi để không ai luôn bị thiệt. Số dư mỗi người tính từ dữ liệu gốc. Tối giản nợ dùng heuristic tham lam kèm bước ghép cặp khớp chính xác; bài toán tối ưu tuyệt đối là NP-hard nhưng với nhóm nhỏ, heuristic cho kết quả tối đa n−1 giao dịch và thường tối ưu. Các test case dưới đây **đã được chạy thử bằng một bản cài đặt tham chiếu** (Python) để xác nhận số liệu; bản TypeScript trong dự án phải cho đúng kết quả này.

---

## 1. Các kiểu chia

Ký hiệu: `amount` là tổng khoản chi (số nguyên, 1 ≤ amount ≤ 1.000.000.000), `P` là danh sách người tham gia được sắp xếp theo thứ tự cố định (xem 2.2), `n = |P|`.

| Kiểu | Đầu vào của người dùng | Quy tắc | Điều kiện hợp lệ |
|------|------------------------|---------|------------------|
| `equal` (đều) | Chọn ai tham gia | Mỗi người trọng số 1 | n ≥ 1 |
| `amount` (theo số tiền) | Số tiền cho từng người | Dùng đúng số nhập | Σ số tiền = `amount`; mỗi số ≥ 0 |
| `percent` (theo %) | % cho từng người, độ chính xác 0,01% | Lưu dạng điểm cơ bản `bp` (33,33% = 3333) | Σ bp = 10000 |
| `shares` (theo phần) | Số phần nguyên dương | Trọng số = số phần | Mỗi phần ≥ 1 |

`equal`, `percent` và `shares` đều là trường hợp của **chia theo trọng số** (`equal` là mọi trọng số bằng 1). Chỉ `amount` là nhập trực tiếp.

---

## 2. Làm tròn và phân bổ phần dư

### 2.1 Thuật toán chia theo trọng số (largest remainder)

Đầu vào: `amount`, trọng số `w[0..n-1]` (số nguyên dương), `seq_no` (số thứ tự khoản chi trong chuyến, bắt đầu từ 1).

1. `W = Σ w[i]`.
2. Với mỗi i: `floor[i] = ⌊ amount × w[i] / W ⌋`, `frac[i] = (amount × w[i]) mod W` (phần dư dạng số nguyên, không dùng số thực).
3. `r = amount − Σ floor[i]` (số đồng còn thiếu, `0 ≤ r < n`).
4. Sắp xếp các chỉ số i theo: `frac[i]` giảm dần; nếu bằng nhau thì theo **khoảng cách xoay vòng** `(i − start) mod n` tăng dần, với `start = (seq_no − 1) mod n`.
5. Cộng 1₫ cho `r` người đầu tiên theo thứ tự đó.
6. Kết quả `owed[i] = floor[i] (+1)`; luôn thỏa `Σ owed[i] = amount`.

**Vì sao xoay vòng:** nếu luôn cộng 1₫ cho người đầu danh sách, người đó thiệt thòi mãi qua nhiều khoản. Xoay theo `seq_no` làm phần dư phân tán đều theo thời gian mà vẫn xác định (cùng đầu vào cho cùng kết quả, dễ test).

**Giới hạn số học:** `amount × w` tối đa khoảng 1e9 × 1e4 = 1e13, an toàn trong số nguyên của JavaScript (2^53 ≈ 9e15). `percent` dùng tối đa 10000, `shares` nên giới hạn mỗi phần ≤ 1000.

### 2.2 Thứ tự người tham gia `P`

Sắp xếp theo `trip_members.created_at` tăng dần, hòa thì theo `id`. Thứ tự này ổn định, không phụ thuộc người nhập.

### 2.3 Kiểu `amount`

Không làm tròn. Nếu Σ ≠ `amount`, từ chối và hiển thị "Còn thiếu X₫" hoặc "Dư X₫".

---

## 3. Tính số dư mỗi thành viên

Với mỗi thành viên m trong chuyến:

```
paid[m]     = Σ amount của các khoản chi chưa xóa mà m là người trả
owed[m]     = Σ owed_amount của các dòng chia chưa xóa thuộc m
sent[m]     = Σ amount các thanh toán đã xác nhận mà m là người chuyển
received[m] = Σ amount các thanh toán đã xác nhận mà m là người nhận
net[m]      = paid[m] − owed[m] + sent[m] − received[m]
```

- `net > 0`: được nhận tiền (chủ nợ). `net < 0`: cần trả (con nợ).
- **Bất biến:** `Σ net[m] = 0` với mọi trạng thái hợp lệ. Mọi test phải kiểm bất biến này.
- Thành viên đã rời nhóm/bị xóa vẫn có `net` và vẫn tham gia gợi ý quyết toán (EC-01).
- Hiển thị: thanh toán ở trạng thái "đã đánh dấu, chờ xác nhận" có thể được cộng vào để gợi ý không đòi trả hai lần, nhưng gắn nhãn "chờ xác nhận" (xem Quyết định D-34).

---

## 4. Tối giản số giao dịch

### 4.1 Bài toán

Cho `net[m]` có tổng 0. Tìm tập giao dịch (người nợ → chủ nợ, số tiền) ít nhất sao cho sau khi thực hiện mọi `net` bằng 0.

### 4.2 Giới hạn lý thuyết

- Với n thành viên có `net ≠ 0`, luôn tồn tại lời giải tối đa **n − 1** giao dịch.
- Số giao dịch tối thiểu bằng `n − k`, với k là **số nhóm con "tổng bằng 0" tối đa** có thể chia các số dư thành. Mỗi nhóm k phần tử cần đúng k − 1 giao dịch.
- Tìm cách chia thành nhiều nhóm tổng-0 nhất liên quan đến bài toán tổng tập con (subset-sum), nên **tối ưu chính xác là NP-hard** trong trường hợp tổng quát.

### 4.3 Vì sao heuristic là đủ cho MVP

- Nhóm bạn đi chơi nhỏ (thường 3–10 người, tối đa 30): chênh lệch giữa heuristic và tối ưu thường là 0–1 giao dịch.
- Người dùng cần kết quả **ổn định, dễ giải thích và tức thì**, không cần tối ưu tuyệt đối.
- Heuristic đảm bảo cận trên n − 1, chạy O(n log n).
- Có thể thêm tối ưu chính xác cho n nhỏ ở bản sau (xem 4.5) mà không đổi giao diện.

### 4.4 Thuật toán MVP

**Bước H1 — ghép cặp khớp chính xác:** lặp: nếu có chủ nợ c và con nợ d với `net[c] = −net[d]`, tạo giao dịch d → c và loại cả hai. Lặp đến khi không còn cặp khớp.

**Bước H2 — tham lam:** khi còn số dư khác 0: lấy chủ nợ có `net` lớn nhất và con nợ có `|net|` lớn nhất (hòa thì theo thứ tự `P`); chuyển `t = min(net[c], −net[d])` từ d sang c; cập nhật; loại người có `net` về 0.

```ts
type Transfer = { from: string; to: string; amount: number };

function simplify(net: Map<string, number>, order: string[]): Transfer[] {
  const bal = new Map([...net].filter(([, v]) => v !== 0));
  const out: Transfer[] = [];

  // H1: ghép cặp khớp chính xác
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of order) {
      if (!(bal.get(c)! > 0)) continue;
      const d = order.find(
        (x) => x !== c && bal.has(x) && bal.get(x)! === -bal.get(c)!
      );
      if (d) {
        out.push({ from: d, to: c, amount: bal.get(c)! });
        bal.delete(c);
        bal.delete(d);
        changed = true;
      }
    }
  }

  // H2: tham lam
  while (bal.size > 0) {
    const c = pickMax([...bal].filter(([, v]) => v > 0), order);   // chủ nợ lớn nhất
    const d = pickMax([...bal].filter(([, v]) => v < 0).map(([k, v]) => [k, -v] as [string, number]), order);
    const t = Math.min(bal.get(c)!, -bal.get(d)!);
    out.push({ from: d, to: c, amount: t });
    bal.set(c, bal.get(c)! - t);
    bal.set(d, bal.get(d)! + t);
    if (bal.get(c) === 0) bal.delete(c);
    if (bal.get(d) === 0) bal.delete(d);
  }
  return out;
}
// pickMax: chọn phần tử có giá trị lớn nhất, hòa thì theo vị trí trong `order`.
```

Độ phức tạp: H2 là O(n log n) nếu dùng hai heap, O(n²) nếu quét tuyến tính (n ≤ 30 nên chấp nhận được). H1 là O(n²) bản đơn giản, O(n) nếu dùng bảng băm theo số tiền.

### 4.5 Cải tiến sau MVP (không bắt buộc)

Khi số người có `net ≠ 0` nhỏ (ví dụ n ≤ 12), chạy quy hoạch động trên tập con (bitmask) để tìm số nhóm tổng-0 tối đa, độ phức tạp khoảng O(2^n · n). Cho kết quả tối ưu chính xác cho nhóm nhỏ. Test TC-12 minh họa trường hợp tham lam thuần túy kém hơn tối ưu 1 giao dịch.

---

## 5. Test case

Ký hiệu thành viên theo thứ tự tham gia: A, B, C, D... Tất cả số liệu dưới đây đã được chạy bằng bản cài đặt tham chiếu. `seq` là `seq_no` của khoản chi.

### 5.1 Chia một khoản chi

| ID | Mô tả | Đầu vào | Kết quả mong đợi |
|----|-------|---------|------------------|
| TC-01 | Chia đều lẻ 1₫ | 100.000₫, đều, [A,B,C], seq=1 | A 33.334; B 33.333; C 33.333 |
| TC-02 | Xoay vòng phần dư | 100.000₫, đều, [A,B,C], seq=2 | A 33.333; B 33.334; C 33.333 |
| TC-03 | Chia đều chẵn | 50.000₫, đều, [A,B] | 25.000; 25.000 |
| TC-04 | Số tiền nhỏ hơn số người | 2₫, đều, [A,B,C], seq=1 | A 1; B 1; C 0 (hợp lệ vì `owed_amount ≥ 0`) |
| TC-05 | Theo số tiền, hợp lệ | 300.000₫: A 100.000, B 120.000, C 80.000 | Chấp nhận |
| TC-05b | Theo số tiền, sai tổng | 100.000 + 120.000 + 70.000 = 290.000 so với 300.000 | Từ chối: "Còn thiếu 10.000₫" |
| TC-06 | Theo %, chia chẵn | 1.000.000₫, bp 3333/3333/3334 | 333.300; 333.300; 333.400 |
| TC-07 | Theo %, có phần dư | 100.001₫, bp 5000/5000, seq=1 | A 50.001; B 50.000 |
| TC-08 | Theo phần, chia chẵn | 900.000₫, phần 1/2/3 | 150.000; 300.000; 450.000 |
| TC-09 | Theo phần, có phần dư | 100.000₫, phần 2/1 | 66.667; 33.333 (phần dư dạng số nguyên: 2 so với 1, người thứ nhất lớn hơn) |

### 5.2 Số dư và tối giản nợ

| ID | Kịch bản | Số dư | Giao dịch mong đợi |
|----|---------|-------|--------------------|
| TC-10 | A trả 100.000₫ chia đều [A,B,C], seq=1 (TC-01) | A +66.666; B −33.333; C −33.333 | B → A 33.333; C → A 33.333 |
| TC-11 | Chuỗi: A trả 300.000₫ đều [A,B,C]; B trả 150.000₫ đều [B,C] | A +200.000; B −25.000; C −175.000 | C → A 175.000; B → A 25.000 (2 giao dịch) |
| TC-12 | Vòng tròn triệt tiêu: B trả 100.000₫ cho A; C trả 100.000₫ cho B; A trả 100.000₫ cho C | A 0; B 0; C 0 | Không có giao dịch |
| TC-13 | Heuristic thuần tham lam kém hơn tối ưu: C1 +400.000, C2 +300.000, C3 +300.000, D1 −600.000, D2 −400.000 | — | Chỉ tham lam: 4 giao dịch. Có bước H1: D2 → C1 400.000; D1 → C2 300.000; D1 → C3 300.000 (3 giao dịch, tối ưu) |
| TC-14 | Người trả không tham gia: A trả 90.000₫ cho [B,C] | A +90.000; B −45.000; C −45.000 | B → A 45.000; C → A 45.000 |
| TC-15 | Chưa có khoản chi, hoặc chuyến chỉ có 1 người | Mọi số dư 0 | Không có giao dịch; hiển thị "Chưa có gì để quyết toán" |
| TC-16 | Thanh toán một phần: từ TC-10, B đã chuyển và A xác nhận 20.000₫ | A +46.666; B −13.333; C −33.333 | C → A 33.333; B → A 13.333 |
| TC-17 | Sửa khoản chi sau thanh toán: từ TC-10, B đã xác nhận trả 33.333₫; owner mở khóa, sửa tổng thành 90.000₫ (đều, 30.000 mỗi người) | A +26.667; B +3.333; C −30.000 | C → A 26.667; C → B 3.333 (B trả dư nên thành chủ nợ, EC-09) |
| TC-18 | Thành viên đã rời nhóm còn nợ | C đã `left`, `net` = −85.000, A +85.000 | C → A 85.000 vẫn xuất hiện trong gợi ý (EC-01) |

### 5.3 Test thuộc tính (property-based)

| ID | Thuộc tính | Cách kiểm |
|----|-----------|-----------|
| PT-01 | Với mọi `amount`, trọng số, `seq`: `Σ owed = amount` và mọi `owed ≥ 0` | Sinh ngẫu nhiên 10.000 trường hợp |
| PT-02 | Với mọi tập khoản chi/thanh toán hợp lệ: `Σ net = 0` | Sinh ngẫu nhiên |
| PT-03 | Thực hiện toàn bộ giao dịch gợi ý đưa mọi `net` về 0 | Áp dụng giao dịch lên `net` |
| PT-04 | Số giao dịch ≤ (số người có `net ≠ 0`) − 1 | So sánh |
| PT-05 | Thuật toán xác định: cùng đầu vào cho cùng đầu ra | Chạy hai lần |
| PT-06 | Hai phép cài đặt (client TypeScript và hàm SQL `get_trip_balances`) cho cùng `net` | So sánh trên dữ liệu seed |

---

## 6. Tạo nội dung VietQR

### 6.1 Cơ sở

VietQR là mã QR chuyển khoản liên ngân hàng của NAPAS, tuân thủ chuẩn thanh toán QR của EMVCo và bộ tiêu chuẩn cơ sở do Ngân hàng Nhà nước ban hành. Nội dung QR là chuỗi gồm các trường dạng TLV: **ID (2 ký tự) + độ dài (2 chữ số) + giá trị**. Có hai cách tạo QR:

1. **Tự tạo chuỗi EMVCo ở client** (đề xuất): không gửi số tiền/tài khoản cho bên thứ ba, chạy được offline.
2. Dùng dịch vụ tạo ảnh của bên thứ ba (ví dụ dịch vụ `quicklink` của vietqr.io): đơn giản hơn nhưng phụ thuộc dịch vụ ngoài và lộ dữ liệu thanh toán cho họ.

### 6.2 Các trường cần có

| ID | Trường | Giá trị trong Tripmate | Ghi chú |
|----|--------|------------------------|---------|
| 00 | Payload Format Indicator | `01` | Cố định |
| 01 | Point of Initiation Method | `12` (QR động, có số tiền) | `11` là QR tĩnh |
| 38 | Merchant Account Information (NAPAS) | Gồm các trường con bên dưới | |
| 38.00 | GUID | `A000000727` | Định danh NAPAS |
| 38.01 | Beneficiary Organization | Gồm: `00` = mã BIN ngân hàng nhận (6 chữ số), `01` = số tài khoản | |
| 38.02 | Service code | `QRIBFTTA` (chuyển đến tài khoản) | Chuyển đến thẻ dùng `QRIBFTTC` |
| 53 | Transaction Currency | `704` (VND) | |
| 54 | Transaction Amount | Số tiền nguyên, ví dụ `33333` | Không có dấu phân cách, không số thập phân |
| 58 | Country Code | `VN` | |
| 62 | Additional Data | Chứa `08` = nội dung chuyển khoản | Trường con 08 là mục đích giao dịch/nội dung |
| 63 | CRC | 4 ký tự hex in hoa | CRC-16/CCITT-FALSE (đa thức 0x1021, giá trị đầu 0xFFFF) tính trên toàn bộ chuỗi, **gồm cả phần `6304`** |

### 6.3 Ví dụ (dữ liệu giả)

Người nhận: BIN `970436`, số tài khoản `0011001234567`, số tiền 33.333₫, nội dung `TRIPMATE DALAT`.

```
00020101021238570010A00000072701270006970436011300110012345670208QRIBFTTA53037045405333335802VN62180814TRIPMATE DALAT6304BED3
```

Chuỗi trên được tạo bằng bản cài đặt tham chiếu; bộ tính CRC đã được đối chiếu với giá trị kiểm chuẩn của CRC-16/CCITT-FALSE (`123456789` cho `29B1`). **Chưa được quét thử bằng app ngân hàng thật**, nên đây là việc bắt buộc ở Phase 2.

### 6.4 Nội dung chuyển khoản

| Quy tắc | Chi tiết |
|---------|----------|
| Định dạng | `TM <mã ngắn chuyến> <tên người trả không dấu>`; ví dụ `TM DL12 DUC` |
| Ký tự | Chỉ chữ cái không dấu, số và khoảng trắng; viết hoa |
| Độ dài | Khuyến nghị tối đa khoảng 25 ký tự để tương thích nhiều ngân hàng (cần kiểm thử, giới hạn thực tế tùy app) |
| Chống sai | Luôn hiển thị song song số tài khoản dạng văn bản có nút sao chép |

### 6.5 Danh mục ngân hàng

Cần bảng ánh xạ tên ngân hàng và mã BIN 6 chữ số (ví dụ Vietcombank `970436`). Lưu thành tệp `banks.json` trong dự án, cập nhật thủ công định kỳ và kiểm chứng với nguồn chính thức của NAPAS/ngân hàng trước khi dùng. Một số ví dụ thư viện mẫu trên mạng ghi sai mã BIN, nên không sao chép mà không đối chiếu.

---

## Câu hỏi mở

1. Thứ tự người tham gia `P` theo thời điểm tham gia có hợp lý, hay nên theo thứ tự người dùng chọn khi nhập khoản chi?
2. Có cho người dùng chọn "người nhận phần dư 1₫" thủ công không (hiếm dùng, nhưng có thể gây tranh cãi)?
3. Giới hạn nội dung chuyển khoản thực tế của các ngân hàng phổ biến là bao nhiêu ký tự? Cần thử.
4. Có cần làm tối ưu chính xác (bitmask, 4.5) ngay MVP khi nhóm ≤ 12 người?
5. Với QR đến **thẻ** (`QRIBFTTC`), có hỗ trợ không? Đề xuất không ở MVP.
6. QR có số tiền cố định: người chuyển có thể sửa số tiền trong app ngân hàng hay không tùy ngân hàng; có cần cảnh báo?

## Quyết định cần chốt

| ID | Quyết định | Đề xuất |
|----|-----------|---------|
| D-32 | Quy tắc làm tròn | Largest remainder, hòa thì xoay vòng theo `seq_no` (mục 2.1) |
| D-33 | Heuristic MVP | H1 + H2 (mục 4.4); tối ưu bitmask để sau |
| D-34 | Gợi ý quyết toán có tính khoản "chờ xác nhận" không | Có, kèm nhãn "chờ xác nhận"; số dư trong DB vẫn chỉ tính khoản đã xác nhận |
| D-35 | Tạo VietQR ở client | Có (trùng D-21) |
| D-36 | Định dạng nội dung chuyển khoản | `TM <mã chuyến> <tên không dấu>`, tối đa khoảng 25 ký tự |
