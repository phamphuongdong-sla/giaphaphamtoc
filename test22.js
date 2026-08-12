import { Solar } from 'solar-lunar-converter/dist/esm/index.js';
const solar = new Solar(2026, 8, 12);
const lunar = solar.toLunar();
console.log(lunar.day, lunar.month, lunar.year, lunar.isLeap);
