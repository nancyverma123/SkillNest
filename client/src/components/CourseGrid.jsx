import CourseCard from './CourseCard';
import EmptyState, { ErrorState } from './EmptyState';
import { SkeletonCards } from './SkeletonLoader';

export default function CourseGrid({
  courses, loading, error, onRetry, skeletonCount = 6, headingLevel = 3,
  emptyTitle = 'No courses found', emptyText, emptyAction,
}) {
  if (loading) return <SkeletonCards count={skeletonCount} />;
  if (error) return <ErrorState title="We couldn't load courses" message={error} onRetry={onRetry} />;
  if (!courses?.length) {
    return <EmptyState icon="search" title={emptyTitle} action={emptyAction}>{emptyText}</EmptyState>;
  }
  return (
    <ul className="course-grid" role="list">
      {courses.map((c) => <li key={c._id}><CourseCard course={c} headingLevel={headingLevel} /></li>)}
    </ul>
  );
}
