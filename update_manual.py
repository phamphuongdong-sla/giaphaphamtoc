import re

# Update Markdown
with open('HUONG_DAN_SU_DUNG.md', 'r') as f:
    content = f.read()

# Replace pronouns in MD
content = content.replace('cho phép bạn', 'cho phép các thành viên')
content = content.replace('nhắc nhở bạn', 'nhắc nhở mọi người')
content = content.replace('bạn sẽ thấy', 'mọi người sẽ thấy')
content = content.replace('Bạn có thể', 'Mọi người có thể')
content = content.replace('bạn có thể', 'mọi người có thể')
content = content.replace('tôi đổi điện thoại', 'đổi điện thoại')
content = content.replace('bạn chỉ cần', 'mọi người chỉ cần')
content = content.replace('tôi không nhận được', 'không nhận được')
content = content.replace('Bạn đã bấm', 'Mọi người đã bấm')
content = content.replace('Điện thoại/Trình duyệt của bạn', 'Điện thoại/Trình duyệt')
content = content.replace('Tôi có cần đăng ký', 'Có cần đăng ký')

# Insert new features before Thống kê hoặc FAQ
new_features_md = """
---

### 📜 2.7. Đọc Văn Khấn Trực Tuyến

* Ứng dụng cung cấp sẵn các bài văn khấn truyền thống cho các dịp lễ, tết, giỗ chạp.
* **Chế độ cuộn tự động (Teleprompter):** Hỗ trợ tính năng tự động cuộn trang (Auto-Scroll), giúp ông bà, cô chú và anh chị em rảnh tay khi đọc văn khấn mà không cần vuốt màn hình.
* **Hiển thị trực quan:** Các thông tin cần khấn (tên tuổi, ngày tháng, địa chỉ...) được bôi đậm và gợi ý rõ ràng thay vì để các dấu chấm lửng (....), giúp việc đọc khấn mạch lạc và chính xác.

---

### 📱 2.8. Mã QR Gia Phả Cá Nhân

* Tích hợp mã QR gia phả riêng biệt cho từng thành viên.
* **Tính năng:** Trong trang thông tin chi tiết của mỗi người, sẽ có một mã QR. Mọi người có thể lưu lại hoặc quét mã này để truy cập cực kỳ nhanh chóng vào hồ sơ của thành viên đó, chia sẻ dễ dàng cho con cháu trong nhà.
"""

content = content.replace('## ❓ PHẦN 3: CÂU HỎI THƯỜNG GẶP (FAQ)', new_features_md + '\n---\n\n## ❓ PHẦN 3: CÂU HỎI THƯỜNG GẶP (FAQ)')

with open('HUONG_DAN_SU_DUNG.md', 'w') as f:
    f.write(content)


# Update generate_docx.py
with open('generate_docx.py', 'r') as f:
    py_content = f.read()

py_content = py_content.replace('cho phép bạn', 'cho phép các thành viên')
py_content = py_content.replace('nhắc nhở bạn', 'nhắc nhở mọi người')
py_content = py_content.replace('bạn sẽ thấy', 'mọi người sẽ thấy')
py_content = py_content.replace('Bạn có thể', 'Mọi người có thể')
py_content = py_content.replace('bạn có thể', 'mọi người có thể')
py_content = py_content.replace('tôi đổi điện thoại', 'đổi điện thoại')
py_content = py_content.replace('bạn chỉ cần', 'mọi người chỉ cần')
py_content = py_content.replace('tôi không nhận được', 'không nhận được')
py_content = py_content.replace('Bạn đã Bật thông báo', 'Mọi người đã Bật thông báo')
py_content = py_content.replace('Điện thoại/Trình duyệt của bạn', 'Điện thoại/Trình duyệt')
py_content = py_content.replace('Tôi có cần đăng ký', 'Có cần đăng ký')

new_features_py = """
    # 2.7 Van Khan
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(4)
    r = h2.add_run("📜 2.7. Đọc Văn Khấn Trực Tuyến")
    r.font.name = 'Arial'
    r.font.size = Pt(12)
    r.bold = True
    r.font.color.rgb = RGBColor(180, 100, 20)

    vk_feats = [
        ("Nội dung đầy đủ: ", "Ứng dụng cung cấp sẵn các bài văn khấn truyền thống cho các dịp lễ, tết, giỗ chạp."),
        ("Cuộn tự động (Teleprompter): ", "Tính năng tự động cuộn trang giúp ông bà, cô chú và anh chị em rảnh tay khi đọc khấn."),
        ("Hiển thị trực quan: ", "Các thông tin cần khấn được gợi ý rõ ràng thay cho dấu chấm lửng (....), giúp đọc mạch lạc.")
    ]
    for b, text in vk_feats:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        r_b = p.add_run(b)
        r_b.bold = True
        r_b.font.name = 'Arial'
        r_t = p.add_run(text)
        r_t.font.name = 'Arial'

    # 2.8 QR Code
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(4)
    r = h2.add_run("📱 2.8. Mã QR Gia Phả Cá Nhân")
    r.font.name = 'Arial'
    r.font.size = Pt(12)
    r.bold = True
    r.font.color.rgb = RGBColor(180, 100, 20)

    qr_feats = [
        ("Mã QR riêng biệt: ", "Tích hợp mã QR gia phả riêng biệt cho từng thành viên."),
        ("Chia sẻ nhanh chóng: ", "Mọi người có thể quét mã này để truy cập cực kỳ nhanh vào hồ sơ, dễ dàng chia sẻ cho con cháu trong nhà.")
    ]
    for b, text in qr_feats:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        r_b = p.add_run(b)
        r_b.bold = True
        r_b.font.name = 'Arial'
        r_t = p.add_run(text)
        r_t.font.name = 'Arial'
"""

# Insert new_features_py just before # --- PHẦN 3 ---
py_content = py_content.replace('    # --- PHẦN 3 ---', new_features_py + '\n    # --- PHẦN 3 ---')

with open('generate_docx.py', 'w') as f:
    f.write(py_content)
