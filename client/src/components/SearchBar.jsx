import Icon from './Icon';

export default function SearchBar({ id, label, value, onChange, placeholder, hideLabel = false }) {
  return (
    <div className="field search-field">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'label'}>{label}</label>
      <div className="input-icon-wrap">
        <Icon name="search" size={18} className="input-icon" />
        <input
          id={id}
          type="search"
          className="input input-with-icon"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {value && (
          <button type="button" className="input-clear" onClick={() => onChange('')} aria-label={`Clear ${label.toLowerCase()}`}>
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
