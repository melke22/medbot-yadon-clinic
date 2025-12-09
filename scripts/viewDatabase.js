const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ChatInteraction = require('../models/ChatInteraction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function viewDatabase() {
  try {
    console.log('📊 MedBot Database Overview\n');

    // Show patients
    const patients = await Patient.find().limit(5);
    console.log('👥 PATIENTS:');
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name} (${patient.email})`);
      console.log(`   📞 ${patient.phone} | 🎂 ${patient.dateOfBirth.toDateString()}`);
      console.log(`   💊 Medications: ${patient.medications.length}`);
      console.log(`   🚨 Allergies: ${patient.allergies.join(', ') || 'None'}`);
      console.log('');
    });

    // Show appointments
    const appointments = await Appointment.find().populate('patientId', 'name').limit(5);
    console.log('📅 APPOINTMENTS:');
    appointments.forEach((appointment, index) => {
      console.log(`${index + 1}. ${appointment.patientId?.name || 'Unknown'} → ${appointment.doctorName}`);
      console.log(`   🏥 ${appointment.department} | 📅 ${appointment.appointmentDate.toDateString()}`);
      console.log(`   ⏰ ${appointment.timeSlot} | 📝 ${appointment.reason}`);
      console.log(`   📊 Status: ${appointment.status.toUpperCase()}`);
      console.log('');
    });

    // Show recent chat interactions
    const interactions = await ChatInteraction.find()
      .populate('patientId', 'name')
      .sort({ timestamp: -1 })
      .limit(5);
    
    console.log('💬 RECENT CHAT INTERACTIONS:');
    interactions.forEach((interaction, index) => {
      console.log(`${index + 1}. ${interaction.patientId?.name || 'Anonymous'} (${interaction.sessionId})`);
      console.log(`   👤 User: "${interaction.userMessage}"`);
      console.log(`   🤖 Bot: "${interaction.botResponse}"`);
      console.log(`   🎯 Intent: ${interaction.intent} (${Math.round(interaction.confidence * 100)}% confidence)`);
      console.log(`   📅 ${interaction.timestamp.toLocaleString()}`);
      console.log('');
    });

    // Show statistics
    console.log('📈 STATISTICS:');
    console.log(`   • Total Patients: ${await Patient.countDocuments()}`);
    console.log(`   • Total Appointments: ${await Appointment.countDocuments()}`);
    console.log(`   • Total Chat Interactions: ${await ChatInteraction.countDocuments()}`);
    
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Appointments by Status:');
    appointmentsByStatus.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count}`);
    });

    const interactionsByCategory = await ChatInteraction.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n💬 Chat Interactions by Category:');
    interactionsByCategory.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the viewer
viewDatabase();