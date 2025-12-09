const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateUserToken, authenticateUser } = require('../middleware/auth');

// User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, allergies, emergencyContact } = req.body;

    if (!name || !email || !password || !phone || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create patient profile first
    const patient = new Patient({
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(a => a.trim()) : []),
      emergencyContact: emergencyContact || {}
    });

    await patient.save();

    // Create user account
    const user = new User({
      email,
      password,
      patientId: patient._id
    });

    await user.save();

    // Generate token
    const token = generateUserToken(user._id);

    // Set HTTP-only cookie
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        patientId: patient._id
      },
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      },
      token
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email }).populate('patientId');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({ 
        message: 'Account is temporarily locked due to failed login attempts.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate token
    const token = generateUserToken(user._id);

    // Set HTTP-only cookie
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        patientId: user.patientId._id
      },
      patient: {
        id: user.patientId._id,
        name: user.patientId.name,
        email: user.patientId.email,
        phone: user.patientId.phone,
        dateOfBirth: user.patientId.dateOfBirth,
        gender: user.patientId.gender
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  res.clearCookie('userToken');
  res.json({ message: 'Logout successful' });
});

// Verify token and get user info
router.get('/verify', authenticateUser, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      patientId: req.patient._id
    },
    patient: {
      id: req.patient._id,
      name: req.patient.name,
      email: req.patient.email,
      phone: req.patient.phone,
      dateOfBirth: req.patient.dateOfBirth,
      gender: req.patient.gender,
      allergies: req.patient.allergies,
      emergencyContact: req.patient.emergencyContact
    }
  });
});

// Change password
router.put('/change-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;