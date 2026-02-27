<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">
      <fa-icon :icon="faHouse" />
      <span>Home</span>
    </el-breadcrumb-item>
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="isLastItem(index) ? undefined : { path: item.to }"
    >
      {{ item.text }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

interface IBreadcrumbItem {
  text: string;
  to: string;
}

export default defineComponent({
  name: 'Breadcrumb',
  setup() {
    const route = useRoute();

    const breadcrumbs = computed(() => {
      const items: IBreadcrumbItem[] = [];
      
      // Get breadcrumb from route meta
      if (route.meta.breadcrumb && Array.isArray(route.meta.breadcrumb)) {
        items.push(...(route.meta.breadcrumb as IBreadcrumbItem[]));
      }

      return items;
    });

    const isLastItem = (index: number) => {
      return index === breadcrumbs.value.length - 1;
    };

    return {
      breadcrumbs,
      isLastItem,
      faHouse
    };
  }
});
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-weight: 400;
      
      &:hover {
        color: #409eff;
      }
      
      a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #606266;
        text-decoration: none;
        transition: color 0.2s;
        
        &:hover {
          color: #409eff;
        }
      }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: #303133;
      font-weight: 500;
      
      a {
        color: #303133;
        cursor: text;
        
        &:hover {
          color: #303133;
        }
      }
    }
  }
  
  :deep(.el-icon) {
    font-size: 16px;
  }
}
</style>
