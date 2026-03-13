import axios from 'axios';

// Create Axios instance
const review = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/review`,
  timeout: 3000,
  withCredentials: true,
});

review.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const addReview = async (data) => {
  const response = await review.post('/add', data);
  return response.data;
};
