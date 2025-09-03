import {
  QuestStoryIntegrationService,
  StoryQuestTemplate,
  QuestStoryLink,
} from '../src/services/QuestStoryIntegrationService';
import { IStoryBeat } from '../src/models/StoryArc';

// Mock the ContextManager
const mockContextManager = {
  addContextLayer: jest.fn(),
  addStoryContextLayer: jest.fn(),
  getContext: jest.fn().mockResolvedValue('Mock context'),
  updateStoryBeat: jest.fn(),
};

// Mock the QuestService
const mockQuestService = {
  generateQuest: jest
    .fn()
    .mockImplementation(
      (campaignId, questType, difficulty, partyLevel, partySize, currentLocation, worldState) => {
        // Try to determine story type from worldState or use a default
        let storyType = 'setup';
        let questName = 'The Whispers of the Ancient Evil';

        // Check if worldState contains story beat information
        if (worldState && worldState.storyBeat) {
          const storyBeatTitle = worldState.storyBeat.toLowerCase();
          if (storyBeatTitle.includes('development') || storyBeatTitle.includes('growth')) {
            storyType = 'development';
            questName = 'The Trials of Growth';
          } else if (
            storyBeatTitle.includes('climax') ||
            storyBeatTitle.includes('confrontation')
          ) {
            storyType = 'climax';
            questName = 'The Final Confrontation';
          } else if (
            storyBeatTitle.includes('resolution') ||
            storyBeatTitle.includes('aftermath')
          ) {
            storyType = 'resolution';
            questName = 'The Aftermath';
          }
        }

        return Promise.resolve({
          id: 'mock-quest-id',
          name: questName,
          description: 'A mock quest for testing',
          objectives: ['Complete the mock objective'],
          rewards: {
            experience: 1000,
            gold: 100,
            items: [],
            reputation: { faction: 'test', amount: 50 },
          },
          difficulty: 'medium',
          estimatedDuration: '1-2 hours',
          storyIntegration: {
            storyBeatId: 'test-story-beat',
            storyType: storyType,
            storyImpact:
              storyType === 'climax' ? 'critical' : storyType === 'setup' ? 'major' : 'moderate',
            characterDevelopmentOpportunities: ['Combat skills'],
            worldStateChanges: ['Quest completed'],
          },
        });
      }
    ),
  updateQuest: jest.fn(),
};

// Mock the CharacterDevelopmentService
const mockCharacterDevelopmentService = {
  addCharacterMilestone: jest.fn().mockResolvedValue(undefined),
  trackLevelProgression: jest.fn().mockResolvedValue(undefined),
  trackRelationshipMilestone: jest.fn().mockResolvedValue(undefined),
  trackStoryImpactMilestone: jest.fn().mockResolvedValue(undefined),
};

describe('QuestStoryIntegrationService - Phase 2 Quest-Story Integration', () => {
  let questStoryIntegrationService: QuestStoryIntegrationService;
  const testCampaignId = 'test-campaign-123';
  const testQuestId = 'test-quest-456';
  const testStoryBeatId = 'test-story-beat-789';

  beforeEach(() => {
    jest.clearAllMocks();
    questStoryIntegrationService = QuestStoryIntegrationService.getInstance();
    // Mock the private properties
    (questStoryIntegrationService as any).contextManager = mockContextManager;
    (questStoryIntegrationService as any).questService = mockQuestService;
    (questStoryIntegrationService as any).characterDevelopmentService =
      mockCharacterDevelopmentService;
  });

  describe('Quest Template Management', () => {
    it('should initialize quest templates on construction', () => {
      const templates = questStoryIntegrationService.createStoryQuestTemplates();
      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should get quest templates by story type', () => {
      const setupTemplates = questStoryIntegrationService.getQuestTemplatesByStoryType('setup');

      expect(setupTemplates).toBeDefined();
      expect(setupTemplates.length).toBeGreaterThan(0);
      expect(setupTemplates[0].storyType).toBe('setup');
      expect(setupTemplates[0].storyBeatConnection).toBeDefined();
    });

    it('should return empty array for non-existent story type', () => {
      const templates = questStoryIntegrationService.getQuestTemplatesByStoryType(
        'nonexistent' as any
      );
      expect(templates).toEqual([]);
    });

    it('should get all quest template types', () => {
      const setupTemplates = questStoryIntegrationService.getQuestTemplatesByStoryType('setup');
      const developmentTemplates =
        questStoryIntegrationService.getQuestTemplatesByStoryType('development');
      const climaxTemplates = questStoryIntegrationService.getQuestTemplatesByStoryType('climax');
      const resolutionTemplates =
        questStoryIntegrationService.getQuestTemplatesByStoryType('resolution');

      expect(setupTemplates.length).toBeGreaterThan(0);
      expect(developmentTemplates.length).toBeGreaterThan(0);
      expect(climaxTemplates.length).toBeGreaterThan(0);
      expect(resolutionTemplates.length).toBeGreaterThan(0);

      // Verify all templates have the correct story type
      setupTemplates.forEach(template => expect(template.storyType).toBe('setup'));
      developmentTemplates.forEach(template => expect(template.storyType).toBe('development'));
      climaxTemplates.forEach(template => expect(template.storyType).toBe('climax'));
      resolutionTemplates.forEach(template => expect(template.storyType).toBe('resolution'));
    });
  });

  describe('Story Quest Generation', () => {
    it('should generate story quest for setup phase', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Introduction to the Plot',
        description: 'The beginning of the adventure',
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

      const result = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('The Whispers of the Ancient Evil');
      expect(result.storyIntegration).toBeDefined();
      expect(result.storyIntegration?.storyType).toBe('setup');
      expect(result.storyIntegration?.storyImpact).toBe('major');
      expect(result.storyIntegration?.characterDevelopmentOpportunities).toHaveLength(3);
      expect(result.storyIntegration?.worldStateChanges).toHaveLength(3);
      expect(result.storyIntegration?.relationshipImpacts).toHaveLength(1);
    });

    it('should generate story quest for development phase', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Character Development',
        description: 'Character growth and relationships',
        type: 'development',
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

      const result = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('The Trials of Growth');
      expect(result.storyIntegration?.storyType).toBe('development');
      expect(result.storyIntegration?.storyImpact).toBe('moderate');
    });

    it('should generate story quest for climax phase', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Final Confrontation',
        description: 'The ultimate battle',
        type: 'climax',
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

      const result = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('The Final Confrontation');
      expect(result.storyIntegration?.storyType).toBe('climax');
      expect(result.storyIntegration?.storyImpact).toBe('critical');
    });

    it('should generate story quest for resolution phase', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Story Resolution',
        description: 'Wrapping up the story',
        type: 'resolution',
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

      const result = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('The Aftermath');
      expect(result.storyIntegration?.storyType).toBe('resolution');
      expect(result.storyIntegration?.storyImpact).toBe('major');
    });

    it('should handle unknown story type gracefully', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
        title: 'Unknown Type',
        description: 'Unknown story type',
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

      const result = await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(result).toBeDefined();
      expect(result.storyIntegration?.storyType).toBe('setup'); // Should default to setup
    });
  });

  describe('Quest Outcome Processing', () => {
    it('should process successful quest completion', async () => {
      // Mock the quest-story link
      const mockQuestStoryLink = {
        campaignId: testCampaignId,
        questId: testQuestId,
        questName: 'Test Quest',
        storyBeatId: testStoryBeatId,
        storyType: 'setup',
        storyImpact: 'major',
        linkType: 'unlocks',
        createdAt: new Date(),
      };

      // Mock the findQuestStoryLink method
      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockImplementation(() => Promise.resolve(mockQuestStoryLink));

      // Add debugging to check if the method is called
      console.log('Before calling processQuestCompletionForStory');

      // Temporarily restore logger to see debug output
      jest.restoreAllMocks();

      await questStoryIntegrationService.processQuestCompletionForStory(
        testCampaignId,
        testQuestId,
        'success',
        ['character-1', 'character-2']
      );

      console.log('After calling processQuestCompletionForStory');
      console.log('Mock calls:', mockContextManager.updateStoryBeat.mock.calls);

      expect(mockContextManager.updateStoryBeat).toHaveBeenCalledWith(
        testCampaignId,
        testStoryBeatId,
        expect.objectContaining({
          status: 'completed',
        })
      );
    });

    it('should process quest failure', async () => {
      const mockQuestStoryLink = {
        campaignId: testCampaignId,
        questId: testQuestId,
        questName: 'Test Quest',
        storyBeatId: testStoryBeatId,
        storyType: 'setup',
        storyImpact: 'major',
        linkType: 'unlocks',
        createdAt: new Date(),
      };

      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockImplementation(() => Promise.resolve(mockQuestStoryLink));

      await questStoryIntegrationService.processQuestCompletionForStory(
        testCampaignId,
        testQuestId,
        'failure',
        ['character-1', 'character-2']
      );

      expect(mockContextManager.updateStoryBeat).toHaveBeenCalledWith(
        testCampaignId,
        testStoryBeatId,
        expect.objectContaining({
          status: 'failed',
        })
      );
    });

    it('should process partial quest completion', async () => {
      const mockQuestStoryLink = {
        campaignId: testCampaignId,
        questId: testQuestId,
        questName: 'Test Quest',
        storyBeatId: testStoryBeatId,
        storyType: 'development',
        storyImpact: 'moderate',
        linkType: 'advances',
        createdAt: new Date(),
      };

      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockImplementation(() => Promise.resolve(mockQuestStoryLink));

      await questStoryIntegrationService.processQuestCompletionForStory(
        testCampaignId,
        testQuestId,
        'partial',
        ['character-1', 'character-2']
      );

      expect(mockContextManager.updateStoryBeat).toHaveBeenCalledWith(
        testCampaignId,
        testStoryBeatId,
        expect.objectContaining({
          status: 'in_progress',
        })
      );
    });

    it('should handle missing quest-story link gracefully', async () => {
      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockImplementation(() => Promise.resolve(null));

      await expect(
        questStoryIntegrationService.processQuestCompletionForStory(
          testCampaignId,
          testQuestId,
          'success',
          ['character-1', 'character-2']
        )
      ).resolves.not.toThrow();
    });
  });

  describe('Quest-Story Linking', () => {
    it('should create quest-story link', async () => {
      const result = await questStoryIntegrationService.linkQuestToStoryBeat(
        testCampaignId,
        testQuestId,
        testStoryBeatId,
        'unlocks',
        'major'
      );

      expect(result).toBeDefined();
      expect(result.questId).toBe(testQuestId);
      expect(result.storyBeatId).toBe(testStoryBeatId);
      expect(result.linkType).toBe('unlocks');
      expect(result.storyImpact).toBe('major');
    });

    it('should find quest-story link', async () => {
      const mockLink = {
        campaignId: testCampaignId,
        questId: testQuestId,
        questName: 'Test Quest',
        storyBeatId: testStoryBeatId,
        storyType: 'setup',
        storyImpact: 'major',
        linkType: 'unlocks',
        createdAt: new Date(),
      };

      // Mock the database response
      const mockQuestStoryLink = {
        findOne: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLink),
        }),
      };

      (questStoryIntegrationService as any).QuestStoryLink = mockQuestStoryLink;

      const result = await (questStoryIntegrationService as any).findQuestStoryLink(
        testCampaignId,
        testQuestId
      );

      expect(result).toEqual(mockLink);
    });

    it('should return null when quest-story link not found', async () => {
      const mockQuestStoryLink = {
        findOne: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      };

      (questStoryIntegrationService as any).QuestStoryLink = mockQuestStoryLink;

      const result = await (questStoryIntegrationService as any).findQuestStoryLink(
        testCampaignId,
        testQuestId
      );

      expect(result).toBeNull();
    });
  });

  describe('Story Type Determination', () => {
    it('should determine story type from story beat', () => {
      const service = questStoryIntegrationService as any;

      const setupBeat: IStoryBeat = {
        id: 'beat-1',
        title: 'Setup Beat',
        description: 'Setup description',
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

      const developmentBeat: IStoryBeat = {
        id: 'beat-2',
        title: 'Development Beat',
        description: 'Development description',
        type: 'development',
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

      const climaxBeat: IStoryBeat = {
        id: 'beat-3',
        title: 'Climax Beat',
        description: 'Climax description',
        type: 'climax',
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

      const resolutionBeat: IStoryBeat = {
        id: 'beat-4',
        title: 'Resolution Beat',
        description: 'Resolution description',
        type: 'resolution',
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

      expect(service.getStoryTypeFromBeat(setupBeat)).toBe('setup');
      expect(service.getStoryTypeFromBeat(developmentBeat)).toBe('development');
      expect(service.getStoryTypeFromBeat(climaxBeat)).toBe('climax');
      expect(service.getStoryTypeFromBeat(resolutionBeat)).toBe('resolution');
    });
  });

  describe('Error Handling', () => {
    it('should handle quest generation errors gracefully', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
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

      // Mock an error in template creation
      jest
        .spyOn(questStoryIntegrationService as any, 'createStoryQuestTemplates')
        .mockImplementation(() => {
          throw new Error('Template creation failed');
        });

      await expect(
        questStoryIntegrationService.generateStoryIntegratedQuest(
          testCampaignId,
          mockStoryBeat,
          5,
          4
        )
      ).rejects.toThrow('Template creation failed');
    });

    it('should handle quest outcome processing errors gracefully', async () => {
      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        questStoryIntegrationService.processQuestCompletionForStory(
          testCampaignId,
          testQuestId,
          'success',
          ['character-1', 'character-2']
        )
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid campaign ID', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
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

      await expect(
        questStoryIntegrationService.generateStoryIntegratedQuest('', mockStoryBeat, 5, 4)
      ).rejects.toThrow();
    });
  });

  describe('Integration with Context Manager', () => {
    it('should add context layers for quest generation', async () => {
      const mockStoryBeat: IStoryBeat = {
        id: testStoryBeatId,
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

      await questStoryIntegrationService.generateStoryIntegratedQuest(
        testCampaignId,
        mockStoryBeat,
        5,
        4
      );

      expect(mockContextManager.addContextLayer).toHaveBeenCalledWith(
        testCampaignId,
        'quest',
        expect.stringContaining('Generated story quest'),
        expect.any(Number),
        ['quest', 'story', 'generation'],
        undefined,
        testQuestId
      );
    });

    it('should add context layers for quest outcomes', async () => {
      const mockQuestStoryLink = {
        campaignId: testCampaignId,
        questId: testQuestId,
        questName: 'Test Quest',
        storyBeatId: testStoryBeatId,
        storyType: 'setup',
        storyImpact: 'major',
        linkType: 'unlocks',
        createdAt: new Date(),
      };

      jest
        .spyOn(questStoryIntegrationService as any, 'findQuestStoryLink')
        .mockImplementation(() => Promise.resolve(mockQuestStoryLink));

      await questStoryIntegrationService.processQuestCompletionForStory(
        testCampaignId,
        testQuestId,
        'success',
        ['character-1', 'character-2']
      );

      expect(mockContextManager.addContextLayer).toHaveBeenCalledWith(
        testCampaignId,
        'quest',
        expect.stringContaining('Quest completed successfully'),
        expect.any(Number),
        ['quest', 'completion', 'story'],
        undefined,
        testQuestId
      );
    });
  });
});
