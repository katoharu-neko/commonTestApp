-- MySQL 5.7 でも安全に再実行できる冪等スクリプト

-- 1) roles テーブルが無ければ作成
CREATE TABLE IF NOT EXISTS roles (
  id   INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 初期データ（重複は無視）
INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'ROLE_ADMIN'),
  (2, 'ROLE_GENERAL'),
  (3, 'ROLE_EDUCATOR');

-- 3) users に role_id カラムが無ければ追加（情報スキーマで判定）
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role_id'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN role_id INT NOT NULL DEFAULT 2',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) 既存ユーザーの role_id が NULL のものは 2 (ROLE_GENERAL) に寄せる
UPDATE users SET role_id = 2 WHERE role_id IS NULL;

-- 5) 外部キー（users.role_id -> roles.id）が無ければ追加
SET @fk_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND CONSTRAINT_NAME = 'fk_users_role_id'
);
SET @ddl2 := IF(@fk_exists = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id)',
  'SELECT 1');
PREPARE stmt2 FROM @ddl2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 6) 役割マスタの名前が当初の想定からズレていればここで是正（任意）
-- UPDATE roles SET name='ROLE_GENERAL' WHERE id=2;
-- UPDATE roles SET name='ROLE_EDUCATOR' WHERE id=3;
