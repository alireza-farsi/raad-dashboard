const pages = [
  { key: 'about', label: 'درباره شرکت' },
  { key: 'summary', label: 'خلاصه گزارش' },
  { key: 'pl', label: 'صورت سود و زیان' },
  { key: 'balance', label: 'ترازنامه' },
  { key: 'credit', label: 'اعتباری' },
  { key: 'comparative1', label: 'ارقام مقایسه‌ای (ترازنامه و سود و زیان)' },
  { key: 'comparative2', label: 'ارقام مقایسه‌ای (ترازنامه و اعتبارات)' },
  { key: 'analysis', label: 'عارضه‌یابی اطلاعات مالی' },
];

export default function Sidebar({ active, onChange, companyName }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <rect x="2" y="12" width="5" height="12" rx="1" fill="#1d9e75" />
            <rect x="10" y="6" width="5" height="18" rx="1" fill="#085041" />
            <rect x="18" y="16" width="5" height="8" rx="1" fill="#0f6e56" />
          </svg>
        </div>
        <div>
          <div className="brand-title">گزارش اعتبارسنجی شرکت</div>
          <div className="brand-sub">{companyName}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {pages.map((p) => (
          <button
            key={p.key}
            className={`nav-item ${active === p.key ? 'active' : ''}`}
            onClick={() => onChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
