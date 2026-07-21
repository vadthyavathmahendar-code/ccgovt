import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography } from '../../styles/designTokens';

const Avatar = ({ name = 'User', src, size = 'md', style }) => {
  const { themeColors } = useTheme();

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return { dimension: '32px', font: typography.fontSize.xs };
      case 'lg': return { dimension: '56px', font: typography.fontSize.xl };
      case 'md': default: return { dimension: '42px', font: typography.fontSize.base };
    }
  };

  const { dimension, font } = getSize();

  const avatarStyle = {
    width: dimension,
    height: dimension,
    borderRadius: borderRadius.full,
    background: themeColors.primary,
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: typography.fontWeight.bold,
    fontSize: font,
    objectFit: 'cover',
    border: `2px solid ${themeColors.surface}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ...style,
  };

  if (src) {
    return <img src={src} alt={name} style={avatarStyle} />;
  }

  return <div style={avatarStyle}>{getInitials(name)}</div>;
};

export default Avatar;
