import { createContext, useContext, useEffect, useState } from 'react';

// Data fetched by the SSR server is embedded in the page as window.__INITIAL_DATA__
// and handed to pages through this context, so the first client render matches the
// server HTML (no hydration mismatch, no duplicate request). Each entry is used once:
// later visits to the same page fetch fresh data.
const InitialDataContext = createContext(null);
export const InitialDataProvider = InitialDataContext.Provider;

// Returns { value } if the server provided data for `key`, otherwise null.
export function useInitialData(key) {
  const store = useContext(InitialDataContext);
  const [entry] = useState(() => (store && Object.prototype.hasOwnProperty.call(store, key) ? { value: store[key] } : null));
  useEffect(() => {
    if (store && typeof window !== 'undefined') delete store[key];
  }, [store, key]);
  return entry;
}

// Head (title/description) collected during server rendering.
export const HeadContext = createContext(null);

// ---- Shared keys and query normalisation (used by pages AND server loaders) ----
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const SORTS = ['newest', 'price_asc', 'price_desc'];

export function normalizeCourseQuery(params) {
  const level = params.get('level');
  const sort = params.get('sort');
  return {
    q: (params.get('q') || '').trim(),
    category: params.get('category') || '',
    level: LEVELS.includes(level) ? level : '',
    sort: SORTS.includes(sort) ? sort : 'newest',
  };
}

// Same parameters the client sends with axios (empty values omitted).
export function courseListParams({ q, category, level, sort }) {
  return { search: q || undefined, category: category || undefined, level: level || undefined, sort };
}

export const KEYS = {
  homeCourses: 'home:courses',
  categories: 'courses:categories',
  courseList: ({ q, category, level, sort }) => `courses:list:${q}|${category}|${level}|${sort}`,
  course: (id) => `course:${id}`,
};
