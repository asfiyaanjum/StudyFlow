import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  Check,
  RotateCcw,
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
import { DEFAULT_AVATARS, DefaultAvatarArt, getDefaultAvatar } from '../../components/avatar/DefaultAvatarArt';

export const SettingsPage: React.FC = () => {
  const { user, isConfigured, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, warning, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [university, setUniversity] = useState(user?.college_university || '');
  const [major, setMajor] = useState(user?.major_course || '');
  const [academicYear, setAcademicYear] = useState(user?.academic_year || 'Junior Year');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(user?.daily_study_target_minutes || 240);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || 'default:ren');

  // Custom Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<'all' | 'female' | 'male'>('all');

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user]);

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

  // Handle selecting a custom image from local device
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Image types only
    if (!file.type.startsWith('image/')) {
      toastError('Invalid File Type', 'Please upload an image file (PNG, JPEG, WebP, or GIF).');
      return;
    }

    // Validation: Max size 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError('File Too Large', 'Maximum image size allowed is 5 MB.');
      return;
    }

    // Clean up previous preview url if existed
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setPendingImageFile(file);
    setImagePreviewUrl(preview);
    setAvatarUrl(preview);
    success('Image Selected', 'Photo selected! Click "Save Settings" below to upload and save.');
  };

  // Remove uploaded custom photo and revert to anime avatar
  const handleRemoveCustomImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setPendingImageFile(null);
    setImagePreviewUrl(null);
    setAvatarUrl('default:sakura');
    if (fileInputRef.current) fileInputRef.current.value = '';
    warning('Photo Removed', 'Reverted to default anime avatar. Remember to save your settings.');
  };

  const handleSelectAnimeAvatar = (avatarId: string) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setPendingImageFile(null);
    setImagePreviewUrl(null);
    setAvatarUrl(`default:${avatarId}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // If user selected a new custom file, upload it now to Supabase Storage
      if (pendingImageFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await api.storage.uploadAvatar(pendingImageFile);
          finalAvatarUrl = uploadedUrl;
          setAvatarUrl(uploadedUrl);
        } catch (uploadErr: any) {
          console.error('Storage upload error:', uploadErr);
          // If storage bucket isn't active or fails, warn gracefully
          toastError(
            'Upload Notice',
            uploadErr?.message || 'Could not upload to storage bucket. Retaining selected avatar.'
          );
        } finally {
          setIsUploading(false);
        }
      }

      await api.auth.updateProfile({
        full_name: fullName,
        college_university: university,
        major_course: major,
        academic_year: academicYear,
        daily_study_target_minutes: Number(dailyTargetMinutes),
        avatar_url: finalAvatarUrl,
      });

      if (settings) {
        await api.settings.updateSettings({
          theme: theme as any,
          pomodoro_focus_duration: settings.pomodoro_focus_duration,
          pomodoro_short_break: settings.pomodoro_short_break,
          pomodoro_long_break: settings.pomodoro_long_break,
        });
      }

      // Clear pending file
      setPendingImageFile(null);
      await refreshUser();
      success('Settings Saved', 'Profile and preferences updated successfully.');
    } catch (err: any) {
      toastError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const isCustomImageActive = !!avatarUrl && !avatarUrl.startsWith('default:') && !DEFAULT_AVATARS.some((a) => a.id === avatarUrl);
  const activeAnimeConfig = !isCustomImageActive ? getDefaultAvatar(avatarUrl) : null;

  const filteredAvatars = DEFAULT_AVATARS.filter((a) => {
    if (avatarCategory === 'all') return true;
    return a.category === avatarCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-paper-border dark:border-slate-800 pb-5">
        <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
          Account & Academic Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
          Customize your student profile, upload a custom photo, choose anime character avatars, and focus durations.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar & Profile Photo Section */}
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-paper-border dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <User size={18} className="text-brand-600" />
              <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white">
                Profile Avatar & Photo
              </h3>
            </div>
            {isCustomImageActive ? (
              <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Custom Upload Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Anime Avatar Active: {activeAnimeConfig?.label}
              </span>
            )}
          </div>

          {/* Active Preview & Upload Controls */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-paper-canvas/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-paper-border dark:border-slate-800">
            <div className="shrink-0 text-center space-y-2">
              <div className="relative group">
                <Avatar
                  src={avatarUrl}
                  username={fullName || username}
                  size={88}
                  className="ring-4 ring-white dark:ring-slate-900 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-transform hover:scale-110"
                  title="Upload profile picture"
                >
                  <Camera size={14} />
                </button>
              </div>
              <span className="text-[11px] font-mono text-charcoal-light block">
                {isCustomImageActive ? 'Custom Photo' : activeAnimeConfig?.personality}
              </span>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-semibold text-charcoal-primary dark:text-white">
                  Profile Photo & Avatar
                </h4>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Upload your own photo from your device, or choose from our original anime-style character collection.
                </p>
              </div>

              {/* Upload & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileSelect}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant={isCustomImageActive ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload size={14} />}
                >
                  {isCustomImageActive ? 'Replace Photo' : 'Upload From Device'}
                </Button>

                {isCustomImageActive && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCustomImage}
                    leftIcon={<RotateCcw size={14} />}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Remove Custom Photo
                  </Button>
                )}
              </div>

              {pendingImageFile && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Selected: {pendingImageFile.name} ({(pendingImageFile.size / 1024).toFixed(0)} KB) — Click &quot;Save Settings&quot; to apply.
                </p>
              )}
            </div>
          </div>

          {/* Anime Avatar Collection */}
          <div className="space-y-3.5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400 block">
                  Original Anime Character Collection
                </span>
                <p className="text-xs text-charcoal-muted dark:text-slate-400">
                  Select an anime avatar to represent your study persona:
                </p>
              </div>

              {/* Gender / Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-paper-canvas dark:bg-slate-800 p-1 rounded-xl border border-paper-border dark:border-slate-700 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAvatarCategory('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    avatarCategory === 'all'
                      ? 'bg-white dark:bg-slate-900 text-charcoal-primary dark:text-white shadow-xs font-semibold'
                      : 'text-charcoal-muted hover:text-charcoal-primary'
                  }`}
                >
                  All (10)
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarCategory('female')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    avatarCategory === 'female'
                      ? 'bg-white dark:bg-slate-900 text-charcoal-primary dark:text-white shadow-xs font-semibold'
                      : 'text-charcoal-muted hover:text-charcoal-primary'
                  }`}
                >
                  Female (5)
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarCategory('male')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    avatarCategory === 'male'
                      ? 'bg-white dark:bg-slate-900 text-charcoal-primary dark:text-white shadow-xs font-semibold'
                      : 'text-charcoal-muted hover:text-charcoal-primary'
                  }`}
                >
                  Male (5)
                </button>
              </div>
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {filteredAvatars.map((av) => {
                const isSelected =
                  !isCustomImageActive &&
                  (avatarUrl === `default:${av.id}` || avatarUrl === av.id || (!avatarUrl && av.id === 'ren'));

                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectAnimeAvatar(av.id)}
                    className={`relative flex flex-col items-center text-center p-3 rounded-2xl border transition-all group ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/50 ring-2 ring-brand-500/25 shadow-subtle'
                        : 'border-paper-border dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        <Check size={10} />
                      </span>
                    )}

                    <div className="p-1 rounded-full group-hover:scale-105 transition-transform">
                      <DefaultAvatarArt id={av.id} size={48} />
                    </div>

                    <span className="text-xs font-semibold text-charcoal-primary dark:text-white mt-1.5 block">
                      {av.label}
                    </span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium line-clamp-1 block">
                      {av.personality}
                    </span>
                    <span className="text-[9px] text-charcoal-light dark:text-slate-500 line-clamp-1 mt-0.5 block">
                      {av.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-subtle space-y-4">
          <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white border-b border-paper-border dark:border-slate-800 pb-3">
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
          <h3 className="font-editorial text-xl font-medium text-charcoal-primary dark:text-white border-b border-paper-border dark:border-slate-800 pb-3">
            Study Session Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Focus Duration (Min)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={settings?.pomodoro_focus_duration || 25}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, pomodoro_focus_duration: Number(e.target.value) } : null
                  )
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Short Break (Min)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings?.pomodoro_short_break || 5}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, pomodoro_short_break: Number(e.target.value) } : null
                  )
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Long Break (Min)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={settings?.pomodoro_long_break || 15}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, pomodoro_long_break: Number(e.target.value) } : null
                  )
                }
                className="w-full rounded-xl border border-paper-border dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={saving || isUploading} leftIcon={<Save size={16} />}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
