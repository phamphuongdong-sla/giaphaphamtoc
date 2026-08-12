const { Solar, Lunar } = require('solar-lunar-converter');
const solar = new Solar(2026, 8, 12);
const lunar = solar.toLunar();
console.log(lunar.day, lunar.month, lunar.year, lunar.isLeap);
