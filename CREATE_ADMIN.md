# Create Admin Account for MedBot

## Quick Setup Instructions

### Option 1: Use Existing Admin
There's already an admin account in your database:
- **Username:** Malke
- **Email:** malkeb8822@gmail.com
- **Role:** super_admin

### Option 2: Create New Admin via API

You can create a new admin account by making a POST request to the init-admin endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@medbot.com", 
    "password": "admin123"
  }'
```

### Option 3: Use the Login Page

1. Go to: `http://localhost:3000/admin-login.html`
2. If no admin exists, you'll see a "First Time Setup" section
3. Fill in the form to create your admin account

## Access the Admin Dashboard

1. **Login Page:** `http://localhost:3000/admin-login.html`
2. **Main App:** `http://localhost:3000` (has Admin link in navigation)

## Test Credentials

For testing purposes, you can use:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@medbot.com

## Features Fixed

✅ **Secure Login System**
- JWT-based authentication
- Account lockout after failed attempts
- Session management with cookies

✅ **Appointment Scheduling Fixed**
- Better error handling
- Automatic patient profile creation
- Form validation
- User-friendly notifications

✅ **Admin Dashboard**
- View, Edit, Delete patients
- Appointment management
- Chat interaction logs
- Database management tools

✅ **User Experience**
- Modern notification system
- Better error messages
- Form validation
- Responsive design

## Troubleshooting

If you get "Error scheduling appointment":
1. Make sure you've filled out your profile completely
2. Check that all appointment fields are filled
3. Ensure the server is running and database is connected

The system will now automatically guide users to complete their profile if needed before scheduling appointments.