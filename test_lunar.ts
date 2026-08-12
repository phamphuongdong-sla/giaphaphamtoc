import { solarToLunar } from './src/utils/dateUtils.js';

const today = new Date('2026-07-22T00:00:00');
const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
console.log('Today Solar:', today.toLocaleDateString());
console.log('Today Lunar:', currentLunar);
