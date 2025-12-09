#!/usr/bin/env node

/**
 * Yadon Clinic MedBot - Database Backup Script
 * Creates backups of the MongoDB database and application files
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_NAME = process.env.NODE_ENV === 'production' ? 'medbot_production' : 'medbot';

function createBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backup directory');
  }
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function backupDatabase() {
  return new Promise((resolve, reject) => {
    const timestamp = getTimestamp();
    const backupPath = path.join(BACKUP_DIR, `medbot-backup-${timestamp}.json`);
    
    console.log('🔄 Starting database backup...');
    
    const command = `mongoexport --db ${DB_NAME} --collection users --out ${backupPath.replace('.json', '-users.json')} && ` +
                   `mongoexport --db ${DB_NAME} --collection appointments --out ${backupPath.replace('.json', '-appointments.json')} && ` +
                   `mongoexport --db ${DB_NAME} --collection chatinteractions --out ${backupPath.replace('.json', '-chats.json')} && ` +
                   `mongoexport --db ${DB_NAME} --collection admins --out ${backupPath.replace('.json', '-admins.json')}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database backup failed:', error.message);
        reject(error);
        return;
      }
      
      console.log('✅ Database backup completed');
      console.log(`📁 Backup files created with timestamp: ${timestamp}`);
      resolve(timestamp);
    });
  });
}

function backupApplicationFiles() {
  return new Promise((resolve, reject) => {
    const timestamp = getTimestamp();
    const backupPath = path.join(BACKUP_DIR, `app-backup-${timestamp}.tar.gz`);
    const appDir = path.join(__dirname, '..');
    
    console.log('🔄 Starting application files backup...');
    
    const command = `tar -czf ${backupPath} -C ${appDir} . --exclude=node_modules --exclude=logs --exclude=backups --exclude=.git`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Application backup failed:', error.message);
        reject(error);
        return;
      }
      
      console.log('✅ Application files backup completed');
      console.log(`📁 Backup file: ${backupPath}`);
      resolve(timestamp);
    });
  });
}

function cleanOldBackups() {
  console.log('🧹 Cleaning old backups (keeping last 7 days)...');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error('❌ Error reading backup directory:', err.message);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (stats.mtime < sevenDaysAgo) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`🗑️  Deleted old backup: ${file}`);
            }
          });
        }
      });
    });
  });
}

async function performBackup() {
  try {
    console.log('🏥 Yadon Clinic MedBot - Backup Script');
    console.log('=====================================\n');
    
    createBackupDir();
    
    // Backup database
    await backupDatabase();
    
    // Backup application files
    await backupApplicationFiles();
    
    // Clean old backups
    cleanOldBackups();
    
    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backups stored in: ${BACKUP_DIR}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run backup if called directly
if (require.main === module) {
  performBackup();
}

module.exports = { performBackup };