const faDigits = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };

export function toFa(input) {
  if (input === null || input === undefined) return '—';
  return String(input).replace(/[0-9]/g, (d) => faDigits[d]);
}

// Format a number in "billion toman" scale.
// The PDF shows numbers like 1,070.86 (no K suffix) and 164.72.
// We round to 2 decimals and add Persian thousands separators.
export function fmtAmount(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 2 } = opts;
  return fmtNum(value, { decimals });
}

// Plain number with thousands separators, Persian digits, configurable decimals
export function fmtNum(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 2 } = opts;
  const fixed = Number(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const result = decPart ? `${withSep}.${decPart}` : withSep;
  return toFa(result);
}

// Integer-formatted value (no decimals) — used by compact tables.
export function fmtInt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const n = Math.round(Number(value));
  return toFa(n.toLocaleString('en-US'));
}

// Chart axis label formatter — outputs Persian digits with thousands
// separators. Never uses the "K" compact form.
export function fmtAxis(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 0 } = opts;
  const n = Number(value);
  const s = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  return toFa(s.replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
}

export function fmtPercent(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 1, multiply = true } = opts;
  const v = multiply ? value * 100 : value;
  return toFa(v.toFixed(decimals)) + '٪';
}

export function fmtPercentSigned(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 1, multiply = true } = opts;
  const v = multiply ? value * 100 : value;
  const sign = v > 0 ? '+' : '';
  return toFa(sign + v.toFixed(decimals)) + '٪';
}

export function fmtRatio(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 2 } = opts;
  return toFa(value.toFixed(decimals));
}

// Year-over-year growth from current and previous values.
export function yoyGrowth(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null;
  }
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

export function safeDiv(num, den) {
  if (num === null || num === undefined || den === null || den === undefined) return null;
  if (den === 0) return null;
  return num / den;
}
