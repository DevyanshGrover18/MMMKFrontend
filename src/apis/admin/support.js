import axios from 'axios';

// Create Axios instance
const support = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/support`,
  timeout: 10000,
  withCredentials: true,
});

support.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createSupport = async (data) => {
  try {
    const response = await support.post('/create', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getAllSupports = async (options) => {
  try {
    const response = await support.get('/get-all', { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const deleteSupport = async (id) => {
  try {
    const response = await support.get(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addReply = async (id, data) => {
  try {
    const response = await support.post(`/add-reply/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
