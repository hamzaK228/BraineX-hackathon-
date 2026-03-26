import { pool } from '../config/database.js';

// Get all items (goals, tasks, notes)
export const getItems = async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const userId = req.user.id;

    let query = 'SELECT * FROM goals WHERE user_id = ?';
    const params = [userId];

    if (parentId !== undefined) {
      query += ' AND parent_id ' + (parentId === 'null' ? 'IS NULL' : '= ?');
      if (parentId !== 'null') params.push(parentId);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [items] = await pool.query(query, params);
    const responseData = { success: true, count: items.length, data: items };

    if (res && typeof res.json === 'function') {
      return res.json(responseData);
    }
    return responseData;
  } catch (error) {
    const errorData = { success: false, error: error.message };
    if (res && typeof res.status === 'function') {
      return res.status(500).json(errorData);
    }
    return errorData;
  }
};


export const createItem = async (req, res) => {
  try {
    const { type, title, description, priority, dueDate, parentId, category, milestones, content } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO goals (user_id, type, title, description, priority, due_date, parent_id, category, milestones, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, type || 'goal', title, description || null, priority || 'medium', dueDate || null, parentId || null, category || null, milestones ? JSON.stringify(milestones) : null, content || null]
    );

    const responseData = {
      success: true,
      data: { id: result.insertId, type: type || 'goal', title, description, priority, dueDate, parentId, category, content }
    };

    // Support both real HTTP responses and mock AI tool calls
    if (res && typeof res.status === 'function' && typeof res.status(201)?.json === 'function') {
      return res.status(201).json(responseData);
    }
    return responseData;
  } catch (error) {
    const errorData = { success: false, error: error.message };
    if (res && typeof res.status === 'function') {
      return res.status(400).json(errorData);
    }
    return errorData;
  }
};


export const updateItem = async (req, res) => {
  try {
    const { status, title, description, priority, dueDate, progress, content, milestones } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE goals SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), priority = COALESCE(?, priority), due_date = COALESCE(?, due_date), progress = COALESCE(?, progress), content = COALESCE(?, content), milestones = COALESCE(?, milestones) WHERE id = ? AND user_id = ?',
      [status, title, description, priority, dueDate, progress, content, milestones ? JSON.stringify(milestones) : null, id, userId]
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
