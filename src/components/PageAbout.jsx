import { toFa } from '../utils/format';

// Page 1 of the PDF: "درباره شرکت"
// Layout (top-to-bottom, two-column):
//   Left column:
//     - شناسه‌شرکت (6 facts in 2x3 grid)
//     - محل فعالیت (3 facts + آدرس + 5 phone/name facts)
//     - اعضای هیئت مدیره (table: نام عضو / نوع عضویت / آخرین مدرک)
//     - سهامداران (table: اسامی / شناسه‌شماره ملی / ماهیت / درصد از سهام)
//   Right column:
//     - محصولات و خدمات ارزیابی دانش‌بنیان (table: نام محصول / وضعیت)
export default function PageAbout({
  companyInfo,
  knowledgeBase,
  boardOfDirectors,
  shareholders,
  products,
}) {
  return (
    <div className="page-inner">
      <div className="grid-2col">
        {/* LEFT COLUMN */}
        <div>
          {/* شناسه‌شرکت */}
          <div className="card">
            <div className="card-title">شناسه‌شرکت</div>
            <div className="fact-grid three">
              <Fact label="شناسه ملی" value={toFa(companyInfo.nationalCode)} ltr />
              <Fact label="نوع حقوقی" value={companyInfo.legalType} />
              <Fact label="تعداد کارکنان" value={toFa(companyInfo.employeeNum)} ltr />
              <Fact label="دسته فناوری" value={knowledgeBase?.techCategory} />
              <Fact label="نوع دانش‌بنیان" value={knowledgeBase?.kbStatus} />
              <Fact label="اندازه شرکت" value={companyInfo.companySize} />
            </div>
          </div>

          {/* محل فعالیت */}
          <div className="card">
            <div className="card-title">محل فعالیت</div>
            <div className="fact-grid two">
              <Fact label="استان" value={companyInfo.province} />
              <Fact label="شهر" value={companyInfo.city} />
            </div>
            <div className="address-box" style={{ marginTop: 10 }}>
              <span className="address-label">آدرس</span>
              <span>{companyInfo.centralOfficeAdd}</span>
            </div>
            <div className="fact-grid two" style={{ marginTop: 10 }}>
              <Fact label="نام مدیرعامل" value={companyInfo.ceo} />
              <Fact label="شماره تماس مدیر عامل" value={toFa(companyInfo.ceoPhone)} ltr />
              <Fact label="نام مدیر مالی" value={companyInfo.financialManager} />
              <Fact label="شماره تماس مدیر مالی" value={toFa(companyInfo.financialManagerPhone)} ltr />
              <Fact label="شماره تماس رابط" value={toFa(companyInfo.connectorPhone)} ltr />
              <Fact label="نام رابط" value={companyInfo.connector} />
            </div>
          </div>

          {/* اعضای هیئت مدیره */}
          <div className="card">
            <div className="card-title">اعضای هیئت مدیره</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>نام عضو</th>
                  <th style={{ width: '35%' }}>نوع عضویت</th>
                  <th style={{ width: '25%' }}>آخرین مدرک</th>
                </tr>
              </thead>
              <tbody>
                {boardOfDirectors.map((m) => (
                  <tr key={m.name + m.role}>
                    <td>{m.name}</td>
                    <td>{m.role}</td>
                    <td>{m.degree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* سهامداران */}
          <div className="card">
            <div className="card-title">سهامداران</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>اسامی</th>
                  <th style={{ width: '23%' }}>شناسه/شماره ملی</th>
                  <th style={{ width: '20%' }}>ماهیت</th>
                  <th style={{ width: '25%' }}>درصد از سهام</th>
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
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* محصولات و خدمات ارزیابی دانش‌بنیان */}
          <div className="card">
            <div className="card-title">محصولات و خدمات ارزیابی دانش‌بنیان</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th style={{ width: '65%' }}>نام محصول</th>
                  <th style={{ width: '35%' }}>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = (p.lastValidatingStatus || '').trim();
                  let tag = 'tag-neutral';
                  let label = status || '—';
                  if (status === 'تایید' || status === 'تأیید') {
                    tag = 'tag-approved';
                    label = 'تأیید بدون معافیت';
                  } else if (status === 'رد(آرشیو)') {
                    tag = 'tag-archive';
                    label = 'عدم تأیید';
                  } else if (status === 'رد') {
                    tag = 'tag-rejected';
                    label = 'عدم تأیید';
                  }
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>
                        <span className={`product-tag ${tag}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, ltr }) {
  return (
    <div className="fact-item">
      <div className="fact-label">{label}</div>
      <div className={`fact-value${ltr ? ' ltr' : ''}`}>{value ?? '—'}</div>
    </div>
  );
}
