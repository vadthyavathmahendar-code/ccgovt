import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, shadows, spacing } from '../../styles/designTokens';

const Card = ({ children, title, subtitle, footer, style, ...props }) => {
  const { themeColors } = useTheme();

  const cardStyle = {
    background: themeColors.surface,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    border: `1px solid ${themeColors.borderLight}`,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    ...style,
  };

  const headerStyle = {
    borderBottom: `1px solid ${themeColors.borderLight}`,
    paddingBottom: spacing.sm,
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: themeColors.textPrimary,
  };

  const subtitleStyle = {
    margin: '4px 0 0 0',
    fontSize: '0.875rem',
    color: themeColors.textSecondary,
  };

  const footerStyle = {
    borderTop: `1px solid ${themeColors.borderLight}`,
    paddingTop: spacing.sm,
    marginTop: 'auto',
  };

  return (
    <div style={cardStyle} {...props}>
      {(title || subtitle) && (
        <div style={headerStyle}>
          {title && <h3 style={titleStyle}>{title}</h3>}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  );
};

export default Card;
