import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from './constants';

export function normalizeStatus(status) {
  if (!status) return 'SUBMITTED';
  const upper = String(status).toUpperCase().replace(/\s+/g, '_');
  if (upper === 'REJECTED') return 'CLOSED';
  return upper;
}

// Counts complaints per status. Works on any list of complaint objects with real or legacy statuses.
export function summarizeComplaints(complaints = []) {
  const byStatus = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    AWAITING_INFORMATION: 0,
    RESOLVED: 0,
    REOPENED: 0,
    CLOSED: 0,
    // Backwards-compatible title-cased keys for older components
    Submitted: 0,
    'Under Review': 0,
    Assigned: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0,
    Rejected: 0,
  };

  complaints.forEach((complaint) => {
    const norm = normalizeStatus(complaint?.status);
    if (norm in byStatus) byStatus[norm] += 1;
    if (norm === 'SUBMITTED') byStatus['Submitted'] += 1;
    if (norm === 'UNDER_REVIEW') byStatus['Under Review'] += 1;
    if (norm === 'ASSIGNED') byStatus['Assigned'] += 1;
    if (norm === 'IN_PROGRESS') byStatus['In Progress'] += 1;
    if (norm === 'RESOLVED') byStatus['Resolved'] += 1;
    if (norm === 'CLOSED') {
      byStatus['Closed'] += 1;
      byStatus['Rejected'] += 1;
    }
  });

  const resolved = byStatus.RESOLVED;
  const closed = byStatus.CLOSED;

  return {
    total: complaints.length,
    byStatus,
    open: Math.max(0, complaints.length - (resolved + closed)),
  };
}

// Returns [{ category, count }] for categories that have at least one complaint.
export function countByCategory(complaints = []) {
  return COMPLAINT_CATEGORIES.map((category) => ({
    category,
    count: complaints.filter((complaint) => complaint.category === category).length,
  })).filter((item) => item.count > 0);
}
