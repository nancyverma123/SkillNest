export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCards({ count = 6, label = 'Loading courses' }) {
  return (
    <div className="course-grid" role="status" aria-busy="true">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: count }, (_, i) => (
        <div className="card skeleton-card" key={i} aria-hidden="true">
          <Skeleton className="sk-media" />
          <div className="sk-body">
            <Skeleton className="sk-line sk-w40" />
            <Skeleton className="sk-line sk-lg" />
            <Skeleton className="sk-line" />
            <Skeleton className="sk-line sk-w70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, label = 'Loading data' }) {
  return (
    <div className="table-wrap" role="status" aria-busy="true">
      <span className="sr-only">{label}…</span>
      <table aria-hidden="true">
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr className="sk-row" key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}><Skeleton className="sk-line" style={{ width: c === 0 ? '70%' : '50%' }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
