import { getLunarMonth11, getLeapMonthOffset, jdFromDate, solarToLunar } from './src/utils/dateUtils';
const timeZone = 7;
const a11 = getLunarMonth11(2022, timeZone);
const b11 = getLunarMonth11(2023, timeZone);
console.log("a11:", a11, "b11:", b11);
console.log("b11 - a11:", b11 - a11);
const leapOff = getLeapMonthOffset(a11, timeZone);
console.log("leapOff:", leapOff);
