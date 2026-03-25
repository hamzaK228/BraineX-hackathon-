import express from 'express';
import { getRoadmaps, getRoadmapBySlug } from '../controllers/roadmapController.js';

const router = express.Router();

router.get('/', getRoadmaps);
router.get('/:slug', getRoadmapBySlug);

export default router;
