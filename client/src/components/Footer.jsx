import { Link } from 'react-router-dom';
import { Brand } from './Navbar';

const AREAS = ['Generative AI', 'Agentic AI', 'Data Analytics', 'AI Automation'];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Practical, project-based courses for learners building AI, data and automation skills.</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="footer-title">Explore</h2>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses">Explore Courses</Link></li>
            <li><Link to="/about">About SkillNest</Link></li>
          </ul>
        </nav>
        <nav aria-label="Learning areas">
          <h2 className="footer-title">Learning areas</h2>
          <ul className="footer-links">
            {AREAS.map((a) => <li key={a}><Link to={`/courses?category=${encodeURIComponent(a)}`}>{a}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="footer-title">Account</h2>
          <ul className="footer-links">
            <li><Link to="/auth">Log in</Link></li>
            <li><Link to="/auth?mode=register">Create an account</Link></li>
            <li><Link to="/dashboard">My Learning</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} SkillNest. All rights reserved.</p>
        <p>Learn practical skills, build real projects.</p>
      </div>
    </footer>
  );
}
