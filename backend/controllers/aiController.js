import OpenAI from 'openai';
import pool from '../config/database.js';
import * as goalController from './goalController.js';
import { knowledge } from '../data/aiKnowledge.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Context builder ──────────────────────────────────────────────────────────
// Fetches all relevant student data from your existing MySQL tables.
// No new tables needed except ai_chat_history (see migration below).

async function safeQuery(db, query, params = []) {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    console.warn(`DB query skipped (table may not exist): ${err.message}`);
    return [];
  }
}

async function buildStudentContext(userId) {
  const db = await pool.getConnection();
  try {
    // User profile (this one is critical)
    const users = await safeQuery(db, `SELECT first_name, last_name, field, bio, country FROM users WHERE id = ?`, [userId]);
    const user = users[0] || { first_name: 'Student', last_name: '', field: '', bio: '', country: '' };

    // Active scholarships
    const scholarships = await safeQuery(db,
      `SELECT s.name, s.organization, s.amount, s.deadline, s.category, 
              s.country, s.website, s.description,
              f.name as field_name
       FROM scholarships s
       LEFT JOIN fields f ON s.field_id = f.id
       WHERE s.status = 'active' AND s.deadline >= CURDATE()
       ORDER BY s.deadline ASC
       LIMIT 20`
    );

    // Scholarships user already applied to
    const applications = await safeQuery(db,
      `SELECT s.name, a.status, a.applied_at
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [userId]
    );

    // Verified mentors
    const mentors = await safeQuery(db,
      `SELECT u.first_name, u.last_name, m.title, m.company, m.field,
              m.experience, m.rating, m.mentees, m.availability, m.hourly_rate
       FROM mentors m
       JOIN users u ON m.user_id = u.id
       WHERE m.status = 'verified'
       ORDER BY (m.field = ?) DESC, m.rating DESC
       LIMIT 10`,
      [user?.field || '']
    );

    // User's mentor bookings
    const bookings = await safeQuery(db,
      `SELECT u.first_name as mentor_first, u.last_name as mentor_last,
              mb.session_date, mb.session_time, mb.topic, mb.status
       FROM mentor_bookings mb
       JOIN mentors m ON mb.mentor_id = m.id
       JOIN users u ON m.user_id = u.id
       WHERE mb.user_id = ?
       ORDER BY mb.session_date DESC
       LIMIT 5`,
      [userId]
    );

    // Active projects
    const projects = await safeQuery(db,
      `SELECT p.title, p.field, p.difficulty, p.duration, 
              p.team_size, p.skills_required, p.status,
              pm.role as user_role
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
       WHERE p.status = 'active'
       ORDER BY (pm.user_id IS NOT NULL) DESC
       LIMIT 15`,
      [userId]
    );

    // Upcoming events
    const events = await safeQuery(db,
      `SELECT title, event_type, date, time, location, is_online,
              organizer, field, capacity, registered_count, status
       FROM events
       WHERE status = 'upcoming' AND date >= CURDATE()
       ORDER BY date ASC
       LIMIT 10`
    );

    // User's event registrations
    const registrations = await safeQuery(db,
      `SELECT e.title, er.status
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = ?`,
      [userId]
    );

    // Fields info
    const fields = await safeQuery(db,
      `SELECT name, salary, careers, demand_level, growth_rate FROM fields ORDER BY demand_level DESC`
    );

    // Universities
    let universities = [];
    try {
      const dataPath = path.join(__dirname, '../data/universities.json');
      const data = fs.readFileSync(dataPath, 'utf8');
      const allUniversities = JSON.parse(data);
      const userField = (user?.field || '').toLowerCase();
      
      universities = allUniversities
        .filter(u => userField === '' || u.majors.some(m => m.toLowerCase().includes(userField)))
        .slice(0, 10);
        
      if (universities.length === 0) {
        universities = allUniversities.slice(0, 10);
      }
    } catch (err) {
      console.warn('Failed to load universities:', err.message);
    }

    return { user, scholarships, applications, mentors, bookings, projects, events, registrations, fields, universities };

  } finally {
    db.release();
  }
}

// ─── System prompt builder ────────────────────────────────────────────────────
// Combines student's live DB data + static knowledge into one system prompt.
// This is what makes answers personal AND knowledgeable.

function buildSystemPrompt(ctx) {
  const { user, scholarships, applications, mentors, bookings, projects, events, registrations, fields, universities } = ctx;

  const appliedNames = applications.map(a => a.name);

  const scholarshipList = scholarships.map(s =>
    `• ${s.name} | ${s.organization} | ${s.amount} | Deadline: ${s.deadline} | Category: ${s.category}${s.field_name ? ` | Field: ${s.field_name}` : ''}${s.country ? ` | Country: ${s.country}` : ''}${appliedNames.includes(s.name) ? ' [ALREADY APPLIED]' : ''}`
  ).join('\n');

  const mentorList = mentors.map(m =>
    `• ${m.first_name} ${m.last_name} — ${m.title} at ${m.company} | Field: ${m.field} | ${m.experience} exp | Rating: ${m.rating}/5 | ${m.availability}${m.hourly_rate ? ` | $${m.hourly_rate}/hr` : ' | Free'}`
  ).join('\n');

  const projectList = projects.map(p =>
    `• ${p.title} | ${p.field} | ${p.difficulty} | ${p.duration} | Team: ${p.team_size}${p.user_role ? ` | YOUR ROLE: ${p.user_role}` : ' | Not joined'}`
  ).join('\n');

  const eventList = events.map(e => {
    const isRegistered = registrations.some(r => r.title === e.title && r.status === 'registered');
    return `• ${e.title} | ${e.event_type} | ${e.date} ${e.time} | ${e.is_online ? 'Online' : e.location}${isRegistered ? ' [REGISTERED]' : ''}`;
  }).join('\n');

  const fieldList = fields.map(f =>
    `• ${f.name} | Salary: ${f.salary} | Demand: ${f.demand_level} | Growth: ${f.growth_rate}`
  ).join('\n');

  return `You are BraineX AI — a smart academic assistant for students on the BraineX platform.

═══════════════════════════════════
STUDENT PROFILE
═══════════════════════════════════
Name: ${user.first_name} ${user.last_name}
Field of study: ${user.field || 'Not specified'}
Country: ${user.country || 'Not specified'}
Bio: ${user.bio || 'Not provided'}

═══════════════════════════════════
AVAILABLE SCHOLARSHIPS (live from database)
═══════════════════════════════════
${scholarshipList || 'No active scholarships currently.'}

Applications already submitted by this student:
${applications.length ? applications.map(a => `• ${a.name} — Status: ${a.status}`).join('\n') : 'None yet'}

═══════════════════════════════════
AVAILABLE MENTORS
═══════════════════════════════════
${mentorList || 'No verified mentors currently.'}

Student's upcoming sessions:
${bookings.length ? bookings.map(b => `• ${b.mentor_first} ${b.mentor_last} on ${b.session_date} — ${b.topic || 'No topic set'} (${b.status})`).join('\n') : 'No bookings'}

═══════════════════════════════════
ACTIVE PROJECTS
═══════════════════════════════════
${projectList || 'No active projects.'}

═══════════════════════════════════
UPCOMING EVENTS
═══════════════════════════════════
${eventList || 'No upcoming events.'}

═══════════════════════════════════
FIELDS & CAREER DATA
═══════════════════════════════════
${fieldList}

═══════════════════════════════════
UNIVERSITY RECOMMENDATIONS (Top matches for student)
═══════════════════════════════════
${universities && universities.length > 0 ? universities.map(u => 
`• ${u.name} (${u.shortName}) | ${u.city}, ${u.country} | Rank: #${u.ranking} | Majors: ${u.majors.join(', ')} | Acceptance Rate: ${u.acceptanceRate} | Tuition: ${u.tuition} | Website: ${u.website}`
).join('\n') : 'No university data available.'}

═══════════════════════════════════
PLATFORM KNOWLEDGE
═══════════════════════════════════
${knowledge.platform}

SCHOLARSHIP ADVICE:
${knowledge.scholarshipAdvice}

MENTORSHIP ADVICE:
${knowledge.mentorAdvice}

PROJECT ADVICE:
${knowledge.projectAdvice}

EVENT ADVICE:
${knowledge.eventAdvice}

CAREER ADVICE:
${knowledge.careerAdvice}

═══════════════════════════════════
ANSWER RULES
═══════════════════════════════════
SIMPLE questions ("what scholarships exist", "when is the next event", "how do I register"):
→ Answer in 2-4 sentences. Direct, plain language. List specifics from the data above.

ADVANCED questions ("which scholarship fits me best", "write me an essay outline", 
"compare these mentors", "what's my best career strategy"):
→ Give a structured answer: reasoning + recommendation + concrete next steps.
→ Reference the student's specific field, applications, and profile when relevant.
→ Use bullet points or numbered steps for clarity.

ALWAYS:
- Only reference data shown above. NEVER invent scholarships, mentors, or deadlines.
- If data is missing, say "I don't see that info — check the platform directly."
- Refer to the student by first name: ${user.first_name}.
- Be encouraging but honest. Don't overpromise.
- If a scholarship is marked [ALREADY APPLIED], acknowledge it.
- If a mentor is 'unavailable', mention the student should check back later.

═══════════════════════════════════
WORKSPACE TOOLS — "TOTAL CONTROL"
═══════════════════════════════════
You have powerful tools to manage ALL sections of the student's workspace. Use them proactively!

PLANNING TOOLS:
• create_goal — Create a high-level goal or "Roadmap" workspace. Use type='roadmap' for major plans.
• create_task — Add actionable tasks under a goal/roadmap. Use goal_id from create_goal.
• get_user_goals — Check the student's existing goals before creating duplicates.

CONTENT TOOLS:
• create_note — Save study tips, analysis, or resource compilations.
• add_resource — Save links, documents, videos, or books.

ACADEMIC TOOLS:
• add_deadline — Add high-priority dates (exams, applications).
• add_university — Add to the University Tracker with status and chance level.
• add_scholarship — Track scholarship opportunities with amounts and deadlines.
• add_course — Monitor academic courses with grades and providers.
• add_application — Track university/job/internship applications.
• add_program — Track summer programs and extracurriculars.
• pin_to_calendar — Schedule study sessions, events, or reminders.

RULES FOR TOOLS:
1. ALWAYS interview the student first to get context before creating a roadmap.
2. When creating a plan, use create_goal with type='roadmap' FIRST, then create_task for each step.
3. When adding universities/scholarships, include relevant details.
4. Tell the student what you created and where they can find it in their sidebar.
5. Use get_user_goals before creating to avoid duplicates.
`;
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new high-level goal or a roadmap/workspace page in the My Goals dashboard.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the goal or roadmap' },
          type: { type: 'string', enum: ['goal', 'roadmap', 'page'], description: 'Type of item' },
          category: { type: 'string', description: 'Category (academic, career, personal, health)' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          due_date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
          description: { type: 'string', description: 'Detailed description of the goal' }
        },
        required: ['title', 'type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a specific task inside a goal or roadmap. Shows in the Tasks section.',
      parameters: {
        type: 'object',
        properties: {
          goal_id: { type: 'integer', description: 'Parent goal/roadmap ID' },
          title: { type: 'string', description: 'Task title' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          due_date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' }
        },
        required: ['goal_id', 'title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_user_goals',
      description: 'Fetch the user\'s current goals, roadmaps, and tasks to understand their progress.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_note',
      description: 'Create a note in the Notes section with study tips, analysis, or resources.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Note title' },
          content: { type: 'string', description: 'Note content (markdown supported)' },
          parent_id: { type: 'integer', description: 'Optional parent roadmap ID to link the note' }
        },
        required: ['title', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_deadline',
      description: 'Add a deadline to the Deadlines section. Use for application deadlines, exam dates, etc.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Deadline title' },
          due_date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          category: { type: 'string', description: 'Category (exam, application, scholarship, personal)' }
        },
        required: ['title', 'due_date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_university',
      description: 'Add a university to the My Universities tracker with application status.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'University name' },
          location: { type: 'string', description: 'City, Country' },
          status: { type: 'string', enum: ['interested', 'applying', 'applied', 'accepted'], description: 'Application status' },
          chance: { type: 'string', enum: ['reach', 'target', 'safety'], description: 'Admission chance' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_scholarship',
      description: 'Add a scholarship to the Scholarship Tracker section.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Scholarship name' },
          amount: { type: 'string', description: 'Award amount' },
          deadline: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
          status: { type: 'string', enum: ['researching', 'drafting', 'submitted', 'awarded'], description: 'Status' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_course',
      description: 'Add a course to the Courses tracker for academic progress monitoring.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Course name' },
          provider: { type: 'string', description: 'University or online platform' },
          status: { type: 'string', enum: ['planned', 'in_progress', 'completed'], description: 'Status' },
          grade: { type: 'string', description: 'Current or final grade' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_application',
      description: 'Add a university or job application to the Applications tracker.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Application title (e.g., "MIT Fall 2027")' },
          type: { type: 'string', enum: ['university', 'job', 'internship'], description: 'Application type' },
          status: { type: 'string', enum: ['preparing', 'submitted', 'interview', 'accepted', 'rejected'], description: 'Status' },
          deadline: { type: 'string', description: 'ISO date (YYYY-MM-DD)' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_resource',
      description: 'Save a link, document, or study material to the Resources section.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Resource title' },
          url: { type: 'string', description: 'URL link' },
          type: { type: 'string', enum: ['link', 'document', 'video', 'book'], description: 'Resource type' },
          description: { type: 'string', description: 'Brief description' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_program',
      description: 'Add a summer program or extracurricular to the My Programs tracker.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Program name' },
          organization: { type: 'string', description: 'Organizing body' },
          deadline: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
          status: { type: 'string', enum: ['interested', 'drafting', 'submitted'], description: 'Status' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'pin_to_calendar',
      description: 'Pin an event, study session, or reminder to the Calendar section.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title' },
          date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Time (HH:MM)' },
          description: { type: 'string', description: 'Event description' }
        },
        required: ['title', 'date']
      }
    }
  }
];


// ─── Chat history helpers ─────────────────────────────────────────────────────

async function ensureTables() {
  let db;
  try {
    db = await pool.getConnection();
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role ENUM('user', 'assistant', 'system') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_created (user_id, created_at)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        parent_id INT DEFAULT NULL,
        type ENUM('goal', 'task', 'note', 'page', 'roadmap') NOT NULL DEFAULT 'goal',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'academic',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'active',
        progress INT DEFAULT 0,
        due_date DATE,
        start_date DATE,
        content LONGTEXT,
        milestones JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_parent (parent_id)
      )
    `);
    console.log('✅ AI tables ensured (ai_chat_history, goals)');
  } catch (err) {
    console.warn('⚠️ AI tables setup skipped (DB not ready):', err.message);
  } finally {
    if (db) db.release();
  }
}

// Non-blocking: don't crash server if DB is unavailable at startup
ensureTables().catch(() => {});

async function getChatHistory(userId, limit = 12) {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.query(
      `SELECT role, content FROM ai_chat_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows.reverse(); // oldest first for OpenAI
  } catch (err) {
    console.warn('getChatHistory failed:', err.message);
    return []; // Return empty history instead of crashing
  } finally {
    db.release();
  }
}

async function saveChatMessage(userId, role, content) {
  const db = await pool.getConnection();
  try {
    await db.query(
      `INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)`,
      [userId, role, content]
    );
  } catch (err) {
    console.warn('saveChatMessage failed:', err.message);
    // Don't crash — saving history is non-critical
  } finally {
    db.release();
  }
}

// ─── Main chat handler ────────────────────────────────────────────────────────

export const chat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Set up SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const [ctx, history] = await Promise.all([
      buildStudentContext(userId),
      getChatHistory(userId)
    ]);

    const systemPrompt = buildSystemPrompt(ctx);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    // Tool execution loop
    let runner = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const responseMessage = runner.choices[0].message;

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result;

        console.log(`AI invoking tool: ${functionName}`, args);

        const mockRes = { 
          status: () => ({ json: (d) => d }),
          json: (d) => d 
        };

        if (functionName === 'create_goal') {
          const mockReq = { user: { id: userId }, body: args };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'roadmapCreated', title: args.title })}\n\n`);

        } else if (functionName === 'create_task') {
          const mockReq = { user: { id: userId }, body: { ...args, parentId: args.goal_id, type: 'task' } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: args.title })}\n\n`);

        } else if (functionName === 'get_user_goals') {
          const mockReq = { user: { id: userId }, query: {} };
          const resRaw = await goalController.getItems(mockReq, mockRes);
          result = resRaw?.data || [];

        } else if (functionName === 'create_note') {
          const mockReq = { user: { id: userId }, body: { title: args.title, content: args.content, type: 'note', parentId: args.parent_id } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: args.title })}\n\n`);

        } else if (functionName === 'add_deadline') {
          const mockReq = { user: { id: userId }, body: { title: args.title, type: 'task', priority: args.priority || 'high', dueDate: args.due_date, category: args.category } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '⏰ ' + args.title })}\n\n`);

        } else if (functionName === 'add_university') {
          // Store as a goal-type item with metadata in content
          const content = JSON.stringify({ location: args.location, status: args.status, chance: args.chance });
          const mockReq = { user: { id: userId }, body: { title: args.name, type: 'goal', category: 'university', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '🏛️ ' + args.name })}\n\n`);

        } else if (functionName === 'add_scholarship') {
          const content = JSON.stringify({ amount: args.amount, deadline: args.deadline, status: args.status });
          const mockReq = { user: { id: userId }, body: { title: args.name, type: 'goal', category: 'scholarship', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '💰 ' + args.name })}\n\n`);

        } else if (functionName === 'add_course') {
          const content = JSON.stringify({ provider: args.provider, status: args.status, grade: args.grade });
          const mockReq = { user: { id: userId }, body: { title: args.name, type: 'goal', category: 'course', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '📚 ' + args.name })}\n\n`);

        } else if (functionName === 'add_application') {
          const content = JSON.stringify({ appType: args.type, status: args.status, deadline: args.deadline });
          const mockReq = { user: { id: userId }, body: { title: args.title, type: 'goal', category: 'application', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '📄 ' + args.title })}\n\n`);

        } else if (functionName === 'add_resource') {
          const content = JSON.stringify({ url: args.url, resourceType: args.type, description: args.description });
          const mockReq = { user: { id: userId }, body: { title: args.title, type: 'note', category: 'resource', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '🔗 ' + args.title })}\n\n`);

        } else if (functionName === 'add_program') {
          const content = JSON.stringify({ organization: args.organization, deadline: args.deadline, status: args.status });
          const mockReq = { user: { id: userId }, body: { title: args.name, type: 'goal', category: 'program', content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '🌟 ' + args.name })}\n\n`);

        } else if (functionName === 'pin_to_calendar') {
          const content = JSON.stringify({ date: args.date, time: args.time, description: args.description });
          const mockReq = { user: { id: userId }, body: { title: args.title, type: 'task', category: 'calendar', dueDate: args.date, content } };
          const resRaw = await goalController.createItem(mockReq, mockRes);
          result = resRaw?.data || { success: true };
          res.write(`event: tool_applied\ndata: ${JSON.stringify({ type: 'itemCreated', title: '📅 ' + args.title })}\n\n`);
        }


        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result),
        });
      }

      // Get final response after tools
      const finalStream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of finalStream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      
      await saveChatMessage(userId, 'user', message);
      await saveChatMessage(userId, 'assistant', fullResponse);
      res.write('data: [DONE]\n\n');
      res.end();

    } else {
      // Normal streaming if no tool calling
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: messages,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      await saveChatMessage(userId, 'user', message);
      await saveChatMessage(userId, 'assistant', fullResponse);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('AI chat error:', err.message, err.stack);
    const errorMsg = process.env.NODE_ENV === 'development' 
      ? `AI Error: ${err.message}` 
      : 'AI service error. Please try again.';
    try {
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    } catch (writeErr) {
      // Response may already be closed
      console.error('Failed to write error response:', writeErr.message);
    }
  }
};

// ─── Get chat history for frontend ────────────────────────────────────────────

export const getHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const history = await getChatHistory(userId, 50);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error('getHistory error:', err.message);
    res.json({ success: true, data: [] });
  }
};

// ─── Clear chat history ───────────────────────────────────────────────────────

export const clearHistory = async (req, res) => {
  const userId = req.user.id;
  const db = await pool.getConnection();
  try {
    await db.query('DELETE FROM ai_chat_history WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } finally {
    db.release();
  }
};
