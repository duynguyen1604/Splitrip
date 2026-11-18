export const CATEGORIES: Record<string, string> = {
  food: "Ăn uống",
  transport: "Di chuyển",
  lodging: "Lưu trú",
  tickets: "Vé tham quan",
  other: "Khác",
};

export function localDateString(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
