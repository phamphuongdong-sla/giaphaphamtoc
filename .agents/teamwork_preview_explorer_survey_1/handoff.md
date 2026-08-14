# Handoff Report — Explorer 1 (Light Mode & Contrast Specialist)

## 1. Observation
Direct codebase observations at `/Users/mrdong/giaphaphamtoc`:

- **Theme switching mechanism**: `src/App.tsx` (lines 35-37, 86-89) manages `theme: 'dark' | 'light'`, stored in `localStorage` and applied to `document.documentElement.setAttribute('data-theme', theme)`.
- **CSS Theme Variables**: `src/styles/index.css` defines `:root` (lines 13-73) and `[data-theme="light"]` (lines 76-109). Custom variables include `--bg-base: #faf8f5`, `--text-primary: #1c1917`, `--text-secondary: #44403c`, `--bg-card: #ffffff`.
- **Member tree index contrast failure**: `src/styles/index.css` line 2196 sets `.member-index` color to `rgba(242, 237, 216, 0.55)` (cream dark-mode color), resulting in a contrast ratio of **1.2:1** against porcelain white `#ffffff` cards.
- **Member role badge contrast failure**: `src/styles/index.css` line 675 sets `.member-role-badge` to `color: var(--gold-mid)` (`#a16207`) on `rgba(201,146,58,0.1)`, resulting in a contrast ratio of **3.8:1** (below WCAG 4.5:1).
- **TreeView card meta contrast failure**: `src/styles/index.css` lines 1221 & 1244 set `.meta-row` (`#94a3b8`) and `.meta-val` (`#cbd5e1`). In `[data-theme="light"]`, there are no specific overrides, so tree node birth/death metadata text renders with contrast ratios of **2.3:1** and **1.5:1** on light cards.
- **TopBar inline style blur & contrast issue**: `src/components/layout/TopBar.tsx` line 40 applies `style={{ color: 'var(--gold-light)', textShadow: '0 2px 12px rgba(201,146,58,0.35)' }}` which creates a dark murky blur in Light Mode. Line 42 uses `<span style={{ color: 'var(--gold)', opacity: 0.8 }}>` giving **2.7:1** contrast.
- **NoticeBar date contrast issue**: `src/components/layout/NoticeBar.tsx` line 34 applies `<span style={{ opacity: 0.5 }}>` on date numbers, reducing contrast to **2.4:1**.
- **DashboardView Recharts Grid issue**: `src/components/views/DashboardView.tsx` lines 528, 566, 755, 798 hardcode `CartesianGrid stroke="rgba(255,255,255,0.08)"`, making grid lines completely invisible on `#ffffff` white card backgrounds.
- **Card shadow gap**: `src/styles/index.css` line 2738 specifies `.member-row` `box-shadow: 0 2px 8px rgba(180, 130, 40, 0.04)`. Requirement R1 requests porcelain white cards `#ffffff` with `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.

---

## 2. Logic Chain
1. **Observation 1**: `document.documentElement` toggles `data-theme="light"` when user switches to Light Mode.
2. **Observation 2**: Component elements styled with global CSS rules without `[data-theme="light"]` overrides inherit dark mode color values (e.g. `.member-index` with `rgba(242, 237, 216, 0.55)`, `.meta-row` with `#94a3b8`, `.meta-val` with `#cbd5e1`).
3. **Observation 3**: In Light Mode, these inheritances and low-opacity inline styles cause text contrast ratios to drop as low as 1.2:1–3.8:1, failing WCAG 2.1 AA 4.5:1 standards.
4. **Observation 4**: Requirement R1 requires member names in Espresso Slate `#1C1917`, titles/roles in `#44403C`, porcelain white `#ffffff` cards, and `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
5. **Conclusion**: Adding explicit `[data-theme="light"]` CSS rules for `.member-index`, `.member-role-badge`, `.tree-card .meta-row`, `.tree-card .meta-val`, updating card shadows, and removing low-opacity inline text styles will achieve 100% WCAG 4.5:1 compliance for Requirement R1.

---

## 3. Caveats
- Read-only investigation: No source code modifications were executed in `src/`. All findings are documented in `analysis.md` and `handoff.md`.
- No assumptions were made regarding third-party libraries; Recharts tooltip and grid behavior were verified directly in `src/components/views/DashboardView.tsx`.

---

## 4. Conclusion
The codebase is cleanly structured and possesses a well-designed theme attribute system (`data-theme="light"`). However, several key elements in Light Mode suffer from contrast failures due to un-overridden dark mode fallback styles or inline low-opacity styles.

### Required Actions for Requirement R1 Implementation:
1. Update `src/styles/index.css` `[data-theme="light"]`:
   - Set `.member-row` and `.tree-card` background to `#ffffff` and `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
   - Set `.member-name` and tree node names to Espresso Slate `#1C1917`.
   - Set `.member-index` color to `#44403C`.
   - Set `.member-role-badge` and `.title-pill` to text `#44403C` on background `#fef3c7`.
   - Add `[data-theme="light"] .tree-card .meta-row` (`#44403C`) and `.meta-val` (`#1C1917`).
2. Update `src/components/layout/TopBar.tsx`:
   - Remove text blur text-shadow in Light Mode and adjust kicker/subtitle colors to `#44403C`.
3. Update `src/components/layout/NoticeBar.tsx`:
   - Remove `opacity: 0.5` on date text.
4. Update `src/components/views/DashboardView.tsx`:
   - Update `CartesianGrid` `stroke` for Light Mode contrast and polish `CustomTooltip`.

---

## 5. Verification Method
To independently verify the investigation findings:
1. **File Inspection**:
   - Inspect `src/styles/index.css` at lines 76-109, 675, 1221, 1244, 2196, 2543-2586, 2738-2752, 2951-2985, 2987-3000.
   - Inspect `src/components/layout/TopBar.tsx` (lines 40-48), `NoticeBar.tsx` (line 34), `DashboardView.tsx` (lines 109-147, 528, 566, 755, 798).
2. **Build Verification**:
   - Run `npm run build` in root workspace `/Users/mrdong/giaphaphamtoc` to confirm zero TypeScript and Vite build errors.
3. **Invalidation Conditions**:
   - If any member name in Light Mode does not use `#1C1917`, or if any title/role text contrast drops below 4.5:1, the R1 acceptance criterion fails.
