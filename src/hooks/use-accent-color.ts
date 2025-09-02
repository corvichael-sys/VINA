import { useEffect, useState } from 'react';

type AccentColor = 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'indigo' | 'violet';

const ACCENT_COLOR_KEY = 'accent-color';
const ACCENT_CLASS_PREFIX = 'theme-';

export const useAccentColor = () => {
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');

  useEffect(() => {
    const storedColor = localStorage.getItem(ACCENT_COLOR_KEY) as AccentColor | null;
    if (storedColor) {
      setAccentColorState(storedColor);
    }
  }, []);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem(ACCENT_COLOR_KEY, color);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove any existing accent color classes
    root.classList.forEach(className => {
      if (className.startsWith(ACCENT_CLASS_PREFIX)) {
        root.classList.remove(className);
      }
    });

    // Add the new class if it's not the default
    if (accentColor !== 'blue') {
      root.classList.add(`${ACCENT_CLASS_PREFIX}${accentColor}`);
    }
  }, [accentColor]);

  return { accentColor, setAccentColor };
};