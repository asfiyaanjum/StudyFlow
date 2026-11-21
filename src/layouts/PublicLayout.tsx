import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Sun, Moon, ArrowRight, Menu, X, Sparkles, Shield, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const PublicLayout: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Design System', href: '/design-system' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper-canvas dark:bg-surface-dark text-charcoal-primary dark:text-slate-100 transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-paper-border dark:border-slate-800 bg-paper-canvas/90 dark:bg-surface-dark/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl font-semibold tracking-tight text-charcoal-primary dark:text-white">
                StudyFlow
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Academic OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-charcoal-muted dark:text-slate-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`hover:text-charcoal-primary dark:hover:text-white transition-colors ${
                  location.pathname === link.href ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-charcoal-muted hover:text-charcoal-primary dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-paper-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-paper-border dark:hover:border-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-charcoal-primary" />}
            </button>

            {isAuthenticated ? (
              <Link to="/app">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-charcoal-primary dark:text-slate-200">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-charcoal-muted dark:text-slate-400 rounded-xl"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-primary dark:text-slate-200 rounded-xl hover:bg-paper-100 dark:hover:bg-slate-800"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal-primary dark:text-slate-200 hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-paper-border dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Open Student Workspace</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-paper-border dark:border-slate-800 bg-white dark:bg-slate-900/60 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
                  StudyFlow
                </span>
              </div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed max-w-sm">
                The personal academic operating system for university students. Plan realistically, execute consistently, and recover with intelligence when life happens.
              </p>
              <div className="flex items-center gap-2 text-xs text-charcoal-light dark:text-slate-500">
                <Shield size={12} className="text-emerald-500" />
                <span>Supabase PostgreSQL & Row Level Security</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-primary dark:text-white mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-charcoal-muted dark:text-slate-400">
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-white transition-colors">Features & Philosophy</Link></li>
                <li><Link to="/features#recovery" className="hover:text-brand-600 dark:hover:text-white transition-colors">Recovery Engine</Link></li>
                <li><Link to="/design-system" className="hover:text-brand-600 dark:hover:text-white transition-colors">Design System Showcase</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-primary dark:text-white mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-charcoal-muted dark:text-slate-400">
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-white transition-colors">About Our Mission</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link to="/privacy" className="hover:text-brand-600 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-primary dark:text-white mb-3">
                Start Studying
              </h4>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed mb-3">
                Ready to transform your semester? Create your free account in seconds.
              </p>
              <Link to="/register">
                <Button size="sm" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-paper-border dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-light dark:text-slate-500">
            <p>&copy; {new Date().getFullYear()} StudyFlow. Designed for deliberate student productivity.</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span>Built with care for university students</span>
              <Heart size={12} className="text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
