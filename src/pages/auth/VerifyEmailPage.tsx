import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const email = params.get('email') || 'your email address';
  const { info } = useToast();

  const handleResend = () => {
    info('Verification Link Sent', `A new verification email has been sent to ${email}.`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Verify Your Email Address
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We've sent an activation link to:
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
            {email}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Next Steps:</p>
          <ol className="list-decimal list-inside space-y-1 pt-1">
            <li>Open the verification email from StudyFlow.</li>
            <li>Click the "Confirm your email" link.</li>
            <li>Return here to log into your account.</li>
          </ol>
        </div>

        <div className="space-y-3 pt-2">
          <Link to="/login" className="block">
            <Button size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Proceed to Login
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={handleResend}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    </div>
  );
};
