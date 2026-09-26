# Redhill Infra - Investor & Project Management Portal

A full-stack portal for infrastructure investors and administrators to monitor project progress, construction milestones, investment financials, document legalities, and receive automated email updates.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Nodemailer / SendGrid, JWT Authentication.
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack React Query, Lucide Icons, Recharts, Framer Motion.

---

## 🚀 How to Run in VS Code

### Step 1: Open the Project in VS Code
1. Open **VS Code**.
2. Click **File > Open Folder...** and select the root directory (`Redhill-investor-portal-updated`).

---

### Step 2: Start the Backend Server
Open a terminal in VS Code (`Ctrl + ` ` or **Terminal > New Terminal**):

```bash
cd Backend
npm install
npm run dev
```
- **Backend will start on**: `http://localhost:5001`

*(Optional)* If you want real email delivery via Gmail, ensure your `Backend/.env` contains your Gmail credentials:
```env
PORT=5001
FRONTEND_URL=http://localhost:5173
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

---

### Step 3: Start the Frontend Application
Open a **second terminal** in VS Code (click the `+` icon in the terminal panel):

```bash
cd Frontend
npm install
npm run dev
```
- **Frontend will run on**: `http://localhost:5173`

---

## 🔑 Default Login Credentials

| Role | Email / Login ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@redhillinfra.com` | `admin123` | Full admin dashboard, milestone manager, investor assignments, staff management, notifications |
| **Site Engineer / Manager** | `sitemanager@redhillinfra.com` | `site123` | Site progress, milestones update, CCTV stream, field notes |
| **Financial Officer** | `finance@redhillinfra.com` | `finance123` | Investment ledger, transactions, escrow management, payouts |
| **Support Agent** | `support@redhillinfra.com` | `support123` | Investor inquiries, support tickets, communication hub |
| **Investor (John)** | `investor@example.com` or `jo210` | `investor123` | Investor portfolio, live project tracking, documents, media & ledger |
| **Investor (Sarah)** | `sarah.investor@example.com` or `sa223` | `investor123` | Portfolio view, documents & queries |
| **Investor (David)** | `david.investor@example.com` or `da445` | `investor123` | Portfolio view, documents & queries |
| **Investor (Michael)** | `michael.investor@example.com` or `mi667` | `investor123` | Portfolio view, documents & queries |
| **Investor (Vinay)** | `vinaykl990280487@gmail.com` or `vi870` | `investor123` | Custom investor account |

---

## 📤 How to Push to GitHub

From the root project directory in VS Code terminal:

```bash
# 1. Stage all updated files
git add .

# 2. Commit the changes
git commit -m "Fix milestone functionality, clean build errors, and optimize notifications"

# 3. Push to GitHub
git push origin main
```
