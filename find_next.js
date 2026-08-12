import fs from 'fs';
import { solarToLunar, lunarToSolar } from './test_date_utils.js';

const giapha = fs.readFileSync('src/data/giapha.ts', 'utf8');
const deaths = [...giapha.matchAll(/death:\s*"([^"]+)"/g)].map(m => m[1]);

const today = new Date();
today.setHours(0, 0, 0, 0);
const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());

const list = [];

deaths.forEach((death) => {
    const match = death.match(/(\d{1,2})[-/](\d{1,2})/);
    if (match) {
        const d = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        let targetLunarYear = currentLunar.y;
        
        let solarTarget = lunarToSolar(d, m, targetLunarYear);
        let targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;

        if (targetDate && targetDate < today) {
            targetLunarYear += 1;
            solarTarget = lunarToSolar(d, m, targetLunarYear);
            targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;
        }

        if (targetDate) {
            const diffTime = targetDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            list.push({
                deathStr: death,
                daysLeft,
                lunar: `${d}/${m}`,
                targetDate: targetDate.toLocaleDateString('vi-VN')
            });
        }
    }
});

list.sort((a, b) => a.daysLeft - b.daysLeft);
console.log('--- NEXT 5 ANNIVERSARIES ---');
console.log(list.slice(0, 5));
