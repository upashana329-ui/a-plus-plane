import { complaintsApi, busApi } from './api';

export const DEMO_STAFF = [
  'Dr. Arvind Rawat',
  'Prof. Sunita Negi',
  'Er. Rajesh Kumar',
  'Student Welfare Desk',
  'IT Systems Team',
  'Hostel Warden Desk',
  'Transport Incharge',
];

// Lists all student complaints for administrators from the database
export async function listAllComplaints(params = {}) {
  const data = await complaintsApi.adminListAll(params);
  return Array.isArray(data) ? data : data.items || [];
}

// Retrieves admin dashboard statistics and analytics
export async function getAdminOverview() {
  const data = await complaintsApi.adminOverview();
  return data;
}

// Updates the official resolution status of a complaint
export async function updateComplaintStatus(id, status, resolutionNote = '') {
  const data = await complaintsApi.adminUpdateStatus(id, status, resolutionNote);
  return data.complaint || data;
}

// Assigns the complaint to a designated staff member or department
export async function assignComplaint(id, staffName) {
  const data = await complaintsApi.adminAssign(id, staffName);
  return data.complaint || data;
}

// Lists all bus transit grievances for administrators
export async function listBusComplaints(params = {}) {
  return busApi.adminGetComplaints(params);
}

// Updates the official resolution status of a bus transit complaint
export async function updateBusComplaintStatus(id, status, adminRemarks = '') {
  return busApi.adminUpdateStatus(id, status, adminRemarks);
}

export default {
  DEMO_STAFF,
  listAllComplaints,
  getAdminOverview,
  updateComplaintStatus,
  assignComplaint,
  listBusComplaints,
  updateBusComplaintStatus,
};