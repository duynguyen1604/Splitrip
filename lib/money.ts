export function formatVnd(amount: number | string) {
  return `${new Intl.NumberFormat("vi-VN").format(Number(amount))}₫`;
}

export function splitEqually(total: number, memberIds: string[]) {
  if (!Number.isSafeInteger(total) || total < 1) throw new Error("Số tiền phải là số nguyên dương.");
  if (memberIds.length === 0) throw new Error("Chọn ít nhất một người tham gia.");
  const base = Math.floor(total / memberIds.length);
  const remainder = total % memberIds.length;
  return memberIds.map((member_id, index) => ({ member_id, owed_amount: base + (index < remainder ? 1 : 0) }));
}
