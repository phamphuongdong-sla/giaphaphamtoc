import { Icon } from '@/components/ui/Icon';

export const RulesModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal rules-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="detail-head">
          <button className="detail-close" onClick={onClose}><Icon name="x" size={17} /></button>
          <h2 className="font-display detail-head-name" style={{ fontSize: '20px' }}>Quy ước Tộc phả & Xưng hô</h2>
          <p className="detail-subtitle">Các nguyên tắc đặt tên, xưng hô vai vế và ghi nhận dòng họ</p>
        </div>
        <div className="detail-body" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
          <div className="lineage-box">
            <p className="detail-label" style={{ color: 'var(--gold-mid)' }}>👑 Thủy tổ (Khởi tổ dòng họ)</p>
            <p style={{ margin: '4px 0 0 0' }}>Gốc tổ phát triển dòng họ. Kính xưng <b>Cụ Thủy tổ ông / Cụ Thủy tổ bà</b>. Ghi đầy đủ Húy danh, Tên tự, Tên hiệu, Năm sinh - mất, Thụy hiệu & Nguyên quán.</p>
          </div>
          <div className="lineage-box">
            <p className="detail-label" style={{ color: 'var(--gold-mid)' }}>♂️ Con trai (Chính tộc / Nhánh Nội)</p>
            <p style={{ margin: '4px 0 0 0' }}>Nối mạch phụ hệ qua các thế hệ. Ghi rõ thứ bậc (<b>Trưởng nam, Thứ nam, Út nam</b>) và vị thế <b>Trưởng họ / Trưởng tộc</b>. Con cái tiếp tục nối dòng đời sau.</p>
          </div>
          <div className="lineage-box">
            <p className="detail-label" style={{ color: 'var(--gold-mid)' }}>♀️ Con gái (Ngoại tộc / Nhánh Ngoại)</p>
            <p style={{ margin: '4px 0 0 0' }}>Ghi nhận thứ bậc (<b>Trưởng nữ, Thứ nữ, Út nữ</b>). Khi xuất giá: ghi nhận thông tin Chồng (Nam tế) & các con. Hệ thống dừng nối tiếp để giữ chuẩn phụ hệ.</p>
          </div>
          <div className="lineage-box">
            <p className="detail-label" style={{ color: 'var(--gold-mid)' }}>👰 Nàng dâu (Nữ tể / Phụ nữ nhập tộc)</p>
            <p style={{ margin: '4px 0 0 0' }}>Hiển thị cùng thông tin của Chồng. Xưng danh chuẩn truyền thống: <b>Chính thất (Bà cả)</b>, <b>Kế thất (Bà hai)</b>, <b>Thứ thất (Bà ba...)</b>.</p>
          </div>
          <div className="lineage-box">
            <p className="detail-label" style={{ color: 'var(--gold-mid)' }}>🤵 Chàng rể (Con rể / Nam tế)</p>
            <p style={{ margin: '4px 0 0 0' }}>Phối phụ cùng Con gái dòng họ. Ghi nhận đầy đủ Họ tên khai sinh, Quê quán và các con.</p>
          </div>
        </div>
      </div>
    </div>
  );
};