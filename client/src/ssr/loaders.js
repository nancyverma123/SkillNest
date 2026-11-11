import { matchPath } from 'react-router-dom';
import { KEYS, courseListParams, normalizeCourseQuery } from '../lib/initialData';

// Server-side data loading for public, SEO-relevant pages. Runs only on the SSR server.
// If the API is slow or unavailable the page still renders and the browser fetches the data.
const TIMEOUT_MS = 4000;

function createClient(apiBase) {
  return async (path, params) => {
    const query = params
      ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined)).toString()}`
      : '';
    const res = await fetch(`${apiBase}${path}${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      const err = new Error(`API ${res.status} for ${path}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  };
}

export async function loadRouteData(pathname, searchParams, apiBase) {
  const get = createClient(apiBase);
  const data = {};
  let status = 200;
  try {
    if (pathname === '/') {
      const [list, categories] = await Promise.all([get('/courses', { sort: 'newest' }), get('/courses/categories')]);
      data[KEYS.homeCourses] = list.slice(0, 3);
      data[KEYS.categories] = categories;
    } else if (pathname === '/courses') {
      const query = normalizeCourseQuery(searchParams);
      const [list, categories] = await Promise.all([get('/courses', courseListParams(query)), get('/courses/categories')]);
      data[KEYS.courseList(query)] = list;
      data[KEYS.categories] = categories;
    } else {
      const match = matchPath('/courses/:id', pathname);
      if (match) {
        const { id } = match.params;
        try {
          data[KEYS.course(id)] = await get(`/courses/${encodeURIComponent(id)}`);
        } catch (e) {
          if (e.status !== 404) throw e;
          data[KEYS.course(id)] = null;
          status = 404;
        }
      }
    }
  } catch (e) {
    console.warn(`[ssr] data load skipped for ${pathname}: ${e.message}`);
  }
  return { data, status };
}
