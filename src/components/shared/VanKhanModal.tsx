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
    title: 'Bài Văn Khấn Cúng Giỗ (Tiên Thường & Chính Giỗ)',
    subtitle: 'Dùng vào chiều ngày trước giỗ (Tiên thường) hoặc sáng ngày chính giỗ tại Từ đường / Tại gia',
    badge: 'Cúng Giỗ',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
- Con kính lạy Hoàng thiên, Hậu thổ, chư vị Tôn thần.
- Con kính lạy ngài Bản cảnh Thành hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo quân cùng chư vị Tôn thần.
- Con kính lạy Cụ Thủy tổ, Tiên tổ, Tằng tổ, Tổ khảo, Tổ tỷ, chư vị Hương linh nội ngoại dòng họ Phạm.

Hôm nay là ngày ...... tháng ...... năm ...... (Âm lịch)
Năm tròn ngày giỗ của: ........................................................
Tín chủ (chúng) con là: ............................................................................
Ngụ tại: ....................................................................................................

Cúi xin thành tâm sửa sang hương hoa, lễ vật, trà quả, thắp nén tâm hương dâng lên trước án. Nhớ ơn linh cữu tiền nhân, nghĩ tình dưỡng dục sinh thành, nay gặp ngày giỗ/tiên thường, con cháu nhất tâm bái lễ.

Kính mời hương linh: ...............................................................................
Cùng chư vị Tiên tổ nội ngoại dòng họ Phạm đồng lâm án tọa, thụ hưởng lễ vật, chứng giám lòng thành.

Cúi xin phù hộ độ trì cho toàn thể con cháu trong dòng họ:
Nhiều sức khỏe, gia đạo bình an, công danh phát đạt, học hành tiến tới, tình đồng tộc ngày càng bền chặt.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin được chứng giám và phù hộ độ trì.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'tao-mo',
    category: 'taomo',
    categoryLabel: 'Tảo Mộ',
    title: 'Bài Văn Khấn Lễ Tảo Mộ (Dịp Tết / Tiết Thanh Minh / Rằm T7)',
    subtitle: 'Dùng khi con cháu ra khu mộ gia tộc / nghĩa trang họ dọn dẹp, thắp hương tảo mộ',
    badge: 'Tảo Mộ',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy ngài Kim Niên Đương niên Hành khiển Tôn thần.
- Con kính lạy ngài Bản cảnh Thổ địa, Ngũ phương Ngũ thổ Long mạch Tôn thần.
- Con kính lạy chư vị Hương linh Tiên tổ dòng họ Phạm đang an nghỉ tại khu mộ gia tộc.

Hôm nay là ngày ...... tháng ...... năm ......
Tín chủ con là: ........................................................................................
Sắm sửa lễ vật, hương hoa, trầu cau, chén nước dâng lên trước phần mộ.

Nhờ ơn trời đất, chư vị Tôn thần che chở, cùng linh khí Tiên tổ phù hộ, con cháu hôm nay hội tụ về đây, thành tâm dọn dẹp phần mộ thanh quang, thắp nén hương thơm tưởng nhớ cội nguồn.

Kính mời chư vị Hương linh Gia tiên dòng họ Phạm an nghỉ nơi đây về thụ hưởng lễ vật, chứng giám lòng thành.

Cúi xin chư vị độ trì cho gia quyến khang thái, con cháu làm ăn phát đạt, học hành đỗ đạt, dòng họ ngày càng hưng vượng.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'giao-thua',
    category: 'tet',
    categoryLabel: 'Lễ Tết',
    title: 'Bài Văn Khấn Tất Niên & Đêm Giao Thừa',
    subtitle: 'Dùng ngày 30 Tết Âm lịch khấn rước Gia Tiên về ăn Tết cùng con cháu',
    badge: 'Lễ Tết',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy Ngũ phương, Ngũ thổ, Long mạch, Táo quân, chư vị Tôn thần.
- Con kính lạy Cụ Thủy tổ, Tiên tổ nội ngoại dòng họ Phạm.

Hôm nay là ngày 30 tháng Chạp năm ......
Tín chủ con là: ........................................................................................

Giờ khắc giao thừa sắp đến, năm cũ qua đi, năm mới sắp tới. Con cháu thành tâm sửa sang lễ vật, hương hoa trà quả, thắp nén tâm hương dâng lên trước án.

Kính mời Cụ Thủy tổ, các vị Tiên tổ nội ngoại dòng họ Phạm giáng lâm trước án, thụ hưởng lễ vật, rước Xuân đón Tết cùng con cháu.

Cúi xin Tiên tổ phù hộ độ trì cho con cháu bước sang năm mới: Gia đạo vạn sự như ý, sức khỏe dồi dào, an khang thịnh vượng, tình nghĩa đồng tộc muôn đời bền vững.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'mung-1-ram',
    category: 'ram',
    categoryLabel: 'Mùng 1 & Rằm',
    title: 'Bài Văn Khấn Mùng Một (01) & Ngày Rằm (15)',
    subtitle: 'Dùng thắp hương thường nhật ngày Mùng 1 và Rằm hàng tháng',
    badge: 'Mùng 1 & Rằm',
    content: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy Hoàng thiên Hậu thổ chư vị Tôn thần.
- Con kính lạy ngài Đông Trù Tư mệnh Táo phủ Tôn thần.
- Con kính lạy Gia tiên nội ngoại dòng họ Phạm.

Hôm nay là ngày mùng 1 / ngày Rằm tháng ...... năm ......
Tín chủ con là: ........................................................................................

Thành tâm dâng lễ hương hoa, trà quả, thắp nén tâm hương kính dâng trước án.
Kính mời chư vị Tôn thần, Gia tiên dòng họ Phạm về chứng giám thụ hưởng.

Cúi xin phù hộ cho gia đạo an yên, bốn mùa không biến động, tám tiết hưởng bình an, vạn sự tốt lành.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`
  },
  {
    id: 'quy-trinh',
    category: 'quychinh',
    categoryLabel: 'Quy Trình Lễ',
    title: 'Hướng Dẫn Quy Trình & Lễ Vật Cúng Giỗ Chuẩn Phong Tục',
    subtitle: 'Nghi thức chuẩn bị mâm cỗ, thứ tự thắp hương và nghi lễ Tiên Thường - Chính Giỗ',
    badge: 'Quy Trình Lễ',
    content: `📌 1. QUY TRÌNH 2 NGÀY CÚNG GIỖ
• Ngày Tiên Thường (Chiều ngày trước giỗ):
  - Chiều (từ 14h - 16h): Lau dọn bàn thờ thanh tịnh.
  - Cúng Tiên Thường: Dâng mâm cỗ nhẹ để xin phép Thổ công và mời Gia tiên về dự giỗ ngày hôm sau.
• Ngày Chính Giỗ (Sáng ngày giỗ chính):
  - Sáng (từ 9h - 11h): Bày mâm cỗ mặn/chay chính giỗ.
  - Gia chủ thắp hương khấn bái. Sau khi nén hương cháy được khoảng 2/3, khấn xin hạ lễ và thụ lộc giỗ.

📌 2. NGUYÊN TẮC BÀY BÀN THỜ ("ĐÔNG BÌNH TÂY QUẢ")
• Đông Bình (Bên phải bàn thờ từ ngoài nhìn vào): Đặt bình hoa tươi.
• Tây Quả (Bên trái bàn thờ từ ngoài nhìn vào): Đặt mâm ngũ quả/trái cây.
• Mâm cỗ mặn/chay: Đặt trên bàn phụ phía trước bàn thờ (thấp hơn bát hương).

📌 3. THỨ TỰ THẮP HƯƠNG & XƯNG HÔ
• Trưởng tộc / Người cao tuổi nhất / Gia chủ thắp hương & đọc văn khấn trước.
• Sau đó con cháu lần lượt thắp hương theo thứ tự vai vế (Anh em, con cháu).`
  }
];

// Định dạng trực quan các vị trí điền thông tin cá nhân/ngày tháng
const renderFormattedContent = (content: string) => {
  const parts = content.split(/(\.{3,}|ngày (?:Mùng \d+|mùng \d+|\d+|Rằm|30) tháng \d+ năm [^\n(]+(?:\([^\n)]+\))?|ngày 30 tháng Chạp năm [^\n(]+(?:\([^\n)]+\))?)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (/^\.{3,}$/.test(part) || /^ngày (?:Mùng|mùng|\d+|Rằm|30)/.test(part)) {
          const isFilledDate = /^ngày (?:Mùng|mùng|\d+|Rằm|30)/.test(part);
          return (
            <span
              key={idx}
              style={{
                color: isFilledDate ? '#fef08a' : 'var(--gold-light)',
                borderBottom: isFilledDate ? '2px solid var(--gold)' : '1.5px dashed var(--gold)',
                fontWeight: 700,
                padding: '2px 8px',
                margin: '0 3px',
                background: isFilledDate ? 'rgba(201, 146, 58, 0.28)' : 'rgba(201, 146, 58, 0.18)',
                borderRadius: '6px',
                display: 'inline-block',
                lineHeight: 1.35,
                boxShadow: isFilledDate ? '0 0 8px rgba(201,146,58,0.25)' : 'none'
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
    navigator.clipboard.writeText(finalContent).then(() => {
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

  // Tự động gán ngày Âm lịch vào bài văn khấn theo danh mục
  const getProcessedContent = (content: string, category?: string) => {
    if (!autoFillDate) return content;

    // Bài Rằm/Mùng 1: chỉ điền khi đúng ngày
    if (category === 'ram' && !isMung1Today && !isRamToday) return content;
    // Bài Tết: chỉ điền khi đúng dịp
    if (category === 'tet' && !isTetToday) return content;
    
    const getLunarDayPhrase = (d: number) => {
      if (d === 1) return 'ngày Mùng 1';
      if (d === 15) return 'ngày Rằm (15)';
      if (d <= 10) return `ngày mùng ${String(d).padStart(2, '0')}`;
      return `ngày ${String(d).padStart(2, '0')}`;
    };

    const currentDayPhrase = getLunarDayPhrase(todayLunarObj.d);

    // 1. Dạng Cúng Giỗ & Tảo Mộ
    let result = content.replace(
      /Hôm nay là ngày \.{3,} tháng \.{3,} năm \.{3,}(?: \(Âm lịch\))?/g,
      `Hôm nay là ${currentDayPhrase} tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
    );

    // 2. Dạng Đêm Giao Thừa & Tất Niên
    result = result.replace(
      /Hôm nay là ngày 30 tháng Chạp năm \.{3,}/g,
      `Hôm nay là ngày 30 tháng Chạp năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
    );

    // 3. Dạng Mùng 1 & Rằm
    result = result.replace(
      /Hôm nay là ngày mùng 1 \/ ngày Rằm tháng \.{3,} năm \.{3,}/g,
      `Hôm nay là ${currentDayPhrase} tháng ${lunarMonthStr} năm ${canChiYear} (${todayLunarObj.y} Âm lịch)`
    );

    return result;
  };

  const filteredItems = VAN_KHAN_DATA.filter((item) => item.category === activeTab);
  const fullscreenItem = fullscreenItemId ? VAN_KHAN_DATA.find(i => i.id === fullscreenItemId) : null;

  // ---- FULLSCREEN VIEW (TELEPROMPTER CHẾ ĐỘ CUỘN TỰ ĐỘNG) ----
  if (isFullscreen && fullscreenItem) {
    const processedContent = getProcessedContent(fullscreenItem.content);
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

        {/* Khung nội dung văn khấn cuộn mượt mà */}
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
            padding: '30px 20px 170px',
            color: '#ffffff',
            fontSize: `${fontSize}px`,
            lineHeight: 2.1,
            textAlign: 'justify',
            textJustify: 'inter-word',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
            letterSpacing: '0.018em',
            background: '#0a0806',
            WebkitOverflowScrolling: 'touch',
            position: 'relative'
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
          {/* Hàng 1: Tiêu đề & Nút Đóng */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
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

          {/* Hàng 2: Tự động gán ngày Âm lịch */}
          <div 
            className="vankhan-date-notice"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(201, 146, 58, 0.12)',
              border: '1px solid rgba(201, 146, 58, 0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              marginBottom: 8,
              fontSize: 12
            }}
          >
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--gold-light)', width: '100%' }}>
              <input
                type="checkbox"
                checked={autoFillDate}
                onChange={(e) => setAutoFillDate(e.target.checked)}
                style={{ accentColor: 'var(--gold)', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span>
                Tự động điền ngày Âm lịch hôm nay cho <strong>TẤT CẢ</strong> bài khấn: <strong className="vankhan-lunar-highlight" style={{ color: '#fef08a' }}>{lunarDayStr}/{lunarMonthStr} năm {canChiYear}</strong>
              </span>
            </label>
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

                {/* Khung văn khấn hiển thị cực lớn & dễ đọc */}
                <div
                  className="font-serif vankhan-text-box"
                  style={{
                    margin: 0,
                    padding: isFullscreen ? '20px 22px' : '16px 16px',
                    borderRadius: 12,
                    background: 'rgba(8, 7, 5, 0.75)',
                    border: '1px solid rgba(201,146,58,0.25)',
                    color: '#ffffff',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.85,
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.015em',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
                    flex: isFullscreen ? 1 : undefined
                  }}
                >
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
