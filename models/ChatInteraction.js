const mongoose = require('mongoose');

const chatInteractionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  userMessage: {
    type: String,
    required: true
  },
  botResponse: {
    type: String,
    required: true
  },
  intent: String,
  confidence: Number,
  category: {
    type: String,
    enum: ['appointment', 'medical_query', 'symptom_check', 'medication', 'general'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatInteraction', chatInteractionSchema);