import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography, spacing } from '../../styles/designTokens';

const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  ...props
}) => {
  const { themeColors } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    width: '100%',
  };

  const labelStyle = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textPrimary,
  };

  const selectStyle = {
    padding: '10px 14px',
    borderRadius: borderRadius.md,
    border: `1px solid ${error ? themeColors.danger : themeColors.border}`,
    background: themeColors.surface,
    color: themeColors.textPrimary,
    fontSize: typography.fontSize.base,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required && <span style={{ color: themeColors.danger }}>*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        style={selectStyle}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: typography.fontSize.xs, color: themeColors.danger }}>{error}</span>}
      {!error && helperText && <span style={{ fontSize: typography.fontSize.xs, color: themeColors.textSecondary }}>{helperText}</span>}
    </div>
  );
};

export default Select;
