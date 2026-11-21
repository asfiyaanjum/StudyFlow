import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message Sent', 'Thank you for reaching out! The StudyFlow team will respond shortly.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={13} /> Support & Feedback
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Contact StudyFlow Support
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Have a question about StudyFlow, feature requests, or institutional feedback? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-2">
            <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-charcoal-primary dark:text-white">Email Us</h3>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">support@studyflow.app</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle space-y-2">
            <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-charcoal-primary dark:text-white">Student Community</h3>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">Direct feedback via GitHub and community discussions.</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
                  Message Dispatched
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-sm mx-auto">
                  We have received your note and will review it shortly. Happy studying!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                    setSubject('');
                  }}
                  className="text-xs text-brand-600 font-medium hover:underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Subject"
                  placeholder="Feature request / Question about StudyFlow"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="How can we assist your studies?"
                    className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <Button type="submit" className="w-full" rightIcon={<Send size={14} />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
