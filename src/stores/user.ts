import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

interface IUser {
  name: string;
  email: string;
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);
  const loading = ref(false);

  async function fetchMe() {
    loading.value = true;
    try {
      const res = await api.get('/auth/me');
      user.value = res.data;
    } catch (err) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  function clearUser() {
    user.value = null;
  }

  return {
    user,
    loading,
    fetchMe,
    clearUser
  };
});
