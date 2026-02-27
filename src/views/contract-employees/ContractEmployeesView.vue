<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="m-0">Contract Employees</h4>
            <p class="text-muted mb-0">Kelola kontrak karyawan</p>
          </div>
          <el-button type="primary" @click="handleCreate">
            Tambah Contract Employee
          </el-button>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <el-input
          v-model="searchQuery"
          placeholder="Cari berdasarkan NIP atau nama..."
          clearable
          @clear="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">Search</el-button>
          </template>
        </el-input>
      </div>
      <div class="col-md-3">
        <el-button @click="resetFilter" plain>Reset Filter</el-button>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <el-card>
          <el-table :data="contractEmployees" style="width: 100%" v-loading="loading">
            <el-table-column prop="nip" label="NIP" width="120" />
            <el-table-column label="Karyawan" width="180">
              <template #default="{ row }">
                {{ getEmployeeName(row.employee_id) }}
              </template>
            </el-table-column>
            <el-table-column label="Placement" width="180">
              <template #default="{ row }">
                {{ getPlacementName(row.placement_id) }}
              </template>
            </el-table-column>
            <el-table-column label="Periode Kontrak" width="200">
              <template #default="{ row }">
                <small>
                  {{ formatDate(row.start_on) }} - {{ formatDate(row.ends_on) }}
                </small>
              </template>
            </el-table-column>
            <el-table-column label="THP" width="140" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.thp) }}
              </template>
            </el-table-column>
            <el-table-column label="Daily Wages" width="140" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.daily_wages) }}
              </template>
            </el-table-column>
            <el-table-column label="Bank" width="150">
              <template #default="{ row }">
                <div>
                  <strong>{{ row.bank_id }}</strong><br>
                  <small>{{ row.account_number }}</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="BPJS" width="180">
              <template #default="{ row }">
                <div>
                  <small class="d-block">TK: {{ row.no_bpjstk }}</small>
                  <small class="d-block">KES: {{ row.no_bpjskes }}</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row)">
                  {{ getStatusLabel(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">Edit</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">
                  Delete
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="text-muted">Total: {{ pagination.total }} contract employees</span>
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.per_page"
              :page-sizes="[5, 10, 20, 50, 100]"
              :total="pagination.total"
              layout="sizes, prev, pager, next"
              @current-change="fetchData"
              @size-change="fetchData"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- Form Dialog -->
    <ContractEmployeeForm
      v-if="showForm"
      :contract-employee="selectedContractEmployee"
      :employees="employees"
      :placements="placements"
      @close="handleCloseForm"
      @saved="handleSaved"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { contractEmployeeApi, employeeApi, placementApi, IContractEmployee, IEmployee, IPlacement } from '@/services/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';
import ContractEmployeeForm from './ContractEmployeeForm.vue';

export default defineComponent({
  name: 'ContractEmployeesView',
  components: {
    ContractEmployeeForm
  },
  setup() {
    const loading = ref(false);
    const contractEmployees = ref<IContractEmployee[]>([]);
    const employees = ref<IEmployee[]>([]);
    const placements = ref<IPlacement[]>([]);
    const showForm = ref(false);
    const selectedContractEmployee = ref<IContractEmployee | null>(null);
    const searchQuery = ref('');
    const { showError } = useErrorDialog();

    const pagination = ref({
      page: 1,
      per_page: 10,
      total: 0
    });

    const fetchData = async () => {
      try {
        loading.value = true;
        const params: any = {
          page: pagination.value.page,
          per_page: pagination.value.per_page
        };

        if (searchQuery.value) {
          params.search = searchQuery.value;
        }

        const response = await contractEmployeeApi.getAll(params);
        contractEmployees.value = response.data.data || response.data;
        
        if (response.data.meta) {
          pagination.value.total = response.data.meta.total;
          pagination.value.page = response.data.meta.current_page;
        }
      } catch (err: any) {
        console.error('Error fetching contract employees:', err);
        showError(err.response?.data?.message || 'Gagal memuat data contract employees');
      } finally {
        loading.value = false;
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await employeeApi.getAll({ per_page: 1000 });
        employees.value = response.data.data || response.data;
      } catch (err: any) {
        console.error('Error fetching employees:', err);
      }
    };

    const fetchPlacements = async () => {
      try {
        const response = await placementApi.getAll({ per_page: 1000 });
        placements.value = response.data.data || response.data;
      } catch (err: any) {
        console.error('Error fetching placements:', err);
      }
    };

    const getEmployeeName = (employeeId: string): string => {
      const employee = employees.value.find(e => e.uuid === employeeId);
      return employee ? employee.full_name : '-';
    };

    const getPlacementName = (placementId: string): string => {
      const placement = placements.value.find(p => p.uuid === placementId);
      return placement ? placement.name : '-';
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

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    };

    const getStatusLabel = (contractEmployee: IContractEmployee): string => {
      const today = new Date();
      const startDate = new Date(contractEmployee.start_on);
      const endDate = new Date(contractEmployee.ends_on);

      if (today < startDate) return 'Belum Mulai';
      if (today > endDate) return 'Selesai';
      return 'Aktif';
    };

    const getStatusType = (contractEmployee: IContractEmployee): string => {
      const today = new Date();
      const startDate = new Date(contractEmployee.start_on);
      const endDate = new Date(contractEmployee.ends_on);

      if (today < startDate) return 'warning';
      if (today > endDate) return 'info';
      return 'success';
    };

    const handleSearch = () => {
      pagination.value.page = 1;
      fetchData();
    };

    const resetFilter = () => {
      searchQuery.value = '';
      pagination.value.page = 1;
      fetchData();
    };

    const handleCreate = () => {
      selectedContractEmployee.value = null;
      showForm.value = true;
    };

    const handleEdit = (contractEmployee: IContractEmployee) => {
      selectedContractEmployee.value = { ...contractEmployee };
      showForm.value = true;
    };

    const handleDelete = async (contractEmployee: IContractEmployee) => {
      try {
        await ElMessageBox.confirm(
          'Apakah Anda yakin akan menghapus contract employee ini?',
          'Konfirmasi',
          {
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            type: 'warning'
          }
        );

        await contractEmployeeApi.delete(contractEmployee.uuid!);
        ElMessage.success('Contract employee berhasil dihapus');
        fetchData();
      } catch (err: any) {
        if (err !== 'cancel') {
          console.error('Error deleting contract employee:', err);
          showError(err.response?.data?.message || 'Gagal menghapus contract employee');
        }
      }
    };

    const handleCloseForm = () => {
      showForm.value = false;
      selectedContractEmployee.value = null;
    };

    const handleSaved = () => {
      fetchData();
    };

    onMounted(() => {
      fetchData();
      fetchEmployees();
      fetchPlacements();
    });

    return {
      loading,
      contractEmployees,
      employees,
      placements,
      showForm,
      selectedContractEmployee,
      searchQuery,
      pagination,
      fetchData,
      getEmployeeName,
      getPlacementName,
      formatDate,
      formatCurrency,
      getStatusLabel,
      getStatusType,
      handleSearch,
      resetFilter,
      handleCreate,
      handleEdit,
      handleDelete,
      handleCloseForm,
      handleSaved
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
