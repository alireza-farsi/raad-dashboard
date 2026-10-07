import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { fmtNum, toFa } from '../utils/format';
import { PALETTE, FONT } from '../utils/echartsTheme';

// Page 2 of the PDF: "خلاصه گزارش"
// Layout:
//   1) Strip of 7 KPI cards: درآمد عملیاتی, سود عملیاتی, دارایی جاری,
//      بدهی جاری, مجموع دارایی‌ها, سرمایه ثبتی, تسهیلات فعال بانکی
//   2) Two capacity cards + a rating gauge (B1) on the right.
//        - ظرفیت اعتباری ضمانت‌نامه پیمانی
//        - ظرفیت اعتباری سرمایه در گردش
//        - Gauge: B1 with iScore (300-900 range), 3 sub-scores below
//   3) Footer note about مبنای امتیازدهی

const SCORE_MIN = 300;
const SCORE_MAX = 900;

// Map credit letter grades to gauge color thresholds.
// AAA=900+, A=750+, B=600+, C=400+, D=300+
const GRADE_BANDS = [
  { from: 850, to: 900, color: '#0f6e56', label: 'AAA' },
  { from: 750, to: 850, color: '#1d9e75', label: 'A' },
  { from: 650, to: 750, color: '#5dcaa5', label: 'B' },
  { from: 500, to: 650, color: '#b7a26b', label: 'C' },
  { from: 300, to: 500, color: '#c0392b', label: 'D' },
];

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

  // ----- Gauge option for the B1 credit rating -----
  const gaugeOption = useMemo(() => {
    if (!credit) return null;
    const value = credit.iScore ?? 0;
    // Find the matching color band for the current value
    const band = GRADE_BANDS.find((b) => value >= b.from && value < b.to) || GRADE_BANDS[GRADE_BANDS.length - 1];
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: SCORE_MIN,
          max: SCORE_MAX,
          splitNumber: 6,
          progress: {
            show: true,
            width: 18,
            roundCap: true,
            itemStyle: {
              color: band.color,
            },
          },
          pointer: {
            show: true,
            length: '60%',
            width: 4,
            itemStyle: { color: band.color },
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: GRADE_BANDS.map((b) => [b.from / SCORE_MAX, b.color]),
            },
          },
          axisTick: {
            distance: -28,
            length: 6,
            lineStyle: { color: '#fff', width: 1 },
          },
          splitLine: {
            distance: -28,
            length: 12,
            lineStyle: { color: '#fff', width: 2 },
          },
          axisLabel: {
            distance: -10,
            color: PALETTE.inkSoft,
            fontSize: 10,
            fontFamily: FONT,
            formatter: (v) => toFa(v),
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '20%'],
            formatter: () => `{a|${credit.creditScore}}\n{b|${toFa(Math.round(value))}}`,
            rich: {
              a: {
                fontSize: 28,
                fontWeight: 700,
                color: band.color,
                fontFamily: FONT,
                lineHeight: 32,
              },
              b: {
                fontSize: 11,
                color: PALETTE.inkSoft,
                fontFamily: FONT,
                lineHeight: 14,
              },
            },
          },
          data: [{ value }],
        },
      ],
    };
  }, [credit]);

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

      {hasCredit ? (
        <>
          {/* Three-column row: 2 capacity blocks + gauge */}
          <div className="summary-grid-3">
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

            {/* Gauge: B1 credit rating */}
            <div className="gauge-block">
              <div className="gauge-block-title">رتبه اعتباری</div>
              {gaugeOption && (
                <ReactECharts
                  option={gaugeOption}
                  style={{ height: 220, width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              )}
              <div className="gauge-scale-ends">
                <span>{toFa(SCORE_MIN)}</span>
                <span>{toFa(SCORE_MAX)}</span>
              </div>
              <p className="gauge-description">{credit.description}</p>
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

function SubScore({ label, value }) {
  const tone = value >= 60 ? 'good' : value >= 35 ? 'medium' : 'low';
  return (
    <div className={`sub-score ${tone}`}>
      <div className="sub-score-label">{label}</div>
      <div className="sub-score-value">{toFa(value)}</div>
    </div>
  );
}
