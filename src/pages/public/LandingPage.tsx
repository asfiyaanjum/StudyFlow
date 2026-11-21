import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LifeBuoy,
  Calendar,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Timer,
  Sparkles,
  Zap,
  Target,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32 py-10 sm:py-16 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold animate-fade-in shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>The Academic Operating System for College Students</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-charcoal-primary dark:text-white max-w-4xl mx-auto leading-[1.08]">
          Plan smarter. Study consistently.{' '}
          <span className="italic text-brand-600 dark:text-brand-400">
            Recover when behind.
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-charcoal-muted dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Not another generic to-do list. StudyFlow brings your class timetable, syllabus units, study sessions, and exams into one coherent system — with an autonomous Recovery Engine that reschedules missed work without guilt.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-8 py-3.5 shadow-subtle" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 py-3.5 border-paper-border dark:border-slate-700">
              Explore Academic System
            </Button>
          </Link>
        </div>

        {/* Live Academic Dashboard Preview Card */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl border border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-card text-left space-y-6">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-charcoal-light dark:text-slate-500">
                  StudyFlow Workspace — Fall Semester
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Recovery Engine Active</span>
              </div>
            </div>

            {/* Dashboard Inner Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Greeting & Schedule */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60">
                  <div className="text-[11px] font-semibold text-charcoal-light dark:text-slate-400 uppercase tracking-wider mb-1">
                    ☀️ MORNING SESSION
                  </div>
                  <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
                    Good morning, Alex
                  </h3>
                  <p className="text-xs italic font-editorial text-brand-800 dark:text-brand-300 mt-0.5">
                    "Small deliberate steps every morning compound into mastery."
                  </p>
                </div>

                {/* Due Soon Tasks */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400 px-1">
                    <span>Priority Tasks Due Soon</span>
                    <Link to="/features" className="text-brand-600 hover:underline">View All</Link>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="font-medium text-charcoal-primary dark:text-white">Operating Systems Lab 4</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">CS 301</span>
                    </div>
                    <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full font-medium">
                      42m left
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-medium text-charcoal-primary dark:text-white">Algorithms Problem Set 3</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">CS 304</span>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full font-medium">
                      3h 15m left
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Recovery Engine & Syllabus Progress */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-300">
                    <LifeBuoy size={14} />
                    <span>Recovery Engine</span>
                  </div>
                  <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
                    Detected 1 overloaded slot tomorrow. Recommended moving <strong>Calculus Revision</strong> to Friday 2:00 PM.
                  </p>
                  <div className="inline-flex items-center text-[11px] font-medium text-brand-700 dark:text-brand-400">
                    Auto-Optimization Ready →
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-paper-canvas dark:bg-slate-800/60 border border-paper-border dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium text-charcoal-primary dark:text-white">
                    <span>Syllabus Completion</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">68%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-paper-border dark:bg-slate-700 overflow-hidden">
                    <div className="w-[68%] h-full bg-brand-600 rounded-full" />
                  </div>
                  <p className="text-[11px] text-charcoal-light dark:text-slate-400">
                    14 of 22 topics mastered across 4 enrolled subjects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Pillars of the StudyFlow System */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-charcoal-primary dark:text-white">
            Engineered around how students actually study
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Standard productivity apps treat college work like corporate project tickets. StudyFlow is designed around semesters, syllabi, and academic cognitive fatigue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Academic Timetable & Schedule
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Define your recurring weekly classes, labs, and tutorials. Visual indicators highlight current ongoing lectures and available study gaps.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Syllabus & Topic Mastery
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Break down subject syllabi into units and discrete topics. Track completion percentages so you walk into exams knowing exactly what you covered.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LifeBuoy size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Autonomous Recovery Engine
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              When life gets in the way, StudyFlow calculates cognitive capacity overload and recommends realistic rescheduling without the anxiety spiral.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Timer size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Distraction-Free Focus Mode
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Integrated Pomodoro and deep work timers tied directly to specific tasks and subjects, logging actual study duration to your profile.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Target size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Sub-Milestone Study Plans
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Set semester GPA goals and weekly study plans. Check off granular sub-milestones as you revise textbook chapters and practice problem sets.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-3 hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Consistency & Analytics
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              View daily study trends, subject time distributions, and consistency streaks to evaluate your study discipline across the entire semester.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white">
            The StudyFlow Method: Three Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            A sustainable cadence that keeps you ahead from syllabus week to finals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-editorial text-2xl font-bold text-brand-600 dark:text-brand-400">01</span>
            <h4 className="text-base font-bold text-charcoal-primary dark:text-white">Input & Structure</h4>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Add your subjects, timetable, and syllabus topics at the start of the semester. Set your daily study target.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-editorial text-2xl font-bold text-brand-600 dark:text-brand-400">02</span>
            <h4 className="text-base font-bold text-charcoal-primary dark:text-white">Execute & Focus</h4>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Use live deadline countdowns and the focus timer to knock out tasks in distraction-free intervals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-editorial text-2xl font-bold text-brand-600 dark:text-brand-400">03</span>
            <h4 className="text-base font-bold text-charcoal-primary dark:text-white">Recover & Adapt</h4>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
              When assignments bottleneck, activate the Recovery Engine to rebalance your calendar into manageable time slots.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-600 text-white shadow-card text-center space-y-6">
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
            Stop juggling spreadsheets and alarms.
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Join students who plan their courses with intention, study with deep focus, and recover with confidence.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-paper-100 font-semibold shadow-subtle px-8 py-3.5">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
