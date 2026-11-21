import React from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  BookOpen,
  Calendar,
  Timer,
  BarChart3,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Every tool you need to excel academically
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          StudyFlow isn't just a to-do list. It is an end-to-end academic operating system designed around how students actually study, get overwhelmed, and recover.
        </p>
      </div>

      {/* Feature 1: Recovery Engine */}
      <div id="recovery" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-semibold">
            <LifeBuoy className="w-4 h-4" />
            Signature Innovation
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            The StudyFlow Recovery Engine
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every student experiences days where sickness, project spikes, or life events derail their study plan. Conventional apps simply accumulate overdue tasks, triggering demotivating red badges and anxiety.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Deterministic Slot Matching:</strong> Evaluates task duration, priorities, and existing class timetables.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Workload Conflict Warning:</strong> Flags upcoming days that risk exceeding 8 hours of combined lectures and tasks.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Explicit Approval:</strong> Never silently moves your schedule. You approve or reject every proposal.</span>
            </li>
          </ul>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500">Recovery Proposal</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">High Urgency</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Physics 41 Lab Report</p>
            <p className="text-xs text-slate-500">Due Yesterday · 90 min estimated duration</p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium pt-1">
              Proposed slot: Thursday 16:00 - 17:30 (No lectures scheduled, daylight focus window)
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button size="sm">Accept Proposal</Button>
          </div>
        </div>
      </div>

      {/* Feature 2: Syllabus Progress Tracker */}
      <div id="syllabus" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">CS 106B Syllabus Progress</h4>
            <span className="text-xs font-bold text-emerald-600">68% Complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">Unit 1: C++ ADTs & STL</span>
              <span className="text-emerald-600 font-semibold">100% (3/3 Topics)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">Unit 2: Recursion & Backtracking</span>
              <span className="text-amber-600 font-semibold">50% (1/2 Topics)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">Unit 3: Trees & Graphs</span>
              <span className="text-slate-500 font-semibold">0% (0/2 Topics)</span>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4" />
            Curriculum Alignment
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Syllabus Progress Tracker
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Course grades depend on mastering concepts, not merely finishing arbitrary tasks. StudyFlow lets you mirror your official university syllabus unit by unit.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Create subjects with custom colors, codes, and credit hours.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Divide units into digestible topics with estimated study times.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Watch your mastery metrics grow in real-time as exam day nears.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature 3: Smart Timetable & Focus Timer */}
      <div id="timetable" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
            <Calendar className="w-4 h-4" />
            Connected Execution
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Smart Timetable & Focus Timer
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminate context-switching between your calendar, timer, and notes. Run focused Pomodoro sessions directly against your assignments and track precise study times.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Weekly recurring timetable with conflict detection.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Customizable focus intervals (Pomodoro 25/5 or deep 50/10).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Session history automatically increments actual task hours.</span>
            </li>
          </ul>
        </div>
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-center space-y-6">
          <div className="w-40 h-40 mx-auto rounded-full border-4 border-brand-500 flex flex-col items-center justify-center bg-brand-50/30 dark:bg-brand-950/20">
            <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">25:00</span>
            <span className="text-xs uppercase font-bold text-brand-600 tracking-wider mt-1">Pomodoro Focus</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Working on: <strong>Linear Algebra Problem Set 4</strong>
          </div>
          <Button size="md" className="px-8">Start Focus Session</Button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-12 text-center">
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Start Using StudyFlow Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
