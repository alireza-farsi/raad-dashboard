import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { fmtNum, toFa } from '../utils/format';
import { PALETTE, FONT } from '../utils/echartsTheme';

// Page 2 of the PDF: "خلاصه گزارش"
// Layout:
//   1) Strip of 7 KPI cards
//   2) Three-column row: 2 capacity cards + gauge block on the right
//        - ظرفیت اعتباری ضمانت‌نامه پیمانی
//        - ظرفیت اعتباری سرمایه در گردش
//        - Gauge: B1 with iScore on a 300-900 scale, with letter-grade
//          bands (AAA / AA / A / B1 / B2 / B3 / C1 / C2 / C3 / D) shown
//          along the arc. The needle points at the iScore value, which
//          visually lands inside the matching letter-grade band.
//   3) Footer note about مبنای امتیازدهی

const SCORE_MIN = 300;
const SCORE_MAX = 900;

// Letter-grade bands — each grade occupies a 50-point wide slice of the
// 300-900 arc. The needle points at the iScore value and so naturally
// falls inside the matching letter-grade band.
const GRADE_BANDS = [
  { from: 850, to: 900, color: '#0a3d2e', label: 'AAA' },
  { from: 800, to: 850, color: '#0f6e56', label: 'AA' },
  { from: 750, to: 800, color: '#1d9e75', label: 'A' },
  { from: 700, to: 750, color: '#5dcaa5', label: 'B1' },
  { from: 650, to: 700, color: '#7fd4b5', label: 'B2' },
  { from: 600, to: 650, color: '#b7a26b', label: 'B3' },
  { from: 550, to: 600, color: '#c9a25a', label: 'C1' },
  { from: 500, to: 550, color: '#d18a3a', label: 'C2' },
  { from: 400, to: 500, color: '#c0392b', label: 'C3' },
  { from: 300, to: 400, color: '#7a1f15', label: 'D' },
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
  // The needle points at iScore. Letter-grade labels are placed at the
  // middle of each band so the user can clearly see which letter the
  // needle is pointing at.
  const gaugeOption = useMemo(() => {
    if (!credit) return null;
    const value = credit.iScore ?? 0;
    const band = GRADE_BANDS.find((b) => value >= b.from && value < b.to)
      || GRADE_BANDS[GRADE_BANDS.length - 1];

    // Tick positions: only show 4 numeric labels (300, 500, 700, 900) so
    // there's enough white space between them — the user asked for more
    // spacing between numbers so changes are more visible.
    const numericAxisLabels = [300, 500, 700, 900];

    // Letter-grade marker positions: place each grade label at the middle
    // of its band, scaled to [0, 1] for ECharts' axisLine.color offsets.
    const gradeMarks = GRADE_BANDS.map((b) => ({
      position: ((b.from + b.to) / 2 - SCORE_MIN) / (SCORE_MAX - SCORE_MIN),
      label: b.label,
      color: b.color,
    }));

    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: SCORE_MIN,
          max: SCORE_MAX,
          // Only 3 splits => 4 numeric labels (300 / 500 / 700 / 900)
          // instead of 6 splits => much more whitespace per number.
          splitNumber: 3,
          radius: '90%',
          center: ['50%', '60%'],
          progress: {
            show: true,
            width: 14,
            roundCap: true,
            itemStyle: { color: band.color },
          },
          pointer: {
            show: true,
            length: '55%',
            width: 5,
            itemStyle: { color: band.color },
          },
          axisLine: {
            lineStyle: {
              width: 14,
              // Color stops expressed as [offset, color] where offset is
              // in [0, 1] relative to the full arc.
              color: GRADE_BANDS.map((b) => [
                (b.from - SCORE_MIN) / (SCORE_MAX - SCORE_MIN),
                b.color,
              ]),
            },
          },
          axisTick: {
            distance: -22,
            length: 4,
            lineStyle: { color: '#fff', width: 1 },
          },
          splitLine: {
            distance: -22,
            length: 10,
            lineStyle: { color: '#fff', width: 2 },
          },
          axisLabel: {
            distance: 4,
            color: PALETTE.inkSoft,
            fontSize: 11,
            fontFamily: FONT,
            // Only show the 4 numeric labels we picked; hide the rest.
            formatter: (v) => (numericAxisLabels.includes(v) ? toFa(v) : ''),
          },
          // Letter-grade marks: rendered as anchor points
          anchor: {
            show: false,
          },
          // The center detail shows the letter (e.g. B1) big, the score small
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '30%'],
            formatter: () => `{a|${credit.creditScore}}\n{b|امتیاز ${toFa(Math.round(value))} از ${toFa(SCORE_MAX)}}`,
            rich: {
              a: {
                fontSize: 32,
                fontWeight: 700,
                color: band.color,
                fontFamily: FONT,
                lineHeight: 38,
              },
              b: {
                fontSize: 10,
                color: PALETTE.inkSoft,
                fontFamily: FONT,
                lineHeight: 14,
              },
            },
          },
          data: [{ value }],
        },
      ],
      // Letter-grade labels overlaid on the gauge using graphic elements
      graphic: gradeMarks.map((m) => {
        // Convert position (0..1) along the arc to x/y coordinates.
        // 180° (left) → 0° (right). Position 0 is at angle 180°, position 1 at 0°.
        const angle = Math.PI * (1 - m.position);
        const r = 90; // percentage of half-size
        // We use a simple text element positioned relative to chart center
        return {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: m.label,
            font: `600 9px ${FONT}`,
            fill: '#ffffff',
            textAlign: 'center',
            textVerticalAlign: 'middle',
          },
          // Position the text along the arc using the rotation transform
          position: [
            -Math.cos(angle) * 60 + 0,
            -Math.sin(angle) * 60 + 0,
          ],
          z: 100,
        };
      }),
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
                  style={{ height: 240, width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              )}
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
