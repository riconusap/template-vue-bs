<template>
  <el-dialog 
    v-model="visible" 
    :title="contract ? 'Edit Kontrak' : 'Tambah Kontrak'" 
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef" 
      label-width="220px"
    >
      <el-form-item label="Placement" prop="placement_id">
        <el-select 
          v-model="form.placement_id" 
          placeholder="Pilih Placement"
          filterable
          clearable
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

      <el-divider>Periode Kontrak</el-divider>

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
        v-if="contractDuration > 0"
        :title="`Durasi Kontrak: ${contractDuration} hari`"
        type="info"
        :closable="false"
        class="mb-3"
      />

      <el-divider>Kompensasi</el-divider>

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

      <el-form-item label="Bank" prop="bank_id">
        <el-select 
          v-model="form.bank_id" 
          placeholder="Pilih Bank"
          filterable
          clearable
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
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        Simpan
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, PropType } from 'vue';
import { contractEmployeeApi, placementApi, IContractEmployee, IPlacement } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ContractForm',
  props: {
    contract: {
      type: Object as PropType<IContractEmployee | null>,
      default: null
    },
    employeeId: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const visible = ref(true);
    const loading = ref(false);
    const formRef = ref<FormInstance>();
    const { showError } = useErrorDialog();
    const placements = ref<IPlacement[]>([]);

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

    const form = ref<Partial<IContractEmployee>>({
      start_on: '',
      ends_on: '',
      thp: 0,
      daily_wages: 0,
      account_number: '',
      bank_id: '',
      account_holder_name: '',
      no_bpjstk: '',
      no_bpjskes: '',
      placement_id: '',
      employee_id: props.employeeId
    });

    const validateEndDate = (rule: any, value: any, callback: any) => {
      if (value && form.value.start_on && value <= form.value.start_on) {
        callback(new Error('Tanggal berakhir harus setelah tanggal mulai'));
      } else {
        callback();
      }
    };

    const rules = {
      placement_id: [
        { required: true, message: 'Placement wajib dipilih', trigger: 'change' }
      ],
      start_on: [
        { required: true, message: 'Tanggal mulai wajib diisi', trigger: 'change' }
      ],
      ends_on: [
        { required: true, message: 'Tanggal berakhir wajib diisi', trigger: 'change' },
        { validator: validateEndDate, trigger: 'change' }
      ]
    };

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

    const fetchPlacements = async () => {
      try {
        const response = await placementApi.getAll({ per_page: 1000 });
        placements.value = response.data.data || response.data;
      } catch (err: any) {
        console.error('Error fetching placements:', err);
      }
    };

    watch(() => props.contract, (val) => {
      if (val) {
        form.value = { ...val };
      } else {
        form.value = {
          start_on: '',
          ends_on: '',
          thp: 0,
          daily_wages: 0,
          account_number: '',
          bank_id: '',
          account_holder_name: '',
          no_bpjstk: '',
          no_bpjskes: '',
          placement_id: '',
          employee_id: props.employeeId
        };
      }
    }, { immediate: true });

    const handleClose = () => {
      visible.value = false;
      emit('close');
    };

    const handleSubmit = async () => {
      if (!formRef.value) return;
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;

      loading.value = true;
      try {
        form.value.employee_id = props.employeeId;

        if (props.contract?.uuid) {
          await contractEmployeeApi.update(props.contract.uuid, form.value as IContractEmployee);
          ElMessage.success('Kontrak berhasil diupdate');
        } else {
          await contractEmployeeApi.create(form.value as IContractEmployee);
          ElMessage.success('Kontrak berhasil ditambahkan');
        }

        emit('saved');
        handleClose();
      } catch (err: any) {
        console.error('Error saving contract:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan kontrak');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchPlacements();
    });

    return {
      visible,
      loading,
      form,
      formRef,
      rules,
      placements,
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
.mb-3 {
  margin-bottom: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>
