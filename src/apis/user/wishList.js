import axios from 'axios';

// Create Axios instance
const cart = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/wish-list`,
  timeout: 10000,
  withCredentials: true,
});

export const addItemToWishList = async (data) => {
  console.log('Data', data);
  const response = await cart.post('/add', data);
  return response.data;
};

export const removeItemFromWishList = async (data) => {
  const response = await cart.post('/remove', data);
  return response.data;
};

export const getWishLists = async (userId) => {
  const response = await cart.get(`/${userId}`);
  return response?.data?.data?.products;
};
