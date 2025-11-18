import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '@/utils/logger'
import { databaseConfig } from '@/config/database'
import { databaseService } from '@/services/database.service'

const execAsync = promisify(exec)

export interface BackupInfo {
  id: string
  filename: string
  size: number
  createdAt: string
  type: 'full' | 'incremental' | 'schema'
  compressed: boolean
  checksum?: string
}

export interface BackupOptions {
  type?: 'full' | 'schema'
  compress?: boolean
  includeData?: boolean
  excludeTables?: string[]
  outputPath?: string
}

export interface RestoreOptions {
  backupId: string
  dropExisting?: boolean
  dataOnly?: boolean
  schemaOnly?: boolean
}

class DatabaseBackupService {
  private static instance: DatabaseBackupService
  private backupDirectory: string
  private maxBackups: number = databaseConfig.backupRetentionDays || 7

  private constructor() {
    this.backupDirectory = process.env.DB_BACKUP_DIR || path.join(process.cwd(), 'backups')
    this.ensureBackupDirectory()
  }

  public static getInstance(): DatabaseBackupService {
    if (!DatabaseBackupService.instance) {
      DatabaseBackupService.instance = new DatabaseBackupService()
    }
    return DatabaseBackupService.instance
  }

  /**
   * Create a database backup
   */
  public async createBackup(options: BackupOptions = {}): Promise<BackupInfo> {
    const startTime = Date.now()
    const backupId = this.generateBackupId()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    const {
      type = 'full',
      compress = true,
      includeData = true,
      excludeTables = [],
      outputPath
    } = options

    try {
      logger.info('Starting database backup', { backupId, type, compress })

      // Determine backup filename
      const extension = compress ? '.sql.gz' : '.sql'
      const filename = outputPath || path.join(
        this.backupDirectory,
        `backup_${timestamp}_${backupId}${extension}`
      )

      // Build pg_dump command
      const command = this.buildBackupCommand(filename, {
        type,
        compress,
        includeData,
        excludeTables
      })

      // Execute backup
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr && !stderr.includes('NOTICE')) {
        logger.warn('Backup completed with warnings', { stderr })
      }

      // Get file stats
      const stats = await fs.stat(filename)
      const duration = Date.now() - startTime

      // Calculate checksum for integrity verification
      const checksum = await this.calculateChecksum(filename)

      const backupInfo: BackupInfo = {
        id: backupId,
        filename: path.basename(filename),
        size: stats.size,
        createdAt: new Date().toISOString(),
        type,
        compressed: compress,
        checksum
      }

      // Store backup metadata
      await this.storeBackupMetadata(backupInfo)

      logger.info('Database backup completed successfully', {
        ...backupInfo,
        duration: `${duration}ms`,
        sizeFormatted: this.formatBytes(stats.size)
      })

      // Clean up old backups
      await this.cleanupOldBackups()

      return backupInfo

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Database backup failed', {
        backupId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      })
      throw error
    }
  }

  /**
   * Restore database from backup
   */
  public async restoreBackup(options: RestoreOptions): Promise<void> {
    const startTime = Date.now()
    const { backupId, dropExisting = false, dataOnly = false, schemaOnly = false } = options

    try {
      logger.info('Starting database restore', { backupId, dropExisting, dataOnly, schemaOnly })

      // Get backup info
      const backupInfo = await this.getBackupInfo(backupId)
      if (!backupInfo) {
        throw new Error(`Backup not found: ${backupId}`)
      }

      const backupPath = path.join(this.backupDirectory, backupInfo.filename)

      // Verify backup file exists
      await fs.access(backupPath)

      // Verify backup integrity
      if (backupInfo.checksum) {
        const currentChecksum = await this.calculateChecksum(backupPath)
        if (currentChecksum !== backupInfo.checksum) {
          throw new Error('Backup file integrity check failed')
        }
      }

      // Build restore command
      const command = this.buildRestoreCommand(backupPath, {
        dropExisting,
        dataOnly,
        schemaOnly,
        compressed: backupInfo.compressed
      })

      // Execute restore
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr && !stderr.includes('NOTICE')) {
        logger.warn('Restore completed with warnings', { stderr })
      }

      const duration = Date.now() - startTime

      logger.info('Database restore completed successfully', {
        backupId,
        duration: `${duration}ms`
      })

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Database restore failed', {
        backupId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      })
      throw error
    }
  }

  /**
   * List available backups
   */
  public async listBackups(): Promise<BackupInfo[]> {
    try {
      const metadataFiles = await fs.readdir(this.backupDirectory)
      const backups: BackupInfo[] = []

      for (const file of metadataFiles) {
        if (file.endsWith('.metadata.json')) {
          try {
            const metadataPath = path.join(this.backupDirectory, file)
            const metadata = await fs.readFile(metadataPath, 'utf-8')
            const backupInfo = JSON.parse(metadata) as BackupInfo
            
            // Verify backup file still exists
            const backupPath = path.join(this.backupDirectory, backupInfo.filename)
            await fs.access(backupPath)
            
            backups.push(backupInfo)
          } catch (error) {
            logger.warn('Failed to read backup metadata', { file, error })
          }
        }
      }

      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      logger.error('Failed to list backups', { error })
      return []
    }
  }

  /**
   * Delete a backup
   */
  public async deleteBackup(backupId: string): Promise<void> {
    try {
      const backupInfo = await this.getBackupInfo(backupId)
      if (!backupInfo) {
        throw new Error(`Backup not found: ${backupId}`)
      }

      const backupPath = path.join(this.backupDirectory, backupInfo.filename)
      const metadataPath = path.join(this.backupDirectory, `${backupId}.metadata.json`)

      // Delete backup file
      await fs.unlink(backupPath)
      
      // Delete metadata file
      await fs.unlink(metadataPath)

      logger.info('Backup deleted successfully', { backupId })
    } catch (error) {
      logger.error('Failed to delete backup', { backupId, error })
      throw error
    }
  }

  /**
   * Verify backup integrity
   */
  public async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const backupInfo = await this.getBackupInfo(backupId)
      if (!backupInfo) {
        throw new Error(`Backup not found: ${backupId}`)
      }

      const backupPath = path.join(this.backupDirectory, backupInfo.filename)
      
      // Check if file exists
      await fs.access(backupPath)

      // Verify checksum if available
      if (backupInfo.checksum) {
        const currentChecksum = await this.calculateChecksum(backupPath)
        if (currentChecksum !== backupInfo.checksum) {
          logger.error('Backup integrity check failed', { backupId, expected: backupInfo.checksum, actual: currentChecksum })
          return false
        }
      }

      // Try to read the backup file structure
      if (backupInfo.compressed) {
        const { stdout } = await execAsync(`gunzip -t "${backupPath}"`)
      } else {
        // Basic SQL syntax check
        const content = await fs.readFile(backupPath, 'utf-8')
        if (!content.includes('--') && !content.includes('CREATE') && !content.includes('INSERT')) {
          logger.error('Backup file appears to be corrupted', { backupId })
          return false
        }
      }

      logger.info('Backup integrity verified', { backupId })
      return true
    } catch (error) {
      logger.error('Backup verification failed', { backupId, error })
      return false
    }
  }

  /**
   * Schedule automatic backups
   */
  public scheduleAutoBackup(intervalHours: number = 24): void {
    if (!databaseConfig.enableAutoBackup) {
      logger.info('Auto backup is disabled')
      return
    }

    const intervalMs = intervalHours * 60 * 60 * 1000

    setInterval(async () => {
      try {
        logger.info('Starting scheduled backup')
        await this.createBackup({
          type: 'full',
          compress: true,
          includeData: true
        })
        logger.info('Scheduled backup completed')
      } catch (error) {
        logger.error('Scheduled backup failed', { error })
      }
    }, intervalMs)

    logger.info('Auto backup scheduled', { intervalHours })
  }

  /**
   * Get backup statistics
   */
  public async getBackupStats(): Promise<any> {
    try {
      const backups = await this.listBackups()
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0)
      
      return {
        totalBackups: backups.length,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        oldestBackup: backups.length > 0 ? backups[backups.length - 1]?.createdAt : null,
        newestBackup: backups.length > 0 ? backups[0]?.createdAt : null,
        backupTypes: this.groupBy(backups, 'type'),
        averageSize: backups.length > 0 ? Math.round(totalSize / backups.length) : 0
      }
    } catch (error) {
      logger.error('Failed to get backup stats', { error })
      return null
    }
  }

  // Private helper methods

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupDirectory, { recursive: true })
    } catch (error) {
      logger.error('Failed to create backup directory', { error })
    }
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private buildBackupCommand(filename: string, options: any): string {
    const { type, compress, includeData, excludeTables } = options
    
    // Base command
    let command = 'pg_dump'
    
    // Connection parameters
    command += ` --host=${databaseConfig.host}`
    command += ` --port=${databaseConfig.port}`
    command += ` --username=${databaseConfig.username}`
    command += ` --dbname=${databaseConfig.database}`
    
    // Backup options
    if (type === 'schema') {
      command += ' --schema-only'
    } else if (!includeData) {
      command += ' --schema-only'
    }
    
    // Exclude tables
    for (const table of excludeTables) {
      command += ` --exclude-table=${table}`
    }
    
    // Output options
    command += ' --verbose --no-password'
    
    if (compress) {
      command += ` | gzip > "${filename}"`
    } else {
      command += ` --file="${filename}"`
    }
    
    // Set password via environment variable
    command = `PGPASSWORD="${databaseConfig.password}" ${command}`
    
    return command
  }

  private buildRestoreCommand(filename: string, options: any): string {
    const { dropExisting, dataOnly, schemaOnly, compressed } = options
    
    let command = compressed ? 'gunzip -c' : 'cat'
    command += ` "${filename}"`
    
    if (compressed) {
      command += ' | psql'
    } else {
      command += ' | psql'
    }
    
    // Connection parameters
    command += ` --host=${databaseConfig.host}`
    command += ` --port=${databaseConfig.port}`
    command += ` --username=${databaseConfig.username}`
    command += ` --dbname=${databaseConfig.database}`
    
    // Restore options
    if (dropExisting) {
      // This would need additional logic to drop existing objects
    }
    
    if (dataOnly) {
      // This would need to filter out schema commands
    }
    
    if (schemaOnly) {
      // This would need to filter out data commands
    }
    
    // Set password via environment variable
    command = `PGPASSWORD="${databaseConfig.password}" ${command}`
    
    return command
  }

  private async calculateChecksum(filename: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`sha256sum "${filename}"`)
      return stdout.split(' ')[0] || ''
    } catch (error) {
      logger.warn('Failed to calculate checksum', { filename, error })
      return ''
    }
  }

  private async storeBackupMetadata(backupInfo: BackupInfo): Promise<void> {
    try {
      const metadataPath = path.join(this.backupDirectory, `${backupInfo.id}.metadata.json`)
      await fs.writeFile(metadataPath, JSON.stringify(backupInfo, null, 2))
    } catch (error) {
      logger.error('Failed to store backup metadata', { error })
    }
  }

  private async getBackupInfo(backupId: string): Promise<BackupInfo | null> {
    try {
      const metadataPath = path.join(this.backupDirectory, `${backupId}.metadata.json`)
      const metadata = await fs.readFile(metadataPath, 'utf-8')
      return JSON.parse(metadata) as BackupInfo
    } catch (error) {
      return null
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups()
      
      if (backups.length <= this.maxBackups) {
        return
      }
      
      const backupsToDelete = backups.slice(this.maxBackups)
      
      for (const backup of backupsToDelete) {
        await this.deleteBackup(backup.id)
        logger.info('Old backup deleted', { backupId: backup.id })
      }
      
      logger.info('Backup cleanup completed', { deleted: backupsToDelete.length })
    } catch (error) {
      logger.error('Failed to cleanup old backups', { error })
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((result, item) => {
      const group = String(item[key])
      result[group] = (result[group] || 0) + 1
      return result
    }, {} as Record<string, number>)
  }
}

export const databaseBackupService = DatabaseBackupService.getInstance()