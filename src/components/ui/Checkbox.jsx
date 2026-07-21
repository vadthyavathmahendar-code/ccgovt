import React from 'react';
import { useTheme } from '../../context/useTheme';
import { typography } from '../../styles/designTokens';

const Checkbox = ({ label, id, checked, onChange, disabled = false, ...props }) => {
  const { themeColors } = useTheme();

  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ width: '18px', height: '18px', cursor: 'inherit', accentColor: themeColors.primary }}
        {...props}
      />
      {label && <span style={{ fontSize: typography.fontSize.sm, color: themeColors.textPrimary }}>{label}</span>}
    </label>
  );
};

export default Checkbox;
