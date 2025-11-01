
--新教科　情報を追加
INSERT INTO subjects (category, name, full_score) VALUES
('情報', '情報I', 100),

ALTER TABLE subjects ADD COLUMN short_name VARCHAR(255);

UPDATE subjects
SET short_name = CASE id
  WHEN 1 THEN '国語'
  WHEN 2 THEN '世界史'
  WHEN 3 THEN '日本史'
  WHEN 4 THEN '地理'
  WHEN 5 THEN '現社'
  WHEN 6 THEN '倫理'
  WHEN 7 THEN '政経'
  WHEN 8 THEN '倫政経'
  WHEN 9 THEN '数I'
  WHEN 10 THEN '数IA'
  WHEN 11 THEN '数II'
  WHEN 12 THEN '数IIBC'
  WHEN 13 THEN '物理基'
  WHEN 14 THEN '化学基'
  WHEN 15 THEN '生物基'
  WHEN 16 THEN '地学基'
  WHEN 17 THEN '物理'
  WHEN 18 THEN '化学'
  WHEN 19 THEN '地学'
  WHEN 20 THEN '英語R'
  WHEN 21 THEN '英語L'
  WHEN 22 THEN 'ドイ語'
  WHEN 23 THEN 'フラ語'
  WHEN 24 THEN '中国語'
  WHEN 25 THEN '韓国語'
  WHEN 26 THEN '情報'
  ELSE short_name
END;
