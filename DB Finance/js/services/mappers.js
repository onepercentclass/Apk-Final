/** Pemetaan antara state aplikasi (kunci singkat) dan dokumen API (nama lengkap). */

export function toApi(s) {
  return {
    profile: { name: s.name, theme: s.theme, hide_balance: !!s.hide },
    accounts: s.accounts.map(a => ({
      id: a.id, name: a.n, type: a.type, number: a.no || '', color: a.c, opening_balance: s.opening[a.id] || 0,
    })),
    transactions: s.txs.map(t => ({
      id: t.id, ts: t.ts, type: t.type, category: t.cat ?? null, amount: t.amount, date: t.date,
      description: t.desc || '', account_id: t.acct ?? null, from_account_id: t.from ?? null, to_account_id: t.to ?? null,
    })),
    budgets: Object.entries(s.budgets).map(([category, limit]) => ({ category, limit })),
    bills: s.bills.map(b => ({ id: b.id, name: b.n, amount: b.amt, due_date: b.due, icon: b.i, color: b.c })),
    goals: s.goals.map(g => ({ id: g.id, name: g.n, saved: g.saved, target: g.target, icon: g.i, color: g.c })),
    investments: s.invest.map(i => ({ id: i.id, name: i.n, value: i.val, return_pct: i.ret, icon: i.i, color: i.c })),
  };
}

/** Bagian yang tidak dikirim server (karena tier tidak punya akses) dibiarkan memakai nilai lokal. */
export function fromApi(d, current) {
  const tx = t => t.type === 'tf'
    ? { id: t.id, ts: t.ts, type: 'tf', from: t.from_account_id, to: t.to_account_id, amount: t.amount, date: t.date, desc: t.description }
    : { id: t.id, ts: t.ts, type: t.type, cat: t.category, amount: t.amount, date: t.date, desc: t.description, acct: t.account_id };
  const next = { ...current };
  if (d.profile) Object.assign(next, { name: d.profile.name, theme: d.profile.theme, hide: d.profile.hide_balance });
  if (d.accounts) {
    next.accounts = d.accounts.map(a => ({ id: a.id, n: a.name, type: a.type, no: a.number, c: a.color }));
    next.opening = Object.fromEntries(d.accounts.map(a => [a.id, a.opening_balance]));
  }
  if (d.transactions) next.txs = d.transactions.map(tx);
  if (d.budgets) next.budgets = Object.fromEntries(d.budgets.map(b => [b.category, b.limit]));
  if (d.bills) next.bills = d.bills.map(b => ({ id: b.id, n: b.name, amt: b.amount, due: b.due_date, i: b.icon, c: b.color }));
  if (d.goals) next.goals = d.goals.map(g => ({ id: g.id, n: g.name, saved: g.saved, target: g.target, i: g.icon, c: g.color }));
  if (d.investments) next.invest = d.investments.map(i => ({ id: i.id, n: i.name, val: i.value, ret: i.return_pct, i: i.icon, c: i.color }));
  return next;
}
