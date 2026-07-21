import React from 'react';
import { useTheme } from '../../context/useTheme';
import { borderRadius, typography, spacing } from '../../styles/designTokens';

const Textarea = ({
  label,
  id,
  value,
  onChange,
  rows = 4,
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

  const textareaStyle = {
    padding: '10px 14px',
    borderRadius: borderRadius.md,
    border: `1px solid ${error ? themeColors.danger : themeColors.border}`,
    background: themeColors.surface,
    color: themeColors.textPrimary,
    fontSize: typography.fontSize.base,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: typography.fontFamily.sans,
    resize: 'vertical',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: themeColors.textPrimary }}>
          {label} {required && <span style={{ color: themeColors.danger }}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={textareaStyle}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span style={{ fontSize: typography.fontSize.xs, color: themeColors.danger }}>{error}</span>}
      {!error && helperText && <span style={{ fontSize: typography.fontSize.xs, color: themeColors.textSecondary }}>{helperText}</span>}
    </div>
  );
};

export default Textarea;
