import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Timer as TimerIcon,
  Coffee,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { api } from '../../services/api';
import { Task, Subject, FocusSession, TimerMode } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const FocusTimerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const linkedTaskId = searchParams.get('taskId');
  const { success } = useToast();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(25 * 60);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(linkedTaskId || '');
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [subs, ts, sess] = await Promise.all([
          api.subjects.getSubjects(),
          api.tasks.getTasks(),
          api.focus.getFocusSessions(),
        ]);
        setSubjects(subs);
        setTasks(ts);
        setRecentSessions(sess);

        if (linkedTaskId) {
          const matched = ts.find((t) => t.id === linkedTaskId);
          if (matched && matched.subject_id) {
            setSelectedSubjectId(matched.subject_id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadMetadata();
  }, [linkedTaskId]);

  const setTimerMode = (newMode: TimerMode, durationMinutes: number) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    const secs = durationMinutes * 60;
    setTotalSessionSeconds(secs);
    setSecondsRemaining(secs);
  };

  // Timer Tick Handling with exact delta
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSessionSeconds, mode, selectedSubjectId, selectedTaskId]);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 587.33; // D5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // quiet fallback
    }
  };

  const handleCompleteSession = async () => {
    setIsRunning(false);
    playBeep();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // quiet fallback
    }

    const durationMins = Math.round(totalSessionSeconds / 60);

    try {
      const newSession = await api.focus.logSession({
        user_id: 'user',
        subject_id: selectedSubjectId || null,
        task_id: selectedTaskId || null,
        duration_minutes: durationMins,
        actual_minutes: durationMins,
        mode,
        notes: `Completed ${mode} session.`,
        completed_at: new Date().toISOString(),
      });

      setRecentSessions((prev) => [newSession, ...prev]);
      success(
        'Focus Session Completed! 🎉',
        `Logged ${durationMins} minutes of study towards your daily target.`
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsRemaining(totalSessionSeconds);
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    totalSessionSeconds > 0
      ? Math.round(((totalSessionSeconds - secondsRemaining) / totalSessionSeconds) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Synchronized Focus Room
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Eliminate distractions. Log actual minutes directly to your course tasks and syllabus.
        </p>
      </div>

      {/* Main Focus Card */}
      <Card className="p-8 sm:p-12 text-center space-y-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Mode Selector */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 gap-1 text-xs font-semibold">
          <button
            onClick={() => setTimerMode('pomodoro', 25)}
            className={`px-4 py-2 rounded-xl transition-all ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => setTimerMode('short_break', 5)}
            className={`px-4 py-2 rounded-xl transition-all ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setTimerMode('long_break', 15)}
            className={`px-4 py-2 rounded-xl transition-all ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
          <button
            onClick={() => setTimerMode('custom', 50)}
            className={`px-4 py-2 rounded-xl transition-all ${
              mode === 'custom'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Deep Focus (50m)
          </button>
        </div>

        {/* Big Circular Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-brand-600 transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {timeDisplay}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {isRunning ? 'Session Active' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Association Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
            >
              <option value="">General Study</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code || sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Linked Task</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white truncate"
            >
              <option value="">No Specific Task</option>
              {tasks
                .filter((t) => !t.is_completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 shadow-lg shadow-brand-500/25"
            leftIcon={isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5 text-slate-500" />
          </Button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </Card>

      {/* Focus History Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TimerIcon className="w-5 h-5 text-brand-600" />
          Recent Focus Sessions ({recentSessions.length})
        </h3>

        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {session.mode}
                    </span>
                    {session.subject && (
                      <span
                        className="px-2 py-0.5 rounded font-semibold text-white text-[10px]"
                        style={{ backgroundColor: session.subject.color }}
                      >
                        {session.subject.code || session.subject.name}
                      </span>
                    )}
                    {session.task && (
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                        {session.task.title}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {new Date(session.completed_at).toLocaleString()}
                  </p>
                </div>

                <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                  +{session.actual_minutes} mins
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

