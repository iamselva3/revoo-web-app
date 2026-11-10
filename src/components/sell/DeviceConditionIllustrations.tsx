import React from 'react';

interface BackPanelIllustrationProps {
  condition: 'NO_DEFECTS' | 'MINOR_SCRATCHES' | 'HEAVY_SCRATCHES' | 'BACK_PANEL_BROKEN' | string;
}

export const BackPanelIllustration: React.FC<BackPanelIllustrationProps> = ({ condition }) => {
  const isBroken = condition === 'BACK_PANEL_BROKEN';
  const isMinorScratches = condition === 'MINOR_SCRATCHES';
  const isHeavyScratches = condition === 'HEAVY_SCRATCHES';

  return (
    <div className="relative flex items-center justify-center w-16 h-24">
      <svg width="60" height="88" viewBox="0 0 60 88" fill="none" className="transition-transform duration-200 group-hover:scale-105">
        {/* Phone Body Outline */}
        <rect
          x="2"
          y="2"
          width="56"
          height="84"
          rx="10"
          fill={isBroken ? '#374151' : '#FFFFFF'}
          stroke="#1E293B"
          strokeWidth="2.4"
        />

        {/* Camera Module (Top-Left) */}
        <rect
          x="6"
          y="6"
          width="20"
          height="24"
          rx="5"
          fill={isBroken ? '#1F2937' : '#F1F5F9'}
          stroke="#1E293B"
          strokeWidth="1.2"
        />

        {/* 3 Camera Lenses */}
        <circle cx="11.5" cy="11.5" r="3.2" fill="#0F172A" />
        <circle cx="11.5" cy="22.5" r="3.2" fill="#0F172A" />
        <circle cx="20.5" cy="17" r="3.2" fill="#0F172A" />

        {/* Flash Dot */}
        <circle cx="20.5" cy="10" r="1.3" fill="#EF4444" />

        {/* CONDITION MARKINGS */}
        {/* 1. Minor Scratches: 2 subtle red hairline scratches */}
        {isMinorScratches && (
          <g stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round">
            <line x1="26" y1="38" x2="44" y2="44" />
            <line x1="20" y1="58" x2="40" y2="64" />
          </g>
        )}

        {/* 2. Heavy Scratches: 4-5 red prominent scratches */}
        {isHeavyScratches && (
          <g stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round">
            <line x1="24" y1="32" x2="46" y2="40" />
            <line x1="16" y1="48" x2="38" y2="55" />
            <line x1="32" y1="60" x2="50" y2="67" />
            <line x1="18" y1="70" x2="36" y2="76" />
          </g>
        )}

        {/* 3. Broken: Spiderweb shattered white crack lines */}
        {isBroken && (
          <g stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path d="M18 32 L38 43 L52 28 M38 43 L26 64 L14 76 M38 43 L48 68 M26 64 L34 80 M18 32 L8 44" />
          </g>
        )}
      </svg>
    </div>
  );
};

interface SidePanelIllustrationProps {
  condition: 'NO_DEFECTS' | 'MINOR_DENT_OR_SCRATCHES' | 'HEAVY_DENT' | 'BENT_OR_BROKEN' | string;
}

export const SidePanelIllustration: React.FC<SidePanelIllustrationProps> = ({ condition }) => {
  const isBent = condition === 'BENT_OR_BROKEN';
  const isMinorDent = condition === 'MINOR_DENT_OR_SCRATCHES';
  const isHeavyDent = condition === 'HEAVY_DENT';

  return (
    <div className="relative flex items-center justify-center w-14 h-24">
      <svg width="42" height="88" viewBox="0 0 42 88" fill="none" className="transition-transform duration-200 group-hover:scale-105">
        {isBent ? (
          // Bent / Curved outer chassis frame
          <g>
            <path
              d="M 17 4 Q 28 44 17 84 L 23 84 Q 34 44 23 4 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Red Accent Buttons on bent edge */}
            <rect x="27" y="28" width="3" height="12" rx="1" fill="#EF4444" />
            <rect x="28" y="48" width="3" height="12" rx="1" fill="#EF4444" />
          </g>
        ) : (
          // Straight Side Profile
          <g>
            <rect x="14" y="4" width="12" height="80" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
            {/* Buttons on outer edge */}
            <rect x="26" y="24" width="3" height="12" rx="1" fill="#1E293B" />
            <rect x="26" y="44" width="3" height="18" rx="1" fill="#1E293B" />

            {/* Minor Dent: Small red notch & scuff */}
            {isMinorDent && (
              <g>
                <circle cx="14" cy="38" r="3.5" fill="#EF4444" />
                <line x1="16" y1="58" x2="24" y2="62" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" />
              </g>
            )}

            {/* Heavy Dent: Prominent deep red dents & scratches */}
            {isHeavyDent && (
              <g>
                <circle cx="14" cy="32" r="5" fill="#EF4444" />
                <circle cx="26" cy="54" r="4" fill="#EF4444" />
                <line x1="16" y1="66" x2="24" y2="72" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
