import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { getLunarToday, getCanChiYear } from '@/utils/dateUtils';

interface VanKhanModalProps {
  onClose: () => void;
}

interface VanKhanItem {
  id: string;
  category: 'gio' | 'taomo' | 'tet' | 'ram' | 'quychinh';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge: string;
  content: string;
}

const VAN_KHAN_DATA: VanKhanItem[] = [
  {
    id: 'gio-chinh',
    category: 'gio',
    categoryLabel: 'Cúng Giỗ',
    title: 'Văn Khấn Cúng Giỗ Tiên Tổ (Tiên Thường & Chính Kỵ)',
    subtitle: 'Nghi thức phụng cúng ngày Tiên thường (chiều trước giỗ) hoặc Chính giỗ tại Từ đường / Gia từ',
    badge: 'Chính Kỵ',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
- Con kính lạy Hoàng thiên Hậu thổ chư vị Tôn thần.
- Con kính lạy ngài Đông trù Tư mệnh Táo phủ Thần quân.
- Con kính lạy ngài Bản cảnh Thành hoàng Chư vị Đại Vương, ngài Bản xứ Thần linh Thổ địa, Long mạch Tôn thần cùng chư vị Tôn thần cai quản trong xứ này.

- Con kính lạy Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ, Cụ Thủy tổ, Tiên tổ nội ngoại dòng họ Phạm.

Hôm nay là ngày ...... tháng ...... năm ...... (Âm lịch)
Chính ngày Kỵ nhật của: [Hương linh: Cụ / Ông / Bà ...]
Tín chủ con là: [Họ tên chủ lễ ...] cùng toàn thể gia quyến.
Ngụ cư tại: [Địa chỉ phụng thờ / Nơi cử hành tang lễ ...]

Thiết nghĩ: Cây có gốc mới nở ngành xanh ngọn, nước có nguồn mới biển rộng sông sâu. Nhớ đức cù lao dưỡng dục khôn xiết, nghĩ ơn sinh thành tạo đoan như non cao bể rộng. Nay gặp tiết Kỵ nhật, con cháu nhất tâm tề tựu, thành kính sửa sang hương đăng quả phẩm, kim ngân hoa lễ, dâng nén tâm hương thơm ngát trước linh toạ.

Kính cẩn thỉnh mời: [Hương linh: Cụ / Ông / Bà ...], tôn hiệu [tôn hiệu ...], phần mộ an táng tại [nơi an táng ...]
Cùng chư vị Tiên linh phụ thờ Tả ban Hữu dực, chư vị Hương hồn nội ngoại dòng họ Phạm đồng lai giáng phó án tiền, thụ hưởng lễ vật, chứng giám tấc dạ lòng thành.

Kính lạy chư vị Thần linh bản xứ, Tiên tổ linh thiêng, cúi xin phù hộ độ trì khuông phù đồng tộc:
Bốn mùa thanh cát, tám tiết an khang, gia đạo hưng long, tử tôn hiếu thuận, học hành đỗ đạt, xuất nhập bình an, phúc lộc trường tồn, tình nghĩa đồng tộc muôn thuở keo sơn gắn bó.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin chứng giám tấc dạ, phù hộ độ trì.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'tao-mo',
    category: 'taomo',
    categoryLabel: 'Tảo Mộ',
    title: 'Văn Khấn Lễ Tảo Mộ, Chạp Mộ & Thanh Minh',
    subtitle: 'Nghi thức dâng hương bồi đắp, dọn dẹp thanh minh phần mộ Tiên tổ nơi Nghĩa trang Gia tộc',
    badge: 'Tảo Mộ',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy ngài Kim Niên Đương cai Thái Tuế Chí đức Tôn thần.
- Con kính lạy ngài Bản cảnh Thành hoàng, Ngũ phương Ngũ thổ Long mạch Tôn thần, Thần linh Bản xứ cai quản nghĩa trang gia tộc.
- Con kính lạy chư vị Tiên linh phụ mẫu, bá thúc huynh đệ, cô di tỷ muội dòng họ Phạm an nghỉ nơi linh địa.

Hôm nay là tiết: [Dịp Tiết Thanh Minh / Tiết Lễ Tảo Mộ cuối năm]
Ngày ...... tháng ...... năm ...... (Âm lịch)
Tín chủ con là: [Họ tên đại diện con cháu dòng tộc ...]
Ngụ tại: [Địa chỉ gia tộc ...]

Kính cẩn tâu trình: Nhờ ơn trời đất che chở, linh khí non sông bồi tụ, phúc ấm Tiên tổ lưu truyền muôn đời. Nay con cháu hướng về cội nguồn huyết thống, dâng nén tâm hương, cơi trầu chén nước, sửa sang phần mộ phong quang sạch đẹp, đắp đất bồi cỏ cho phần mộ các bậc tiền nhân được ấm êm muôn thuở.

Kính thỉnh Chư vị Tôn thần bản thổ cho phép Gia tiên tiền tổ họ Phạm an nghỉ nơi đây:
Được giáng lâm hiển linh thụ hưởng lễ vật, phù hộ khuông phù cho dòng họ:
Huyết mạch lưu thông, nhân khang vật thịnh, con cháu đời đời phát phúc phát tài, rạng danh gia phong tông tộc.

Chúng con lễ bạc tâm thành, trước linh vị cúi đầu kính bái.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'giao-thua',
    category: 'tet',
    categoryLabel: 'Lễ Tết',
    title: 'Văn Khấn Rước Tiên Tổ & Lễ Tết Cổ Truyền (30 Tết, Mùng 1, 2, 3, 4 Tạ Lễ)',
    subtitle: 'Nghi thức cung thỉnh Tổ tiên về ngự tại Từ đường / Gia từ mừng Xuân đón Tết sum vầy cùng cháu con',
    badge: 'Lễ Tết',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
- Con kính lạy ngài Kim Niên Đương cai Thái Tuế Chí đức Tôn thần tiền nhiệm và đương nhiệm.
- Con kính lạy Bản gia Đông trù Tư mệnh Định phúc Táo quân.
- Con kính lạy Liệt vị Tiên tổ, Cụ Thủy tổ, Tổ khảo, Tổ tỷ dòng họ Phạm.

[Thời khắc lễ Tết: Hôm nay là ...]
Tín chủ con là: [Họ tên gia chủ ...] cùng toàn thể con cháu gia quyến.
Ngụ tại: [Địa chỉ gia đạo ...]

[Lời khấn nguyện tiết Xuân: ...]

Kính cẩn cung thỉnh: Cụ Thủy tổ, Tiên tổ khảo, Tiên tổ tỷ cùng chư vị Chân linh nội ngoại dòng họ Phạm giáng lâm trước án, thụ hưởng lễ vật, ngự tại gia từ đón mừng năm mới, chung vui hòa khí cùng con cháu xuân thì.

Cúi xin Tiên linh che chở:
Sang năm mới vạn sự hanh thông, công thành danh toại, phúc thọ tăng long, gia đạo hòa thuận khang ninh, dòng họ trường thịnh thiên thu.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'mung-1-ram',
    category: 'ram',
    categoryLabel: 'Mùng 1 & Rằm',
    title: 'Văn Khấn Thường Nhật Tiết Sóc Vọng (Mùng Một & Rằm)',
    subtitle: 'Nghi lễ sóc vọng tuần tiết hàng tháng bái yết Thần linh Gia tiên tại ban thờ từ đường',
    badge: 'Sóc Vọng',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy Hoàng thiên Hậu thổ chư vị Tôn thần.
- Con kính lạy ngài Đông trù Tư mệnh Táo phủ Thần quân.
- Con kính lạy ngài Bản gia Thổ địa Long mạch Tôn thần.
- Con kính lạy Chư vị Thần linh cai quản trong xứ này.
- Con kính lạy Liệt vị Tiên tổ nội ngoại dòng họ Phạm.

Hôm nay là ngày: [Tiết Sóc Vọng: ...]
Tín chủ con là: [Họ tên chủ tế / Trưởng tộc ...]
Ngụ tại: [Địa chỉ gia từ / Từ đường ...]

Nay nhân ngày tuần tiết, con cháu lòng thành kính cẩn, lau dọn phong quang ban thờ gia tiên, kính cẩn dâng nén tâm hương, chén trà thanh thủy, hương hoa quả thực trước linh sàng.

Cúi xin chư vị Tôn thần, Gia tiên tiền tổ giáng lâm trước án, chứng minh tấc lòng thành kính.
Phù hộ độ trì cho toàn gia đẳng:
Bốn mùa không tật ách, tám tiết thái bình an khang, mọi sự hanh thông sở cầu như ý, gia môn thịnh vượng ấm no.

Dãi tấm lòng thành, cúi xin chứng giám.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'quy-trinh',
    category: 'quychinh',
    categoryLabel: 'Quy Trình Lễ',
    title: 'Nghi Thức Lễ Kỵ Cổ Truyền & Bày Biện Án Gian Gia Tộc',
    subtitle: 'Quy thức tuần tiết, phép tắc bái vọng và nghi lễ chuẩn truyền thống người Việt',
    badge: 'Nghi Thức',
    content: `❖ 1. QUY THỨC TUẦN LỄ GIỖ TIÊN TỔ (LỄ KỴ NHẬT)
• Lễ Tiên Thường (Chiều ngày hôm trước giỗ chính):
  - Thời khắc thích hợp: Từ 14h00 đến 16h30 chiều.
  - Ý nghĩa: Cáo yết Thần linh Thổ địa sở tại, khai mở phụng tự và kính thỉnh Tiên tổ giáng lâm ngự tại linh tọa để chuẩn bị cho ngày Chính kỵ.
  - Lễ vật: Mâm cơm thanh đạm hoặc hoa quả, cơi trầu, chén rượu, trà hương.

• Lễ Chính Kỵ (Sáng ngày giỗ chính):
  - Thời khắc thích hợp: Từ 09h00 đến 11h30 trưa (trước giờ Ngọ).
  - Nghi thức: Gia chủ chỉnh túc y phục, thắp tam tuần hương (3 nén hương), rót tam tuần rượu (3 lần rượu: sơ hiến, á hiến, chung hiến).
  - Tạ lễ: Đợi tuần hương tàn quá nửa, bái 3 lạy tạ Tiên tổ, sau đó mới hóa vàng và thụ lộc.

❖ 2. QUY NGUYÊN BÀY ÁN GIAN ("ĐÔNG BÌNH TÂY QUẢ")
• Đông Bình: Đặt bình hoa tươi bên tay TẢ của người đứng bái (hướng Đông - mặt trời mọc, tượng trưng mùa Xuân sinh sôi).
• Tây Quả: Đặt mâm ngũ quả bên tay HỮU của người đứng bái (hướng Tây - tượng trưng mùa Thu kết trái đơm hoa viên mãn).
• Lư hương / Bát hương: Tọa vị trung tâm án gian, tuyệt đối không xê dịch tùy tiện.
• Bàn phụ hạ án: Đặt mâm cỗ mặn hoặc chay thấp hơn mặt ban thờ chính một bậc để giữ tính tôn nghiêm.

❖ 3. NGUYÊN TẮC XƯNG DANH & THỨ BẬC TRONG GIA TỘC
• Người chủ lễ: Trưởng tộc, Trưởng chi hoặc con cháu đích tôn đứng giữa đọc văn tế/khấn.
• Phép khấn: Đọc chậm rãi, âm giọng trang nghiêm, thanh tịnh.
• Thứ tự bái lạy: Tiên tổ tôn kính trước, con cháu thứ bậc theo sau; nam nữ tề chỉnh túc y.`
  }
];

// Định dạng trực quan các vị trí điền thông tin: mầu chữ, mầu nền giống nhau, in đậm chuẩn phong cách
const renderFormattedContent = (content: string) => {
  const parts = content.split(/(\[[^\]]+\]|\.{3,}|Ngày \d+ tháng \d+ năm [^\n(]+(?:\([^\n)]+\))?|ngày (?:Mùng \d+|mùng \d+|\d+|Rằm|30) tháng \d+ năm [^\n(]+(?:\([^\n)]+\))?|ngày 30 tháng Chạp năm [^\n(]+(?:\([^\n)]+\))?)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          const innerText = part.slice(1, -1);
          return (
            <span
              key={idx}
              className="font-serif font-bold"
              style={{
                color: 'inherit',
                fontWeight: 700,
                padding: '0 2px',
                display: 'inline'
              }}
            >
              {innerText}
            </span>
          );
        }
        if (/^\.{3,}$/.test(part) || /^(?:Ngày|ngày) (?:Mùng|mùng|\d+|Rằm|30)/.test(part)) {
          const isFilledDate = /^(?:Ngày|ngày) (?:Mùng|mùng|\d+|Rằm|30)/.test(part);
          return (
            <span
              key={idx}
              className="font-serif font-bold"
              style={{
                color: 'inherit',
                fontWeight: 700,
                borderBottom: isFilledDate ? 'none' : '1px dashed currentColor',
                padding: '0 2px',
                display: 'inline'
              }}
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export const VanKhanModal = ({ onClose }: VanKhanModalProps) => {
  const [activeTab, setActiveTab] = useState<string>('gio');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(22);
  const [autoFillDate, setAutoFillDate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenItemId, setFullscreenItemId] = useState<string | null>(null);

  // Form điền thông tin linh hoạt cho gia chủ
  const [showForm, setShowForm] = useState<boolean>(false);
  const [hostName, setHostName] = useState<string>(() => {
    return localStorage.getItem('vankhan_host_name') || '';
  });
  const [hostAddress, setHostAddress] = useState<string>(() => {
    return localStorage.getItem('vankhan_host_addr') || '';
  });
  const [deceasedName, setDeceasedName] = useState<string>(() => {
    return localStorage.getItem('vankhan_deceased_name') || '';
  });
  const [deceasedTitle, setDeceasedTitle] = useState<string>(() => {
    return localStorage.getItem('vankhan_deceased_title') || '';
  });
  const [burialLocation, setBurialLocation] = useState<string>(() => {
    return localStorage.getItem('vankhan_burial_loc') || '';
  });

  const handleSaveHostInfo = (name: string, addr: string, dec: string, title: string = deceasedTitle, burial: string = burialLocation) => {
    setHostName(name);
    setHostAddress(addr);
    setDeceasedName(dec);
    setDeceasedTitle(title);
    setBurialLocation(burial);
    localStorage.setItem('vankhan_host_name', name);
    localStorage.setItem('vankhan_host_addr', addr);
    localStorage.setItem('vankhan_deceased_name', dec);
    localStorage.setItem('vankhan_deceased_title', title);
    localStorage.setItem('vankhan_burial_loc', burial);
  };

  // Auto-scroll / Teleprompter State
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollFloatRef = useRef<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(2); // 1, 2, 3, 4
  const [isAtEnd, setIsAtEnd] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const SPEED_CONFIG: Record<number, { px: number; label: string }> = {
    1: { px: 22, label: '1x Chậm' },
    2: { px: 40, label: '2x Vừa' },
    3: { px: 65, label: '3x Nhanh' },
    4: { px: 95, label: '4x Rất nhanh' }
  };

  // Sub-pixel smooth Auto-scroll animation loop (Mobile & Desktop optimized)
  useEffect(() => {
    if (!isFullscreen || !isAutoScrolling) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    // Khởi tạo vị trí float ban đầu
    scrollFloatRef.current = scrollEl.scrollTop;
    lastTimestampRef.current = null;

    const scrollStep = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const elapsed = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = timestamp;

      const pxPerSec = SPEED_CONFIG[scrollSpeed]?.px || 40;
      const distance = pxPerSec * elapsed;

      if (scrollEl) {
        const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
        
        // CHỈ DỪNG NẾU maxScroll ĐÃ ĐỦ LỚN (> 40px) VÀ ĐÃ CUỘN TỚI ĐÁY
        if (maxScroll > 40 && scrollEl.scrollTop >= maxScroll - 6) {
          setIsAtEnd(true);
          setIsAutoScrolling(false);
          return;
        } else {
          setIsAtEnd(false);
          scrollFloatRef.current += distance;
          scrollEl.scrollTop = Math.floor(scrollFloatRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isFullscreen, isAutoScrolling, scrollSpeed]);

  // Keyboard shortcuts when in Fullscreen Mode
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoScrolling(prev => !prev);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetScrollToTop();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setScrollSpeed(prev => Math.max(1, prev - 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setScrollSpeed(prev => Math.min(4, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const openFullscreen = (itemId: string) => {
    setFullscreenItemId(itemId);
    setIsFullscreen(true);
    setIsAtEnd(false);
    scrollFloatRef.current = 0;
    setIsAutoScrolling(true);

    // Đảm bảo cuộn về đầu trang sau khi render xong
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        scrollFloatRef.current = 0;
      }
    }, 100);

    // Kích hoạt Fullscreen API nếu thiết bị hỗ trợ (không gây lỗi trên iOS Safari)
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignored on unsupported devices
    }

    // Giữ màn hình sáng suốt buổi lễ
    try {
      if ('wakeLock' in navigator) {
        (navigator as any).wakeLock.request('screen').catch(() => {});
      }
    } catch {
      // Ignored
    }
  };

  const closeFullscreen = () => {
    setFullscreenItemId(null);
    setIsFullscreen(false);
    setIsAutoScrolling(false);
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignored
    }
  };

  const resetScrollToTop = () => {
    scrollFloatRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAtEnd(false);
    }
  };

  // Tính ngày Âm lịch hôm nay
  const todayLunarObj = getLunarToday();
  const canChiYear = getCanChiYear(todayLunarObj.y);
  const lunarMonthStr = String(todayLunarObj.m).padStart(2, '0');
  const lunarDayStr = String(todayLunarObj.d).padStart(2, '0');

  const handleCopy = (id: string, rawContent: string, category?: string) => {
    const finalContent = getProcessedContent(rawContent, category);
    // Loại bỏ các ngoặc vuông đánh dấu khi copy ra ngoài
    const cleanContentForClipboard = finalContent.replace(/\[([^\]]+)\]/g, '$1');
    navigator.clipboard.writeText(cleanContentForClipboard).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 36));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 16));
  };

  // === Logic ngày & nhấp nháy ===
  const ld = todayLunarObj.d;
  const lm = todayLunarObj.m;

  // Đúng ngày Rằm (15) hoặc Mùng 1 (1)
  const isMung1Today = ld === 1;
  const isRamToday   = ld === 15;
  // Đúng dịp Tết: ngày 29/30 tháng Chạp hoặc Mùng 1 Tết
  const isTetToday = (lm === 12 && ld >= 29) || (lm === 1 && ld === 1);

  // Nhấp nháy trước 3 ngày
  const isRamSoon   = ld >= 12 && ld <= 14;  // ngày 12,13,14 → Rằm sắp đến
  const isMung1Soon = ld >= 27;              // ngày 27,28,29,30 → Mùng 1 sắp (tháng âm có thể 29 hoặc 30 ngày)
  const isTetSoon   = lm === 12 && ld >= 26; // 26-30 Chạp → Tết sắp

  // Kiểm tra bài khấn có nhấp nháy không
  const shouldBlink = (category: string): boolean => {
    if (category === 'ram') return isRamSoon || isMung1Soon || isMung1Today || isRamToday;
    if (category === 'tet') return isTetSoon || isTetToday;
    return false;
  };

  // Tự động gán ngày Âm lịch & thông tin tín chủ vào bài văn khấn theo yêu cầu phong tục
  const getProcessedContent = (content: string, category?: string) => {
    let result = content;

    // 1. Tự động thay thế thông tin tín chủ nếu người dùng đã nhập
    // Đặt trong cặp ngoặc vuông [...] để renderFormattedContent tự động định dạng chữ đậm (font-bold)
    if (hostName.trim()) {
      result = result.replace(
        /\[Họ tên chủ lễ \.\.\.\]|\[Họ tên gia chủ \.\.\.\]|\[Họ tên chủ tế \/ Trưởng tộc \.\.\.\]|\[Họ tên đại diện con cháu dòng tộc \.\.\.\]/g,
        `[${hostName.trim()}]`
      );
    }
    if (hostAddress.trim()) {
      result = result.replace(
        /\[Địa chỉ phụng thờ \/ Nơi cử hành tang lễ \.\.\.\]|\[Địa chỉ gia tộc \.\.\.\]|\[Địa chỉ gia đạo \.\.\.\]|\[Địa chỉ gia từ \/ Từ đường \.\.\.\]/g,
        `[${hostAddress.trim()}]`
      );
    }
    if (deceasedName.trim()) {
      result = result.replace(
        /\[Hương linh: Cụ \/ Ông \/ Bà \.\.\.\]/g,
        `[${deceasedName.trim()}]`
      );
    }
    if (deceasedTitle.trim()) {
      result = result.replace(
        /\[tôn hiệu \.\.\.\]/g,
        `[${deceasedTitle.trim()}]`
      );
    } else {
      result = result.replace(/\[tôn hiệu \.\.\.\]/g, '......');
    }
    if (burialLocation.trim()) {
      result = result.replace(
        /\[nơi an táng \.\.\.\]/g,
        `[${burialLocation.trim()}]`
      );
    } else {
      result = result.replace(/\[nơi an táng \.\.\.\]/g, '......');
    }

    // 2. Xử lý bài Rằm & Mùng 1:
    // "1. ngày rằm mùng và mùng một (đến ngày đó nội dung tự chèn vào) bình thường để trống không hiện gì"
    if (category === 'ram') {
      if (autoFillDate && (isMung1Today || isRamToday)) {
        const ramMung1Text = isMung1Today
          ? `ngày Mùng Một (Sóc nhật) tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
          : `ngày Rằm (Vọng nhật) tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
        result = result.replace(/\[Tiết Sóc Vọng: \.\.\.\]/g, ramMung1Text);
      } else {
        // Bình thường không phải Mùng 1 hay Rằm (hoặc tắt tự điền): để trống dấu chấm lửng
        result = result.replace(/\[Tiết Sóc Vọng: \.\.\.\]/g, '......');
      }
    }

    // 3. Xử lý bài Lễ Tết:
    // "2. ngày lễ tết ngày 30 1,2,3,4 hiện đến ngày nào hiện nội dung ngày đó đúng theo phong tục chuẩn việt nam"
    if (category === 'tet') {
      let tetTimeText = 'ngày ...... tháng ...... năm ......';
      let tetWishText = 'Năm cũ tống cựu, năm mới nghinh tân. Đất trời chuyển vận tam dương khai thái, xuân tiết trùng phùng vạn vật sinh sôi.\nNhớ đức Tiên tổ dày công vun đắp cội đức, mở mang cơ nghiệp cho hậu thế hôm nay. Giờ phút thiêng liêng mừng đón Xuân mới, con cháu một dạ chí thành, sửa biện hương hoa kim ngân trần thiết, cỗ bàn tinh khiết dâng lên trước án.';

      if (autoFillDate) {
        if (lm === 12 && (ld === 29 || ld === 30)) {
          // Ngày 30 (hoặc 29 tháng thiếu): Chiều Tất niên / Đêm Giao thừa
          tetTimeText = `giờ trừ tịch cát nhật, ngày ${ld} tháng Chạp năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
          tetWishText = 'Năm cũ tống cựu, năm mới nghinh tân. Giờ khắc thiêng liêng đất trời chuyển vận, tiễn năm cũ qua đi, cung nghinh năm mới sắp tới.\nNhớ đức Tiên tổ dày công vun đắp cội đức, con cháu một dạ chí thành, sửa sang lễ vật, hương hoa trà quả, thắp nén tâm hương dâng lên trước án, cung thỉnh Tiên tổ về ngự tại từ đường rước Xuân đón Tết cùng con cháu.';
        } else if (lm === 1 && ld === 1) {
          // Mùng 1 Tết: Sáng Nguyên Đán bái yết Gia Tiên đầu năm
          tetTimeText = `sáng ngày Mùng 1 Tết Nguyên Đán năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
          tetWishText = 'Nay tiết đầu xuân, nhân tiết Nguyên đán cát nhật, đất trời tinh khôi, tam dương khai thái.\nCon cháu muôn phương một dạ hướng về nguồn cội, kính cẩn dâng mâm cỗ cúng đầu năm, kính chúc Tiên tổ an ngự linh tọa, phù hộ cháu con bước sang năm mới vạn sự như ý, gia đạo an khang thịnh vượng.';
        } else if (lm === 1 && ld === 2) {
          // Mùng 2 Tết: Cúng kính ngày Tết thứ hai
          tetTimeText = `ngày Mùng 2 Tết Nguyên Đán năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
          tetWishText = 'Nay nhân tiết Mùng 2 Tết Nguyên Đán, con cháu lại thành kính sửa sang mâm cơm trà tửu, kính dâng trước án.\nKính thỉnh Tiên tổ ngự tại bản gia vui Tết sum vầy, phù trì cho con cháu xuất hành cát tường, bốn phương thuận buồm xuôi gió.';
        } else if (lm === 1 && ld === 3) {
          // Mùng 3 Tết: Lễ Tạ Năm Mới / Hóa Vàng đầu năm
          tetTimeText = `ngày Mùng 3 Tết Nguyên Đán năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
          tetWishText = 'Nay ngày Mùng 3 Tết, xuân tiết đượm nhuần. Con cháu dâng mâm cỗ tạ lễ, kính bái Tiên linh tiền tổ.\nCúi xin Tiên tổ chứng giám lòng thành, phù hộ toàn gia khai xuân đón lộc, công việc hanh thông, vạn sự tốt lành.';
        } else if (lm === 1 && ld === 4) {
          // Mùng 4 Tết: Lễ Tạ Tết / Khởi sự năm mới
          tetTimeText = `ngày Mùng 4 Tết Nguyên Đán năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
          tetWishText = 'Tiết xuân rực rỡ, ngày lành khởi đầu. Con cháu thành kính dâng lễ phụng tạ Gia tiên sau những ngày Tết đầm ấm.\nKính thỉnh Tiên tổ hồi loan linh vị, tiếp tục khuông phù độ trì cho dòng tộc bền vững trường tồn, làm ăn phát đạt quanh năm.';
        } else {
          tetTimeText = `tiết Lễ Tết năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`;
        }
      }

      result = result.replace(/\[Thời khắc lễ Tết: Hôm nay là \.\.\.\]/g, `Hôm nay là ${tetTimeText}`);
      result = result.replace(/\[Lời khấn nguyện tiết Xuân: \.\.\.\]/g, tetWishText);
    }

    // 4. Xử lý bài Tảo Mộ:
    // "3. tảo mộ bấm nút tự điền ngày cũng tự thêm vào Ngày ...... tháng ...... năm ...... (Âm lịch) 
    // Hôm nay là tiết: Dịp Tiết Thanh Minh / Tiết Lễ Tảo Mộ cuối năm (giống trên)"
    if (category === 'taomo') {
      if (autoFillDate) {
        // Tiết lễ tảo mộ: Tháng Chạp (cuối năm) hoặc Tiết Thanh Minh (tháng 2-3 AL) hoặc tháng 7 AL
        const isCuoiNam = lm === 12 || lm === 11;
        const isThanhMinh = lm === 2 || lm === 3;
        const tietLaoMo = isCuoiNam 
          ? 'Tiết Lễ Tảo Mộ Chạp Mộ cuối năm' 
          : (isThanhMinh ? 'Tiết Thanh Minh tảo mộ gia tộc' : 'Tiết Lễ Tảo Mộ truyền thống gia tộc');

        result = result.replace(
          /\[Dịp Tiết Thanh Minh \/ Tiết Lễ Tảo Mộ cuối năm\]/g,
          tietLaoMo
        );
        result = result.replace(
          /Ngày \.{3,} tháng \.{3,} năm \.{3,}(?: \(Âm lịch\))?/g,
          `Ngày ${lunarDayStr} tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
        );
      } else {
        result = result.replace(
          /\[Dịp Tiết Thanh Minh \/ Tiết Lễ Tảo Mộ cuối năm\]/g,
          '......'
        );
      }
    }

    // 5. Xử lý bài Cúng Giỗ (gio):
    if (category === 'gio' && autoFillDate) {
      result = result.replace(
        /Hôm nay là ngày \.{3,} tháng \.{3,} năm \.{3,}(?: \(Âm lịch\))?/g,
        `Hôm nay là ngày ${lunarDayStr} tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
      );
    }

    return result;
  };

  const filteredItems = VAN_KHAN_DATA.filter((item) => item.category === activeTab);
  const fullscreenItem = fullscreenItemId ? VAN_KHAN_DATA.find(i => i.id === fullscreenItemId) : null;

  // ---- FULLSCREEN VIEW (TELEPROMPTER CHẾ ĐỘ CUỘN TỰ ĐỘNG) ----
  if (isFullscreen && fullscreenItem) {
    const processedContent = getProcessedContent(fullscreenItem.content, fullscreenItem.category);
    return (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 999999,
          background: '#0a0806',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* Thanh tiêu đề & Công cụ trên cùng */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px',
          background: 'rgba(12, 9, 6, 0.96)',
          borderBottom: '1px solid rgba(201, 146, 58, 0.3)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0, gap: 12, zIndex: 10
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--gold-mid)',
                background: 'rgba(201,146,58,0.15)', padding: '2px 8px',
                borderRadius: 4, border: '1px solid rgba(201,146,58,0.25)',
                display: 'inline-block'
              }}>{fullscreenItem.badge}</span>

              {isAutoScrolling ? (
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#4ade80',
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                  Đang chạy tự động
                </span>
              ) : (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px 8px',
                  borderRadius: 12
                }}>
                  {isAtEnd ? 'Đã hết bài' : 'Tạm dừng cuộn'}
                </span>
              )}
            </div>
            <div className="font-serif" style={{
              fontSize: 16, fontWeight: 700, color: 'var(--gold-light)',
              lineHeight: 1.3, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3
            }}>
              {fullscreenItem.title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Cỡ chữ */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={decreaseFontSize} 
                disabled={fontSize <= 16} 
                title="Giảm cỡ chữ"
                style={{
                  background: 'transparent', border: 'none',
                  color: fontSize <= 16 ? 'var(--text-muted)' : 'var(--gold-light)',
                  fontSize: 12, fontWeight: 800, cursor: fontSize <= 16 ? 'default' : 'pointer',
                  padding: '6px 10px', height: 34
                }}
              >A-</button>
              <span style={{ fontSize: 11.5, color: 'var(--gold-mid)', minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{fontSize}px</span>
              <button 
                onClick={increaseFontSize} 
                disabled={fontSize >= 36} 
                title="Tăng cỡ chữ"
                style={{
                  background: 'transparent', border: 'none',
                  color: fontSize >= 36 ? 'var(--text-muted)' : '#fff',
                  fontSize: 13, fontWeight: 800, cursor: fontSize >= 36 ? 'default' : 'pointer',
                  padding: '6px 10px', height: 34
                }}
              >A+</button>
            </div>

            {/* Nút thoát fullscreen */}
            <button
              onClick={closeFullscreen}
              title="Thoát toàn màn hình (ESC)"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, height: 34,
                fontSize: 12, fontWeight: 700,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', cursor: 'pointer'
              }}
            >
              <Icon name="minimize" size={14} />
              <span>Đóng</span>
            </button>
          </div>
        </div>

        {/* Khung nội dung văn khấn cuộn mượt mà phong cách Cuốn Thư Cổ Hoàng Gia */}
        <div
          ref={scrollContainerRef}
          onScroll={() => {
            const el = scrollContainerRef.current;
            if (el && Math.abs(el.scrollTop - scrollFloatRef.current) > 8) {
              scrollFloatRef.current = el.scrollTop;
            }
          }}
          className="font-serif teleprompter-scroll-view"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '36px clamp(16px, 4vw, 36px) 180px',
            color: '#fff8eb',
            fontSize: `${fontSize}px`,
            lineHeight: 2.15,
            textAlign: 'justify',
            textJustify: 'inter-word',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
            letterSpacing: '0.02em',
            background: 'radial-gradient(ellipse at center, #1b1610 0%, #100c08 65%, #080605 100%)',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
          }}
        >
          {renderFormattedContent(processedContent)}

          {/* Dấu hiệu kết thúc bài khấn */}
          <div style={{
            marginTop: 50,
            padding: '24px 16px',
            borderTop: '1px dashed rgba(201,146,58,0.4)',
            textAlign: 'center',
            color: 'var(--gold-mid)',
            fontSize: Math.max(14, fontSize - 6)
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>❖ ❖ ❖</div>
            <div style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              ĐÃ HẾT BÀI VĂN KHẤN
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
              Lễ bạc tâm thành · Cúi xin chứng giám và phù hộ độ trì
            </div>
            <button
              onClick={resetScrollToTop}
              style={{
                marginTop: 16,
                padding: '8px 18px',
                borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                border: 'none',
                color: '#000',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Icon name="rotate-ccw" size={14} /> Cuộn lại từ đầu
            </button>
          </div>
        </div>

        {/* Thanh điều khiển Teleprompter nổi ở đáy màn hình */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(16, 12, 8, 0.94)',
          border: '1px solid var(--border-gold)',
          borderRadius: 24,
          padding: '8px 14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), var(--shadow-gold-glow)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: '94%',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Nút Play / Pause To Rõ */}
          <button
            onClick={() => setIsAutoScrolling(prev => !prev)}
            style={{
              padding: '8px 16px',
              borderRadius: 18,
              border: 'none',
              background: isAutoScrolling 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
              color: isAutoScrolling ? '#fff' : '#000',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isAutoScrolling ? '0 0 14px rgba(239,68,68,0.4)' : 'var(--shadow-gold-glow)',
              transition: 'all 0.2s'
            }}
          >
            <Icon name={isAutoScrolling ? 'pause' : 'play'} size={16} />
            <span>{isAutoScrolling ? 'Tạm Dừng' : 'Bắt Đầu Chạy'}</span>
          </button>

          {/* Bộ chọn tốc độ (Speed selector pills) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', padding: 3, borderRadius: 16, border: '1px solid var(--border-glass)' }}>
            {[1, 2, 3, 4].map(spd => (
              <button
                key={spd}
                onClick={() => setScrollSpeed(spd)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 12,
                  border: 'none',
                  background: scrollSpeed === spd ? 'rgba(201,146,58,0.3)' : 'transparent',
                  color: scrollSpeed === spd ? 'var(--gold-light)' : 'var(--text-muted)',
                  fontWeight: scrollSpeed === spd ? 700 : 500,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  borderBottom: scrollSpeed === spd ? '2px solid var(--gold)' : '2px solid transparent'
                }}
              >
                {SPEED_CONFIG[spd].label}
              </button>
            ))}
          </div>

          {/* Nút Về Đầu Trang */}
          <button
            onClick={resetScrollToTop}
            title="Cuộn lại từ đầu (Phím R)"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              borderRadius: 16,
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Icon name="rotate-ccw" size={13} />
            <span>Về đầu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={{ padding: '8px 4px' }}
    >
      <div 
        className="modal vankhan-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: isFullscreen ? '98%' : '100%', 
          maxWidth: isFullscreen ? '1400px' : '900px', 
          height: isFullscreen ? '96vh' : '92vh',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          border: '1px solid var(--border-gold-md)',
          background: '#0a0806'
        }}
      >
        {/* Header */}
        <div 
          className="modal-head vankhan-modal-head" 
          style={{ 
            padding: isFullscreen ? '10px 14px 8px' : '12px 14px 10px', 
            borderBottom: '1px solid var(--border-gold-md)',
            background: 'var(--bg-card)',
            flexShrink: 0
          }}
        >
          {/* Hàng 1: Tiêu đề & Cụm Nút Công Cụ */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(201,146,58,0.3), rgba(201,146,58,0.1))',
                border: '1px solid var(--border-gold)',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                <Icon name="book-open" size={18} style={{ color: 'var(--gold-light)' }} />
              </div>
              <div>
                <h2 className="font-display" style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--gold-light)', margin: 0, lineHeight: 1.2 }}>
                  Tủ Sách Văn Khấn Cổ Truyền
                </h2>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia Phả Phạm Tộc</span>
              </div>
            </div>

            {/* Cụm nút: Nút Điền thông tin tín chủ nổi bật + Nút Đóng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowForm(prev => !prev)}
                className="action-button"
                style={{
                  background: showForm ? 'linear-gradient(135deg, var(--gold), var(--gold-deep))' : 'rgba(201,146,58,0.22)',
                  border: '1px solid var(--gold)',
                  borderRadius: 8,
                  color: showForm ? '#000' : 'var(--gold-light)',
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: showForm ? '0 0 12px rgba(201,146,58,0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                title="Nhập họ tên gia chủ, địa chỉ, người được cúng để tự động điền vào toàn bộ bài văn khấn"
              >
                <Icon name="user-check" size={14} />
                <span>{showForm ? 'Đang mở form điền' : '✍ Điền tên gia chủ / Người mất'}</span>
              </button>

              <button 
                className="detail-close" 
                onClick={onClose}
                aria-label="Đóng tủ sách"
                title="Đóng cửa sổ"
                style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  color: 'var(--gold-light)', 
                  cursor: 'pointer', 
                  width: 36, height: 36,
                  borderRadius: 10,
                  display: 'grid', placeItems: 'center', flexShrink: 0
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>
          </div>

          {/* Hàng 2: Tự động gán ngày Âm lịch & Trạng thái điền khuyết */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 8
            }}
          >
            <div
              className="vankhan-date-notice"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                fontSize: 12,
                flexWrap: 'wrap',
                gap: 6
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--gold-light)' }}>
                <input
                  type="checkbox"
                  checked={autoFillDate}
                  onChange={(e) => setAutoFillDate(e.target.checked)}
                  style={{ accentColor: 'var(--gold)', width: 15, height: 15, cursor: 'pointer' }}
                />
                <span>
                  Tự động điền ngày hôm nay: <strong className="vankhan-lunar-highlight" style={{ color: '#fef08a' }}>{lunarDayStr}/{lunarMonthStr} năm {canChiYear}</strong>
                </span>
              </label>

              {(hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) && (
                <div style={{ fontSize: 11.5, color: '#fef08a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check-circle-2" size={13} style={{ color: '#4ade80' }} />
                  <span>Đã áp dụng thông tin: <strong>{[hostName, deceasedName, deceasedTitle, burialLocation].filter(Boolean).join(' · ')}</strong></span>
                </div>
              )}
            </div>

            {/* Form điền thông tin nhanh cho gia chủ */}
            {showForm && (
              <div className="vankhan-personalize-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(201,146,58,0.2)', paddingBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="pen-tool" size={12} />
                    Điền nhanh thông tin vào bài khấn (Tự động lưu)
                  </span>
                  {(hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) && (
                    <button
                      onClick={() => handleSaveHostInfo('', '', '', '', '')}
                      style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Xóa trắng
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>
                      Người đứng cúng (Tín chủ):
                    </label>
                    <input
                      type="text"
                      className="vankhan-input-field"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="VD: Con trưởng Phạm Văn Long..."
                      value={hostName}
                      onChange={(e) => handleSaveHostInfo(e.target.value, hostAddress, deceasedName, deceasedTitle, burialLocation)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>
                      Địa chỉ nơi cúng:
                    </label>
                    <input
                      type="text"
                      className="vankhan-input-field"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="VD: Xã ..., Huyện ..., Tỉnh ..."
                      value={hostAddress}
                      onChange={(e) => handleSaveHostInfo(hostName, e.target.value, deceasedName, deceasedTitle, burialLocation)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>
                      Người được cúng (Hương linh):
                    </label>
                    <input
                      type="text"
                      className="vankhan-input-field"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="VD: Cụ ông Phạm Văn An..."
                      value={deceasedName}
                      onChange={(e) => handleSaveHostInfo(hostName, hostAddress, e.target.value, deceasedTitle, burialLocation)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>
                      Tôn hiệu:
                    </label>
                    <input
                      type="text"
                      className="vankhan-input-field"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="VD: Hiệu Phúc Đức, Thuần Chính..."
                      value={deceasedTitle}
                      onChange={(e) => handleSaveHostInfo(hostName, hostAddress, deceasedName, e.target.value, burialLocation)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>
                      Phần mộ an táng tại:
                    </label>
                    <input
                      type="text"
                      className="vankhan-input-field"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="VD: Nghĩa trang gia tộc thôn..."
                      value={burialLocation}
                      onChange={(e) => handleSaveHostInfo(hostName, hostAddress, deceasedName, deceasedTitle, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hàng 3: Danh mục văn khấn */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 6, 
            width: '100%',
            boxSizing: 'border-box',
            paddingBottom: 2
          }}>
            {[
              { id: 'gio', label: 'Cúng Giỗ' },
              { id: 'taomo', label: 'Tảo Mộ' },
              { id: 'tet', label: 'Lễ Tết' },
              { id: 'ram', label: 'Mùng 1 & Rằm' },
              { id: 'quychinh', label: 'Quy Trình Lễ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`vankhan-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  flex: '1 1 auto',
                  minWidth: '85px',
                  textAlign: 'center',
                  padding: '7px 10px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: activeTab === tab.id ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  background: activeTab === tab.id ? 'rgba(201,146,58,0.25)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(201,146,58,0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Khung đọc văn khấn toàn màn hình cực rộng */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isFullscreen ? '14px 16px' : '12px 14px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          WebkitOverflowScrolling: 'touch'
        }}>
          {filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            const blink = shouldBlink(item.category);
            const processedContent = getProcessedContent(item.content, item.category);
            return (
              <div
                key={item.id}
                className="vankhan-item-card"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  height: isFullscreen ? '100%' : undefined
                }}
              >
                {/* Header bài khấn */}
                <div 
                  className="vankhan-item-header"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 6, 
                    borderBottom: '1px solid rgba(201,146,58,0.2)', 
                    paddingBottom: 10 
                  }}
                >
                  {/* Hàng 1: Badge trái + Nút phải */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span 
                      className="vankhan-badge"
                      style={{
                        display: 'inline-block',
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--gold-mid)',
                        background: 'rgba(201,146,58,0.12)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid rgba(201,146,58,0.2)',
                        flexShrink: 0
                      }}
                    >
                      {item.badge}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {/* Nút Điền thông tin nhanh cho bài khấn này */}
                      <button
                        onClick={() => setShowForm(prev => !prev)}
                        title="Điền họ tên gia chủ, địa chỉ, người mất, tôn hiệu, phần mộ vào bài khấn này"
                        className="vankhan-action-btn"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 11px', borderRadius: 8, height: 32,
                          fontSize: 12, fontWeight: 700,
                          background: (hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) ? 'rgba(34,197,94,0.15)' : 'rgba(201,146,58,0.25)',
                          border: '1px solid ' + ((hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) ? '#4ade80' : 'var(--border-gold)'),
                          color: (hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) ? '#86efac' : 'var(--gold-light)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon name="pen-tool" size={12} />
                        {(hostName || hostAddress || deceasedName || deceasedTitle || burialLocation) ? 'Sửa thông tin' : 'Điền thông tin'}
                      </button>

                      {/* Nút Toàn màn hình từng bài */}
                      <button
                        onClick={() => openFullscreen(item.id)}
                        title="Mở toàn màn hình bài khấn này"
                        className="vankhan-action-btn"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 11px', borderRadius: 8, height: 32,
                          fontSize: 12, fontWeight: 700,
                          background: 'rgba(201,146,58,0.2)',
                          border: '1px solid var(--border-gold)',
                          color: 'var(--gold-light)', cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon name="maximize" size={13} />
                        Toàn màn hình
                      </button>
                      {/* Nút Sao chép */}
                      <button
                        onClick={() => handleCopy(item.id, item.content, item.category)}
                        title="Sao chép toàn bộ bài văn khấn này"
                        className="vankhan-action-btn"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 11px', borderRadius: 8, height: 32,
                          fontSize: 12, fontWeight: 600,
                          background: isCopied ? 'rgba(61,168,112,0.25)' : 'rgba(201,146,58,0.18)',
                          border: '1px solid ' + (isCopied ? '#3da870' : 'var(--border-gold)'),
                          color: isCopied ? '#3da870' : 'var(--gold-light)',
                          cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <Icon name={isCopied ? 'check' : 'copy'} size={13} />
                        {isCopied ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  {/* Hàng 2: Tên bài — nhấp nháy nếu sắp đến ngày đặc biệt */}
                  <h3 className="font-serif vankhan-title" style={{
                    margin: 0, fontSize: 13.5, fontWeight: 700,
                    color: blink ? '#fef08a' : 'var(--gold-light)',
                    lineHeight: 1.35,
                    animation: blink ? 'vanKhanBlink 1.4s ease-in-out infinite' : 'none',
                  }}>
                    {blink && <span style={{ marginRight: 5 }}>🔔</span>}
                    {item.title}
                  </h3>

                  {/* Hàng 3: Mô tả */}
                  <p className="vankhan-subtitle" style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Khung văn khấn hiển thị cực lớn & dễ đọc với họa tiết cuốn thư */}
                <div
                  className="font-serif vankhan-text-box"
                  style={{
                    margin: 0,
                    padding: isFullscreen ? '22px 24px' : '18px 20px',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.9,
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
                    letterSpacing: '0.018em',
                    position: 'relative',
                    flex: isFullscreen ? 1 : undefined
                  }}
                >
                  {/* 4 góc triện hoa văn hoàng gia */}
                  <div className="vankhan-scroll-corner vankhan-corner-tl" />
                  <div className="vankhan-scroll-corner vankhan-corner-tr" />
                  <div className="vankhan-scroll-corner vankhan-corner-bl" />
                  <div className="vankhan-scroll-corner vankhan-corner-br" />

                  {renderFormattedContent(processedContent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div 
          className="vankhan-modal-footer"
          style={{ 
            padding: '10px 14px 12px', 
            borderTop: '1px solid var(--border-gold-md)', 
            background: 'var(--bg-card)', 
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          {/* Thanh chỉnh cỡ chữ */}
          <div 
            className="vankhan-font-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-gold)',
              borderRadius: 10,
              padding: '6px 10px',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="type" size={13} style={{ color: 'var(--gold-mid)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-mid)' }}>Cỡ chữ:</span>
              <span 
                className="vankhan-size-pill"
                style={{ 
                  fontSize: 12, fontWeight: 700, color: 'var(--gold-light)', 
                  background: 'rgba(201,146,58,0.25)', padding: '3px 8px', 
                  borderRadius: 6, border: '1px solid rgba(201,146,58,0.4)' 
                }}
              >
                {fontSize}px
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 16}
                className="vankhan-font-btn"
                style={{
                  background: fontSize <= 16 ? 'rgba(255,255,255,0.04)' : 'rgba(201,146,58,0.2)',
                  border: '1px solid ' + (fontSize <= 16 ? 'rgba(255,255,255,0.08)' : 'var(--border-gold)'),
                  borderRadius: 8, color: fontSize <= 16 ? 'var(--text-muted)' : 'var(--gold-light)',
                  fontSize: 12, fontWeight: 700,
                  cursor: fontSize <= 16 ? 'default' : 'pointer',
                  padding: '5px 11px', height: 32,
                  display: 'inline-flex', alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                A- Nhỏ
              </button>

              <button
                onClick={() => setFontSize(20)}
                className="vankhan-font-btn"
                style={{
                  background: fontSize === 20 ? 'rgba(201,146,58,0.35)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid ' + (fontSize === 20 ? 'var(--gold)' : 'rgba(255,255,255,0.12)'),
                  borderRadius: 8,
                  color: fontSize === 20 ? 'var(--gold-light)' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                  padding: '5px 11px', height: 32,
                  display: 'inline-flex', alignItems: 'center'
                }}
              >
                20px
              </button>

              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 32}
                className="vankhan-font-btn"
                style={{
                  background: fontSize >= 32 ? 'rgba(255,255,255,0.04)' : 'rgba(201,146,58,0.25)',
                  border: '1px solid ' + (fontSize >= 32 ? 'rgba(255,255,255,0.08)' : 'var(--gold)'),
                  borderRadius: 8, color: fontSize >= 32 ? 'var(--text-muted)' : '#ffffff',
                  fontSize: 12, fontWeight: 700,
                  cursor: fontSize >= 32 ? 'default' : 'pointer',
                  padding: '5px 11px', height: 32,
                  display: 'inline-flex', alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                A+ To
              </button>
            </div>
          </div>

          <button
            className="action-button modal-close"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(201,146,58,0.25), rgba(201,146,58,0.1))',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold-light)'
            }}
            onClick={onClose}
          >
            Thoát Tủ Sách
          </button>
        </div>
      </div>
    </div>
  );
};
