import fs from 'fs';
import path from 'path';

console.log('=== EMPIRICAL VERIFICATION FOR MILESTONE M2 ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

const cssPath = '/Users/mrdong/giaphaphamtoc/src/styles/index.css';
const cssContent = fs.readFileSync(cssPath, 'utf-8');

// Test 1: Light mode .member-row styling and transition
const lightMemberRowRegex = /\[data-theme="light"\]\s+\.member-row\s*\{[^}]*\}/s;
const lightMemberRowMatch = cssContent.match(lightMemberRowRegex);
assert(lightMemberRowMatch !== null, 'Light Mode .member-row rule exists');
if (lightMemberRowMatch) {
  const block = lightMemberRowMatch[0];
  assert(block.includes('200ms ease-out'), '.member-row transition includes 200ms ease-out');
  assert(block.includes('box-shadow'), '.member-row transition includes box-shadow');
}

// Test 2: Light mode .member-row:hover 3D elevation
const lightMemberRowHoverRegex = /\[data-theme="light"\]\s+\.member-row:hover\s*\{[^}]*\}/s;
const lightMemberRowHoverMatch = cssContent.match(lightMemberRowHoverRegex);
assert(lightMemberRowHoverMatch !== null, 'Light Mode .member-row:hover rule exists');
if (lightMemberRowHoverMatch) {
  const block = lightMemberRowHoverMatch[0];
  assert(block.includes('translateY(-4px)'), '.member-row:hover has translateY(-4px)');
}

// Test 3: Light mode .tree-card styling and transition
const lightTreeCardRegex = /\[data-theme="light"\]\s+\.tree-card\s*\{[^}]*\}/s;
const lightTreeCardMatch = cssContent.match(lightTreeCardRegex);
assert(lightTreeCardMatch !== null, 'Light Mode .tree-card rule exists');
if (lightTreeCardMatch) {
  const block = lightTreeCardMatch[0];
  assert(block.includes('200ms ease-out'), '.tree-card transition includes 200ms ease-out');
}

// Test 4: Light mode .tree-card:hover 3D elevation
const lightTreeCardHoverRegex = /\[data-theme="light"\]\s+\.tree-card:hover\s*\{[^}]*\}/s;
const lightTreeCardHoverMatch = cssContent.match(lightTreeCardHoverRegex);
assert(lightTreeCardHoverMatch !== null, 'Light Mode .tree-card:hover rule exists');
if (lightTreeCardHoverMatch) {
  const block = lightTreeCardHoverMatch[0];
  assert(block.includes('translateY(-4px)'), '.tree-card:hover has translateY(-4px)');
}

// Test 5: Micro card hover transition and elevation
const microCardHoverRegex = /\.micro-card-hover\s*\{[^}]*\}/s;
const microCardHoverMatch = cssContent.match(microCardHoverRegex);
assert(microCardHoverMatch !== null, '.micro-card-hover rule exists');
if (microCardHoverMatch) {
  assert(microCardHoverMatch[0].includes('200ms ease-out'), '.micro-card-hover includes 200ms ease-out');
}

const microCardHoverStateRegex = /\.micro-card-hover:hover\s*\{[^}]*\}/s;
const microCardHoverStateMatch = cssContent.match(microCardHoverStateRegex);
assert(microCardHoverStateMatch !== null, '.micro-card-hover:hover rule exists');
if (microCardHoverStateMatch) {
  assert(microCardHoverStateMatch[0].includes('translateY(-4px)'), '.micro-card-hover:hover has translateY(-4px)');
}

// Test 6: Male, Female, Ancestor Light Mode backgrounds & borders
assert(cssContent.includes('[data-theme="light"] .member-row.male'), 'Light mode male member-row rule exists');
assert(cssContent.includes('linear-gradient(145deg, #ffffff, #f0f9ff)'), 'Sapphire male background gradient present');
assert(cssContent.includes('#2563eb'), 'Male accent border #2563eb present');

assert(cssContent.includes('[data-theme="light"] .member-row.female'), 'Light mode female member-row rule exists');
assert(cssContent.includes('linear-gradient(145deg, #ffffff, #fdf2f8)'), 'Quartz female background gradient present');
assert(cssContent.includes('#db2777'), 'Female accent border #db2777 present');

assert(cssContent.includes('[data-theme="light"] .member-row.ancestor') || cssContent.includes('[data-theme="light"] .member-row.root-node'), 'Light mode ancestor member-row rule exists');
assert(cssContent.includes('linear-gradient(145deg, #fffdf2, #fef3c7)'), 'Royal gold ancestor background gradient present');
assert(cssContent.includes('#ca8a04'), 'Ancestor gold border #ca8a04 present');

// Test 7: Icon mapping in Icon.tsx
const iconPath = '/Users/mrdong/giaphaphamtoc/src/components/ui/Icon.tsx';
const iconContent = fs.readFileSync(iconPath, 'utf-8');
assert(iconContent.includes("'mars': FaIcons.FaMars"), "Icon.tsx maps 'mars'");
assert(iconContent.includes("'venus': FaIcons.FaVenus"), "Icon.tsx maps 'venus'");
assert(iconContent.includes("'crown': LuIcons.LuCrown"), "Icon.tsx maps 'crown'");

// Test 8: MemberItem component source inspection for gender/ancestor classes & icons
const memberItemPath = '/Users/mrdong/giaphaphamtoc/src/components/members/MemberItem.tsx';
const memberItemContent = fs.readFileSync(memberItemPath, 'utf-8');
assert(memberItemContent.includes('genderClass'), 'MemberItem attaches genderClass');
assert(memberItemContent.includes('ancestorClass'), 'MemberItem attaches ancestorClass');
assert(memberItemContent.includes("name=\"crown\""), 'MemberItem renders crown icon for ancestor');
assert(memberItemContent.includes("name=\"mars\""), 'MemberItem renders mars icon for male');
assert(memberItemContent.includes("name=\"venus\""), 'MemberItem renders venus icon for female');

// Test 9: TreeView component source inspection for gender/ancestor classes & icons
const treeViewPath = '/Users/mrdong/giaphaphamtoc/src/components/views/TreeView.tsx';
const treeViewContent = fs.readFileSync(treeViewPath, 'utf-8');
assert(treeViewContent.includes("name=\"crown\""), 'TreeView renders crown icon for ancestor');
assert(treeViewContent.includes("name=\"mars\""), 'TreeView renders mars icon for male');
assert(treeViewContent.includes("name=\"venus\""), 'TreeView renders venus icon for female');

// Test 10: TreeNode component source inspection
const treeNodePath = '/Users/mrdong/giaphaphamtoc/src/components/members/TreeNode.tsx';
const treeNodeContent = fs.readFileSync(treeNodePath, 'utf-8');
assert(treeNodeContent.includes("name=\"crown\""), 'TreeNode renders crown icon for ancestor');
assert(treeNodeContent.includes("name=\"mars\""), 'TreeNode renders mars icon for male');
assert(treeNodeContent.includes("name=\"venus\""), 'TreeNode renders venus icon for female');

console.log(`\nVerification complete. Passed: ${passCount}, Failed: ${failCount}`);
if (failCount > 0) {
  process.exit(1);
}
