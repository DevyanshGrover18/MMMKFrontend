import axios from 'axios';

// Create Axios instance
const giftCard = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/giftCard`,
  timeout: 2000,
  withCredentials: true,
});

giftCard.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// functions
export const createGiftcard = async (data) => {
  const response = await giftCard.post('/add', data);
  return response.data;
};

export const updateGiftCard = async (id, data) => {
  const response = await giftCard.post(`/update/${id}`, data);
  return response.data;
};

export const deleteGiftCard = async (id) => {
  const response = await giftCard.post(`/delete/${id}`);
  return response.data;
};

export const getAllGiftCards = async (options) => {
  const response = await giftCard.get(`/get-all`, { params: options });
  return response.data;
};
