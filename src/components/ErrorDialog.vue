<template>
  <el-dialog
    v-model="errorDialogVisible"
    :title="errorDialogTitle"
    width="400px"
    center
    align-center
    :close-on-click-modal="false"
    class="error-dialog"
  >
    <div class="error-content text-center">
      <fa-icon :icon="faCircleXmark" class="error-icon" size="3x" />
      <h3 class="mt-3 mb-2">{{ errorDialogTitle }}</h3>
      <p class="text-muted mb-0">{{ errorDialogMessage }}</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="hideError">
        {{ errorDialogButtonText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ErrorDialog',
  setup() {
    const {
      errorDialogVisible,
      errorDialogTitle,
      errorDialogMessage,
      errorDialogButtonText,
      hideError
    } = useErrorDialog();

    return {
      errorDialogVisible,
      errorDialogTitle,
      errorDialogMessage,
      errorDialogButtonText,
      hideError,
      faCircleXmark
    };
  }
});
</script>

<style lang="scss" scoped>
.error-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    animation: bounce 0.5s ease;
  }
  
  :deep(.el-dialog__header) {
    padding: 24px 24px 0;
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 0 24px 24px;
    text-align: center;
    
    .el-button {
      min-width: 120px;
    }
  }
}

.error-content {
  .error-icon {
    color: #f56c6c;
    animation: shake 0.5s ease;
  }
  
  h3 {
    color: #303133;
    font-size: 20px;
    font-weight: 600;
    margin: 16px 0 8px;
  }
  
  p {
    color: #909399;
    font-size: 14px;
    line-height: 1.6;
  }
}

.text-muted {
  color: #909399;
}

.mt-3 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-0 {
  margin-bottom: 0;
}

.text-center {
  text-align: center;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-20px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}
</style>
