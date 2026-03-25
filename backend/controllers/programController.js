import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load programs data from JSON
function loadPrograms() {
  try {
    const dataPath = path.join(__dirname, '../data/programs.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading programs data:', error);
    return [];
  }
}

// Get all programs
export const getPrograms = async (req, res) => {
  try {
    const programs = loadPrograms();

    // Query parameters for filtering
    const { category, age, locationType, cost, search, featured } = req.query;

    let filtered = programs;

    // Filter by category
    if (category) {
      const categories = category.split(',');
      filtered = filtered.filter((p) => categories.includes(p.category));
    }

    // Filter by age
    if (age) {
      const minAge = parseInt(age);
      filtered = filtered.filter((p) => p.ageMax >= minAge);
    }

    // Filter by location type
    if (locationType) {
      const types = locationType.split(',');
      filtered = filtered.filter((p) => types.includes(p.locationType));
    }

    // Filter by cost
    if (cost) {
      switch (cost) {
        case 'free':
          filtered = filtered.filter((p) => p.cost === 0);
          break;
        case 'under5k':
          filtered = filtered.filter((p) => p.cost < 5000);
          break;
        case 'under10k':
          filtered = filtered.filter((p) => p.cost < 10000);
          break;
      }
    }

    // Filter by featured
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.featured);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.shortName.toLowerCase().includes(searchLower) ||
          p.organization.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower)
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
};

// Get program by ID
export const getProgramById = async (req, res) => {
  try {
    const programs = loadPrograms();
    const id = parseInt(req.params.id);

    const program = programs.find((p) => p.id === id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
};

export default {
  getPrograms,
  getProgramById,
};
