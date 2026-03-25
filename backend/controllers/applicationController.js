import Application from '../models/Application.js';
import { pool } from '../config/database.js';

export const createApplication = async (req, res) => {
    try {
        const { scholarshipId, mentorId, type, data } = req.body;
        const userId = req.user.id; // From auth middleware

        // Check for existing application
        const [existing] = await pool.query(
            'SELECT id FROM applications WHERE user_id = ? AND type = ?',
            [userId, type]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'You have already applied.' });
        }

        const [result] = await pool.query(
            'INSERT INTO applications (user_id, scholarship_id, mentor_id, type, data, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, scholarshipId || null, mentorId || null, type, JSON.stringify(data), 'pending']
        );

        return res.status(201).json({ 
            success: true, 
            data: {
                id: result.insertId,
                userId,
                scholarshipId,
                mentorId,
                type,
                data,
                status: 'pending',
                submittedAt: new Date()
            }
        });
        } else {
            // Memory Store
            const existing = memoryStore.applications.find(a =>
                (a.userId === userId || a.userId === req.user._id) &&
                a.type === type &&
                (scholarshipId ? a.scholarshipId === scholarshipId : true) &&
                (mentorId ? a.mentorId === mentorId : true)
            );

            if (existing) {
                return res.status(400).json({ success: false, error: 'You have already applied.' });
            }

            const newApp = {
                _id: Date.now().toString(),
                userId,
                scholarshipId,
                mentorId,
                type,
                data,
                status: 'pending',
                submittedAt: new Date()
            };
            memoryStore.applications.push(newApp);
            return res.status(201).json({ success: true, data: newApp });
        }
    } catch (error) {
        console.error('Create Application Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const [apps] = await pool.query(
            `SELECT a.id, a.user_id, a.scholarship_id, a.mentor_id, a.type, a.data, 
                    a.status, a.submitted_at, s.name as scholarship_name
             FROM applications a
             LEFT JOIN scholarships s ON a.scholarship_id = s.id
             WHERE a.user_id = ?
             ORDER BY a.submitted_at DESC`,
            [userId]
        );

        const formattedApps = apps.map(app => ({
            id: app.id,
            userId: app.user_id,
            scholarshipId: app.scholarship_id,
            mentorId: app.mentor_id,
            type: app.type,
            data: typeof app.data === 'string' ? JSON.parse(app.data) : app.data,
            status: app.status,
            submittedAt: app.submitted_at,
            scholarshipData: app.scholarship_name ? { name: app.scholarship_name } : null
        }));

        res.json({ success: true, count: formattedApps.length, data: formattedApps });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export default {
    createApplication,
    getUserApplications
};
