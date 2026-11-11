import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { firstName } from '../lib/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import FormField from '../components/FormField';
import NetworkGraphic from '../components/NetworkGraphic';
import { Brand } from '../components/Navbar';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = { login: ['email', 'password'], register: ['name', 'email', 'password'] };

function validateField(mode, key, f) {
  if (key === 'name') return f.name.trim().length < 2 ? 'Enter your full name (at least 2 characters).' : '';
  if (key === 'email') {
    if (!f.email.trim()) return 'Enter your email address.';
    return EMAIL_RE.test(f.email.trim()) ? '' : 'Enter a valid email address, like name@example.com.';
  }
  if (!f.password) return 'Enter your password.';
  return mode === 'register' && f.password.length < 6 ? 'Use at least 6 characters for your password.' : '';
}

const homeFor = (u) => (u.role === 'admin' ? '/admin' : '/dashboard');

export default function Auth() {
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  useDocumentTitle(mode === 'login' ? 'Log in' : 'Create account');

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const refs = { name: useRef(null), email: useRef(null), password: useRef(null) };

  useEffect(() => { setErrors({}); setFormError(''); }, [mode]);

  if (user && !submitting) return <Navigate to={homeFor(user)} replace />;

  // Return to the page that sent the user here (e.g. a course they tried to enroll in).
  const destination = (u) => {
    const from = location.state?.from;
    const path = from?.pathname;
    if (path && path !== '/auth' && (u.role === 'admin' || !path.startsWith('/admin'))) return from;
    return homeFor(u);
  };

  const onChange = (key) => (e) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: validateField(mode, key, next) }));
  };
  const onBlur = (key) => () => {
    if (form[key]) setErrors((prev) => ({ ...prev, [key]: validateField(mode, key, form) }));
  };

  const switchMode = (next) => (e) => {
    e.preventDefault();
    setParams(next === 'register' ? { mode: 'register' } : {}, { replace: true, state: location.state });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError('');
    const nextErrors = Object.fromEntries(FIELDS[mode].map((k) => [k, validateField(mode, k, form)]));
    setErrors(nextErrors);
    const firstInvalid = FIELDS[mode].find((k) => nextErrors[k]);
    if (firstInvalid) { refs[firstInvalid].current?.focus(); return; }

    setSubmitting(true);
    try {
      const u = mode === 'login'
        ? await login({ email: form.email.trim(), password: form.password })
        : await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success(mode === 'login'
        ? `Welcome back, ${firstName(u.name)}!`
        : `Welcome to SkillNest, ${firstName(u.name)}! Your account is ready.`);
      navigate(destination(u), { replace: true });
    } catch (x) {
      setFormError(errMsg(x));
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';
  return (
    <div className="auth-page">
      <aside className="dark-panel auth-aside" aria-label="About SkillNest">
        <div className="auth-aside-inner">
          <p className="eyebrow">SkillNest learning</p>
          <h2>Turn curiosity into <span className="accent-serif">career-ready</span> skills.</h2>
          <p>Join a focused learning space for the AI, data and automation skills shaping tomorrow's work.</p>
          <ul className="auth-points" role="list">
            <li><span aria-hidden="true"><Icon name="target" size={18} /></span>Project-based courses with clear outcomes</li>
            <li><span aria-hidden="true"><Icon name="signal" size={18} /></span>Beginner to advanced learning paths</li>
            <li><span aria-hidden="true"><Icon name="grid" size={18} /></span>A dashboard to track every course</li>
          </ul>
          <NetworkGraphic dark />
        </div>
      </aside>

      <div className="auth-main">
        <div className="card auth-card">
          <div className="auth-head">
            <Brand />
            <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted text-sm">
              {isLogin ? 'Log in to continue your learning journey.' : 'Start learning practical AI skills in minutes.'}
            </p>
          </div>

          <form onSubmit={submit} noValidate aria-describedby={formError ? 'form-error' : undefined}>
            {formError && (
              <div id="form-error" className="form-alert" role="alert">
                <Icon name="alertCircle" size={18} />{formError}
              </div>
            )}

            {!isLogin && (
              <FormField id="name" label="Full name" error={errors.name}>
                {(p) => <input {...p} ref={refs.name} className="input" autoComplete="name" value={form.name} onChange={onChange('name')} onBlur={onBlur('name')} />}
              </FormField>
            )}
            <FormField id="email" label="Email address" error={errors.email}>
              {(p) => <input {...p} ref={refs.email} type="email" className="input" autoComplete="email" inputMode="email" placeholder="you@example.com" value={form.email} onChange={onChange('email')} onBlur={onBlur('email')} />}
            </FormField>
            <FormField id="password" label="Password" error={errors.password} hint={isLogin ? undefined : 'At least 6 characters.'}>
              {(p) => (
                <div className="password-wrap">
                  <input {...p} ref={refs.password} type={showPassword ? 'text' : 'password'} className="input"
                    autoComplete={isLogin ? 'current-password' : 'new-password'} value={form.password}
                    onChange={onChange('password')} onBlur={onBlur('password')} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)}
                    aria-label="Show password" aria-pressed={showPassword} aria-controls="password">
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
                  </button>
                </div>
              )}
            </FormField>

            <button type="submit" className="btn btn-primary btn-block btn-lg" aria-disabled={submitting || undefined}>
              {submitting
                ? <><span className="spinner" aria-hidden="true" />{isLogin ? 'Logging in…' : 'Creating account…'}</>
                : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? 'New to SkillNest? ' : 'Already have an account? '}
            <Link to={isLogin ? '/auth?mode=register' : '/auth'} onClick={switchMode(isLogin ? 'register' : 'login')}>
              {isLogin ? 'Create an account' : 'Log in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
