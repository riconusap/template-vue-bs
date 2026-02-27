<template>
  <el-card>
  <div class="container-fluid p-2">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Daftar Karyawan</h4>
        <el-button type="primary" @click="openForm()">Tambah Karyawan</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari Karyawan</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari nama, NIK, atau NIP..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="employees" style="width: 100%" v-loading="loading">
        <el-table-column prop="full_name" label="Nama" />
        <el-table-column prop="nik" label="NIK" />
        <el-table-column prop="nip" label="NIP" />
        <el-table-column label="Aksi">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">Detail</el-button>
            <el-button size="small" type="warning" @click="editEmployee(row)">Edit</el-button>
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
          @change="fetchEmployees"
        />
      </div>
    </el-card>
    <!-- Detail Modal -->
    <el-dialog v-model="detailDialogVisible" :title="`Detail Karyawan: ${selectedEmployee?.full_name}`" width="900px">
      <div v-if="selectedEmployee">
        <el-card class="mb-3">
          <template #header>
            <h6 class="m-0">Informasi Karyawan</h6>
          </template>
          <div class="row">
            <div class="col-md-6">
              <p class="mb-2"><strong>Nama Lengkap:</strong> {{ selectedEmployee.full_name }}</p>
              <p class="mb-2"><strong>NIK:</strong> {{ selectedEmployee.nik }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-2"><strong>Total Kontrak:</strong> {{ employeeContracts.length }}</p>
              <p class="mb-2"><strong>Status:</strong> 
                <el-tag v-if="activeContract" type="success" size="small">Memiliki Kontrak Aktif</el-tag>
                <el-tag v-else type="info" size="small">Tidak Ada Kontrak Aktif</el-tag>
              </p>
            </div>
          </div>
        </el-card>

        <el-card>
          <template #header>
            <h6 class="m-0">Riwayat Kontrak</h6>
          </template>
          <el-table v-if="employeeContracts.length > 0 && !loadingContracts" :data="employeeContracts" border stripe v-loading="loadingContracts" max-height="400">
            <el-table-column label="Placement" width="180">
              <template #default="{ row }">
                {{ getPlacementName(row.placement.uuid) }}
              </template>
            </el-table-column>
            <el-table-column label="Periode" width="220">
              <template #default="{ row }">
                {{ formatPeriod(row.start_on, row.ends_on) }}
              </template>
            </el-table-column>
            <el-table-column label="Durasi" width="100" align="center">
              <template #default="{ row }">
                {{ calculateDuration(row.start_on, row.ends_on) }} hari
              </template>
            </el-table-column>
            <el-table-column label="Status" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="getContractStatus(row).type">{{ getContractStatus(row).text }}</el-tag>
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
          </el-table>
          <el-empty v-if="!employeeContracts.length && !loadingContracts" description="Belum ada kontrak" />
        </el-card>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">Tutup</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus karyawan <b>{{ selectedEmployee?.full_name }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deleteEmployee">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
  </el-card>
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
    const loading = ref(false);
    const selectedEmployee = ref<IEmployee | null>(null);
    const deleteDialogVisible = ref(false);
    const detailDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(5);
    const total = ref(0);
    const searchQuery = ref('');
    const employeeContracts = ref<IContractEmployee[]>([]);
    const placements = ref<IPlacement[]>([]);
    const loadingContracts = ref(false);
    const { showError } = useErrorDialog();

    const fetchEmployees = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        // Add search if exists
        if (searchQuery.value) params.search = searchQuery.value;
        
        const res = await employeeApi.getAll(params);
        // Debug: log response structure
        console.log('Full response:', res);
        console.log('Response data:', res.data);
        
        // Try multiple response structures
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        employees.value = Array.isArray(data) ? data : [];
        
        // Get total from different possible locations
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? employees.value.length;
        
        console.log('Employees:', employees.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        showError('Gagal mengambil data karyawan');
      } finally {
        loading.value = false;
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

    const fetchEmployeeContracts = async (employeeId: string) => {
      loadingContracts.value = true;
      try {
        const response = await contractEmployeeApi.getAll({ 
          employee_id: employeeId,
          per_page: 100,
          sort_by: 'start_on',
          sort_order: 'desc'
        });
        employeeContracts.value = response.data.data || response.data || [];
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
        showError('Gagal mengambil data kontrak');
      } finally {
        loadingContracts.value = false;
      }
    };

    const activeContract = computed(() => {
      const today = new Date();
      return employeeContracts.value.find(c => {
        const startDate = new Date(c.start_on);
        const endDate = new Date(c.ends_on);
        return today >= startDate && today <= endDate;
      });
    });

    const formatPeriod = (start: string, end: string): string => {
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

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value || 0);
    };

    const calculateDuration = (start: string, end: string): number => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diff = endDate.getTime() - startDate.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getContractStatus = (contract: IContractEmployee): { text: string; type: string } => {
      const today = new Date();
      const startDate = new Date(contract.start_on);
      const endDate = new Date(contract.ends_on);

      if (today < startDate) return { text: 'Belum Mulai', type: 'warning' };
      if (today > endDate) return { text: 'Selesai', type: 'info' };
      return { text: 'Aktif', type: 'success' };
    };

    const getPlacementName = (placementId: string): string => {
      const placement = placements.value.find(p => p.uuid === placementId);
      return placement?.name || '-';
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
        await employeeApi.delete(selectedEmployee.value.uuid);
        ElMessage.success('Karyawan berhasil dihapus');
        fetchEmployees();
      } catch (err: any) {
        showError('Gagal menghapus karyawan');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const viewDetail = async (employee: IEmployee) => {
      selectedEmployee.value = employee;
      detailDialogVisible.value = true;
      if (employee.uuid) {
        await fetchEmployeeContracts(employee.uuid);
      }
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchEmployees();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      fetchEmployees();
    };

    onMounted(() => {
      fetchEmployees();
      fetchPlacements();
    });

    return {
      employees,
      loading,
      selectedEmployee,
      openForm,
      editEmployee,
      confirmDelete,
      deleteDialogVisible,
      detailDialogVisible,
      deleteEmployee,
      viewDetail,
      fetchEmployees,
      currentPage,
      pageSize,
      total,
      searchQuery,
      onSearch,
      resetFilters,
      employeeContracts,
      loadingContracts,
      activeContract,
      formatPeriod,
      formatCurrency,
      calculateDuration,
      getContractStatus,
      getPlacementName
    };
  }
});
</script>

<style lang="scss" scoped>
.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.m-0 {
  margin: 0;
}
</style>
