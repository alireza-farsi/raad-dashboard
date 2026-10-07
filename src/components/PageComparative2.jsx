import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis, FONT } from '../utils/echartsTheme';

// Page 7 of the PDF: "ارقام مقایسه‌ای (ترازنامه و اعتبارات)"
// 4 sections in a 2x2 grid. Each section: chart on top, KPI strip below.
// All charts use dual y-axes — bars on the left (financial amounts in
// billion toman) and a line on the right (a unitless ratio). Each axis
// has explicit min: 0 and a max derived from the data so the bars/lines
// don't collapse to invisible when one year's value is much larger.

const TREND_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403'];

// Compute a clean "nice" max for an axis from a list of values.
function niceMax(values, fallback = 1) {
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
  if (valid.length === 0) return fallback;
  const max = Math.max(...valid);
  if (max <= 0) return fallback;
  // Round up to next "nice" number
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const norm = max / mag;
  let nice;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

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
  const activeLoanData = TREND_YEARS.map((y) => creditRealByYear[y]?.activeBankFacility ?? null);
  const quickRatioData = TREND_YEARS.map((y) => ratiosByYear[y]?.quickRatio ?? null);
  const totalLiabData = TREND_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null);
  const equityRatioData = TREND_YEARS.map((y) => ratiosByYear[y]?.equityRatio ?? null);
  const guarTahodData = TREND_YEARS.map((y) => creditRealByYear[y]?.guarTahod ?? null);
  const loanToEquityData = TREND_YEARS.map((y) => {
    const loan = creditRealByYear[y]?.activeBankFacility;
    const eq = balanceByYear[y]?.equities;
    if (loan === null || loan === undefined || eq === null || eq === undefined || eq === 0) return null;
    return loan / eq;
  });
  const currentAssetsData = TREND_YEARS.map((y) => balanceByYear[y]?.totalCurrentAssets ?? null);
  const currentRatioData = TREND_YEARS.map((y) => ratiosByYear[y]?.currentRatio ?? null);

  // ----- Section 1: نسبت آنی + وام فعال بانکی -----
  const quickOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => p?.seriesName === 'نسبت آنی' ? toFa(val.toFixed(2)) : toFa(val.toFixed(1)),
    },
    legend: { ...baseLegend, data: ['وام فعال بانکی', 'نسبت آنی'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', min: 0, max: niceMax(activeLoanData, 300), ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', min: 0, max: niceMax(quickRatioData, 3), name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(1)) } },
    ],
    series: [
      {
        name: 'وام فعال بانکی',
        type: 'bar',
        data: activeLoanData,
        itemStyle: { color: PALETTE.gold, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت آنی',
        type: 'line',
        data: quickRatioData,
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [activeLoanData, quickRatioData]);

  // ----- Section 2: ownership ratio trend -----
  const equityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => p?.seriesName === 'نسبت مالکانه' ? toFa((val * 100).toFixed(0)) + '٪' : toFa(val.toFixed(1)),
    },
    legend: { ...baseLegend, data: ['مجموع بدهی‌ها', 'نسبت مالکانه'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', min: 0, max: niceMax(totalLiabData, 1000), ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      {
        type: 'value', min: 0, max: 1, name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 },
        splitLine: { show: false },
        axisLabel: {
          fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11,
          formatter: (v) => toFa((v * 100).toFixed(0)) + '٪',
        },
      },
    ],
    series: [
      {
        name: 'مجموع بدهی‌ها',
        type: 'bar',
        data: totalLiabData,
        itemStyle: { color: PALETTE.danger, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت مالکانه',
        type: 'line',
        data: equityRatioData,
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [totalLiabData, equityRatioData]);

  // ----- Section 3: active loan vs equity ratio -----
  const loanEquityOption = useMemo(() => {
    // Multiply the ratio by 10 so the line isn't squashed at the bottom
    // of a 0-1 axis next to bars that go up to 6.
    return {
      grid: { ...baseGrid, top: 40, bottom: 30 },
      tooltip: {
        ...baseTooltip,
        valueFormatter: (val, p) => p?.seriesName === 'نسبت وام فعال به ح.ص.س' ? toFa(val.toFixed(2)) : toFa(val.toFixed(2)),
      },
      legend: { ...baseLegend, data: ['ضمانت‌نامه فعال بانکی', 'نسبت وام فعال به ح.ص.س'] },
      xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
      yAxis: [
        { type: 'value', min: 0, max: niceMax(guarTahodData, 10), ...faValueAxis({ compact: false, decimals: 1 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
        { type: 'value', min: 0, max: niceMax(loanToEquityData, 1), name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(2)) } },
      ],
      series: [
        {
          name: 'ضمانت‌نامه فعال بانکی',
          type: 'bar',
          data: guarTahodData,
          itemStyle: { color: PALETTE.gold, borderRadius: [4, 4, 0, 0] },
          barWidth: 14,
        },
        {
          name: 'نسبت وام فعال به ح.ص.س',
          type: 'line',
          data: loanToEquityData,
          smooth: true, symbol: 'diamond', symbolSize: 7,
          lineStyle: { color: PALETTE.tealDark, width: 2.5 },
          itemStyle: { color: PALETTE.tealDark },
          yAxisIndex: 1,
        },
      ],
    };
  }, [guarTahodData, loanToEquityData]);

  // ----- Section 4: current ratio trend -----
  const currentRatioOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => p?.seriesName === 'نسبت جاری' ? toFa(val.toFixed(2)) : toFa(val.toFixed(1)),
    },
    legend: { ...baseLegend, data: ['دارایی‌های جاری', 'نسبت جاری'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', min: 0, max: niceMax(currentAssetsData, 1000), ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', min: 0, max: niceMax(currentRatioData, 3), name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(1)) } },
    ],
    series: [
      {
        name: 'دارایی‌های جاری',
        type: 'bar',
        data: currentAssetsData,
        itemStyle: { color: PALETTE.teal, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت جاری',
        type: 'line',
        data: currentRatioData,
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
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
          title="روند وام فعال به نسبت حقوق صاحبان سهام"
          chart={<EChart option={quickOption} style={{ height: 220 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="روند تغییرات نسبت مالکانه"
          chart={<EChart option={equityOption} style={{ height: 220 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند وام فعال به نسبت حقوق صاحبان سهام"
          chart={<EChart option={loanEquityOption} style={{ height: 220 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="روند تغییرات نسبت جاری"
          chart={<EChart option={currentRatioOption} style={{ height: 220 }} />}
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
