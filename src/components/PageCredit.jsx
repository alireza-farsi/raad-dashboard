import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis, FONT } from '../utils/echartsTheme';

// Page 5 of the PDF: "اعتباری"
// Layout (matches the PDF):
//   Top: 2x2 grid of bank-list cards
//     [بانک‌های ارائه‌دهنده تسهیلات]  [سایر نهادهای ارائه‌دهنده تسهیلات]
//     [بانک‌های ناشر ضمانت‌نامه]      [صندوق‌های ناشر ضمانت‌نامه]
//   Middle: comparison chart (full width)
//   Bottom: 7-row indicators table

const CREDIT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403'];

const DIAGNOSIS_KEYS = [
  { key: 'Loan_Dirkard_bt', label: 'دیرکرد وام' },
  { key: 'FacBadhesabi', label: 'بدحسابی بانک مرکزی' },
  { key: 'FundsBlackList', label: 'لیست سیاه صندوقی' },
  { key: 'ChequeNUMTotal', label: 'چک برگشتی' },
  { key: 'GuaranteeStatus', label: 'وجود ضمانت‌نامه' },
  { key: 'Fac_LoanAMT_bt', label: 'وام‌ها در سیستم بانکی' },
  { key: 'FundsActiveLoanAMT_bt', label: 'وام‌های غیربانکی' },
];

export default function PageCredit({
  banks,
  facilitiesByYear,
  incomeByYear,
  creditRealByYear,
  diagnosisByYear,
  year,
}) {
  const diagnosis = diagnosisByYear?.[year];
  const behaviorMap = useMemo(() => {
    const m = {};
    (diagnosis?.creditBehavior || []).forEach((r) => {
      m[r.indicatorKey] = r;
    });
    return m;
  }, [diagnosis]);

  const comparisonTrendOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['درآمد عملیاتی', 'وام بانکی', 'وام غیربانکی'] },
    xAxis: { type: 'category', data: CREDIT_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'درآمد عملیاتی',
        type: 'line',
        data: CREDIT_YEARS.map((y) => incomeByYear[y]?.revenue ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'وام بانکی',
        type: 'line',
        data: CREDIT_YEARS.map((y) => facilitiesByYear[y]?.bankLoan ?? null),
        smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
      {
        name: 'وام غیربانکی',
        type: 'line',
        data: CREDIT_YEARS.map((y) => facilitiesByYear[y]?.fundLoan ?? null),
        smooth: true, symbol: 'diamond', symbolSize: 7,
        lineStyle: { color: PALETTE.info, width: 2.5 },
        itemStyle: { color: PALETTE.info },
      },
    ],
  }), [incomeByYear, facilitiesByYear]);

  return (
    <div className="page-inner">
      <div className="credit-banner">
        سال پایه ارقام اعتباری {toFa(1404)} در نظر گرفته شده است.
      </div>

      {/* 2x2 grid of bank lists */}
      <div className="banks-2x2-grid">
        <BankListCard title="بانک‌های ارائه دهنده تسهیلات" items={banks.loanBanks} />
        <BankListCard title="سایر نهادهای ارائه‌دهنده تسهیلات" items={banks.loanFunds} />
        <BankListCard title="بانک‌های ناشر ضمانت نامه" items={banks.guaranteeBanks} />
        <BankListCard title="صندوق‌های ناشر ضمانت نامه" items={banks.guaranteeFunds} />
      </div>

      <div className="chart-card compact">
        <div className="chart-title compact">مقایسه روند درآمدی با تسهیلات دریافتی</div>
        <ReactECharts option={comparisonTrendOption} style={{ height: 220 }} />
        <div className="unit-note" style={{ marginTop: 6, marginBottom: 0 }}>
          تمامی ارقام به میلیارد تومان می‌باشد.
        </div>
      </div>

      <div className="card">
        <table className="diagnosis-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>شاخص</th>
              <th style={{ width: '80%' }}>توضیحات</th>
            </tr>
          </thead>
          <tbody>
            {DIAGNOSIS_KEYS.map((d) => {
              const rec = behaviorMap[d.key];
              return (
                <tr key={d.key}>
                  <td className="indicator-cell">{d.label}</td>
                  <td>{rec?.description || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BankListCard({ title, items }) {
  return (
    <div className="card bank-list-card">
      <div className="card-title">{title}</div>
      {items.length === 0 ? (
        <div className="empty-banks">— هیچ‌کدام —</div>
      ) : (
        <div className="bank-list">
          {items.map((b) => (
            <div key={b} className="bank-chip">
              <div className="bank-logo">{b.slice(0, 1)}</div>
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
