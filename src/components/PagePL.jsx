import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import {
  PALETTE, makeGrid, makeTooltip, makeLegend, valueAxis, categoryAxis,
  lineSeries, faNum,
} from '../utils/echartsTheme';

// Page 3 of the PDF: "صورت سود و زیان"
// Compact two-column layout so everything fits on one screen:
//   Left column:
//     - Statement table (5 years, 12 rows)
//   Right column:
//     - Cost structure table (5 years, 6 rows with percentages)
//     - Profitability trend chart   (REBUILT: gradient area lines)
//     - Revenue with inflation chart (REBUILT: area + dashed comparison)

const STATEMENT_YEARS = ['1399', '1400', '1401', '1402', '1403'];
const TREND_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];
const INFLATION_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

// Inflation adjustment factors — illustrative deflator relative to 1404
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

const STRUCTURE_ROWS = [
  { key: 'revenue', label: 'درآمد عملیاتی' },
  { key: 'grossProfit', label: 'سود ناخالص' },
  { key: 'sga', label: 'هزینه‌های فروش، اداری و عمومی' },
  { key: 'interestExpense', label: 'هزینه مالی' },
  { key: 'costOfRevenue', label: 'بهای تمام شده' },
  { key: 'otherOpIncome', label: 'سایر' },
];

export default function PagePL({ income, ratios, year, allIncomes }) {
  // ── Chart 1 (REBUILT): profitability trend — gradient area lines ──
  const profitabilityTrendOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['سود ناخالص', 'سود عملیاتی', 'سود خالص']),
    xAxis: categoryAxis(TREND_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'سود ناخالص',
        data: TREND_YEARS.map((y) => allIncomes[y]?.grossProfit ?? null),
        color: PALETTE.teal,
        area: true,
      }),
      lineSeries({
        name: 'سود عملیاتی',
        data: TREND_YEARS.map((y) => allIncomes[y]?.ebit ?? null),
        color: PALETTE.tealDark,
        area: true,
        symbol: 'rect',
        symbolSize: 8,
      }),
      lineSeries({
        name: 'سود خالص',
        data: TREND_YEARS.map((y) => allIncomes[y]?.netProfit ?? null),
        color: PALETTE.gold,
        area: true,
        symbol: 'diamond',
      }),
    ],
  }), [allIncomes]);

  // ── Chart 2 (REBUILT): revenue vs inflation-adjusted revenue ──
  const inflationTrendOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['درآمد عملیاتی', 'درآمد عملیاتی تعدیل‌شده با تورم']),
    xAxis: categoryAxis(INFLATION_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'درآمد عملیاتی',
        data: INFLATION_YEARS.map((y) => allIncomes[y]?.revenue ?? null),
        color: PALETTE.teal,
        area: true,
        width: 3,
      }),
      lineSeries({
        name: 'درآمد عملیاتی تعدیل‌شده با تورم',
        data: INFLATION_YEARS.map((y) => {
          const rev = allIncomes[y]?.revenue;
          const factor = INFLATION_FACTORS[y];
          return rev !== undefined && factor ? rev * factor : null;
        }),
        color: PALETTE.gold,
        dashed: true,
        symbol: 'diamond',
      }),
    ],
  }), [allIncomes]);

  return (
    <div className="page-inner">
      <div className="pl-grid">
        {/* LEFT: statement table */}
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
          <div className="unit-note" style={{ marginTop: 6, marginBottom: 0 }}>
            تمامی ارقام به میلیارد تومان می‌باشد.
          </div>
        </div>

        {/* RIGHT: cost structure + 2 charts */}
        <div className="pl-right-col">
          <div className="card">
            <div className="card-title">ساختار هزینه‌ای</div>
            <table className="statement-table structure-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}></th>
                  {STATEMENT_YEARS.map((y) => (
                    <th key={y} className="num" style={{ width: `${72 / STATEMENT_YEARS.length}%` }}>
                      {toFa(y)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STRUCTURE_ROWS.map((row, idx) => (
                  <tr key={row.key} className={idx === 0 ? 'subtotal' : ''}>
                    <td>{row.label}</td>
                    {STATEMENT_YEARS.map((y) => {
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
            <div className="unit-note" style={{ marginTop: 6, marginBottom: 0 }}>
              تمامی ارقام به میلیارد تومان می‌باشد.
            </div>
          </div>

          <div className="chart-card compact">
            <div className="chart-title compact">روند تغییرات سودآوری</div>
            <EChart option={profitabilityTrendOption} style={{ height: 230 }} />
          </div>

          <div className="chart-card compact">
            <div className="chart-title compact">روند درآمد عملیاتی با احتساب تورم</div>
            <EChart option={inflationTrendOption} style={{ height: 230 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNum(v) {
  if (v === null || v === undefined) return '۰';
  const n = Number(v);
  if (Number.isNaN(n)) return '۰';
  return toFa(Math.round(n).toLocaleString('en-US'));
}
