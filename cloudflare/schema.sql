-- Schema cho Cloudflare D1 Database (Gia Phả Phạm Tộc)

-- 1. Bảng thành viên gia phả
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  parentId TEXT,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'male',
  birth TEXT,
  death TEXT,
  isDead INTEGER DEFAULT 0,
  bio TEXT,
  title TEXT,
  branch TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu truy vấn cây phả hệ
CREATE INDEX IF NOT EXISTS idx_members_parent ON members(parentId);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);

-- 2. Bảng lưu đăng ký Web Push & App Badging
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
