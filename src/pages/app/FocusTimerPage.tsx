import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Plus,
  Minus,
  FastForward,
  LogOut,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { Task, Subject, FocusSession, TimerMode } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  calculateAutomaticBreakCount,
  generateFocusTimeline,
  FocusTimelineSchedule,
  FocusSegment,
  PersistedFocusSession,
  saveActiveFocusSession,
  loadActiveFocusSession,
  clearActiveFocusSession,
} from '../../utils/focusTimerEngine';

type SessionStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed' | 'interrupted';

// Presets: Keep ONLY 15, 25, 60, 150 minutes in this exact order
const PRESET_DURATIONS = [15, 25, 60, 150];
const BREAK_DURATION_OPTIONS = [3, 5, 10, 15];

export const FocusTimerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const linkedTaskId = searchParams.get('taskId');
  const { success, warning } = useToast();

  // Database metadata
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(linkedTaskId || '');
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);

  // Setup options (Idle state)
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);
  const [breaksEnabled, setBreaksEnabled] = useState<boolean>(true);

  // Active Session State
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [segmentSecondsRemaining, setSegmentSecondsRemaining] = useState<number>(25 * 60);
  const [actualFocusSecondsCompleted, setActualFocusSecondsCompleted] = useState<number>(0);
  const [breaksTakenCount, setBreaksTakenCount] = useState<number>(0);
  const [breaksSkippedCount, setBreaksSkippedCount] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Background away prompt modal
  const [showSteppedAwayModal, setShowSteppedAwayModal] = useState<boolean>(false);
  const [steppedAwaySeconds, setSteppedAwaySeconds] = useState<number>(0);
  const awayTimestampRef = useRef<number | null>(null);

  // Sound preference & audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Completion summary modal data
  const [completedSummary, setCompletedSummary] = useState<{
    focusMinutes: number;
    breaksTaken: number;
    breaksSkipped: number;
    totalElapsedMinutes: number;
    isInterrupted?: boolean;
  } | null>(null);

  // References to keep current values accessible in callbacks/effects without stale closures
  const focusDurationMinutesRef = useRef(focusDurationMinutes);
  focusDurationMinutesRef.current = focusDurationMinutes;
  const actualFocusSecondsRef = useRef(actualFocusSecondsCompleted);
  actualFocusSecondsRef.current = actualFocusSecondsCompleted;
  const statusRef = useRef(status);
  statusRef.current = status;

  // Calculated timeline schedule based on setup
  const currentSchedule: FocusTimelineSchedule = useMemo(() => {
    const breakCount = breaksEnabled ? calculateAutomaticBreakCount(focusDurationMinutes) : 0;
    return generateFocusTimeline(focusDurationMinutes, breakCount, breakDurationMinutes);
  }, [focusDurationMinutes, breaksEnabled, breakDurationMinutes]);

  // Request browser notification permission once on interaction
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  }, []);

  // Audio tone generator
  const playAlertChime = useCallback((isBreak: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBreak ? 523.25 : 659.25, audioCtx.currentTime); // C5 or E5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch {
      // AudioContext fallback
    }
  }, [soundEnabled]);

  // Load database metadata and restore any persisted session
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
        console.error('Error loading metadata:', e);
      }
    };
    loadMetadata();

    // Check for recoverable session in localStorage
    const saved = loadActiveFocusSession();
    if (saved && (saved.status === 'running' || saved.status === 'paused' || saved.status === 'break')) {
      const now = Date.now();
      const elapsedSinceUpdateSecs = Math.max(0, Math.floor((now - saved.lastUpdatedTimestamp) / 1000));
      
      setFocusDurationMinutes(saved.totalFocusMinutes);
      setBreakDurationMinutes(saved.breakDurationMinutes);
      setSelectedSubjectId(saved.subjectId || '');
      setSelectedTaskId(saved.taskId || '');
      setCurrentSegmentIndex(saved.currentSegmentIndex);
      setActualFocusSecondsCompleted(saved.actualFocusSecondsCompleted);
      setBreaksTakenCount(saved.breaksTaken);
      setBreaksSkippedCount(saved.breaksSkipped);
      setSessionStartTime(saved.startedAtTimestamp);

      // If it was paused when saved, restore in paused state with exact remaining seconds
      if (saved.status === 'paused') {
        setStatus('paused');
        setSegmentSecondsRemaining(saved.segmentSecondsRemaining);
      } else {
        // If it was running or in break, adjust for background elapsed time
        const newRemaining = saved.segmentSecondsRemaining - elapsedSinceUpdateSecs;
        if (newRemaining > 0) {
          setSegmentSecondsRemaining(newRemaining);
          setStatus(saved.status);
          if (saved.status === 'running') {
            setActualFocusSecondsCompleted((prev) => prev + elapsedSinceUpdateSecs);
          }
        } else {
          // If the segment finished while page was closed, restore remaining as 0 for safe transition
          setSegmentSecondsRemaining(0);
          setStatus(saved.status);
        }
      }
    }
  }, [linkedTaskId]);

  // Current active segment
  const activeSegment: FocusSegment | undefined = currentSchedule.segments[currentSegmentIndex];

  // Persist session snapshot on changes
  useEffect(() => {
    if (status === 'running' || status === 'paused' || status === 'break') {
      const snapshot: PersistedFocusSession = {
        sessionId: 'session-' + (sessionStartTime || Date.now()),
        totalFocusMinutes: focusDurationMinutes,
        breakDurationMinutes,
        breakCount: currentSchedule.breakCount,
        subjectId: selectedSubjectId || null,
        taskId: selectedTaskId || null,
        status,
        currentSegmentIndex,
        segmentSecondsRemaining,
        actualFocusSecondsCompleted,
        breaksTaken: breaksTakenCount,
        breaksSkipped: breaksSkippedCount,
        lastUpdatedTimestamp: Date.now(),
        startedAtTimestamp: sessionStartTime || Date.now(),
        pausedAtTimestamp: status === 'paused' ? Date.now() : null,
      };
      saveActiveFocusSession(snapshot);
    } else if (status === 'idle' || status === 'completed' || status === 'interrupted') {
      clearActiveFocusSession();
    }
  }, [
    status,
    currentSegmentIndex,
    segmentSecondsRemaining,
    actualFocusSecondsCompleted,
    breaksTakenCount,
    breaksSkippedCount,
    focusDurationMinutes,
    breakDurationMinutes,
    currentSchedule.breakCount,
    selectedSubjectId,
    selectedTaskId,
    sessionStartTime,
  ]);

  // Background away detection: when user switches tabs or leaves the page
  // Immediately records departure when tab is hidden, and immediately shows prompt when user returns.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden / switched away: record departure timestamp immediately if running
        if (statusRef.current === 'running') {
          awayTimestampRef.current = Date.now();
        }
      } else {
        // Tab visible / user returned: immediately show prompt if departed while running
        if (awayTimestampRef.current && statusRef.current === 'running') {
          const awaySecs = Math.max(1, Math.floor((Date.now() - awayTimestampRef.current) / 1000));
          awayTimestampRef.current = null;
          setSteppedAwaySeconds(awaySecs);
          setShowSteppedAwayModal(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Main countdown tick loop (1 second interval)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (status === 'running' || status === 'break') {
      interval = setInterval(() => {
        setSegmentSecondsRemaining((prevSecs) => {
          if (prevSecs <= 1) {
            // Segment finished, advance to next segment or complete session
            handleSegmentComplete();
            return 0;
          }
          return prevSecs - 1;
        });

        // Break time must NEVER count towards pure focus study time!
        if (status === 'running') {
          setActualFocusSecondsCompleted((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, currentSegmentIndex, currentSchedule]);

  // Segment advancement
  const handleSegmentComplete = () => {
    playAlertChime(activeSegment?.type === 'focus');

    const nextIndex = currentSegmentIndex + 1;
    if (nextIndex < currentSchedule.segments.length) {
      const nextSegment = currentSchedule.segments[nextIndex];
      setCurrentSegmentIndex(nextIndex);
      setSegmentSecondsRemaining(nextSegment.durationSeconds);

      if (nextSegment.type === 'break') {
        setStatus('break');
        setBreaksTakenCount((prev) => prev + 1);
        sendBrowserNotification('Time for a Break!', 'Take a breather to recharge. Great job staying focused!');
        success('Break Time', `Enjoy a ${Math.round(nextSegment.durationSeconds / 60)}-minute restorative break.`);
      } else {
        setStatus('running');
        sendBrowserNotification('Break Over - Focus Time', 'Ready to resume? Diving into your next study interval!');
        success('Focus Resumed', 'Break finished. Back to deliberate study!');
      }
    } else {
      // Entire session completed
      finalizeSession(false);
    }
  };

  // Start a new session from setup
  const handleStartSession = () => {
    requestNotificationPermission();
    if (focusDurationMinutes <= 0) return;

    const firstSegment = currentSchedule.segments[0];
    setCurrentSegmentIndex(0);
    setSegmentSecondsRemaining(firstSegment ? firstSegment.durationSeconds : focusDurationMinutes * 60);
    setActualFocusSecondsCompleted(0);
    setBreaksTakenCount(0);
    setBreaksSkippedCount(0);
    setSessionStartTime(Date.now());
    setStatus('running');
    success('Focus Session Started', `${focusDurationMinutes} minutes of deliberate study ahead.`);
  };

  // Skip current break and immediately advance to next focus segment
  const handleSkipBreak = () => {
    const nextIndex = currentSegmentIndex + 1;
    setBreaksSkippedCount((prev) => prev + 1);

    if (nextIndex < currentSchedule.segments.length) {
      const nextSegment = currentSchedule.segments[nextIndex];
      setCurrentSegmentIndex(nextIndex);
      setSegmentSecondsRemaining(nextSegment.durationSeconds);
      setStatus(nextSegment.type === 'focus' ? 'running' : 'break');
      success('Break Skipped', 'Resuming focus interval.');
    } else {
      finalizeSession(false);
    }
  };

  // Start break early if currently running focus
  const handleStartBreakEarly = () => {
    const nextBreakIndex = currentSchedule.segments.findIndex(
      (s, idx) => idx > currentSegmentIndex && s.type === 'break'
    );

    if (nextBreakIndex !== -1) {
      setCurrentSegmentIndex(nextBreakIndex);
      setSegmentSecondsRemaining(currentSchedule.segments[nextBreakIndex].durationSeconds);
      setStatus('break');
      setBreaksTakenCount((prev) => prev + 1);
      success('Break Started Early', 'Take a quick rest now.');
    } else {
      // No more scheduled breaks; allow a quick 5m pause/break
      setSegmentSecondsRemaining(5 * 60);
      setStatus('break');
      setBreaksTakenCount((prev) => prev + 1);
    }
  };

  // Extend current break by minutes (+1, +5)
  const handleExtendBreak = (additionalMinutes: number) => {
    setSegmentSecondsRemaining((prev) => prev + additionalMinutes * 60);
    success('Break Extended', `Added ${additionalMinutes} min to your break.`);
  };

  // Pause / Resume
  const togglePauseResume = () => {
    if (status === 'running') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('running');
    } else if (status === 'break') {
      // Pausing during break
      setStatus('paused');
    }
  };

  // Finalize session (Completed or Interrupted) and persist to Supabase
  const finalizeSession = async (interrupted: boolean) => {
    setStatus(interrupted ? 'interrupted' : 'completed');
    clearActiveFocusSession();

    // Actual pure focused minutes:
    // If completed naturally: the full selected duration was achieved (e.g. 45m, 60m, 125m, 150m)
    // If interrupted: the actual focus seconds accumulated before leaving, or minimum 1m
    const currentSelectedDuration = focusDurationMinutesRef.current;
    const currentActualFocusSecs = actualFocusSecondsRef.current;
    
    const pureFocusedMinutes = interrupted
      ? Math.max(1, Math.round(currentActualFocusSecs / 60))
      : currentSelectedDuration;

    const totalElapsedSecs = sessionStartTime
      ? Math.max(pureFocusedMinutes * 60, Math.floor((Date.now() - sessionStartTime) / 1000))
      : pureFocusedMinutes * 60;
    const totalElapsedMins = Math.max(pureFocusedMinutes, Math.round(totalElapsedSecs / 60));

    if (!interrupted) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
      playAlertChime(false);
      sendBrowserNotification('Session Complete! 🎉', `You accomplished ${pureFocusedMinutes} minutes of pure focus!`);
    }

    setCompletedSummary({
      focusMinutes: pureFocusedMinutes,
      breaksTaken: breaksTakenCount,
      breaksSkipped: breaksSkippedCount,
      totalElapsedMinutes: totalElapsedMins,
      isInterrupted: interrupted,
    });

    try {
      const notesSummary = `Scheduled: ${currentSelectedDuration}m | Breaks taken: ${breaksTakenCount} | Breaks skipped: ${breaksSkippedCount} | Total elapsed: ${totalElapsedMins}m${
        interrupted ? ' (Interrupted early)' : ' (Completed)'
      }`;

      const saved = await api.focus.logSession({
        user_id: 'user',
        subject_id: selectedSubjectId || null,
        task_id: selectedTaskId || null,
        duration_minutes: currentSelectedDuration,
        actual_minutes: pureFocusedMinutes,
        mode: 'pomodoro',
        notes: notesSummary,
        completed_at: new Date().toISOString(),
      });

      setRecentSessions((prev) => [saved, ...prev]);

      if (!interrupted) {
        success('Focus Session Saved', `Logged ${pureFocusedMinutes} minutes of focused study!`);
      } else {
        warning('Session Ended', `Saved ${pureFocusedMinutes} minutes of study completed before stepping away.`);
      }
    } catch (e) {
      console.error('Failed to save focus session:', e);
    }
  };

  // Reset back to Setup
  const handleResetToSetup = () => {
    clearActiveFocusSession();
    setStatus('idle');
    setCompletedSummary(null);
    setCurrentSegmentIndex(0);
    setActualFocusSecondsCompleted(0);
    setBreaksTakenCount(0);
    setBreaksSkippedCount(0);
    setSessionStartTime(null);
    setSegmentSecondsRemaining(focusDurationMinutes * 60);
  };

  // Handle Stepped-Away Modal Choices
  const handleConfirmStayFocused = () => {
    setShowSteppedAwayModal(false);
  };

  const handleConfirmLeaveSession = () => {
    setShowSteppedAwayModal(false);
    finalizeSession(true);
  };

  // Format MM:SS or HH:MM:SS
  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress for current active segment
  const activeSegmentTotal = activeSegment?.durationSeconds || 1;
  const currentSegmentProgress = Math.min(
    100,
    Math.max(0, Math.round(((activeSegmentTotal - segmentSecondsRemaining) / activeSegmentTotal) * 100))
  );

  // Overall session focus progress
  const overallFocusProgress = Math.min(
    100,
    Math.max(0, Math.round((actualFocusSecondsCompleted / (focusDurationMinutes * 60)) * 100))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="text-center space-y-2 border-b border-paper-border dark:border-slate-800 pb-5">
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Distraction-Free Focus
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
          Deliberate study intervals with intelligent background tracking and automatic breaks.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. SETUP SCREEN (IDLE STATE)                                              */}
      {/* ========================================================================= */}
      {status === 'idle' && (
        <Card className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-card space-y-8 animate-fade-in">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-100 dark:border-brand-900">
              <Sparkles size={13} /> Focus Engine
            </span>
            <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white pt-2">
              Get ready to focus
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 max-w-md mx-auto">
              Select your focus duration. Automatic restorative breaks are scheduled so you stay energized.
            </p>
          </div>

          {/* Duration Selector with +/- controls */}
          <div className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => setFocusDurationMinutes((prev) => Math.max(5, prev - 5))}
                className="w-12 h-12 rounded-2xl border border-paper-border dark:border-slate-700 flex items-center justify-center text-charcoal-primary dark:text-white hover:bg-paper-canvas dark:hover:bg-slate-800 transition-colors shadow-xs active:scale-95"
                title="Decrease 5 minutes"
              >
                <Minus size={20} />
              </button>

              <div className="flex items-baseline gap-2 bg-paper-canvas dark:bg-slate-800/80 px-8 py-4 rounded-3xl border border-paper-border dark:border-slate-700 shadow-inner">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={focusDurationMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      setFocusDurationMinutes(Math.min(val, 480));
                    }
                  }}
                  className="font-editorial text-6xl sm:text-7xl font-semibold text-charcoal-primary dark:text-white w-32 sm:w-36 text-center bg-transparent focus:outline-none tabular-nums"
                />
                <span className="text-sm sm:text-base font-semibold text-charcoal-muted uppercase tracking-wider">
                  mins
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFocusDurationMinutes((prev) => Math.min(480, prev + 5))}
                className="w-12 h-12 rounded-2xl border border-paper-border dark:border-slate-700 flex items-center justify-center text-charcoal-primary dark:text-white hover:bg-paper-canvas dark:hover:bg-slate-800 transition-colors shadow-xs active:scale-95"
                title="Increase 5 minutes"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Quick-Select Presets */}
            <div className="w-full max-w-xl">
              <label className="block text-center text-[11px] font-semibold text-charcoal-muted dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Quick Duration Presets
              </label>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PRESET_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setFocusDurationMinutes(dur)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      focusDurationMinutes === dur
                        ? 'bg-brand-600 text-white font-semibold shadow-xs ring-2 ring-brand-400'
                        : 'bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 text-charcoal-muted hover:text-charcoal-primary dark:hover:text-white hover:border-brand-300'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Automatic Break Summary & Customization Banner */}
          <div className="rounded-2xl border border-paper-border dark:border-slate-800 bg-paper-canvas/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Coffee size={18} className="text-amber-500" />
                <span className="text-xs sm:text-sm font-semibold text-charcoal-primary dark:text-white">
                  Automatic Restorative Breaks
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal-muted">
                <input
                  type="checkbox"
                  checked={breaksEnabled}
                  onChange={(e) => setBreaksEnabled(e.target.checked)}
                  className="rounded border-paper-border text-brand-600 focus:ring-brand-500"
                />
                Schedule breaks automatically
              </label>
            </div>

            {breaksEnabled ? (
              <div className="text-xs text-charcoal-muted dark:text-slate-400 space-y-2">
                <p>
                  {currentSchedule.breakCount === 0 ? (
                    <span>
                      Sessions under 50 minutes do not require mid-session breaks. A pure continuous focus block will be used.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-charcoal-primary dark:text-white font-semibold">
                        {currentSchedule.breakCount} {currentSchedule.breakCount === 1 ? 'break' : 'breaks'}
                      </strong>{' '}
                      of{' '}
                      <strong className="text-charcoal-primary dark:text-white font-semibold">
                        {breakDurationMinutes} minutes
                      </strong>{' '}
                      will be evenly placed between your focus intervals (total duration:{' '}
                      <strong className="text-brand-600 dark:text-brand-400">
                        {currentSchedule.totalFocusMinutes + currentSchedule.totalBreakMinutes} mins
                      </strong>
                      ).
                    </span>
                  )}
                </p>

                {currentSchedule.breakCount > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-charcoal-primary dark:text-white">
                      Break duration:
                    </span>
                    {BREAK_DURATION_OPTIONS.map((bd) => (
                      <button
                        key={bd}
                        type="button"
                        onClick={() => setBreakDurationMinutes(bd)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          breakDurationMinutes === bd
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-white dark:bg-slate-700 border border-paper-border dark:border-slate-600 text-charcoal-muted hover:text-charcoal-primary'
                        }`}
                      >
                        {bd} mins
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-charcoal-muted italic">
                Breaks disabled. This will run as an uninterrupted {focusDurationMinutes}-minute continuous focus block.
              </p>
            )}
          </div>

          {/* Academic Context Linking: Subject & Task */}
          <div className="w-full pt-4 border-t border-paper-border dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-charcoal-light dark:text-slate-400 uppercase tracking-wide mb-1">
                Link to Course Subject (Optional)
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
                Link to Active Task (Optional)
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

          {/* Action CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-charcoal-muted">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Background Focus Mode enabled: Timer keeps running when tab is inactive.</span>
            </div>

            <Button
              size="lg"
              onClick={handleStartSession}
              className="w-full sm:w-auto px-8 py-3.5 text-base shadow-subtle"
              leftIcon={<Play size={18} fill="currentColor" />}
            >
              Start Focus Session ({focusDurationMinutes}m)
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE SESSION / BREAK SCREEN (RUNNING, PAUSED, BREAK)                */}
      {/* ========================================================================= */}
      {(status === 'running' || status === 'paused' || status === 'break') && (
        <Card className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-card flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
          {/* Status Badge & Segment Header */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                status === 'break'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : status === 'paused'
                  ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              }`}
            >
              {status === 'break' ? (
                <>
                  <Coffee size={14} /> Scheduled Break
                </>
              ) : status === 'paused' ? (
                <>
                  <Pause size={14} /> Session Paused
                </>
              ) : (
                <>
                  <Flame size={14} /> In Focus
                </>
              )}
            </span>

            {activeSegment && (
              <span className="text-xs font-medium text-charcoal-muted dark:text-slate-400">
                Segment {currentSegmentIndex + 1} of {currentSchedule.segments.length}: {activeSegment.label}
              </span>
            )}
          </div>

          {/* Big Serene Digits */}
          <div className="space-y-3">
            <div className="font-editorial text-7xl sm:text-8xl lg:text-9xl font-medium text-charcoal-primary dark:text-white tabular-nums tracking-tighter select-none">
              {formatSeconds(segmentSecondsRemaining)}
            </div>

            {/* Segment Progress Bar */}
            <div className="w-56 sm:w-72 mx-auto h-2.5 rounded-full bg-paper-border dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  status === 'break' ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{ width: `${currentSegmentProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-charcoal-light uppercase tracking-wider font-medium">
              {status === 'break' ? 'Break segment time remaining' : 'Focus segment time remaining'}
            </p>
          </div>

          {/* Session Cumulative Stats Pill */}
          <div className="flex items-center gap-4 text-xs font-medium bg-paper-canvas dark:bg-slate-800 px-4 py-2 rounded-2xl border border-paper-border dark:border-slate-700">
            <div>
              <span className="text-charcoal-muted">Pure Focus Completed:</span>{' '}
              <strong className="text-brand-600 dark:text-brand-400 font-semibold">
                {Math.floor(actualFocusSecondsCompleted / 60)} mins
              </strong>
            </div>
            <span className="text-paper-border dark:text-slate-600">•</span>
            <div>
              <span className="text-charcoal-muted">Target:</span>{' '}
              <strong className="text-charcoal-primary dark:text-white font-semibold">
                {focusDurationMinutes} mins
              </strong>
            </div>
          </div>

          {/* Timeline Multi-segment visualizer */}
          {currentSchedule.segments.length > 1 && (
            <div className="w-full max-w-lg space-y-2">
              <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
                <span>Timeline Schedule</span>
                <span>{overallFocusProgress}% Focus Complete</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                {currentSchedule.segments.map((seg, idx) => {
                  const isCurrent = idx === currentSegmentIndex;
                  const isPast = idx < currentSegmentIndex;
                  return (
                    <div
                      key={seg.id}
                      className={`h-2.5 rounded-full transition-all flex-1 ${
                        isCurrent
                          ? seg.type === 'break'
                            ? 'bg-amber-500 ring-2 ring-amber-300'
                            : 'bg-brand-600 ring-2 ring-brand-300'
                          : isPast
                          ? 'bg-emerald-500 opacity-80'
                          : 'bg-paper-border dark:bg-slate-800'
                      }`}
                      title={`${seg.label} (${Math.round(seg.durationSeconds / 60)}m)`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* End session early button */}
            <button
              type="button"
              onClick={() => finalizeSession(true)}
              className="p-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 text-charcoal-muted transition-colors"
              title="End session early and save progress"
            >
              <LogOut size={18} />
            </button>

            {/* Pause / Resume Button */}
            <Button
              size="lg"
              onClick={togglePauseResume}
              className="px-8 py-3.5 text-base shadow-subtle min-w-[150px]"
              leftIcon={
                status === 'paused' ? <Play size={18} fill="currentColor" /> : <Pause size={18} />
              }
            >
              {status === 'paused' ? 'Resume' : 'Pause'}
            </Button>

            {/* Break-specific or Focus-specific secondary controls */}
            {status === 'break' ? (
              <>
                <button
                  type="button"
                  onClick={handleSkipBreak}
                  className="px-4 py-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-xs font-semibold text-charcoal-primary dark:text-white transition-colors flex items-center gap-1.5"
                  title="Skip Break and resume focus"
                >
                  <FastForward size={16} /> Skip Break
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendBreak(5)}
                  className="px-3 py-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-xs font-medium text-charcoal-muted transition-colors"
                  title="Extend break by 5 mins"
                >
                  +5m Break
                </button>
              </>
            ) : (
              currentSchedule.breakCount > 0 && (
                <button
                  type="button"
                  onClick={handleStartBreakEarly}
                  className="px-4 py-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-xs font-medium text-charcoal-muted hover:text-charcoal-primary transition-colors flex items-center gap-1.5"
                  title="Take a scheduled break now"
                >
                  <Coffee size={16} /> Take Break Early
                </button>
              )
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-2xl border border-paper-border dark:border-slate-700 hover:bg-paper-canvas text-charcoal-muted hover:text-charcoal-primary transition-colors"
              title={soundEnabled ? 'Mute Alert' : 'Enable Alert'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. COMPLETION / SUMMARY SCREEN MODAL                                      */}
      {/* ========================================================================= */}
      {(status === 'completed' || status === 'interrupted') && completedSummary && (
        <Card className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-card text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <h2 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white">
              {completedSummary.isInterrupted ? 'Focus Session Concluded' : 'Session Completed! 🎉'}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 max-w-sm mx-auto">
              {completedSummary.isInterrupted
                ? 'Your study time has been safely logged in your academic history.'
                : 'Excellent focus and deliberate practice. Keep up the consistent momentum!'}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
              <span className="block text-2xl font-bold text-brand-600 dark:text-brand-400 font-editorial">
                {completedSummary.focusMinutes}m
              </span>
              <span className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">
                Focused Time
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
              <span className="block text-2xl font-bold text-charcoal-primary dark:text-white font-editorial">
                {completedSummary.totalElapsedMinutes}m
              </span>
              <span className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">
                Total Elapsed
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
              <span className="block text-2xl font-bold text-amber-600 font-editorial">
                {completedSummary.breaksTaken}
              </span>
              <span className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">
                Breaks Taken
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700">
              <span className="block text-2xl font-bold text-charcoal-muted font-editorial">
                {completedSummary.breaksSkipped}
              </span>
              <span className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">
                Breaks Skipped
              </span>
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" onClick={handleResetToSetup} className="px-8 shadow-subtle">
              Start Another Session
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. STEPPED-AWAY CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {showSteppedAwayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-paper-border dark:border-slate-800 shadow-xl animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
                You stepped away from StudyFlow
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                {steppedAwaySeconds >= 60
                  ? `You stepped away for approximately ${Math.round(steppedAwaySeconds / 60)} minute${Math.round(steppedAwaySeconds / 60) === 1 ? '' : 's'}. Would you like to continue focusing or end your session?`
                  : 'You switched away from the StudyFlow window. Would you like to continue focusing or end your session?'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmLeaveSession}
                className="flex-1 px-4 py-2.5 rounded-xl border border-paper-border dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                Leave Focus Session
              </button>
              <Button
                size="md"
                onClick={handleConfirmStayFocused}
                className="flex-1 text-xs shadow-subtle"
              >
                Stay Focused
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FOCUS HISTORY                                                          */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white flex items-center gap-2">
          <History size={18} /> Recent Focus Sessions
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-charcoal-muted dark:text-slate-400 italic p-6 text-center border border-dashed border-paper-border dark:border-slate-800 rounded-2xl">
            No completed focus sessions yet. Start a focus session above to log your first academic sprint.
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.slice(0, 6).map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-charcoal-primary dark:text-white block">
                      {sess.subject?.name || 'General Study Session'}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
                      {sess.task && <span>Task: {sess.task.title}</span>}
                      {sess.notes && <span className="truncate max-w-xs sm:max-w-md">• {sess.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-brand-600 dark:text-brand-400 block text-sm">
                    {sess.actual_minutes} mins
                  </span>
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
