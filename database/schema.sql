-- Learning Platform Database Schema
-- Supports both PostgreSQL and SQLite

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'learner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    estimated_duration INTEGER, -- in minutes
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE
);

-- Course modules (chapters/sections)
CREATE TABLE IF NOT EXISTS course_modules (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL, -- 'text', 'video', 'quiz'
    content TEXT, -- for text modules
    video_url VARCHAR(500), -- for video modules
    duration INTEGER, -- for video modules in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'open_ended'
    options JSON, -- for multiple choice questions
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- User course enrollments
CREATE TABLE IF NOT EXISTS user_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_module_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (current_module_id) REFERENCES course_modules(id),
    UNIQUE(user_id, course_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- in seconds
    score DECIMAL(5,2), -- for quiz modules
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    UNIQUE(user_id, module_id)
);

-- Clickstream analytics - Page views
CREATE TABLE IF NOT EXISTS page_views (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_id VARCHAR(36) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_on_page INTEGER, -- in seconds
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Clickstream analytics - User clicks
CREATE TABLE IF NOT EXISTS user_clicks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_id VARCHAR(36) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    click_coordinates JSON, -- {x: number, y: number}
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Clickstream analytics - Video interactions
CREATE TABLE IF NOT EXISTS video_interactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- 'play', 'pause', 'seek', 'complete', 'stop'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    video_time DECIMAL(10,3), -- current time in video
    duration DECIMAL(10,3), -- total video duration
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- Clickstream analytics - Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER, -- in seconds
    score DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    answers JSON, -- user's answers
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id ON user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_course_id ON user_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_clicks_user_id ON user_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clicks_timestamp ON user_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_video_interactions_user_id ON video_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_module_id ON video_interactions(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module_id ON quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
