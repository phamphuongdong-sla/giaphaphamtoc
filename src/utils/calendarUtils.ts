import { LichEvent } from '@/types';

export function downloadCalendarEvent(event: LichEvent, currentYear: number) {
  // Lấy ngày sự kiện của năm hiện tại
  const eventDate = new Date(currentYear, event.solarMonth - 1, event.solarDay);
  
  const pad = (n: number) => String(n).padStart(2, '0');
  
  // Định dạng DTSTART và DTEND cho sự kiện All-Day (chỉ có YYYYMMDD)
  const dateOnly = `${eventDate.getFullYear()}${pad(eventDate.getMonth() + 1)}${pad(eventDate.getDate())}`;
  
  // DTEND của All-Day event phải là ngày tiếp theo (exclusive)
  const nextDay = new Date(eventDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDateOnly = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
  
  const title = event.type === 'gio' 
    ? `Ngày giỗ: ${event.fullName}` 
    : `Sinh nhật: ${event.fullName}`;
    
  let description = '';
  if (event.type === 'gio') {
     description = `Ngày giỗ âm lịch: ${event.lunarDay}/${event.lunarMonth}\\nDương lịch: ${event.solarDay}/${event.solarMonth}`;
  } else {
     description = `Sinh nhật dương lịch: ${event.solarDay}/${event.solarMonth}`;
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GiaPhaPhamToc//Lich//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTAMP:${dateOnly}T000000Z`,
    `DTSTART;VALUE=DATE:${dateOnly}`,
    `DTEND;VALUE=DATE:${nextDateOnly}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `UID:${eventDate.getTime()}-${Math.random().toString(36).substr(2, 9)}@giaphaphamtoc.vn`,
  ];

  // Thông báo trước 7 ngày, 3 ngày, 1 ngày và đúng ngày (lúc 08:00 sáng)
  // Vì là All-Day event nên DTSTART là 00:00 của ngày đó.
  // -P7D = 7 ngày trước, -P3D = 3 ngày trước, -P1D = 1 ngày trước
  // PT8H = 8 giờ sau DTSTART (tức 8h sáng đúng ngày)
  const triggers = ['-P7D', '-P3D', '-P1D', 'PT8H'];
  
  triggers.forEach(trigger => {
    icsLines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${title}`,
      `TRIGGER:${trigger}`,
      'END:VALARM'
    );
  });

  icsLines.push('END:VEVENT');
  icsLines.push('END:VCALENDAR');

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  
  const safeName = (event.fullName || 'sukien').replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]/g, '');
  a.download = `lich_${event.type}_${safeName}.ics`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
