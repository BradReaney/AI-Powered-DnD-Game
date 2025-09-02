import {
  ContextManager,
  ContextLayer,
  StoryContext,
  StoryMemory,
} from '../src/services/ContextManager';
import { ICharacterMilestone, IStoryBeat } from '../src/models/StoryArc';

// Mock the LLM client
const mockLLMClient = {
  compressContext: jest.fn().mockResolvedValue('Compressed context'),
  generateResponse: jest.fn().mockResolvedValue('Mock response'),
};

// Mock the Gemini client
const mockGeminiClient = {
  compressContext: jest.fn().mockResolvedValue('Compressed context'),
  generateResponse: jest.fn().mockResolvedValue('Mock response'),
};

describe('ContextManager - Phase 2 Story Memory', () => {
  let contextManager: ContextManager;
  const testCampaignId = 'test-campaign-123';
  const testCharacterId = 'test-character-456';

  beforeEach(() => {
    jest.clearAllMocks();
    contextManager = new ContextManager();
    // Mock the private properties
    (contextManager as any).geminiClient = mockGeminiClient;
    (contextManager as any).llmClient = mockLLMClient;
  });

  describe('Story Memory Initialization', () => {
    it('should initialize story memory for a campaign', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const storyMemory = (contextManager as any).storyMemories.get(testCampaignId);
      expect(storyMemory).toBeDefined();
      expect(storyMemory.permanentElements).toEqual([]);
      expect(storyMemory.characterMilestones).toEqual([]);
      expect(storyMemory.worldStateChanges).toEqual([]);
      expect(storyMemory.relationshipMapping).toEqual({});
      expect(storyMemory.compressedHistory).toEqual([]);
    });

    it('should not overwrite existing story memory', () => {
      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.addPermanentStoryElement(testCampaignId, 'Test element');

      contextManager.initializeStoryMemory(testCampaignId);

      const storyMemory = (contextManager as any).storyMemories.get(testCampaignId);
      expect(storyMemory.permanentElements).toContain('Test element');
    });
  });

  describe('Story Context Management', () => {
    it('should add story context layer', () => {
      const storyBeat: IStoryBeat = {
        id: 'beat-1',
        title: 'Test Beat',
        description: 'Test description',
        type: 'setup',
        importance: 'major',
        chapter: 1,
        act: 1,
        characters: [],
        npcs: [],
        consequences: [],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contextManager.addStoryContextLayer(
        testCampaignId,
        'story',
        'Test story content',
        8,
        'beat-1'
      );

      const contextLayers = (contextManager as any).contextLayers.get(testCampaignId);
      expect(contextLayers).toHaveLength(1);
      expect(contextLayers[0].type).toBe('story');
      expect(contextLayers[0].storyBeatId).toBe('beat-1');
    });

    it('should get story context for a campaign', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const storyContext = contextManager.getStoryContext(testCampaignId);
      expect(storyContext).toBeNull(); // getStoryContext returns null if no context exists
    });

    it('should update story context', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const updatedContext: StoryContext = {
        currentStoryBeat: {
          id: 'beat-1',
          title: 'Updated Beat',
          description: 'Updated description',
          type: 'setup',
          importance: 'major',
          chapter: 1,
          act: 1,
        },
        characterDevelopment: [],
        worldState: null,
        questProgress: [],
        storyMemory: {
          permanentElements: [],
          characterMilestones: [],
          worldStateChanges: [],
          relationshipMapping: {},
        },
      };

      contextManager.updateStoryContext(testCampaignId, updatedContext);

      const storyContext = contextManager.getStoryContext(testCampaignId);
      expect(storyContext?.currentStoryBeat?.title).toBe('Updated Beat');
    });
  });

  describe('Permanent Story Elements', () => {
    it('should add permanent story elements', () => {
      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.addPermanentStoryElement(testCampaignId, 'Important story element');

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.permanentElements).toContain('Important story element');
    });

    it('should mark context layers as permanent', () => {
      contextManager.addStoryContextLayer(
        testCampaignId,
        'story',
        'Permanent story content',
        10,
        undefined,
        undefined,
        true // permanent
      );

      const contextLayers = (contextManager as any).contextLayers.get(testCampaignId);
      expect(contextLayers[0].permanent).toBe(true);
    });
  });

  describe('Character Milestone Tracking', () => {
    it('should add character milestones', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const milestone = 'Reached level 5';

      contextManager.addCharacterMilestone(testCampaignId, milestone);

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.characterMilestones).toHaveLength(1);
      expect(storyMemory?.characterMilestones[0]).toContain('Reached level 5');
    });

    it('should track different types of milestones', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const milestones = [
        'Level up',
        'New friendship',
        'Story impact',
        'Personal growth',
        'Skill improvement',
        'Achievement unlocked',
      ];

      milestones.forEach(milestone => {
        contextManager.addCharacterMilestone(testCampaignId, milestone);
      });

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.characterMilestones).toHaveLength(6);
    });
  });

  describe('World State Changes', () => {
    it('should add world state changes', () => {
      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.addWorldStateChange(testCampaignId, 'The kingdom fell into chaos');

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.worldStateChanges).toContain('The kingdom fell into chaos');
    });

    it('should track multiple world state changes', () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const changes = [
        'The kingdom fell into chaos',
        'A new alliance was formed',
        'The ancient artifact was discovered',
      ];

      changes.forEach(change => {
        contextManager.addWorldStateChange(testCampaignId, change);
      });

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.worldStateChanges).toHaveLength(3);
    });
  });

  describe('Relationship Mapping', () => {
    it('should update relationship mapping', () => {
      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.updateRelationshipMapping(testCampaignId, testCharacterId, [
        'ally-1',
        'enemy-1',
      ]);

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.relationshipMapping[testCharacterId]).toEqual(['ally-1', 'enemy-1']);
    });

    it('should update existing relationship mapping', () => {
      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.updateRelationshipMapping(testCampaignId, testCharacterId, ['ally-1']);
      contextManager.updateRelationshipMapping(testCampaignId, testCharacterId, [
        'ally-1',
        'ally-2',
      ]);

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.relationshipMapping[testCharacterId]).toEqual(['ally-1', 'ally-2']);
    });
  });

  describe('Context Prioritization', () => {
    it('should get context with story priority', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      // Add different types of context layers
      contextManager.addContextLayer(testCampaignId, 'immediate', 'Immediate context', 10);
      contextManager.addStoryContextLayer(testCampaignId, 'story', 'Story context', 8, 'beat-1');
      contextManager.addContextLayer(testCampaignId, 'character', 'Character context', 6);
      contextManager.addStoryContextLayer(
        testCampaignId,
        'quest',
        'Quest context',
        4,
        undefined,
        'quest-1'
      );
      contextManager.addContextLayer(testCampaignId, 'long-term', 'Long-term context', 2);

      const prioritizedContext = await contextManager.getContextWithStoryPriority(testCampaignId);

      // Should prioritize story and immediate context first
      expect(prioritizedContext).toContain('Immediate context');
      expect(prioritizedContext).toContain('Story context');
    });

    it('should handle empty context gracefully', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const prioritizedContext = await contextManager.getContextWithStoryPriority(testCampaignId);
      expect(prioritizedContext).toBeDefined();
      expect(typeof prioritizedContext).toBe('string');
    });
  });

  describe('Story-Aware Compression', () => {
    it('should preserve permanent elements during compression', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      // Add permanent elements
      contextManager.addPermanentStoryElement(testCampaignId, 'Critical story element');
      contextManager.addCharacterMilestone(testCampaignId, 'Important milestone');
      contextManager.addWorldStateChange(testCampaignId, 'Major world change');

      // Add regular context layers
      for (let i = 0; i < 10; i++) {
        contextManager.addContextLayer(testCampaignId, 'long-term', `Regular context ${i}`, 3);
      }

      // Trigger compression
      await (contextManager as any).performStoryAwareCompression(testCampaignId);

      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.permanentElements).toContain('Critical story element');
      expect(storyMemory?.characterMilestones).toHaveLength(1);
      expect(storyMemory?.worldStateChanges).toContain('Major world change');
    });

    it('should compress non-permanent context layers', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      // Add many regular context layers
      for (let i = 0; i < 20; i++) {
        contextManager.addContextLayer(testCampaignId, 'long-term', `Regular context ${i}`, 3);
      }

      const initialLayers = (contextManager as any).contextLayers.get(testCampaignId);
      expect(initialLayers).toHaveLength(20);

      // Trigger compression
      await (contextManager as any).performStoryAwareCompression(testCampaignId);

      const finalLayers = (contextManager as any).contextLayers.get(testCampaignId);
      // Should have fewer layers after compression
      expect(finalLayers.length).toBeLessThan(20);
    });
  });

  describe('Integration with Existing Context Management', () => {
    it('should work with existing context layer types', () => {
      const layerTypes = [
        'immediate',
        'session',
        'long-term',
        'character',
        'story',
        'quest',
        'world-state',
      ];

      layerTypes.forEach((type, index) => {
        contextManager.addContextLayer(testCampaignId, type as any, `Test ${type} content`, 5);
      });

      const contextLayers = (contextManager as any).contextLayers.get(testCampaignId);
      expect(contextLayers).toHaveLength(7);
    });

    it('should maintain backward compatibility', async () => {
      // Test that existing methods still work
      contextManager.addContextLayer(testCampaignId, 'immediate', 'Test content', 8);
      const context = await contextManager.getContext(testCampaignId);
      expect(context).toContain('Test content');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing campaign gracefully', () => {
      expect(() => {
        contextManager.getStoryContext('non-existent-campaign');
      }).not.toThrow();

      expect(() => {
        contextManager.getStoryMemory('non-existent-campaign');
      }).not.toThrow();
    });

    it('should handle compression errors gracefully', async () => {
      mockGeminiClient.compressContext.mockRejectedValueOnce(new Error('Compression failed'));

      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.addContextLayer(testCampaignId, 'long-term', 'Test content', 3);

      // Should not throw error
      await expect(
        (contextManager as any).performStoryAwareCompression(testCampaignId)
      ).resolves.not.toThrow();
    });
  });
});
