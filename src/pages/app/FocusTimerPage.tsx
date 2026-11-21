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
  Clock,
  History,
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
        setTasks(ts.filter((t) => !t.is_completed));
        setRecentSessions(sess);

        if (linkedTaskId) {
          const t = ts.find((item) => item.id === linkedTaskId);
          if (t && t.subject_id) {
            setSelectedSubjectId(t.subject_id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadMetadata();
  }, [linkedTaskId]);

  // Mode durations in minutes
  const MODE_DURATIONS: Record<TimerMode, number> = {
    pomodoro: 25,
    short_break: 5,
    long_break: 15,
    custom: 45,
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    const secs = MODE_DURATIONS[newMode] * 60;
    setSecondsRemaining(secs);
    setTotalSessionSeconds(secs);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // audio context silent fail
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    playBeep();

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    const elapsedMins = Math.round(totalSessionSeconds / 60);

    try {
      const session = await api.focus.logSession({
        user_id: 'user',
        subject_id: selectedSubjectId || null,
        task_id: selectedTaskId || null,
        duration_minutes: elapsedMins,
        actual_minutes: elapsedMins,
        mode,
        completed_at: new Date().toISOString(),
      });
      setRecentSessions((prev) => [session, ...prev]);
      success('Focus Session Finished', `Logged ${elapsedMins} minutes of study time!`);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSessionSeconds, mode, selectedSubjectId, selectedTaskId]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    const secs = MODE_DURATIONS[mode] * 60;
    setSecondsRemaining(secs);
  };

  const formatDigits = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage (0 to 100)
  const progressPct = Math.round(((totalSessionSeconds - secondsRemaining) / totalSessionSeconds) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-paper-border dark:border-slate-800 pb-5">
        <h1 className="font-editorial text-4xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Distraction-Free Focus
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
          Immerse yourself in deliberate study intervals linked to your courses.
        </p>
      </div>

      {/* Main Focus Dial Card */}
      <Card className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-card flex flex-col items-center justify-center text-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'pomodoro'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal-primary'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal-primary'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'long_break'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal-primary'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Serene Timer Display */}
        <div className="space-y-3">
          <div className="font-editorial text-7xl sm:text-8xl lg:text-9xl font-medium text-charcoal-primary dark:text-white tabular-nums tracking-tighter select-none">
            {formatDigits(secondsRemaining)}
          </div>
          <div className="w-48 sm:w-64 mx-auto h-2 rounded-full bg-paper-border dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                mode === 'pomodoro' ? 'bg-brand-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-charcoal-muted hover:text-charcoal-primary transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>

          <Button
            size="lg"
            onClick={toggleTimer}
            className="px-8 py-3.5 text-base shadow-subtle min-w-[140px]"
            leftIcon={isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-charcoal-muted hover:text-charcoal-primary transition-colors"
            title={soundEnabled ? 'Mute Alert' : 'Enable Alert'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Context Linking: Subject & Task */}
        <div className="w-full max-w-md pt-6 border-t border-paper-border dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-charcoal-light dark:text-slate-400 uppercase tracking-wide mb-1">
              Course Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-charcoal-primary dark:text-white"
            >
              <option value="">No Subject Linked</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-light dark:text-slate-400 uppercase tracking-wide mb-1">
              Active Task
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-charcoal-primary dark:text-white truncate"
            >
              <option value="">No Task Linked</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Focus History */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white flex items-center gap-2">
          <History size={18} /> Recent Focus Sessions
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-charcoal-muted dark:text-slate-400 italic p-4 text-center">
            No completed focus sessions yet. Hit "Start Focus" to log your first session.
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.slice(0, 6).map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                  <div>
                    <span className="font-medium text-charcoal-primary dark:text-white block">
                      {sess.subject?.name || 'General Study Session'}
                    </span>
                    {sess.task && (
                      <span className="text-[11px] text-charcoal-muted">Task: {sess.task.title}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-brand-600 block">{sess.actual_minutes} mins</span>
                  <span className="text-[10px] text-charcoal-light">
                    {new Date(sess.completed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
