import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { clearSession, getToken } from '../utils/storage';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler('Your session has expired. Please log in again.');
      } else {
        clearSession();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
