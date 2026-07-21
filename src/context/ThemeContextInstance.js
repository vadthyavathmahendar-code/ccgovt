import { createContext } from 'react';
import { colors } from '../styles/designTokens';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  themeColors: colors.light,
});
