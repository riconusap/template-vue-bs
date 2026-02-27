<template>
  <el-card class="contract-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <el-icon class="me-2"><Document /></el-icon>
          <span>Kontrak Karyawan</span>
          <el-badge 
            v-if="contracts.length" 
            :value="contracts.length" 
            class="ms-2"
            type="success"
          />
        </div>
        <el-button type="primary" size="small" @click="$emit('add')">
          <el-icon class="me-2"><Plus /></el-icon>Tambah Kontrak
        </el-button>
      </div>
    </template>

    <!-- Empty State -->
    <div v-if="!loading && contracts.length === 0" class="empty-state">
      <div class="empty-icon">
        <el-icon :size="64"><Document /></el-icon>
      </div>
      <h4 class="empty-title">Belum Ada Kontrak</h4>
      <p class="empty-desc">
        Tambahkan kontrak pertama untuk karyawan ini
      </p>
      <el-button type="primary" @click="$emit('add')">
        <el-icon class="me-2"><Plus /></el-icon>Tambah Kontrak
      </el-button>
    </div>

    <!-- Contracts Timeline View -->
    <div v-else class="contracts-timeline" v-loading="loading">
      <div 
        v-for="(contract, index) in contracts" 
        :key="contract.uuid"
        class="timeline-item"
        :class="'status-' + getStatus(contract).toLowerCase().replace(' ', '-')"
      >
        <div class="timeline-marker">
          <div class="marker-dot"></div>
          <div v-if="index < contracts.length - 1" class="marker-line"></div>
        </div>
        <div class="timeline-content">
          <div class="contract-header">
            <div class="contract-info">
              <h5 class="contract-placement">
                {{ getPlacementName(contract.placement_id) }}
              </h5>
              <div class="contract-meta">
                <span class="meta-item">
                  <el-icon class="me-1"><Calendar /></el-icon>
                  {{ formatPeriod(contract.start_on, contract.ends_on) }}
                </span>
                <span class="meta-item">
                  <el-icon class="me-1"><Coin /></el-icon>
                  {{ formatCurrency(contract.thp) }}
                </span>
              </div>
            </div>
            <div class="contract-status">
              <el-tag :type="getStatusType(contract)" size="large">
                {{ getStatus(contract) }}
              </el-tag>
            </div>
          </div>
          <div class="contract-actions">
            <el-button size="small" @click="$emit('edit', contract)">
              <el-icon class="me-1"><Edit /></el-icon>Edit
            </el-button>
            <el-button size="small" type="danger" @click="$emit('delete', contract)">
              <el-icon class="me-1"><Delete /></el-icon>Hapus
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Document, Plus, Calendar, Coin, Edit, Delete } from '@element-plus/icons-vue';
import { IContractEmployee, IPlacement } from '@/services/api';

export default defineComponent({
  name: 'EmployeeContracts',
  components: {
    Document,
    Plus,
    Calendar,
    Coin,
    Edit,
    Delete
  },
  props: {
    contracts: {
      type: Array as PropType<IContractEmployee[]>,
      default: () => []
    },
    placements: {
      type: Array as PropType<IPlacement[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add', 'edit', 'delete'],
  setup(props) {
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    };

    const formatPeriod = (start: string, end: string): string => {
      if (!start || !end) return '-';
      const startDate = new Date(start);
      const endDate = new Date(end);
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      };
      return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
    };

    const getStatus = (contract: IContractEmployee): string => {
      const today = new Date();
      const startDate = new Date(contract.start_on);
      const endDate = new Date(contract.ends_on);
      
      if (today < startDate) return 'Belum Mulai';
      if (today > endDate) return 'Selesai';
      return 'Aktif';
    };

    const getStatusType = (contract: IContractEmployee): string => {
      const status = getStatus(contract);
      if (status === 'Aktif') return 'success';
      if (status === 'Selesai') return 'info';
      return 'warning';
    };

    const getPlacementName = (placementId: string): string => {
      const placement = props.placements.find(p => p.uuid === placementId);
      return placement?.name || '-';
    };

    return {
      formatCurrency,
      formatPeriod,
      getStatus,
      getStatusType,
      getPlacementName
    };
  }
});
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .card-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
    
    :deep(.el-icon) {
      color: #667eea;
    }
  }
}

.contract-card {
  :deep(.el-card__body) {
    padding: 2rem;
  }
  
  .contracts-timeline {
    .timeline-item {
      display: flex;
      padding-bottom: 2rem;
      
      &:last-child {
        padding-bottom: 0;
      }
      
      .timeline-marker {
        position: relative;
        margin-right: 1.5rem;
        
        .marker-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          border: 4px solid #e0e7ff;
          position: relative;
          z-index: 1;
        }
        
        .marker-line {
          width: 2px;
          background: #e5e7eb;
          position: absolute;
          top: 16px;
          left: 7px;
          bottom: -2rem;
        }
      }
      
      &.status-aktif .marker-dot {
        background: #10b981;
        border-color: #d1fae5;
      }
      
      &.status-selesai .marker-dot {
        background: #6b7280;
        border-color: #e5e7eb;
      }
      
      .timeline-content {
        flex: 1;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        padding: 1.25rem;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .contract-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          
          .contract-placement {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          
          .contract-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            
            .meta-item {
              display: flex;
              align-items: center;
              font-size: 0.9rem;
              color: #6b7280;
              
              :deep(.el-icon) {
                color: #9ca3af;
              }
            }
          }
        }
        
        .contract-actions {
          display: flex;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  
  .empty-icon {
    margin-bottom: 1rem;
    
    :deep(.el-icon) {
      color: #d1d5db;
    }
  }
  
  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .empty-desc {
    color: #9ca3af;
    margin-bottom: 1.5rem;
  }
}

.me-1 {margin-right: 0.25rem;}
.me-2 {margin-right: 0.5rem;}
.ms-2 {margin-left: 0.5rem;}
</style>
