import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { readJson } from '../utils/jsonHelper.js';

export const getFields = asyncHandler(async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM fields ORDER BY name ASC');
    res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.warn('Database error in getFields, using fallback JSON:', error.message);
    const fields = await readJson('fields.json');
    res.json({
      success: true,
      data: fields,
    });
  }
});

export const getFieldById = asyncHandler(async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM fields WHERE id = ?', [req.params.id]);

    if (fields.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Field not found',
      });
    }

    res.json({
      success: true,
      data: fields[0],
    });
  } catch (error) {
    console.warn('Database error in getFieldById, using fallback JSON:', error.message);
    const fields = await readJson('fields.json');
    const field = fields.find((f) => f.id == req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found',
      });
    }

    res.json({
      success: true,
      data: field,
    });
  }
});

export default { getFields, getFieldById };
