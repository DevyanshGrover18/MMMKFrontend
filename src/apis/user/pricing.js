import axios from 'axios';

// Create Axios instance
const pricing = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/pricing`,
  timeout: 10000,
  withCredentials: true,
});

pricing.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const getPricingForUser = async () => {
  const response = await pricing.get('/get');
  return response.data;
};
