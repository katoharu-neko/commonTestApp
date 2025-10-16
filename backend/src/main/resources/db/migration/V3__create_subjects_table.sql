CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    full_score INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
