const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ChatInteraction = require('../models/ChatInteraction');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Get all patients with populated data
router.get('/patients', authenticateAdmin, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// Get all appointments with populated patient data
router.get('/appointments', authenticateAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get all chat interactions with populated patient data
router.get('/chats', authenticateAdmin, async (req, res) => {
  try {
    const chats = await ChatInteraction.find()
      .populate('patientId', 'name email')
      .sort({ timestamp: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat interactions', error: error.message });
  }
});

// Update appointment status
router.put('/appointments/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment status updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status', error: error.message });
  }
});

// Delete patient
router.delete('/patients/:id', authenticateAdmin, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Also delete related appointments and chat interactions
    await Appointment.deleteMany({ patientId: req.params.id });
    await ChatInteraction.deleteMany({ patientId: req.params.id });
    
    res.json({ message: 'Patient and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
});

// Get patient by ID with full details
router.get('/patients/:id', authenticateAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get related appointments and chat interactions
    const appointments = await Appointment.find({ patientId: req.params.id });
    const chatInteractions = await ChatInteraction.find({ patientId: req.params.id });
    
    res.json({
      patient,
      appointments,
      chatInteractions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient details', error: error.message });
  }
});

// Update patient
router.put('/patients/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, allergies, medicalHistory, medications, emergencyContact } = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(a => a.trim()) : []),
        medicalHistory: medicalHistory || [],
        medications: medications || [],
        emergencyContact
      },
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
});

// Database backup
router.post('/backup', authenticateAdmin, async (req, res) => {
  try {
    const backupData = {
      patients: await Patient.find(),
      appointments: await Appointment.find(),
      chatInteractions: await ChatInteraction.find(),
      timestamp: new Date().toISOString()
    };
    
    const backupFileName = `medbot-backup-${Date.now()}.json`;
    const backupPath = path.join(__dirname, '..', 'backups', backupFileName);
    
    // Create backups directory if it doesn't exist
    try {
      await fs.mkdir(path.join(__dirname, '..', 'backups'), { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    res.json({ 
      message: 'Database backup created successfully',
      filename: backupFileName,
      path: backupPath
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating backup', error: error.message });
  }
});

// Clear database
router.delete('/clear', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await ChatInteraction.deleteMany({});
    
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing database', error: error.message });
  }
});

// Initialize sample data
router.post('/init-sample', authenticateAdmin, async (req, res) => {
  try {
    // Check if data already exists
    const existingPatients = await Patient.countDocuments();
    if (existingPatients > 0) {
      return res.status(400).json({ message: 'Database already contains data' });
    }

    // Create sample patients
    const samplePatients = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1985-06-15'),
        gender: 'male',
        medicalHistory: [
          {
            condition: 'Hypertension',
            diagnosedDate: new Date('2020-03-15'),
            status: 'active'
          }
        ],
        allergies: ['Penicillin', 'Shellfish'],
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: new Date('2020-03-15')
          }
        ],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        }
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1992-09-22'),
        gender: 'female',
        medicalHistory: [
          {
            condition: 'Asthma',
            diagnosedDate: new Date('2010-05-10'),
            status: 'active'
          }
        ],
        allergies: ['Dust mites', 'Pollen'],
        medications: [
          {
            name: 'Albuterol Inhaler',
            dosage: '90mcg',
            frequency: 'As needed',
            startDate: new Date('2010-05-10')
          }
        ],
        emergencyContact: {
          name: 'Robert Johnson',
          phone: '+1-555-0202',
          relationship: 'Father'
        }
      }
    ];

    const createdPatients = await Patient.insertMany(samplePatients);

    // Create sample appointments
    const sampleAppointments = [
      {
        patientId: createdPatients[0]._id,
        doctorName: 'Dr. Smith',
        department: 'Cardiology',
        appointmentDate: new Date('2024-12-15'),
        timeSlot: '10:00',
        reason: 'Routine blood pressure check',
        status: 'scheduled'
      },
      {
        patientId: createdPatients[1]._id,
        doctorName: 'Dr. Johnson',
        department: 'Pulmonology',
        appointmentDate: new Date('2024-12-16'),
        timeSlot: '14:30',
        reason: 'Asthma follow-up',
        status: 'confirmed'
      }
    ];

    await Appointment.insertMany(sampleAppointments);

    res.json({ 
      message: 'Sample data initialized successfully',
      patientsCreated: createdPatients.length,
      appointmentsCreated: sampleAppointments.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing sample data', error: error.message });
  }
});

// Export data
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const exportData = {
      patients: await Patient.find(),
      appointments: await Appointment.find().populate('patientId', 'name email'),
      chatInteractions: await ChatInteraction.find().populate('patientId', 'name email'),
      exportDate: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=medbot-export-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

// Get database statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = {
      patients: {
        total: await Patient.countDocuments(),
        byGender: await Patient.aggregate([
          { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]),
        recentRegistrations: await Patient.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      },
      appointments: {
        total: await Appointment.countDocuments(),
        byStatus: await Appointment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        byDepartment: await Appointment.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ]),
        upcoming: await Appointment.countDocuments({
          appointmentDate: { $gte: new Date() },
          status: { $in: ['scheduled', 'confirmed'] }
        })
      },
      chatInteractions: {
        total: await ChatInteraction.countDocuments(),
        byCategory: await ChatInteraction.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        byIntent: await ChatInteraction.aggregate([
          { $group: { _id: '$intent', count: { $sum: 1 } } }
        ]),
        recent: await ChatInteraction.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Import data
router.post('/import', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { data, overwrite } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'No data provided for import' });
    }
    
    if (overwrite) {
      // Clear existing data
      await Patient.deleteMany({});
      await Appointment.deleteMany({});
      await ChatInteraction.deleteMany({});
    }
    
    let importStats = {
      patients: 0,
      appointments: 0,
      chatInteractions: 0
    };
    
    // Import patients
    if (data.patients && Array.isArray(data.patients)) {
      const patients = await Patient.insertMany(data.patients);
      importStats.patients = patients.length;
    }
    
    // Import appointments
    if (data.appointments && Array.isArray(data.appointments)) {
      const appointments = await Appointment.insertMany(data.appointments);
      importStats.appointments = appointments.length;
    }
    
    // Import chat interactions
    if (data.chatInteractions && Array.isArray(data.chatInteractions)) {
      const chats = await ChatInteraction.insertMany(data.chatInteractions);
      importStats.chatInteractions = chats.length;
    }
    
    res.json({ 
      message: 'Data imported successfully',
      stats: importStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error importing data', error: error.message });
  }
});

// Optimize database
router.post('/optimize', authenticateAdmin, async (req, res) => {
  try {
    // Create indexes for better performance
    await Patient.collection.createIndex({ email: 1 });
    await Patient.collection.createIndex({ phone: 1 });
    await Patient.collection.createIndex({ createdAt: -1 });
    
    await Appointment.collection.createIndex({ patientId: 1 });
    await Appointment.collection.createIndex({ appointmentDate: 1 });
    await Appointment.collection.createIndex({ status: 1 });
    
    await ChatInteraction.collection.createIndex({ sessionId: 1 });
    await ChatInteraction.collection.createIndex({ patientId: 1 });
    await ChatInteraction.collection.createIndex({ timestamp: -1 });
    
    res.json({ message: 'Database optimized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error optimizing database', error: error.message });
  }
});

// Search functionality
router.get('/search', authenticateAdmin, async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(query, 'i');
    let results = {};
    
    if (!type || type === 'patients') {
      results.patients = await Patient.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).limit(10);
    }
    
    if (!type || type === 'appointments') {
      results.appointments = await Appointment.find({
        $or: [
          { doctorName: searchRegex },
          { department: searchRegex },
          { reason: searchRegex }
        ]
      }).populate('patientId', 'name email').limit(10);
    }
    
    if (!type || type === 'chats') {
      results.chats = await ChatInteraction.find({
        $or: [
          { userMessage: searchRegex },
          { botResponse: searchRegex },
          { intent: searchRegex }
        ]
      }).populate('patientId', 'name email').limit(10);
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
});

module.exports = router;