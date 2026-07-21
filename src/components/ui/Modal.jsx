import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/useTheme';
import { borderRadius, shadows, zIndex } from '../../styles/designTokens';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const { themeColors } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.modalBackdrop,
    padding: '20px',
  };

  const modalStyle = {
    background: themeColors.surface,
    color: themeColors.textPrimary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    width: '100%',
    maxWidth: '550px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: zIndex.modal,
    border: `1px solid ${themeColors.border}`,
  };

  const headerStyle = {
    padding: '16px 24px',
    borderBottom: `1px solid ${themeColors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const bodyStyle = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle = {
    padding: '16px 24px',
    borderTop: `1px solid ${themeColors.borderLight}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose} role="dialog" aria-modal="true">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          <Button variant="outline" size="sm" onClick={onClose} ariaLabel="Close Modal">
            ✕
          </Button>
        </div>
        <div style={bodyStyle}>{children}</div>
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
