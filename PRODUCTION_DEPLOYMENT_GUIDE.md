# 🏥 Yadon Clinic MedBot - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. System Requirements
- **Server**: Ubuntu 20.04+ or Windows Server 2019+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 50GB+ available space
- **Network**: Stable internet connection
- **Domain**: Optional but recommended (e.g., medbot.yadonclinic.com)

### 2. Required Software
- **Node.js**: Version 18+ 
- **MongoDB**: Version 6.0+
- **Docker & Docker Compose**: Latest versions (recommended)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## 🚀 Deployment Options

### Option A: Docker Deployment (Recommended)

#### Step 1: Install Docker
```bash
# Ubuntu/Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

#### Step 3: Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f medbot-app
```

### Option B: Manual Deployment

#### Step 1: Install Dependencies
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Step 2: Setup Application
```bash
# Clone/copy your MedBot files to server
cd /opt/medbot
npm install --production
```

#### Step 3: Configure Services
```bash
# Create systemd service
sudo nano /etc/systemd/system/medbot.service
```

## ⚙️ Production Configuration

### 1. Environment Variables (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/medbot_production

# Security
JWT_SECRET=GENERATE_STRONG_SECRET_HERE_32_CHARS_MIN

# Email Configuration (for notifications)
EMAIL_USER=noreply@yadonclinic.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=Yadon Clinic <noreply@yadonclinic.com>

# Clinic Information
CLINIC_NAME=Yadon Clinic
CLINIC_ADDRESS=Addis Ababa, Ethiopia
CLINIC_PHONE=+251 90 910 2009
CLINIC_EMAIL=info@yadonclinic.com
```

### 2. Create Production Environment File
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup
```bash
# Initialize database with admin user
node scripts/createTestAdmin.js

# Initialize database structure
node scripts/initDatabase.js
```

## 🔒 Security Configuration

### 1. SSL/HTTPS Setup (Nginx + Let's Encrypt)
```nginx
# /etc/nginx/sites-available/medbot
server {
    listen 80;
    server_name medbot.yadonclinic.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name medbot.yadonclinic.com;

    ssl_certificate /etc/letsencrypt/live/medbot.yadonclinic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medbot.yadonclinic.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 3. MongoDB Security
```bash
# Enable MongoDB authentication
sudo nano /etc/mongod.conf

# Add:
security:
  authorization: enabled
```

## 📊 Monitoring & Maintenance

### 1. System Service (systemd)
```ini
# /etc/systemd/system/medbot.service
[Unit]
Description=Yadon Clinic MedBot
After=network.target mongodb.service

[Service]
Type=simple
User=medbot
WorkingDirectory=/opt/medbot
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/medbot

# Content:
/opt/medbot/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 medbot medbot
}
```

### 3. Backup Strategy
```bash
# Create backup script
#!/bin/bash
# /opt/medbot/scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/medbot/backups"

# MongoDB backup
mongodump --db medbot_production --out $BACKUP_DIR/mongo_$DATE

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/medbot --exclude=node_modules --exclude=logs

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongo_*" -mtime +7 -exec rm -rf {} \;
```

## 🏥 Clinic-Specific Setup

### 1. Create Default Admin Account
```bash
# Run the admin creation script
node scripts/createTestAdmin.js

# Default credentials (CHANGE IMMEDIATELY):
# Email: admin@yadonclinic.com
# Password: Admin123!
```

### 2. Configure Clinic Information
Update the following in your environment or database:
- Clinic name: Yadon Clinic
- Location: Addis Ababa, Ethiopia
- Phone: +251 90 910 2009
- Email: info@yadonclinic.com
- Services: As configured in the system

### 3. Doctor Profiles Setup
Add your clinic's doctors through the admin panel:
- Dr. Alemayehu Tadesse (General Medicine)
- Dr. Hanan Mohammed (Women's Health)
- Dr. Dawit Bekele (Men's Health)
- Dr. Sara Yohannes (Pediatrics)

## 🔧 Post-Deployment Tasks

### 1. Test All Features
- [ ] Patient registration and login
- [ ] Appointment scheduling
- [ ] Chat functionality
- [ ] Admin panel access
- [ ] Database operations
- [ ] Email notifications

### 2. Performance Optimization
```bash
# Enable Node.js production optimizations
export NODE_ENV=production

# MongoDB indexing
mongo medbot_production --eval "
  db.users.createIndex({email: 1});
  db.appointments.createIndex({date: 1, time: 1});
  db.chatinteractions.createIndex({timestamp: -1});
"
```

### 3. Monitoring Setup
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name medbot
pm2 startup
pm2 save
```

## 📱 Access Information

### For Patients:
- **Website**: https://your-domain.com
- **Registration**: Click "Login" → "Register"
- **Features**: Chat, Appointments, Profile

### For Clinic Staff:
- **Admin Panel**: https://your-domain.com/login.html → "Admin Login"
- **Default Login**: admin@yadonclinic.com / Admin123! (CHANGE!)
- **Features**: Patient management, Appointments, Analytics

## 🆘 Troubleshooting

### Common Issues:
1. **Port 3000 in use**: Change PORT in .env file
2. **MongoDB connection failed**: Check MongoDB service status
3. **Email not working**: Verify EMAIL_USER and EMAIL_PASS
4. **Admin login failed**: Run createTestAdmin.js script

### Support Commands:
```bash
# Check service status
systemctl status medbot
systemctl status mongodb

# View logs
journalctl -u medbot -f
tail -f /opt/medbot/logs/app.log

# Restart services
systemctl restart medbot
systemctl restart mongodb
```

## 📞 Support

For technical support:
- **Developer**: Eng. Melkamu Boka
- **Company**: VisionTech
- **System**: Yadon Clinic MedBot v1.0

---

**🎉 Congratulations! Your Yadon Clinic MedBot is now ready for production use!**