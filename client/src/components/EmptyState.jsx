import Icon from './Icon';

export default function EmptyState({ icon = 'search', title, children, action, tone, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className={`empty-state${tone === 'error' ? ' empty-error' : ''}`}>
      <div className="empty-icon"><Icon name={icon} size={26} /></div>
      <Heading>{title}</Heading>
      {children && <p className="muted">{children}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Something went wrong' }) {
  return (
    <EmptyState
      icon="alertCircle"
      tone="error"
      title={title}
      action={onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <Icon name="rotateCcw" size={18} />Try again
        </button>
      )}
    >
      {message}
    </EmptyState>
  );
}
