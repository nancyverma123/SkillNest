import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errMsg } from '../api';
import { courseApi } from '../lib/services';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Icon from '../components/Icon';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import CourseGrid from '../components/CourseGrid';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Courses() {
  useDocumentTitle('Explore courses');
  // Filters live in the URL so results are shareable and survive back/forward navigation.
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const level = LEVELS.includes(params.get('level')) ? params.get('level') : '';
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'newest';

  const [search, setSearch] = useState(() => params.get('q') || '');
  const query = useDebouncedValue(search.trim(), 300);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [reload, setReload] = useState(0);

  const setParam = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }, [setParams]);

  useEffect(() => { setParam('q', query); }, [query, setParam]);

  useEffect(() => {
    courseApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    courseApi
      .list({ search: query || undefined, category: category || undefined, level: level || undefined, sort })
      .then((list) => { if (active) setCourses(list); })
      .catch((e) => { if (active) { setCourses([]); setError(errMsg(e)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, category, level, sort, reload]);

  const hasFilters = Boolean(search || category || level || sort !== 'newest');
  const clearFilters = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  const categoryOptions = useMemo(() => {
    const names = categories.map((c) => c.name);
    if (category && !names.includes(category)) names.push(category);
    return [{ value: '', label: 'All categories' }, ...names.map((n) => ({ value: n, label: n }))];
  }, [categories, category]);

  const filterFields = [
    { id: 'filter-category', label: 'Category', value: category, onChange: (v) => setParam('category', v), options: categoryOptions },
    {
      id: 'filter-level', label: 'Level', value: level, onChange: (v) => setParam('level', v),
      options: [{ value: '', label: 'All levels' }, ...LEVELS.map((l) => ({ value: l, label: l }))],
    },
    { id: 'filter-sort', label: 'Sort by', value: sort, onChange: (v) => setParam('sort', v === 'newest' ? '' : v), options: SORTS },
  ];

  const count = courses.length;
  return (
    <>
      <section className="page-hero" aria-labelledby="courses-title">
        <div className="container">
          <div className="page-hero-inner">
            <p className="eyebrow">Course catalogue</p>
            <h1 id="courses-title">Explore courses</h1>
            <p className="lead">Practical courses in AI, data and automation. Search, filter and find your next skill.</p>
          </div>
        </div>
      </section>

      <section className="container section-tight" aria-label="Course search and results" style={{ paddingTop: 0 }}>
        <div className="card toolbar">
          <SearchBar
            id="course-search"
            label="Search courses"
            value={search}
            onChange={setSearch}
            placeholder="Search by title, instructor or topic"
          />
          <FilterPanel fields={filterFields} label="Course filters" />
        </div>

        <div className="results-bar">
          <p className="results-count" role="status" aria-live="polite">
            {loading ? 'Searching courses…' : <>Showing <strong>{count}</strong> {count === 1 ? 'course' : 'courses'}</>}
          </p>
          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <Icon name="x" size={16} />Clear filters
            </button>
          )}
        </div>

        <CourseGrid
          courses={courses}
          loading={loading}
          error={error}
          onRetry={() => setReload((n) => n + 1)}
          headingLevel={2}
          emptyTitle="No courses match your filters"
          emptyText="Try a different search term, or clear the filters to see every course."
          emptyAction={hasFilters && (
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear all filters</button>
          )}
        />
      </section>
    </>
  );
}
