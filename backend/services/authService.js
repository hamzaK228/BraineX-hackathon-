// In-memory database (replace with real database in production)
let users = [];

class AuthService {
  async registerUser(userData) {
    // Check if user exists
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists with this email',
      };
    }

    // Create new user
    const user = {
      id: Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      field: userData.field,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    users.push(user);

    return {
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        field: user.field,
      },
      message: 'User registered successfully',
    };
  }

  async loginUser(credentials) {
    // Find user (in production, verify password hash)
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    return {
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        field: user.field,
      },
      token: 'user-token-demo', // Use JWT in production
      message: 'Login successful',
    };
  }

  getLatestUser() {
    if (users.length === 0) return null;
    return users[users.length - 1];
  }
}

module.exports = new AuthService();
