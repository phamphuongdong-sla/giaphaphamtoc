import fs from 'fs';
const src = fs.readFileSync('./src/utils/dateUtils.ts', 'utf-8');
const script = src.replace(/export /g, '').replace(/import .*;/g, '') + `
console.log(solarToLunar(12, 8, 2026));
console.log(solarToLunar(13, 8, 2026));
`;
fs.writeFileSync('testLunarRun.js', script);
