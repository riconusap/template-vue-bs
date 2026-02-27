<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit Kontrak Klien' : 'Tambah Kontrak Klien'" 
    width="550px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="150px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Placement" prop="placement_id">
        <el-select 
          v-model="form.placement_id" 
          placeholder="Pilih Placement"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="placement in placements"
            :key="placement.uuid"
            :label="placement.name"
            :value="placement.uuid"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Jenis Proyek" prop="project_type">
        <el-input 
          v-model="form.project_type" 
          placeholder="Contoh: Development, Consulting, Support"
        />
      </el-form-item>

      <el-form-item label="Nilai Kontrak" prop="contract_value">
        <el-input 
          v-model.number="form.contract_value" 
          placeholder="Masukkan nilai kontrak"
          type="number"
          :min="0"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-muted d-block mt-1">
          {{ formatCurrency(form.contract_value || 0) }}
        </small>
      </el-form-item>

      <el-form-item label="Tanggal Mulai" prop="start_on">
        <el-date-picker
          v-model="form.start_on"
          type="date"
          placeholder="Pilih tanggal mulai"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Tanggal Berakhir" prop="ends_on">
        <el-date-picker
          v-model="form.ends_on"
          type="date"
          placeholder="Pilih tanggal berakhir"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="disabledEndDate"
        />
      </el-form-item>

      <el-alert 
        v-if="form.start_on && form.ends_on" 
        :title="`Durasi: ${calculateDuration()} hari`" 
        type="info" 
        :closable="false"
        class="mb-3"
      />
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
import { contractClientApi, IContractClient, IPlacement } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ContractClientForm',
  props: {
    contract: {
      type: Object as PropType<IContractClient | null>,
      default: null
    },
    placements: {
      type: Array as PropType<IPlacement[]>,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const dialogVisible = ref(true);
    const formRef = ref<FormInstance>();
    const submitting = ref(false);
    const { showError } = useErrorDialog();

    const form = ref<IContractClient>({
      placement_id: '',
      contract_value: 0,
      start_on: '',
      ends_on: '',
      project_type: ''
    });

    const isEdit = computed(() => !!props.contract?.uuid);

    const validateEndDate = (rule: any, value: any, callback: any) => {
      if (!value) {
        callback(new Error('Tanggal berakhir wajib diisi'));
      } else if (form.value.start_on && value <= form.value.start_on) {
        callback(new Error('Tanggal berakhir harus setelah tanggal mulai'));
      } else {
        callback();
      }
    };

    const rules = {
      placement_id: [
        { required: true, message: 'Placement wajib dipilih', trigger: 'change' }
      ],
      project_type: [
        { required: true, message: 'Jenis proyek wajib diisi', trigger: 'blur' },
        { min: 3, message: 'Jenis proyek minimal 3 karakter', trigger: 'blur' }
      ],
      contract_value: [
        { required: true, message: 'Nilai kontrak wajib diisi', trigger: 'blur' },
        { type: 'number', min: 1, message: 'Nilai kontrak harus lebih dari 0', trigger: 'blur' }
      ],
      start_on: [
        { required: true, message: 'Tanggal mulai wajib diisi', trigger: 'change' }
      ],
      ends_on: [
        { required: true, validator: validateEndDate, trigger: 'change' }
      ]
    };

    watch(
      () => props.contract,
      (newVal) => {
        if (newVal) {
          form.value = {
            placement_id: newVal.placement_id || '',
            contract_value: newVal.contract_value || 0,
            start_on: newVal.start_on || '',
            ends_on: newVal.ends_on || '',
            project_type: newVal.project_type || ''
          };
        }
      },
      { immediate: true }
    );

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    };

    const disabledEndDate = (date: Date): boolean => {
      if (!form.value.start_on) return false;
      const startDate = new Date(form.value.start_on);
      return date <= startDate;
    };

    const calculateDuration = (): number => {
      if (!form.value.start_on || !form.value.ends_on) return 0;
      const start = new Date(form.value.start_on);
      const end = new Date(form.value.ends_on);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

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

        const payload: IContractClient = {
          placement_id: form.value.placement_id,
          contract_value: form.value.contract_value,
          start_on: form.value.start_on,
          ends_on: form.value.ends_on,
          project_type: form.value.project_type
        };

        if (isEdit.value && props.contract?.uuid) {
          await contractClientApi.update(props.contract.uuid, payload);
          ElMessage.success('Kontrak berhasil diupdate');
        } else {
          await contractClientApi.create(payload);
          ElMessage.success('Kontrak berhasil ditambahkan');
        }

        emit('saved');
        handleClose();
      } catch (err: any) {
        console.error('Error saving contract:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan kontrak');
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
      handleSubmit,
      formatCurrency,
      disabledEndDate,
      calculateDuration
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
