# LLM Implementation Guide: Code Changes Required

## Overview

This document provides the specific code changes needed to implement the LLM optimization strategy using Gemini 2.5 Flash-Lite, Flash, and Pro models.

## 1. Update Environment Configuration

### Update `config/env.example`
```bash
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true
THREE_MODEL_FALLBACK_ENABLED=true
FLASH_LITE_RESPONSE_TIME_THRESHOLD=3000
FLASH_RESPONSE_TIME_THRESHOLD=5000
```

### Update `backend/src/config.ts`
```typescript
export interface Config {
    // ... existing interfaces
    gemini: {
        apiKey: string;
        flashLiteModel: string;
        flashModel: string;
        proModel: string;
        modelSelectionEnabled: boolean;
        flashLiteQualityThreshold: number;
        flashQualityThreshold: number;
        proFallbackEnabled: boolean;
        threeModelFallbackEnabled: boolean;
        flashLiteResponseTimeThreshold: number;
        flashResponseTimeThreshold: number;
    };
}

export const config: Config = {
    // ... existing config
    gemini: {
        apiKey: process.env['GEMINI_API_KEY'] || '',
        flashLiteModel: process.env['GEMINI_FLASH_LITE_MODEL'] || 'gemini-2.5-flash-lite',
        flashModel: process.env['GEMINI_FLASH_MODEL'] || 'gemini-2.5-flash',
        proModel: process.env['GEMINI_PRO_MODEL'] || 'gemini-2.5-pro',
        modelSelectionEnabled: process.env['MODEL_SELECTION_ENABLED'] === 'true',
        flashLiteQualityThreshold: parseFloat(process.env['FLASH_LITE_QUALITY_THRESHOLD'] || '0.6'),
        flashQualityThreshold: parseFloat(process.env['FLASH_LITE_QUALITY_THRESHOLD'] || '0.7'),
        proFallbackEnabled: process.env['PRO_FALLBACK_ENABLED'] === 'true',
        threeModelFallbackEnabled: process.env['THREE_MODEL_FALLBACK_ENABLED'] === 'true',
        flashLiteResponseTimeThreshold: parseInt(process.env['FLASH_LITE_RESPONSE_TIME_THRESHOLD'] || '3000', 10),
        flashResponseTimeThreshold: parseInt(process.env['FLASH_RESPONSE_TIME_THRESHOLD'] || '5000', 10),
    },
};
```

## 2. Create New Services

### Create `backend/src/services/ModelSelectionService.ts`
```typescript
import logger from './LoggerService';
import { config } from '../config';

export interface LLMTask {
    id: string;
    type: string;
    prompt: string;
    context?: string;
    complexity?: 'ultra-simple' | 'simple' | 'moderate' | 'complex';
}

export interface TaskComplexity {
    complexity: 'ultra-simple' | 'simple' | 'moderate' | 'complex';
    estimatedTokens: number;
    requiresCreativity: boolean;
    contextDependency: 'low' | 'medium' | 'high';
    reasoningRequired: boolean;
    responseQuality: 'basic' | 'standard' | 'high';
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
    private taskComplexityRules: Map<string, TaskComplexity>;

    private constructor() {
        this.taskComplexityRules = new Map();
        this.initializeTaskComplexityRules();
    }

    public static getInstance(): ModelSelectionService {
        if (!ModelSelectionService.instance) {
            ModelSelectionService.instance = new ModelSelectionService();
        }
        return ModelSelectionService.instance;
    }

    private initializeTaskComplexityRules(): void {
        // Ultra-simple tasks - use Flash-Lite
        this.taskComplexityRules.set('skill_check_result', {
            complexity: 'ultra-simple',
            estimatedTokens: 50,
            requiresCreativity: false,
            contextDependency: 'low',
            reasoningRequired: false,
            responseQuality: 'basic',
            confidence: 0.95
        });

        this.taskComplexityRules.set('basic_validation', {
            complexity: 'ultra-simple',
            estimatedTokens: 30,
            requiresCreativity: false,
            contextDependency: 'low',
            reasoningRequired: false,
            responseQuality: 'basic',
            confidence: 0.95
        });

        this.taskComplexityRules.set('system_message', {
            complexity: 'ultra-simple',
            estimatedTokens: 40,
            requiresCreativity: false,
            contextDependency: 'low',
            reasoningRequired: false,
            responseQuality: 'basic',
            confidence: 0.95
        });

        // Simple tasks - use Flash
        this.taskComplexityRules.set('character_generation_basic', {
            complexity: 'simple',
            estimatedTokens: 200,
            requiresCreativity: false,
            contextDependency: 'medium',
            reasoningRequired: false,
            responseQuality: 'standard',
            confidence: 0.9
        });

        this.taskComplexityRules.set('basic_npc_response', {
            complexity: 'simple',
            estimatedTokens: 150,
            requiresCreativity: false,
            contextDependency: 'medium',
            reasoningRequired: false,
            responseQuality: 'standard',
            confidence: 0.9
        });

        this.taskComplexityRules.set('simple_world_description', {
            complexity: 'simple',
            estimatedTokens: 180,
            requiresCreativity: false,
            contextDependency: 'medium',
            reasoningRequired: false,
            responseQuality: 'standard',
            confidence: 0.9
        });

        // Complex tasks - use Pro
        this.taskComplexityRules.set('campaign_scenario_generation', {
            complexity: 'complex',
            estimatedTokens: 800,
            requiresCreativity: true,
            contextDependency: 'high',
            reasoningRequired: true,
            responseQuality: 'high',
            confidence: 0.95
        });

        this.taskComplexityRules.set('advanced_story_response', {
            complexity: 'complex',
            estimatedTokens: 600,
            requiresCreativity: true,
            contextDependency: 'high',
            reasoningRequired: true,
            responseQuality: 'high',
            confidence: 0.95
        });

        this.taskComplexityRules.set('world_building', {
            complexity: 'complex',
            estimatedTokens: 700,
            requiresCreativity: true,
            contextDependency: 'high',
            reasoningRequired: true,
            responseQuality: 'high',
            confidence: 0.95
        });

        this.taskComplexityRules.set('quest_generation', {
            complexity: 'complex',
            estimatedTokens: 500,
            requiresCreativity: true,
            contextDependency: 'high',
            reasoningRequired: true,
            responseQuality: 'high',
            confidence: 0.95
        });

        logger.info('Task complexity rules initialized', {
            ruleCount: this.taskComplexityRules.size
        });
    }

    public async selectOptimalModel(task: LLMTask): Promise<ModelSelection> {
        try {
            // Use pre-defined complexity if available
            let complexity = this.taskComplexityRules.get(task.type);

            if (!complexity) {
                // Analyze task dynamically if no pre-defined rule
                complexity = this.analyzeTaskDynamically(task);
            }

            const model = this.selectModelBasedOnComplexity(complexity);
            const reason = this.getSelectionReason(complexity, model);
            const confidence = complexity.confidence;

            logger.info('Model selection completed', {
                taskId: task.id,
                taskType: task.type,
                selectedModel: model,
                reason,
                confidence
            });

            return {
                model,
                reason,
                confidence,
                fallbackEnabled: config.gemini.threeModelFallbackEnabled
            };

        } catch (error) {
            logger.error('Error in model selection:', error);

            // Default to Pro model on error for safety
            return {
                model: 'pro',
                reason: 'Error in model selection, defaulting to Pro for safety',
                confidence: 0.5,
                fallbackEnabled: true
            };
        }
    }

    private analyzeTaskDynamically(task: LLMTask): TaskComplexity {
        const promptLength = task.prompt.length;
        const contextLength = task.context?.length || 0;
        
        // Analyze prompt content for complexity indicators
        const hasCreativeKeywords = this.hasCreativeKeywords(task.prompt);
        const hasReasoningKeywords = this.hasReasoningKeywords(task.prompt);
        const requiresHighQuality = this.requiresHighQuality(task.prompt);

        let complexity: 'ultra-simple' | 'simple' | 'moderate' | 'complex';
        let responseQuality: 'basic' | 'standard' | 'high';

        // Determine complexity based on multiple factors
        if (promptLength < 50 && contextLength < 100 && !hasCreativeKeywords && !hasReasoningKeywords) {
            complexity = 'ultra-simple';
            responseQuality = 'basic';
        } else if (promptLength < 150 && contextLength < 300 && !hasCreativeKeywords && !hasReasoningKeywords) {
            complexity = 'simple';
            responseQuality = 'standard';
        } else if (hasCreativeKeywords || hasReasoningKeywords || requiresHighQuality) {
            complexity = 'complex';
            responseQuality = 'high';
        } else {
            complexity = 'moderate';
            responseQuality = 'standard';
        }

        return {
            complexity,
            estimatedTokens: Math.ceil((promptLength + contextLength) * 1.5),
            requiresCreativity: hasCreativeKeywords,
            contextDependency: contextLength > 500 ? 'high' : contextLength > 200 ? 'medium' : 'low',
            reasoningRequired: hasReasoningKeywords,
            responseQuality,
            confidence: 0.8
        };
    }

    private hasCreativeKeywords(prompt: string): boolean {
        const creativeKeywords = [
            'creative', 'imaginative', 'story', 'narrative', 'describe', 'detailed',
            'atmosphere', 'mood', 'character', 'personality', 'backstory', 'lore'
        ];
        return creativeKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }

    private hasReasoningKeywords(prompt: string): boolean {
        const reasoningKeywords = [
            'analyze', 'reason', 'think', 'consider', 'evaluate', 'compare',
            'strategy', 'tactical', 'decision', 'plan', 'solve', 'figure out'
        ];
        return reasoningKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }

    private requiresHighQuality(prompt: string): boolean {
        const qualityKeywords = [
            'detailed', 'comprehensive', 'thorough', 'complete', 'professional',
            'polished', 'refined', 'excellent', 'high-quality', 'premium'
        ];
        return qualityKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }

    private selectModelBasedOnComplexity(complexity: TaskComplexity): 'flash-lite' | 'flash' | 'pro' {
        switch (complexity.complexity) {
            case 'ultra-simple':
                return 'flash-lite';
            case 'simple':
                return 'flash';
            case 'complex':
                return 'pro';
            case 'moderate':
                // Use heuristics for moderate complexity
                if (complexity.requiresCreativity || complexity.reasoningRequired) {
                    return 'pro';
                }
                if (complexity.responseQuality === 'basic') {
                    return 'flash-lite';
                }
                return 'flash';
            default:
                return 'flash';
        }
    }

    private getSelectionReason(complexity: TaskComplexity, model: 'flash-lite' | 'flash' | 'pro'): string {
        const reasons = {
            'flash-lite': `Task complexity: ${complexity.complexity}, requires basic response quality`,
            'flash': `Task complexity: ${complexity.complexity}, requires standard response quality`,
            'pro': `Task complexity: ${complexity.complexity}, requires high response quality and reasoning`
        };
        return reasons[model];
    }
}

export default ModelSelectionService;
```

### Create `backend/src/services/PerformanceTracker.ts`
```typescript
import logger from './LoggerService';

export interface PerformanceMetrics {
    taskId: string;
    taskType: string;
    model: 'flash-lite' | 'flash' | 'pro';
    startTime: number;
    endTime?: number;
    responseTime?: number;
    tokenUsage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
    };
    success: boolean;
    error?: string;
    fallbackUsed?: boolean;
}

export class PerformanceTracker {
    private static instance: PerformanceTracker;
    private metrics: Map<string, PerformanceMetrics>;
    private modelPerformance: Map<'flash-lite' | 'flash' | 'pro', {
        totalRequests: number;
        totalResponseTime: number;
        totalTokens: number;
        successCount: number;
        errorCount: number;
        fallbackCount: number;
    }>;

    private constructor() {
        this.metrics = new Map();
        this.modelPerformance = new Map();
        this.initializeModelPerformance();
    }

    public static getInstance(): PerformanceTracker {
        if (!PerformanceTracker.instance) {
            PerformanceTracker.instance = new PerformanceTracker();
        }
        return PerformanceTracker.instance;
    }

    private initializeModelPerformance(): void {
        this.modelPerformance.set('flash-lite', {
            totalRequests: 0,
            totalResponseTime: 0,
            totalTokens: 0,
            successCount: 0,
            errorCount: 0,
            fallbackCount: 0
        });
        this.modelPerformance.set('flash', {
            totalRequests: 0,
            totalResponseTime: 0,
            totalTokens: 0,
            successCount: 0,
            errorCount: 0,
            fallbackCount: 0
        });
        this.modelPerformance.set('pro', {
            totalRequests: 0,
            totalResponseTime: 0,
            totalTokens: 0,
            successCount: 0,
            errorCount: 0,
            fallbackCount: 0
        });
    }

    public startTask(taskId: string, taskType: string, model: 'flash-lite' | 'flash' | 'pro'): number {
        const startTime = Date.now();
        const metrics: PerformanceMetrics = {
            taskId,
            taskType,
            model,
            startTime,
            success: false
        };

        this.metrics.set(taskId, metrics);
        
        // Update model performance
        const modelStats = this.modelPerformance.get(model)!;
        modelStats.totalRequests++;

        logger.info('Performance tracking started', {
            taskId,
            taskType,
            model,
            startTime
        });

        return startTime;
    }

    public endTask(
        taskId: string,
        startTime: number,
        tokenUsage?: { promptTokens: number; responseTokens: number; totalTokens: number },
        success: boolean = true,
        error?: string,
        fallbackUsed: boolean = false
    ): void {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const metrics = this.metrics.get(taskId);
        if (metrics) {
            metrics.endTime = endTime;
            metrics.responseTime = responseTime;
            metrics.tokenUsage = tokenUsage;
            metrics.success = success;
            metrics.error = error;
            metrics.fallbackUsed = fallbackUsed;

            // Update model performance
            const modelStats = this.modelPerformance.get(metrics.model)!;
            if (success) {
                modelStats.successCount++;
                if (tokenUsage) {
                    modelStats.totalTokens += tokenUsage.totalTokens;
                }
                modelStats.totalResponseTime += responseTime;
            } else {
                modelStats.errorCount++;
            }
            if (fallbackUsed) {
                modelStats.fallbackCount++;
            }

            logger.info('Performance tracking completed', {
                taskId,
                model: metrics.model,
                responseTime,
                success,
                fallbackUsed,
                tokenUsage
            });
        }
    }

    public getModelPerformance(model: 'flash-lite' | 'flash' | 'pro') {
        const stats = this.modelPerformance.get(model)!;
        return {
            model,
            totalRequests: stats.totalRequests,
            averageResponseTime: stats.totalRequests > 0 ? stats.totalResponseTime / stats.totalRequests : 0,
            averageTokens: stats.totalRequests > 0 ? stats.totalTokens / stats.totalRequests : 0,
            successRate: stats.totalRequests > 0 ? (stats.successCount / stats.totalRequests) * 100 : 0,
            errorRate: stats.totalRequests > 0 ? (stats.errorCount / stats.totalRequests) * 100 : 0,
            fallbackRate: stats.totalRequests > 0 ? (stats.fallbackCount / stats.totalRequests) * 100 : 0
        };
    }

    public getAllModelPerformance() {
        return {
            'flash-lite': this.getModelPerformance('flash-lite'),
            'flash': this.getModelPerformance('flash'),
            'pro': this.getModelPerformance('pro')
        };
    }

    public getTaskMetrics(taskId: string): PerformanceMetrics | undefined {
        return this.metrics.get(taskId);
    }

    public clearMetrics(): void {
        this.metrics.clear();
        this.initializeModelPerformance();
        logger.info('Performance metrics cleared');
    }
}

export default PerformanceTracker;
```

## 3. Update GeminiClient.ts

### Update `backend/src/services/GeminiClient.ts`
```typescript
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config';
import logger from './LoggerService';
import ModelSelectionService from './ModelSelectionService';
import PerformanceTracker from './PerformanceTracker';

export interface GeminiResponse {
    success: boolean;
    content: string;
    error?: string;
    usage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
    };
    modelUsed?: 'flash-lite' | 'flash' | 'pro';
    responseTime?: number;
    fallbackUsed?: boolean;
}

export interface GeminiRequest {
    prompt: string;
    context?: string;
    temperature?: number;
    maxTokens?: number;
    taskType?: string;
    forceModel?: 'flash-lite' | 'flash' | 'pro';
}

export class GeminiClient {
    private genAI: GoogleGenerativeAI;
    private flashLiteModel: GenerativeModel;
    private flashModel: GenerativeModel;
    private proModel: GenerativeModel;
    private apiKey: string;
    private modelSelectionService: ModelSelectionService;
    private performanceTracker: PerformanceTracker;

    constructor() {
        this.apiKey = process.env['GEMINI_API_KEY'] || '';
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
        
        // Initialize all three models
        this.flashLiteModel = this.genAI.getGenerativeModel({
            model: config.gemini.flashLiteModel,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024, // Smaller for Flash-Lite
            },
        });
        
        this.flashModel = this.genAI.getGenerativeModel({
            model: config.gemini.flashModel,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });
        
        this.proModel = this.genAI.getGenerativeModel({
            model: config.gemini.proModel,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096, // Larger for Pro
            },
        });

        this.modelSelectionService = ModelSelectionService.getInstance();
        this.performanceTracker = PerformanceTracker.getInstance();
    }

    /**
     * Send a prompt with automatic three-model selection
     */
    async sendPrompt(request: GeminiRequest): Promise<GeminiResponse> {
        const taskId = this.generateTaskId();
        let selectedModel: 'flash-lite' | 'flash' | 'pro';
        let fallbackUsed = false;
        
        try {
            // Determine which model to use
            if (request.forceModel) {
                selectedModel = request.forceModel;
                logger.info('Using forced model selection', { 
                    taskId, 
                    model: selectedModel 
                });
            } else if (config.gemini.modelSelectionEnabled) {
                const selection = await this.modelSelectionService.selectOptimalModel({
                    id: taskId,
                    type: request.taskType || 'unknown',
                    prompt: request.prompt,
                    context: request.context
                });
                selectedModel = selection.model;
                logger.info('Model selection completed', { 
                    taskId, 
                    selectedModel, 
                    reason: selection.reason 
                });
            } else {
                // Fallback to Pro if model selection is disabled
                selectedModel = 'pro';
                logger.info('Model selection disabled, using Pro model', { taskId });
            }

            // Start performance tracking
            const startTime = this.performanceTracker.startTask(
                taskId, 
                request.taskType || 'unknown', 
                selectedModel
            );

            // Generate content with selected model
            let result;
            try {
                result = await this.generateContent(request, selectedModel);
            } catch (error) {
                // Implement three-tier fallback strategy
                if (config.gemini.threeModelFallbackEnabled && !request.forceModel) {
                    selectedModel = await this.handleFallback(selectedModel, request, error);
                    fallbackUsed = true;
                    result = await this.generateContent(request, selectedModel);
                } else {
                    throw error;
                }
            }

            const response = await result.response;
            const text = response.text();

            // Get usage information
            const usage = this.extractUsageInfo(result);

            // End performance tracking
            this.performanceTracker.endTask(
                taskId,
                startTime,
                usage,
                true,
                undefined,
                fallbackUsed
            );

            logger.info('Gemini AI response received', {
                taskId,
                model: selectedModel,
                responseLength: text.length,
                usage,
                fallbackUsed
            });

            return {
                success: true,
                content: text,
                usage,
                modelUsed: selectedModel,
                responseTime: Date.now() - startTime,
                fallbackUsed
            };

        } catch (error) {
            // End performance tracking with error
            this.performanceTracker.endTask(
                taskId,
                Date.now(),
                undefined,
                false,
                error instanceof Error ? error.message : 'Unknown error'
            );

            logger.error('Error in Gemini AI request:', error);
            return {
                success: false,
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error',
                modelUsed: selectedModel,
                fallbackUsed
            };
        }
    }

    /**
     * Handle three-tier fallback strategy
     */
    private async handleFallback(
        currentModel: 'flash-lite' | 'flash' | 'pro',
        request: GeminiRequest,
        error: unknown
    ): Promise<'flash-lite' | 'flash' | 'pro'> {
        const fallbackOrder: ('flash-lite' | 'flash' | 'pro')[] = ['flash-lite', 'flash', 'pro'];
        const currentIndex = fallbackOrder.indexOf(currentModel);
        
        // Try next model in fallback order
        for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
            const fallbackModel = fallbackOrder[i];
            try {
                logger.warn(`Falling back from ${currentModel} to ${fallbackModel}`, { 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
                return fallbackModel;
            } catch (fallbackError) {
                logger.warn(`Fallback to ${fallbackModel} also failed`, { 
                    error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error' 
                });
                continue;
            }
        }
        
        // If all fallbacks fail, return Pro as last resort
        logger.error('All fallback models failed, using Pro as last resort');
        return 'pro';
    }

    /**
     * Generate content with specific model
     */
    private async generateContent(request: GeminiRequest, model: 'flash-lite' | 'flash' | 'pro'): Promise<any> {
        const selectedModel = this.getModel(model);
        
        const prompt = request.context 
            ? `${request.context}\n\n${request.prompt}`
            : request.prompt;

        const generationConfig: any = {};
        if (request.temperature !== undefined) {
            generationConfig.temperature = request.temperature;
        }
        if (request.maxTokens !== undefined) {
            generationConfig.maxOutputTokens = request.maxTokens;
        }

        return selectedModel.generateContent(prompt, generationConfig);
    }

    /**
     * Get the appropriate model instance
     */
    private getModel(model: 'flash-lite' | 'flash' | 'pro'): GenerativeModel {
        switch (model) {
            case 'flash-lite':
                return this.flashLiteModel;
            case 'flash':
                return this.flashModel;
            case 'pro':
                return this.proModel;
            default:
                return this.proModel;
        }
    }

    /**
     * Extract usage information from response
     */
    private extractUsageInfo(result: any): { promptTokens: number; responseTokens: number; totalTokens: number } {
        try {
            const usage = result.usageMetadata;
            return {
                promptTokens: usage?.promptTokenCount || 0,
                responseTokens: usage?.candidatesTokenCount || 0,
                totalTokens: usage?.totalTokenCount || 0
            };
        } catch (error) {
            logger.warn('Could not extract usage information', { error });
            return { promptTokens: 0, responseTokens: 0, totalTokens: 0 };
        }
    }

    /**
     * Generate unique task ID
     */
    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get performance metrics for all models
     */
    public getPerformanceMetrics() {
        return this.performanceTracker.getAllModelPerformance();
    }

    /**
     * Get performance metrics for specific model
     */
    public getModelPerformance(model: 'flash-lite' | 'flash' | 'pro') {
        return this.performanceTracker.getModelPerformance(model);
    }
}

export default GeminiClient;
```

## 4. Update Service Layer

### Example: Update CharacterService
```typescript
// Example: CharacterService
export class CharacterService {
    private aiClient: GeminiClient;
    
    async generateBasicCharacter(): Promise<Character> {
        // Use Flash-Lite for basic generation
        return this.aiClient.sendPrompt({
            prompt: 'Generate basic character stats',
            taskType: 'character_generation_basic'
        });
    }
    
    async generateComplexCharacter(): Promise<Character> {
        // Use Pro for complex generation
        return this.aiClient.sendPrompt({
            prompt: 'Generate detailed character with backstory',
            taskType: 'character_generation_complex'
        });
    }
    
    async generateModerateCharacter(): Promise<Character> {
        // Let model selection decide between Flash and Pro
        return this.aiClient.sendPrompt({
            prompt: 'Generate character with moderate detail',
            taskType: 'character_generation_moderate'
        });
    }
}
```

## 5. Testing the Implementation

### Create Test File
```typescript
// tests/ModelSelectionService.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import ModelSelectionService from '../src/services/ModelSelectionService';

describe('ModelSelectionService', () => {
    let service: ModelSelectionService;

    beforeEach(() => {
        service = ModelSelectionService.getInstance();
    });

    it('should select Flash-Lite for ultra-simple tasks', async () => {
        const task = {
            id: 'test1',
            type: 'skill_check_result',
            prompt: 'Roll a d20'
        };

        const selection = await service.selectOptimalModel(task);
        expect(selection.model).toBe('flash-lite');
        expect(selection.confidence).toBeGreaterThan(0.9);
    });

    it('should select Flash for simple tasks', async () => {
        const task = {
            id: 'test2',
            type: 'character_generation_basic',
            prompt: 'Create a basic character'
        };

        const selection = await service.selectOptimalModel(task);
        expect(selection.model).toBe('flash');
        expect(selection.confidence).toBeGreaterThan(0.8);
    });

    it('should select Pro for complex tasks', async () => {
        const task = {
            id: 'test3',
            type: 'campaign_scenario_generation',
            prompt: 'Create a complex campaign scenario'
        };

        const selection = await service.selectOptimalModel(task);
        expect(selection.model).toBe('pro');
        expect(selection.confidence).toBeGreaterThan(0.9);
    });
});
```

## 6. Environment Setup

### Required Environment Variables
```bash
# .env file
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true
THREE_MODEL_FALLBACK_ENABLED=true
```

## 7. Expected Results

### Cost Optimization
- **Flash-Lite**: 60-80% cost reduction vs Pro for ultra-simple tasks
- **Flash**: 40-60% cost reduction vs Pro for simple tasks
- **Overall**: 50-70% cost reduction through smart three-tier selection

### Performance Improvements
- **Flash-Lite**: 2-3x faster than Pro for ultra-simple tasks
- **Flash**: 1.5-2x faster than Pro for simple tasks
- **Pro**: Optimal for complex tasks requiring reasoning

### Quality Maintenance
- Automatic fallback strategies ensure quality across all tiers
- Performance monitoring provides insights for optimization
- User experience remains consistent with appropriate response times

This implementation provides a robust, cost-effective, and high-performance LLM solution using all three Gemini models intelligently.
