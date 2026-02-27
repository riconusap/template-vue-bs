<template>
  <el-footer class="layout-footer">
    <div class="d-flex justify-content-center align-items-center h-100">
      <p class="m-0">Footer</p>
    </div>
  </el-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Footer',
  setup() {
    return {};
  }
});
</script>

<style lang="scss" scoped>
.layout-footer {
  background: #ffffff;
  color: #606266;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
//   border-top: 1px solid #e4e7ed;
  height: 60px;
  
  p {
    font-size: 14px;
    color: #909399;
  }
}
</style>
