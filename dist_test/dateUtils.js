"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysUntilLunarAnniversary = exports.getDaysUntil = exports.getTodayLunar = exports.formatDeathDisplay = exports.formatBirthDisplay = exports.parseDeathText = exports.parseBirthText = exports.getLunarToday = exports.lunarToSolar = exports.solarToLunar = exports.jdToDate = exports.jdFromDate = exports.getCanChiYear = exports.CHI = exports.CAN = void 0;
exports.CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
exports.CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
var getCanChiYear = function (year) {
    var can = exports.CAN[(year + 6) % 10];
    var chi = exports.CHI[(year + 8) % 12];
    return "".concat(can, " ").concat(chi);
};
exports.getCanChiYear = getCanChiYear;
var VN_TIMEZONE = 7;
var INT = Math.floor;
var PI = Math.PI;
// ===== JULIAN DATE FUNCTIONS =====
var jdFromDate = function (dd, mm, yy) {
    var a = INT((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
};
exports.jdFromDate = jdFromDate;
var jdToDate = function (jd) {
    var a, b, c;
    if (jd > 2299160) {
        a = jd + 32044;
        b = INT((4 * a + 3) / 146097);
        c = a - INT((b * 146097) / 4);
    }
    else {
        b = 0;
        c = jd + 32082;
    }
    var d = INT((4 * c + 3) / 1461);
    var e = c - INT((1461 * d) / 4);
    var m = INT((5 * e + 2) / 153);
    var day = e - INT((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * INT(m / 10);
    var year = b * 100 + d - 4800 + INT(m / 10);
    return { d: day, m: month, y: year };
};
exports.jdToDate = jdToDate;
// ===== LUNAR CALCULATION FUNCTIONS =====
var newMoon = function (k) {
    var t = k / 1236.85;
    var t2 = t * t;
    var t3 = t2 * t;
    var dr = PI / 180;
    var jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
    jd1 += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
    var m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
    var mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
    var f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
    var c1 = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
    c1 -= 0.4068 * Math.sin(mpr * dr) + 0.0161 * Math.sin(2 * dr * mpr);
    c1 -= 0.0004 * Math.sin(3 * dr * mpr);
    c1 += 0.0104 * Math.sin(2 * dr * f) - 0.0051 * Math.sin((m + mpr) * dr);
    c1 -= 0.0074 * Math.sin((m - mpr) * dr) + 0.0004 * Math.sin((2 * f + m) * dr);
    c1 -= 0.0004 * Math.sin((2 * f - m) * dr) - 0.0006 * Math.sin((2 * f + mpr) * dr);
    c1 += 0.0010 * Math.sin((2 * f - mpr) * dr) + 0.0005 * Math.sin((2 * mpr + m) * dr);
    var deltaT = t < -11
        ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
        : -0.000278 + 0.000265 * t + 0.000262 * t2;
    return jd1 + c1 - deltaT;
};
var getNewMoonDay = function (k, timeZone) {
    return INT(newMoon(k) + 0.5 + timeZone / 24);
};
var getSunLongitude = function (jdn, timeZone) {
    var t = (jdn - 2451545.5 - timeZone / 24) / 36525;
    var t2 = t * t;
    var dr = PI / 180;
    var m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
    var l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
    var dl = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
    dl += (0.019993 - 0.000101 * t) * Math.sin(2 * dr * m) + 0.000290 * Math.sin(3 * dr * m);
    var l = (l0 + dl) * dr;
    l -= PI * 2 * INT(l / (PI * 2));
    return INT(l / PI * 6);
};
var getLunarMonth11 = function (yy, timeZone) {
    var off = (0, exports.jdFromDate)(31, 12, yy) - 2415021;
    var k = INT(off / 29.530588853);
    var nm = getNewMoonDay(k, timeZone);
    var sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9)
        nm = getNewMoonDay(k - 1, timeZone);
    return nm;
};
var getLeapMonthOffset = function (a11, timeZone) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0;
    var i = 1;
    var arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
        last = arc;
        i += 1;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
};
// ===== PUBLIC LUNAR FUNCTIONS =====
var solarToLunar = function (dd, mm, yy, timeZone) {
    if (timeZone === void 0) { timeZone = VN_TIMEZONE; }
    var dayNumber = (0, exports.jdFromDate)(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber)
        monthStart = getNewMoonDay(k, timeZone);
    var a11 = getLunarMonth11(yy, timeZone);
    var b11 = a11;
    var lunarYear;
    if (a11 >= monthStart) {
        lunarYear = yy;
        a11 = getLunarMonth11(yy - 1, timeZone);
    }
    else {
        lunarYear = yy + 1;
        b11 = getLunarMonth11(yy + 1, timeZone);
    }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = false;
    var lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        var leapMonthDiff = getLeapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff)
                lunarLeap = true;
        }
    }
    if (lunarMonth > 12)
        lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4)
        lunarYear -= 1;
    return { d: lunarDay, m: lunarMonth, y: lunarYear || 0, leap: lunarLeap };
};
exports.solarToLunar = solarToLunar;
var lunarToSolar = function (lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
    if (lunarLeap === void 0) { lunarLeap = false; }
    if (timeZone === void 0) { timeZone = VN_TIMEZONE; }
    var a11, b11;
    if (lunarMonth < 11) {
        a11 = getLunarMonth11(lunarYear - 1, timeZone);
        b11 = getLunarMonth11(lunarYear, timeZone);
    }
    else {
        a11 = getLunarMonth11(lunarYear, timeZone);
        b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    var off = lunarMonth - 11;
    if (off < 0)
        off += 12;
    if (b11 - a11 > 365) {
        var leapOff = getLeapMonthOffset(a11, timeZone);
        var leapMonth = leapOff - 2;
        if (leapMonth < 0)
            leapMonth += 12;
        if (lunarLeap && lunarMonth !== leapMonth)
            return null;
        if (lunarLeap || off >= leapOff)
            off += 1;
    }
    return (0, exports.jdToDate)(getNewMoonDay(k + off, timeZone) + lunarDay - 1);
};
exports.lunarToSolar = lunarToSolar;
// ===== GET TODAY LUNAR =====
var getLunarToday = function () {
    var current = new Date();
    var lunar = (0, exports.solarToLunar)(current.getDate(), current.getMonth() + 1, current.getFullYear(), VN_TIMEZONE);
    return __assign(__assign({}, lunar), { label: "".concat(lunar.d, "/").concat(lunar.m).concat(lunar.leap ? ' nhuận' : '', "/").concat(lunar.y, " \u00C2m l\u1ECBch") });
};
exports.getLunarToday = getLunarToday;
// ===== FORMAT FUNCTIONS =====
var parseBirthText = function (text) {
    if (!text)
        return { solar: null, note: '' };
    var dateMatch = text.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
    if (dateMatch) {
        var d = parseInt(dateMatch[1]);
        var m = parseInt(dateMatch[2]);
        var y = dateMatch[3] ? parseInt(dateMatch[3].length === 2 ? "19".concat(dateMatch[3]) : dateMatch[3]) : undefined;
        return { solar: { d: d, m: m, y: y }, note: text.replace(dateMatch[0], '').trim() };
    }
    var yearMatch = text.match(/\b(18|19|20)\d{2}\b/);
    if (yearMatch) {
        return { solar: { y: parseInt(yearMatch[0]) }, note: text.replace(yearMatch[0], '').trim() };
    }
    return { solar: null, note: text };
};
exports.parseBirthText = parseBirthText;
var parseDeathText = function (text) {
    if (!text)
        return { solar: null, note: '' };
    var str = text.trim();
    // 1. Try YYYY-MM-DD or YYYY/MM/DD
    var isoMatch = str.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (isoMatch) {
        var y = parseInt(isoMatch[1], 10);
        var m = parseInt(isoMatch[2], 10);
        var d = parseInt(isoMatch[3], 10);
        return { solar: { d: d, m: m, y: y }, note: str.replace(isoMatch[0], '').trim() };
    }
    // 2. Try DD-MM-YYYY or DD/MM/YYYY or DD-MM or DD/MM
    var dmyMatch = str.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?\b/);
    if (dmyMatch) {
        var d = parseInt(dmyMatch[1], 10);
        var m = parseInt(dmyMatch[2], 10);
        var y = dmyMatch[3] ? parseInt(dmyMatch[3].length === 2 ? "19".concat(dmyMatch[3]) : dmyMatch[3], 10) : undefined;
        return { solar: { d: d, m: m, y: y }, note: str.replace(dmyMatch[0], '').trim() };
    }
    // 3. Try Year only
    var yearMatch = str.match(/\b(18|19|20)\d{2}\b/);
    if (yearMatch) {
        return { solar: { y: parseInt(yearMatch[0], 10) }, note: str.replace(yearMatch[0], '').trim() };
    }
    return { solar: null, note: str };
};
exports.parseDeathText = parseDeathText;
var formatBirthDisplay = function (data) {
    var parts = [];
    if (data.birthSolar) {
        var _a = data.birthSolar, d = _a.d, m = _a.m, y = _a.y;
        if (d && m && y)
            parts.push("".concat(String(d).padStart(2, '0'), "/").concat(String(m).padStart(2, '0'), "/").concat(y));
        else if (d && m)
            parts.push("".concat(String(d).padStart(2, '0'), "/").concat(String(m).padStart(2, '0')));
        else if (y)
            parts.push("".concat(y));
    }
    if (data.birthNote)
        parts.push(data.birthNote);
    return parts.length ? parts.join(' · ') : 'Chưa rõ';
};
exports.formatBirthDisplay = formatBirthDisplay;
var formatDeathDisplay = function (data) {
    var parts = [];
    if (data.deathSolar) {
        var _a = data.deathSolar, d = _a.d, m = _a.m, y = _a.y;
        if (d && m && y)
            parts.push("".concat(String(d).padStart(2, '0'), "/").concat(String(m).padStart(2, '0'), "/").concat(y));
        else if (d && m)
            parts.push("".concat(String(d).padStart(2, '0'), "/").concat(String(m).padStart(2, '0')));
        else if (y)
            parts.push("".concat(y));
    }
    if (data.deathNote)
        parts.push(data.deathNote);
    return parts.length ? parts.join(' · ') : 'Chưa rõ';
};
exports.formatDeathDisplay = formatDeathDisplay;
var getTodayLunar = function () {
    var today = (0, exports.getLunarToday)();
    return today.label;
};
exports.getTodayLunar = getTodayLunar;
var getDaysUntil = function (targetDate) {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    var diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
exports.getDaysUntil = getDaysUntil;
// ===== HÀM MỚI: TÍNH CHÍNH XÁC SỐ NGÀY ĐẾN NGÀY GIỖ ÂM LỊCH =====
var getDaysUntilLunarAnniversary = function (lunarDay, lunarMonth) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // 1. Chuyển đổi ngày Dương lịch hôm nay sang Âm lịch để lấy năm Âm lịch hiện hành
    var currentLunar = (0, exports.solarToLunar)(today.getDate(), today.getMonth() + 1, today.getFullYear(), VN_TIMEZONE);
    var targetLunarYear = currentLunar.y;
    // 2. Thử tìm ngày Dương lịch tương ứng của ngày giỗ trong năm Âm lịch này
    var targetSolarObj = (0, exports.lunarToSolar)(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
    if (!targetSolarObj)
        return -1;
    var targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
    targetSolarDate.setHours(0, 0, 0, 0);
    // 3. Nếu ngày giỗ Âm lịch của năm nay đã qua mất rồi, ta phải lấy ngày giỗ của năm Âm lịch kế tiếp (năm sau)
    if (targetSolarDate < today) {
        targetLunarYear += 1;
        targetSolarObj = (0, exports.lunarToSolar)(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
        if (targetSolarObj) {
            targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
            targetSolarDate.setHours(0, 0, 0, 0);
        }
    }
    // 4. Tính khoảng cách số ngày thực tế giữa ngày Dương lịch đó với hôm nay
    var diffTime = targetSolarDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
exports.getDaysUntilLunarAnniversary = getDaysUntilLunarAnniversary;
