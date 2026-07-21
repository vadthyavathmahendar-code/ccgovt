import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography, spacing } from '../../styles/designTokens';

const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
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

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: borderRadius.md,
    border: `1px solid ${error ? themeColors.danger : themeColors.border}`,
    background: themeColors.surface,
    color: themeColors.textPrimary,
    fontSize: typography.fontSize.base,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1,
  };

  const errorStyle = {
    fontSize: typography.fontSize.xs,
    color: themeColors.danger,
    marginTop: '2px',
  };

  const helperStyle = {
    fontSize: typography.fontSize.xs,
    color: themeColors.textSecondary,
    marginTop: '2px',
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required && <span style={{ color: themeColors.danger }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error && <span id={`${id}-error`} style={errorStyle}>{error}</span>}
      {!error && helperText && <span id={`${id}-helper`} style={helperStyle}>{helperText}</span>}
    </div>
  );
};

export default Input;
