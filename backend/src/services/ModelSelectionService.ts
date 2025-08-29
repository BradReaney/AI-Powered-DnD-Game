import logger from './LoggerService';
import { config } from '../config';

export interface LLMTask {
  id: string;
  type: string;
  prompt: string;
  context?: string;
  complexity?: 'ultra-simple' | 'simple' | 'moderate' | 'complex';
  estimatedTokens?: number;
  requiresCreativity?: boolean;
  contextDependency?: 'low' | 'medium' | 'high';
  reasoningRequired?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskComplexity {
  complexity: 'ultra-simple' | 'simple' | 'moderate' | 'complex';
  estimatedTokens: number;
  requiresCreativity: boolean;
  contextDependency: 'low' | 'medium' | 'high';
  reasoningRequired: boolean;
  confidence: number;
}

export interface ModelSelection {
  model: 'flash-lite' | 'flash' | 'pro';
  reason: string;
  confidence: number;
  fallbackEnabled: boolean;
}

export class ModelSelectionService {
  private static instance: ModelSelectionService;
  private taskComplexityRules: Map<string, TaskComplexity> = new Map();
  private performanceMetrics: Map<string, any[]> = new Map();

  private constructor() {
    this.initializeTaskComplexityRules();
  }

  public static getInstance(): ModelSelectionService {
    if (!ModelSelectionService.instance) {
      ModelSelectionService.instance = new ModelSelectionService();
    }
    return ModelSelectionService.instance;
  }

  private initializeTaskComplexityRules(): void {
    // Pre-define complexity for known task types
    this.taskComplexityRules.set('character_generation', {
      complexity: 'moderate',
      estimatedTokens: 300,
      requiresCreativity: true,
      contextDependency: 'medium',
      reasoningRequired: false,
      confidence: 0.9,
    });

    this.taskComplexityRules.set('skill_check_result', {
      complexity: 'ultra-simple',
      estimatedTokens: 100,
      requiresCreativity: false,
      contextDependency: 'low',
      reasoningRequired: false,
      confidence: 0.95,
    });

    this.taskComplexityRules.set('campaign_scenario_generation', {
      complexity: 'complex',
      estimatedTokens: 800,
      requiresCreativity: true,
      contextDependency: 'high',
      reasoningRequired: true,
      confidence: 0.9,
    });

    this.taskComplexityRules.set('story_response', {
      complexity: 'moderate',
      estimatedTokens: 400,
      requiresCreativity: true,
      contextDependency: 'high',
      reasoningRequired: true,
      confidence: 0.85,
    });

    this.taskComplexityRules.set('world_description', {
      complexity: 'moderate',
      estimatedTokens: 350,
      requiresCreativity: true,
      contextDependency: 'medium',
      reasoningRequired: false,
      confidence: 0.8,
    });

    this.taskComplexityRules.set('npc_interaction', {
      complexity: 'moderate',
      estimatedTokens: 250,
      requiresCreativity: true,
      contextDependency: 'medium',
      reasoningRequired: false,
      confidence: 0.85,
    });

    this.taskComplexityRules.set('combat_description', {
      complexity: 'simple',
      estimatedTokens: 200,
      requiresCreativity: true,
      contextDependency: 'low',
      reasoningRequired: false,
      confidence: 0.8,
    });

    this.taskComplexityRules.set('quest_generation', {
      complexity: 'complex',
      estimatedTokens: 600,
      requiresCreativity: true,
      contextDependency: 'high',
      reasoningRequired: true,
      confidence: 0.9,
    });

    this.taskComplexityRules.set('basic_response', {
      complexity: 'ultra-simple',
      estimatedTokens: 80,
      requiresCreativity: false,
      contextDependency: 'low',
      reasoningRequired: false,
      confidence: 0.9,
    });

    this.taskComplexityRules.set('system_message', {
      complexity: 'ultra-simple',
      estimatedTokens: 50,
      requiresCreativity: false,
      contextDependency: 'low',
      reasoningRequired: false,
      confidence: 0.95,
    });

    this.taskComplexityRules.set('input_validation', {
      complexity: 'ultra-simple',
      estimatedTokens: 60,
      requiresCreativity: false,
      contextDependency: 'low',
      reasoningRequired: false,
      confidence: 0.9,
    });

    logger.info(`Initialized ${this.taskComplexityRules.size} task complexity rules`);
  }

  /**
   * Select the optimal model for a given task
   */
  public async selectOptimalModel(task: LLMTask): Promise<ModelSelection> {
    try {
      // If task has predefined complexity, use it
      if (task.complexity) {
        const model = this.selectModelBasedOnComplexity({
          complexity: task.complexity,
          estimatedTokens: task.estimatedTokens || 200,
          requiresCreativity: task.requiresCreativity || false,
          contextDependency: task.contextDependency || 'medium',
          reasoningRequired: task.reasoningRequired || false,
          confidence: 0.9,
        });

        return {
          model,
          reason: `Predefined complexity: ${task.complexity}`,
          confidence: 0.9,
          fallbackEnabled: config.gemini.threeModelFallbackEnabled,
        };
      }

      // Check if task type has predefined complexity rules
      const predefinedComplexity = this.taskComplexityRules.get(task.type);
      if (predefinedComplexity) {
        const model = this.selectModelBasedOnComplexity(predefinedComplexity);
        return {
          model,
          reason: `Predefined complexity for task type: ${task.type}`,
          confidence: predefinedComplexity.confidence,
          fallbackEnabled: config.gemini.threeModelFallbackEnabled,
        };
      }

      // Analyze task dynamically
      const complexity = await this.assessTaskComplexity(task);
      const model = this.selectModelBasedOnComplexity(complexity);
      const reason = this.getSelectionReason(complexity, model);

      logger.info('Model selection completed', {
        taskId: task.id,
        taskType: task.type,
        complexity: complexity.complexity,
        selectedModel: model,
        reason,
        confidence: complexity.confidence,
      });

      return {
        model,
        reason,
        confidence: complexity.confidence,
        fallbackEnabled: config.gemini.threeModelFallbackEnabled,
      };
    } catch (error) {
      logger.error('Error in model selection:', error);

      // Default to Flash-Lite for safety (most cost-effective)
      return {
        model: 'flash-lite',
        reason: 'Fallback due to selection error',
        confidence: 0.5,
        fallbackEnabled: true,
      };
    }
  }

  /**
   * Assess the complexity of a task dynamically
   */
  private async assessTaskComplexity(task: LLMTask): Promise<TaskComplexity> {
    const promptLength = task.prompt.length;
    const contextLength = task.context?.length || 0;
    const totalLength = promptLength + contextLength;

    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(totalLength / 4);

    // Analyze prompt content for complexity indicators
    const promptLower = task.prompt.toLowerCase();
    const contextLower = task.context?.toLowerCase() || '';

    // Check for creativity indicators
    const creativityKeywords = [
      'create',
      'generate',
      'imagine',
      'describe',
      'story',
      'narrative',
      'character',
      'world',
      'scenario',
      'adventure',
      'quest',
      'plot',
    ];
    const requiresCreativity = creativityKeywords.some(
      keyword => promptLower.includes(keyword) || contextLower.includes(keyword)
    );

    // Check for reasoning indicators
    const reasoningKeywords = [
      'analyze',
      'explain',
      'why',
      'how',
      'reason',
      'logic',
      'strategy',
      'plan',
      'decide',
      'choose',
      'compare',
      'evaluate',
      'solve',
    ];
    const reasoningRequired = reasoningKeywords.some(
      keyword => promptLower.includes(keyword) || contextLower.includes(keyword)
    );

    // Assess context dependency
    const contextDependency = this.assessContextDependency(contextLength);

    // Determine complexity level
    let complexity: 'ultra-simple' | 'simple' | 'moderate' | 'complex';

    if (
      estimatedTokens < 100 &&
      !requiresCreativity &&
      !reasoningRequired &&
      contextDependency === 'low'
    ) {
      complexity = 'ultra-simple';
    } else if (estimatedTokens < 300 && !reasoningRequired && contextDependency === 'low') {
      complexity = 'simple';
    } else if (estimatedTokens < 600 && !reasoningRequired) {
      complexity = 'moderate';
    } else {
      complexity = 'complex';
    }

    // Adjust confidence based on analysis quality
    let confidence = 0.8;
    if (promptLength > 50 && contextLength > 0) {
      confidence += 0.1;
    }
    if (complexity === 'ultra-simple' || complexity === 'complex') {
      confidence += 0.05;
    }

    return {
      complexity,
      estimatedTokens,
      requiresCreativity,
      contextDependency,
      reasoningRequired,
      confidence: Math.min(confidence, 0.95),
    };
  }

  private assessContextDependency(contextLength: number): 'low' | 'medium' | 'high' {
    if (contextLength < 200) return 'low';
    if (contextLength < 800) return 'medium';
    return 'high';
  }

  private selectModelBasedOnComplexity(complexity: TaskComplexity): 'flash-lite' | 'flash' | 'pro' {
    // Ultra-simple tasks: always use Flash-Lite
    if (complexity.complexity === 'ultra-simple') {
      return 'flash-lite';
    }

    // Simple tasks: use Flash
    if (complexity.complexity === 'simple') {
      return 'flash';
    }

    // Complex tasks: always use Pro
    if (complexity.complexity === 'complex') {
      return 'pro';
    }

    // Moderate complexity: use heuristics
    if (complexity.requiresCreativity && complexity.reasoningRequired) {
      return 'pro';
    }

    if (complexity.contextDependency === 'high' && complexity.estimatedTokens > 400) {
      return 'pro';
    }

    if (complexity.requiresCreativity && complexity.estimatedTokens > 300) {
      return 'flash';
    }

    // Default to Flash for moderate tasks
    return 'flash';
  }

  private getSelectionReason(
    complexity: TaskComplexity,
    model: 'flash-lite' | 'flash' | 'pro'
  ): string {
    switch (model) {
      case 'flash-lite':
        if (complexity.complexity === 'ultra-simple') {
          return 'Ultra-simple task - Flash-Lite model recommended for cost efficiency';
        }
        return 'Flash-Lite model selected for basic task';

      case 'flash':
        if (complexity.complexity === 'simple') {
          return 'Simple task - Flash model provides good balance of speed and capability';
        }
        if (complexity.requiresCreativity && !complexity.reasoningRequired) {
          return 'Creative task without complex reasoning - Flash model sufficient';
        }
        return 'Flash model selected for moderate complexity task';

      case 'pro':
        if (complexity.complexity === 'complex') {
          return 'Complex task - Pro model required for advanced reasoning and creativity';
        }
        if (complexity.requiresCreativity && complexity.reasoningRequired) {
          return 'Creative task requiring reasoning - Pro model recommended';
        }
        if (complexity.contextDependency === 'high' && complexity.estimatedTokens > 400) {
          return 'High context dependency with large token count - Pro model recommended';
        }
        return 'Pro model selected for advanced task requirements';

      default:
        return 'Model selection based on task analysis';
    }
  }

  /**
   * Get performance metrics for a specific model
   */
  public getModelPerformance(model: 'flash-lite' | 'flash' | 'pro'): any[] {
    return this.performanceMetrics.get(model) || [];
  }

  /**
   * Record performance metrics for model selection optimization
   */
  public recordModelPerformance(model: 'flash-lite' | 'flash' | 'pro', metrics: any): void {
    const modelMetrics = this.performanceMetrics.get(model) || [];
    modelMetrics.push({
      ...metrics,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics per model
    if (modelMetrics.length > 100) {
      modelMetrics.splice(0, modelMetrics.length - 100);
    }

    this.performanceMetrics.set(model, modelMetrics);
  }

  /**
   * Get task complexity rules for debugging
   */
  public getTaskComplexityRules(): Map<string, TaskComplexity> {
    return new Map(this.taskComplexityRules);
  }
}

export default ModelSelectionService;
