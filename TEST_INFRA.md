# E2E Test Infra: Gia Phả Phạm Tộc UI/UX Upgrade

## Test Philosophy
- Requirement-driven verification covering UI/UX light mode standards, member card styling, TypeScript type safety, production compilation, and GitHub Pages deployment.

## Feature Inventory & Test Coverage
| # | Feature | Source | Verification Method |
|---|---------|--------|---------------------|
| 1 | Light Mode Palette & WCAG 4.5:1 | R1 | CSS rules inspection & text contrast verification |
| 2 | Porcelain White Cards & Shadow | R1 | CSS rules inspection & `box-shadow` verification |
| 3 | TopBar, NoticeBar, Dashboard & Recharts Polish | R1 | Component props, contrast & Recharts grid/tooltip verification |
| 4 | ListView & TreeView Member Cards (Male/Female/Ancestor) | R2 | Class assignment & background color verification (`#f0f9ff`, `#fdf2f8`, `#fef3c7`) |
| 5 | 3D Hover Effects & Transitions | R2 | CSS transition `200ms ease-out` & transform `translateY(-4px)` verification |
| 6 | TypeScript Cleanup & Zero Error Build | R3 | `npx tsc --noEmit` & `npm run build` zero errors |
| 7 | Production Build & GitHub Deployment | R3 | Build output in `dist/` & `npm run deploy` to `gh-pages` |
