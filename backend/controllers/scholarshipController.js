import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { readJson, writeJson } from '../utils/jsonHelper.js';

/**
 * Get all scholarships with filtering and pagination
 * @route GET /api/scholarships
 */
export const getScholarships = asyncHandler(async (req, res) => {
  const { category, country, status = 'active', page = 1, limit = 20 } = req.query;

  try {
    let query = 'SELECT * FROM scholarships WHERE status = ?';
    const params = [status];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY deadline ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [scholarships] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM scholarships WHERE status = ?';
    const countParams = [status];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (country) {
      countQuery += ' AND country = ?';
      countParams.push(country);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: scholarships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.warn('Database error in getScholarships, using fallback JSON:', error.message);
    let scholarships = await readJson('scholarships.json');

    // Filter
    if (status) scholarships = scholarships.filter((s) => s.status === status);
    if (category) scholarships = scholarships.filter((s) => s.category === category);
    if (country) scholarships = scholarships.filter((s) => s.country === country);

    const total = scholarships.length;
    const start = (page - 1) * limit;
    const paginated = scholarships.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
});

/**
 * Get scholarship by ID
 * @route GET /api/scholarships/:id
 */
export const getScholarshipById = asyncHandler(async (req, res) => {
  try {
    const [scholarships] = await pool.query('SELECT * FROM scholarships WHERE id = ?', [
      req.params.id,
    ]);

    if (scholarships.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      data: scholarships[0],
    });
  } catch (error) {
    console.warn('Database error in getScholarshipById, using fallback JSON:', error.message);
    const scholarships = await readJson('scholarships.json');
    const scholarship = scholarships.find((s) => s.id == req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      data: scholarship,
    });
  }
});

/**
 * Create new scholarship (Admin only)
 * @route POST /api/scholarships
 */
export const createScholarship = asyncHandler(async (req, res) => {
  const { name, organization, amount, deadline, description, category, country, website } =
    req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO scholarships 
        (name, organization, amount, deadline, description, category, country, website, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        organization,
        amount,
        deadline,
        description,
        category,
        country || null,
        website || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.warn('Database error in createScholarship, using fallback JSON:', error.message);
    const scholarships = await readJson('scholarships.json');
    const newId = scholarships.length > 0 ? Math.max(...scholarships.map((s) => s.id)) + 1 : 1;

    const newScholarship = {
      id: newId,
      name,
      organization,
      amount,
      deadline,
      description,
      category,
      country: country || null,
      website: website || null,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    scholarships.push(newScholarship);
    await writeJson('scholarships.json', scholarships);

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully (Fallback)',
      data: {
        id: newId,
      },
    });
  }
});

/**
 * Update scholarship (Admin only)
 * @route PUT /api/scholarships/:id
 */
export const updateScholarship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Build dynamic update query
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update',
    });
  }

  try {
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    const [result] = await pool.query(`UPDATE scholarships SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      message: 'Scholarship updated successfully',
    });
  } catch (error) {
    console.warn('Database error in updateScholarship, using fallback JSON:', error.message);
    const scholarships = await readJson('scholarships.json');
    const index = scholarships.findIndex((s) => s.id == id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    scholarships[index] = { ...scholarships[index], ...updates };
    await writeJson('scholarships.json', scholarships);

    res.json({
      success: true,
      message: 'Scholarship updated successfully (Fallback)',
    });
  }
});

/**
 * Delete scholarship (Admin only)
 * @route DELETE /api/scholarships/:id
 */
export const deleteScholarship = asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM scholarships WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      message: 'Scholarship deleted successfully',
    });
  } catch (error) {
    console.warn('Database error in deleteScholarship, using fallback JSON:', error.message);
    let scholarships = await readJson('scholarships.json');
    const initialLength = scholarships.length;
    scholarships = scholarships.filter((s) => s.id != req.params.id);

    if (scholarships.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    await writeJson('scholarships.json', scholarships);

    res.json({
      success: true,
      message: 'Scholarship deleted successfully (Fallback)',
    });
  }
});

export default {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
