import React, { useId } from 'react';

/**
 * Device-condition illustration kit (SVG, theme-safe). Phones are drawn in Genie plum and
 * cropped like product shots; issues are marked with a yellow warning badge + pointer cone.
 * Every illustration shares the same 160×112 canvas so cards line up in a grid.
 */

export type ConditionArtKind =
  // Screen display
  | 'display-clean' | 'display-minor-spots' | 'display-major-spots'
  // Touch glass
  | 'glass-clean' | 'glass-minor-scratches' | 'glass-heavy-scratches' | 'glass-cracked'
  // Back panel
  | 'back-clean' | 'back-minor-scratches' | 'back-heavy-scratches' | 'back-broken'
  // Frame / side panel
  | 'frame-clean' | 'frame-minor' | 'frame-heavy-dent' | 'frame-bent'
  // Functional issues
  | 'battery' | 'front-camera' | 'back-camera' | 'camera-glass' | 'network' | 'charging-port'
  | 'wifi' | 'speaker' | 'microphone' | 'biometrics' | 'power-button' | 'volume-button'
  | 'vibration' | 'proximity'
  // Accessories / documents
  | 'charger' | 'box' | 'bill'
  // Overall
  | 'phone-on' | 'phone-off' | 'touch-ok' | 'display-original' | 'warranty';

const PLUM_DARK = '#3b1640';
const PLUM = '#5b2560';
const PLUM_LIGHT = '#7d3a80';

interface Ids {
  body: string;
  sheen: string;
  wall: string;
  spot: string;
  clip: string;
}

const Badge: React.FC<{ bx: number; by: number; tx: number; ty: number }> = ({ bx, by, tx, ty }) => {
  // Cone from the target to the badge, like a callout
  const angle = Math.atan2(by - ty, bx - tx);
  const spread = 6.5;
  const px = Math.cos(angle + Math.PI / 2) * spread;
  const py = Math.sin(angle + Math.PI / 2) * spread;
  return (
    <g>
      <polygon points={`${tx},${ty} ${bx + px},${by + py} ${bx - px},${by - py}`} fill="rgba(35,32,45,0.38)" />
      <circle cx={tx} cy={ty} r={1.6} fill="#262333" />
      <circle cx={bx} cy={by} r={10} fill="#fde047" stroke="#ffffff" strokeWidth={2.4} />
      <circle cx={bx} cy={by} r={10} fill="none" stroke="#2a2633" strokeWidth={1.1} />
      <path
        d={`M${bx} ${by - 5.6} L${bx + 5.4} ${by + 4} L${bx - 5.4} ${by + 4} Z`}
        fill="none"
        stroke="#2a2633"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <line x1={bx} y1={by - 2} x2={bx} y2={by + 0.9} stroke="#2a2633" strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={bx} cy={by + 2.6} r={0.75} fill="#2a2633" />
    </g>
  );
};

const Defs: React.FC<{ ids: Ids; bent?: boolean }> = ({ ids }) => (
  <defs>
    <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={PLUM_LIGHT} />
      <stop offset="45%" stopColor={PLUM} />
      <stop offset="100%" stopColor={PLUM_DARK} />
    </linearGradient>
    <linearGradient id={ids.sheen} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id={ids.wall} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#f7f7fa" />
      <stop offset="100%" stopColor="#cfd2dc" />
    </linearGradient>
    <radialGradient id={ids.spot}>
      <stop offset="0%" stopColor="#1e1b26" stopOpacity="0.75" />
      <stop offset="60%" stopColor="#1e1b26" stopOpacity="0.3" />
      <stop offset="100%" stopColor="#1e1b26" stopOpacity="0" />
    </radialGradient>
    <clipPath id={ids.clip}>
      <rect x="46" y="14" width="68" height="142" rx="12" />
    </clipPath>
  </defs>
);

type ScreenMode = 'wallpaper' | 'gray' | 'off';

const StatusBar: React.FC = () => (
  <g fill="#ffffff">
    <text x="52" y="25" fontSize="5.2" fontWeight={700} fontFamily="Plus Jakarta Sans, system-ui, sans-serif">10:52</text>
    <rect x="94" y="21.5" width="1.2" height="2.6" rx=".4" />
    <rect x="96" y="20.6" width="1.2" height="3.5" rx=".4" />
    <rect x="98" y="19.6" width="1.2" height="4.5" rx=".4" />
    <rect x="102" y="20" width="7" height="3.8" rx="1" fill="none" stroke="#fff" strokeWidth=".7" />
    <rect x="103" y="21" width="4.6" height="1.8" rx=".4" />
  </g>
);

const PhoneFront: React.FC<{ ids: Ids; screen?: ScreenMode; children?: React.ReactNode }> = ({
  ids,
  screen = 'wallpaper',
  children,
}) => (
  <g>
    {/* side buttons */}
    <rect x="117.4" y="44" width="2.6" height="17" rx="1.2" fill={PLUM_DARK} />
    <rect x="40" y="36" width="2.6" height="9" rx="1.2" fill={PLUM_DARK} />
    <rect x="40" y="50" width="2.6" height="14" rx="1.2" fill={PLUM_DARK} />
    {/* frame */}
    <rect x="42" y="10" width="76" height="150" rx="16" fill={`url(#${ids.body})`} />
    <rect x="44.5" y="12.5" width="71" height="145" rx="14" fill="#0b0a10" />
    {/* screen */}
    <g clipPath={`url(#${ids.clip})`}>
      {screen === 'wallpaper' && (
        <>
          <rect x="46" y="14" width="68" height="142" fill={`url(#${ids.wall})`} />
          <path d="M46 70 C 66 52, 86 96, 114 64 L114 156 L46 156 Z" fill="#ffffff" opacity=".75" />
          <path d="M46 92 C 70 74, 92 118, 114 92 L114 156 L46 156 Z" fill="#e3e5ec" opacity=".9" />
          <path d="M46 58 C 64 46, 84 70, 114 46" stroke="#ffffff" strokeWidth="3" fill="none" opacity=".8" />
        </>
      )}
      {screen === 'gray' && (
        <>
          <rect x="46" y="14" width="68" height="142" fill="#6c6b72" />
          <StatusBar />
        </>
      )}
      {screen === 'off' && (
        <>
          <rect x="46" y="14" width="68" height="142" fill="#16151c" />
          <path d="M46 14 L80 14 L46 70 Z" fill="#ffffff" opacity=".05" />
        </>
      )}
      {children}
    </g>
    {/* dynamic island + front camera */}
    <rect x="67" y="18.5" width="26" height="7.5" rx="3.75" fill="#050507" />
    <circle cx="88.6" cy="22.25" r="1.8" fill="#1d2433" />
    <circle cx="88.2" cy="21.8" r=".55" fill="#5b6b8c" />
  </g>
);

const PhoneBack: React.FC<{ ids: Ids; children?: React.ReactNode; crackedLens?: boolean }> = ({
  ids,
  children,
  crackedLens,
}) => (
  <g>
    <rect x="117.4" y="44" width="2.6" height="17" rx="1.2" fill={PLUM_DARK} />
    <rect x="42" y="10" width="76" height="150" rx="16" fill={`url(#${ids.body})`} />
    <rect x="42" y="10" width="76" height="150" rx="16" fill={`url(#${ids.sheen})`} />
    {/* camera plateau */}
    <rect x="47.5" y="15.5" width="42" height="42" rx="12" fill={PLUM_DARK} opacity=".55" />
    <rect x="47.5" y="15.5" width="42" height="42" rx="12" fill="none" stroke="#ffffff" strokeOpacity=".18" />
    {[
      [59, 27],
      [59, 46],
      [77.5, 36.5],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="8" fill="#2a1830" />
        <circle cx={cx} cy={cy} r="6.4" fill="#0c0b11" stroke="#43344a" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="3" fill="#1b2235" />
        <circle cx={cx - 1.6} cy={cy - 1.8} r="1" fill="#ffffff" opacity=".7" />
        {crackedLens && i === 0 && (
          <path
            d={`M${cx - 5} ${cy - 3} L${cx} ${cy} L${cx + 4} ${cy - 5} M${cx} ${cy} L${cx + 2} ${cy + 5.5} M${cx} ${cy} L${cx - 5.5} ${cy + 3}`}
            stroke="#ffffff"
            strokeWidth=".9"
            fill="none"
            opacity=".95"
          />
        )}
      </g>
    ))}
    <circle cx="80" cy="22" r="3" fill="#f6efe2" />
    <circle cx="80" cy="51" r="1.8" fill="#16131c" />
    {children}
  </g>
);

const PhoneBottom: React.FC<{ ids: Ids }> = ({ ids }) => (
  <g>
    <rect x="10" y="44" width="140" height="24" rx="12" fill={`url(#${ids.body})`} />
    <rect x="10" y="44" width="140" height="10" rx="5" fill="#ffffff" opacity=".12" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={`l${i}`} cx={30 + i * 5} cy="56" r="1.5" fill="#160f1a" />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={`r${i}`} cx={105 + i * 5} cy="56" r="1.5" fill="#160f1a" />
    ))}
    <rect x="69" y="52" width="22" height="8" rx="4" fill="#0d0a10" />
    <rect x="72" y="54.6" width="16" height="2.8" rx="1.4" fill="#2b2533" />
    <circle cx="62" cy="56" r="1.2" fill="#2b2533" />
    <circle cx="98" cy="56" r="1.2" fill="#2b2533" />
  </g>
);

const Scratches: React.FC<{ heavy?: boolean; color?: string }> = ({ heavy, color = '#ffffff' }) => (
  <g stroke={color} strokeLinecap="round" fill="none" opacity={heavy ? 0.85 : 0.75}>
    <path d="M58 54 L92 42" strokeWidth=".9" />
    <path d="M70 92 L104 78" strokeWidth=".8" />
    {heavy && (
      <>
        <path d="M52 72 L88 60" strokeWidth="1" />
        <path d="M62 112 L108 96" strokeWidth=".9" />
        <path d="M54 130 L96 118" strokeWidth="1.1" />
        <path d="M80 68 L110 58" strokeWidth=".7" />
        <path d="M50 100 L66 94" strokeWidth=".8" />
      </>
    )}
  </g>
);

const Cracks: React.FC<{ cx?: number; cy?: number; color?: string }> = ({ cx = 92, cy = 72, color = '#ffffff' }) => (
  <g stroke={color} strokeWidth=".95" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity=".95">
    <path d={`M${cx} ${cy} L${cx - 22} ${cy - 30} L${cx - 30} ${cy - 44}`} />
    <path d={`M${cx} ${cy} L${cx + 14} ${cy - 26}`} />
    <path d={`M${cx} ${cy} L${cx - 36} ${cy + 6} L${cx - 46} ${cy + 2}`} />
    <path d={`M${cx} ${cy} L${cx - 14} ${cy + 34} L${cx - 20} ${cy + 60}`} />
    <path d={`M${cx} ${cy} L${cx + 18} ${cy + 22}`} />
    <path d={`M${cx - 12} ${cy - 17} L${cx - 22} ${cy - 6} L${cx - 20} ${cy + 3}`} />
    <path d={`M${cx - 8} ${cy + 17} L${cx + 6} ${cy + 10}`} />
    <circle cx={cx} cy={cy} r="3" fill={color} opacity=".35" stroke="none" />
  </g>
);

const Glyph: React.FC<{ kind: 'battery' | 'signal' | 'wifi' | 'face' | 'vibrate' }> = ({ kind }) => {
  if (kind === 'battery')
    return (
      <g fill="none" stroke="#ffffff" strokeWidth="2.2">
        <rect x="70" y="64" width="20" height="36" rx="3.5" />
        <rect x="76" y="59" width="8" height="5" rx="1.5" fill="#ffffff" stroke="none" />
        <rect x="73.5" y="88" width="13" height="8.5" rx="1.2" fill="#ffffff" stroke="none" />
      </g>
    );
  if (kind === 'signal')
    return (
      <g fill="#ffffff">
        <path d="M60 76 L66 64 L72 76 M66 64 L66 98" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <rect x="76" y="90" width="5" height="8" rx="1" />
        <rect x="83" y="84" width="5" height="14" rx="1" />
        <rect x="90" y="77" width="5" height="21" rx="1" />
        <rect x="97" y="70" width="5" height="28" rx="1" opacity=".55" />
      </g>
    );
  if (kind === 'wifi')
    return (
      <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
        <path d="M64 80 Q80 66 96 80" />
        <path d="M69 86 Q80 77 91 86" />
        <circle cx="80" cy="92" r="2.2" fill="#ffffff" stroke="none" />
        <path d="M60 70 L100 100" stroke="#fca5a5" strokeWidth="2.4" />
      </g>
    );
  if (kind === 'face')
    return (
      <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
        <path d="M66 70 v-5 a3 3 0 0 1 3-3 h5 M86 62 h5 a3 3 0 0 1 3 3 v5 M94 86 v5 a3 3 0 0 1-3 3 h-5 M74 94 h-5 a3 3 0 0 1-3-3 v-5" />
        <path d="M74 73 v3 M86 73 v3 M80 74 v6 h-2 M74 85 q6 5 12 0" />
      </g>
    );
  return (
    <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
      <rect x="72" y="66" width="16" height="30" rx="3" />
      <path d="M66 72 l-3 4 3 4 -3 4 3 4 M94 72 l3 4 -3 4 3 4 -3 4" />
    </g>
  );
};

const Charger: React.FC = () => (
  <g>
    <path d="M98 66 C 120 70, 130 96, 108 104 C 92 110, 70 98, 54 104" stroke="#e5e7eb" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M98 66 C 120 70, 130 96, 108 104 C 92 110, 70 98, 54 104" stroke="#cbd0da" strokeWidth="1" fill="none" strokeLinecap="round" />
    <rect x="44" y="99" width="12" height="9" rx="2" fill="#f1f2f5" stroke="#cfd3dc" />
    <rect x="58" y="26" width="44" height="44" rx="10" fill="#ffffff" stroke="#d4d8e1" strokeWidth="1.2" />
    <rect x="70" y="18" width="5" height="10" rx="1.5" fill="#c3c8d2" />
    <rect x="85" y="18" width="5" height="10" rx="1.5" fill="#c3c8d2" />
    <rect x="76" y="64" width="8" height="5" rx="1.5" fill="#d9dde5" />
  </g>
);

const Box: React.FC<{ ids: Ids }> = ({ ids }) => (
  <g>
    <path d="M30 46 L80 30 L130 46 L80 62 Z" fill="#ffffff" stroke="#d4d8e1" strokeWidth="1.2" />
    <path d="M30 46 L30 82 L80 98 L80 62 Z" fill="#eceef3" stroke="#d4d8e1" strokeWidth="1.2" />
    <path d="M130 46 L130 82 L80 98 L80 62 Z" fill="#f6f7fa" stroke="#d4d8e1" strokeWidth="1.2" />
    <path d="M62 44 L80 38.5 L98 44 L80 49.5 Z" fill={`url(#${ids.body})`} />
    <rect x="104" y="72" width="16" height="10" rx="1.5" transform="skewY(-18)" fill="#ffffff" stroke="#cfd3dc" strokeWidth=".8" />
  </g>
);

const Bill: React.FC = () => (
  <g>
    <path
      d="M56 14 H104 V96 l-6 -4 -6 4 -6 -4 -6 4 -6 -4 -6 4 -6 -4 -6 4 Z"
      fill="#ffffff"
      stroke="#d4d8e1"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <rect x="64" y="24" width="22" height="4" rx="2" fill={PLUM} />
    {[38, 46, 54, 62].map((y) => (
      <g key={y}>
        <rect x="64" y={y} width="20" height="2.6" rx="1.3" fill="#d9dce4" />
        <rect x="88" y={y} width="9" height="2.6" rx="1.3" fill="#d9dce4" />
      </g>
    ))}
    <rect x="64" y="74" width="33" height="1" fill="#e5e7eb" />
    <text x="64" y="86" fontSize="8" fontWeight={800} fill={PLUM_DARK} fontFamily="Plus Jakarta Sans, system-ui, sans-serif">₹</text>
    <rect x="76" y="80" width="21" height="4" rx="2" fill="#f4b740" />
  </g>
);

export const ConditionArt: React.FC<{ kind: ConditionArtKind; className?: string }> = ({ kind, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const ids: Ids = {
    body: `b${uid}`,
    sheen: `s${uid}`,
    wall: `w${uid}`,
    spot: `p${uid}`,
    clip: `c${uid}`,
  };

  let content: React.ReactNode;

  switch (kind) {
    // ---------- Screen display ----------
    case 'display-clean':
    case 'touch-ok':
      content = <PhoneFront ids={ids} />;
      break;
    case 'display-minor-spots':
      content = (
        <>
          <PhoneFront ids={ids}>
            <circle cx="72" cy="66" r="7" fill={`url(#${ids.spot})`} />
            <circle cx="96" cy="96" r="5" fill={`url(#${ids.spot})`} />
          </PhoneFront>
          <Badge bx={136} by={36} tx={96} ty={96} />
        </>
      );
      break;
    case 'display-major-spots':
      content = (
        <>
          <PhoneFront ids={ids}>
            <circle cx="66" cy="60" r="10" fill={`url(#${ids.spot})`} />
            <circle cx="98" cy="84" r="12" fill={`url(#${ids.spot})`} />
            <circle cx="74" cy="104" r="8" fill={`url(#${ids.spot})`} />
            <rect x="83" y="14" width="1.6" height="142" fill="#22c55e" opacity=".85" />
            <rect x="88" y="14" width="1" height="142" fill="#e879f9" opacity=".85" />
            <rect x="60" y="14" width="1.2" height="142" fill="#38bdf8" opacity=".7" />
          </PhoneFront>
          <Badge bx={136} by={34} tx={98} ty={84} />
        </>
      );
      break;

    // ---------- Touch glass ----------
    case 'glass-clean':
      content = (
        <PhoneFront ids={ids} screen="off">
          <path d="M46 14 L104 14 L46 120 Z" fill="#ffffff" opacity=".06" />
        </PhoneFront>
      );
      break;
    case 'glass-minor-scratches':
      content = (
        <>
          <PhoneFront ids={ids} screen="off">
            <Scratches />
          </PhoneFront>
          <Badge bx={137} by={30} tx={92} ty={44} />
        </>
      );
      break;
    case 'glass-heavy-scratches':
      content = (
        <>
          <PhoneFront ids={ids} screen="off">
            <Scratches heavy />
          </PhoneFront>
          <Badge bx={137} by={30} tx={96} ty={60} />
        </>
      );
      break;
    case 'glass-cracked':
      content = (
        <>
          <PhoneFront ids={ids} screen="off">
            <Cracks />
          </PhoneFront>
          <Badge bx={138} by={32} tx={92} ty={72} />
        </>
      );
      break;

    // ---------- Back panel ----------
    case 'back-clean':
      content = <PhoneBack ids={ids} />;
      break;
    case 'back-minor-scratches':
      content = (
        <>
          <PhoneBack ids={ids}>
            <g transform="translate(0 14)">
              <Scratches />
            </g>
          </PhoneBack>
          <Badge bx={138} by={40} tx={100} ty={92} />
        </>
      );
      break;
    case 'back-heavy-scratches':
      content = (
        <>
          <PhoneBack ids={ids}>
            <g transform="translate(0 14)">
              <Scratches heavy />
            </g>
          </PhoneBack>
          <Badge bx={138} by={40} tx={100} ty={92} />
        </>
      );
      break;
    case 'back-broken':
      content = (
        <>
          <PhoneBack ids={ids}>
            <Cracks cx={92} cy={92} />
          </PhoneBack>
          <Badge bx={138} by={44} tx={92} ty={92} />
        </>
      );
      break;

    // ---------- Frame / side panel ----------
    case 'frame-clean':
      content = <PhoneFront ids={ids} screen="off" />;
      break;
    case 'frame-minor':
      content = (
        <>
          <PhoneFront ids={ids} screen="off" />
          <g stroke="#fbcfe8" strokeWidth="1.6" strokeLinecap="round">
            <path d="M116 72 l2.4 8" />
            <path d="M116 84 l2.4 5" />
            <path d="M43.5 92 l-1.8 7" />
          </g>
          <circle cx="117.6" cy="96" r="2.2" fill="#fbcfe8" />
          <Badge bx={141} by={100} tx={118} ty={80} />
        </>
      );
      break;
    case 'frame-heavy-dent':
      content = (
        <>
          <PhoneFront ids={ids} screen="off" />
          <path d="M118.5 66 q-7 7 0 15" fill="#f3e8f5" stroke="#2a0f2e" strokeWidth="1.2" />
          <path d="M41.5 82 q6 5.5 0 12" fill="#f3e8f5" stroke="#2a0f2e" strokeWidth="1.2" />
          <g stroke="#fbcfe8" strokeWidth="1.6" strokeLinecap="round">
            <path d="M116 92 l2.4 9" />
            <path d="M116 104 l2.2 5" />
            <path d="M44 104 l-2 7" />
          </g>
          <Badge bx={140} by={44} tx={116} ty={75} />
        </>
      );
      break;
    case 'frame-bent':
      content = (
        <>
          <g transform="rotate(-4 80 80)">
            <path
              d="M58 10 H102 Q118 10 118 26 Q124 86 118 150 Q118 160 102 160 H58 Q42 160 42 150 Q48 86 42 26 Q42 10 58 10 Z"
              fill={`url(#${ids.body})`}
            />
            <path
              d="M60 13 H100 Q115 13 115.5 27 Q121 86 115.5 148 Q115 157 100 157 H60 Q45 157 44.5 148 Q50 86 44.5 27 Q45 13 60 13 Z"
              fill="#16151c"
            />
            <rect x="67" y="18.5" width="26" height="7.5" rx="3.75" fill="#050507" />
          </g>
          <Badge bx={142} by={52} tx={121} ty={86} />
        </>
      );
      break;

    // ---------- Functional ----------
    case 'battery':
      content = (
        <>
          <PhoneFront ids={ids} screen="gray">
            <Glyph kind="battery" />
          </PhoneFront>
          <Badge bx={136} by={58} tx={86} ty={90} />
        </>
      );
      break;
    case 'front-camera':
      content = (
        <>
          <PhoneFront ids={ids} />
          <Badge bx={124} by={66} tx={88.6} ty={22.2} />
        </>
      );
      break;
    case 'back-camera':
      content = (
        <>
          <PhoneBack ids={ids} />
          <Badge bx={108} by={86} tx={59} ty={27} />
        </>
      );
      break;
    case 'camera-glass':
      content = (
        <>
          <PhoneBack ids={ids} crackedLens />
          <Badge bx={108} by={86} tx={59} ty={27} />
        </>
      );
      break;
    case 'network':
      content = (
        <>
          <PhoneFront ids={ids} screen="gray">
            <Glyph kind="signal" />
          </PhoneFront>
          <Badge bx={137} by={58} tx={100} ty={84} />
        </>
      );
      break;
    case 'wifi':
      content = (
        <>
          <PhoneFront ids={ids} screen="gray">
            <Glyph kind="wifi" />
          </PhoneFront>
          <Badge bx={137} by={58} tx={96} ty={80} />
        </>
      );
      break;
    case 'charging-port':
      content = (
        <>
          <PhoneBottom ids={ids} />
          <Badge bx={80} by={22} tx={80} ty={56} />
        </>
      );
      break;
    case 'microphone':
      content = (
        <>
          <PhoneBottom ids={ids} />
          <Badge bx={42} by={22} tx={42} ty={56} />
        </>
      );
      break;
    case 'speaker':
      content = (
        <>
          <PhoneFront ids={ids} />
          <rect x="72" y="12.2" width="16" height="1.4" rx=".7" fill="#2a2633" />
          <Badge bx={128} by={60} tx={80} ty={13} />
        </>
      );
      break;
    case 'proximity':
      content = (
        <>
          <PhoneFront ids={ids} />
          <Badge bx={128} by={64} tx={72} ty={22.2} />
        </>
      );
      break;
    case 'biometrics':
      content = (
        <>
          <PhoneFront ids={ids} screen="gray">
            <Glyph kind="face" />
          </PhoneFront>
          <Badge bx={137} by={56} tx={94} ty={78} />
        </>
      );
      break;
    case 'vibration':
      content = (
        <>
          <PhoneFront ids={ids} screen="gray">
            <Glyph kind="vibrate" />
          </PhoneFront>
          <Badge bx={137} by={56} tx={97} ty={80} />
        </>
      );
      break;
    case 'power-button':
      content = (
        <>
          <PhoneFront ids={ids} />
          <Badge bx={142} by={84} tx={120} ty={52} />
        </>
      );
      break;
    case 'volume-button':
      content = (
        <>
          <PhoneFront ids={ids} />
          <Badge bx={18} by={84} tx={40} ty={57} />
        </>
      );
      break;

    // ---------- Accessories ----------
    case 'charger':
      content = <Charger />;
      break;
    case 'box':
      content = <Box ids={ids} />;
      break;
    case 'bill':
    case 'warranty':
      content = <Bill />;
      break;

    // ---------- Overall ----------
    case 'phone-on':
      content = <PhoneFront ids={ids} />;
      break;
    case 'phone-off':
      content = (
        <>
          <PhoneFront ids={ids} screen="off" />
          <Badge bx={136} by={60} tx={110} ty={86} />
        </>
      );
      break;
    case 'display-original':
      content = (
        <PhoneFront ids={ids}>
          <circle cx="80" cy="84" r="13" fill="#ffffff" opacity=".9" />
          <path d="M74 84 l4 4 8 -9" stroke="#16a34a" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </PhoneFront>
      );
      break;
    default:
      content = <PhoneFront ids={ids} />;
  }

  return (
    <svg viewBox="0 0 160 112" className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <Defs ids={ids} />
      {content}
    </svg>
  );
};
