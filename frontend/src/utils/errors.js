import axios from 'axios';

function extractServerMessage(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.length < 200 ? data : '';
  if (typeof data.message === 'string' && data.message) return data.message;
  if (typeof data.error === 'string' && data.error) return data.error;

  // Some backends return a list of validation errors.
  const list = data.errors || data.details;
  if (Array.isArray(list)) {
    return list
      .map((item) => (typeof item === 'string' ? item : item?.message))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

export function getErrorStatus(error) {
  return axios.isAxiosError(error) ? error.response?.status ?? null : null;
}

// True when the backend says the Student ID is already registered.
export function isDuplicateStudentError(error) {
  const status = getErrorStatus(error);
  if (status === 409) return true;
  if (status === 400 || status === 422) {
    const message = extractServerMessage(error.response?.data);
    return /already|exist|duplicate|taken/i.test(message);
  }
  return false;
}

// Turns any error into a friendly message that is safe to show to the user.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (axios.isCancel(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
    if (!error.response) {
      return 'Cannot reach the server. Make sure the backend is running on http://localhost:5000 and that it allows requests from this site (CORS).';
    }

    const { status, data } = error.response;
    const serverMessage = extractServerMessage(data);

    if (status === 409) return serverMessage || 'This Student ID is already registered.';
    if (status === 401) return serverMessage || 'Invalid Student ID or password.';
    if (status === 403) return serverMessage || 'You do not have permission to do that.';
    if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (status >= 500) return 'The server ran into a problem. Please try again in a few minutes.';
    return serverMessage || fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}