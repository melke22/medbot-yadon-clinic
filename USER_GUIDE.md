# MedBot Complete User Guide

## 🚀 **System Overview**

MedBot now has a complete authentication system with separate user and admin portals:

### **Patient Portal** 
- **URL:** `http://localhost:3000/login.html`
- **Features:** Registration, Login, Profile Management, Appointment Scheduling, Chat with MedBot

### **Admin Portal**
- **URL:** `http://localhost:3000/admin-login.html` 
- **Features:** Patient Management, Appointment Management, Chat Logs, Analytics, Database Management

---

## 👤 **For Patients**

### **Step 1: Register/Login**
1. Go to: `http://localhost:3000/login.html`
2. **New Users:** Click "Register" tab and fill out:
   - Full Name
   - Email (will be your username)
   - Phone Number
   - Date of Birth
   - Gender
   - Password (minimum 6 characters)
   - Allergies (optional)
3. **Existing Users:** Use "Login" tab with email and password

### **Step 2: Access Dashboard**
After login, you'll be redirected to the main MedBot interface with:
- ✅ **Chat Tab:** Talk with AI MedBot
- ✅ **Appointments Tab:** Schedule and view appointments
- ✅ **Profile Tab:** Update your medical information
- ✅ **Logout Button:** In the top-right corner

### **Step 3: Schedule Appointments**
1. Click "Appointments" tab
2. Select "Schedule New"
3. Fill out the form:
   - Department (General Medicine, Cardiology, etc.)
   - Doctor (auto-populated based on department)
   - Date (today or future dates only)
   - Time (shows available slots)
   - Reason for visit
4. Click "Schedule Appointment"

### **Step 4: Chat with MedBot**
1. Click "Chat" tab
2. Type your medical questions or concerns
3. MedBot will respond with helpful information
4. Use suggested quick responses for common queries

---

## 🔐 **For Administrators**

### **Step 1: Admin Login**
1. Go to: `http://localhost:3000/admin-login.html`
2. Use existing admin credentials:
   - **Username:** Malke
   - **Email:** malkeb8822@gmail.com
   - **Password:** [Your existing password]

### **Step 2: Admin Dashboard Features**

#### **Dashboard Overview**
- Real-time statistics
- Visual charts
- Recent activity feed

#### **Patient Management**
- View all registered patients
- Edit patient information
- Delete patient records
- Search and filter patients

#### **Appointment Management**
- View all appointments
- Update appointment status
- Filter by date, status, department
- Confirm or cancel appointments

#### **Chat Logs**
- View all patient-bot conversations
- Filter by category and date
- Analyze AI performance

#### **Database Management**
- Create backups
- Export data
- Clear database
- View statistics

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Error scheduling appointment"**
✅ **Solution:** Make sure you're logged in and have completed your profile

#### **"Please login to schedule appointments"**
✅ **Solution:** Go to `/login.html` and register/login first

#### **"Access denied" errors**
✅ **Solution:** Your session may have expired, login again

#### **Profile not saving**
✅ **Solution:** Ensure all required fields are filled (Name, Email, Phone, DOB, Gender)

#### **Can't access admin dashboard**
✅ **Solution:** Use the correct admin login page: `/admin-login.html`

---

## 🎯 **Quick Start Guide**

### **For New Patients:**
1. Visit: `http://localhost:3000/login.html`
2. Click "Register" → Fill form → Submit
3. You'll be automatically logged in and redirected
4. Complete your profile in the "Profile" tab
5. Schedule appointments in the "Appointments" tab
6. Chat with MedBot in the "Chat" tab

### **For Admins:**
1. Visit: `http://localhost:3000/admin-login.html`
2. Login with existing credentials
3. Access full admin dashboard
4. Manage patients, appointments, and system data

---

## 🔒 **Security Features**

### **Patient Security:**
- ✅ JWT-based authentication
- ✅ Secure password hashing
- ✅ Session management
- ✅ Account lockout protection
- ✅ HTTP-only cookies

### **Admin Security:**
- ✅ Separate admin authentication
- ✅ Role-based access control
- ✅ Super admin privileges
- ✅ Account lockout after failed attempts
- ✅ Secure session management

---

## 📱 **Mobile Responsive**

The system works perfectly on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones
- ✅ All modern browsers

---

## 🆘 **Support**

### **If you encounter issues:**

1. **Check the browser console** for error messages
2. **Verify server is running** at `http://localhost:3000`
3. **Check database connection** (MongoDB should be running)
4. **Clear browser cache** and cookies if needed
5. **Try different browser** if issues persist

### **Test Accounts:**

**Patient Test Account:**
- Register a new account at `/login.html`
- Use any valid email and password (min 6 chars)

**Admin Test Account:**
- Username: Malke
- Email: malkeb8822@gmail.com
- Use existing password or create new admin via API

---

## ✨ **New Features Added**

### **User Authentication System:**
- ✅ Complete user registration and login
- ✅ Secure password management
- ✅ Session-based authentication
- ✅ Automatic profile creation

### **Enhanced Appointment System:**
- ✅ User-specific appointments
- ✅ Real-time availability checking
- ✅ Better error handling
- ✅ Form validation

### **Improved User Experience:**
- ✅ Modern notification system
- ✅ Better error messages
- ✅ Loading states
- ✅ Responsive design

### **Admin Enhancements:**
- ✅ Complete CRUD operations
- ✅ Advanced filtering
- ✅ Data export/import
- ✅ Real-time analytics

---

**🏥 Your MedBot system is now fully functional with complete user authentication and appointment scheduling!**

**Main App:** `http://localhost:3000/login.html`
**Admin Panel:** `http://localhost:3000/admin-login.html`