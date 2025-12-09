const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin account...');
    
    // Delete existing test admin if exists
    await Admin.deleteOne({ username: 'testadmin' });
    
    const testAdmin = new Admin({
      username: 'testadmin',
      email: 'test@medbot.com',
      password: 'test123',
      role: 'admin'
    });
    
    await testAdmin.save();
    
    console.log('✅ Test admin created successfully!');
    console.log('Username: testadmin');
    console.log('Password: test123');
    console.log('Email: test@medbot.com');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestAdmin();