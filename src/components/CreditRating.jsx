import { toFa, fmtNum } from '../utils/format';

/**
 * Datanet-style corporate credit rating block.
 *
 * Structure (mirrors the دیتانت company-report "رتبه اعتباری" section):
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ [B1 badge]  رتبه اعتباری شرکت                            │
 *   │             توضیح یک‌خطی + چیپ‌های امتیاز/نکول/اعتبار     │
 *   │                                                          │
 *   │   مقیاس رتبه‌بندی:  AAA ────────●──────────────── D      │
 *   │   (نوار ۱۰ بخش رنگی، بخش فعلی برجسته + نشانگر بالای آن)  │
 *   │                                                          │
 *   │   زیرامتیازها:  ۵ نوار پیشرفت رنگی                       │
 *   └──────────────────────────────────────────────────────────┘
 */

// Corporate grade ladder (Iranian credit-rating scale) with warm→cool colors.
const GRADES = [
  { key: 'AAA', color: '#0b5d43', label: 'بسیار مطلوب' },
  { key: 'AA', color: '#12805c', label: 'مطلوب' },
  { key: 'A', color: '#1d9e75', label: 'نسبتاً مطلوب' },
  { key: 'B1', color: '#4fb694', label: 'قابل قبول' },
  { key: 'B2', color: '#8fc7ae', label: 'قابل قبول' },
  { key: 'B3', color: '#c9b26b', label: 'در حد انتظار' },
  { key: 'C1', color: '#d9a648', label: 'نیازمند توجه' },
  { key: 'C2', color: '#d98c33', label: 'نیازمند توجه' },
  { key: 'C3', color: '#c85a2a', label: 'پرریسک' },
  { key: 'D', color: '#a52a1a', label: 'پرریسک بالا' },
];

function findGrade(creditScore) {
  const idx = GRADES.findIndex((g) => g.key === creditScore);
  return { idx: idx === -1 ? 6 : idx, grade: idx === -1 ? GRADES[6] : GRADES[idx] };
}

function SubScoreBar({ label, value, color }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="cr-subscore">
      <div className="cr-subscore-head">
        <span className="cr-subscore-label">{label}</span>
        <span className="cr-subscore-value">{toFa(v.toFixed(0))}<small> از ۱۰۰</small></span>
      </div>
      <div className="cr-subscore-track">
        <div
          className="cr-subscore-fill"
          style={{ width: `${v}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function CreditRating({ credit, year }) {
  if (!credit) {
    return (
      <div className="card cr-card">
        <div className="cr-title">رتبه اعتباری شرکت</div>
        <div className="empty-note">داده اعتباری برای این سال در دسترس نیست.</div>
      </div>
    );
  }

  const { idx, grade } = findGrade(credit.creditScore);
  const iScore = Math.round(credit.iScore ?? 0);
  const pd = (credit.probabilityOfDefault ?? 0) * 100;

  const subscores = [
    { label: 'رفتار مالی و اعتباری', value: credit.behaviorScore, color: '#1d9e75' },
    { label: 'توان بازپرداخت تعهدات', value: credit.repaymentCapScore, color: '#12805c' },
    { label: 'سودآوری و عملکرد', value: credit.performanceScore, color: '#c9a25a' },
    { label: 'وضعیت بازار و صنعت', value: credit.marketScore, color: '#2c7fb8' },
    { label: 'عملکرد عملیاتی', value: credit.operationalScore, color: '#7e57c2' },
  ];

  return (
    <div className="card cr-card">
      <div className="cr-title">
        رتبه اعتباری شرکت
        <span className="cr-title-hint">مقیاس AAA تا D — مبتنی بر صورت‌های مالی {toFa(year)} و استعلامات بانکی</span>
      </div>

      {/* Badge + description + chips */}
      <div className="cr-head">
        <div
          className="cr-badge"
          style={{
            background: grade.color,
            boxShadow: `0 10px 24px -10px ${grade.color}`,
          }}
        >
          <span className="cr-badge-grade">{credit.creditScore}</span>
          <span className="cr-badge-sub">{grade.label}</span>
        </div>

        <div className="cr-head-info">
          <p className="cr-desc">{credit.description}</p>
          <div className="cr-chips">
            <span className="cr-chip">
              <b>امتیاز اعتباری:</b> {toFa(iScore)} <small>از ۹۰۰</small>
            </span>
            <span className="cr-chip">
              <b>احتمال نکول:</b> {toFa(pd.toFixed(1))}٪
            </span>
            <span className="cr-chip">
              <b>نرخ اعتبار:</b> {toFa((credit.iRate ?? 0).toFixed(0))}٪
            </span>
            <span className="cr-chip">
              <b>مدل کسب‌وکار:</b> {credit.businessModel}
            </span>
            <span className="cr-chip">
              <b>نوع مشتری:</b> {credit.customerType}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal grade scale with marker */}
      <div className="cr-scale-wrap">
        <div className="cr-scale-labels">
          <span className="cr-scale-end good">کم‌ریسک</span>
          <span className="cr-scale-title">مقیاس رتبه‌بندی اعتباری</span>
          <span className="cr-scale-end bad">پرریسک</span>
        </div>
        <div className="cr-scale">
          {/* marker */}
          <div
            className="cr-marker"
            style={{
              right: `calc(${(idx + 0.5) * (100 / GRADES.length)}% - 16px)`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path
                d="M11 1.5 L20 12 L15.5 12 L15.5 20.5 L6.5 20.5 L6.5 12 L2 12 Z"
                fill={grade.color}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          {GRADES.map((g, i) => (
            <div
              key={g.key}
              className={`cr-segment ${i === idx ? 'current' : ''}`}
              style={{ background: g.color }}
              title={`${g.key} — ${g.label}`}
            >
              {g.key}
            </div>
          ))}
        </div>
        <div className="cr-scale-bounds">
          <span>{toFa(900)}</span>
          <span>{toFa(300)}</span>
        </div>
      </div>

      {/* Sub scores */}
      <div className="cr-subscores">
        {subscores.map((s) => (
          <SubScoreBar key={s.label} {...s} />
        ))}
      </div>

      <div className="cr-footnote">
        مبنای امتیازدهی فوق، صورت‌های مالی سال {toFa(year)}، میانگین‌های صنعت فعالیت شرکت
        و استعلامات بانکی می‌باشد. ظرفیت اعتباری ضمانت‌نامه: {fmtNum(credit.creditGuaranteeCapacity)}
        و ظرفیت اعتباری سرمایه در گردش: {fmtNum(credit.creditLoanCapacity)} میلیارد تومان.
      </div>
    </div>
  );
}
