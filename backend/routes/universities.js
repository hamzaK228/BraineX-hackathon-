import express from 'express';
import { getUniversities, getUniversityById } from '../controllers/universityController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', getUniversities);
router.get('/:id', validateId, getUniversityById);

export default router;
