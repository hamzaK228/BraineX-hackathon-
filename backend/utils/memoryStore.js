const fs = require('fs');
const path = require('path');

class MemoryStore {
  constructor() {
    this.users = [];
    this.scholarships = [];
    this.mentors = [];
    this.fields = [];
    this.events = [];
    this.applications = [];
  }

  loadSampleData() {
    // Sample Users
    this.users = [
      {
        _id: '1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@mentorax.com',
        password: '$2b$10$samplehash', // mocked hash
        role: 'student',
        isVerified: true,
      },
      {
        _id: 'admin_1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mentorax.com',
        password: '$2b$10$samplehash',
        role: 'admin',
        isVerified: true,
      },
    ];

    // Sample Scholarships
    this.scholarships = [
      {
        _id: '101',
        name: 'Global Tech Future Scholarship',
        amount: '$10,000',
        deadline: new Date('2025-12-31'),
        category: 'stem',
        description: 'Full tuition support for students pursuing careers in AI and Robotics.',
        organization: 'TechFuture Foundation',
        country: 'Global',
        educationLevel: 'Undergraduate',
        field: 'Computer Science',
        tags: ['AI', 'Robotics', 'Technology'],
      },
      {
        _id: '102',
        name: 'Women in Business Grant',
        amount: '$5,000',
        deadline: new Date('2025-06-30'),
        category: 'business',
        description: 'Grant for female students demonstrating leadership in business.',
        organization: 'Future Leaders Org',
        country: 'USA',
        educationLevel: 'Graduate',
        field: 'Business Administration',
        tags: ['Leadership', 'Women', 'MBA'],
      },
    ];

    // Sample Mentors
    this.mentors = [
      {
        _id: '201',
        name: 'Dr. Sarah Johnson',
        title: 'AI Research Director',
        company: 'Google DeepMind',
        field: 'technology',
        experience: 'senior',
        rating: 4.9,
        mentees: 234,
        sessions: 890,
        status: 'verified',
        rate: 150,
        bio: 'Leading AI researcher...',
        expertise: ['Machine Learning', 'AI'],
      },
      {
        _id: '202',
        name: 'Michael Chen',
        title: 'Investment Banker',
        company: 'Goldman Sachs',
        field: 'business',
        experience: 'senior',
        rating: 4.8,
        mentees: 150,
        sessions: 400,
        status: 'verified',
        rate: 120,
        bio: 'Expert in finance...',
        expertise: ['Finance', 'Banking'],
      },
    ];

    // Sample Fields
    this.fields = [
      {
        _id: '301',
        name: 'Computer Science',
        category: 'stem',
        description: 'Study of computers and computational systems.',
        icon: '💻',
        salary: '$70k - $200k',
        growthRate: '22%',
        careers: ['Software Engineer', 'Data Scientist'],
      },
      {
        _id: '302',
        name: 'Psychology',
        category: 'social',
        description: 'Study of mind and behavior.',
        icon: '🧠',
        salary: '$50k - $120k',
        growthRate: '5%',
        careers: ['Psychologist', 'Counselor'],
      },
    ];

    // Sample Events (NEW)
    this.events = [
      {
        _id: '401',
        title: 'Future of AI Webinar',
        date: new Date(Date.now() + 86400000 * 7), // Next week
        type: 'Webinar',
        location: 'Online',
        description: 'Join top experts to discuss the future of Artificial Intelligence.',
        speakers: ['Dr. Sarah Johnson'],
        status: 'upcoming',
        image: 'assets/images/events/ai-webinar.jpg',
      },
      {
        _id: '402',
        title: 'Career Fair 2025',
        date: new Date(Date.now() + 86400000 * 30), // Next month
        type: 'Conference',
        location: 'Virtual',
        description: 'Connect with top employers from around the globe.',
        speakers: [],
        status: 'upcoming',
        image: 'assets/images/events/career-fair.jpg',
      },
    ];

    // Sample Applications (NEW)
    this.applications = [];

    console.log('MemoryStore: Sample data loaded.');
  }
}

const store = new MemoryStore();
module.exports = store;
