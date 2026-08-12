import { lunarToSolar, solarToLunar } from './src/utils/dateUtils';
console.log("2023 Leap Month 2:");
console.log("Lunar 1/2/2023 (not leap) -> Solar:", lunarToSolar(1, 2, 2023, false));
console.log("Lunar 1/2/2023 (leap) -> Solar:", lunarToSolar(1, 2, 2023, true));
