<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Invoice Management</h4>
        <el-button type="primary" @click="openForm()">Buat Invoice</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari Invoice</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari nomor invoice atau notes..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-select 
          v-model="statusFilter"
          placeholder="Filter Status"
          clearable
          style="width: 180px"
          @change="onSearch"
        >
          <el-option label="Pending" value="pending" />
          <el-option label="Paid" value="paid" />
          <el-option label="Cancelled" value="cancelled" />
          <el-option label="Overdue" value="overdue" />
        </el-select>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="invoices" style="width: 100%" v-loading="loading">
        <el-table-column prop="invoice_number" label="No. Invoice" width="150" />
        <el-table-column label="Kontrak" width="200">
          <template #default="{ row }">
            {{ getContractInfo(row.contract_client_id) }}
          </template>
        </el-table-column>
        <el-table-column label="Tgl Invoice" width="120">
          <template #default="{ row }">
            {{ formatDate(row.invoice_date) }}
          </template>
        </el-table-column>
        <el-table-column label="Jatuh Tempo" width="120">
          <template #default="{ row }">
            {{ formatDate(row.due_date) }}
          </template>
        </el-table-column>
        <el-table-column label="Subtotal" width="140" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.subtotal) }}
          </template>
        </el-table-column>
        <el-table-column label="Pajak" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.tax) }}
          </template>
        </el-table-column>
        <el-table-column label="Total" width="150" align="right">
          <template #default="{ row }">
            <strong>{{ formatCurrency(row.total) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="editInvoice(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)">Hapus</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Total: {{ total }}</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @change="fetchInvoices"
        />
      </div>
    </el-card>
    <invoice-form 
      v-if="formVisible" 
      :invoice="selectedInvoice" 
      :contract-clients="contractClients"
      @close="closeForm" 
      @saved="handleSaved" 
    />
    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus invoice <b>{{ selectedInvoice?.invoice_number }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deleteInvoice">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { invoiceApi, IInvoice, contractClientApi, IContractClient } from '@/services/api';
import { ElMessage } from 'element-plus';
import InvoiceForm from './InvoiceForm.vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'InvoicesView',
  components: { InvoiceForm },
  setup() {
    const invoices = ref<IInvoice[]>([]);
    const contractClients = ref<IContractClient[]>([]);
    const loading = ref(false);
    const formVisible = ref(false);
    const selectedInvoice = ref<IInvoice | null>(null);
    const deleteDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const { showError } = useErrorDialog();

    const fetchContractClients = async () => {
      try {
        const res = await contractClientApi.getAll();
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        contractClients.value = Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error('Error fetching contract clients:', err);
      }
    };

    const fetchInvoices = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        if (searchQuery.value) params.search = searchQuery.value;
        if (statusFilter.value) params.status = statusFilter.value;
        
        const res = await invoiceApi.getAll(params);
        console.log('Invoices response:', res);
        
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        invoices.value = Array.isArray(data) ? data : [];
        
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? invoices.value.length;
        
        console.log('Invoices:', invoices.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching invoices:', err);
        showError('Gagal mengambil data invoice');
      } finally {
        loading.value = false;
      }
    };

    const getContractInfo = (contract_client_id: string): string => {
      const contract = contractClients.value.find(c => c.uuid === contract_client_id);
      return contract?.project_type || '-';
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    };

    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    };

    const isOverdue = (invoice: IInvoice): boolean => {
      if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      return today > dueDate;
    };

    const getStatusLabel = (invoice: IInvoice): string => {
      if (isOverdue(invoice)) return 'Overdue';
      const statusMap: Record<string, string> = {
        pending: 'Pending',
        paid: 'Paid',
        cancelled: 'Cancelled'
      };
      return statusMap[invoice.status] || invoice.status;
    };

    const getStatusType = (invoice: IInvoice): string => {
      if (isOverdue(invoice)) return 'danger';
      const statusTypeMap: Record<string, string> = {
        pending: 'warning',
        paid: 'success',
        cancelled: 'info'
      };
      return statusTypeMap[invoice.status] || '';
    };

    const openForm = () => {
      selectedInvoice.value = null;
      formVisible.value = true;
    };

    const editInvoice = (invoice: IInvoice) => {
      selectedInvoice.value = { ...invoice };
      formVisible.value = true;
    };

    const closeForm = () => {
      formVisible.value = false;
      selectedInvoice.value = null;
    };

    const handleSaved = () => {
      closeForm();
      fetchInvoices();
    };

    const confirmDelete = (invoice: IInvoice) => {
      selectedInvoice.value = invoice;
      deleteDialogVisible.value = true;
    };

    const deleteInvoice = async () => {
      if (!selectedInvoice.value?.uuid) return;
      loading.value = true;
      try {
        await invoiceApi.delete(selectedInvoice.value.uuid);
        ElMessage.success('Invoice berhasil dihapus');
        fetchInvoices();
      } catch (err: any) {
        showError('Gagal menghapus invoice');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchInvoices();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = '';
      currentPage.value = 1;
      fetchInvoices();
    };

    onMounted(async () => {
      await fetchContractClients();
      fetchInvoices();
    });

    return {
      invoices,
      contractClients,
      loading,
      formVisible,
      selectedInvoice,
      openForm,
      editInvoice,
      closeForm,
      handleSaved,
      confirmDelete,
      deleteDialogVisible,
      deleteInvoice,
      getContractInfo,
      formatCurrency,
      formatDate,
      getStatusLabel,
      getStatusType,
      fetchInvoices,
      currentPage,
      pageSize,
      total,
      searchQuery,
      statusFilter,
      onSearch,
      resetFilters
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
