import React from 'react';
import { useTheme } from '../../context/useTheme';
import { typography } from '../../styles/designTokens';

const Switch = ({ label, id, checked, onChange, disabled = false }) => {
  const { themeColors } = useTheme();

  const trackStyle = {
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    background: checked ? themeColors.primary : themeColors.border,
    position: 'relative',
    transition: 'background 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };

  const thumbStyle = {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#ffffff',
    position: 'absolute',
    top: '2px',
    left: checked ? '20px' : '2px',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  };

  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }}>
      <div style={trackStyle} onClick={() => !disabled && onChange(!checked)} role="switch" aria-checked={checked} tabIndex={0}>
        <div style={thumbStyle} />
      </div>
      {label && <span style={{ fontSize: typography.fontSize.sm, color: themeColors.textPrimary }}>{label}</span>}
    </label>
  );
};

export default Switch;
