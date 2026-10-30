import { useState, useEffect, useMemo } from 'react';
import { GIA_PHA_DATA } from '@/data/giapha';
import { PersonNode, MemberEntry, ReminderItem } from '@/types';
import { fetchFamilyTreeFromSheet } from '@/services/googleSheets';
import { fetchFamilyTreeFromCloudflare } from '@/services/cloudflareApi';
import {
  normalizeGenealogy,
  buildMemberEntries,
  getBirthdayEvents,
  getAllLichData,
  getPersonMemorialDetails
} from '@/utils/genealogyUtils';
import { getTodayLunar, solarToLunar, lunarToSolar, parseDeathText } from '@/utils/dateUtils';

export const useFamilyData = () => {
  const [rawTree, setRawTree] = useState<PersonNode>(GIA_PHA_DATA);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        // 1. Ưu tiên lấy từ Cloudflare D1 Database
        let tree = await fetchFamilyTreeFromCloudflare();
        
        // 2. Nếu chưa cấu hình Cloudflare hoặc lỗi, fallback sang Google Sheets
        if (!tree) {
          tree = await fetchFamilyTreeFromSheet();
        }

        if (mounted && tree) {
          setRawTree(tree);
        }
      } catch (err) {
        console.error("Error loading family data:", err);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const treeData = useMemo(() => normalizeGenealogy(rawTree), [rawTree]);
  const memberEntries = useMemo(() => buildMemberEntries(treeData), [treeData]);
  const birthdays = useMemo(() => getBirthdayEvents(treeData), [treeData]);
  const todayLunar = useMemo(() => getTodayLunar(), []);

  // LOGIC TÍNH NGÀY GIỖ SẮP TỚI THEO ĐÚNG PHONG TỤC VIỆT NAM (TIÊN THƯỜNG & CHÍNH KỴ)
  const reminders = useMemo(() => {
    const list: ReminderItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Lấy thông tin năm Âm lịch hiện hành dựa vào ngày Dương lịch hôm nay
    const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    if (!currentLunar) return list;

    // 2. Duyệt qua toàn bộ thành viên trong gia phả
    memberEntries.forEach((member) => {
      const node = member.data || member;

      // Chỉ xử lý nếu có ghi thông tin ngày mất (death)
      if (node.death) {
        const { solar } = parseDeathText(node.death);
        if (solar && solar.d && solar.m) {
          const d = solar.d;
          const m = solar.m;

          let targetLunarYear = currentLunar.y;
          
          // Tìm ngày Dương lịch tương ứng của ngày giỗ Âm lịch đó trong năm nay
          let solarTarget = lunarToSolar(d, m, targetLunarYear);
          let targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;

          // Nếu ngày giỗ Âm lịch của năm nay đã trôi qua mất rồi, tính sang năm Âm lịch kế tiếp
          if (targetDate && targetDate < today) {
            targetLunarYear += 1;
            solarTarget = lunarToSolar(d, m, targetLunarYear);
            targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;
          }

          // Tính khoảng cách số ngày thực tế từ hôm nay đến ngày giỗ đó
          if (targetDate && solarTarget) {
            const diffTime = targetDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // Lấy các ngày giỗ sắp diễn ra trong vòng 7 ngày tới (daysLeft = 0 là đúng ngày hôm nay)
            if (daysLeft >= 0 && daysLeft <= 7) {
              const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
              const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
              const dayOfWeek = targetDate.getDay();
              const weekdayFull = WEEKDAYS_FULL[dayOfWeek];
              const weekdayShort = WEEKDAYS_SHORT[dayOfWeek];
              const solarDateStr = `${weekdayFull}, ${String(solarTarget.d).padStart(2, '0')}/${String(solarTarget.m).padStart(2, '0')}/${solarTarget.y}`;

              // Tính ngày Lễ Tiên Thường (ngày hôm trước ngày giỗ chính 1 ngày)
              const tienDate = new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d - 1);
              const tienDayOfWeek = tienDate.getDay();
              const tienWeekdayFull = WEEKDAYS_FULL[tienDayOfWeek];
              const tienLunar = solarToLunar(tienDate.getDate(), tienDate.getMonth() + 1, tienDate.getFullYear());
              const tienThuongLunar = `Chiều ${String(tienLunar.d).padStart(2, '0')}/${String(tienLunar.m).padStart(2, '0')} Âm lịch`;
              const tienThuongSolar = `${tienWeekdayFull}, ${String(tienDate.getDate()).padStart(2, '0')}/${String(tienDate.getMonth() + 1).padStart(2, '0')}/${tienDate.getFullYear()}`;

              const memorial = getPersonMemorialDetails(member);

              list.push({
                fullName: node.name,
                displayName: memorial.cleanPersonName,
                honorificName: memorial.honorificFullName,
                relationTitle: memorial.relationTitle,
                generationLabel: memorial.generationLabel,
                branchLabel: memorial.branchLabel,
                date: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')} Âm lịch`,
                days: daysLeft,
                person: member,
                solarDateStr,
                weekdayFull,
                weekdayShort,
                solarDay: solarTarget.d,
                solarMonth: solarTarget.m,
                solarYear: solarTarget.y,
                lunarDay: d,
                lunarMonth: m,
                tienThuongLunar,
                tienThuongSolar,
                tienThuongWeekday: tienWeekdayFull,
                chinhKyLunar: `Ngày ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')} Âm lịch`,
                chinhKySolar: solarDateStr,
                chinhKyWeekday: weekdayFull,
                ageLabel: memorial.ageLabel,
                birthDisplay: memorial.birthDisplay,
                deathDisplay: memorial.deathDisplay,
                bio: memorial.bio
              });
            }
          }
        }
      }
    });

    // Thêm các sự kiện ngày Rằm, Mùng 1, Lễ Tết
    const addSpecialDay = (targetLunarD: number, targetLunarM: number, targetLunarY: number, name: string, type: string) => {
      const solarTarget = lunarToSolar(targetLunarD, targetLunarM, targetLunarY);
      if (!solarTarget) return;
      const targetDate = new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d);
      const diffTime = targetDate.getTime() - today.getTime();
      const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 7) {
        const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayOfWeek = targetDate.getDay();
        const weekdayFull = WEEKDAYS_FULL[dayOfWeek];
        const weekdayShort = WEEKDAYS_SHORT[dayOfWeek];
        const solarDateStr = `${weekdayFull}, ${String(solarTarget.d).padStart(2, '0')}/${String(solarTarget.m).padStart(2, '0')}/${solarTarget.y}`;

        let specialDayTitle = name;
        let specialDayDesc = '';
        if (type === 'mung1') {
          specialDayTitle = `Lễ Sóc (Mùng 1 Tháng ${targetLunarM} ÂL)`;
          specialDayDesc = 'Nghi thức dâng hương bái yết Thần linh & Tiên tổ đầu tháng, cầu bình an cho gia đạo và dòng tộc.';
        } else if (type === 'ram') {
          specialDayTitle = `Lễ Vọng (Rằm Tháng ${targetLunarM} ÂL)`;
          specialDayDesc = 'Nghi lễ vọng nguyệt dâng hương hoa quả kính bái Phật Thánh & Tiên tổ, cầu phúc lành toàn gia.';
        } else if (type === 'tet') {
          specialDayTitle = 'Tết Nguyên Đán (Mùng 1 Tết)';
          specialDayDesc = 'Thời khắc đầu xuân năm mới mừng Xuân thái hòa, cung thỉnh Tiên tổ về gia từ sum vầy cùng cháu con.';
        }

        list.push({
          fullName: name,
          displayName: name,
          honorificName: specialDayTitle,
          date: `${String(targetLunarD).padStart(2, '0')}/${String(targetLunarM).padStart(2, '0')} Âm lịch`,
          days: daysLeft,
          solarDateStr,
          weekdayFull,
          weekdayShort,
          solarDay: solarTarget.d,
          solarMonth: solarTarget.m,
          solarYear: solarTarget.y,
          lunarDay: targetLunarD,
          lunarMonth: targetLunarM,
          isSpecialDay: true,
          specialDayType: type,
          specialDayTitle,
          specialDayDesc
        });
      }
    };

    const cL = currentLunar;

    // --- Tháng hiện tại ---
    if (cL.d === 1) {
      addSpecialDay(1, cL.m, cL.y, 'Mùng 1', 'mung1');
    }
    if (cL.d <= 15) {
      addSpecialDay(15, cL.m, cL.y, 'Ngày Rằm', 'ram');
    }

    // --- Tháng sau ---
    let nextMonth = cL.m + 1;
    let nextYear = cL.y;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }

    const isTetNextMonth = nextMonth === 1;
    addSpecialDay(1, nextMonth, nextYear,
      isTetNextMonth ? '🎉 Mùng 1 Tết' : 'Mùng 1',
      isTetNextMonth ? 'tet' : 'mung1'
    );
    addSpecialDay(15, nextMonth, nextYear, 'Ngày Rằm', 'ram');

    // --- Tháng sau nữa ---
    let nextNextMonth = nextMonth + 1;
    let nextNextYear = nextYear;
    if (nextNextMonth > 12) { nextNextMonth = 1; nextNextYear++; }
    addSpecialDay(1, nextNextMonth, nextNextYear,
      nextNextMonth === 1 ? '🎉 Mùng 1 Tết' : 'Mùng 1',
      nextNextMonth === 1 ? 'tet' : 'mung1'
    );

    // Sắp xếp danh sách: Ngày giỗ nào cận kề nhất (ít ngày nhất) sẽ xếp lên đầu
    const seen = new Set<string>();
    const deduped = list.filter(item => {
      const key = `${item.specialDayType ?? item.fullName}_${item.solarDay}_${item.solarMonth}_${item.solarYear}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return deduped.sort((a, b) => a.days - b.days);
  }, [memberEntries]);

  const refreshFamilyData = async () => {
    try {
      const sheetTree = await fetchFamilyTreeFromSheet();
      if (sheetTree) {
        setRawTree(sheetTree);
      }
    } catch (err) {
      console.error("Error reloading from Google Sheets:", err);
    }
  };

  const getLichData = (year: number) => getAllLichData(treeData, year);

  return { treeData, memberEntries, birthdays, reminders, todayLunar, getLichData, refreshFamilyData };
};