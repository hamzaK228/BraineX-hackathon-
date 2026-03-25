-- BraineX Database Schema
-- Normalized structure with proper foreign keys and indexes

-- Drop existing tables
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS mentor_bookings;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS fields;
DROP TABLE IF EXISTS users;

-- Users table (central authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
    field VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_field (field)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fields/Disciplines table
CREATE TABLE fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    salary VARCHAR(100),
    careers TEXT,
    demand_level ENUM('low', 'medium', 'high', 'very_high') DEFAULT 'medium',
    growth_rate VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scholarships table
CREATE TABLE scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    amount VARCHAR(100) NOT NULL,
    deadline DATE NOT NULL,
    description TEXT NOT NULL,
    category ENUM('undergraduate', 'graduate', 'international', 'research') NOT NULL,
    country VARCHAR(100),
    website VARCHAR(255),
    field_id INT,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_deadline (deadline),
    INDEX idx_status (status),
    INDEX idx_field (field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mentors table
CREATE TABLE mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    field VARCHAR(100) NOT NULL,
    experience VARCHAR(50),
    bio TEXT,
    mentees INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.0,
    hourly_rate DECIMAL(10,2),
    availability ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_field (field),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    field VARCHAR(100) NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    duration VARCHAR(50),
    team_size INT DEFAULT 1,
    skills_required TEXT,
    objectives TEXT,
    deliverables TEXT,
    resources TEXT,
    created_by INT,
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_field (field),
    INDEX idx_difficulty (difficulty),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type ENUM('workshop', 'seminar', 'conference', 'networking', 'webinar') NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT FALSE,
    meeting_link VARCHAR(255),
    capacity INT,
    registered_count INT DEFAULT 0,
    organizer VARCHAR(150),
    field VARCHAR(100),
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_type (event_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scholarship Applications table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
    cover_letter TEXT,
    resume_url VARCHAR(255),
    additional_docs TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_application (user_id, scholarship_id),
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_scholarship (scholarship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mentor Bookings table
CREATE TABLE mentor_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mentor_id INT NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration INT DEFAULT 60,
    topic VARCHAR(255),
    message TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    meeting_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_date (session_date),
    INDEX idx_user (user_id),
    INDEX idx_mentor (mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Members table
CREATE TABLE project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'member', 'contributor') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (project_id, user_id),
    INDEX idx_project (project_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Registrations table
CREATE TABLE event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
