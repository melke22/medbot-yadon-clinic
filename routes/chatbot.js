const express = require('express');
const router = express.Router();
const ChatInteraction = require('../models/ChatInteraction');
const nlpEngine = require('../services/nlpEngine');

// Process chatbot message
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, patientId } = req.body;
    
    // Process message through NLP engine
    const nlpResponse = await nlpEngine.processMessage(message);
    
    // Save interaction to database (if available)
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const interaction = new ChatInteraction({
          sessionId,
          patientId,
          userMessage: message,
          botResponse: nlpResponse.response,
          intent: nlpResponse.intent,
          confidence: nlpResponse.confidence,
          category: nlpResponse.category
        });
        
        await interaction.save();
        console.log('✅ Chat interaction saved to database');
      } else {
        console.log('⚠️ Database not connected, chat interaction not saved');
      }
    } catch (dbError) {
      console.log('❌ Error saving chat interaction:', dbError.message);
    }
    
    res.json({
      response: nlpResponse.response,
      intent: nlpResponse.intent,
      confidence: nlpResponse.confidence,
      suggestions: nlpResponse.suggestions || []
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing message', 
      error: error.message,
      response: 'I apologize, but I encountered an error. Please try again or contact support.'
    });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const interactions = await ChatInteraction.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: 1 });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

// Symptom checker endpoint
router.post('/symptom-check', async (req, res) => {
  try {
    const { symptoms, patientId } = req.body;
    
    // Process symptoms through NLP engine
    const analysis = await nlpEngine.analyzeSymptoms(symptoms);
    
    res.json({
      possibleConditions: analysis.conditions,
      recommendations: analysis.recommendations,
      urgencyLevel: analysis.urgencyLevel,
      disclaimer: 'This is not a medical diagnosis. Please consult with a healthcare professional for proper medical advice.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing symptoms', error: error.message });
  }
});

module.exports = router;