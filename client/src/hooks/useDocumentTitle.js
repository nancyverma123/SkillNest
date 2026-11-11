import { useContext, useEffect } from 'react';
import { HeadContext } from '../lib/initialData';

export const DEFAULT_TITLE = 'SkillNest — Practical AI skills for your future';
export const DEFAULT_DESCRIPTION = 'SkillNest — practical, project-based courses in generative AI, agentic AI, data analytics and automation.';

// Sets the page <title> (and optionally the meta description).
// In the browser this runs in an effect; during SSR it writes into HeadContext so the
// server can put the right title in the HTML it sends.
export default function useDocumentTitle(title, description) {
  const fullTitle = title ? `${title} · SkillNest` : DEFAULT_TITLE;
  const head = useContext(HeadContext);
  if (head && typeof window === 'undefined') {
    head.title = fullTitle;
    if (description) head.description = description;
  }
  useEffect(() => {
    document.title = fullTitle;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [fullTitle, description]);
}
