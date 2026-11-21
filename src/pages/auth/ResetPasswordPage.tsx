import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validLink, setValidLink] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const hasRecoveryHash = hash.includes('access_token') || hash.includes('type=recovery');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !hasRecoveryHash) {
        setValidLink(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toastError('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toastError('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.updatePassword(password);
      if (res.success) {
        setDone(true);
        success('Password Updated', 'Your password has been reset successfully.');
      } else {
        toastError('Failed', res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!validLink) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
            Invalid or Expired Link
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400">
            This password reset link is invalid or has expired. Please request a new recovery link.
          </p>
          <Link to="/forgot-password">
            <Button size="sm">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-subtle">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            Set New Password
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Choose a strong password to protect your account.
          </p>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs sm:text-sm text-charcoal-primary dark:text-white font-medium">
              Your password has been successfully updated!
            </p>
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign In with New Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={loading}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
