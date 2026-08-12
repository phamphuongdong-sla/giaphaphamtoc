import { useState, useEffect } from 'react';
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
  const [fontSize, setFontSize] = useState<number>(20);
  const [autoFillDate, setAutoFillDate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenItemId, setFullscreenItemId] = useState<string | null>(null);

  // Lắng nghe sự kiện thoát Toàn màn hình từ phím ESC hoặc thao tác thiết bị
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const openFullscreen = (itemId: string) => {
    setFullscreenItemId(itemId);
    setIsFullscreen(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(() => {});
    }
  };

  const closeFullscreen = () => {
    setFullscreenItemId(null);
    setIsFullscreen(false);
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
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
    setFontSize((prev) => Math.min(prev + 2, 32));
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

  // ---- FULLSCREEN VIEW: chỉ hiển thị đúng bài được chọn ----
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
          overflow: 'hidden'
        }}
      >
        {/* Thanh tiêu đề nhỏ gọn khi fullscreen */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(10,8,6,0.95)',
          borderBottom: '1px solid rgba(201,146,58,0.3)',
          flexShrink: 0, gap: 10
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: 'var(--gold-mid)',
              background: 'rgba(201,146,58,0.15)', padding: '2px 8px',
              borderRadius: 4, border: '1px solid rgba(201,146,58,0.25)',
              display: 'inline-block', marginBottom: 3
            }}>{fullscreenItem.badge}</span>
            <div className="font-serif" style={{
              fontSize: 15, fontWeight: 700, color: 'var(--gold-light)',
              lineHeight: 1.25, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{fullscreenItem.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Cỡ chữ nhanh */}
            <button onClick={decreaseFontSize} disabled={fontSize <= 16} style={{
              background: fontSize <= 16 ? 'rgba(255,255,255,0.04)' : 'rgba(201,146,58,0.2)',
              border: '1px solid rgba(201,146,58,0.35)', borderRadius: 8,
              color: fontSize <= 16 ? 'var(--text-muted)' : 'var(--gold-light)',
              fontSize: 13, fontWeight: 800, cursor: fontSize <= 16 ? 'default' : 'pointer',
              padding: '6px 12px', height: 36
            }}>A-</button>
            <span style={{ fontSize: 12, color: 'var(--gold-mid)', minWidth: 36, textAlign: 'center' }}>{fontSize}px</span>
            <button onClick={increaseFontSize} disabled={fontSize >= 32} style={{
              background: fontSize >= 32 ? 'rgba(255,255,255,0.04)' : 'rgba(201,146,58,0.25)',
              border: '1px solid rgba(201,146,58,0.4)', borderRadius: 8,
              color: fontSize >= 32 ? 'var(--text-muted)' : '#fff',
              fontSize: 14, fontWeight: 800, cursor: fontSize >= 32 ? 'default' : 'pointer',
              padding: '6px 12px', height: 36
            }}>A+</button>
            {/* Nút thoát fullscreen */}
            <button
              onClick={closeFullscreen}
              title="Thoát toàn màn hình"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, height: 36,
                fontSize: 12.5, fontWeight: 700,
                background: 'rgba(201,146,58,0.3)',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold-light)', cursor: 'pointer'
              }}
            >
              <Icon name="minimize" size={15} />
              <span>Thu nhỏ</span>
            </button>
          </div>
        </div>

        {/* Nội dung văn khấn chiếm toàn bộ phần còn lại */}
        <div
          className="font-serif"
          style={{
            flex: 1, overflowY: 'auto',
            padding: '20px 24px',
            color: '#ffffff',
            fontSize: `${fontSize}px`,
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: '0.015em',
            background: '#0a0806',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {renderFormattedContent(processedContent)}
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
        className="modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '840px', 
          width: '100%', 
          height: '94vh', 
          maxHeight: '94vh', 
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
          className="modal-head" 
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            background: 'rgba(201, 146, 58, 0.12)',
            border: '1px solid rgba(201, 146, 58, 0.3)',
            borderRadius: 8,
            padding: '6px 10px',
            marginBottom: 8,
            fontSize: 12
          }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--gold-light)', width: '100%' }}>
              <input
                type="checkbox"
                checked={autoFillDate}
                onChange={(e) => setAutoFillDate(e.target.checked)}
                style={{ accentColor: 'var(--gold)', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span>
                Tự động điền ngày Âm lịch hôm nay cho <strong>TẤT CẢ</strong> bài khấn: <strong style={{ color: '#fef08a' }}>{lunarDayStr}/{lunarMonthStr} năm {canChiYear}</strong>
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
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 6, 
                  borderBottom: '1px solid rgba(201,146,58,0.2)', 
                  paddingBottom: 10 
                }}>
                  {/* Hàng 1: Badge trái + Nút phải */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{
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
                    }}>
                      {item.badge}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {/* Nút Toàn màn hình từng bài */}
                      <button
                        onClick={() => openFullscreen(item.id)}
                        title="Mở toàn màn hình bài khấn này"
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
                  <h3 className="font-serif" style={{
                    margin: 0, fontSize: 13.5, fontWeight: 700,
                    color: blink ? '#fef08a' : 'var(--gold-light)',
                    lineHeight: 1.35,
                    animation: blink ? 'vanKhanBlink 1.4s ease-in-out infinite' : 'none',
                  }}>
                    {blink && <span style={{ marginRight: 5 }}>🔔</span>}
                    {item.title}
                  </h3>

                  {/* Hàng 3: Mô tả */}
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Khung văn khấn hiển thị cực lớn & dễ đọc */}
                <div
                  className="font-serif"
                  style={{
                    margin: 0,
                    padding: isFullscreen ? '20px 22px' : '16px 16px',
                    borderRadius: 12,
                    background: 'rgba(8, 7, 5, 0.75)',
                    border: '1px solid rgba(201,146,58,0.25)',
                    color: '#ffffff',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.85,
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-gold)',
            borderRadius: 10,
            padding: '6px 10px',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="type" size={13} style={{ color: 'var(--gold-mid)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-mid)' }}>Cỡ chữ:</span>
              <span style={{ 
                fontSize: 12, fontWeight: 700, color: 'var(--gold-light)', 
                background: 'rgba(201,146,58,0.25)', padding: '3px 8px', 
                borderRadius: 6, border: '1px solid rgba(201,146,58,0.4)' 
              }}>
                {fontSize}px
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 16}
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
