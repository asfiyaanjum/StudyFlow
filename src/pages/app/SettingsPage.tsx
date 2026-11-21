import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Palette,
  Clock,
  Save,
  CheckCircle2,
  Database,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { UserProfile, UserSettings } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/avatar/Avatar';
import { DEFAULT_AVATARS, DefaultAvatarArt } from '../../components/avatar/DefaultAvatarArt';

export const SettingsPage: React.FC = () => {
  const { user, isConfigured, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [university, setUniversity] = useState(user?.college_university || '');
  const [major, setMajor] = useState(user?.major_course || '');
  const [academicYear, setAcademicYear] = useState(user?.academic_year || 'Junior Year');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(user?.daily_study_target_minutes || 240);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || 'default:sage');

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.settings.getSettings();
        setSettings(s);
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.auth.updateProfile({
        full_name: fullName,
        college_university: university,
        major_course: major,
        academic_year: academicYear,
        daily_study_target_minutes: Number(dailyTargetMinutes),
        avatar_url: avatarUrl,
      });

      if (settings) {
        await api.settings.updateSettings({
          theme: theme as any,
          pomodoro_focus_duration: settings.pomodoro_focus_duration,
          pomodoro_short_break: settings.pomodoro_short_break,
          pomodoro_long_break: settings.pomodoro_long_break,
        });
      }

      await refreshUser();
      success('Settings Saved', 'Profile and preferences updated successfully.');
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-paper-border dark:border-slate-800 pb-5">
        <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Account & Academic Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
          Customize your student profile, curated vector avatar, and focus durations.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar Picker Section */}
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-5">
          <div className="flex items-center gap-2 border-b border-paper-border dark:border-slate-800 pb-3">
            <User size={16} className="text-brand-600" />
            <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
              Student Character Avatar
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0 text-center space-y-2">
              <Avatar src={avatarUrl} username={fullName || username} size={72} />
              <span className="text-[11px] font-mono text-charcoal-light block">Active Avatar</span>
            </div>

            {/* 6 Curated Default Avatars Grid */}
            <div className="flex-1 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light block">
                Choose a Curated Vector Avatar
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {DEFAULT_AVATARS.map((av) => {
                  const isSelected = avatarUrl === `default:${av.id}` || avatarUrl === av.id;

                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(`default:${av.id}`)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-paper-border dark:border-slate-800 hover:border-paper-border/80 bg-paper-canvas/40'
                      }`}
                    >
                      <DefaultAvatarArt id={av.id} size={36} />
                      <span className="text-[11px] font-medium text-charcoal-primary dark:text-white">
                        {av.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
          <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white border-b border-paper-border pb-3">
            Academic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Chen"
            />
            <Input
              label="Username"
              value={username}
              disabled
              helperText="Username is linked to your authentication."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="College / University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. Stanford University"
            />
            <Input
              label="Major / Course"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
            />
            <Input
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. Sophomore"
            />
          </div>

          <div className="pt-2">
            <Input
              label="Daily Study Target (Minutes)"
              type="number"
              min={30}
              step={15}
              value={dailyTargetMinutes}
              onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
              helperText={`Equal to ${(dailyTargetMinutes / 60).toFixed(1)} hours of planned daily deep work.`}
            />
          </div>
        </Card>

        {/* Focus & Theme Preferences */}
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
          <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white border-b border-paper-border pb-3">
            Focus & Interface Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Pomodoro Focus (Mins)
              </label>
              <input
                type="number"
                min={15}
                max={90}
                value={settings?.pomodoro_focus_duration || 25}
                onChange={(e) =>
                  setSettings((prev) => prev ? { ...prev, pomodoro_focus_duration: Number(e.target.value) } : null)
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Short Break (Mins)
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={settings?.pomodoro_short_break || 5}
                onChange={(e) =>
                  setSettings((prev) => prev ? { ...prev, pomodoro_short_break: Number(e.target.value) } : null)
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Long Break (Mins)
              </label>
              <input
                type="number"
                min={10}
                max={45}
                value={settings?.pomodoro_long_break || 15}
                onChange={(e) =>
                  setSettings((prev) => prev ? { ...prev, pomodoro_long_break: Number(e.target.value) } : null)
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={saving} leftIcon={<Save size={16} />}>
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
