# School Management System — Frontend

React + Vite dashboard for the School Management System.

## Requirements
- Node.js 18 or newer
- The Spring Boot backend running on `http://localhost:8080`

## Run in VS Code
```bash
npm install
cp .env.example .env
npm run dev
```
On Windows PowerShell, if `cp` is not recognized, use:
```powershell
Copy-Item .env.example .env
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## Included
- Responsive dashboard UI
- Admin / Teacher / Student role selector for the starter demo
- Student list with add and delete actions
- Teacher list
- Attendance and marks views (starter views)
- Announcements view
- Axios API service configured with `VITE_API_BASE_URL`

## Important
This is a starter project. The role selector is for UI demonstration and is not a substitute for backend authentication/authorization. Before production use, add authenticated sessions/JWT, server-side role checks, and validation.
