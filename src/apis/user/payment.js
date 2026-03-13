import axios from 'axios';

// Create Axios instance
const payment = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/payment`,
  timeout: 30000,
  withCredentials: true,
});

export const createPaymentIntent = async (data) => {
  const response = await payment.post('/create-payment-intent', data);
  return response.data;
};
