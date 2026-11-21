import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="border-b border-paper-border dark:border-slate-800 pb-6">
        <h1 className="font-editorial text-4xl font-medium text-charcoal-primary dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">Effective Date: November 2026</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-6 text-sm text-charcoal-muted dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By creating an account or accessing StudyFlow, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">2. Acceptable Use</h2>
          <p>
            StudyFlow is provided for personal academic organization, scheduling, and study tracking. Users agree not to misuse our authentication systems, attempt unauthorized database access, or reverse-engineer the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-primary dark:text-white">3. Academic Responsibility</h2>
          <p>
            While the Recovery Engine provides automated schedule suggestions, students remain responsible for meeting their institution's deadlines and academic integrity guidelines.
          </p>
        </section>
      </div>
    </div>
  );
};
