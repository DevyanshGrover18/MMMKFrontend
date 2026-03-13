import axios from 'axios';

// Create Axios instance
const coupon = axios.create({
  baseURL: `${import.meta.env?.VITE_BACKEND_URL}/api/v1/user/coupon`,
  timeout: 30000,
  withCredentials: true,
});

export const getValidTokens = async () => {
  const response = await coupon.get('/get-valid-token');
  return response.data;
};

export const applyCoupon = async (couponCode) => {
  const response = await coupon.post('/apply-coupon', { couponCode });
  return response.data;
};
