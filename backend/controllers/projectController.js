import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load projects data from JSON
function loadProjects() {
  try {
    const dataPath = path.join(__dirname, '../data/projects.json');
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}

export const getProjects = async (req, res) => {
  try {
    const projects = loadProjects();
    const { field, difficulty, status = 'active', page = 1, limit = 20 } = req.query;

    let filtered = projects;

    // Filter by status (if present in data)
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Filter by field
    if (field) {
      filtered = filtered.filter((p) => p.category === field || p.field === field);
    }

    // Filter by difficulty
    if (difficulty) {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedResults = filtered.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: filtered.length,
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projects = loadProjects();
    const id = req.params.id;
    // Handle both string and number IDs
    const project = projects.find((p) => p.id == id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
};

export default { getProjects, getProjectById };
