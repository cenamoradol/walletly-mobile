import axios from 'axios';

// IMPORTANT: Change this to your computer's IP address to test on a physical device
const BASE_URL = 'http://192.168.1.6:3000'; // Updated to current local IP

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
