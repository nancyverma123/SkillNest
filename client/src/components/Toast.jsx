import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const ICONS = { success: 'checkCircle', error: 'alertCircle', info: 'info' };
const DURATION = { success: 4500, info: 4500, error: 7000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const seq = useRef(0);
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback((type, message, title) => {
    const id = ++seq.current;
    setToasts((list) => [...list.slice(-3), { id, type, message, title }]);
    setTimeout(() => dismiss(id), DURATION[type]);
  }, [dismiss]);

  const value = useMemo(() => ({
    success: (message, title) => push('success', message, title),
    error: (message, title) => push('error', message, title),
    info: (message, title) => push('info', message, title),
  }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* Portalled outside #root (after mount, so SSR output stays identical) to keep live regions announcing while a modal makes #root inert. */}
      {mounted && createPortal(<ToastRegions toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastCtx.Provider>
  );
}

function ToastRegions({ toasts, onDismiss }) {
  const render = (t) => (
    <div key={t.id} className={`toast toast-${t.type}`}>
      <Icon name={ICONS[t.type]} className="toast-icon" />
      <div>
        {t.title && <p className="toast-title">{t.title}</p>}
        <p className="toast-msg">{t.message}</p>
      </div>
      <button type="button" className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
        <Icon name="x" size={18} />
      </button>
    </div>
  );
  return (
    <div className="toast-stack">
      <div className="toast-region" role="status" aria-live="polite">{toasts.filter((t) => t.type !== 'error').map(render)}</div>
      <div className="toast-region" role="alert" aria-live="assertive">{toasts.filter((t) => t.type === 'error').map(render)}</div>
    </div>
  );
}
