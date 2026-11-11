import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { courseApi } from '../lib/services';
import { plural } from '../lib/format';
import { KEYS, useInitialData } from '../lib/initialData';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Icon from '../components/Icon';
import CourseGrid from '../components/CourseGrid';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/SkeletonLoader';
import { themeFor } from '../components/CourseVisual';

const HERO_VALUES = [
  ['Project-based', 'Every course ends in something you build.'],
  ['Self-paced', 'Learn around your work or classes.'],
  ['All levels', 'Clear beginner to advanced paths.'],
];

// Skills taught across the SkillNest catalogue (taken from course outcomes, not partner logos).
const TOPICS = ['Prompt design', 'LLM workflows', 'AI agents', 'Tool calling', 'No-code automation', 'Excel', 'SQL', 'Dashboards', 'Machine learning', 'Data storytelling'];

const WHY = [
  ['target', 'Practice over theory', 'Each concept is introduced through the task it helps you complete, so skills transfer to real work.'],
  ['signal', 'Clear difficulty levels', 'Beginner, Intermediate and Advanced labels help you pick the right starting point.'],
  ['cpu', 'Focused on AI & data', 'Generative AI, agents, automation and analytics — the skills reshaping modern roles.'],
  ['checkCircle', 'Progress you can see', 'Your dashboard keeps every enrollment organised, from first lesson to completion.'],
];

const STEPS = [
  ['compass', 'Explore', 'Search and filter courses by topic, level and price to find your fit.'],
  ['bookOpen', 'Enroll', 'Join a course in one click — it appears instantly in My Learning.'],
  ['code', 'Learn & build', 'Work through the curriculum and apply each concept to a real project.'],
  ['award', 'Complete', 'Mark courses as completed and watch your progress summary grow.'],
];

// Illustrative only — clearly labelled on the page as sample feedback.
const TESTIMONIALS = [
  ['Ritika S.', 'Product analyst', 'The lessons were short and practical. I could apply the prompt-design ideas at work the same week.'],
  ['Arjun M.', 'Final-year student', 'Having beginner and intermediate levels made it easy to know where to start and what to take next.'],
  ['Meera K.', 'Operations associate', 'The automation course helped me map out which repetitive tasks were worth automating first.'],
];

const PATH = [
  ['done', 'How large language models work'],
  ['done', 'Prompt design fundamentals'],
  ['current', 'Automating work with AI agents'],
  ['next', 'Evaluating AI output'],
  ['next', 'Capstone project'],
];

function HeroMock() {
  return (
    <div className="hero-mock" role="img" aria-label="Preview of a SkillNest learning path with completed, current and upcoming modules">
      <div className="mock-card" aria-hidden="true">
        <div className="mock-head">
          <span className="mock-dots"><i /><i /><i /></span>
          <span className="mono">skillnest · learning path</span>
        </div>
        <p className="mock-label mono">Your path</p>
        <ol className="mock-steps">
          {PATH.map(([state, label], i) => (
            <li key={label} className={state === 'done' ? 'is-done' : state === 'current' ? 'is-current' : ''}>
              <span className="mock-step-icon">{state === 'done' ? <Icon name="check" size={14} /> : i + 1}</span>
              {label}
              {state === 'current' && <span className="mock-pill">Now</span>}
            </li>
          ))}
        </ol>
        <div className="mock-code">
          <p><span className="c-dim">prompt</span> · summarise-report</p>
          <p><span className="c-key">role</span>analyst</p>
          <p><span className="c-key">task</span>summarise in 3 bullets</p>
          <p><span className="c-key">check</span>cite each source <span className="c-ok">✓</span></p>
        </div>
      </div>
      <div className="mock-float" aria-hidden="true"><Icon name="sparkles" size={18} />Capstone: build your own AI workflow</div>
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
  const initialCourses = useInitialData(KEYS.homeCourses);
  const initialCategories = useInitialData(KEYS.categories);
  const hasInitial = Boolean(initialCourses && initialCategories);
  const [courses, setCourses] = useState(() => (hasInitial ? initialCourses.value : null));
  const [categories, setCategories] = useState(() => (hasInitial ? initialCategories.value : null));
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  // Server-rendered data covers the first load (reload 0); retries always fetch.
  const skipLoad = useRef(hasInitial ? 0 : null);

  useEffect(() => {
    if (skipLoad.current === reload) return undefined;
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
      <section className="container hero-wrap" aria-labelledby="hero-title">
        <div className="dark-panel hero-panel">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Generative AI · Data · Automation</p>
              <h1 id="hero-title" className="h-display">
                Build Your Future with <span className="accent-serif">Practical AI</span> Skills
              </h1>
              <p className="lead">
                Learn industry-relevant skills, build real-world projects and prepare for the opportunities shaping tomorrow.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-lg" to="/courses">Explore Courses <Icon name="arrowRight" size={18} /></Link>
                <Link className="btn btn-on-dark btn-lg" to={startHref}>Start Learning</Link>
              </div>
              <ul className="hero-values" role="list">
                {HERO_VALUES.map(([title, text]) => (
                  <li key={title}><span className="accent-serif">{title}</span><span>{text}</span></li>
                ))}
              </ul>
            </div>
            <HeroMock />
          </div>
        </div>
      </section>

      <section className="topics" aria-labelledby="topics-title">
        <div className="container">
          <h2 id="topics-title" className="topics-label mono">Skills you'll practise across our courses</h2>
          <ul className="topics-list" role="list">
            {TOPICS.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <SectionHead
            id="categories-title"
            eyebrow="Learning categories"
            title={<>Explore by <span className="accent-serif">topic</span></>}
            text="Pick a focus area and browse the courses available in it."
            link={<Link className="text-link" to="/courses">Browse all courses <Icon name="arrowRight" size={16} /></Link>}
          />
          {categories === null ? (
            <div className="category-grid" role="status" aria-busy="true">
              <span className="sr-only">Loading categories…</span>
              {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 88, borderRadius: 20 }} />)}
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
                      <span className="category-icon" aria-hidden="true"><Icon name={t.icon} size={22} /></span>
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
        <div className="container why-grid">
          <div className="why-copy">
            <p className="eyebrow">Why SkillNest</p>
            <h2 id="why-title" className="h-section">Built for <span className="accent-serif">real skills</span>, not just theory.</h2>
            <p className="muted">
              Most courses stop at concepts and tool tours. SkillNest courses are organised around the work you actually do,
              with clear outcomes and a visible curriculum before you enroll.
            </p>
            <Link className="btn btn-secondary" to="/about">About SkillNest <Icon name="arrowRight" size={16} /></Link>
          </div>
          <ul className="card why-panel" role="list">
            {WHY.map(([icon, title, text], i) => (
              <li key={title} className="why-item">
                <div className="why-top">
                  <span className="why-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
                  <span className="why-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="journey-title">
        <div className="container">
          <SectionHead id="journey-title" eyebrow="Learning journey" title={<>From first click to <span className="accent-serif">completed</span> course</>} />
          <ol className="journey">
            {STEPS.map(([icon, title, text], i) => (
              <li key={title} className="card journey-step">
                <div className="journey-top">
                  <span className="journey-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="journey-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
                </div>
                <h3><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="stories-title">
        <div className="container">
          <SectionHead id="stories-title" eyebrow="Learner stories" title={<>What learners <span className="accent-serif">value</span></>} />
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
          <div className="dark-panel cta-band">
            <p className="eyebrow">Your next step</p>
            <h2 id="cta-title">Ready to start building <span className="accent-serif">practical AI</span> skills?</h2>
            <p>Browse the catalogue, enroll in a course and track your progress from your personal dashboard.</p>
            <div className="cta-actions">
              <Link className="btn btn-primary btn-lg" to="/courses">Explore Courses <Icon name="arrowRight" size={18} /></Link>
              <Link className="btn btn-on-dark btn-lg" to={startHref}>{user ? 'Go to My Learning' : 'Create a free account'}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
