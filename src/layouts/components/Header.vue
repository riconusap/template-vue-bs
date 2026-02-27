<template>
  <header class="main-header d-flex align-items-center justify-content-between px-4 py-2 bg-white">
    <div class="d-flex align-items-center gap-2 ms-auto">
      <el-dropdown trigger="click">
        <span class="d-flex align-items-center gap-2 cursor-pointer">
          <el-avatar :size="36" :src="userAvatar" shape="circle">
            <fa-icon :icon="faUser" />
          </el-avatar>
          <span class="fw-bold">{{ user?.name || 'User' }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <span class="text-muted small">{{ user?.email }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="goProfile">
              <fa-icon :icon="faUser" class="me-1" /> Profile
            </el-dropdown-item>
            <el-dropdown-item @click="handleLogout">
              <fa-icon :icon="faSignOut" class="me-1" style="color: #f56c6c" /> Sign Out
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuth } from '@/composables/useAuth';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
  name: 'Header',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { logout } = useAuth();

    onMounted(() => {
      if (!userStore.user) userStore.fetchMe();
    });

    const handleLogout = async () => {
      await logout();
      userStore.clearUser();
      router.push('/signin');
    };

    const goProfile = () => {
      router.push('/settings');
    };

    const userAvatar = computed(() => {
      // If user has avatar field, use it, else fallback to icon
      return userStore.user?.avatar || '';
    });

    const user = computed(() => userStore.user);

    return {
      user,
      userAvatar,
      handleLogout,
      goProfile,
      faUser,
      faSignOut: faSignOutAlt
    };
  }
});
</script>

<style lang="scss" scoped>
.main-header {
  min-height: 56px;
}
</style>
