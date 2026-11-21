import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="border-b border-paper-border dark:border-slate-800 pb-6">
        <h1 className="font-editorial text-4xl font-medium text-charcoal-primary dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">Effective Date: November 2026</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-6 text-sm text-charcoal-muted dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">1. Information We Collect</h2>
          <p>
            StudyFlow collects student account credentials (username, verified email address), academic timetables, task descriptions, syllabus topics, and focus session durations strictly to deliver student productivity services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">2. Supabase Row-Level Security (RLS)</h2>
          <p>
            All user data is stored within PostgreSQL with Row-Level Security (RLS) policies permanently enforced. Every database query is strictly filtered by the authenticated user's ID. No student can access, query, or modify another student's timetable or records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">3. Third-Party Sharing</h2>
          <p>
            We do not sell student data, behavioral study logs, or course documents to advertising networks or third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">4. Account Deletion</h2>
          <p>
            Students have full control over their academic records and may delete their accounts and all associated data at any time via Settings.
          </p>
        </section>
      </div>
    </div>
  );
};
