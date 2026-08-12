import { useState, useEffect, useMemo } from 'react';
import { MemberEntry, PersonNode } from '@/types';
import { GIA_PHA_DATA as initialFamilyTree } from '@/data/giapha';
import { fetchFamilyTreeFromSheet } from '@/services/googleSheets';
import { buildMemberEntries as flattenTree } from '@/utils/genealogyUtils';
import { getTodayLunar, solarToLunar, lunarToSolar, parseDeathText } from '@/utils/dateUtils';

export interface ReminderItem {
  type: 'death' | 'event';
  fullName: string;
  date: string;
  days: number;
  person?: MemberEntry;
  vanKhanTab?: 'gio' | 'taomo' | 'tet' | 'ram' | 'quychinh';
  subtitle?: string;
  solarDateStr?: string;
  weekdayFull?: string;
  weekdayShort?: string;
  solarDay?: number;
  solarMonth?: number;
  solarYear?: number;
}

export const useFamilyData = () => {
  const [rawTree, setRawTree] = useState<PersonNode>(initialFamilyTree);

  // Flatten cây gia phả để lấy danh sách thành viên phẳng
  const memberEntries = useMemo(() => {
    return flattenTree(rawTree);
  }, [rawTree]);

  // Cây gia phả chính
  const treeData = rawTree;

  // Lấy ngày Âm lịch hôm nay
  const todayLunar = useMemo(() => {
    return getTodayLunar();
  }, []);

  // Danh sách sinh nhật trong tháng Dương lịch hiện tại
  const birthdays = useMemo(() => {
    const currentSolarMonth = new Date().getMonth() + 1;
    return memberEntries.filter((m) => {
      const node = m.data || m;
      if (!node.birth) return false;
      const match = node.birth.match(/\d{1,2}[-/](\d{1,2})/);
      return match && parseInt(match[1]) === currentSolarMonth;
    });
  }, [memberEntries]);

  // Tính danh sách Ngày Giỗ & Nghi Lễ Âm Lịch (Mùng 1, Rằm, Tết) sắp tới
  const reminders = useMemo(() => {
    const list: ReminderItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // 1. Lấy thông tin năm Âm lịch hiện hành dựa vào ngày Dương lịch hôm nay
    const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    if (!currentLunar) return list;

    // 2. Duyệt qua toàn bộ thành viên trong file gia phả để lấy ngày giỗ
    memberEntries.forEach((member) => {
      const node = member.data || member;

      if (node.death) {
        const { solar } = parseDeathText(node.death);
        if (solar && solar.d && solar.m) {
          const d = solar.d;
          const m = solar.m;

          let targetLunarYear = currentLunar.y;
          
          let solarTarget = lunarToSolar(d, m, targetLunarYear);
          let targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;

          if (targetDate && targetDate < today) {
            targetLunarYear += 1;
            solarTarget = lunarToSolar(d, m, targetLunarYear);
            targetDate = solarTarget ? new Date(solarTarget.y, solarTarget.m - 1, solarTarget.d) : null;
          }

          if (targetDate && solarTarget) {
            const diffTime = targetDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (daysLeft >= 0 && daysLeft <= 20) {
              const dayOfWeek = targetDate.getDay();
              const weekdayFull = WEEKDAYS_FULL[dayOfWeek];
              const weekdayShort = WEEKDAYS_SHORT[dayOfWeek];
              const solarDateStr = `${weekdayFull}, ${String(solarTarget.d).padStart(2, '0')}/${String(solarTarget.m).padStart(2, '0')}/${solarTarget.y}`;

              list.push({
                type: 'death',
                fullName: `Ngày Giỗ cụ ${node.name}`,
                date: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')} Âm lịch`,
                days: daysLeft,
                person: member,
                vanKhanTab: 'gio',
                subtitle: `Ngày giỗ truyền thống họ Phạm`,
                solarDateStr,
                weekdayFull,
                weekdayShort,
                solarDay: solarTarget.d,
                solarMonth: solarTarget.m,
                solarYear: solarTarget.y
              });
            }
          }
        }
      }
    });

    // 3. Tính Lễ Mùng 1 Âm lịch kế tiếp (hoặc hôm nay)
    let nextMung1Year = currentLunar.y;
    let nextMung1Month = currentLunar.m;
    if (currentLunar.d > 1) {
      nextMung1Month += 1;
      if (nextMung1Month > 12) {
        nextMung1Month = 1;
        nextMung1Year += 1;
      }
    }
    const solarMung1 = lunarToSolar(1, nextMung1Month, nextMung1Year);
    if (solarMung1) {
      const dateMung1 = new Date(solarMung1.y, solarMung1.m - 1, solarMung1.d);
      dateMung1.setHours(0, 0, 0, 0);
      const daysMung1 = Math.round((dateMung1.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysMung1 >= 0 && daysMung1 <= 15) {
        const dayOfWeek = dateMung1.getDay();
        list.push({
          type: 'event',
          fullName: `Lễ Mùng 1 Âm Lịch (Khấn Mùng Một)`,
          date: `01/${String(nextMung1Month).padStart(2, '0')} Âm lịch`,
          days: daysMung1,
          vanKhanTab: 'ram',
          subtitle: 'Nghi lễ thắp hương Mùng Một hàng tháng tại Từ đường / Gia đền',
          solarDateStr: `${WEEKDAYS_FULL[dayOfWeek]}, ${String(solarMung1.d).padStart(2, '0')}/${String(solarMung1.m).padStart(2, '0')}/${solarMung1.y}`,
          weekdayFull: WEEKDAYS_FULL[dayOfWeek],
          weekdayShort: WEEKDAYS_SHORT[dayOfWeek],
          solarDay: solarMung1.d,
          solarMonth: solarMung1.m,
          solarYear: solarMung1.y
        });
      }
    }

    // 4. Tính Lễ Ngày Rằm (15 Âm lịch) kế tiếp (hoặc hôm nay)
    let nextRamYear = currentLunar.y;
    let nextRamMonth = currentLunar.m;
    if (currentLunar.d > 15) {
      nextRamMonth += 1;
      if (nextRamMonth > 12) {
        nextRamMonth = 1;
        nextRamYear += 1;
      }
    }
    const solarRam = lunarToSolar(15, nextRamMonth, nextRamYear);
    if (solarRam) {
      const dateRam = new Date(solarRam.y, solarRam.m - 1, solarRam.d);
      dateRam.setHours(0, 0, 0, 0);
      const daysRam = Math.round((dateRam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysRam >= 0 && daysRam <= 15) {
        const dayOfWeek = dateRam.getDay();
        list.push({
          type: 'event',
          fullName: `Lễ Ngày Rằm Âm Lịch (Khấn Ngày Rằm)`,
          date: `15/${String(nextRamMonth).padStart(2, '0')} Âm lịch`,
          days: daysRam,
          vanKhanTab: 'ram',
          subtitle: 'Nghi lễ thắp hương Ngày Rằm hàng tháng tại Từ đường / Gia đền',
          solarDateStr: `${WEEKDAYS_FULL[dayOfWeek]}, ${String(solarRam.d).padStart(2, '0')}/${String(solarRam.m).padStart(2, '0')}/${solarRam.y}`,
          weekdayFull: WEEKDAYS_FULL[dayOfWeek],
          weekdayShort: WEEKDAYS_SHORT[dayOfWeek],
          solarDay: solarRam.d,
          solarMonth: solarRam.m,
          solarYear: solarRam.y
        });
      }
    }

    // 5. Tính Lễ Tất Niên & Đêm Giao Thừa (30 tháng Chạp Âm lịch)
    let tetYear = currentLunar.y;
    if (currentLunar.m === 12 && currentLunar.d > 30) {
      tetYear += 1;
    }
    const solarTet = lunarToSolar(30, 12, tetYear) || lunarToSolar(29, 12, tetYear);
    if (solarTet) {
      const dateTet = new Date(solarTet.y, solarTet.m - 1, solarTet.d);
      dateTet.setHours(0, 0, 0, 0);
      const daysTet = Math.round((dateTet.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysTet >= 0 && daysTet <= 30) {
        const dayOfWeek = dateTet.getDay();
        list.push({
          type: 'event',
          fullName: `Lễ Tất Niên & Đêm Giao Thừa (Tết Âm Lịch)`,
          date: `30/12 Âm lịch`,
          days: daysTet,
          vanKhanTab: 'tet',
          subtitle: 'Nghi lễ khấn Tất Niên & Đêm Giao Thừa rước Gia tiên',
          solarDateStr: `${WEEKDAYS_FULL[dayOfWeek]}, ${String(solarTet.d).padStart(2, '0')}/${String(solarTet.m).padStart(2, '0')}/${solarTet.y}`,
          weekdayFull: WEEKDAYS_FULL[dayOfWeek],
          weekdayShort: WEEKDAYS_SHORT[dayOfWeek],
          solarDay: solarTet.d,
          solarMonth: solarTet.m,
          solarYear: solarTet.y
        });
      }
    }

    // Sắp xếp danh sách: Sự kiện/ngày giỗ nào cận kề nhất (ít ngày nhất) sẽ xếp lên đầu
    return list.sort((a, b) => a.days - b.days);
  }, [memberEntries]);

  const refreshFamilyData = async () => {
    try {
      const sheetTree = await fetchFamilyTreeFromSheet();
      if (sheetTree) {
        setRawTree(sheetTree);
      }
    } catch (err) {
      console.error('Error refreshing family data:', err);
    }
  };

  useEffect(() => {
    refreshFamilyData();
  }, []);

  return { treeData, memberEntries, birthdays, reminders, todayLunar, refreshFamilyData };
};