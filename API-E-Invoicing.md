## Modul Employees (Karyawan)

### Contoh Integrasi
```typescript
import { employeeApi } from '@/services/api';
// Get all employees
const res = await employeeApi.getAll();
// Create employee
await employeeApi.create({ full_name: 'John Doe', nik: '1234567890123456', nip: '123456789012345678' });
// Update employee
await employeeApi.update('id', { full_name: 'Jane Doe', nik: '1234567890123456', nip: '123456789012345678' });
// Delete employee
await employeeApi.delete('id');
```

### Request/Response Sample
**GET /employees**
Response:
```
[
  {
    "id": "1",
    "full_name": "John Doe",
    "nik": "1234567890123456",
    "nip": "123456789012345678"
  }
]
```

**POST /employees**
Request:
```
{
  "full_name": "John Doe",
  "nik": "1234567890123456",
  "nip": "123456789012345678"
}
```
Response:
```
{
  "id": "1",
  "full_name": "John Doe",
  "nik": "1234567890123456",
  "nip": "123456789012345678"
}
```
# E-Invoicing API Documentation (Ringkasan)

## Overview
Sistem API ini digunakan untuk manajemen invoice elektronik, penempatan karyawan, dan kontrak dengan klien. Backend menggunakan Laravel, endpoint utama di `.env` adalah:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## Authentication (Auth)
- **Register, Login, Refresh, Logout**
- JWT Token, single session (hanya bisa login di 1 device)
- Endpoint penting:
  - `/auth/register`
  - `/auth/login`
  - `/auth/logout`
  - `/auth/logout-all-devices`
  - `/auth/refresh`
  - `/auth/me`, `/auth/is-logged-in`, `/auth/login-info`
- Response login: `access_token`, `user`, `expires_in`, tracking IP dan waktu login
- Jika login di device lain, response 409: `User is already logged in on another device`

---

## Employees (Karyawan)
- CRUD data karyawan
- Field: `full_name`, `nik` (16 digit), `nip` (18 digit)
- Endpoint: `/employees`

---

## Clients (Klien)
- CRUD data perusahaan klien
- Field: `name`, `logo` (upload file), `address`, `phone`, `email`, PIC info
- Endpoint: `/clients`

---

## Placements (Penempatan)
- Project/penempatan karyawan di klien
- Field: `name`, `description`, `client_id`
- Endpoint: `/placements`

---

## Contract Clients (Kontrak dengan Klien)
- Kontrak project dengan klien
- Field: `placement_id`, `contract_value`, `start_on`, `ends_on`, `project_type`
- Endpoint: `/contract-clients`

---

## Contract Employees (Kontrak Karyawan)
- Kontrak penempatan karyawan ke project
- Field: `nip`, `start_on`, `ends_on`, `thp`, `daily_wages`, bank info, BPJS, relasi ke employee dan placement
- Endpoint: `/contract-employees`

---

## Invoices (Invoice/Tagihan)
- CRUD invoice ke klien
- Field: `invoice_number`, `invoice_date`, `due_date`, `subtotal`, `tax`, `total`, `status`, `notes`, `contract_client_id`
- Endpoint: `/invoices`

---

## PIC Externals
- Data PIC dari pihak eksternal
- Field: `name`, `position`, `phone`, `email`
- Endpoint: `/pic-externals`

---

## Data Flow
```
Client → Placement → Contract Client → Invoice
                 ↓
         Contract Employee ← Employee
```

---

## UUID
Semua entity menggunakan UUID sebagai identifier.

---

## Integrasi Frontend Vue 3

### Contoh Login
```typescript
import { useAuth } from '@/composables/useAuth';
const { login } = useAuth();
const success = await login(email, password);
```

### Contoh Logout
```typescript
const { logout } = useAuth();
await logout(); // Logout current device
await logout(true); // Logout all devices
```

### Ambil Data User
```typescript
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
await userStore.fetchMe();
console.log(userStore.user);
```

### Request/Response Sample
**POST /auth/login**
Request:
```
{
  "email": "admin@example.com",
  "password": "password"
}
```
Response:
```
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

**GET /auth/me**
Response:
```
{
  "name": "Admin User",
  "email": "admin@example.com"
}
```

**POST /auth/logout-all-devices**
Response:
```
{
  "success": true
}
```

---

**Siap diintegrasikan ke frontend Vue 3.**
