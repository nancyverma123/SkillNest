import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Icon from '../components/Icon';

const OFFER = [
  ['bookOpen', 'Focused courses', 'Short, well-scoped courses in generative AI, agentic AI, automation and analytics.'],
  ['signal', 'Honest difficulty levels', 'Each course is labelled Beginner, Intermediate or Advanced so you can plan your path.'],
  ['grid', 'A personal dashboard', 'Track active and completed courses in one place and pick up where you left off.'],
];

const PRINCIPLES = [
  ['target', 'Practice over theory', 'Concepts are introduced through the task they help you complete.'],
  ['lightbulb', 'Clarity first', 'Plain language, clear outcomes and a visible curriculum before you enroll.'],
  ['shield', 'Respect for learners', 'No inflated claims, no hidden steps — just transparent course information.'],
];

export default function About() {
  useDocumentTitle('About');
  return (
    <>
      <section className="page-hero" aria-labelledby="about-title">
        <div className="container">
          <div className="page-hero-inner">
            <p className="eyebrow">About SkillNest</p>
            <h1 id="about-title">A focused place to learn the skills shaping modern work</h1>
            <p className="lead">
              SkillNest helps students and professionals build practical capability in AI, data and automation through
              clear, project-based courses.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="mission-title">
        <div className="container about-grid">
          <div className="about-copy">
            <p className="eyebrow">Our mission</p>
            <h2 id="mission-title">Make practical AI skills approachable</h2>
            <p className="muted">
              New tools appear every month, and it can be hard to know what is worth learning. SkillNest curates focused
              courses that explain the essentials and show how to apply them to real tasks.
            </p>
            <p className="muted">
              Every course lists its level, duration, instructor and curriculum up front, so you can decide with confidence
              before you enroll.
            </p>
          </div>
          <ul className="card principles" role="list" aria-label="Our principles">
            {PRINCIPLES.map(([icon, title, text]) => (
              <li key={title}>
                <span className="principle-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
                <div><strong>{title}</strong><p>{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="offer-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">What you'll find</p>
              <h2 id="offer-title" className="h-section">Everything you need to learn with direction</h2>
            </div>
          </div>
          <ul className="feature-grid" role="list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {OFFER.map(([icon, title, text]) => (
              <li key={title} className="card feature-card">
                <span className="feature-icon" aria-hidden="true"><Icon name={icon} size={22} /></span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="about-cta">
        <div className="container">
          <div className="cta-band">
            <p className="eyebrow">Get started</p>
            <h2 id="about-cta">Find the right course for your next step</h2>
            <div className="cta-actions">
              <Link className="btn btn-primary btn-lg" to="/courses">Explore Courses <Icon name="arrowRight" size={18} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
