export default function ProgressBar({ value, max, label, showValue = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-head">
        <span>{label}</span>
        {showValue && <span className="progress-value" aria-hidden="true">{pct}%</span>}
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${value} of ${max} (${pct}%)`}
      >
        <span style={{ width: `${pct}%`, borderRightWidth: pct === 0 ? 0 : undefined }} />
      </div>
    </div>
  );
}
