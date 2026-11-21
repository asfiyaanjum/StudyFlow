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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { UserProfile, UserSettings } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
];

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
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || AVATAR_PRESETS[0]);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toastError('File Too Large', 'Avatar image must be under 3MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const publicUrl = await api.storage.uploadAvatar(file);
      setAvatarUrl(publicUrl);
      success('Avatar Uploaded', 'Avatar successfully uploaded to Supabase Storage.');
    } catch (err: any) {
      toastError('Upload Failed', err.message || 'Failed to upload avatar to Supabase Storage.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        username,
        college_university: university,
        major_course: major,
        academic_year: academicYear,
        daily_study_target_minutes: Number(dailyTargetMinutes),
        avatar_url: avatarUrl,
      });

      await refreshUser();
      success('Settings Saved', 'Your student profile and preferences have been updated.');
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your student identity, daily study targets, and interface preferences.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Identity & University
            </h2>
          </div>

          {/* Avatar Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Avatar Picture
            </label>
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-md"
              />
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Choose preset or upload to Supabase Storage:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                        avatarUrl === preset ? 'border-brand-600 scale-110' : 'border-transparent'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="University / College"
              placeholder="e.g. Stanford University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <Input
              label="Major / Program"
              placeholder="e.g. Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
            <Input
              label="Academic Year"
              placeholder="e.g. Junior Year (Year 3)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>

          <div className="max-w-xs">
            <Input
              label="Daily Study Target (Minutes)"
              type="number"
              min={30}
              step={30}
              value={dailyTargetMinutes}
              onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
              helperText="e.g. 240 mins = 4 hours of deep study per day"
              required
            />
          </div>
        </Card>

        {/* Interface & Preferences */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Palette className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Interface & Focus Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      theme === t
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Time Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-xs font-bold"
                >
                  12-Hour (AM/PM)
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  24-Hour (Military)
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Database & Cloud Architecture Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-brand-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Database & Cloud Backend
                </h2>
                <p className="text-xs text-slate-500">
                  Supabase PostgreSQL + Row-Level Security (RLS)
                </p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isConfigured
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isConfigured ? 'Supabase Connected' : 'Local Persistence Active'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isConfigured
              ? 'StudyFlow is connected to your remote Supabase instance with strict Row-Level Security policies active.'
              : 'StudyFlow is currently running with high-speed local persistence. To link to your live Supabase database, copy your project URL and anon public key into .env and execute the safe additive migration in supabase/migrations/20241121000000_initial_schema.sql.'}
          </p>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-5 h-5" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

