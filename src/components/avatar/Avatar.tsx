import React, { useState } from 'react';
import { DefaultAvatarArt, getDefaultAvatar, DEFAULT_AVATARS } from './DefaultAvatarArt';

export interface AvatarProps {
  src?: string | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  alt?: string;
  showBorder?: boolean;
}

const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

function getDeterministicAvatarId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index].id;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  username = 'Student',
  size = 'md',
  className = '',
  alt,
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 40;

  // Check if src specifies a default avatar (e.g. "default:sage" or "sage")
  const isDefaultTag = src?.startsWith('default:') || (src && DEFAULT_AVATARS.some((a) => a.id === src));
  const defaultId = isDefaultTag ? src?.replace('default:', '') : undefined;

  const isUploadedUrl = !!src && !isDefaultTag && !imageError;
  const borderClasses = showBorder ? 'ring-1 ring-black/5 dark:ring-white/10' : '';

  if (isUploadedUrl) {
    return (
      <img
        src={src}
        alt={alt || `${username}'s profile picture`}
        width={pixelSize}
        height={pixelSize}
        onError={() => setImageError(true)}
        className={`block shrink-0 rounded-full object-cover shadow-subtle ${borderClasses} ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      />
    );
  }

  const avatarId = defaultId || getDeterministicAvatarId(username || 'student');

  return (
    <span
      className={`block shrink-0 rounded-full ${borderClasses} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <DefaultAvatarArt id={avatarId} size={pixelSize} />
    </span>
  );
};
