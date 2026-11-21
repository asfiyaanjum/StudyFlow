import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid real email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(username, email, password, fullName || undefined);

      if (result.success) {
        if (result.emailConfirmationRequired) {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          success('Account Created', 'Welcome to StudyFlow! You are now logged in.');
          navigate('/app');
        }
      } else {
        setErrorMessage(result.error || 'Failed to register account.');
        toastError('Registration Failed', result.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            Create Your StudyFlow Account
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Start organizing your semester with confidence and calm.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Username"
            id="username"
            required
            placeholder="e.g. alex_chen (letters, numbers, _)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="username"
          />

          <Input
            label="Full Name (Optional)"
            id="fullName"
            placeholder="e.g. Alex Chen"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="name"
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            required
            placeholder="alex@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password (min 6 characters)"
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-8 flex items-center text-charcoal-muted hover:text-charcoal-primary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            label="Confirm Password"
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-paper-border dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-charcoal-muted dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-light dark:text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Isolated Supabase PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
