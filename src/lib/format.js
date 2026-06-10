// Formatting helpers shared across the app.

// m is in € millions
export function fmtEur(m) {
  if (m >= 1000) return '€' + (m / 1000).toFixed(m % 1000 === 0 ? 0 : 1) + 'B';
  return '€' + m + 'M';
}
