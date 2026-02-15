import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import Mentor from '../models/Mentor.js';
import Field from '../models/Field.js';
import Application from '../models/Application.js';
import { pool } from '../config/database.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalScholarships,
      totalMentors,
      totalFields,
      totalApplications,
      activeScholarships,
      verifiedMentors,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Scholarship.countDocuments(),
      Mentor.countDocuments(),
      Field.countDocuments(),
      Application.countDocuments(),
      Scholarship.countDocuments({ status: 'active' }),
      Mentor.countDocuments({ status: 'verified' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalScholarships,
        totalMentors,
        totalFields,
        totalApplications,
        activeScholarships,
        verifiedMentors,
        monthlyRevenue: 0, // Placeholder - implement billing if needed
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};

// ============ USER MANAGEMENT ============

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUser = async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};

    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role && ['student', 'mentor', 'admin'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
};

// ============ SCHOLARSHIP MANAGEMENT ============

// @desc    Get all scholarships
// @route   GET /api/admin/scholarships
// @access  Admin
export const getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: scholarships,
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarships',
    });
  }
};

// @desc    Create scholarship
// @route   POST /api/admin/scholarships
// @access  Admin
export const createScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json({
      success: true,
      data: scholarship,
      message: 'Scholarship created successfully',
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create scholarship',
    });
  }
};

// @desc    Update scholarship
// @route   PUT /api/admin/scholarships/:id
// @access  Admin
export const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      data: scholarship,
      message: 'Scholarship updated successfully',
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scholarship',
    });
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/admin/scholarships/:id
// @access  Admin
export const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

    if (!scholarship) {
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
    console.error('Delete scholarship error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scholarship',
    });
  }
};

// ============ MENTOR MANAGEMENT ============

// @desc    Get all mentors
// @route   GET /api/admin/mentors
// @access  Admin
export const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: mentors,
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mentors',
    });
  }
};

// @desc    Create mentor
// @route   POST /api/admin/mentors
// @access  Admin
export const createMentor = async (req, res) => {
  try {
    const mentor = await Mentor.create(req.body);
    res.status(201).json({
      success: true,
      data: mentor,
      message: 'Mentor created successfully',
    });
  } catch (error) {
    console.error('Create mentor error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Mentor with this email already exists',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create mentor',
    });
  }
};

// @desc    Update mentor
// @route   PUT /api/admin/mentors/:id
// @access  Admin
export const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor not found',
      });
    }

    res.json({
      success: true,
      data: mentor,
      message: 'Mentor updated successfully',
    });
  } catch (error) {
    console.error('Update mentor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mentor',
    });
  }
};

// @desc    Delete mentor
// @route   DELETE /api/admin/mentors/:id
// @access  Admin
export const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor not found',
      });
    }

    res.json({
      success: true,
      message: 'Mentor deleted successfully',
    });
  } catch (error) {
    console.error('Delete mentor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mentor',
    });
  }
};

// ============ FIELD MANAGEMENT ============

// @desc    Get all fields
// @route   GET /api/admin/fields
// @access  Admin
export const getFields = async (req, res) => {
  try {
    const fields = await Field.find().sort({ name: 1 });
    res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fields',
    });
  }
};

// @desc    Create field
// @route   POST /api/admin/fields
// @access  Admin
export const createField = async (req, res) => {
  try {
    const field = await Field.create(req.body);
    res.status(201).json({
      success: true,
      data: field,
      message: 'Field created successfully',
    });
  } catch (error) {
    console.error('Create field error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Field with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create field',
    });
  }
};

// @desc    Update field
// @route   PUT /api/admin/fields/:id
// @access  Admin
export const updateField = async (req, res) => {
  try {
    const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found',
      });
    }

    res.json({
      success: true,
      data: field,
      message: 'Field updated successfully',
    });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update field',
    });
  }
};

// @desc    Delete field
// @route   DELETE /api/admin/fields/:id
// @access  Admin
export const deleteField = async (req, res) => {
  try {
    const field = await Field.findByIdAndDelete(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found',
      });
    }

    res.json({
      success: true,
      message: 'Field deleted successfully',
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete field',
    });
  }
};

// ============ APPLICATION MANAGEMENT ============

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Admin
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email')
      .populate('scholarship', 'name organization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications,
      total: applications.length,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
    });
  }
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:id
// @access  Admin
export const updateApplication = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updates = { updatedAt: Date.now() };

    if (status) {
      updates.status = status;
      updates.reviewedBy = req.user.userId;
      updates.reviewedAt = Date.now();
    }
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const application = await Application.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('scholarship', 'name organization');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: application,
      message: 'Application updated successfully',
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application',
    });
  }
};

// ============ DATA SEEDING (for demo) ============

// @desc    Seed sample data
// @route   POST /api/admin/seed
// @access  Admin
export const seedData = async (req, res) => {
  try {
    // Check if data already exists
    const scholarshipCount = await Scholarship.countDocuments();
    const mentorCount = await Mentor.countDocuments();
    const fieldCount = await Field.countDocuments();

    const results = { scholarships: 0, mentors: 0, fields: 0 };

    if (scholarshipCount === 0) {
      const scholarships = await Scholarship.insertMany([
        {
          name: 'Gates Cambridge Scholarship',
          organization: 'University of Cambridge',
          amount: 'Full Funding',
          category: 'graduate',
          deadline: new Date('2025-12-15'),
          country: 'UK',
          description:
            'Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge.',
          website: 'https://www.gatescambridge.org/',
          eligibility: 'International students (non-UK)',
          level: 'Graduate',
          field: 'All fields',
          status: 'active',
          tags: ['Full Funding', 'International', 'Graduate', 'Prestigious'],
        },
        {
          name: 'Rhodes Scholarship',
          organization: 'University of Oxford',
          amount: 'Full Funding',
          category: 'graduate',
          deadline: new Date('2025-10-06'),
          country: 'UK',
          description:
            "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
          website: 'https://www.rhodeshouse.ox.ac.uk/',
          eligibility: 'Citizens of eligible countries',
          level: 'Graduate',
          field: 'All fields',
          status: 'active',
          tags: ['Full Funding', 'International', 'Leadership', 'Oxford'],
        },
        {
          name: 'Fulbright Scholarship',
          organization: 'U.S. Department of State',
          amount: 'Full Funding',
          category: 'graduate',
          deadline: new Date('2025-10-15'),
          country: 'USA',
          description:
            'Premier international educational exchange program sponsored by the U.S. government.',
          website: 'https://www.fulbright.org/',
          eligibility: 'International students',
          level: 'Graduate',
          field: 'All fields',
          status: 'active',
          tags: ['Full Funding', 'USA', 'Exchange', 'Research'],
        },
      ]);
      results.scholarships = scholarships.length;
    }

    if (mentorCount === 0) {
      const mentors = await Mentor.insertMany([
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          title: 'AI Research Director',
          company: 'Google DeepMind',
          field: 'technology',
          experience: 'senior',
          bio: 'Leading AI researcher with 15+ years experience in machine learning and neural networks.',
          expertise: ['Machine Learning', 'PhD Applications', 'Research Methods'],
          rate: 150,
          rating: 4.9,
          mentees: 234,
          sessions: 890,
          status: 'verified',
        },
        {
          name: 'Prof. Michael Chen',
          email: 'm.chen@example.com',
          title: 'Professor of Economics',
          company: 'Stanford University',
          field: 'business',
          experience: 'expert',
          bio: 'Award-winning economist specializing in behavioral finance and market dynamics.',
          expertise: ['Economics', 'Academic Writing', 'Grant Applications'],
          rate: 200,
          rating: 4.8,
          mentees: 156,
          sessions: 520,
          status: 'verified',
        },
      ]);
      results.mentors = mentors.length;
    }

    if (fieldCount === 0) {
      const fields = await Field.insertMany([
        {
          name: 'Computer Science',
          category: 'stem',
          description: 'Study of computational systems and the design of computer systems',
          icon: '💻',
          salary: '$70K - $200K',
          careers: ['Software Engineer', 'Data Scientist', 'Product Manager', 'ML Engineer'],
        },
        {
          name: 'Business Administration',
          category: 'business',
          description: 'Study of business operations, management, and organizational strategy',
          icon: '📊',
          salary: '$60K - $180K',
          careers: ['Business Analyst', 'Consultant', 'Product Manager', 'Entrepreneur'],
        },
        {
          name: 'Medicine',
          category: 'healthcare',
          description: 'Study of health, disease, and medical care',
          icon: '🩺',
          salary: '$100K - $400K',
          careers: ['Physician', 'Surgeon', 'Researcher', 'Healthcare Administrator'],
        },
      ]);
      results.fields = fields.length;
    }

    res.json({
      success: true,
      message: 'Sample data seeded successfully',
      data: results,
    });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed data',
    });
  }
};
