import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load universities data from JSON
function loadUniversities() {
  try {
    const dataPath = path.join(__dirname, '../data/universities.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading universities data:', error);
    return [];
  }
}

// Get all universities
export const getUniversities = async (req, res) => {
  try {
    const universities = loadUniversities();

    // Query parameters for filtering
    const { country, major, ranking, type, search } = req.query;

    let filtered = universities;

    // Filter by country
    if (country) {
      const countries = country.split(',');
      filtered = filtered.filter((u) => countries.includes(u.country));
    }

    // Filter by major
    if (major) {
      const majors = major.split(',').map((m) => m.toLowerCase());
      filtered = filtered.filter((u) =>
        u.majors.some((m) => majors.some((searchMajor) => m.toLowerCase().includes(searchMajor)))
      );
    }

    // Filter by ranking
    if (ranking) {
      const maxRanking = parseInt(ranking);
      filtered = filtered.filter((u) => u.ranking <= maxRanking);
    }

    // Filter by type
    if (type) {
      const types = type.split(',');
      filtered = filtered.filter((u) => types.includes(u.type));
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.shortName.toLowerCase().includes(searchLower) ||
          u.city.toLowerCase().includes(searchLower) ||
          u.country.toLowerCase().includes(searchLower) ||
          u.majors.some((m) => m.toLowerCase().includes(searchLower))
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
};

// Get university by ID
export const getUniversityById = async (req, res) => {
  try {
    const universities = loadUniversities();
    const id = parseInt(req.params.id);

    const university = universities.find((u) => u.id === id);

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    res.json(university);
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Failed to fetch university' });
  }
};

export default {
  getUniversities,
  getUniversityById,
};
