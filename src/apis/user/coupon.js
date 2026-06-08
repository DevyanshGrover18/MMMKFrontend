import { createUserApiClient } from './client';

const coupon = createUserApiClient('/api/v1/user/coupon', 30000);

export const getValidTokens = async () => {
  const response = await coupon.get('/get-valid-token');
  return response.data;
};

export const applyCoupon = async (data) => {
  const response = await coupon.post('/apply-coupon', data);
  return response.data;
};
