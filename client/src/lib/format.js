const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatPrice = (n) => (Number(n) === 0 ? 'Free' : inr.format(Number(n) || 0));
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—';
export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
export const firstName = (name = '') => name.trim().split(/\s+/)[0] || 'there';
export const plural = (n, word) => `${n} ${n === 1 ? word : `${word}s`}`;
