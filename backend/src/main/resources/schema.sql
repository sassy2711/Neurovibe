-- This SQL script creates the 'file_progress' table if it does not already exist.

CREATE TABLE IF NOT EXISTS file_progress (
    -- Unique identifier for each file progress record; automatically increments with each new entry.
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- The name of the file being tracked; must be unique and cannot be null.
                                             file_name VARCHAR(255) UNIQUE NOT NULL,

    -- The last read position of the file; cannot be null.
    last_read_position INT NOT NULL
    );
