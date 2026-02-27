<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit Placement' : 'Tambah Placement'" 
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
      <el-form-item label="Nama Placement" prop="name">
        <el-input v-model="form.name" placeholder="Masukkan nama placement" />
      </el-form-item>

      <el-form-item label="Client" prop="client_id">
        <el-select 
          v-model="form.client_id" 
          placeholder="Pilih Client"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="client in clients"
            :key="client.uuid"
            :label="client.name"
            :value="client.uuid"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Deskripsi" prop="description">
        <el-input 
          v-model="form.description" 
          placeholder="Masukkan deskripsi placement"
          type="textarea"
          rows="4"
        />
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
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { placementApi, IPlacement, IClient } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'PlacementForm',
  props: {
    placement: {
      type: Object as PropType<IPlacement | null>,
      default: null
    },
    clients: {
      type: Array as PropType<IClient[]>,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const dialogVisible = ref(true);
    const formRef = ref<FormInstance>();
    const submitting = ref(false);
    const { showError } = useErrorDialog();

    const form = ref<IPlacement>({
      name: '',
      description: '',
      client_id: ''
    });

    const isEdit = computed(() => !!props.placement?.uuid);

    const rules = {
      name: [
        { required: true, message: 'Nama placement wajib diisi', trigger: 'blur' },
        { min: 3, message: 'Nama minimal 3 karakter', trigger: 'blur' }
      ],
      client_id: [
        { required: true, message: 'Client wajib dipilih', trigger: 'change' }
      ],
      description: [
        { required: true, message: 'Deskripsi wajib diisi', trigger: 'blur' }
      ]
    };

    watch(
      () => props.placement,
      (newVal) => {
        if (newVal) {
          form.value = {
            name: newVal.name || '',
            description: newVal.description || '',
            client_id: newVal.client_id || ''
          };
        }
      },
      { immediate: true }
    );

    const handleClose = () => {
      dialogVisible.value = false;
      emit('close');
    };

    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      try {
        const valid = await formRef.value.validate();
        if (!valid) return;

        submitting.value = true;

        const payload: IPlacement = {
          name: form.value.name,
          description: form.value.description,
          client_id: form.value.client_id
        };

        if (isEdit.value && props.placement?.uuid) {
          await placementApi.update(props.placement.uuid, payload);
          ElMessage.success('Placement berhasil diupdate');
        } else {
          await placementApi.create(payload);
          ElMessage.success('Placement berhasil ditambahkan');
        }

        emit('saved');
        handleClose();
      } catch (err: any) {
        console.error('Error saving placement:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan placement');
      } finally {
        submitting.value = false;
      }
    };

    return {
      dialogVisible,
      formRef,
      form,
      rules,
      isEdit,
      submitting,
      handleClose,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
