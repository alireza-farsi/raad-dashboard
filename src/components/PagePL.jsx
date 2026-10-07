import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { fmtNum, toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis } from '../utils/echartsTheme';

// Page 3 of the PDF: "صورت سود و زیان"
// Layout:
//   1) P&L statement table — 5-year columns (1399-1403), 12 rows in order:
//        درآمد عملیاتی, بهای تمام‌شده, سود ناخالص,
//        هزینه‌های فروش/اداری و عمومی, سایر درآمد(هزینه)های عملیاتی, سود عملیاتی,
//        هزینه‌های مالی, درآمدهای غیرعملیاتی, هزینه‌های غیرعملیاتی,
//        سود قبل از مالیات, مالیات بر درآمد, سود خالص
//   2) "ساختار هزینه‌ای" — multi-year columns showing the cost structure
//      (درآمد, سود ناخالص, هزینه‌های فروش/اداری و عمومی, هزینه مالی,
//       بهای تمام شده, سایر) with percentages of revenue
//   3) "روند تغییرات سودآوری" — line chart of سود ناخالص, سود عملیاتی, سود خالص
//      over years 1398-1403
//   4) "روند درآمد عملیاتی با احتساب تورم" — line chart of درآمد عملیاتی vs
//      درآمد عملیاتی تعدیل‌شده با تورم, over years 1396-1404

// Years used by the P&L statement table (PDF shows 5 years 1399-1403).
const STATEMENT_YEARS = ['1399', '1400', '1401', '1402', '1403'];
const TREND_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];
const INFLATION_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

// Inflation adjustment factors (CBI yearly consumer price index ratios
// relative to 1404). These are illustrative; the PDF does not show the
// exact deflator, but does show a "درآمد عملیاتی تعدیل‌شده با تورم" line.
const INFLATION_FACTORS = {
  '1396': 4.10, '1397': 3.55, '1398': 2.95, '1399': 2.20,
  '1400': 1.65, '1401': 1.30, '1402': 1.12, '1403': 1.00, '1404': 1.00,
};

const STATEMENT_ROWS = [
  { key: 'revenue', label: 'درآمد عملیاتی', type: 'value' },
  { key: 'costOfRevenue', label: 'بهای تمام‌شده', type: 'value' },
  { key: 'grossProfit', label: 'سود ناخالص', type: 'subtotal' },
  { key: 'sga', label: 'هزینه‌های فروش، اداری و عمومی', type: 'value' },
  { key: 'otherOpIncome', label: 'سایر درآمد(هزینه)های عملیاتی', type: 'value' },
  { key: 'ebit', label: 'سود عملیاتی', type: 'subtotal' },
  { key: 'interestExpense', label: 'هزینه‌های مالی', type: 'value' },
  { key: 'nonOpIncome', label: 'درآمدهای غیرعملیاتی', type: 'value' },
  { key: 'nonOpExpenses', label: 'هزینه‌های غیرعملیاتی', type: 'value' },
  { key: 'pbt', label: 'سود قبل از مالیات', type: 'subtotal' },
  { key: 'incomeTax', label: 'مالیات بر درآمد', type: 'value' },
  { key: 'netProfit', label: 'سود خالص', type: 'total' },
];

// Cost structure columns (PDF shows 5 years).
const STRUCTURE_YEARS = STATEMENT_YEARS;
const STRUCTURE_ROWS = [
  { key: 'revenue', label: 'درآمد عملیاتی' },
  { key: 'grossProfit', label: 'سود ناخالص' },
  { key: 'sga', label: 'هزینه‌های فروش، اداری و عمومی' },
  { key: 'interestExpense', label: 'هزینه مالی' },
  { key: 'costOfRevenue', label: 'بهای تمام شده' },
  { key: 'otherOpIncome', label: 'سایر' },
];

export default function PagePL({ income, ratios, year, allIncomes }) {
  // ----- Trend chart: سود ناخالص, سود عملیاتی, سود خالص -----
  const profitabilityTrendOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 40 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['سود ناخالص', 'سود عملیاتی', 'سود خالص'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
    series: [
      {
        name: 'سود ناخالص',
        type: 'line',
        data: TREND_YEARS.map((y) => allIncomes[y]?.grossProfit ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'سود عملیاتی',
        type: 'line',
        data: TREND_YEARS.map((y) => allIncomes[y]?.ebit ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'سود خالص',
        type: 'line',
        data: TREND_YEARS.map((y) => allIncomes[y]?.netProfit ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
    ],
  }), [allIncomes]);

  // ----- Inflation-adjusted revenue trend -----
  const inflationTrendOption = useMemo(() => {
    return {
      grid: { ...baseGrid, top: 40, bottom: 40 },
      tooltip: { ...baseTooltip },
      legend: { ...baseLegend, data: ['درآمد عملیاتی', 'درآمد عملیاتی تعدیل‌شده با تورم'] },
      xAxis: { type: 'category', data: INFLATION_YEARS, ...faCategoryAxis() },
      yAxis: { type: 'value', ...faValueAxis({ compact: true }) },
      series: [
        {
          name: 'درآمد عملیاتی',
          type: 'line',
          data: INFLATION_YEARS.map((y) => allIncomes[y]?.revenue ?? null),
          smooth: true, symbol: 'circle', symbolSize: 6,
          lineStyle: { color: PALETTE.teal, width: 2.5 },
          itemStyle: { color: PALETTE.teal },
          areaStyle: { color: 'rgba(29,158,117,0.08)' },
        },
        {
          name: 'درآمد عملیاتی تعدیل‌شده با تورم',
          type: 'line',
          data: INFLATION_YEARS.map((y) => {
            const rev = allIncomes[y]?.revenue;
            const factor = INFLATION_FACTORS[y];
            return rev !== undefined && factor ? rev * factor : null;
          }),
          smooth: true, symbol: 'diamond', symbolSize: 6,
          lineStyle: { color: PALETTE.gold, width: 2.5, type: 'dashed' },
          itemStyle: { color: PALETTE.gold },
        },
      ],
    };
  }, [allIncomes]);

  return (
    <div className="page-inner">
      {/* Statement table */}
      <div className="card">
        <div className="card-title">صورت سود و زیان</div>
        <table className="statement-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>شرح</th>
              {STATEMENT_YEARS.map((y) => (
                <th key={y} className="num" style={{ width: `${60 / STATEMENT_YEARS.length}%` }}>
                  {toFa(y)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATEMENT_ROWS.map((row) => {
              const isTotal = row.type === 'total';
              const isSubtotal = row.type === 'subtotal';
              return (
                <tr
                  key={row.key}
                  className={isTotal ? 'total' : isSubtotal ? 'subtotal' : ''}
                >
                  <td>{row.label}</td>
                  {STATEMENT_YEARS.map((y) => (
                    <td key={y} className="num">
                      {formatNum(allIncomes[y]?.[row.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="unit-note" style={{ marginTop: 8, marginBottom: 0 }}>
          تمامی ارقام به میلیارد تومان می‌باشد.
        </div>
      </div>

      {/* Cost structure */}
      <div className="card">
        <div className="card-title">ساختار هزینه‌ای</div>
        <table className="statement-table structure-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}></th>
              {STRUCTURE_YEARS.map((y) => (
                <th key={y} className="num" style={{ width: `${72 / STRUCTURE_YEARS.length}%` }}>
                  {toFa(y)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRUCTURE_ROWS.map((row, idx) => (
              <tr key={row.key} className={idx === 0 ? 'subtotal' : ''}>
                <td>{row.label}</td>
                {STRUCTURE_YEARS.map((y) => {
                  const v = allIncomes[y]?.[row.key];
                  const rev = allIncomes[y]?.revenue;
                  const pct = v !== null && v !== undefined && rev
                    ? (v / rev) * 100
                    : null;
                  return (
                    <td key={y} className="num">
                      <div className="structure-cell">
                        <span className="structure-value">{formatNum(v)}</span>
                        {pct !== null && (
                          <span className="structure-pct">{toFa(pct.toFixed(0))}٪</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="unit-note" style={{ marginTop: 8, marginBottom: 0 }}>
          تمامی ارقام به میلیارد تومان می‌باشد.
        </div>
      </div>

      {/* Profitability trend */}
      <div className="chart-card">
        <div className="chart-title">روند تغییرات سودآوری</div>
        <ReactECharts option={profitabilityTrendOption} style={{ height: 320 }} />
      </div>

      {/* Revenue trend with inflation */}
      <div className="chart-card">
        <div className="chart-title">روند درآمد عملیاتی با احتساب تورم</div>
        <ReactECharts option={inflationTrendOption} style={{ height: 320 }} />
      </div>
    </div>
  );
}

function formatNum(v) {
  if (v === null || v === undefined) return '۰';
  const n = Number(v);
  if (Number.isNaN(n)) return '۰';
  // PDF shows rounded integers with thousands separators
  return toFa(Math.round(n).toLocaleString('en-US'));
}
