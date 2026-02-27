<template>
  <div class="dashboard-view">
    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3" v-for="stat in stats" :key="stat.title">
        <stats-card 
          :title="stat.title" 
          :value="stat.value" 
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="row">
      <div class="col-12">
        <el-card class="table-card">
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="m-0">User List</h5>
              <el-button type="primary" size="small" @click="handleAdd">
                Add User
              </el-button>
            </div>
          </template>

          <el-table :data="tableData" style="width: 100%" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="email" label="Email" />
            <el-table-column prop="role" label="Role" />
              <el-table-column prop="status" label="Status">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'Active' ? 'success' : 'info'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                    <fa-icon :icon="faEdit" class="me-1" />
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                    <fa-icon :icon="faTrash" class="me-1" />
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/StatsCard.vue';

interface IStatItem {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface IUserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default defineComponent({
  name: 'DashboardView',
  components: {
    StatsCard
  },
  setup() {
    const stats = ref<IStatItem[]>([
      { title: 'Total Users', value: 1234, icon: 'User', color: 'primary' },
      { title: 'Active Sessions', value: 567, icon: 'Monitor', color: 'success' },
      { title: 'Revenue', value: 89012, icon: 'Money', color: 'warning' },
      { title: 'New Orders', value: 345, icon: 'ShoppingCart', color: 'danger' }
    ]);

    const tableData = ref<IUserData[]>([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' }
    ]);

    const handleAdd = () => {
      ElMessage.info('Add user dialog would open here');
    };

    const handleEdit = (row: IUserData) => {
      ElMessage.info(`Edit user: ${row.name}`);
    };

    const handleDelete = (row: IUserData) => {
      ElMessage.warning(`Delete user: ${row.name}`);
    };

    onMounted(() => {
      // Fetch initial data here
    });

    return {
      stats,
      tableData,
      handleAdd,
      handleEdit,
      handleDelete,
      faEdit: faPencil,
      faTrash
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.dashboard-view {
  .table-card {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    :deep(.el-card__header) {
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
      color: #303133;
    }
  }
}
</style>
