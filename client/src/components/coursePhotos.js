// Topic-matched course photographs (Unsplash, free to use under the Unsplash License; served from
// Unsplash's image CDN as their guidelines recommend). Each photo was checked to show its topic.
// Topics are matched against "title + category", most specific first, so "React for Beginners"
// gets a React photo even when its category is just "Development".
const P = (id, alt) => ({ id, alt });

const TOPICS = [
  { key: 'excel', test: /excel|spreadsheet|google sheets/, photos: [
    P('1554224155-6726b3ff858f', 'Printed financial spreadsheets and charts on a desk'),
    P('1543286386-713bdd548da4', 'Hand-drawn chart on paper with a ruler and pen'),
    P('1460925895917-afdab827c52f', 'Laptop showing business charts and graphs'),
  ] },
  { key: 'sql', test: /\bsql\b|database|mongo|postgres|mysql|data engineering/, photos: [
    P('1544383835-bda2bc66a55d', 'Rows of labelled filing drawers, like database records'),
    P('1558494949-ef010cbdcc31', 'Server racks in a data centre'),
  ] },
  { key: 'python', test: /python|django|flask|pandas/, photos: [
    P('1526379095098-d400fd0bf935', 'Developer holding a sticky note that says Python'),
    P('1461749280684-dccba630e2f6', 'Colourful source code on a monitor'),
  ] },
  { key: 'react', test: /react|front.?end|javascript|typescript|web dev|\bhtml\b|\bcss\b|next\.?js/, photos: [
    P('1633356122544-f134324a6cee', 'React logo next to code on a screen'),
    P('1555066931-4365d14bab8c', 'Laptop screen showing web application code'),
    P('1517694712202-14dd9538aa97', 'Laptop with a code editor open on a desk'),
  ] },
  { key: 'design', test: /design|\bui\b|\bux\b|figma|graphic|brand|illustrat|typograph/, photos: [
    P('1586717791821-3f44a563fa4c', 'Designer sketching app wireframes on a tablet'),
    P('1581291518857-4e27b48ff24e', 'Hand drawing user interface wireframes on paper'),
    P('1561070791-2526d30994b5', 'Colour swatches and design samples spread on a table'),
    P('1609921212029-bb5a28e60960', 'Monitor displaying mobile app interface designs'),
    P('1545235617-9465d2a55698', 'Phone showing an app interface in front of a laptop'),
  ] },
  { key: 'automation', test: /agent|automat|workflow|no-?code|zapier|\brpa\b/, photos: [
    P('1563986768609-322da13575f3', 'Person working across a laptop and smartphone'),
    P('1535378620166-273708d44e4c', 'Humanoid robot standing in a dark room'),
    P('1531746790731-6c087fecd65a', 'Close-up of a white robotic hand'),
    P('1518432031352-d6fc5c10da5a', 'Terminal window running an automated script'),
  ] },
  { key: 'ml', test: /machine learning|\bml\b|deep learning|neural|data science|computer vision/, photos: [
    P('1655720828018-edd2daec9349', 'Abstract network of glowing connected nodes'),
    P('1550751827-4bd374c3f58b', 'Glowing circuit-board pattern'),
    P('1620712943543-bcc4688e7485', 'Small robot sitting on a bench reading'),
  ] },
  { key: 'ai', test: /\bai\b|artificial|generative|prompt|\bllm|gpt|chatbot|\bnlp\b/, photos: [
    P('1677442136019-21780ecad995', 'Three-dimensional letters spelling AI'),
    P('1684369175833-4b445ad6bfb5', 'Friendly robot working on a laptop'),
    P('1485827404703-89b55fcc595e', 'White humanoid robot looking at the camera'),
    P('1655720828018-edd2daec9349', 'Abstract network of glowing connected nodes'),
  ] },
  { key: 'data', test: /data|analytic|dashboard|power ?bi|tableau|statistic|insight|visuali[sz]/, photos: [
    P('1551288049-bebda4e38f71', 'Analytics dashboard with charts on a laptop screen'),
    P('1460925895917-afdab827c52f', 'Laptop showing business charts and graphs'),
    P('1504868584819-f8e8b4b6d7e3', 'Laptop displaying a data dashboard'),
  ] },
  { key: 'cloud', test: /cloud|devops|aws|azure|cyber|security|network|linux/, photos: [
    P('1451187580459-43490279c0fa', 'Planet Earth at night with glowing network lights'),
    P('1550751827-4bd374c3f58b', 'Glowing circuit-board pattern'),
    P('1558494949-ef010cbdcc31', 'Server racks in a data centre'),
  ] },
  { key: 'code', test: /develop|program|coding|\bcode|software|back.?end|node|full.?stack|\bjava\b|\bapp\b|\bapi\b|git/, photos: [
    P('1498050108023-c5249f4df085', 'Laptop with code on screen beside a coffee cup'),
    P('1587620962725-abab7fe55159', 'Laptop with a code editor on a minimal desk'),
    P('1515879218367-8466d910aaa4', 'Close-up of source code on a monitor'),
    P('1461749280684-dccba630e2f6', 'Colourful source code on a monitor'),
  ] },
  { key: 'business', test: /business|marketing|management|finance|product|strategy|sales|leadership|startup|entrepreneur/, photos: [
    P('1552664730-d307ca884978', 'Team planning with sticky notes on a wall'),
    P('1454165804606-c3d57bc86b40', 'Business reports and a laptop on a meeting table'),
    P('1542744173-8e7e53415bb0', 'Colleagues discussing in a meeting room'),
    P('1557804506-669a67965ba0', 'Team meeting around a table in a bright office'),
  ] },
  { key: 'speaking', test: /speak|communicat|presentation|soft skill|interview|career/, photos: [
    P('1475721027785-f74eccf877e2', 'Microphone in front of a conference audience'),
    P('1544531586-fde5298cdd40', 'Speaker addressing a large audience'),
    P('1540575467063-178a50c2df87', 'Audience seated at a conference talk'),
  ] },
];

const LEARNING = [
  P('1522202176988-66273c2fd55f', 'Students studying together with laptops'),
  P('1501504905252-473c47e087f8', 'Laptop, notebook and coffee on a study desk'),
  P('1513258496099-48168024aec0', 'Student learning on a laptop'),
  P('1523240795612-9a054b0db644', 'Group of learners collaborating at a table'),
  P('1434030216411-0b793f4b4173', 'Person writing notes in a notebook'),
];

const url = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round((w * 9) / 16)}&fit=crop&auto=format&q=70`;

// Each topic lists its most representative photo first. `taken` (optional Set of photo ids)
// lets a list give each course a different photo: the next unused one in its topic.
export function photoForCourse(course, taken) {
  const text = `${course.title || ''} ${course.category || ''}`.toLowerCase();
  const topic = TOPICS.find((t) => t.test.test(text));
  const pool = topic ? topic.photos : LEARNING;
  let photo = pool[0];
  if (taken) {
    photo = pool.find((p) => !taken.has(p.id)) || pool[taken.size % pool.length];
    taken.add(photo.id);
  }
  return {
    alt: photo.alt,
    src: url(photo.id, 800),
    srcSet: [480, 800, 1200].map((w) => `${url(photo.id, w)} ${w}w`).join(', '),
  };
}

// Photo per course id for a whole list, with no repeats where the topic pools allow it.
// Deterministic (same input order → same result), so server and browser renders match.
export function assignPhotos(courses) {
  const taken = new Set();
  return Object.fromEntries(courses.map((c) => [c._id, photoForCourse(c, taken)]));
}
