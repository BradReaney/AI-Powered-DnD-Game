import logger from './LoggerService';

export interface PerformanceMetrics {
  taskId: string;
  taskType: string;
  model: 'flash-lite' | 'flash' | 'pro';
  startTime: number;
  endTime: number;
  responseTime: number;
  tokenUsage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  cost: number;
  qualityScore?: number;
  success: boolean;
  error?: string;
  fallbackUsed?: boolean;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 10000; // Keep last 10k metrics

  private constructor() {}

  public static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  public startTask(
    taskId: string,
    taskType: string,
    model: 'flash-lite' | 'flash' | 'pro'
  ): number {
    const startTime = Date.now();

    logger.info('Task started', {
      taskId,
      taskType,
      model,
      startTime,
    });

    return startTime;
  }

  /**
   * Complete a task with simplified interface
   */
  public completeTask(taskId: string, responseTime: number, success: boolean): void {
    const endTime = Date.now();

    // Find the task in metrics to get model and taskType
    const existingTask = this.metrics.find(m => m.taskId === taskId);
    if (!existingTask) {
      logger.warn('Task not found for completion', { taskId });
      return;
    }

    const metrics: PerformanceMetrics = {
      ...existingTask,
      endTime,
      responseTime,
      success,
    };

    this.addMetrics(metrics);

    logger.info('Task completed', {
      taskId,
      responseTime,
      success,
    });
  }

  public endTask(
    taskId: string,
    taskType: string,
    model: 'flash-lite' | 'flash' | 'pro',
    startTime: number,
    tokenUsage: any,
    success: boolean,
    error?: string,
    fallbackUsed?: boolean
  ): void {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Calculate cost (approximate - adjust based on actual Gemini pricing)
    const cost = this.calculateCost(tokenUsage.totalTokens, model);

    const metrics: PerformanceMetrics = {
      taskId,
      taskType,
      model,
      startTime,
      endTime,
      responseTime,
      tokenUsage: {
        promptTokens: tokenUsage.promptTokens || 0,
        responseTokens: tokenUsage.responseTokens || 0,
        totalTokens: tokenUsage.totalTokens || 0,
      },
      cost,
      success,
      error,
      fallbackUsed,
    };

    this.addMetrics(metrics);

    logger.info('Task completed', {
      taskId,
      responseTime,
      tokenUsage: tokenUsage.totalTokens,
      cost,
      success,
      fallbackUsed,
    });
  }

  /**
   * Record performance metrics for model selection optimization
   */
  public recordModelPerformance(model: 'flash-lite' | 'flash' | 'pro', metrics: any): void {
    const modelMetrics = this.metrics.filter(m => m.model === model);
    modelMetrics.push({
      taskId: `perf_${Date.now()}`,
      taskType: metrics.taskType || 'unknown',
      model,
      startTime: Date.now() - metrics.duration,
      endTime: Date.now(),
      responseTime: metrics.duration,
      tokenUsage: {
        promptTokens: 0,
        responseTokens: 0,
        totalTokens: 0,
      },
      cost: 0,
      success: metrics.success || false,
      error: metrics.error,
      fallbackUsed: metrics.fallbackUsed || false,
    });

    // Keep only last 100 metrics per model
    if (modelMetrics.length > 100) {
      modelMetrics.splice(0, modelMetrics.length - 100);
    }
  }

  /**
   * Get performance metrics for a specific model
   */
  public getMetricsByModel(model: 'flash-lite' | 'flash' | 'pro'): PerformanceMetrics[] {
    return this.metrics.filter(m => m.model === model);
  }

  public getMetricsByTaskType(taskType: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.taskType === taskType);
  }

  public getAverageResponseTime(model?: 'flash-lite' | 'flash' | 'pro'): number {
    const relevantMetrics = model ? this.metrics.filter(m => m.model === model) : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return totalTime / relevantMetrics.length;
  }

  public getSuccessRate(model?: 'flash-lite' | 'flash' | 'pro'): number {
    const relevantMetrics = model ? this.metrics.filter(m => m.model === model) : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const successfulTasks = relevantMetrics.filter(m => m.success).length;
    return successfulTasks / relevantMetrics.length;
  }

  public getTotalCost(model?: 'flash-lite' | 'flash' | 'pro'): number {
    const relevantMetrics = model ? this.metrics.filter(m => m.model === model) : this.metrics;

    return relevantMetrics.reduce((sum, m) => sum + m.cost, 0);
  }

  public getModelPerformanceComparison(): {
    flashLite: { avgResponseTime: number; successRate: number; totalCost: number };
    flash: { avgResponseTime: number; successRate: number; totalCost: number };
    pro: { avgResponseTime: number; successRate: number; totalCost: number };
  } {
    return {
      flashLite: {
        avgResponseTime: this.getAverageResponseTime('flash-lite'),
        successRate: this.getSuccessRate('flash-lite'),
        totalCost: this.getTotalCost('flash-lite'),
      },
      flash: {
        avgResponseTime: this.getAverageResponseTime('flash'),
        successRate: this.getSuccessRate('flash'),
        totalCost: this.getTotalCost('flash'),
      },
      pro: {
        avgResponseTime: this.getAverageResponseTime('pro'),
        successRate: this.getSuccessRate('pro'),
        totalCost: this.getTotalCost('pro'),
      },
    };
  }

  private calculateCost(totalTokens: number, model: 'flash-lite' | 'flash' | 'pro'): number {
    // Approximate costs based on Gemini 2.5 pricing (adjust as needed)
    let inputCostPer1M: number;
    let outputCostPer1M: number;

    switch (model) {
      case 'flash-lite':
        // Flash-Lite is the most cost-effective
        inputCostPer1M = 0.05; // $0.05 per 1M input tokens
        outputCostPer1M = 0.15; // $0.15 per 1M output tokens
        break;
      case 'flash':
        // Flash is cost-effective for moderate tasks
        inputCostPer1M = 0.075; // $0.075 per 1M input tokens
        outputCostPer1M = 0.3; // $0.30 per 1M output tokens
        break;
      case 'pro':
        // Pro is more expensive but highest quality
        inputCostPer1M = 0.375; // $0.375 per 1M input tokens
        outputCostPer1M = 1.5; // $1.50 per 1M output tokens
        break;
      default:
        inputCostPer1M = 0.075;
        outputCostPer1M = 0.3;
    }

    // Assume 70% input, 30% output tokens for cost calculation
    const inputTokens = Math.floor(totalTokens * 0.7);
    const outputTokens = totalTokens - inputTokens;

    const inputCost = (inputTokens / 1000000) * inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * outputCostPer1M;

    return inputCost + outputCost;
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only the last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
    logger.info('Performance metrics cleared');
  }

  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

export default PerformanceTracker;
