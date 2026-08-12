import fs from 'fs';

const giapha = fs.readFileSync('src/data/giapha.ts', 'utf8');
const deaths = [...giapha.matchAll(/death:\s*"([^"]+)"/g)].map(m => m[1]);

for (const death of deaths) {
    const match = death.match(/(\d{1,2})[-/](\d{1,2})/);
    if (match) {
        console.log(`Lunar: ${match[1]}/${match[2]} | Raw: ${death}`);
    }
}
