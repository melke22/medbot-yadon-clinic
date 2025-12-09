const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Patient = require('../models/Patient');

class MedicationReminderService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.initializeScheduler();
  }

  initializeScheduler() {
    // Check for medication reminders every hour
    cron.schedule('0 * * * *', () => {
      this.checkMedicationReminders();
    });

    console.log('Medication reminder scheduler initialized');
  }

  async checkMedicationReminders() {
    try {
      const patients = await Patient.find({
        'medications.0': { $exists: true }
      });

      const currentHour = new Date().getHours();

      for (const patient of patients) {
        for (const medication of patient.medications) {
          if (this.shouldSendReminder(medication, currentHour)) {
            await this.sendMedicationReminder(patient, medication);
          }
        }
      }
    } catch (error) {
      console.error('Error checking medication reminders:', error);
    }
  }

  shouldSendReminder(medication, currentHour) {
    const frequency = medication.frequency.toLowerCase();
    
    // Simple frequency checking logic
    if (frequency.includes('daily') || frequency.includes('once a day')) {
      return currentHour === 9; // 9 AM reminder
    } else if (frequency.includes('twice') || frequency.includes('2 times')) {
      return currentHour === 9 || currentHour === 21; // 9 AM and 9 PM
    } else if (frequency.includes('three times') || frequency.includes('3 times')) {
      return currentHour === 8 || currentHour === 14 || currentHour === 20; // 8 AM, 2 PM, 8 PM
    }

    return false;
  }

  async sendMedicationReminder(patient, medication) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: 'Medication Reminder - MedBot',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Medication Reminder</h2>
            <p>Hello ${patient.name},</p>
            <p>This is a friendly reminder to take your medication:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin: 0; color: #2c3e50;">${medication.name}</h3>
              <p style="margin: 5px 0;"><strong>Dosage:</strong> ${medication.dosage}</p>
              <p style="margin: 5px 0;"><strong>Frequency:</strong> ${medication.frequency}</p>
            </div>
            <p>Please take your medication as prescribed by your healthcare provider.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated reminder from MedBot. If you have any questions about your medication, 
              please consult with your healthcare provider.
            </p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Medication reminder sent to ${patient.email} for ${medication.name}`);
    } catch (error) {
      console.error('Error sending medication reminder:', error);
    }
  }

  // Method to add medication reminder for a patient
  async addMedicationReminder(patientId, medicationData) {
    try {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      patient.medications.push(medicationData);
      await patient.save();

      return { success: true, message: 'Medication reminder added successfully' };
    } catch (error) {
      console.error('Error adding medication reminder:', error);
      return { success: false, message: error.message };
    }
  }

  // Method to remove medication reminder
  async removeMedicationReminder(patientId, medicationId) {
    try {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      patient.medications.id(medicationId).remove();
      await patient.save();

      return { success: true, message: 'Medication reminder removed successfully' };
    } catch (error) {
      console.error('Error removing medication reminder:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new MedicationReminderService();