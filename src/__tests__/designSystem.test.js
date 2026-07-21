import { describe, it, expect } from 'vitest';
import { colors, typography, borderRadius, shadows, zIndex } from '../styles/designTokens';

describe('Sprint 4 Design System & Token Tests', () => {
  describe('Color Tokens Palette', () => {
    it('should define required light mode colors', () => {
      expect(colors.light.primary).toBe('#0056b3');
      expect(colors.light.background).toBe('#f8fafc');
      expect(colors.light.surface).toBe('#ffffff');
      expect(colors.light.danger).toBe('#ef4444');
    });

    it('should define required dark mode colors', () => {
      expect(colors.dark.primary).toBe('#3b82f6');
      expect(colors.dark.background).toBe('#0f172a');
      expect(colors.dark.surface).toBe('#1e293b');
    });
  });

  describe('Typography & Layout Tokens', () => {
    it('should define typography scale', () => {
      expect(typography.fontSize.xs).toBe('0.75rem');
      expect(typography.fontSize.sm).toBe('0.875rem');
      expect(typography.fontSize.base).toBe('1rem');
      expect(typography.fontWeight.bold).toBe(700);
    });

    it('should define border radii and shadows', () => {
      expect(borderRadius.sm).toBe('4px');
      expect(borderRadius.md).toBe('8px');
      expect(borderRadius.full).toBe('9999px');
      expect(shadows.md).toBeDefined();
    });

    it('should define z-index layers for modal and toast overlays', () => {
      expect(zIndex.modal).toBeGreaterThan(zIndex.modalBackdrop);
      expect(zIndex.toast).toBeGreaterThan(zIndex.modal);
    });
  });
});
