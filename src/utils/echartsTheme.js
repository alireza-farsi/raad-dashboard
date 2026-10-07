// Shared ECharts helpers for the dashboard.
// All charts use the Ravi FaNum font and Persian digits on axis labels.
// Palette matches the UI-sample design: slate bars, teal lines,
// gold/tan/cyan accents, dashed light grid lines.

import { toFa } from './format';

const FONT = "'Ravi FaNum', Tahoma, sans-serif";

const PALETTE = {
  teal: '#14967f',
  tealDark: '#0b5d47',
  tealDeep: '#083f35',
  tealLight: '#7cc7ba',
  tealPale: '#dff2ec',
  gold: '#d4a373',
  goldDeep: '#c5a059',
  amber: '#eab308',
  slate: '#1e293b',
  ink: '#1f2937',
  inkSoft: '#6b7280',
  borderSoft: '#e7e2d5',
  gridLine: '#e5e7eb',
  bgSoft: '#faf8f2',
  creamLight: '#f4f0e6',
  white: '#ffffff',
  danger: '#b91c1c',
  warning: '#b45309',
  info: '#0e7490',
  cyan: '#67e8f9',
  purple: '#7e57c2',
  series: [
    '#1e293b', // slate 800 — primary bars (PDF)
    '#14967f', // teal 600 — primary line/bars (PDF)
    '#d4a373', // tan/gold (PDF)
    '#67e8f9', // cyan 300 (PDF)
    '#eab308', // yellow/gold (PDF)
    '#7e57c2', // purple
    '#b91c1c', // red
    '#0e7490', // cyan 700
  ],
};

// Take a number formatter function and wrap it so the output uses Persian digits.
function faFormatter(fn) {
  return (val) => toFa(fn(val));
}

// Convert numeric value to Persian-digit label.
function toFaPlain(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return toFa(value);
}

export const baseTextStyle = {
  fontFamily: FONT,
  color: PALETTE.ink,
};

export const baseGrid = {
  left: 56,
  right: 26,
  top: 42,
  bottom: 34,
  containLabel: true,
};

export const baseTooltip = {
  trigger: 'axis',
  axisPointer: {
    type: 'shadow',
    shadowStyle: { color: 'rgba(20, 150, 127, 0.06)' },
  },
  backgroundColor: PALETTE.white,
  borderColor: PALETTE.borderSoft,
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { fontFamily: FONT, color: PALETTE.ink, fontSize: 12 },
  extraCssText:
    'direction: rtl; border-radius: 10px; box-shadow: 0 8px 26px -8px rgba(31,41,55,0.25);',
  valueFormatter: (val) => (typeof val === 'number' ? toFa(val.toFixed(2)) : val),
};

export const baseLegend = {
  show: true,
  type: 'scroll',
  top: 0,
  right: 0,
  icon: 'circle',
  textStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11 },
  itemWidth: 9,
  itemHeight: 9,
  itemGap: 14,
};

// Build default axis formatters that turn numeric values into Persian digit
// strings with thousands separators. Never uses the "K" compact suffix.
export function faValueAxis(opts = {}) {
  const { unit = '', decimals = 0 } = opts;
  return {
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (val) => {
        let s = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
        const n = Number(s.replace(/[^\d.-]/g, ''));
        if (!Number.isNaN(n)) {
          s = n.toLocaleString('en-US', { maximumFractionDigits: decimals });
        }
        return toFa(s.replace(/,/g, '٬')) + (unit ? ' ' + unit : '');
      },
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: PALETTE.gridLine, type: 'dashed' } },
  };
}

export function faCategoryAxis() {
  return {
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (val) => toFa(val),
    },
    axisLine: { lineStyle: { color: PALETTE.borderSoft } },
    axisTick: { show: false },
  };
}

// Shared bar styling (PDF: flat slate/teal bars with rounded tops)
export function barStyle(color, opts = {}) {
  const { barWidth = undefined, radius = [4, 4, 0, 0] } = opts;
  return {
    type: 'bar',
    barWidth,
    itemStyle: { color, borderRadius: radius },
    emphasis: { itemStyle: { color, opacity: 0.85 } },
  };
}

export { PALETTE, FONT, faFormatter, toFaPlain };
