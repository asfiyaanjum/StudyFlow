import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Target, Shield, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-xs font-semibold">
          Our Mission
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Why we built StudyFlow
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          College students don't need another blank canvas. They need an active system that helps them plan realistically, study consistently, and recover when life happens.
        </p>
      </div>

      {/* The Problem */}
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          The Disconnected Academic Experience
        </h2>
        <p>
          Students today juggle five to seven different applications: one for their lecture timetable, another for to-do items, a separate timer app, Google Drive for notes, and scattered syllabus PDFs.
        </p>
        <p>
          When midterms arrive, tasks inevitably spill over. In traditional tools, overdue items simply turn red and multiply. Students feel paralyzed by anxiety rather than empowered with a realistic way forward.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Execution Over Decoration</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We prioritize real academic habits over spending hours organizing aesthetic templates. StudyFlow is designed for high-focus action.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compassionate Recovery</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Falling behind is normal. Our signature Recovery Engine treats slips as scheduling problems to solve constructively, not moral failures.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uncompromising Privacy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your university assignments, grades, and study habits belong only to you. We apply strict Row-Level Security at the database layer.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Experience StudyFlow Today
          </Button>
        </Link>
      </div>
    </div>
  );
};

