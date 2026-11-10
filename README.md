# SkillNest – Mini Product Platform

A learning platform where students discover short courses and workshops, enroll, and track them in a dashboard. Admins manage courses, users and enrollments.

**Stack:** React (Vite) + React Router · Node.js + Express · MongoDB (Mongoose) · JWT + bcrypt

## Live links (fill in after deploying)
- MERN app: [YOUR VERCEL URL]
- API: [YOUR RENDER URL]/api/health
- WordPress site: [YOUR HOSTINGER URL]
- Figma / design: [LINK]

## Test credentials (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@skillnest.com | Admin@123 |
| Student | student@skillnest.com | Student@123 |

> The backend is on a free tier and may take ~30-50 seconds to wake up on the first request.

## Run locally
```bash
# 1) Backend
cd server
cp .env.example .env     # fill MONGO_URI and JWT_SECRET
npm install
npm run seed             # sample courses + admin + student
npm run dev              # http://localhost:5000

# 2) Frontend (new terminal)
cd client
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

## Features
- Register / login with bcrypt-hashed passwords and JWT; logout
- Role-based access (student / admin); admin cannot be created via registration (seeded)
- Course listing from MongoDB with search and category filter, course details, enroll
- Duplicate enrollment blocked by a unique index (user + course)
- Student dashboard: profile and enrolled courses with status
- Admin dashboard: add / edit / delete courses, view users and enrollments

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Logged in |
| GET | /api/courses?search=&category= | Public |
| GET | /api/courses/:id | Public |
| POST | /api/courses | Admin |
| PUT | /api/courses/:id | Admin |
| DELETE | /api/courses/:id | Admin |
| POST | /api/enrollments | Logged in |
| GET | /api/enrollments/my-courses | Logged in |
| GET | /api/enrollments | Admin |
| GET | /api/users | Admin |

## Project structure
```
server/  config/ models/ middleware/ routes/ seed.js server.js
client/  src/{components,pages,AuthContext.jsx,api.js,App.jsx}
```

## Deployment
- **Database:** MongoDB Atlas (allow 0.0.0.0/0, copy connection string)
- **Backend (Render):** root `server`, build `npm install`, start `npm start`; env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL). Run `npm run seed` once against the live DB.
- **Frontend (Vercel):** root `client`, env var `VITE_API_URL=<render-url>/api`. `vercel.json` handles React Router refresh.
