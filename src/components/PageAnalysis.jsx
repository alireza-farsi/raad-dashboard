import { toFa } from '../utils/format';

// Page 8 of the PDF: "عارضه‌یابی اطلاعات مالی"
// A single 2-column table (شاخص / وضعیت) grouped under 4 categories:
//   1) دارایی‌ها و بدهی‌ها
//   2) حقوق مالکانه
//   3) درآمد، سود و زیان
//   4) رفتار اعتباری
// Each row's وضعیت may carry a flag (yellow/red/green) — the PDF shows
// "وضعیت نقدینگی" with a yellow flag; the rest are normal.

const CATEGORIES = [
  { key: 'assetsLiabilities', title: 'دارایی‌ها و بدهی‌ها' },
  { key: 'equity', title: 'حقوق مالکانه' },
  { key: 'income', title: 'درآمد، سود و زیان' },
  { key: 'creditBehavior', title: 'رفتار اعتباری' },
];

export default function PageAnalysis({ diagnosis, year }) {
  if (!diagnosis) {
    return (
      <div className="page-inner">
        <div className="empty-note">
          داده عارضه‌یابی برای سال {toFa(year)} در دسترس نیست.
        </div>
      </div>
    );
  }

  return (
    <div className="page-inner">
      <div className="card">
        <div className="card-title">
          عارضه‌یابی اطلاعات مالی
          <span className="card-hint">سال {toFa(year)}</span>
        </div>
        <table className="diagnosis-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>شاخص</th>
              <th style={{ width: '75%' }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => {
              const records = diagnosis[cat.key] || [];
              return (
                <CategoryBlock key={cat.key} title={cat.title} records={records} />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryBlock({ title, records }) {
  return (
    <>
      <tr className="diagnosis-section-row">
        <td colSpan={2}>{title}</td>
      </tr>
      {records.map((rec) => {
        const flag = rec.flag;
        const flagClass = flag === 'yellow' ? 'flag-yellow'
          : flag === 'red' ? 'flag-red'
          : flag === 'green' ? 'flag-green'
          : '';
        return (
          <tr key={rec.code}>
            <td className="indicator-cell">{rec.indicatorText}</td>
            <td className={`diagnosis-status-cell ${flagClass}`}>{rec.description}</td>
          </tr>
        );
      })}
    </>
  );
}
