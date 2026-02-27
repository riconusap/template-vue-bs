<template>
  <div class="client-form-page">

    <div class="form-container">
      <el-card>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <h5 class="mb-3">Informasi Klien</h5>
          
          <el-form-item label="Nama Klien" prop="name">
            <el-input v-model="form.name" placeholder="Masukkan nama klien" />
          </el-form-item>

          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" placeholder="email@example.com" type="email" />
          </el-form-item>

          <el-form-item label="Telepon" prop="phone">
            <el-input v-model="form.phone" placeholder="0812-3456-7890" />
          </el-form-item>

          <el-form-item label="Alamat" prop="address">
            <el-input 
              v-model="form.address" 
              placeholder="Masukkan alamat"
              type="textarea"
              rows="3"
            />
          </el-form-item>

          <el-form-item label="Logo" prop="logo">
            <div class="logo-upload-container">
              <!-- Preview Section (always on top if exists) -->
              <div v-if="logoPreview" class="logo-preview-section">
                <div class="logo-preview-wrapper">
                  <img :src="logoPreview" alt="Logo Preview" />
                  <div class="logo-actions">
                    <el-button 
                      type="danger" 
                      size="small"
                      @click="handleRemoveLogo"
                    >
                      <el-icon class="me-1"><Close /></el-icon>
                      Hapus
                    </el-button>
                  </div>
                </div>
                <div class="logo-info">
                  <small class="text-muted">
                    {{ logoFileName }}
                  </small>
                </div>
              </div>

              <!-- Upload Section (always visible) -->
              <el-upload
                ref="uploadRef"
                class="logo-uploader"
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
                :before-upload="beforeUpload"
                :limit="1"
                accept="image/jpeg,image/png,image/jpg"
              >
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">
                  <p v-if="logoPreview">
                    Drop new logo here or <em>click to change</em>
                  </p>
                  <p v-else>
                    Drop logo here or <em>click to select</em>
                  </p>
                  <p class="upload-hint">JPG/PNG, max 500KB</p>
                </div>
              </el-upload>
            </div>
          </el-form-item>

          <el-divider />

          <h5 class="mb-3">Kontak Utama (PIC)</h5>

          <el-form-item label="Nama PIC" prop="pic_name">
            <el-input v-model="form.pic_name" placeholder="Masukkan nama PIC" />
          </el-form-item>

          <el-form-item label="Email PIC" prop="pic_email">
            <el-input v-model="form.pic_email" placeholder="pic@example.com" type="email" />
          </el-form-item>

          <el-form-item label="Telepon PIC" prop="pic_phone">
            <el-input v-model="form.pic_phone" placeholder="0812-3456-7890" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="sticky-header mt-4">
      <div class="header-content">
        <div class="header-actions">
          <el-button @click="handleCancel">
            <el-icon class="me-2"><Close /></el-icon>Batal
          </el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            <el-icon class="me-2"><Check /></el-icon>{{ isEditMode ? 'Simpan Perubahan' : 'Simpan' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { clientApi, IClient } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { Close, Check, Plus } from '@element-plus/icons-vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

interface IClientForm extends IClient {
  logo?: string | File;
  logo_url?: string;
}

export default defineComponent({
  name: 'ClientFormView',
  components: {
    Close,
    Check,
    Plus
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const formRef = ref<FormInstance>();
    const uploadRef = ref();
    const loading = ref(false);
    const { showError } = useErrorDialog();
    const previewUrl = ref<string>('');

    const clientId = computed(() => route.params.id as string);
    const isEditMode = computed(() => !!clientId.value);

    const form = ref<IClientForm>({
      name: '',
      email: '',
      phone: '',
      address: '',
      pic_name: '',
      pic_email: '',
      pic_phone: '',
      logo: '',
      logo_url: ''
    });

    const logoPreview = computed(() => {
      if (previewUrl.value) return previewUrl.value;
      if (form.value.logo_url) return form.value.logo_url;
      return '';
    });

    const logoFileName = computed(() => {
      if (form.value.logo && typeof form.value.logo === 'object' && 'name' in form.value.logo) {
        return form.value.logo.name;
      }
      return 'Logo saat ini';
    });

    const rules = {
      name: [{ required: true, message: 'Nama klien wajib diisi', trigger: 'blur' }],
      email: [
        { required: true, message: 'Email wajib diisi', trigger: 'blur' },
        { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
      ],
      phone: [{ required: true, message: 'Telepon wajib diisi', trigger: 'blur' }],
      pic_name: [{ required: true, message: 'Nama PIC wajib diisi', trigger: 'blur' }],
      pic_email: [
        { required: true, message: 'Email PIC wajib diisi', trigger: 'blur' },
        { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
      ],
      pic_phone: [{ required: true, message: 'Telepon PIC wajib diisi', trigger: 'blur' }]
    };

    const beforeUpload = (file: File) => {
      const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isLt500KB = file.size / 1024 < 500;

      if (!isImage) {
        ElMessage.error('Logo harus berformat JPG atau PNG!');
        return false;
      }
      if (!isLt500KB) {
        ElMessage.error('Ukuran logo tidak boleh lebih dari 500KB!');
        return false;
      }
      return true;
    };

    const handleFileChange = (file: any) => {
      const isValid = beforeUpload(file.raw);
      if (!isValid) {
        // Clear the upload list if validation fails
        if (uploadRef.value) {
          uploadRef.value.clearFiles();
        }
        return;
      }

      form.value.logo = file.raw;

      console.log('Selected file:', file.raw);
      
      // Create preview URL for newly selected file
      // If there's an existing preview (from logo_url), clear it first
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      
      // Clear logo_url when uploading new file
      form.value.logo_url = '';
      
      // Create new preview
      previewUrl.value = URL.createObjectURL(file.raw);
      
      // Clear the upload component file list after creating preview
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
    };

    const handleRemoveLogo = () => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
      }
      form.value.logo = '';
      form.value.logo_url = '';
      
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
    };

    const fetchClient = async () => {
      if (!isEditMode.value) return;
      
      loading.value = true;
      try {
        const response = await clientApi.getById(clientId.value);
        const clientData = response.data.data || response.data;
        form.value = { ...clientData };
      } catch (err: any) {
        console.error('Error fetching client:', err);
        showError('Gagal mengambil data klien');
        router.push('/clients');
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = () => {
      router.push('/clients');
    };

    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;

      loading.value = true;
      try {
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('email', form.value.email || '');
        formData.append('phone', form.value.phone);
        formData.append('address', form.value.address || '');
        formData.append('pic_name', form.value.pic_name || '');
        formData.append('pic_email', form.value.pic_email || '');
        formData.append('pic_phone', form.value.pic_phone || '');

        if (form.value.logo && typeof form.value.logo !== 'string') {
          formData.append('logo', form.value.logo);
        }

        if (isEditMode.value) {
          await clientApi.update(clientId.value, formData);
          ElMessage.success('Klien berhasil diupdate');
        } else {
          await clientApi.create(formData);
          ElMessage.success('Klien berhasil ditambahkan');
        }
        
        router.push('/clients');
      } catch (err: any) {
        console.error('Error saving client:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan data klien');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      if (isEditMode.value) {
        fetchClient();
      }
    });

    onBeforeUnmount(() => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
    });

    return {
      form,
      formRef,
      uploadRef,
      rules,
      loading,
      isEditMode,
      logoPreview,
      logoFileName,
      beforeUpload,
      handleFileChange,
      handleRemoveLogo,
      handleCancel,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
.client-form-page {
  padding: 1.5rem;
}

.sticky-header {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
  .header-content {
    .header-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
  }
}

.form-container {
  :deep(.el-card) {
    border-radius: 8px;
  }

  h5 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
  }

  :deep(.el-input__wrapper) {
    padding: 12px 15px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    
    &:hover {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
    }
    
    &.is-focus {
      box-shadow: 0 0 0 3px rgba(109, 93, 255, 0.2);
    }
  }

  :deep(.el-textarea__inner) {
    padding: 12px 15px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    
    &:hover {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(109, 93, 255, 0.2);
    }
  }
}

.logo-upload-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-uploader {
  :deep(.el-upload) {
    width: 100%;
  }
  
  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      border-color: #6d5dff;
      background-color: #f9fafb;
    }
  }

  // Hide default file list
  :deep(.el-upload-list) {
    display: none;
  }

  .upload-icon {
    font-size: 48px;
    color: #9ca3af;
    margin-bottom: 12px;
  }

  .upload-text {
    text-align: center;
    
    p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
      
      &.upload-hint {
        margin-top: 8px;
        font-size: 12px;
        color: #9ca3af;
      }
    }
    
    em {
      color: #6d5dff;
      font-style: normal;
      font-weight: 500;
    }
  }
}

.logo-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.logo-preview-wrapper {
  position: relative;
  max-width: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .logo-actions {
    padding: 12px;
    background: white;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
  }
}

.logo-info {
  small {
    display: block;
    color: #6b7280;
    font-size: 13px;
  }
}
</style>
