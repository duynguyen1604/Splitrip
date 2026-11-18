import { crc16CcittFalse } from "./crc16";

function tlv(id: string, val: string): string {
  const len = String(val.length).padStart(2, "0");
  return `${id}${len}${val}`;
}

/**
 * Chuẩn hóa nội dung chuyển khoản theo chuẩn VietQR:
 * Bỏ dấu tiếng Việt, viết hoa, chỉ giữ chữ cái, số và khoảng trắng, tối đa 25 ký tự.
 */
export function sanitizeMemo(memo: string): string {
  return memo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, 25);
}

export type VietQrPayloadOptions = {
  bankBin: string;
  accountNumber: string;
  amount?: number;
  memo?: string;
};

/**
 * Tạo chuỗi chuẩn EMVCo cho VietQR ngân hàng.
 */
export function buildVietQrPayload({
  bankBin,
  accountNumber,
  amount,
  memo,
}: VietQrPayloadOptions): string {
  let res = "";

  // 00: Payload Format Indicator (01)
  res += tlv("00", "01");

  // 01: Point of Initiation Method (12 = Dynamic có số tiền, 11 = Static)
  res += tlv("01", amount && amount > 0 ? "12" : "11");

  // 38: Merchant Account Information (NAPAS)
  const beneficiaryOrg = tlv("00", bankBin.trim()) + tlv("01", accountNumber.trim());
  const tag38 =
    tlv("00", "A000000727") +
    tlv("01", beneficiaryOrg) +
    tlv("02", "QRIBFTTA");
  res += tlv("38", tag38);

  // 53: Transaction Currency (704 = VND)
  res += tlv("53", "704");

  // 54: Transaction Amount
  if (amount && amount > 0) {
    res += tlv("54", String(Math.floor(amount)));
  }

  // 58: Country Code (VN)
  res += tlv("58", "VN");

  // 62: Additional Data (08: Nội dung chuyển tiền)
  if (memo) {
    const cleanMemo = sanitizeMemo(memo);
    if (cleanMemo) {
      res += tlv("62", tlv("08", cleanMemo));
    }
  }

  // 63: CRC-16 (bao gồm tiền tố 6304)
  const raw = `${res}6304`;
  const checksum = crc16CcittFalse(raw);

  return `${raw}${checksum}`;
}
