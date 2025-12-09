const ChatInteraction = require('../models/ChatInteraction');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

class AnalyticsService {
  // Get chat interaction statistics
  async getChatAnalytics(startDate, endDate) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const pipeline = [
        {
          $match: {
            timestamp: dateFilter
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              category: "$category"
            },
            count: { $sum: 1 },
            avgConfidence: { $avg: "$confidence" }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            categories: {
              $push: {
                category: "$_id.category",
                count: "$count",
                avgConfidence: "$avgConfidence"
              }
            },
            totalInteractions: { $sum: "$count" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ];

      const results = await ChatInteraction.aggregate(pipeline);
      
      return {
        dailyStats: results,
        summary: await this.getChatSummary(dateFilter)
      };
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      throw error;
    }
  }

  async getChatSummary(dateFilter) {
    const totalInteractions = await ChatInteraction.countDocuments({
      timestamp: dateFilter
    });

    const categoryStats = await ChatInteraction.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$confidence" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const topIntents = await ChatInteraction.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: "$intent",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalInteractions,
      categoryStats,
      topIntents
    };
  }

  // Get appointment statistics
  async getAppointmentAnalytics(startDate, endDate) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const appointmentStats = await Appointment.aggregate([
        {
          $match: {
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status",
              department: "$department"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            statusBreakdown: {
              $push: {
                status: "$_id.status",
                department: "$_id.department",
                count: "$count"
              }
            },
            totalAppointments: { $sum: "$count" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const departmentStats = await Appointment.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            scheduled: {
              $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] }
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } }
      ]);

      return {
        dailyStats: appointmentStats,
        departmentStats,
        summary: await this.getAppointmentSummary(dateFilter)
      };
    } catch (error) {
      console.error('Error getting appointment analytics:', error);
      throw error;
    }
  }

  async getAppointmentSummary(dateFilter) {
    const totalAppointments = await Appointment.countDocuments({
      createdAt: dateFilter
    });

    const statusCounts = await Appointment.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const popularDoctors = await Appointment.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: "$doctorName",
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalAppointments,
      statusCounts,
      popularDoctors
    };
  }

  // Get patient registration analytics
  async getPatientAnalytics(startDate, endDate) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const registrationStats = await Patient.aggregate([
        {
          $match: {
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              gender: "$gender"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            genderBreakdown: {
              $push: {
                gender: "$_id.gender",
                count: "$count"
              }
            },
            totalRegistrations: { $sum: "$count" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const ageGroups = await Patient.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), "$dateOfBirth"] },
                  365.25 * 24 * 60 * 60 * 1000
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ["$age", 18] }, then: "Under 18" },
                  { case: { $lt: ["$age", 30] }, then: "18-29" },
                  { case: { $lt: ["$age", 50] }, then: "30-49" },
                  { case: { $lt: ["$age", 65] }, then: "50-64" }
                ],
                default: "65+"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        dailyRegistrations: registrationStats,
        ageGroups,
        summary: await this.getPatientSummary(dateFilter)
      };
    } catch (error) {
      console.error('Error getting patient analytics:', error);
      throw error;
    }
  }

  async getPatientSummary(dateFilter) {
    const totalPatients = await Patient.countDocuments({
      createdAt: dateFilter
    });

    const genderDistribution = await Patient.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);

    const commonAllergies = await Patient.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$allergies" },
      {
        $group: {
          _id: "$allergies",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalPatients,
      genderDistribution,
      commonAllergies
    };
  }

  // Get comprehensive dashboard data
  async getDashboardData(startDate, endDate) {
    try {
      const [chatAnalytics, appointmentAnalytics, patientAnalytics] = await Promise.all([
        this.getChatAnalytics(startDate, endDate),
        this.getAppointmentAnalytics(startDate, endDate),
        this.getPatientAnalytics(startDate, endDate)
      ]);

      return {
        chat: chatAnalytics,
        appointments: appointmentAnalytics,
        patients: patientAnalytics,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();