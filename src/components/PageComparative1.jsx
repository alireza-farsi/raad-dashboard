import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis } from '../utils/echartsTheme';

// Page 6 of the PDF: "ارقام مقایسه‌ای (ترازنامه و صورت سود و زیان)"
// 4 sections, each with a small table on the right and a chart on the left.
//   1) روند تغییرات نسبت پوشش بهره (Interest coverage ratio trend)
//      Table: سود عملیاتی, هزینه مالی, نسبت پوشش بهره, درآمد عملیاتی, درآمد دانش‌بنیان
//      Chart: نسبت پوشش بهره over years 1398-1403
//   2) مقایسه روند بدهی‌ها با حقوق صاحبان سهام
//      Chart: حقوق صاحبان سهام, مجموع بدهی‌ها, درآمد عملیاتی, سرمایه ثبتی — 1396-1404
//   3) روند سودآوری
//      Chart: سود عملیاتی, سود خالص, مجموع بدهی‌ها, حقوق صاحبان سهام — 1398-1403
//   4) مقایسه روند دارایی‌ها با سرمایه ثبتی
//      Chart: حقوق صاحبان سهام, مجموع دارایی‌ها, سرمایه ثبتی — 1396-1404

const SHORT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];
const LONG_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

export default function PageComparative1({
  incomeByYear,
  balanceByYear,
  ratiosByYear,
  financialsByYear,
  year,
}) {
  // ----- Section 1: Interest coverage ratio trend -----
  const coverageOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val) => (typeof val === 'number' ? toFa(val.toFixed(2)) : val),
    },
    legend: { ...baseLegend, data: ['نسبت پوشش بهره'] },
    xAxis: { type: 'category', data: SHORT_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ decimals: 1 }) },
    series: [
      {
        name: 'نسبت پوشش بهره',
        type: 'line',
        data: SHORT_YEARS.map((y) => ratiosByYear[y]?.interestCoverage ?? null),
        smooth: true, symbol: 'circle', symbolSize: 8,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        areaStyle: { color: 'rgba(8, 80, 65, 0.08)' },
        label: {
          show: true,
          formatter: (p) => toFa(p.value ? p.value.toFixed(2) : ''),
          fontFamily: "'Ravi FaNum', Tahoma, sans-serif",
          color: PALETTE.tealDark,
          fontSize: 11,
        },
      },
    ],
  }), [ratiosByYear]);

  // ----- Section 2: Liabilities vs equity trend -----
  const liabEquityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['حقوق صاحبان سهام', 'مجموع بدهی‌ها', 'درآمد عملیاتی', 'سرمایه ثبتی'] },
    xAxis: { type: 'category', data: LONG_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
    series: [
      {
        name: 'حقوق صاحبان سهام',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع بدهی‌ها',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.danger, width: 2.5 },
        itemStyle: { color: PALETTE.danger },
      },
      {
        name: 'درآمد عملیاتی',
        type: 'line',
        data: LONG_YEARS.map((y) => incomeByYear[y]?.revenue ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.gold, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.gold },
      },
      {
        name: 'سرمایه ثبتی',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 6,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
    ],
  }), [incomeByYear, balanceByYear]);

  // ----- Section 3: Profitability trend -----
  const profitabilityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['سود عملیاتی', 'سود خالص', 'مجموع بدهی‌ها', 'حقوق صاحبان سهام'] },
    xAxis: { type: 'category', data: SHORT_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
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

  // ----- Section 4: Assets vs stock trend -----
  const assetsStockOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['حقوق صاحبان سهام', 'مجموع دارایی‌ها', 'سرمایه ثبتی'] },
    xAxis: { type: 'category', data: LONG_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
    series: [
      {
        name: 'حقوق صاحبان سهام',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.equities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع دارایی‌ها',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.totalAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'سرمایه ثبتی',
        type: 'line',
        data: LONG_YEARS.map((y) => balanceByYear[y]?.stock ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 6,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
    ],
  }), [balanceByYear]);

  // Section 1 KPI row (table-like display of the 5 metrics for selected year)
  const section1Data = useMemo(() => {
    const inc = incomeByYear[year];
    const r = ratiosByYear[year];
    return [
      { label: 'سود عملیاتی', value: inc?.ebit },
      { label: 'هزینه مالی', value: inc?.interestExpense },
      { label: 'نسبت پوشش بهره', value: r?.interestCoverage, isRatio: true },
      { label: 'درآمد عملیاتی', value: inc?.revenue },
      { label: 'درآمد دانش‌بنیان', value: inc?.revenueKb12 },
    ];
  }, [incomeByYear, ratiosByYear, year]);

  // Section 2 KPI row
  const section2Data = useMemo(() => {
    const bal = balanceByYear[year];
    const inc = incomeByYear[year];
    return [
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
      { label: 'مجموع بدهی‌ها', value: bal?.totalLiabilities },
      { label: 'درآمد عملیاتی', value: inc?.revenue },
      { label: 'سرمایه ثبتی', value: bal?.stock },
    ];
  }, [incomeByYear, balanceByYear, year]);

  // Section 3 KPI row
  const section3Data = useMemo(() => {
    const inc = incomeByYear[year];
    const bal = balanceByYear[year];
    return [
      { label: 'سود عملیاتی', value: inc?.ebit },
      { label: 'سود خالص', value: inc?.netProfit },
      { label: 'مجموع بدهی‌ها', value: bal?.totalLiabilities },
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
    ];
  }, [incomeByYear, balanceByYear, year]);

  // Section 4 KPI row
  const section4Data = useMemo(() => {
    const bal = balanceByYear[year];
    return [
      { label: 'حقوق صاحبان سهام', value: bal?.equities },
      { label: 'مجموع دارایی‌ها', value: bal?.totalAssets },
      { label: 'سرمایه ثبتی', value: bal?.stock },
    ];
  }, [balanceByYear, year]);

  return (
    <div className="page-inner">
      <Section
        title="روند تغییرات نسبت پوشش بهره"
        chart={<ReactECharts option={coverageOption} style={{ height: 280 }} />}
        kpis={section1Data}
      />
      <Section
        title="مقایسه روند بدهی‌ها با حقوق صاحبان سهام"
        chart={<ReactECharts option={liabEquityOption} style={{ height: 280 }} />}
        kpis={section2Data}
      />
      <Section
        title="روند سودآوری"
        chart={<ReactECharts option={profitabilityOption} style={{ height: 280 }} />}
        kpis={section3Data}
      />
      <Section
        title="مقایسه روند دارایی‌ها با سرمایه ثبتی"
        chart={<ReactECharts option={assetsStockOption} style={{ height: 280 }} />}
        kpis={section4Data}
      />
      <div className="unit-note" style={{ marginTop: 4 }}>
        تمامی ارقام به میلیارد تومان می‌باشد.
      </div>
    </div>
  );
}

function Section({ title, chart, kpis }) {
  return (
    <div className="comparative-section">
      <div className="chart-card" style={{ marginBottom: 0 }}>
        <div className="chart-title">{title}</div>
        {chart}
      </div>
      <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, marginTop: 8 }}>
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
