import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { toFa, fmtNum } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis, FONT } from '../utils/echartsTheme';

// Page 6 of the PDF: "ارقام مقایسه‌ای (ترازنامه و صورت سود و زیان)"
// 4 sections arranged in a 2x2 grid, each with a chart on top and a KPI
// strip below it. All charts use a single value axis per series so values
// don't run into each other.
//
//   1) روند تغییرات نسبت پوشش بهره — line chart of نسبت پوشش بهره (right axis)
//      with bars for سود عملیاتی / هزینه مالی (left axis)
//   2) مقایسه روند بدهی‌ها با حقوق صاحبان سهام — 4 lines on single axis
//   3) روند سودآوری — 4 lines on single axis
//   4) مقایسه روند دارایی‌ها با سرمایه ثبتی — 3 lines on single axis

const SHORT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];
const LONG_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

// Years are kept as Latin-digit strings because they're used as keys to look
// up data in incomeByYear / balanceByYear / ratiosByYear. The faCategoryAxis
// helper renders them as Persian digits on screen.

export default function PageComparative1({
  incomeByYear,
  balanceByYear,
  ratiosByYear,
  financialsByYear,
  year,
}) {
  // ----- Section 1: Interest coverage ratio trend -----
  // Bar (left axis): سود عملیاتی, هزینه مالی
  // Line (right axis): نسبت پوشش بهره (0-1 scale on right, shown as ratio)
  const coverageOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, p) => {
        if (p?.seriesName === 'نسبت پوشش بهره') return toFa(val.toFixed(2));
        return toFa(val.toFixed(1));
      },
    },
    legend: { ...baseLegend, data: ['سود عملیاتی', 'هزینه مالی', 'نسبت پوشش بهره'] },
    xAxis: { type: 'category', data: SHORT_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
      { type: 'value', name: 'نسبت', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 11, formatter: (v) => toFa(v.toFixed(1)) } },
    ],
    series: [
      {
        name: 'سود عملیاتی',
        type: 'bar',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.ebit ?? null),
        itemStyle: { color: PALETTE.teal, borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
      {
        name: 'هزینه مالی',
        type: 'bar',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.interestExpense ?? null),
        itemStyle: { color: PALETTE.danger, borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
      {
        name: 'نسبت پوشش بهره',
        type: 'line',
        data: SHORT_YEARS.map((y) => ratiosByYear[y]?.interestCoverage ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
        yAxisIndex: 1,
      },
    ],
  }), [incomeByYear, ratiosByYear]);

  // ----- Section 2: Liabilities vs equity (single axis) -----
  const liabEquityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['حقوق صاحبان سهام', 'مجموع بدهی‌ها', 'درآمد عملیاتی', 'سرمایه ثبتی'] },
    xAxis: { type: 'category', data: LONG_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'حقوق صاحبان سهام',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع بدهی‌ها',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.danger, width: 2.5 },
        itemStyle: { color: PALETTE.danger },
      },
      {
        name: 'درآمد عملیاتی',
        type: 'line',
        data: LONG_YEARS.map((y) => incomeByYear[y]?.revenue ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.gold, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.gold },
      },
      {
        name: 'سرمایه ثبتی',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 5,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
    ],
  }), [incomeByYear, balanceByYear]);

  // ----- Section 3: Profitability trend (single axis) -----
  const profitabilityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['سود عملیاتی', 'سود خالص', 'مجموع بدهی‌ها', 'حقوق صاحبان سهام'] },
    xAxis: { type: 'category', data: SHORT_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'سود عملیاتی',
        type: 'line',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.ebit ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'سود خالص',
        type: 'line',
        data: SHORT_YEARS.map((y) => incomeByYear[y]?.netProfit ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
      {
        name: 'مجموع بدهی‌ها',
        type: 'line',
        data: SHORT_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.danger, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.danger },
      },
      {
        name: 'حقوق صاحبان سهام',
        type: 'line',
        data: SHORT_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.tealDark, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.tealDark },
      },
    ],
  }), [incomeByYear, balanceByYear]);

  // ----- Section 4: Assets vs stock (single axis) -----
  const assetsStockOption = useMemo(() => ({
    grid: { ...baseGrid, top: 50, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['حقوق صاحبان سهام', 'مجموع دارایی‌ها', 'سرمایه ثبتی'] },
    xAxis: { type: 'category', data: LONG_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'حقوق صاحبان سهام',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع دارایی‌ها',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'سرمایه ثبتی',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 5,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
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
          chart={<ReactECharts option={coverageOption} style={{ height: 220 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="مقایسه روند بدهی‌ها با حقوق صاحبان سهام"
          chart={<ReactECharts option={liabEquityOption} style={{ height: 220 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند سودآوری"
          chart={<ReactECharts option={profitabilityOption} style={{ height: 220 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="مقایسه روند دارایی‌ها با سرمایه ثبتی"
          chart={<ReactECharts option={assetsStockOption} style={{ height: 220 }} />}
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
