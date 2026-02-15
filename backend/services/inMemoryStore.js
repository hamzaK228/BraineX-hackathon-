// In-Memory Data Store - Fallback when MongoDB is not available
// This allows the app to run and be tested without a database

class InMemoryStore {
  constructor() {
    this.users = [];
    this.scholarships = [];
    this.mentors = [];
    this.fields = [];
    this.applications = [];
    this.goals = []; // Added goals collection
    this.idCounter = 1;

    // Seed admin user
    this.users.push({
      _id: this.generateId(),
      name: 'Admin User',
      email: 'admin@brainex.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4SWr.a6jYWb0xCSm', // admin123
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed sample data
    this.seedSampleData();
  }

  generateId() {
    return `mem_${Date.now()}_${this.idCounter++}`;
  }

  seedSampleData() {
    // Sample scholarships
    this.scholarships.push(
      {
        _id: this.generateId(),
        name: 'Gates Cambridge Scholarship',
        organization: 'University of Cambridge',
        amount: 'Full Funding',
        category: 'graduate',
        deadline: new Date('2025-12-15'),
        country: 'UK',
        description: 'Prestigious scholarship for outstanding applicants from outside the UK.',
        status: 'active',
        tags: ['Full Funding', 'International'],
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Rhodes Scholarship',
        organization: 'University of Oxford',
        amount: 'Full Funding',
        category: 'graduate',
        deadline: new Date('2025-10-06'),
        country: 'UK',
        description: "The world's oldest graduate scholarship program.",
        status: 'active',
        tags: ['Full Funding', 'Leadership'],
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Fulbright Scholarship',
        organization: 'U.S. Department of State',
        amount: 'Full Funding',
        category: 'graduate',
        deadline: new Date('2025-10-15'),
        country: 'USA',
        description: 'Premier international educational exchange program.',
        status: 'active',
        tags: ['Full Funding', 'USA'],
        createdAt: new Date(),
      }
    );

    // Sample mentors
    this.mentors.push(
      {
        _id: this.generateId(),
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        title: 'AI Research Director',
        company: 'Google DeepMind',
        field: 'technology',
        experience: 'senior',
        bio: 'Leading AI researcher with 15+ years experience.',
        expertise: ['Machine Learning', 'PhD Applications'],
        rate: 150,
        rating: 4.9,
        mentees: 234,
        status: 'verified',
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Prof. Michael Chen',
        email: 'm.chen@example.com',
        title: 'Professor of Economics',
        company: 'Stanford University',
        field: 'business',
        experience: 'expert',
        bio: 'Award-winning economist.',
        expertise: ['Economics', 'Academic Writing'],
        rate: 200,
        rating: 4.8,
        mentees: 156,
        status: 'verified',
        createdAt: new Date(),
      }
    );

    // Sample fields
    this.fields.push(
      {
        _id: this.generateId(),
        name: 'Computer Science',
        category: 'stem',
        description: 'Study of computation and computer systems',
        icon: '💻',
        salary: '$70K - $200K',
        careers: ['Software Engineer', 'Data Scientist'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Business Administration',
        category: 'business',
        description: 'Study of business operations and management',
        icon: '📊',
        salary: '$60K - $180K',
        careers: ['Manager', 'Consultant'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Medicine',
        category: 'healthcare',
        description: 'Study of health and medical care',
        icon: '🩺',
        salary: '$100K - $400K',
        careers: ['Physician', 'Surgeon'],
        isActive: true,
        createdAt: new Date(),
      }
    );
  }

  // Generic CRUD operations
  findAll(collection, query = {}) {
    let data = this[collection] || [];

    // Simple query matching
    if (Object.keys(query).length > 0) {
      data = data.filter((item) => {
        return Object.entries(query).every(([key, value]) => {
          if (value === undefined) return true;
          if (value && value.$regex) {
            return new RegExp(value.$regex, value.$options || '').test(item[key]);
          }
          return item[key] === value;
        });
      });
    }

    return data;
  }

  findById(collection, id) {
    return this[collection]?.find((item) => item._id === id) || null;
  }

  findOne(collection, query) {
    return (
      this[collection]?.find((item) => {
        return Object.entries(query).every(([key, value]) => {
          if (key === '$or') {
            return value.some((orQuery) =>
              Object.entries(orQuery).every(([k, v]) => item[k] === v)
            );
          }
          return item[key] === value;
        });
      }) || null
    );
  }

  create(collection, data) {
    const newItem = {
      _id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this[collection].push(newItem);
    return newItem;
  }

  update(collection, id, data) {
    const index = this[collection]?.findIndex((item) => item._id === id);
    if (index > -1) {
      this[collection][index] = {
        ...this[collection][index],
        ...data,
        updatedAt: new Date(),
      };
      return this[collection][index];
    }
    return null;
  }

  delete(collection, id) {
    const index = this[collection]?.findIndex((item) => item._id === id);
    if (index > -1) {
      const deleted = this[collection].splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  count(collection, query = {}) {
    return this.findAll(collection, query).length;
  }
}

// Singleton instance
const store = new InMemoryStore();

module.exports = store;
