# Handoff Report — Explorer 2 (Member Cards & Tree Nodes Specialist)

**Working Directory**: `/Users/mrdong/giaphaphamtoc/.agents/teamwork_preview_explorer_survey_2`  
**Target Codebase**: `/Users/mrdong/giaphaphamtoc`  
**Date**: 2026-08-14  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

### 1.1 Source Components Inspected
- `src/components/views/TreeView.tsx` (lines 35–160):
  - `FamilyMemberNode` defines the custom ReactFlow node renderer.
  - Line 68: Applies container classes:
    ```tsx
    className={`tree-card ${isRoot ? 'root-node' : ''} ${branch ? 'branch' : ''} ${gender === 'male' ? 'male' : (gender === 'female' ? 'female' : '')} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}`}
    ```
- `src/components/members/MemberItem.tsx` (lines 19–182):
  - Line 93: Defines ListView item container:
    ```tsx
    <div className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'royal-ancestor-glow' : ''}`}>
    ```
  - Line 116: Applies gender class **only** to `.member-name`:
    ```tsx
    <span className={`member-name ${data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : '')}`}>
    ```
- `src/components/members/TreeNode.tsx` (lines 17–171):
  - Legacy DOM node component for non-ReactFlow rendering.
- `src/components/members/PersonDetailModal.tsx` (lines 19–366):
  - Modal card displaying full person details, avatar, lineage path, children chips, and bio.

### 1.2 CSS Rules & Light Theme Styling (`src/styles/index.css`)
- **Dark Mode Card Base** (`index.css:1020–1052`):
  ```css
  .tree-card {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .tree-card:hover {
    transform: translateY(-4px);
  }
  ```
- **Light Mode Card Overrides** (`index.css:2738–2752`, `index.css:2951–2980`):
  ```css
  [data-theme="light"] .member-row {
    background: #ffffff;
    border-color: rgba(180, 130, 40, 0.18);
  }
  [data-theme="light"] .tree-card.root-node {
    background: linear-gradient(145deg, #fffdf2, #fef3c7);
    border: 1.5px solid #ca8a04;
  }
  [data-theme="light"] .tree-card.male {
    background: linear-gradient(145deg, #ffffff, #f0f9ff);
    border-left: 3px solid #2563eb;
  }
  [data-theme="light"] .tree-card.female {
    background: linear-gradient(145deg, #ffffff, #fdf2f8);
    border-left: 3px solid #db2777;
  }
  ```
- **Micro-card hover timing** (`index.css:3270–3277`): `transition: transform 0.25s var(--ease-out)...`.

---

## 2. Logic Chain

1. **Observation**: In `MemberItem.tsx` (line 93), the outer card container `<div className="member-row ...">` lacks gender (`male`, `female`) and ancestor (`root-node`, `ancestor`) classes.
2. **Observation**: In `index.css` (lines 2738–2752), `[data-theme="light"] .member-row` defaults to a plain white background (`#ffffff`).
3. **Deduction**: Because `MemberItem` does not pass gender or ancestor classes to `.member-row`, ListView cards currently show plain white backgrounds in Light Mode, failing Requirement R2's specification for Sapphire Male (`#f0f9ff`), Quartz Female (`#fdf2f8`), and Royal Gold Ancestor (`#fef3c7`).
4. **Observation**: In `TreeView.tsx` (line 68), `FamilyMemberNode` already passes `male`, `female`, and `root-node` classes, but the hover transition in `index.css:1031` is set to `0.25s cubic-bezier` instead of `200ms ease-out`.
5. **Deduction**: Updating `MemberItem.tsx` (line 93) to include gender and ancestor classes on `.member-row`, and modifying `index.css` to add Light Mode background rules (`#f0f9ff` for male, `#fdf2f8` for female, `#fef3c7` for ancestor), distinct borders, and `200ms ease-out` 3D hover physics will fully solve Requirement R2 in both ListView and TreeView.

---

## 3. Caveats

- **Assumptions**: Assumed `data.gender` is correctly populated by `normalizeGenealogy` in `utils/genealogyUtils.ts` (which infers gender from name/title prefixes like `Vợ`, `Chồng`, `THỊ`, etc.).
- **Uninvestigated Areas**: Recharts Tooltip styling and TopBar/NoticeBar light mode contrast (covered by peer Explorer 1).
- **Alternative Interpretations Considered**: Applying gender colors via inline styles vs CSS classes. CSS classes were chosen to maintain cleanliness, theme toggling compatibility, and ease of maintainability.

---

## 4. Conclusion

Requirement R2 requires a clear visual distinction between Male (Sapphire Blue `/f0f9ff`), Female (Quartz Pink `/fdf2f8`), and Ancestor (Royal Gold `#fef3c7`) member cards in both ListView and TreeView, backed by 3D hover physics (200ms ease-out).

The precise modifications needed are:
1. **`src/components/members/MemberItem.tsx` (line 93)**: Add container gender/ancestor classes to `.member-row`:
   ```tsx
   className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'root-node ancestor royal-ancestor-glow' : (data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : ''))}`}
   ```
2. **`src/components/members/TreeNode.tsx` (line 68)**: Add `${data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : '')} ${currentGen === 1 ? 'root-node' : ''}`.
3. **`src/styles/index.css` (lines 2738–2752)**: Add Light Mode `.member-row.male` (`#f0f9ff`), `.member-row.female` (`#fdf2f8`), and `.member-row.ancestor` (`#fef3c7`) background, border, and hover elevation styles.
4. **`src/styles/index.css` (lines 1020–1052, 2951–2985, 3270–3277)**: Set card hover transition to `all 200ms ease-out`, with `transform: translateY(-4px) scale(1.008)` and multi-layer depth shadow on hover.
5. **`src/styles/index.css` (lines 3047–3077)**: Ensure high contrast text colors (`#1e3a8a` for male, `#831843` for female, `#78350f` for ancestor) on light backgrounds.

---

## 5. Verification Method

To verify these investigation findings independently:
1. **Inspect Code Locations**:
   - `src/components/views/TreeView.tsx` (lines 35–160)
   - `src/components/members/MemberItem.tsx` (lines 19–182)
   - `src/components/members/TreeNode.tsx` (lines 17–171)
   - `src/components/members/PersonDetailModal.tsx` (lines 19–366)
   - `src/styles/index.css` (lines 1020–1052, 2738–2752, 2951–2985, 3047–3077, 3270–3277)
2. **Build Verification Command**:
   ```bash
   npm run build
   ```
   *Expected Result*: Zero TypeScript errors, clean Vite production bundle.
3. **Browser Inspection**:
   - Toggle Light Mode (`data-theme="light"`).
   - In ListView, verify Male cards have Sapphire `#f0f9ff` background, Female cards have Quartz `#fdf2f8` background, Ancestor cards have Royal Gold `#fef3c7` background.
   - Hover over cards to verify smooth 200ms ease-out 3D lift (`translateY(-4px)` / `translateY(-3px)`).
   - Verify text contrast meets WCAG 4.5:1.
