import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Root from './Root';
import './styles.css';

const container = document.getElementById('root');
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <Root initialData={window.__INITIAL_DATA__ || {}} />
    </BrowserRouter>
  </React.StrictMode>
);

// Hydrate server-rendered HTML; fall back to a client render if the server sent an empty shell.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
