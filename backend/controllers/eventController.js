import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { readJson } from '../utils/jsonHelper.js';

export const getEvents = asyncHandler(async (req, res) => {
  const { status = 'upcoming', page = 1, limit = 20 } = req.query;

  try {
    const offset = (page - 1) * limit;

    const [events] = await pool.query(
      'SELECT * FROM events WHERE status = ? ORDER BY date ASC LIMIT ? OFFSET ?',
      [status, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.warn('Database error in getEvents, using fallback JSON:', error.message);
    let events = await readJson('events.json');

    // JSON fallback doesn't have status field, skip filtering
    // if (status) events = events.filter(e => e.status === status);

    const start = (page - 1) * limit;
    const paginated = events.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
    });
  }
});

export const getEventById = asyncHandler(async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: events[0],
    });
  } catch (error) {
    console.warn('Database error in getEventById, using fallback JSON:', error.message);
    const events = await readJson('events.json');
    const event = events.find((e) => e.id == req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  }
});

export default { getEvents, getEventById };
