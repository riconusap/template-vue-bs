<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit PIC Eksternal' : 'Tambah PIC Eksternal'" 
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Nama" prop="name">
        <el-input v-model="form.name" placeholder="Masukkan nama PIC" />
      </el-form-item>

      <el-form-item label="Posisi" prop="position">
        <el-input v-model="form.position" placeholder="Contoh: Project Manager" />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" placeholder="email@example.com" type="email" />
      </el-form-item>

      <el-form-item label="Telepon" prop="phone">
        <el-input v-model="form.phone" placeholder="0812-3456-7890" />
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
import { picExternalApi, IPicExternal } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

interface Props {
  pic?: IPicExternal | null;
}

export default defineComponent({
  name: 'PicExternalForm',
  props: {
    pic: {
      type: Object as any,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props: Props, { emit }) {
    const formRef = ref<FormInstance>();
    const dialogVisible = ref(true);
    const submitting = ref(false);
    const { showError } = useErrorDialog();

    const form = ref<IPicExternal>({
      name: '',
      position: '',
      email: '',
      phone: ''
    });

    const isEdit = computed(() => !!props.pic?.uuid);

    const rules = {
      name: [{ required: true, message: 'Nama harus diisi', trigger: 'blur' }],
      position: [{ required: true, message: 'Posisi harus diisi', trigger: 'blur' }],
      email: [
        { required: true, message: 'Email harus diisi', trigger: 'blur' },
        { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
      ],
      phone: [{ required: true, message: 'Telepon harus diisi', trigger: 'blur' }]
    };

    watch(
      () => props.pic,
      (newPic) => {
        if (newPic) {
          form.value = {
            uuid: newPic.uuid,
            name: newPic.name,
            position: newPic.position,
            email: newPic.email,
            phone: newPic.phone
          };
        }
      },
      { immediate: true }
    );

    const handleSubmit = async () => {
      await formRef.value?.validate();
      submitting.value = true;

      try {
        if (isEdit.value && form.value.uuid) {
          await picExternalApi.update(form.value.uuid, form.value);
          ElMessage.success('PIC eksternal berhasil diupdate');
        } else {
          await picExternalApi.create(form.value);
          ElMessage.success('PIC eksternal berhasil ditambahkan');
        }

        emit('saved');
        dialogVisible.value = false;
      } catch (err: any) {
        console.error('Error:', err);
        showError(isEdit.value ? 'Gagal mengupdate PIC eksternal' : 'Gagal menambahkan PIC eksternal');
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
      dialogVisible,
      form,
      rules,
      isEdit,
      submitting,
      handleSubmit,
      handleClose
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
