import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, MailCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);

  // Auto-redirect if already authenticated (e.g. from session token in URL)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check for email confirmation in URL fragment or parameters
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') || searchParams.get('verified') === 'true') {
      setSuccessMessage('Email verified successfully! You can now access your workspace.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsUnconfirmed(false);
    setLoading(true);

    try {
      const result = await signIn(identifier, password);
      if (result.success) {
        success('Welcome Back!', 'Successfully signed in to StudyFlow.');
        navigate('/app');
      } else {
        setErrorMessage(result.error || 'Invalid credentials.');
        if (result.isUnconfirmedEmail) {
          setIsUnconfirmed(true);
        }
        toastError('Authentication Failed', result.error || 'Please check your username/email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            Welcome to StudyFlow
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Sign in with your username or academic email address.
          </p>
        </div>

        {/* Success Banner (e.g. after email confirmation) */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium space-y-2">
            <div>{errorMessage}</div>
            {isUnconfirmed && (
              <div className="pt-1 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between">
                <span className="text-[11px] text-rose-600 dark:text-rose-400">Need a fresh activation link?</span>
                <Link
                  to={`/verify-email?email=${encodeURIComponent(identifier.includes('@') ? identifier : '')}`}
                  className="inline-flex items-center gap-1 font-semibold underline hover:text-rose-900 dark:hover:text-rose-100"
                >
                  <MailCheck className="w-3.5 h-3.5" />
                  Resend Email
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username or Email"
            id="identifier"
            type="text"
            required
            placeholder="e.g. alex_rivera or alex@university.edu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="username"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-muted dark:text-slate-400 hover:text-charcoal-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </div>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-paper-border dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-charcoal-muted dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create an account free
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-light dark:text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Encrypted Supabase GoTrue Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
