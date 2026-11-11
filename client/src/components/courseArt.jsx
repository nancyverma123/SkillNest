// Subject-specific course illustrations (inline SVG, 400×225 canvas).
// A scene is chosen by matching keywords in the course category first, then its title,
// so admin-created categories ("Design", "Development", "Data", …) still get relevant imagery.
const INK = '#0F172A';
const CORAL = '#F0493E';
const RED = '#D93526';
const ORANGE = '#F97316';
const PEACH = '#FECDBF';
const YELLOW = '#FDE68A';
const CREAM = '#FFF8F4';
const MUTED = '#CBD5E1';
const LINE = '#1E293B';
const SW = 1.75;
const SW2 = 1.5;

function Card({ x, y, w, h, r = 12, fill = '#FFFFFF', shadow = 5 }) {
  return (
    <>
      <rect x={x + 2} y={y + shadow} width={w} height={h} rx={r} fill={INK} opacity="0.08" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={LINE} strokeWidth={SW} />
    </>
  );
}
const Bar = ({ x, y, w, h = 7, fill = MUTED }) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
const WindowDots = ({ x, y }) => (
  <>
    {[CORAL, ORANGE, YELLOW].map((c, i) => <circle key={c} cx={x + i * 12} cy={y} r="4" fill={c} stroke={INK} strokeWidth="1.5" />)}
  </>
);

function DesignArt() {
  return (
    <>
      <Card x={70} y={32} w={200} h={152} />
      <WindowDots x={88} y={46} />
      <line x1="70" y1="60" x2="270" y2="60" stroke={INK} strokeWidth={SW2} />
      <rect x="86" y="76" width="68" height="68" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="120" cy="110" r="26" fill={CORAL} stroke={INK} strokeWidth={SW} />
      {[[86, 76], [154, 76], [86, 144], [154, 144]].map(([hx, hy]) => (
        <rect key={`${hx}-${hy}`} x={hx - 4} y={hy - 4} width="8" height="8" fill="#FFFFFF" stroke={INK} strokeWidth="1.5" />
      ))}
      <rect x="172" y="78" width="78" height="44" rx="8" fill={ORANGE} stroke={INK} strokeWidth={SW} />
      <path d="M182 172 L212 134 L246 172 Z" fill={YELLOW} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M150 140 v26 l7-7 l6 12 l5-2.5 l-6-12 h10 z" fill={INK} stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
      <Card x={290} y={52} w={58} h={124} />
      {[CORAL, ORANGE, YELLOW].map((c, i) => <circle key={c} cx="319" cy={80 + i * 34} r="13" fill={c} stroke={INK} strokeWidth={SW} />)}
    </>
  );
}

function CodeArt() {
  const rows = [
    [[76, 38, CORAL], [122, 72]],
    [[92, 30, ORANGE], [130, 94]],
    [[108, 54, '#64748B'], [170, 40, CORAL]],
    [[108, 86]],
    [[92, 46, ORANGE]],
    [[76, 24, CORAL]],
  ];
  return (
    <>
      <Card x={52} y={30} w={244} h={158} />
      <WindowDots x={70} y={44} />
      <line x1="52" y1="58" x2="296" y2="58" stroke={INK} strokeWidth={SW2} />
      {rows.map((parts, i) => parts.map(([x, w, fill]) => <Bar key={`${i}-${x}`} x={x} y={72 + i * 18} w={w} fill={fill} />))}
      <rect x="104" y="160" width="2.5" height="13" fill={INK} />
      <Card x={258} y={110} w={104} h={78} fill={INK} />
      <text x="310" y="158" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="28" fill="#FDBA74">&lt;/&gt;</text>
    </>
  );
}

function DataArt() {
  const bars = [[254, 40, CORAL], [278, 64, ORANGE], [302, 30, YELLOW], [326, 80, RED]];
  return (
    <>
      <Card x={36} y={40} w={184} h={146} />
      <rect x="48" y="52" width="160" height="18" rx="4" fill={PEACH} />
      {[90, 110, 130, 150, 170].map((y) => <line key={y} x1="48" y1={y} x2="208" y2={y} stroke="#E6D7D5" strokeWidth="1.5" />)}
      {[100, 154].map((x) => <line key={x} x1={x} y1="52" x2={x} y2="176" stroke="#E6D7D5" strokeWidth="1.5" />)}
      {[[56, 77, 30], [108, 77, 36], [162, 77, 26], [56, 97, 24], [108, 117, 32], [56, 137, 34], [162, 137, 30], [108, 157, 26]].map(([x, y, w]) => (
        <Bar key={`${x}-${y}`} x={x} y={y} w={w} h={6} />
      ))}
      <rect x="154" y="110" width="54" height="20" fill="none" stroke={ORANGE} strokeWidth={SW} />
      <Card x={236} y={58} w={128} h={128} />
      <line x1="248" y1="170" x2="352" y2="170" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {bars.map(([x, h, fill]) => <rect key={x} x={x} y={170 - h} width="16" height={h} rx="3" fill={fill} stroke={INK} strokeWidth={SW2} />)}
      <polyline points="262,124 286,100 310,134 334,84" fill="none" stroke={INK} strokeWidth={SW2} strokeDasharray="3 4" />
    </>
  );
}

function AiArt() {
  const nodes = [[292, 86], [292, 138], [318, 74], [318, 112], [318, 150], [344, 112]];
  const edges = [[0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]];
  const hot = new Set([0, 3, 5]);
  return (
    <>
      <Card x={46} y={32} w={206} h={156} />
      <rect x="128" y="50" width="108" height="32" rx="12" fill={PEACH} stroke={INK} strokeWidth={SW2} />
      <Bar x={142} y={63} w={72} h={6} fill={RED} />
      <circle cx="74" cy="112" r="11" fill={ORANGE} stroke={INK} strokeWidth={SW2} />
      <path d="M74 105 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2-4.5 -4.5-2 4.5-2z" fill={INK} />
      <rect x="92" y="94" width="144" height="50" rx="12" fill="#FFFFFF" stroke={INK} strokeWidth={SW2} />
      <Bar x={106} y={108} w={110} h={6} />
      <Bar x={106} y={124} w={78} h={6} />
      <rect x="62" y="156" width="174" height="22" rx="11" fill={CREAM} stroke={INK} strokeWidth="1.5" />
      <circle cx="224" cy="167" r="7" fill={CORAL} stroke={INK} strokeWidth="1.5" />
      <Card x={268} y={56} w={100} h={112} />
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={hot.has(a) && hot.has(b) ? ORANGE : INK} strokeWidth={hot.has(a) && hot.has(b) ? 2.5 : 1.2} opacity={hot.has(a) && hot.has(b) ? 1 : 0.35} />
      ))}
      {nodes.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="6.5" fill={hot.has(i) ? CORAL : '#FFFFFF'} stroke={INK} strokeWidth={SW2} />)}
      <path d="M356 28 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5-8 -8-3.5 8-3.5z" fill={YELLOW} stroke={INK} strokeWidth={SW2} strokeLinejoin="round" />
    </>
  );
}

function AutomationArt() {
  const arrow = (x1, x2) => (
    <>
      <line x1={x1} y1="112" x2={x2 - 2} y2="112" stroke={INK} strokeWidth={SW} strokeDasharray="5 4" />
      <path d={`M${x2 - 8} 105 L${x2} 112 L${x2 - 8} 119`} fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
  return (
    <>
      <Card x={34} y={80} w={82} h={64} />
      <circle cx="75" cy="102" r="11" fill={CORAL} stroke={INK} strokeWidth={SW2} />
      <Bar x={54} y={124} w={42} h={6} />
      {arrow(124, 158)}
      <Card x={160} y={54} w={90} h={116} fill={CREAM} />
      <path d="M214 72 L186 116 L206 116 L198 152 L228 104 L208 104 Z" fill={YELLOW} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {arrow(258, 292)}
      <Card x={294} y={80} w={82} h={64} />
      <circle cx="335" cy="102" r="12" fill={ORANGE} stroke={INK} strokeWidth={SW2} />
      <path d="M329 102 l4.5 4.5 l8-8" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <Bar x={314} y={124} w={42} h={6} />
    </>
  );
}

function BusinessArt() {
  const pts = '74,168 106,152 136,158 168,134 200,140 232,114 256,104';
  return (
    <>
      <Card x={52} y={30} w={224} h={158} />
      <Bar x={70} y={46} w={64} h={8} fill={INK} />
      <rect x="70" y="64" width="84" height="32" rx="8" fill={CREAM} stroke={INK} strokeWidth="1.5" />
      <Bar x={80} y={76} w={44} h={7} fill={ORANGE} />
      <rect x="162" y="64" width="98" height="32" rx="8" fill={PEACH} stroke={INK} strokeWidth="1.5" />
      <Bar x={172} y={76} w={56} h={7} fill={RED} />
      <polygon points={`${pts} 256,176 74,176`} fill={CORAL} opacity="0.14" />
      <polyline points={pts} fill="none" stroke={CORAL} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="256" cy="104" r="5.5" fill={ORANGE} stroke={INK} strokeWidth={SW2} />
      <Card x={292} y={84} w={80} h={84} />
      <circle cx="332" cy="126" r="25" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
      <circle cx="332" cy="126" r="15" fill={CORAL} stroke={INK} strokeWidth={SW2} />
      <circle cx="332" cy="126" r="5.5" fill="#FFFFFF" stroke={INK} strokeWidth={SW2} />
      <path d="M358 98 L334 124" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <path d="M352 94 l8 -2 -2 8" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function LearningArt() {
  return (
    <>
      <Card x={104} y={40} w={192} h={144} />
      <rect x="120" y="56" width="78" height="112" rx="6" fill={CREAM} stroke={INK} strokeWidth={SW2} />
      <rect x="202" y="56" width="78" height="112" rx="6" fill={CREAM} stroke={INK} strokeWidth={SW2} />
      {[76, 92, 108, 124, 140].map((y, i) => <Bar key={y} x={132} y={y} w={i % 2 ? 42 : 54} h={6} />)}
      {[96, 112, 128, 144].map((y, i) => <Bar key={y} x={214} y={y} w={i % 2 ? 36 : 50} h={6} />)}
      <path d="M252 56 v32 l8-7 8 7 v-32" fill={CORAL} stroke={INK} strokeWidth={SW2} strokeLinejoin="round" />
      <Card x={306} y={112} w={58} h={58} />
      <path d="M335 124 l4 9 9 4 -9 4 -4 9 -4-9 -9-4 9-4z" fill={YELLOW} stroke={INK} strokeWidth={SW2} strokeLinejoin="round" />
    </>
  );
}

// Order matters: more specific subjects are tested first.
const SCENES = [
  { key: 'automation', test: /agent|automat|workflow|no-?code|zapier|\brpa\b/, icon: 'zap', bg: '#FFEBD6', accent: '#9A3412', alt: 'an automated workflow with connected steps', Art: AutomationArt },
  { key: 'design', test: /design|\bui\b|\bux\b|figma|graphic|brand|illustrat|typograph/, icon: 'penTool', bg: '#FDE7E4', accent: '#B42318', alt: 'a design canvas with shapes and colour swatches', Art: DesignArt },
  { key: 'code', test: /develop|react|javascript|typescript|python|\bjava\b|program|coding|\bcode|web|software|front.?end|back.?end|node|full.?stack|html|css|\bapp\b|\bapi\b/, icon: 'code', bg: '#FFF1E6', accent: '#9A3412', alt: 'a code editor', Art: CodeArt },
  { key: 'data', test: /data|analytic|excel|\bsql\b|spreadsheet|statistic|power ?bi|tableau|insight|dashboard/, icon: 'barChart', bg: '#FFF4E8', accent: '#9A3412', alt: 'a spreadsheet and bar chart', Art: DataArt },
  { key: 'ai', test: /\bai\b|artificial|machine learning|\bml\b|generative|prompt|\bllm|gpt|neural|deep learning|\bnlp\b/, icon: 'sparkles', bg: '#FCE4E1', accent: '#B42318', alt: 'an AI assistant chat and a neural network', Art: AiArt },
  { key: 'business', test: /business|marketing|management|finance|product|strategy|sales|leadership|startup/, icon: 'trendingUp', bg: '#FDECEA', accent: '#B42318', alt: 'a business dashboard with a growth chart', Art: BusinessArt },
];
const DEFAULT_SCENE = { key: 'learning', icon: 'bookOpen', bg: '#FDE7E4', accent: '#B42318', alt: 'an open book', Art: LearningArt };

export function sceneFor(category = '', title = '') {
  const cat = category.toLowerCase();
  return SCENES.find((s) => s.test.test(cat)) || SCENES.find((s) => s.test.test(title.toLowerCase())) || DEFAULT_SCENE;
}
