import React from 'react';

export interface DefaultAvatar {
  id: string;
  label: string;
  category: 'male' | 'female';
  personality: string;
  hairColor: string;
  bgGradient: [string, string];
  description: string;
}

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    id: 'ren',
    label: 'Ren',
    category: 'male',
    personality: 'Focused Strategist',
    hairColor: '#2b4c7e',
    bgGradient: ['#1e293b', '#0f172a'],
    description: 'Cobalt hair, over-ear headphones, determined and analytical.',
  },
  {
    id: 'sakura',
    label: 'Sakura',
    category: 'female',
    personality: 'Cheerful Achiever',
    hairColor: '#f472b6',
    bgGradient: ['#fdf2f8', '#fce7f3'],
    description: 'Sakura pink twin-tails, star hairclip, warm radiant smile.',
  },
  {
    id: 'kai',
    label: 'Kai',
    category: 'male',
    personality: 'Cool Scholar',
    hairColor: '#1e1b4b',
    bgGradient: ['#e0e7ff', '#c7d2fe'],
    description: 'Raven hair, sleek student glasses, calm and observant.',
  },
  {
    id: 'aoi',
    label: 'Aoi',
    category: 'female',
    personality: 'Creative Dreamer',
    hairColor: '#06b6d4',
    bgGradient: ['#ecfeff', '#cffafe'],
    description: 'Aqua bob cut, hairpins, soft oversized pastel hoodie.',
  },
  {
    id: 'yuki',
    label: 'Yuki',
    category: 'female',
    personality: 'Silent Prodigy',
    hairColor: '#cbd5e1',
    bgGradient: ['#f1f5f9', '#e2e8f0'],
    description: 'Silvery-white soft hair, lavender eyes, cozy turtleneck.',
  },
  {
    id: 'haruto',
    label: 'Haruto',
    category: 'male',
    personality: 'Energetic Explorer',
    hairColor: '#d97706',
    bgGradient: ['#fffbeb', '#fef3c7'],
    description: 'Amber messy spikes, varsity jacket, confident grin.',
  },
  {
    id: 'hina',
    label: 'Hina',
    category: 'female',
    personality: 'Diligent Planner',
    hairColor: '#eab308',
    bgGradient: ['#fefce8', '#fef08a'],
    description: 'Golden high ponytail with ribbon, studious and organized.',
  },
  {
    id: 'ryo',
    label: 'Ryo',
    category: 'male',
    personality: 'Night Owl Coder',
    hairColor: '#7c3aed',
    bgGradient: ['#2e1065', '#1e1b4b'],
    description: 'Violet-purple fringe, dark tech hoodie, laser focused.',
  },
  {
    id: 'mina',
    label: 'Mina',
    category: 'female',
    personality: 'Study Streamer',
    hairColor: '#a855f7',
    bgGradient: ['#faf5ff', '#f3e8ff'],
    description: 'Lilac locks with cute space buns, playful wink, pink jacket.',
  },
  {
    id: 'kenji',
    label: 'Kenji',
    category: 'male',
    personality: 'Academic Champion',
    hairColor: '#78350f',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    description: 'Chestnut brown textured hair, athletic headband, motivated gaze.',
  },
];

// Mapping for backward compatibility with previous avatar IDs
const LEGACY_AVATAR_MAP: Record<string, string> = {
  sage: 'ren',
  lilac: 'mina',
  sand: 'haruto',
  rose: 'sakura',
  sky: 'kai',
  slate: 'yuki',
};

export function getDefaultAvatar(id?: string | null): DefaultAvatar {
  if (!id) return DEFAULT_AVATARS[0];
  const cleanId = id.toLowerCase().replace('default:', '').trim();
  const mappedId = LEGACY_AVATAR_MAP[cleanId] || cleanId;
  return DEFAULT_AVATARS.find((a) => a.id === mappedId) ?? DEFAULT_AVATARS[0];
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
  const charId = avatar.id;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${avatar.label} Anime Avatar`}
      className={`block rounded-full shadow-subtle ${className}`}
      style={{ width: size, height: size }}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id={`bg-${charId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={avatar.bgGradient[0]} />
          <stop offset="100%" stopColor={avatar.bgGradient[1]} />
        </linearGradient>

        {/* Soft Skin Shadow Gradient */}
        <linearGradient id={`skin-${charId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff1e6" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>

        {/* Eye Gradient */}
        <linearGradient id={`eye-${charId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor={avatar.hairColor} />
        </linearGradient>

        {/* Hair Gradient */}
        <linearGradient id={`hair-${charId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={avatar.hairColor} />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Circle Clip Background */}
      <circle cx="50" cy="50" r="50" fill={`url(#bg-${charId})`} />

      {/* Render Character Specific Anime Vectors */}
      {renderAnimeCharacter(charId, avatar)}
    </svg>
  );
};

function renderAnimeCharacter(charId: string, avatar: DefaultAvatar) {
  switch (charId) {
    case 'sakura':
      return (
        <g>
          {/* Back twin-tails */}
          <path d="M18 42 C6 50 4 72 14 86 C20 74 22 56 26 48 Z" fill="#f472b6" />
          <path d="M82 42 C94 50 96 72 86 86 C80 74 78 56 74 48 Z" fill="#f472b6" />
          {/* Shoulders & Academy uniform */}
          <path d="M22 100 C22 78 34 72 50 72 C66 72 78 78 78 100 Z" fill="#1e1b4b" />
          <path d="M42 72 L50 84 L58 72 Z" fill="#ffffff" />
          <path d="M47 78 L53 78 L50 86 Z" fill="#ef4444" />
          {/* Neck & Face */}
          <rect x="45" y="58" width="10" height="16" fill="#fed7aa" />
          <path d="M28 42 C28 66 38 74 50 74 C62 74 72 66 72 42 C72 26 62 20 50 20 C38 20 28 26 28 42 Z" fill="#fff1e6" />
          {/* Cheeks Blush */}
          <ellipse cx="36" cy="53" rx="4" ry="2" fill="#f472b6" opacity="0.6" />
          <ellipse cx="64" cy="53" rx="4" ry="2" fill="#f472b6" opacity="0.6" />
          {/* Large Anime Eyes */}
          <g>
            <ellipse cx="38" cy="46" rx="4.5" ry="6" fill="#047857" />
            <circle cx="37" cy="44" r="1.8" fill="#ffffff" />
            <circle cx="39.5" cy="48" r="0.9" fill="#ffffff" />
            <path d="M33 42 C36 40 41 40 44 42" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <ellipse cx="62" cy="46" rx="4.5" ry="6" fill="#047857" />
            <circle cx="61" cy="44" r="1.8" fill="#ffffff" />
            <circle cx="63.5" cy="48" r="0.9" fill="#ffffff" />
            <path d="M56 42 C59 40 64 40 67 42" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          {/* Smile & Nose */}
          <circle cx="50" cy="51" r="0.8" fill="#e2b48f" />
          <path d="M46 58 Q50 62 54 58" stroke="#f43f5e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Front Hair Bangs */}
          <path d="M26 36 C34 38 38 48 40 50 C44 38 52 38 56 48 C60 38 68 40 74 36 C74 20 64 16 50 16 C36 16 26 20 26 36 Z" fill="#f472b6" />
          {/* Star Hair Clip */}
          <polygon points="30,28 32,33 37,33 33,36 35,41 30,38 26,41 28,36 24,33 29,33" fill="#facc15" />
        </g>
      );

    case 'kai':
      return (
        <g>
          {/* Dark Clothes */}
          <path d="M20 100 C20 76 34 70 50 70 C66 70 80 76 80 100 Z" fill="#0f172a" />
          <path d="M44 70 L50 82 L56 70 Z" fill="#ffffff" />
          <path d="M48 76 L52 76 L50 90 Z" fill="#4338ca" />
          {/* Neck & Face */}
          <rect x="45" y="56" width="10" height="16" fill="#fed7aa" />
          <path d="M30 40 C30 64 40 72 50 72 C60 72 70 64 70 40 C70 24 60 18 50 18 C40 18 30 24 30 40 Z" fill="#fff1e6" />
          {/* Glasses Frame */}
          <rect x="33" y="42" width="13" height="9" rx="2" fill="none" stroke="#6366f1" strokeWidth="1.6" />
          <rect x="54" y="42" width="13" height="9" rx="2" fill="none" stroke="#6366f1" strokeWidth="1.6" />
          <line x1="46" y1="46" x2="54" y2="46" stroke="#6366f1" strokeWidth="1.6" />
          {/* Eyes behind glasses */}
          <ellipse cx="39.5" cy="46.5" rx="3.5" ry="4" fill="#312e81" />
          <circle cx="38.5" cy="45" r="1.2" fill="#ffffff" />
          <ellipse cx="60.5" cy="46.5" rx="3.5" ry="4" fill="#312e81" />
          <circle cx="59.5" cy="45" r="1.2" fill="#ffffff" />
          {/* Mouth & Nose */}
          <circle cx="50" cy="53" r="0.7" fill="#cbd5e1" />
          <path d="M47 60 L53 60" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          {/* Raven anime layered hair with parted bangs */}
          <path d="M26 38 C28 20 38 14 50 14 C62 14 74 20 74 38 C74 46 72 54 70 56 C66 42 62 34 54 36 C48 38 46 48 42 54 C38 44 32 46 26 38 Z" fill="#1e1b4b" />
          <path d="M48 14 Q52 8 56 12 Q52 14 50 16 Z" fill="#312e81" />
        </g>
      );

    case 'aoi':
      return (
        <g>
          {/* Mint Bob Back */}
          <path d="M22 36 C20 60 22 76 30 80 C26 62 26 44 28 36 Z" fill="#0891b2" />
          <path d="M78 36 C80 60 78 76 70 80 C74 62 74 44 72 36 Z" fill="#0891b2" />
          {/* Pastel Lavender Hoodie */}
          <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#818cf8" />
          <ellipse cx="50" cy="74" rx="14" ry="7" fill="#6366f1" />
          <rect x="46" y="56" width="8" height="14" fill="#fed7aa" />
          {/* Face */}
          <path d="M29 38 C29 62 39 70 50 70 C61 70 71 62 71 38 C71 22 61 18 50 18 C39 18 29 22 29 38 Z" fill="#fff1e6" />
          {/* Cheeks */}
          <ellipse cx="37" cy="51" rx="4" ry="2" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="63" cy="51" rx="4" ry="2" fill="#f43f5e" opacity="0.4" />
          {/* Cyan Big Eyes */}
          <ellipse cx="39" cy="45" rx="4.5" ry="5.5" fill="#06b6d4" />
          <circle cx="38" cy="43" r="1.8" fill="#ffffff" />
          <circle cx="40.5" cy="47" r="0.9" fill="#ffffff" />
          <path d="M34 40 C37 38 42 38 45 40" stroke="#083344" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="61" cy="45" rx="4.5" ry="5.5" fill="#06b6d4" />
          <circle cx="60" cy="43" r="1.8" fill="#ffffff" />
          <circle cx="62.5" cy="47" r="0.9" fill="#ffffff" />
          <path d="M55 40 C58 38 63 38 66 40" stroke="#083344" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Cute Smile */}
          <path d="M47 56 Q50 59 53 56" stroke="#e11d48" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Aqua Bob Front */}
          <path d="M26 34 C30 20 40 16 50 16 C60 16 72 20 74 34 C74 48 70 60 68 62 C64 48 60 40 52 42 C44 44 42 56 36 62 C32 58 28 48 26 34 Z" fill="#06b6d4" />
          {/* Hairpins */}
          <line x1="31" y1="28" x2="36" y2="33" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
          <line x1="33" y1="26" x2="38" y2="31" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'yuki':
      return (
        <g>
          {/* Soft Silvery Locks Back */}
          <path d="M22 38 C18 64 22 84 28 92 C24 72 26 50 28 38 Z" fill="#94a3b8" />
          <path d="M78 38 C82 64 78 84 72 92 C76 72 74 50 72 38 Z" fill="#94a3b8" />
          {/* Turtleneck Sweater */}
          <path d="M20 100 C20 74 34 70 50 70 C66 70 80 74 80 100 Z" fill="#f8fafc" />
          <rect x="40" y="58" width="20" height="14" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          {/* Face */}
          <path d="M30 38 C30 62 40 70 50 70 C60 70 70 62 70 38 C70 22 60 18 50 18 C40 18 30 22 30 38 Z" fill="#fff1e6" />
          {/* Serene Lavender Eyes */}
          <ellipse cx="40" cy="45" rx="4" ry="5" fill="#818cf8" />
          <circle cx="39" cy="43.5" r="1.5" fill="#ffffff" />
          <path d="M35 41 C38 39 43 39 46 41" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <ellipse cx="60" cy="45" rx="4" ry="5" fill="#818cf8" />
          <circle cx="59" cy="43.5" r="1.5" fill="#ffffff" />
          <path d="M54 41 C57 39 62 39 65 41" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Calm Gentle Smile */}
          <path d="M47 57 Q50 59 53 57" stroke="#64748b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Layered Silvery White Hair */}
          <path d="M27 34 C30 18 40 14 50 14 C60 14 70 18 73 34 C73 48 70 58 66 60 C62 46 58 38 52 40 C46 42 44 54 38 60 C34 56 30 46 27 34 Z" fill="#cbd5e1" />
          <path d="M48 14 Q52 6 56 12 Q51 14 49 16 Z" fill="#e2e8f0" />
        </g>
      );

    case 'haruto':
      return (
        <g>
          {/* Varsity Jacket */}
          <path d="M18 100 C18 74 32 68 50 68 C68 68 82 74 82 100 Z" fill="#ea580c" />
          <path d="M38 68 L50 82 L62 68 Z" fill="#ffffff" />
          <path d="M45 74 L55 74 L50 88 Z" fill="#1e293b" />
          {/* Neck & Face */}
          <rect x="44" y="54" width="12" height="18" fill="#fed7aa" />
          <path d="M30 38 C30 62 40 70 50 70 C60 70 70 62 70 38 C70 24 60 18 50 18 C40 18 30 24 30 38 Z" fill="#fff1e6" />
          {/* Confident Amber Eyes */}
          <ellipse cx="39" cy="45" rx="4" ry="4.5" fill="#b45309" />
          <circle cx="38" cy="43.5" r="1.4" fill="#ffffff" />
          <path d="M34 40 L44 42" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="61" cy="45" rx="4" ry="4.5" fill="#b45309" />
          <circle cx="60" cy="43.5" r="1.4" fill="#ffffff" />
          <path d="M66 40 L56 42" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
          {/* Confident Grin */}
          <path d="M45 56 Q50 62 55 57 Z" fill="#dc2626" />
          {/* Spiky Anime Hair in Warm Amber */}
          <path d="M22 36 L26 24 L34 28 L40 16 L48 24 L56 12 L62 22 L70 16 L74 28 L80 36 L74 44 C72 34 66 32 58 36 C50 40 46 32 38 36 C30 40 26 44 22 36 Z" fill="#d97706" />
          <path d="M36 28 L42 20 L44 30 Z" fill="#f59e0b" />
        </g>
      );

    case 'hina':
      return (
        <g>
          {/* High Ponytail */}
          <path d="M66 22 C82 18 92 34 88 56 C82 46 76 36 68 30 Z" fill="#ca8a04" />
          <circle cx="67" cy="24" r="4.5" fill="#ef4444" />
          {/* School Cardigan */}
          <path d="M20 100 C20 76 34 70 50 70 C66 70 80 76 80 100 Z" fill="#3b82f6" />
          <path d="M42 70 L50 82 L58 70 Z" fill="#ffffff" />
          <rect x="45" y="56" width="10" height="16" fill="#fed7aa" />
          {/* Face */}
          <path d="M29 40 C29 64 39 72 50 72 C61 72 71 64 71 40 C71 24 61 18 50 18 C39 18 29 24 29 40 Z" fill="#fff1e6" />
          {/* Warm Brown Eyes */}
          <ellipse cx="39" cy="46" rx="4" ry="5.5" fill="#713f12" />
          <circle cx="38" cy="44" r="1.5" fill="#ffffff" />
          <circle cx="40.5" cy="48" r="0.8" fill="#ffffff" />
          <path d="M34 41 C37 39 42 39 45 41" stroke="#422006" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="61" cy="46" rx="4" ry="5.5" fill="#713f12" />
          <circle cx="60" cy="44" r="1.5" fill="#ffffff" />
          <circle cx="62.5" cy="48" r="0.8" fill="#ffffff" />
          <path d="M55 41 C58 39 63 39 66 41" stroke="#422006" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Smile */}
          <path d="M46 58 Q50 62 54 58" stroke="#f43f5e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Golden Blonde Bangs */}
          <path d="M26 36 C28 22 38 16 50 16 C62 16 70 20 72 36 C70 48 66 52 62 42 C56 38 52 46 48 42 C42 38 36 50 30 42 C28 44 26 40 26 36 Z" fill="#eab308" />
        </g>
      );

    case 'ryo':
      return (
        <g>
          {/* Cyber Dark Hoodie */}
          <path d="M18 100 C18 74 32 68 50 68 C68 68 82 74 82 100 Z" fill="#18181b" />
          <path d="M40 68 C40 82 60 82 60 68 Z" fill="#3f3f46" />
          <rect x="45" y="54" width="10" height="16" fill="#fed7aa" />
          {/* Face */}
          <path d="M30 38 C30 62 40 70 50 70 C60 70 70 62 70 38 C70 22 60 18 50 18 C40 18 30 22 30 38 Z" fill="#fff1e6" />
          {/* Tech Violet Eyes */}
          <ellipse cx="40" cy="45" rx="3.5" ry="4.5" fill="#a855f7" />
          <circle cx="39" cy="43.5" r="1.3" fill="#ffffff" />
          <path d="M35 41 L44 42" stroke="#581c87" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="60" cy="45" rx="3.5" ry="4.5" fill="#a855f7" />
          <circle cx="59" cy="43.5" r="1.3" fill="#ffffff" />
          <path d="M65 41 L56 42" stroke="#581c87" strokeWidth="2" strokeLinecap="round" />
          {/* Calm Line */}
          <line x1="47" y1="58" x2="53" y2="58" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
          {/* Violet Sweep Fringe Hair */}
          <path d="M24 36 C24 20 36 14 50 14 C64 14 74 20 74 36 C74 44 68 40 64 36 C56 34 50 48 42 54 C34 58 28 44 24 36 Z" fill="#7c3aed" />
          {/* Over-ear Headphones Band */}
          <path d="M22 42 C16 32 16 16 50 16 C84 16 84 32 78 42" fill="none" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="18" y="38" width="6" height="14" rx="3" fill="#a855f7" />
          <rect x="76" y="38" width="6" height="14" rx="3" fill="#a855f7" />
        </g>
      );

    case 'mina':
      return (
        <g>
          {/* Space Buns */}
          <circle cx="24" cy="24" r="8" fill="#9333ea" />
          <circle cx="76" cy="24" r="8" fill="#9333ea" />
          {/* Pink Track Jacket */}
          <path d="M20 100 C20 74 34 70 50 70 C66 70 80 74 80 100 Z" fill="#ec4899" />
          <line x1="50" y1="70" x2="50" y2="100" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="45" y="56" width="10" height="16" fill="#fed7aa" />
          {/* Face */}
          <path d="M28 40 C28 64 38 72 50 72 C62 72 72 64 72 40 C72 24 62 18 50 18 C38 18 28 24 28 40 Z" fill="#fff1e6" />
          {/* Cheeks */}
          <ellipse cx="36" cy="52" rx="4" ry="2" fill="#ec4899" opacity="0.5" />
          <ellipse cx="64" cy="52" rx="4" ry="2" fill="#ec4899" opacity="0.5" />
          {/* Playful Wink Left Eye, Open Right Eye */}
          <path d="M34 46 Q39 42 44 46" stroke="#581c87" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="62" cy="45" rx="4" ry="5.5" fill="#a855f7" />
          <circle cx="61" cy="43.5" r="1.5" fill="#ffffff" />
          <path d="M56 40 C59 38 64 38 67 40" stroke="#581c87" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Playful Smile */}
          <path d="M47 57 Q51 62 55 58" stroke="#db2777" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Lilac Bangs */}
          <path d="M26 36 C30 20 40 16 50 16 C60 16 70 20 74 36 C68 46 62 38 56 42 C50 46 48 38 42 42 C36 46 30 40 26 36 Z" fill="#a855f7" />
        </g>
      );

    case 'kenji':
      return (
        <g>
          {/* Polo Collar */}
          <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#059669" />
          <path d="M42 68 L50 80 L58 68 Z" fill="#ffffff" />
          <rect x="44" y="54" width="12" height="18" fill="#fed7aa" />
          {/* Face */}
          <path d="M30 38 C30 62 40 70 50 70 C60 70 70 62 70 38 C70 22 60 18 50 18 C40 18 30 22 30 38 Z" fill="#fff1e6" />
          {/* Headband */}
          <rect x="28" y="28" width="44" height="6" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
          {/* Hazel Motivated Eyes */}
          <ellipse cx="39" cy="44" rx="4" ry="4.5" fill="#4d7c0f" />
          <circle cx="38" cy="42.5" r="1.4" fill="#ffffff" />
          <path d="M34 39 L44 40" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="61" cy="44" rx="4" ry="4.5" fill="#4d7c0f" />
          <circle cx="60" cy="42.5" r="1.4" fill="#ffffff" />
          <path d="M66 39 L56 40" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          {/* Grin */}
          <path d="M46 56 Q50 60 54 56" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Chestnut Textured Hair */}
          <path d="M24 32 L28 18 L36 22 L44 14 L50 20 L58 12 L64 22 L72 16 L76 32 C70 26 64 26 58 30 C52 26 46 26 40 30 C34 26 28 26 24 32 Z" fill="#78350f" />
        </g>
      );

    case 'ren':
    default:
      return (
        <g>
          {/* High-collar navy school jacket */}
          <path d="M20 100 C20 74 32 68 50 68 C68 68 80 74 80 100 Z" fill="#0f172a" />
          <path d="M44 68 L50 78 L56 68 Z" fill="#3b82f6" />
          <rect x="45" y="54" width="10" height="18" fill="#fed7aa" />
          {/* Anime Jawline & Face */}
          <path d="M29 38 C29 62 39 70 50 70 C61 70 71 62 71 38 C71 22 61 18 50 18 C39 18 29 22 29 38 Z" fill="#fff1e6" />
          {/* Amber Eyes */}
          <ellipse cx="39" cy="44.5" rx="3.8" ry="4.5" fill="#d97706" />
          <circle cx="38" cy="43" r="1.4" fill="#ffffff" />
          <circle cx="40" cy="46" r="0.7" fill="#ffffff" />
          <path d="M34 40 L44 41" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="61" cy="44.5" rx="3.8" ry="4.5" fill="#d97706" />
          <circle cx="60" cy="43" r="1.4" fill="#ffffff" />
          <circle cx="62" cy="46" r="0.7" fill="#ffffff" />
          <path d="M66 40 L56 41" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          {/* Smile */}
          <path d="M46 56 Q50 60 54 56" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Deep Cobalt Anime Spiky Hair */}
          <path d="M24 36 L26 22 L34 26 L42 14 L48 24 L56 12 L64 24 L72 18 L76 36 C72 44 66 38 60 42 C54 36 48 44 40 40 C34 44 28 42 24 36 Z" fill="#2563eb" />
          {/* Headphones */}
          <path d="M24 44 C18 34 18 20 50 20 C82 20 82 34 76 44" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="20" y="38" width="6" height="14" rx="3" fill="#0369a1" />
          <rect x="74" y="38" width="6" height="14" rx="3" fill="#0369a1" />
        </g>
      );
  }
}
