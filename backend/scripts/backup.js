// Automated database backup script
require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const MAX_BACKUPS = 7; // Keep last 7 backups

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch (error) {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Perform database backup
 */
async function performBackup() {
  try {
    await ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFilename = `mongodb-backup-${timestamp}.gz`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    console.log(`🔄 Starting database backup: ${backupFilename}`);

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI not configured in .env');
    }

    // Execute mongodump command
    const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;

    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Backup failed:', error.message);
          reject(error);
          return;
        }

        console.log(`✅ Backup completed: ${backupFilename}`);
        console.log(`   Location: ${backupPath}`);

        // Get file size
        const stats = await fs.stat(backupPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   Size: ${fileSizeMB} MB`);

        // Clean up old backups
        await cleanupOldBackups();

        resolve(backupPath);
      });
    });
  } catch (error) {
    console.error('❌ Backup error:', error);
    throw error;
  }
}

/**
 * Clean up old backups (keep only MAX_BACKUPS)
 */
async function cleanupOldBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.startsWith('mongodb-backup-') && file.endsWith('.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.stat(path.join(BACKUP_DIR, file)).then(stats => stats.mtime)
      }));

    // Wait for all stat promises
    const backups = await Promise.all(
      backupFiles.map(async file => ({
        name: file.name,
        path: file.path,
        time: await file.time
      }))
    );

    // Sort by time (newest first)
    backups.sort((a, b) => b.time - a.time);

    // Delete old backups
    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      
      for (const backup of toDelete) {
        await fs.unlink(backup.path);
        console.log(`🗑️  Deleted old backup: ${backup.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
}

/**
 * Restore from backup
 */
async function restoreBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    // Check if backup exists
    await fs.access(backupPath);

    console.log(`🔄 Restoring from backup: ${backupFilename}`);
    console.log('⚠️  WARNING: This will overwrite existing data!');

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const command = `mongorestore --uri="${mongoUri}" --archive="${backupPath}" --gzip --drop`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Restore failed:', error.message);
          reject(error);
          return;
        }

        console.log(`✅ Restore completed from: ${backupFilename}`);
        resolve();
      });
    });
  } catch (error) {
    console.error('❌ Restore error:', error);
    throw error;
  }
}

/**
 * List available backups
 */
async function listBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => 
      file.startsWith('mongodb-backup-') && file.endsWith('.gz')
    );

    if (backupFiles.length === 0) {
      console.log('No backups found');
      return [];
    }

    console.log(`\n📦 Available backups (${backupFiles.length}):\n`);
    
    const backups = await Promise.all(
      backupFiles.map(async file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
          date: stats.mtime.toISOString()
        };
      })
    );

    // Sort by date (newest first)
    backups.sort((a, b) => new Date(b.date) - new Date(a.date));

    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Size: ${backup.size}`);
      console.log(`   Date: ${backup.date}\n`);
    });

    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Schedule daily backups
 */
function scheduleBackups() {
  // Run daily at 2:00 AM
  const job = schedule.scheduleJob('0 2 * * *', async () => {
    console.log('\n🕐 Scheduled backup triggered');
    try {
      await performBackup();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
      // TODO: Send alert email
    }
  });

  console.log('✅ Daily backup scheduled for 2:00 AM');
  return job;
}

// CLI Usage
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'backup':
      performBackup()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'restore':
      if (!arg) {
        console.error('❌ Please specify backup filename');
        console.log('Usage: node backup.js restore <backup-filename>');
        process.exit(1);
      }
      restoreBackup(arg)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'list':
      listBackups()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'schedule':
      scheduleBackups();
      console.log('Backup scheduler running. Press Ctrl+C to stop.');
      break;

    default:
      console.log('MongoDB Backup Utility\n');
      console.log('Usage:');
      console.log('  node backup.js backup              - Create backup now');
      console.log('  node backup.js restore <filename>  - Restore from backup');
      console.log('  node backup.js list                - List all backups');
      console.log('  node backup.js schedule            - Start backup scheduler');
      process.exit(0);
  }
}

module.exports = {
  performBackup,
  restoreBackup,
  listBackups,
  scheduleBackups,
  cleanupOldBackups
};
