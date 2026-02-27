<template>
  <el-card class="info-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <el-icon class="me-2"><User /></el-icon>
          <span>Informasi Dasar</span>
        </div>
      </div>
    </template>
    
    <el-form 
      :model="modelValue" 
      :rules="rules" 
      ref="formRef" 
      label-position="top"
      class="modern-form"
    >
      <div class="row g-4">
        <div class="col-md-6">
          <el-form-item label="Nama Lengkap" prop="full_name">
            <el-input 
              :model-value="modelValue.full_name"
              @update:model-value="updateField('full_name', $event)"
              placeholder="Masukkan nama lengkap"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
        </div>
        
        <div class="col-md-6">
          <el-form-item label="NIK (Nomor Induk Kependudukan)" prop="nik">
            <el-input 
              :model-value="modelValue.nik"
              @update:model-value="updateField('nik', $event)"
              maxlength="16" 
              placeholder="16 digit NIK"
              size="large"
              :prefix-icon="CreditCard"
              show-word-limit
            />
          </el-form-item>
        </div>

        <div class="col-md-6" v-if="isEditMode">
          <el-form-item label="NIP (Nomor Induk Pegawai)" prop="nip">
            <el-input 
              :model-value="modelValue.nip"
              @update:model-value="updateField('nip', $event)"
              maxlength="18" 
              placeholder="18 digit NIP"
              size="large"
              :prefix-icon="CreditCard"
              show-word-limit
              disabled
            />
          </el-form-item>
        </div>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { User, CreditCard } from '@element-plus/icons-vue';
import { FormInstance } from 'element-plus';
import { IEmployee } from '@/services/api';

export default defineComponent({
  name: 'EmployeeBasicInfo',
  components: {
    User,
    CreditCard
  },
  props: {
    modelValue: {
      type: Object as PropType<IEmployee>,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, expose }) {
    const formRef = ref<FormInstance>();

    const rules = {
      full_name: [
        { required: true, message: 'Nama wajib diisi', trigger: 'blur' }
      ],
      nik: [
        { required: true, message: 'NIK wajib diisi', trigger: 'blur' },
        { min: 16, max: 16, message: 'NIK harus 16 digit', trigger: 'blur' }
      ]
    };

    const updateField = (field: string, value: any) => {
      emit('update:modelValue', { ...props.modelValue, [field]: value });
    };

    const validate = async (): Promise<boolean> => {
      if (!formRef.value) return false;
      return await formRef.value.validate().catch(() => false);
    };

    expose({
      validate
    });

    return {
      formRef,
      rules,
      updateField,
      User,
      CreditCard
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

.info-card {
  :deep(.el-card__body) {
    padding: 2rem;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
  }
  
  :deep(.el-input__wrapper) {
    padding: 12px 15px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    
    &:hover {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
    }
    
    &.is-focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }
  }
  
  :deep(.el-input__inner) {
    font-size: 1rem;
    color: #111827;
  }
}

.me-2 {
  margin-right: 0.5rem;
}
</style>
