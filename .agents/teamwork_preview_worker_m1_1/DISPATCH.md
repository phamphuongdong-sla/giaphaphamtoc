# Dispatch for Worker M1 (Light Mode Color Palette & Contrast Upgrade)

**Target Milestone**: M1 (Requirement R1)
**Scope**: Light Mode Color Palette & WCAG 4.5:1 Contrast Upgrade in `src/styles/index.css`, `src/components/layout/TopBar.tsx`, `src/components/layout/NoticeBar.tsx`, and `src/components/views/DashboardView.tsx`.

## Objective
Implement Requirement R1 based on Explorer 1's handoff report:
1. Update `src/styles/index.css` under `[data-theme="light"]`:
   - Set porcelain white cards `#ffffff` with soft multi-layer shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
   - Set member names in bold Espresso Slate `#1C1917`.
   - Set `.member-index` color to `#44403C` (WCAG 4.5:1 compliant).
   - Set `.member-role-badge` and `.title-pill` text to `#44403C` on background `#fef3c7`.
   - Add `[data-theme="light"] .tree-card .meta-row` (`#44403C`) and `.meta-val` (`#1C1917`) to fix TreeView node contrast.
2. Update `src/components/layout/TopBar.tsx`:
   - Remove blurry text shadow in Light Mode and adjust title/subtitle text colors to high contrast `#1C1917` / `#44403C`.
3. Update `src/components/layout/NoticeBar.tsx`:
   - Remove low-opacity (`opacity: 0.5`) on date numbers so date text achieves WCAG 4.5:1 contrast.
4. Update `src/components/views/DashboardView.tsx`:
   - Adjust `CartesianGrid` `stroke` for Light Mode (`rgba(0,0,0,0.08)` or dynamic theme variable) so grid lines are clear on white cards.
   - Polish `CustomTooltip` styling for Light Mode contrast.

## Verification
- Run `npm run build` to ensure zero compilation errors.
- Verify CSS selectors and rules for `[data-theme="light"]`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your changes to code files and report your work in `/Users/mrdong/giaphaphamtoc/.agents/teamwork_preview_worker_m1_1/handoff.md`.
