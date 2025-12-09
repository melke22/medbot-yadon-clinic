const request = require('supertest');
const app = require('../server');

describe('MedBot API Tests', () => {
  
  // Test health endpoint
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  // Test chatbot endpoint
  describe('POST /api/chatbot/message', () => {
    it('should process a simple greeting', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          message: 'Hello',
          sessionId: 'test_session_123'
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('response');
      expect(res.body).toHaveProperty('intent');
      expect(res.body).toHaveProperty('confidence');
    });

    it('should handle appointment requests', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({
          message: 'I want to schedule an appointment',
          sessionId: 'test_session_123'
        })
        .expect(200);
      
      expect(res.body.intent).toBe('appointment');
      expect(res.body.confidence).toBeGreaterThan(0.5);
    });
  });

  // Test patient registration
  describe('POST /api/patients/register', () => {
    it('should register a new patient', async () => {
      const patientData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '123-456-7890',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '123-456-7891',
          relationship: 'spouse'
        }
      };

      const res = await request(app)
        .post('/api/patients/register')
        .send(patientData)
        .expect(201);
      
      expect(res.body).toHaveProperty('message', 'Patient registered successfully');
      expect(res.body).toHaveProperty('patientId');
    });

    it('should not register duplicate email', async () => {
      const patientData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '123-456-7890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      // First registration should succeed
      await request(app)
        .post('/api/patients/register')
        .send(patientData)
        .expect(201);

      // Second registration with same email should fail
      await request(app)
        .post('/api/patients/register')
        .send(patientData)
        .expect(400);
    });
  });

  // Test symptom checker
  describe('POST /api/chatbot/symptom-check', () => {
    it('should analyze symptoms', async () => {
      const res = await request(app)
        .post('/api/chatbot/symptom-check')
        .send({
          symptoms: 'fever, headache, cough'
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('possibleConditions');
      expect(res.body).toHaveProperty('recommendations');
      expect(res.body).toHaveProperty('urgencyLevel');
      expect(res.body).toHaveProperty('disclaimer');
    });
  });

});

// Setup and teardown
beforeAll(async () => {
  // Setup test database connection if needed
});

afterAll(async () => {
  // Clean up test data if needed
});