import { useEffect, useRef, useState } from 'react';
import { errMsg } from '../../api';
import { courseApi } from '../../lib/services';
import Icon from '../Icon';
import FormField from '../FormField';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EMPTY = { title: '', instructor: '', category: '', duration: '', price: '', level: 'Beginner', thumbnail: '', description: '', outcomes: '', curriculum: '' };
const ORDER = ['title', 'instructor', 'category', 'duration', 'price', 'thumbnail', 'description', 'outcomes', 'curriculum'];
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

function toForm(course) {
  if (!course) return EMPTY;
  return {
    ...EMPTY,
    ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, course[k] ?? EMPTY[k]])),
    price: String(course.price ?? ''),
    outcomes: (course.outcomes || []).join('\n'),
    curriculum: (course.curriculum || []).join('\n'),
  };
}

// Mirrors the server-side rules in server/middleware/validate.js.
function validate(f) {
  const e = {};
  if (!f.title.trim()) e.title = 'Enter a course title.';
  if (!f.instructor.trim()) e.instructor = 'Enter the instructor name.';
  if (!f.category.trim()) e.category = 'Enter a category.';
  if (!f.duration.trim()) e.duration = 'Enter a duration, e.g. "4 weeks".';
  const price = Number(f.price);
  if (f.price.trim() === '' || !Number.isFinite(price) || price < 0) e.price = 'Enter a price of 0 or more.';
  if (f.thumbnail.trim() && !/^https?:\/\/\S+$/i.test(f.thumbnail.trim())) e.thumbnail = 'Use a full image URL starting with http:// or https://';
  if (!f.description.trim()) e.description = 'Enter a short description.';
  for (const k of ['outcomes', 'curriculum']) {
    const items = lines(f[k]);
    if (items.length > 15) e[k] = 'Add at most 15 items.';
    else if (items.some((x) => x.length > 200)) e[k] = 'Keep each line under 200 characters.';
  }
  return e;
}

export default function CourseForm({ course, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(() => toForm(course));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const editing = Boolean(course);

  useEffect(() => {
    setForm(toForm(course));
    setErrors({});
    setFormError('');
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [course]);

  const set = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');
    const v = validate(form);
    setErrors(v);
    const first = ORDER.find((k) => v[k]);
    if (first) { formRef.current?.querySelector(`#course-${first}`)?.focus(); return; }

    const body = {
      title: form.title.trim(), instructor: form.instructor.trim(), category: form.category.trim(),
      duration: form.duration.trim(), price: Number(form.price), level: form.level,
      thumbnail: form.thumbnail.trim(), description: form.description.trim(),
      outcomes: lines(form.outcomes), curriculum: lines(form.curriculum),
    };
    setSaving(true);
    try {
      const saved = editing ? await courseApi.update(course._id, body) : await courseApi.create(body);
      onSaved(saved, editing);
    } catch (x) {
      setFormError(errMsg(x));
      setSaving(false);
    }
  };

  const input = (k, label, props = {}) => (
    <FormField id={`course-${k}`} label={label} error={errors[k]} optional={props.optional} hint={props.hint}>
      {(p) => <input {...p} className="input" value={form[k]} onChange={set(k)} {...props.input} />}
    </FormField>
  );
  const area = (k, label, props = {}) => (
    <FormField id={`course-${k}`} label={label} error={errors[k]} optional={props.optional} hint={props.hint}>
      {(p) => <textarea {...p} className="input" rows={props.rows || 4} value={form[k]} onChange={set(k)} />}
    </FormField>
  );

  return (
    <section className="card form-card" aria-labelledby="course-form-title">
      <div className="form-card-head">
        <h2 id="course-form-title" ref={headingRef} tabIndex={-1}>{editing ? `Edit “${course.title}”` : 'Add a new course'}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><Icon name="x" size={16} />Cancel</button>
      </div>
      <form ref={formRef} onSubmit={submit} noValidate>
        {formError && <div className="form-alert" role="alert"><Icon name="alertCircle" size={18} />{formError}</div>}
        <div className="form-grid form-grid-2">
          {input('title', 'Course title')}
          {input('instructor', 'Instructor')}
          {input('category', 'Category', { hint: 'Choose an existing category or type a new one.', input: { list: 'category-options' } })}
          <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          {input('duration', 'Duration', { input: { placeholder: 'e.g. 4 weeks' } })}
          {input('price', 'Price (₹)', { input: { type: 'number', min: 0, step: 1, inputMode: 'numeric' } })}
          <FormField id="course-level" label="Level">
            {(p) => (
              <div className="select-wrap">
                <select {...p} className="input select" value={form.level} onChange={set('level')}>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <Icon name="chevronDown" size={18} className="select-chevron" />
              </div>
            )}
          </FormField>
          <div className="span-2">{input('thumbnail', 'Cover image URL', { optional: true, hint: 'Leave empty to use the category illustration.', input: { type: 'url', placeholder: 'https://…' } })}</div>
          <div className="span-2">{area('description', 'Description', { rows: 3 })}</div>
          {area('outcomes', 'What learners will learn', { optional: true, hint: 'One outcome per line.', rows: 5 })}
          {area('curriculum', 'Curriculum modules', { optional: true, hint: 'One module per line, in order.', rows: 5 })}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" aria-disabled={saving || undefined}>
            {saving ? <><span className="spinner" aria-hidden="true" />Saving…</> : editing ? 'Save changes' : <><Icon name="plus" size={18} />Add course</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
