import React from 'react';
import { borderRadius, typography } from '../../styles/designTokens';

const Alert = ({ children, type = 'info', title, onClose, style }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { background: '#dcfce7', color: '#15803d', border: '#86efac', icon: '✅' };
      case 'warning':
        return { background: '#fef3c7', color: '#b45309', border: '#fde047', icon: '⚠️' };
      case 'error':
        return { background: '#fee2e2', color: '#b91c1c', border: '#fca5a5', icon: '🛑' };
      case 'info':
      default:
        return { background: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', icon: 'ℹ️' };
    }
  };

  const typeStyle = getTypeStyles();

  const alertStyle = {
    background: typeStyle.background,
    color: typeStyle.color,
    border: `1px solid ${typeStyle.border}`,
    borderRadius: borderRadius.md,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: typography.fontSize.sm,
    lineHeight: '1.5',
    ...style,
  };

  return (
    <div style={alertStyle} role="alert">
      <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{typeStyle.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block', marginBottom: '2px', fontWeight: 700 }}>{title}</strong>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: typeStyle.color, cursor: 'pointer', fontSize: '1rem' }}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
