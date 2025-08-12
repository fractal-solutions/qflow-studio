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
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06b6d4',
      primaryHover: '#0891b2',
      secondary: '#22d3ee',
      accent: '#67e8f9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#083344',
      surface: '#0e7490',
      surfaceHover: '#155e75',
      border: '#06b6d4',
      text: '#e0f2f7',
      textSecondary: '#a7d9ed',
      textMuted: '#67e8f9',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  autumn: {
    name: 'Autumn',
    colors: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      secondary: '#f97316',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#4a2c2a',
      surface: '#7c2d12',
      surfaceHover: '#9a3412',
      border: '#ea580c',
      text: '#fef3c7',
      textSecondary: '#fed7aa',
      textMuted: '#fdba74',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  retro: {
    name: 'Retro',
    colors: {
      primary: '#6d28d9',
      primaryHover: '#5b21b6',
      secondary: '#a78bfa',
      accent: '#fde047',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#1f2937',
      surface: '#374151',
      surfaceHover: '#4b5563',
      border: '#6d28d9',
      text: '#e5e7eb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  zen: {
    name: 'Zen',
    colors: {
      primary: '#4ade80',
      primaryHover: '#22c55e',
      secondary: '#86efac',
      accent: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f0fdf4',
      surface: '#dcfce7',
      surfaceHover: '#a7f3d0',
      border: '#4ade80',
      text: '#166534',
      textSecondary: '#34d399',
      textMuted: '#6ee7b7',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  focus: {
    name: 'Focus',
    colors: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      secondary: '#38bdf8',
      accent: '#7dd3fc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#0ea5e9',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  executive: {
    name: 'Executive',
    colors: {
      primary: '#1f2937',
      primaryHover: '#111827',
      secondary: '#374151',
      accent: '#9ca3af',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f9fafb',
      surface: '#e5e7eb',
      surfaceHover: '#d1d5db',
      border: '#1f2937',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  modernOffice: {
    name: 'Modern Office',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#60a5fa',
      accent: '#a7f3d0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f8fafc',
      surface: '#f1f5f9',
      surfaceHover: '#e2e8f0',
      border: '#cbd5e1',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  financial: {
    name: 'Financial',
    colors: {
      primary: '#065f46',
      primaryHover: '#047857',
      secondary: '#10b981',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f0fdf4',
      surface: '#dcfce7',
      surfaceHover: '#a7f3d0',
      border: '#065f46',
      text: '#064e3b',
      textSecondary: '#10b981',
      textMuted: '#34d399',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  techStartup: {
    name: 'Tech Startup',
    colors: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      secondary: '#8b5cf6',
      accent: '#f43f5e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#6366f1',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  consulting: {
    name: 'Consulting',
    colors: {
      primary: '#475569',
      primaryHover: '#334155',
      secondary: '#64748b',
      accent: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f1f5f9',
      surface: '#e2e8f0',
      surfaceHover: '#cbd5e1',
      border: '#475569',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  cosmic: {
    name: 'Cosmic',
    colors: {
      primary: '#a78bfa',
      primaryHover: '#8b5cf6',
      secondary: '#c084fc',
      accent: '#e879f9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#020617',
      surface: '#1a0033',
      surfaceHover: '#2d0052',
      border: '#a78bfa',
      text: '#f3e8ff',
      textSecondary: '#d8b4fe',
      textMuted: '#c084fc',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  dreamscape: {
    name: 'Dreamscape',
    colors: {
      primary: '#fbcfe8',
      primaryHover: '#f472b6',
      secondary: '#f0abfc',
      accent: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#fdf2f8',
      surface: '#fce7f3',
      surfaceHover: '#fbcfe8',
      border: '#fbcfe8',
      text: '#be185d',
      textSecondary: '#db2777',
      textMuted: '#ec4899',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  matrix: {
    name: 'Matrix',
    colors: {
      primary: '#0f0',
      primaryHover: '#0c0',
      secondary: '#0a0',
      accent: '#050',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#000',
      surface: '#0a0a0a',
      surfaceHover: '#1a1a1a',
      border: '#0f0',
      text: '#0f0',
      textSecondary: '#0a0',
      textMuted: '#050',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      primary: '#0ff',
      primaryHover: '#0cc',
      secondary: '#f0f',
      accent: '#ff0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#1a0033',
      surface: '#330066',
      surfaceHover: '#4d0099',
      border: '#0ff',
      text: '#fff',
      textSecondary: '#ccc',
      textMuted: '#999',
      tertiary: '#4a5568',
      tertiaryHover: '#2d3748',
    }
  },
  gradient: {
    name: 'Gradient',
    colors: {
      primary: '#6a11cb',
      primaryHover: '#4a0a9a',
      secondary: '#2575fc',
      accent: '#00c6ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#1a2a6c',
      surface: '#3a5a9c',
      surfaceHover: '#5a7acb',
      border: '#6a11cb',
      text: '#fff',
      textSecondary: '#eee',
      textMuted: '#ccc',
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