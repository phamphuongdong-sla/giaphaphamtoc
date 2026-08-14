# Project: Gia Phả Phạm Tộc UI/UX Light Mode & Member Cards Upgrade

## Architecture
- **Framework & Libraries**: React 18 (SPA with state-driven view routing in `App.tsx`), TypeScript 5.0.2, Vite 4.3.9, Tailwind CSS 3.3.2, `@xyflow/react` for TreeView, `recharts` for DashboardView.
- **Theme Architecture**: `data-theme="light" | "dark"` attribute on `document.documentElement` managed by `App.tsx` and styled in `src/styles/index.css`.
- **View Hierarchy**:
  - `ListView` (`src/components/views/ListView.tsx`, `MemberItem.tsx`)
  - `TreeView` (`src/components/views/TreeView.tsx`, `TreeNode.tsx`)
  - `DashboardView` (`src/components/views/DashboardView.tsx`)
  - `LichView` (`src/components/views/LichView.tsx`)
  - `ManageView` (`src/components/views/ManageView.tsx`)
  - Shared layout components: `TopBar.tsx`, `NoticeBar.tsx`, `PersonDetailModal.tsx`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Light Mode Color Palette & Contrast | Optimize canvas background (`#faf8f5`), TopBar, NoticeBar, ListView, DashboardView background and WCAG 4.5:1 contrast (Espresso Slate `#1C1917` bold names, `#44403C` titles/roles) | M1 | R1 Survey |
| 2 | Porcelain White Cards & Multi-layer Shadow | Update porcelain white cards (`#ffffff`) with soft shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)` | M1 | R1 Survey |
| 3 | TopBar, NoticeBar, Button & Tooltip Polish | Remove blurry text shadow in TopBar, fix NoticeBar date opacity, fix Recharts grid lines & tooltips in DashboardView, polish light/dark button states | M1 | R1 Survey |
| 4 | Redesign Member Cards in ListView & TreeView | Differentiate Sapphire Male (`#f0f9ff`), Quartz Female (`#fdf2f8`), Royal Gold Ancestor (`#fef3c7`) cards in both ListView (`MemberItem.tsx`) and TreeView (`TreeView.tsx`, `TreeNode.tsx`) | M2 | R2 Survey |
| 5 | Card Layout & 3D Hover Effects | Improve layout for names, titles (*Thủy Tổ*, *Bà Cả*, *Bà Hai*, ...), gender icons, birth/death dates; set 3D hover lift with `200ms ease-out` transition | M2 | R2 Survey |
| 6 | TypeScript Cleanup & Zero-Error Build | Fix 5 pre-existing TS errors (`ErrorBoundary.tsx`, `VanKhanModal.tsx`, `TreeView.tsx`) to guarantee `npm run build` and `tsc --noEmit` exit code 0 | M3 | R3 Survey |
| 7 | Visual Verification & GitHub Deployment | Perform visual browser verification across views and deploy build output to `main` and `gh-pages` (`npm run deploy`) | M3 | R3 Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Light Mode Color Palette & Contrast | R1: `index.css`, `TopBar.tsx`, `NoticeBar.tsx`, `DashboardView.tsx` theme variables, WCAG contrast 4.5:1, shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)` | none | DONE |
| M2 | Member Cards & Tree Nodes Redesign | R2: `MemberItem.tsx`, `TreeView.tsx`, `TreeNode.tsx`, `PersonDetailModal.tsx`, gender card backgrounds (`#f0f9ff`, `#fdf2f8`, `#fef3c7`), 3D hover `200ms ease-out` | M1 | DONE |
| M3 | TypeScript Fixes, Build Verification & Deployment | R3: Fix 5 TS errors, `npm run build`, browser check, git commit & push to `main` and `gh-pages` | M1, M2 | PLANNED |

## Interface Contracts
### `[data-theme="light"]` Theme Contracts
- `[data-theme="light"] .member-row` / `.tree-card`: background `#ffffff`, `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
- `[data-theme="light"] .member-row.male` / `.tree-card.male`: background `linear-gradient(145deg, #ffffff, #f0f9ff)`, border `#bfdbfe` / `#2563eb`.
- `[data-theme="light"] .member-row.female` / `.tree-card.female`: background `linear-gradient(145deg, #ffffff, #fdf2f8)`, border `#fbcfe8` / `#db2777`.
- `[data-theme="light"] .member-row.ancestor` / `.tree-card.root-node`: background `linear-gradient(145deg, #fffdf2, #fef3c7)`, border `#fde047` / `#ca8a04`.
- Contrast targets: Member names in Espresso Slate `#1C1917` (bold), subtitles/roles in `#44403C` (WCAG 4.5:1 compliant).

## Code Layout
- `src/styles/index.css`: Global theme variables, card styles, transitions, badges, and contrast rules.
- `src/components/members/MemberItem.tsx`: ListView member card component.
- `src/components/views/TreeView.tsx`: ReactFlow custom tree node renderer (`FamilyMemberNode`).
- `src/components/members/TreeNode.tsx`: Standalone tree node component.
- `src/components/members/PersonDetailModal.tsx`: Person detail modal card.
- `src/components/layout/TopBar.tsx`: Application top header bar.
- `src/components/layout/NoticeBar.tsx`: Notice & announcement bar.
- `src/components/views/DashboardView.tsx`: Analytics view with Recharts graphs.
- `src/components/shared/ErrorBoundary.tsx`: React Error Boundary component.
- `src/components/shared/VanKhanModal.tsx`: Văn khấn modal component.
