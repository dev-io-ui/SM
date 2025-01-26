import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async googleLogin(token: string) {
    const response = await api.post('/auth/google', { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return api.post('/auth/reset-password', { token, newPassword });
  }

  async verifyEmail(token: string) {
    return api.post('/auth/verify-email', { token });
  }
}

export default new AuthService();
