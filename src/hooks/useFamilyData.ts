import { useState, useEffect, useMemo } from 'react';
import { GIA_PHA_DATA } from '@/data/giapha';
import { PersonNode, MemberEntry } from '@/types';
import { fetchFamilyTreeFromSheet } from '@/services/googleSheets';
import {
  normalizeGenealogy,
  buildMemberEntries,
  getBirthdayEvents,
  getAllLichData
} from '@/utils/genealogyUtils';
import { getTodayLunar, solarToLunar, lunarToSolar, parseDeathText } from '@/utils/dateUtils';

export const useFamilyData = () => {
  const [rawTree, setRawTree] = useState<PersonNode>(GIA_PHA_DATA);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const sheetTree = await fetchFamilyTreeFromSheet();
        if (mounted && sheetTree) {
          setRawTree(sheetTree);
        }
      } catch (err) {
        console.error("Error loading from Google Sheets:", err);
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

  // LOGIC TÍNH NGÀY GIỖ SẮP TỚI THEO ĐÚNG NGÀY/THÁNG ÂM LỊCH TỪ CHUỖI "DEATH"
  const reminders = useMemo(() => {
    const list: { fullName: string; date: string; days: number; person: MemberEntry }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Lấy thông tin năm Âm lịch hiện hành dựa vào ngày Dương lịch hôm nay
    const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    if (!currentLunar) return list;

    // 2. Duyệt qua toàn bộ thành viên trong file giapha.ts
    memberEntries.forEach((member) => {
      const node = member.data || member; // Đảm bảo lấy đúng object chứa thuộc tính

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
          if (targetDate) {
            const diffTime = targetDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // Chỉ lấy các ngày giỗ sắp diễn ra trong vòng 20 ngày tới (daysLeft = 0 là đúng ngày hôm nay)
            if (daysLeft >= 0 && daysLeft <= 20) {
              list.push({
                fullName: node.name,
                date: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')} Âm lịch`,
                days: daysLeft,
                person: member
              });
            }
          }
        }
      }
    });

    // Sắp xếp danh sách: Ngày giỗ nào cận kề nhất (ít ngày nhất) sẽ xếp lên đầu
    return list.sort((a, b) => a.days - b.days);
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