const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics');

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getDashboardData(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Get chat analytics
router.get('/chat', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getChatAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat analytics', error: error.message });
  }
});

// Get appointment analytics
router.get('/appointments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getAppointmentAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment analytics', error: error.message });
  }
});

// Get patient analytics
router.get('/patients', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getPatientAnalytics(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient analytics', error: error.message });
  }
});

module.exports = router;