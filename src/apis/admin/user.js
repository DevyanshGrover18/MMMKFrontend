import axios from 'axios';

// Create Axios instance
const user = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/user`,
  timeout: 10000,
  withCredentials: true,
});

user.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createUser = async (data) => {
  try {
    const response = await user.post('/create', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await user.post(`/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getSingleUser = async (id) => {
  try {
    const response = await user.get(`/get/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getAllUsers = async (options) => {
  try {
    const response = await user.get(`/get-all`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await user.get(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
