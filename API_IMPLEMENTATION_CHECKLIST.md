# API Implementation Checklist

## � Dependency Analysis

### Independent Modules (No Foreign Keys) ✅
Modules yang **TIDAK bergantung** pada data modul lain:

| Module | Status | Fields | Dependencies |
|--------|--------|--------|--------------|
| **Auth** | ✅ Done | user credentials | None |
| **Employees** | ✅ Done | full_name, nik, nip | None |
| **Clients** | ✅ Done | name, logo, address, phone, email, pic_* | None |
| **PIC Externals** | ✅ Done | name, position, phone, email | None |

### Dependent Modules (With Foreign Keys) ⏳
Modules yang **BERGANTUNG** pada data modul lain:

#### Level 1 Dependencies
| Module | Status | Depends On | Foreign Keys |
|--------|--------|------------|--------------|
| **Placements** | ✅ Done | Clients | `client_id` |

#### Level 2 Dependencies
| Module | Status | Depends On | Foreign Keys |
|--------|--------|------------|--------------|
| **Contract Clients** | ✅ Done | Placements | `placement_id` |
| **Contract Employees** | ✅ Done | Employees + Placements | `employee_id`, `placement_id` |

#### Level 3 Dependencies
| Module | Status | Depends On | Foreign Keys |
|--------|--------|------------|--------------|
| **Invoices** | ✅ Done | Contract Clients | `contract_client_id` |

### 📊 Dependency Chain Visualization

```
Independent (Base Layer):
├── Auth ✅
├── Employees ✅
├── Clients ✅
└── PIC Externals ✅

Level 1 (Depends on Independent):
└── Placements ✅
    └── requires: Clients ✅

Level 2 (Depends on Level 1):
├── Contract Clients ✅
│   └── requires: Placements ✅
└── Contract Employees ✅
    └── requires: Employees ✅ + Placements ✅

Level 3 (Depends on Level 2):
└── Invoices ✅
    └── requires: Contract Clients ✅
```

### ⚠️ Implementation Order (CRITICAL)

**✅ COMPLETED:**
1. Independent modules (Auth, Employees, Clients, PIC Externals)

**🎯 NEXT PRIORITY:**
2. **Placements** (Level 1) - Must be done first!
   - Needs dropdown for `client_id` (Clients already exists ✅)
   - Blocks: Contract Clients, Contract Employees

**⏳ AFTER PLACEMENTS:**
3. **Contract Clients** (Level 2)
   - Needs dropdown for `placement_id`
   - Blocks: Invoices

4. **Contract Employees** (Level 2)
   - Needs dropdowns for `employee_id` and `placement_id`
   - Can be done in parallel with Contract Clients

**🔚 FINAL:**
5. **Invoices** (Level 3)
   - Needs dropdown for `contract_client_id`
   - Must be last

---

## �📊 Progress Overview
**Overall Completion: 47/52 Endpoints (90%)** 🔥🔥

✅ **Completed Modules:**
- Auth (12 endpoints)
- Employees (5 endpoints) 
- Clients (5 endpoints)
- PIC Externals (5 endpoints)
- Placements (5 endpoints)
- Contract Clients (5 endpoints)
- Invoices (5 endpoints)
- Contract Employees (5 endpoints) 🎉 NEW!

⏳ **Remaining Modules:**
- None! (Only 5 Auth endpoints remaining for testing)

### 🎨 Recent Updates
- ✅ **Contract Employees module completed!** (90% COMPLETION MILESTONE!) 🎉🎉🎉
- ✅ Complex form with 13 fields implemented (most complex form!)
- ✅ Bank dropdown with Indonesian banks (BCA, Mandiri, BRI, BNI, etc.)
- ✅ Employee & Placement dropdowns working
- ✅ BPJS fields (TK & Kesehatan) added
- ✅ Contract duration calculator
- ✅ Currency formatting for THP & daily wages
- ✅ Invoices module completed! (CRITICAL PATH COMPLETE!)
- ✅ All dependency chains resolved!
- 🏁 **47/52 endpoints complete - Only 5 remaining!**

### 🎯 CRITICAL PATH - COMPLETED! ✅✅✅

**✅ ALL MODULES COMPLETED! 90% MILESTONE REACHED!**

```
✅ Completed Critical Path:
   Clients ✅ 
     └─> Placements ✅
          └─> Contract Clients ✅
               └─> Invoices ✅ DONE!

✅ Parallel Path DONE:
   Employees ✅
     └─> Contract Employees ✅ DONE!
```

**Remaining Work:** 
- Auth module endpoints (5 remaining) - Already functional, need testing

**Final sprint complete! 47/52 endpoints (90%)!** 🎉🎉🎉

---

## Auth (12 Endpoints) ✅
- [x] Register User
- [x] Login User
- [x] Get Current User (Me)
- [x] Check Is Logged In
- [x] Get Login Info
- [x] Logout from All Devices
- [x] Logout from All Users
- [x] Get Active Sessions
- [x] Logout
- [x] Refresh Token
- [x] Forgot Password
- [x] Reset Password

---

## Employees (5 Endpoints) ✅
- [x] **Dashboard**: Get All Employees (Paginated + Search)
  - [x] Pagination (page, per_page)
  - [x] Search filter
  - [x] Display in Table
  - [x] Total count display

- [x] **Create Employee**
  - [x] Form: full_name, nik, nip
  - [x] Add dialog/modal
  - [x] Validation

- [x] **Get Employee Detail**
  - [x] Detail view/modal
  - [x] Display employee data

- [x] **Update Employee**
  - [x] Edit form
  - [x] Pre-fill data
  - [x] Update API call

- [x] **Delete Employee**
  - [x] Confirmation dialog
  - [x] Delete action

---

## Clients (5 Endpoints) ✅
- [x] **Dashboard**: Get All Clients (Paginated)
  - [x] Pagination
  - [x] Display in Table

- [x] **Create Client**
  - [x] Form: name, logo, address, phone, email
  - [x] Form: pic_name, pic_phone, pic_email
  - [x] File upload (logo)
  - [x] Formdata handling

- [x] **Get Client Detail**
  - [x] View detail page

- [x] **Update Client**
  - [x] Edit form with formdata
  - [x] Logo upload
  - [x] Update client info

- [x] **Delete Client**
  - [x] Confirmation delete

---

## Placements (5 Endpoints) ✅ COMPLETED
- [x] **Dashboard**: Get All Placements (Paginated)
  - [x] Pagination
  - [x] Table display

- [x] **Create Placement**
  - [x] Form: name, description, client_id (dropdown)
  - [x] Select client from list

- [x] **Get Placement Detail**
  - [x] Detail view

- [x] **Update Placement**
  - [x] Edit form
  - [x] Update data

- [x] **Delete Placement**
  - [x] Confirmation delete

---

## Contract Clients (5 Endpoints) ✅ COMPLETED
- [x] **Dashboard**: Get All Contract Clients (Paginated)
  - [x] Pagination
  - [x] Table display

- [x] **Create Contract Client**
  - [x] Form: placement_id (dropdown), contract_value, start_on, ends_on, project_type
  - [x] Date picker for start_on dan ends_on
  - [x] Currency format for contract_value

- [x] **Get Contract Client Detail**
  - [x] Detail view

- [x] **Update Contract Client**
  - [x] Edit form
  - [x] Update data

- [x] **Delete Contract Client**
  - [x] Confirmation delete

---

## Contract Employees (5 Endpoints) � READY TO START
- [x] **Dashboard**: Get All Contract Employees (Paginated)
  - [x] Pagination
  - [x] Table display
  - [x] Employee name lookup
  - [x] Placement name lookup
  - [x] Status badges (Active/Finished/Not Started)
  - [x] Currency formatting for THP & daily wages
  - [x] Bank & BPJS info columns

- [x] **Create Contract Employee**
  - [x] Form: nip, start_on, ends_on, thp, daily_wages
  - [x] Form: account_number, bank_id, account_holder_name
  - [x] Form: no_bpjstk, no_bpjskes, employee_id, placement_id
  - [x] Multiple dropdowns (employee, placement, bank)
  - [x] Date pickers with validation (end after start)
  - [x] Currency format for thp, daily_wages with preview
  - [x] Contract duration calculator
  - [x] Bank list (13 Indonesian banks)

- [x] **Get Contract Employee Detail**
  - [x] Detail view

- [x] **Update Contract Employee**
  - [x] Edit form
  - [x] Update data

- [x] **Delete Contract Employee**
  - [x] Confirmation delete

---

## Invoices (5 Endpoints) � READY TO START
- [x] **Dashboard**: Get All Invoices (Paginated)
  - [x] Pagination
  - [x] Table display
  - [x] Status badge (pending, paid, overdue, cancelled)
  - [x] Overdue detection (dynamic status for past due date)
  - [x] Status filter dropdown
  - [x] Currency formatting for all monetary fields

- [x] **Create Invoice**
  - [x] Form: invoice_number, invoice_date, due_date
  - [x] Form: subtotal, tax, total
  - [x] Form: status (dropdown), notes
  - [x] Form: contract_client_id (dropdown with contract info)
  - [x] Date picker for invoice_date, due_date
  - [x] Auto calculate total (total = subtotal + tax)
  - [x] Due date validation (must be after invoice date)

- [x] **Get Invoice Detail**
  - [x] Detail view
  - [x] Display invoice info

- [x] **Update Invoice**
  - [x] Edit form
  - [x] Change status
  - [x] Update other fields

- [x] **Delete Invoice**
  - [x] Confirmation delete

---

## PIC Externals (5 Endpoints) ✅
- [x] **Dashboard**: Get All PIC Externals (Paginated)
  - [x] Pagination
  - [x] Table display

- [x] **Create PIC External**
  - [x] Form: name, position, phone, email
  - [x] Validation for email format

- [x] **Get PIC External Detail**
  - [x] Detail view

- [x] **Update PIC External**
  - [x] Edit form
  - [x] Update data

- [x] **Delete PIC External**
  - [x] Confirmation delete

---

## Shared Features (All Pages)
- [x] Loading state indicator (v-loading)
- [x] Error handling with error dialog
- [x] Success message on CRUD operations
- [x] Empty state when no data
- [x] Responsive design (Bootstrap grid)
- [x] Consistent UI using Element Plus components
- [x] Font Awesome icons integration
- [x] Modern minimalist sidebar design

---

## Priority Implementation Order (Based on Dependencies)

### ✅ Phase 1: Independent Modules (COMPLETED)
**All modules with NO foreign key dependencies**
   - [x] Auth (12 endpoints) - No dependencies
   - [x] Employees (5 endpoints) - No dependencies
   - [x] Clients (5 endpoints) - No dependencies
   - [x] PIC Externals (5 endpoints) - No dependencies
   
**Result: 27/52 endpoints done (52%)**

---

### 🎯 Phase 2: Level 1 Dependencies (COMPLETED! ✅)
**Module that depends only on completed independent modules**

- [x] **Placements (5 endpoints)** ✅ DONE!
  - Dependencies: ✅ Clients (client_id dropdown)
  - Unblocked: Contract Clients, Contract Employees
  - Status: **COMPLETED** - All CRUD operations working
  
---

### ✅ Phase 3: Level 2 Dependencies (COMPLETED! ✅)
**Modules that depend on Level 1 modules - ALL COMPLETE**

- [x] **Contract Clients (5 endpoints)** ✅ DONE!
  - Dependencies: ✅ Placements (placement_id dropdown)
  - Unblocked: Invoices
  - Status: **COMPLETED** - Date pickers, currency formatting working!
  
- [x] **Contract Employees (5 endpoints)** ✅ DONE!
  - Dependencies: ✅ Employees + ✅ Placements
  - Complex form: 13 fields with multiple dropdowns, date pickers, currency fields
  - Status: **COMPLETED** - Most complex form successfully implemented!
  - Features: Bank dropdown (13 banks), BPJS fields, contract duration calculator

---

### 🔚 Phase 4: Level 3 Dependencies (COMPLETED! ✅)
**Module at the end of dependency chain - DONE!**

- [x] **Invoices (5 endpoints)** ✅ DONE!
  - Dependencies: ✅ Contract Clients (contract_client_id dropdown)
  - Features: Overdue detection, auto-calculation, status filter
  - Status: **COMPLETED!** Critical path finished!

---

## 🚀 Implementation Strategy

### Why Placements Must Be Done First?

**Placements is the Critical Path Module:**

1. **Unblocks 2 Modules:**
   - Contract Clients needs `placement_id`
   - Contract Employees needs `placement_id`

2. **Simplest Level 1 Module:**
   - Only 3 fields: name, description, client_id
   - Single dropdown (client_id)
   - No date pickers or currency formatting
   - Quick to implement (~30 minutes)

3. **High Impact:**
   - Completing Placements immediately enables parallel work on:
     - Contract Clients
     - Contract Employees

### Estimated Implementation Time

| Module | Complexity | Time Estimate | Blockers |
|--------|-----------|---------------|----------|
| **Placements** | Low | 30-45 min | None (Clients exists ✅) |
| **Contract Clients** | Medium | 1-1.5 hours | ⏳ Placements |
| **Contract Employees** | High | 2-3 hours | ⏳ Placements |
| **Invoices** | High | 2-3 hours | ⏳ Contract Clients |

**Total remaining time: ~6-8 hours**

### Technical Requirements Per Module

#### Placements
```typescript
interface IPlacement {
  uuid?: string;
  name: string;
  description: string;
  client_id: string;  // Dropdown from clientApi.getAll()
}
```
- Components needed: PlacementsView, PlacementForm
- New UI elements: Client dropdown (el-select)

#### Contract Clients
```typescript
interface IContractClient {
  uuid?: string;
  placement_id: string;      // Dropdown from placementApi.getAll()
  contract_value: number;    // Currency input
  start_on: string;          // Date picker
  ends_on: string;           // Date picker
  project_type: string;
}
```
- Components needed: ContractClientsView, ContractClientForm
- New UI elements: Date pickers (el-date-picker), Currency formatter

#### Contract Employees
```typescript
interface IContractEmployee {
  uuid?: string;
  nip: string;
  start_on: string;          // Date picker
  ends_on: string;           // Date picker
  thp: number;               // Currency
  daily_wages: number;       // Currency
  account_number: string;
  bank_id: string;           // Dropdown (banks list)
  account_holder_name: string;
  no_bpjstk: string;
  no_bpjskes: string;
  employee_id: string;       // Dropdown from employeeApi.getAll()
  placement_id: string;      // Dropdown from placementApi.getAll()
}
```
- Components needed: ContractEmployeesView, ContractEmployeeForm
- New UI elements: Multiple dropdowns, date pickers, currency inputs
- Most complex form of all modules

#### Invoices
```typescript
interface IInvoice {
  uuid?: string;
  invoice_number: string;
  invoice_date: string;      // Date picker
  due_date: string;          // Date picker
  subtotal: number;          // Currency
  tax: number;               // Currency
  total: number;             // Currency (auto-calculated)
  status: string;            // Dropdown (pending/paid/cancelled)
  notes: string;
  contract_client_id: string; // Dropdown from contractClientApi.getAll()
}
```
- Components needed: InvoicesView, InvoiceForm
- New UI elements: Status badges, calculation logic
- Business logic: Auto-calculate total from subtotal + tax

---

## Total API Endpoints
- Auth: 12 endpoints ✅
- Employees: 5 endpoints ✅
- Clients: 5 endpoints ✅
- PIC Externals: 5 endpoints ✅
- Placements: 5 endpoints ✅
- Contract Clients: 5 endpoints ✅
- Contract Employees: 5 endpoints 🔓 READY
- Invoices: 5 endpoints 🔓 READY

**TOTAL: 52 API Endpoints**
**COMPLETED: 37/52 (71%)** 🔥

---

## Component Structure Pattern (for all modules)

### Example: ClientsView.vue
```
src/views/
  clients/
    ClientsView.vue          (List + Search)
    ClientForm.vue           (Create/Edit with modal)
    ClientDetail.vue         (Detail view)
  
  placements/
    PlacementsView.vue
    PlacementForm.vue
    PlacementDetail.vue
    
  ... (repeat for each module)
```

### API Service Pattern
```typescript
export const clientApi = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: IClient) => api.post('/clients', data),
  update: (id: string, data: IClient) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`)
};
```

---

## 🎯 Next Steps: Placements Module (IMMEDIATE PRIORITY)

### Why Start Here?
✅ All dependencies met (Clients exists)  
⚠️ Blocks 2 other modules  
⏱️ Quick win (~30-45 minutes)  
🔑 Critical path module  

### Implementation Checklist

**Step 1: API Service (5 min)**
- [ ] Add `IPlacement` interface to `/src/services/api.ts`
- [ ] Create `placementApi` with 5 methods (getAll, create, update, delete, getById)

**Step 2: PlacementsView (15 min)**
- [ ] Create `/src/views/placements/PlacementsView.vue`
- [ ] Copy structure from `ClientsView.vue` (pagination, search, table)
- [ ] Add columns: name, description, client name
- [ ] Import placementApi and clientApi (for displaying client name)

**Step 3: PlacementForm (15 min)**
- [ ] Create `/src/views/placements/PlacementForm.vue`
- [ ] Form fields: name (required), description (textarea), client_id (dropdown)
- [ ] Fetch clients list for dropdown with `clientApi.getAll()`
- [ ] Validation rules for name and client_id

**Step 4: Router & Sidebar (5 min)**
- [ ] Add route `/placements` to `/src/router/index.ts`
- [ ] Add "Placements" menu item to Sidebar with icon (faMapMarkerAlt or faBuilding)

### Code Snippets Ready to Use

**IPlacement Interface:**
```typescript
export interface IPlacement {
  uuid?: string;
  name: string;
  description: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
}

export const placementApi = {
  getAll: (params?: any) => api.get<any>('/placements', { params }),
  getById: (uuid: string) => api.get<IPlacement>(`/placements/${uuid}`),
  create: (data: IPlacement) => api.post<IPlacement>('/placements', data),
  update: (uuid: string, data: IPlacement) => api.put<IPlacement>(`/placements/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/placements/${uuid}`)
};
```

**Files to Create:**
```
src/views/placements/
  ├── PlacementsView.vue      (List with pagination & search)
  └── PlacementForm.vue       (Create/Edit form with client dropdown)
```

### After Placements is Done
Once completed, we can work on Contract Clients and Contract Employees in parallel since both will have access to `placementApi.getAll()` for their dropdowns.

---

## 📋 Dependency Summary & Blocking Status

### Current State

```
✅ COMPLETED (27/52 endpoints):
├── Auth (12 endpoints)
├── Employees (5 endpoints)
├── Clients (5 endpoints)
└── PIC Externals (5 endpoints)

⏳ REMAINING (25/52 endpoints):
└── ALL BLOCKED BY PLACEMENTS
```

### What's Blocking What?

```
🔒 BLOCKED MODULES:

Contract Clients (5 endpoints)
├── Needs: placement_id dropdown
├── Blocked by: Placements ⏳
└── Blocks: Invoices

Contract Employees (5 endpoints)  
├── Needs: employee_id ✅ + placement_id ⏳
├── Blocked by: Placements ⏳
└── Blocks: Nothing (can be done anytime after Placements)

Invoices (5 endpoints)
├── Needs: contract_client_id dropdown
├── Blocked by: Contract Clients 🔒
└── Blocks: Nothing (final module)
```

### Unlock Sequence (Ordered Path)

```
Step 1: Complete Placements (30-45 min)
   ↓
   └─→ ✅ Unlocks: Contract Clients + Contract Employees
   
Step 2: Complete Contract Clients (1-1.5 hours)
   ↓
   └─→ ✅ Unlocks: Invoices
   
Step 3: Complete Contract Employees (2-3 hours)
   ↓
   └─→ ✅ No blockers (parallelizable with Step 2)
   
Step 4: Complete Invoices (2-3 hours)
   ↓
   └─→ 🎉 ALL 52 ENDPOINTS COMPLETE!
```

### ⚠️ Risk of Wrong Implementation Order

❌ **If we try Contract Clients first (skipping Placements):**
- Missing `placement_id` dropdown data
- Cannot create or test contract clients
- Form incomplete and non-functional
- **Result:** Wasted effort, need to backtrack

❌ **If we try Invoices first (skipping Contract Clients):**
- Missing `contract_client_id` dropdown data
- Cannot link invoices to contracts
- Business logic breaks
- **Result:** Module useless without contract data

✅ **By doing Placements first (correct order):**
- Natural data hierarchy: Client → Placement → Contract → Invoice
- Each module fully testable with real data
- Can work on 2 modules in parallel after Placements
- No rework needed
- Clean dependency resolution

### 🎯 Recommendation

**START NOW:** Placements module  
**REASON:** It's the critical path bottleneck  
**TIME:** 30-45 minutes  
**IMPACT:** Unblocks 3 remaining modules (15 endpoints)  
**COMPLEXITY:** Low (just 3 fields, 1 dropdown)

---

## 🚀 Previous Next Steps Section (Archive)

### Immediate Priority: Phase 3
1. **Placements Module**
   - Create PlacementsView.vue with pagination & search
   - Create PlacementForm.vue with client dropdown
   - Add placement routes to router
   - Create placementApi service

2. **Contract Clients Module**
   - Create ContractClientsView.vue 
   - Create ContractClientForm.vue with:
     - Date pickers (start_on, ends_on)
     - Placement dropdown
     - Currency formatting for contract_value
   - Add contract client routes

### Technical Requirements
- Element Plus date picker component
- Currency input formatting
- Dropdown component with API data
- Date range validation

### Files to Create
```
src/views/placements/
  ├── PlacementsView.vue
  └── PlacementForm.vue

src/views/contract-clients/
  ├── ContractClientsView.vue
  └── ContractClientForm.vue
```
