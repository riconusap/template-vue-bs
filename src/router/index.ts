import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import SignInView from '@/views/SignInView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/signin',
    name: 'signin',
    component: SignInView,
    meta: { title: 'Sign In' }
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('@/views/employees/EmployeesView.vue'),
        meta: {
          title: 'Employees',
          breadcrumb: [
            { text: 'Employees', to: '/employees' }
          ]
        }
      },
      {
        path: 'employees/create',
        name: 'employees-create',
        component: () => import('@/views/employees/EmployeeForm.vue'),
        meta: {
          title: 'Tambah Karyawan',
          breadcrumb: [
            { text: 'Employees', to: '/employees' },
            { text: 'Tambah Karyawan', to: '/employees/create' }
          ]
        }
      },
      {
        path: 'employees/:id/edit',
        name: 'employees-edit',
        component: () => import('@/views/employees/EmployeeForm.vue'),
        meta: {
          title: 'Edit Karyawan',
          breadcrumb: [
            { text: 'Employees', to: '/employees' },
            { text: 'Edit Karyawan', to: '' }
          ]
        }
      },
      {
        path: 'clients',
        name: 'clients',
        component: () => import('@/views/clients/ClientsView.vue'),
        meta: {
          title: 'Clients',
          breadcrumb: [
            { text: 'Clients', to: '/clients' }
          ]
        }
      },
      {
        path: 'pic-externals',
        name: 'pic-externals',
        component: () => import('@/views/pic-externals/PicExternalsView.vue'),
        meta: {
          title: 'PIC Externals',
          breadcrumb: [
            { text: 'PIC Externals', to: '/pic-externals' }
          ]
        }
      },
      {
        path: 'placements',
        name: 'placements',
        component: () => import('@/views/placements/PlacementsView.vue'),
        meta: {
          title: 'Placements',
          breadcrumb: [
            { text: 'Placements', to: '/placements' }
          ]
        }
      },
      {
        path: 'contract-clients',
        name: 'contract-clients',
        component: () => import('@/views/contract-clients/ContractClientsView.vue'),
        meta: {
          title: 'Contract Clients',
          breadcrumb: [
            { text: 'Contract Clients', to: '/contract-clients' }
          ]
        }
      },
      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('@/views/invoices/InvoicesView.vue'),
        meta: {
          title: 'Invoices',
          breadcrumb: [
            { text: 'Invoices', to: '/invoices' }
          ]
        }
      },
      // Contract Employees integrated into Employees module
      // {
      //   path: 'contract-employees',
      //   name: 'contract-employees',
      //   component: () => import('@/views/contract-employees/ContractEmployeesView.vue'),
      //   meta: {
      //     title: 'Contract Employees',
      //     breadcrumb: [
      //       { text: 'Contract Employees', to: '/contract-employees' }
      //     ]
      //   }
      // }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});


// Auth Guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/signin'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');
  if (authRequired && !token) {
    next({ path: '/signin' });
  } else {
    next();
  }
});

export default router;
