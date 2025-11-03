ALTER TABLE scores ADD COLUMN subject_id INT;

UPDATE scores s
JOIN subjects sub ON s.subject = sub.name
SET s.subject_id = sub.id
WHERE s.subject IS NOT NULL;

ALTER TABLE scores
    MODIFY subject_id INT NOT NULL;

ALTER TABLE scores
    ADD CONSTRAINT fk_scores_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id);

CREATE INDEX idx_scores_subject_id ON scores(subject_id);

ALTER TABLE scores DROP COLUMN subject;
