import { useMemo, useState } from 'react';
import { formatDate, plural } from '../../lib/format';
import SearchBar from '../SearchBar';
import { SelectField } from '../FilterPanel';
import ResponsiveTable from '../ResponsiveTable';
import StatusBadge from '../StatusBadge';
import EmptyState, { ErrorState } from '../EmptyState';
import { SkeletonTable } from '../SkeletonLoader';

const STATUSES = [{ value: '', label: 'All statuses' }, { value: 'active', label: 'In progress' }, { value: 'completed', label: 'Completed' }];

export default function EnrollmentsPanel({ enrollments, error, onRetry }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (enrollments || []).filter((e) =>
      (!status || e.status === status)
      && (!q || [e.user?.name, e.user?.email, e.course?.title].some((v) => v?.toLowerCase().includes(q))));
  }, [enrollments, query, status]);

  if (error && !enrollments) return <ErrorState title="We couldn't load enrollments" message={error} onRetry={onRetry} />;

  return (
    <section aria-labelledby="enrollments-title" style={{ display: 'grid', gap: 16 }}>
      <h2 id="enrollments-title" className="sr-only">All enrollments</h2>
      <div className="panel-toolbar">
        <SearchBar id="admin-enrollment-search" label="Search enrollments" value={query} onChange={setQuery} placeholder="Learner name, email or course" />
        <SelectField id="admin-enrollment-status" label="Status" value={status} onChange={setStatus} options={STATUSES} />
      </div>
      {enrollments && (
        <p className="toolbar-meta" role="status" aria-live="polite">
          {query || status ? `${plural(filtered.length, 'enrollment')} found` : `${plural(enrollments.length, 'enrollment')} in total`}
        </p>
      )}
      {!enrollments ? (
        <SkeletonTable rows={5} cols={5} label="Loading enrollments" />
      ) : filtered.length ? (
        <ResponsiveTable caption="Enrollments" columns={['Learner', 'Course', 'Status', 'Enrolled', 'Completed']}>
          {filtered.map((e) => (
            <tr key={e._id}>
              <td><span className="cell-title">{e.user?.name || 'Deleted user'}</span><br /><span className="cell-sub">{e.user?.email}</span></td>
              <td>{e.course?.title || 'Deleted course'}</td>
              <td><StatusBadge status={e.status} /></td>
              <td>{formatDate(e.createdAt)}</td>
              <td>{e.status === 'completed' ? formatDate(e.completedAt) : '—'}</td>
            </tr>
          ))}
        </ResponsiveTable>
      ) : (
        <EmptyState icon="layers" title={enrollments.length ? 'No enrollments match your filters' : 'No enrollments yet'}
          action={enrollments.length > 0 && <button type="button" className="btn btn-secondary" onClick={() => { setQuery(''); setStatus(''); }}>Clear filters</button>}>
          {enrollments.length ? 'Try a different learner, course or status.' : 'Enrollments will appear here when students join courses.'}
        </EmptyState>
      )}
    </section>
  );
}
