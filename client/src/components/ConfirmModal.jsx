import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConfirmModal({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'danger', busy = false, onConfirm, onCancel,
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = '';
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && !busy) {
      e.stopPropagation();
      onCancel();
    } else if (e.key === 'Tab') {
      const items = dialogRef.current.querySelectorAll(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div
        ref={dialogRef}
        className="modal card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
      >
        <div className={`modal-icon tone-${tone}`}><Icon name={tone === 'danger' ? 'alertTriangle' : 'info'} size={22} /></div>
        <h2 id={titleId} className="modal-title">{title}</h2>
        <div id={descId} className="modal-text">{description}</div>
        <div className="modal-actions">
          <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
            onClick={() => { if (!busy) onConfirm(); }}
            aria-disabled={busy || undefined}
          >
            {busy ? <><span className="spinner" aria-hidden="true" />Working…</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
