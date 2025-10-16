-- ================================================
-- 共通テスト（旧センター試験）過去問演習補助アプリ
-- 初期スキーマ定義（Flyway対応）
-- ================================================

-- ▼ 1. users（ユーザー情報）
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ▼ 2. averages（年度・科目別 平均点・標準偏差マスタ）
CREATE TABLE averages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    std_deviation DECIMAL(5,2) NOT NULL,
    source VARCHAR(255),
    UNIQUE KEY uq_avg_subject_year (subject, year)
);

-- ▼ 3. score_records（ユーザーの得点・偏差値記録）
CREATE TABLE score_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    score INT NOT NULL,
    deviation_value DECIMAL(5,2),
    round_number TINYINT DEFAULT 1,
    total_time INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ▼ 4. questions（設問マスタ）
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    question_number INT NOT NULL,
    correct_choice CHAR(1) NOT NULL,
    correct_rate DECIMAL(5,2),
    difficulty VARCHAR(20),
    UNIQUE KEY uq_question (subject, year, question_number)
);

-- ▼ 5. question_results（ユーザーの設問別回答結果）
CREATE TABLE question_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_choice CHAR(1),
    is_correct BOOLEAN,
    evaluation_value DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ▼ 6. time_records（解答時間・オーバー時間）
CREATE TABLE time_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    allotted_time INT NOT NULL,
    actual_time INT NOT NULL,
    overtime INT GENERATED ALWAYS AS (actual_time - allotted_time) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
