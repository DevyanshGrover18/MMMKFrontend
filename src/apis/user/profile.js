import axios from 'axios';

// Create Axios instance
const profile = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile`,
  timeout: 10000,
  withCredentials: true,
});

profile.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// my account
export const updateMyAccount = async (data) => {
  const response = await profile.post('/my-accounts/update', data);
  return response.data;
};

export const getMyAccount = async () => {
  const response = await profile.get('/my-accounts/get');
  return response.data;
};
export const getUserCredits = async () => {
  const response = await profile.get('/my-credits/get');
  return response.data?.data;
};

// address book
export const updateAddressBook = async (data) => {
  const response = await profile.post('/address-book/update', data);
  return response.data;
};

export const getAddressBook = async () => {
  const response = await profile.get('/address-book/get');
  return response.data;
};

// payment methods

export const updatePaymentMethods = async (data) => {
  const response = await profile.post('/payment-methods/update', data);
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await profile.get('/payment-methods/get');
  return response.data;
};

export const deletePaymentCard = async (id) => {
  const response = await profile.get(`/payment-methods/delete/${id}`);
  return response.data;
};
