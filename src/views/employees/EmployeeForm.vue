<template>
  <div class="sticky-header mb-4" :class="{ 'is-sticky': isHeaderSticky }">
    <div class="header-content">
      <div class="header-actions">
        <el-button @click="handleCancel">
          <el-icon class="me-2"><Close /></el-icon>Batal
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          <el-icon class="me-2"><Check /></el-icon>{{ isEditMode ? 'Simpan Perubahan' : 'Simpan' }}
        </el-button>
      </div>
    </div>
  </div>

  <div class="employee-form-container" :style="{ maxHeight: '75vh', overflowY: 'auto' }">
    <!-- Main Content -->
    <div class="content-wrapper d-flex flex-column gap-4">
      <!-- Card 1: Informasi Dasar -->
      <EmployeeBasicInfo 
        ref="basicInfoRef"
        v-model="employeeForm"
        :is-edit-mode="isEditMode"
      />

      <!-- Card 2: Dokumen Karyawan -->
      <EmployeeDocuments 
        ref="documentsRef"
        :documents="documents"
        :loading="loadingDocuments"
        :loading-actions="loadingDocumentActions"
        @update:selected-files="selectedFiles = $event"
        @preview="previewDocument"
        @download="downloadDocument"
        @delete="deleteDocument"
      />

      <!-- Card 3: Kontrak Karyawan -->
      <EmployeeContracts 
        v-if="isEditMode"
        :contracts="contracts"
        :placements="placements"
        :loading="loadingContracts"
        @add="handleAddContract"
        @edit="handleEditContract"
        @delete="handleDeleteContract"
      />

      <!-- Info Alert for New Employee -->
      <el-alert 
        v-else
        type="info" 
        :closable="false"
        class="info-alert"
      >
        <template #title>
          <el-icon class="me-2"><InfoFilled /></el-icon>Informasi
        </template>
        <p class="mb-0">
          Simpan data karyawan terlebih dahulu untuk dapat menambahkan kontrak dan dokumen.
        </p>
      </el-alert>
    </div>

    <!-- Contract Form Modal -->
    <ContractForm
      v-if="showContractForm"
      :contract="selectedContract"
      :employee-id="employeeId"
      @close="showContractForm = false"
      @saved="handleContractSaved"
    />

    <!-- Document Preview Modal -->
    <el-dialog
      v-model="previewModalVisible"
      title="Preview Dokumen"
      width="80%"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="preview-modal-content" v-if="selectedPreviewDoc">
        <div class="preview-header mb-3">
          <h5>{{ selectedPreviewDoc.filename }}</h5>
          <p v-if="selectedPreviewDoc.description" class="doc-description-modal">{{ selectedPreviewDoc.description }}</p>
          <p class="text-muted mb-0">{{ formatFileSize(selectedPreviewDoc.size || 0) }} • {{ formatDate(selectedPreviewDoc.created_at) }}</p>
        </div>
        <div class="preview-body" v-loading="loadingPreview">
          <img 
            v-if="isImageFile(selectedPreviewDoc.filename) && previewUrl" 
            :src="previewUrl" 
            :alt="selectedPreviewDoc.filename"
            class="preview-image"
          />
          <iframe 
            v-else-if="previewUrl"
            :src="previewUrl"
            class="preview-iframe"
          ></iframe>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewModalVisible = false">Tutup</el-button>
        <el-button 
          v-if="selectedPreviewDoc" 
          type="primary" 
          @click="downloadDocument(selectedPreviewDoc)"
        >
          <el-icon class="me-1"><Download /></el-icon>Download
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { employeeApi, contractEmployeeApi, placementApi, IEmployee, IEmployeeDocument, IContractEmployee, IPlacement } from '@/services/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Close, Check, InfoFilled } from '@element-plus/icons-vue';
import { useErrorDialog } from '@/composables/useErrorDialog';
import ContractForm from './ContractForm.vue';
import EmployeeBasicInfo from './components/EmployeeBasicInfo.vue';
import EmployeeDocuments from './components/EmployeeDocuments.vue';
import EmployeeContracts from './components/EmployeeContracts.vue';

interface SelectedFile {
  file: File;
  description: string;
  descriptionType: 'KTP' | 'KK' | 'Other' | '';
}

export default defineComponent({
  name: 'EmployeeForm',
  components: {
    ContractForm,
    EmployeeBasicInfo,
    EmployeeDocuments,
    EmployeeContracts,
    Close,
    Check,
    InfoFilled
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const loadingContracts = ref(false);
    const basicInfoRef = ref();
    const documentsRef = ref();
    const { showError } = useErrorDialog();
    
    const placements = ref<IPlacement[]>([]);
    const contracts = ref<IContractEmployee[]>([]);
    const showContractForm = ref(false);
    const selectedContract = ref<IContractEmployee | null>(null);
    
    const selectedFiles = ref<SelectedFile[]>([]);
    const documents = ref<IEmployeeDocument[]>([]);
    const loadingDocuments = ref(false);
    const loadingDocumentActions = ref<Record<string, boolean>>({});
    
    const isHeaderSticky = ref(true);
    const previewModalVisible = ref(false);
    const selectedPreviewDoc = ref<IEmployeeDocument | null>(null);
    const previewUrl = ref('');
    const loadingPreview = ref(false);

    const employeeId = computed(() => route.params.id as string);
    const isEditMode = computed(() => !!employeeId.value);

    const employeeForm = ref<IEmployee>({
      full_name: '',
      nik: ''
    });

    const buildFormData = (): FormData => {
      const formData = new FormData();
      formData.append('full_name', employeeForm.value.full_name);
      formData.append('nik', employeeForm.value.nik);
      if (employeeForm.value.nip) {
        formData.append('nip', employeeForm.value.nip);
      }
      
      selectedFiles.value.forEach((item) => {
        formData.append('documents[]', item.file);
        if (item.description) {
          formData.append('document_descriptions[]', item.description);
        }
      });
      
      return formData;
    };

    const fetchPlacements = async () => {
      try {
        const response = await placementApi.getAll({ per_page: 1000 });
        placements.value = response.data.data || response.data;
      } catch (err: any) {
        console.error('Error fetching placements:', err);
      }
    };

    const fetchContracts = async (empId: string) => {
      loadingContracts.value = true;
      try {
        const response = await contractEmployeeApi.getAll({ 
          employee_id: empId,
          per_page: 100,
          sort_by: 'start_on',
          sort_order: 'desc'
        });
        contracts.value = response.data.data || response.data;
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
      } finally {
        loadingContracts.value = false;
      }
    };

    const handleCancel = () => {
      router.push('/employees');
    };

    const handleSubmit = async () => {
      if (!basicInfoRef.value) return;
      const valid = await basicInfoRef.value.validate();
      if (!valid) return;

      // Validate selected files have descriptions
      if (selectedFiles.value.length > 0) {
        const invalidFiles = selectedFiles.value.filter(item => {
          if (!item.descriptionType) return true;
          if (item.descriptionType === 'Other' && !item.description.trim()) return true;
          return false;
        });

        if (invalidFiles.length > 0) {
          ElMessage.error('Mohon lengkapi jenis dokumen untuk semua file yang akan diupload');
          return;
        }
      }

      loading.value = true;
      try {
        if (isEditMode.value) {
          if (selectedFiles.value.length > 0) {
            await employeeApi.update(employeeId.value, buildFormData());
            documentsRef.value?.clearSelectedFiles();
            await fetchDocuments();
          } else {
            await employeeApi.update(employeeId.value, employeeForm.value);
          }
          ElMessage.success('Data karyawan berhasil diupdate');
        } else {
          const response = selectedFiles.value.length > 0
            ? await employeeApi.create(buildFormData())
            : await employeeApi.create(employeeForm.value);
            
          const newEmployeeId = response.data.data?.employee?.uuid || 
                                response.data.data?.uuid || 
                                response.data.uuid;
          ElMessage.success('Karyawan berhasil ditambahkan');
          router.push(`/employees/${newEmployeeId}/edit`);
          return;
        }
      } catch (err: any) {
        console.error('Error saving data:', err);
        showError(err.response?.data?.message || 'Gagal menyimpan data');
      } finally {
        loading.value = false;
      }
    };

    const handleAddContract = () => {
      selectedContract.value = null;
      showContractForm.value = true;
    };

    const handleEditContract = (contract: IContractEmployee) => {
      selectedContract.value = contract;
      showContractForm.value = true;
    };

    const handleDeleteContract = async (contract: IContractEmployee) => {
      try {
        await ElMessageBox.confirm(
          'Apakah Anda yakin ingin menghapus kontrak ini?',
          'Konfirmasi',
          {
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            type: 'warning'
          }
        );

        await contractEmployeeApi.delete(contract.uuid!);
        ElMessage.success('Kontrak berhasil dihapus');
        
        if (employeeId.value) {
          await fetchContracts(employeeId.value);
        }
      } catch (err: any) {
        if (err !== 'cancel') {
          console.error('Error deleting contract:', err);
          showError(err.response?.data?.message || 'Gagal menghapus kontrak');
        }
      }
    };

    const handleContractSaved = async () => {
      if (employeeId.value) {
        await fetchContracts(employeeId.value);
      }
    };

    const fetchDocuments = async () => {
      if (!employeeId.value) return;
      
      loadingDocuments.value = true;
      try {
        const response = await employeeApi.getById(employeeId.value);
        const employeeData = response.data.data || response.data;
        const docs = employeeData.employee_documents || [];
        
        documents.value = await Promise.all(
          docs.map(async (doc: IEmployeeDocument) => {
            if (isImageFile(doc.filename) && !doc.url) {
              try {
                const previewResponse = await employeeApi.previewDocument(employeeId.value, doc.uuid);
                const previewData = previewResponse.data.data;
                return { ...doc, url: previewData.url };
              } catch (err) {
                console.error('Error fetching preview for', doc.filename, err);
                return doc;
              }
            }
            return doc;
          })
        );
        
        employeeForm.value = employeeData;
      } catch (err: any) {
        console.error('Error fetching documents:', err);
      } finally {
        loadingDocuments.value = false;
      }
    };

    const isImageFile = (filename: string): boolean => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png'].includes(ext || '');
    };

    const previewDocument = async (doc: IEmployeeDocument) => {
      if (!employeeId.value) return;
      
      selectedPreviewDoc.value = doc;
      previewModalVisible.value = true;
      loadingPreview.value = true;
      
      try {
        const response = await employeeApi.previewDocument(employeeId.value, doc.uuid);
        const docData = response.data.data;
        previewUrl.value = docData.url;
      } catch (err: any) {
        console.error('Error previewing document:', err);
        showError('Gagal membuka preview dokumen');
        previewModalVisible.value = false;
      } finally {
        loadingPreview.value = false;
      }
    };

    const downloadDocument = async (doc: IEmployeeDocument) => {
      if (!employeeId.value) return;
      
      loadingDocumentActions.value[doc.uuid] = true;
      try {
        const response = await employeeApi.downloadDocument(employeeId.value, doc.uuid);
        
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        ElMessage.success('Dokumen berhasil diunduh');
      } catch (err: any) {
        console.error('Error downloading document:', err);
        showError('Gagal mengunduh dokumen');
      } finally {
        loadingDocumentActions.value[doc.uuid] = false;
      }
    };

    const deleteDocument = async (doc: IEmployeeDocument) => {
      if (!employeeId.value) return;
      
      try {
        await ElMessageBox.confirm(
          `Apakah Anda yakin ingin menghapus dokumen "${doc.filename}"?`,
          'Konfirmasi Hapus',
          {
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            type: 'warning'
          }
        );

        loadingDocumentActions.value[doc.uuid] = true;
        await employeeApi.deleteDocument(employeeId.value, doc.uuid);
        ElMessage.success('Dokumen berhasil dihapus');
        
        await fetchDocuments();
      } catch (err: any) {
        if (err !== 'cancel') {
          console.error('Error deleting document:', err);
          showError('Gagal menghapus dokumen');
        }
      } finally {
        loadingDocumentActions.value[doc.uuid] = false;
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string): string => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(async () => {
      await fetchPlacements();
      if (isEditMode.value) {
        await fetchContracts(employeeId.value);
        await fetchDocuments();
      }
    });

    return {
      loading,
      loadingContracts,
      employeeForm,
      basicInfoRef,
      documentsRef,
      placements,
      contracts,
      showContractForm,
      selectedContract,
      isEditMode,
      employeeId,
      handleCancel,
      handleSubmit,
      handleAddContract,
      handleEditContract,
      handleDeleteContract,
      handleContractSaved,
      selectedFiles,
      documents,
      loadingDocuments,
      loadingDocumentActions,
      previewDocument,
      downloadDocument,
      deleteDocument,
      isHeaderSticky,
      previewModalVisible,
      selectedPreviewDoc,
      previewUrl,
      loadingPreview,
      isImageFile,
      formatFileSize,
      formatDate
    };
  }
});
</script>

<style lang="scss" scoped>
// Sticky Header
.sticky-header {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &.is-sticky {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  .header-content {
    .header-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
  }
}

// Container
.employee-form-container {
  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

// Info Alert styling
.info-alert {
  border-radius: 10px;
  
  :deep(.el-alert__content) {
    display: flex;
    align-items: center;
  }
}

// Preview Modal
.preview-modal-content {
  .preview-header {
    h5 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }
    
    .doc-description-modal {
      font-size: 0.95rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }
    
    .text-muted {
      color: #6b7280;
      font-size: 0.9rem;
    }
  }
  
  .preview-body {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    border-radius: 8px;
    overflow: hidden;
    
    .preview-image {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }
    
    .preview-iframe {
      width: 100%;
      height: 70vh;
      border: none;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .sticky-header {
    .header-actions {
      flex-direction: column;
      
      :deep(.el-button) {
        width: 100%;
      }
    }
  }
}
</style>
