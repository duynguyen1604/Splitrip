/**
 * Tính CRC-16/CCITT-FALSE cho chuẩn EMVCo/VietQR.
 * Đa thức: 0x1021
 * Giá trị khởi tạo: 0xFFFF
 * Không đảo bit vào/ra, xor out: 0x0000
 * Test vector: '123456789' => '29B1'
 */
export function crc16CcittFalse(str: string): string {
  let crc = 0xffff;
  const poly = 0x1021;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    crc ^= code << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ poly) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}
