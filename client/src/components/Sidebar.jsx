import { Link } from 'react-router-dom';
import Icon from './Icon';

// Vertical on desktop, horizontally scrollable strip on mobile (see .sidebar-nav in styles.css).
// Items: { key, label, icon, to | href, active?, count? }
export default function Sidebar({ label, title, items }) {
  return (
    <aside className="sidebar">
      <nav className="card sidebar-nav" aria-label={label}>
        {title && <p className="sidebar-title">{title}</p>}
        <ul role="list">
          {items.map((it) => {
            const content = (
              <>
                <Icon name={it.icon} size={18} />
                <span>{it.label}</span>
                {it.count != null && <span className="sidebar-count" aria-label={`${it.count} items`}>{it.count}</span>}
              </>
            );
            return (
              <li key={it.key}>
                {it.href ? (
                  <a href={it.href} className="sidebar-link">{content}</a>
                ) : (
                  <Link to={it.to} className="sidebar-link" aria-current={it.active ? 'page' : undefined}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
