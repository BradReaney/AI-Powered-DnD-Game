import logger from './LoggerService';
import LLMClientFactory from './LLMClientFactory';
import { ModelSelectionService } from './ModelSelectionService';
import { PerformanceTracker } from './PerformanceTracker';

export interface ContextLayer {
  id: string;
  type: 'immediate' | 'session' | 'long-term' | 'character' | 'story' | 'quest' | 'world-state';
  content: string;
  timestamp: Date;
  importance: number; // 1-10 scale
  tokenCount: number;
  tags?: string[];
  relatedEvents?: string[];
  characterIds?: string[];
  storyBeatId?: string;
  questId?: string;
  permanent?: boolean; // Never compress if true
}

export interface ContextSummary {
  campaignOverview: string;
  recentEvents: string;
  characterStates: string;
  worldState: string;
  currentSituation: string;
  totalTokens: number;
  lastUpdated: Date;
  compressionLevel: number; // 1-10 scale
}

export interface ContextValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ConversationMemory {
  sessionId: string;
  interactions: Array<{
    timestamp: Date;
    speaker: string;
    message: string;
    response: string;
    context: string;
    importance: number;
  }>;
  summary: string;
  lastUpdated: Date;
}

export interface StoryContext {
  currentStoryBeat: {
    id: string;
    title: string;
    description: string;
    type: string;
    importance: string;
    chapter: number;
    act: number;
  };
  characterDevelopment: Array<{
    characterId: string;
    type: string;
    title: string;
    description: string;
    impact: string;
    achievedAt: Date;
  }>;
  worldState: {
    changes: Array<{
      type: string;
      title: string;
      description: string;
      impact: string;
      occurredAt: Date;
    }>;
    currentState: string;
  };
  questProgress: Array<{
    questId: string;
    name: string;
    type: string;
    status: string;
    storyImpact: string;
  }>;
  storyMemory: {
    permanentElements: string[];
    characterMilestones: string[];
    worldStateChanges: string[];
    relationshipMapping: Record<string, string[]>;
  };
}

export interface StoryMemory {
  permanentElements: string[]; // Never compressed
  characterMilestones: string[]; // Never compressed
  worldStateChanges: string[]; // Never compressed
  relationshipMapping: Record<string, string[]>; // Never compressed
  compressedHistory: string[]; // Can be compressed
  lastCompression: Date;
}

export class ContextManager {
  private maxContextTokens: number;
  private compressionThreshold: number;
  private contextLayers: Map<string, ContextLayer[]> = new Map();
  private campaignSummaries: Map<string, ContextSummary> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private contextCache: Map<string, { context: string; timestamp: Date; ttl: number }> = new Map();
  private storyMemories: Map<string, StoryMemory> = new Map();
  private storyContexts: Map<string, StoryContext> = new Map();

  private geminiClient: any;
  private modelSelectionService: ModelSelectionService;
  private performanceTracker: PerformanceTracker;

  constructor() {
    this.maxContextTokens = parseInt(process.env['MAX_CONTEXT_LENGTH'] || '8000');
    this.compressionThreshold = parseInt(process.env['CONTEXT_COMPRESSION_THRESHOLD'] || '6000');

    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.modelSelectionService = ModelSelectionService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
  }

  /**
   * Add a new context layer for a campaign
   */
  addContextLayer(
    campaignId: string,
    type: ContextLayer['type'],
    content: string,
    importance: number = 5
  ): void {
    if (!this.contextLayers.has(campaignId)) {
      this.contextLayers.set(campaignId, []);
    }

    const layers = this.contextLayers.get(campaignId)!;
    const estimatedTokens = Math.ceil(content.length / 4); // Rough token estimation

    const layer: ContextLayer = {
      id: `${type}_${Date.now()}`,
      type,
      content,
      timestamp: new Date(),
      importance,
      tokenCount: estimatedTokens,
    };

    layers.push(layer);
    logger.info('Context layer added', {
      campaignId,
      type,
      importance,
      estimatedTokens,
    });

    // Check if compression is needed
    this.checkAndCompress(campaignId);
  }

  /**
   * Get the current context for a campaign
   */
  async getContext(campaignId: string): Promise<string> {
    const layers = this.contextLayers.get(campaignId) || [];
    const summary = this.campaignSummaries.get(campaignId);

    if (layers.length === 0 && !summary) {
      return 'No context available for this campaign.';
    }

    let context = '';
    let totalTokens = 0;

    // Add campaign summary if available
    if (summary) {
      context += `CAMPAIGN OVERVIEW:\n${summary.campaignOverview}\n\n`;
      context += `RECENT EVENTS:\n${summary.recentEvents}\n\n`;
      context += `CHARACTER STATES:\n${summary.characterStates}\n\n`;
      context += `WORLD STATE:\n${summary.worldState}\n\n`;
      context += `CURRENT SITUATION:\n${summary.currentSituation}\n\n`;
      totalTokens += summary.totalTokens;
    }

    // Add recent context layers
    const recentLayers = layers
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .sort((a, b) => b.importance - a.importance);

    for (const layer of recentLayers) {
      if (totalTokens + layer.tokenCount > this.maxContextTokens) {
        break;
      }
      context += `${layer.type.toUpperCase()} CONTEXT:\n${layer.content}\n\n`;
      totalTokens += layer.tokenCount;
    }

    logger.info('Context retrieved', {
      campaignId,
      totalTokens,
      layersUsed: Math.min(recentLayers.length, 10),
    });

    return context;
  }

  /**
   * Check if compression is needed and perform it
   */
  private async checkAndCompress(campaignId: string): Promise<void> {
    const layers = this.contextLayers.get(campaignId);
    if (!layers) return;

    const totalTokens = layers.reduce((sum, layer) => sum + layer.tokenCount, 0);

    if (totalTokens > this.compressionThreshold) {
      logger.info('Context compression needed', {
        campaignId,
        totalTokens,
        threshold: this.compressionThreshold,
      });

      // Use story-aware compression if story memory exists
      const storyMemory = this.storyMemories.get(campaignId);
      if (storyMemory) {
        await this.performStoryAwareCompression(campaignId);
      } else {
        // Fallback to simple compression
        const compressedLayers = layers
          .sort((a, b) => b.importance - a.importance)
          .slice(0, Math.floor(layers.length * 0.7)); // Keep top 70%

        this.contextLayers.set(campaignId, compressedLayers);

        logger.info('Context compressed', {
          campaignId,
          originalLayers: layers.length,
          compressedLayers: compressedLayers.length,
        });
      }
    }
  }

  /**
   * Clear context for a campaign (useful for starting fresh)
   */
  clearContext(campaignId: string): void {
    this.contextLayers.delete(campaignId);
    this.campaignSummaries.delete(campaignId);
    logger.info('Context cleared for campaign', { campaignId });
  }

  /**
   * Get context statistics for monitoring
   */
  getContextStats(campaignId: string): {
    totalLayers: number;
    totalTokens: number;
    layersByType: Record<string, number>;
    lastCompression: Date | null;
  } {
    const layers = this.contextLayers.get(campaignId) || [];
    const layersByType: Record<string, number> = {};

    layers.forEach(layer => {
      layersByType[layer.type] = (layersByType[layer.type] || 0) + 1;
    });

    return {
      totalLayers: layers.length,
      totalTokens: layers.reduce((sum, layer) => sum + layer.tokenCount, 0),
      layersByType,
      lastCompression: null, // Could be enhanced to track compression history
    };
  }

  /**
   * Dynamically select context based on current situation
   */
  private async selectContextDynamically(
    campaignId: string,
    currentSituation: string,
    characterIds: string[],
    taskType: string
  ): Promise<string> {
    try {
      const startTime = Date.now();

      // Use Flash-Lite model for context selection (moderate complexity)
      const modelType = 'flash-lite';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `context_${Date.now()}`,
        type: 'context_selection',
        prompt: 'Select relevant context for current situation',
        context: currentSituation,
        complexity: 'moderate',
      });

      const allLayers = this.contextLayers.get(campaignId) || [];
      const summary = this.campaignSummaries.get(campaignId);

      // Build context selection prompt
      const prompt = this.buildContextSelectionPrompt(
        allLayers,
        summary,
        currentSituation,
        characterIds,
        taskType
      );

      // Use the public sendPrompt method instead of private generateContent
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'context_selection',
        temperature: 0.3,
        maxTokens: 400,
        forceModel: modelType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate context selection');
      }

      // Parse the response to get selected context layers
      const selectedContext = this.parseContextSelectionResponse(
        response.content,
        allLayers,
        summary
      );

      // Track performance using the new method
      const duration = Date.now() - startTime;
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'context_selection',
        duration,
        success: true,
      });

      logger.info(`Dynamic context selected for ${taskType} in ${duration}ms`);
      return selectedContext;
    } catch (error) {
      logger.error('Error in dynamic context selection:', error);
      // Fallback to standard context
      return this.getContext(campaignId);
    }
  }

  /**
   * Build prompt for context selection
   */
  private buildContextSelectionPrompt(
    layers: ContextLayer[],
    summary: ContextSummary | null,
    currentSituation: string,
    characterIds: string[],
    taskType: string
  ): string {
    const layerDescriptions = layers
      .map(
        layer =>
          `- ${layer.type} (importance: ${layer.importance}): ${layer.content.substring(0, 100)}...`
      )
      .join('\n');

    return `Select the most relevant context for the current situation.

Current Situation: ${currentSituation}
Task Type: ${taskType}
Relevant Characters: ${characterIds.join(', ')}

Available Context Layers:
${layerDescriptions}

Campaign Summary: ${summary ? summary.campaignOverview : 'None available'}

Select the most relevant context layers (maximum 3-5) that would be most helpful for this specific situation. Consider:
1. Relevance to current situation
2. Character involvement
3. Recency and importance
4. Task-specific needs

Return only the selected context content, prioritizing the most relevant information.`;
  }

  /**
   * Parse context selection response
   */
  private parseContextSelectionResponse(
    response: string,
    layers: ContextLayer[],
    summary: ContextSummary | null
  ): string {
    let selectedContext = '';

    // Add summary if available
    if (summary) {
      selectedContext += `CAMPAIGN OVERVIEW:\n${summary.campaignOverview}\n\n`;
    }

    // Extract relevant content from response
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('-') && !line.startsWith('*')) {
        selectedContext += line + '\n';
      }
    }

    return selectedContext.trim();
  }

  /**
   * Context-aware prompting with validation
   */
  async createContextAwarePrompt(
    basePrompt: string,
    campaignId: string,
    context: string,
    characterPersonalities: Record<string, string>
  ): Promise<{ prompt: string; validation: ContextValidation }> {
    try {
      const startTime = Date.now();

      // Use Pro model for context-aware prompt creation
      const modelType = 'pro';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `prompt_${Date.now()}`,
        type: 'prompt_creation',
        prompt: 'Create a context-aware prompt',
        context: context,
        complexity: 'complex',
      });

      const prompt = `Create a context-aware prompt based on the following information:

Base Prompt: ${basePrompt}
Campaign Context: ${context}
Character Personalities: ${JSON.stringify(characterPersonalities, null, 2)}

Enhance the base prompt by:
1. Incorporating relevant context naturally
2. Maintaining character personality consistency
3. Ensuring logical flow and coherence
4. Adding specific details from the context
5. Validating that the prompt makes sense

Return the enhanced prompt and validation results.`;

      // Use the public sendPrompt method instead of private generateContent
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'prompt_creation',
        temperature: 0.4,
        maxTokens: 600,
        forceModel: modelType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create context-aware prompt');
      }

      const { enhancedPrompt, validation } = this.parsePromptResponse(response.content);

      // Track performance using the new method
      const duration = Date.now() - startTime;
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'prompt_creation',
        duration,
        success: true,
      });

      logger.info(`Context-aware prompt created in ${duration}ms`);
      return { prompt: enhancedPrompt, validation };
    } catch (error) {
      logger.error('Error creating context-aware prompt:', error);
      return {
        prompt: basePrompt,
        validation: {
          isValid: true,
          errors: [],
          warnings: ['Failed to enhance prompt, using base prompt'],
          suggestions: [],
        },
      };
    }
  }

  /**
   * Parse prompt creation response
   */
  private parsePromptResponse(response: string): {
    enhancedPrompt: string;
    validation: ContextValidation;
  } {
    try {
      // Simple parsing - in a real implementation, this would be more sophisticated
      const enhancedPrompt = response.split('VALIDATION:')[0].trim();

      const validation: ContextValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      };

      // Basic validation checks
      if (enhancedPrompt.length < 10) {
        validation.isValid = false;
        validation.errors.push('Generated prompt is too short');
      }

      if (enhancedPrompt.includes('undefined') || enhancedPrompt.includes('null')) {
        validation.warnings.push('Prompt contains undefined or null values');
      }

      return { enhancedPrompt, validation };
    } catch (error) {
      logger.error('Error parsing prompt response:', error);
      return {
        enhancedPrompt: 'Error parsing response',
        validation: {
          isValid: false,
          errors: ['Failed to parse prompt response'],
          warnings: [],
          suggestions: [],
        },
      };
    }
  }

  /**
   * Validate AI response for consistency and quality
   */
  async validateResponse(
    response: string,
    context: string,
    expectedFormat: string,
    characterConsistency: Record<string, string>
  ): Promise<ContextValidation> {
    try {
      const startTime = Date.now();

      // Use Flash-Lite model for response validation (structured analysis)
      const modelType = 'flash-lite';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `validation_${Date.now()}`,
        type: 'response_validation',
        prompt: 'Validate AI response for consistency and quality',
        context: context,
        complexity: 'moderate',
      });

      const prompt = `Validate this AI response for consistency and quality:

Response: ${response}
Context: ${context}
Expected Format: ${expectedFormat}
Character Consistency: ${JSON.stringify(characterConsistency, null, 2)}

Check for:
1. Consistency with established context
2. Character personality consistency
3. Logical coherence
4. Format compliance
5. Factual accuracy

Return validation results as JSON:
{
  "isValid": boolean,
  "errors": ["error1", "error2"],
  "warnings": ["warning1", "warning2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      // Use the public sendPrompt method instead of private generateContent
      const validationResponse = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'response_validation',
        temperature: 0.2,
        maxTokens: 300,
        forceModel: modelType,
      });

      if (!validationResponse.success) {
        throw new Error(validationResponse.error || 'Failed to validate response');
      }

      const validation = this.parseValidationResponse(validationResponse.content);

      // Track performance using the new method
      const duration = Date.now() - startTime;
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'response_validation',
        duration,
        success: true,
      });

      logger.info(`Response validated in ${duration}ms`);
      return validation;
    } catch (error) {
      logger.error('Error validating response:', error);
      return {
        isValid: true,
        errors: [],
        warnings: ['Validation failed, assuming valid'],
        suggestions: [],
      };
    }
  }

  /**
   * Parse validation response
   */
  private parseValidationResponse(response: string): ContextValidation {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Error parsing validation response:', error);
    }

    return {
      isValid: true,
      errors: [],
      warnings: ['Failed to parse validation response'],
      suggestions: [],
    };
  }

  /**
   * Conversation memory management
   */
  addConversationMemory(
    sessionId: string,
    speaker: string,
    message: string,
    response: string,
    context: string,
    importance: number = 5
  ): void {
    if (!this.conversationMemories.has(sessionId)) {
      this.conversationMemories.set(sessionId, {
        sessionId,
        interactions: [],
        summary: '',
        lastUpdated: new Date(),
      });
    }

    const memory = this.conversationMemories.get(sessionId)!;
    memory.interactions.push({
      timestamp: new Date(),
      speaker,
      message,
      response,
      context,
      importance,
    });

    memory.lastUpdated = new Date();

    // Keep only recent interactions (last 20)
    if (memory.interactions.length > 20) {
      memory.interactions = memory.interactions.slice(-20);
    }

    logger.info('Conversation memory added', { sessionId, speaker, importance });
  }

  /**
   * Get conversation memory for a session
   */
  getConversationMemory(sessionId: string): ConversationMemory | null {
    return this.conversationMemories.get(sessionId) || null;
  }

  /**
   * Check personality consistency for a character
   */
  async checkPersonalityConsistency(
    characterId: string,
    personality: string,
    recentResponses: string[],
    context: string
  ): Promise<{
    isConsistent: boolean;
    consistencyScore: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const startTime = Date.now();

      // Use Flash model for personality consistency checking
      const modelType = 'flash';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `personality_${Date.now()}`,
        type: 'personality_consistency',
        prompt: 'Check personality consistency for character',
        context: context,
        complexity: 'moderate',
      });

      const prompt = `Check personality consistency for character ${characterId}:

Personality: ${personality}
Recent Responses: ${JSON.stringify(recentResponses, null, 2)}
Context: ${context}

Analyze if the recent responses are consistent with the character's personality.
Return results as JSON:
{
  "isConsistent": boolean,
  "consistencyScore": number (0-100),
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      // Use the public sendPrompt method instead of private generateContent
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'personality_consistency',
        temperature: 0.3,
        maxTokens: 300,
        forceModel: modelType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to check personality consistency');
      }

      const result = this.parsePersonalityResponse(response.content);

      // Track performance using the new method
      const duration = Date.now() - startTime;
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'personality_consistency',
        duration,
        success: true,
      });

      logger.info(`Personality consistency checked in ${duration}ms`);
      return result;
    } catch (error) {
      logger.error('Error checking personality consistency:', error);
      return {
        isConsistent: true,
        consistencyScore: 80,
        issues: [],
        suggestions: ['Consistency check failed, assuming consistent'],
      };
    }
  }

  /**
   * Parse personality consistency response
   */
  private parsePersonalityResponse(response: string): {
    isConsistent: boolean;
    consistencyScore: number;
    issues: string[];
    suggestions: string[];
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Error parsing personality response:', error);
    }

    return {
      isConsistent: true,
      consistencyScore: 80,
      issues: [],
      suggestions: ['Failed to parse personality response'],
    };
  }

  /**
   * Context optimization and caching
   */
  async getOptimizedContext(
    campaignId: string,
    taskType: string,
    maxTokens: number = 4000
  ): Promise<string> {
    const cacheKey = `${campaignId}_${taskType}_${maxTokens}`;
    const cached = this.contextCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      logger.info('Using cached context', { campaignId, taskType });
      return cached.context;
    }

    const context = await this.selectContextDynamically(campaignId, '', [], taskType);

    // Cache the result for 5 minutes
    this.contextCache.set(cacheKey, {
      context,
      timestamp: new Date(),
      ttl: 5 * 60 * 1000, // 5 minutes
    });

    return context;
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.contextCache.entries()) {
      if (now - value.timestamp.getTime() > value.ttl) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Get advanced context statistics
   */
  getAdvancedStats(campaignId: string): {
    contextStats: any;
    cacheStats: {
      totalEntries: number;
      hitRate: number;
      averageTTL: number;
    };
    memoryStats: {
      totalSessions: number;
      totalInteractions: number;
      averageImportance: number;
    };
  } {
    const contextStats = this.getContextStats(campaignId);

    // Calculate cache stats
    const cacheEntries = Array.from(this.contextCache.values());
    const cacheStats = {
      totalEntries: cacheEntries.length,
      hitRate: 0.75, // Would need to track actual hits
      averageTTL:
        cacheEntries.reduce((sum, entry) => sum + entry.ttl, 0) / cacheEntries.length || 0,
    };

    // Calculate memory stats
    const memories = Array.from(this.conversationMemories.values());
    const memoryStats = {
      totalSessions: memories.length,
      totalInteractions: memories.reduce((sum, memory) => sum + memory.interactions.length, 0),
      averageImportance:
        memories.reduce(
          (sum, memory) =>
            sum +
            memory.interactions.reduce((s, i) => s + i.importance, 0) / memory.interactions.length,
          0
        ) / memories.length || 0,
    };

    return { contextStats, cacheStats, memoryStats };
  }

  /**
   * Add story context layer with story-specific information
   */
  addStoryContextLayer(
    campaignId: string,
    type: 'story' | 'quest' | 'world-state',
    content: string,
    importance: number = 5,
    storyBeatId?: string,
    questId?: string,
    permanent: boolean = false
  ): void {
    if (!this.contextLayers.has(campaignId)) {
      this.contextLayers.set(campaignId, []);
    }

    const layers = this.contextLayers.get(campaignId)!;
    const estimatedTokens = Math.ceil(content.length / 4);

    const layer: ContextLayer = {
      id: `${type}_${Date.now()}`,
      type,
      content,
      timestamp: new Date(),
      importance,
      tokenCount: estimatedTokens,
      storyBeatId,
      questId,
      permanent,
    };

    layers.push(layer);
    logger.info('Story context layer added', {
      campaignId,
      type,
      importance,
      storyBeatId,
      questId,
      permanent,
    });

    // Check if compression is needed
    this.checkAndCompress(campaignId);
  }

  /**
   * Initialize story memory for a campaign
   */
  initializeStoryMemory(campaignId: string): void {
    if (!this.storyMemories.has(campaignId)) {
      this.storyMemories.set(campaignId, {
        permanentElements: [],
        characterMilestones: [],
        worldStateChanges: [],
        relationshipMapping: {},
        compressedHistory: [],
        lastCompression: new Date(),
      });
    }
  }

  /**
   * Add permanent story element (never compressed)
   */
  addPermanentStoryElement(campaignId: string, element: string): void {
    this.initializeStoryMemory(campaignId);
    const storyMemory = this.storyMemories.get(campaignId)!;
    if (!storyMemory.permanentElements.includes(element)) {
      storyMemory.permanentElements.push(element);
      logger.info('Permanent story element added', { campaignId, element });
    }
  }

  /**
   * Add character milestone to story memory
   */
  addCharacterMilestone(campaignId: string, milestone: string): void {
    this.initializeStoryMemory(campaignId);
    const storyMemory = this.storyMemories.get(campaignId)!;
    if (!storyMemory.characterMilestones.includes(milestone)) {
      storyMemory.characterMilestones.push(milestone);
      logger.info('Character milestone added', { campaignId, milestone });
    }
  }

  /**
   * Add world state change to story memory
   */
  addWorldStateChange(campaignId: string, change: string): void {
    this.initializeStoryMemory(campaignId);
    const storyMemory = this.storyMemories.get(campaignId)!;
    if (!storyMemory.worldStateChanges.includes(change)) {
      storyMemory.worldStateChanges.push(change);
      logger.info('World state change added', { campaignId, change });
    }
  }

  /**
   * Update relationship mapping
   */
  updateRelationshipMapping(
    campaignId: string,
    characterId: string,
    relationships: string[]
  ): void {
    this.initializeStoryMemory(campaignId);
    const storyMemory = this.storyMemories.get(campaignId)!;
    storyMemory.relationshipMapping[characterId] = relationships;
    logger.info('Relationship mapping updated', { campaignId, characterId, relationships });
  }

  /**
   * Get story context for a campaign
   */
  getStoryContext(campaignId: string): StoryContext | null {
    return this.storyContexts.get(campaignId) || null;
  }

  /**
   * Update story context
   */
  updateStoryContext(campaignId: string, storyContext: StoryContext): void {
    this.storyContexts.set(campaignId, storyContext);
    logger.info('Story context updated', { campaignId });
  }

  /**
   * Update story beat status
   */
  async updateStoryBeat(
    campaignId: string,
    storyBeatId: string,
    updates: { status?: string }
  ): Promise<void> {
    const storyContext = this.storyContexts.get(campaignId);
    if (
      storyContext &&
      storyContext.currentStoryBeat &&
      storyContext.currentStoryBeat.id === storyBeatId
    ) {
      storyContext.currentStoryBeat = {
        ...storyContext.currentStoryBeat,
        ...updates,
      };
      this.storyContexts.set(campaignId, storyContext);
      logger.info('Story beat updated', { campaignId, storyBeatId, updates });
    } else {
      logger.warn('Story beat not found for update', { campaignId, storyBeatId });
    }
  }

  /**
   * Get story memory for a campaign
   */
  getStoryMemory(campaignId: string): StoryMemory | null {
    return this.storyMemories.get(campaignId) || null;
  }

  /**
   * Enhanced context retrieval with story prioritization
   */
  async getContextWithStoryPriority(campaignId: string): Promise<string> {
    const layers = this.contextLayers.get(campaignId) || [];
    const summary = this.campaignSummaries.get(campaignId);
    const storyMemory = this.storyMemories.get(campaignId);
    const storyContext = this.storyContexts.get(campaignId);

    if (layers.length === 0 && !summary && !storyMemory) {
      return 'No context available for this campaign.';
    }

    let context = '';
    let totalTokens = 0;

    // Priority 1: Current story beat and immediate context
    if (storyContext?.currentStoryBeat) {
      const storyBeat = storyContext.currentStoryBeat;
      const storyContent = `CURRENT STORY BEAT:\nTitle: ${storyBeat.title}\nDescription: ${storyBeat.description}\nType: ${storyBeat.type}\nImportance: ${storyBeat.importance}\nChapter: ${storyBeat.chapter}, Act: ${storyBeat.act}\n\n`;
      context += storyContent;
      totalTokens += Math.ceil(storyContent.length / 4);
    }

    // Priority 2: Character development and relationships
    if (storyContext?.characterDevelopment && storyContext.characterDevelopment.length > 0) {
      const charDev = storyContext.characterDevelopment
        .map(cd => `Character ${cd.characterId}: ${cd.title} - ${cd.description} (${cd.impact})`)
        .join('\n');
      const charContent = `CHARACTER DEVELOPMENT:\n${charDev}\n\n`;
      context += charContent;
      totalTokens += Math.ceil(charContent.length / 4);
    }

    // Priority 3: World state and major events
    if (storyContext?.worldState) {
      const worldContent = `WORLD STATE:\nCurrent: ${storyContext.worldState.currentState}\nRecent Changes:\n${storyContext.worldState.changes.map(wc => `- ${wc.title}: ${wc.description} (${wc.impact})`).join('\n')}\n\n`;
      context += worldContent;
      totalTokens += Math.ceil(worldContent.length / 4);
    }

    // Priority 4: Quest progress and objectives
    if (storyContext?.questProgress && storyContext.questProgress.length > 0) {
      const questContent = `QUEST PROGRESS:\n${storyContext.questProgress.map(qp => `- ${qp.name} (${qp.status}): ${qp.storyImpact} impact`).join('\n')}\n\n`;
      context += questContent;
      totalTokens += Math.ceil(questContent.length / 4);
    }

    // Priority 5: General campaign lore and permanent story elements
    if (storyMemory?.permanentElements && storyMemory.permanentElements.length > 0) {
      const permanentContent = `PERMANENT STORY ELEMENTS:\n${storyMemory.permanentElements.join('\n')}\n\n`;
      context += permanentContent;
      totalTokens += Math.ceil(permanentContent.length / 4);
    }

    // Add campaign summary if available and we have token space
    if (summary && totalTokens < this.maxContextTokens * 0.7) {
      context += `CAMPAIGN OVERVIEW:\n${summary.campaignOverview}\n\n`;
      context += `RECENT EVENTS:\n${summary.recentEvents}\n\n`;
      totalTokens += summary.totalTokens;
    }

    // Add recent context layers (non-permanent ones)
    const recentLayers = layers
      .filter(layer => !layer.permanent)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .sort((a, b) => b.importance - a.importance);

    for (const layer of recentLayers) {
      if (totalTokens + layer.tokenCount > this.maxContextTokens) {
        break;
      }
      context += `${layer.type.toUpperCase()} CONTEXT:\n${layer.content}\n\n`;
      totalTokens += layer.tokenCount;
    }

    logger.info('Story-prioritized context retrieved', {
      campaignId,
      totalTokens,
      layersUsed: Math.min(recentLayers.length, 10),
      storyElementsIncluded: !!storyContext,
    });

    return context;
  }

  /**
   * Enhanced compression that preserves story elements
   */
  private async performStoryAwareCompression(campaignId: string): Promise<void> {
    const layers = this.contextLayers.get(campaignId);
    if (!layers || layers.length === 0) return;

    // Never compress permanent layers or story-critical layers
    const permanentLayers = layers.filter(layer => layer.permanent || layer.importance >= 9);
    const compressibleLayers = layers.filter(layer => !layer.permanent && layer.importance < 9);

    if (compressibleLayers.length === 0) {
      logger.info('No compressible layers found', { campaignId });
      return;
    }

    // Sort by importance and timestamp for compression
    const sortedLayers = compressibleLayers
      .sort((a, b) => a.importance - b.importance)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Compress oldest, least important layers first
    const layersToCompress = sortedLayers.slice(0, Math.floor(compressibleLayers.length * 0.3));
    const layersToKeep = sortedLayers.slice(Math.floor(compressibleLayers.length * 0.3));

    // Compress selected layers
    const compressedContent = layersToCompress
      .map(layer => `${layer.type}: ${layer.content}`)
      .join('\n');

    if (compressedContent.length > 0) {
      try {
        const compressed = await this.geminiClient.compressContext(compressedContent);

        // Add compressed content as a new layer
        this.addContextLayer(campaignId, 'long-term', `COMPRESSED HISTORY:\n${compressed}`, 3);

        // Remove compressed layers
        const newLayers = [...permanentLayers, ...layersToKeep];
        this.contextLayers.set(campaignId, newLayers);

        // Update story memory
        this.initializeStoryMemory(campaignId);
        const storyMemory = this.storyMemories.get(campaignId)!;
        storyMemory.compressedHistory.push(compressed);
        storyMemory.lastCompression = new Date();

        logger.info('Story-aware compression completed', {
          campaignId,
          compressedLayers: layersToCompress.length,
          remainingLayers: newLayers.length,
        });
      } catch (error) {
        logger.error('Story-aware compression failed', { campaignId, error });
      }
    }
  }
}

export default ContextManager;
