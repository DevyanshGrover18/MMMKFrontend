import { createUserApiClient } from './client';

const review = createUserApiClient('/api/v1/user/review', 3000);

export const addReview = async (data) => {
  const response = await review.post('/add', data);
  return response.data;
};
