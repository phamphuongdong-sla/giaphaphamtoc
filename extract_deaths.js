import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very simple test script
const file = fs.readFileSync(path.join(__dirname, 'src/utils/dateUtils.ts'), 'utf8');

const giapha = fs.readFileSync(path.join(__dirname, 'src/data/giapha.ts'), 'utf8');

// I will extract death dates from giapha.ts using regex
const deaths = [...giapha.matchAll(/death:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Death dates found:', deaths.length);

console.log('First 10 death dates:', deaths.slice(0, 10));

// Compile dateUtils to JS locally by stripping types (very naive but works for simple math)
let jsCode = file
    .replace(/export const /g, 'const ')
    .replace(/: number/g, '')
    .replace(/: boolean/g, '')
    .replace(/: string/g, '')
    .replace(/: any/g, '')
    .replace(/: \{[^\}]+\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/export /g, '');

fs.writeFileSync('test_date_utils.js', jsCode, 'utf8');
