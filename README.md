# LegalBell — Fullstack Starter

This repository contains a ready-to-run **fullstack** starter for the LegalBell platform.

## Structure
- `backend/` — Express.js REST API (mock DB using JSON file)
- `frontend/` — React (Vite) single-page app (components from your provided UI)

## Quick start

### Backend
```bash
cd backend
npm install
npm run start
```
Backend runs on http://localhost:4000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173 (Vite default). It proxies API calls to the backend.

## Notes
- The backend uses a simple JSON file as storage (`backend/db.json`). It's for development/testing only.
- Authentication is mocked (no passwords stored securely). For production, integrate real auth (JWT, bcrypt, database).
- Payment is simulated — "Confirm & Pay" records a booking only.
- This starter fixes issues in the code you shared and wires it to the backend API.
- If you need a production-ready deployable (Dockerfiles, real DB), tell me and I can prepare that next.

Enjoy — Shine / Sayan! 🚀
