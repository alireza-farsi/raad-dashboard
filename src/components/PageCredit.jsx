import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import {
  PALETTE, makeGrid, makeTooltip, makeLegend, valueAxis, percentAxis,
  categoryAxis, barSeries, lineSeries, niceMax, faNum,
} from '../utils/echartsTheme';

// Page 6 of the PDF: "اعتباری" — the dark-teal themed page.
// Layout:
//   Dark teal hero band: title + credit chips (رتبه، امتیاز، نرخ، نکول)
//   2x2 grid of bank-list cards (white)
//   Full-width REBUILT dual-axis combo chart:
//     gradient bars (وام بانکی slate + وام غیربانکی gold)
//     + درآمد teal line + نسبت dashed % line (right axis)
//   7-row indicators table

const CREDIT_YEARS = ['1398', '1399', '1400', '1401', '1402', '1403', '1404'];

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
  creditByYear,
  diagnosisByYear,
  year,
}) {
  const diagnosis = diagnosisByYear?.[year];
  const credit = creditByYear?.[year];
  const behaviorMap = useMemo(() => {
    const m = {};
    (diagnosis?.creditBehavior || []).forEach((r) => {
      m[r.indicatorKey] = r;
    });
    return m;
  }, [diagnosis]);

  // Dual-axis combo (REBUILT — PDF page 6):
  // gradient bars = facilities, teal line = revenue, dashed % line on right axis.
  const comparisonTrendOption = useMemo(() => {
    const bankLoanData = CREDIT_YEARS.map((y) => facilitiesByYear[y]?.bankLoan ?? null);
    const fundLoanData = CREDIT_YEARS.map((y) => facilitiesByYear[y]?.fundLoan ?? null);
    const revenueData = CREDIT_YEARS.map((y) => incomeByYear[y]?.revenue ?? null);
    const ratioData = CREDIT_YEARS.map((y, i) => {
      const loan = bankLoanData[i] ?? 0;
      const fund = fundLoanData[i] ?? 0;
      const rev = revenueData[i];
      if (!rev) return null;
      return ((loan + fund) / rev) * 100;
    });
    const maxAmount = niceMax([...bankLoanData, ...fundLoanData, ...revenueData], 1000);
    const maxRatio = niceMax(ratioData, 100);

    return {
      grid: makeGrid({ top: 52, bottom: 10 }),
      tooltip: makeTooltip(
        (val, p) => (p?.seriesName === 'نسبت تسهیلات به درآمد' ? faNum(val, 1) + '٪' : faNum(val, 1))
      ),
      legend: makeLegend(['درآمد عملیاتی', 'وام بانکی', 'وام غیربانکی', 'نسبت تسهیلات به درآمد']),
      xAxis: categoryAxis(CREDIT_YEARS),
      yAxis: [
        valueAxis({ max: maxAmount * 1.08 }),
        percentAxis({ max: maxRatio * 1.15 }),
      ],
      series: [
        barSeries({ name: 'وام بانکی', data: bankLoanData, color: PALETTE.slate, barWidth: 20 }),
        barSeries({ name: 'وام غیربانکی', data: fundLoanData, color: PALETTE.gold, barWidth: 20 }),
        lineSeries({
          name: 'درآمد عملیاتی',
          data: revenueData,
          color: PALETTE.teal,
          width: 3,
          symbolSize: 8,
        }),
        lineSeries({
          name: 'نسبت تسهیلات به درآمد',
          data: ratioData,
          color: PALETTE.info,
          dashed: true,
          symbol: 'diamond',
          yAxisIndex: 1,
        }),
      ],
    };
  }, [incomeByYear, facilitiesByYear]);

  return (
    <div className="page-inner">
      <div className="page-credit-dark">
        <div className="credit-page-title">میانگین‌های وزنی، ارقام و شاخص‌های اعتباری</div>
        <div className="credit-page-sub">
          سال پایه ارقام اعتباری {toFa(1404)} در نظر گرفته شده است؛ تمامی ارقام به میلیارد تومان می‌باشد.
        </div>

        {credit && (
          <div className="credit-chip-row">
            <span className="credit-chip-dark"><b>رتبه اعتباری:</b> {credit.creditScore}</span>
            <span className="credit-chip-dark"><b>امتیاز:</b> {toFa(Math.round(credit.iScore ?? 0))} از ۹۰۰</span>
            <span className="credit-chip-dark"><b>نرخ اعتبار:</b> {toFa((credit.iRate ?? 0).toFixed(0))}٪</span>
            <span className="credit-chip-dark">
              <b>احتمال نکول:</b> {toFa(((credit.probabilityOfDefault ?? 0) * 100).toFixed(1))}٪
            </span>
            <span className="credit-chip-dark"><b>مدل کسب‌وکار:</b> {credit.businessModel}</span>
          </div>
        )}

        {/* 2x2 grid of bank lists */}
        <div className="banks-2x2-grid">
          <BankListCard title="بانک‌های ارائه دهنده تسهیلات" items={banks.loanBanks} />
          <BankListCard title="سایر نهادهای ارائه‌دهنده تسهیلات" items={banks.loanFunds} />
          <BankListCard title="بانک‌های ناشر ضمانت نامه" items={banks.guaranteeBanks} />
          <BankListCard title="صندوق‌های ناشر ضمانت نامه" items={banks.guaranteeFunds} />
        </div>

        <div className="chart-card compact">
          <div className="chart-title compact">مقایسه روند درآمدی با تسهیلات دریافتی</div>
          <EChart option={comparisonTrendOption} style={{ height: 290 }} />
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
    </div>
  );
}

function BankListCard({ title, items }) {
  return (
    <div className="card bank-list-card">
      <div className="card-title">{title}</div>
      {items.length === 0 ? (
        <div className="empty-banks">موردی ثبت نشده است</div>
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
