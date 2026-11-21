import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const emailParam = params.get('email');
  const [inputEmail, setInputEmail] = useState(emailParam || '');
  const { success, error: toastError } = useToast();

  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Detect verification callback via hash tokens or search parameters
  useEffect(() => {
    const hash = window.location.hash;
    const isSignupCallback =
      hash.includes('type=signup') ||
      hash.includes('access_token') ||
      params.get('type') === 'signup' ||
      params.get('verified') === 'true';

    if (isSignupCallback) {
      setIsVerified(true);
    }
  }, [params]);

  // If confirmed and session established, auto-redirect to application workspace
  useEffect(() => {
    if (!authLoading && (isAuthenticated || isVerified)) {
      const timer = setTimeout(() => {
        navigate('/app', { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, isVerified, navigate]);

  const handleResend = async () => {
    setResendError('');
    setResendSuccess('');

    const targetEmail = inputEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      const msg = 'Please enter a valid email address to resend activation.';
      setResendError(msg);
      toastError('Validation', msg);
      return;
    }

    setResending(true);
    try {
      const res = await api.auth.resendVerificationEmail(targetEmail);
      if (res.success) {
        const successMsg = `A fresh activation link has been dispatched to ${targetEmail}.`;
        setResendSuccess(successMsg);
        success('Verification Link Sent', successMsg);
      } else {
        const errorMsg = res.error || 'Failed to send activation email. Please check your Supabase SMTP configuration.';
        setResendError(errorMsg);
        toastError('Failed to Resend', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred while contacting the auth server.';
      setResendError(errorMsg);
      toastError('Error', errorMsg);
    } finally {
      setResending(false);
    }
  };

  // Case 1: Account has been verified
  if (isVerified || (isAuthenticated && !emailParam)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-subtle animate-bounce">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
              Email Verified Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
              Your StudyFlow account is now verified and active. We are redirecting you to your student workspace...
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/app', { replace: true })}
              rightIcon={<ArrowRight size={14} />}
            >
              Enter Workspace Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Awaiting verification
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-3xl border border-paper-border dark:border-slate-800 shadow-card text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-subtle">
          <MailCheck size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="font-editorial text-3xl font-medium tracking-tight text-charcoal-primary dark:text-white">
            Verify Your Email
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">
            {inputEmail ? (
              <>
                We sent an activation link to{' '}
                <strong className="text-charcoal-primary dark:text-white">{inputEmail}</strong>. Click the link in
                the message to activate your StudyFlow workspace.
              </>
            ) : (
              'Please enter your registered email address below to receive an activation link.'
            )}
          </p>
        </div>

        {/* Resend Error Alert */}
        {resendError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>{resendError}</div>
          </div>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-start gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>{resendSuccess}</div>
          </div>
        )}

        {!emailParam && (
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="alex@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-charcoal-primary dark:text-white focus-ring"
            />
          </div>
        )}

        <div className="p-4 rounded-xl bg-paper-canvas dark:bg-slate-800 border border-paper-border dark:border-slate-700 text-xs text-charcoal-muted dark:text-slate-400">
          Didn't receive the email? Check your spam/junk folder, or click below to resend.
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={handleResend}
            isLoading={resending}
            leftIcon={<RefreshCw size={14} className={resending ? 'animate-spin' : ''} />}
          >
            Resend Activation Email
          </Button>

          <Link to="/login">
            <Button variant="ghost" className="w-full text-xs" rightIcon={<ArrowRight size={13} />}>
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
