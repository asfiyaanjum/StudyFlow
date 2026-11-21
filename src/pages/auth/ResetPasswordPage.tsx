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
        success('Password Updated', 'Your password has been securely reset.');
      } else {
        toastError('Error', res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Choose New Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your new secure password for StudyFlow
          </p>
        </div>

        {!validLink ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
              Invalid or expired recovery link. Password reset links can only be used once and expire after a limited time.
            </p>
            <Link to="/forgot-password" className="block pt-1">
              <Button size="sm" variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Request New Recovery Link
              </Button>
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Password Changed Successfully!
            </p>
            <Button size="md" className="w-full" onClick={() => navigate('/login')}>
              Proceed to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" size="md" className="w-full" isLoading={loading}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

