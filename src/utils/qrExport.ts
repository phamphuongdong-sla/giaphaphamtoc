import QRCode from 'qrcode';
import { cleanName } from './genealogyUtils';

export interface PersonQRCardData {
  id?: string;
  name: string;
  displayGen: number;
  branch: string;
  relation?: string;
  birth?: string;
  death?: string;
  isDead?: boolean | string;
}

export const generateMemberUrl = (personIdOrName: string): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://phamphuongdong-sla.github.io/giaphaphamtoc/';
  return `${baseUrl}?person=${encodeURIComponent(personIdOrName)}`;
};

/**
 * Generate a high-resolution traditional printable Heritage QR Card (.PNG)
 */
export const exportPersonQRCard = async (data: PersonQRCardData): Promise<void> => {
  const targetUrl = generateMemberUrl(data.id || data.name);
  const displayName = cleanName(data.name);

  // Generate QR as a Canvas element
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, targetUrl, {
    width: 420,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1a1005',
      light: '#ffffff'
    }
  });

  const width = 1000;
  const height = 1450;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient (Dark Velvet Royal Heritage)
  const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 80, width / 2, height / 2, width);
  bgGrad.addColorStop(0, '#261a10');
  bgGrad.addColorStop(0.5, '#160e07');
  bgGrad.addColorStop(1, '#0c0704');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Outer & Inner Gold Frames
  ctx.strokeStyle = '#c9923a';
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = 'rgba(201,146,58,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Corner Flourishes
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = '#fdf0d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 30);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 30, y);
    ctx.stroke();
  };
  drawCorner(60, 60, 1, 1);
  drawCorner(width - 60, 60, -1, 1);
  drawCorner(60, height - 60, 1, -1);
  drawCorner(width - 60, height - 60, -1, -1);

  // 3. Header Title
  ctx.fillStyle = 'rgba(201,146,58,0.85)';
  ctx.font = '600 18px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('❖  G I A  P H Ả  P H Ạ M  T Ộ C  ❖', width / 2, 110);

  ctx.fillStyle = 'rgba(253,240,208,0.6)';
  ctx.font = 'italic 16px "Cinzel", "Times New Roman", serif';
  ctx.fillText('Đường Lâm · Phúc Thọ · Hà Nội', width / 2, 140);

  // Golden Divider Line
  ctx.strokeStyle = 'rgba(201,146,58,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 165);
  ctx.lineTo(width / 2 + 180, 165);
  ctx.stroke();

  // 4. Member Name & Genealogy Lineage
  ctx.fillStyle = '#fdf0d0';
  ctx.font = 'bold 44px "Playfair Display", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText(displayName, width / 2, 235);

  // Generation & Branch Pill
  const genText = `ĐỜI THỨ ${data.displayGen}  ·  ${data.branch || 'CHI TRỰC HỆ'}`;
  ctx.fillStyle = '#c9923a';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText(genText.toUpperCase(), width / 2, 280);

  // 5. QR Code Background Card
  const qrCardWidth = 500;
  const qrCardHeight = 540;
  const qrCardX = (width - qrCardWidth) / 2;
  const qrCardY = 320;

  // Shadow for QR card
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrCardX, qrCardY, qrCardWidth, qrCardHeight, 24);
  ctx.fill();

  ctx.strokeStyle = '#c9923a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw the QR Canvas into card
  const qrDrawSize = 420;
  const qrDrawX = (width - qrDrawSize) / 2;
  const qrDrawY = qrCardY + 35;
  ctx.drawImage(qrCanvas, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);

  // Scan Instruction Under QR
  ctx.fillStyle = '#5c4524';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📱 Dùng Camera điện thoại để quét mã', width / 2, qrCardY + qrCardHeight - 24);

  // 6. Heritage Details Box Under QR Card
  const infoY = 910;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = 'rgba(201,146,58,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(140, infoY, width - 280, 240, 16);
  ctx.fill();
  ctx.stroke();

  // Detail rows
  let currentDetailY = infoY + 45;
  if (data.relation) {
    ctx.fillStyle = 'rgba(253,240,208,0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Phả hệ:', 180, currentDetailY);
    ctx.fillStyle = '#fdf0d0';
    ctx.font = '600 16px "Segoe UI", sans-serif';
    ctx.fillText(data.relation, 310, currentDetailY);
    currentDetailY += 40;
  }

  if (data.birth) {
    ctx.fillStyle = 'rgba(253,240,208,0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ngày sinh:', 180, currentDetailY);
    ctx.fillStyle = '#fdf0d0';
    ctx.font = '600 16px "Segoe UI", sans-serif';
    ctx.fillText(data.birth, 310, currentDetailY);
    currentDetailY += 40;
  }

  if (data.death) {
    ctx.fillStyle = 'rgba(253,240,208,0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ngày giỗ:', 180, currentDetailY);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(data.death, 310, currentDetailY);
    currentDetailY += 40;
  }

  // 7. Footer & Clan Motto
  ctx.fillStyle = 'rgba(201,146,58,0.75)';
  ctx.font = 'italic 16px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Cội Nguồn · Hiếu Kính · Lưu Truyền Muôn Đời Sau', width / 2, height - 140);

  ctx.fillStyle = 'rgba(253,240,208,0.4)';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText(targetUrl, width / 2, height - 105);

  // 8. Trigger Download
  const link = document.createElement('a');
  link.download = `QR_GiaPha_${displayName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
