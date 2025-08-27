import { EventEmitter } from 'events';
import logger from './LoggerService';
import BackgroundJobService from './BackgroundJobService';

/**
 * Session cleanup scheduler service
 * Automatically closes inactive sessions after 1 hour of inactivity
 */
class SessionCleanupScheduler extends EventEmitter {
  private static instance: SessionCleanupScheduler;
  private backgroundJobService: BackgroundJobService;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private readonly CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    super();
    this.backgroundJobService = BackgroundJobService.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): SessionCleanupScheduler {
    if (!SessionCleanupScheduler.instance) {
      SessionCleanupScheduler.instance = new SessionCleanupScheduler();
    }
    return SessionCleanupScheduler.instance;
  }

  /**
   * Start the session cleanup scheduler
   */
  public start(): void {
    if (this.isRunning) {
      logger.warn('Session cleanup scheduler is already running');
      return;
    }

    try {
      this.isRunning = true;

      // Run initial cleanup
      this.scheduleCleanup();

      // Set up recurring cleanup
      this.cleanupInterval = setInterval(() => {
        this.scheduleCleanup();
      }, this.CLEANUP_INTERVAL_MS);

      logger.info('Session cleanup scheduler started successfully');
      this.emit('schedulerStarted');
    } catch (error) {
      this.isRunning = false;
      logger.error('Failed to start session cleanup scheduler:', error);
      this.emit('schedulerError', error);
    }
  }

  /**
   * Stop the session cleanup scheduler
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.warn('Session cleanup scheduler is not running');
      return;
    }

    try {
      this.isRunning = false;

      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      logger.info('Session cleanup scheduler stopped successfully');
      this.emit('schedulerStopped');
    } catch (error) {
      logger.error('Failed to stop session cleanup scheduler:', error);
      this.emit('schedulerError', error);
    }
  }

  /**
   * Schedule a session cleanup job
   */
  private async scheduleCleanup(): Promise<void> {
    try {
      logger.debug('Scheduling session cleanup job');

      // Add cleanup job to background job queue
      await this.backgroundJobService.addJob(
        'sessionCleanup',
        { timestamp: new Date() },
        2, // Normal priority
        30000 // 30 second timeout
      );

      logger.debug('Session cleanup job scheduled successfully');
      this.emit('cleanupScheduled');
    } catch (error) {
      logger.error('Failed to schedule session cleanup job:', error);
      this.emit('cleanupError', error);
    }
  }

  /**
   * Get scheduler status
   */
  public getStatus(): { isRunning: boolean; lastCleanup?: Date; nextCleanup?: Date } {
    const status = { isRunning: this.isRunning };

    if (this.cleanupInterval) {
      // Calculate next cleanup time
      const now = Date.now();
      const nextCleanup = new Date(now + this.CLEANUP_INTERVAL_MS);
      return { ...status, nextCleanup };
    }

    return status;
  }

  /**
   * Manually trigger a cleanup (for testing or immediate needs)
   */
  public async triggerManualCleanup(): Promise<void> {
    try {
      logger.info('Manual session cleanup triggered');

      await this.scheduleCleanup();
      this.emit('manualCleanupTriggered');
    } catch (error) {
      logger.error('Failed to trigger manual cleanup:', error);
      this.emit('cleanupError', error);
    }
  }

  /**
   * Setup event listeners for monitoring
   */
  private setupEventListeners(): void {
    this.backgroundJobService.on('jobCompleted', job => {
      if (job.type === 'sessionCleanup') {
        logger.info(`Session cleanup job completed: ${job.id}`);
        this.emit('cleanupCompleted', job.result);
      }
    });

    this.backgroundJobService.on('jobFailed', job => {
      if (job.type === 'sessionCleanup') {
        logger.error(`Session cleanup job failed: ${job.id} - ${job.error}`);
        this.emit('cleanupFailed', job.error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stop();
    this.removeAllListeners();
  }
}

export default SessionCleanupScheduler;
