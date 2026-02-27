<template>
  <div class="sign-in-view">
    <div class="sign-in-container">
      <el-card class="sign-in-card">
        <div class="sign-in-header">
          <h1 class="text-center mb-2">Welcome Back</h1>
          <p class="text-center text-muted">Sign in to your account to continue</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="sign-in-form"
          @submit.prevent="handleSignIn"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="Email"
              size="large"
            >
              <template #prefix>
                <fa-icon :icon="faUser" class="form-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="Password"
              size="large"
              show-password
            >
              <template #prefix>
                <fa-icon :icon="faLock" class="form-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <div class="d-flex justify-content-between align-items-center w-100 mb-3">
              <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
              <el-link type="primary" :underline="false">Forgot password?</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="w-100"
              :loading="loading"
              @click="handleSignIn"
            >
              Sign In
            </el-button>
          </el-form-item>
        </el-form>

        <div class="sign-in-footer text-center">
          <p class="text-muted">
            Don't have an account?
            <el-link type="primary" :underline="false">Sign up</el-link>
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

import { useErrorDialog } from '@/composables/useErrorDialog';
import api from '@/services/api';

interface ILoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default defineComponent({
  name: 'SignInView',
  setup() {
    const router = useRouter();
    const loginFormRef = ref<FormInstance>();
    const loading = ref(false);
    const { showError } = useErrorDialog();

    const loginForm = reactive<ILoginForm>({
      email: '',
      password: '',
      remember: false
    });

    const loginRules: FormRules = {
      email: [
        { required: true, message: 'Please input email', trigger: 'blur' },
        { type: 'email', message: 'Please input valid email', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Please input password', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
      ]
    };

    const handleSignIn = async () => {
      if (!loginFormRef.value) return;
      await loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          try {
            const res = await api.post('/auth/login', {
              email: loginForm.email,
              password: loginForm.password
            });
            const { access_token, user } = res.data;
            localStorage.setItem('token', access_token);
            // Optionally save user info
            localStorage.setItem('user', JSON.stringify(user));
            ElMessage.success('Sign in successful!');
            router.push('/');
          } catch (err: any) {
            loading.value = false;
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
          } finally {
            loading.value = false;
          }
        } else {
          ElMessage.error('Please fill in all required fields');
        }
      });
    };

    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleSignIn,
      faUser,
      faLock
    };
  }
});
</script>

<style lang="scss" scoped>
.sign-in-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.sign-in-container {
  width: 100%;
  max-width: 450px;
}

.sign-in-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: none;
  
  :deep(.el-card__body) {
    padding: 40px;
  }
}

.sign-in-header {
  margin-bottom: 32px;
  
  h1 {
    color: #303133;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.sign-in-form {
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.el-input__wrapper) {
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  :deep(.el-button) {
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
  }
}

.sign-in-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.text-muted {
  color: #909399;
}

.w-100 {
  width: 100%;
}
</style>
