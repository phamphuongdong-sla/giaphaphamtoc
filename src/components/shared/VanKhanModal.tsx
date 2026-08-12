import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

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

export const VanKhanModal = ({ onClose }: VanKhanModalProps) => {
  const [activeTab, setActiveTab] = useState<string>('gio');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const filteredItems = VAN_KHAN_DATA.filter((item) => item.category === activeTab);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '780px', 
          width: '96vw', 
          height: '92vh', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header - Tối ưu diện tích gọn gàng */}
        <div className="modal-head" style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border-gold-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(201,146,58,0.15)',
                border: '1px solid var(--border-gold)',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                <Icon name="book-open" size={17} style={{ color: 'var(--gold-light)' }} />
              </div>
              <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
                Tủ Sách Văn Khấn Cổ Truyền
              </h2>
            </div>
            <button 
              className="detail-close" 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Các tab danh mục văn khấn (Bỏ nút Tất cả) */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 10, scrollbarWidth: 'none' }}>
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
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: activeTab === tab.id ? '1px solid var(--gold)' : '1px solid transparent',
                  background: activeTab === tab.id ? 'rgba(201,146,58,0.22)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Khung đọc văn khấn - Tối đa hóa diện tích & chữ to rõ nét */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8, borderBottom: '1px solid rgba(201,146,58,0.2)', paddingBottom: 8 }}>
                  <div>
                    <h3 className="font-serif" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--gold-light)' }}>
                      {item.title}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    title="Sao chép toàn bộ bài văn khấn này"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: isCopied ? 'rgba(61,168,112,0.25)' : 'rgba(201,146,58,0.15)',
                      border: '1px solid ' + (isCopied ? '#3da870' : 'var(--border-gold)'),
                      color: isCopied ? '#3da870' : 'var(--gold-mid)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon name={isCopied ? 'check' : 'copy'} size={13} />
                    {isCopied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>

                {/* Khung đọc văn khấn với chữ lớn, dễ đọc trên di động & máy tính */}
                <pre
                  className="font-serif"
                  style={{
                    margin: '6px 0 0',
                    padding: '16px 18px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.32)',
                    border: '1px solid rgba(201,146,58,0.2)',
                    color: '#f7f4ec',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.01em',
                    flex: 1
                  }}
                >
                  {item.content}
                </pre>
              </div>
            );
          })}
        </div>

        {/* Footer gọn gàng */}
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--border-gold-md)', textAlign: 'center' }}>
          <button
            className="action-button modal-close"
            style={{ width: '100%', justifyContent: 'center', padding: '8px 16px' }}
            onClick={onClose}
          >
            Đóng Tủ Sách
          </button>
        </div>
      </div>
    </div>
  );
};
