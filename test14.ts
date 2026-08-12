import { getLunarMonth11, getLeapMonthOffset, jdFromDate, solarToLunar } from './src/utils/dateUtils';
const timeZone = 7;
const a11 = getLunarMonth11(2022, timeZone);
console.log("2023 leapMonthDiff should be 4. Actual:", getLeapMonthOffset(a11, timeZone));
