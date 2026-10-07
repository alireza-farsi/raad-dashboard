const faDigits = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };

export function toFa(input) {
  if (input === null || input === undefined) return '—';
  return String(input).replace(/[0-9]/g, (d) => faDigits[d]);
}

// Format a number in "billion toman" scale like the PDF (e.g. 1.07K, 164.72)
export function fmtAmount(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 2 } = opts;
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return toFa((value / 1000).toFixed(decimals)) + 'K';
  }
  return toFa(value.toFixed(decimals));
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

// Compact form for chart axis labels — keeps Latin digits for ECharts
// (ECharts does not shape Persian digits correctly when using its default
// number formatter). We post-process the axis text instead.
export function fmtCompact(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 1 } = opts;
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }
  return value.toFixed(decimals);
}

export function fmtPercent(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 1, multiply = true } = opts;
  const v = multiply ? value * 100 : value;
  return toFa(v.toFixed(decimals)) + '٪';
}

export function fmtRatio(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 2 } = opts;
  return toFa(value.toFixed(decimals));
}

export function fmtPercentSigned(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = 1, multiply = true } = opts;
  const v = multiply ? value * 100 : value;
  const sign = v > 0 ? '+' : '';
  return toFa(sign + v.toFixed(decimals)) + '٪';
}

// Year-over-year growth from current and previous values.
// Returns null if either is missing/zero/negative (avoid division by zero
// or misleading growth on negative numbers).
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

// Convert Latin digit string to Persian, used for chart axis labels.
export function faAxis(formatter) {
  return (val) => toFa(formatter ? formatter(val) : val);
}
