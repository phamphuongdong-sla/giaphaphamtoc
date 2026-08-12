import { solarToLunar, lunarToSolar, getDaysUntil } from './src/utils/dateUtils';
for (let y = 2024; y <= 2030; y++) {
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 31; d++) {
      // Create date, check if valid
      const date = new Date(y, m - 1, d);
      if (date.getDate() !== d) continue;
      
      const lunar = solarToLunar(d, m, y);
      const solar = lunarToSolar(lunar.d, lunar.m, lunar.y, lunar.leap);
      
      if (!solar || solar.d !== d || solar.m !== m || solar.y !== y) {
        console.log(`Mismatch on Solar ${d}/${m}/${y} -> Lunar ${lunar.d}/${lunar.m}/${lunar.y} -> Solar ${solar?.d}/${solar?.m}/${solar?.y}`);
      }
    }
  }
}
console.log("Done checking 2024-2030");
