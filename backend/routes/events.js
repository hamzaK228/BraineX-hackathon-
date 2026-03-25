import express from 'express';
import { getEvents, getEventById } from '../controllers/eventController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', validateId, getEventById);

export default router;
