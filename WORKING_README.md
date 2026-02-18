# WORKING_README

## Overview
This application is a real-time AI assistant built with Next.js (React) for the frontend, Node.js/Next.js API routes for the backend, and integrates with OpenAI's Realtime API (GPT-4o-mini) for conversational and vision AI features. It can run as a web app or as a desktop app via Electron.

---

## Frontend
- **Framework:** Next.js (React)
- **Location:** `src/app/`
- **Features:**
  - Modern, responsive UI with Tailwind CSS
  - Real-time chat interface
  - Voice input and transcription
  - Agent handoff and content moderation
  - Runs in browser or as an Electron desktop app

### Key Files
- `src/app/components/` — React UI components
- `src/app/agentConfigs/` — AI agent configuration and guardrails
- `src/app/hooks/` — Custom React hooks for audio, session, etc.
- `src/app/page.tsx` — Main page entry

---

## Backend
- **Framework:** Next.js API routes (Node.js)
- **Location:** `src/app/api/`
- **Features:**
  - Proxies requests to OpenAI's Realtime API and Vision API
  - Handles session management and content moderation
  - Exposes endpoints for chat, vision, and session

### Key Endpoints
- `src/app/api/session/route.ts` — Creates and manages OpenAI Realtime sessions
- `src/app/api/responses/route.ts` — Handles chat completions and structured responses
- `src/app/api/vision/route.ts` — Handles image-based (vision) queries

---

## OpenAI Realtime System
- **Integration:**
  - Uses OpenAI's GPT-4o-mini-realtime-preview for chat and vision
  - Requires an OpenAI API key (set in `.env` or `.env.local`)
  - Session and message requests are proxied through backend API routes
- **Agent Configuration:**
  - See `src/app/agentConfigs/generalAI.ts` for main agent logic
  - Guardrails in `src/app/agentConfigs/guardrails.ts`

---

## Running Locally
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `env.sample` to `.env` or `.env.local`
   - Add your OpenAI API key
3. **Start in development mode:**
   ```bash
   npm run dev
   # or for Electron desktop:
   npm run electron-dev
   ```
4. **Build and run in production:**
   ```bash
   npm run build
   npm start
   # or for Electron desktop:
   npm run electron
   ```

---

## Running the Backend in the Cloud
The backend is a Next.js server (Node.js) and can be deployed to any platform that supports Node.js/Next.js. Here are common options:

### 1. **Vercel (Recommended)**
- **Steps:**
  1. Push your code to a GitHub/GitLab/Bitbucket repository
  2. Go to [Vercel](https://vercel.com/) and import your repo
  3. Set environment variables (`OPENAI_API_KEY`, etc.) in the Vercel dashboard
  4. Deploy — Vercel will handle builds and hosting
- **API routes** will be serverless functions

### 2. **Netlify**
- Build with `npm run build`
- Deploy the `out` directory (for static export) or use Netlify Functions for API routes

### 3. **Railway, Render, or Other Node Hosts**
- Deploy as a Node.js app
- Set environment variables in the dashboard
- Use `npm run build && npm start` as the start command

### 4. **Docker**
- (If you want to use Docker, create a `Dockerfile` and deploy to any container host)

---

## Environment Variables
- `OPENAI_API_KEY` — Your OpenAI API key (required)
- `NODE_ENV` — Set to `production` in cloud

---

## Notes
- **API routes** require a running backend (not available in static export)
- **Electron app** can be built for distribution using `npm run electron-build`
- For troubleshooting, see `README.md` and `SETUP.md`

---

For more details, see the main `README.md` and `ELECTRON_README.md` files. 