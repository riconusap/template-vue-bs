import { ref } from 'vue';

interface IErrorDialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
}

const errorDialogVisible = ref(false);
const errorDialogTitle = ref('Error');
const errorDialogMessage = ref('');
const errorDialogButtonText = ref('Try Again');

export function useErrorDialog() {
  const showError = (options: IErrorDialogOptions | string) => {
    if (typeof options === 'string') {
      errorDialogTitle.value = 'Error';
      errorDialogMessage.value = options;
      errorDialogButtonText.value = 'Try Again';
    } else {
      errorDialogTitle.value = options.title || 'Error';
      errorDialogMessage.value = options.message;
      errorDialogButtonText.value = options.buttonText || 'Try Again';
    }
    errorDialogVisible.value = true;
  };

  const hideError = () => {
    errorDialogVisible.value = false;
  };

  return {
    errorDialogVisible,
    errorDialogTitle,
    errorDialogMessage,
    errorDialogButtonText,
    showError,
    hideError
  };
}
