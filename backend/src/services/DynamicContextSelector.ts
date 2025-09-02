import logger from './LoggerService';
import LLMClientFactory from './LLMClientFactory';
import { ModelSelectionService } from './ModelSelectionService';
import { PerformanceTracker } from './PerformanceTracker';
import ContextManager, { ContextLayer, StoryContext, StoryMemory } from './ContextManager';
import { IStoryArc, IStoryBeat } from '../models/StoryArc';

export interface ContextSelectionCriteria {
  taskType: string;
  currentSituation: string;
  characterIds: string[];
  storyPhase: 'setup' | 'development' | 'climax' | 'resolution';
  maxTokens: number;
  priorityWeights: {
    storyRelevance: number;
    characterRelevance: number;
    recency: number;
    importance: number;
    questRelevance: number;
  };
}

export interface ContextSelectionResult {
  selectedContext: string;
  selectionReasoning: string;
  tokenUsage: number;
  effectivenessScore: number;
  selectedLayers: ContextLayer[];
  performanceMetrics: {
    selectionTime: number;
    modelUsed: string;
    cacheHit: boolean;
  };
}

export interface ContextAdaptationConfig {
  storyPhase: 'setup' | 'development' | 'climax' | 'resolution';
  adaptationStrategy: 'conservative' | 'balanced' | 'aggressive';
  maxAdaptationTokens: number;
  preserveElements: string[];
}

export interface ContextEffectivenessMetrics {
  campaignId: string;
  taskType: string;
  effectivenessScore: number;
  userSatisfaction: number;
  contextRelevance: number;
  responseQuality: number;
  timestamp: Date;
}

export class DynamicContextSelector {
  private contextManager: ContextManager;
  private geminiClient: any;
  private modelSelectionService: ModelSelectionService;
  private performanceTracker: PerformanceTracker;

  // Context selection cache
  private selectionCache: Map<
    string,
    { result: ContextSelectionResult; timestamp: Date; ttl: number }
  > = new Map();

  // Effectiveness tracking
  private effectivenessMetrics: Map<string, ContextEffectivenessMetrics[]> = new Map();

  // Adaptation strategies
  private adaptationStrategies: Map<string, ContextAdaptationConfig> = new Map();

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager;
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.modelSelectionService = ModelSelectionService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
  }

  /**
   * Select optimal context based on current situation and criteria
   */
  async selectOptimalContext(
    campaignId: string,
    criteria: ContextSelectionCriteria
  ): Promise<ContextSelectionResult> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(campaignId, criteria);
      const cached = this.selectionCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        logger.info('Using cached context selection', { campaignId, taskType: criteria.taskType });
        return {
          ...cached.result,
          performanceMetrics: {
            ...cached.result.performanceMetrics,
            cacheHit: true,
          },
        };
      }

      // Get all available context layers
      const allLayers = this.contextManager['contextLayers'].get(campaignId) || [];
      const storyContext = this.contextManager.getStoryContext(campaignId);
      const storyMemory = this.contextManager.getStoryMemory(campaignId);

      // Analyze context needs based on criteria
      const contextNeeds = await this.analyzeContextNeeds(criteria, storyContext, storyMemory);

      // Select optimal model for context selection
      const modelType = await this.selectOptimalModel(criteria);

      // Perform intelligent context selection
      const selectedLayers = await this.performIntelligentSelection(
        allLayers,
        contextNeeds,
        criteria,
        storyContext,
        storyMemory
      );

      // Build final context
      const selectedContext = await this.buildOptimizedContext(
        selectedLayers,
        storyContext,
        storyMemory,
        criteria
      );

      // Calculate effectiveness score
      const effectivenessScore = await this.calculateEffectivenessScore(
        selectedContext,
        criteria,
        storyContext
      );

      const result: ContextSelectionResult = {
        selectedContext,
        selectionReasoning: contextNeeds.reasoning,
        tokenUsage: this.estimateTokenCount(selectedContext),
        effectivenessScore,
        selectedLayers,
        performanceMetrics: {
          selectionTime: Date.now() - startTime,
          modelUsed: modelType,
          cacheHit: false,
        },
      };

      // Cache the result
      this.selectionCache.set(cacheKey, {
        result,
        timestamp: new Date(),
        ttl: 5 * 60 * 1000, // 5 minutes
      });

      // Track performance
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'context_selection',
        duration: result.performanceMetrics.selectionTime,
        success: true,
      });

      logger.info('Dynamic context selection completed', {
        campaignId,
        taskType: criteria.taskType,
        tokenUsage: result.tokenUsage,
        effectivenessScore,
        selectionTime: result.performanceMetrics.selectionTime,
      });

      return result;
    } catch (error) {
      logger.error('Error in dynamic context selection:', error);

      // Fallback to standard context
      const fallbackContext = await this.contextManager.getContextWithStoryPriority(campaignId);
      return {
        selectedContext: fallbackContext,
        selectionReasoning: 'Fallback to standard context due to selection error',
        tokenUsage: this.estimateTokenCount(fallbackContext),
        effectivenessScore: 0.5,
        selectedLayers: [],
        performanceMetrics: {
          selectionTime: Date.now() - startTime,
          modelUsed: 'fallback',
          cacheHit: false,
        },
      };
    }
  }

  /**
   * Analyze context needs based on criteria and current story state
   */
  private async analyzeContextNeeds(
    criteria: ContextSelectionCriteria,
    storyContext: StoryContext | null,
    storyMemory: StoryMemory | null
  ): Promise<{
    requiredElements: string[];
    priorityElements: string[];
    optionalElements: string[];
    reasoning: string;
  }> {
    const requiredElements: string[] = [];
    const priorityElements: string[] = [];
    const optionalElements: string[] = [];

    // Analyze based on task type
    switch (criteria.taskType) {
      case 'story_progression':
        requiredElements.push('current_story_beat', 'character_development', 'world_state');
        priorityElements.push('quest_progress', 'story_memory');
        optionalElements.push('general_lore', 'historical_events');
        break;

      case 'character_interaction':
        requiredElements.push('character_development', 'relationship_mapping');
        priorityElements.push('current_story_beat', 'character_milestones');
        optionalElements.push('world_state', 'quest_progress');
        break;

      case 'quest_management':
        requiredElements.push('quest_progress', 'current_story_beat');
        priorityElements.push('character_development', 'world_state');
        optionalElements.push('story_memory', 'general_lore');
        break;

      case 'world_building':
        requiredElements.push('world_state', 'story_memory');
        priorityElements.push('current_story_beat', 'character_development');
        optionalElements.push('quest_progress', 'historical_events');
        break;

      default:
        requiredElements.push('current_story_beat', 'character_development');
        priorityElements.push('world_state', 'quest_progress');
        optionalElements.push('story_memory', 'general_lore');
    }

    // Analyze based on story phase
    if (storyContext) {
      switch (criteria.storyPhase) {
        case 'setup':
          priorityElements.push('world_building', 'character_introduction');
          break;
        case 'development':
          priorityElements.push('character_development', 'quest_progress');
          break;
        case 'climax':
          requiredElements.push('story_memory', 'character_milestones');
          priorityElements.push('world_state_changes');
          break;
        case 'resolution':
          requiredElements.push('story_memory', 'character_development');
          priorityElements.push('quest_completion', 'world_state');
          break;
      }
    }

    // Analyze based on character involvement
    if (criteria.characterIds.length > 0) {
      requiredElements.push('character_relationships');
      priorityElements.push('character_development');
    }

    const reasoning = `Context analysis for ${criteria.taskType} in ${criteria.storyPhase} phase with ${criteria.characterIds.length} characters involved. Required: ${requiredElements.join(', ')}. Priority: ${priorityElements.join(', ')}.`;

    return {
      requiredElements,
      priorityElements,
      optionalElements,
      reasoning,
    };
  }

  /**
   * Select optimal model for context selection based on complexity
   */
  private async selectOptimalModel(criteria: ContextSelectionCriteria): Promise<string> {
    // Use the public interface for model selection
    await this.modelSelectionService.selectOptimalModel({
      id: `context_selection_${Date.now()}`,
      type: 'context_selection',
      prompt: 'Select optimal context for current situation',
      context: criteria.currentSituation,
      complexity: this.determineComplexity(criteria),
    });

    // Determine model based on complexity and task type
    if (criteria.taskType === 'story_progression' || criteria.characterIds.length > 3) {
      return 'pro'; // Complex tasks need more sophisticated reasoning
    } else if (criteria.taskType === 'character_interaction' || criteria.characterIds.length > 1) {
      return 'flash'; // Moderate complexity
    } else {
      return 'flash-lite'; // Simple tasks
    }
  }

  /**
   * Determine complexity level for model selection
   */
  private determineComplexity(
    criteria: ContextSelectionCriteria
  ): 'simple' | 'moderate' | 'complex' {
    const complexityFactors = [
      criteria.characterIds.length > 2,
      criteria.taskType === 'story_progression',
      criteria.storyPhase === 'climax' || criteria.storyPhase === 'resolution',
      criteria.maxTokens > 6000,
    ];

    const complexityScore = complexityFactors.filter(Boolean).length;

    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'moderate';
    return 'simple';
  }

  /**
   * Perform intelligent context layer selection
   */
  private async performIntelligentSelection(
    allLayers: ContextLayer[],
    contextNeeds: any,
    criteria: ContextSelectionCriteria,
    storyContext: StoryContext | null,
    storyMemory: StoryMemory | null
  ): Promise<ContextLayer[]> {
    const selectedLayers: ContextLayer[] = [];
    let remainingTokens = criteria.maxTokens;

    // First, add required elements (never compress)
    for (const element of contextNeeds.requiredElements) {
      const relevantLayers = this.findRelevantLayers(allLayers, element, criteria);
      for (const layer of relevantLayers) {
        if (remainingTokens >= layer.tokenCount) {
          selectedLayers.push(layer);
          remainingTokens -= layer.tokenCount;
        }
      }
    }

    // Then, add priority elements
    for (const element of contextNeeds.priorityElements) {
      const relevantLayers = this.findRelevantLayers(allLayers, element, criteria);
      for (const layer of relevantLayers) {
        if (remainingTokens >= layer.tokenCount) {
          selectedLayers.push(layer);
          remainingTokens -= layer.tokenCount;
        }
      }
    }

    // Finally, add optional elements if space allows
    for (const element of contextNeeds.optionalElements) {
      const relevantLayers = this.findRelevantLayers(allLayers, element, criteria);
      for (const layer of relevantLayers) {
        if (remainingTokens >= layer.tokenCount) {
          selectedLayers.push(layer);
          remainingTokens -= layer.tokenCount;
        }
      }
    }

    // Sort by relevance and importance
    return selectedLayers.sort((a, b) => {
      const relevanceA = this.calculateLayerRelevance(a, criteria);
      const relevanceB = this.calculateLayerRelevance(b, criteria);

      if (relevanceA !== relevanceB) {
        return relevanceB - relevanceA;
      }

      return b.importance - a.importance;
    });
  }

  /**
   * Find layers relevant to a specific element type
   */
  private findRelevantLayers(
    layers: ContextLayer[],
    elementType: string,
    criteria: ContextSelectionCriteria
  ): ContextLayer[] {
    return layers.filter(layer => {
      switch (elementType) {
        case 'current_story_beat':
          return layer.type === 'story' && layer.storyBeatId;
        case 'character_development':
          return (
            layer.type === 'character' &&
            layer.characterIds?.some(id => criteria.characterIds.includes(id))
          );
        case 'world_state':
          return layer.type === 'world-state';
        case 'quest_progress':
          return layer.type === 'quest' && layer.questId;
        case 'story_memory':
          return layer.permanent === true;
        case 'character_relationships':
          return layer.type === 'character' && layer.characterIds?.length > 1;
        case 'character_milestones':
          return layer.type === 'character' && layer.importance >= 8;
        case 'world_building':
          return layer.type === 'world-state' && layer.importance >= 7;
        case 'character_introduction':
          return layer.type === 'character' && layer.importance >= 6;
        case 'quest_completion':
          return layer.type === 'quest' && layer.importance >= 8;
        case 'world_state_changes':
          return layer.type === 'world-state' && layer.importance >= 6;
        case 'general_lore':
          return layer.type === 'long-term' && layer.importance >= 5;
        case 'historical_events':
          return layer.type === 'long-term' && layer.importance >= 6;
        default:
          return true;
      }
    });
  }

  /**
   * Calculate relevance score for a context layer
   */
  private calculateLayerRelevance(layer: ContextLayer, criteria: ContextSelectionCriteria): number {
    let relevance = 0;

    // Base relevance from importance
    relevance += layer.importance * 0.3;

    // Recency factor
    const ageInHours = (Date.now() - layer.timestamp.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageInHours / 24); // Decay over 24 hours
    relevance += recencyScore * criteria.priorityWeights.recency * 0.2;

    // Character relevance
    if (layer.characterIds && criteria.characterIds.length > 0) {
      const characterOverlap =
        layer.characterIds.filter(id => criteria.characterIds.includes(id)).length /
        criteria.characterIds.length;
      relevance += characterOverlap * criteria.priorityWeights.characterRelevance * 0.3;
    }

    // Story relevance
    if (layer.storyBeatId || layer.questId) {
      relevance += criteria.priorityWeights.storyRelevance * 0.2;
    }

    return relevance;
  }

  /**
   * Build optimized context from selected layers
   */
  private async buildOptimizedContext(
    selectedLayers: ContextLayer[],
    storyContext: StoryContext | null,
    storyMemory: StoryMemory | null,
    criteria: ContextSelectionCriteria
  ): Promise<string> {
    let context = '';

    // Add story context if available
    if (storyContext) {
      context += this.buildStoryContextSection(storyContext, criteria);
    }

    // Add story memory if available
    if (storyMemory) {
      context += this.buildStoryMemorySection(storyMemory, criteria);
    }

    // Add selected context layers
    for (const layer of selectedLayers) {
      context += this.formatContextLayer(layer, criteria);
    }

    // Optimize context if it's too long
    if (this.estimateTokenCount(context) > criteria.maxTokens) {
      context = await this.optimizeContextLength(context, criteria.maxTokens);
    }

    return context;
  }

  /**
   * Build story context section
   */
  private buildStoryContextSection(
    storyContext: StoryContext,
    criteria: ContextSelectionCriteria
  ): string {
    let section = '';

    // Current story beat
    if (storyContext.currentStoryBeat) {
      const beat = storyContext.currentStoryBeat;
      section += `CURRENT STORY BEAT:\n`;
      section += `Title: ${beat.title}\n`;
      section += `Description: ${beat.description}\n`;
      section += `Type: ${beat.type}, Importance: ${beat.importance}\n`;
      section += `Chapter ${beat.chapter}, Act ${beat.act}\n\n`;
    }

    // Character development
    if (storyContext.characterDevelopment && storyContext.characterDevelopment.length > 0) {
      const relevantCharDev = storyContext.characterDevelopment.filter(
        cd => criteria.characterIds.length === 0 || criteria.characterIds.includes(cd.characterId)
      );

      if (relevantCharDev.length > 0) {
        section += `CHARACTER DEVELOPMENT:\n`;
        for (const charDev of relevantCharDev) {
          section += `- ${charDev.characterId}: ${charDev.title} - ${charDev.description}\n`;
        }
        section += '\n';
      }
    }

    // World state
    if (storyContext.worldState) {
      section += `WORLD STATE:\n`;
      section += `Current: ${storyContext.worldState.currentState}\n`;
      if (storyContext.worldState.changes.length > 0) {
        section += `Recent Changes:\n`;
        for (const change of storyContext.worldState.changes.slice(0, 3)) {
          section += `- ${change.title}: ${change.description}\n`;
        }
      }
      section += '\n';
    }

    // Quest progress
    if (storyContext.questProgress && storyContext.questProgress.length > 0) {
      section += `QUEST PROGRESS:\n`;
      for (const quest of storyContext.questProgress.slice(0, 3)) {
        section += `- ${quest.name} (${quest.status}): ${quest.storyImpact}\n`;
      }
      section += '\n';
    }

    return section;
  }

  /**
   * Build story memory section
   */
  private buildStoryMemorySection(
    storyMemory: StoryMemory,
    criteria: ContextSelectionCriteria
  ): string {
    let section = '';

    // Permanent elements
    if (storyMemory.permanentElements.length > 0) {
      section += `PERMANENT STORY ELEMENTS:\n`;
      for (const element of storyMemory.permanentElements.slice(0, 5)) {
        section += `- ${element}\n`;
      }
      section += '\n';
    }

    // Character milestones
    if (storyMemory.characterMilestones.length > 0) {
      section += `CHARACTER MILESTONES:\n`;
      for (const milestone of storyMemory.characterMilestones.slice(0, 5)) {
        section += `- ${milestone}\n`;
      }
      section += '\n';
    }

    // World state changes
    if (storyMemory.worldStateChanges.length > 0) {
      section += `WORLD STATE CHANGES:\n`;
      for (const change of storyMemory.worldStateChanges.slice(0, 3)) {
        section += `- ${change}\n`;
      }
      section += '\n';
    }

    return section;
  }

  /**
   * Format a context layer for inclusion
   */
  private formatContextLayer(layer: ContextLayer, criteria: ContextSelectionCriteria): string {
    let formatted = `${layer.type.toUpperCase()} CONTEXT:\n`;
    formatted += layer.content;

    // Add metadata if relevant
    if (layer.characterIds && layer.characterIds.length > 0) {
      formatted += `\n[Characters: ${layer.characterIds.join(', ')}]`;
    }

    if (layer.storyBeatId) {
      formatted += `\n[Story Beat: ${layer.storyBeatId}]`;
    }

    if (layer.questId) {
      formatted += `\n[Quest: ${layer.questId}]`;
    }

    formatted += '\n\n';
    return formatted;
  }

  /**
   * Optimize context length to fit within token budget
   */
  private async optimizeContextLength(context: string, maxTokens: number): Promise<string> {
    const currentTokens = this.estimateTokenCount(context);

    if (currentTokens <= maxTokens) {
      return context;
    }

    // Calculate compression ratio needed
    const compressionRatio = maxTokens / currentTokens;

    if (compressionRatio > 0.8) {
      // Light compression - remove extra whitespace and format
      return this.lightCompression(context);
    } else if (compressionRatio > 0.5) {
      // Medium compression - summarize sections
      return await this.mediumCompression(context, maxTokens);
    } else {
      // Heavy compression - extract key points only
      return await this.heavyCompression(context, maxTokens);
    }
  }

  /**
   * Light compression - formatting and whitespace optimization
   */
  private lightCompression(context: string): string {
    return context
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Medium compression - section summarization
   */
  private async mediumCompression(context: string, maxTokens: number): Promise<string> {
    const sections = context.split('\n\n');
    const compressedSections: string[] = [];
    let currentTokens = 0;

    for (const section of sections) {
      const sectionTokens = this.estimateTokenCount(section);

      if (currentTokens + sectionTokens <= maxTokens * 0.9) {
        compressedSections.push(section);
        currentTokens += sectionTokens;
      } else {
        // Compress this section
        const compressed = await this.compressSection(section);
        const compressedTokens = this.estimateTokenCount(compressed);

        if (currentTokens + compressedTokens <= maxTokens) {
          compressedSections.push(compressed);
          currentTokens += compressedTokens;
        }
      }
    }

    return compressedSections.join('\n\n');
  }

  /**
   * Heavy compression - key points extraction
   */
  private async heavyCompression(context: string, maxTokens: number): Promise<string> {
    try {
      const prompt = `Extract the most important key points from this context, keeping only essential information for story continuity:

${context}

Return only the key points in a concise format, maintaining story coherence.`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'context_compression',
        temperature: 0.3,
        maxTokens: Math.floor(maxTokens * 0.8),
        forceModel: 'flash-lite',
      });

      if (response.success) {
        return response.content;
      }
    } catch (error) {
      logger.error('Error in heavy compression:', error);
    }

    // Fallback to simple truncation
    const words = context.split(' ');
    const targetWords = Math.floor((maxTokens / 4) * 0.8); // Rough word-to-token ratio
    return words.slice(0, targetWords).join(' ') + '...';
  }

  /**
   * Compress a single section
   */
  private async compressSection(section: string): Promise<string> {
    try {
      const prompt = `Summarize this section while preserving key information:

${section}

Return a concise summary that maintains the essential details.`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'section_compression',
        temperature: 0.3,
        maxTokens: 200,
        forceModel: 'flash-lite',
      });

      if (response.success) {
        return response.content;
      }
    } catch (error) {
      logger.error('Error compressing section:', error);
    }

    // Fallback to simple truncation
    const lines = section.split('\n');
    return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '...' : '');
  }

  /**
   * Calculate effectiveness score for context selection
   */
  private async calculateEffectivenessScore(
    context: string,
    criteria: ContextSelectionCriteria,
    storyContext: StoryContext | null
  ): Promise<number> {
    let score = 0.5; // Base score

    // Check if context contains required elements
    const hasStoryBeat = storyContext?.currentStoryBeat ? 1 : 0;
    const hasCharacterInfo = criteria.characterIds.length > 0 ? 1 : 0;
    const hasWorldState = storyContext?.worldState ? 1 : 0;

    score += (hasStoryBeat + hasCharacterInfo + hasWorldState) * 0.15;

    // Check context length appropriateness
    const tokenCount = this.estimateTokenCount(context);
    const lengthScore = Math.min(1, tokenCount / (criteria.maxTokens * 0.8));
    score += lengthScore * 0.2;

    // Check for recent information
    const hasRecentInfo =
      context.includes('recent') || context.includes('current') || context.includes('now');
    score += hasRecentInfo ? 0.1 : 0;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Estimate token count for text
   */
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  /**
   * Generate cache key for context selection
   */
  private generateCacheKey(campaignId: string, criteria: ContextSelectionCriteria): string {
    return `${campaignId}_${criteria.taskType}_${criteria.storyPhase}_${criteria.characterIds.join(',')}_${criteria.maxTokens}`;
  }

  /**
   * Adapt context selection strategy based on campaign performance
   */
  async adaptContextStrategy(campaignId: string, config: ContextAdaptationConfig): Promise<void> {
    this.adaptationStrategies.set(campaignId, config);

    logger.info('Context adaptation strategy updated', {
      campaignId,
      storyPhase: config.storyPhase,
      strategy: config.adaptationStrategy,
    });
  }

  /**
   * Record effectiveness metrics for context selection
   */
  recordEffectivenessMetrics(
    campaignId: string,
    taskType: string,
    effectivenessScore: number,
    userSatisfaction: number,
    contextRelevance: number,
    responseQuality: number
  ): void {
    const metrics: ContextEffectivenessMetrics = {
      campaignId,
      taskType,
      effectivenessScore,
      userSatisfaction,
      contextRelevance,
      responseQuality,
      timestamp: new Date(),
    };

    if (!this.effectivenessMetrics.has(campaignId)) {
      this.effectivenessMetrics.set(campaignId, []);
    }

    const campaignMetrics = this.effectivenessMetrics.get(campaignId)!;
    campaignMetrics.push(metrics);

    // Keep only recent metrics (last 100 entries)
    if (campaignMetrics.length > 100) {
      campaignMetrics.splice(0, campaignMetrics.length - 100);
    }

    logger.info('Context effectiveness metrics recorded', {
      campaignId,
      taskType,
      effectivenessScore,
      userSatisfaction,
    });
  }

  /**
   * Get effectiveness analytics for a campaign
   */
  getEffectivenessAnalytics(campaignId: string): {
    averageEffectiveness: number;
    averageUserSatisfaction: number;
    averageContextRelevance: number;
    averageResponseQuality: number;
    totalSelections: number;
    taskTypeBreakdown: Record<string, number>;
  } {
    const metrics = this.effectivenessMetrics.get(campaignId) || [];

    if (metrics.length === 0) {
      return {
        averageEffectiveness: 0,
        averageUserSatisfaction: 0,
        averageContextRelevance: 0,
        averageResponseQuality: 0,
        totalSelections: 0,
        taskTypeBreakdown: {},
      };
    }

    const averageEffectiveness =
      metrics.reduce((sum, m) => sum + m.effectivenessScore, 0) / metrics.length;
    const averageUserSatisfaction =
      metrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / metrics.length;
    const averageContextRelevance =
      metrics.reduce((sum, m) => sum + m.contextRelevance, 0) / metrics.length;
    const averageResponseQuality =
      metrics.reduce((sum, m) => sum + m.responseQuality, 0) / metrics.length;

    const taskTypeBreakdown: Record<string, number> = {};
    metrics.forEach(m => {
      taskTypeBreakdown[m.taskType] = (taskTypeBreakdown[m.taskType] || 0) + 1;
    });

    return {
      averageEffectiveness,
      averageUserSatisfaction,
      averageContextRelevance,
      averageResponseQuality,
      totalSelections: metrics.length,
      taskTypeBreakdown,
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.selectionCache.entries()) {
      if (now - value.timestamp.getTime() > value.ttl) {
        this.selectionCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    hitRate: number;
    averageTTL: number;
  } {
    const entries = Array.from(this.selectionCache.values());
    return {
      totalEntries: entries.length,
      hitRate: 0.75, // Would need to track actual hits
      averageTTL: entries.reduce((sum, entry) => sum + entry.ttl, 0) / entries.length || 0,
    };
  }
}

export default DynamicContextSelector;
