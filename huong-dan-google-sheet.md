# Hướng Dẫn Cập Nhật Dữ Liệu Gia Phả Từ Google Sheets

Ứng dụng Gia Phả Phạm Tộc của bạn đang được cấu hình để tự động lấy dữ liệu trực tiếp từ Google Sheets. Điều này giúp bạn dễ dàng chỉnh sửa, thêm hoặc xóa thành viên trong gia phả mà không cần can thiệp vào mã nguồn lập trình.

Dưới đây là các bước và quy tắc chuẩn để cập nhật dữ liệu.

## 1. Truy Cập File Google Sheets

Hệ thống đang được liên kết với file Google Sheets có ID: `1Bh79JvnQs1wZ-b-XxipaQE9ooqEWBm2-SDr6tqh_kgY`.
File này cần có một trang tính (tab) tên là **`Data`** (chữ D viết hoa).
File cũng cần được mở quyền chia sẻ là **"Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view)** để ứng dụng web có thể tự động đọc dữ liệu.

## 2. Cấu Trúc Các Cột (Dòng Tiêu Đề)

Trang tính `Data` cần có dòng đầu tiên là dòng tiêu đề (header) với **chính xác** các tên cột tiếng Anh sau (không viết hoa, không dấu cách):

| Tên Cột | Bắt buộc | Mô tả & Cách nhập |
| :--- | :--- | :--- |
| `id` | **Có** | Mã định danh duy nhất của mỗi người. Bạn có thể đặt là số (1, 2, 3...) hoặc mã (P1, P2...). **Tuyệt đối không được trùng nhau**. |
| `parentId` | Không | ID của cha hoặc mẹ người đó (dùng để vẽ sơ đồ cây). Người đầu tiên (cụ tổ) sẽ để trống cột này. |
| `name` | **Có** | Họ và tên đầy đủ của thành viên (VD: `Phạm Phương Đông`). |
| `gender` | Không | Giới tính. Nhập `Nam` hoặc `Nữ` (có dấu hay không dấu đều được, hệ thống sẽ tự nhận diện). |
| `birth` | Không | Ngày tháng năm sinh (Dương lịch). Khuyên dùng định dạng: `DD-MM-YYYY` (VD: `29-12-1981`). |
| `death` | Không | Ngày tháng năm mất. **Lưu ý: Bạn phải ghi theo định dạng DD-MM (hoặc DD-MM-YYYY) của ngày ÂM LỊCH** vì phần mềm sẽ dùng số ngày/tháng này để tính giỗ. VD: `02-08-2022 Nhâm Dần`. |
| `isDead` | Không | Trạng thái đã mất. Ghi `x` hoặc `yes` hoặc bất kỳ chữ gì. Nếu còn sống thì **để trống**. |
| `bio` | Không | Tiểu sử, ghi chú nghề nghiệp, con đường công tác... (có thể dài nhiều dòng). |
| `title` | Không | Vai vế, danh xưng (VD: `Đời 1`, `Con Trưởng`, `Vợ`...). |

## 3. Một Số Lưu Ý Rất Quan Trọng

> [!IMPORTANT]
> **Ngày Mất & Tính Giỗ**
> Thuật toán tính ngày giỗ thông minh của ứng dụng sẽ trích xuất 2 con số đầu tiên trong cột `death` để coi đó là Ngày và Tháng **ÂM LỊCH** mặc định của người đó. 
> Ví dụ, nếu bạn nhập cột `death` là `02-08-2022`, hệ thống sẽ coi ngày giỗ là mùng **2 tháng 8 Âm Lịch**. Đừng nhập ngày mất Dương lịch vào đây nếu bạn muốn ứng dụng báo giỗ chính xác nhé!

> [!TIP]
> **Quản lý con dâu/con rể**
> Trong sơ đồ cấu trúc ID, con cái sẽ có `parentId` trỏ về ID của người cha/mẹ ruột. Đối với Vợ/Chồng (dâu/rể), bạn có thể đặt ID của họ với `parentId` trỏ về chính người chồng/vợ ruột đó, và ghi rõ ở cột `name` hoặc `title` là "Vợ: Nguyễn Thị A" để dễ hiển thị.

> [!WARNING]
> **Không để trống cột ID**
> Bất kỳ dòng nào không có `id` (cột bị bỏ trống) sẽ bị phần mềm bỏ qua hoàn toàn và không hiển thị lên cây gia phả.

## 4. Kiểm Tra Sau Khi Cập Nhật
Mỗi khi bạn (hoặc ai đó có quyền chỉnh sửa) gõ dữ liệu mới vào Google Sheets, bạn chỉ cần ra ngoài ứng dụng web (hoặc trên điện thoại), ấn **Tải lại (Refresh/F5)** là ứng dụng sẽ tự động gọi dữ liệu mới nhất từ Sheets về và vẽ lại sơ đồ lập tức. Không cần phải code lại!

## 5. Cấu Hình Google Apps Script Quản Lý Sửa/Xóa Trực Tiếp
Ứng dụng hiện tích hợp tính năng **Quản lý Thêm / Sửa / Xóa thành viên** trực tiếp trên Giao diện Web kết nối với Google Apps Script Web App ID: `AKfycbzNHsow9vCjaYlBGbcZgDOtmK77Ha8qNqXifhpuSjRrahiiLuPwud5_roKKqNf7G4k`.

Các bước thiết lập trong Google Sheets (Tiện ích mở rộng > Apps Script):
1. Dán mã nguồn `Code.gs` (xem tại nút "Mã Apps Script" trên giao diện web).
2. Chọn **Triển khai (Deploy)** > **Triển khai dưới dạng ứng dụng web**.
3. Cấu hình **Thực thi dưới danh nghĩa: Tôi (Me)** và **Ai có quyền truy cập: Bất kỳ ai (Anyone)**.
4. Bấm **Triển khai** và lưu lại.

