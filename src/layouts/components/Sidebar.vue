<template>
  <el-aside width="260px" class="layout-aside">
    <div class="aside-content">
      <div class="brand-header">
        <h4 class="brand-title">VIGOR</h4>
        <p class="brand-subtitle">Admin Panel</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="aside-menu"
        @select="handleMenuSelect"
      >
        <template v-for="menu in menuItems" :key="menu.index">
          <!-- Menu with submenu -->
          <el-sub-menu v-if="menu.children" :index="menu.index">
            <template #title>
              <div class="menu-item-content">
                <fa-icon :icon="menu.icon" class="menu-icon" />
                <span class="menu-text">{{ menu.title }}</span>
              </div>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.index"
              :index="child.index"
            >
              <div class="menu-item-content">
                <fa-icon :icon="child.icon" class="menu-icon" />
                <span class="menu-text">{{ child.title }}</span>
                <el-badge v-if="child.badge" :value="child.badge" class="menu-badge" />
              </div>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- Single menu item -->
          <el-menu-item v-else :index="menu.index">
            <div class="menu-item-content">
              <fa-icon :icon="menu.icon" class="menu-icon" />
              <span class="menu-text">{{ menu.title }}</span>
              <el-badge v-if="menu.badge" :value="menu.badge" class="menu-badge" />
            </div>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </el-aside>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  faHouse, 
  faUser, 
  faStore,
  faUsers,
  faBuilding,
  faFileContract,
  faFileInvoice,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

interface IMenuItem {
  index: string;
  title: string;
  icon: any;
  badge?: number;
  children?: IMenuItem[];
}

export default defineComponent({
  name: 'Sidebar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const activeMenuState = ref<string>('');

    const menuItems = ref<IMenuItem[]>([
      {
        index: '/',
        title: 'Dashboard',
        icon: faHouse
      },
      {
        index: '/employees',
        title: 'Employees',
        icon: faUser
      },
      {
        index: '/clients',
        title: 'Clients',
        icon: faStore
      },
      {
        index: '/pic-externals',
        title: 'PIC Externals',
        icon: faUsers
      },
      {
        index: '/placements',
        title: 'Placements',
        icon: faBuilding
      },
      {
        index: '/contract-clients',
        title: 'Contract Clients',
        icon: faFileContract
      },
      {
        index: '/invoices',
        title: 'Invoices',
        icon: faFileInvoice
      },
      // Contract Employees integrated into Employees module
      // {
      //   index: '/contract-employees',
      //   title: 'Contract Employees',
      //   icon: faUserTie
      // }
    ]);

    const activeMenu = computed(() => {
      return route.path;
    });

    watch(
      () => route.path,
      (newPath) => {
        activeMenuState.value = newPath;
      },
      { immediate: true }
    );

    const handleMenuSelect = (index: string) => {
      router.push(index);
    };

    return {
      menuItems,
      activeMenu,
      activeMenuState,
      handleMenuSelect
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.layout-aside {
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.06);
  border-right: none;
  
  .aside-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.brand-header {
  padding: 28px 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  
  .brand-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    background: linear-gradient(135deg, $primary-color 0%, #5a8dee 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .brand-subtitle {
    font-size: 11px;
    font-weight: 500;
    color: #8898aa;
    margin: 0;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
}

.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.menu-icon {
  width: 18px;
  min-width: 18px;
  height: 18px;
  font-size: 18px;
  opacity: 0.75;
  transition: all 0.2s ease;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  transition: all 0.2s ease;
}

.aside-menu {
  border-right: none;
  background: transparent;
  flex: 1;
  padding: 8px 12px;
  
  :deep(.el-menu-item) {
    color: #525f7f;
    display: flex;
    align-items: center;
    height: 44px;
    line-height: 44px;
    margin: 4px 0;
    border-radius: 8px;
    padding: 0 16px !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background-color: rgba(109, 93, 255, 0.08);
      color: $primary-color;
      
      .menu-icon {
        opacity: 1;
        transform: translateX(2px);
      }
      
      .menu-text {
        font-weight: 600;
      }
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(109, 93, 255, 0.12) 0%, rgba(109, 93, 255, 0.06) 100%);
      color: $primary-color;
      font-weight: 600;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $primary-color;
        border-radius: 0 4px 4px 0;
      }
      
      .menu-icon {
        opacity: 1;
        color: $primary-color;
      }
      
      .menu-text {
        color: $primary-color;
      }
    }
  }
  
  :deep(.el-sub-menu__title) {
    color: #525f7f;
    height: 44px;
    line-height: 44px;
    margin: 4px 0;
    border-radius: 8px;
    padding: 0 16px !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background-color: rgba(109, 93, 255, 0.08);
      color: $primary-color;
      
      .menu-icon {
        opacity: 1;
        transform: translateX(2px);
      }
      
      .menu-text {
        font-weight: 600;
      }
    }
  }
  
  :deep(.el-sub-menu.is-opened .el-sub-menu__title) {
    background-color: rgba(109, 93, 255, 0.06);
    color: $primary-color;
    font-weight: 600;
    
    .menu-icon {
      opacity: 1;
    }
  }
  
  :deep(.el-sub-menu .el-menu) {
    background-color: transparent;
    padding-left: 8px;
  }
  
  :deep(.el-sub-menu .el-menu-item) {
    background-color: transparent;
    min-height: 40px;
    height: 40px;
    line-height: 40px;
    padding-left: 48px !important;
    
    &:hover {
      background-color: rgba(109, 93, 255, 0.06);
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(109, 93, 255, 0.1) 0%, rgba(109, 93, 255, 0.04) 100%);
      
      &::before {
        height: 16px;
      }
    }
  }
  
  :deep(.el-sub-menu__icon-arrow) {
    font-size: 12px;
    color: #8898aa;
    transition: all 0.2s ease;
  }
}

.menu-badge {
  margin-left: auto;
  
  :deep(.el-badge__content) {
    background: linear-gradient(135deg, #ff6b9d 0%, #ff5370 100%);
    border: none;
    font-size: 10px;
    font-weight: 600;
    height: 18px;
    min-width: 18px;
    line-height: 18px;
    padding: 0 6px;
    border-radius: 9px;
    box-shadow: 0 2px 4px rgba(255, 107, 157, 0.3);
  }
}
</style>
