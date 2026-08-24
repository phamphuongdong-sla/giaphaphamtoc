-- Dữ liệu mẫu (Seed Data) cho Cloudflare D1 (130 thành viên)

DELETE FROM members;

INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M001', NULL, 'PHẠM HƯƠNG CHỬ', 'male', '1891 Tân Mão', '20-03-1953 Quý Tỵ', 1, 'Con út thứ tư trong gia đình', 'Thủy tổ', NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M002', 'M001', 'Bà cả: BÙI THỊ VÍCH', 'female', '1888 Mậu Tý', '23-10-1957 Đinh Dậu', 1, NULL, NULL, 'Chi bà cả');
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M003', 'M002', 'PHẠM VĂN COỎNG', 'male', '1909 Kỷ Dậu', '13-09-1949 Kỷ Sửu', 1, NULL, 'Trưởng họ', NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M004', 'M003', 'Bà cả: VŨ THỊ PHIẾM', 'female', '1908', '03-11-2014 Giáp Ngọ', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M005', 'M004', 'PHẠM NGỌC CHƯ', 'male', '1932 Nhâm Thân', '1998 Mậu Dần', 1, NULL, 'Trưởng họ', NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M006', 'M005', 'Vợ: PHẠM THỊ UYÊN', 'female', '1933 Quý Dậu', NULL, 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M007', 'M006', 'PHẠM NGỌC CHI', 'male', '01-05-1956 (21-03 Bính Thân)', NULL, 0, NULL, 'Trưởng họ', NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M008', 'M007', 'Vợ: NGUYỄN THỊ SEN', 'female', '21-10-1959 (19-9 Kỷ hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M009', 'M008', 'PHẠM TUYẾT THU', 'male', '07-12-1984 (15-11 Giáp tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M010', 'M008', 'PHẠM THỊ THƯƠNG HUYỀN', 'female', '08-05-1987 (11-04 Đinh Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M011', 'M006', 'PHẠM HUY CẨN', 'male', '09-05-1962 (05-04 Nhâm Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M012', 'M011', 'Vợ: CHƯA ....', 'female', '.....', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M013', 'M012', 'PHẠM THỊ THÙY LINH', 'female', '13-04-1999 (28-02 Kỷ Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M014', 'M006', 'PHẠM THỊ XUÂN', 'female', '10-12-1965 (18-11 Ất tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M015', 'M006', 'PHẠM ANH TIẾN', 'male', '26-09-1969 (15-08 Kỷ Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M016', 'M015', 'Vợ: PHÌN THỊ THÙY', 'female', '26-07-1977 (12-06 Đinh Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M017', 'M016', 'PHẠM THÁI BÌNH', 'male', '24-11-2003 (01-10 Quý Mùi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M018', 'M016', 'PHẠM NGỌC DIỆU GIANG', 'male', '12-07-2011 (11-06 Tân Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M019', 'M006', 'PHẠM MINH CHÁNH', 'male', '01-05-1971', 'Đã Mất', 1, 'Chưa vợ', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M020', 'M006', 'PHẠM TRỌNG TUỆ', 'male', '26-08-1977 (12-07 Đinh Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M021', 'M020', 'Vợ: TRẦN THỊ THÁI', 'female', NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M022', 'M021', 'PHẠM KHÁNH VY', 'male', '19-03-2008 (12-02 Mậu tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M023', 'M021', 'PHẠM NGỌC MINH', 'male', '22-05-2012 (02-04 Nhâm Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M024', 'M004', 'PHẠM THỊ NÙI', 'female', '1938 Mậu Dần', '......', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M025', 'M004', 'PHẠM THỊ DUNG', 'female', '1940 Canh Thìn', '16-07-1986 Bính Dần', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M026', 'M004', 'PHẠM TUẤN KHANH', 'male', '1942 Nhâm Ngọ', '16-11-2013 Quý Hợi', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M027', 'M026', 'Vợ: ĐINH THỊ CÚC', 'female', '1946 Bính Tuất', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M028', 'M027', 'PHẠM TUYÊN', 'male', '1969 Kỷ Dậu', '30-09-1999 Kỷ Mão', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M029', 'M028', 'Vợ: NGUYỄN THỊ VÂN', 'female', '1971 Tân Hợi', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M030', 'M029', 'PHẠM THỊ LAN HƯƠNG', 'female', '13-03-1996 (23-01 Bính Tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M031', 'M027', 'PHẠM TUẤN DƯƠNG', 'male', '28-09-1970 (28-08 Canh Tuất)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M032', 'M031', 'Vợ: TRẦN THỊ HUYỀN', 'female', '19-06-1977 (03-05 Đinh Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M033', 'M032', 'PHẠM TRẦN KHIÊM', 'male', NULL, ' ', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M034', 'M032', 'PHẠM PHƯƠNG THẢO', 'male', '18-12-2005 (17-11 Ất Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M035', 'M027', 'PHẠM KIỀU VÂN', 'male', '22-04-1976 Bính Thìn', NULL, 0, 'Sống ở Hà Giang', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M036', 'M003', 'Bà hai: NGUYỄN THỊ VIÊM', 'female', '1927 Đinh Mão', NULL, 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M037', 'M036', 'PHẠM THỊ DINH', 'female', '1950 Canh Dần', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M038', 'M002', 'PHẠM NGỌC XIÊM', 'male', '1920 Canh Thân', '18-02-1945 Ất Dậu', 1, 'Mất ở đồn điền Cao Su', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M039', 'M002', 'PHẠM NGỌC CƠ', 'male', '1922 Nhâm Tuất', '02-04-1977 Đinh Tỵ', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M040', 'M039', 'Vợ: NGUYỄN THỊ CÚC', 'female', '1923 Quý Hợi', '26-09-1963 Quý Mão', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M041', 'M040', 'PHẠM THỊ NUI', 'female', NULL, '24/4', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M042', 'M040', 'PHẠM THỊ KHUY', 'female', NULL, '24/4', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M043', 'M040', 'PHẠM THỊ HƯỜNG', 'female', NULL, 'Đã mất', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M044', 'M040', 'PHẠM THỊ NHẠN', 'female', '1944 Giáp Thân', NULL, 0, 'Có 2 con sống cùng con gái ở Vĩnh Phúc', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M045', 'M040', 'PHẠM THỊ NHIÊN', 'female', '1948 Mậu Tý', NULL, 0, 'Có 5 người con sống ở Diêm Điền', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M046', 'M040', 'CON TRAI (THỨ 6)', 'male', NULL, 'Mất sớm, chưa đặt tên', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M047', 'M040', 'PHẠM MINH ĐỨC', 'male', '18-10-1953 Quý Tỵ', '02-08-2022 Nhâm Dần', 1, 'Từ năm 1953 - 1962: còn nhỏ sống phụ thuộc gia đình
Từ năm 1963 - 1967: là học sinh trường Thái Xuyên tại Xã Thái Xuyên – Thái Thụy – Thái Bình.
Từ năm 11/1970 – 5/1975: là bộ đội chiến đấu tại Chiến trường B Thành cổ Quảng trị.
Từ năm 6/1975 – 3/1977: là bộ đội phục viên tham gia hợp tác xã nông nghiệp xã Thái Xuyên.
Từ 4/1977 – 12/1981: là cán bộ tại trường Kế hoạch tỉnh Sơn La.
Từ 01/1982 – 6/1986: là cán bộ tại Ban quản lý đất đai (nay là Sở Tài nguyên và Môi trường).
Từ 7/1986 đến 2022: nghỉ mất sức và hưởng chế độ thương binh', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M048', 'M047', 'Vợ: HOÀNG THỊ XUYẾN', 'female', '01-10-1949 Kỷ Sửu', '24-02-2025 Ất Tỵ', 1, 'Từ năm 1952 đến 1962: còn nhỏ sống phụ thuộc gia đình
Từ năm 1963 đến 1967: là học sinh Trường Thanh Niên huyện Quỳnh Nhai.
Từ năm 6/1968 đến 5/1972: là bộ đội và công tác tại Tỉnh Đội Sơn La (nay là Bộ Chỉ huy Quân sự Tỉnh Sơn La).
Từ năm 6/1973 đến 3/1993: là cán bộ công chức tại Ban tổ chức chính quyền tỉnh Sơn La (nay là Sở Nội Vụ).
Từ năm 4/1993 đến 2025: Hưu trí tại Tổ 09 Phường Tô Hiệu – Thành Phố Sơn La – tỉnh Sơn La.', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M049', 'M048', 'PHẠM THỊ KIM XUÂN', 'female', '02-08-1979 (10-06 Kỷ Mùi)', NULL, 0, 'Từ năm 1979 đến năm 1985 học trường mẫu giáo Tô Hiệu thành phố Sơn La tỉnh Sơn La.
Từ năm 1986 đến năm 1990 là học sinh trường tiểu học Tô Hiệu thành phố Sơn La tỉnh Sơn La.
Từ năm 1991 đến năm 1994 là học sinh trường trung học cơ sở Tô Hiệu thành phố Sơn La tỉnh Sơn La. 
Từ năm 1995 đến năm 1998 là học sinh trường phổ thông chuyên ban Tô Hiệu thành phố Sơn La tỉnh Sơn La. 
 Từ năm 1999 đến năm 2005 học đại học tại trường đại học quốc gia Hà Nội. 
Từ năm 2006 đến năm 2018 công tác tại sở Thông tin và Truyền thông tỉnh Sơn La
Từ ngày 29 tháng 1 năm 2018 công tác tại trung tâm công nghệ và truyền thông tỉnh Sơn La.', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M050', 'M049', 'Chồng: NGUYỄN HỮU MẠNH', 'male', '1980 (Canh Thân)', NULL, 0, 'ly hôn', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M051', 'M050', 'NGUYỄN TUỆ ANH', 'male', '15-03-2015 (Ất Mùi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M052', 'M050', 'NGUYỄN NGỌC ÁNH', 'male', '22-11-2020 (Canh Tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M053', 'M048', 'PHẠM PHƯƠNG ĐÔNG', 'male', '29-12-1981 (04-12 Tân Dậu)', NULL, 0, 'Từ 1981-1986: là học sinh Trường Mẫu giáo Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La
Từ 9/1987– 5/1993: là học sinh Trường Tiểu học Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La
Từ 9/1993 – 5/1997: là học sinh Trường Trung học cơ sở Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La
Từ 9/1997 – 5/2000: là học sinh Trường Trung học phổ thông Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La
Từ 12/2001 – 5/2006: là sinh viên Trường Đại Học Quốc Gia Hà Nội - Khoa Công nghệ Điện tử Viễn thông
Từ 6/2006 – 9/2007:  ở nhà giúp gia đình
Từ 10/2007 đến nay: Công tác tại công ty cổ phần cấp nước Sơn La', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M054', 'M053', 'Vợ: HOÀNG THANH HUYỀN', 'female', '02-09-1985 (Ất Sửu)', NULL, 0, 'Quê quán: xã Đông La huyện Đông Hưng tỉnh Thái Bình.
Từ năm 1996 đến năm 2000 học cấp 2 tại trường trung học cơ sở Nguyễn Trãi thành phố Sơn La tỉnh Sơn La. 
 Từ năm 2000 đến năm 2003 học cấp 3 tại trường Trung học phổ thông Chuyên Sơn La thành phố Sơn La tỉnh Sơn La. 
 Từ năm 2003 đến năm 2007 học đại học tại Trường đại học sư phạm Thái Nguyên tỉnh Thái Nguyên. 
 Từ năm 2007 đến năm 2009 ở nhà giúp gia đình. 
 Từ năm 2009 đến nay công tác tại sở văn hóa thể thao và Du lịch Tỉnh Sơn La.', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M055', 'M054', 'PHẠM HOÀNG DƯƠNG', 'male', '14-06-2011 (Tân Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M056', 'M048', 'PHẠM PHƯƠNG NAM', 'male', '20-10-1984 (26-09 Giáp tý)', NULL, 0, 'Từ 1984 - 1988: là học sinh Trường Mẫu giáo Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La;
Từ 9/1990 – 5/1995: là học sinh Trường Tiểu học Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La; 
Từ 9/1995 – 5/1999: là học sinh Trường Trung học cơ sở Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La; 
Từ 9/2000 – 5/2002: là học sinh Trường Trung học phổ thông chuyên ban Tô Hiệu - Thành phố Sơn La - Tỉnh Sơn La; 
Từ 9/2002 – 5/2007: là sinh viên Trường Đại Học Kỹ thuật Công nghiệp Thái Nguyên 
Từ 9/2009 đến nay: là cán bộ tại Phân xưởng sửa chữa điện - Ban dự án Thủy điện Sơn La ', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M057', 'M056', 'Vợ: PHAN THỊ HỒNG', 'female', '04-10-1989 (Kỷ Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M058', 'M057', 'PHẠM THỦY PHƯƠNG ANH', 'male', '07-12-2012 (04-11 Nhâm Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M059', 'M057', 'PHẠM NAM ANH', 'male', '29-08-2016 (27-07 Bính Thân)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M060', 'M040', 'PHẠM NGỌC THANH', 'male', '13-09-1959 Kỷ Hợi', '19-08-2008 Mậu Tý', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M061', 'M060', 'Vợ: ĐẶNG PHƯƠNG DUNG', 'female', '21-10-1960 (01-09 Canh tí)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M062', 'M061', 'PHẠM DIỆU HƯƠNG', 'male', '20-08-1983 (12-07 Quý Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M063', 'M062', 'Chồng: NGUYỄN VĂN HƯNG', 'male', '05-01-1981 (30-11 Canh Thân)', NULL, 0, ' Vật tư ngành y', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M064', 'M063', 'NGUYỄN MAI CHI', 'male', '07-04-2009 (13-03 Kỷ Sửu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M065', 'M063', 'NGUYỄN QUANG MINH', 'male', '08-07-2015 (23-05 Ất Mùi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M066', 'M061', 'PHẠM DIỆU VÂN', 'male', '31-07-1986 (25-06 Bính Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M067', 'M066', 'Chồng: NGÔ ANH TUẤN', 'male', '18-03-1984 (16-02 Giáp tý)', NULL, 0, 'sỹ quan quân đội', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M068', 'M067', 'NGÔ ĐỨC TÙNG BÁCH', 'male', '03-07-2010 (22-05 Canh Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M069', 'M067', 'NGÔ ĐỨC TÙNG ANH', 'male', '24-12-2016 (26-11Bính Thân)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M070', 'M061', 'PHẠM MINH ĐÔ', 'male', '27-08-1990 (06-07 Canh Ngọ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M071', 'M070', 'Vợ: NGUYỄN THỊ LÝ HƯỜNG', 'female', '22-05-1990 (28-04 Canh Ngọ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M072', 'M071', 'PHẠM TRÚC LAM', 'male', '22-12-2017 (05-11 Đinh Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M073', 'M071', 'PHẠM MINH QUÂN', 'male', '08-09-2020 (21-07 Canh Tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M074', 'M071', 'PHẠM MINH DƯƠNG', 'male', '10-07-2024 (05-06 Giáp Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M075', 'M040', 'CON TRAI (ÚT)', 'male', NULL, 'Mất sớm, chưa đặt tên', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M076', 'M002', 'PHẠM THỊ NŨ', 'female', '1926 Bính Dần', 'Đã Mất', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M077', 'M002', 'PHẠM NGỌC THỞ', 'male', '1929 Kỷ Tỵ', '15-08-1945 Ất Dậu', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M078', 'M002', 'PHẠM NGỌC NHẬT', 'male', '1931 Tân Mùi', '03-05-1987 Đinh Mão', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M079', 'M078', 'Vợ: ĐINH THỊ LOÁN', 'female', '1933 Quý Mão', '17-02-1982 Nhâm Tuất', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M080', 'M079', 'PHẠM NGỌC TUẤN', 'male', '30-10-1960 (11-09 Canh tí)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M081', 'M080', 'Vợ: TRẦN THỊ PHƯƠNG', 'female', '31-08-1959 (27-07 Kỷ Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M082', 'M081', 'PHẠM NGỌC ANH', 'male', '18-01-1987 (18-12 Bính Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M083', 'M081', 'PHẠM TRÂN TUÂN', 'male', '27-12-1999 (20-11 Kỷ Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M084', 'M081', 'PHẠM THỊ HƯƠNG LAN', 'female', '25-07-2002 (20-06 Nhâm Ngọ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M085', 'M079', 'PHẠM THỊ TÚ', 'female', '1962 Nhâm Dần', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M086', 'M079', 'PHẠM THỊ TÂN', 'female', '01-06-1965 (02-05 Ất tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M087', 'M079', 'PHẠM THỊ TƯ', 'female', '1968 Mậu Thân', '28-03-1978 Mậu Ngọ', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M088', 'M079', 'PHẠM ĐỨC CƯỜNG', 'male', '10-05-1971 (15-04 Tân Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M089', 'M088', 'Vợ: NGUYỄN THỊ HỒNG NGA', 'female', '30-03-1973 (26-02 Quý Sửu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M090', 'M089', 'PHẠM ĐỨC MẠNH', 'male', '26-03-1995 (26-02 ẤT Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M091', 'M089', 'PHẠM ĐỨC CÔNG', 'female', '08-10-2000 (11-09-2000 Canh Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M092', 'M001', 'Bà hai: NGUYỄN THỊ YẾN', 'female', '1895 Ất Mùi', '21-04-1945 Ất Dậu', 1, NULL, NULL, 'Chi bà hai');
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M093', 'M092', 'PHẠM NGỌC THẠCH', 'male', '1929 Kỷ tỵ', 'Đã Mất', 1, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M094', 'M093', 'Bà cả: NGUYỄN THỊ KIM NGÂN', 'female', '1937 Đinh Sửu', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M095', 'M094', 'PHẠM THỊ NGA', 'female', '13-09-1962 (15-08 Nhâm Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M096', 'M094', 'PHẠM NGỌC SƠN', 'male', '17-11-1964 (13-10 Giáp Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M097', 'M096', 'Vợ: DƯƠNG THỊ HUỆ', 'female', '02-12-1969 (26-10 Kỷ Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M098', 'M097', 'PHẠM THỊ THỦY', 'female', '09-05-1993 (18-04 Quý Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M099', 'M097', 'PHẠM ĐÔNG TRIỀU', 'male', '10-11-1996 (30-09 Bính Tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M100', 'M094', 'PHẠM THỊ ĐÀO', 'female', '25-01-1972 (08-12 Tân Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M101', 'M094', 'PHẠM THỊ ÁNH', 'female', '29-04-1974 (08-04 Giáp Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M102', 'M094', 'PHẠM HỒNG THẮNG', 'male', '31-08-1976 (14-07 Bính Thìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M103', 'M102', 'Vợ: DƯƠNG THỊ TUYẾT HUỆ', 'female', '23-11-1985 (12-10 Ất Sửu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M104', 'M103', 'PHẠM KHÁNH DUY', 'male', '12-03-2007 (23-01 Đinh Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M105', 'M103', 'PHẠM HẢI YẾN', 'male', '15-02-2009 (21-01 Kỷ Sửu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M106', 'M093', 'Bà hai: PHẠM THỊ THU', 'female', '1952 Nhâm Thìn', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M107', 'M106', 'PHẠM THỊ ANH ANH', 'female', '07-05-1995 (08-04 Ất Hợi)', NULL, 0, 'Phổ Yên - Thái Nguyên', NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M108', 'M001', 'Bà ba: NGUYỄN THỊ HOA', 'female', '1889 Kỷ Sửu', '25-01-2001 Tân tỵ', 1, NULL, NULL, 'Chi bà ba');
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M109', 'M108', 'PHẠM NGỌC SINH', 'male', '1947 Đinh Hợi', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M110', 'M109', 'Vợ: BÙI THỊ RỤNG', 'female', '1945 Ất Dậu', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M111', 'M110', 'PHẠM THỊ NHUNG', 'female', '16-05-1969 (01-04 Kỷ Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M112', 'M110', 'PHẠM VĂN NGỌC', 'male', '18-08-1973 (20-07 Quý Sửu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M113', 'M112', 'Vợ: LÊ THỊ HÀ', 'female', '1975 Ất mão', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M114', 'M113', 'PHẠM THỊ YẾN', 'female', '18-10-1998 (02-09 Mậu Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M115', 'M113', 'PHẠM THỊ LINH', 'female', '08-12-2005 (08-11 Ất Dậu)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M116', 'M113', 'PHẠM MINH ANH', 'male', '29-12-2013 (27-11 Quý Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M117', 'M110', 'PHẠM ĐỨC CƯỜNG', 'male', '26-03-1975 (15-02 Ất Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M118', 'M117', 'Vợ: ĐỖ THỊ LOAN', 'female', '22-08-1979 (27-06 Quý Mùi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M119', 'M118', 'PHẠM QUỲNH ANH', 'male', '21-02-2002 (10-01 Nhâm Ngọ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M120', 'M118', 'PHẠM QUỲNH GIAO', 'male', '01-06-2013 (23-04 Quý Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M121', 'M110', 'PHẠM VĂN TUẤN', 'male', '25-09-1978 (22-08 Mậu Ngọ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M122', 'M121', 'Vợ: ĐÀO THỊ NỤ', 'female', '17-05-1983 (11-04 Quý Hợi)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M123', 'M122', 'PHẠM THÙY TRANG', 'male', '16-02-2008 (10-01 Mậu Tý)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M124', 'M122', 'PHẠM DUY KHÁNH', 'male', '02-12-2010 (25-10 Canh Dần)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M125', 'M110', 'PHẠM VĂN TRỌNG', 'male', '10-10-1980 (02-09 Canh Thân)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M126', 'M125', 'Vợ: TRẦN THỊ NGA', 'female', '08-03-1988 (21-01 Mậu THìn)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M127', 'M126', 'PHẠM MINH THƯ', 'male', '24-04-2011 (22-11 Tân Mão)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M128', 'M126', 'PHẠM MINH TUYỀN', 'male', '24-05-2013 (15-04 Quý Tỵ)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M129', 'M126', 'PHẠM THỦY TIÊN', 'male', '03-10-2016 (03-09 Bính Thân)', NULL, 0, NULL, NULL, NULL);
INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES ('M130', 'M110', 'PHẠM THỊ THỦY', 'female', '28-10-1983 (25-09 Quý Hợi)', NULL, 0, NULL, NULL, NULL);
