import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface PageLoadingSkeletonProps {
  title?: string;
  subtitle?: string;
  type?: 'generic' | 'brands' | 'models' | 'store' | 'home' | 'details';
}

export const PageLoadingSkeleton: React.FC<PageLoadingSkeletonProps> = ({
  title = 'Loading Data...',
  subtitle = 'Connecting with Genie backend engine to retrieve latest verified catalogue & rates',
  type = 'generic',
}) => {
  return (
    <div className="w-full flex-1 min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 animate-fade-in max-w-6xl mx-auto">
      {/* Genie Mascot / Emblem Spinner */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-800 shadow-soft flex items-center justify-center p-2.5 relative z-10">
          <img
            src="/genie_emblem.png"
            alt="Genie"
            draggable={false}
            className="w-full h-full object-contain animate-pulse-subtle"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-amber-400 text-[#1a1033] flex items-center justify-center shadow-cta">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center max-w-md mx-auto space-y-1 mb-8">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>{title}</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
      </div>

      {/* Skeleton Placeholders by type */}
      {type === 'brands' && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100" />
              <div className="w-20 h-3.5 bg-slate-100 rounded-full" />
              <div className="w-14 h-2 bg-slate-50 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {type === 'models' && (
        <div className="w-full max-w-4xl space-y-4 animate-pulse">
          <div className="h-12 w-full bg-slate-100 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-20 h-24 rounded-xl bg-slate-100" />
                <div className="w-24 h-3.5 bg-slate-100 rounded-full" />
                <div className="w-16 h-3 bg-slate-50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'home' && (
        <div className="w-full space-y-8 animate-pulse">
          {/* Hero Banner Skeleton */}
          <div className="w-full h-64 sm:h-80 rounded-3xl bg-slate-900/10 border border-slate-200/60" />
          {/* Category Bar Skeleton */}
          <div className="flex gap-3 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-24 h-9 rounded-full bg-slate-100" />
            ))}
          </div>
          {/* Card Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-slate-100 shadow-xs" />
            ))}
          </div>
        </div>
      )}

      {type === 'store' && (
        <div className="w-full space-y-6 animate-pulse">
          <div className="w-full h-44 rounded-3xl bg-slate-900/10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3"
              >
                <div className="h-40 bg-slate-100 rounded-2xl" />
                <div className="w-3/4 h-4 bg-slate-100 rounded-full" />
                <div className="w-1/2 h-3 bg-slate-50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'generic' && (
        <div className="w-full max-w-md space-y-3 animate-pulse">
          <div className="h-3.5 bg-slate-200/80 rounded-full w-3/4 mx-auto" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2 mx-auto" />
        </div>
      )}
    </div>
  );
};

