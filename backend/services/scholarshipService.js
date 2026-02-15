// In-memory database (replace with real database in production)
let scholarships = [
  {
    id: 1,
    name: 'Gates Cambridge Scholarship',
    organization: 'University of Cambridge',
    amount: 'Full Funding',
    category: 'graduate',
    deadline: '2024-12-15',
    country: 'UK',
    description:
      'Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge. Covers full cost of studying plus living expenses.',
    website: 'https://www.gatescambridge.org/',
    eligibility: 'International students (non-UK)',
    level: 'Graduate',
    field: 'All fields',
    status: 'active',
    tags: ['Full Funding', 'International', 'Graduate', 'Prestigious'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Rhodes Scholarship',
    organization: 'University of Oxford',
    amount: 'Full Funding',
    category: 'graduate',
    deadline: '2024-10-06',
    country: 'UK',
    description:
      "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
    website: 'https://www.rhodeshouse.ox.ac.uk/',
    eligibility: 'Citizens of eligible countries',
    level: 'Graduate',
    field: 'All fields',
    status: 'active',
    tags: ['Full Funding', 'International', 'Leadership', 'Oxford'],
    createdAt: new Date().toISOString(),
  },
];

class ScholarshipService {
  getScholarships(filters = {}) {
    let results = scholarships.filter((s) => s.status === 'active');

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      results = results.filter((s) => s.category === filters.category);
    }

    if (filters.field && filters.field !== 'all') {
      results = results.filter((s) => s.field.toLowerCase().includes(filters.field.toLowerCase()));
    }

    if (filters.country && filters.country !== 'all') {
      results = results.filter((s) => s.country.toLowerCase() === filters.country.toLowerCase());
    }

    if (filters.search) {
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.organization.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  getScholarshipById(id) {
    const scholarship = scholarships.find((s) => s.id === id && s.status === 'active');

    if (scholarship) {
      return {
        success: true,
        data: scholarship,
      };
    } else {
      return {
        success: false,
        error: 'Scholarship not found',
      };
    }
  }
}

module.exports = new ScholarshipService();
