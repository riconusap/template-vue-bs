<template>
  <el-container class="default-layout">
    <sidebar />
    
    <el-container class="main-container">
      <el-header class="layout-header">
        <Header />
      </el-header>
      
      <el-main class="layout-main">
        <div class="main-content">
          <breadcrumb />
          <router-view />
        </div>
      </el-main>
      
      <footer-component />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import Sidebar from './components/Sidebar.vue';
import FooterComponent from './components/Footer.vue';
import Header from './components/Header.vue';

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    Breadcrumb,
    Sidebar,
    FooterComponent,
    Header
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.default-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #ffffff;
  color: #303133;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e4e7ed;
  z-index: 100;
}

.layout-main {
  background: #f5f7fa;
  color: #303133;
  padding: 24px;
  flex: 1;
  
  .main-content {
    min-height: 100%;
    
    h2 {
      color: #303133;
    }
  }
}
</style>
