import express from 'express';
import {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from '../controllers/scholarshipController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, scholarshipSchema, validateId } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', getScholarships);
router.get('/:id', validateId, getScholarshipById);

// Admin routes
router.post('/', authenticate, authorize('admin'), validate(scholarshipSchema), createScholarship);
router.put('/:id', authenticate, authorize('admin'), validateId, updateScholarship);
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteScholarship);

export default router;
