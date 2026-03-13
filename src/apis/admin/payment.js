import axios from 'axios';

// Create Axios instance
const payment = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/payment`,
  timeout: 10000,
  withCredentials: true,
});

payment.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const createPayment = async (data) => {
  const response = await payment.post('/create', data);
  return response.data;
};

export const getAllPayments = async (options) => {
  const response = await payment.get('/get-all', { params: options });
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await payment.get(`/delete/${id}`);
  return response.data;
};
