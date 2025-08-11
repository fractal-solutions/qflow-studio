import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Moon, Sun } from 'lucide-react';

const ThemeSelector = () => {
  const { currentTheme, isDarkMode, themes, toggleDarkMode, changeTheme } = useTheme();

  return (
    <div className="space-y-4">
      {/* Dark/Light Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center space-x-3">
          {isDarkMode ? (
            <Moon className="w-5 h-5 text-[var(--color-textSecondary)]" />
          ) : (
            <Sun className="w-5 h-5 text-[var(--color-textSecondary)]" />
          )}
          <span className="text-sm font-medium text-[var(--color-text)]">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isDarkMode ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDarkMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-[var(--color-textSecondary)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Theme</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className={`p-3 rounded-lg border transition-all ${
                currentTheme === key
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surfaceHover)]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {theme.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;