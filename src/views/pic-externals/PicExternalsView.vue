<template>
  <div class="container-fluid p-4">
    <div class="row mb-3">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h4 class="m-0">Daftar PIC Eksternal</h4>
        <el-button type="primary" @click="openForm()">Tambah PIC</el-button>
      </div>
    </div>
    <el-card class="mb-3">
      <div class="d-flex gap-2 align-items-end">
        <div class="flex-grow-1">
          <label class="form-label mb-2" style="display: block">Cari PIC</label>
          <el-input 
            v-model="searchQuery" 
            placeholder="Cari nama, email, atau position..."
            @keyup.enter="onSearch"
          />
        </div>
        <el-button type="primary" @click="onSearch">Cari</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>
    </el-card>
    <el-card>
      <el-table :data="picExternals" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Nama" />
        <el-table-column prop="position" label="Posisi" />
        <el-table-column prop="phone" label="Telepon" />
        <el-table-column prop="email" label="Email" />
        <el-table-column label="Aksi" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">Detail</el-button>
            <el-button size="small" type="warning" @click="editPic(row)">Edit</el-button>
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
          @change="fetchPicExternals"
        />
      </div>
    </el-card>
    <pic-external-form v-if="formVisible" :pic="selectedPic" @close="closeForm" @saved="fetchPicExternals" />
    <el-dialog v-model="deleteDialogVisible" title="Konfirmasi Hapus" width="400px" center>
      <div class="text-center">
        <p>Yakin ingin menghapus PIC <b>{{ selectedPic?.name }}</b>?</p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">Batal</el-button>
        <el-button type="danger" @click="deletePic">Hapus</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { picExternalApi, IPicExternal } from '@/services/api';
import { ElMessage } from 'element-plus';
import PicExternalForm from './PicExternalForm.vue';
import { useErrorDialog } from '@/composables/useErrorDialog';

export default defineComponent({
  name: 'PicExternalsView',
  components: { PicExternalForm },
  setup() {
    const picExternals = ref<IPicExternal[]>([]);
    const loading = ref(false);
    const formVisible = ref(false);
    const selectedPic = ref<IPicExternal | null>(null);
    const deleteDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(5);
    const total = ref(0);
    const searchQuery = ref('');
    const { showError } = useErrorDialog();

    const fetchPicExternals = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: currentPage.value,
          per_page: pageSize.value
        };
        
        if (searchQuery.value) params.search = searchQuery.value;
        
        const res = await picExternalApi.getAll(params);
        console.log('PIC Externals response:', res);
        
        let data = res.data?.data || res.data;
        if (data?.data) {
          data = data.data;
        }
        
        picExternals.value = Array.isArray(data) ? data : [];
        
        const paginationInfo = res.data?.pagination || res.data?.meta || {};
        total.value = paginationInfo?.total ?? picExternals.value.length;
        
        console.log('PIC Externals:', picExternals.value);
        console.log('Total:', total.value);
      } catch (err: any) {
        console.error('Error fetching PIC externals:', err);
        showError('Gagal mengambil data PIC eksternal');
      } finally {
        loading.value = false;
      }
    };

    const openForm = () => {
      selectedPic.value = null;
      formVisible.value = true;
    };

    const editPic = (pic: IPicExternal) => {
      selectedPic.value = { ...pic };
      formVisible.value = true;
    };

    const closeForm = () => {
      formVisible.value = false;
      selectedPic.value = null;
    };

    const confirmDelete = (pic: IPicExternal) => {
      selectedPic.value = pic;
      deleteDialogVisible.value = true;
    };

    const deletePic = async () => {
      if (!selectedPic.value?.uuid) return;
      loading.value = true;
      try {
        await picExternalApi.delete(selectedPic.value.uuid);
        ElMessage.success('PIC eksternal berhasil dihapus');
        fetchPicExternals();
      } catch (err: any) {
        showError('Gagal menghapus PIC eksternal');
      } finally {
        loading.value = false;
        deleteDialogVisible.value = false;
      }
    };

    const viewDetail = (pic: IPicExternal) => {
      ElMessage.info(`Detail: ${pic.name}`);
    };

    const onSearch = () => {
      currentPage.value = 1;
      fetchPicExternals();
    };

    const resetFilters = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      fetchPicExternals();
    };

    onMounted(fetchPicExternals);

    return {
      picExternals,
      loading,
      formVisible,
      selectedPic,
      openForm,
      editPic,
      closeForm,
      confirmDelete,
      deleteDialogVisible,
      deletePic,
      viewDetail,
      fetchPicExternals,
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
