import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = '',
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-2.5 transition-colors duration-200
        border-slate-200 bg-white text-ink hover:bg-ink-50
        dark:border-neutral-800 dark:bg-neutral-900 dark:text-amber-300 dark:hover:bg-neutral-800
        focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 ${className}`}
    >
      <span className="relative h-[18px] w-[18px]">
        <Sun
          className={`absolute inset-0 h-[18px] w-[18px] transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
          strokeWidth={2.2}
        />
        <Moon
          className={`absolute inset-0 h-[18px] w-[18px] transition-all duration-300 ${
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
          strokeWidth={2.2}
        />
      </span>
      {showLabel && (
        <span className="pr-1 text-xs font-semibold text-ink dark:text-neutral-200">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
};
