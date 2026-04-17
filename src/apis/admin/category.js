import axios from 'axios';

const cat = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/category`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

cat.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const addCategory = async (data) => {
  try {
    const response = await cat.post('/add', data);
    return response.data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const getAllCategories = async (filters) => {
  try {
    const response = await cat.get('/get-all', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const editCategory = async (id, data) => {
  try {
    const response = await cat.post(`/edit/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await cat.get(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Persists drag-and-drop order to the database.
 * @param {string[]} orderedIds - Array of category _id strings in new order
 */
export const reorderCategories = async (orderedIds) => {
  try {
    const response = await cat.post(
      '/reorder',
      { orderedIds },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error reordering categories:', error);
    throw error;
  }
};