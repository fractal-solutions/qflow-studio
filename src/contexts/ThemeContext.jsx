import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#475569',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      border: '#e2e8f0',
      text: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  midnight: {
    name: 'Midnight',
    colors: {
      primary: '#06b6d4',
      primaryHover: '#0891b2',
      secondary: '#0ea5e9',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#020617',
      surface: '#0f172a',
      surfaceHover: '#1e293b',
      border: '#334155',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#10b981',
      accent: '#34d399',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#064e3b',
      surface: '#065f46',
      surfaceHover: '#047857',
      border: '#059669',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      textMuted: '#6ee7b7',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      secondary: '#fb923c',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#7c2d12',
      surface: '#9a3412',
      surfaceHover: '#c2410c',
      border: '#ea580c',
      text: '#fef7ff',
      textSecondary: '#fed7aa',
      textMuted: '#fdba74',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#c084fc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#581c87',
      surface: '#6b21a8',
      surfaceHover: '#7c2d92',
      border: '#8b5cf6',
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      textMuted: '#d8b4fe',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('qflow-theme');
    const savedMode = localStorage.getItem('qflow-dark-mode');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qflow-theme', currentTheme);
    localStorage.setItem('qflow-dark-mode', isDarkMode.toString());
    
    // Apply CSS custom properties
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Switch between dark/light variants
    if (currentTheme === 'light') {
      setCurrentTheme('dark');
    } else if (currentTheme === 'dark') {
      setCurrentTheme('light');
    }
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    setIsDarkMode(!['light'].includes(themeName));
  };

  const value = {
    currentTheme,
    isDarkMode,
    theme: themes[currentTheme],
    themes,
    toggleDarkMode,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};