import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis } from '../utils/echartsTheme';

// Page 7 of the PDF: "ارقام مقایسه‌ای (ترازنامه و اعتبارات)"
// 4 sections in a 2x2 grid, each with table + chart:
//   1) روند وام فعال به نسبت حقوق صاحبان سهام (top-left)
//      Table: بدهی جاری, دارایی نقدشونده, دارایی‌های جاری, نسبت آنی
//      Chart: نسبت آنی, وام فعال بانکی, بدحسابی بانکی (1396-1403)
//   2) روند تغییرات نسبت مالکانه (top-right)
//      Table: حقوق صاحبان سهام, دارایی‌ها, نسبت مالکانه
//      Chart: بدهی‌های جاری, وام فعال بانکی, مجموع بدهی‌ها, نسبت مالکانه (1396-1403)
//   3) روند وام فعال به نسبت حقوق صاحبان سهام (bottom-left)
//      Table: تسهیلات فعال, حقوق صاحبان سهام, نسبت وام فعال به ح.ص.س
//      Chart: وام فعال غیربانکی, ضمانت‌نامه فعال بانکی, نسبت وام فعال به ح.ص.س (1396-1403)
//   4) روند تغییرات نسبت جاری (bottom-right)
//      Table: وام فعال, بدهی جاری, دارایی جاری, نسبت جاری
//      Chart: وام فعال غیربانکی, دارایی‌های جاری, مجموع دارایی‌ها, نسبت جاری (1396-1403)

const TREND_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403'];

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
  const crc = creditByYear[year] || {};

  // ----- Section 1 chart: نسبت آنی + وام فعال بانکی + بدحسابی بانکی -----
  // We treat "بدحسابی بانکی" as a binary 0/1 indicator (0 = no bad debt,
  // 1 = bad debt). The sample shows no bad debts so the line stays at 0.
  const quickOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, params) => {
        const name = params?.seriesName;
        if (name === 'نسبت آنی') return toFa(val.toFixed(2));
        return toFa(val.toFixed(0));
      },
    },
    legend: { ...baseLegend, data: ['نسبت آنی', 'وام فعال بانکی', 'بدحسابی بانکی'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
    series: [
      {
        name: 'نسبت آنی',
        type: 'line',
        data: TREND_YEARS.map((y) => ratiosByYear[y]?.quickRatio ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
        yAxisIndex: 0,
      },
      {
        name: 'وام فعال بانکی',
        type: 'bar',
        data: TREND_YEARS.map((y) => creditRealByYear[y]?.activeBankFacility ?? null),
        itemStyle: { color: PALETTE.gold, borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
      {
        name: 'بدحسابی بانکی',
        type: 'line',
        data: TREND_YEARS.map((y) => (creditRealByYear[y]?.loanBadHesabi ? 1 : 0)),
        step: 'middle',
        lineStyle: { color: PALETTE.danger, width: 2 },
        itemStyle: { color: PALETTE.danger },
        symbol: 'diamond', symbolSize: 6,
      },
    ],
  }), [ratiosByYear, creditRealByYear]);

  // ----- Section 2 chart: ownership ratio trend -----
  const equityOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, params) => {
        const name = params?.seriesName;
        if (name === 'نسبت مالکانه') return toFa((val * 100).toFixed(0)) + '٪';
        return toFa(val.toFixed(0));
      },
    },
    legend: { ...baseLegend, data: ['بدهی‌های جاری', 'وام فعال بانکی', 'مجموع بدهی‌ها', 'نسبت مالکانه'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: true }) },
      {
        type: 'value',
        position: 'left',
        axisLabel: {
          formatter: (val) => toFa((val * 100).toFixed(0)) + '٪',
          fontFamily: "'Ravi FaNum', Tahoma, sans-serif",
          color: PALETTE.inkSoft,
          fontSize: 11,
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'بدهی‌های جاری',
        type: 'bar',
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalCurrentLiabilities ?? null),
        itemStyle: { color: PALETTE.danger, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: 'وام فعال بانکی',
        type: 'line',
        data: TREND_YEARS.map((y) => creditRealByYear[y]?.activeBankFacility ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
      {
        name: 'مجموع بدهی‌ها',
        type: 'line',
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalLiabilities ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.warning, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.warning },
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
  }), [balanceByYear, ratiosByYear, creditRealByYear]);

  // ----- Section 3 chart: active loan vs equity ratio -----
  const loanEquityOption = useMemo(() => {
    return {
      grid: { ...baseGrid, top: 40, bottom: 40 },
      tooltip: {
        ...baseTooltip,
        valueFormatter: (val, params) => {
          const name = params?.seriesName;
          if (name === 'نسبت وام فعال به ح.ص.س') return toFa(val.toFixed(2));
          return toFa(val.toFixed(0));
        },
      },
      legend: { ...baseLegend, data: ['وام فعال غیربانکی', 'ضمانت‌نامه فعال بانکی', 'نسبت وام فعال به ح.ص.س'] },
      xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
      yAxis: [
        { type: 'value', ...faValueAxis({ compact: true }) },
        {
          type: 'value',
          position: 'left',
          axisLabel: {
            formatter: (val) => toFa(val.toFixed(1)),
            fontFamily: "'Ravi FaNum', Tahoma, sans-serif",
            color: PALETTE.inkSoft,
            fontSize: 11,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'وام فعال غیربانکی',
          type: 'bar',
          data: TREND_YEARS.map((y) => creditRealByYear[y]?.fundsActiveLoanAmt ?? null),
          itemStyle: { color: PALETTE.info, borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: 'ضمانت‌نامه فعال بانکی',
          type: 'line',
          data: TREND_YEARS.map((y) => creditRealByYear[y]?.guarTahod ?? null),
          smooth: true, symbol: 'circle', symbolSize: 6,
          lineStyle: { color: PALETTE.gold, width: 2.5 },
          itemStyle: { color: PALETTE.gold },
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
          label: {
            show: true,
            formatter: (p) => p.value !== null && p.value !== undefined ? toFa(p.value.toFixed(2)) : '',
            fontFamily: "'Ravi FaNum', Tahoma, sans-serif",
            color: PALETTE.tealDark,
            fontSize: 10.5,
          },
        },
      ],
    };
  }, [creditRealByYear, balanceByYear]);

  // ----- Section 4 chart: current ratio trend -----
  const currentRatioOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (val, params) => {
        const name = params?.seriesName;
        if (name === 'نسبت جاری') return toFa(val.toFixed(2));
        return toFa(val.toFixed(0));
      },
    },
    legend: { ...baseLegend, data: ['وام فعال غیربانکی', 'دارایی‌های جاری', 'مجموع دارایی‌ها', 'نسبت جاری'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: [
      { type: 'value', ...faValueAxis({ compact: true }) },
      {
        type: 'value',
        position: 'left',
        axisLabel: {
          formatter: (val) => toFa(val.toFixed(1)),
          fontFamily: "'Ravi FaNum', Tahoma, sans-serif",
          color: PALETTE.inkSoft,
          fontSize: 11,
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'وام فعال غیربانکی',
        type: 'bar',
        data: TREND_YEARS.map((y) => creditRealByYear[y]?.fundsActiveLoanAmt ?? null),
        itemStyle: { color: PALETTE.info, borderRadius: [4, 4, 0, 0] },
        barWidth: 12,
      },
      {
        name: 'دارایی‌های جاری',
        type: 'line',
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalCurrentAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع دارایی‌ها',
        type: 'line',
        data: TREND_YEARS.map((y) => balanceByYear[y]?.totalAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: PALETTE.tealDark, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'نسبت جاری',
        type: 'line',
        data: TREND_YEARS.map((y) => ratiosByYear[y]?.currentRatio ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
        yAxisIndex: 1,
      },
    ],
  }), [balanceByYear, ratiosByYear, creditRealByYear]);

  // Section KPI rows (selected-year values from the table on the right of each chart)
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
      <div className="grid-2col" style={{ alignItems: 'stretch' }}>
        <Section
          title="روند وام فعال به نسبت حقوق صاحبان سهام"
          chart={<ReactECharts option={quickOption} style={{ height: 280 }} />}
          kpis={section1Kpis}
        />
        <Section
          title="روند تغییرات نسبت مالکانه"
          chart={<ReactECharts option={equityOption} style={{ height: 280 }} />}
          kpis={section2Kpis}
        />
        <Section
          title="روند وام فعال به نسبت حقوق صاحبان سهام"
          chart={<ReactECharts option={loanEquityOption} style={{ height: 280 }} />}
          kpis={section3Kpis}
        />
        <Section
          title="روند تغییرات نسبت جاری"
          chart={<ReactECharts option={currentRatioOption} style={{ height: 280 }} />}
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
