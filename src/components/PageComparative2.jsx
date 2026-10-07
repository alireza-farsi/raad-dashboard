import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { toFa, fmtNum } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis, FONT } from '../utils/echartsTheme';

// Page 7 of the PDF: "ارقام مقایسه‌ای (ترازنامه و اعتبارات)"
// 4 sections in a 2x2 grid. Each section: chart on top, KPI strip below.
//
//   1) روند وام فعال به نسبت حقوق صاحبان سهام — bars (وام فعال بانکی) on
//      left axis, line (نسبت آنی) on right axis
//   2) روند تغییرات نسبت مالکانه — bars (مجموع بدهی‌ها) on left axis,
//      line (نسبت مالکانه) on right axis
//   3) روند وام فعال به نسبت حقوق صاحبان سهام — bars (ضمانت‌نامه فعال بانکی)
//      on left, line (نسبت وام فعال به ح.ص.س) on right
//   4) روند تغییرات نسبت جاری — bars (دارایی‌های جاری) on left,
//      line (نسبت جاری) on right

const TREND_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403'];

// Years are kept as Latin-digit strings because they're used as keys to look
// up data in balanceByYear / ratiosByYear / creditRealByYear. The
// faCategoryAxis helper renders them as Persian digits on screen.

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

  // ----- Section 1: نسبت آنی + وام فعال بانکی -----
  // Bar (left axis): وام فعال بانکی
  // Line (right axis): نسبت آنی
  const quickOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => {
        if (p?.seriesName === 'نسبت آنی') return toFa(val.toFixed(2));
        return toFa(val.toFixed(1));
      },
    },
    legend: { ...baseLegend, data: ['وام فعال بانکی', 'نسبت آنی'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(1)) } },
    ],
    series: [
      {
        name: 'وام فعال بانکی',
        type: 'bar',
        data: TREND_YEARS.map((y) => creditRealByYear[y]?.activeBankFacility ?? null),
        itemStyle: { color: PALETTE.gold, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت آنی',
        type: 'line',
        data: TREND_YEARS.map((y) => ratiosByYear[y]?.quickRatio ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [ratiosByYear, creditRealByYear]);

  // ----- Section 2: ownership ratio trend -----
  // Bar (left): مجموع بدهی‌ها
  // Line (right): نسبت مالکانه
  const equityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => {
        if (p?.seriesName === 'نسبت مالکانه') return toFa((val * 100).toFixed(0)) + '٪';
        return toFa(val.toFixed(1));
      },
    },
    legend: { ...baseLegend, data: ['مجموع بدهی‌ها', 'نسبت مالکانه'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      {
        type: 'value', name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 },
        min: 0, max: 1,
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
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        itemStyle: { color: PALETTE.danger, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت مالکانه',
        type: 'line',
        data: TREND_YEARS.map((y) => ratiosByYear[y]?.equityRatio ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [balanceByYear, ratiosByYear]);

  // ----- Section 3: active loan vs equity ratio -----
  // Bar (left): ضمانت‌نامه فعال بانکی
  // Line (right): نسبت وام فعال به ح.ص.س
  const loanEquityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => {
        if (p?.seriesName === 'نسبت وام فعال به ح.ص.س') return toFa(val.toFixed(2));
        return toFa(val.toFixed(1));
      },
    },
    legend: { ...baseLegend, data: ['ضمانت‌نامه فعال بانکی', 'نسبت وام فعال به ح.ص.س'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(2)) } },
    ],
    series: [
      {
        name: 'ضمانت‌نامه فعال بانکی',
        type: 'bar',
        data: TREND_YEARS.map((y) => creditRealByYear[y]?.guarTahod ?? null),
        itemStyle: { color: PALETTE.gold, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت وام فعال به ح.ص.س',
        type: 'line',
        data: TREND_YEARS.map((y) => {
          const loan = creditRealByYear[y]?.activeBankFacility;
          const eq = balanceByYear[y]?.equities;
          if (loan === null || loan === undefined || eq === null || eq === undefined || eq === 0) return null;
          return loan / eq;
        }),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [creditRealByYear, balanceByYear]);

  // ----- Section 4: current ratio trend -----
  // Bar (left): دارایی‌های جاری
  // Line (right): نسبت جاری
  const currentRatioOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => {
        if (p?.seriesName === 'نسبت جاری') return toFa(val.toFixed(2));
        return toFa(val.toFixed(1));
      },
    },
    legend: { ...baseLegend, data: ['دارایی‌های جاری', 'نسبت جاری'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(1)) } },
    ],
    series: [
      {
        name: 'دارایی‌های جاری',
        type: 'bar',
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalCurrentAssets ?? null),
        itemStyle: { color: PALETTE.teal, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'نسبت جاری',
        type: 'line',
        data: TREND_YEARS.map((y) => ratiosByYear[y]?.currentRatio ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 1,
      },
    ],
  }), [balanceByYear, ratiosByYear]);

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
          chart={<ReactECharts option={quickOption} style={{ height: 220 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="روند تغییرات نسبت مالکانه"
          chart={<ReactECharts option={equityOption} style={{ height: 220 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند وام فعال به نسبت حقوق صاحبان سهام"
          chart={<ReactECharts option={loanEquityOption} style={{ height: 220 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="روند تغییرات نسبت جاری"
          chart={<ReactECharts option={currentRatioOption} style={{ height: 220 }} />}
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
