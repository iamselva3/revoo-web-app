import React, { useMemo, useState } from 'react';
import { resolveImageUrl } from '../../api/client';

interface BrandLogoProps {
  name: string;
  slug?: string;
  logoUrl?: string;
  className?: string;
}

/**
 * Brand logo that never renders as an empty box: tries the configured logo, then the bundled
 * copy by slug (e.g. "google-pixel" → google.png), and finally a clean typographic wordmark.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ name, slug = '', logoUrl, className = '' }) => {
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (logoUrl) {
      // Bundled assets are served same-origin (faster); custom uploads come from the API host
      if (logoUrl.startsWith('/uploads/')) list.push(logoUrl);
      list.push(resolveImageUrl(logoUrl));
    }
    const s = slug.toLowerCase();
    if (s) {
      list.push(`/uploads/brands/${s}.png`);
      if (s.includes('-')) list.push(`/uploads/brands/${s.split('-')[0]}.png`);
    }
    return Array.from(new Set(list));
  }, [logoUrl, slug]);

  const [index, setIndex] = useState(0);

  if (index >= candidates.length) {
    return (
      <span
        className={`flex items-center justify-center text-center font-extrabold leading-none tracking-tight text-[#1f1147] ${className}`}
        style={{ fontSize: name.length > 8 ? '0.8rem' : '0.95rem' }}
        aria-label={name}
      >
        {name}
      </span>
    );
  }

  return (
    <img
      src={candidates[index]}
      alt={`${name} logo`}
      loading="lazy"
      draggable={false}
      onError={() => setIndex((i) => i + 1)}
      className={`object-contain ${className}`}
    />
  );
};
