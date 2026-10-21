import { toFa } from '../utils/format';

// "درباره شرکت" — rebuilt from scratch following the UI-sample PDF (page 2).
//
// The old layout used a 2-column grid where the right column held a single
// small table next to four stacked cards — leaving ~900px of dead space.
//
// New layout — full-width stacked sections (PDF style), perfectly balanced:
//   1) معرفی شرکت        — full-width hero: avatar, name, badges, intro text, meta chips
//   2) مشخصات کلی        — full-width card, 3-column fact grid (12 fields)
//   3) two tables row    — اعضای هیئت مدیره (5 rows) | سهامداران (6 rows)
//   4) two cards row     — محل فعالیت | مخاطبین کلیدی
//   5) محصولات دانش‌بنیان — full-width table (4 columns incl. tech category)

export default function PageAbout({
  companyInfo,
  knowledgeBase,
  boardOfDirectors,
  shareholders,
  products,
}) {
  const kb = knowledgeBase;

  // Auto-composed introduction paragraph from the company data.
  const intro = buildIntro(companyInfo, kb);
  const kbYearsActive = kb?.kbYears ? Object.entries(kb.kbYears).filter(([, v]) => v).length : 0;

  return (
    <div className="page-inner">
      {/* ── 1. معرفی شرکت ─────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-side">
          <div className="about-avatar">{companyInfo.name?.slice(0, 1) || 'ر'}</div>
        </div>
        <div className="about-hero-body">
          <div className="about-hero-head">
            <h2 className="about-name">شرکت {companyInfo.name}</h2>
            <div className="about-badges">
              <span className="badge badge-teal">{companyInfo.legalType}</span>
              <span className="badge badge-gold">شرکت {companyInfo.companySize}</span>
              <span className="badge badge-outline">{companyInfo.activity}</span>
              {kb?.kbStatus && <span className="badge badge-success">دانش‌بنیان — {kb.kbStatus}</span>}
            </div>
          </div>
          <p className="about-intro">{intro}</p>
          <div className="about-meta-chips">
            <MetaChip label="مدیرعامل" value={companyInfo.ceo} />
            <MetaChip label="تأسیس" value={toFa(companyInfo.establishmentDate)} />
            <MetaChip label="استان" value={`${companyInfo.province} — ${companyInfo.city}`} />
            <MetaChip label="نیروی انسانی" value={`${toFa(companyInfo.employeeNum)} نفر`} />
            <MetaChip label="شناسه ملی" value={toFa(companyInfo.nationalCode)} ltr />
          </div>
        </div>
      </section>

      {/* ── 2. مشخصات کلی ─────────────────────────────────────── */}
      <section className="card about-card">
        <div className="card-title">مشخصات کلی</div>
        <div className="fact-grid three">
          <Fact label="شناسه ملی" value={toFa(companyInfo.nationalCode)} ltr />
          <Fact label="نوع حقوقی" value={companyInfo.legalType} />
          <Fact label="اندازه شرکت" value={companyInfo.companySize} />
          <Fact label="نوع فعالیت" value={companyInfo.activity} />
          <Fact label="حوزه فعالیت" value={companyInfo.intaCategory} />
          <Fact label="تاریخ تأسیس" value={toFa(companyInfo.establishmentDate)} />
          <Fact label="استان" value={companyInfo.province} />
          <Fact label="شهر" value={companyInfo.city} />
          <Fact label="تعداد کارکنان" value={`${toFa(companyInfo.employeeNum)} نفر`} />
          <Fact label="دسته فناوری" value={kb?.techCategory} />
          <Fact label="نوع دانش‌بنیان" value={kb?.kbStatus} />
          <Fact
            label="سال‌های دانش‌بنیان"
            value={kb ? `${toFa(kb.firstKbYear)} تا ${toFa(kb.lastKbYear)} (${toFa(kbYearsActive)} سال)` : '—'}
          />
        </div>
      </section>

      {/* ── 3. هیئت مدیره + سهامداران (two balanced tables) ──── */}
      <div className="grid-2col">
        <section className="card about-card">
          <div className="card-title">اعضای هیئت مدیره</div>
          <table className="mini-table">
            <thead>
              <tr>
                <th style={{ width: '34%' }}>نام عضو</th>
                <th style={{ width: '26%' }}>نوع عضویت</th>
                <th style={{ width: '18%' }}>آخرین مدرک</th>
                <th style={{ width: '22%' }}>پست الکترونیک</th>
              </tr>
            </thead>
            <tbody>
              {boardOfDirectors.map((m) => (
                <tr key={m.name + m.role}>
                  <td className="board-name">
                    <span className="board-gender-dot" data-g={m.gender === 'زن' ? 'f' : 'm'} />
                    {m.name}
                  </td>
                  <td>{m.role}</td>
                  <td>{m.degree}</td>
                  <td className="email-cell">{m.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card about-card">
          <div className="card-title">سهامداران</div>
          <table className="mini-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>اسامی</th>
                <th style={{ width: '24%' }}>شناسه/شماره ملی</th>
                <th style={{ width: '16%' }}>ماهیت</th>
                <th style={{ width: '30%' }}>درصد از سهام</th>
              </tr>
            </thead>
            <tbody>
              {shareholders.map((s) => (
                <tr key={s.name + (s.percent ?? '')}>
                  <td>{s.name}</td>
                  <td className="num">{s.nationalCode ? toFa(s.nationalCode) : '—'}</td>
                  <td>{s.type || '—'}</td>
                  <td>
                    <div className="share-cell">
                      <div className="share-track">
                        <div className="share-fill" style={{ width: `${Math.min(100, s.percent || 0)}%` }} />
                      </div>
                      <span>{toFa(s.percent)}٪</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* ── 4. محل فعالیت + مخاطبین کلیدی ───────────────────── */}
      <div className="grid-2col">
        <section className="card about-card">
          <div className="card-title">محل فعالیت</div>
          <div className="fact-grid two">
            <Fact label="استان" value={companyInfo.province} />
            <Fact label="شهر" value={companyInfo.city} />
          </div>
          <div className="address-box" style={{ marginTop: 10 }}>
            <span className="address-label">آدرس دفتر مرکزی</span>
            <span>{companyInfo.centralOfficeAdd}</span>
          </div>
          <div className="fact-grid two" style={{ marginTop: 10 }}>
            <Fact label="تلفن دفتر مرکزی" value={toFa(companyInfo.centralOfficePN)} ltr />
            <Fact label="کد پستی محل فعالیت" value="—" />
          </div>
        </section>

        <section className="card about-card">
          <div className="card-title">مخاطبین کلیدی</div>
          <div className="contact-list">
            <ContactRow
              role="مدیرعامل"
              name={companyInfo.ceo}
              phone={companyInfo.ceoPhone}
            />
            <ContactRow
              role="مدیر مالی"
              name={companyInfo.financialManager}
              phone={companyInfo.financialManagerPhone}
            />
            <ContactRow
              role="رابط دریافت گزارش"
              name={companyInfo.connector}
              phone={companyInfo.connectorPhone}
            />
          </div>
          <div className="contact-note">
            ساعات پاسخگویی: شنبه تا چهارشنبه ۸ تا ۱۶ — پنج‌شنبه ۸ تا ۱۲
          </div>
        </section>
      </div>

      {/* ── 5. محصولات و خدمات ارزیابی دانش‌بنیان ────────────── */}
      <section className="card about-card">
        <div className="card-title">محصولات و خدمات ارزیابی دانش‌بنیان</div>
        <table className="mini-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>نام محصول</th>
              <th style={{ width: '16%' }}>برند</th>
              <th style={{ width: '30%' }}>دسته فناوری</th>
              <th style={{ width: '16%' }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const status = (p.lastValidatingStatus || '').trim();
              let tag = 'tag-neutral';
              let label = 'در انتظار ارزیابی';
              if (status === 'تایید' || status === 'تأیید') {
                tag = 'tag-approved';
                label = 'تأیید بدون معافیت';
              } else if (status === 'رد(آرشیو)') {
                tag = 'tag-archive';
                label = 'عدم تأیید (آرشیو)';
              } else if (status === 'رد') {
                tag = 'tag-rejected';
                label = 'عدم تأیید';
              }
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.brand || '—'}</td>
                  <td className="tech-cell">{p.techCategory || '—'}</td>
                  <td>
                    <span className={`product-tag ${tag}`}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** Compose the company introduction paragraph from the structured data. */
function buildIntro(ci, kb) {
  const parts = [];
  parts.push(
    `شرکت ${ci.name} به صورت ${ci.legalType} در تاریخ ${toFa(ci.establishmentDate)} در شهر ${ci.city} استان ${ci.province} تأسیس شده و در حوزه «${ci.intaCategory}» به‌عنوان یک شرکت ${ci.activity} در مقیاس ${ci.companySize} با بیش از ${toFa(ci.employeeNum)} نفر نیروی انسانی فعالیت می‌کند.`
  );
  if (kb?.kbStatus) {
    parts.push(
      `این شرکت از سال ${toFa(kb.firstKbYear)} با گواهی‌نامه تاریخ ${toFa(kb.certificateDate)} در فهرست شرکت‌های دانش‌بنیان کشور با رتبه «${kb.kbStatus}» قرار دارد و محصولات آن در دسته فناوری «${kb.techCategory}» ارزیابی و تأیید شده‌اند.`
    );
  }
  parts.push(
    `اطلاعات این گزارش بر پایه صورت‌های مالی حسابرسی‌شده، اطلاعات رسمی سامانه‌های بانکی و داده‌های اعتباری شرکت گردآوری و در قالب شاخص‌های کلیدی مالی، رتبه اعتباری و ارقام مقایسه‌ای ارائه شده است.`
  );
  return parts.join(' ');
}

function Fact({ label, value, ltr }) {
  return (
    <div className="fact-item">
      <div className="fact-label">{label}</div>
      <div className={`fact-value${ltr ? ' ltr' : ''}`}>{value ?? '—'}</div>
    </div>
  );
}

function MetaChip({ label, value, ltr }) {
  return (
    <span className="about-meta-chip">
      <span className="about-meta-chip-label">{label}</span>
      <span className={`about-meta-chip-value${ltr ? ' ltr' : ''}`}>{value ?? '—'}</span>
    </span>
  );
}

function ContactRow({ role, name, phone }) {
  return (
    <div className="contact-row">
      <div className="contact-role">{role}</div>
      <div className="contact-person">
        <span className="contact-avatar">{name?.slice(0, 1)}</span>
        <span className="contact-name">{name}</span>
      </div>
      <div className="contact-phone">{phone ? toFa(`0${String(phone).split('.')[0]}`) : '—'}</div>
    </div>
  );
}
