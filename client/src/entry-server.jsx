import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { matchPath } from 'react-router-dom';
import Root from './Root';
import { ROUTE_PATHS } from './App';
import { HeadContext } from './lib/initialData';
import { loadRouteData } from './ssr/loaders';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './hooks/useDocumentTitle';

// Renders one request to HTML. Returns { html, head, data, status } or { redirect }.
export async function render(url, { apiBase }) {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (!ROUTE_PATHS.some((path) => matchPath(path, pathname))) return { redirect: '/' };

  const { data, status } = await loadRouteData(pathname, searchParams, apiBase);
  // The client receives its own copy; the server render consumes this one.
  const serverData = { ...data };
  const head = { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };

  const html = renderToString(
    <React.StrictMode>
      <HeadContext.Provider value={head}>
        <StaticRouter location={url}>
          <Root initialData={serverData} />
        </StaticRouter>
      </HeadContext.Provider>
    </React.StrictMode>
  );
  return { html, head, data, status };
}
