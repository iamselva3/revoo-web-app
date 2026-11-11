import React, { useEffect, useId, useRef, useState } from 'react';

interface GenieLogoProps {
  /** Increment to replay the reveal animation (e.g. on logo tap or after login). */
  playKey?: number;
  /** Play the reveal once on mount. */
  animateOnMount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Show only the emblem (no wordmark). */
  emblemOnly?: boolean;
}

const LETTERS = ['G', 'e', 'n', 'i', 'e'];

const SIZES = {
  sm: { emblem: 'h-8', word: 'text-[22px]', gap: 'gap-1.5' },
  md: { emblem: 'h-10 sm:h-11', word: 'text-[25px] sm:text-[28px]', gap: 'gap-2' },
  lg: { emblem: 'h-16', word: 'text-[42px]', gap: 'gap-3' },
};

/**
 * Genie brand lockup built from the cleaned emblem + live text, so the wordmark is crisp and
 * follows the theme (ink on light, white on dark) instead of a flat PNG with a halo.
 *
 * Reveal: emblem emerges like a genie from the lamp → letters expand → smile line draws.
 */
export const GenieLogo: React.FC<GenieLogoProps> = ({
  playKey = 0,
  animateOnMount = false,
  size = 'md',
  className = '',
  emblemOnly = false,
}) => {
  const gradientId = useId().replace(/:/g, '');
  const [run, setRun] = useState(animateOnMount ? 1 : 0);
  const lastPlayKey = useRef(playKey);

  // Replay only when playKey actually changes (safe under React StrictMode double effects)
  useEffect(() => {
    if (playKey !== lastPlayKey.current) {
      lastPlayKey.current = playKey;
      setRun((r) => r + 1);
    }
  }, [playKey]);

  const s = SIZES[size];

  return (
    <span
      key={run}
      className={`genie-logo inline-flex items-center ${s.gap} select-none ${className}`}
      data-play={run > 0 ? 'true' : 'false'}
      aria-label="Genie"
      role="img"
    >
      <img
        src="/genie_emblem.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className={`genie-logo__emblem ${s.emblem} w-auto object-contain pointer-events-none`}
        style={{ transformOrigin: '50% 85%' }}
      />
      {!emblemOnly && (
        <span className={`relative inline-flex flex-col leading-none pb-[0.3em] ${s.word}`}>
          <span
            className="font-extrabold tracking-[-0.03em] text-ink dark:text-white"
            aria-hidden="true"
          >
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="genie-logo__letter inline-block origin-left"
                style={{ ['--i' as any]: i }}
              >
                {letter}
              </span>
            ))}
          </span>
          <svg
            className="absolute right-[-3%] bottom-0 w-[52%] overflow-visible"
            style={{ aspectRatio: '100 / 22' }}
            viewBox="0 0 100 22"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`smile-${gradientId}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f43f8e" />
                <stop offset="55%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              className="genie-logo__smile-path"
              d="M6 5 Q50 27 94 5"
              pathLength={1}
              fill="none"
              stroke={`url(#smile-${gradientId})`}
              strokeWidth={9}
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
};
