<div align="center">

<img src="frontend-main/public/BalanceBox.svg" alt="BalanceBox logo" width="120" />

# BalanceBox

**Split trip expenses with friends — and always know who owes whom.**

Create trips, log shared expenses, and let BalanceBox do the maths. Real-time
balances, a settlement matrix, and category insights keep every group fair.

<br />

[![Live App](https://img.shields.io/badge/Live%20App-balance--box--nine.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white)](https://balance-box-nine.vercel.app/)
[![API](https://img.shields.io/badge/API-balance--box.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://balance-box.onrender.com/health)

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384)

</div>

---

## 🔗 Live Deployment

| | URL | Status |
| :-- | :-- | :-- |
| 🌐 **Frontend** | <https://balance-box-nine.vercel.app/> | Vercel · auto-deploys from `main` |
| ⚙️ **API** | <https://balance-box.onrender.com> | Render · auto-deploys from `main` |
| 💚 **Health check** | <https://balance-box.onrender.com/health> | `{"status":"ok","db":"connected"}` |
| 🗄️ **Database** | MongoDB Atlas (M0) | — |

> **Note on first load:** the API runs on Render's free tier, which sleeps after
> ~15 minutes of inactivity. The first request may take up to ~50 seconds while
> the service wakes up. Every request after that is fast.

---

## ✨ What it does

<table>
<tr>
<td width="90" align="center"><img src="frontend-main/public/trip.png" width="56" alt="" /></td>
<td>

### 🧳 Trips
Create a trip from the usernames of registered users. Everyone in the trip can
add and edit expenses. Unknown usernames are reported by name, so you know
exactly which one to fix.

</td>
</tr>
<tr>
<td width="90" align="center"><img src="frontend-main/public/expense.png" width="56" alt="" /></td>
<td>

### 💸 Expenses
Log an expense with a description, amount, and category. Supports **multiple
payers** on a single expense and lets you choose exactly who it is split
between — shares are calculated automatically.

</td>
</tr>
<tr>
<td width="90" align="center"><img src="frontend-main/public/friends.png" width="56" alt="" /></td>
<td>

### 🤝 Friends
Send and accept friend requests, view incoming and outgoing requests
separately, and see a running balance with each friend across every shared trip.

</td>
</tr>
</table>

### 📊 Insights & settlement

- **Dashboard** — total trips, total friends, and your total spend at a glance
- **Category pie chart** — where your money actually goes
- **Recent trips bar chart** — your share across your five most recent trips
- **Per-trip breakdown** — member-wise spend, category split, and your own share
- **Balance matrix** — a who-owes-whom grid for settling up in one pass

### 🔐 Accounts with email OTP verification

Sign-up is a three-step flow: enter your email, receive a 6-digit code by email
(delivered through SendGrid), then set your name, username and password. Codes
are single-use, expire in 10 minutes, and are stored only as a peppered HMAC —
never in plain text.

Login is email + password. JWTs are signed for 7 days; protected routes redirect
to login when a token is missing or expired, and send you back to where you were
headed once you sign in.

---

## 📸 Screenshots

> Add real screenshots here to finish this section. Capture the Dashboard,
> a Trip Overview, and the Split Matrix at ~1440px wide, save them to
> `docs/screenshots/`, and reference them like the example below.
>
> ```markdown
> ![Dashboard](docs/screenshots/dashboard.png)
> ![Trip Overview](docs/screenshots/trip-overview.png)
> ![Split Matrix](docs/screenshots/split-matrix.png)
> ```

---

## 🏗️ Architecture

```
┌──────────────────────────┐        HTTPS / JWT        ┌──────────────────────────┐
│   Vercel (static CDN)    │  ───────────────────────► │   Render (Node service)  │
│                          │  ◄─────────────────────── │                          │
│  React 19 + Vite         │       JSON responses      │  Express 5               │
│  React Router 7          │                           │  helmet · CORS allowlist │
│  Recharts                │                           │  rate limiting           │
│  Route-level code split  │                           │  JWT middleware          │
└──────────────────────────┘                           └────────────┬─────────────┘
                                                                    │ Mongoose
                                                                    ▼
                                                       ┌──────────────────────────┐
                                                       │   MongoDB Atlas (M0)     │
                                                       │   users · trips ·        │
                                                       │   friendrequests         │
                                                       └──────────────────────────┘
```

**Repository layout**

```
BalanceBox/
├── backend-main/              # Express API  → deployed to Render
│   ├── controllers/           # user, trip, friend request handlers
│   ├── middlewares/           # auth, validation, rate limiters
│   ├── models/                # Mongoose schemas + indexes
│   ├── routes/                # route definitions
│   └── server.js              # app bootstrap, security, error handling
└── frontend-main/             # React SPA   → deployed to Vercel
    ├── public/                # favicons, manifest, brand assets
    └── src/
        ├── components/        # sidebar, navbars, charts, forms, cards
        ├── pages/             # login, register, home, trips, friends
        ├── routes/            # router + auth guards
        ├── styles/            # shared app-shell and auth-form CSS
        └── utils/             # API client, token helpers
```

### How balances are calculated

Each trip stores an **N×N balance matrix** alongside its expenses, where
`matrix[i][j]` is what member *i* owes member *j*. Adding an expense applies each
payer/split pair incrementally; editing or deleting one **recomputes the matrix
from scratch** over all remaining expenses, so it can never drift out of sync
with the underlying data.

Paid totals are compared against the expense amount with a small tolerance, so
genuinely valid splits like ₹100 ÷ 3 (33.33 + 33.33 + 33.34) are accepted while
real mismatches are still rejected.

---

## 📡 API Reference

Base URL: `https://balance-box.onrender.com`
All protected routes require `Authorization: Bearer <token>`.

<details>
<summary><b>Users &amp; auth</b></summary>

| Method | Endpoint | Auth | Description |
| :-- | :-- | :--: | :-- |
| `POST` | `/api/users/send-otp` | — | Mails a 6-digit signup code to an email |
| `POST` | `/api/users/verify-otp` | — | Validates the code, returns a short-lived `signupToken` |
| `POST` | `/api/users/register` | — | Creates the account (requires a valid `signupToken`) |
| `POST` | `/api/users/login` | — | Email + password; returns a JWT valid for 7 days |
| `GET`  | `/api/users/dashboard` | ✅ | Totals, category summary and recent trips in one call |
| `GET`  | `/api/users/me/friends-balances` | ✅ | Net balance with each friend |

**Signup sequence**

```
POST /send-otp    { email }                      ->  code emailed
POST /verify-otp  { email, otp }                 ->  { signupToken }
POST /register    { signupToken, name,
                    username, password }         ->  { token, user }
```

An account cannot be created without a `signupToken`, and that token is only
ever issued by `verify-otp` — so proof of email ownership is mandatory.

</details>

<details>
<summary><b>Trips &amp; expenses</b></summary>

| Method | Endpoint | Auth | Description |
| :-- | :-- | :--: | :-- |
| `POST`   | `/api/trips/create` | ✅ | Create a trip from member usernames |
| `GET`    | `/api/trips/my-trips` | ✅ | Trips you belong to |
| `GET`    | `/api/trips/:tripId` | ✅ | Trip details and members |
| `GET`    | `/api/trips/:tripId/totalExpense` | ✅ | Trip total |
| `GET`    | `/api/trips/:tripId/category-expenses` | ✅ | Totals grouped by category |
| `GET`    | `/api/trips/:tripId/membersExpenseSummary` | ✅ | Spend per member |
| `GET`    | `/api/trips/:tripId/user/category-expenses` | ✅ | Your own category split |
| `GET`    | `/api/trips/:tripId/balanceMatrix` | ✅ | Full settlement matrix |
| `GET`    | `/api/trips/:tripId/my-balances` | ✅ | Your balance with each member |
| `POST`   | `/api/trips/:tripId/expenses` | ✅ | Add an expense |
| `GET`    | `/api/trips/:tripId/expenses` | ✅ | List expenses |
| `GET`    | `/api/trips/:tripId/expenses/:expenseId` | ✅ | Single expense |
| `PUT`    | `/api/trips/:tripId/expenses/:expenseId` | ✅ | Edit an expense |
| `DELETE` | `/api/trips/:tripId/expenses/:expenseId` | ✅ | Delete an expense |

Every trip route verifies that the caller is a member of that trip.

</details>

<details>
<summary><b>Friends</b></summary>

| Method | Endpoint | Auth | Description |
| :-- | :-- | :--: | :-- |
| `POST` | `/api/friends/send` | ✅ | Send a request by username |
| `GET`  | `/api/friends/incoming` | ✅ | Pending requests received |
| `GET`  | `/api/friends/outgoing` | ✅ | Pending requests sent |
| `PUT`  | `/api/friends/respond` | ✅ | Accept or decline a request |

</details>

<details>
<summary><b>System</b></summary>

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| `GET` | `/health` | Liveness plus database connection state |

</details>

---

## 🛡️ Security

| Area | Implementation |
| :-- | :-- |
| Passwords | bcrypt hashed; never returned by any endpoint |
| Email ownership | Accounts require a `signupToken`, issued only after a successful OTP challenge |
| OTP storage | Only an HMAC-SHA256 of the code is stored, peppered with `JWT_SECRET` |
| OTP lifetime | 10-minute TTL enforced by a MongoDB TTL index; consumed on first successful use |
| OTP brute force | Max 5 wrong attempts per code, 60-second resend cooldown, per-IP **and** per-email rate limits |
| Sessions | JWT, 7-day expiry, verified on every protected request |
| Authorization | Every trip/expense route checks trip membership before responding |
| Headers | `helmet` sets hardened HTTP security headers |
| CORS | Explicit origin allow-list via `ALLOWED_ORIGINS` |
| Rate limiting | 10 failed auth attempts / 15 min per IP · 300 requests / 15 min overall |
| Input validation | `express-validator` on auth routes, hand-rolled checks on trip and expense payloads |
| Payload size | JSON bodies capped at 100 kB |
| Secrets | Supplied only through environment variables; `.env` files are git-ignored |
| Fail fast | The server refuses to boot without `MONGO_URI` and `JWT_SECRET` |

---

## ⚡ Performance

| Optimisation | Effect |
| :-- | :-- |
| Consolidated dashboard endpoint | 5 HTTP requests → **1**; 5 redundant DB scans → **1 query** |
| Parallel trip-overview fetches | 4-request waterfall → concurrent |
| Route-level code splitting | The 400 kB chart bundle no longer loads on the login screen |
| Manual vendor chunks | React and Recharts cached independently of app code |
| Compound DB indexes | On `trips.members` and the friend-request lookup paths |
| `.lean()` reads | Plain objects instead of hydrated documents on read-only routes |
| gzip compression | Enabled for all API responses |

---

## 🧑‍💻 Running locally

**Prerequisites:** Node.js 18+ and a MongoDB connection string (Atlas or local).

```bash
git clone https://github.com/AYUSHSAINI9876/BalanceBox.git
cd BalanceBox
```

**1 — Backend** (<http://localhost:5000>)

```bash
cd backend-main
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

Generate a strong signing secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**2 — Frontend** (<http://localhost:5173>)

```bash
cd frontend-main
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:5000
npm run dev
```

Confirm the API is up at <http://localhost:5000/health>.

---

## ⚙️ Configuration

### `backend-main/.env`

| Variable | Required | Description |
| :-- | :--: | :-- |
| `MONGO_URI` | ✅ | MongoDB connection string. Server exits on boot if absent. |
| `JWT_SECRET` | ✅ | Secret used to sign JWTs. Server exits on boot if absent. |
| `PORT` | — | Defaults to `5000`. Render sets this automatically. |
| `NODE_ENV` | — | `production` hides raw error text from API responses. |
| `ALLOWED_ORIGINS` | — | Comma-separated CORS allow-list. **Must include the Vercel URL in production.** |
| `SENDGRID_API_KEY` | ✅ in production | SendGrid key with **Mail Send** permission. |
| `SENDGRID_FROM_EMAIL` | ✅ in production | A **verified** sender address. |
| `SENDGRID_FROM_NAME` | — | Inbox display name. Defaults to `BalanceBox`. |
| `APP_NAME` | — | Product name used in the email subject and body. |
| `OTP_TTL_MINUTES` | — | Code lifetime in minutes. Defaults to `10`. |
| `OTP_RESEND_COOLDOWN_SECONDS` | — | Minimum gap between resends. Defaults to `60`. |

> 💡 **Local development without SendGrid:** if `SENDGRID_API_KEY` is unset and
> `NODE_ENV` is not `production`, the OTP is printed to the server console
> instead of being emailed, so you can exercise the whole flow without a
> SendGrid account. In production the server throws instead of silently
> degrading.

### `frontend-main/.env.local`

| Variable | Required | Description |
| :-- | :--: | :-- |
| `VITE_API_URL` | ✅ in production | API base URL, no trailing slash. Falls back to `http://localhost:5000`. |

> ⚠️ Vite inlines `VITE_API_URL` at **build time**. After changing it in Vercel
> you must redeploy for the change to take effect.

---

## ☁️ Deployment

<details>
<summary><b>1 · MongoDB Atlas</b></summary>

1. Create a free **M0** cluster.
2. **Database Access** → add a user with a strong password.
3. **Network Access** → allow `0.0.0.0/0` (Render's outbound IPs are dynamic).
4. **Connect → Drivers** → copy the connection string and set the database name:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/balancebox?retryWrites=true&w=majority
```

If the password contains `@ : / ? # [ ] %`, URL-encode it (`@` → `%40`).

</details>

<details>
<summary><b>2 · SendGrid (email delivery for OTP)</b></summary>

1. Create a free account at <https://signup.sendgrid.com> — the free tier
   includes 100 emails/day, which is plenty for signup codes.
2. **Settings → Sender Authentication → Single Sender Verification** → add the
   address codes should come from, then click the confirmation link SendGrid
   emails you. *Sending from an unverified address always fails.*
3. **Settings → API Keys → Create API Key** → choose **Restricted Access** and
   grant only **Mail Send → Full Access**. Copy the key immediately; it is shown
   once and never again.
4. Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` in Render.

For a custom domain, use **Domain Authentication** instead of Single Sender and
add the CNAME records SendGrid provides. This markedly improves deliverability
and keeps codes out of spam folders.

</details>

<details>
<summary><b>3 · Backend on Render</b></summary>

| Setting | Value |
| :-- | :-- |
| Root Directory | `backend-main` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`,
`SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`.

Verify at `https://<your-service>.onrender.com/health`.

</details>

<details>
<summary><b>4 · Frontend on Vercel</b></summary>

| Setting | Value |
| :-- | :-- |
| Root Directory | `frontend-main` |
| Framework | Vite (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable: `VITE_API_URL=https://<your-service>.onrender.com`

`vercel.json` already rewrites all paths to `index.html`, so client-side deep
links resolve correctly.

</details>

<details>
<summary><b>5 · Close the CORS loop</b></summary>

Back in Render, set:

```
ALLOWED_ORIGINS=https://<your-app>.vercel.app,http://localhost:5173
```

Without this, every browser request is blocked by CORS even though both
deployments report success.

</details>

### Continuous deployment

Both platforms install a GitHub webhook at setup, so **every push to `main`
redeploys automatically** — no manual step. The exceptions worth remembering:

- Changing `VITE_API_URL` requires a Vercel **redeploy**, because Vite bakes it
  in at build time.
- Adding a new required environment variable should be done **before** pushing
  the code that needs it, or the backend will crash-loop by design.

---

## ✅ Testing

The deployed stack was verified end to end — health and database connectivity,
CORS from the production origin, registration (confirming no password data is
returned), login, protected-route rejection, trip creation, expense splitting
with fractional amounts, balance computation, and the consolidated dashboard.

**Manual QA checklist**

1. Sign up: enter an email, receive the code, verify it, then set your profile.
   Check the network responses never contain the OTP or a password field.
2. Log out, open the app root — you should be redirected to login.
3. Log in; the dashboard should issue a single `/api/users/dashboard` request.
4. Create a trip and confirm **Created by** shows the real creator.
5. Add a ₹100 expense split three ways — fractional shares must be accepted.
6. Edit and delete an expense; balances and the matrix should update.
7. Send, accept, and decline friend requests between the two accounts.
8. Visit an unknown URL to confirm the custom 404 page.
9. Resize across ~1200px to check the sidebar/hamburger transition.

---

## 🗺️ Roadmap

- [ ] Settle-up flow that records repayments
- [ ] Expense receipt image uploads
- [ ] Export a trip summary to CSV or PDF
- [ ] Email notifications for friend requests
- [ ] Multi-currency support

---

## 👤 Author

**Ayush Saini** — [@AYUSHSAINI9876](https://github.com/AYUSHSAINI9876)

<div align="center">
<br />
<sub>Built with the MERN stack · Deployed on Vercel &amp; Render</sub>
</div>
