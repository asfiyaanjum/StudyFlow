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
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Personal Academic Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Plan smarter. Study consistently.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600">
            Stay ahead.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Not another generic note-taking app. StudyFlow connects your lectures, deadlines, syllabus topics, and focus sessions into one intelligent engine — with automatic recovery when you fall behind.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-brand-500/25" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Get Started — Free Forever
            </Button>
          </Link>
          <Link to="/features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-3.5">
              Explore Academic Features
            </Button>
          </Link>
        </div>

        {/* Product Preview Card */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-6 shadow-2xl shadow-brand-500/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Card 1: Today's Schedule */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <span>Smart Timetable</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">Today</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">CS 106B Lecture</p>
                      <p className="text-[10px] text-slate-500">09:30 AM · NVIDIA Hall</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">Class</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Linear Algebra Problem Set</p>
                      <p className="text-[10px] text-slate-500">02:00 PM · 90m Focus</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">Study</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Signature Recovery Engine */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase">
                  <span className="flex items-center gap-1.5">
                    <LifeBuoy className="w-4 h-4 text-brand-600" />
                    Recovery Engine
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">1 Overdue</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800/80 space-y-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Maze Solver Backtracking
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Overdue by 1 day. Suggested open slot: <strong>Tomorrow at 03:00 PM</strong> (won't exceed 8h cap).
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button className="text-[11px] px-2.5 py-1 rounded-md bg-brand-600 text-white font-medium hover:bg-brand-700">
                      Approve Reschedule
                    </button>
                    <button className="text-[11px] px-2 py-1 rounded-md text-slate-500 hover:text-slate-700">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Consistency Analytics */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <span>Weekly Consistency</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">5-Day Streak</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">21.5h</span>
                    <span className="text-xs text-emerald-600 font-semibold">+4.2h vs last week</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }} />
                  </div>
                  <p className="text-[10px] text-slate-500">86% of 25h weekly study goal achieved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Built specifically for academic reality
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Most productivity apps assume a simple to-do list is enough. StudyFlow is designed around semesters, syllabi, class timetables, and academic recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              StudyFlow Recovery Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When exams, sickness, or unexpected events cause you to fall behind, StudyFlow doesn't let you drown in red overdue badges. It calculates available gaps and suggests realistic, non-conflicting catch-up slots. You always maintain full control.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Syllabus Progress Tracker
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Structure subjects by official units and topics. Check off concepts as you master them and see your completion percentages update dynamically with real progress metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Integrated Timetable & Planning
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect lectures, labs, and personal study windows. StudyFlow warns you before you overload any single day past healthy cognitive limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Synchronized Focus Timer
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Full Pomodoro and customizable study timer attached directly to your tasks and subjects. Handles browser refresh smoothly and updates your actual study duration.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Consistency Analytics
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Review weekly study distribution, track streaks, and analyze which subjects receive too much or too little focus. Driven 100% by your real study logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Total Privacy & Security
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Protected by PostgreSQL Row-Level Security (RLS). Every student’s notes, timetable, and study data are strictly isolated and never sold or shared.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              How StudyFlow Works in Practice
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Three simple steps to transition from chaotic cramming to calm, predictable consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Set Up Your Academic Base</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add your current subjects, class schedule, and upcoming syllabus units. StudyFlow maps your fixed lecture hours against free study blocks.
              </p>
            </div>

            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Execute Daily Focus Sessions</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Work through prioritized tasks using the integrated Pomodoro focus timer. Check off syllabus topics as your understanding deepens.
              </p>
            </div>

            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Recover Instantly When Life Happens</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Missed a day? The Recovery Engine detects overdue items and proposes an intelligent, balanced catch-up schedule that you can approve with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to master your semester?
          </h2>
          <p className="text-base sm:text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of college and university students who have replaced scattered notes and stressful all-nighters with StudyFlow.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-3.5 shadow-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

