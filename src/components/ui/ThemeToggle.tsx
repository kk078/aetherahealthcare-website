'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'pill' | 'header';
  className?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener('aethera-theme-change', callback);
  return () => window.removeEventListener('aethera-theme-change', callback);
}

function getSnapshot(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot(): boolean {
  return false;
}

export default function ThemeToggle({ variant = 'compact', className = '' }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aethera-theme', 'clinical-dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aethera-theme', 'light');
    }
    window.dispatchEvent(new CustomEvent('aethera-theme-change'));
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shadow-xs no-print ${
          isDark
            ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-800'
            : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-white hover:text-[#003087]'
        } ${className}`}
        title={isDark ? 'Switch to Standard Light Mode' : 'Switch to Clinical Low-Glare Mode'}
        aria-label={isDark ? 'Switch to Standard Light Mode' : 'Switch to Clinical Low-Glare Mode'}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Clinical Dark</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Low-Glare</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors border no-print ${
        isDark
          ? 'text-amber-300 hover:text-amber-200 bg-slate-800/80 border-slate-700 hover:bg-slate-800'
          : 'text-slate-600 hover:text-[#003087] bg-slate-100/80 border-slate-200/80 hover:bg-white'
      } ${className}`}
      title={isDark ? 'Switch to Standard Light Mode' : 'Switch to Clinical Low-Glare Mode'}
      aria-label={isDark ? 'Switch to Standard Light Mode' : 'Switch to Clinical Low-Glare Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
