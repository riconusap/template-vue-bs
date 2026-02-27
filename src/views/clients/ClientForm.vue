<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit Klien' : 'Tambah Klien'" 
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      @submit.prevent="handleSubmit"
    >
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
        <div class="d-flex flex-column gap-2">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept="image/*"
          >
            <template #default>
              <div class="el-upload__text">
                Drop image here or <em>click to upload</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </template>
          </el-upload>
          <div v-if="form.logo && typeof form.logo === 'string'" class="text-muted">
            <small>Current: {{ form.logo }}</small>
          </div>
        </div>
      </el-form-item>

      <el-divider />

      <h6 class="mb-3">Kontak Utama (PIC)</h6>

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

    <template #footer>
      <el-button @click="handleClose">Batal</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? 'Update' : 'Simpan' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { clientApi, IClient } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

interface IClientForm extends IClient {
  logo?: string | File;
}

interface Props {
  client?: IClient | null;
}

export default defineComponent({
  name: 'ClientForm',
  props: {
    client: {
      type: Object as any,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props: Props, { emit }) {
    const formRef = ref<FormInstance>();
    const uploadRef = ref();
    const dialogVisible = ref(true);
    const submitting = ref(false);
    const { showError } = useErrorDialog();

    const form = ref<IClientForm>({
      name: '',
      email: '',
      phone: '',
      address: '',
      logo: undefined,
      pic_name: '',
      pic_email: '',
      pic_phone: ''
    });

    const isEdit = computed(() => !!props.client?.uuid);

    const rules = {
      name: [{ required: true, message: 'Nama klien harus diisi', trigger: 'blur' }],
      email: [
        { required: true, message: 'Email harus diisi', trigger: 'blur' },
        { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
      ],
      phone: [{ required: true, message: 'Telepon harus diisi', trigger: 'blur' }],
      address: [{ required: true, message: 'Alamat harus diisi', trigger: 'blur' }],
      pic_name: [{ required: true, message: 'Nama PIC harus diisi', trigger: 'blur' }],
      pic_email: [
        { required: true, message: 'Email PIC harus diisi', trigger: 'blur' },
        { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
      ],
      pic_phone: [{ required: true, message: 'Telepon PIC harus diisi', trigger: 'blur' }]
    };

    watch(
      () => props.client,
      (newClient) => {
        if (newClient) {
          form.value = {
            uuid: newClient.uuid,
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            address: newClient.address,
            logo: newClient.logo,
            pic_name: newClient.pic_name,
            pic_email: newClient.pic_email,
            pic_phone: newClient.pic_phone
          };
        }
      },
      { immediate: true }
    );

    const handleFileChange = (file: any) => {
      form.value.logo = file.raw;
    };

    const handleSubmit = async () => {
      await formRef.value?.validate();
      submitting.value = true;

      try {
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('email', form.value.email);
        formData.append('phone', form.value.phone);
        formData.append('address', form.value.address);
        formData.append('pic_name', form.value.pic_name);
        formData.append('pic_email', form.value.pic_email);
        formData.append('pic_phone', form.value.pic_phone);

        if (form.value.logo instanceof File) {
          formData.append('logo', form.value.logo);
        }

        if (isEdit.value && form.value.uuid) {
          await clientApi.update(form.value.uuid, formData);
          ElMessage.success('Klien berhasil diupdate');
        } else {
          await clientApi.create(formData);
          ElMessage.success('Klien berhasil ditambahkan');
        }

        emit('saved');
        dialogVisible.value = false;
      } catch (err: any) {
        console.error('Error:', err);
        showError(isEdit.value ? 'Gagal mengupdate klien' : 'Gagal menambahkan klien');
      } finally {
        submitting.value = false;
      }
    };

    const handleClose = () => {
      dialogVisible.value = false;
      emit('close');
    };

    return {
      formRef,
      uploadRef,
      dialogVisible,
      form,
      rules,
      isEdit,
      submitting,
      handleSubmit,
      handleClose,
      handleFileChange
    };
  }
});
</script>

<style lang="scss" scoped>
h6 {
  font-weight: 600;
  font-size: 1rem;
}

.upload-demo {
  width: 100%;
}
</style>
