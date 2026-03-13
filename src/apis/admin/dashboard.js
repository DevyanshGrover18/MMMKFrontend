import axios from 'axios';

const dash = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

dash.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const getDashboardData = async (filters) => {
  try {
    const response = await dash.get('/get', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
