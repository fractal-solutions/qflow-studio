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
        
        <select
            value={currentTheme}
            onChange={(e) => changeTheme(e.target.value)}
            className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          >
            {Object.entries(themes).map(([key, theme]) => (
              <option key={key} value={key}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
    </div>
  );
};

export default ThemeSelector;