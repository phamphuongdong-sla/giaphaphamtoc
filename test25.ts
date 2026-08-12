import { getLunarDate, getSolarDate } from '@dqcai/vn-lunar';
const lunar = getLunarDate(12, 8, 2026);
console.log("Aug 12 2026 -> Lunar:", lunar);
const lunar13 = getLunarDate(13, 8, 2026);
console.log("Aug 13 2026 -> Lunar:", lunar13);
