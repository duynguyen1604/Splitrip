export type Transfer = {
  from: string;
  to: string;
  amount: number;
};

/**
 * Tối giản số giao dịch chuyển tiền từ số dư (net balances).
 * Sử dụng heuristic H1 (ghép cặp khớp chính xác) + H2 (tham lam lấy chủ nợ lớn nhất và con nợ lớn nhất).
 * 
 * @param net Map giữa member_id và số dư (net: dương là chủ nợ, âm là con nợ).
 * @param order Thứ tự ưu tiên của thành viên (thường là order theo created_at).
 */
export function simplifyDebts(
  net: Map<string, number>,
  order: string[]
): Transfer[] {
  // Lọc chỉ những người có số dư khác 0
  const bal = new Map<string, number>();
  for (const [id, val] of net.entries()) {
    if (val !== 0) {
      bal.set(id, val);
    }
  }

  const out: Transfer[] = [];

  // H1: Ghép cặp khớp chính xác (net[c] === -net[d])
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of order) {
      const cVal = bal.get(c);
      if (!cVal || cVal <= 0) continue;

      const d = order.find(
        (x) => x !== c && bal.has(x) && bal.get(x)! === -cVal
      );

      if (d) {
        out.push({ from: d, to: c, amount: cVal });
        bal.delete(c);
        bal.delete(d);
        changed = true;
        break; // Quét lại từ đầu
      }
    }
  }

  // Helper chọn phần tử lớn nhất, hòa thì theo thứ tự order
  function pickMax(
    candidates: [string, number][],
    preferredOrder: string[]
  ): string {
    let best = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      const curr = candidates[i];
      if (curr[1] > best[1]) {
        best = curr;
      } else if (curr[1] === best[1]) {
        // Hòa: theo vị trí trong order
        const currIdx = preferredOrder.indexOf(curr[0]);
        const bestIdx = preferredOrder.indexOf(best[0]);
        if (currIdx !== -1 && (bestIdx === -1 || currIdx < bestIdx)) {
          best = curr;
        }
      }
    }
    return best[0];
  }

  // H2: Tham lam
  while (bal.size > 0) {
    const creditors = [...bal.entries()].filter(([, v]) => v > 0);
    const debtors = [...bal.entries()]
      .filter(([, v]) => v < 0)
      .map(([k, v]) => [k, -v] as [string, number]);

    if (creditors.length === 0 || debtors.length === 0) {
      break;
    }

    const c = pickMax(creditors, order);
    const d = pickMax(debtors, order);

    const cVal = bal.get(c)!;
    const dVal = -bal.get(d)!;
    const t = Math.min(cVal, dVal);

    if (t > 0) {
      out.push({ from: d, to: c, amount: t });
      const nextC = cVal - t;
      const nextD = -dVal + t;

      if (nextC === 0) bal.delete(c);
      else bal.set(c, nextC);

      if (nextD === 0) bal.delete(d);
      else bal.set(d, nextD);
    } else {
      break;
    }
  }

  return out;
}
