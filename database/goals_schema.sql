-- Table structure for goals, tasks, and personal plans
CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL, -- Enables dedicated sub-pages/workspaces
  type ENUM('goal', 'task', 'note', 'page', 'roadmap') NOT NULL DEFAULT 'goal',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'academic',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  progress INT DEFAULT 0,
  due_date DATE,
  start_date DATE,
  content LONGTEXT, -- Stores page-specific notes or JSON structures
  milestones JSON, -- Stores an array of milestones if needed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES goals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
