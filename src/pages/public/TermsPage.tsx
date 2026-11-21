import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="text-xs text-slate-500">Effective Date: November 2026</p>

      <div className="prose dark:prose-invert max-w-none text-sm space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By creating an account or accessing StudyFlow, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Acceptable Use</h2>
          <p>
            StudyFlow is provided for personal academic organization, planning, and study. Users agree not to misuse our authentication systems, attempt unauthorized database access, or reverse-engineer the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Academic Responsibility</h2>
          <p>
            StudyFlow is a personal productivity tool. Students remain solely responsible for adhering to their institution's deadlines, academic honor codes, and syllabus requirements.
          </p>
        </section>
      </div>
    </div>
  );
};
