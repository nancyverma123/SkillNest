// Lightweight inline SVG icon set (24×24, stroke-based). Decorative by default.
const P = (d) => <path d={d} />;
const C = (cx, cy, r) => <circle cx={cx} cy={cy} r={r} />;

const ICONS = {
  menu: P('M4 6h16M4 12h16M4 18h16'),
  x: P('M18 6 6 18M6 6l12 12'),
  search: <>{C(11, 11, 7)}{P('m20 20-3.6-3.6')}</>,
  arrowRight: P('M5 12h14M13 6l6 6-6 6'),
  arrowLeft: P('M19 12H5M11 18l-6-6 6-6'),
  chevronDown: P('m6 9 6 6 6-6'),
  clock: <>{C(12, 12, 9)}{P('M12 7v5l3 2')}</>,
  signal: P('M4 20v-3M9 20v-7M14 20V9M19 20V4'),
  user: <>{C(12, 8, 4)}{P('M4 21a8 8 0 0 1 16 0')}</>,
  users: <>{C(9, 8, 4)}{P('M2 21a7 7 0 0 1 14 0M16 4.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3')}</>,
  bookOpen: P('M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'),
  check: P('M20 6 9 17l-5-5'),
  checkCircle: <>{C(12, 12, 9)}{P('m8.5 12 2.5 2.5 4.5-5')}</>,
  trash: P('M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6'),
  edit: P('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),
  plus: P('M12 5v14M5 12h14'),
  grid: P('M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'),
  layers: P('m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5'),
  sparkles: P('M12 3l1.8 4.9L19 10l-5.2 2.1L12 17l-1.8-4.9L5 10l5.2-2.1zM19 15v4M21 17h-4M5 3v3M6.5 4.5h-3'),
  cpu: <><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" />{P('M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3')}</>,
  bot: <><rect x="3" y="10" width="18" height="11" rx="3" />{C(12, 5, 2)}{P('M12 7v3M8.5 15h.01M15.5 15h.01')}</>,
  zap: P('M13 2 3 14h9l-1 8 10-12h-9z'),
  barChart: P('M3 3v18h18M8 17v-4M13 17V7M18 17v-7'),
  trendingUp: P('m22 7-8.5 8.5-5-5L2 17M16 7h6v6'),
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" />{P('M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3')}</>,
  eye: <>{P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z')}{C(12, 12, 3)}</>,
  eyeOff: P('M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-2.2 3M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20'),
  logOut: P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'),
  alertCircle: <>{C(12, 12, 9)}{P('M12 8v4M12 16h.01')}</>,
  alertTriangle: P('M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01'),
  info: <>{C(12, 12, 9)}{P('M12 16v-4M12 8h.01')}</>,
  target: <>{C(12, 12, 9)}{C(12, 12, 5)}{C(12, 12, 1)}</>,
  compass: <>{C(12, 12, 9)}{P('m15.5 8.5-2 5-5 2 2-5z')}</>,
  play: P('M7 4v16l13-8z'),
  home: P('m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'),
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" />{P('M16 2v4M8 2v4M3 10h18')}</>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" />{P('m22 7-10 6L2 7')}</>,
  shield: P('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  lightbulb: P('M9 18h6M10 22h4M15 14c.2-1 .7-1.7 1.5-2.5A5 5 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5'),
  award: <>{C(12, 8, 6)}{P('M15.5 13 17 22l-5-3-5 3 1.5-9')}</>,
  code: P('m16 18 6-6-6-6M8 6l-6 6 6 6'),
  penTool: <>{P('m12 19 7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6')}{C(11, 11, 2)}</>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" />{P('M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16')}</>,
  rotateCcw: P('M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5'),
  filter: P('M22 3H2l8 9.5V19l4 2v-8.5z'),
};

export const ICON_NAMES = Object.keys(ICONS);

export default function Icon({ name, size = 20, strokeWidth = 2, className, title }) {
  const glyph = ICONS[name] || ICONS.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {glyph}
    </svg>
  );
}
