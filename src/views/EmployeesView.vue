<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="m-0">Daftar Karyawan</h4>
          <p class="text-muted mb-0">Kelola data karyawan dan kontrak</p>
        </div>
        <el-button type="primary" @click="openForm()">Tambah Karyawan</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="m-0">Filter</h5>
          <el-button text @click="resetFilters">Reset</el-button>
        </div>
      </template>
      <div class="row align-items-end g-2">
        <div class="col-md-4">
          <label class="form-label mb-2">Cari Nama</label>
          <el-input v-model="filterFullName" placeholder="Cari nama..." @change="onFilterChange" />
        </div>
        <div class="col-md-4">
          <label class="form-label mb-2">NIK</label>
          <el-input v-model="filterNik" placeholder="Cari NIK..." @change="onFilterChange" />
        </div>
        <div class="col-md-4">
          <label class="form-label mb-2">Search Semua</label>
          <el-input v-model="searchQuery" placeholder="Search..." @change="onFilterChange" clearable />
        </div>
      </div>
    </el-card>
    <el-card>
      <el-table :data="employees" style="width: 100%" v-loading="loading">
        <el-table-column prop="full_name" label="Nama" width="200" />
        <el-table-column prop="nik" label="NIK" width="160" />
        <el-table-column label="Jumlah Kontrak" width="140" align="center">
          <template #default="{ row }">
            <el-badge 
              :value="getContractCount(row.uuid)" 
              class="item" 
              type="primary"
              :hidden="getContractCount(row.uuid) === 0"
            >
              <el-button size="small" @click="viewContracts(row)" :type="getContractCount(row.uuid) > 0 ? 'primary' : 'info'" link>
                <i class="fas fa-file-contract me-1"></i>
                {{ getContractCount(row.uuid) === 0 ? 'Belum ada' : 'Lihat' }}
              </el-button>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column label="Kontrak Aktif" width="180">
          <template #default="{ row }">
            <el-tag v-if="getActiveContract(row.uuid)" type="success" size="small">
              {{ getActiveContractPeriod(row.uuid) }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">Detail</el-button>
            <el-button size="small" type="warning" @click="editEmployee(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)">Hapus</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Total: {{ total }} karyawan</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @change="fetchEmployees"
        />
      </div>
    </el-card>
    
    <!-- Contract List Modal -->
    <el-dialog v-model="contractListVisible" title="Daftar Kontrak" width="900px">
      <div v-if="selectedEmployee">
        <h6 class="mb-3">Karyawan: {{ selectedEmployee.full_name }}</h6>
        <el-table :data="filteredContracts" border stripe>
          <el-table-column label="Placement" width="180">
            <template #default="{ row }">
              {{ getPlacementNameById(row.placement_id) }}
            </template>
          </el-table-column>
          <el-table-column label="Periode" width="220">
            <template #default="{ row }">
              {{ formatContractPeriod(row.start_on, row.ends_on) }}
            </template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="getContractStatusType(row)">{{ getContractStatusText(row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="THP" width="150" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.thp) }}
            </template>
          </el-table-column>
          <el-table-column label="Daily Wages" width="150" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.daily_wages) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="mt-3 d-flex justify-content-end">
          <el-button @click="contractListVisible = false">Tutup</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus karyawan <b>{{ selectedEmployee?.full_name }}</b>?</p>
        <p class="text-muted">Data kontrak karyawan juga akan terhapus.</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deleteEmployee" :loading="loading">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { employeeApi, contractEmployeeApi, placementApi, IEmployee, IContractEmployee, IPlacement } from '@/services/api';
import { ElMessage } from 'element-plus';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'EmployeesView',
  setup() {
    const router = useRouter();
    const employees = ref<IEmployee[]>([]);
    const contracts = ref<IContractEmployee[]>([]);
    const placements = ref<IPlacement[]>([]);
    const loading = ref(false);
    const selectedEmployee = ref<IEmployee | null>(null);
    const deleteDialogVisible = ref(false);
    const contractListVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const searchQuery = ref('');
    const filterFullName = ref('');
    const filterNik = ref('');
    const { showError } = useErrorDialog();

    const fetchEmployees = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        // Add filters
        if (searchQuery.value) params.search = searchQuery.value;
        if (filterFullName.value) params.full_name = filterFullName.value;
        if (filterNik.value) params.nik = filterNik.value;
        
        const res = await employeeApi.getAll(params);
        
        // Try multiple response structures
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        employees.value = Array.isArray(data) ? data : [];
        
        // Get total from different possible locations
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? employees.value.length;
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        showError('Gagal mengambil data karyawan');
      } finally {
        loading.value = false;
      }
    };

    const fetchContracts = async () => {
      try {
        const response = await contractEmployeeApi.getAll({ per_page: 1000 });
        contracts.value = response.data.data || response.data || [];
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
      }
    };

    const fetchPlacements = async () => {
      try {
        const response = await placementApi.getAll({ per_page: 1000 });
        placements.value = response.data.data || response.data || [];
      } catch (err: any) {
        console.error('Error fetching placements:', err);
      }
    };

    const getEmployeeContract = (employeeId: string): IContractEmployee | undefined => {
      return contracts.value.find(c => c.employee_id === employeeId);
    };

    const getEmployeeContracts = (employeeId: string): IContractEmployee[] => {
      return contracts.value.filter(c => c.employee_id === employeeId);
    };

    const getContractCount = (employeeId: string): number => {
      return getEmployeeContracts(employeeId).length;
    };

    const getActiveContract = (employeeId: string): IContractEmployee | undefined => {
      const empContracts = getEmployeeContracts(employeeId);
      const today = new Date();
      return empContracts.find(c => {
        const startDate = new Date(c.start_on);
        const endDate = new Date(c.ends_on);
        return today >= startDate && today <= endDate;
      });
    };

    const getActiveContractPeriod = (employeeId: string): string => {
      const contract = getActiveContract(employeeId);
      if (!contract) return '-';
      
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      };
      
      return `${formatDate(contract.start_on)} - ${formatDate(contract.ends_on)}`;
    };

    const filteredContracts = computed(() => {
      if (!selectedEmployee.value?.uuid) return [];
      return getEmployeeContracts(selectedEmployee.value.uuid).sort((a, b) => {
        return new Date(b.start_on).getTime() - new Date(a.start_on).getTime();
      });
    });

    const getPlacementNameById = (placementId: string): string => {
      const placement = placements.value.find(p => p.uuid === placementId);
      return placement ? placement.name : '-';
    };

    const formatContractPeriod = (start: string, end: string): string => {
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      };
      return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const getContractStatusText = (contract: IContractEmployee): string => {
      const today = new Date();
      const startDate = new Date(contract.start_on);
      const endDate = new Date(contract.ends_on);

      if (today < startDate) return 'Belum Mulai';
      if (today > endDate) return 'Selesai';
      return 'Aktif';
    };

    const getContractStatusType = (contract: IContractEmployee): string => {
      const status = getContractStatusText(contract);
      if (status === 'Aktif') return 'success';
      if (status === 'Selesai') return 'info';
      return 'warning';
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value || 0);
    };

    const viewContracts = (employee: IEmployee) => {
      selectedEmployee.value = employee;
      contractListVisible.value = true;
    };

    const getPlacementName = (employeeId: string): string => {
      const contract = getEmployeeContract(employeeId);
      if (!contract) return '-';
      const placement = placements.value.find(p => p.uuid === contract.placement_id);
      return placement ? placement.name : '-';
    };

    const getContractStatus = (employeeId: string): string => {
      const contract = getEmployeeContract(employeeId);
      if (!contract) return 'Belum Ada Kontrak';
      
      const today = new Date();
      const startDate = new Date(contract.start_on);
      const endDate = new Date(contract.ends_on);

      if (today < startDate) return 'Belum Mulai';
      if (today > endDate) return 'Selesai';
      return 'Aktif';
    };

    const getContractStatusType_OLD = (employeeId: string): string => {
      const contract = getEmployeeContract(employeeId);
      if (!contract) return 'info';
      
      const today = new Date();
      const startDate = new Date(contract.start_on);
      const endDate = new Date(contract.ends_on);

      if (today < startDate) return 'warning';
      if (today > endDate) return 'info';
      return 'success';
    };

    const getContractPeriod = (employeeId: string): string => {
      const contract = getEmployeeContract(employeeId);
      if (!contract) return '-';
      
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      };
      
      return `${formatDate(contract.start_on)} - ${formatDate(contract.ends_on)}`;
    };

    const getTHP = (employeeId: string): string => {
      const contract = getEmployeeContract(employeeId);
      if (!contract || !contract.thp) return '-';
      
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(contract.thp);
    };

    const openForm = () => {
      router.push('/employees/create');
    };

    const editEmployee = (employee: IEmployee) => {
      router.push(`/employees/${employee.uuid}/edit`);
    };

    const confirmDelete = (employee: IEmployee) => {
      selectedEmployee.value = employee;
      deleteDialogVisible.value = true;
    };

    const deleteEmployee = async () => {
      if (!selectedEmployee.value?.uuid) return;
      loading.value = true;
      try {
        // Delete contract first if exists
        const contract = getEmployeeContract(selectedEmployee.value.uuid);
        if (contract?.uuid) {
          await contractEmployeeApi.delete(contract.uuid);
        }
        
        // Then delete employee
        await employeeApi.delete(selectedEmployee.value.uuid);
        ElMessage.success('Karyawan dan kontrak berhasil dihapus');
        fetchEmployees();
        fetchContracts();
      } catch (err: any) {
        showError('Gagal menghapus karyawan');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const viewDetail = (employee: IEmployee) => {
      // Could open a detail dialog showing all employee + contract info
      ElMessage.info(`Detail: ${employee.full_name}`);
    };

    const onFilterChange = () => {
      currentPage.value = 1;
      fetchEmployees();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      filterFullName.value = '';
      filterNik.value = '';
      currentPage.value = 1;
      fetchEmployees();
    };

    onMounted(() => {
      fetchEmployees();
      fetchContracts();
      fetchPlacements();
    });

    return {
      employees,
      loading,
      selectedEmployee,
      deleteDialogVisible,
      contractListVisible,
      currentPage,
      pageSize,
      total,
      searchQuery,
      filterFullName,
      filterNik,
      openForm,
      editEmployee,
      confirmDelete,
      deleteEmployee,
      viewDetail,
      onFilterChange,
      resetFilters,
      getContractCount,
      getActiveContract,
      getActiveContractPeriod,
      viewContracts,
      filteredContracts,
      getPlacementNameById,
      formatContractPeriod,
      getContractStatusText,
      getContractStatusType,
      formatCurrency
    };
  }
});
</script>

<style lang="scss" scoped>
.mb-3 {
  margin-bottom: 1rem;
}

.me-1 {
  margin-right: 0.25rem;
}
</style>
