import { useMemo, useState } from 'react';
import { formatDate, initials, plural } from '../../lib/format';
import SearchBar from '../SearchBar';
import { SelectField } from '../FilterPanel';
import ResponsiveTable from '../ResponsiveTable';
import StatusBadge from '../StatusBadge';
import EmptyState, { ErrorState } from '../EmptyState';
import { SkeletonTable } from '../SkeletonLoader';

const ROLES = [{ value: '', label: 'All roles' }, { value: 'student', label: 'Students' }, { value: 'admin', label: 'Admins' }];

export default function UsersPanel({ users, enrollments, error, onRetry }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');

  const enrollCount = useMemo(() => {
    const map = {};
    (enrollments || []).forEach((e) => { if (e.user?._id) map[e.user._id] = (map[e.user._id] || 0) + 1; });
    return map;
  }, [enrollments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users || []).filter((u) =>
      (!role || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [users, query, role]);

  if (error && !users) return <ErrorState title="We couldn't load users" message={error} onRetry={onRetry} />;

  return (
    <section aria-labelledby="users-title" style={{ display: 'grid', gap: 16 }}>
      <h2 id="users-title" className="sr-only">All users</h2>
      <div className="panel-toolbar">
        <SearchBar id="admin-user-search" label="Search users" value={query} onChange={setQuery} placeholder="Name or email" />
        <SelectField id="admin-user-role" label="Role" value={role} onChange={setRole} options={ROLES} />
      </div>
      {users && (
        <p className="toolbar-meta" role="status" aria-live="polite">
          {query || role ? `${plural(filtered.length, 'user')} found` : `${plural(users.length, 'user')} in total`}
        </p>
      )}
      {!users ? (
        <SkeletonTable rows={5} cols={5} label="Loading users" />
      ) : filtered.length ? (
        <ResponsiveTable caption="Users" columns={['User', 'Email', 'Role', { label: 'Enrollments', className: 'num' }, 'Joined']}>
          {filtered.map((u) => (
            <tr key={u._id}>
              <td>
                <span className="cell-user">
                  <span className="avatar avatar-sm" aria-hidden="true">{initials(u.name)}</span>
                  <span className="cell-title">{u.name}</span>
                </span>
              </td>
              <td>{u.email}</td>
              <td><StatusBadge status={u.role} /></td>
              <td className="num">{enrollCount[u._id] || 0}</td>
              <td>{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </ResponsiveTable>
      ) : (
        <EmptyState icon="users" title="No users match your filters"
          action={<button type="button" className="btn btn-secondary" onClick={() => { setQuery(''); setRole(''); }}>Clear filters</button>}>
          Try a different name, email or role.
        </EmptyState>
      )}
    </section>
  );
}
