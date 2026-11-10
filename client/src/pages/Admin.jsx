import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errMsg } from '../api';
import { courseApi, enrollmentApi, statsApi, userApi } from '../lib/services';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Sidebar from '../components/Sidebar';
import OverviewPanel from '../components/admin/OverviewPanel';
import CoursesPanel from '../components/admin/CoursesPanel';
import UsersPanel from '../components/admin/UsersPanel';
import EnrollmentsPanel from '../components/admin/EnrollmentsPanel';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid', title: 'Platform overview', text: 'Key numbers and enrollment activity across SkillNest.' },
  { key: 'courses', label: 'Courses', icon: 'bookOpen', title: 'Course management', text: 'Add, edit and remove courses in the catalogue.' },
  { key: 'users', label: 'Users', icon: 'users', title: 'User management', text: 'Everyone with a SkillNest account.' },
  { key: 'enrollments', label: 'Enrollments', icon: 'layers', title: 'Enrollment management', text: 'Who is enrolled in what, and their status.' },
];

const FETCHERS = {
  stats: statsApi.get,
  courses: () => courseApi.list(),
  users: userApi.all,
  enrollments: enrollmentApi.all,
};
const ALL = Object.keys(FETCHERS);

export default function Admin() {
  const [params] = useSearchParams();
  const current = TABS.find((t) => t.key === params.get('tab')) || TABS[0];
  useDocumentTitle(`Admin · ${current.label}`);

  const [data, setData] = useState({ stats: null, courses: null, users: null, enrollments: null });
  const [errors, setErrors] = useState({});

  // Reload only the resources affected by an action; each one fails independently.
  const load = useCallback(async (keys = ALL) => {
    setErrors((prev) => ({ ...prev, ...Object.fromEntries(keys.map((k) => [k, null])) }));
    const results = await Promise.allSettled(keys.map((k) => FETCHERS[k]()));
    setData((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => { if (r.status === 'fulfilled') next[keys[i]] = r.value; });
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => { next[keys[i]] = r.status === 'rejected' ? errMsg(r.reason) : null; });
      return next;
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = { courses: data.courses?.length, users: data.users?.length, enrollments: data.enrollments?.length };
  const items = TABS.map((t) => ({
    key: t.key, label: t.label, icon: t.icon, to: `/admin?tab=${t.key}`, active: t.key === current.key, count: counts[t.key],
  }));

  return (
    <div className="container app-shell">
      <Sidebar label="Admin sections" title="Admin console" items={items} />
      <div className="app-main">
        <header className="page-head">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="page-title">{current.title}</h1>
            <p className="muted">{current.text}</p>
          </div>
        </header>

        {current.key === 'overview' && (
          <OverviewPanel stats={data.stats} enrollments={data.enrollments} error={errors.stats} onRetry={() => load(['stats', 'enrollments'])} />
        )}
        {current.key === 'courses' && (
          <CoursesPanel
            courses={data.courses}
            stats={data.stats}
            error={errors.courses}
            onRetry={() => load(['courses'])}
            onChanged={() => load(['courses', 'stats', 'enrollments'])}
          />
        )}
        {current.key === 'users' && (
          <UsersPanel users={data.users} enrollments={data.enrollments} error={errors.users} onRetry={() => load(['users', 'enrollments'])} />
        )}
        {current.key === 'enrollments' && (
          <EnrollmentsPanel enrollments={data.enrollments} error={errors.enrollments} onRetry={() => load(['enrollments'])} />
        )}
      </div>
    </div>
  );
}
