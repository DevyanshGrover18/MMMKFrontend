import { createUserApiClient } from './client';

const order = createUserApiClient('/api/v1/user/order', 30000);

export const createManualOrder = async (data) => {
  const response = await order.post('/create', data);
  return response.data;
};

export const getOrders = async (options) => {
  const response = await order.get('/get-user-orders', { params: options });
  return response.data;
};

export const requestReturnExchange = async (orderId, data) => {
  const response = await order.post(`/request-return-exchange/${orderId}`, data);
  return response.data;
};
