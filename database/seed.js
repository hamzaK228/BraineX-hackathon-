import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { hashPassword } from '../backend/middleware/auth.js';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brainex_db',
};

async function seedDatabase() {
  let connection;

  try {
    console.log('🌱 Starting database seeding...');
    connection = await mysql.createConnection(dbConfig);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'applications',
      'mentor_bookings',
      'project_members',
      'event_registrations',
      'scholarships',
      'mentors',
      'projects',
      'events',
      'fields',
      'users',
      'ai_chat_history',
    ];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Seed Users
    console.log('👥 Seeding users...');
    const adminPassword = await hashPassword('Admin@123');
    const studentPassword = await hashPassword('Student@123');

    await connection.query(
      `
      INSERT INTO users (email, password_hash, first_name, last_name, role, field, bio, verified) VALUES
      ('admin@brainex.com', ?, 'Admin', 'User', 'admin', 'Computer Science', 'Platform administrator', TRUE),
      ('john.doe@example.com', ?, 'John', 'Doe', 'student', 'Computer Science', 'Passionate about AI and ML', TRUE),
      ('sarah.chen@example.com', ?, 'Sarah', 'Chen', 'mentor', 'Artificial Intelligence', 'AI Research Scientist', TRUE),
      ('michael.johnson@example.com', ?, 'Michael', 'Johnson', 'mentor', 'Finance', 'Investment Banking VP', TRUE),
      ('aisha.patel@example.com', ?, 'Aisha', 'Patel', 'mentor', 'Medicine', 'Medical Researcher', TRUE),
      ('robert.kim@example.com', ?, 'Robert', 'Kim', 'mentor', 'Entrepreneurship', 'Startup Founder', TRUE)
    `,
      [
        adminPassword,
        studentPassword,
        studentPassword,
        studentPassword,
        studentPassword,
        studentPassword,
      ]
    );

    // Seed Fields
    console.log('🎓 Seeding fields...');
    await connection.query(`
      INSERT INTO fields (name, icon, description, salary, careers, demand_level, growth_rate) VALUES
      ('Artificial Intelligence & Data Science', '🤖', 'Explore the cutting-edge world of AI, machine learning, and data analytics', '$120,000 - $180,000', 'ML Engineer, Data Scientist, AI Researcher', 'very_high', '25% YoY'),
      ('Biotech & Health Sciences', '🧬', 'Advance medical research and healthcare innovation', '$90,000 - $150,000', 'Biotech Researcher, Medical Scientist', 'high', '18% YoY'),
      ('Climate Tech & Sustainability', '🌱', 'Build solutions for environmental challenges', '$85,000 - $140,000', 'Sustainability Consultant, Climate Analyst', 'high', '22% YoY'),
      ('Engineering & Robotics', '⚙️', 'Design and build the technologies of tomorrow', '$95,000 - $160,000', 'Robotics Engineer, Mechanical Engineer', 'high', '15% YoY'),
      ('Entrepreneurship & Innovation', '💡', 'Turn your ideas into impactful startups', '$80,000 - $200,000+', 'Founder, Product Manager, Innovator', 'medium', '20% YoY'),
      ('Social Impact & Global Policy', '🌍', 'Drive change in diplomacy and human rights', '$70,000 - $120,000', 'Policy Analyst, NGO Director', 'medium', '12% YoY'),
      ('Digital Media & Creative Tech', '🎨', 'Create immersive experiences and digital art', '$75,000 - $130,000', 'UX Designer, Creative Director', 'medium', '16% YoY'),
      ('Economics & Finance', '💰', 'Master financial systems and economic policy', '$100,000 - $180,000', 'Financial Analyst, Economist', 'high', '14% YoY')
    `);

    // Seed Scholarships
    console.log('💰 Seeding scholarships...');
    await connection.query(`
      INSERT INTO scholarships (name, organization, amount, deadline, description, category, country, website, status) VALUES
      ('Gates Cambridge Scholarship', 'University of Cambridge', 'Full Funding', '2025-12-15', 'Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge. Covers full tuition, living expenses, and travel costs.', 'graduate', 'UK', 'https://www.gatescambridge.org/', 'active'),
      ('NSF Graduate Research Fellowship', 'National Science Foundation', '$37,000/year', '2025-10-25', 'Support for graduate research in science, technology, engineering, and mathematics. Three years of funding including stipend and education allowance.', 'research', 'USA', 'https://www.nsfgrfp.org/', 'active'),
      ('Rhodes Scholarship', 'University of Oxford', 'Full Funding', '2025-10-06', 'The world\\'s oldest graduate scholarship program, enabling exceptional young people to study at Oxford. Covers all university and college fees, living stipend.', 'graduate', 'UK', 'https://www.rhodeshouse.ox.ac.uk/', 'active'),
      ('Erasmus+ Master\\'s Programme', 'European Union', '€1,400/month', '2026-01-15', 'Joint master\\'s programmes between universities in different European countries with mobility opportunities across Europe.', 'graduate', 'Europe', 'https://ec.europa.eu/programmes/erasmus-plus/', 'active'),
      ('Fulbright Foreign Student Program', 'U.S. Department of State', 'Full Funding', '2025-12-01', 'Graduate study and research opportunities in the United States for international students. Covers tuition, living costs, health insurance, and airfare.', 'graduate', 'USA', 'https://foreign.fulbrightonline.org/', 'active'),
      ('Chevening Scholarships', 'UK Government', 'Full Funding', '2025-11-07', 'UK government\\'s global scholarship programme for future leaders. One-year master\\'s degree in the UK with full financial support.', 'graduate', 'UK', 'https://www.chevening.org/', 'active'),
      ('Bolashak International Scholarship', 'Government of Kazakhstan', 'Full Funding', '2025-12-01', 'Kazakhstan government scholarship for top students to study abroad at leading universities worldwide. Covers tuition, living expenses, and travel.', 'international', 'Kazakhstan', 'https://bolashak.gov.kz/', 'active'),
      ('Nazarbayev University Scholarship', 'Nazarbayev University', 'Full Tuition + Stipend', '2025-09-01', 'Merit-based scholarship for undergraduate and graduate students at NU. Covers full tuition and monthly stipend for high-achieving students.', 'undergraduate', 'Kazakhstan', 'https://nu.edu.kz/', 'active'),
      ('DAAD Scholarship', 'German Academic Exchange Service', '€934/month', '2025-11-15', 'Study and research grants for students from developing countries to study in Germany. Includes health insurance and travel allowance.', 'graduate', 'Germany', 'https://www.daad.de/', 'active'),
      ('Google Generation Scholarship', 'Google', '$10,000', '2025-04-01', 'For students studying computer science or related fields. Based on academic excellence and leadership in tech communities.', 'undergraduate', 'USA', 'https://buildyourfuture.withgoogle.com/scholarships', 'active'),
      ('Microsoft Research Fellowship', 'Microsoft Research', '$42,000/year', '2025-10-15', 'Graduate fellowship for PhD students in computer science. Includes paid internship at Microsoft Research.', 'research', 'USA', 'https://www.microsoft.com/en-us/research/academic-program/', 'active'),
      ('L\\'Oreal-UNESCO For Women in Science', 'L\\'Oreal Foundation', '$20,000', '2025-03-31', 'International fellowships for women researchers in life sciences, physical sciences, mathematics, and computer science.', 'research', 'International', 'https://www.forwomeninscience.com/', 'active'),
      ('Obama Foundation Scholar Program', 'Obama Foundation', 'Full Funding', '2025-11-01', 'For emerging leaders from around the world pursuing graduate study at University of Chicago or Columbia University.', 'graduate', 'USA', 'https://www.obama.org/programs/scholars/', 'active'),
      ('ClimateWorks Foundation Grant', 'ClimateWorks', '$15,000', '2025-08-01', 'Research grants for graduate students working on climate solutions, clean energy, and sustainability policy.', 'research', 'International', 'https://www.climateworks.org/', 'active'),
      ('Echoing Green Fellowship', 'Echoing Green', '$90,000 over 2 years', '2025-02-28', 'For emerging social entrepreneurs with bold ideas for social change. Includes funding, coaching, and global network access.', 'graduate', 'International', 'https://echoinggreen.org/', 'active'),
      ('CFA Institute Research Challenge', 'CFA Institute', '$10,000 + CFA Exam', '2025-09-30', 'Annual research competition for finance students. Winners receive scholarship toward CFA certification.', 'undergraduate', 'International', 'https://www.cfainstitute.org/', 'active')
    `);

    // Get field IDs for mentors
    const [fields] = await connection.query('SELECT id, name FROM fields');
    const fieldMap = {};
    fields.forEach((f) => (fieldMap[f.name] = f.id));

    // Seed Mentors
    console.log('👨‍🏫 Seeding mentors...');
    await connection.query(`
      INSERT INTO mentors (user_id, title, company, field, experience, bio, mentees, rating, status) VALUES
      (3, 'AI Research Scientist', 'Google DeepMind', 'Artificial Intelligence', '8 years', 'Former Stanford PhD, now leading AI research. Helps students with research applications and career planning in tech.', 50, 4.9, 'verified'),
      (4, 'Investment Banking VP', 'Goldman Sachs', 'Finance', '10 years', 'Wharton MBA with 10 years in investment banking. Specializes in finance career paths and business school applications.', 75, 4.8, 'verified'),
      (5, 'Medical Researcher', 'Johns Hopkins', 'Medicine', '12 years', 'MD/PhD from Harvard, now conducting groundbreaking medical research. Guides pre-med students through the application process.', 60, 5.0, 'verified'),
      (6, 'Startup Founder', 'TechCorp (Acquired by Meta)', 'Entrepreneurship', '15 years', 'Serial entrepreneur with two successful exits. Mentors students interested in starting their own companies and product development.', 40, 4.9, 'verified')
    `);

    // Seed Projects
    console.log('🚀 Seeding projects...');
    await connection.query(`
      INSERT INTO projects (title, description, field, difficulty, duration, team_size, skills_required, objectives, status) VALUES
      ('AI-Powered Mental Health Chatbot', 'Build a conversational AI system that provides mental health support and resources to students', 'Artificial Intelligence', 'intermediate', '3-4 months', 4, 'Python, NLP, TensorFlow, React', 'Create an empathetic chatbot, Implement crisis detection, Integrate with mental health resources', 'active'),
      ('Sustainable Campus Initiative', 'Design and implement sustainability measures across university campuses', 'Climate Tech & Sustainability', 'beginner', '2-3 months', 6, 'Project Management, Data Analysis, Communication', 'Reduce campus carbon footprint, Implement recycling programs, Create sustainability dashboard', 'active'),
      ('Blockchain-Based Credential Verification', 'Develop a decentralized system for verifying academic credentials', 'Computer Science', 'advanced', '4-6 months', 5, 'Blockchain, Smart Contracts, Web3, Node.js', 'Create tamper-proof credential system, Implement smart contracts, Build verification portal', 'active')
    `);

    // Seed Events
    console.log('📅 Seeding events...');
    await connection.query(`
      INSERT INTO events (title, description, event_type, date, time, location, is_online, meeting_link, capacity, organizer, field, status) VALUES
      ('AI in Healthcare Workshop', 'Hands-on workshop exploring applications of artificial intelligence in modern healthcare', 'workshop', '2025-09-15', '14:00:00', 'Virtual', TRUE, 'https://zoom.us/j/example', 100, 'BraineX', 'Artificial Intelligence', 'upcoming'),
      ('Career Fair 2025', 'Connect with top employers and explore career opportunities across industries', 'networking', '2025-10-10', '10:00:00', 'Main Campus Hall', FALSE, NULL, 500, 'University Career Center', 'General', 'upcoming'),
      ('Entrepreneurship Bootcamp', 'Intensive 3-day bootcamp for aspiring entrepreneurs to develop and pitch their startup ideas', 'conference', '2025-11-05', '09:00:00', 'Innovation Hub', FALSE, NULL, 50, 'Startup Incubator', 'Entrepreneurship', 'upcoming'),
      ('Scholarship Application Workshop', 'Step-by-step guidance on writing winning scholarship essays. Live review of sample applications.', 'workshop', '2025-08-20', '15:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-scholarships', 200, 'BraineX', 'General', 'upcoming'),
      ('Data Science Career Panel', 'Q&A with 5 data scientists from top companies. Topics: breaking in, salaries, skills needed in 2025.', 'seminar', '2025-09-05', '17:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-ds-panel', 150, 'BraineX', 'Artificial Intelligence', 'upcoming'),
      ('Climate Tech Hackathon', '48-hour hackathon building solutions for climate change. $5000 in prizes. Open to all fields.', 'conference', '2025-10-18', '09:00:00', 'Innovation Hub, Almaty', FALSE, NULL, 80, 'BraineX + ClimateKZ', 'Climate Tech & Sustainability', 'upcoming'),
      ('Startup Pitch Night', 'Present your startup idea to a panel of investors and mentors. Top 3 teams win seed funding.', 'networking', '2025-11-12', '18:00:00', 'TechPark Astana', FALSE, NULL, 60, 'BraineX + Astana Hub', 'Entrepreneurship & Innovation', 'upcoming'),
      ('Graduate School Application Masterclass', 'How to apply to top graduate programs: personal statement, recommendations, GRE/GMAT strategy.', 'workshop', '2025-12-03', '14:00:00', 'Virtual', TRUE, 'https://zoom.us/j/brainex-gradschool', 300, 'BraineX', 'General', 'upcoming')
    `);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');

    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [fieldCount] = await connection.query('SELECT COUNT(*) as count FROM fields');
    const [scholarshipCount] = await connection.query('SELECT COUNT(*) as count FROM scholarships');
    const [mentorCount] = await connection.query('SELECT COUNT(*) as count FROM mentors');
    const [projectCount] = await connection.query('SELECT COUNT(*) as count FROM projects');
    const [eventCount] = await connection.query('SELECT COUNT(*) as count FROM events');

    console.log(`  Users: ${userCount[0].count}`);
    console.log(`  Fields: ${fieldCount[0].count}`);
    console.log(`  Scholarships: ${scholarshipCount[0].count}`);
    console.log(`  Mentors: ${mentorCount[0].count}`);
    console.log(`  Projects: ${projectCount[0].count}`);
    console.log(`  Events: ${eventCount[0].count}`);

    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: admin@brainex.com / Admin@123');
    console.log('  Student: john.doe@example.com / Student@123');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
