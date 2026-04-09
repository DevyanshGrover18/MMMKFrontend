import axios from 'axios';

const getStoredUserToken = () => {
  try {
    const storedToken = localStorage.getItem('userToken');
    if (!storedToken) return null;

    const parsedToken = JSON.parse(storedToken);
    return parsedToken?.token || null;
  } catch {
    return null;
  }
};

export const createUserApiClient = (basePath, timeout = 10000) => {
  const client = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}${basePath}`,
    timeout,
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const token = getStoredUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );

  return client;
};
