<template>
  <el-card class="document-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <el-icon class="me-2"><FolderOpened /></el-icon>
          <span>Dokumen Karyawan</span>
          <el-badge 
            v-if="documents.length" 
            :value="documents.length" 
            class="ms-2"
            type="primary"
          />
        </div>
        <div class="card-actions" v-if="documents.length">
          <el-button-group>
            <el-button 
              :type="documentView === 'grid' ? 'primary' : ''"
              size="small"
              @click="documentView = 'grid'"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button 
              :type="documentView === 'list' ? 'primary' : ''"
              size="small"
              @click="documentView = 'list'"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </template>

    <!-- Drag & Drop Upload Zone -->
    <div 
      class="upload-zone"
      :class="{ 'is-dragover': isDragOver, 'has-files': selectedFiles.length > 0 }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInputRef"
        type="file" 
        multiple 
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        @change="handleFileChange"
        style="display: none"
      />
      
      <div class="upload-zone-content">
        <div class="upload-icon">
          <el-icon :size="48"><UploadFilled /></el-icon>
        </div>
        <h4 class="upload-title">
          {{ isDragOver ? 'Lepaskan file di sini' : 'Upload Dokumen' }}
        </h4>
        <p class="upload-desc">
          Drag & drop file kesini atau klik untuk browse
        </p>
        <p class="upload-hint">
          <el-icon class="me-1"><InfoFilled /></el-icon>
          Format: PDF, JPG, PNG, DOC, DOCX (Max 5MB per file)
        </p>
      </div>
    </div>

    <!-- Selected Files Preview (Before Upload) -->
    <div v-if="selectedFiles.length > 0" class="selected-files-section mt-4">
      <div class="section-header">
        <h5 class="section-title">
          <el-icon class="me-2"><Clock /></el-icon>Akan Diupload ({{ selectedFiles.length }})
        </h5>
        <el-button size="small" @click="clearSelectedFiles">
          <el-icon class="me-1"><Close /></el-icon>Clear All
        </el-button>
      </div>
      
      <div class="file-preview-grid">
        <div 
          v-for="(item, index) in selectedFiles" 
          :key="index"
          class="file-preview-item"
        >
          <div class="file-preview-icon" :class="getFileTypeClass(item.file.name)">
            <div v-if="isImageFile(item.file.name)" class="image-preview-small">
              <img :src="getFilePreviewUrl(item.file)" :alt="item.file.name" />
            </div>
            <el-icon v-else :size="40">
              <component :is="getFileIcon(item.file.name)" />
            </el-icon>
          </div>
          <div class="file-preview-info">
            <div class="file-name" :title="item.file.name">{{ item.file.name }}</div>
            <div class="file-size">{{ formatFileSize(item.file.size) }}</div>
            <el-select
              v-model="item.descriptionType"
              placeholder="Pilih jenis dokumen *"
              size="small"
              class="mt-2 w-100"
              @click.stop
              @change="handleDescriptionTypeChange(item)"
            >
              <el-option label="KTP" value="KTP" />
              <el-option label="KK" value="KK" />
              <el-option label="Dokumen Lainnya" value="Other" />
            </el-select>
            <el-input
              v-if="item.descriptionType === 'Other'"
              v-model="item.description"
              placeholder="Masukkan deskripsi dokumen *"
              size="small"
              class="mt-2"
              @click.stop
            />
            <div v-if="item.descriptionType && !isFileDescriptionValid(item)" class="error-text mt-1">
              Deskripsi wajib diisi
            </div>
          </div>
          <el-button 
            circle 
            size="small" 
            type="danger"
            @click.stop="removeFile(index)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Uploaded Documents -->
    <div class="uploaded-documents-section mt-4">
      <div class="section-header">
        <h5 class="section-title">
          <el-icon class="me-2"><CircleCheck /></el-icon>Dokumen Tersimpan
        </h5>
        <el-input
          v-if="documents.length > 0"
          v-model="searchQuery"
          placeholder="Cari dokumen..."
          size="small"
          style="width: 250px"
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- Empty State -->
      <div v-if="!loading && documents.length === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon :size="64"><FolderOpened /></el-icon>
        </div>
        <h4 class="empty-title">Belum Ada Dokumen</h4>
        <p class="empty-desc">
          Upload dokumen pertama untuk melengkapi data karyawan
        </p>
      </div>

      <!-- Grid View -->
      <div 
        v-else-if="documentView === 'grid'" 
        class="documents-grid"
        v-loading="loading"
      >
        <div 
          v-for="doc in filteredDocuments" 
          :key="doc.uuid"
          class="document-card"
        >
          <div class="doc-icon" :class="getFileTypeClass(doc.filename)">
            <div v-if="isImageFile(doc.filename) && doc.url" class="image-preview">
              <img :src="doc.url" :alt="doc.filename" @error="handleImageError" />
              <div class="preview-overlay">
                <el-button circle type="primary" size="large" @click="$emit('preview', doc)">
                  <el-icon :size="24"><View /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else class="file-icon-container">
              <el-icon :size="48">
                <component :is="getFileIcon(doc.filename)" />
              </el-icon>
              <div class="preview-overlay">
                <el-button circle type="primary" size="large" @click="$emit('preview', doc)">
                  <el-icon :size="24"><View /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="doc-info">
            <div class="doc-name" :title="doc.filename">{{ doc.filename }}</div>
            <div v-if="doc.description" class="doc-description">{{ doc.description }}</div>
            <div class="doc-meta">
              <span>{{ formatFileSize(doc.size || 0) }}</span>
              <span class="meta-separator">•</span>
              <span>{{ formatDate(doc.created_at) }}</span>
            </div>
          </div>
          <div class="doc-actions">
            <el-button 
              circle 
              size="small"
              :loading="loadingActions[doc.uuid]"
              @click="$emit('download', doc)"
              title="Download"
            >
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button 
              circle 
              size="small"
              type="danger"
              :loading="loadingActions[doc.uuid]"
              @click="$emit('delete', doc)"
              title="Hapus"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <el-table 
        v-else
        :data="filteredDocuments" 
        v-loading="loading"
        style="width: 100%"
        class="documents-table"
      >
        <el-table-column label="Nama File" min-width="300">
          <template #default="{ row }">
            <div 
              class="file-name-cell" 
              @click="$emit('preview', row)"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center">
                <div class="file-icon-sm" :class="getFileTypeClass(row.filename)">
                  <el-icon :size="32">
                    <component :is="getFileIcon(row.filename)" />
                  </el-icon>
                </div>
                <div class="ms-2">
                  <div>{{ row.filename }}</div>
                  <div v-if="row.description" class="file-description-table">{{ row.description }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Ukuran" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size || 0) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Tanggal Upload" width="150">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Aksi" width="140" align="center">
          <template #default="{ row }">
            <el-button 
              size="small"
              :loading="loadingActions[row.uuid]"
              @click="$emit('download', row)"
            >
              <el-icon class="me-1"><Download /></el-icon>
            </el-button>
            <el-button 
              size="small"
              type="danger"
              :loading="loadingActions[row.uuid]"
              @click="$emit('delete', row)"
            >
              <el-icon class="me-1"><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  FolderOpened, Grid, List, UploadFilled, InfoFilled, 
  Clock, CircleCheck, View, Download, Delete, Document, 
  Picture, Close 
} from '@element-plus/icons-vue';
import { IEmployeeDocument } from '@/services/api';

interface SelectedFile {
  file: File;
  description: string;
  descriptionType: 'KTP' | 'KK' | 'Other' | '';
  previewUrl?: string;
}

const FILE_SIZE_MAX = 5 * 1024 * 1024; // 5MB

export default defineComponent({
  name: 'EmployeeDocuments',
  components: {
    FolderOpened, Grid, List, UploadFilled, InfoFilled,
    Clock, CircleCheck, View, Download, Delete, Document,
    Picture, Close
  },
  props: {
    documents: {
      type: Array as PropType<IEmployeeDocument[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingActions: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    }
  },
  emits: ['update:selectedFiles', 'preview', 'download', 'delete'],
  setup(props, { emit, expose }) {
    const fileInputRef = ref<HTMLInputElement>();
    const selectedFiles = ref<SelectedFile[]>([]);
    const isDragOver = ref(false);
    const documentView = ref<'grid' | 'list'>('grid');
    const searchQuery = ref('');

    const triggerFileInput = () => {
      fileInputRef.value?.click();
    };

    const validateFile = (file: File): { valid: boolean; error?: string } => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        return {
          valid: false,
          error: 'Tipe file tidak valid. Hanya PDF, JPG, PNG, DOC, DOCX yang diperbolehkan.'
        };
      }
      
      if (file.size > FILE_SIZE_MAX) {
        return {
          valid: false,
          error: `Ukuran file melebihi 5MB. Ukuran saat ini: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        };
      }
      
      return { valid: true };
    };

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;
      
      const files = Array.from(target.files);
      const validFiles: SelectedFile[] = [];
      
      for (const file of files) {
        const validation = validateFile(file);
        if (validation.valid) {
          const previewUrl = URL.createObjectURL(file);
          validFiles.push({ file, description: '', descriptionType: '', previewUrl });
        } else {
          ElMessage.error(`${file.name}: ${validation.error}`);
        }
      }
      
      selectedFiles.value = [...selectedFiles.value, ...validFiles];
      emit('update:selectedFiles', selectedFiles.value);
      target.value = '';
    };

    const handleDrop = (event: DragEvent) => {
      isDragOver.value = false;
      
      if (!event.dataTransfer?.files) return;
      
      const files = Array.from(event.dataTransfer.files);
      const validFiles: SelectedFile[] = [];
      
      for (const file of files) {
        const validation = validateFile(file);
        if (validation.valid) {
          const previewUrl = URL.createObjectURL(file);
          validFiles.push({ file, description: '', descriptionType: '', previewUrl });
        } else {
          ElMessage.error(`${file.name}: ${validation.error}`);
        }
      }
      
      selectedFiles.value = [...selectedFiles.value, ...validFiles];
      emit('update:selectedFiles', selectedFiles.value);
    };

    const removeFile = (index: number) => {
      const removed = selectedFiles.value[index];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
      emit('update:selectedFiles', selectedFiles.value);
    };

    const clearSelectedFiles = () => {
      selectedFiles.value.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      selectedFiles.value = [];
      emit('update:selectedFiles', selectedFiles.value);
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const getFileTypeClass = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'file-pdf';
      if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'file-image';
      if (['doc', 'docx'].includes(ext || '')) return 'file-word';
      return 'file-generic';
    };

    const getFileIcon = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'Document';
      if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'Picture';
      if (['doc', 'docx'].includes(ext || '')) return 'Document';
      return 'Document';
    };

    const isImageFile = (filename: string): boolean => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png'].includes(ext || '');
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      if (img.parentElement) {
        img.parentElement.style.display = 'none';
      }
    };

    const getFilePreviewUrl = (file: File): string => {
      return URL.createObjectURL(file);
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

    const filteredDocuments = computed(() => {
      if (!searchQuery.value) return props.documents;
      
      const query = searchQuery.value.toLowerCase();
      return props.documents.filter(doc => 
        doc.filename.toLowerCase().includes(query)
      );
    });

    const handleDescriptionTypeChange = (item: SelectedFile) => {
      if (item.descriptionType === 'KTP') {
        item.description = 'KTP';
      } else if (item.descriptionType === 'KK') {
        item.description = 'KK';
      } else if (item.descriptionType === 'Other') {
        item.description = '';
      }
      emit('update:selectedFiles', selectedFiles.value);
    };

    const isFileDescriptionValid = (item: SelectedFile): boolean => {
      if (!item.descriptionType) return false;
      if (item.descriptionType === 'Other') {
        return item.description.trim().length > 0;
      }
      return true;
    };

    const hasInvalidFiles = computed(() => {
      return selectedFiles.value.some(item => !isFileDescriptionValid(item));
    });

    // Cleanup on unmount
    onBeforeUnmount(() => {
      selectedFiles.value.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    });

    // Expose methods and data for parent component
    expose({
      selectedFiles,
      clearSelectedFiles
    });

    return {
      fileInputRef,
      selectedFiles,
      isDragOver,
      documentView,
      searchQuery,
      triggerFileInput,
      handleFileChange,
      handleDrop,
      removeFile,
      clearSelectedFiles,
      formatFileSize,
      getFileTypeClass,
      getFileIcon,
      isImageFile,
      handleImageError,
      getFilePreviewUrl,
      formatDate,
      filteredDocuments,
      handleDescriptionTypeChange,
      isFileDescriptionValid,
      hasInvalidFiles
    };
  }
});
</script>

<style lang="scss" scoped>
@import './document-styles.scss';

// Additional styles for description validation
.w-100 {
  width: 100%;
}

.error-text {
  color: #f56c6c;
  font-size: 0.75rem;
  line-height: 1.2;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

// Override select to make it full width
:deep(.el-select) {
  width: 100%;
}
</style>
