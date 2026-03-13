import axios from 'axios';

// Create Axios instance
const filter = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/filter`,
  timeout: 10000,
  withCredentials: true,
});

filter.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createFilter = async (data) => {
  const response = await filter.post('/create', data);
  return response.data;
};

export const getAllFilters = async (options) => {
  const response = await filter.get('/get-all', { params: options });
  return response.data;
};

export const updateFilter = async (id, data) => {
  const response = await filter.post(`/update/${id}`, data);
  return response.data;
};

export const deleteFilter = async (id) => {
  const response = await filter.get(`/delete/${id}`);
  return response.data;
};
