// Simple NLP Engine for MedBot
// In production, integrate with Dialogflow, Watson, or similar service

class NLPEngine {
  constructor() {
    this.intents = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
        responses: [
          'Hello! I\'m Yadon MedBot, your AI healthcare assistant for Dr. Nafyad Getu\'s Yadon Clinic in Addis Ababa. How can I help you today?',
          'Hi there! Welcome to Yadon Clinic, founded by Dr. Nafyad Getu. I\'m here to help with your medical questions and appointments.',
          'Welcome to Yadon MedBot! I can assist you with our comprehensive healthcare services at Dr. Nafyad Getu\'s clinic. What can I help you with?'
        ]
      },
      clinic_info: {
        patterns: ['yadon clinic', 'clinic info', 'about clinic', 'location', 'services', 'what services', 'owner', 'founder', 'doctor'],
        responses: [
          'Yadon Clinic, founded by Dr. Nafyad Getu, is a premier healthcare destination in Addis Ababa, Ethiopia. We offer comprehensive medical services including chronic illness care, STI management, men\'s health, maternal care, and minor procedures.',
          'We\'re located in the heart of Addis Ababa and provide specialized care for erectile dysfunction, premature ejaculation, ANC follow-up, circumcision, and lipoma excision. Our clinic was established by Dr. Nafyad Getu.',
          'As a sister company of Yadon Healthcare PLC, Dr. Nafyad Getu\'s clinic has been serving the community since 2024 with personalized care and innovative medical solutions.'
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
        patterns: ['emergency', 'urgent', 'chest pain', 'difficulty breathing', 'severe pain', 'bleeding', 'unconscious'],
        responses: [
          '🚨 This sounds like an emergency! Please call emergency services immediately at 911 or go to the nearest emergency room. If you\'re at Yadon Clinic, our staff will assist you immediately.',
          '🚨 For emergency situations, please seek immediate medical attention by calling 911 or visiting the nearest emergency room.'
        ]
      },
      hours: {
        patterns: ['hours', 'open', 'close', 'timing', 'schedule', 'when open'],
        responses: [
          'Yadon Clinic is open Monday to Saturday, 8:00 AM to 6:00 PM. We\'re closed on Sundays and public holidays. For urgent cases, please call +251 90 910 2009.',
          'Our clinic hours are Monday-Saturday, 8:00 AM - 6:00 PM. We offer same-day appointments for urgent cases!'
        ]
      },
      contact: {
        patterns: ['contact', 'phone', 'email', 'call', 'reach', 'number'],
        responses: [
          'You can reach Yadon Clinic at:\n📞 Phone: +251 90 910 2009\n✉️ Email: info@yadonclinic.com\n🌐 Website: www.yadonclinic.com\n📍 Location: Addis Ababa, Ethiopia',
          'Contact us anytime! Phone: +251 90 910 2009 | Email: info@yadonclinic.com. We\'re located in Addis Ababa, Ethiopia.'
        ]
      },
      cost: {
        patterns: ['cost', 'price', 'fee', 'payment', 'insurance', 'charge', 'how much'],
        responses: [
          'For consultation fees and payment information, please call us at +251 90 910 2009. We offer competitive rates and accept various payment methods.',
          'Consultation fees vary by service. Please contact us at +251 90 910 2009 or email info@yadonclinic.com for detailed pricing information.'
        ]
      },
      doctor_info: {
        patterns: ['dr nafyad', 'dr getu', 'doctors', 'specialists', 'physician', 'who is the doctor'],
        responses: [
          'Yadon Clinic was founded by Dr. Nafyad Getu, an experienced medical professional dedicated to providing excellent healthcare. We also have specialists in various fields including men\'s health, maternal care, and chronic illness management.',
          'Dr. Nafyad Getu is the founder and medical director of Yadon Clinic. Our team includes experienced specialists ready to provide you with the best care possible.'
        ]
      },
      thank_you: {
        patterns: ['thank', 'thanks', 'appreciate', 'grateful'],
        responses: [
          'You\'re very welcome! If you need anything else, I\'m here to help. Stay healthy! 😊',
          'My pleasure! Feel free to ask if you have more questions. Yadon Clinic is here for you! 🏥'
        ]
      },
      goodbye: {
        patterns: ['bye', 'goodbye', 'see you', 'later', 'exit'],
        responses: [
          'Goodbye! Take care of your health. Feel free to return anytime you need assistance. 👋',
          'See you soon! Remember, Yadon Clinic is always here for your healthcare needs. Stay healthy! 🏥'
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

    if (bestMatch.confidence > 0.3) {
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
      // Smart AI response - try to understand context
      response = this.generateSmartResponse(lowerMessage);
      category = 'ai_assisted';
      suggestions = ['Talk to Healthcare Professional', 'Schedule Appointment', 'Emergency Contact'];
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

  generateSmartResponse(message) {
    // Medical keywords
    const medicalKeywords = ['health', 'medical', 'doctor', 'treatment', 'disease', 'illness', 'sick', 'hurt', 'ache', 'condition'];
    const appointmentKeywords = ['when', 'time', 'available', 'open', 'hours', 'visit'];
    const costKeywords = ['cost', 'price', 'fee', 'payment', 'insurance', 'charge'];
    const locationKeywords = ['where', 'address', 'location', 'find', 'directions'];
    
    // Check for medical questions
    if (medicalKeywords.some(keyword => message.includes(keyword))) {
      return 'I understand you have a medical question. While I can provide general health information, for specific medical advice, I recommend speaking with one of our healthcare professionals at Yadon Clinic. Would you like to schedule an appointment with Dr. Nafyad Getu or one of our specialists?';
    }
    
    // Check for appointment-related questions
    if (appointmentKeywords.some(keyword => message.includes(keyword))) {
      return 'Yadon Clinic is open Monday to Saturday, 8:00 AM to 6:00 PM. We offer same-day appointments for urgent cases. Would you like to book an appointment now?';
    }
    
    // Check for cost/payment questions
    if (costKeywords.some(keyword => message.includes(keyword))) {
      return 'For information about consultation fees and payment options, please call us at +251 90 910 2009 or visit our clinic. We accept various payment methods and can discuss payment plans if needed.';
    }
    
    // Check for location questions
    if (locationKeywords.some(keyword => message.includes(keyword))) {
      return 'Yadon Clinic is located in Addis Ababa, Ethiopia. For exact directions, please call us at +251 90 910 2009 or email info@yadonclinic.com. We\'re easily accessible and look forward to serving you!';
    }
    
    // Check for questions (contains ?)
    if (message.includes('?')) {
      return 'That\'s a great question! While I\'m here to help, for the most accurate and personalized answer, I recommend connecting with our healthcare team directly. You can:\n\n1. Call us at +251 90 910 2009\n2. Email info@yadonclinic.com\n3. Schedule an appointment to speak with Dr. Nafyad Getu\n\nWould you like me to help you book an appointment?';
    }
    
    // Default intelligent response
    return 'Thank you for reaching out to Yadon Clinic! I\'m here to assist you with:\n\n• Booking appointments\n• General clinic information\n• Our medical services\n• Contact information\n\nFor specific medical advice or detailed questions, our healthcare professionals are ready to help. Would you like to schedule a consultation with Dr. Nafyad Getu or call us at +251 90 910 2009?';
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