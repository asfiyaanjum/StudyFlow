import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.auth.resetPassword(email);
      if (res.success) {
        setSent(true);
        success('Recovery Email Sent', 'Check your inbox for password reset instructions.');
      } else {
        toastError('Error', res.error || 'Failed to send recovery email.');
      }
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-subtle">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Enter your email and we'll send a secure link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs sm:text-sm text-charcoal-primary dark:text-slate-200">
              Recovery instructions have been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link to="/login" className="inline-block text-xs font-semibold text-brand-600 hover:underline pt-2">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              id="email"
              type="email"
              required
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send Password Reset Link
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-paper-border dark:border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-charcoal-primary dark:text-slate-400"
          >
            <ArrowLeft size={13} />
            <span>Return to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
