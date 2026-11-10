import Icon from './Icon';

export function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      <div className="select-wrap">
        <select id={id} className="input select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevronDown" size={18} className="select-chevron" />
      </div>
    </div>
  );
}

export default function FilterPanel({ fields, label = 'Filters' }) {
  return (
    <div className="filter-panel" role="group" aria-label={label}>
      {fields.map((f) => <SelectField key={f.id} {...f} />)}
    </div>
  );
}
