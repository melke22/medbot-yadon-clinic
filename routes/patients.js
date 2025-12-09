const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authenticateUser } = require('../middleware/auth');

// Register new patient
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, medicalHistory, allergies, emergencyContact } = req.body;
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already registered with this email' });
    }

    const patient = new Patient({
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      emergencyContact
    });

    await patient.save();
    res.status(201).json({ message: 'Patient registered successfully', patientId: patient._id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering patient', error: error.message });
  }
});

// Get patient profile
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
});

// Update patient profile
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
});

module.exports = router;