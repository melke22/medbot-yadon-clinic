const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticateUser } = require('../middleware/auth');

// Schedule new appointment
router.post('/schedule', authenticateUser, async (req, res) => {
  try {
    const { patientId, doctorName, department, appointmentDate, timeSlot, reason } = req.body;
    
    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorName,
      appointmentDate,
      timeSlot,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const appointment = new Appointment({
      patientId,
      doctorName,
      department,
      appointmentDate,
      timeSlot,
      reason
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling appointment', error: error.message });
  }
});

// Get patient appointments
router.get('/patient/:patientId', authenticateUser, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get available time slots
router.get('/available-slots/:date/:doctor', async (req, res) => {
  try {
    const { date, doctor } = req.params;
    const bookedSlots = await Appointment.find({
      doctorName: doctor,
      appointmentDate: new Date(date),
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('timeSlot');

    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const bookedTimes = bookedSlots.map(slot => slot.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
});

module.exports = router;