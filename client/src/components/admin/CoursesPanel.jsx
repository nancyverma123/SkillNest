import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { errMsg } from '../../api';
import { courseApi } from '../../lib/services';
import { formatPrice, plural } from '../../lib/format';
import { useToast } from '../Toast';
import Icon from '../Icon';
import SearchBar from '../SearchBar';
import ResponsiveTable from '../ResponsiveTable';
import ConfirmModal from '../ConfirmModal';
import { Badge } from '../StatusBadge';
import EmptyState, { ErrorState } from '../EmptyState';
import { SkeletonTable } from '../SkeletonLoader';
import CourseForm from './CourseForm';

export default function CoursesPanel({ courses, stats, error, onRetry, onChanged }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | course
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const enrollCount = useMemo(
    () => Object.fromEntries((stats?.enrollmentsPerCourse || []).map((c) => [c.courseId, c.count])),
    [stats]
  );
  const categories = useMemo(() => [...new Set((courses || []).map((c) => c.category))].sort(), [courses]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses || [];
    return (courses || []).filter((c) => [c.title, c.instructor, c.category].some((v) => v.toLowerCase().includes(q)));
  }, [courses, query]);

  const onSaved = (saved, wasEditing) => {
    toast.success(wasEditing ? `"${saved.title}" was updated.` : `"${saved.title}" was added to the catalogue.`);
    setEditing(null);
    onChanged();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await courseApi.remove(toDelete._id);
      toast.success(`"${toDelete.title}" was deleted.`);
      if (editing && editing._id === toDelete._id) setEditing(null);
      setToDelete(null);
      onChanged();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeleting(false);
    }
  };

  if (error && !courses) return <ErrorState title="We couldn't load courses" message={error} onRetry={onRetry} />;
  const deleteCount = toDelete ? enrollCount[toDelete._id] || 0 : 0;

  return (
    <>
      {editing && (
        <CourseForm
          course={editing === 'new' ? null : editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <section aria-labelledby="course-list-title" style={{ display: 'grid', gap: 16 }}>
        <h2 id="course-list-title" className="sr-only">All courses</h2>
        <div className="panel-toolbar">
          <SearchBar id="admin-course-search" label="Search courses" value={query} onChange={setQuery} placeholder="Title, instructor or category" />
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={18} />Add course
          </button>
        </div>
        {courses && (
          <p className="toolbar-meta" role="status" aria-live="polite">
            {query ? `${plural(filtered.length, 'course')} match “${query.trim()}”` : `${plural(courses.length, 'course')} in total`}
          </p>
        )}

        {!courses ? (
          <SkeletonTable rows={5} cols={6} label="Loading courses" />
        ) : filtered.length ? (
          <ResponsiveTable
            caption="Courses"
            columns={['Course', 'Level', 'Price', { label: 'Enrollments', className: 'num' }, { label: 'Actions', className: 'num' }]}
          >
            {filtered.map((c) => (
              <tr key={c._id}>
                <td>
                  <Link to={`/courses/${c._id}`} className="cell-title">{c.title}</Link><br />
                  <span className="cell-sub">{c.category} · {c.instructor}</span>
                </td>
                <td><Badge>{c.level}</Badge></td>
                <td>{formatPrice(c.price)}</td>
                <td className="num">{enrollCount[c._id] ?? 0}</td>
                <td>
                  <div className="cell-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(c)} aria-label={`Edit: ${c.title}`}>
                      <Icon name="edit" size={16} />Edit
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={() => setToDelete(c)} aria-label={`Delete: ${c.title}`}>
                      <Icon name="trash" size={16} />Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </ResponsiveTable>
        ) : (
          <EmptyState
            icon={query ? 'search' : 'bookOpen'}
            title={query ? 'No courses match your search' : 'No courses yet'}
            action={query
              ? <button type="button" className="btn btn-secondary" onClick={() => setQuery('')}>Clear search</button>
              : <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>Add your first course</button>}
          >
            {query ? 'Try a different title, instructor or category.' : 'Courses you add will appear here and in the public catalogue.'}
          </EmptyState>
        )}
      </section>

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Delete this course?"
        description={toDelete && (
          <>
            <strong>{toDelete.title}</strong> will be permanently removed from the catalogue
            {deleteCount > 0 ? <>, along with its <strong>{plural(deleteCount, 'enrollment')}</strong></> : null}. This can't be undone.
          </>
        )}
        confirmLabel="Delete course"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
