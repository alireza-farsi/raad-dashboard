import { fmtAmount, fmtNum, toFa } from '../utils/format';

// Page 2 of the PDF: "خلاصه گزارش"
// Layout:
//   1) Strip of 7 KPI cards: درآمد عملیاتی, سود عملیاتی, دارایی جاری,
//      بدهی جاری, مجموع دارایی‌ها, سرمایه ثبتی, تسهیلات فعال بانکی
//   2) Two capacity cards side-by-side:
//        - ظرفیت اعتباری ضمانت‌نامه پیمانی  (with ضمانت‌نامه فعال, ضمانت‌نامه قابل‌صدور, تضامین ۱/۲/۳)
//        - ظرفیت اعتباری سرمایه در گردش     (with تسهیلات فعال, وام قابل پرداخت, تضامین ۱/۲/۳)
//   3) Description block on the right:
//        - description text
//        - rating badge (e.g. B1, 664-, 300, 900)
//        - 3 sub-scores: رفتار مالی و اعتباری, توان بازپرداخت, سودآوری و عملکرد
//        - footer note: مبنای امتیازدهی فوق مبتنی بر صورت‌های مالی سال ۱۴۰۳...
export default function PageSummary({ financials, credit, creditReal, year }) {
  const hasCredit = !!credit;
  // The PDF shows these specific amounts for the capacity cards. They map to
  // the credit_rank_and_capacity record of the selected year (1403 in the PDF).
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
        <Kpi label="درآمد عملیاتی" value={fmtAmount(financials?.revenue)} />
        <Kpi label="سود عملیاتی" value={fmtAmount(financials?.ebit)} />
        <Kpi label="دارایی جاری" value={fmtAmount(financials?.totalCurrentAssets)} />
        <Kpi label="بدهی جاری" value={fmtAmount(financials?.totalCurrentLiabilities)} />
        <Kpi label="مجموع دارایی‌ها" value={fmtAmount(financials?.totalAssets)} />
        <Kpi label="سرمایه ثبتی" value={fmtAmount(financials?.stock)} />
        <Kpi label="تسهیلات فعال بانکی" value={fmtAmount(financials?.activeBankFacility)} />
      </div>
      <div className="unit-note">تمامی ارقام به میلیارد تومان می‌باشد.</div>

      {hasCredit ? (
        <>
          {/* Capacity + Description row */}
          <div className="grid-3col" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'stretch' }}>
            {/* ظرفیت اعتباری ضمانت‌نامه پیمانی */}
            <div className="capacity-block">
              <div className="capacity-block-title">ظرفیت اعتباری ضمانت‌نامه پیمانی</div>
              <div className="capacity-block-amount">
                {fmtNum(guaranteeCap)} <span>میلیارد تومان</span>
              </div>
              <div className="capacity-rows">
                <CapacityRow
                  label="ضمانت‌نامه فعال (طی یکسال اخیر)"
                  value={fmtNum(activeGuarantee)}
                  unit="میلیارد تومان"
                />
                <CapacityRow
                  label="ضمانت‌نامه قابل‌صدور"
                  value={fmtNum(issuableGuarantee)}
                  unit="میلیارد تومان"
                />
                <DegRow label="تضامین درجه یک" value={credit?.deg1GuaranteeCap} />
                <DegRow label="تضامین درجه دو" value={credit?.deg2GuaranteeCap} />
                <DegRow label="تضامین درجه سه" value={credit?.deg3GuaranteeCap} />
              </div>
            </div>

            {/* ظرفیت اعتباری سرمایه در گردش */}
            <div className="capacity-block">
              <div className="capacity-block-title">ظرفیت اعتباری سرمایه در گردش</div>
              <div className="capacity-block-amount">
                {fmtNum(loanCap)} <span>میلیارد تومان</span>
              </div>
              <div className="capacity-rows">
                <CapacityRow
                  label="تسهیلات فعال (طی یکسال اخیر)"
                  value={fmtNum(activeLoan)}
                  unit="میلیارد تومان"
                />
                <CapacityRow
                  label="وام قابل پرداخت"
                  value={fmtNum(issuableLoan)}
                  unit="میلیارد تومان"
                />
                <DegRow label="تضامین درجه یک" value={credit?.deg1LoanCap} />
                <DegRow label="تضامین درجه دو" value={credit?.deg2LoanCap} />
                <DegRow label="تضامین درجه سه" value={credit?.deg3LoanCap} />
              </div>
            </div>

            {/* Description block */}
            <div className="description-block">
              <div className="description-block-title">Description</div>
              <p className="description-text">{credit.description}</p>

              <div className="rating-row">
                <div className="rating-badge-large">{credit.creditScore}</div>
                <div className="rating-scale">
                  <div className="rating-scale-track">
                    <div
                      className="rating-scale-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((credit.iScore - 300) / 600) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="rating-scale-ends">
                    <span>{toFa(300)}</span>
                    <span>{toFa(900)}</span>
                  </div>
                </div>
                <div className="rating-scale-value">{toFa(Math.round(credit.iScore - 900))} -</div>
              </div>

              <div className="sub-scores">
                <SubScore
                  label="رفتار مالی و اعتباری"
                  value={credit.behaviorScore}
                />
                <SubScore
                  label="توان بازپرداخت"
                  value={credit.repaymentCapScore}
                />
                <SubScore
                  label="سودآوری و عملکرد"
                  value={credit.performanceScore}
                />
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="footer-note">
            مبنای امتیازدهی فوق مبتنی بر صورت‌های مالی سال {toFa(Number(year))}، میانگین‌های صنعت
            فعالیت شرکت و استعلامات بانکی می‌باشد.
          </div>
        </>
      ) : (
        <div className="empty-note">داده اعتباری برای سال {toFa(year)} در دسترس نیست.</div>
      )}
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

function CapacityRow({ label, value, unit }) {
  return (
    <div className="capacity-row">
      <div className="capacity-row-label">{label}</div>
      <div className="capacity-row-value">
        {value} <span className="capacity-row-unit">{unit}</span>
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

function SubScore({ label, value }) {
  const tone = value >= 60 ? 'good' : value >= 35 ? 'medium' : 'low';
  return (
    <div className={`sub-score ${tone}`}>
      <div className="sub-score-label">{label}</div>
      <div className="sub-score-value">{toFa(value)}</div>
    </div>
  );
}
