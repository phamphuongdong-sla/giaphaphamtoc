import { newMoon, getNewMoonDay, jdFromDate } from './src/utils/dateUtils';
const jd12 = jdFromDate(12, 8, 2026);
console.log("JD 12/8/2026 noon:", jd12);
const k = Math.floor((jd12 - 2415021.076998695) / 29.530588853);
const nm = newMoon(k + 1);
console.log("nm JD:", nm);
console.log("nm date (GMT):", (nm - jd12 + 0.5) * 24, "hours on Aug 12");
console.log("New Moon Day VN:", getNewMoonDay(k + 1, 7));
