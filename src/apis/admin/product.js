import axios from 'axios';

// Create Axios instance
const product = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/product`,
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
});

product.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createProduct = async (data) => {
  try {
    const response = await product.post('/create', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getAllProducts = async (options) => {
  try {
    const response = await product.get('/get-all', { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getSingleProducts = async (id) => {
  try {
    const response = await product.get(`/get-single/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const updateProduct = async (id, data) => {
  try {
    const response = await product.post(`/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await product.post(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
