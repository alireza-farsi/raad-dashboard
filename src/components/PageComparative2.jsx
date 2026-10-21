import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import {
  PALETTE, makeGrid, makeTooltip, makeLegend, valueAxis, ratioAxis,
  categoryAxis, barSeries, lineSeries, niceMax, faNum,
} from '../utils/echartsTheme';

// "ارقام مقایسه‌ای (ترازنامه و اعتبارات)" — 4 sections in a 2x2 grid.
// Each section: REBUILT dual-axis chart on top (gradient bars for amounts +
// smooth ratio line on the right axis) and a KPI strip below.
// Axis max values are derived from the data via niceMax so nothing collapses.

// Two year ranges: balance/ratio data covers 1396-1404, credit-facility
// data only exists from 1398 (values from 1401), so credit sections use a
// shorter range that still shows the "no facilities" period.
const TREND_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403'];
const CREDIT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403', '1404'];

export default function PageComparative2({
  balanceByYear,
  ratiosByYear,
  creditRealByYear,
  creditByYear,
  year,
}) {
  const bal = balanceByYear[year] || {};
  const r = ratiosByYear[year] || {};
  const cr = creditRealByYear[year] || {};

  // Pre-compute the data arrays so we can derive axis max from them.
  const activeLoanData = CREDIT_YEARS.map((y) => creditRealByYear[y]?.activeBankFacility ?? null);
  const quickRatioData = CREDIT_YEARS.map((y) => ratiosByYear[y]?.quickRatio ?? null);
  const totalLiabData = TREND_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null);
  const equityRatioData = TREND_YEARS.map((y) => ratiosByYear[y]?.equityRatio ?? null);
  const guarTahodData = CREDIT_YEARS.map((y) => creditRealByYear[y]?.guarTahod ?? null);
  const loanToEquityData = CREDIT_YEARS.map((y) => {
    const loan = creditRealByYear[y]?.activeBankFacility;
    const eq = balanceByYear[y]?.equities;
    if (loan === null || loan === undefined || eq === null || eq === undefined || eq === 0) return null;
    return loan / eq;
  });
  const currentAssetsData = TREND_YEARS.map((y) => balanceByYear[y]?.totalCurrentAssets ?? null);
  const currentRatioData = TREND_YEARS.map((y) => ratiosByYear[y]?.currentRatio ?? null);

  // ── Section 1 (REBUILT): quick ratio + active bank loan ──
  const quickOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((val, p) => (p?.seriesName === 'نسبت آنی' ? faNum(val, 2) : faNum(val, 1))),
    legend: makeLegend(['وام فعال بانکی', 'نسبت آنی']),
    xAxis: categoryAxis(CREDIT_YEARS),
    yAxis: [
      valueAxis({ max: niceMax(activeLoanData, 300) * 1.08 }),
      ratioAxis({ max: niceMax(quickRatioData, 3) * 1.15, decimals: 1 }),
    ],
    series: [
      barSeries({ name: 'وام فعال بانکی', data: activeLoanData, color: PALETTE.gold, barWidth: 16 }),
      lineSeries({
        name: 'نسبت آنی',
        data: quickRatioData,
        color: PALETTE.tealDark,
        yAxisIndex: 1,
        width: 3,
      }),
    ],
  }), [activeLoanData, quickRatioData]);

  // ── Section 2 (REBUILT): ownership ratio trend ──
  const equityOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((val, p) => (p?.seriesName === 'نسبت مالکانه' ? faNum(val * 100, 0) + '٪' : faNum(val, 1))),
    legend: makeLegend(['مجموع بدهی‌ها', 'نسبت مالکانه']),
    xAxis: categoryAxis(TREND_YEARS),
    yAxis: [
      valueAxis({ max: niceMax(totalLiabData, 1000) * 1.08 }),
      ratioAxis({ max: 1, decimals: 1, name: 'درصد' }),
    ],
    series: [
      barSeries({ name: 'مجموع بدهی‌ها', data: totalLiabData, color: PALETTE.slate, barWidth: 16 }),
      lineSeries({
        name: 'نسبت مالکانه',
        data: equityRatioData,
        color: PALETTE.teal,
        yAxisIndex: 1,
        width: 3,
      }),
    ],
  }), [totalLiabData, equityRatioData]);

  // ── Section 3 (REBUILT): active guarantees vs loan-to-equity ratio ──
  const loanEquityOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((val, p) => (p?.seriesName === 'نسبت وام فعال به ح.ص.س' ? faNum(val, 2) : faNum(val, 1))),
    legend: makeLegend(['ضمانت‌نامه فعال بانکی', 'نسبت وام فعال به ح.ص.س']),
    xAxis: categoryAxis(CREDIT_YEARS),
    yAxis: [
      valueAxis({ max: niceMax(guarTahodData, 10) * 1.1, decimals: 0 }),
      ratioAxis({ max: niceMax(loanToEquityData, 1) * 1.15, decimals: 2 }),
    ],
    series: [
      barSeries({ name: 'ضمانت‌نامه فعال بانکی', data: guarTahodData, color: PALETTE.teal, barWidth: 16 }),
      lineSeries({
        name: 'نسبت وام فعال به ح.ص.س',
        data: loanToEquityData,
        color: PALETTE.gold,
        symbol: 'diamond',
        yAxisIndex: 1,
        width: 3,
      }),
    ],
  }), [guarTahodData, loanToEquityData]);

  // ── Section 4 (REBUILT): current ratio trend ──
  const currentRatioOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((val, p) => (p?.seriesName === 'نسبت جاری' ? faNum(val, 2) : faNum(val, 1))),
    legend: makeLegend(['دارایی‌های جاری', 'نسبت جاری']),
    xAxis: categoryAxis(TREND_YEARS),
    yAxis: [
      valueAxis({ max: niceMax(currentAssetsData, 1000) * 1.08 }),
      ratioAxis({ max: niceMax(currentRatioData, 3) * 1.15, decimals: 1 }),
    ],
    series: [
      barSeries({ name: 'دارایی‌های جاری', data: currentAssetsData, color: PALETTE.slate, barWidth: 16 }),
      lineSeries({
        name: 'نسبت جاری',
        data: currentRatioData,
        color: PALETTE.teal,
        symbol: 'diamond',
        yAxisIndex: 1,
        width: 3,
      }),
    ],
  }), [currentAssetsData, currentRatioData]);

  // KPI strips for each section (current year)
  const section1Kpis = [
    { label: 'بدهی جاری', value: bal.totalCurrentLiabilities },
    { label: 'دارایی نقدشونده', value: (bal.cash ?? 0) + (bal.shortTermInvestments ?? 0) || null },
    { label: 'دارایی‌های جاری', value: bal.totalCurrentAssets },
    { label: 'نسبت آنی', value: r.quickRatio, isRatio: true },
  ];
  const section2Kpis = [
    { label: 'حقوق صاحبان سهام', value: bal.equities },
    { label: 'دارایی‌ها', value: bal.totalAssets },
    { label: 'نسبت مالکانه', value: r.equityRatio, isPercent: true },
  ];
  const activeLoanToEquity = (() => {
    const loan = cr.activeBankFacility;
    const eq = bal.equities;
    if (loan === null || loan === undefined || eq === null || eq === undefined || eq === 0) return null;
    return loan / eq;
  })();
  const section3Kpis = [
    { label: 'تسهیلات فعال', value: cr.activeBankFacility },
    { label: 'حقوق صاحبان سهام', value: bal.equities },
    { label: 'نسبت وام فعال به ح.ص.س', value: activeLoanToEquity, isRatio: true },
  ];
  const section4Kpis = [
    { label: 'وام فعال', value: cr.activeBankFacility },
    { label: 'بدهی جاری', value: bal.totalCurrentLiabilities },
    { label: 'دارایی جاری', value: bal.totalCurrentAssets },
    { label: 'نسبت جاری', value: r.currentRatio, isRatio: true },
  ];

  return (
    <div className="page-inner">
      <div className="comparative-grid">
        <Section
          title="روند وام فعال بانکی و نسبت آنی"
          chart={<EChart option={quickOption} style={{ height: 230 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="روند تغییرات نسبت مالکانه"
          chart={<EChart option={equityOption} style={{ height: 230 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند ضمانت‌نامه فعال و نسبت وام به حقوق صاحبان سهام"
          chart={<EChart option={loanEquityOption} style={{ height: 230 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="روند تغییرات نسبت جاری"
          chart={<EChart option={currentRatioOption} style={{ height: 230 }} />}
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
                : kpi.isPercent
                  ? (kpi.value !== null && kpi.value !== undefined ? toFa((kpi.value * 100).toFixed(0)) + '٪' : '—')
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
