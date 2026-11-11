import { useMemo } from 'react';
import CourseCard from './CourseCard';
import { assignPhotos } from './coursePhotos';
import EmptyState, { ErrorState } from './EmptyState';
import { SkeletonCards } from './SkeletonLoader';

export default function CourseGrid({
  courses, loading, error, onRetry, skeletonCount = 6, headingLevel = 3,
  emptyTitle = 'No courses found', emptyText, emptyAction,
}) {
  // Give every card in the grid its own photo (no repeats where the topic has enough photos).
  const photos = useMemo(() => assignPhotos(courses || []), [courses]);
  if (loading) return <SkeletonCards count={skeletonCount} />;
  if (error) return <ErrorState title="We couldn't load courses" message={error} onRetry={onRetry} />;
  if (!courses?.length) {
    return <EmptyState icon="search" title={emptyTitle} action={emptyAction}>{emptyText}</EmptyState>;
  }
  return (
    <ul className="course-grid" role="list">
      {courses.map((c) => <li key={c._id}><CourseCard course={c} photo={photos[c._id]} headingLevel={headingLevel} /></li>)}
    </ul>
  );
}
