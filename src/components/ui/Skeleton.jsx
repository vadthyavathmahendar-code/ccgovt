import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius } from '../../styles/designTokens';

const Skeleton = ({ width = '100%', height = '20px', radius = 'md', style }) => {
  const { themeColors } = useTheme();

  const getRadius = () => {
    switch (radius) {
      case 'full': return borderRadius.full;
      case 'lg': return borderRadius.lg;
      case 'sm': return borderRadius.sm;
      case 'md': default: return borderRadius.md;
    }
  };

  const skeletonStyle = {
    width,
    height,
    borderRadius: getRadius(),
    background: `linear-gradient(90deg, ${themeColors.surfaceSecondary} 25%, ${themeColors.borderLight} 50%, ${themeColors.surfaceSecondary} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'skeletonPulse 1.5s infinite ease-in-out',
    ...style,
  };

  return <div style={skeletonStyle} aria-hidden="true" />;
};

export default Skeleton;
