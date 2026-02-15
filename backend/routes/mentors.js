import express from 'express';
import { getMentors, getMentorById } from '../controllers/mentorController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', validateId, getMentorById);

export default router;
