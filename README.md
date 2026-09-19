# Redhill Infra - Investor & Project Management Portal

A full-stack portal for infrastructure investors and administrators to monitor project progress, construction milestones, investment financials, document legalities, and receive automated email updates.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Nodemailer / SendGrid, JWT Authentication.
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack React Query, Lucide Icons, Recharts, Framer Motion.

---

## 🌐 Deploying on Render

### Architecture on Render
You will deploy **2 services** on [Render](https://render.com):
1. **Backend Web Service** (Node.js API)
2. **Frontend Static Site** (React / Vite)

---

### Step 1: Deploy Backend (Web Service)

1. Go to your **Render Dashboard** -> Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `redhill-portal-backend`
   - **Root Directory**: `Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

4. Add **Environment Variables** in the Render Dashboard:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & cookies |
   | `PORT` | `5001` | Render sets this automatically or uses 5001 |
   | `HOST` | `0.0.0.0` | Required for Render networking |
   | `FRONTEND_URL` | `https://your-frontend.onrender.com` | Your frontend Render domain |
   | `CORS_ORIGIN` | `https://your-frontend.onrender.com` | Allowed origin for cookie credentials |
   | `JWT_SECRET` | *(Generate a strong 32+ char secret)* | Secret for auth tokens |
   | `JWT_EXPIRES_IN` | `24h` | Token expiration |
   | `DATABASE_PATH` | `database.sqlite` (or persistent disk path) | SQLite database location |
   | `UPLOADS_DIR` | `uploads` (or persistent disk path) | Media uploads directory |
   | `GMAIL_USER` | `your_email@gmail.com` | *(Optional)* For Gmail notifications |
   | `GMAIL_APP_PASSWORD` | `your_16_char_app_password` | *(Optional)* Google App Password |
   | `FROM_EMAIL` | `noreply@yourdomain.com` | Sender email address |

5. *(Optional - Recommended for Persistent SQLite & Uploads)*:
   - Attach a **Render Persistent Disk** (e.g., Mount Path: `/var/data`, Size: 1 GB).
   - Set `DATABASE_PATH=/var/data/database.sqlite` and `UPLOADS_DIR=/var/data/uploads`.

6. Click **Deploy Web Service**. Note your backend URL (e.g., `https://redhill-portal-backend.onrender.com`).

---

### Step 2: Deploy Frontend (Static Site)

1. In Render Dashboard -> Click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `redhill-portal-frontend`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://redhill-portal-backend.onrender.com` | Your live backend URL from Step 1 |
   | `VITE_APP_NAME` | `Redhill Infrastructure Investor Portal` | App title |

5. Add **Rewrite / Redirect Rule** (for client-side routing):
   - In Static Site settings -> **Redirects / Rewrites**:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

6. Click **Deploy Static Site**.

---

## 💻 Local Development Setup

### 1. Start the Backend Server
```bash
cd Backend
cp .env.example .env   # Configure your environment variables
npm install
npm run dev
```
- **Backend URL**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/health`

### 2. Start the Frontend Application
```bash
cd Frontend
cp .env.example .env   # Optional (defaults use local Vite proxy)
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:3001` (or `http://localhost:5173`)

---

## 🔑 Default Login Credentials

| Role | Email / Login ID | Password | Access |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@redhillinfra.com` | `admin123` | Full admin dashboard, milestone manager, investor assignments, notifications |
| **Investor** | `investor@example.com` or `jo210` | `investor123` | Investor portfolio, live project tracking, documents, media & ledger |

---

## ⚙️ Environment Variables Reference

### Backend (`Backend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime mode (`development` / `production`) |
| `PORT` | `5001` | Port number the server binds to |
| `HOST` | `0.0.0.0` | Host address |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for redirects & email action links |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000,http://localhost:3001` | Comma-separated allowed CORS origins |
| `JWT_SECRET` | `redhill-infra-secret-key-dev-only` | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | `24h` | Token expiration duration |
| `DATABASE_PATH` | `database.sqlite` | SQLite file path |
| `UPLOADS_DIR` | `uploads` | Directory for uploaded media & documents |
| `GMAIL_USER` | - | Gmail account for SMTP email delivery |
| `GMAIL_APP_PASSWORD` | - | 16-character Google App Password |
| `FROM_EMAIL` | `noreply@redhillinfra.com` | Email "From" address |

### Frontend (`Frontend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `""` (empty = proxy) | Live Backend API URL (e.g. `https://api.onrender.com`) |
| `VITE_ASSETS_BASE_URL` | Same as API URL | Base URL for serving media uploads |
| `VITE_APP_NAME` | `Redhill Infrastructure Investor Portal` | Application brand name |
| `VITE_PROXY_TARGET` | `http://localhost:5001` | Local development proxy target |
