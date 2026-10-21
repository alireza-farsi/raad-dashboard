// ============================================================================
// echartsTheme — REBUILT chart factory system (v2)
//
// All charts in the dashboard are built from these factories so the whole
// app shares one coherent design language, taken from the UI-sample PDF:
//
//   • bars  — subtle vertical gradient, rounded top corners
//   • lines — smooth, circle markers, optional soft gradient area fill
//   • grid  — dashed light lines, no axis lines, clean margins
//   • legend— top, circular icons, scrollable
//   • tooltip — RTL, white card w/ shadow, Persian digits + ٬ separators
//   • right axis for ratios/percentages (dual-axis combos)
//
// Every factory returns plain objects, so pages compose them freely.
// ============================================================================

import { toFa } from './format';

const FONT = "'Ravi FaNum', Tahoma, sans-serif";

// --- palette (PDF tokens) ---------------------------------------------------
export const PALETTE = {
  // brand
  teal: '#14967f',
  tealDark: '#0b5d47',
  tealDeep: '#083f35',
  tealLight: '#2a9d8f',
  tealPale: '#7cc7ba',
  gold: '#d4a373',
  goldDeep: '#c5a059',
  slate: '#1e293b',
  slateLight: '#3b4b63',
  cyan: '#67e8f9',
  // semantic
  danger: '#c2452d',
  warning: '#b45309',
  info: '#0e7490',
  // neutrals
  ink: '#1f2937',
  inkSoft: '#6b7280',
  borderSoft: '#e7e2d5',
  gridLine: '#e8e5db',
  white: '#ffffff',
};

// Series color cycle — slate bars first, teal lines, gold/cyan accents (PDF).
export const SERIES_COLORS = [
  PALETTE.slate,
  PALETTE.teal,
  PALETTE.gold,
  PALETTE.cyan,
  PALETTE.tealLight,
  PALETTE.warning,
  PALETTE.info,
  PALETTE.danger,
];

// --- number helpers ----------------------------------------------------------

/** Persian digits with thousands separators. */
export function faNum(v, decimals = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  const s = n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return toFa(s.replace(/,/g, '٬'));
}

/** Compute a clean "nice" axis maximum from data values. */
export function niceMax(values, fallback = 1) {
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
  if (valid.length === 0) return fallback;
  const max = Math.max(...valid);
  if (max <= 0) return fallback;
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const norm = max / mag;
  let nice;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

/** Lighten a hex color by mixing toward white (t = 0..1). */
function lighten(hex, t) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (x) => Math.round(x + (255 - x) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Hex → `rgba(r,g,b,a)` string. */
function rgba(hex, a) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// --- layout building blocks --------------------------------------------------

export const baseGrid = {
  left: 14,
  right: 18,
  top: 44,
  bottom: 8,
  containLabel: true,
};

export function makeGrid(opts = {}) {
  return { ...baseGrid, ...opts };
}

export function makeLegend(names, opts = {}) {
  return {
    type: 'scroll',
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 9,
    itemHeight: 9,
    itemGap: 16,
    textStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11 },
    pageIconColor: PALETTE.teal,
    pageIconInactiveColor: PALETTE.gridLine,
    pageTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft },
    ...(names ? { data: names } : {}),
    ...opts,
  };
}

/**
 * RTL axis tooltip. `fmt` maps (value, seriesName) → string.
 * Defaults to Persian thousand-separated numbers.
 */
export function makeTooltip(fmt, opts = {}) {
  return {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: { color: rgba('#14967f', 0.45), width: 1.5, type: 'solid' },
      crossStyle: { color: PALETTE.gridLine },
    },
    backgroundColor: PALETTE.white,
    borderColor: PALETTE.borderSoft,
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { fontFamily: FONT, color: PALETTE.ink, fontSize: 12 },
    extraCssText:
      'direction: rtl; border-radius: 10px; box-shadow: 0 10px 30px -10px rgba(31,41,55,0.35);',
    valueFormatter: fmt ?? ((v) => faNum(v, 1)),
    ...opts,
  };
}

// --- axes ---------------------------------------------------------------------

/** Left value axis — amounts in میلیارد تومان. */
export function valueAxis(opts = {}) {
  const { name = 'میلیارد تومان', max, min = 0, decimals = 0 } = opts;
  return {
    type: 'value',
    name,
    nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10, padding: [0, 0, 0, 6] },
    min,
    ...(max !== undefined ? { max } : {}),
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (v) => faNum(v, decimals),
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: PALETTE.gridLine, type: 'dashed' } },
  };
}

/** Right value axis — unitless ratio (نسبت). */
export function ratioAxis(opts = {}) {
  const { name = 'نسبت', max, min = 0, decimals = 1 } = opts;
  return {
    type: 'value',
    name,
    nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10, padding: [0, 6, 0, 0] },
    min,
    ...(max !== undefined ? { max } : {}),
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (v) => faNum(v, decimals),
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
  };
}

/** Right value axis — percentages. */
export function percentAxis(opts = {}) {
  const axis = ratioAxis({ name: 'درصد', ...opts });
  axis.axisLabel.formatter = (v) => faNum(v, opts.decimals ?? 0) + '٪';
  return axis;
}

/** Category (years) axis — renders Latin-digit keys as Persian digits. */
export function categoryAxis(years, opts = {}) {
  return {
    type: 'category',
    data: years,
    axisLabel: {
      fontFamily: FONT,
      color: PALETTE.inkSoft,
      fontSize: 11,
      formatter: (v) => toFa(v),
      margin: 12,
    },
    axisLine: { lineStyle: { color: PALETTE.borderSoft } },
    axisTick: { show: false },
    ...opts,
  };
}

// --- series factories ----------------------------------------------------------

/**
 * Gradient bar series (PDF style: subtle vertical gradient + rounded top).
 */
export function barSeries({ name, data, color, yAxisIndex, barWidth = 18, stack }) {
  return {
    name,
    type: 'bar',
    data,
    ...(yAxisIndex !== undefined ? { yAxisIndex } : {}),
    ...(stack ? { stack } : {}),
    barWidth,
    itemStyle: {
      borderRadius: [5, 5, 0, 0],
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: lighten(color, 0.18) },
          { offset: 1, color },
        ],
      },
    },
    emphasis: {
      focus: 'series',
      itemStyle: { shadowBlur: 12, shadowColor: rgba(color, 0.4), shadowOffsetY: 3 },
    },
  };
}

/**
 * Smooth line series with circle markers and an optional soft gradient
 * area fill (used for trend charts).
 */
export function lineSeries({
  name,
  data,
  color,
  yAxisIndex,
  area = false,
  dashed = false,
  symbol = 'circle',
  width = 2.6,
  symbolSize = 7,
}) {
  return {
    name,
    type: 'line',
    data,
    smooth: 0.35,
    symbol,
    symbolSize,
    ...(yAxisIndex !== undefined ? { yAxisIndex } : {}),
    lineStyle: { color, width, ...(dashed ? { type: 'dashed' } : {}) },
    itemStyle: {
      color,
      borderColor: PALETTE.white,
      borderWidth: 2,
      shadowBlur: 6,
      shadowColor: rgba(color, 0.45),
      shadowOffsetY: 2,
    },
    ...(area
      ? {
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: rgba(color, 0.22) },
                { offset: 1, color: rgba(color, 0.01) },
              ],
            },
          },
        }
      : {}),
    emphasis: { focus: 'series', scale: 1.4 },
  };
}

// --- misc ------------------------------------------------------------------------

/** Base animation timings so all charts feel the same. */
export const baseAnimation = {
  animationDuration: 650,
  animationDurationUpdate: 350,
  animationEasing: 'cubicOut',
  animationEasingUpdate: 'cubicInOut',
};

// Backwards-compatible aliases (older code imported these names).
export const baseTooltip = makeTooltip();
export const baseLegend = makeLegend();
export { FONT };
