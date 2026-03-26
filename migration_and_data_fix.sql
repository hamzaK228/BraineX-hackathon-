-- ═══════════════════════════════════════════════════════════
-- MIGRATION: Add ai_chat_history table
-- Run this once: node database/migrate.js  (or paste in MySQL)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ═══════════════════════════════════════════════════════════
-- FIX: Update scholarship deadlines to 2025-2026
-- Your seed.js has 2024 dates — everything shows as expired!
-- ═══════════════════════════════════════════════════════════

UPDATE scholarships SET deadline = '2025-12-15' WHERE name = 'Gates Cambridge Scholarship';
UPDATE scholarships SET deadline = '2025-10-25' WHERE name = 'NSF Graduate Research Fellowship';
UPDATE scholarships SET deadline = '2025-10-06' WHERE name = 'Rhodes Scholarship';
UPDATE scholarships SET deadline = '2026-01-15' WHERE name = 'Erasmus+ Master''s Programme';
UPDATE scholarships SET deadline = '2025-12-01' WHERE name = 'Fulbright Foreign Student Program';
UPDATE scholarships SET deadline = '2025-11-07' WHERE name = 'Chevening Scholarships';


-- ═══════════════════════════════════════════════════════════
-- EXPAND: Add more scholarships (more data = smarter AI answers)
-- ═══════════════════════════════════════════════════════════

INSERT INTO scholarships (name, organization, amount, deadline, description, category, country, website, status) VALUES

-- Kazakhstan-specific (relevant for your users)
('Bolashak International Scholarship', 'Government of Kazakhstan', 'Full Funding', '2025-12-01',
 'Kazakhstan government scholarship for top students to study abroad at leading universities worldwide. Covers tuition, living expenses, and travel.', 
 'international', 'Kazakhstan', 'https://bolashak.gov.kz/', 'active'),

('Nazarbayev University Scholarship', 'Nazarbayev University', 'Full Tuition + Stipend', '2025-09-01',
 'Merit-based scholarship for undergraduate and graduate students at NU. Covers full tuition and monthly stipend for high-achieving students.',
 'undergraduate', 'Kazakhstan', 'https://nu.edu.kz/', 'active'),

('DAAD Scholarship', 'German Academic Exchange Service', '€934/month', '2025-11-15',
 'Study and research grants for students from developing countries to study in Germany. Includes health insurance and travel allowance.',
 'graduate', 'Germany', 'https://www.daad.de/', 'active'),

-- STEM focused
('Google Generation Scholarship', 'Google', '$10,000', '2025-04-01',
 'For students studying computer science or related fields. Based on academic excellence and leadership in tech communities.',
 'undergraduate', 'USA', 'https://buildyourfuture.withgoogle.com/scholarships', 'active'),

('Microsoft Research Fellowship', 'Microsoft Research', '$42,000/year', '2025-10-15',
 'Graduate fellowship for PhD students in computer science. Includes paid internship at Microsoft Research.',
 'research', 'USA', 'https://www.microsoft.com/en-us/research/academic-program/', 'active'),

-- Women in STEM
('L''Oreal-UNESCO For Women in Science', 'L''Oreal Foundation', '$20,000', '2025-03-31',
 'International fellowships for women researchers in life sciences, physical sciences, mathematics, and computer science.',
 'research', 'International', 'https://www.forwomeninscience.com/', 'active'),

-- Social impact
('Obama Foundation Scholar Program', 'Obama Foundation', 'Full Funding', '2025-11-01',
 'For emerging leaders from around the world pursuing graduate study at University of Chicago or Columbia University.',
 'graduate', 'USA', 'https://www.obama.org/programs/scholars/', 'active'),

-- Climate / sustainability
('ClimateWorks Foundation Grant', 'ClimateWorks', '$15,000', '2025-08-01',
 'Research grants for graduate students working on climate solutions, clean energy, and sustainability policy.',
 'research', 'International', 'https://www.climateworks.org/', 'active'),

-- Entrepreneurship
('Echoing Green Fellowship', 'Echoing Green', '$90,000 over 2 years', '2025-02-28',
 'For emerging social entrepreneurs with bold ideas for social change. Includes funding, coaching, and global network access.',
 'graduate', 'International', 'https://echoinggreen.org/', 'active'),

-- Finance/Economics  
('CFA Institute Research Challenge', 'CFA Institute', '$10,000 + CFA Exam', '2025-09-30',
 'Annual research competition for finance students. Winners receive scholarship toward CFA certification.',
 'undergraduate', 'International', 'https://www.cfainstitute.org/', 'active');


-- ═══════════════════════════════════════════════════════════
-- FIX: Update event dates to 2025-2026
-- ═══════════════════════════════════════════════════════════

UPDATE events SET date = '2025-09-15' WHERE title = 'AI in Healthcare Workshop';
UPDATE events SET date = '2025-10-10' WHERE title = 'Career Fair 2024';
UPDATE events SET date = '2025-11-05' WHERE title = 'Entrepreneurship Bootcamp';
UPDATE events SET title = 'Career Fair 2025' WHERE title = 'Career Fair 2024';


-- ═══════════════════════════════════════════════════════════  
-- EXPAND: Add more events
-- ═══════════════════════════════════════════════════════════

INSERT INTO events (title, description, event_type, date, time, location, is_online, meeting_link, capacity, organizer, field, status) VALUES

('Scholarship Application Workshop', 
 'Step-by-step guidance on writing winning scholarship essays. Live review of sample applications.', 
 'workshop', '2025-08-20', '15:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-scholarships', 200, 'BraineX', 'General', 'upcoming'),

('Data Science Career Panel', 
 'Q&A with 5 data scientists from top companies. Topics: breaking in, salaries, skills needed in 2025.', 
 'seminar', '2025-09-05', '17:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-ds-panel', 150, 'BraineX', 'Artificial Intelligence', 'upcoming'),

('Climate Tech Hackathon', 
 '48-hour hackathon building solutions for climate change. $5000 in prizes. Open to all fields.', 
 'conference', '2025-10-18', '09:00:00', 'Innovation Hub, Almaty', FALSE, NULL, 80, 'BraineX + ClimateKZ', 'Climate Tech & Sustainability', 'upcoming'),

('Startup Pitch Night', 
 'Present your startup idea to a panel of investors and mentors. Top 3 teams win seed funding.', 
 'networking', '2025-11-12', '18:00:00', 'TechPark Astana', FALSE, NULL, 60, 'BraineX + Astana Hub', 'Entrepreneurship & Innovation', 'upcoming'),

('Graduate School Application Masterclass', 
 'How to apply to top graduate programs: personal statement, recommendations, GRE/GMAT strategy.', 
 'workshop', '2025-12-03', '14:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-gradschool', 300, 'BraineX', 'General', 'upcoming');
