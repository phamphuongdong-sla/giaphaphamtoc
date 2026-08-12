import { VNLunar } from '@dqcai/vn-lunar';
const lunar = new VNLunar();
const result = lunar.convertSolar2Lunar(12, 8, 2026, 7);
console.log(result);
