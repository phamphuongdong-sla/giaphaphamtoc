import { getNewMoonDay, jdToDate } from './src/utils/dateUtils';
const nm = getNewMoonDay(127, 7); // just guess k roughly
for(let k = 1260; k < 1270; k++) {
    const d = jdToDate(getNewMoonDay(k, 7));
    if (d.y === 2026 && d.m === 8) console.log(k, d);
}
