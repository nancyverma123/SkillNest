import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · SkillNest` : 'SkillNest — Practical AI skills for your future';
  }, [title]);
}
