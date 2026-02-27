<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Daftar Klien</h4>
        <el-button type="primary" @click="openForm()">Tambah Klien</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari Klien</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari nama, email, atau phone..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="clients" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Nama Klien" />
        <el-table-column prop="phone" label="Telepon" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="pic_name" label="PIC" />
        <el-table-column label="Aksi" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">Detail</el-button>
            <el-button size="small" type="warning" @click="editClient(row)">Edit</el-button>
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
          @change="fetchClients"
        />
      </div>
    </el-card>
    <client-form v-if="formVisible" :client="selectedClient" @close="closeForm" @saved="fetchClients" />
    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus klien <b>{{ selectedClient?.name }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deleteClient">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { clientApi, IClient } from '@/services/api';
import { ElMessage } from 'element-plus';
import ClientForm from './ClientForm.vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'ClientsView',
  components: { ClientForm },
  setup() {
    const clients = ref<IClient[]>([]);
    const loading = ref(false);
    const formVisible = ref(false);
    const selectedClient = ref<IClient | null>(null);
    const deleteDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(5);
    const total = ref(0);
    const searchQuery = ref('');
    const { showError } = useErrorDialog();

    const fetchClients = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        if (searchQuery.value) params.search = searchQuery.value;
        
        const res = await clientApi.getAll(params);
        console.log('Clients response:', res);
        
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        clients.value = Array.isArray(data) ? data : [];
        
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? clients.value.length;
        
        console.log('Clients:', clients.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        showError('Gagal mengambil data klien');
      } finally {
        loading.value = false;
      }
    };

    const openForm = () => {
      selectedClient.value = null;
      formVisible.value = true;
    };

    const editClient = (client: IClient) => {
      selectedClient.value = { ...client };
      formVisible.value = true;
    };

    const closeForm = () => {
      formVisible.value = false;
      selectedClient.value = null;
    };

    const confirmDelete = (client: IClient) => {
      selectedClient.value = client;
      deleteDialogVisible.value = true;
    };

    const deleteClient = async () => {
      if (!selectedClient.value?.uuid) return;
      loading.value = true;
      try {
        await clientApi.delete(selectedClient.value.uuid);
        ElMessage.success('Klien berhasil dihapus');
        fetchClients();
      } catch (err: any) {
        showError('Gagal menghapus klien');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const viewDetail = (client: IClient) => {
      ElMessage.info(`Detail: ${client.name}`);
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchClients();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      fetchClients();
    };

    onMounted(fetchClients);

    return {
      clients,
      loading,
      formVisible,
      selectedClient,
      openForm,
      editClient,
      closeForm,
      confirmDelete,
      deleteDialogVisible,
      deleteClient,
      viewDetail,
      fetchClients,
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
