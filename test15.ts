import { getLunarMonth11, getNewMoonDay, jdToDate } from './src/utils/dateUtils';
const timeZone = 7;
const a11 = getLunarMonth11(2022, timeZone);
const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);

const PI = Math.PI;
const INT = Math.floor;
const getSunLongitude = (jdn: number, timeZone: number): number => {
  const t = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const t2 = t * t;
  const dr = PI / 180;
  const m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let dl = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
  dl += (0.019993 - 0.000101 * t) * Math.sin(2 * dr * m) + 0.000290 * Math.sin(3 * dr * m);
  let l = (l0 + dl) * dr;
  l -= PI * 2 * INT(l / (PI * 2));
  const raw = l / PI * 6;
  console.log("Raw:", raw);
  return INT(raw);
};

for (let i = 1; i <= 5; i++) {
    const nm = getNewMoonDay(k + i, timeZone);
    console.log(`i=${i}, nm=${nm}, Date: ${JSON.stringify(jdToDate(nm))}, Arc: ${getSunLongitude(nm, timeZone)}`);
}
