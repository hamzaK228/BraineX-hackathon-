// In-memory database (replace with real database in production)
let mentors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
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
    createdAt: new Date().toISOString(),
  },
];

class MentorService {
  getMentors(filters = {}) {
    let results = mentors.filter((m) => m.status === 'verified');

    // Apply filters
    if (filters.field && filters.field !== 'all') {
      results = results.filter((m) => m.field === filters.field);
    }

    if (filters.experience && filters.experience !== 'all') {
      results = results.filter((m) => m.experience === filters.experience);
    }

    if (filters.search) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          m.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          m.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  getMentorById(id) {
    const mentor = mentors.find((m) => m.id === id && m.status === 'verified');

    if (mentor) {
      return {
        success: true,
        data: mentor,
      };
    } else {
      return {
        success: false,
        error: 'Mentor not found',
      };
    }
  }
}

module.exports = new MentorService();
