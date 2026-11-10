import Icon from './Icon';
import { Skeleton } from './SkeletonLoader';

export default function StatCard({ icon, label, value, hint, tone = 'coral', loading }) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon tone-${tone}`}><Icon name={icon} size={22} /></div>
      <div>
        <p className="stat-label">{label}</p>
        {loading ? <Skeleton className="sk-stat" /> : <p className="stat-value">{value}</p>}
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </div>
  );
}
