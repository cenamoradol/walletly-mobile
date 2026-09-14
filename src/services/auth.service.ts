import api, { setAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  async login(email: string, passwordHash: string) {
    const response = await api.post('/auth/login', { email, password: passwordHash });
    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    setAuthToken(access_token);
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    setAuthToken(null);
  },

  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async loadToken() {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      return true;
    }
    return false;
  },

  async updateProfile(data: any) {
    const response = await api.patch('/users/profile', data);
    return response.data;
  }
};
