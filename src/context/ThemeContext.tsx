import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * The site always starts in light mode. Dark mode is used only when the visitor has explicitly
 * picked it with the toggle (stored under THEME_CHOICE_KEY). The OS colour-scheme preference and
 * the old auto-saved `genie_theme` key are intentionally ignored.
 */
export const THEME_CHOICE_KEY = 'genie_theme_choice';

const readChoice = (): Theme => {
  try {
    return localStorage.getItem(THEME_CHOICE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const saveChoice = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_CHOICE_KEY, theme);
  } catch {
    // Storage unavailable (private mode); the choice simply won't persist.
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readChoice);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }, [theme]);

  const setTheme = (t: Theme) => {
    saveChoice(t);
    setThemeState(t);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
