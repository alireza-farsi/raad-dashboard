// Shared ECharts helpers for the dashboard.
// All charts use the Ravi FaNum font and Persian digits on axis labels.

import { toFa } from './format';

const FONT = "'Ravi FaNum', Tahoma, sans-serif";

const PALETTE = {
  teal: '#1d9e75',
  tealDark: '#085041',
  tealLight: '#5dcaa5',
  tealPale: '#e1f5ee',
  gold: '#b7a26b',
  ink: '#1f2421',
  inkSoft: '#5b6560',
  borderSoft: '#dedad0',
  creamLight: '#f4f2ec',
  white: '#ffffff',
  danger: '#c0392b',
  warning: '#b7862f',
  info: '#2c7fb8',
  purple: '#7e57c2',
  series: [
    '#085041', '#1d9e75', '#5dcaa5', '#b7a26b',
    '#2c7fb8', '#7e57c2', '#c0392b', '#b7862f',
  ],
};

// Take a number formatter function and wrap it so the output uses Persian digits.
function faFormatter(fn) {
  return (val) => toFa(fn(val));
}

// Convert numeric value to Persian-digit label in billions (no K suffix — chart compact formatter handles it).
function toFaPlain(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return toFa(value);
}

export const baseTextStyle = {
  fontFamily: FONT,
  color: PALETTE.ink,
};

export const baseGrid = {
  left: 60,
  right: 30,
  top: 40,
  bottom: 40,
  containLabel: true,
};

export const baseTooltip = {
  trigger: 'axis',
  axisPointer: { type: 'shadow' },
  backgroundColor: PALETTE.white,
  borderColor: PALETTE.borderSoft,
  borderWidth: 1,
  textStyle: { fontFamily: FONT, color: PALETTE.ink, fontSize: 12 },
  extraCssText: 'direction: rtl; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);',
  valueFormatter: (val) => (typeof val === 'number' ? toFa(val.toFixed(2)) : val),
};

export const baseLegend = {
  show: true,
  type: 'scroll',
  top: 0,
  right: 0,
  textStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11 },
  itemWidth: 10,
  itemHeight: 10,
  itemGap: 12,
};

// Build default axis formatters that turn numeric values into Persian digit strings.
export function faValueAxis(opts = {}) {
  const { unit = '', decimals = 0, compact = false } = opts;
  return {
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (val) => {
        let s;
        if (compact && Math.abs(val) >= 1000) {
          s = (val / 1000).toFixed(1) + 'K';
        } else {
          s = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
        }
        return toFa(s) + (unit ? ' ' + unit : '');
      },
    },
    axisLine: { lineStyle: { color: PALETTE.borderSoft } },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: PALETTE.borderSoft, type: 'dashed' } },
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

export { PALETTE, FONT, faFormatter, toFaPlain };
