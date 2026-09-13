import React from 'react';

/**
 * Validates that a social URL uses a safe web protocol.
 * Rejects executable and dangerous URI schemes (javascript:, data:, vbscript:, file:).
 */
export function validateSafeSocialUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();

  // Reject dangerous protocols
  if (
    sanitized.startsWith('javascript:') ||
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:') ||
    sanitized.startsWith('file:')
  ) {
    return false;
  }

  // Accept standard http, https, mailto, tel, or whatsapp schemes
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed) ||
    /^whatsapp:\/\//i.test(trimmed)
  );
}

/**
 * Standard optically centered 24x24 SVG icons for all supported platforms.
 */
export const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  pinterest: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="20" />
      <path d="M8 10a4 4 0 1 1 8 0c0 2.5-1.5 5-4 5s-4-2.5-4-5" />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  reddit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="2" />
      <path d="M12 10v4" />
      <path d="M4.5 13a2.5 2.5 0 1 0 4.5 1.5c1-.5 2-.8 3-.8s2 .3 3 .8a2.5 2.5 0 1 0 4.5-1.5" />
      <path d="M8 17c1 1 3 1.5 4 1.5s3-.5 4-1.5" />
    </svg>
  ),
  discord: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6a14.5 14.5 0 0 0-4-1.5 9.5 9.5 0 0 0-.5 1.5 12.8 12.8 0 0 0-3 0 9.5 9.5 0 0 0-.5-1.5A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2 8.5 14.6 14.6 0 0 0 4.5 2.5c.4-.5.7-1 1-1.5a9.7 9.7 0 0 1-1.5-.7.2.2 0 0 1 0-.3 10.6 10.6 0 0 0 7.4 0 .2.2 0 0 1 0 .3 9.7 9.7 0 0 1-1.5.7c.3.5.6 1 1 1.5a14.6 14.6 0 0 0 4.5-2.5A15.8 15.8 0 0 0 18 6Z" />
      <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  vimeo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 7.5c.5-1 2.5-1.5 3.5.5s2.5 7.5 3 8 2.5 0 3.5-2 2.5-5.5 2.5-6.5-.5-1.5-2-1.5" />
    </svg>
  ),
  medium: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="12" r="4" fill="currentColor" stroke="none" />
      <ellipse cx="14.5" cy="12" rx="2.5" ry="4" fill="currentColor" stroke="none" />
      <ellipse cx="20" cy="12" rx="1" ry="3.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  tumblr: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 20.5c-2.5 0-4-1.5-4-4V10H7V7c2-.5 3-2 3.5-4h2.5v4h3v3h-3v5.5c0 1 .5 1.5 1.5 1.5h1.5v3.5h-2z" />
    </svg>
  ),
  soundcloud: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="2" y1="14" x2="2" y2="12" />
      <line x1="5" y1="16" x2="5" y2="10" />
      <line x1="8" y1="17" x2="8" y2="8" />
      <line x1="11" y1="18" x2="11" y2="7" />
      <path d="M14 19V6c1.5 0 3 .5 4 1.5s1.5 2.5 1.5 4c1 0 2 .5 2.5 1.5s.5 2 0 3-1.5 1.5-2.5 1.5H14z" />
    </svg>
  ),
  spotify: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 11.5c3-1 6-1 8 .5" />
      <path d="M7 14.5c4-1 8-.5 10 1" />
      <path d="M9 8.5c3.5-1 7.5-.5 10.5 1" />
    </svg>
  ),
  dribbble: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </svg>
  ),
  behance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 13.5h4c1 0 2-.5 2-1.5s-1-1.5-2-1.5H3v3zm0-5h3.5c1 0 1.8-.5 1.8-1.5s-.8-1.5-1.8-1.5H3v3zM1 3h6c2.5 0 4.5 1.2 4.5 3.2 0 1.2-.6 2.2-1.7 2.8 1.4.6 2.2 1.8 2.2 3.3 0 2.2-2 3.7-4.8 3.7H1V3zm14 3h5v1.5h-5V6zm5 7c0-2.8-1.8-4.5-4.5-4.5S11 10.2 11 13s1.8 4.5 4.5 4.5c2 0 3.5-.8 4.2-2.3l-2-.8c-.4.8-1.2 1.2-2.2 1.2-1.2 0-2.2-.8-2.4-2.1H20v-.5zm-6.8-1c.2-1.2 1.1-2 2.3-2s2.1.8 2.3 2h-4.6z" />
    </svg>
  ),
  snapchat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c-3.3 0-6 2.7-6 6 0 1.3.4 2.5 1.1 3.5-.1.5-.6 1.3-1.6 1.8-.5.3-.8.8-.7 1.4.1.6.6 1 1.2 1 .3 0 .7-.1 1-.2.2.4.6.8 1.1.9.5.1 1.1 0 1.6-.3.7.6 1.5.9 2.3.9s1.6-.3 2.3-.9c.5.3 1.1.4 1.6.3.5-.1.9-.5 1.1-.9.3.1.7.2 1 .2.6 0 1.1-.4 1.2-1 .1-.6-.2-1.1-.7-1.4-1-.5-1.5-1.3-1.6-1.8.7-1 1.1-2.2 1.1-3.5 0-3.3-2.7-6-6-6z" />
    </svg>
  ),
  custom: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

/**
 * Platform catalog with metadata, brand colors, and placeholder guidance.
 * Note: Placeholders are user input guidance only — NEVER default persisted URLs.
 */
export const PLATFORM_CATALOG = [
  {
    id: 'instagram',
    name: 'Instagram',
    className: 'social-instagram',
    placeholder: 'https://instagram.com/yourprofile',
    defaultColor: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    className: 'social-linkedin',
    placeholder: 'https://linkedin.com/company/yourprofile',
    defaultColor: '#0077b5',
    borderColor: 'rgba(0, 119, 181, 0.4)',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    className: 'social-pinterest',
    placeholder: 'https://pinterest.com/yourprofile',
    defaultColor: '#bd081c',
    borderColor: 'rgba(189, 8, 28, 0.4)',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    className: 'social-facebook',
    placeholder: 'https://facebook.com/yourpage',
    defaultColor: '#1877f2',
    borderColor: 'rgba(24, 119, 242, 0.4)',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    className: 'social-youtube',
    placeholder: 'https://youtube.com/@yourchannel',
    defaultColor: '#ff0000',
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    className: 'social-whatsapp',
    placeholder: 'https://wa.me/971500000000',
    defaultColor: '#25d366',
    borderColor: 'rgba(37, 211, 102, 0.4)',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    className: 'social-tiktok',
    placeholder: 'https://tiktok.com/@yourprofile',
    defaultColor: '#010101',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    className: 'social-twitter',
    placeholder: 'https://x.com/yourhandle',
    defaultColor: '#111111',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    className: 'social-reddit',
    placeholder: 'https://reddit.com/r/yourcommunity',
    defaultColor: '#ff4500',
    borderColor: 'rgba(255, 69, 0, 0.4)',
  },
  {
    id: 'discord',
    name: 'Discord',
    className: 'social-discord',
    placeholder: 'https://discord.gg/yourinvite',
    defaultColor: '#5865f2',
    borderColor: 'rgba(88, 101, 242, 0.4)',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    className: 'social-telegram',
    placeholder: 'https://t.me/yourchannel',
    defaultColor: '#229ed9',
    borderColor: 'rgba(34, 158, 217, 0.4)',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    className: 'social-vimeo',
    placeholder: 'https://vimeo.com/yourprofile',
    defaultColor: '#1ab7ea',
    borderColor: 'rgba(26, 183, 234, 0.4)',
  },
  {
    id: 'medium',
    name: 'Medium',
    className: 'social-medium',
    placeholder: 'https://medium.com/@yourprofile',
    defaultColor: '#242424',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  {
    id: 'tumblr',
    name: 'Tumblr',
    className: 'social-tumblr',
    placeholder: 'https://yourblog.tumblr.com',
    defaultColor: '#35465c',
    borderColor: 'rgba(53, 70, 92, 0.4)',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    className: 'social-soundcloud',
    placeholder: 'https://soundcloud.com/yourprofile',
    defaultColor: '#ff5500',
    borderColor: 'rgba(255, 85, 0, 0.4)',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    className: 'social-spotify',
    placeholder: 'https://open.spotify.com/artist/...',
    defaultColor: '#1db954',
    borderColor: 'rgba(29, 185, 84, 0.4)',
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    className: 'social-dribbble',
    placeholder: 'https://dribbble.com/yourprofile',
    defaultColor: '#ea4c89',
    borderColor: 'rgba(234, 76, 137, 0.4)',
  },
  {
    id: 'behance',
    name: 'Behance',
    className: 'social-behance',
    placeholder: 'https://behance.net/yourprofile',
    defaultColor: '#1769ff',
    borderColor: 'rgba(23, 105, 255, 0.4)',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    className: 'social-snapchat',
    placeholder: 'https://snapchat.com/add/yourprofile',
    defaultColor: '#fffc00',
    borderColor: 'rgba(255, 252, 0, 0.4)',
  },
  {
    id: 'custom',
    name: 'Custom Link',
    className: 'social-custom',
    placeholder: 'https://your-custom-link.com',
    defaultColor: 'rgba(13, 38, 19, 0.85)',
    borderColor: 'rgba(230, 199, 122, 0.4)',
  },
];

PLATFORM_ICONS.x = PLATFORM_ICONS.twitter;

/**
 * Returns metadata and the appropriate SVG icon for a given platform.
 * Falls back safely to 'custom' if platform is unrecognized.
 */
export function getPlatformMetadata(platformId, customLabel = '') {
  let normId = (platformId || 'custom').toLowerCase().trim();
  if (normId === 'x') normId = 'twitter';
  const matched = PLATFORM_CATALOG.find((p) => p.id === normId) || PLATFORM_CATALOG.find((p) => p.id === 'custom');

  return {
    id: matched.id,
    name: normId === 'custom' && customLabel ? customLabel : matched.name,
    className: matched.className,
    placeholder: matched.placeholder,
    defaultColor: matched.defaultColor,
    borderColor: matched.borderColor,
    icon: PLATFORM_ICONS[matched.id] || PLATFORM_ICONS.custom,
  };
}

/**
 * Baseline default profiles for initial setup (all URLs empty, inactive).
 */
export const DEFAULT_BASELINE_PROFILES = [
  { id: 'instagram', platform: 'instagram', label: 'Instagram', url: '', icon: 'instagram', active: false, displayOrder: 0 },
  { id: 'linkedin', platform: 'linkedin', label: 'LinkedIn', url: '', icon: 'linkedin', active: false, displayOrder: 1 },
  { id: 'pinterest', platform: 'pinterest', label: 'Pinterest', url: '', icon: 'pinterest', active: false, displayOrder: 2 },
  { id: 'facebook', platform: 'facebook', label: 'Facebook', url: '', icon: 'facebook', active: false, displayOrder: 3 },
];
