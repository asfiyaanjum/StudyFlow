# StudyFlow — Personal Academic Operating System

> **"Plan smarter. Study consistently. Stay ahead."**

StudyFlow is a complete, production-grade Student Productivity and Academic Management SaaS. Unlike generic note-taking tools, StudyFlow is purpose-built for college students, engineering undergraduates, and competitive exam candidates who need an active academic execution engine.

---

## 🌟 Signature Differentiators

1. **StudyFlow Recovery Engine**:
   - Deterministic, explainable workload recovery algorithm (no fake AI promises).
   - Evaluates overdue and incomplete tasks against your timetable.
   - Proposes realistic replacement study windows without exceeding the 8-hour daily cognitive capacity limit.
   - **Student Consent Guarantee:** Never mutates schedules silently. Every rescheduling requires explicit student approval.

2. **Syllabus Progress Tracker**:
   - Organize courses into official syllabus units and conceptual topics.
   - Check off topics as your understanding deepens and monitor real course mastery percentages.

3. **Smart Academic Planning & Conflict Detection**:
   - Connects lecture timetables, personal focus windows, and task deadlines.
   - Real-time conflict warnings prevent double-booking classes and study sessions.

4. **Synchronized Focus Room**:
   - Pomodoro (25m), Deep Focus (50m), Short Break (5m), and Long Break (15m) timers.
   - Direct association with specific subjects and assignments.
   - Automatically records actual minutes spent onto your tasks.

5. **Study Consistency Analytics**:
   - 100% real persisted data: daily focus trends, 7-day volume, subject-wise distribution bars, and consistency streaks.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, React Router v6
- **Backend:** Supabase (PostgreSQL 15+, Supabase Auth, Storage, Row-Level Security)
- **Local Fallback:** Automatic offline development fallback when cloud credentials are unconfigured
- **Testing:** Vitest, React Testing Library, jsdom (29 comprehensive automated tests passing)
- **Deployment:** Vercel (Frontend) & Supabase Cloud (Backend)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v24+ recommended)
- **npm:** v9.0.0 or higher

### 2. Installation
```bash
git clone <your-repo-url>
cd StudyFlow
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_APP_URL=http://localhost:5173
```
*(Note: If you run without remote credentials, StudyFlow automatically engages its local persistence layer with preloaded Ivy-league coursework data, enabling instant testing of all screens, CRUD actions, and the Recovery Engine!)*

### 4. Running the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Running the Test Suite
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```

---

## 🗄️ Database Setup & Supabase Migrations

To connect your own remote Supabase instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/20241121000000_initial_schema.sql`](file:///c:/Users/ASFIYA%20ANJUM/StudyFlow/supabase/migrations/20241121000000_initial_schema.sql).
4. Run the SQL script. This will set up:
   - `profiles` with unique username constraint
   - `user_settings`
   - `subjects`
   - `syllabus_units` & `syllabus_topics`
   - `tasks`
   - `schedule_items`
   - `goals` & `plans`
   - `focus_sessions`
   - Row-Level Security (RLS) on **all 10 tables**
   - Secure RPC functions: `resolve_username_to_email` and `is_username_available`
   - Trigger `on_auth_user_created` to automatically populate new user profiles.

---

## 📁 Project Architecture

```
StudyFlow/
├── supabase/
│   └── migrations/
│       └── 20241121000000_initial_schema.sql   # Complete PostgreSQL Schema & RLS
├── src/
│   ├── components/
│   │   └── ui/                                 # Design System (Button, Input, Modal, Card, Badge)
│   ├── context/
│   │   ├── AuthContext.tsx                     # Supabase Auth & Session Restoration
│   │   ├── ThemeContext.tsx                    # Light/Dark/System Theme Manager
│   │   └── ToastContext.tsx                    # Toast Notification Engine
│   ├── layouts/
│   │   ├── PublicLayout.tsx                    # Marketing & Navigation Layout
│   │   └── AppLayout.tsx                       # Responsive Student Workspace Sidebar
│   ├── pages/
│   │   ├── public/                             # Landing, Features, About, Contact, Privacy, Terms
│   │   ├── auth/                               # Login, Register, Forgot/Reset Password, Verify Email
│   │   └── app/                                # Dashboard, Tasks, Timetable, Subjects, Recovery,
│   │                                           # Goals, Focus Timer, Analytics, Settings
│   ├── services/
│   │   ├── api.ts                              # Unified API Service Layer
│   │   ├── supabaseClient.ts                   # Supabase Client Initialization
│   │   └── mockStorage.ts                      # LocalStorage Persistence Engine
│   ├── types/
│   │   └── index.ts                            # Core TypeScript Interfaces & Enums
│   └── utils/
│       ├── dateUtils.ts                        # Date, Time & Slot Formatting
│       └── recoveryEngine.ts                   # Signature Recovery Engine Logic
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🔒 Security & Data Isolation

- **Row-Level Security (RLS):** Every single database row has an `auth.uid() = user_id` policy applied.
- **No Service-Role Key Exposure:** The browser client only consumes the public `anon` key.
- **Username Resolution:** Login handles usernames by calling a `SECURITY DEFINER` function that does not expose full user tables or email lists to the browser.
- **Authentication Enumeration Defense:** Generic, timing-consistent error messages.

---

## 📜 License

MIT License. Designed and engineered for students worldwide.

