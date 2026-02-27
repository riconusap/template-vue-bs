<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Kontrak Klien</h4>
        <el-button type="primary" @click="openForm()">Tambah Kontrak</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari Kontrak</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari placement atau project type..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="contractClients" style="width: 100%" v-loading="loading">
        <el-table-column label="Placement" width="200">
          <template #default="{ row }">
            {{ getPlacementName(row.placement_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="project_type" label="Jenis Proyek" width="150" />
        <el-table-column label="Nilai Kontrak" width="180">
          <template #default="{ row }">
            {{ formatCurrency(row.contract_value) }}
          </template>
        </el-table-column>
        <el-table-column label="Mulai" width="120">
          <template #default="{ row }">
            {{ formatDate(row.start_on) }}
          </template>
        </el-table-column>
        <el-table-column label="Berakhir" width="120">
          <template #default="{ row }">
            {{ formatDate(row.ends_on) }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="editContract(row)">Edit</el-button>
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
          @change="fetchContracts"
        />
      </div>
    </el-card>
    <contract-client-form 
      v-if="formVisible" 
      :contract="selectedContract" 
      :placements="placements"
      @close="closeForm" 
      @saved="handleSaved" 
    />
    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus kontrak untuk placement <b>{{ getPlacementName(selectedContract?.placement_id) }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deleteContract">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { contractClientApi, IContractClient, placementApi, IPlacement } from '@/services/api';
import { ElMessage } from 'element-plus';
import ContractClientForm from './ContractClientForm.vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ContractClientsView',
  components: { ContractClientForm },
  setup() {
    const contractClients = ref<IContractClient[]>([]);
    const placements = ref<IPlacement[]>([]);
    const loading = ref(false);
    const formVisible = ref(false);
    const selectedContract = ref<IContractClient | null>(null);
    const deleteDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const searchQuery = ref('');
    const { showError } = useErrorDialog();

    const fetchPlacements = async () => {
      try {
        const res = await placementApi.getAll();
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        placements.value = Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error('Error fetching placements:', err);
      }
    };

    const fetchContracts = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        if (searchQuery.value) params.search = searchQuery.value;
        
        const res = await contractClientApi.getAll(params);
        console.log('Contracts response:', res);
        
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        contractClients.value = Array.isArray(data) ? data : [];
        
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? contractClients.value.length;
        
        console.log('Contract Clients:', contractClients.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
        showError('Gagal mengambil data kontrak');
      } finally {
        loading.value = false;
      }
    };

    const getPlacementName = (placement_id: string): string => {
      const placement = placements.value.find(p => p.uuid === placement_id);
      return placement?.name || '-';
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

    const getStatus = (contract: IContractClient): string => {
      const today = new Date();
      const endDate = new Date(contract.ends_on);
      const startDate = new Date(contract.start_on);
      
      if (today < startDate) return 'Belum Mulai';
      if (today > endDate) return 'Selesai';
      return 'Aktif';
    };

    const getStatusType = (contract: IContractClient): string => {
      const status = getStatus(contract);
      if (status === 'Aktif') return 'success';
      if (status === 'Selesai') return 'info';
      return 'warning';
    };

    const openForm = () => {
      selectedContract.value = null;
      formVisible.value = true;
    };

    const editContract = (contract: IContractClient) => {
      selectedContract.value = { ...contract };
      formVisible.value = true;
    };

    const closeForm = () => {
      formVisible.value = false;
      selectedContract.value = null;
    };

    const handleSaved = () => {
      closeForm();
      fetchContracts();
    };

    const confirmDelete = (contract: IContractClient) => {
      selectedContract.value = contract;
      deleteDialogVisible.value = true;
    };

    const deleteContract = async () => {
      if (!selectedContract.value?.uuid) return;
      loading.value = true;
      try {
        await contractClientApi.delete(selectedContract.value.uuid);
        ElMessage.success('Kontrak berhasil dihapus');
        fetchContracts();
      } catch (err: any) {
        showError('Gagal menghapus kontrak');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchContracts();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      fetchContracts();
    };

    onMounted(async () => {
      await fetchPlacements();
      fetchContracts();
    });

    return {
      contractClients,
      placements,
      loading,
      formVisible,
      selectedContract,
      openForm,
      editContract,
      closeForm,
      handleSaved,
      confirmDelete,
      deleteDialogVisible,
      deleteContract,
      getPlacementName,
      formatCurrency,
      formatDate,
      getStatus,
      getStatusType,
      fetchContracts,
      currentPage,
      pageSize,
      total,
      searchQuery,
      onSearch,
      resetFilters
    };
  }
});
</script>

<style lang="scss" scoped>
</style>
