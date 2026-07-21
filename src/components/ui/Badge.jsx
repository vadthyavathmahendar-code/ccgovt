import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography } from '../../styles/designTokens';

const Badge = ({ children, status = 'info', style, ...props }) => {
  const { themeColors } = useTheme();

  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return { background: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'warning':
        return { background: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'danger':
      case 'error':
        return { background: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'neutral':
        return { background: themeColors.surfaceSecondary, color: themeColors.textSecondary, border: themeColors.border };
      case 'info':
      default:
        return { background: '#e0f2fe', color: '#075985', border: '#bae6fd' };
    }
  };

  const badgeStyle = {
    ...getStatusStyle(),
    padding: '3px 10px',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    border: `1px solid ${getStatusStyle().border}`,
    ...style,
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};

export default Badge;
