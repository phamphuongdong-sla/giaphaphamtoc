# Comprehensive Analysis: Member Cards & Tree Nodes Redesign Survey (Requirement R2)

**Explorer Agent**: Explorer 2 (Member Cards & Tree Nodes Specialist)  
**Date**: 2026-08-14  
**Target Repository**: `/Users/mrdong/giaphaphamtoc`  
**Working Directory**: `/Users/mrdong/giaphaphamtoc/.agents/teamwork_preview_explorer_survey_2`  

---

## 1. Overview of Member Card Components

The application renders member cards across three primary UI surfaces:

| Component Name | File Path | Usage & Purpose | Key Elements |
|---|---|---|---|
| `FamilyMemberNode` | `src/components/views/TreeView.tsx` (lines 35–160) | Custom ReactFlow node component for TreeView | `<article className="tree-card ...">`, `.tree-card-accent-line`, `.tree-card-header` (`.gen-badge`, `.title-pill`, `.status-pill`), `.tree-card-name-row` (`.gender-tag`, `.name`), `.tree-card-meta` (birth/death dates), floating `.tree-toggle-pill` button. |
| `MemberItem` | `src/components/members/MemberItem.tsx` (lines 19–182) | Stacked list item card in ListView | `<div className="member-row member-row-stacked micro-card-hover ...">`, `.member-index`, `.member-gen-bar`, `.member-info-col` (`.member-name-row`, `.member-name`, `.member-deceased-icon`, `.member-role-badge`, `.member-dates-line`), toggle chevron button. |
| `TreeNode` | `src/components/members/TreeNode.tsx` (lines 17–171) | Legacy/fallback DOM tree node component | `<article className="tree-card ...">` with inline dimensions (300x240px), `.gen-badge`, `.title-pill`, `.name`, birth/death meta, toggle button. |
| `PersonDetailModal` | `src/components/members/PersonDetailModal.tsx` (lines 19–366) | Detail modal card popped upon clicking any member card | `.detail-head` with avatar placeholder, `.detail-head-name`, `.detail-subtitle`, `.detail-grid` (info fields), lineage path, children chips, bio. |

---

## 2. Current Male, Female, and Ancestor (Thủy Tổ) Card Rendering & Styling

### 2.1 TreeView Nodes (`FamilyMemberNode` in `TreeView.tsx`)

- **Class application logic** (lines 68–69):
  ```tsx
  className={`tree-card ${isRoot ? 'root-node' : ''} ${branch ? 'branch' : ''} ${gender === 'male' ? 'male' : (gender === 'female' ? 'female' : '')} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}`}
  ```

- **Current CSS rules in `src/styles/index.css`**:
  - **Dark Mode**:
    - Ancestor (`.tree-card.root-node`, lines 1055–1066): Dark amber background (`linear-gradient(145deg, rgba(40, 30, 15, 0.9), rgba(20, 16, 10, 0.95))`), gold border (`rgba(234, 179, 8, 0.6)`), gold header line (`linear-gradient(90deg, #b8860b, #fef08a, #b8860b)`), name `#fef08a`.
    - Male (`.tree-card.male`, lines 3047–3049, 3056–3058): Left border `3px solid #3b82f6`, name `#bfdbfe` or `#e0f2fe`.
    - Female (`.tree-card.female`, lines 3050–3055): Left border `3px solid #ec4899`, name `#fbcfe8` or `#fce7f3`.
  - **Light Mode (`[data-theme="light"]`)**:
    - Ancestor (`.tree-card.root-node`, lines 2963–2967): `background: linear-gradient(145deg, #fffdf2, #fef3c7); border: 1.5px solid #ca8a04; box-shadow: 0 10px 28px rgba(202, 138, 4, 0.22);`.
    - Male (`.tree-card.male`, lines 2969–2973, 3062–3064): `background: linear-gradient(145deg, #ffffff, #f0f9ff); border-color: rgba(59, 130, 246, 0.3); border-left: 3px solid #2563eb; name color: #1d4ed8;`.
    - Female (`.tree-card.female`, lines 2975–2979, 3059–3061): `background: linear-gradient(145deg, #ffffff, #fdf2f8); border-color: rgba(236, 72, 153, 0.3); border-left: 3px solid #db2777; name color: #be185d;`.

### 2.2 ListView Cards (`MemberItem` in `MemberItem.tsx`)

- **Class application logic** (lines 93, 116):
  ```tsx
  <div className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'royal-ancestor-glow' : ''}`}>
    ...
    <span className={`member-name ${data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : '')}`}>
  ```

- **Current CSS rules in `src/styles/index.css`**:
  - `[data-theme="light"] .member-row` (lines 2738–2742): `background: #ffffff; border-color: rgba(180, 130, 40, 0.18); box-shadow: 0 2px 8px rgba(180, 130, 40, 0.04);`.
  - **Deficiency identified**: Currently, `MemberItem` does **NOT** apply gender (`male`, `female`) or ancestor (`root-node`, `ancestor`) classes to the `.member-row` container element itself! Only `.member-name` gets `.male` or `.female`. As a result, all member cards in ListView display plain `#ffffff` background in Light Mode, lacking the distinct Sapphire Blue, Quartz Pink, and Royal Gold backgrounds required by R2.

---

## 3. Formatting and Display of Names, Titles, Gender Icons, and Dates

### 3.1 Names & Titles
- **Name cleaning & Extraction**: Utility functions in `src/utils/genealogyUtils.ts`:
  - `cleanName(name)` (lines 41–44): Removes spouse/role prefixes such as `Vợ:`, `Chồng:`, `Bà cả:`, `Bà hai:`, `Dâu:`, `Rể:` using `CLEAN_SPOUSE_PATTERN`.
  - `getNameRole(name)` (lines 46–50): Extracts title/role string e.g. `Thủy Tổ`, `Bà Cả`, `Bà Hai`, `Bà Ba`, `Vợ`, `Chồng`, `Dâu`, `Rể`.
- **Title Badges**:
  - In TreeView (`TreeView.tsx:80`): Rendered inside `.tree-card-badges` as `<span className="title-pill">{badge}</span>`.
  - In ListView (`MemberItem.tsx:127`): Rendered as `<span className="member-role-badge">{badge}</span>`.

### 3.2 Gender Icons & Badges
- In TreeView (`TreeView.tsx:96–108`):
  - Ancestor (Root): `<span className="gender-tag root" title="Cụ Thủy Tổ"><Icon name="award" size={12} /></span>`
  - Male: `<span className="gender-tag male" title="Nam"><Icon name="user" size={11} /></span>`
  - Female: `<span className="gender-tag female" title="Nữ"><Icon name="user" size={11} /></span>`
- In ListView (`MemberItem.tsx:101–107`):
  - Spouses display `⚭` symbol in `.member-index`.
  - Deceased members display `<Icon name="cross" size={11} className="member-deceased-icon" />`.

### 3.3 Birth and Death Dates
- Processed via `formatBirthDisplay(data)` and `formatDeathDisplay(data)` from `src/utils/dateUtils.ts`.
- In TreeView (`TreeView.tsx:113–128`): Rendered with `.meta-row` containing `<Icon name="sun" size={11} />` for birth and `<Icon name="moon" size={11} />` for death.
- In ListView (`MemberItem.tsx:130–141`): Rendered on dedicated lines `.member-dates-line`.

---

## 4. Required Modifications for Requirement R2

Requirement R2 dictates:
1. **Distinct Color Schemes**:
   - **Sapphire Male**: Background `/f0f9ff` (`#f0f9ff`) in Light Mode, refined Sapphire blue border (`rgba(59, 130, 246, 0.3)` / `rgba(186, 230, 253, 0.8)`), dark blue name text `#1e3a8a` / `#1d4ed8`.
   - **Quartz Female**: Background `/fdf2f8` (`#fdf2f8`) in Light Mode, Quartz pink border (`rgba(236, 72, 153, 0.3)` / `rgba(251, 207, 232, 0.8)`), dark rose name text `#831843` / `#be185d`.
   - **Royal Gold Ancestor (Thủy Tổ)**: Background `/fef3c7` (`#fef3c7`) in Light Mode, Imperial Gold border (`#d97706` / `#ca8a04`), deep amber text `#78350f` / `#92400e`.
2. **ListView Card Background Alignment**:
   - Update `MemberItem.tsx` so the `.member-row` outer element receives gender/ancestor container classes (`male`, `female`, `root-node`, `ancestor`).
3. **Card Borders & Accents**:
   - Clean, distinct left border indicators (`4px solid #2563eb` for Male, `4px solid #db2777` for Female, `4px solid #d97706` for Ancestor).
4. **3D Hover Effects & Smooth Transitions**:
   - Transition: `transition: all 200ms ease-out` (or `cubic-bezier(0.16, 1, 0.3, 1)`).
   - Hover transform: `transform: translateY(-4px) scale(1.008)` for TreeView, `transform: translateY(-3px) scale(1.005)` for ListView.
   - Shadow elevation: Soft multi-layered 3D box shadows (`box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(184, 137, 60, 0.12)`).

---

## 5. Exact File Paths, Line Numbers, CSS Classes, and Components to Modify

| File Path | Line Range | Target Component / CSS Rule | Proposed Modification | Rationale |
|---|---|---|---|---|
| `src/components/members/MemberItem.tsx` | Line 93 | `<div className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'royal-ancestor-glow' : ''}`}>` | Update to: `<div className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'root-node ancestor' : (data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : ''))}`}>` | Allows `.member-row` container in ListView to inherit Sapphire Male, Quartz Female, and Royal Gold Ancestor background colors & borders in Light Mode. |
| `src/components/members/TreeNode.tsx` | Line 68 | `<article className={`tree-card ${dark ? 'dark' : ''} ${branch ? 'branch' : ''} ${data.isSpouse ? 'spouse' : ''} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}` ...>` | Add `${data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : '')} ${currentGen === 1 ? 'root-node' : ''}` | Ensures legacy DOM tree cards share the exact same styling classes. |
| `src/styles/index.css` | Lines 1020–1052 | `.tree-card` & `.tree-card:hover` | Set `transition: all 200ms ease-out;` and adjust hover elevation shadow & `transform: translateY(-4px) scale(1.008);` | Satisfies 200ms ease-out 3D hover transition spec for tree cards. |
| `src/styles/index.css` | Lines 2738–2752 | `[data-theme="light"] .member-row` & hover | Add specific rules for `[data-theme="light"] .member-row.male` (`bg: #f0f9ff`, border: `rgba(186,230,253,0.8)`, left border: `4px solid #2563eb`), `[data-theme="light"] .member-row.female` (`bg: #fdf2f8`, border: `rgba(251,207,232,0.8)`, left border: `4px solid #db2777`), `[data-theme="light"] .member-row.ancestor` (`bg: #fef3c7`, border: `1.5px solid #d97706`, left border: `4px solid #b45309`). Update hover transition to `200ms ease-out` and `transform: translateY(-3px) scale(1.005)`. | Provides complete Sapphire Male, Quartz Female, and Royal Gold Ancestor card styling for ListView. |
| `src/styles/index.css` | Lines 2951–2985 | `[data-theme="light"] .tree-card`, `.tree-card.root-node`, `.tree-card.male`, `.tree-card.female` | Ensure `[data-theme="light"] .tree-card.male` has background `#f0f9ff`, `[data-theme="light"] .tree-card.female` has background `#fdf2f8`, `[data-theme="light"] .tree-card.root-node` has background `#fef3c7`, and set transition to `200ms ease-out`. | Fixes Light Mode TreeView card colors, contrast, and hover physics. |
| `src/styles/index.css` | Lines 3047–3077 | `.tree-card.male`, `.tree-card.female`, `.member-name.male`, `.member-name.female` | Fine-tune name colors in light mode (`#1e3a8a` for male, `#831843` for female, `#78350f` for root-node). | Guarantees WCAG 4.5:1 contrast compliance for text on Sapphire, Quartz, and Gold backgrounds. |
| `src/styles/index.css` | Lines 3270–3277 | `.micro-card-hover` | Change transition from `0.25s` to `200ms ease-out`. | Aligns micro card hover timing across the system. |

---

## 6. Synthesis & Recommendations for Implementation Agent

1. **Uniformity Across Views**:
   By adding gender and ancestor classes to `MemberItem.tsx`'s root `.member-row`, both TreeView and ListView will present a unified, luxury visual language.
2. **Contrast & Legibility**:
   Ensure text inside `#f0f9ff` (Sapphire) uses dark blue `#1e3a8a`, text inside `#fdf2f8` (Quartz) uses dark rose `#831843`, and text inside `#fef3c7` (Royal Gold) uses dark amber `#78350f`.
3. **Verification**:
   Validate via `npm run build` to confirm zero TypeScript/Vite errors and inspect both light and dark mode rendering in the browser.
