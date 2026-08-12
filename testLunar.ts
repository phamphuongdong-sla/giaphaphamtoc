import { solarToLunar, jdFromDate, lunarToSolar } from './src/utils/dateUtils';
const l = solarToLunar(12, 8, 2026);
console.log("Lunar for 12/8/2026:", l);
