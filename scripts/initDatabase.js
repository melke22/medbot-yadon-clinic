const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ChatInteraction = require('../models/ChatInteraction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing MedBot database...');

    // Check if data already exists
    const existingPatients = await Patient.countDocuments();
    if (existingPatients > 0) {
      console.log(`ℹ️  Database already has ${existingPatients} patients. Skipping initialization.`);
      console.log('\n📊 Current Database Summary:');
      console.log(`   • Patients: ${await Patient.countDocuments()}`);
      console.log(`   • Appointments: ${await Appointment.countDocuments()}`);
      console.log(`   • Chat Interactions: ${await ChatInteraction.countDocuments()}`);
      return;
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
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1978-12-03'),
        gender: 'male',
        medicalHistory: [
          {
            condition: 'Type 2 Diabetes',
            diagnosedDate: new Date('2018-08-20'),
            status: 'active'
          }
        ],
        allergies: ['Sulfa drugs'],
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            startDate: new Date('2018-08-20')
          }
        ],
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '+1-555-0302',
          relationship: 'Wife'
        }
      }
    ];

    // Insert sample patients
    const createdPatients = await Patient.insertMany(samplePatients);
    console.log(`✅ Created ${createdPatients.length} sample patients`);

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
      },
      {
        patientId: createdPatients[2]._id,
        doctorName: 'Dr. Williams',
        department: 'Endocrinology',
        appointmentDate: new Date('2024-12-17'),
        timeSlot: '09:00',
        reason: 'Diabetes management consultation',
        status: 'scheduled'
      }
    ];

    const createdAppointments = await Appointment.insertMany(sampleAppointments);
    console.log(`✅ Created ${createdAppointments.length} sample appointments`);

    // Create sample chat interactions
    const sampleInteractions = [
      {
        sessionId: 'session_demo_001',
        patientId: createdPatients[0]._id,
        userMessage: 'Hello, I need help with my medication',
        botResponse: 'Hello! I can help you with medication information. What would you like to know?',
        intent: 'medication',
        confidence: 0.95,
        category: 'medication'
      },
      {
        sessionId: 'session_demo_002',
        patientId: createdPatients[1]._id,
        userMessage: 'I want to schedule an appointment',
        botResponse: 'I can help you schedule an appointment. Which department would you like to visit?',
        intent: 'appointment',
        confidence: 0.98,
        category: 'appointment'
      },
      {
        sessionId: 'session_demo_003',
        patientId: createdPatients[2]._id,
        userMessage: 'I have been feeling dizzy lately',
        botResponse: 'I understand you\'re experiencing dizziness. Can you describe when this happens and any other symptoms?',
        intent: 'symptoms',
        confidence: 0.87,
        category: 'symptom_check'
      }
    ];

    const createdInteractions = await ChatInteraction.insertMany(sampleInteractions);
    console.log(`✅ Created ${createdInteractions.length} sample chat interactions`);

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   • Patients: ${await Patient.countDocuments()}`);
    console.log(`   • Appointments: ${await Appointment.countDocuments()}`);
    console.log(`   • Chat Interactions: ${await ChatInteraction.countDocuments()}`);
    
    console.log('\n🔗 You can now:');
    console.log('   • Access MedBot at: http://localhost:3000');
    console.log('   • View database with MongoDB Compass: mongodb://localhost:27017/medbot');
    console.log('   • Test all features including patient registration and appointments');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the initialization
initializeDatabase();