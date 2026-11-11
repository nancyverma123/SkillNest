# SkillNest — Practical AI Learning Platform

SkillNest is a full-stack MERN learning platform. Students discover courses in generative AI, agentic AI, automation and analytics, enroll, and track their progress from a dashboard. Admins manage the catalogue, users and enrollments from an admin console with live statistics.

**Stack:** React 18 with server-side rendering (Vite SSR + Express) · React Router 6 · Node.js · Express 4 · MongoDB (Mongoose 8) · JWT · bcrypt · deployed on Railway

## Live links (fill in after deploying)
- App: [YOUR RAILWAY WEB URL]
- API health check: [YOUR RAILWAY API URL]/api/health

---

## 1. Features

**Learners**
- Register and log in (bcrypt-hashed passwords, JWT sessions), with inline validation, a password visibility toggle and loading states
- Browse the catalogue with search (title, instructor or topic), category and level filters, sorting (newest, price low→high, price high→low), live result count, Clear Filters, and filters kept in the URL
- Course detail pages with outcomes, curriculum, instructor and course facts; one-click enrollment
- Student dashboard: welcome header, enrolled / in-progress / completed counts, a real progress summary (completed ÷ enrolled — no invented percentages), Continue Learning, status filters, **Mark as completed** and **Unenroll** (with a confirmation dialog), and profile details

**Admins**
- Overview with totals (courses, users, enrollments, completed) and an **enrollments-per-course chart** (pure CSS, no chart library)
- Course management: search, add, edit and delete (delete asks for confirmation and shows how many enrollments will be removed)
- User management: search by name or email, filter by role, enrollment count per user
- Enrollment management: search by learner or course, filter by status

**Quality**
- Server-side rendering: public pages (home, course list, course detail) arrive as complete HTML with real course data, a per-page `<title>` and meta description, and a real 404 status for missing courses — then hydrate into the interactive app
- Global toast notifications (`aria-live`), skeleton loaders, empty and error states with retry
- WCAG-minded accessibility: skip link, visible focus rings, semantic landmarks, labelled form fields with linked error messages, `aria-current` navigation, keyboard-accessible dialogs with focus trapping and focus return, reduced-motion support, 44 px minimum touch targets, colour contrast ≥ 4.5:1
- Responsive from 360 px upwards; tables scroll inside their own container, never the page

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Axios |
| Web server (SSR) | Express 4 + Vite SSR (`client/server.js`), `compression` |
| Backend | Node.js (≥ 18), Express 4, Mongoose 8 |
| Database | MongoDB (Atlas in production) |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Security | `helmet`, `express-rate-limit`, request validation middleware |
| Testing | Node's built-in test runner, `mongodb-memory-server` (dev only) |

### Packages added in this upgrade

| Package | Type | Why |
|---|---|---|
| `helmet` | server dependency | Sets secure HTTP headers (`X-Content-Type-Options`, removes `X-Powered-By`, etc.) |
| `express-rate-limit` | server dependency | Limits login/register attempts per IP to slow password guessing and account spam |
| `mongodb-memory-server` | server **dev** dependency | Spins up a throwaway MongoDB 7 in memory so tests never touch a real database |

| `express` | client dependency | Runs the SSR web server that renders React pages to HTML |
| `compression` | client dependency | Gzips HTML, JS and CSS from the web server |

No UI libraries were added. Icons are an inline SVG set, and the chart uses CSS.

## 3. Folder structure

```
skillnest/
├── client/                      React frontend + SSR web server (Railway service "web")
│   ├── server.js                Express SSR server (dev: Vite middleware, prod: built bundles)
│   ├── railway.json             Railway build/deploy config for the web service
│   ├── index.html               HTML template with <!--app-html--> / <!--app-data--> slots
│   └── src/
│       ├── entry-client.jsx     Browser entry: hydrates the server HTML
│       ├── entry-server.jsx     SSR entry: loads route data, renders to HTML
│       ├── Root.jsx             Providers shared by both entries
│       ├── ssr/loaders.js       Server-side data loading for public pages
│       ├── App.jsx              Routes, skip link, focus management on navigation
│       ├── api.js               Axios instance, auth header, 401 handling, errMsg()
│       ├── AuthContext.jsx      Current user, login/register/logout
│       ├── styles.css           Design system: tokens, components, pages
│       ├── lib/                 services.js (all API calls), format.js, initialData.jsx (SSR data hand-off)
│       ├── hooks/               useDocumentTitle, useDebouncedValue
│       ├── components/          Reusable UI (Navbar, Footer, Sidebar, CourseCard, CourseGrid,
│       │   │                    SearchBar, FilterPanel, Toast, ConfirmModal, SkeletonLoader,
│       │   │                    EmptyState, StatusBadge, ProgressBar, StatCard, ResponsiveTable,
│       │   │                    BarChart, FormField, Icon, CourseVisual, …)
│       │   └── admin/           OverviewPanel, CoursesPanel, CourseForm, UsersPanel, EnrollmentsPanel
│       └── pages/               Home, About, Courses, CourseDetail, Auth, Dashboard, Admin
└── server/                      Express API (Railway service "api")
    ├── railway.json             Railway deploy config for the API service
    ├── server.js                App setup (helmet, CORS, JSON, routes, errors); exports app
    ├── config/db.js             MongoDB connection
    ├── middleware/              auth (protect/adminOnly), validate, rateLimit, error
    ├── models/                  User, Course, Enrollment
    ├── routes/                  auth, courses, enrollments, users, stats
    ├── data/sampleCourses.js    Sample catalogue (used by seed and content script)
    ├── scripts/addCourseContent.js  Safe, non-destructive content migration
    ├── seed.js                  DESTRUCTIVE fresh-database seed (guarded)
    └── tests/                   api.test.js (integration tests), memory-server.js (UI testing)
```

**Why this structure?** The web server and the API are separate Railway services from one repository, so each has its own `package.json`, environment and scaling. On the server, routes stay thin, while cross-cutting concerns (auth, validation, rate limiting, errors) live in middleware and are reused across routes. On the client, every HTTP call goes through `lib/services.js`, so pages never duplicate request logic. Small, presentational components in `components/` keep the pages readable and the design consistent.

## 4. Installation

Prerequisites: Node.js 18+ and a MongoDB connection string (for example a free MongoDB Atlas cluster).

```bash
git clone <your-repo-url> skillnest
cd skillnest
```

### Backend setup
```bash
cd server
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000/api/health
```

### Frontend setup (new terminal)
```bash
cd client
cp .env.example .env        # VITE_API_URL and API_URL = http://localhost:5000/api
npm install
npm run dev                 # SSR dev server with hot reload: http://localhost:5173
```

Production build of the web app:
```bash
npm run build               # dist/client (browser assets) + dist/server (SSR bundle)
npm start                   # production SSR server
```

## 5. Environment variables

**server/.env**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string used to sign tokens |
| `CLIENT_URL` | yes | Allowed CORS origin(s), comma-separated |
| `PORT` | no | Defaults to 5000 |
| `TRUST_PROXY` | no | Number of proxies in front of the API (default 1, correct for Railway). Set 0 when running directly |
| `AUTH_RATE_LIMIT_MAX` | no | Login/register attempts per IP per 15 minutes (default 20) |

**client/.env**

| Variable | When | Description |
|---|---|---|
| `VITE_API_URL` | build time | API URL used **by the browser** (must be the API's public URL), e.g. `http://localhost:5000/api` |
| `API_URL` | runtime | API URL used **by the SSR server** to pre-load page data. On Railway use the private network URL. Defaults to `VITE_API_URL` |
| `PORT` | runtime | Web server port (Railway sets it; defaults to 5173) |

Never commit `.env` files. Both are already in `.gitignore`.

## 6. Database seeding and safe content migration

There are two scripts. Use the right one:

| Command | What it does | Safe on an existing database? |
|---|---|---|
| `npm run seed:reset` | **Deletes all users, courses and enrollments**, then inserts the sample catalogue and two test accounts | ❌ No. Only for new or disposable databases |
| `npm run content:preview` | Dry run: lists which existing courses (matched by exact title) would get sample `outcomes`/`curriculum` | ✅ Read-only |
| `npm run content:apply` | Writes a JSON backup to `server/backups/`, then fills `outcomes`/`curriculum` **only where they are empty** | ✅ Never deletes or overwrites |

`npm run seed` on its own now refuses to run and explains these options, so a database can't be wiped by accident.

**Adding course content to an existing database safely**
1. `cd server && npm run content:preview` and review the list.
2. `npm run content:apply`. The script prints the backup file path.
3. To undo: `node scripts/addCourseContent.js --restore backups/<file>.json`

`outcomes` and `curriculum` are optional, so courses without them still work. The detail page then shows the description and a "curriculum coming soon" note instead of invented content. Admins can also edit these fields in the course form, one item per line.

## 7. API documentation

Base URL: `/api`. All error responses use the same shape: `{ "message": "Clear error description" }`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public · rate-limited | Create a student account |
| POST | `/auth/login` | Public · rate-limited | Log in, returns JWT |
| GET | `/auth/me` | Logged in | Current user |
| GET | `/courses?search=&category=&level=&sort=` | Public | List courses. `sort`: `newest` (default), `price_asc`, `price_desc` |
| GET | `/courses/categories` | Public | Categories with course counts |
| GET | `/courses/:id` | Public | Course details |
| POST | `/courses` | Admin | Create course |
| PUT | `/courses/:id` | Admin | Update course (partial) |
| DELETE | `/courses/:id` | Admin | Delete course and its enrollments |
| POST | `/enrollments` | Logged in | Enroll in a course |
| GET | `/enrollments/my-courses` | Logged in | Caller's enrollments (with course) |
| PATCH | `/enrollments/:id` | Owner only | Mark completed (`{ "status": "completed" }`, the default) or reopen (`"active"`) |
| DELETE | `/enrollments/:id` | Owner only | Unenroll |
| GET | `/enrollments` | Admin | All enrollments (with user and course) |
| GET | `/users` | Admin | All users (passwords never returned) |
| GET | `/stats` | Admin | Totals and enrollments per course |

**Status codes:** `200` OK · `201` created · `400` invalid input or malformed JSON · `401` missing, invalid or expired token · `403` authenticated but not allowed (not admin, or not the enrollment owner) · `404` not found (malformed ids are treated as not found) · `409` duplicate email or duplicate enrollment · `413` body too large · `429` too many login/register attempts · `500` unexpected server error.

### Request and response examples

**Register**: `POST /api/auth/register`
```json
{ "name": "Priya Sharma", "email": "priya@example.com", "password": "secret123" }
```
`201 Created`
```json
{ "token": "<jwt>", "user": { "_id": "665f…", "name": "Priya Sharma", "email": "priya@example.com", "role": "student", "createdAt": "2026-11-10T09:00:00.000Z" } }
```

**List courses**: `GET /api/courses?search=ai&level=Beginner&sort=price_asc`
```json
[ { "_id": "665f…", "title": "Automate Work with No-Code AI", "category": "AI Automation", "level": "Beginner", "price": 699, "duration": "2 days", "instructor": "Ishita Rao", "description": "…", "outcomes": ["…"], "curriculum": ["…"], "thumbnail": "", "createdAt": "…", "updatedAt": "…" } ]
```

**Create course (admin)**: `POST /api/courses` with `Authorization: Bearer <admin token>`
```json
{ "title": "Prompt Engineering Lab", "description": "Hands-on prompt practice.", "instructor": "Dev Malhotra", "category": "Generative AI", "duration": "3 weeks", "level": "Intermediate", "price": 1799, "outcomes": ["Write reliable prompts"], "curriculum": ["Prompt patterns", "Testing prompts"] }
```
Unknown fields (`_id`, `role`, timestamps…) are stripped. Validation failure returns `400 { "message": "Price must be a number between 0 and 1,000,000" }`.

**Mark enrollment completed**: `PATCH /api/enrollments/:id`
```json
{ "status": "completed" }
```
`200 OK` returns the updated enrollment with `completedAt` and the populated `course`. Another user's enrollment returns `403 { "message": "You can only change your own enrollments" }`.

**Unenroll**: `DELETE /api/enrollments/:id` returns `200 { "message": "You have been unenrolled from this course", "id": "665f…" }`

**Admin statistics**: `GET /api/stats`
```json
{
  "totalCourses": 6, "totalUsers": 3, "totalEnrollments": 4,
  "enrollmentsByStatus": { "active": 3, "completed": 1 },
  "enrollmentsPerCourse": [ { "courseId": "665f…", "title": "Generative AI Foundations", "count": 2 } ]
}
```

A complete **Postman collection** is in [`SkillNest.postman_collection.json`](SkillNest.postman_collection.json). Import it, set the `baseUrl` variable, then run **Login (admin)** and **Login (student)**. The test scripts store the tokens automatically.

## 8. Authentication and authorization

- **Why JWT?** The API is stateless and deployed separately from the frontend (different domains). A signed JWT lets any API instance verify a request without server-side session storage or cross-site cookies. Tokens contain only the user id, are signed with `JWT_SECRET`, and expire after 7 days.
- **Passwords** are hashed with bcrypt (cost 10) and excluded from every query by default (`select: false`).
- **Roles:** registration always creates a `student`. The role is never read from the request body. `adminOnly` returns `403` for non-admins, and enrollment `PATCH`/`DELETE` check that the enrollment belongs to the caller, also returning `403` otherwise (even for admins).
- **Client storage:** the token is kept in `localStorage` and sent as a `Bearer` header. It is never rendered in the UI. This is simple and works across domains, but it is readable by JavaScript, so the app avoids rendering untrusted HTML. A stricter alternative would be an `httpOnly` cookie with CSRF protection. When the API returns `401`, the client clears the token and signs the user out.
- **Why is the admin account seeded?** Allowing anyone to register as an admin would be a privilege-escalation hole. Instead the first admin is created by the seed script (or directly in the database by the owner), and all public sign-ups are students.
- **Hardening:** `helmet` security headers, rate limiting on login and register, a 100 kB JSON body limit, whitelisted and validated input, and query parameters that must be plain strings (blocks `?category[$ne]=` style operator injection).

## 9. Design decisions

- **Enrollment uniqueness** is enforced by a unique compound index on `{ user, course }` in MongoDB, not just by an application check. This guarantees there are no duplicates even under concurrent requests (a double-click or two tabs). The duplicate-key error is translated into a friendly `409`.
- **Design system:** colour, type, spacing, radius and shadow tokens live as CSS variables in `styles.css`. The brand palette is primary `#D93526`, secondary `#F97316`, page `#FEF6F6`, ink `#0F172A`, and Poppins type. Cards use hairline borders and soft shadows; dark feature panels, mono labels and a serif-italic accent word add hierarchy.
- **Contrast-driven choices:** white text on the orange CTA gradient measures only 2.8:1, so gradient buttons use ink text (4.9–6.4:1). Small red text uses `#B42318` (6.2:1 on the page background). `#D93526` is kept for accents and borders.
- **Honest content:** progress is calculated from real enrollment status, sample testimonials are labelled as samples, and courses without published outcomes or curriculum say so rather than showing filler.
- **Course imagery:** seeded courses used random placeholder photos. These are replaced with category illustrations generated in SVG. Admin-provided image URLs still display, and they fall back to the illustration if the image fails to load.
- **Server-side rendering:** the SSR server fetches public data (courses, categories, course detail) over Railway's private network and embeds it as `window.__INITIAL_DATA__` (escaped against `</script>` injection) so the browser hydrates without re-fetching or flicker. If the API is slow (4 s timeout) the page still renders and the browser loads the data itself; if rendering fails entirely the server sends the client-rendered shell, so the site stays up. Because the JWT lives in `localStorage` (unchanged auth behaviour), the server cannot see who is logged in: account-specific pages render a "checking session" state on the server and complete in the browser.
- **No extra state library:** React context covers auth and toasts. All other state is local to the page that owns it.

## 10. Testing

```bash
cd server
npm test
```
The suite (32 integration tests) starts a temporary **in-memory MongoDB 7** with `mongodb-memory-server`, runs every API scenario, and stops the database afterwards, including when tests fail. It never reads `MONGO_URI` and refuses to run against anything except a local database whose name contains `test`. The first run downloads the MongoDB binary (~70 MB) from MongoDB's official CDN and caches it.

To click through the UI without touching your real database:
```bash
cd server && npm run dev:memory                     # API on :5055, sample data, in memory
cd client && VITE_API_URL=http://localhost:5055/api API_URL=http://localhost:5055/api PORT=5174 npm run dev
```
(On Windows PowerShell: `$env:VITE_API_URL="http://localhost:5055/api"; $env:API_URL=$env:VITE_API_URL; $env:PORT="5174"; npm run dev`)

## 11. Test credentials

These accounts exist only in databases created with `npm run seed:reset` or `npm run dev:memory`. They are demo credentials, not production secrets. **Change or remove them in any real deployment.**

| Role | Email | Password |
|---|---|---|
| Admin | admin@skillnest.com | Admin@123 |
| Student | student@skillnest.com | Student@123 |

## 12. Deployment (Railway)

Deploy the repository as **two services in one Railway project**. Each service builds only its own folder.

| | Service `api` | Service `web` |
|---|---|---|
| Settings → Source → Root Directory | `/server` | `/client` |
| Settings → Config-as-code file path | `/server/railway.json` | `/client/railway.json` |
| Build | `npm install` (auto) | `npm run build` (from `railway.json`) |
| Start | `npm start` | `npm start` (production SSR) |
| Health check | `/api/health` | `/health` |
| Public domain | Generate one (the browser calls it) | Generate one (your site URL) |

Railway does not read `railway.json` from the root directory automatically, so set the config file path in each service's settings.

**Variables — `api` service**

| Variable | Value |
|---|---|
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | a long random value |
| `CLIENT_URL` | `https://${{web.RAILWAY_PUBLIC_DOMAIN}}` (plus any custom domain, comma-separated) |
| `PORT` | `5000` (lets the web service reference it) |
| `TRUST_PROXY` | `1` |

**Variables — `web` service**

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api` — used by browsers, baked in at build time |
| `API_URL` | `http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}/api` — SSR data loading over the private network |

Notes:
- `VITE_API_URL` is read at **build** time; after changing it, redeploy the `web` service.
- In MongoDB Atlas → Network Access, allow connections from Railway (Railway's static outbound IPs, if enabled, or `0.0.0.0/0` with a strong database password).
- Verify with `https://<api-domain>/api/health` and by viewing the page source of `https://<web-domain>/courses` — the course titles should be in the HTML.
- Never run `npm run seed:reset` against the production database.

## 13. Manual test checklist

- [ ] Register (validation messages, success toast, lands on dashboard)
- [ ] Login (wrong password shows an error; password toggle works)
- [ ] Role-based redirects (admin → `/admin`, student → `/dashboard`, student visiting `/admin` → `/dashboard`, logged-out user visiting `/dashboard` → login)
- [ ] Course search (title, instructor, topic)
- [ ] Category and level filters
- [ ] Sorting (newest, price ↑, price ↓)
- [ ] Enrollment from the course page
- [ ] Duplicate enrollment blocked (409)
- [ ] Mark completed (counts and progress update)
- [ ] Unenroll (confirmation dialog; Escape cancels)
- [ ] Admin CRUD (add with validation, edit, delete with confirmation)
- [ ] Admin statistics and chart match the data
- [ ] Student blocked from admin APIs (403)
- [ ] Mobile layout (360 px / 390 px: menu button, no sideways page scroll)
- [ ] Keyboard-only navigation (skip link, visible focus, dialogs trap focus)
- [ ] Existing features still work
