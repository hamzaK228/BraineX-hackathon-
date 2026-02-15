// In-memory database (replace with real database in production)
let fields = [
  {
    id: 1,
    name: 'Computer Science',
    category: 'stem',
    description: 'Study of computational systems and the design of computer systems',
    icon: '💻',
    salary: '$70K - $200K',
    careers: ['Software Engineer', 'Data Scientist', 'Product Manager'],
    createdAt: new Date().toISOString(),
  },
];

class FieldService {
  getFields(filters = {}) {
    let results = fields;

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      results = results.filter((f) => f.category === filters.category);
    }

    if (filters.search) {
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          f.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  getFieldById(id) {
    const field = fields.find((f) => f.id === id);

    if (field) {
      return {
        success: true,
        data: field,
      };
    } else {
      return {
        success: false,
        error: 'Field not found',
      };
    }
  }
}

module.exports = new FieldService();
