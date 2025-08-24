import { EventEmitter } from 'events';
import logger from './LoggerService';

/**
 * Job status enumeration
 */
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
export enum JobStatus {
  // eslint-disable-next-line no-unused-vars
  PENDING = 'pending',
  // eslint-disable-next-line no-unused-vars
  RUNNING = 'running',
  // eslint-disable-next-line no-unused-vars
  COMPLETED = 'completed',
  // eslint-disable-next-line no-unused-vars
  FAILED = 'failed',
  // eslint-disable-next-line no-unused-vars
  CANCELLED = 'cancelled',
}

/**
 * Job priority enumeration
 */
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
export enum JobPriority {
  // eslint-disable-next-line no-unused-vars
  LOW = 1,
  // eslint-disable-next-line no-unused-vars
  NORMAL = 2,
  // eslint-disable-next-line no-unused-vars
  HIGH = 3,
  // eslint-disable-next-line no-unused-vars
  URGENT = 4,
}

/**
 * Job interface
 */
export interface Job {
  id: string;
  type: string;
  data: any;
  status: JobStatus;
  priority: JobPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  progress?: number;
  retries: number;
  maxRetries: number;
  timeout: number;
}

/**
 * Background job service for handling heavy operations
 */
class BackgroundJobService extends EventEmitter {
  private static instance: BackgroundJobService;
  private jobQueue: Map<JobPriority, Job[]> = new Map();
  private activeJobs: Map<string, Job> = new Map();
  private jobHistory: Job[] = [];
  private maxConcurrentJobs: number = 5;
  private maxHistorySize: number = 1000;
  private isProcessing: boolean = false;
  private jobIdCounter: number = 1;

  private constructor() {
    super();
    this.initializeQueue();
    this.startProcessing();
  }

  public static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  /**
   * Initialize job queue with all priority levels
   */
  private initializeQueue(): void {
    Object.values(JobPriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.jobQueue.set(priority, []);
      }
    });
  }

  /**
   * Add a new job to the queue
   */
  public async addJob(
    type: string,
    data: any,
    priority: JobPriority = JobPriority.NORMAL,
    timeout: number = 300000 // 5 minutes default
  ): Promise<string> {
    const jobId = `job_${this.jobIdCounter++}_${Date.now()}`;

    const job: Job = {
      id: jobId,
      type,
      data,
      status: JobStatus.PENDING,
      priority,
      createdAt: new Date(),
      retries: 0,
      maxRetries: 3,
      timeout,
    };

    // Add job to appropriate priority queue
    const queue = this.jobQueue.get(priority) || [];
    queue.push(job);
    this.jobQueue.set(priority, queue);

    // Sort queue by creation time (FIFO within same priority)
    queue.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    logger.info(`Job added to queue: ${jobId} (${type}) with priority ${priority}`);

    // Emit job added event
    this.emit('jobAdded', job);

    return jobId;
  }

  /**
   * Get job status by ID
   */
  public getJobStatus(jobId: string): Job | null {
    // Check active jobs first
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId) || null;
    }

    // Check job history
    return this.jobHistory.find(job => job.id === jobId) || null;
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): {
    totalPending: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
    queueSizes: Record<number, number>;
    activeJobTypes: string[];
  } {
    const stats = {
      totalPending: 0,
      totalRunning: this.activeJobs.size,
      totalCompleted: 0,
      totalFailed: 0,
      queueSizes: {} as Record<number, number>,
      activeJobTypes: Array.from(this.activeJobs.values()).map(job => job.type),
    };

    // Count pending jobs by priority
    this.jobQueue.forEach((queue, priority) => {
      const count = queue.length;
      stats.totalPending += count;
      stats.queueSizes[priority] = count;
    });

    // Count completed and failed jobs
    this.jobHistory.forEach(job => {
      if (job.status === JobStatus.COMPLETED) {
        stats.totalCompleted++;
      } else if (job.status === JobStatus.FAILED) {
        stats.totalFailed++;
      }
    });

    return stats;
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processNextJob();
  }

  /**
   * Process the next available job
   */
  private async processNextJob(): Promise<void> {
    if (!this.isProcessing) return;

    // Check if we can process more jobs
    if (this.activeJobs.size >= this.maxConcurrentJobs) {
      // Wait a bit and try again
      setTimeout(() => this.processNextJob(), 1000);
      return;
    }

    // Find the highest priority job
    const nextJob = this.getNextJob();

    if (nextJob) {
      await this.executeJob(nextJob);
    }

    // Continue processing
    setTimeout(() => this.processNextJob(), 100);
  }

  /**
   * Get the next job to process
   */
  private getNextJob(): Job | null {
    // Process jobs in priority order (highest first)
    const priorities = Array.from(this.jobQueue.keys()).sort((a, b) => b - a);

    for (const priority of priorities) {
      const queue = this.jobQueue.get(priority) || [];
      if (queue.length > 0) {
        const job = queue.shift();
        if (job) {
          this.jobQueue.set(priority, queue);
          return job;
        }
      }
    }

    return null;
  }

  /**
   * Execute a job
   */
  private async executeJob(job: Job): Promise<void> {
    // Update job status
    job.status = JobStatus.RUNNING;
    job.startedAt = new Date();

    // Add to active jobs
    this.activeJobs.set(job.id, job);

    logger.info(`Starting job: ${job.id} (${job.type})`);
    this.emit('jobStarted', job);

    try {
      // Execute the job
      const result = await this.executeJobByType(job);

      // Job completed successfully
      job.status = JobStatus.COMPLETED;
      job.result = result;
      job.completedAt = new Date();
      job.progress = 100;

      logger.info(`Job completed: ${job.id} (${job.type})`);
      this.emit('jobCompleted', job);
    } catch (error) {
      // Job failed
      job.status = JobStatus.FAILED;
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();

      logger.error(`Job failed: ${job.id} (${job.type}) - ${job.error}`);
      this.emit('jobFailed', job);
    } finally {
      // Remove from active jobs
      this.activeJobs.delete(job.id);

      // Add to history
      this.addToHistory(job);
    }
  }

  /**
   * Execute job based on type
   */
  private async executeJobByType(job: Job): Promise<any> {
    switch (job.type) {
      case 'dataMigration':
        return await this.executeDataMigration(job);
      case 'reportGeneration':
        return await this.executeReportGeneration(job);
      case 'analyticsProcessing':
        return await this.executeAnalyticsProcessing(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Execute data migration job
   */
  private async executeDataMigration(job: Job): Promise<any> {
    // Simulate data migration with progress updates
    for (let i = 0; i <= 100; i += 10) {
      job.progress = i;
      this.emit('jobProgress', job);
      await this.delay(100);
    }

    return { migratedRecords: Math.floor(Math.random() * 1000) + 100 };
  }

  /**
   * Execute report generation job
   */
  private async executeReportGeneration(job: Job): Promise<any> {
    // Simulate report generation
    for (let i = 0; i <= 100; i += 20) {
      job.progress = i;
      this.emit('jobProgress', job);
      await this.delay(200);
    }

    return { reportUrl: `/reports/${job.id}.pdf` };
  }

  /**
   * Execute analytics processing job
   */
  private async executeAnalyticsProcessing(job: Job): Promise<any> {
    // Simulate analytics processing
    for (let i = 0; i <= 100; i += 15) {
      job.progress = i;
      this.emit('jobProgress', job);
      await this.delay(150);
    }

    return { insights: ['insight1', 'insight2', 'insight3'] };
  }

  /**
   * Add job to history
   */
  private addToHistory(job: Job): void {
    this.jobHistory.push(job);

    // Maintain history size limit
    if (this.jobHistory.length > this.maxHistorySize) {
      this.jobHistory.shift();
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default BackgroundJobService;
