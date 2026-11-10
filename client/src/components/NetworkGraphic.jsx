// Decorative neural-network illustration used in the hero and on the auth page.
const LAYERS = [
  [[40, 45], [40, 95], [40, 145]],
  [[160, 28], [160, 74], [160, 120], [160, 166]],
  [[280, 65], [280, 130]],
];
const HIGHLIGHT = new Set(['0-1', '1-1', '1-2', '2-0']);

export default function NetworkGraphic({ className = 'hv-network', dark = false }) {
  const edges = [];
  LAYERS.slice(0, -1).forEach((layer, li) => {
    layer.forEach(([x1, y1], a) => {
      LAYERS[li + 1].forEach(([x2, y2], b) => {
        const hot = HIGHLIGHT.has(`${li}-${a}`) && HIGHLIGHT.has(`${li + 1}-${b}`);
        edges.push(
          <line key={`${li}-${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={hot ? '#F97316' : dark ? '#94A3B8' : '#0F172A'} strokeWidth={hot ? 2.5 : 1.25} opacity={hot ? 1 : 0.25} />
        );
      });
    });
  });
  return (
    <svg className={className} viewBox="0 0 320 194" aria-hidden="true" focusable="false">
      {edges}
      {LAYERS.flatMap((layer, li) => layer.map(([cx, cy], i) => {
        const hot = HIGHLIGHT.has(`${li}-${i}`);
        return (
          <circle key={`${li}-${i}`} cx={cx} cy={cy} r={hot ? 11 : 9}
            fill={hot ? (li === 1 ? '#F0493E' : '#F97316') : dark ? '#1E293B' : '#FFFFFF'}
            stroke={dark ? '#E2E8F0' : '#0F172A'} strokeWidth="2" />
        );
      }))}
    </svg>
  );
}
