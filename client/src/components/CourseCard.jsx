import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { Badge } from './StatusBadge';
import { CourseMedia } from './CourseVisual';
import { formatPrice } from '../lib/format';

function CourseCard({ course: c, photo, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <article className="card card-interactive course-card">
      <CourseMedia course={c} photo={photo} className="course-card-media" />
      <div className="course-card-body">
        <div className="course-card-top">
          <Badge tone="coral">{c.category}</Badge>
          <span className="level-chip"><Icon name="signal" size={14} />{c.level}</span>
        </div>
        <Heading className="course-card-title">{c.title}</Heading>
        <p className="course-card-desc">{c.description}</p>
        <ul className="course-meta" role="list">
          <li><Icon name="user" size={16} /><span className="sr-only">Instructor: </span>{c.instructor}</li>
          <li><Icon name="clock" size={16} /><span className="sr-only">Duration: </span>{c.duration}</li>
        </ul>
        <div className="course-card-footer">
          <p className="price"><span className="sr-only">Price: </span>{formatPrice(c.price)}</p>
          <Link className="btn btn-secondary btn-sm" to={`/courses/${c._id}`} aria-label={`View Course: ${c.title}`}>
            View Course <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(CourseCard);
