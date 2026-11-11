import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { CourseMedia } from './CourseVisual';
import { formatDate } from '../lib/format';

function EnrollmentCard({ enrollment, photo, busy, onComplete, onRemove }) {
  const { course: c, status } = enrollment;
  return (
    <article className="card enroll-item">
      <CourseMedia course={c} photo={photo} className="enroll-item-media" sizes="(min-width: 1280px) 33vw, (min-width: 720px) 50vw, 100vw" />
      <div className="enroll-item-body">
        <div className="enroll-item-top">
          <StatusBadge status={status} />
          <span className="text-xs muted">{c.category}</span>
        </div>
        <h3 className="enroll-item-title"><Link to={`/courses/${c._id}`}>{c.title}</Link></h3>
        <ul className="course-meta" role="list">
          <li><Icon name="user" size={16} /><span className="sr-only">Instructor: </span>{c.instructor}</li>
          <li><Icon name="clock" size={16} /><span className="sr-only">Duration: </span>{c.duration}</li>
        </ul>
        <p className="text-xs muted">
          Enrolled {formatDate(enrollment.createdAt)}
          {status === 'completed' && enrollment.completedAt && ` · Completed ${formatDate(enrollment.completedAt)}`}
        </p>
        <div className="enroll-item-actions">
          {status === 'active' ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onComplete(enrollment)}
              aria-disabled={busy || undefined}
              aria-label={`Mark as completed: ${c.title}`}
            >
              {busy ? <><span className="spinner" aria-hidden="true" />Saving…</> : <><Icon name="check" size={16} />Mark as completed</>}
            </button>
          ) : (
            <Link className="btn btn-secondary btn-sm" to={`/courses/${c._id}`} aria-label={`Review course: ${c.title}`}>
              Review course
            </Link>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-danger-text"
            onClick={() => onRemove(enrollment)}
            aria-label={`Unenroll: ${c.title}`}
          >
            <Icon name="trash" size={16} />Unenroll
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(EnrollmentCard);
