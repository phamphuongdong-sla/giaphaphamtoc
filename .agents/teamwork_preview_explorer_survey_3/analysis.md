# Explorer 3 Analysis: Build, Deployment & Project Structure Survey

## Executive Summary
This analysis details the build configuration, deployment pipeline, test/typechecking infrastructure, git repository status, and structural architecture of the **Gia Phả Phạm Tộc** application.

---

## 1. Build Tools & Scripts

### 1.1 Technology Stack & Configurations
- **Package Manager**: `npm` (Lockfile: `package-lock.json`).
- **Build Bundler & Dev Server**: Vite `^4.3.9` with `@vitejs/plugin-react` `^4.0.0`.
- **Config File**: `vite.config.ts`
  - **Base Path**: `/giaphaphamtoc/` (configured for GitHub Pages subpath hosting).
  - **Path Alias**: `@` points to `./src`.
  - **PWA Integration**: `vite-plugin-pwa` `^1.3.0` generating ServiceWorker with asset precaching (`sw.js`).
  - **Code Splitting (`manualChunks`)**:
    - `vendor-core`: `react`, `react-dom`
    - `vendor-tree`: `@xyflow/react`, `@dagrejs/dagre`
    - `vendor-charts`: `recharts`
  - **Chunk Size Limit**: `600 kB`.

### 1.2 TypeScript Configuration
- `tsconfig.json` & `tsconfig.node.json`:
  - Target: `ES2020`
  - JSX: `react-jsx`
  - Module Resolution: `bundler`
  - Strict Mode: `true` (`noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitAny: true`, etc.)
  - Output Emission: `noEmit: true` (compilation checked without generating JS files directly, left to Vite).

### 1.3 NPM Scripts (`package.json`)
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```
- **Build Output Directory**: `dist/`

---

## 2. Test Setup, Linting & Typechecking

### 2.1 Test Frameworks & Utilities
- **Unit / Integration / E2E Tests**: None configured (No `vitest`, `jest`, `cypress`, or `playwright` dependencies; no `*.test.*` or `*.spec.*` files in repository).
- **Linter**: No ESLint or Prettier setup in `package.json` or root directory.

### 2.2 Build & Typechecking Verification
- **`npm run build`**: Succeeds cleanly (Execution time ~3.5s, outputs assets to `dist/`).
- **`npx tsc --noEmit`**: **Fails with 5 errors**.
  - **Error 1**: `src/components/shared/ErrorBoundary.tsx:1:8`: `error TS6133: 'React' is declared but its value is never read.`
  - **Error 2**: `src/components/shared/ErrorBoundary.tsx:39:18`: `error TS2339: Property 'location' does not exist on type 'never'.`
  - **Error 3**: `src/components/shared/VanKhanModal.tsx:476:13`: `error TS2353: Object literal may only specify known properties, and 'justify' does not exist in type 'Properties<string | number, string & {}>'.`
  - **Error 4**: `src/components/views/TreeView.tsx:1:44`: `error TS6133: 'useMemo' is declared but its value is never read.`
  - **Error 5**: `src/components/views/TreeView.tsx:229:7`: `error TS2353: Object literal may only specify known properties, and 'pathOptions' does not exist in type 'Edge'.`

> **Note**: Vite build succeeds because Vite transpiles TypeScript with `esbuild` without performing strict type checks during bundle generation. However, R3 acceptance criteria requires 0 TypeScript/Vite errors upon build. Fixing these 5 TypeScript errors is required for 100% type integrity.

---

## 3. Git Status, Remote & GitHub Pages Deployment

### 3.1 Repository & Branch State
- **Current Branch**: `main`
- **Working Tree**: Clean (only untracked `.agents/` metadata folder present).
- **Remote Origin**: `https://github.com/phamphuongdong-sla/giaphaphamtoc.git`
- **Git Branches**:
  - Local: `main`
  - Remote: `origin/main`, `origin/gh-pages`

### 3.2 GitHub Pages Deployment Configuration
- **Live URL**: `https://phamphuongdong-sla.github.io/giaphaphamtoc/`
- **Deploy Command**: `npm run deploy` (`gh-pages -d dist`)
- **Deployment Mechanics**: Publishes contents of `dist/` directory directly to the `gh-pages` branch on GitHub repository.

---

## 4. Overall Directory Tree & Project Architecture

### 4.1 Root Structure
```
/Users/mrdong/giaphaphamtoc/
├── dist/                      # Production build output
├── public/                    # Static assets & PWA manifest
│   ├── icons/                 # PWA icons
│   ├── logoden.png
│   ├── logotrang.png
│   └── manifest.json
├── src/                       # Application source code
├── index.html                 # HTML entry template
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Vite TS configuration
├── tailwind.config.js         # Tailwind CSS styling config
├── postcss.config.js          # PostCSS config for Tailwind
├── .env                       # Firebase & Google Sheets credentials
└── .gitignore                 # Ignored patterns
```

### 4.2 Source Code Architecture (`src/`)
```
src/
├── main.tsx                   # React root entry point
├── App.tsx                    # Main App shell, view routing, modal state
├── RulesModal.tsx             # Gia huấn modal component
├── components/
│   ├── layout/                # Top level layout controls
│   │   ├── NoticeBar.tsx      # Announcement / banner ticker
│   │   ├── SplashScreen.tsx   # Initial loading / splash screen
│   │   └── TopBar.tsx         # Header navigation bar & theme switcher
│   ├── members/               # Family member card components
│   │   ├── MemberItem.tsx     # Member card item (ListView)
│   │   ├── PersonDetailModal.tsx # Detailed view modal for member
│   │   ├── SearchPanel.tsx    # Filter and search input panel
│   │   └── TreeNode.tsx       # Custom React Flow tree node card (TreeView)
│   ├── shared/                # Shared application modals & utilities
│   │   ├── ErrorBoundary.tsx  # Global React Error boundary
│   │   ├── InstallPrompt.tsx  # PWA installation prompt banner
│   │   ├── Legend.tsx         # Visual color legend for tree view
│   │   ├── ManageAuthModal.tsx# Password authentication modal for Manage view
│   │   ├── SettingsModal.tsx  # Notification and theme settings modal
│   │   └── VanKhanModal.tsx   # Ancestor prayer/worship text modal
│   ├── ui/                    # Base UI components
│   │   ├── Icon.tsx           # Lucide icon wrapper
│   │   ├── Modal.tsx          # Reusable modal container
│   │   └── Toast.tsx          # Toast notification system
│   ├── views/                 # Top-level feature views (Lazy Loaded)
│   │   ├── ListView.tsx       # Searchable list view of family members
│   │   ├── TreeView.tsx       # Interactive React Flow + Dagre genealogy tree
│   │   ├── LichView.tsx       # Solar/Lunar calendar and death anniversaries
│   │   ├── DashboardView.tsx  # Demographics and statistics charts (Recharts)
│   │   ├── ManageView.tsx     # Admin CRUD view and Google Sheets sync
│   │   └── manage/            # Sub-components for ManageView
│   │       ├── AppsScriptGuideModal.tsx
│   │       └── DeleteConfirmModal.tsx
├── data/
│   └── giapha.ts              # Static fallback family dataset
├── hooks/
│   ├── useFamilyData.ts       # Central data fetching & state hook
│   └── useNotificationSettings.ts # Push notification settings hook
├── services/
│   └── googleSheets.ts        # Google Sheets Apps Script API client
├── styles/
│   └── index.css              # Global styles, Tailwind base, dark/light theme tokens
├── types/
│   └── index.ts               # Core TypeScript type definitions
└── utils/
    ├── calendarUtils.ts       # Solar-to-Lunar date conversion utilities
    ├── canvasExport.ts        # Image export for tree canvas
    ├── dateUtils.ts           # Date formatting & age calculation utilities
    └── genealogyUtils.ts      # Tree hierarchy layout calculator (Dagre)
```

### 4.3 App Routing & View Architecture
- **State-Based Router**: Navigation is controlled via `viewMode` state (`'list' | 'tree' | 'lich' | 'stats' | 'manage'`) in `App.tsx`.
- **View Transitions**: Integrated with `document.startViewTransition()` API for smooth SPA view switching.
- **Theme Switching Mechanism**: Theme preference (`'dark' | 'light'`) is stored in `localStorage.theme` and applied as `data-theme` attribute on `document.documentElement` (`<html data-theme="light">`).
