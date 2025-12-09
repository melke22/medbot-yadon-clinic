#!/usr/bin/env node

/**
 * Yadon Clinic MedBot - Production Setup Script
 * This script helps set up the MedBot system for production use
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏥 Yadon Clinic MedBot - Production Setup');
console.log('==========================================\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProduction() {
  try {
    console.log('Setting up MedBot for production use at Yadon Clinic...\n');

    // Check if .env already exists
    if (fs.existsSync('.env')) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled. Existing .env file preserved.');
        rl.close();
        return;
      }
    }

    // Generate secure JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log('✅ Generated secure JWT secret');

    // Get clinic configuration
    console.log('\n📋 Clinic Configuration:');
    const clinicEmail = await question('Clinic email (default: info@yadonclinic.com): ') || 'info@yadonclinic.com';
    const clinicPhone = await question('Clinic phone (default: +251 90 910 2009): ') || '+251 90 910 2009';
    
    console.log('\n📧 Email Configuration:');
    const emailUser = await question('Email username for notifications: ');
    const emailPass = await question('Email password/app password: ');

    console.log('\n🔐 Admin Account:');
    const adminEmail = await question('Admin email (default: admin@yadonclinic.com): ') || 'admin@yadonclinic.com';
    const adminPassword = await question('Admin password (min 8 chars): ');

    if (adminPassword.length < 8) {
      console.log('❌ Admin password must be at least 8 characters long');
      rl.close();
      return;
    }

    // Create production .env file
    const envContent = `# Yadon Clinic MedBot - Production Environment
# Generated on ${new Date().toISOString()}

# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/medbot_production

# Security
JWT_SECRET=${jwtSecret}

# Email Configuration
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
EMAIL_FROM=Yadon Clinic <${emailUser}>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Clinic Information
CLINIC_NAME=Yadon Clinic
CLINIC_ADDRESS=Addis Ababa, Ethiopia
CLINIC_PHONE=${clinicPhone}
CLINIC_EMAIL=${clinicEmail}
CLINIC_WEBSITE=https://yadonclinic.com

# Admin Configuration
DEFAULT_ADMIN_EMAIL=${adminEmail}
DEFAULT_ADMIN_PASSWORD=${adminPassword}

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/medbot.log
ENABLE_REQUEST_LOGGING=true

# Performance
MAX_CONCURRENT_CONNECTIONS=100
REQUEST_TIMEOUT=30000
MONGODB_CONNECTION_TIMEOUT=10000
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created production .env file');

    // Create logs directory
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
      console.log('✅ Created logs directory');
    }

    // Create backups directory
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
      console.log('✅ Created backups directory');
    }

    // Create systemd service file template
    const serviceContent = `[Unit]
Description=Yadon Clinic MedBot
After=network.target mongodb.service

[Service]
Type=simple
User=medbot
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

    fs.writeFileSync('medbot.service', serviceContent);
    console.log('✅ Created systemd service file (medbot.service)');

    // Create nginx configuration template
    const nginxContent = `# Yadon Clinic MedBot - Nginx Configuration
# Copy to /etc/nginx/sites-available/medbot

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (update paths)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
`;

    fs.writeFileSync('nginx-medbot.conf', nginxContent);
    console.log('✅ Created nginx configuration template');

    console.log('\n🎉 Production setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install dependencies: npm install --production');
    console.log('2. Start MongoDB service');
    console.log('3. Initialize database: node scripts/initDatabase.js');
    console.log('4. Create admin user: node scripts/createTestAdmin.js');
    console.log('5. Start the application: npm start');
    console.log('\n📖 For detailed deployment instructions, see PRODUCTION_DEPLOYMENT_GUIDE.md');
    console.log('\n🔐 IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupProduction();
}

module.exports = { setupProduction };