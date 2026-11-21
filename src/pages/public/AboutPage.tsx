import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Target, Shield, Heart, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Compass size={13} /> Our Academic Mission
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Why we built StudyFlow
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          College students don't need another blank canvas or generic kanban board. They need an intentional system that understands semesters, syllabi, and academic momentum.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle text-charcoal-primary dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        <h2 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
          The Disconnected Academic Experience
        </h2>
        <p>
          Students today juggle five to seven different applications: one for their lecture timetable, another for to-do items, a separate timer app, cloud drives for notes, and scattered syllabus PDFs.
        </p>
        <p>
          When midterms arrive, tasks inevitably spill over. In traditional tools, overdue items simply turn red and multiply. Students feel paralyzed by anxiety rather than empowered with a realistic, guilt-free path forward.
        </p>
        <p>
          We designed <strong>StudyFlow</strong> as a calm, purposeful academic operating system. It treats study planning as an integrated feedback loop: align with your syllabus, execute in deep work blocks, and autonomously recover when life throws off your rhythm.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-medium text-charcoal-primary dark:text-white">
            Curriculum Alignment
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Planning should never be divorced from your course syllabus. We connect daily tasks directly to units, topics, and credit weights.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-medium text-charcoal-primary dark:text-white">
            Self-Compassion
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Falling behind is a natural reality of rigorous student life. Our Recovery Engine helps you adjust without demotivating shame or guilt.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-medium text-charcoal-primary dark:text-white">
            Privacy & Trust
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Your notes, timetables, and academic records are your private property, protected by Supabase Row Level Security.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight size={16} />}>
            Join StudyFlow Today
          </Button>
        </Link>
      </div>
    </div>
  );
};
