// Simple NLP Engine for MedBot
// In production, integrate with Dialogflow, Watson, or similar service

class NLPEngine {
  constructor() {
    this.intents = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
        responses: [
          'Hello! I\'m Yadon MedBot, your AI healthcare assistant for Yadon Clinic in Addis Ababa. How can I help you today?',
          'Hi there! Welcome to Yadon Clinic. I\'m here to help with your medical questions and appointments.',
          'Welcome to Yadon MedBot! I can assist you with our comprehensive healthcare services. What can I help you with?'
        ]
      },
      clinic_info: {
        patterns: ['yadon clinic', 'clinic info', 'about clinic', 'location', 'services', 'what services'],
        responses: [
          'Yadon Clinic is a premier healthcare destination in Addis Ababa, Ethiopia. We offer comprehensive medical services including chronic illness care, STI management, men\'s health, maternal care, and minor procedures.',
          'We\'re located in the heart of Addis Ababa and provide specialized care for erectile dysfunction, premature ejaculation, ANC follow-up, circumcision, and lipoma excision.',
          'As a sister company of Yadon Healthcare PLC, we\'ve been serving the community since 2024 with personalized care and innovative medical solutions.'
        ]
      },
      appointment: {
        patterns: ['appointment', 'schedule', 'book', 'doctor visit', 'consultation'],
        responses: [
          'I can help you schedule an appointment. Which department would you like to visit?',
          'Let me help you book an appointment. What type of consultation do you need?'
        ]
      },
      symptoms: {
        patterns: ['symptoms', 'pain', 'fever', 'headache', 'cough', 'feeling sick'],
        responses: [
          'I understand you\'re experiencing symptoms. Can you describe them in detail?',
          'Let me help you with your symptoms. Please tell me more about what you\'re feeling.'
        ]
      },
      medication: {
        patterns: ['medication', 'medicine', 'pills', 'prescription', 'drug'],
        responses: [
          'I can help with medication information. What would you like to know?',
          'For medication queries, I can provide general information. What specific medication are you asking about?'
        ]
      },
      emergency: {
        patterns: ['emergency', 'urgent', 'chest pain', 'difficulty breathing', 'severe pain'],
        responses: [
          'This sounds urgent. Please call emergency services immediately at 911 or go to the nearest emergency room.',
          'For emergency situations, please seek immediate medical attention by calling 911.'
        ]
      }
    };

    this.symptomDatabase = {
      'fever': {
        conditions: ['Common Cold', 'Flu', 'Infection'],
        recommendations: ['Rest', 'Stay hydrated', 'Monitor temperature'],
        urgency: 'low'
      },
      'chest pain': {
        conditions: ['Heart Attack', 'Angina', 'Muscle Strain'],
        recommendations: ['Seek immediate medical attention'],
        urgency: 'high'
      },
      'headache': {
        conditions: ['Tension Headache', 'Migraine', 'Dehydration'],
        recommendations: ['Rest in dark room', 'Stay hydrated', 'Over-the-counter pain relief'],
        urgency: 'low'
      },
      'cough': {
        conditions: ['Common Cold', 'Bronchitis', 'Allergies'],
        recommendations: ['Stay hydrated', 'Honey for throat', 'Avoid irritants'],
        urgency: 'low'
      }
    };
  }

  async processMessage(message) {
    const lowerMessage = message.toLowerCase();
    let bestMatch = { intent: 'unknown', confidence: 0 };

    // Find best matching intent
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (lowerMessage.includes(pattern)) {
          const confidence = this.calculateConfidence(lowerMessage, pattern);
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent: intentName, confidence };
          }
        }
      }
    }

    // Generate response
    let response;
    let category = 'general';
    let suggestions = [];

    if (bestMatch.confidence > 0.5) {
      const intentData = this.intents[bestMatch.intent];
      response = intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
      category = bestMatch.intent;

      // Add suggestions based on intent
      if (bestMatch.intent === 'appointment') {
        suggestions = ['Schedule Appointment', 'View My Appointments', 'Cancel Appointment'];
      } else if (bestMatch.intent === 'symptoms') {
        suggestions = ['Symptom Checker', 'Find a Doctor', 'Emergency Contacts'];
      }
    } else {
      response = 'I\'m not sure I understand. Could you please rephrase your question? I can help with appointments, medical questions, and symptom checking.';
      suggestions = ['Schedule Appointment', 'Ask Medical Question', 'Symptom Checker'];
    }

    return {
      response,
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      category,
      suggestions
    };
  }

  async analyzeSymptoms(symptoms) {
    const symptomList = symptoms.toLowerCase().split(/[,\s]+/);
    let possibleConditions = new Set();
    let recommendations = new Set();
    let maxUrgency = 'low';

    for (const symptom of symptomList) {
      for (const [key, data] of Object.entries(this.symptomDatabase)) {
        if (symptom.includes(key) || key.includes(symptom)) {
          data.conditions.forEach(condition => possibleConditions.add(condition));
          data.recommendations.forEach(rec => recommendations.add(rec));
          
          if (data.urgency === 'high') maxUrgency = 'high';
          else if (data.urgency === 'medium' && maxUrgency === 'low') maxUrgency = 'medium';
        }
      }
    }

    return {
      conditions: Array.from(possibleConditions),
      recommendations: Array.from(recommendations),
      urgencyLevel: maxUrgency
    };
  }

  calculateConfidence(message, pattern) {
    const words = message.split(' ');
    const patternWords = pattern.split(' ');
    let matches = 0;

    for (const word of patternWords) {
      if (words.includes(word)) {
        matches++;
      }
    }

    return matches / patternWords.length;
  }
}

module.exports = new NLPEngine();