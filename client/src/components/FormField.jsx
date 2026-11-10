import Icon from './Icon';

// Wires label, hint and error to the control via a render prop: children(controlProps).
export default function FormField({ id, label, error, hint, optional, children }) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="label">
        {label}{optional && <span className="label-optional"> (optional)</span>}
      </label>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && <p id={errorId} className="field-error"><Icon name="alertCircle" size={16} />{error}</p>}
    </div>
  );
}
