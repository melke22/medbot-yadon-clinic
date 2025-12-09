# MedBot - Healthcare Chatbot System

MedBot is a conversational AI system designed to assist patients and healthcare professionals with 24/7 support, appointment scheduling, and medical queries.

## Features

- **Patient Registration**: Secure patient profile management
- **Appointment Scheduling**: Book appointments with available doctors
- **Medical Queries**: AI-powered responses to health questions
- **Symptom Checker**: Analyze symptoms and provide recommendations
- **Medication Reminders**: Set and manage medication schedules
- **Health Education**: Access to medical information and wellness tips
- **Analytics Dashboard**: Insights on patient interactions

## Technology Stack

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database for patient data and interactions
- **Mongoose**: MongoDB object modeling

### Frontend
- **HTML5**: Structure and markup
- **CSS3**: Styling and responsive design
- **JavaScript**: Interactive functionality
- **Font Awesome**: Icons and UI elements

### AI/NLP
- **Custom NLP Engine**: Basic natural language processing
- **Extensible**: Ready for integration with Dialogflow, Watson, or similar services

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medbot-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key
   - Email credentials (for notifications)
   - Dialogflow credentials (if using)

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Patients
- `POST /api/patients/register` - Register new patient
- `GET /api/patients/:id` - Get patient profile
- `PUT /api/patients/:id` - Update patient profile

### Appointments
- `POST /api/appointments/schedule` - Schedule new appointment
- `GET /api/appointments/patient/:patientId` - Get patient appointments
- `GET /api/appointments/available-slots/:date/:doctor` - Get available time slots
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Chatbot
- `POST /api/chatbot/message` - Process chat message
- `GET /api/chatbot/history/:sessionId` - Get chat history
- `POST /api/chatbot/symptom-check` - Analyze symptoms

## Project Structure

```
medbot-chatbot/
├── models/                 # Database models
│   ├── Patient.js
│   ├── Appointment.js
│   └── ChatInteraction.js
├── routes/                 # API routes
│   ├── patients.js
│   ├── appointments.js
│   └── chatbot.js
├── services/               # Business logic
│   └── nlpEngine.js
├── public/                 # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js              # Main server file
├── package.json
└── README.md
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `EMAIL_USER`: Email for notifications
- `EMAIL_PASS`: Email password
- `DIALOGFLOW_PROJECT_ID`: Dialogflow project ID (optional)

### Database Setup
The application uses MongoDB to store:
- Patient profiles and medical history
- Appointment schedules
- Chat interactions and analytics

## Usage

### For Patients
1. **Register**: Create a patient profile with medical history
2. **Chat**: Interact with MedBot for medical questions
3. **Schedule**: Book appointments with healthcare providers
4. **Manage**: View and manage your appointments

### For Healthcare Providers
1. **Monitor**: View patient interactions and analytics
2. **Schedule**: Manage appointment availability
3. **Respond**: Handle escalated medical queries

## Development

### Adding New Features
1. Create database models in `models/`
2. Add API routes in `routes/`
3. Implement business logic in `services/`
4. Update frontend in `public/`

### NLP Integration
To integrate with external NLP services:
1. Update `services/nlpEngine.js`
2. Add service credentials to `.env`
3. Install required SDK packages

### Testing
```bash
npm test
```

## Deployment

### Cloud Deployment (AWS/Azure/GCP)
1. Set up cloud database (MongoDB Atlas)
2. Configure environment variables
3. Deploy using your preferred cloud service
4. Set up SSL certificates for HTTPS

### Docker Deployment
```bash
# Build image
docker build -t medbot .

# Run container
docker run -p 3000:3000 medbot
```

## Security Considerations

- Patient data encryption
- HIPAA compliance measures
- Secure authentication
- Input validation and sanitization
- Rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@medbot.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## Disclaimer

MedBot is designed to assist with general health information and appointment scheduling. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.