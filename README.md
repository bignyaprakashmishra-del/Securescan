# SecureScan — An Explainable Web Application Security Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/platform-Node.js%20%7C%20Express%20%7C%20React%20%7C%20PostgreSQL-blue.svg)]()
[![Security](https://img.shields.io/badge/security-SSRF--Hardened%20%7C%20Zero--Exploit-purple.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

> **"Know Your Website's Security Before Attackers Do."**  
> An explainable web application security assessment platform that identifies security misconfigurations, evaluates risk, and recommends actionable fixes. Built for college project competitions and professional web auditing.

---

## 🌟 Executive Summary

**SecureScan** addresses a critical challenge in modern application security: automated vulnerability scanners often generate opaque, noisy, or fabricated results without explaining *why* an issue matters or *how* an engineer should fix it. 

SecureScan provides **evidence-based, non-destructive, passive security intelligence**. It assesses transport encryption, browser defense-in-depth headers, cookie policy flags, and public file exposures—yielding an explainable **100-point security grade** backed by multi-platform configuration remediation snippets (Express.js, Nginx, Apache) and downloadable PDF executive reports.

---

## 🛠️ Technology Stack

| Layer | Technology | Details & Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Pure JavaScript (no TypeScript/Java), fast SPA build |
| **UI & Styling** | Tailwind CSS, Lucide Icons | Dark navy cybersecurity SaaS aesthetic (`#0B0F19`), responsive |
| **Data Visualization** | Recharts | Security score trends and severity distribution charts |
| **Backend** | Node.js, Express.js | Modular monolithic architecture serving API & built static SPA |
| **Database & ORM** | PostgreSQL, Prisma ORM | Parameterized queries, relational models, Render-ready |
| **Security Controls** | Helmet, bcryptjs, JWT | Strict CSP, secure HTTP-only cookies, DNS rebinding pinning |
| **Reporting Engine** | PDFKit | Competition-ready, audit-compliant downloadable PDF reports |
| **Deployment** | GitHub + Render | Single Render Web Service + Render PostgreSQL (`render.yaml`) |

---

## 🏛️ System Architecture

SecureScan runs as a **high-cohesion modular monolith** that eliminates microservice complexity while delivering enterprise-grade security boundaries:

```
securescan/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/                # API client (credentials, error handling)
│   │   ├── context/            # AuthContext & DemoContext (judges mode)
│   │   ├── components/         # ScoreGauge, StatCard, FindingCard, RemediationModal
│   │   └── pages/              # Landing, Login, Dashboard, Websites, Scans, Demo
│   └── dist/                   # Production build output
├── server/                     # Node.js & Express Modular Backend
│   ├── config/                 # Constants, scoring weights, database client
│   ├── middleware/             # Auth, rate limiting, domain validation, error handling
│   ├── services/
│   │   ├── ssrfProtection.js   # IP validation, pinned DNS resolution, redirect checks
│   │   ├── scanner.js          # Genuine passive HTTP/TLS security audits
│   │   ├── verification.js     # Cryptographic DNS TXT domain verification
│   │   ├── scoring.js          # Explainable 100-point scoring algorithm
│   │   ├── remediation.js      # Multi-platform fix snippets (Express/Nginx/Apache)
│   │   ├── comparison.js       # Scan posture diff (fixed, new, unchanged issues)
│   │   ├── reportGenerator.js  # PDFKit downloadable security reports
│   │   └── demoData.js         # Dedicated competition demo datasets
│   ├── controllers/            # Request handlers
│   └── routes/                 # REST endpoints (/api/auth, /api/websites, /api/scans, etc.)
├── prisma/
│   ├── schema.prisma           # Active Prisma schema (PostgreSQL / SQLite)
│   ├── schema.postgresql.prisma# PostgreSQL schema for Render deployment
│   └── schema.sqlite.prisma    # SQLite schema for zero-friction local development
├── render.yaml                 # Infrastructure as Code for Render Web Service + DB
└── package.json                # Single root build & start scripts
```

---

## 🔒 Security & SSRF Protection Engine

Because SecureScan audits external web services, its scanning engine implements strict **Server-Side Request Forgery (SSRF)** defenses:

1. **Domain Name Enforcement**: Accepts only valid FQDNs. Rejects IP-literals (`http://192.168.1.1`), URLs with paths, and ports.
2. **Private & Cloud IP Blocking**: Resolves all IPv4 (A) and IPv6 (AAAA) addresses and checks against RFC 1918, RFC 6598, loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`), and cloud metadata IPs (`169.254.169.254`).
3. **DNS Rebinding Prevention**: Validated IP is pinned for the socket connection while preserving Host header and TLS Server Name Indication (SNI).
4. **Redirect Destination Revalidation**: Every 3xx HTTP redirect destination is re-parsed and its resolved IP is re-verified before following (max 3 redirects).
5. **Enforced Limits**: 7-second connection timeouts, 1MB response body limit, GET methods only.
6. **Domain Authorization Required**: Scans are restricted to domains verified via DNS TXT ownership records (`_securescan-challenge.<domain>`).

---

## 📊 Explainable Scoring Formula

The platform calculates an objective score out of **100 points**:

$$\text{Final Score} = \max\left(0, 100 - \sum \text{Deductions}\right)$$

### Severity Deduction Schedule:
- **Critical Risk (-25 pts each)**: Missing HTTPS, expired TLS certificate, session cookies missing `HttpOnly`.
- **High Risk (-15 pts each)**: Missing `Content-Security-Policy`, missing `Strict-Transport-Security`, cookies missing `Secure`, untrusted TLS certificate.
- **Medium Risk (-8 pts each)**: Missing `X-Frame-Options` (Clickjacking), missing `X-Content-Type-Options`, cookies missing `SameSite`.
- **Low Risk (-3 pts each)**: Missing `Referrer-Policy`, missing `Permissions-Policy`, sensitive paths advertised in `robots.txt`, server version banners.
- **Informational (0 pts)**: Observations that do not negatively affect security posture.

### Grade & Risk Classification:
| Score Range | Grade | Risk Classification |
| :--- | :---: | :--- |
| **95 – 100** | **A+** | Low Risk (Industry Leading) |
| **88 – 94** | **A** | Low Risk (Strong Posture) |
| **75 – 87** | **B** | Moderate Risk (Baseline Protected) |
| **55 – 74** | **C** | Elevated Risk (Hardening Required) |
| **35 – 54** | **D** | High Risk (Significant Vulnerabilities) |
| **0 – 34** | **F** | Critical Risk (Immediate Action Required) |

---

## 🏆 Judges & Demonstration Mode

SecureScan includes a **dedicated Demo Mode** built specifically for competition evaluators. Judges can thoroughly inspect the platform's capabilities without having to register or configure live DNS records:

1. Click **"Demo Mode"** in the navigation bar or **"Explore Demo Mode"** on the hero banner.
2. Select from three pre-configured competition targets:
   - **Apex Retail (`shop.apex-retail.io`)**: Score **48 (Grade D)** — Real-world e-commerce vulnerabilities (missing CSP, HSTS, insecure cookies).
   - **HealthBridge Records (`portal.healthbridge.org`)**: Score **68 (Grade C)** — Healthcare portal with clickjacking exposure and missing Permissions-Policy.
   - **FinVault Banking API (`api.finvault-demo.com`)**: Score **98 (Grade A+)** — Modern hardened banking gateway with TLS 1.3 and HSTS preload.
3. Test **Remediation Intelligence**: Click *"Remediation"* to review and copy drop-in fixes for **Express.js**, **Nginx**, and **Apache**.
4. Test **PDF Report Generation**: Click *"Download Demo Report"* to view the generated executive PDF summary.

---

## 🚀 Quickstart: Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

### 1. Clone & Enter Project
```powershell
git clone https://github.com/<your-username>/securescan.git
cd securescan
```

### 2. Install Dependencies
```powershell
# Install server and client dependencies
npm install
npm --prefix client install
```

### 3. Setup Local Database (Zero-Config SQLite)
```powershell
# Configures Prisma for local development and creates dev.db
npm run db:local
```

### 4. Run Test Suite
```powershell
# Executes full test suite (SSRF, scoring, auth, comparison, PDF)
node server/test/systemTest.js
```

### 5. Launch Development Server
```powershell
# Terminal 1: Start Express backend on port 5000
npm start

# Terminal 2: Start Vite React frontend on port 3000
npm run client
```
Open your browser to `http://localhost:3000`.

---

## ☁️ Deployment Guide (Render & GitHub)

The application is architected for **zero-friction single-service deployment** on Render. Express serves the compiled React frontend and the REST APIs from a single container, backed by Render PostgreSQL.

### Step 1: Push Code to GitHub
```powershell
git add .
git commit -m "feat: complete competition-quality SecureScan platform"
git branch -M main
git remote add origin https://github.com/<your-username>/securescan.git
git push -u origin main
```

### Step 2: Deploy with Render Blueprint (`render.yaml`)
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `securescan`.
4. Render will detect `render.yaml` and automatically configure:
   - **Web Service (`securescan`)**:
     - Environment: `Node`
     - Build Command: `npm run build`
     - Start Command: `npm start`
     - Health Check Path: `/api/health`
     - Auto-Deploy: `Yes` (deploys on every commit to `main`)
   - **PostgreSQL Database (`securescan-db`)**:
     - Database Name: `securescan`
     - User: `securescan`
     - Plan: `Free`
5. Click **Apply**. Render will provision PostgreSQL, build the React SPA, generate the Prisma Client, and launch the service!

Your application will be live at:
`https://securescan.onrender.com`

---

## 🧪 Automated Test Verification

All security controls and application workflows are verified with automated tests:

```powershell
node server/test/systemTest.js
```

### Test Coverage Checklist:
- [x] **SSRF Defense**: Loopback (`127.0.0.1`), RFC 1918 (`10.x`, `172.16.x`, `192.168.x`), Link-Local (`169.254.x`), Carrier-NAT (`100.64.x`), and IPv6 (`::1`, `fe80::`).
- [x] **DNS Rebinding**: Target IP pinning with preserved SNI and Host headers.
- [x] **Authentication**: Password hashing with bcrypt, HTTP-only JWT cookies, user session validation.
- [x] **Ownership Verification**: Unique DNS TXT token matching and record validation.
- [x] **Cross-User Data Isolation**: User A cannot view, scan, or delete User B targets.
- [x] **Scoring Formula**: Base 100 deduction math, grade bounds, risk level assignments.
- [x] **Scan Diffing**: Fixed, new, and unchanged vulnerability tracking with net score delta.
- [x] **Report Generation**: Valid binary PDF creation with `%PDF-` signature and executive branding.

---

## 📄 License
This project is licensed under the MIT License — open and accessible for educational, research, and competition review.
