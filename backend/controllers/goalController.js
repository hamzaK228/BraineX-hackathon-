import { pool } from '../config/database.js';

// Get all items (goals, tasks, notes)
export const getItems = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.id;

    const [items] = await pool.query(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const filtered = type ? items.filter((i) => i.type === type) : items;
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    // Fallback or empty handle, currently no generic json for goals
    res.json({ success: true, count: 0, data: [] });
  }
};

export const createItem = async (req, res) => {
  try {
    const { type, title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO goals (user_id, type, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, title, description, priority, dueDate]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, type, title, description, priority, dueDate }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { status, title, description, priority, dueDate, progress } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE goals SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), priority = COALESCE(?, priority), due_date = COALESCE(?, due_date), progress = COALESCE(?, progress) WHERE id = ? AND user_id = ?',
      [status, title, description, priority, dueDate, progress, id, userId]
    );

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export default { getItems, createItem, updateItem, deleteItem };
