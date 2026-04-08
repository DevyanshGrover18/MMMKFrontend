import axios from 'axios';

// Create Axios instance
const card = axios.create({
  baseURL: `${import.meta.env?.VITE_BACKEND_URL}/api/v1/user/gift-card`,
  timeout: 30000,
  withCredentials: true,
});

export const applyGiftCard = async (code, password) => {
  const response = await card.post('/add-gift-card', { code, password });
  return response.data;
};

export const getCreatedGiftCards = async (params) => {
  const response = await card.get('/created-gift-cards', { params });
  return response.data;
};

export const createGiftCard = async (data) => {
  const response = await card.post('/create-gift-card', data);
  return response.data;
};

export const shareGiftCard = async (giftCardId, data) => {
  const response = await card.post(`/share/${giftCardId}`, data);
  return response.data;
};
