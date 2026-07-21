import React from 'react';
import { useTheme } from '../../context/useTheme';
import { typography, spacing } from '../../styles/designTokens';
import Button from './Button';

const EmptyState = ({
  icon = '📭',
  title = 'No Records Found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) => {
  const { themeColors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      background: themeColors.surface,
      borderRadius: '12px',
      border: `1px dashed ${themeColors.border}`,
      margin: '20px 0',
    }}>
      <span style={{ fontSize: '3rem', marginBottom: spacing.sm }}>{icon}</span>
      <h3 style={{ margin: '0 0 8px 0', fontSize: typography.fontSize.lg, color: themeColors.textPrimary, fontWeight: typography.fontWeight.bold }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 20px 0', fontSize: typography.fontSize.sm, color: themeColors.textSecondary, maxWidth: '400px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
