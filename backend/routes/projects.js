import express from 'express';
import { getProjects, getProjectById } from '../controllers/projectController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', validateId, getProjectById);

export default router;
