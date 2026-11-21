import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="text-xs text-slate-500">Effective Date: November 2026</p>

      <div className="prose dark:prose-invert max-w-none text-sm space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p>
            StudyFlow collects student account credentials (username, verified email address), academic timetables, task descriptions, syllabus topics, and focus session durations to provide our academic productivity services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Security & Row-Level Security (RLS)</h2>
          <p>
            All user data is stored within Supabase PostgreSQL instances with Row-Level Security (RLS) enabled. Each query is strictly isolated by authenticated user IDs. No student can read or modify another student's tasks, notes, or schedules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or monetize your academic records, habits, or personal contact details with third-party advertisers or educational data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Data Deletion</h2>
          <p>
            You may request complete account and data deletion at any time from your Settings page or by contacting support@studyflow.app.
          </p>
        </section>
      </div>
    </div>
  );
};

