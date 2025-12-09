const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAdmins() {
  try {
    console.log('🔍 Checking admin accounts...');
    
    const admins = await Admin.find();
    console.log(`Found ${admins.length} admin accounts:`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Created: ${admin.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    if (admins.length === 0) {
      console.log('ℹ️  No admin accounts found. You can create one using the init-admin endpoint.');
    }
    
  } catch (error) {
    console.error('❌ Error checking admins:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAdmins();