// Pure-CSS horizontal bar chart. Each row is real text, so screen readers get every value.
export default function BarChart({ title, data, unit = 'enrollment', emptyText = 'No data yet.' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure className="bar-chart">
      <figcaption className="sr-only">{title}</figcaption>
      {data.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="bar-list" role="list">
          {data.map((d) => (
            <li key={d.id} className="bar-row">
              <span className="bar-label" title={d.label}>{d.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
              </span>
              <span className="bar-value">
                {d.value}
                <span className="sr-only"> {d.value === 1 ? unit : `${unit}s`}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
