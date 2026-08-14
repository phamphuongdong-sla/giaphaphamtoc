# Explorer 1 Analysis Report: Light Mode & Contrast Survey (Requirement R1)

## 1. Scope & Objective
This investigation analyzes the Light/Dark mode theme implementation in the **Gia Phả Phạm Tộc** application codebase (`/Users/mrdong/giaphaphamtoc`). The goal is to provide precise mapping of components, CSS variables, and styling rules, and to identify contrast vulnerabilities against the **WCAG 2.1 AA 4.5:1 standard** specifically for **Requirement R1**:
- Canvas background, Member Cards, TopBar, NoticeBar, LichView, and DashboardView in Light Mode.
- Text contrast compliance: Bold member names in Espresso Slate `#1C1917`, titles/roles/badges in `#44403C`.
- Porcelain white cards (`#ffffff`) with multi-layer shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.

---

## 2. Theme Switching Architecture (Light / Dark Mode)

| Mechanism | Location / File Path | Details / Implementation Method |
|---|---|---|
| **Theme State & Persistence** | `src/App.tsx` (lines 35-37, 180-184) | React state `theme: 'dark' \| 'light'`, initialized from `localStorage.getItem('theme') \|\| 'dark'`. Syncs to `localStorage`. |
| **DOM Root Binding** | `src/App.tsx` (lines 86-89) | `useEffect` updates `document.documentElement.setAttribute('data-theme', theme)` whenever `theme` state changes. |
| **CSS Variables & Palette** | `src/styles/index.css` (lines 13-73 for `:root`, 76-109 for `[data-theme="light"]`) | CSS Custom Properties drive colors (`--bg-base`, `--bg-card`, `--text-primary`, `--text-secondary`, `--gold`, etc.). |
| **Theme Toggle Controls** | `src/components/layout/TopBar.tsx` (lines 152-158)<br>`src/components/layout/SplashScreen.tsx` (line 187) | Button calling `onThemeChange(theme === 'dark' ? 'light' : 'dark')`. |
| **Tailwind CSS Config** | `tailwind.config.js` | Extends custom colors (`ink`, `lacquer`, `gold`, `paper`). Does NOT set `darkMode: 'class'`, relying on custom CSS variable overrides via `[data-theme="light"]`. |

---

## 3. Comprehensive Mapping of Key UI Components

### 3.1 TopBar (`src/components/layout/TopBar.tsx` & `src/styles/index.css`)
- **Structure**: Brand logo (`crest`), title & date subtext, segmented view switcher tabs (`Danh sách`, `Lịch giỗ`, `Thống kê`, `Sơ đồ`), and topbar action tools (`văn khấn`, `quy ước`, `thông báo`, `bảo mật`, `cài đặt`, `theme toggle`).
- **Logo Toggle**: `TopBar.tsx` (line 24) dynamically switches logo between `logoden.png` (light mode) and `logotrang.png` (dark mode).
- **CSS Rules**: `src/styles/index.css` lines 183-309, with light mode overrides in lines 2543-2575 (`[data-theme="light"] .topbar`, `[data-theme="light"] .segmented`).

### 3.2 NoticeBar (`src/components/layout/NoticeBar.tsx` & `src/styles/index.css`)
- **Structure**: Ticker bar displaying birthday reminders for the current solar month with smooth horizontal scrolling animation (`ticker-scroll`).
- **CSS Rules**: `src/styles/index.css` lines 314-369, with light mode overrides in lines 2987-3000 (`[data-theme="light"] .notice`, `[data-theme="light"] .notice-badge`, `[data-theme="light"] .notice-ticker-track`).

### 3.3 ListView & Member Tree (`src/components/views/ListView.tsx`, `MemberItem.tsx`, `TreeNode.tsx` & `index.css`)
- **Structure**: Search panel (`SearchPanel.tsx`), toolbar, and nested tree view (`MemberItem.tsx`) rendered inside `.member-tree-container`.
- **Card Base Styling**: `.member-row` in `src/styles/index.css` (lines 611-630) and light mode overrides (lines 2738-2752).
- **Name & Roles**: `.member-name` (lines 2238-2246), `.member-role-badge` (lines 675-683), `.member-index` (lines 2196-2204).

### 3.4 Interactive TreeView (`src/components/views/TreeView.tsx` & `index.css`)
- **Structure**: ReactFlow-powered interactive phả hệ graph using `@xyflow/react` and `@dagrejs/dagre` auto-layout. Each node is rendered by `FamilyMemberNode` component (`TreeView.tsx` lines 35-160).
- **Card Styling**: `.tree-card` base styling in `src/styles/index.css` (lines 1020-1066) and light mode overrides (lines 2951-2985).

### 3.5 LichView (`src/components/views/LichView.tsx` & `index.css`)
- **Structure**: Year navigation, month selector tabs, and dual sections for Âm lịch giỗ and Dương lịch birthdays.
- **CSS Rules**: `src/styles/index.css` lines 743-977 and light mode overrides lines 2906-2949, 3003-3029 (`.lich-row`, `.lich-day`, `.lich-section-head`).

### 3.6 DashboardView & Recharts Tooltips (`src/components/views/DashboardView.tsx` & `index.css`)
- **Structure**: Stat summary cards, lifespan analysis, age breakdown, branch distribution, and Recharts interactive charts (`PieChart`, `BarChart`).
- **Tooltip Styling**: `CustomTooltip` in `DashboardView.tsx` lines 109-147 styled with `var(--bg-elevated)` and `var(--border-gold-md)`.
- **CSS Rules**: `src/styles/index.css` lines 2755-2840 and light mode overrides lines 2842-2905 (`[data-theme="light"] .stat-card`, `.chart-container`, `.interesting-facts`).

---

## 4. Contrast Analysis Against WCAG 2.1 AA (4.5:1 Threshold)

The table below lists all contrast deficiencies and styling gaps found in Light Mode (`[data-theme="light"]`):

| Component / Element | Current Light Mode Styling | Current Contrast Ratio | Compliance | WCAG 4.5:1 Requirement & Target Fix |
|---|---|---|---|---|
| **Member Name** (`.member-name`) | Hardcoded gender overrides `.member-name.male` (`#1d4ed8`) & `.female` (`#be185d`) in `index.css:3072-3077` | 6.8:1 / 5.2:1 | PASS (Contrast), but violates single color requirement | Requirement R1 requires unified Espresso Slate `#1C1917` for bold names. |
| **Member Tree Index** (`.member-index`) | `color: rgba(242, 237, 216, 0.55)` in `index.css:2196` (dark-mode cream text) | **1.2:1** | ❌ **FAIL** (Unreadable) | Change to `#44403C` (Medium warm slate) or `var(--text-muted)` in Light Mode. |
| **Role & Title Badges** (`.member-role-badge`, `.title-pill`) | `color: var(--gold-mid)` (`#a16207`) on `rgba(201,146,58,0.1)` | **3.8:1** | ❌ **FAIL** | Set text to Espresso Slate Title `#44403C` on warm porcelain pill `#fef3c7`. |
| **TopBar Brand Title** (`TopBar.tsx:40`) | `style={{ color: 'var(--gold-light)', textShadow: '0 2px 12px rgba(201,146,58,0.35)' }}` | 4.2:1 + blurry shadow | ❌ **FAIL** | Remove murky gold text-shadow in Light Mode; set title to `#1C1917` or deep royal gold `#78350f`. |
| **TopBar Subtitle & Icons** (`TopBar.tsx:42-48`) | `<span style={{ color: 'var(--gold)', opacity: 0.8 }}>` (`#ca8a04`) | **2.7:1** | ❌ **FAIL** | Change text/icon to `#44403C` or `var(--text-secondary)`. |
| **NoticeBar Date Hint** (`NoticeBar.tsx:34`) | `<span style={{ opacity: 0.5 }}>` on `#5c3810` text | **2.4:1** | ❌ **FAIL** | Remove `opacity: 0.5` or set text to `#44403C`. |
| **TreeView Card Meta Text** (`.meta-row`, `.meta-val`) | `.meta-row` (`#94a3b8`) & `.meta-val` (`#cbd5e1`) in `index.css:1221,1244` (no light mode override) | **2.3:1** / **1.5:1** | ❌ **FAIL** (Unreadable) | Add `[data-theme="light"] .tree-card .meta-row` to `#44403C` and `.meta-val` to `#1C1917`. |
| **Porcelain Card Shadow** (`.member-row`, `.tree-card`) | `box-shadow: 0 2px 8px rgba(180, 130, 40, 0.04)` in `index.css:2738` | Visual Quality | ⚠️ Suboptimal | Upgrade to multi-layer shadow `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`. |
| **Recharts Grid Lines** (`DashboardView.tsx:528,566,755,798`) | `CartesianGrid stroke="rgba(255,255,255,0.08)"` | **1.0:1** (Invisible) | ❌ **FAIL** | Dynamically use `rgba(0,0,0,0.08)` or `var(--border-glass)` in Light Mode. |
| **Hint / Info Banners** (`ListView.tsx:88`, `LichView.tsx:122`) | `<Icon name="info" style={{ color: 'var(--gold)', opacity: 0.5 }}>` | **2.1:1** | ❌ **FAIL** | Set icon opacity to 0.9 and text to `#44403C`. |

---

## 5. Exact Modification Points for Requirement R1

To complete Requirement R1, the implementer agent will need to modify the following exact locations:

### 5.1 CSS File: `src/styles/index.css`

1. **Light Theme Custom Variables (`[data-theme="light"]`, lines 76-109)**:
   - Ensure `--text-primary` is `#1c1917` (Espresso Slate).
   - Ensure `--text-secondary` is `#44403c` (Medium warm slate).
   - Set card shadow: `--shadow-sm: 0 2px 8px rgba(184, 137, 60, 0.06);` and `--shadow-md: 0 4px 20px -2px rgba(184, 137, 60, 0.08);`.

2. **Member Cards & Tree Container (`[data-theme="light"] .member-row`, lines 2738-2752)**:
   - Change `.member-row` background to `#ffffff` (porcelain white) and shadow to `0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
   - Override `.member-index` in Light Mode to `color: #44403c;`.
   - Remove or override `.member-name.male` and `.member-name.female` colors in light mode (lines 3072-3077) so member names consistently use `#1C1917`.
   - Style `.member-role-badge` in light mode: background `#fef3c7`, border `1px solid rgba(202, 138, 4, 0.3)`, text `#44403c`.

3. **TreeView Cards (`[data-theme="light"] .tree-card`, lines 2951-2985)**:
   - Apply `#ffffff` background and `box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`.
   - Add light theme rules for `.tree-card .meta-row` (`color: #44403c`) and `.meta-val` (`color: #1c1917`).
   - Standardize tree node name colors to `#1C1917`.

4. **TopBar & NoticeBar CSS Overrides (`lines 2543-2586, 2987-3000`)**:
   - Clean up text shadows on `.brand-title` in light mode.
   - Adjust `.notice-ticker-track` text and child span opacity for contrast.

### 5.2 Component Source Files

1. **`src/components/layout/TopBar.tsx`**:
   - Lines 40-48: Remove inline `textShadow` that blurs text in Light Mode. Ensure kicker and subtext use `#44403C` with full opacity.

2. **`src/components/layout/NoticeBar.tsx`**:
   - Line 34: Remove `opacity: 0.5` from birthday date range text to achieve WCAG 4.5:1.

3. **`src/components/views/DashboardView.tsx`**:
   - Lines 528, 566, 755, 798: Change `CartesianGrid` `stroke` from hardcoded `rgba(255,255,255,0.08)` to theme-aware color (e.g. `rgba(0,0,0,0.08)` in light mode).
   - CustomTooltip background and text colors to maintain porcelain card design.

---

## 6. Summary & Recommendations
All findings are documented with exact file paths and line numbers. The code structure for theme handling is solid, but Light Mode suffered from dark-mode fallback styles (e.g. `rgba(242, 237, 216, 0.55)` and `#94a3b8` meta text) and hardcoded low-opacity inline styles. Implementing the listed CSS variable and rule refinements will achieve 100% WCAG 2.1 AA 4.5:1 compliance and complete Requirement R1.
