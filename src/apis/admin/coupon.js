import axios from 'axios';

// Create Axios instance
const coupon = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/coupon`,
  timeout: 10000,
  withCredentials: true,
});

coupon.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createCoupon = async (data) => {
  try {
    const response = await coupon.post('/create', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getAllCoupon = async (options) => {
  try {
    const response = await coupon.get('/get-all', { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await coupon.get(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
