import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Token Interceptor
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Optional: handle global error (401, 409, etc)
    return Promise.reject(error);
  }
);


export default api;

// Employee Document Interface
export interface IEmployeeDocument {
  uuid: string;
  filename: string;
  file: string;
  url?: string;
  path?: string;
  size?: number;
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
}

// Employee API Service
export interface IEmployee {
  uuid?: string;
  full_name: string;
  nik: string;
  nip?: string;
  employeeDocuments?: IEmployeeDocument[];
}

export const employeeApi = {
  getAll: (params?: any) => api.get('/employees', { params }),
  getById: (uuid: string) => api.get(`/employees/${uuid}`),
  create: (data: FormData | IEmployee) => {
    if (data instanceof FormData) {
      return api.post('/employees', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/employees', data);
  },
  update: (uuid: string, data: FormData | IEmployee) => {
    if (data instanceof FormData) {
      // Laravel method spoofing for FormData
      data.append('_method', 'PATCH');
      return api.post(`/employees/${uuid}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/employees/${uuid}`, data);
  },
  delete: (uuid: string) => api.delete(`/employees/${uuid}`),
  // Document Management Methods
  previewDocument: (employeeId: string, documentUuid: string) => 
    api.get(`/employees/${employeeId}/documents/${documentUuid}/preview`),
  downloadDocument: (employeeId: string, documentUuid: string) => 
    api.get(`/employees/${employeeId}/documents/${documentUuid}/download`, {
      responseType: 'blob'
    }),
  deleteDocument: (employeeId: string, documentUuid: string) => 
    api.delete(`/employees/${employeeId}/documents/${documentUuid}`)
};

// Client API Service
export interface IClient {
  uuid?: string;
  name: string;
  logo?: string | File;
  address: string;
  phone: string;
  email: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
}

export const clientApi = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (uuid: string) => api.get(`/clients/${uuid}`),
  create: (data: FormData | IClient) => {
    if (data instanceof FormData) {
      return api.post('/clients', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/clients', data);
  },
  update: (uuid: string, data: FormData | IClient) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/clients/${uuid}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/clients/${uuid}`, data);
  },
  delete: (uuid: string) => api.delete(`/clients/${uuid}`)
};

// PIC External API Service
export interface IPicExternal {
  uuid?: string;
  name: string;
  position: string;
  phone: string;
  email: string;
}

export const picExternalApi = {
  getAll: (params?: any) => api.get('/pic-externals', { params }),
  getById: (uuid: string) => api.get(`/pic-externals/${uuid}`),
  create: (data: IPicExternal) => api.post('/pic-externals', data),
  update: (uuid: string, data: IPicExternal) => api.put(`/pic-externals/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/pic-externals/${uuid}`)
};

// Placement API Service
export interface IPlacement {
  uuid?: string;
  name: string;
  description: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
}

export const placementApi = {
  getAll: (params?: any) => api.get('/placements', { params }),
  getById: (uuid: string) => api.get(`/placements/${uuid}`),
  create: (data: IPlacement) => api.post('/placements', data),
  update: (uuid: string, data: IPlacement) => api.put(`/placements/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/placements/${uuid}`)
};

// Contract Client API Service
export interface IContractClient {
  uuid?: string;
  placement_id: string;
  contract_value: number;
  start_on: string;
  ends_on: string;
  project_type: string;
  created_at?: string;
  updated_at?: string;
}

export const contractClientApi = {
  getAll: (params?: any) => api.get('/contract-clients', { params }),
  getById: (uuid: string) => api.get(`/contract-clients/${uuid}`),
  create: (data: IContractClient) => api.post('/contract-clients', data),
  update: (uuid: string, data: IContractClient) => api.put(`/contract-clients/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/contract-clients/${uuid}`)
};

// Invoice API Service
export interface IInvoice {
  uuid?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes: string;
  contract_client_id: string;
  created_at?: string;
  updated_at?: string;
}

export const invoiceApi = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (uuid: string) => api.get(`/invoices/${uuid}`),
  create: (data: IInvoice) => api.post('/invoices', data),
  update: (uuid: string, data: IInvoice) => api.put(`/invoices/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/invoices/${uuid}`)
};

// Contract Employee API Service
export interface IContractEmployee {
  uuid?: string;
  nip: string;
  start_on: string;
  ends_on: string;
  thp: number;
  daily_wages: number;
  account_number: string;
  bank_id: string;
  account_holder_name: string;
  no_bpjstk: string;
  no_bpjskes: string;
  employee_id: string;
  placement_id: string;
  created_at?: string;
  updated_at?: string;
}

export const contractEmployeeApi = {
  getAll: (params?: any) => api.get('/contract-employees', { params }),
  getById: (uuid: string) => api.get(`/contract-employees/${uuid}`),
  create: (data: IContractEmployee) => api.post('/contract-employees', data),
  update: (uuid: string, data: IContractEmployee) => api.put(`/contract-employees/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/contract-employees/${uuid}`)
};
