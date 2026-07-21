import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography, transitions } from '../../styles/designTokens';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ariaLabel,
  ...props
}) => {
  const { themeColors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: themeColors.secondary,
          color: '#ffffff',
          border: 'none',
        };
      case 'danger':
        return {
          background: themeColors.danger,
          color: '#ffffff',
          border: 'none',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: themeColors.primary,
          border: `1.5px solid ${themeColors.primary}`,
        };
      case 'primary':
      default:
        return {
          background: themeColors.primary,
          color: '#ffffff',
          border: 'none',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: typography.fontSize.xs };
      case 'lg':
        return { padding: '14px 28px', fontSize: typography.fontSize.lg };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: typography.fontSize.sm };
    }
  };

  const buttonStyle = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.semibold,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: transitions.fast,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={buttonStyle}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span>⏳ Loading...</span> : children}
    </button>
  );
};

export default Button;
