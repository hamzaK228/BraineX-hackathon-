import express from 'express';
import { getPrograms, getProgramById } from '../controllers/programController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', getPrograms);
router.get('/:id', validateId, getProgramById);

export default router;
