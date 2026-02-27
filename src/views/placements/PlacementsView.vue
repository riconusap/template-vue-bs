<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Daftar Placement</h4>
        <el-button type="primary" @click="openForm()">Tambah Placement</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari Placement</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari nama placement..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="placements" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Nama Placement" width="250" />
        <el-table-column prop="description" label="Deskripsi" />
        <el-table-column label="Client" width="200">
          <template #default="{ row }">
            {{ getClientName(row.client_id) }}
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="200">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="editPlacement(row)">Edit</el-button>
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
          @change="fetchPlacements"
        />
      </div>
    </el-card>
    <placement-form 
      v-if="formVisible" 
      :placement="selectedPlacement" 
      :clients="clients"
      @close="closeForm" 
      @saved="handleSaved" 
    />
    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus placement <b>{{ selectedPlacement?.name }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deletePlacement">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { placementApi, IPlacement, clientApi, IClient } from '@/services/api';
import { ElMessage } from 'element-plus';
import PlacementForm from './PlacementForm.vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'PlacementsView',
  components: { PlacementForm },
  setup() {
    const placements = ref<IPlacement[]>([]);
    const clients = ref<IClient[]>([]);
    const loading = ref(false);
    const formVisible = ref(false);
    const selectedPlacement = ref<IPlacement | null>(null);
    const deleteDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const searchQuery = ref('');
    const { showError } = useErrorDialog();

    const fetchClients = async () => {
      try {
        const res = await clientApi.getAll();
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        clients.value = Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error('Error fetching clients:', err);
      }
    };

    const fetchPlacements = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        if (searchQuery.value) params.search = searchQuery.value;
        
        const res = await placementApi.getAll(params);
        console.log('Placements response:', res);
        
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        placements.value = Array.isArray(data) ? data : [];
        
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? placements.value.length;
        
        console.log('Placements:', placements.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching placements:', err);
        showError('Gagal mengambil data placement');
      } finally {
        loading.value = false;
      }
    };

    const getClientName = (client_id: string): string => {
      const client = clients.value.find(c => c.uuid === client_id);
      return client?.name || '-';
    };

    const openForm = () => {
      selectedPlacement.value = null;
      formVisible.value = true;
    };

    const editPlacement = (placement: IPlacement) => {
      selectedPlacement.value = { ...placement };
      formVisible.value = true;
    };

    const closeForm = () => {
      formVisible.value = false;
      selectedPlacement.value = null;
    };

    const handleSaved = () => {
      closeForm();
      fetchPlacements();
    };

    const confirmDelete = (placement: IPlacement) => {
      selectedPlacement.value = placement;
      deleteDialogVisible.value = true;
    };

    const deletePlacement = async () => {
      if (!selectedPlacement.value?.uuid) return;
      loading.value = true;
      try {
        await placementApi.delete(selectedPlacement.value.uuid);
        ElMessage.success('Placement berhasil dihapus');
        fetchPlacements();
      } catch (err: any) {
        showError('Gagal menghapus placement');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchPlacements();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      fetchPlacements();
    };

    onMounted(async () => {
      await fetchClients();
      fetchPlacements();
    });

    return {
      placements,
      clients,
      loading,
      formVisible,
      selectedPlacement,
      openForm,
      editPlacement,
      closeForm,
      handleSaved,
      confirmDelete,
      deleteDialogVisible,
      deletePlacement,
      getClientName,
      fetchPlacements,
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
