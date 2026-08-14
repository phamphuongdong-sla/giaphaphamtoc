# Original User Request

## 2026-08-14T00:45:40Z

<USER_REQUEST>
Nâng cấp toàn diện giao diện sáng (Light Mode) và thiết kế lại khung thành viên (Member Cards & Tree Nodes) của ứng dụng Gia Phả Phạm Tộc theo chuẩn UI/UX Pro Max cao cấp.

Working directory: /Users/mrdong/giaphaphamtoc
Integrity mode: development

## Requirements

### R1. Hoàn thiện Hệ thống Bảng màu Giao diện Sáng (Light Mode Color Palette & Contrast)
- Tối ưu hóa màu nền canvas, thẻ thành viên, thanh TopBar, NoticeBar, LichView và DashboardView ở Giao diện Sáng.
- Đảm bảo độ tương phản chữ đạt tiêu chuẩn WCAG 4.5:1 (Tên in đậm màu Espresso Slate `#1C1917`, danh xưng `#44403C`), loại bỏ màu nâu đục mờ cũ.
- Tối ưu các thẻ porcelain trắng sứ (`#ffffff`) với bóng đổ đa lớp mềm mại (`box-shadow: 0 4px 20px -2px rgba(184, 137, 60, 0.08)`).

### R2. Tái thiết kế Khung Thành Viên (Member Cards & Tree Nodes)
- Thiết kế lại khung thẻ thành viên ở cả Chế độ Danh sách (ListView) và Chế độ Sơ đồ cây (TreeView):
  - Phân biệt rõ rệt Nam (Xanh Sapphire `/f0f9ff`), Nữ (Hồng Thạch Anh `/fdf2f8`) và Thủy Tổ (Vàng Hoàng Gia Gold `/fef3c7`).
  - Cải tiến layout tên, danh xưng (*Thủy Tổ*, *Bà Cả*, *Bà Hai*, ...), icon giới tính và ngày sinh/mất rõ ràng, tinh tế.
  - Viền thẻ và hiệu ứng hover 3D mềm mại (200ms ease-out transition).

### R3. Xác minh trực quan & Đẩy sản phẩm lên GitHub
- Chạy `npm run build` xác minh 0 lỗi TypeScript / Vite.
- Kiểm tra toàn bộ các màn hình bằng trình duyệt (`/browser`).
- Đẩy bản build hoàn thiện lên nhánh `main` và nhánh `gh-pages`.

## Acceptance Criteria

### Visual & Light Theme Aesthetics
- [ ] Giao diện Sáng hiển thị màu lụa sứ sang trọng, độ tương phản chữ rõ nét 4.5:1, không mờ nhòe.
- [ ] Khung thành viên Nam, Nữ, Thủy tổ phân biệt màu sắc và icon tinh tế ở cả ListView và TreeView.
- [ ] Nút bấm, thanh TopBar, NoticeBar và Recharts Tooltip hiển thị đẹp mắt ở cả 2 chế độ Sáng và Tối.

### Integrity & Verification
- [ ] `npm run build` thành công xuất sắc với 0 lỗi build.
- [ ] Xuất bản bản mới nhất lên GitHub Pages (`gh-pages`) thành công.
</USER_REQUEST>
