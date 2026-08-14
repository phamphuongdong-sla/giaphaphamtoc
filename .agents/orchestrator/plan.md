# Master Execution Plan: Gia Phả Phạm Tộc UI/UX Light Mode & Member Cards Upgrade

## Objectives
1. **R1: Light Mode Color Palette & Contrast**
   - Canvas background, member cards, TopBar, NoticeBar, ListView, DashboardView.
   - WCAG 4.5:1 text contrast: Espresso Slate `#1C1917` for bold names, `#44403C` for titles/roles.
   - Porcelain white cards `#ffffff` with soft multi-layer shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
   - Buttons, TopBar, NoticeBar, and Recharts Tooltips look great in both Light and Dark modes.

2. **R2: Redesign Member Cards & Tree Nodes**
   - Both ListView and TreeView cards.
   - Distinct colors: Male (Sapphire `/f0f9ff` / `#f0f9ff`), Female (Quartz `/fdf2f8` / `#fdf2f8`), Ancestor (Royal Gold `#fef3c7`).
   - Improved layout: name, title (*Thủy Tổ*, *Bà Cả*, *Bà Hai*, ...), gender icon, birth/death dates.
   - Smooth 3D hover effects with 200ms ease-out transition.

3. **R3: Visual Verification & Deployment**
   - `npm run build` with 0 errors.
   - Browser check across screens.
   - Git commit and push to `main` and `gh-pages`.

## Phases & Strategy
- **Phase 0: Survey & Codebase Exploration**
  - Dispatch 3 parallel Explorers to inspect existing React/Tailwind/CSS components, theme switching mechanisms, card layouts, tree nodes, build setup, and gh-pages scripts.
- **Phase 1: Milestone Decomposition (PROJECT.md)**
  - Synthesize findings into `PROJECT.md`.
- **Phase 2: Execution of Milestones**
  - Iterate: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate check.
- **Phase 3: Verification & GitHub Deployment**
  - Build verification, browser check, push to `main` and `gh-pages`.
