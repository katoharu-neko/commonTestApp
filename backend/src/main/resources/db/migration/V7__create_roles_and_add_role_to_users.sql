-- 1) 役割テーブル作成
CREATE TABLE IF NOT EXISTS roles (
  id   INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 初期データ投入（存在しないものだけ）
INSERT INTO roles (id, name)
SELECT 1, 'ROLE_ADMIN' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 1);

INSERT INTO roles (id, name)
SELECT 2, 'ROLE_GENERAL' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 2);

INSERT INTO roles (id, name)
SELECT 3, 'ROLE_EDUCATOR' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 3);

-- 3) users に role_id を追加（※ MySQL 5.7 は ADD COLUMN IF NOT EXISTS が使えないため、初回適用を前提）
--    既存ユーザは「一般ユーザー(2)」を既定値に
ALTER TABLE users ADD COLUMN role_id INT NOT NULL DEFAULT 2;

-- 4) 外部キー付与（まだ存在しない前提）
ALTER TABLE users
  ADD CONSTRAINT fk_users_role
  FOREIGN KEY (role_id) REFERENCES roles(id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

-- 5) 念のため、NULL があれば一般ユーザーに寄せる（NOT NULL なので通常不要）
UPDATE users SET role_id = 2 WHERE role_id IS NULL;
