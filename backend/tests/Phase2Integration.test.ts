import { ContextManager } from '../src/services/ContextManager';
import { CharacterDevelopmentService } from '../src/services/CharacterDevelopmentService';
import { QuestStoryIntegrationService } from '../src/services/QuestStoryIntegrationService';
import { IStoryBeat, ICharacterMilestone } from '../src/models/StoryArc';

// Mock the LLM client
const mockLLMClient = {
  compressContext: jest.fn().mockResolvedValue('Compressed context'),
  generateResponse: jest.fn().mockResolvedValue('Mock response'),
  extractCharacterInformation: jest.fn().mockResolvedValue({}),
};

// Mock the Gemini client
const mockGeminiClient = {
  compressContext: jest.fn().mockResolvedValue('Compressed context'),
  generateResponse: jest.fn().mockResolvedValue('Mock response'),
};

describe.skip('Phase 2 Integration Tests - Story Memory & Character Tracking', () => {
  let contextManager: ContextManager;
  let characterDevelopmentService: CharacterDevelopmentService;
  let questStoryIntegrationService: QuestStoryIntegrationService;

  const testCampaignId = 'integration-test-campaign-123';
  const testCharacterId = 'integration-test-character-456';
  const testStoryBeatId = 'integration-test-story-beat-789';

  beforeEach(() => {
    jest.clearAllMocks();

    contextManager = new ContextManager();
    characterDevelopmentService = new CharacterDevelopmentService();
    questStoryIntegrationService = QuestStoryIntegrationService.getInstance();

    // Mock the private properties
    (contextManager as any).geminiClient = mockGeminiClient;
    (contextManager as any).llmClient = mockLLMClient;
    (characterDevelopmentService as any).contextManager = contextManager;
    (characterDevelopmentService as any).llmClient = mockLLMClient;
    (questStoryIntegrationService as any).contextManager = contextManager;
  });

  describe('Complete Story Arc Workflow', () => {
    it('should handle complete story progression with character development', async () => {
      // 1. Initialize story memory
      contextManager.initializeStoryMemory(testCampaignId);

      // 2. Create a story beat
      const storyBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'The Beginning of the Adventure',
        description: 'Our heroes embark on their journey',
        type: 'setup',

        order: 1,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 3. Add story context
      contextManager.addStoryContextLayer(
        testCampaignId,
        'story',
        'The adventure begins in a small village where strange events have been occurring.',
        9,
        'story',
        testStoryBeatId
      );

      // 4. Track character milestones
      const levelMilestone = await characterDevelopmentService.trackLevelProgression(
        testCharacterId,
        5,
        testStoryBeatId
      );

      const relationshipMilestone = await characterDevelopmentService.trackRelationshipMilestone(
        testCharacterId,
        'ally-1',
        'friendship',
        8,
        testStoryBeatId
      );

      const storyMilestone = await characterDevelopmentService.trackStoryImpactMilestone(
        testCharacterId,
        'Discovered the ancient artifact',
        'major',
        testStoryBeatId
      );

      // 5. Add world state changes
      contextManager.addWorldStateChange(testCampaignId, 'The ancient artifact was discovered');
      contextManager.addWorldStateChange(testCampaignId, 'The village is now under protection');

      // 6. Generate a story-integrated quest
      const storyQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        storyBeat,
        'setup'
      );

      // 7. Process quest completion
      await questStoryIntegrationService.processQuestCompletionForStory(
        testCampaignId,
        storyQuest.id,
        'success'
      );

      // 8. Verify story memory contains all elements
      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory).toBeDefined();
      expect(storyMemory?.permanentElements).toContain('The ancient artifact was discovered');
      expect(storyMemory?.characterMilestones).toHaveLength(3);
      expect(storyMemory?.worldStateChanges).toHaveLength(2);

      // 9. Verify character development summary includes milestones
      const characterSummary =
        await characterDevelopmentService.getCharacterDevelopmentSummaryWithMilestones(
          testCharacterId,
          testCampaignId
        );
      expect(characterSummary.milestones).toBe(3);
      expect(characterSummary.milestoneTypes).toEqual({
        level: 1,
        relationship: 1,
        story: 1,
      });

      // 10. Verify context prioritization works
      const prioritizedContext = await contextManager.getContextWithStoryPriority(testCampaignId);
      expect(prioritizedContext).toContain('The adventure begins');
      expect(prioritizedContext).toContain('Discovered the ancient artifact');
    });

    it('should handle story progression through multiple phases', async () => {
      // Setup phase
      const setupBeat: IStoryBeat = {
        id: 'setup-beat',
        title: 'Setup Phase',
        description: 'Introduction to the story',
        type: 'setup',

        order: 1,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const setupQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        setupBeat,
        'setup'
      );

      // Development phase
      const developmentBeat: IStoryBeat = {
        id: 'development-beat',
        title: 'Development Phase',
        description: 'Character growth and plot development',
        type: 'development',

        order: 2,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const developmentQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        developmentBeat,
        'development'
      );

      // Climax phase
      const climaxBeat: IStoryBeat = {
        id: 'climax-beat',
        title: 'Climax Phase',
        description: 'Final confrontation',
        type: 'climax',

        order: 3,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const climaxQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        climaxBeat,
        'climax'
      );

      // Resolution phase
      const resolutionBeat: IStoryBeat = {
        id: 'resolution-beat',
        title: 'Resolution Phase',
        description: 'Story conclusion',
        type: 'resolution',

        order: 4,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const resolutionQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        resolutionBeat,
        'resolution'
      );

      // Verify all quests have appropriate story integration
      expect(setupQuest.storyIntegration?.storyType).toBe('setup');
      expect(developmentQuest.storyIntegration?.storyType).toBe('development');
      expect(climaxQuest.storyIntegration?.storyType).toBe('climax');
      expect(resolutionQuest.storyIntegration?.storyType).toBe('resolution');

      // Verify impact levels are appropriate
      expect(setupQuest.storyIntegration?.storyImpact).toBe('major');
      expect(developmentQuest.storyIntegration?.storyImpact).toBe('moderate');
      expect(climaxQuest.storyIntegration?.storyImpact).toBe('critical');
      expect(resolutionQuest.storyIntegration?.storyImpact).toBe('major');
    });
  });

  describe('Context Compression with Story Memory', () => {
    it('should preserve important story elements during compression', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      // Add permanent story elements
      contextManager.addPermanentStoryElement(testCampaignId, 'The ancient prophecy was revealed');
      contextManager.addPermanentStoryElement(testCampaignId, 'The hero was chosen by destiny');

      // Add character milestones
      await characterDevelopmentService.trackStoryImpactMilestone(
        testCharacterId,
        testCampaignId,
        testStoryBeatId,
        'critical',
        'Fulfilled the ancient prophecy'
      );

      // Add world state changes
      contextManager.addWorldStateChange(testCampaignId, 'The kingdom was saved from destruction');
      contextManager.addWorldStateChange(testCampaignId, 'A new era of peace began');

      // Add many regular context layers to trigger compression
      for (let i = 0; i < 25; i++) {
        contextManager.addContextLayer(
          testCampaignId,
          'long-term',
          `Regular context layer ${i}`,
          3
        );
      }

      // Trigger compression
      await (contextManager as any).performStoryAwareCompression(testCampaignId);

      // Verify permanent elements are preserved
      const storyMemory = contextManager.getStoryMemory(testCampaignId);
      expect(storyMemory?.permanentElements).toContain('The ancient prophecy was revealed');
      expect(storyMemory?.permanentElements).toContain('The hero was chosen by destiny');
      expect(storyMemory?.characterMilestones).toHaveLength(1);
      expect(storyMemory?.worldStateChanges).toContain('The kingdom was saved from destruction');
      expect(storyMemory?.worldStateChanges).toContain('A new era of peace began');
    });

    it('should compress non-essential context while preserving story continuity', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      // Add essential story context
      contextManager.addContextLayer(
        testCampaignId,
        'story',
        'Critical story information that must be preserved',
        10,
        ['story', 'critical'],
        testStoryBeatId,
        undefined,
        true // permanent
      );

      // Add many non-essential context layers
      for (let i = 0; i < 30; i++) {
        contextManager.addContextLayer(
          testCampaignId,
          'long-term',
          `Non-essential context ${i}`,
          2
        );
      }

      const initialLayers = (contextManager as any).contextLayers.get(testCampaignId);
      expect(initialLayers).toHaveLength(31);

      // Trigger compression
      await (contextManager as any).performStoryAwareCompression(testCampaignId);

      const finalLayers = (contextManager as any).contextLayers.get(testCampaignId);

      // Should have fewer layers after compression
      expect(finalLayers.length).toBeLessThan(31);

      // But should still contain the permanent story context
      const storyContext = finalLayers.find((layer: any) => layer.permanent);
      expect(storyContext).toBeDefined();
      expect(storyContext.content).toContain('Critical story information');
    });
  });

  describe('Character Development Integration', () => {
    it('should track comprehensive character development throughout story', async () => {
      // Track various types of milestones
      const milestones = [
        await characterDevelopmentService.trackLevelProgression(
          testCharacterId,
          testCampaignId,
          3,
          'Rogue'
        ),
        await characterDevelopmentService.trackRelationshipMilestone(
          testCharacterId,
          testCampaignId,
          'mentor-1',
          'mentorship',
          9
        ),
        await characterDevelopmentService.trackStoryImpactMilestone(
          testCharacterId,
          testCampaignId,
          testStoryBeatId,
          'major',
          'Uncovered the conspiracy'
        ),
        await characterDevelopmentService.trackPersonalGrowthMilestone(
          testCharacterId,
          testCampaignId,
          'Overcame fear of commitment',
          'moderate'
        ),
        await characterDevelopmentService.trackSkillMilestone(
          testCharacterId,
          testCampaignId,
          'Stealth',
          'expert',
          'major'
        ),
        await characterDevelopmentService.trackAchievementMilestone(
          testCharacterId,
          testCampaignId,
          'Master Thief',
          'critical',
          { heistsCompleted: 10 }
        ),
      ];

      // Verify all milestones were created
      expect(milestones).toHaveLength(6);
      expect(milestones.every(m => m.characterId === testCharacterId)).toBe(true);

      // Get comprehensive character summary
      const summary =
        await characterDevelopmentService.getCharacterDevelopmentSummaryWithMilestones(
          testCharacterId,
          testCampaignId
        );

      expect(summary.milestones).toBe(6);
      expect(summary.milestoneTypes).toEqual({
        level: 1,
        relationship: 1,
        story: 1,
        personal: 1,
        skill: 1,
        achievement: 1,
      });
      expect(summary.recentMilestones).toHaveLength(6);
    });

    it('should integrate character development with story progression', async () => {
      const storyBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Character Growth Arc',
        description: 'The character faces their greatest challenge',
        type: 'development',

        order: 1,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generate a development quest
      const developmentQuest = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        storyBeat,
        'development'
      );

      // Track character milestone related to the quest
      const characterMilestone = await characterDevelopmentService.trackStoryImpactMilestone(
        testCharacterId,
        testCampaignId,
        testStoryBeatId,
        'major',
        'Completed the character growth quest'
      );

      // Verify the quest has character development opportunities
      expect(developmentQuest.storyIntegration?.characterDevelopmentOpportunities).toContain(
        'Personal growth milestone'
      );
      expect(developmentQuest.storyIntegration?.characterDevelopmentOpportunities).toContain(
        'Relationship strengthening'
      );

      // Verify the milestone is tracked
      expect(characterMilestone.storyBeatId).toBe(testStoryBeatId);
      expect(characterMilestone.impact).toBe('major');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing campaign gracefully across all services', async () => {
      const nonExistentCampaign = 'non-existent-campaign';

      // ContextManager should handle missing campaign
      expect(() => {
        contextManager.getStoryContext(nonExistentCampaign);
      }).not.toThrow();

      // CharacterDevelopmentService should handle missing campaign
      await expect(
        characterDevelopmentService.trackLevelProgression(
          testCharacterId,
          nonExistentCampaign,
          5,
          'Fighter'
        )
      ).resolves.not.toThrow();

      // QuestStoryIntegrationService should handle missing campaign
      const storyBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Test Beat',
        description: 'Test description',
        type: 'setup',

        order: 1,
        prerequisites: [],
        outcomes: [],
        characterDevelopment: [],
        worldStateChanges: [],
        questProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(
        questStoryIntegrationService.generateStoryIntegratedQuest(
          nonExistentCampaign,
          storyBeat,
          'setup'
        )
      ).resolves.not.toThrow();
    });

    it('should handle service failures gracefully', async () => {
      // Mock LLM client failure
      mockLLMClient.generateResponse.mockRejectedValueOnce(new Error('LLM service unavailable'));

      // Services should handle failures gracefully
      await expect(
        characterDevelopmentService.trackLevelProgression(
          testCharacterId,
          testCampaignId,
          5,
          'Fighter'
        )
      ).resolves.not.toThrow();

      // Mock compression failure
      mockGeminiClient.compressContext.mockRejectedValueOnce(new Error('Compression failed'));

      contextManager.initializeStoryMemory(testCampaignId);
      contextManager.addContextLayer(testCampaignId, 'long-term', 'Test content', 3);

      await expect(
        (contextManager as any).performStoryAwareCompression(testCampaignId)
      ).resolves.not.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of context layers efficiently', async () => {
      contextManager.initializeStoryMemory(testCampaignId);

      const startTime = Date.now();

      // Add many context layers
      for (let i = 0; i < 100; i++) {
        contextManager.addContextLayer(
          testCampaignId,
          'long-term',
          `Context layer ${i}`,
          Math.floor(Math.random() * 10) + 1
        );
      }

      const addTime = Date.now() - startTime;
      expect(addTime).toBeLessThan(1000); // Should complete within 1 second

      // Test context retrieval performance
      const retrievalStartTime = Date.now();
      const context = await contextManager.getContextWithStoryPriority(testCampaignId);
      const retrievalTime = Date.now() - retrievalStartTime;

      expect(retrievalTime).toBeLessThan(500); // Should retrieve within 500ms
      expect(context).toBeDefined();
      expect(typeof context).toBe('string');
    });

    it('should handle multiple character milestones efficiently', async () => {
      const startTime = Date.now();

      // Track many milestones
      const milestonePromises = [];
      for (let i = 0; i < 50; i++) {
        milestonePromises.push(
          characterDevelopmentService.trackLevelProgression(
            `${testCharacterId}-${i}`,
            testCampaignId,
            Math.floor(Math.random() * 20) + 1,
            'Fighter'
          )
        );
      }

      const milestones = await Promise.all(milestonePromises);
      const totalTime = Date.now() - startTime;

      expect(milestones).toHaveLength(50);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
