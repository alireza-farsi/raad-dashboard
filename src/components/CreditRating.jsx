import { useMemo } from 'react';
import EChart from './EChart';
import { toFa } from '../utils/format';

/**
 * رتبه اعتباری شرکت — منطق ساده (مطابق فایل‌های اولیه پروژه) + گیج عقربه‌ای
 *
 * ساختار:
 *   ┌────────────────────────────────────────────────────┐
 *   │ رتبه اعتباری شرکت                                  │
 *   │ ┌──────────────┐   [نشان رتبه B1]  امتیاز ۶۸۰ از ۹۰۰│
 *   │ │  گیج عقربه‌ای │   توضیح یک‌خطی                    │
 *   │ │  ۳۰۰ → ۹۰۰   │   ۳ زیرامتیاز:                     │
 *   │ └──────────────┘    رفتار مالی / بازپرداخت / سودآوری│
 *   │ مبنای امتیازدهی فوق مبتنی بر صورت‌های مالی سال …     │
 *   └────────────────────────────────────────────────────┘
 *
 * منطق (همان فایل‌های اولیه):
 *   • نشان رتبه = creditScore (همان رشته‌ی داده: A3 / B1 / B2 / …)
 *   • مقیاس امتیاز = ۳۰۰ تا ۹۰۰، عقربه روی iScore می‌ایستد
 *   • ۳ زیرامتیاز = رفتار مالی و اعتباری، توان بازپرداخت، سودآوری و عملکرد
 *   • یادداشت پایانی = مبنای امتیازدهی
 *
 * مقاوم در برابر باگ: هر رتبه‌ای که در نردبان نباشد رنگ پیش‌فرض برند می‌گیرد،
 * امتیاز خارج از بازه به [۳۰۰، ۹۰۰] محدود می‌شود و داده‌ی ناقص کرش نمی‌دهد.
 */

const FONT = "'Ravi FaNum', Tahoma, sans-serif";
const SCORE_MIN = 300;
const SCORE_MAX = 900;

// نردبان کامل رتبه‌بندی ایرانی (خوب → ضعیف) — فقط برای انتخاب رنگ نشان و عقربه.
// داده‌ی واقعی رتبه از API می‌آید؛ این لیست هیچ‌وقت منطق را تعیین نمی‌کند.
const GRADE_COLORS = {
  AAA: '#0b5d43',
  AA1: '#0e6b4f', AA2: '#11795a', AA3: '#148767',
  A1: '#179572', A2: '#1d9e75', A3: '#27a881',
  B1: '#4fb694', B2: '#7fbfa2', B3: '#a9b585',
  C1: '#c9a25a', C2: '#d18a3a', C3: '#c85a2a',
  D: '#a52a1a',
};

/** رنگ رتبه — برای هر رشته‌ای رنگ معتبر برمی‌گرداند (هرگز کرش نمی‌کند). */
function gradeColor(grade) {
  const key = String(grade ?? '').trim().toUpperCase();
  return GRADE_COLORS[key] || '#0f766e';
}

/** امتیاز را به بازه‌ی مجاز گیج (۳۰۰ تا ۹۰۰) محدود می‌کند. */
function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return SCORE_MIN;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, n));
}

// سه زیرامتیاز — همان منطق ساده‌ی فایل‌های اولیه
const SUB_SCORES = [
  { key: 'behaviorScore', label: 'رفتار مالی و اعتباری' },
  { key: 'repaymentCapScore', label: 'توان بازپرداخت' },
  { key: 'performanceScore', label: 'سودآوری و عملکرد' },
];

function subTone(v) {
  if (v >= 60) return 'good';
  if (v >= 35) return 'medium';
  return 'low';
}

export default function CreditRating({ credit, year }) {
  // گزینه‌ی گیج فقط با وجود داده‌ی اعتباری ساخته می‌شود (useMemo → بدون رندر اضافه)
  const gaugeOption = useMemo(() => {
    if (!credit) return null;

    const score = clampScore(credit.iScore);
    const color = gradeColor(credit.creditScore);
    const grade = String(credit.creditScore ?? '').trim().toUpperCase() || '—';

    return {
      series: [
        {
          type: 'gauge',
          min: SCORE_MIN,
          max: SCORE_MAX,
          startAngle: 205,
          endAngle: -25,
          splitNumber: 6, // برچسب‌های ۳۰۰ تا ۹۰۰ با گام ۱۰۰
          radius: '92%',
          center: ['50%', '56%'],
          // قوس رنگی: قرمز (پرریسک / ۳۰۰) → طلایی → سبز (کم‌ریسک / ۹۰۰)
          axisLine: {
            lineStyle: {
              width: 16,
              color: [
                [0, '#a52a1a'],
                [0.28, '#c85a2a'],
                [0.5, '#c9a25a'],
                [0.75, '#27a881'],
                [1, '#0b5d43'],
              ],
            },
          },
          // عقربه — به رنگ رتبه‌ی فعلی
          pointer: {
            length: '56%',
            width: 5,
            itemStyle: { color },
          },
          anchor: {
            show: true,
            size: 13,
            showAbove: true,
            itemStyle: { color, borderColor: '#fff', borderWidth: 2.5 },
          },
          axisTick: { distance: -20, length: 4, lineStyle: { color: '#fff', width: 1 } },
          splitLine: { distance: -22, length: 10, lineStyle: { color: '#fff', width: 2 } },
          axisLabel: {
            distance: 8,
            color: '#6b7280',
            fontSize: 10.5,
            fontFamily: FONT,
            formatter: (v) => toFa(Math.round(v)),
          },
          // مرکز گیج: رتبه (بزرگ) + امتیاز (کوچک)
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '64%'],
            formatter: () =>
              `{grade|${grade}}\n{score|امتیاز ${toFa(Math.round(score))} از ${toFa(SCORE_MAX)}}`,
            rich: {
              grade: {
                fontSize: 30,
                fontWeight: 700,
                color,
                fontFamily: FONT,
                lineHeight: 36,
                align: 'center',
              },
              score: {
                fontSize: 10.5,
                color: '#6b7280',
                fontFamily: FONT,
                lineHeight: 16,
                align: 'center',
              },
            },
          },
          data: [{ value: score, name: 'امتیاز اعتباری' }],
        },
      ],
    };
  }, [credit]);

  if (!credit) {
    return (
      <div className="card cr-card">
        <div className="cr-title">رتبه اعتباری شرکت</div>
        <div className="empty-note">داده اعتباری برای این سال در دسترس نیست.</div>
      </div>
    );
  }

  const color = gradeColor(credit.creditScore);
  const score = clampScore(credit.iScore);
  const description = String(credit.description ?? '').trim();

  return (
    <div className="card cr-card">
      <div className="cr-title">
        رتبه اعتباری شرکت
        <span className="cr-title-hint">مقیاس {toFa(SCORE_MIN)} تا {toFa(SCORE_MAX)}</span>
      </div>

      <div className="cr-gauge-body">
        {/* گیج عقربه‌ای روی مقیاس ۳۰۰ تا ۹۰۰ */}
        {gaugeOption && (
          <EChart option={gaugeOption} className="cr-gauge-chart" style={{ height: 290 }} />
        )}

        {/* منطق ساده: نشان رتبه + توضیح + ۳ زیرامتیاز */}
        <div className="cr-gauge-info">
          <div className="cr-gauge-head">
            <div
              className="cr-gauge-badge"
              style={{ background: color, boxShadow: `0 10px 22px -10px ${color}` }}
            >
              <span className="cr-gauge-grade">{credit.creditScore}</span>
            </div>
            <div className="cr-gauge-stat">
              <span className="cr-gauge-stat-label">امتیاز اعتباری</span>
              <span className="cr-gauge-stat-value">
                {toFa(Math.round(score))} <small>از {toFa(SCORE_MAX)}</small>
              </span>
            </div>
          </div>

          {description && <p className="cr-gauge-desc">{description}</p>}

          <div className="cr-gauge-subs">
            {SUB_SCORES.map(({ key, label }) => {
              const v = Math.max(0, Math.min(100, Number(credit[key]) || 0));
              return (
                <div key={key} className={`cr-sub ${subTone(v)}`}>
                  <span className="cr-sub-label">{label}</span>
                  <span className="cr-sub-value">{toFa(v.toFixed(0))}</span>
                  <div className="cr-sub-track">
                    <div className="cr-sub-fill" style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cr-gauge-note">
        مبنای امتیازدهی فوق مبتنی بر صورت‌های مالی سال {toFa(year)}، میانگین‌های صنعت
        فعالیت شرکت و استعلامات بانکی می‌باشد.
      </div>
    </div>
  );
}
