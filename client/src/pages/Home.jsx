import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { courseApi } from '../lib/services';
import { plural } from '../lib/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Icon from '../components/Icon';
import CourseGrid from '../components/CourseGrid';
import EmptyState from '../components/EmptyState';
import NetworkGraphic from '../components/NetworkGraphic';
import { Skeleton } from '../components/SkeletonLoader';
import { themeFor } from '../components/CourseVisual';

const FEATURES = [
  ['target', 'Practical, project-based', 'Every course is built around applying skills to realistic tasks, not just theory.'],
  ['signal', 'Clear difficulty levels', 'Beginner, Intermediate and Advanced labels help you pick the right starting point.'],
  ['cpu', 'Focused on AI & data', 'Generative AI, agents, automation and analytics — the skills shaping modern work.'],
  ['checkCircle', 'Track your progress', 'Your dashboard keeps every enrollment organised, from first lesson to completion.'],
];

const STEPS = [
  ['Explore', 'Search and filter courses by topic, level and price to find your fit.'],
  ['Enroll', 'Join a course in one click and it appears instantly in My Learning.'],
  ['Learn & build', 'Work through the curriculum and apply each concept to a real project.'],
  ['Complete', 'Mark courses as completed and watch your progress summary grow.'],
];

// Illustrative only — clearly labelled on the page as sample feedback.
const TESTIMONIALS = [
  ['Ritika S.', 'Product analyst', 'The lessons were short and practical. I could apply the prompt-design ideas at work the same week.'],
  ['Arjun M.', 'Final-year student', 'Having beginner and intermediate levels made it easy to know where to start and what to take next.'],
  ['Meera K.', 'Operations associate', 'The automation course helped me map out which repetitive tasks were worth automating first.'],
];

function HeroVisual() {
  return (
    <div className="hero-visual" role="img" aria-label="Illustration of an AI learning workspace with a neural network diagram and project cards">
      <div className="hv-card hv-main" aria-hidden="true">
        <div className="hv-head">
          <span className="hv-dots"><i /><i /><i /></span>
          <span>AI learning workspace</span>
        </div>
        <NetworkGraphic />
        <div className="hv-chips">
          <span>Prompt design</span>
          <span>Model evaluation</span>
          <span>Automation</span>
        </div>
      </div>
      <div className="hv-card hv-float hv-float-a" aria-hidden="true">
        <span className="hv-float-icon"><Icon name="sparkles" size={20} /></span>
        <div><strong>Hands-on project</strong><span>Build a working AI assistant</span></div>
      </div>
      <div className="hv-card hv-float hv-float-b" aria-hidden="true">
        <span className="hv-float-icon"><Icon name="checkCircle" size={20} /></span>
        <div><strong>Module complete</strong><span>Foundations of LLMs</span></div>
      </div>
    </div>
  );
}

function SectionHead({ id, eyebrow, title, text, link }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="h-section">{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {link}
    </div>
  );
}

export default function Home() {
  useDocumentTitle('');
  const { user } = useAuth();
  const [courses, setCourses] = useState(null);
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    Promise.all([courseApi.list({ sort: 'newest' }), courseApi.categories()])
      .then(([list, cats]) => {
        if (!active) return;
        setCourses(list.slice(0, 3));
        setCategories(cats);
      })
      .catch((e) => {
        if (!active) return;
        setError(errMsg(e));
        setCourses([]);
        setCategories([]);
      });
    return () => { active = false; };
  }, [reload]);

  const startHref = user ? '/dashboard' : '/auth?mode=register';

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Practical AI learning</p>
            <h1 id="hero-title" className="h-display">
              Build Your Future with <span className="mark">Practical AI Skills</span>
            </h1>
            <p className="lead">
              Learn industry-relevant skills, build real-world projects and prepare for the opportunities shaping tomorrow.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/courses">Explore Courses <Icon name="arrowRight" size={18} /></Link>
              <Link className="btn btn-secondary btn-lg" to={startHref}>Start Learning</Link>
            </div>
            <ul className="hero-points" role="list">
              <li><Icon name="check" size={18} />Project-based lessons</li>
              <li><Icon name="check" size={18} />Beginner to advanced levels</li>
              <li><Icon name="check" size={18} />Learn at your own pace</li>
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHead
            id="categories-title"
            eyebrow="Learning categories"
            title="Explore by topic"
            text="Pick a focus area and browse the courses available in it."
            link={<Link className="text-link" to="/courses">Browse all courses <Icon name="arrowRight" size={16} /></Link>}
          />
          {categories === null ? (
            <div className="category-grid" role="status" aria-busy="true">
              <span className="sr-only">Loading categories…</span>
              {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 88, borderRadius: 18 }} />)}
            </div>
          ) : categories.length ? (
            <ul className="category-grid" role="list">
              {categories.map((cat) => {
                const t = themeFor(cat.name);
                return (
                  <li key={cat.name}>
                    <Link
                      to={`/courses?category=${encodeURIComponent(cat.name)}`}
                      className="card card-interactive category-card"
                      style={{ '--cv-bg': t.bg, '--cv-accent': t.accent }}
                    >
                      <span className="category-icon" aria-hidden="true"><Icon name={t.icon} size={24} /></span>
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">{plural(cat.count, 'course')}</span>
                      <Icon name="arrowRight" size={18} className="category-arrow" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon="layers" title={error ? 'Categories are unavailable right now' : 'No categories yet'}>
              {error || 'Categories will appear here once courses are published.'}
            </EmptyState>
          )}
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="popular-title">
        <div className="container">
          <SectionHead
            id="popular-title"
            eyebrow="Popular courses"
            title="Start with our latest courses"
            text="Recently published courses across AI, data and automation."
            link={<Link className="text-link" to="/courses">View all courses <Icon name="arrowRight" size={16} /></Link>}
          />
          <CourseGrid
            courses={courses}
            loading={courses === null}
            error={error}
            onRetry={() => { setCourses(null); setCategories(null); setReload((n) => n + 1); }}
            skeletonCount={3}
            emptyTitle="No courses published yet"
            emptyText="Check back soon — new courses are on the way."
          />
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <SectionHead id="why-title" eyebrow="Why SkillNest" title="Designed for learning that sticks" />
          <ul className="feature-grid" role="list">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title} className="card feature-card">
                <span className="feature-icon" aria-hidden="true"><Icon name={icon} size={22} /></span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="journey-title">
        <div className="container">
          <SectionHead id="journey-title" eyebrow="Learning journey" title="From first click to completed course" />
          <ol className="journey">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="card journey-step">
                <span className="journey-num" aria-hidden="true">{i + 1}</span>
                <h3><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="stories-title">
        <div className="container">
          <SectionHead id="stories-title" eyebrow="Learner stories" title="What learners value" />
          <ul className="testimonial-grid" role="list">
            {TESTIMONIALS.map(([name, role, quote]) => (
              <li key={name}>
                <figure className="card testimonial">
                  <span className="testimonial-mark" aria-hidden="true">“</span>
                  <blockquote><p>{quote}</p></blockquote>
                  <figcaption>
                    <span className="avatar" aria-hidden="true">{name[0]}</span>
                    <span><strong>{name}</strong><span className="muted">{role}</span></span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="sample-note"><Icon name="info" size={16} />Sample testimonials shown for demonstration purposes.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="cta-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <p className="eyebrow">Your next step</p>
            <h2 id="cta-title">Ready to start building practical AI skills?</h2>
            <p>Browse the catalogue, enroll in a course and track your progress from your personal dashboard.</p>
            <div className="cta-actions">
              <Link className="btn btn-primary btn-lg" to="/courses">Explore Courses <Icon name="arrowRight" size={18} /></Link>
              <Link className="btn btn-secondary btn-lg" to={startHref}>{user ? 'Go to My Learning' : 'Create a free account'}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
