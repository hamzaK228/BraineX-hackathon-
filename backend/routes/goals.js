import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/goalController.js';

const router = express.Router();

router.use(authenticate);

router.route('/').get(getItems).post(createItem);

router.route('/:id').put(updateItem).delete(deleteItem);

export default router;
