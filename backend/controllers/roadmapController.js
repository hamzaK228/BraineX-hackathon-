import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadRoadmaps = () => {
  try {
    const dataPath = path.join(__dirname, '../data/roadmaps.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading roadmaps:', error);
    return [];
  }
};

export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = loadRoadmaps();
    const { category, difficulty } = req.query;

    let filtered = roadmaps;

    if (category) {
      filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty) {
      filtered = filtered.filter((r) => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
};

export const getRoadmapBySlug = async (req, res) => {
  try {
    const roadmaps = loadRoadmaps();
    const roadmap = roadmaps.find((r) => r.slug === req.params.slug);

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};
