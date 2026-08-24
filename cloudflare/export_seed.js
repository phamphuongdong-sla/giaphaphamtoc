import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read giapha.ts content
const giaphaTsPath = path.resolve(__dirname, '../src/data/giapha.ts');
const fileContent = fs.readFileSync(giaphaTsPath, 'utf8');

// Strip "import ...;" and "export const GIA_PHA_DATA: PersonNode = "
const cleanedCode = fileContent
  .replace(/^import\s+.*?;/gm, '')
  .replace(/export\s+const\s+GIA_PHA_DATA(\s*:\s*\w+)?\s*=\s*/, 'return ')
  .trim();

let root;
try {
  root = new Function(cleanedCode)();
} catch (e) {
  console.error("Error evaluating giapha.ts:", e);
  process.exit(1);
}

const rows = [];
let idCounter = 1;

function detectGender(name, explicitGender) {
  if (explicitGender === 'female' || explicitGender === 'male') return explicitGender;
  const lower = (name || '').toLowerCase();
  if (
    lower.includes('bà') ||
    lower.includes('vợ') ||
    lower.includes('mẹ') ||
    lower.includes('chị') ||
    lower.includes('em gái') ||
    lower.includes('con gái') ||
    lower.includes('cô') ||
    lower.includes('thị')
  ) {
    return 'female';
  }
  return 'male';
}

function traverse(node, parentId = '') {
  const currentId = `M${String(idCounter++).padStart(3, '0')}`;
  const gender = detectGender(node.name, node.gender);
  
  rows.push({
    id: currentId,
    parentId: parentId || null,
    name: node.name || 'Chưa rõ tên',
    gender: gender,
    birth: node.birth || '',
    death: node.death || '',
    isDead: node.deceased ? 1 : 0,
    bio: node.bio || '',
    title: node.title || '',
    branch: node.branch || ''
  });

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      traverse(child, currentId);
    }
  }
}

traverse(root);

function escapeSql(str) {
  if (str === null || str === undefined || str === '') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- Dữ liệu mẫu (Seed Data) cho Cloudflare D1 (${rows.length} thành viên)\n\n`;
sql += `DELETE FROM members;\n\n`;

for (const r of rows) {
  sql += `INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES (${escapeSql(r.id)}, ${escapeSql(r.parentId)}, ${escapeSql(r.name)}, ${escapeSql(r.gender)}, ${escapeSql(r.birth)}, ${escapeSql(r.death)}, ${r.isDead}, ${escapeSql(r.bio)}, ${escapeSql(r.title)}, ${escapeSql(r.branch)});\n`;
}

const outputPath = path.resolve(__dirname, 'seed.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`✅ Đã xuất thành công ${rows.length} thành viên vào file cloudflare/seed.sql!`);
