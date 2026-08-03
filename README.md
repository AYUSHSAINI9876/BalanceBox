# BalanceBox

BalanceBox simplifies expense sharing across trips and friends. Create trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard. With real-time balances and clear charts, BalanceBox keeps everyone fair and stress-free so you can focus on making memories.

---

## 🚀 Tech Stack

- **Frontend:** React 19 + Vite, React Router 7, Recharts
- **Backend:** Node.js, Express 5, MongoDB (Mongoose) on MongoDB Atlas
- **Security:** JWT auth, bcrypt password hashing, Helmet, CORS allow-list, rate limiting, server-side validation
- **Deployment:** Frontend on Vercel, Backend on Render

---

## ⚙️ Configuration

Both apps are configured entirely through environment variables. Copy the example
files and fill in real values — never commit the filled-in versions.

### Backend (`backend-main/.env`)

```bash
cp backend-main/.env.example backend-main/.env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | **Yes** | MongoDB connection string. Server exits on boot if missing. |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs. Server exits on boot if missing. |
| `PORT` | No | Defaults to `5000`. Render sets this automatically. |
| `NODE_ENV` | No | `production` hides raw error messages from API responses. |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allow-list. **Must include your Vercel URL in production.** |

### Frontend (`frontend-main/.env.local`)

```bash
cp frontend-main/.env.example frontend-main/.env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | **Yes in production** | Base URL of the backend API, no trailing slash. Falls back to `http://localhost:5000`. |

> ⚠️ Vite inlines `VITE_API_URL` at **build** time. After changing it in Vercel you
> must trigger a redeploy for the change to take effect.

---

## 🧑‍💻 Running Locally

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend-main
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend-main
npm install
npm run dev
```

Health check: <http://localhost:5000/health>

---

## ☁️ Deployment

### Backend → Render

1. New **Web Service**, root directory `backend-main`.
2. Build command `npm install`, start command `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`,
   and `ALLOWED_ORIGINS=https://<your-app>.vercel.app`.
4. In MongoDB Atlas, allow Render's outbound IPs (or `0.0.0.0/0`) under Network Access.

### Frontend → Vercel

1. Import the repo and set **Root Directory** to `frontend-main`.
2. Framework preset: Vite (build `npm run build`, output `dist`).
3. Environment variable `VITE_API_URL=https://<your-backend>.onrender.com` for
   **Production and Preview**.
4. Deploy. `vercel.json` already rewrites all paths to `index.html` so client-side
   routes deep-link correctly.

---

## ✨ Features

### ✅ User Authentication
Register and log in with JWT-based auth. Passwords are bcrypt-hashed and never
returned by the API. Protected routes redirect to login when the token is missing
or expired, and send you back to your original destination after signing in.
Login and registration are rate limited against brute force.

### 🧳 Trips Management
Create trips from the usernames of registered users. Unknown usernames are
reported by name so you know exactly which one to fix.

### 💸 Expenses Tracking
Add, edit, and delete expenses per trip with categories, multiple payers, and
automatic split calculation. Amounts are validated on both client and server, with
floating-point tolerance so splits like ₹100 ÷ 3 are accepted.

### 📊 Charts & Insights
- Category-wise pie chart of your own spending
- Bar chart comparing your share across your five most recent trips

### 📋 Per-Trip Details
- Member-wise expense bar chart
- Category-wise pie chart for the whole trip
- Your personal category breakdown
- Who owes you and whom you owe
- Balance matrix for easy settlement

### 🤝 Friends & Balances
Send and accept friend requests, view incoming and outgoing requests separately,
and see a running balance with each friend.

### 📱 Responsive UI
Custom CSS with breakpoints for mobile, tablet, and desktop, including a
hamburger-drawer sidebar on small screens.

### ⚠️ Error Handling
Custom 404 page, inline form validation, JSON error responses from the API, and
a graceful session-expired flow.

---

## 🔐 Security Notes

- All trip and expense endpoints verify that the caller is a member of the trip.
- Passwords are hashed with bcrypt; the API never returns password data.
- Helmet sets hardened HTTP headers; JSON bodies are capped at 100 kB.
- CORS is restricted to an explicit origin allow-list.
- Auth endpoints are rate limited (10 failed attempts per 15 minutes per IP);
  the API overall is capped at 300 requests per 15 minutes per IP.
