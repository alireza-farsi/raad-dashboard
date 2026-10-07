export default function YearFilter({ years, selected, onChange }) {
  return (
    <div className="year-filter">
      <span className="year-filter-label">سال مالی:</span>
      <div className="year-filter-pills">
        {years.map((y) => (
          <button
            key={y}
            className={`year-pill ${selected === y ? 'active' : ''}`}
            onClick={() => onChange(y)}
          >
            {toFarsiDigits(y)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function toFarsiDigits(input) {
  const map = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}
