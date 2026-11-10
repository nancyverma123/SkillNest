import { Link } from 'react-router-dom';
import Icon from '../Icon';
import StatCard from '../StatCard';
import BarChart from '../BarChart';
import ProgressBar from '../ProgressBar';
import StatusBadge from '../StatusBadge';
import ResponsiveTable from '../ResponsiveTable';
import { ErrorState } from '../EmptyState';
import { Skeleton, SkeletonTable } from '../SkeletonLoader';
import { formatDate } from '../../lib/format';

export default function OverviewPanel({ stats, enrollments, error, onRetry }) {
  if (error) return <ErrorState title="We couldn't load platform statistics" message={error} onRetry={onRetry} />;
  const loading = !stats;
  const recent = (enrollments || []).slice(0, 5);
  const byStatus = stats?.enrollmentsByStatus || { active: 0, completed: 0 };

  return (
    <>
      <section aria-label="Platform totals" className="stat-grid" style={{ '--stat-cols': 4 }}>
        <StatCard icon="bookOpen" label="Total courses" value={stats?.totalCourses} loading={loading} />
        <StatCard icon="users" label="Total users" value={stats?.totalUsers} tone="orange" loading={loading} />
        <StatCard icon="layers" label="Total enrollments" value={stats?.totalEnrollments} tone="info" loading={loading} />
        <StatCard icon="checkCircle" label="Completed enrollments" value={byStatus.completed} tone="success" loading={loading} />
      </section>

      <section className="card panel-card" aria-labelledby="chart-title">
        <div className="panel-head">
          <h2 id="chart-title" className="panel-title">Enrollments per course</h2>
          <Link className="text-link" to="/admin?tab=courses">Manage courses <Icon name="arrowRight" size={16} /></Link>
        </div>
        {loading ? (
          <div role="status" aria-busy="true" style={{ display: 'grid', gap: 14 }}>
            <span className="sr-only">Loading chart…</span>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="sk-line sk-lg" />)}
          </div>
        ) : (
          <>
            <BarChart
              title="Number of enrollments for each course"
              data={stats.enrollmentsPerCourse.map((c) => ({ id: c.courseId, label: c.title, value: c.count }))}
              emptyText="No courses yet. Add a course to start tracking enrollments."
            />
            {stats.totalEnrollments > 0 && (
              <div style={{ marginTop: 24 }}>
                <ProgressBar value={byStatus.completed} max={stats.totalEnrollments} label="Enrollments completed across all courses" />
              </div>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="recent-title">
        <div className="section-title-row">
          <h2 id="recent-title">Recent enrollments</h2>
          <Link className="text-link" to="/admin?tab=enrollments">View all <Icon name="arrowRight" size={16} /></Link>
        </div>
        {!enrollments ? (
          <SkeletonTable rows={3} cols={4} label="Loading recent enrollments" />
        ) : recent.length ? (
          <ResponsiveTable caption="Five most recent enrollments" columns={['Learner', 'Course', 'Status', 'Enrolled']}>
            {recent.map((e) => (
              <tr key={e._id}>
                <td><span className="cell-title">{e.user?.name || 'Deleted user'}</span><br /><span className="cell-sub">{e.user?.email}</span></td>
                <td>{e.course?.title || 'Deleted course'}</td>
                <td><StatusBadge status={e.status} /></td>
                <td>{formatDate(e.createdAt)}</td>
              </tr>
            ))}
          </ResponsiveTable>
        ) : (
          <p className="muted">No enrollments yet.</p>
        )}
      </section>
    </>
  );
}
