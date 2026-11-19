import { crc16CcittFalse } from "./crc16";

function tlv(id: string, val: string): string {
  if (!/^\d{2}$/.test(id)) {
    throw new Error(`Mã TLV không hợp lệ: ${id}`);
  }
  if (val.length > 99) {
    throw new RangeError(`Giá trị TLV ${id} vượt quá 99 ký tự.`);
  }

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
    .slice(0, 25)
    .trimEnd();
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
  const normalizedBankBin = bankBin.trim();
  const normalizedAccountNumber = accountNumber.trim();

  if (!/^\d{6}$/.test(normalizedBankBin)) {
    throw new Error("Mã BIN ngân hàng phải gồm đúng 6 chữ số.");
  }
  if (
    normalizedAccountNumber.length < 3 ||
    normalizedAccountNumber.length > 30 ||
    !/^[\x20-\x7e]+$/.test(normalizedAccountNumber)
  ) {
    throw new Error("Số tài khoản phải có từ 3 đến 30 ký tự hợp lệ.");
  }
  if (
    amount !== undefined &&
    (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000_000)
  ) {
    throw new RangeError("Số tiền VietQR phải là số nguyên từ 1 đến 1 tỷ đồng.");
  }

  let res = "";

  // 00: Payload Format Indicator (01)
  res += tlv("00", "01");

  // 01: Point of Initiation Method (12 = Dynamic có số tiền, 11 = Static)
  res += tlv("01", amount === undefined ? "11" : "12");

  // 38: Merchant Account Information (NAPAS)
  const beneficiaryOrg =
    tlv("00", normalizedBankBin) + tlv("01", normalizedAccountNumber);
  const tag38 =
    tlv("00", "A000000727") +
    tlv("01", beneficiaryOrg) +
    tlv("02", "QRIBFTTA");
  res += tlv("38", tag38);

  // 53: Transaction Currency (704 = VND)
  res += tlv("53", "704");

  // 54: Transaction Amount
  if (amount !== undefined) {
    res += tlv("54", String(amount));
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
