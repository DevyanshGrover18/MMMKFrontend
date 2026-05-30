const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost
    ? 'http://localhost:3001'
    : 'https://node.projects.codenap.in/mmk');

export default API_URL;
