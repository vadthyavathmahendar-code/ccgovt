/**
 * Database Constants and Schema Types for Civics Connect Enterprise
 * Aligned with Supabase PostgreSQL migration tables.
 */

export const COMPLAINT_CATEGORIES = [
  { id: 'Roads', label: 'Roads & Potholes', icon: '🛣️', dept: 'Roads Department' },
  { id: 'Water', label: 'Water Leakage & Supply', icon: '🚰', dept: 'Water Department' },
  { id: 'Sanitation', label: 'Sanitation & Garbage', icon: '🗑️', dept: 'Sanitation Department' },
  { id: 'Electrical', label: 'Streetlights & Power', icon: '⚡', dept: 'Electrical Department' },
  { id: 'Traffic', label: 'Traffic & Signals', icon: '🚦', dept: 'Traffic Operations' },
];

export const COMPLAINT_STATUSES = {
  PENDING: 'Pending',
  TRIAGED: 'Triaged',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
};

export const COMPLAINT_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const USER_ROLES = {
  CITIZEN: 'citizen',
  EMPLOYEE: 'employee',
  DEPT_ADMIN: 'dept_admin',
  COMMISSIONER: 'commissioner',
  SUPER_ADMIN: 'super_admin',
};

/**
 * Format status badges with proper color coding
 */
export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case COMPLAINT_STATUSES.RESOLVED:
    case COMPLAINT_STATUSES.CLOSED:
      return { bg: '#dcfce7', color: '#166534', label: 'Resolved' };
    case COMPLAINT_STATUSES.IN_PROGRESS:
      return { bg: '#fef9c3', color: '#854d0e', label: 'In Progress' };
    case COMPLAINT_STATUSES.ASSIGNED:
    case COMPLAINT_STATUSES.TRIAGED:
      return { bg: '#e0f2fe', color: '#075985', label: 'Assigned' };
    case COMPLAINT_STATUSES.REJECTED:
      return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
    case COMPLAINT_STATUSES.PENDING:
    default:
      return { bg: '#fef3c7', color: '#92400e', label: 'Pending Review' };
  }
};

/**
 * Format priority badges with urgency indicators
 */
export const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case COMPLAINT_PRIORITIES.CRITICAL:
      return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    case COMPLAINT_PRIORITIES.HIGH:
      return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' };
    case COMPLAINT_PRIORITIES.LOW:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    case COMPLAINT_PRIORITIES.MEDIUM:
    default:
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
};
