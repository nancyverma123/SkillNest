import { useId, useState } from 'react';
import { sceneFor } from './courseArt';

// Theme (icon + tints) for a category; used by category cards on the home page.
export function themeFor(category = '', title = '') {
  const { icon, bg, accent } = sceneFor(category, title);
  return { icon, bg, accent };
}

// Seeded placeholder services return random photos unrelated to the course, so we ignore them.
const isPlaceholderImage = (url) => /picsum\.photos|placehold|via\.placeholder|dummyimage/i.test(url);

// Subject-specific illustration used whenever a course has no real cover image.
export function CourseVisual({ category, title = '', className = '' }) {
  const scene = sceneFor(category, title);
  const patternId = `dots${useId().replace(/:/g, '')}`;
  const { Art } = scene;
  return (
    <div
      className={`course-visual ${className}`}
      style={{ '--cv-bg': scene.bg }}
      role="img"
      aria-label={`Illustration of ${scene.alt}, representing ${category}`}
    >
      <svg className="cv-pattern" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0F172A" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="400" height="225" fill={`url(#${patternId})`} />
        <circle cx="350" cy="18" r="80" style={{ fill: scene.accent }} opacity="0.08" />
        <circle cx="30" cy="215" r="64" style={{ fill: scene.accent }} opacity="0.07" />
        <Art />
      </svg>
    </div>
  );
}

export function CourseMedia({ course, className = '', priority = false }) {
  const [broken, setBroken] = useState(false);
  const usable = course.thumbnail && !isPlaceholderImage(course.thumbnail) && !broken;
  if (!usable) return <CourseVisual category={course.category} title={course.title} className={className} />;
  return (
    <img
      className={className}
      src={course.thumbnail}
      alt={`Cover image for the ${course.title} course`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width="640"
      height="360"
      onError={() => setBroken(true)}
    />
  );
}
