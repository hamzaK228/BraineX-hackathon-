// Admin Routes - JSON Fallback Mode
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { readJson, writeJson } from '../utils/jsonHelper.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// JSON file paths
const DATA_DIR = new URL('../data/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Helper to load JSON data
async function loadData(type) {
  try {
    const data = await readJson(type);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Failed to load ${type} data:`, error.message);
    return [];
  }
}

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [scholarships, mentors, fields, events] = await Promise.all([
      loadData('scholarships'),
      loadData('mentors'),
      loadData('fields'),
      loadData('events'),
    ]);

    const stats = {
      totalUsers: 5, // Mock for JSON mode
      activeStudents: 3,
      activeMentors: mentors.filter((m) => m.status === 'verified').length,
      totalScholarships: scholarships.length,
      activeScholarships: scholarships.filter((s) => s.status === 'active').length,
      totalMentors: mentors.length,
      verifiedMentors: mentors.filter((m) => m.status === 'verified').length,
      totalFields: fields.length,
      totalEvents: events.length,
    };

    res.json({
      success: true,
      data: {
        users: {
          total: stats.totalUsers,
          students: stats.activeStudents,
          mentors: stats.activeMentors,
          admins: 1,
        },
        totalScholarships: stats.totalScholarships,
        activeScholarships: stats.activeScholarships,
        totalMentors: stats.totalMentors,
        verifiedMentors: stats.verifiedMentors,
        totalFields: stats.totalFields,
        totalEvents: stats.totalEvents,
        monthlyRevenue: 45250,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// @desc    Get all users (mock for JSON mode)
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  res.json({
    success: true,
    data: {
      users: [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@brainex.com',
          role: 'admin',
          isActive: true,
        },
        {
          id: 2,
          firstName: 'Test',
          lastName: 'Student',
          email: 'student@test.com',
          role: 'student',
          isActive: true,
        },
        {
          id: 3,
          firstName: 'Demo',
          lastName: 'Mentor',
          email: 'mentor@test.com',
          role: 'mentor',
          isActive: true,
        },
      ],
      pagination: { page: 1, limit: 10, total: 3, pages: 1 },
    },
  });
});

// ==================== SCHOLARSHIPS ====================

// @desc    Get all scholarships for admin
// @route   GET /api/admin/scholarships
router.get('/scholarships', async (req, res) => {
  try {
    const scholarships = await loadData('scholarships');
    res.json({ success: true, data: scholarships, count: scholarships.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scholarships' });
  }
});

// @desc    Create scholarship
// @route   POST /api/admin/scholarships
router.post('/scholarships', async (req, res) => {
  try {
    const scholarships = await loadData('scholarships');
    const newScholarship = {
      id: Date.now(),
      ...req.body,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    scholarships.push(newScholarship);
    await writeJson('scholarships', scholarships);
    res.status(201).json({ success: true, data: newScholarship });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create scholarship' });
  }
});

// @desc    Update scholarship
// @route   PUT /api/admin/scholarships/:id
router.put('/scholarships/:id', async (req, res) => {
  try {
    const scholarships = await loadData('scholarships');
    const index = scholarships.findIndex((s) => s.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }
    scholarships[index] = { ...scholarships[index], ...req.body };
    await writeJson('scholarships', scholarships);
    res.json({ success: true, data: scholarships[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update scholarship' });
  }
});

// @desc    Delete scholarship
// @route   DELETE /api/admin/scholarships/:id
router.delete('/scholarships/:id', async (req, res) => {
  try {
    let scholarships = await loadData('scholarships');
    const index = scholarships.findIndex((s) => s.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }
    scholarships.splice(index, 1);
    await writeJson('scholarships', scholarships);
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete scholarship' });
  }
});

// ==================== MENTORS ====================

router.get('/mentors', async (req, res) => {
  try {
    const mentors = await loadData('mentors');
    res.json({ success: true, data: mentors, count: mentors.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch mentors' });
  }
});

router.post('/mentors', async (req, res) => {
  try {
    const mentors = await loadData('mentors');
    const newMentor = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    mentors.push(newMentor);
    await writeJson('mentors', mentors);
    res.status(201).json({ success: true, data: newMentor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create mentor' });
  }
});

router.put('/mentors/:id', async (req, res) => {
  try {
    const mentors = await loadData('mentors');
    const index = mentors.findIndex((m) => m.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Mentor not found' });
    mentors[index] = { ...mentors[index], ...req.body };
    await writeJson('mentors', mentors);
    res.json({ success: true, data: mentors[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update mentor' });
  }
});

router.delete('/mentors/:id', async (req, res) => {
  try {
    let mentors = await loadData('mentors');
    const index = mentors.findIndex((m) => m.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Mentor not found' });
    mentors.splice(index, 1);
    await writeJson('mentors', mentors);
    res.json({ success: true, message: 'Mentor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete mentor' });
  }
});

// ==================== FIELDS ====================

router.get('/fields', async (req, res) => {
  try {
    const fields = await loadData('fields');
    res.json({ success: true, data: fields, count: fields.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch fields' });
  }
});

router.post('/fields', async (req, res) => {
  try {
    const fields = await loadData('fields');
    const newField = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    fields.push(newField);
    await writeJson('fields', fields);
    res.status(201).json({ success: true, data: newField });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create field' });
  }
});

router.put('/fields/:id', async (req, res) => {
  try {
    const fields = await loadData('fields');
    const index = fields.findIndex((f) => f.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Field not found' });
    fields[index] = { ...fields[index], ...req.body };
    await writeJson('fields', fields);
    res.json({ success: true, data: fields[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update field' });
  }
});

router.delete('/fields/:id', async (req, res) => {
  try {
    let fields = await loadData('fields');
    const index = fields.findIndex((f) => f.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Field not found' });
    fields.splice(index, 1);
    await writeJson('fields', fields);
    res.json({ success: true, message: 'Field deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete field' });
  }
});

// ==================== EVENTS ====================

router.get('/events', async (req, res) => {
  try {
    const events = await loadData('events');
    res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const events = await loadData('events');
    const newEvent = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    events.push(newEvent);
    await writeJson('events', events);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const events = await loadData('events');
    const index = events.findIndex((e) => e.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Event not found' });
    events[index] = { ...events[index], ...req.body };
    await writeJson('events', events);
    res.json({ success: true, data: events[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    let events = await loadData('events');
    const index = events.findIndex((e) => e.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Event not found' });
    events.splice(index, 1);
    await writeJson('events', events);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

// ==================== UNIVERSITIES ====================

router.get('/universities', async (req, res) => {
  try {
    const universities = await loadData('universities');
    res.json({ success: true, data: universities, count: universities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch universities' });
  }
});

router.post('/universities', async (req, res) => {
  try {
    const universities = await loadData('universities');
    const newUniversity = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    universities.push(newUniversity);
    await writeJson('universities', universities);
    res.status(201).json({ success: true, data: newUniversity });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create university' });
  }
});

router.put('/universities/:id', async (req, res) => {
  try {
    const universities = await loadData('universities');
    const index = universities.findIndex((u) => u.id == req.params.id);
    if (index === -1)
      return res.status(404).json({ success: false, error: 'University not found' });
    universities[index] = { ...universities[index], ...req.body };
    await writeJson('universities', universities);
    res.json({ success: true, data: universities[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update university' });
  }
});

router.delete('/universities/:id', async (req, res) => {
  try {
    let universities = await loadData('universities');
    const index = universities.findIndex((u) => u.id == req.params.id);
    if (index === -1)
      return res.status(404).json({ success: false, error: 'University not found' });
    universities.splice(index, 1);
    await writeJson('universities', universities);
    res.json({ success: true, message: 'University deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete university' });
  }
});

// ==================== PROGRAMS ====================

router.get('/programs', async (req, res) => {
  try {
    const programs = await loadData('programs');
    res.json({ success: true, data: programs, count: programs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch programs' });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const programs = await loadData('programs');
    const newProgram = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    programs.push(newProgram);
    await writeJson('programs', programs);
    res.status(201).json({ success: true, data: newProgram });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create program' });
  }
});

router.put('/programs/:id', async (req, res) => {
  try {
    const programs = await loadData('programs');
    const index = programs.findIndex((p) => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Program not found' });
    programs[index] = { ...programs[index], ...req.body };
    await writeJson('programs', programs);
    res.json({ success: true, data: programs[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update program' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    let programs = await loadData('programs');
    const index = programs.findIndex((p) => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Program not found' });
    programs.splice(index, 1);
    await writeJson('programs', programs);
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete program' });
  }
});

// ==================== PROJECTS ====================

router.get('/projects', async (req, res) => {
  try {
    const projects = await loadData('projects');
    res.json({ success: true, data: projects, count: projects.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const projects = await loadData('projects');
    const newProject = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    projects.push(newProject);
    await writeJson('projects', projects);
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const projects = await loadData('projects');
    const index = projects.findIndex((p) => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Project not found' });
    projects[index] = { ...projects[index], ...req.body };
    await writeJson('projects', projects);
    res.json({ success: true, data: projects[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    let projects = await loadData('projects');
    const index = projects.findIndex((p) => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Project not found' });
    projects.splice(index, 1);
    await writeJson('projects', projects);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

// ==================== ROADMAPS ====================

router.get('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await loadData('roadmaps');
    res.json({ success: true, data: roadmaps, count: roadmaps.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch roadmaps' });
  }
});

router.post('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await loadData('roadmaps');
    const newRoadmap = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    roadmaps.push(newRoadmap);
    await writeJson('roadmaps', roadmaps);
    res.status(201).json({ success: true, data: newRoadmap });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create roadmap' });
  }
});

router.put('/roadmaps/:id', async (req, res) => {
  try {
    const roadmaps = await loadData('roadmaps');
    const index = roadmaps.findIndex((r) => r.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    roadmaps[index] = { ...roadmaps[index], ...req.body };
    await writeJson('roadmaps', roadmaps);
    res.json({ success: true, data: roadmaps[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update roadmap' });
  }
});

router.delete('/roadmaps/:id', async (req, res) => {
  try {
    let roadmaps = await loadData('roadmaps');
    const index = roadmaps.findIndex((r) => r.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    roadmaps.splice(index, 1);
    await writeJson('roadmaps', roadmaps);
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete roadmap' });
  }
});

export default router;
