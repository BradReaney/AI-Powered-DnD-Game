import { describe, it, expect, beforeEach } from '@jest/globals';
import ModelSelectionService from '../src/services/ModelSelectionService';

describe('ModelSelectionService', () => {
  let service: ModelSelectionService;

  beforeEach(() => {
    service = ModelSelectionService.getInstance();
  });

  it('should select Flash model for simple tasks', async () => {
    const task = {
      id: 'test1',
      type: 'skill_check_result',
      prompt: 'Generate a simple success description',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.model).toBe('flash');
    expect(selection.confidence).toBeGreaterThan(0.8);
  });

  it('should select Pro model for complex tasks', async () => {
    const task = {
      id: 'test2',
      type: 'campaign_scenario_generation',
      prompt: 'Generate a complex multi-layered campaign scenario',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.model).toBe('pro');
    expect(selection.confidence).toBeGreaterThan(0.8);
  });

  it('should handle unknown task types with dynamic analysis', async () => {
    const task = {
      id: 'test3',
      type: 'unknown_task',
      prompt: 'This is a very creative and complex task that requires deep reasoning',
    };

    const selection = await service.selectOptimalModel(task);
    expect(['flash', 'pro']).toContain(selection.model);
    expect(selection.confidence).toBeGreaterThan(0.5);
  });

  it('should select Flash for simple dynamic tasks', async () => {
    const task = {
      id: 'test4',
      type: 'unknown_task',
      prompt: 'Simple task with basic instructions',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.model).toBe('flash-lite'); // Short prompt = ultra-simple = flash-lite
  });

  it('should select Pro for creative and reasoning tasks', async () => {
    const task = {
      id: 'test5',
      type: 'unknown_task',
      prompt: 'Create a detailed character with complex backstory and analyze their motivations',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.model).toBe('pro');
  });

  it('should handle tasks with context dependency', async () => {
    const task = {
      id: 'test6',
      type: 'unknown_task',
      prompt: 'Generate a response',
      context: 'A'.repeat(2500), // High context dependency
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.model).toBe('pro');
  });

  it('should return fallback enabled when configured', async () => {
    const task = {
      id: 'test7',
      type: 'skill_check_result',
      prompt: 'Simple task',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.fallbackEnabled).toBeDefined();
  });

  it('should provide selection reasoning', async () => {
    const task = {
      id: 'test8',
      type: 'character_generation',
      prompt: 'Generate character',
    };

    const selection = await service.selectOptimalModel(task);
    expect(selection.reason).toBeDefined();
    expect(selection.reason.length).toBeGreaterThan(0);
  });
});
