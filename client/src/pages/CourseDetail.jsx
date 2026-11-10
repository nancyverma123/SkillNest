import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { courseApi, enrollmentApi } from '../lib/services';
import { formatDate, formatPrice, initials } from '../lib/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import StatusBadge, { Badge } from '../components/StatusBadge';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { CourseMedia } from '../components/CourseVisual';
import { Skeleton } from '../components/SkeletonLoader';

const LEVEL_NOTES = {
  Beginner: 'No prior experience needed — ideal as a first course in this topic.',
  Intermediate: 'Best if you already know the fundamentals and want to apply them further.',
  Advanced: 'Assumes solid working knowledge; focuses on depth and complex use cases.',
};

function DetailSkeleton() {
  return (
    <div className="container section-tight" role="status" aria-busy="true">
      <span className="sr-only">Loading course…</span>
      <div className="detail-grid" aria-hidden="true">
        <div style={{ display: 'grid', gap: 16 }}>
          <Skeleton className="sk-line sk-w40" />
          <Skeleton style={{ height: 44, width: '80%' }} />
          <Skeleton className="sk-line" />
          <Skeleton className="sk-line sk-w70" />
        </div>
        <Skeleton style={{ height: 420, borderRadius: 18 }} />
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | notfound | error
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  useDocumentTitle(course?.title || (state === 'notfound' ? 'Course not found' : 'Course details'));

  useEffect(() => {
    let active = true;
    setState('loading');
    setCourse(null);
    courseApi.get(id)
      .then((c) => { if (active) { setCourse(c); setState('ready'); } })
      .catch((e) => {
        if (!active) return;
        setError(errMsg(e));
        setState(e.response?.status === 404 ? 'notfound' : 'error');
      });
    return () => { active = false; };
  }, [id, reload]);

  useEffect(() => {
    if (!user) { setEnrollment(null); return undefined; }
    let active = true;
    enrollmentApi.mine()
      .then((list) => { if (active) setEnrollment(list.find((e) => e.course?._id === id) || null); })
      .catch(() => {});
    return () => { active = false; };
  }, [user, id]);

  const enroll = async () => {
    if (!user) { navigate('/auth', { state: { from: location } }); return; }
    if (enrolling) return;
    setEnrolling(true);
    try {
      setEnrollment(await enrollmentApi.enroll(id));
      toast.success('This course is now in My Learning.', 'Enrollment confirmed');
    } catch (e) {
      toast.error(errMsg(e));
      if (e.response?.status === 409) setEnrollment({ status: 'active' });
    } finally {
      setEnrolling(false);
    }
  };

  if (state === 'loading') return <DetailSkeleton />;
  if (state === 'notfound' || state === 'error') {
    return (
      <div className="container section">
        {state === 'notfound' ? (
          <EmptyState icon="search" title="Course not found" headingLevel={1}
            action={<Link className="btn btn-primary" to="/courses">Browse all courses</Link>}>
            This course may have been removed or the link is incorrect.
          </EmptyState>
        ) : (
          <ErrorState title="We couldn't load this course" message={error} onRetry={() => setReload((n) => n + 1)} />
        )}
      </div>
    );
  }

  const c = course;
  const outcomes = c.outcomes || [];
  const curriculum = c.curriculum || [];
  const facts = [
    ['clock', 'Duration', c.duration],
    ['signal', 'Level', c.level],
    ['layers', 'Category', c.category],
    ['calendar', 'Last updated', formatDate(c.updatedAt)],
  ];

  let action;
  if (enrollment) {
    action = (
      <div className="enroll-status">
        <StatusBadge status={enrollment.status} label={enrollment.status === 'completed' ? 'Completed' : 'You are enrolled'} />
        <Link className="btn btn-primary btn-block btn-lg" to="/dashboard">Go to My Learning <Icon name="arrowRight" size={18} /></Link>
      </div>
    );
  } else if (!user) {
    action = (
      <div className="enroll-status">
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={enroll}>Log in to enroll</button>
        <p className="text-xs muted" style={{ textAlign: 'center' }}>
          New here? <Link className="text-link" style={{ minHeight: 0 }} to="/auth?mode=register" state={{ from: location }}>Create a free account</Link>
        </p>
      </div>
    );
  } else {
    action = (
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={enroll} aria-disabled={enrolling || undefined}>
        {enrolling ? <><span className="spinner" aria-hidden="true" />Enrolling…</> : <>Enroll now <Icon name="arrowRight" size={18} /></>}
      </button>
    );
  }

  return (
    <>
      <section className="detail-hero" aria-labelledby="course-title">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to={`/courses?category=${encodeURIComponent(c.category)}`}>{c.category}</Link></li>
              <li aria-current="page">{c.title}</li>
            </ol>
          </nav>
          <div className="detail-grid">
            <div className="detail-main">
              <div className="badge-row">
                <Badge tone="coral">{c.category}</Badge>
                <Badge>{c.level}</Badge>
              </div>
              <h1 id="course-title" className="detail-title">{c.title}</h1>
              <p className="lead">{c.description}</p>
              <ul className="detail-meta" role="list">
                <li>
                  <span className="meta-icon" aria-hidden="true"><Icon name="user" size={20} /></span>
                  <span><span className="meta-label">Instructor</span><span className="meta-value">{c.instructor}</span></span>
                </li>
                <li>
                  <span className="meta-icon" aria-hidden="true"><Icon name="clock" size={20} /></span>
                  <span><span className="meta-label">Duration</span><span className="meta-value">{c.duration}</span></span>
                </li>
                <li>
                  <span className="meta-icon" aria-hidden="true"><Icon name="signal" size={20} /></span>
                  <span><span className="meta-label">Level</span><span className="meta-value">{c.level}</span></span>
                </li>
              </ul>
            </div>

            <aside className="card enroll-card" aria-label="Enrollment">
              <CourseMedia course={c} className="enroll-media" priority />
              <div className="enroll-body">
                <div>
                  <p className="enroll-price-label">Course price</p>
                  <p className="enroll-price">{formatPrice(c.price)}</p>
                </div>
                {action}
                <ul className="enroll-facts" role="list">
                  {facts.map(([icon, label, value]) => (
                    <li key={label}>
                      <span><Icon name={icon} size={16} />{label}</span>
                      <strong>{value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="container section-tight detail-body">
        <div className="detail-content">
          <section className="card content-card" aria-labelledby="learn-title">
            <h2 id="learn-title">What you'll learn</h2>
            {outcomes.length ? (
              <ul className="outcome-list" role="list">
                {outcomes.map((o) => <li key={o}><Icon name="checkCircle" size={20} />{o}</li>)}
              </ul>
            ) : (
              <>
                <p className="muted" style={{ marginTop: 12 }}>{c.description}</p>
                <p className="text-xs muted" style={{ marginTop: 12 }}>Detailed learning outcomes haven't been published for this course yet.</p>
              </>
            )}
          </section>

          <section className="card content-card" aria-labelledby="curriculum-title">
            <div className="content-head">
              <h2 id="curriculum-title">Course curriculum</h2>
              {curriculum.length > 0 && <span className="text-sm muted">{curriculum.length} modules</span>}
            </div>
            {curriculum.length ? (
              <ol className="curriculum">
                {curriculum.map((m, i) => (
                  <li key={`${i}-${m}`}>
                    <span className="module-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span><span className="sr-only">Module {i + 1}: </span>{m}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState icon="bookOpen" title="Curriculum coming soon">
                The instructor hasn't published the module breakdown for this course yet.
              </EmptyState>
            )}
          </section>
        </div>

        <aside className="detail-side" aria-label="Course information">
          <section className="card content-card" aria-labelledby="instructor-title">
            <h2 id="instructor-title">Your instructor</h2>
            <div className="instructor">
              <span className="avatar avatar-lg" aria-hidden="true">{initials(c.instructor)}</span>
              <div>
                <p className="instructor-name">{c.instructor}</p>
                <p className="text-sm muted">Instructor · {c.category}</p>
              </div>
            </div>
          </section>
          <section className="card content-card" aria-labelledby="level-title">
            <h2 id="level-title">Is this course right for you?</h2>
            <div className="badge-row" style={{ marginTop: 14 }}><Badge tone="coral">{c.level}</Badge></div>
            <p className="level-note">{LEVEL_NOTES[c.level]}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
