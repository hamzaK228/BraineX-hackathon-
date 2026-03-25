// Admin User Seeder Script
// Run this script to create an admin user: node scripts/seed-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brainex';

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, default: 'student' },
    isEmailVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@brainex.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Email: admin@brainex.com`);
      console.log(`   Role: ${existingAdmin.role}`);

      // If not admin role, update it
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const admin = new User({
        name: 'Admin User',
        email: 'admin@brainex.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@brainex.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();
