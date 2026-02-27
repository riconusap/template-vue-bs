<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEdit ? 'Edit Invoice' : 'Buat Invoice Baru'" 
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="160px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="No. Invoice" prop="invoice_number">
        <el-input 
          v-model="form.invoice_number" 
          placeholder="Contoh: INV-2024-001"
        />
      </el-form-item>

      <el-form-item label="Kontrak Klien" prop="contract_client_id">
        <el-select 
          v-model="form.contract_client_id" 
          placeholder="Pilih Kontrak"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="contract in contractClients"
            :key="contract.uuid"
            :label="`${contract.project_type} - ${formatCurrency(contract.contract_value)}`"
            :value="contract.uuid"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Tanggal Invoice" prop="invoice_date">
        <el-date-picker
          v-model="form.invoice_date"
          type="date"
          placeholder="Pilih tanggal invoice"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Jatuh Tempo" prop="due_date">
        <el-date-picker
          v-model="form.due_date"
          type="date"
          placeholder="Pilih tanggal jatuh tempo"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="disabledDueDate"
        />
      </el-form-item>

      <el-divider />

      <el-form-item label="Subtotal" prop="subtotal">
        <el-input 
          v-model.number="form.subtotal" 
          placeholder="Masukkan subtotal"
          type="number"
          :min="0"
          @input="calculateTotal"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-muted d-block mt-1">
          {{ formatCurrency(form.subtotal || 0) }}
        </small>
      </el-form-item>

      <el-form-item label="Pajak (PPN)" prop="tax">
        <el-input 
          v-model.number="form.tax" 
          placeholder="Masukkan pajak"
          type="number"
          :min="0"
          @input="calculateTotal"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-muted d-block mt-1">
          {{ formatCurrency(form.tax || 0) }}
        </small>
      </el-form-item>

      <el-form-item label="Total" prop="total">
        <el-input 
          v-model.number="form.total" 
          disabled
          type="number"
        >
          <template #prepend>Rp</template>
        </el-input>
        <small class="text-success d-block mt-1">
          <strong>{{ formatCurrency(form.total || 0) }}</strong>
        </small>
      </el-form-item>

      <el-divider />

      <el-form-item label="Status" prop="status">
        <el-select 
          v-model="form.status" 
          placeholder="Pilih Status"
          style="width: 100%"
        >
          <el-option label="Pending" value="pending" />
          <el-option label="Paid" value="paid" />
          <el-option label="Cancelled" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="Catatan" prop="notes">
        <el-input 
          v-model="form.notes" 
          placeholder="Catatan tambahan (opsional)"
          type="textarea"
          rows="3"
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
import { invoiceApi, IInvoice, IContractClient } from '@/services/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'InvoiceForm',
  props: {
    invoice: {
      type: Object as PropType<IInvoice | null>,
      default: null
    },
    contractClients: {
      type: Array as PropType<IContractClient[]>,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const dialogVisible = ref(true);
    const formRef = ref<FormInstance>();
    const submitting = ref(false);
    const { showError } = useErrorDialog();

    const form = ref<IInvoice>({
      invoice_number: '',
      contract_client_id: '',
      invoice_date: '',
      due_date: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'pending',
      notes: ''
    });

    const isEdit = computed(() => !!props.invoice?.uuid);

    const validateDueDate = (rule: any, value: any, callback: any) => {
      if (!value) {
        callback(new Error('Tanggal jatuh tempo wajib diisi'));
      } else if (form.value.invoice_date && value <= form.value.invoice_date) {
        callback(new Error('Tanggal jatuh tempo harus setelah tanggal invoice'));
      } else {
        callback();
      }
    };

    const rules = {
      invoice_number: [
        { required: true, message: 'Nomor invoice wajib diisi', trigger: 'blur' },
        { min: 5, message: 'Nomor invoice minimal 5 karakter', trigger: 'blur' }
      ],
      contract_client_id: [
        { required: true, message: 'Kontrak klien wajib dipilih', trigger: 'change' }
      ],
      invoice_date: [
        { required: true, message: 'Tanggal invoice wajib diisi', trigger: 'change' }
      ],
      due_date: [
        { required: true, validator: validateDueDate, trigger: 'change' }
      ],
      subtotal: [
        { required: true, message: 'Subtotal wajib diisi', trigger: 'blur' },
        { type: 'number', min: 1, message: 'Subtotal harus lebih dari 0', trigger: 'blur' }
      ],
      tax: [
        { required: true, message: 'Pajak wajib diisi', trigger: 'blur' },
        { type: 'number', min: 0, message: 'Pajak tidak boleh negatif', trigger: 'blur' }
      ],
      status: [
        { required: true, message: 'Status wajib dipilih', trigger: 'change' }
      ]
    };

    watch(
      () => props.invoice,
      (newVal) => {
        if (newVal) {
          form.value = {
            invoice_number: newVal.invoice_number || '',
            contract_client_id: newVal.contract_client_id || '',
            invoice_date: newVal.invoice_date || '',
            due_date: newVal.due_date || '',
            subtotal: newVal.subtotal || 0,
            tax: newVal.tax || 0,
            total: newVal.total || 0,
            status: newVal.status || 'pending',
            notes: newVal.notes || ''
          };
        }
      },
      { immediate: true }
    );

    const calculateTotal = () => {
      const subtotal = form.value.subtotal || 0;
      const tax = form.value.tax || 0;
      form.value.total = subtotal + tax;
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    };

    const disabledDueDate = (date: Date): boolean => {
      if (!form.value.invoice_date) return false;
      const invoiceDate = new Date(form.value.invoice_date);
      return date <= invoiceDate;
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

        // Auto-calculate total before submit
        calculateTotal();

        const payload: IInvoice = {
          invoice_number: form.value.invoice_number,
          contract_client_id: form.value.contract_client_id,
          invoice_date: form.value.invoice_date,
          due_date: form.value.due_date,
          subtotal: form.value.subtotal,
          tax: form.value.tax,
          total: form.value.total,
          status: form.value.status,
          notes: form.value.notes
        };

        if (isEdit.value && props.invoice?.uuid) {
          await invoiceApi.update(props.invoice.uuid, payload);
          ElMessage.success('Invoice berhasil diupdate');
        } else {
          await invoiceApi.create(payload);
          ElMessage.success('Invoice berhasil dibuat');
        }

        emit('saved');
        handleClose();
      } catch (err: any) {
        console.error('Error saving invoice:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan invoice');
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
      disabledDueDate,
      calculateTotal
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
