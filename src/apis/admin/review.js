import axios from 'axios';

// Create Axios instance
const review = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/review`,
  timeout: 10000,
  withCredentials: true,
});

review.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const getAllReview = async (options) => {
  const response = await review.get('/get-all', { params: options });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await review.delete(`/delete-review/${id}`);
  return response.data;
};
