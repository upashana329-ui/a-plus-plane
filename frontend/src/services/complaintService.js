import { complaintsApi } from './api';

// Fetches the authenticated student's grievances from the database
export async function listMyComplaints() {
  const data = await complaintsApi.listMy();
  return Array.isArray(data) ? data : data.items || [];
}

// Submits a new grievance to the database and returns the created complaint with ticketId
export async function createComplaint(_studentId, values) {
  const payload = {
    title: values.title,
    category: values.category,
    description: values.description,
    priority: values.priority || 'Medium',
  };
  const data = await complaintsApi.create(payload);
  return data.complaint || data;
}

// Retrieves details for a specific grievance by ID or ticket ID
export async function getMyComplaint(_studentId, id) {
  const data = await complaintsApi.getById(id);
  return data.complaint || data;
}

// Reopens an eligible resolved complaint
export async function reopenComplaint(id) {
  const data = await complaintsApi.reopen(id);
  return data.complaint || data;
}

export default {
  listMyComplaints,
  createComplaint,
  getMyComplaint,
  reopenComplaint,
};