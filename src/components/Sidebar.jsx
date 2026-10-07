const pages = [
  { key: 'about', label: 'درباره شرکت', sub: 'معرفی و ترکیب سهامداران' },
  { key: 'summary', label: 'خلاصه گزارش', sub: 'شاخص‌های کلیدی و رتبه اعتباری' },
  { key: 'pl', label: 'صورت سود و زیان', sub: 'عملکرد دوره‌های مالی' },
  { key: 'balance', label: 'ترازنامه', sub: 'دارایی‌ها و بدهی‌ها' },
  { key: 'credit', label: 'اعتباری', sub: 'تسهیلات و رفتار اعتباری' },
  { key: 'comparative1', label: 'ارقام مقایسه‌ای', sub: 'ترازنامه و سود و زیان' },
  { key: 'comparative2', label: 'ارقام مقایسه‌ای', sub: 'ترازنامه و اعتبارات' },
  { key: 'analysis', label: 'عارضه‌یابی مالی', sub: 'تحلیل سلامت اطلاعات مالی' },
];

/** Decorative wave header — the signature graphic of the UI-sample design. */
function WaveArt() {
  return (
    <svg viewBox="0 0 220 108" preserveAspectRatio="none" aria-hidden="true">
      {/* flowing parallel curves */}
      {[
        { d: 'M-10,86 C30,58 62,96 104,72 C146,48 178,80 230,50', o: 0.35 },
        { d: 'M-10,74 C34,46 66,84 108,60 C150,36 182,66 230,36', o: 0.5 },
        { d: 'M-10,62 C38,34 70,72 112,48 C154,24 186,52 230,22', o: 0.65 },
        { d: 'M-10,50 C42,22 74,60 116,36 C158,12 190,38 230,8', o: 0.85 },
      ].map((w, i) => (
        <path
          key={i}
          d={w.d}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={w.o}
        />
      ))}
      {/* scattered data dots */}
      {[
        [22, 30], [40, 44], [58, 22], [76, 38], [96, 18], [118, 34], [142, 20], [168, 32],
      ].map(([cx, cy], i) => (
        <circle key={`d-${i}`} cx={cx} cy={cy} r="2.6" fill="#ffffff" opacity="0.9" />
      ))}
    </svg>
  );
}

export default function Sidebar({ active, onChange, companyName }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-wave">
        <WaveArt />
        <div className="sidebar-wave-sub">گزارش اعتبارسنجی شرکت</div>
        <div className="sidebar-wave-title">گزارش‌های پیشرفته مالی</div>
      </div>

      <div className="sidebar-brand">
        <div className="brand-mark">
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <rect x="2" y="14" width="6" height="14" rx="1.5" fill="#14967f" />
            <rect x="12" y="7" width="6" height="21" rx="1.5" fill="#0b5d47" />
            <rect x="22" y="18" width="6" height="10" rx="1.5" fill="#d4a373" />
          </svg>
        </div>
        <div>
          <div className="brand-title">گزارش اعتبارسنجی</div>
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
            <div>{p.label}</div>
            <div className="nav-sub">{p.sub}</div>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <rect x="2" y="12" width="5" height="12" rx="1" fill="#1565c0" />
          <rect x="10" y="6" width="5" height="18" rx="1" fill="#1976d2" />
          <rect x="18" y="16" width="5" height="8" rx="1" fill="#2196f3" />
        </svg>
        <div className="sidebar-foot-text">
          <b>شرکت فناوری بازار سرمایه</b>
          سامانه تحلیل و اعتبارسنجی
        </div>
      </div>
    </aside>
  );
}
