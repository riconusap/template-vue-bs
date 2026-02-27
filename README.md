# Vue 3 + TypeScript + Bootstrap 5 + Element Plus Admin Dashboard

Admin Dashboard Panel template menggunakan Vue 3 dengan Composition API, TypeScript, Bootstrap 5, dan Element Plus.

## 🚀 Quick Start

### Prasyarat
- Node.js v18+ 
- npm/yarn/pnpm

### Instalasi

```bash
# Install dependencies
npm install
# atau
yarn install
# atau
pnpm install
```

### Development

```bash
# Jalankan development server
npm run dev

# Akses di http://localhost:5173
```

### Build Production

```bash
# Build untuk produksi
npm run build

# Preview build
npm run preview
```

## 📁 Struktur Project

```
template-vue-bs/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── main.scss
│   │       └── variables.scss
│   ├── components/
│   │   └── StatsCard.vue
│   ├── views/
│   │   └── DashboardView.vue
│   ├── router/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🎯 Tech Stack

- **Vue 3** - Progressive JavaScript Framework (Composition API)
- **TypeScript** - Typed JavaScript
- **Vite** - Next Generation Frontend Tooling
- **Bootstrap 5** - CSS Framework (Grid & Utilities only)
- **Element Plus** - Vue 3 Component Library (Interactive components)
- **Vue Router** - Official Router
- **Pinia** - State Management
- **SCSS** - CSS Preprocessor

## 📝 Coding Standards

### Vue Component Structure
- **TIDAK menggunakan** `<script setup>`
- **SELALU gunakan** `export default defineComponent({ setup() { ... } })`
- Return reactive state dan functions secara explicit dari `setup()`

### UI Framework Strategy
- **Bootstrap 5**: Untuk Layout (Grid, Container) dan Utility Classes (`p-3`, `m-0`, `d-flex`)
- **Element Plus**: Untuk Interactive Components (`<el-table>`, `<el-button>`, `<el-input>`)

### TypeScript Rules
- NO `any` type
- Selalu define Interface/Type untuk props, emits, dan API responses
- Gunakan `PropType` untuk complex prop validation

### SCSS Guidelines
- Gunakan `<style lang="scss" scoped>`
- Utilize SCSS variables dari `variables.scss`

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Lint code
npm run format    # Format code with Prettier
```

## 📚 Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/)
- [Element Plus Documentation](https://element-plus.org/)
- [Vite Documentation](https://vitejs.dev/)

## 📄 License

MIT
