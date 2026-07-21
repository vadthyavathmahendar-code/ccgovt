# Civics Connect Enterprise

> **AI-Powered Smart Municipal Operations Platform using React, Supabase, ServiceNow, and Gemini AI**

---

## 🚀 Overview

Civics Connect Enterprise bridges citizen engagement with enterprise-grade municipal operations management. Citizens report issues, track resolutions in real-time, and interact via an AI assistant through a modern React web application. Operations, SLAs, group assignments, and supervisor approvals are managed via a custom ServiceNow Scoped Engine (`x_snc_civic_mgmt`).

---

## 🔒 Environment & Security Configuration

Copy the template `.env.example` file to `.env` in your local workspace:

```bash
cp .env.example .env
```

Populate the `.env` file with your credentials:

```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-publishable-key
VITE_APP_ENV=development
```

> **Security Note**: Never commit `.env` or plaintext API keys to Git. Environment keys are strictly validated at application startup using `src/config/env.js`.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

Database migrations are located in `supabase/migrations/`.

Run the initial Sprint 1 migration script in your Supabase SQL Editor:
* `supabase/migrations/20260721000000_sprint_01_security_and_system_config.sql`

This creates the baseline `system_configurations` metadata table, configures Row Level Security (RLS) policies, indexes key columns, and installs initial system feature flags.

---

## 🛠️ Local Development & Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Test Suite
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🌿 Git Flow Branching Architecture

* `main`: Production releases (tagged with SemVer e.g., `v1.0.0`)
* `develop`: Active integration branch
* `feature/sprint-01-security-hardening`: Sprint 1 Security & Configuration branch
