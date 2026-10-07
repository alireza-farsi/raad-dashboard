import { fmtNum } from '../utils/format';
import CreditRating from './CreditRating';

// Page 2 of the PDF: "خلاصه گزارش"
// Layout (matches the UI-sample design):
//   1) Strip of 7 KPI cards (white rounded cards, PDF page 3 style)
//   2) Row of 2 teal capacity cards (PDF page 3 accent cards)
//   3) Datanet-style credit rating block (badge + AAA→D scale + sub-scores)

export default function PageSummary({ financials, credit, creditReal, year }) {
  const hasCredit = !!credit;
  const guaranteeCap = credit?.creditGuaranteeCapacity;
  const loanCap = credit?.creditLoanCapacity;
  const activeGuarantee = creditReal?.guarTahod ?? creditReal?.activeGuaranteeAmt;
  const activeLoan = creditReal?.activeBankFacility;
  const issuableGuarantee = guaranteeCap !== undefined && activeGuarantee !== undefined
    ? Math.max(0, guaranteeCap - activeGuarantee)
    : guaranteeCap;
  const issuableLoan = loanCap !== undefined && activeLoan !== undefined
    ? Math.max(0, loanCap - activeLoan)
    : loanCap;

  return (
    <div className="page-inner">
      {/* KPI strip */}
      <div className="kpi-summary-strip">
        <Kpi label="درآمد عملیاتی" value={fmtNum(financials?.revenue)} />
        <Kpi label="سود عملیاتی" value={fmtNum(financials?.ebit)} />
        <Kpi label="دارایی جاری" value={fmtNum(financials?.totalCurrentAssets)} />
        <Kpi label="بدهی جاری" value={fmtNum(financials?.totalCurrentLiabilities)} />
        <Kpi label="مجموع دارایی‌ها" value={fmtNum(financials?.totalAssets)} />
        <Kpi label="سرمایه ثبتی" value={fmtNum(financials?.stock)} />
        <Kpi label="تسهیلات فعال بانکی" value={fmtNum(financials?.activeBankFacility)} />
      </div>
      <div className="unit-note">تمامی ارقام به میلیارد تومان می‌باشد.</div>

      {/* Two teal capacity cards */}
      {hasCredit && (
        <div className="grid-2col">
          <div className="capacity-block">
            <div className="capacity-block-title">ظرفیت اعتباری ضمانت‌نامه پیمانی</div>
            <div className="capacity-block-amount">
              {fmtNum(guaranteeCap)} <span>میلیارد تومان</span>
            </div>
            <div className="capacity-rows">
              <CapacityRow
                label="ضمانت‌نامه فعال (طی یکسال اخیر)"
                value={fmtNum(activeGuarantee)}
              />
              <CapacityRow
                label="ضمانت‌نامه قابل‌صدور"
                value={fmtNum(issuableGuarantee)}
              />
              <DegRow label="تضامین درجه یک" value={credit?.deg1GuaranteeCap} />
              <DegRow label="تضامین درجه دو" value={credit?.deg2GuaranteeCap} />
              <DegRow label="تضامین درجه سه" value={credit?.deg3GuaranteeCap} />
            </div>
          </div>

          <div className="capacity-block">
            <div className="capacity-block-title">ظرفیت اعتباری سرمایه در گردش</div>
            <div className="capacity-block-amount">
              {fmtNum(loanCap)} <span>میلیارد تومان</span>
            </div>
            <div className="capacity-rows">
              <CapacityRow
                label="تسهیلات فعال (طی یکسال اخیر)"
                value={fmtNum(activeLoan)}
              />
              <CapacityRow
                label="وام قابل پرداخت"
                value={fmtNum(issuableLoan)}
              />
              <DegRow label="تضامین درجه یک" value={credit?.deg1LoanCap} />
              <DegRow label="تضامین درجه دو" value={credit?.deg2LoanCap} />
              <DegRow label="تضامین درجه سه" value={credit?.deg3LoanCap} />
            </div>
          </div>
        </div>
      )}

      {/* Datanet-style credit rating block (full width) */}
      <CreditRating credit={credit} year={year} />
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="kpi-summary-card">
      <div className="kpi-summary-value">{value}</div>
      <div className="kpi-summary-label">{label}</div>
    </div>
  );
}

function CapacityRow({ label, value }) {
  return (
    <div className="capacity-row">
      <div className="capacity-row-label">{label}</div>
      <div className="capacity-row-value">
        {value} <span className="capacity-row-unit">میلیارد تومان</span>
      </div>
    </div>
  );
}

function DegRow({ label, value }) {
  return (
    <div className="capacity-row deg-row">
      <div className="capacity-row-label">{label}:</div>
      <div className="capacity-row-value">{fmtNum(value)} میلیارد تومان</div>
    </div>
  );
}
