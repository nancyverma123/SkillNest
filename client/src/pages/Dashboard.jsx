import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { enrollmentApi } from '../lib/services';
import { firstName, formatDate, initials, plural } from '../lib/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import EnrollmentCard from '../components/EnrollmentCard';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { CourseMedia } from '../components/CourseVisual';
import { Skeleton, SkeletonCards } from '../components/SkeletonLoader';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  useDocumentTitle('My Learning');
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingId, setPendingId] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const coursesHeading = useRef(null);
  const refocusAfterRemove = useRef(false);

  const load = useCallback(() => {
    setError('');
    setItems(null);
    enrollmentApi.mine()
      // Enrollments whose course was deleted come back with course: null — hide them.
      .then((list) => setItems(list.filter((e) => e.course)))
      .catch((e) => setError(errMsg(e)));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (toRemove || !refocusAfterRemove.current) return;
    refocusAfterRemove.current = false;
    coursesHeading.current?.focus();
  }, [toRemove]);

  const { active, completed } = useMemo(() => ({
    active: (items || []).filter((e) => e.status === 'active'),
    completed: (items || []).filter((e) => e.status === 'completed'),
  }), [items]);
  const total = items?.length ?? 0;
  const visible = filter === 'all' ? items || [] : filter === 'active' ? active : completed;
  const next = active[0];
  const loading = items === null && !error;

  const markComplete = useCallback(async (enr) => {
    if (pendingId) return;
    setPendingId(enr._id);
    try {
      const updated = await enrollmentApi.complete(enr._id);
      setItems((list) => list.map((x) => (x._id === enr._id ? { ...x, status: updated.status, completedAt: updated.completedAt } : x)));
      toast.success(`"${enr.course.title}" is marked as completed.`, 'Nice work!');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setPendingId(null);
    }
  }, [pendingId, toast]);

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await enrollmentApi.remove(toRemove._id);
      setItems((list) => list.filter((x) => x._id !== toRemove._id));
      toast.success(`You have been unenrolled from "${toRemove.course.title}".`);
      // The triggering button no longer exists, so focus moves to the section heading once the modal closes.
      refocusAfterRemove.current = true;
      setToRemove(null);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setRemoving(false);
    }
  };

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: 'grid', href: '#overview' },
    { key: 'courses', label: 'My courses', icon: 'bookOpen', href: '#my-courses', count: items ? total : null },
    { key: 'profile', label: 'Profile', icon: 'user', href: '#profile' },
    { key: 'explore', label: 'Explore courses', icon: 'compass', to: '/courses' },
  ];

  return (
    <div className="container app-shell">
      <Sidebar label="Dashboard sections" title="Student space" items={sidebarItems} />

      <div className="app-main">
        <header className="page-head" id="overview">
          <div>
            <p className="eyebrow">Student dashboard</p>
            <h1 className="page-title">Welcome, {firstName(user.name)}</h1>
            <p className="muted">Here's an overview of your learning.</p>
          </div>
          <Link className="btn btn-secondary" to="/courses"><Icon name="compass" size={18} />Explore courses</Link>
        </header>

        <section aria-label="Learning overview" className="stat-grid">
          <StatCard icon="bookOpen" label="Enrolled courses" value={total} loading={loading} />
          <StatCard icon="play" label="In progress" value={active.length} tone="info" loading={loading} />
          <StatCard icon="checkCircle" label="Completed" value={completed.length} tone="success" loading={loading} />
        </section>

        {error ? (
          <ErrorState title="We couldn't load your courses" message={error} onRetry={load} />
        ) : (
          <>
            <div className="dash-grid">
              <section className="card panel-card" aria-labelledby="progress-title">
                <div className="panel-head"><h2 id="progress-title" className="panel-title">Progress summary</h2></div>
                {loading ? (
                  <div role="status" aria-busy="true"><span className="sr-only">Loading progress…</span><Skeleton className="sk-line sk-lg" /></div>
                ) : total ? (
                  <>
                    <ProgressBar value={completed.length} max={total} label={`${completed.length} of ${plural(total, 'course')} completed`} />
                    <div className="summary-legend">
                      <span><i style={{ background: 'var(--c-secondary)' }} aria-hidden="true" />{completed.length} completed</span>
                      <span><i style={{ background: 'var(--c-tint-3)' }} aria-hidden="true" />{active.length} in progress</span>
                    </div>
                  </>
                ) : (
                  <p className="muted">Enroll in a course to start tracking your progress.</p>
                )}
              </section>

              <section className="card panel-card" aria-labelledby="continue-title">
                <div className="panel-head"><h2 id="continue-title" className="panel-title">Continue learning</h2></div>
                {loading ? (
                  <Skeleton style={{ height: 160, borderRadius: 12 }} />
                ) : next ? (
                  <article className="card continue-card" style={{ boxShadow: 'none' }}>
                    <CourseMedia course={next.course} className="continue-media" />
                    <div className="continue-body">
                      <StatusBadge status="active" />
                      <h3>{next.course.title}</h3>
                      <p className="text-sm muted">{next.course.instructor} · Enrolled {formatDate(next.createdAt)}</p>
                      <div className="continue-actions">
                        <Link className="btn btn-primary btn-sm" to={`/courses/${next.course._id}`} aria-label={`Continue: ${next.course.title}`}>
                          Continue <Icon name="arrowRight" size={16} />
                        </Link>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => markComplete(next)}
                          aria-disabled={pendingId === next._id || undefined} aria-label={`Mark as completed: ${next.course.title}`}>
                          <Icon name="check" size={16} />Mark as completed
                        </button>
                      </div>
                    </div>
                  </article>
                ) : total ? (
                  <EmptyState icon="award" title="All caught up!"
                    action={<Link className="btn btn-primary" to="/courses">Find your next course</Link>}>
                    You've completed every course you're enrolled in.
                  </EmptyState>
                ) : (
                  <EmptyState icon="compass" title="Your learning path starts here"
                    action={<Link className="btn btn-primary" to="/courses">Explore courses</Link>}>
                    Enroll in a course and it will appear here.
                  </EmptyState>
                )}
              </section>
            </div>

            <section aria-labelledby="my-courses-title" id="my-courses">
              <div className="section-title-row">
                <h2 id="my-courses-title" ref={coursesHeading} tabIndex={-1}>My courses</h2>
                <div className="segmented" role="group" aria-label="Filter courses by status">
                  {FILTERS.map((f) => {
                    const n = f.key === 'all' ? total : f.key === 'active' ? active.length : completed.length;
                    return (
                      <button key={f.key} type="button" className="segmented-btn" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                        {f.label} ({n})
                      </button>
                    );
                  })}
                </div>
              </div>
              {loading ? (
                <SkeletonCards count={3} label="Loading your courses" />
              ) : visible.length ? (
                <ul className="enroll-list" role="list">
                  {visible.map((e) => (
                    <li key={e._id}>
                      <EnrollmentCard enrollment={e} busy={pendingId === e._id} onComplete={markComplete} onRemove={setToRemove} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={filter === 'completed' ? 'award' : 'bookOpen'}
                  title={filter === 'completed' ? 'No completed courses yet' : filter === 'active' ? 'No courses in progress' : 'No enrolled courses yet'}
                  action={<Link className="btn btn-primary" to="/courses">Browse courses</Link>}>
                  {filter === 'completed' ? 'Mark a course as completed and it will show up here.' : 'Enroll in a course to see it here.'}
                </EmptyState>
              )}
            </section>
          </>
        )}

        <section aria-labelledby="profile-title" id="profile">
          <div className="section-title-row"><h2 id="profile-title">Profile</h2></div>
          <div className="card profile-card">
            <span className="avatar avatar-lg" aria-hidden="true">{initials(user.name)}</span>
            <dl className="profile-list">
              <div><dt>Name</dt><dd>{user.name}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Account type</dt><dd><StatusBadge status={user.role} /></dd></div>
              {user.createdAt && <div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>}
            </dl>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={Boolean(toRemove)}
        title="Unenroll from this course?"
        description={toRemove && <>You will be removed from <strong>{toRemove.course.title}</strong>. You can enroll again later, but your completion status will be lost.</>}
        confirmLabel="Unenroll"
        busy={removing}
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}
