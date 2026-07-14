# Veeray Visuals — Portfolio Contact Form (Frontend + Backend)

This project has two parts:

```
project/
├── frontend/          → your existing portfolio site (index.html + assets)
├── backend/           → Node.js/Express API that emails contact-form submissions to you
└── README.md          → this file
```

The contact form on the site POSTs to your backend's `/api/contact` endpoint,
which sends you an email via Gmail SMTP (Nodemailer) with the visitor's name,
email, subject, message, timestamp, IP, and browser info.

---

## 1. Gmail App Password Setup

Gmail blocks plain-password SMTP login for security. You need an **App Password** instead.

1. Go to your Google Account → **Security**.
2. Under "How you sign in to Google," enable **2-Step Verification** if it isn't already on (required for App Passwords).
3. Once 2FA is enabled, go to **Security → 2-Step Verification → App passwords**
   (or search "App Passwords" in your Google Account settings search bar).
4. Choose **App: Mail**, **Device: Other (Custom name)** → name it e.g. `Portfolio Contact Form`.
5. Click **Generate**. Google shows a 16-character password (spaces don't matter) — copy it.
6. This is your `SMTP_PASS`. Your `SMTP_USER` is your full Gmail address.

> Never share this password or commit it to a public repo. It goes in `.env` only, which is git-ignored.

---

## 2. Backend Setup (local)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-app-password   # no spaces needed, but they're harmless
EMAIL_TO=raykotmathveeresh@gmail.com

PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500

RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=5
```

Run it:

```bash
npm run dev      # with nodemon (auto-restarts on changes)
# or
npm start
```

You should see: `Contact backend running on port 5000`

Test it directly:

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Hello","message":"This is a test message."}'
```

You should receive an email at your `EMAIL_TO` address within a few seconds.

---

## 3. Frontend Local Testing

Open `frontend/index.html` with a local server (so `fetch` calls work properly), e.g.:

```bash
cd frontend
npx serve .
# or use the VS Code "Live Server" extension
```

In `index.html`, find this line near the bottom of the `<script>` block:

```js
const CONTACT_API_URL = 'http://localhost:5000/api/contact';
```

Keep this as-is for local testing (matches the backend's local port). Make sure
whatever local server port you use for the frontend (e.g. `http://localhost:5500`)
is listed in the backend's `CORS_ORIGIN`.

Fill out the form and submit — you should see the loading spinner, then the
green success message, and the email should land in your inbox.

---

## 4. Deploying the Backend to Render

1. Push the `backend/` folder to a GitHub repo (can be the same repo as the frontend, or its own).
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your repo, and set:
   - **Root Directory**: `backend` (if backend and frontend share a repo)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Under **Environment Variables**, add every variable from `.env.example` with your real values:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_TO`, `PORT` (Render sets this automatically, but Express reads `process.env.PORT` either way), `CORS_ORIGIN`, `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX_REQUESTS`.
   - Set `CORS_ORIGIN` to your real deployed frontend URL, e.g. `https://veerayvisuals.com`.
5. Deploy. Render gives you a URL like `https://veeray-visuals-backend.onrender.com`.
6. Test the deployed health check: `https://veeray-visuals-backend.onrender.com/health`

---

## 5. Point the Frontend at the Deployed Backend

In `frontend/index.html`, update:

```js
const CONTACT_API_URL = 'https://veeray-visuals-backend.onrender.com/api/contact';
```

Re-upload/redeploy your frontend. Submit the live form once to confirm the
email arrives.

> Free Render web services spin down after inactivity and can take ~30–50
> seconds to "wake up" on the first request after idling. This is normal —
> the loading spinner will just show a bit longer on that first submission.

---

## 6. Security Notes

- Credentials are never hardcoded — everything sensitive comes from environment variables.
- `helmet` sets safe HTTP headers; `cors` restricts which origins can call the API.
- `express-rate-limit` caps submissions per IP (default: 5 per 15 minutes) to reduce spam/abuse.
- All fields are validated and sanitized (HTML-escaped) server-side before being emailed or used anywhere.
- A hidden honeypot field (`companyWebsite`) silently rejects basic bots that auto-fill every input.

---

## 7. Customizing

- **Email content**: edit `backend/controllers/contactController.js`.
- **Validation rules**: edit `backend/middleware/validateContact.js`.
- **Rate limits**: edit `RATE_LIMIT_*` values in `.env`.
- **Form fields/design**: edit the `#contact` section and its CSS in `frontend/index.html`.
