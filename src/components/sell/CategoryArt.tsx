import React, { useId } from 'react';

export type CategoryArtKind = 'phone' | 'laptop' | 'tablet' | 'tv';

/** Product-shot style SVG illustrations for the "Sell your gadgets" category cards. */
export const CategoryArt: React.FC<{ kind: CategoryArtKind; className?: string }> = ({ kind, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const g = (name: string) => `${name}${uid}`;

  return (
    <svg viewBox="0 0 200 150" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={g('plum')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a4390" />
          <stop offset="50%" stopColor="#5b2560" />
          <stop offset="100%" stopColor="#35123a" />
        </linearGradient>
        <linearGradient id={g('screen')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={g('screen2')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={g('metal')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9e9ef" />
          <stop offset="100%" stopColor="#b9bac6" />
        </linearGradient>
        <linearGradient id={g('sheen')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity=".05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={g('shadow')}>
          <stop offset="0%" stopColor="#000" stopOpacity=".22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {kind === 'phone' && (
        <g>
          <ellipse cx="104" cy="140" rx="62" ry="6" fill={`url(#${g('shadow')})`} />
          {/* back phone */}
          <g transform="rotate(-12 80 80)">
            <rect x="52" y="14" width="62" height="124" rx="13" fill={`url(#${g('plum')})`} />
            <rect x="52" y="14" width="62" height="124" rx="13" fill={`url(#${g('sheen')})`} />
            <rect x="57" y="19" width="33" height="33" rx="10" fill="#2a0f2e" opacity=".55" />
            {[
              [66, 28],
              [66, 44],
              [81, 36],
            ].map(([cx, cy]) => (
              <g key={`${cx}${cy}`}>
                <circle cx={cx} cy={cy} r="6.2" fill="#0d0b12" stroke="#4a3550" strokeWidth="1" />
                <circle cx={cx - 1.2} cy={cy - 1.4} r=".9" fill="#fff" opacity=".7" />
              </g>
            ))}
          </g>
          {/* front phone */}
          <g transform="rotate(8 130 80)">
            <rect x="104" y="20" width="62" height="124" rx="13" fill="#1b1420" />
            <rect x="107" y="23" width="56" height="118" rx="10.5" fill={`url(#${g('screen')})`} />
            <path d="M107 80 C 125 64, 140 98, 163 74 L163 141 L107 141 Z" fill="#fff" opacity=".18" />
            <rect x="125" y="27" width="20" height="6" rx="3" fill="#050507" />
          </g>
        </g>
      )}

      {kind === 'laptop' && (
        <g>
          <ellipse cx="100" cy="134" rx="84" ry="6" fill={`url(#${g('shadow')})`} />
          <rect x="40" y="22" width="120" height="82" rx="7" fill="#1d1a24" />
          <rect x="45" y="27" width="110" height="72" rx="3" fill={`url(#${g('screen2')})`} />
          <path d="M45 76 C 75 56, 110 96, 155 64 L155 99 L45 99 Z" fill="#fff" opacity=".14" />
          <circle cx="100" cy="24.5" r="1.1" fill="#3b3646" />
          <path d="M22 106 H178 L170 122 Q168 126 162 126 H38 Q32 126 30 122 Z" fill={`url(#${g('metal')})`} />
          <rect x="22" y="104" width="156" height="4" rx="2" fill="#d6d7df" />
          <rect x="86" y="106" width="28" height="3" rx="1.5" fill="#a3a5b3" />
        </g>
      )}

      {kind === 'tablet' && (
        <g>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill={`url(#${g('shadow')})`} />
          <g transform="rotate(-6 100 75)">
            <rect x="40" y="12" width="120" height="122" rx="12" fill="#cfd0d8" />
            <rect x="43" y="15" width="114" height="116" rx="9.5" fill="#15121b" />
            <rect x="47" y="19" width="106" height="108" rx="6" fill={`url(#${g('screen')})`} />
            <path d="M47 86 C 80 62, 112 110, 153 80 L153 127 L47 127 Z" fill="#fff" opacity=".2" />
            <circle cx="100" cy="17" r="1" fill="#3b3646" />
          </g>
          <g transform="rotate(38 160 100)">
            <rect x="150" y="40" width="7" height="86" rx="3.5" fill="#f4f4f7" stroke="#d8d9e1" />
            <path d="M150 126 L153.5 136 L157 126 Z" fill="#d8d9e1" />
          </g>
        </g>
      )}

      {kind === 'tv' && (
        <g>
          <ellipse cx="100" cy="138" rx="58" ry="5" fill={`url(#${g('shadow')})`} />
          <rect x="16" y="14" width="168" height="100" rx="5" fill="#141118" />
          <rect x="20" y="18" width="160" height="92" rx="2" fill={`url(#${g('screen2')})`} />
          <path d="M20 88 C 60 60, 120 112, 180 70 L180 110 L20 110 Z" fill="#fbbf24" opacity=".28" />
          <path d="M20 96 C 70 80, 120 118, 180 92 L180 110 L20 110 Z" fill="#fff" opacity=".12" />
          <path d="M84 114 L76 134 H124 L116 114 Z" fill={`url(#${g('metal')})`} />
          <rect x="66" y="132" width="68" height="5" rx="2.5" fill="#c7c8d2" />
        </g>
      )}
    </svg>
  );
};
