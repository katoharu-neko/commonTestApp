ALTER TABLE scores
    ADD COLUMN subject_id INT;

UPDATE scores s
INNER JOIN subjects sub ON s.subject = sub.name
    SET s.subject_id = sub.id
WHERE s.subject_id IS NULL;

ALTER TABLE scores
    MODIFY subject_id INT NOT NULL;

ALTER TABLE scores
    ADD CONSTRAINT fk_scores_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id);

ALTER TABLE scores
    DROP COLUMN subject;
