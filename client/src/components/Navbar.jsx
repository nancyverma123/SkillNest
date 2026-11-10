import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from './Toast';
import Icon from './Icon';
import { firstName, initials } from '../lib/format';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Explore Courses' },
  { to: '/about', label: 'About' },
];

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="SkillNest home">
      <span className="brand-mark" aria-hidden="true"><Icon name="sparkles" size={18} /></span>
      SkillNest
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const onLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  const onAuth = location.pathname === '/auth';
  const isRegister = new URLSearchParams(location.search).get('mode') === 'register';
  const navLinks = [
    ...LINKS,
    ...(user ? [{ to: '/dashboard', label: 'My Learning' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ].map((l) => <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">{l.label}</NavLink>);

  const actions = user ? (
    <>
      <span className="user-chip">
        <span className="avatar avatar-sm" aria-hidden="true">{initials(user.name)}</span>
        <span><span className="sr-only">Signed in as </span>{firstName(user.name)}</span>
      </span>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
        <Icon name="logOut" size={16} />Log out
      </button>
    </>
  ) : (
    <>
      <Link to="/auth" className="nav-link" aria-current={onAuth && !isRegister ? 'page' : undefined}>Login</Link>
      <Link to="/auth?mode=register" className="btn btn-primary btn-sm" aria-current={onAuth && isRegister ? 'page' : undefined}>
        Sign Up
      </Link>
    </>
  );

  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Main">
        <Brand />
        <div className="nav-links">{navLinks}</div>
        <div className="nav-actions">{actions}</div>
        <button
          ref={toggleRef}
          type="button"
          className="icon-btn nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <div className="container">
            <div className="mobile-menu-links">{navLinks}</div>
            <div className="mobile-menu-actions">{actions}</div>
          </div>
        </div>
      )}
    </header>
  );
}
