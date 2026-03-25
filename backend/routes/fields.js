import express from 'express';
import { getFields, getFieldById } from '../controllers/fieldController.js';
import { validateId } from '../utils/validation.js';

const router = express.Router();

router.get('/', getFields);
router.get('/:id', validateId, getFieldById);

export default router;
