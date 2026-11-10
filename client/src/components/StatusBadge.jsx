const STATUS = {
  active: ['info', 'In progress'],
  completed: ['success', 'Completed'],
  admin: ['warning', 'Admin'],
  student: ['neutral', 'Student'],
};

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function StatusBadge({ status, label }) {
  const [tone, text] = STATUS[status] || ['neutral', status];
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label || text}
    </span>
  );
}
