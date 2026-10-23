import apiClient from './apiClient';

export async function registerStudent(values) {
  const payload = {
    studentId: String(values.studentId || '').trim(),
    name: String(values.name || '').trim(),
    password: values.password,
    course: String(values.course || '').trim(),
    semester: Number(values.semester),
    section: String(values.section || '').trim(),
  };

  const response = await apiClient.post('/auth/register', payload);
  return response.data;
}

export async function loginStudent(credentials) {
  const payload = {
    studentId: String(credentials.studentId || '').trim(),
    password: credentials.password,
  };

  const response = await apiClient.post('/auth/login', payload);
  return response.data;
}
