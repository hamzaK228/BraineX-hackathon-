import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { readJson } from '../utils/jsonHelper.js';

/**
 * Get all mentors with filtering
 * @route GET /api/mentors
 */
export const getMentors = asyncHandler(async (req, res) => {
  const { field, status = 'verified', page = 1, limit = 20 } = req.query;

  try {
    let query = `
    SELECT m.*, u.first_name, u.last_name, u.email, u.avatar_url 
    FROM mentors m
    JOIN users u ON m.user_id = u.id
    WHERE m.status = ?
  `;
    const params = [status];

    if (field) {
      query += ' AND m.field = ?';
      params.push(field);
    }

    const offset = (page - 1) * limit;
    query += ' ORDER BY m.rating DESC, m.mentees DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [mentors] = await pool.query(query, params);

    // Format response
    const formattedMentors = mentors.map((m) => ({
      id: m.id,
      name: `${m.first_name} ${m.last_name}`,
      title: m.title,
      company: m.company,
      field: m.field,
      experience: m.experience,
      bio: m.bio,
      mentees: m.mentees,
      rating: parseFloat(m.rating),
      avatarUrl: m.avatar_url,
    }));

    res.json({
      success: true,
      data: formattedMentors,
    });
  } catch (error) {
    console.warn('Database error in getMentors, using fallback JSON:', error.message);
    let mentors = await readJson('mentors.json');

    // Filter
    if (field) mentors = mentors.filter((m) => m.field === field);
    if (status) mentors = mentors.filter((m) => m.status === status);

    const start = (page - 1) * limit;
    const paginated = mentors.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginated, // mentors.json already has formatted structure
    });
  }
});

/**
 * Get mentor profile
 * @route GET /api/mentors/:id
 */
export const getMentorById = asyncHandler(async (req, res) => {
  try {
    const [mentors] = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.email 
     FROM mentors m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
      [req.params.id]
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mentor not found',
      });
    }

    const mentor = mentors[0];

    res.json({
      success: true,
      data: {
        id: mentor.id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        email: mentor.email,
        title: mentor.title,
        company: mentor.company,
        field: mentor.field,
        experience: mentor.experience,
        bio: mentor.bio,
        mentees: mentor.mentees,
        rating: parseFloat(mentor.rating),
        hourlyRate: mentor.hourly_rate,
        availability: mentor.availability,
      },
    });
  } catch (error) {
    console.warn('Database error in getMentorById, using fallback JSON:', error.message);
    const mentors = await readJson('mentors.json');
    const mentor = mentors.find((m) => m.id == req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor not found',
      });
    }

    res.json({
      success: true,
      data: mentor,
    });
  }
});

export default {
  getMentors,
  getMentorById,
};
