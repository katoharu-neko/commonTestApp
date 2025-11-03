ALTER TABLE scores
<<<<<<< ours
    ADD COLUMN subject_id INT;

UPDATE scores s
INNER JOIN subjects sub ON s.subject = sub.name
    SET s.subject_id = sub.id
WHERE s.subject_id IS NULL;
=======
    ADD COLUMN IF NOT EXISTS subject_id INT NULL;

-- 既存のscores.subjectに対応するsubjectsレコードが無い場合は作成する
INSERT INTO subjects (category, name, full_score, is_active)
SELECT 'auto-generated', s.subject, 0, FALSE
FROM scores s
LEFT JOIN subjects sub ON sub.name = s.subject
WHERE s.subject IS NOT NULL
  AND sub.id IS NULL
GROUP BY s.subject;

-- subjectsに用意したIDでscores.subject_idを更新
UPDATE scores s
LEFT JOIN subjects sub ON s.subject = sub.name
SET s.subject_id = sub.id
WHERE s.subject IS NOT NULL;

-- subjectがNULLだったスコア用にダミー科目を作成して紐付ける
INSERT INTO subjects (category, name, full_score, is_active)
SELECT 'auto-generated', '未設定', 0, FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM subjects WHERE name = '未設定'
);

UPDATE scores
SET subject_id = (SELECT id FROM subjects WHERE name = '未設定')
WHERE subject_id IS NULL;
>>>>>>> theirs

ALTER TABLE scores
    MODIFY subject_id INT NOT NULL;

ALTER TABLE scores
    ADD CONSTRAINT fk_scores_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id);

ALTER TABLE scores
<<<<<<< ours
    DROP COLUMN subject;
=======
    DROP COLUMN IF EXISTS subject;
>>>>>>> theirs
