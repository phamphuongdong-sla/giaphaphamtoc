# Dispatch for Worker M2 (Member Cards & Tree Nodes Redesign)

**Target Milestone**: M2 (Requirement R2)
**Scope**: Member cards redesign in ListView (`MemberItem.tsx`), TreeView (`TreeView.tsx`, `TreeNode.tsx`), Person Detail Modal (`PersonDetailModal.tsx`), and card styles in `src/styles/index.css`.

## Objective
Implement Requirement R2 based on Explorer 2's survey report:
1. `src/components/members/MemberItem.tsx`:
   - Update container `<div className="member-row ...">` to add gender (`male`, `female`) and ancestor (`root-node ancestor`) classes based on `data.gender` and generation (`currentGen === 1`).
   - Refine layout for member names, titles (*Thủy Tổ*, *Bà Cả*, *Bà Hai*, ...), gender icons (Lucide `Mars` / `Venus` / `Crown`), and birth/death dates.
2. `src/components/views/TreeView.tsx` (`FamilyMemberNode`) & `src/components/members/TreeNode.tsx`:
   - Ensure `male`, `female`, `root-node` / `ancestor` classes are correctly assigned to tree node container elements.
   - Polish name, title, gender icon, and metadata display.
3. `src/styles/index.css`:
   - Implement Light Mode card backgrounds:
     - Sapphire Male: `#f0f9ff` (linear-gradient: `linear-gradient(145deg, #ffffff, #f0f9ff)`) with blue accent border (`#2563eb` / `#93c5fd`).
     - Quartz Female: `#fdf2f8` (linear-gradient: `linear-gradient(145deg, #ffffff, #fdf2f8)`) with pink accent border (`#db2777` / `#fbcfe8`).
     - Royal Gold Ancestor: `#fef3c7` (linear-gradient: `linear-gradient(145deg, #fffdf2, #fef3c7)`) with gold accent border (`#ca8a04` / `#fde047`).
   - Update hover physics to `200ms ease-out` transition with 3D elevation (`translateY(-4px)` lift, subtle `scale(1.008)`, and multi-layer depth shadow).
4. `src/components/members/PersonDetailModal.tsx`:
   - Ensure detail modal card header and background reflect gender/ancestor color theme gracefully.

## Verification
- Run `npm run build` to verify 0 errors.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document your changes and build results in `/Users/mrdong/giaphaphamtoc/.agents/teamwork_preview_worker_m2_1/handoff.md`.
