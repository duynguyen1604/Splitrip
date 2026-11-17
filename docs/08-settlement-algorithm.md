# Tripmate — Đặc tả thuật toán chia tiền và tối giản nợ

**Mục đích:** Định nghĩa cách chia expense bằng VND integer, tính số dư và tạo danh sách chuyển khoản tối giản, có thể giải thích và kiểm thử.

**Phiên bản:** 0.1

**Cập nhật lần cuối:** 2026-11-17

**Tóm tắt:** Mọi calculation dùng số nguyên VND. Expense trước hết được phân bổ thành share của participant; balance của member là tổng đã trả trừ tổng share phải chịu. Settlement dùng heuristic tham lam ghép debtor lớn nhất với creditor lớn nhất, deterministic theo member id khi hòa. Heuristic không đảm bảo số transfer tối ưu tuyệt đối trong mọi trường hợp, nhưng đủ tốt, dễ giải thích và phù hợp nhóm nhỏ của MVP.

## 1. Mô hình dữ liệu tính toán

Với mỗi member `i`:

```text
paid[i] = tổng amount_vnd của expense active do i trả
owed[i] = tổng share_amount_vnd của expense active mà i tham gia
balance[i] = paid[i] - owed[i]
```

- `balance[i] > 0`: member sẽ nhận tiền.
- `balance[i] < 0`: member cần trả `abs(balance[i])`.
- `balance[i] = 0`: không có nghĩa vụ ròng.
- Invariant: `Σ balance[i] = 0` sau khi mọi expense được phân bổ chính xác.

Không tính expense `voided`, member inactive vẫn giữ trong lịch sử nhưng settlement mới phải chốt rule remap trước khi tính.

## 2. Các kiểu chia tiền

### 2.1 Chia đều — `equal`

Input: `amount`, danh sách `n` participant.

```text
base = floor(amount / n)
remainder = amount mod n
share[j] = base + 1 nếu participant ở vị trí j < remainder, ngược lại base
```

Thứ tự participant phải ổn định: `position` được chọn lúc user submit; nếu không có thì sort theo `member_id` tăng dần. Không dùng thứ tự response database ngẫu nhiên.

### 2.2 Theo số tiền — `exact`

Input: từng participant có `amount` integer.

Điều kiện:

```text
∀ share >= 0
Σ share = amount
```

Nếu tổng thiếu/thừa, reject và hiển thị chênh lệch; không tự sửa silently.

### 2.3 Theo phần trăm — `percentage`

Lưu input theo basis points để tránh float: `10000 = 100.00%`.

```text
Σ percentage_basis_points = 10000
raw_share = amount * basis_points / 10000
```

`raw_share` được floor trước, phần dư phân bổ theo largest remainder; tie-break bằng participant order ổn định.

### 2.4 Theo phần — `shares`

Input `shares[j]` là số nguyên dương.

```text
total_shares = Σ shares[j]
raw_share = amount * shares[j] / total_shares
```

Floor + remainder theo fractional remainder lớn nhất; tie-break theo participant order. `shares=0` có thể bỏ khỏi participant list, không phải participant có nghĩa vụ.

## 3. Quy tắc làm tròn và phân bổ phần dư

| ID | Quy tắc |
|---|---|
| ROUND-01 | Tiền chỉ là integer VND; không dùng binary floating point. |
| ROUND-02 | Mọi share sau split phải là số nguyên ≥0. |
| ROUND-03 | Tổng shares luôn đúng bằng expense amount; assert trước khi save. |
| ROUND-04 | Equal split: phần dư 1₫ lần lượt cấp cho participant đứng trước trong stable order. |
| ROUND-05 | Percentage/shares: floor tất cả trước, phần dư cấp cho fractional remainder lớn nhất; tie-break stable order. |
| ROUND-06 | Stable order phải được lưu hoặc tái tạo từ `position`/`member_id`, không phụ thuộc UI locale. |
| ROUND-07 | UI hiển thị theo locale chỉ là formatting; value gốc vẫn integer. |
| ROUND-08 | Nếu calculation invariant thất bại, transaction reject; không tạo expense với số dư lệch. |

## 4. Tính balance

```text
function calculateBalances(expenses, members):
    paid = map(memberId -> 0)
    owed = map(memberId -> 0)

    for expense in expenses where expense.status == 'active':
        paid[expense.payerMemberId] += expense.amountVnd
        shares = allocate(expense.amountVnd, expense.splitMethod,
                          expense.participants)
        for share in shares:
            owed[share.memberId] += share.amountVnd

    balances = []
    for member in members:
        balances.push({
            memberId: member.id,
            paidVnd: paid[member.id],
            owedVnd: owed[member.id],
            balanceVnd: paid[member.id] - owed[member.id]
        })

    assert sum(b.balanceVnd for b in balances) == 0
    return balances
```

Ví dụ: A trả 900000 cho A/B/C, mỗi người chịu 300000; A balance `+600000`, B/C mỗi người `-300000`.

## 5. Thuật toán tối giản transfer

### 5.1 Chuẩn hóa

- Debtor list: các `balance < 0`, amount cần trả `abs(balance)`.
- Creditor list: các `balance > 0`, amount cần nhận `balance`.
- Loại balance zero.
- Sort amount giảm dần; tie-break bằng `member_id` tăng dần để kết quả deterministic.

### 5.2 Pseudocode greedy

```text
function minimizeTransfers(balances):
    debtors = sortDesc([
        { memberId, amount: abs(balanceVnd) }
        for b in balances if b.balanceVnd < 0
    ])
    creditors = sortDesc([
        { memberId, amount: balanceVnd }
        for b in balances if b.balanceVnd > 0
    ])

    transfers = []
    i = 0
    j = 0

    while i < debtors.length and j < creditors.length:
        amount = min(debtors[i].amount, creditors[j].amount)
        transfers.push({
            debtorMemberId: debtors[i].memberId,
            creditorMemberId: creditors[j].memberId,
            amountVnd: amount,
            status: 'pending'
        })

        debtors[i].amount -= amount
        creditors[j].amount -= amount

        if debtors[i].amount == 0: i += 1
        if creditors[j].amount == 0: j += 1

    assert all(x.amount == 0 for x in debtors)
    assert all(x.amount == 0 for x in creditors)
    return transfers
```

### 5.3 Độ phức tạp và giới hạn

- Sort: `O(n log n)` với `n` là số debtor/creditor; vòng lặp: `O(n)`.
- Bộ nhớ: `O(n)`.
- Bài toán tìm số transfer tối thiểu tuyệt đối với các ràng buộc bổ sung có thể trở thành bài toán tối ưu tổ hợp/NP-hard; thử mọi cách ghép để chứng minh tối ưu sẽ không đáng cho nhóm 3–10 người.
- Greedy có ưu điểm: deterministic, dễ giải thích, luôn bảo toàn tổng tiền và thường đạt số transfer thấp.
- Giới hạn: có thể không đạt số cạnh ít nhất trong một số vector balance; nếu cần, có thể thêm exact search cho `n≤10` như mode sau MVP và fallback greedy khi lớn hơn.

## 6. VietQR và nội dung chuyển khoản

### 6.1 Dữ liệu cần có

| Field | Bắt buộc | Quy tắc |
|---|---|---|
| `bankBin` | Có nếu render QR | Mã BIN theo danh mục cập nhật; không nhận tên tự do để build QR. |
| `accountNumber` | Có | Validate format/length theo provider; encrypt at rest, mask UI. |
| `accountName` | Có | Chuẩn hóa theo provider nếu cần; hiển thị masked khi không cần. |
| `amountVnd` | Có | Integer >0, lấy từ transfer snapshot, không cho sửa trên QR screen. |
| `addInfo` | Có | Deterministic, ngắn, không chứa secret; ví dụ `TRIPMATE TM123 ABC`. |
| `currency` | Có | `704` (VND) trong QR payload. |
| `country` | Có | `VN`. |

### 6.2 Payload

MVP nên dùng thư viện/provider đã kiểm thử chuẩn EMVCo/VietQR thay vì tự nối chuỗi không test. Nếu tự build, payload TLV thường gồm:

| Tag | Ý nghĩa |
|---|---|
| `00` | Payload format indicator `01`. |
| `01` | Point of initiation method: dynamic/static theo provider. |
| `38` | Merchant account information: GUID VietQR, bank BIN, account number, service. |
| `52` | Merchant category code, thường `0000` nếu provider yêu cầu. |
| `53` | Transaction currency `704`. |
| `54` | Transaction amount, integer decimal string. |
| `58` | Country code `VN`. |
| `59` | Account/merchant name nếu chuẩn cho phép. |
| `60` | City nếu cần. |
| `62` | Additional data, đặc biệt field `08` cho addInfo. |
| `63` | CRC-16/CCITT-FALSE của payload trước tag CRC. |

`addInfo` không được chứa account number đầy đủ, access token hoặc nội dung riêng tư. QR screen phải ghi rõ Tripmate không biết giao dịch đã thành công.

### 6.3 Transfer message fallback

```text
Chuyển khoản Tripmate: {tripShortCode} - {debtorDisplayName}
Số tiền: {amountVnd}₫
Nội dung: {addInfo}
Người nhận: {maskedAccountName}
Ngân hàng: {bankName}
```

Nếu thiếu profile, vẫn cho copy `addInfo + amount + recipient display name` và hướng dẫn hỏi recipient, không tạo QR giả.

## 7. Test cases tối thiểu

| ID | Input | Kết quả mong đợi |
|---|---|---|
| ALG-01 | Expense 900000, equal A/B/C | A/B/C mỗi người 300000; payer A balance +600000, B/C -300000. |
| ALG-02 | 100000 equal A/B/C | Stable order nhận 33334, hai người còn lại 33333; tổng 100000. |
| ALG-03 | 100000 exact: A 20000, B 30000, C 50000 | Save thành công; tổng exact 100000. |
| ALG-04 | 100000 exact: 20000 + 30000 + 40000 | Reject; báo thiếu 10000. |
| ALG-05 | 100000 percentage: A 50%, B 25%, C 25% | Shares 50000/25000/25000. |
| ALG-06 | 100000 percentage với basis points lẻ | Kết quả integer cộng đúng 100000; remainder theo largest remainder/tie-break. |
| ALG-07 | 100000 shares A=1,B=2 | Shares 33333/66667; tổng đúng 100000. |
| ALG-08 | 100000 shares A=0,B=0 | Reject vì không có participant có shares >0. |
| ALG-09 | A balance -100000, B +60000, C +40000 | A→B 60000 và A→C 40000; 2 transfers. |
| ALG-10 | A -70000, B -30000, C +50000, D +50000 | A→C 50000, A→D 20000, B→D 30000; 3 transfers. |
| ALG-11 | A 0, B 0, C 0 | Không tạo transfer; settlement no-op/completed theo UI. |
| ALG-12 | Expense voided 300000 và active 100000 | Chỉ active expense ảnh hưởng balance. |
| ALG-13 | Expense 100000 payer A, participant B only | A balance +100000, B -100000; payer không bắt buộc là participant. |
| ALG-14 | Balance tổng do input lỗi là +1 | Assert fail; không tạo settlement, yêu cầu recalculate source shares. |
| ALG-15 | Transfer marked paid rồi expense đổi participant | Settlement revision mới; transfer cũ needs_review/disputed. |
| ALG-16 | QR thiếu bankBin | Không render QR; cho copy fallback và hướng dẫn recipient cập nhật profile. |

## 8. Kiểm tra bất biến

```text
for each expense:
    sum(participant.share_amount_vnd) == expense.amount_vnd
    every share_amount_vnd >= 0

for each settlement:
    sum(balance_vnd) == 0
    sum(transfer.amount_vnd by debtor) == abs(debtor.balance_vnd)
    sum(transfer.amount_vnd by creditor) == creditor.balance_vnd
    debtor_member_id != creditor_member_id
```

Nếu invariant fail, không hiển thị settlement như kết quả hợp lệ; hiển thị lỗi có correlation id và giữ dữ liệu nguồn để debug.

## Câu hỏi mở

1. Có cần exact optimization cho nhóm ≤10 người sau MVP, hay greedy là contract lâu dài?
2. Remainder equal split phân bổ theo thứ tự participant user chọn hay theo member id để ổn định giữa các lần chỉnh sửa?
3. Có cần cho payer không tham gia expense, như người đặt hộ, là rule chính thức trong UI không?
4. VietQR dùng static payload hay dynamic payload; provider nào chịu trách nhiệm cập nhật danh sách bank BIN?
5. Độ dài tối đa của `addInfo` theo ngân hàng mục tiêu là bao nhiêu; có cần fallback rút gọn tự động không?
6. Khi recipient đổi bank profile sau settlement snapshot, QR cũ còn hợp lệ hay phải invalidate?

## Quyết định cần chốt

| Mã | Quyết định | Đề xuất mặc định |
|---|---|---|
| DEC-ALG-01 | Arithmetic | Integer VND, không float; percentage lưu basis points. |
| DEC-ALG-02 | Remainder | Equal theo stable participant order; percentage/shares theo largest remainder rồi stable order. |
| DEC-ALG-03 | Settlement | Greedy deterministic cho MVP; exact solver chỉ cân nhắc sau khi có dữ liệu cần thiết. |
| DEC-ALG-04 | Payer | Payer không bắt buộc là participant; UI phải nói rõ. |
| DEC-ALG-05 | QR | Dùng thư viện/provider đã kiểm thử; fallback copy là bắt buộc. |
| DEC-ALG-06 | Bank update | QR lấy payment profile hiện tại nhưng gắn với settlement transfer; profile thay đổi phải tạo warning/re-render. |
