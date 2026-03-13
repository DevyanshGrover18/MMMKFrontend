import axios from 'axios';

// Create Axios instance
const order = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/order`,
  timeout: 30000,
  withCredentials: true,
});

export const createManualOrder = async (data) => {
  const response = await order.post('/create', data);
  return response.data;
};

export const getOrders = async (options) => {
  const response = await order.get('/get-user-orders', { params: options });
  return response.data;
};
