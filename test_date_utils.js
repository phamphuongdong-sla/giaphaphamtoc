const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const VN_TIMEZONE = 7;
const INT = Math.floor;
const PI = Math.PI;

// ===== JULIAN DATE FUNCTIONS =====
const jdFromDate = (dd, mm, yy) => {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
};
const jdToDate = (jd) => {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return { d: day, m: month, y: year };
};

// ===== LUNAR CALCULATION FUNCTIONS =====
const newMoon = (k) => {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  let c1 = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
  c1 -= 0.4068 * Math.sin(mpr * dr) + 0.0161 * Math.sin(2 * dr * mpr);
  c1 -= 0.0004 * Math.sin(3 * dr * mpr);
  c1 += 0.0104 * Math.sin(2 * dr * f) - 0.0051 * Math.sin((m + mpr) * dr);
  c1 -= 0.0074 * Math.sin((m - mpr) * dr) + 0.0004 * Math.sin((2 * f + m) * dr);
  c1 -= 0.0004 * Math.sin((2 * f - m) * dr) - 0.0006 * Math.sin((2 * f + mpr) * dr);
  const deltaT = t < -11
    ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
    : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return jd1 + c1 - deltaT;
};

const getNewMoonDay = (k, timeZone) => {
  return INT(newMoon(k) + 0.5 + timeZone / 24);
};

const getSunLongitude = (jdn, timeZone) => {
  const t = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const t2 = t * t;
  const dr = PI / 180;
  const m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let dl = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
  dl += (0.019993 - 0.000101 * t) * Math.sin(2 * dr * m) + 0.000290 * Math.sin(3 * dr * m);
  let l = (l0 + dl) * dr;
  l -= PI * 2 * INT(l / (PI * 2));
  return INT(l / PI * 6);
};

const getLunarMonth11 = (yy, timeZone) => {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
};

const getLeapMonthOffset = (a11, timeZone) => {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
};

const solarToLunar = (dd, mm, yy, timeZone = VN_TIMEZONE) => {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { d: lunarDay, m: lunarMonth, y: lunarYear || 0, leap: lunarLeap };
};

const lunarToSolar = (lunarDay, lunarMonth, lunarYear, lunarLeap = false, timeZone = VN_TIMEZONE) => {
  let a11, b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) return null;
    if (lunarLeap || off >= leapOff) off += 1;
  }
  return jdToDate(getNewMoonDay(k + off, timeZone) + lunarDay - 1);
};

// ===== GET TODAY LUNAR =====
const getLunarToday = () => {
  const current = new Date();
  const lunar = solarToLunar(current.getDate(), current.getMonth() + 1, current.getFullYear(), VN_TIMEZONE);
  return {
    ...lunar,
    label: `${lunar.d}/${lunar.m}${lunar.leap ? ' nhuận' : ''}/${lunar.y} Âm lịch`
  };
};

// ===== GET CAN CHI YEAR =====
const getCanChiYear = (year) => {
  return `${CAN[(year + 6) % 10]} ${CHI[(year + 8) % 12]}`;
};

// ===== FORMAT FUNCTIONS =====
const parseBirthText = (text) => {
  if (!text) return { solar: null, note: '' };
  const dateMatch = text.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1]);
    const m = parseInt(dateMatch[2]);
    const y = dateMatch[3] ? parseInt(dateMatch[3].length === 2 ? `19${dateMatch[3]}` : dateMatch[3]) : undefined;
    return { solar, note: text.replace(dateMatch[0], '').trim() };
  }
  const yearMatch = text.match(/\b(18|19|20)\d{2}\b/);
  if (yearMatch) {
    return { solar, note: text.replace(yearMatch[0], '').trim() };
  }
  return { solar: null, note: text };
};

const parseDeathText = (text) => {
  if (!text) return { solar: null, note: '' };
  const dateMatch = text.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1]);
    const m = parseInt(dateMatch[2]);
    const y = dateMatch[3] ? parseInt(dateMatch[3].length === 2 ? `19${dateMatch[3]}` : dateMatch[3]) : undefined;
    return { solar, note: text.replace(dateMatch[0], '').trim() };
  }
  return { solar: null, note: text };
};

const formatBirthDisplay = (data) => {
  const parts = [];
  if (data.birthSolar) {
    const { d, m, y } = data.birthSolar;
    if (d && m && y) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
    else if (y) parts.push(`${y}`);
  }
  if (data.birthNote) parts.push(data.birthNote);
  return parts.length ? parts.join(' · ') : 'Chưa rõ';
};

const formatDeathDisplay = (data) => {
  const parts = [];
  if (data.deathSolar) {
    const { d, m, y } = data.deathSolar;
    if (d && m && y) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
    else if (y) parts.push(`${y}`);
  }
  if (data.deathNote) parts.push(data.deathNote);
  return parts.length ? parts.join(' · ') : 'Chưa rõ';
};

const getTodayLunar = () => {
  const today = getLunarToday();
  return today.label;
};

const getDaysUntil = (targetDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ===== HÀM MỚI: TÍNH CHÍNH XÁC SỐ NGÀY ĐẾN NGÀY GIỖ ÂM LỊCH =====
const getDaysUntilLunarAnniversary = (lunarDay, lunarMonth) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Chuyển đổi ngày Dương lịch hôm nay sang Âm lịch để lấy năm Âm lịch hiện hành
  const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear(), VN_TIMEZONE);
  let targetLunarYear = currentLunar.y;

  // 2. Thử tìm ngày Dương lịch tương ứng của ngày giỗ trong năm Âm lịch này
  let targetSolarObj = lunarToSolar(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
  if (!targetSolarObj) return -1;

  let targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
  targetSolarDate.setHours(0, 0, 0, 0);

  // 3. Nếu ngày giỗ Âm lịch của năm nay đã qua mất rồi, ta phải lấy ngày giỗ của năm Âm lịch kế tiếp (năm sau)
  if (targetSolarDate < today) {
    targetLunarYear += 1;
    targetSolarObj = lunarToSolar(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
    if (targetSolarObj) {
      targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
      targetSolarDate.setHours(0, 0, 0, 0);
    }
  }

  // 4. Tính khoảng cách số ngày thực tế giữa ngày Dương lịch đó với hôm nay
  const diffTime = targetSolarDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)); 
};

export { solarToLunar, lunarToSolar, getDaysUntilLunarAnniversary, getLunarToday, parseBirthText, parseDeathText, formatBirthDisplay, formatDeathDisplay };