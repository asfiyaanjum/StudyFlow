import React from 'react';

export interface DefaultAvatar {
  id: string;
  label: string;
  bg: string;
  skin: string;
  shirt: string;
  hair: string;
  accent: string;
  description: string;
  extra: React.ReactNode;
}

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    id: 'sage',
    label: 'Sage',
    bg: '#e3efe8',
    skin: '#f1cfb3',
    shirt: '#3d8f68',
    hair: '#2b2a2e',
    accent: '#2f6d4f',
    description: 'Calm and focused scholar',
    extra: <path d="M21 25c0-8 5-12 11-12s11 4 11 12c-3-5-7-7-11-7s-8 2-11 7z" />,
  },
  {
    id: 'lilac',
    label: 'Lilac',
    bg: '#ebe6fb',
    skin: '#e2b48f',
    shirt: '#6a55d6',
    hair: '#3a2e46',
    accent: '#553ec2',
    description: 'Creative and curious mind',
    extra: <path d="M20 28c-1-10 5-15 12-15s13 5 12 15c-1-6-4-9-6-9-4 3-12 3-16 0-2 0-5 3-2 9z" />,
  },
  {
    id: 'sand',
    label: 'Sand',
    bg: '#f6eddc',
    skin: '#f5d9c0',
    shirt: '#b7792c',
    hair: '#8a5a2b',
    accent: '#915c1e',
    description: 'Warm and persistent thinker',
    extra: (
      <>
        <circle cx="32" cy="12.5" r="4.5" />
        <path d="M21 26c0-8 5-11 11-11s11 3 11 11c-3-4-7-6-11-6s-8 2-11 6z" />
      </>
    ),
  },
  {
    id: 'rose',
    label: 'Rose',
    bg: '#f8e6e3',
    skin: '#c98f6b',
    shirt: '#bd4f45',
    hair: '#1f1d22',
    accent: '#9b3c33',
    description: 'Energetic and passionate learner',
    extra: <path d="M20 24c0-9 5-13 12-13s12 4 12 13v6c-1-7-3-11-4-12-5 3-11 3-16 0-1 1-3 5-4 12v-6z" />,
  },
  {
    id: 'sky',
    label: 'Sky',
    bg: '#e4edf7',
    skin: '#8d5f43',
    shirt: '#4a78b5',
    hair: '#1f1d22',
    accent: '#375f92',
    description: 'Analytical and steady achiever',
    extra: <path d="M21 24c0-7 5-10 11-10s11 3 11 10c-2-3-6-4-11-4s-9 1-11 4z" />,
  },
  {
    id: 'slate',
    label: 'Slate',
    bg: '#e9e8e4',
    skin: '#efc9a8',
    shirt: '#4b4952',
    hair: '#d8d5cf',
    accent: '#35333a',
    description: 'Minimalist and deliberate planner',
    extra: <path d="M21 26c0-8 4-12 11-12s11 4 11 12c-2-4-6-6-11-6s-9 2-11 6z" />,
  },
];

export function getDefaultAvatar(id?: string | null): DefaultAvatar {
  if (!id) return DEFAULT_AVATARS[0];
  const cleanId = id.toLowerCase().replace('default:', '').trim();
  return DEFAULT_AVATARS.find((a) => a.id === cleanId) ?? DEFAULT_AVATARS[0];
}

export interface DefaultAvatarArtProps {
  id: string;
  size?: number;
  className?: string;
}

export const DefaultAvatarArt: React.FC<DefaultAvatarArtProps> = ({
  id,
  size = 40,
  className = '',
}) => {
  const avatar = getDefaultAvatar(id);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${avatar.label} avatar`}
      className={`block rounded-full shadow-subtle ${className}`}
      style={{ width: size, height: size }}
    >
      <rect width="64" height="64" rx="32" fill={avatar.bg} />
      <path d="M8 64c0-13 10-19 24-19s24 6 24 19z" fill={avatar.shirt} />
      <rect x="28" y="34" width="8" height="10" rx="3" fill={avatar.skin} />
      <circle cx="32" cy="26" r="11" fill={avatar.skin} />
      <g fill={avatar.hair}>{avatar.extra}</g>
    </svg>
  );
};
