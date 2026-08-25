-- Migration: Thêm bảng users (Phân quyền) và audit_logs (Nhật ký thay đổi)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor', -- 'super_admin' | 'editor'
  branch TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'locked'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL, -- 'CREATE_MEMBER', 'UPDATE_MEMBER', 'DELETE_MEMBER', 'LOGIN', 'SYSTEM'
  target_id TEXT,
  target_name TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Super Admin mặc định (Username: admin / Mật khẩu: phamdong@123)
INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role, branch, phone, status)
VALUES (
  'USR001',
  'admin',
  'c693787f21c8713fea97b1ececf9e692df005d3b7993b5f3a7df209e95fcb6c9',
  'Phạm Phương Đông (Trưởng Tộc)',
  'super_admin',
  'Trực hệ',
  '0912345678',
  'active'
);

-- Seed Nhật ký khởi tạo
INSERT INTO audit_logs (user_id, user_name, action, target_id, target_name, details)
VALUES (
  'USR001',
  'Phạm Phương Đông',
  'SYSTEM',
  'ALL',
  'Hệ thống Gia Phả',
  'Khởi tạo thành công hệ thống Phân Quyền Quản Trị và Nhật Ký Thay Đổi Gia Phả.'
);
