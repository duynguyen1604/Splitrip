# Tripmate

Ứng dụng web mobile-first để cùng nhóm lên kế hoạch chuyến đi, ghi chi tiêu và quyết toán tiền thông minh qua VietQR.

## Hướng dẫn cài đặt & khởi chạy

1. Cài Node.js 20.9 trở lên.
2. Chạy `npm install`.
3. Tạo Supabase project và bật **Anonymous Sign-ins** trong **Authentication → Providers**.
4. Chạy SQL migration theo thứ tự trên Supabase SQL Editor:
   - [0001_phase1_core.sql](./supabase/migrations/0001_phase1_core.sql) (Khởi tạo các bảng cốt lõi, RLS và RPC Phase 1)
   - [0002_phase2_settlement.sql](./supabase/migrations/0002_phase2_settlement.sql) (Quyết toán, VietQR, thông tin ngân hàng và RPC Phase 2)
5. Sao chép `.env.example` thành `.env.local`; điền Supabase Project URL và anon/publishable key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Chạy `npm run dev`, rồi mở `http://localhost:3000`.

> [!NOTE]
> Không đưa `service_role` key vào biến `NEXT_PUBLIC_*` hoặc mã phía trình duyệt. Mọi thao tác ghi dữ liệu nhạy cảm được thực hiện qua RPC `SECURITY DEFINER` và chính sách RLS.

---

## Phạm vi tính năng đã triển khai

### Giai đoạn 1 — Chi tiêu & Số dư tối thiểu
- Tạo chuyến đi, tạo phiên đăng nhập ẩn danh (anonymous auth).
- Mời thành viên qua mã mời và link tham gia trực tiếp.
- Ghi khoản chi chia đều, chọn người trả và danh sách người tham gia.
- Tính toán số dư tức thời (VND số nguyên), bảo toàn bất biến tổng số dư cả nhóm bằng 0.

### Giai đoạn 2 — Quyết toán & VietQR
- **Tối giản số giao dịch nợ**: Thuật toán heuristic H1 (ghép cặp khớp chính xác) + H2 (tham lam) tìm tập giao dịch chuyển tiền ít nhất.
- **Tạo mã VietQR chuẩn EMVCo**: Tự tạo chuỗi TLV EMVCo và tính mã kiểm định CRC-16/CCITT-FALSE 100% ở phía client, không phụ thuộc API bên ngoài, bảo mật thông tin tài khoản.
- **Thông tin nhận tiền cá nhân**: Thành viên tự lưu tài khoản ngân hàng (BIN ngân hàng, số tài khoản, tên chủ tài khoản).
- **Quy trình chuyển tiền & xác nhận 2 chiều**:
  - Người chuyển quét VietQR và bấm "Tôi đã chuyển tiền".
  - Người nhận (hoặc trưởng nhóm) kiểm tra và bấm "Xác nhận đã nhận tiền".
  - Số dư được trừ tương ứng ngay sau khi xác nhận.
- **Chốt sổ quyết toán (Lock/Unlock)**: Trưởng nhóm có thể khóa sổ chi tiêu trước khi chuyển tiền để số liệu không bị biến động.

---

## Cấu trúc thư mục mã nguồn

```
app/
  layout.tsx                    # Root layout + Providers (TanStack Query, Toaster)
  providers.tsx                 # QueryClientProvider & Toaster setup
  page.tsx                      # Trang chủ: Danh sách chuyến & form tạo chuyến mới
  join/page.tsx                 # Tham gia chuyến qua link/mã mời
  trips/[tripId]/
    layout.tsx                  # Trip header, tổng quan, metric cards & navigation tabs
    page.tsx                    # Tab Chi tiêu: Danh sách & form ghi chi tiêu
    settle/page.tsx             # Tab Quyết toán: Gợi ý giao dịch, VietQR & lịch sử thanh toán
components/
  ui/                           # Base UI & shadcn components (button, card, input, ...)
  topbar.tsx                    # Top navigation bar đồng bộ
  trip-card.tsx                 # Card hiển thị chuyến đi
features/
  trips/                        # Hooks, types và components cho Trip
  expenses/                     # Hooks và form/list cho chi tiêu
  settlement/                   # Hooks và components cho quyết toán & tài khoản ngân hàng
lib/
  supabase.ts                  # Supabase client singleton & anonymous auth
  money.ts                     # formatVnd & splitEqually
  settlement/simplify.ts        # Thuật toán tối giản nợ
  vietqr/                       # Banks catalog, CRC-16/CCITT-FALSE, VietQR TLV builder
supabase/
  migrations/
    0001_phase1_core.sql        # Migration Phase 1
    0002_phase2_settlement.sql  # Migration Phase 2
```
