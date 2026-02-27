<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit Contract Employee' : 'Buat Contract Employee Baru'" 
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="180px"
      @submit.prevent="handleSubmit"
    >
      <!-- Employee & Placement -->
      <el-form-item label="Karyawan" prop="employee_id">
        <el-select 
          v-model="form.employee_id" 
          placeholder="Pilih Karyawan"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="employee in employees"
            :key="employee.uuid"
            :label="`${employee.full_name} (${employee.nik})`"
            :value="employee.uuid"
          />
        </el-select>
      </el-form-item>

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

      <el-form-item label="NIP" prop="nip">
        <el-input 
          v-model="form.nip" 
          placeholder="Masukkan NIP karyawan"
        />
      </el-form-item>

      <el-divider>Periode Kontrak</el-divider>

      <!-- Contract Period -->
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

      <!-- Duration Display -->
      <el-alert
        v-if="contractDuration > 0"
        :title="`Durasi Kontrak: ${contractDuration} hari`"
        type="info"
        :closable="false"
        class="mb-3"
      />

      <el-divider>Kompensasi</el-divider>

      <!-- Compensation -->
      <el-form-item label="Monthly Wages" prop="thp">
        <el-input 
          v-model.number="form.thp" 
          placeholder="Masukkan THP"
          type="number"
          :min="0"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-muted d-block mt-1">
          {{ formatCurrency(form.thp || 0) }}
        </small>
      </el-form-item>

      <el-form-item label="Daily Wages" prop="daily_wages">
        <el-input 
          v-model.number="form.daily_wages" 
          placeholder="Masukkan upah harian"
          type="number"
          :min="0"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-muted d-block mt-1">
          {{ formatCurrency(form.daily_wages || 0) }}
        </small>
      </el-form-item>

      <el-divider>Informasi Bank</el-divider>

      <!-- Bank Information -->
      <el-form-item label="Bank" prop="bank_id">
        <el-select 
          v-model="form.bank_id" 
          placeholder="Pilih Bank"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="bank in bankList"
            :key="bank.code"
            :label="bank.name"
            :value="bank.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Nomor Rekening" prop="account_number">
        <el-input 
          v-model="form.account_number" 
          placeholder="Masukkan nomor rekening"
        />
      </el-form-item>

      <el-form-item label="Nama Pemegang Rekening" prop="account_holder_name">
        <el-input 
          v-model="form.account_holder_name" 
          placeholder="Masukkan nama pemegang rekening"
        />
      </el-form-item>

      <el-divider>BPJS</el-divider>

      <!-- BPJS Information -->
      <el-form-item label="No. BPJS Ketenagakerjaan" prop="no_bpjstk">
        <el-input 
          v-model="form.no_bpjstk" 
          placeholder="Masukkan nomor BPJS TK"
        />
      </el-form-item>

      <el-form-item label="No. BPJS Kesehatan" prop="no_bpjskes">
        <el-input 
          v-model="form.no_bpjskes" 
          placeholder="Masukkan nomor BPJS Kesehatan"
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
import { contractEmployeeApi, IContractEmployee, IEmployee, IPlacement } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ContractEmployeeForm',
  props: {
    contractEmployee: {
      type: Object as PropType<IContractEmployee | null>,
      default: null
    },
    employees: {
      type: Array as PropType<IEmployee[]>,
      required: true
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

    const bankList = [
      { code: 'BCA', name: 'Bank Central Asia (BCA)' },
      { code: 'MANDIRI', name: 'Bank Mandiri' },
      { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
      { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
      { code: 'BTN', name: 'Bank Tabungan Negara (BTN)' },
      { code: 'CIMB', name: 'CIMB Niaga' },
      { code: 'PERMATA', name: 'Bank Permata' },
      { code: 'DANAMON', name: 'Bank Danamon' },
      { code: 'BII', name: 'Bank Internasional Indonesia (BII)' },
      { code: 'PANIN', name: 'Bank Panin' },
      { code: 'OCBC', name: 'OCBC NISP' },
      { code: 'MEGA', name: 'Bank Mega' },
      { code: 'BSI', name: 'Bank Syariah Indonesia (BSI)' }
    ];

    const form = ref<IContractEmployee>({
      nip: '',
      start_on: '',
      ends_on: '',
      thp: 0,
      daily_wages: 0,
      account_number: '',
      bank_id: '',
      account_holder_name: '',
      no_bpjstk: '',
      no_bpjskes: '',
      employee_id: '',
      placement_id: ''
    });

    const isEdit = computed(() => !!props.contractEmployee?.uuid);

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
      employee_id: [
        { required: true, message: 'Karyawan wajib dipilih', trigger: 'change' }
      ],
      placement_id: [
        { required: true, message: 'Placement wajib dipilih', trigger: 'change' }
      ],
      nip: [
        { required: true, message: 'NIP wajib diisi', trigger: 'blur' },
        { min: 3, message: 'NIP minimal 3 karakter', trigger: 'blur' }
      ],
      start_on: [
        { required: true, message: 'Tanggal mulai wajib diisi', trigger: 'change' }
      ],
      ends_on: [
        { required: true, validator: validateEndDate, trigger: 'change' }
      ],
      thp: [
        { required: true, message: 'THP wajib diisi', trigger: 'blur' },
        { type: 'number', min: 1, message: 'THP harus lebih dari 0', trigger: 'blur' }
      ],
      daily_wages: [
        { required: true, message: 'Daily wages wajib diisi', trigger: 'blur' },
        { type: 'number', min: 1, message: 'Daily wages harus lebih dari 0', trigger: 'blur' }
      ],
      bank_id: [
        { required: true, message: 'Bank wajib dipilih', trigger: 'change' }
      ],
      account_number: [
        { required: true, message: 'Nomor rekening wajib diisi', trigger: 'blur' },
        { min: 5, message: 'Nomor rekening minimal 5 karakter', trigger: 'blur' }
      ],
      account_holder_name: [
        { required: true, message: 'Nama pemegang rekening wajib diisi', trigger: 'blur' },
        { min: 3, message: 'Nama pemegang rekening minimal 3 karakter', trigger: 'blur' }
      ],
      no_bpjstk: [
        { required: true, message: 'No. BPJS Ketenagakerjaan wajib diisi', trigger: 'blur' }
      ],
      no_bpjskes: [
        { required: true, message: 'No. BPJS Kesehatan wajib diisi', trigger: 'blur' }
      ]
    };

    watch(
      () => props.contractEmployee,
      (newVal) => {
        if (newVal) {
          form.value = {
            nip: newVal.nip || '',
            start_on: newVal.start_on || '',
            ends_on: newVal.ends_on || '',
            thp: newVal.thp || 0,
            daily_wages: newVal.daily_wages || 0,
            account_number: newVal.account_number || '',
            bank_id: newVal.bank_id || '',
            account_holder_name: newVal.account_holder_name || '',
            no_bpjstk: newVal.no_bpjstk || '',
            no_bpjskes: newVal.no_bpjskes || '',
            employee_id: newVal.employee_id || '',
            placement_id: newVal.placement_id || ''
          };
        }
      },
      { immediate: true }
    );

    const contractDuration = computed(() => {
      if (!form.value.start_on || !form.value.ends_on) return 0;
      const start = new Date(form.value.start_on);
      const end = new Date(form.value.ends_on);
      const diff = end.getTime() - start.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });

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

        const payload: IContractEmployee = {
          nip: form.value.nip,
          start_on: form.value.start_on,
          ends_on: form.value.ends_on,
          thp: form.value.thp,
          daily_wages: form.value.daily_wages,
          account_number: form.value.account_number,
          bank_id: form.value.bank_id,
          account_holder_name: form.value.account_holder_name,
          no_bpjstk: form.value.no_bpjstk,
          no_bpjskes: form.value.no_bpjskes,
          employee_id: form.value.employee_id,
          placement_id: form.value.placement_id
        };

        if (isEdit.value && props.contractEmployee?.uuid) {
          await contractEmployeeApi.update(props.contractEmployee.uuid, payload);
          ElMessage.success('Contract employee berhasil diupdate');
        } else {
          await contractEmployeeApi.create(payload);
          ElMessage.success('Contract employee berhasil dibuat');
        }

        emit('saved');
        handleClose();
      } catch (err: any) {
        console.error('Error saving contract employee:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan contract employee');
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
      bankList,
      contractDuration,
      handleClose,
      handleSubmit,
      formatCurrency,
      disabledEndDate
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
