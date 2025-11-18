#!/usr/bin/env node

/**
 * Database Backup Script for Luxury Wine E-commerce Platform
 * Handles automated backups, retention, and restoration
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');

// Configuration
const config = {
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    name: process.env.DATABASE_NAME || 'luxurywines_prod',
    user: process.env.DATABASE_USER || 'luxurywines',
    password: process.env.DATABASE_PASSWORD,
  },
  backup: {
    localPath: process.env.BACKUP_LOCAL_PATH || './backups',
    s3Bucket: process.env.BACKUP_S3_BUCKET || 'luxurywines-backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    compressionLevel: 9,
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
};

// Initialize AWS S3
const s3 = new AWS.S3({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

class DatabaseBackup {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupFileName = `luxurywines_backup_${this.timestamp}.sql`;
    this.compressedFileName = `${this.backupFileName}.gz`;
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(config.backup.localPath);
    } catch (error) {
      await this.log(`Creating backup directory: ${config.backup.localPath}`);
      await fs.mkdir(config.backup.localPath, { recursive: true });
    }
  }

  async createDatabaseBackup() {
    await this.log('Starting database backup...');
    
    const backupPath = path.join(config.backup.localPath, this.backupFileName);
    const pgDumpCommand = [
      'pg_dump',
      `-h ${config.database.host}`,
      `-p ${config.database.port}`,
      `-U ${config.database.user}`,
      `-d ${config.database.name}`,
      '--verbose',
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      `--file=${backupPath}`
    ].join(' ');

    // Set password environment variable
    const env = { ...process.env, PGPASSWORD: config.database.password };

    try {
      await this.executeCommand(pgDumpCommand);
      await this.log(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      await this.log(`Database backup failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async compressBackup(backupPath) {
    await this.log('Compressing backup...');
    
    const compressedPath = path.join(config.backup.localPath, this.compressedFileName);
    const gzipCommand = `gzip -${config.backup.compressionLevel} -c "${backupPath}" > "${compressedPath}"`;

    try {
      await this.executeCommand(gzipCommand);
      await this.log(`Backup compressed: ${compressedPath}`);
      
      // Remove uncompressed file
      await fs.unlink(backupPath);
      
      return compressedPath;
    } catch (error) {
      await this.log(`Compression failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async uploadToS3(filePath) {
    await this.log('Uploading backup to S3...');
    
    const fileContent = await fs.readFile(filePath);
    const s3Key = `database/${path.basename(filePath)}`;

    const uploadParams = {
      Bucket: config.backup.s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD_IA',
      Metadata: {
        'backup-type': 'database',
        'database-name': config.database.name,
        'created-at': this.timestamp,
      }
    };

    try {
      const result = await s3.upload(uploadParams).promise();
      await this.log(`Backup uploaded to S3: ${result.Location}`);
      return result.Location;
    } catch (error) {
      await this.log(`S3 upload failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async cleanupOldBackups() {
    await this.log('Cleaning up old backups...');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.backup.retentionDays);

    try {
      // Clean up local backups
      const localFiles = await fs.readdir(config.backup.localPath);
      for (const file of localFiles) {
        const filePath = path.join(config.backup.localPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          await this.log(`Deleted old local backup: ${file}`);
        }
      }

      // Clean up S3 backups
      const s3Objects = await s3.listObjectsV2({
        Bucket: config.backup.s3Bucket,
        Prefix: 'database/'
      }).promise();

      for (const object of s3Objects.Contents || []) {
        if (object.LastModified < cutoffDate) {
          await s3.deleteObject({
            Bucket: config.backup.s3Bucket,
            Key: object.Key
          }).promise();
          await this.log(`Deleted old S3 backup: ${object.Key}`);
        }
      }

      await this.log('Cleanup completed');
    } catch (error) {
      await this.log(`Cleanup failed: ${error.message}`, 'ERROR');
    }
  }

  async restoreFromBackup(backupFile) {
    await this.log(`Starting database restoration from: ${backupFile}`);
    
    let localBackupPath = backupFile;
    
    // If it's an S3 path, download it first
    if (backupFile.startsWith('s3://')) {
      const s3Key = backupFile.replace(`s3://${config.backup.s3Bucket}/`, '');
      localBackupPath = path.join(config.backup.localPath, path.basename(s3Key));
      
      await this.log('Downloading backup from S3...');
      const downloadParams = {
        Bucket: config.backup.s3Bucket,
        Key: s3Key
      };
      
      const s3Object = await s3.getObject(downloadParams).promise();
      await fs.writeFile(localBackupPath, s3Object.Body);
    }

    // Decompress if needed
    if (localBackupPath.endsWith('.gz')) {
      await this.log('Decompressing backup...');
      const decompressedPath = localBackupPath.replace('.gz', '');
      await this.executeCommand(`gunzip -c "${localBackupPath}" > "${decompressedPath}"`);
      localBackupPath = decompressedPath;
    }

    // Restore database
    const restoreCommand = [
      'psql',
      `-h ${config.database.host}`,
      `-p ${config.database.port}`,
      `-U ${config.database.user}`,
      `-d ${config.database.name}`,
      `-f "${localBackupPath}"`
    ].join(' ');

    try {
      await this.executeCommand(restoreCommand);
      await this.log('Database restoration completed successfully');
    } catch (error) {
      await this.log(`Database restoration failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async listBackups() {
    await this.log('Listing available backups...');
    
    try {
      // List S3 backups
      const s3Objects = await s3.listObjectsV2({
        Bucket: config.backup.s3Bucket,
        Prefix: 'database/'
      }).promise();

      console.log('\nS3 Backups:');
      console.log('===========');
      for (const object of s3Objects.Contents || []) {
        const size = (object.Size / 1024 / 1024).toFixed(2);
        console.log(`${object.Key} (${size} MB) - ${object.LastModified}`);
      }

      // List local backups
      const localFiles = await fs.readdir(config.backup.localPath);
      const backupFiles = localFiles.filter(file => 
        file.startsWith('luxurywines_backup_') && 
        (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      );

      console.log('\nLocal Backups:');
      console.log('==============');
      for (const file of backupFiles) {
        const filePath = path.join(config.backup.localPath, file);
        const stats = await fs.stat(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`${file} (${size} MB) - ${stats.mtime}`);
      }
    } catch (error) {
      await this.log(`Failed to list backups: ${error.message}`, 'ERROR');
    }
  }

  async performFullBackup() {
    try {
      await this.ensureBackupDirectory();
      const backupPath = await this.createDatabaseBackup();
      const compressedPath = await this.compressBackup(backupPath);
      await this.uploadToS3(compressedPath);
      await this.cleanupOldBackups();
      
      await this.log('Full backup process completed successfully');
      return compressedPath;
    } catch (error) {
      await this.log(`Backup process failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const backup = new DatabaseBackup();
  const command = process.argv[2];

  switch (command) {
    case 'create':
    case 'backup':
      await backup.performFullBackup();
      break;
    
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('Usage: node backup-database.js restore <backup-file>');
        process.exit(1);
      }
      await backup.restoreFromBackup(backupFile);
      break;
    
    case 'list':
      await backup.listBackups();
      break;
    
    case 'cleanup':
      await backup.cleanupOldBackups();
      break;
    
    default:
      console.log('Usage: node backup-database.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  create|backup  - Create a new database backup');
      console.log('  restore <file> - Restore database from backup file');
      console.log('  list          - List available backups');
      console.log('  cleanup       - Clean up old backups');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = DatabaseBackup;