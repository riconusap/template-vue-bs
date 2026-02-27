import { ref, computed } from 'vue';
import api from '@/services/api';
import { useErrorDialog } from './useErrorDialog';

interface IUser {
  name: string;
  email: string;
  [key: string]: any;
}

const token = ref<string | null>(localStorage.getItem('token'));
const user = ref<IUser | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
const loading = ref(false);

export function useAuth() {
  const { showError } = useErrorDialog();

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      const res = await api.post('/auth/login', { email, password });
      token.value = res.data.access_token;
      user.value = res.data.user;
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
      return true;
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 409) {
          showError({
            title: 'Login Conflict',
            message: err.response.data.message || 'User is already logged in on another device.',
            buttonText: 'Try Again'
          });
        } else if (err.response.status === 401) {
          showError({
            title: 'Login Failed',
            message: 'Invalid email or password.',
            buttonText: 'Try Again'
          });
        } else {
          showError({
            title: 'Login Error',
            message: err.response.data.message || 'An error occurred during login.',
            buttonText: 'Close'
          });
        }
      } else {
        showError('Network error. Please try again.');
      }
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async (allDevices = false) => {
    try {
      if (allDevices) {
        await api.post('/auth/logout-all-devices');
      } else {
        await api.post('/auth/logout');
      }
    } catch (err) {
      // ignore error
    }
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refresh = async () => {
    try {
      const res = await api.post('/auth/refresh');
      token.value = res.data.access_token;
      localStorage.setItem('token', token.value);
    } catch (err) {
      logout();
    }
  };

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refresh
  };
}
