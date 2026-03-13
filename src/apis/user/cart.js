import axios from 'axios';

// Create Axios instance
const cart = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/cart`,
  timeout: 10000,
  withCredentials: true,
});

// Add request interceptor to include token
cart.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return config;
});

export const addCartItem = async (data) => {
  const response = await cart.post('/add-item', data);
  return response.data;
};

export const getCartItems = async () => {
  const response = await cart.get(`/get-cart-item`);
  return response.data;
};

export const setCartData = async (data) => {
  const response = await cart.post('/set-cart-items', data);
  return response.data;
};

export const removeCartItems = async (id, sku, quantity = 0) => {
  const response = await cart.get(
    `/remove-cart-item/${id}?sku=${sku}&quantity=${quantity}`
  );
  return response.data;
};
