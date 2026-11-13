import React, { useEffect, useRef, useState } from 'react';
import { BadgeIndianRupee } from 'lucide-react';
import './heroDeviceStage.css';

export type StageKind = 'phone' | 'laptop' | 'tablet' | 'tv';

/** Screen wallpaper per device (same colour families as the category cards). */
const WALLPAPER: Record<StageKind, string> = {
  phone:
    'radial-gradient(circle at 22% 18%, #fde68a 0, transparent 42%), radial-gradient(circle at 82% 88%, #8b5cf6 0, transparent 48%), linear-gradient(160deg, #f59e0b, #ec4899 55%, #7c3aed)',
  laptop:
    'radial-gradient(circle at 82% 14%, #bae6fd 0, transparent 42%), radial-gradient(circle at 12% 90%, #f0abfc 0, transparent 40%), linear-gradient(140deg, #7c3aed, #6366f1 45%, #0ea5e9)',
  tablet:
    'radial-gradient(circle at 18% 82%, #a7f3d0 0, transparent 42%), radial-gradient(circle at 85% 15%, #fde68a 0, transparent 38%), linear-gradient(140deg, #0ea5e9, #06b6d4 50%, #10b981)',
  tv: 'radial-gradient(circle at 76% 22%, #fbcfe8 0, transparent 40%), radial-gradient(circle at 15% 85%, #fde68a 0, transparent 36%), linear-gradient(140deg, #f43f5e, #ec4899 50%, #a855f7)',
};

/** Size and position of each device (matches the CSS) — used for the flying copies. */
const SHAPE: Record<StageKind, { w: number; h: number; r: number; top: number }> = {
  phone: { w: 150, h: 304, r: 32, top: -152 },
  laptop: { w: 330, h: 206, r: 12, top: -150 },
  tablet: { w: 292, h: 204, r: 22, top: -102 },
  tv: { w: 344, h: 200, r: 10, top: -112 },
};

/** Where the faint copies glide in from (px / deg) and their stagger (ms). Few and gentle on purpose. */
const GHOSTS = [
  { x: -230, y: -30, z: -160, rx: 0, ry: 32, rz: -5, d: 0 },
  { x: 230, y: 25, z: -160, rx: 0, ry: -32, rz: 5, d: 90 },
  { x: 0, y: -130, z: -240, rx: -18, ry: 0, rz: 0, d: 170 },
];

const Layers: React.FC<{ n: number; step: number }> = ({ n, step }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="hs-layer" style={{ transform: `translateZ(${-(i + 1) * step}px)` }} />
    ))}
  </>
);

const Screen: React.FC<{ kind: StageKind }> = ({ kind }) => (
  <div className="hs-screen" style={{ background: WALLPAPER[kind] }}>
    {kind === 'phone' ? (
      <div className="hs-card hs-card-col">
        <span className="hs-card-icon">
          <BadgeIndianRupee size={16} />
        </span>
        <span className="hs-card-title">Instant price</span>
        <span className="hs-card-sub">✓ Quote ready</span>
        <span className="hs-bars" aria-hidden="true">
          <span />
          <span />
        </span>
      </div>
    ) : (
      <div className="hs-card">
        <span className="hs-card-icon">
          <BadgeIndianRupee size={16} />
        </span>
        <span>
          <span className="hs-card-title block">Instant price</span>
          <span className="hs-card-sub block">✓ Quote ready</span>
        </span>
        <span className="hs-bars" aria-hidden="true">
          <span />
          <span />
        </span>
      </div>
    )}
  </div>
);

const Device: React.FC<{ kind: StageKind }> = ({ kind }) => {
  switch (kind) {
    case 'laptop':
      return (
        <div className="hs-obj hs-laptop">
          <div className="hs-base">
            <Layers n={5} step={2} />
            <div className="hs-face">
              <div className="hs-keys" />
              <div className="hs-trackpad" />
            </div>
          </div>
          {/* Lands closed, then the lid opens */}
          <div className="hs-lid hs-lid-open">
            <Layers n={3} step={1.5} />
            <div className="hs-face">
              <Screen kind="laptop" />
            </div>
          </div>
        </div>
      );
    case 'tablet':
      return (
        <div className="hs-obj hs-tablet">
          <Layers n={4} step={2} />
          <div className="hs-face">
            <Screen kind="tablet" />
          </div>
        </div>
      );
    case 'tv':
      return (
        <div className="hs-obj hs-tv">
          <div className="hs-tv-neck" />
          <div className="hs-tv-foot" />
          <Layers n={3} step={2} />
          <div className="hs-face">
            <Screen kind="tv" />
          </div>
        </div>
      );
    default:
      return (
        <div className="hs-obj hs-phone">
          <Layers n={6} step={2} />
          <div className="hs-face">
            <span className="hs-island" />
            <Screen kind="phone" />
          </div>
        </div>
      );
  }
};

/** Flat copy of the device that flies in from the edge and merges into the real one. */
const Ghost: React.FC<{ kind: StageKind; g: (typeof GHOSTS)[number] }> = ({ kind, g }) => {
  const s = SHAPE[kind];
  const style = {
    '--x': `${g.x}px`,
    '--y': `${g.y}px`,
    '--z': `${g.z}px`,
    '--rx': `${g.rx}deg`,
    '--ry': `${g.ry}deg`,
    '--rz': `${g.rz}deg`,
    animationDelay: `${g.d}ms`,
  } as React.CSSProperties;
  return (
    <div className="hs-ghost" style={style}>
      <div className="hs-sil" style={{ width: s.w, height: s.h, left: -s.w / 2, top: s.top, borderRadius: s.r, background: WALLPAPER[kind] }} />
      {kind === 'laptop' && (
        <div
          className="hs-sil"
          style={{ width: s.w + 40, height: 14, left: -(s.w + 40) / 2, top: s.top + s.h + 6, borderRadius: '3px 3px 12px 12px', background: '#cfd3dc' }}
        />
      )}
    </div>
  );
};

interface Item {
  id: number;
  kind: StageKind;
  leaving: boolean;
}

/**
 * 3D hero art: copies of the current device fly in from all sides and merge into one device that
 * lands on a glowing stand and sways gently; the previous device swings away. Follows `index`
 * (the headline word). Pure CSS 3D, GPU-only animation, paused while off screen.
 */
export const HeroDeviceStage: React.FC<{ kinds: StageKind[]; index: number }> = ({ kinds, index }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const kind = kinds[index % kinds.length];
  const [items, setItems] = useState<Item[]>([{ id: 0, kind, leaving: false }]);

  // New word: the current device leaves (keeping its pose) and the new one arrives
  useEffect(() => {
    setItems((list) => {
      const live = list.find((i) => !i.leaving);
      if (live && live.kind === kind) return list;
      nextId.current += 1;
      return [...list.filter((i) => !i.leaving).map((i) => ({ ...i, leaving: true })), { id: nextId.current, kind, leaving: false }];
    });
    const t = setTimeout(() => setItems((list) => list.filter((i) => !i.leaving)), 700);
    return () => clearTimeout(t);
  }, [kind]);

  // Pause every animation while the stage is off screen or the tab is hidden
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let visible = true;
    const apply = () => {
      el.dataset.paused = String(!visible || document.hidden);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        apply();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    document.addEventListener('visibilitychange', apply);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', apply);
    };
  }, []);

  // Gentle tilt towards the mouse (desktop mice only, at most once per frame)
  useEffect(() => {
    const el = stageRef.current;
    const world = worldRef.current;
    if (!el || !world) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
    const area: HTMLElement = el.closest('section') || el;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const flush = () => {
      raf = 0;
      world.style.setProperty('--tx', tx.toFixed(3));
      world.style.setProperty('--ty', ty.toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
      ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
      schedule();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };
    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    return () => {
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const live = items.find((i) => !i.leaving);

  return (
    <div ref={stageRef} className="hs-stage" data-paused="false">
      <div className="hs-glow" />
      <div ref={worldRef} className="hs-world">
        <div className="hs-orbit hs-orbit-1">
          <span className="hs-orbit-dot" />
        </div>
        <div className="hs-orbit hs-orbit-2">
          <span className="hs-orbit-dot" />
          <span className="hs-orbit-dot hs-dot-b" />
        </div>
        <div className="hs-pedestal" />
        {live && <div key={`land-${live.id}`} className="hs-landing" />}
        <div className="hs-shadow" />

        <div className="hs-ghosts">
          {live && GHOSTS.map((g, i) => <Ghost key={`${live.id}-${i}`} kind={live.kind} g={g} />)}
        </div>
        <div className="hs-center">
          {items.map((item) => (
            <div key={item.id} className={item.leaving ? 'hs-exit' : 'hs-enter'}>
              <div className={`hs-float ${item.kind === 'laptop' || item.kind === 'tv' ? 'hs-float-soft' : ''}`}>
                <Device kind={item.kind} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
