import { useEffect, useId, useRef, useState } from 'react';
import { sceneFor } from './courseArt';
import { photoForCourse } from './coursePhotos';

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

// Course image, in order of preference:
//   1. the admin's own cover image (course.thumbnail), unless it is a random placeholder service
//   2. a realistic photo matched to the course topic (see coursePhotos.js)
//   3. the subject illustration, if the photo cannot be loaded (offline, blocked, removed)
// `sizes` tells the browser how wide the image is shown so it downloads a suitable resolution.
const CARD_SIZES = '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw';

export function CourseMedia(props) {
  // Re-mount for a different course so the fallback state never carries over.
  return <CourseImage key={`${props.course._id}|${props.course.thumbnail || ''}`} {...props} />;
}

// `photo` (optional) is a pre-assigned photo from assignPhotos(), used by lists to avoid repeats.
function CourseImage({ course, photo: assigned, className = '', priority = false, sizes = CARD_SIZES }) {
  const ownImage = course.thumbnail && !isPlaceholderImage(course.thumbnail);
  const [stage, setStage] = useState(ownImage ? 'own' : 'photo');
  const imgRef = useRef(null);
  const own = stage === 'own';
  const onError = () => setStage(own ? 'photo' : 'fallback');

  // With SSR the image can fail before React hydrates (onError is then missed), so check once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) onError();
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stage === 'fallback') return <CourseVisual category={course.category} title={course.title} className={className} />;

  const photo = assigned || photoForCourse(course);
  return (
    <img
      ref={imgRef}
      key={stage}
      className={className}
      src={own ? course.thumbnail : photo.src}
      srcSet={own ? undefined : photo.srcSet}
      sizes={own ? undefined : sizes}
      alt={own ? `Cover image for the ${course.title} course` : photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width="800"
      height="450"
      onError={onError}
    />
  );
}
