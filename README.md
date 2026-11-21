# AI StudyMate

An AI-powered study companion for students. Generate study plans, summarize notes, create quizzes, chat with a Socratic tutor, and track tasks, schedules and progress, with offline-first data and cloud sync.

## Features

- **AI Study Plan Generator**: day-by-day plans from your subjects, exam date, daily hours and weak areas (Gemini, structured JSON output)
- **Note Summarizer**: summaries, key concepts, review points and likely exam questions from Markdown notes
- **Quiz Generator**: multiple-choice quizzes with explanations and hints, generated from a topic or your own notes
- **AI Tutor**: Socratic chat assistant aware of your current subject and topic
- **Subjects, Tasks, Notes and Scheduler** with search, tags, priorities and deadlines
- **Focus Timer** (Pomodoro-style) that logs study sessions
- **Analytics Dashboard** for study time, quiz performance and progress
- **Offline-first**: data is stored locally and synced to the server when online (with sync-status indicator and cross-tab updates)
- **Auth**: register/login with bcrypt-hashed passwords and signed JWTs

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Motion, react-markdown |
| Backend | Node.js, Express, TypeScript (tsx / esbuild) |
| AI | Google Gemini via `@google/genai` |
| Auth & security | bcryptjs, jsonwebtoken, helmet, express-rate-limit |
| Storage | Local-first (browser localStorage) + JSON document store on the server |
| DevOps | Dockerfile (multi-stage build) |

## Getting Started

**Prerequisites:** Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env        # then fill in GEMINI_API_KEY and JWT_SECRET
npm run dev                 # http://localhost:3000
```

Click **Use demo account** to explore without registering (demo data stays in your browser).

### Production

```bash
npm run build
NODE_ENV=production npm start
```

### Docker

```bash
docker build -t ai-studymate .
docker run -p 3000:3000 --env-file .env -v studymate-data:/app ai-studymate
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | For AI features | Gemini API key |
| `JWT_SECRET` | In production | Secret used to sign tokens (`openssl rand -hex 32`) |
| `GEMINI_MODEL` | No | Override the Gemini model |
| `PORT` | No | Server port (default 3000) |

## API Overview

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | - | Create account |
| POST | `/api/auth/login` | - | Log in, receive JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/sync/pull` | JWT | Fetch the user's data |
| POST | `/api/sync/push` | JWT | Save the user's data |
| POST | `/api/ai/study-plan` | - (rate-limited) | Generate study plan |
| POST | `/api/ai/summarize` | - (rate-limited) | Summarize notes |
| POST | `/api/ai/quiz` | - (rate-limited) | Generate quiz |
| POST | `/api/ai/tutor` | - (rate-limited) | Tutor chat |
| GET | `/api/health` | - | Health check |

## Security Notes

- Passwords are hashed with bcrypt; tokens are signed JWTs (7-day expiry)
- Sync endpoints identify the user **only** from the verified token, never from client-supplied IDs
- Auth and AI endpoints are rate-limited; `helmet` sets secure headers
- The server refuses to start in production without `JWT_SECRET`
- The Gemini key stays server-side and is never sent to the browser

## Project Structure

```
server.ts            Express API, auth, sync, Gemini endpoints, static/Vite serving
src/
  App.tsx            App shell and navigation
  components/        Dashboard, Notes, Tasks, Scheduler, Quiz, Study Plan, Tutor, Analytics...
  services/api.ts    Client API layer: auth, offline storage, sync engine, AI calls
  types.ts           Shared types
```

## Roadmap

- Swap the JSON store for MongoDB/PostgreSQL
- Per-record conflict resolution in sync (currently last-write-wins per user)
- Automated tests and CI

## License

MIT
