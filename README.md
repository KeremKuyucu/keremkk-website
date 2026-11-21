# keremkk-website

Personal portfolio website, shared authentication portal, and personal admin dashboard for **Kerem Kuyucu** ([keremkuyucu.com.tr](https://keremkuyucu.com.tr)).

Built with Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, and Supabase.

## Key Features

- **Bilingual Portfolio (`/` & `/tr`)**
  - Home, About (education, skills, certificates), Projects showcase & detail pages, and Contact page in English and Turkish.
  - Live GitHub repository metadata (stars, forks, last commit, status) via `/api/github`.
  - Contact form submission backed by Supabase (`/api/contact`).
- **Shared Authentication Portal (`/auth` & `/auth/[...slug]`)**
  - Central portal for applications using KeremKK Auth, including localized Terms of Service, Privacy Policy, and Account Deletion pages.
- **URL Shortener (`/go/[slug]`)**
  - Redirects short slugs to target URLs with click tracking stored in Supabase.
- **Admin Dashboard (`/admin`)**
  - Authenticated workspace (Supabase Auth) featuring:
    - **Overview** — Quick summary across modules.
    - **Notes & Messages** — Personal notes and contact form inbox.
    - **Analytics & AI Insights** — Visitor and application telemetry (`/api/logs`), IP lookup, and Gemini-powered aggregate insights (`/api/admin/analytics/ai-insights`) with PII redaction.
    - **Error Logs** — Application error ingestion (`/api/error-logs`) and inspection.
    - **Expense Tracker** — Track expenses and extract transactions from PDFs, spreadsheets, and images using Google Gemini, `unpdf`, and `exceljs` with built-in PII redaction.
    - **Subscriptions** — Recurring subscription tracking.
    - **Short Links** — Create and manage `/go/[slug]` redirects.
    - **Password Generator** — UI and public REST API (`/api/generate-password`) for Turkish wordlist passphrases, with IP rate limiting and optional JWT bypass.
    - **Uptime Monitor** — Service health checks (`/api/monitor`), scheduled daily via Vercel Cron (`vercel.json`), with email alerts via Resend.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript 5
- **Styling & Icons:** Tailwind CSS v4, `react-icons`, `@iconify/react`, `@fortawesome/fontawesome-svg-core`
- **Database & Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **AI & Document Processing:** Google GenAI (`@google/genai`), `unpdf`, `exceljs`
- **Email & Monitoring:** Resend HTTP API, Vercel Cron
- **Analytics:** Vercel Analytics (`@vercel/analytics`)

## Local Setup

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/KeremKuyucu/keremkk-website.git
   cd keremkk-website
   npm install
   ```

2. Create a `.env.local` file in the project root and populate the required environment variables listed below.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server with Turbopack |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Environment Variables

Configure these in `.env.local` for local development (or in your hosting provider's dashboard for production):

### Core (Supabase)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (also falls back to `SUPABASE_URL` on the server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

### AI Features

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key for analytics insights and expense extraction |
| `AI_REDACT_TERMS` | *(Optional)* Comma-, semicolon-, or newline-separated extra terms to redact before sending data to AI |

### Monitoring & Email Alerts

| Variable | Description |
| --- | --- |
| `CRON_SECRET` | Bearer secret authorizing scheduled `/api/monitor` cron requests |
| `RESEND_TOKEN` | Resend API key for alert emails (or `RESEND_API_KEY`) |
| `NOTIFICATION_FROM_EMAIL` | Verified sender address for outgoing notifications |
| `NOTIFICATION_TO_EMAIL` | Default recipient address for alert notifications |

### Optional API & Auth Variables

| Variable | Description |
| --- | --- |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for verifying bearer tokens on `/api/generate-password` |
| `JWT_SECRET` | Custom JWT secret / token for bypassing rate limits on `/api/generate-password` |
| `GITHUB_TOKEN` | GitHub personal access token to avoid unauthenticated rate limits on `/api/github` |

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](./LICENSE) file for details.
