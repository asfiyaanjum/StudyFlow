import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  LifeBuoy,
  Target,
  Timer,
  BarChart2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Avatar } from '../components/avatar/Avatar';
import { useGreetingQuote } from '../utils/greetingQuotes';

export const AppLayout: React.FC = () => {
  const { user, signOut, isConfigured } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { info } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);

  const { greeting, emoji } = useGreetingQuote(user?.id || 'student');

  // Monitor overdue tasks for the Recovery Engine badge
  useEffect(() => {
    let mounted = true;
    const checkOverdue = async () => {
      try {
        const tasks = await api.tasks.getTasks();
        if (!mounted) return;
        const now = new Date();
        const count = tasks.filter((t) => !t.is_completed && new Date(t.due_date) < now).length;
        setOverdueCount(count);
      } catch (e) {
        // quiet error
      }
    };
    checkOverdue();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Timetable', path: '/app/timetable', icon: Calendar },
    { label: 'Subjects & Syllabus', path: '/app/subjects', icon: BookOpen },
    {
      label: 'Recovery Engine',
      path: '/app/recovery',
      icon: LifeBuoy,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { label: 'Goals & Plans', path: '/app/goals', icon: Target },
    { label: 'Focus Timer', path: '/app/focus', icon: Timer },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart2 },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    info('Signed Out', 'You have been safely signed out of your StudyFlow account.');
    navigate('/login');
  };

  const currentNav = navItems.find((item) => item.path === location.pathname) || navItems[0];

  return (
    <div className="min-h-screen flex bg-paper-canvas dark:bg-surface-dark text-charcoal-primary dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-paper-border dark:border-slate-800">
          <Link to="/app" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-editorial text-2xl font-semibold tracking-tight text-charcoal-primary dark:text-white">
              StudyFlow
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 text-charcoal-muted hover:text-charcoal-primary dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Database Status Indicator */}
        <div className="px-5 py-2.5 bg-paper-canvas/70 dark:bg-slate-800/40 border-b border-paper-border dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-charcoal-muted dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {isConfigured ? 'Supabase RLS Active' : 'Offline Mode'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200/60 dark:border-brand-800/60 shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:bg-paper-100 dark:hover:bg-slate-800/60 hover:text-charcoal-primary dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-charcoal-light dark:text-slate-500 group-hover:text-charcoal-primary dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-brand-100 text-brand-700'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card in Footer */}
        <div className="p-3.5 border-t border-paper-border dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-paper-canvas dark:bg-slate-800/50 border border-paper-border dark:border-slate-700/60">
            <Link to="/app/settings" className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.avatar_url}
                username={user?.full_name || user?.username || 'Student'}
                size={34}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-charcoal-primary dark:text-white truncate">
                  {user?.full_name || user?.username || 'Student'}
                </p>
                <p className="text-[10px] text-charcoal-light dark:text-slate-400 truncate">
                  @{user?.username || 'alex_chen'}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-charcoal-light hover:text-rose-500 dark:text-slate-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex h-16 border-b border-paper-border dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md items-center justify-between px-8 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400">
              Workspace
            </span>
            <ChevronRight size={13} className="text-charcoal-light" />
            <h2 className="font-editorial text-lg font-medium text-charcoal-primary dark:text-white">
              {currentNav.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs italic font-editorial text-brand-700 dark:text-brand-300">
              {emoji} {greeting}, {user?.full_name?.split(' ')[0] || user?.username || 'Scholar'}
            </span>

            <div className="h-4 w-px bg-paper-border dark:border-slate-700" />

            <Link to="/app/tasks">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
            </Link>

            <Link to="/app/focus">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-paper-border dark:border-slate-700 hover:bg-paper-100 dark:hover:bg-slate-800 text-charcoal-primary dark:text-slate-200 text-xs font-medium transition-colors"
              >
                <Timer size={13} />
                <span>Focus Mode</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 border-b border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 z-20">
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-editorial text-xl font-bold text-charcoal-primary dark:text-white">StudyFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-charcoal-muted dark:text-slate-400 rounded-lg"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-charcoal-primary dark:text-slate-200 rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
              <div className="h-16 px-6 flex items-center justify-between border-b border-paper-border dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-editorial text-xl font-bold text-charcoal-primary dark:text-white">StudyFlow</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-charcoal-light hover:text-charcoal-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-semibold'
                          : 'text-charcoal-muted dark:text-slate-400 hover:bg-paper-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-paper-border dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
