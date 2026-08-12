export interface PersonExportData {
  displayName: string;
  displayGen: number;
  titleLabel: string;
  branchLabel: string;
  relation: string;
  birthText: string;
  deathText?: string;
  isDeceased: boolean;
  lineagePath: string;
  childrenNames: string[];
  bio?: string;
}

export const exportPersonCardImage = (data: PersonExportData) => {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 820;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient (Dark Velvet Luxury Parchment)
  const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width);
  bgGrad.addColorStop(0, '#221910');
  bgGrad.addColorStop(0.5, '#140f0a');
  bgGrad.addColorStop(1, '#090705');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Outer & Inner Gold Foil Frames
  ctx.strokeStyle = '#c9923a';
  ctx.lineWidth = 5;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = 'rgba(201,146,58,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Ornate Corner Brackets
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = '#fdf0d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 24);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 24, y);
    ctx.stroke();
  };
  drawCorner(50, 50, 1, 1);
  drawCorner(width - 50, 50, -1, 1);
  drawCorner(50, height - 50, 1, -1);
  drawCorner(width - 50, height - 50, -1, -1);

  // 3. Header Crest & Branding
  // Crest Circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(80, 85, 26, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201,146,58,0.15)';
  ctx.fill();
  ctx.strokeStyle = '#c9923a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Crest Star / Icon
  ctx.fillStyle = '#fdf0d0';
  ctx.font = '22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('❖', 80, 93);
  ctx.textAlign = 'left';

  // Header Title
  ctx.fillStyle = '#c9923a';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('GIA PHẢ PHẠM TỘC · HỒ SƠ DI SẢN THÀNH VIÊN', 120, 80);

  ctx.fillStyle = 'rgba(242,237,216,0.6)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('LƯU TRỮ VĨNH CỬU · BẢN GHI ĐIỆN TỬ CHÍNH THỨC', 120, 100);

  // Header Separator Line
  const lineGrad = ctx.createLinearGradient(60, 0, width - 60, 0);
  lineGrad.addColorStop(0, 'rgba(201,146,58,0.8)');
  lineGrad.addColorStop(0.5, '#fdf0d0');
  lineGrad.addColorStop(1, 'rgba(201,146,58,0.8)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(60, 120, width - 120, 2);

  // 4. Member Main Name & Gen Badge
  ctx.fillStyle = '#fdf0d0';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(data.displayName, 70, 180);

  // Gen Badge Pill
  ctx.fillStyle = 'rgba(201,146,58,0.2)';
  ctx.beginPath();
  ctx.roundRect(70, 200, 120, 30, 15);
  ctx.fill();
  ctx.strokeStyle = '#c9923a';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fdf0d0';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(`ĐỜI THỨ ${data.displayGen}`, 95, 220);

  // Relation text
  ctx.fillStyle = '#e2b96f';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(data.relation, 205, 221);

  // 5. Two-Column Info Grid
  const startY = 265;
  const col1 = 70;
  const col2 = 620;

  ctx.font = '15px system-ui, sans-serif';

  // Field helper
  const drawField = (x: number, y: number, label: string, val: string, valColor = '#fdf0d0') => {
    ctx.fillStyle = 'rgba(242,237,216,0.55)';
    ctx.fillText(label, x, y);
    ctx.fillStyle = valColor;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(val || 'Chưa có thông tin', x, y + 24);
    ctx.font = '15px system-ui, sans-serif';
  };

  drawField(col1, startY, 'Họ & Tên', data.displayName);
  drawField(col2, startY, 'Vai vế / Chức vị', data.titleLabel || 'Thành viên dòng họ');

  drawField(col1, startY + 65, 'Ngày sinh', data.birthText || 'Lưu trữ trong gia phả');
  drawField(col2, startY + 65, 'Chi nhánh dòng họ', data.branchLabel || 'Họ Phạm');

  if (data.isDeceased) {
    drawField(col1, startY + 130, 'Ngày mất', data.deathText || 'Chưa có dữ liệu', '#e05050');
    drawField(col2, startY + 130, 'Trạng thái', 'Đã khuất', '#e05050');
  } else {
    drawField(col1, startY + 130, 'Trạng thái', 'Còn sống', '#3da870');
  }

  // Section Separator Line
  ctx.fillStyle = 'rgba(201,146,58,0.25)';
  ctx.fillRect(60, startY + 195, width - 120, 1);

  // 6. Tuyến Phả Hệ (Lineage Route)
  ctx.fillStyle = '#c9923a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('❖ TUYẾN PHẢ HỆ (CỘI NGUỒN)', 70, startY + 230);

  ctx.fillStyle = '#fdf0d0';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(data.lineagePath || data.displayName, 70, startY + 258);

  // 7. Con Cái (Children)
  ctx.fillStyle = '#c9923a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`❖ CON CÁI THẾ HỆ SAU (${data.childrenNames.length})`, 70, startY + 305);

  const childrenStr = data.childrenNames.length > 0 ? data.childrenNames.join(' · ') : 'Chưa có thông tin thế hệ sau';
  ctx.fillStyle = 'rgba(242,237,216,0.85)';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(childrenStr, 70, startY + 333);

  // 8. Tiểu Sử (Bio snippet with word wrap)
  if (data.bio) {
    ctx.fillStyle = '#c9923a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('❖ TIỂU SỬ & GHI CHÚ DI SẢN', 70, startY + 380);

    ctx.fillStyle = 'rgba(242,237,216,0.8)';
    ctx.font = 'italic 15px Georgia, serif';

    // Word wrap bio safely without overflow
    const maxBioWidth = 800;
    const maxBioY = height - 90;
    const words = data.bio.split(' ');
    let line = '';
    let bioY = startY + 408;
    for (let i = 0; i < words.length; i++) {
      if (bioY >= maxBioY) {
        if (line) ctx.fillText(line.trim() + '...', 70, bioY);
        line = '';
        break;
      }
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxBioWidth && i > 0) {
        ctx.fillText(line, 70, bioY);
        line = words[i] + ' ';
        bioY += 24;
      } else {
        line = testLine;
      }
    }
    if (line && bioY < maxBioY) ctx.fillText(line, 70, bioY);
  }

  // 9. Official Red Seal Watermark (Dấu Triện Đỏ)
  ctx.save();
  const sealX = width - 150;
  const sealY = height - 140;

  ctx.beginPath();
  ctx.arc(sealX, sealY, 50, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(139,26,26,0.25)';
  ctx.fill();
  ctx.strokeStyle = '#b33030';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#e05050';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('GIA PHẢ', sealX, sealY - 10);
  ctx.fillText('PHẠM TỘC', sealX, sealY + 8);
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText('CHÍNH THỨC', sealX, sealY + 24);
  ctx.restore();

  // Footer Tagline
  ctx.fillStyle = 'rgba(201,146,58,0.5)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Ứng dụng Gia Phả Phạm Tộc · Trích xuất tự động từ hệ thống lưu trữ di sản', 70, height - 55);

  // Trigger PNG download
  const link = document.createElement('a');
  link.download = `GiaPha_PhamToc_${data.displayName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
