import { createUserApiClient } from './client';

const payment = createUserApiClient('/api/v1/user/payment', 30000);

export const createPaymentIntent = async (data) => {
  const response = await payment.post('/create-payment-intent', data);
  return response.data;
};

export const refreshPaymentStatus = async (orderId) => {
  const response = await payment.post(`/refresh-status/${orderId}`);
  return response.data;
};
