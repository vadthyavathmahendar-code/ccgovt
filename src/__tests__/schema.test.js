import { describe, it, expect } from 'vitest';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
  USER_ROLES,
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
} from '../types/database';

describe('Sprint 3 Database Schema & Constants Tests', () => {
  describe('Database Categories & Constants', () => {
    it('should define required complaint categories', () => {
      expect(COMPLAINT_CATEGORIES.length).toBeGreaterThanOrEqual(5);
      const categoryIds = COMPLAINT_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain('Roads');
      expect(categoryIds).toContain('Water');
      expect(categoryIds).toContain('Sanitation');
      expect(categoryIds).toContain('Electrical');
    });

    it('should define complaint status state constants', () => {
      expect(COMPLAINT_STATUSES.PENDING).toBe('Pending');
      expect(COMPLAINT_STATUSES.IN_PROGRESS).toBe('In Progress');
      expect(COMPLAINT_STATUSES.RESOLVED).toBe('Resolved');
      expect(COMPLAINT_STATUSES.REJECTED).toBe('Rejected');
    });

    it('should define complaint priority levels', () => {
      expect(COMPLAINT_PRIORITIES.LOW).toBe('Low');
      expect(COMPLAINT_PRIORITIES.MEDIUM).toBe('Medium');
      expect(COMPLAINT_PRIORITIES.HIGH).toBe('High');
      expect(COMPLAINT_PRIORITIES.CRITICAL).toBe('Critical');
    });

    it('should match user roles with database RLS check constraints', () => {
      expect(USER_ROLES.CITIZEN).toBe('citizen');
      expect(USER_ROLES.EMPLOYEE).toBe('employee');
      expect(USER_ROLES.DEPT_ADMIN).toBe('dept_admin');
      expect(USER_ROLES.COMMISSIONER).toBe('commissioner');
      expect(USER_ROLES.SUPER_ADMIN).toBe('super_admin');
    });
  });

  describe('Badge Styling Mappers', () => {
    it('should return correct green styling for Resolved status', () => {
      const style = getStatusBadgeStyle('Resolved');
      expect(style.bg).toBe('#dcfce7');
      expect(style.color).toBe('#166534');
    });

    it('should return red warning styling for Critical priority', () => {
      const style = getPriorityBadgeStyle('Critical');
      expect(style.bg).toBe('#fee2e2');
      expect(style.color).toBe('#991b1b');
    });
  });
});
