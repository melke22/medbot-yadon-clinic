const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Database check middleware for API routes
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database not available. Please check MongoDB connection.',
      error: 'Service temporarily unavailable'
    });
  }
  next();
};

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medbot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('📝 Note: Make sure MongoDB is running on your system');
    console.log('💡 You can:');
    console.log('   1. Install and start MongoDB locally');
    console.log('   2. Use MongoDB Atlas (cloud database)');
    console.log('   3. Run: docker run -d -p 27017:27017 mongo:6.0');
    console.log('');
    console.log('🚀 Server will continue running without database for frontend testing');
  }
};

connectDB();

// Routes (with database check for data-dependent routes)
app.use('/api/auth', checkDB, require('./routes/auth'));
app.use('/api/user-auth', checkDB, require('./routes/userAuth'));
app.use('/api/patients', checkDB, require('./routes/patients'));
app.use('/api/appointments', checkDB, require('./routes/appointments'));
app.use('/api/analytics', checkDB, require('./routes/analytics'));
app.use('/api/admin', checkDB, require('./routes/admin'));

// Chatbot route (works without database for basic responses)
app.use('/api/chatbot', require('./routes/chatbot'));

// Initialize services (only if database is available)
setTimeout(() => {
  if (mongoose.connection.readyState === 1) {
    require('./services/medicationReminder');
    console.log('✅ Medication reminder service initialized');
  } else {
    console.log('⚠️  Medication reminder service disabled (database unavailable)');
  }
}, 2000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend (accessible to everyone)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve user login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve admin login page
app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve admin dashboard (protected)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`MedBot server running on port ${PORT}`);
});

module.exports = app;