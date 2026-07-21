import React, { useEffect, useState } from 'react';
import { colors } from '../styles/designTokens';
import { ThemeContext } from './ThemeContextInstance';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('civic_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('civic_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.style.backgroundColor = colors.dark.background;
      document.body.style.color = colors.dark.textPrimary;
    } else {
      document.body.style.backgroundColor = colors.light.background;
      document.body.style.color = colors.light.textPrimary;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const themeColors = colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
