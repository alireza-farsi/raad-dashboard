import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import {
  PALETTE, makeGrid, makeTooltip, makeLegend, valueAxis, ratioAxis,
  categoryAxis, barSeries, lineSeries, niceMax, faNum,
} from '../utils/echartsTheme';

// "ارقام مقایسه‌ای (ترازنامه و صورت سود و زیان)" — 4 sections in a 2x2
// grid, each with a REBUILT chart on top and a KPI strip below.
//
//   1) روند تغییرات نسبت پوشش بهره — gradient bars (سود عملیاتی / هزینه مالی)
//      + gold ratio line (right axis)
//   2) مقایسه روند بدهی‌ها با حقوق صاحبان سهام — 4 smooth lines
//   3) روند سودآوری — 4 smooth lines
//   4) مقایسه روند دارایی‌ها با سرمایه ثبتی — 3 smooth lines

const SHORT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];
const LONG_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

// Years are Latin-digit keys into the by-year data maps; categoryAxis()
// renders them as Persian digits on screen.

export default function PageComparative1({
  incomeByYear,
  balanceByYear,
  ratiosByYear,
  financialsByYear,
  year,
}) {
  // ── Section 1 (REBUILT): interest coverage — bars + gold ratio line ──
  const coverageOption = useMemo(() => {
    const ebitData = SHORT_YEARS.map((y) => incomeByYear[y]?.ebit ?? null);
    const intData = SHORT_YEARS.map((y) => incomeByYear[y]?.interestExpense ?? null);
    const covData = SHORT_YEARS.map((y) => ratiosByYear[y]?.interestCoverage ?? null);
    return {
      grid: makeGrid({ top: 50 }),
      tooltip: makeTooltip((val, p) => (p?.seriesName === 'نسبت پوشش بهره' ? faNum(val, 2) : faNum(val, 1))),
      legend: makeLegend(['سود عملیاتی', 'هزینه مالی', 'نسبت پوشش بهره']),
      xAxis: categoryAxis(SHORT_YEARS),
      yAxis: [
        valueAxis({ max: niceMax([...ebitData, ...intData], 100) * 1.1 }),
        ratioAxis({ max: niceMax(covData, 5) * 1.1, decimals: 1 }),
      ],
      series: [
        barSeries({ name: 'سود عملیاتی', data: ebitData, color: PALETTE.teal, barWidth: 14 }),
        barSeries({ name: 'هزینه مالی', data: intData, color: PALETTE.danger, barWidth: 14 }),
        lineSeries({
          name: 'نسبت پوشش بهره',
          data: covData,
          color: PALETTE.gold,
          yAxisIndex: 1,
          width: 3,
        }),
      ],
    };
  }, [incomeByYear, ratiosByYear]);

  // ── Section 2 (REBUILT): liabilities vs equity — 4 smooth lines ──
  const liabEquityOption = useMemo(() => ({
    grid: makeGrid({ top: 50 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['حقوق صاحبان سهام', 'مجموع بدهی‌ها', 'درآمد عملیاتی', 'سرمایه ثبتی']),
    xAxis: categoryAxis(LONG_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'حقوق صاحبان سهام',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        color: PALETTE.teal,
        area: true,
      }),
      lineSeries({
        name: 'مجموع بدهی‌ها',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        color: PALETTE.danger,
      }),
      lineSeries({
        name: 'درآمد عملیاتی',
        data: LONG_YEARS.map((y) => incomeByYear[y]?.revenue ?? null),
        color: PALETTE.gold,
        dashed: true,
      }),
      lineSeries({
        name: 'سرمایه ثبتی',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        color: PALETTE.slate,
        symbol: 'diamond',
      }),
    ],
  }), [incomeByYear, balanceByYear]);

  // ── Section 3 (REBUILT): profitability — 4 smooth lines ──
  const profitabilityOption = useMemo(() => ({
    grid: makeGrid({ top: 50 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['سود عملیاتی', 'سود خالص', 'مجموع بدهی‌ها', 'حقوق صاحبان سهام']),
    xAxis: categoryAxis(SHORT_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'سود عملیاتی',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.ebit ?? null),
        color: PALETTE.teal,
        area: true,
      }),
      lineSeries({
        name: 'سود خالص',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.netProfit ?? null),
        color: PALETTE.gold,
        area: true,
      }),
      lineSeries({
        name: 'مجموع بدهی‌ها',
        data: SHORT_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        color: PALETTE.danger,
        dashed: true,
      }),
      lineSeries({
        name: 'حقوق صاحبان سهام',
        data: SHORT_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        color: PALETTE.slate,
      }),
    ],
  }), [incomeByYear, balanceByYear]);

  // ── Section 4 (REBUILT): assets vs stock — 3 smooth lines ──
  const assetsStockOption = useMemo(() => ({
    grid: makeGrid({ top: 50 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['حقوق صاحبان سهام', 'مجموع دارایی‌ها', 'سرمایه ثبتی']),
    xAxis: categoryAxis(LONG_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'حقوق صاحبان سهام',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        color: PALETTE.teal,
      }),
      lineSeries({
        name: 'مجموع دارایی‌ها',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalAssets ?? null),
        color: PALETTE.slate,
        area: true,
      }),
      lineSeries({
        name: 'سرمایه ثبتی',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        color: PALETTE.gold,
        symbol: 'diamond',
      }),
    ],
  }), [balanceByYear]);

  // KPI strips for each section (current year)
  const section1Kpis = useMemo(() => {
    const inc = incomeByYear[year];
    const r = ratiosByYear[year];
    return [
      { label: 'سود عملیاتی', value: inc?.ebit },
      { label: 'هزینه مالی', value: inc?.interestExpense },
      { label: 'نسبت پوشش بهره', value: r?.interestCoverage, isRatio: true },
    ];
  }, [incomeByYear, ratiosByYear, year]);

  const section2Kpis = useMemo(() => {
    const bal = balanceByYear[year];
    const inc = incomeByYear[year];
    return [
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
      { label: 'مجموع بدهی‌ها', value: bal?.totalLiabilities },
      { label: 'درآمد عملیاتی', value: inc?.revenue },
      { label: 'سرمایه ثبتی', value: bal?.stock },
    ];
  }, [incomeByYear, balanceByYear, year]);

  const section3Kpis = useMemo(() => {
    const inc = incomeByYear[year];
    const bal = balanceByYear[year];
    return [
      { label: 'سود عملیاتی', value: inc?.ebit },
      { label: 'سود خالص', value: inc?.netProfit },
      { label: 'مجموع بدهی‌ها', value: bal?.totalLiabilities },
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
    ];
  }, [incomeByYear, balanceByYear, year]);

  const section4Kpis = useMemo(() => {
    const bal = balanceByYear[year];
    return [
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
      { label: 'مجموع دارایی‌ها', value: bal?.totalAssets },
      { label: 'سرمایه ثبتی', value: bal?.stock },
    ];
  }, [balanceByYear, year]);

  return (
    <div className="page-inner">
      <div className="comparative-grid">
        <Section
          title="روند تغییرات نسبت پوشش بهره"
          chart={<EChart option={coverageOption} style={{ height: 230 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="مقایسه روند بدهی‌ها با حقوق صاحبان سهام"
          chart={<EChart option={liabEquityOption} style={{ height: 230 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند سودآوری"
          chart={<EChart option={profitabilityOption} style={{ height: 230 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="مقایسه روند دارایی‌ها با سرمایه ثبتی"
          chart={<EChart option={assetsStockOption} style={{ height: 230 }} />}
          kpis={section4Kpis}
        />
      </div>
      <div className="unit-note" style={{ marginTop: 4 }}>
        تمامی ارقام به میلیارد تومان می‌باشد.
      </div>
    </div>
  );
}

function Section({ title, chart, kpis }) {
  return (
    <div className="comparative-cell">
      <div className="chart-card compact" style={{ marginBottom: 0 }}>
        <div className="chart-title compact">{title}</div>
        {chart}
      </div>
      <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, marginTop: 6 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="comparative-kpi">
            <div className="comparative-kpi-label">{kpi.label}</div>
            <div className="comparative-kpi-value">
              {kpi.isRatio
                ? (kpi.value !== null && kpi.value !== undefined ? toFa(kpi.value.toFixed(2)) : '—')
                : formatNum(kpi.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNum(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return toFa(n.toLocaleString('en-US', { maximumFractionDigits: 2 }));
}
