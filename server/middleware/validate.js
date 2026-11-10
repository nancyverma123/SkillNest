// Request validation. Each validator replaces req.body with a cleaned, whitelisted copy
// so unexpected fields (e.g. role, _id) never reach the database.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const isStr = (v) => typeof v === 'string';
const isId = (v) => isStr(v) && /^[a-f\d]{24}$/i.test(v);
const bad = (res, message) => res.status(400).json({ message });

exports.LEVELS = LEVELS;
exports.isStr = isStr;
exports.isId = isId;

// Malformed ids can't match a document, so they are reported the same way as missing ones.
exports.validId = (label) => (req, res, next) =>
  isId(req.params.id) ? next() : res.status(404).json({ message: `${label} not found` });

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (!isStr(name) || name.trim().length < 2 || name.trim().length > 60) return bad(res, 'Name must be between 2 and 60 characters');
  if (!isStr(email) || !EMAIL_RE.test(email.trim())) return bad(res, 'A valid email address is required');
  if (!isStr(password) || password.length < 6 || password.length > 128) return bad(res, 'Password must be between 6 and 128 characters');
  req.body = { name: name.trim(), email: email.trim().toLowerCase(), password };
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!isStr(email) || !email.trim() || !isStr(password) || !password) return bad(res, 'Email and password are required');
  req.body = { email: email.trim().toLowerCase(), password };
  next();
};

const TEXT_FIELDS = { title: ['Title', 120], description: ['Description', 2000], instructor: ['Instructor', 80], category: ['Category', 60], duration: ['Duration', 40] };
const LIST_FIELDS = { outcomes: 'Outcomes', curriculum: 'Curriculum' };
const MAX_ITEMS = 15;
const MAX_ITEM_LENGTH = 200;

// partial = true for updates (PUT): only provided fields are validated and applied.
exports.validateCourse = (partial) => (req, res, next) => {
  const b = req.body || {};
  const out = {};

  for (const [key, [label, max]] of Object.entries(TEXT_FIELDS)) {
    if (b[key] === undefined) {
      if (!partial) return bad(res, `${label} is required`);
      continue;
    }
    if (!isStr(b[key]) || !b[key].trim()) return bad(res, `${label} is required`);
    if (b[key].trim().length > max) return bad(res, `${label} must be ${max} characters or fewer`);
    out[key] = b[key].trim();
  }

  if (b.price !== undefined || !partial) {
    const numeric = typeof b.price === 'number' || (isStr(b.price) && b.price.trim() !== '');
    const price = Number(b.price);
    if (!numeric || !Number.isFinite(price) || price < 0 || price > 1000000) return bad(res, 'Price must be a number between 0 and 1,000,000');
    out.price = Math.round(price * 100) / 100;
  }

  if (b.level !== undefined) {
    if (!LEVELS.includes(b.level)) return bad(res, `Level must be one of: ${LEVELS.join(', ')}`);
    out.level = b.level;
  }

  if (b.thumbnail !== undefined) {
    if (!isStr(b.thumbnail)) return bad(res, 'Thumbnail must be a URL');
    const t = b.thumbnail.trim();
    if (t && !/^https?:\/\/\S+$/i.test(t)) return bad(res, 'Thumbnail must be an http(s) URL or left empty');
    out.thumbnail = t;
  }

  for (const [key, label] of Object.entries(LIST_FIELDS)) {
    if (b[key] === undefined) continue;
    if (!Array.isArray(b[key]) || b[key].some((x) => !isStr(x))) return bad(res, `${label} must be a list of text items`);
    const items = b[key].map((x) => x.trim()).filter(Boolean);
    if (items.length > MAX_ITEMS) return bad(res, `${label} can have at most ${MAX_ITEMS} items`);
    if (items.some((x) => x.length > MAX_ITEM_LENGTH)) return bad(res, `Each ${label.toLowerCase()} item must be ${MAX_ITEM_LENGTH} characters or fewer`);
    out[key] = items;
  }

  if (partial && Object.keys(out).length === 0) return bad(res, 'No valid course fields were provided');
  req.body = out;
  next();
};
