ALTER TABLE scores
    ADD COLUMN attempt_number INT NOT NULL DEFAULT 1;

UPDATE scores
SET attempt_number = 1
WHERE attempt_number IS NULL;
