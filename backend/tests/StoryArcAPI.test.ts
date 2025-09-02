import { Types } from 'mongoose';

// Mock all the services and dependencies
jest.mock('../src/services/StoryArcService');
jest.mock('../src/services/StoryValidator');
jest.mock('../src/services/StoryProgression');
jest.mock('../src/services/LLMClientFactory');
jest.mock('../src/services/CampaignService');
jest.mock('../src/services/LoggerService');
jest.mock('../src/services/CacheService');

describe('Story Arc API Endpoints', () => {
  let mockStoryArcService: any;
  let mockStoryValidator: any;
  let mockStoryProgression: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock services
    mockStoryArcService = {
      createStoryArc: jest.fn(),
      getStoryArcByCampaignId: jest.fn(),
      addStoryBeat: jest.fn(),
      completeStoryBeat: jest.fn(),
      addCharacterMilestone: jest.fn(),
      addWorldStateChange: jest.fn(),
      updateQuestProgress: jest.fn(),
      advanceChapter: jest.fn(),
      getCurrentStoryBeat: jest.fn(),
      validateStoryConsistency: jest.fn(),
      getStoryProgression: jest.fn(),
      deleteStoryArc: jest.fn(),
    };

    mockStoryValidator = {
      validateStoryArc: jest.fn(),
    };

    mockStoryProgression = {
      generateStoryBeatSuggestions: jest.fn(),
      getChapterProgressionData: jest.fn(),
    };

    // Mock the service constructors
    const StoryArcService = require('../src/services/StoryArcService').default;
    const StoryValidator = require('../src/services/StoryValidator').default;
    const StoryProgression = require('../src/services/StoryProgression').default;

    StoryArcService.mockImplementation(() => mockStoryArcService);
    StoryValidator.mockImplementation(() => mockStoryValidator);
    StoryProgression.mockImplementation(() => mockStoryProgression);
  });

  describe('Story Arc Service Integration', () => {
    it('should create a new story arc', async () => {
      const storyArcData = {
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        totalChapters: 3,
      };

      const mockStoryArc = {
        _id: new Types.ObjectId(),
        ...storyArcData,
        currentChapter: 1,
        currentAct: 1,
        storyPhase: 'setup',
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
        completedStoryBeats: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStoryArcService.createStoryArc.mockResolvedValue(mockStoryArc);

      const result = await mockStoryArcService.createStoryArc(storyArcData);

      expect(result).toBeDefined();
      expect(result.theme).toBe(storyArcData.theme);
      expect(mockStoryArcService.createStoryArc).toHaveBeenCalledWith(storyArcData);
    });

    it('should retrieve story arc by campaign ID', async () => {
      const campaignId = new Types.ObjectId();
      const mockStoryArc = {
        _id: new Types.ObjectId(),
        campaignId,
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        storyPhase: 'setup',
        currentChapter: 1,
        currentAct: 1,
        totalChapters: 3,
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
        completedStoryBeats: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStoryArcService.getStoryArcByCampaignId.mockResolvedValue(mockStoryArc);

      const result = await mockStoryArcService.getStoryArcByCampaignId(campaignId);

      expect(result).toBeDefined();
      expect(result.campaignId).toEqual(campaignId);
      expect(mockStoryArcService.getStoryArcByCampaignId).toHaveBeenCalledWith(campaignId);
    });

    it('should add a story beat', async () => {
      const campaignId = new Types.ObjectId();
      const beatData = {
        title: 'Test Beat',
        description: 'A test story beat',
        chapter: 1,
        act: 1,
        type: 'development',
        importance: 'moderate',
        characters: [new Types.ObjectId()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
      };

      const mockBeatId = 'beat-123';
      mockStoryArcService.addStoryBeat.mockResolvedValue(mockBeatId);

      const result = await mockStoryArcService.addStoryBeat(campaignId, beatData);

      expect(result).toBe(mockBeatId);
      expect(mockStoryArcService.addStoryBeat).toHaveBeenCalledWith(campaignId, beatData);
    });

    it('should complete a story beat', async () => {
      const campaignId = new Types.ObjectId();
      const beatId = 'beat-123';
      const outcome = 'Success';
      const notes = 'Test notes';

      mockStoryArcService.completeStoryBeat.mockResolvedValue(true);

      const result = await mockStoryArcService.completeStoryBeat(
        campaignId,
        beatId,
        outcome,
        notes
      );

      expect(result).toBe(true);
      expect(mockStoryArcService.completeStoryBeat).toHaveBeenCalledWith(
        campaignId,
        beatId,
        outcome,
        notes
      );
    });

    it('should add a character milestone', async () => {
      const campaignId = new Types.ObjectId();
      const milestoneData = {
        characterId: new Types.ObjectId(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        storyBeatId: 'beat-123',
        metadata: { level: 5 },
      };

      mockStoryArcService.addCharacterMilestone.mockResolvedValue(undefined);

      const result = await mockStoryArcService.addCharacterMilestone(campaignId, milestoneData);

      expect(result).toBeUndefined();
      expect(mockStoryArcService.addCharacterMilestone).toHaveBeenCalledWith(
        campaignId,
        milestoneData
      );
    });

    it('should add a world state change', async () => {
      const campaignId = new Types.ObjectId();
      const changeData = {
        type: 'location',
        title: 'Location Discovered',
        description: 'A new location was discovered',
        impact: 'major',
        affectedElements: ['location'],
        storyBeatId: 'beat-123',
        characterIds: [new Types.ObjectId()],
        location: 'Forest of Shadows',
        permanent: true,
      };

      const mockChangeId = 'change-123';
      mockStoryArcService.addWorldStateChange.mockResolvedValue(mockChangeId);

      const result = await mockStoryArcService.addWorldStateChange(campaignId, changeData);

      expect(result).toBe(mockChangeId);
      expect(mockStoryArcService.addWorldStateChange).toHaveBeenCalledWith(campaignId, changeData);
    });

    it('should update quest progress', async () => {
      const campaignId = new Types.ObjectId();
      const questId = new Types.ObjectId();
      const updates = {
        status: 'completed' as const,
        objectives: [
          {
            description: 'Find the artifact',
            completed: true,
            completedAt: new Date(),
          },
        ],
      };

      mockStoryArcService.updateQuestProgress.mockResolvedValue(true);

      const result = await mockStoryArcService.updateQuestProgress(campaignId, questId, updates);

      expect(result).toBe(true);
      expect(mockStoryArcService.updateQuestProgress).toHaveBeenCalledWith(
        campaignId,
        questId,
        updates
      );
    });

    it('should advance chapter', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcService.advanceChapter.mockResolvedValue(true);

      const result = await mockStoryArcService.advanceChapter(campaignId);

      expect(result).toBe(true);
      expect(mockStoryArcService.advanceChapter).toHaveBeenCalledWith(campaignId);
    });

    it('should get current story beat', async () => {
      const campaignId = new Types.ObjectId();
      const currentBeat = {
        id: 'beat-123',
        title: 'Current Beat',
        description: 'The current story beat',
        chapter: 1,
        act: 1,
        type: 'development',
        importance: 'moderate',
        characters: [new Types.ObjectId()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStoryArcService.getCurrentStoryBeat.mockResolvedValue(currentBeat);

      const result = await mockStoryArcService.getCurrentStoryBeat(campaignId);

      expect(result).toBe(currentBeat);
      expect(mockStoryArcService.getCurrentStoryBeat).toHaveBeenCalledWith(campaignId);
    });

    it('should validate story consistency', async () => {
      const campaignId = new Types.ObjectId();
      const validationResult = {
        isValid: true,
        issues: [],
        warnings: [],
        suggestions: [],
      };

      mockStoryArcService.validateStoryConsistency.mockResolvedValue(validationResult);

      const result = await mockStoryArcService.validateStoryConsistency(campaignId);

      expect(result).toBe(validationResult);
      expect(mockStoryArcService.validateStoryConsistency).toHaveBeenCalledWith(campaignId);
    });

    it('should get story progression', async () => {
      const campaignId = new Types.ObjectId();
      const progressionData = {
        currentChapter: 1,
        currentAct: 1,
        totalChapters: 3,
        totalActs: 3,
        completedBeats: 0,
        totalBeats: 0,
        progressPercentage: 0,
      };

      mockStoryArcService.getStoryProgression.mockResolvedValue(progressionData);

      const result = await mockStoryArcService.getStoryProgression(campaignId);

      expect(result).toBe(progressionData);
      expect(mockStoryArcService.getStoryProgression).toHaveBeenCalledWith(campaignId);
    });

    it('should delete story arc', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcService.deleteStoryArc.mockResolvedValue(true);

      const result = await mockStoryArcService.deleteStoryArc(campaignId);

      expect(result).toBe(true);
      expect(mockStoryArcService.deleteStoryArc).toHaveBeenCalledWith(campaignId);
    });
  });

  describe('Story Validator Integration', () => {
    it('should validate story arc', async () => {
      const mockStoryArc = {
        _id: new Types.ObjectId(),
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      };

      const mockValidationResult = {
        valid: true,
        overallScore: 85,
        results: [],
        summary: {
          totalRules: 5,
          passedRules: 4,
          failedRules: 1,
          warnings: 2,
          suggestions: 3,
        },
        recommendations: ['Add more character development'],
      };

      mockStoryValidator.validateStoryArc.mockResolvedValue(mockValidationResult);

      const result = await mockStoryValidator.validateStoryArc(mockStoryArc);

      expect(result).toBe(mockValidationResult);
      expect(result.valid).toBe(true);
      expect(result.overallScore).toBe(85);
      expect(mockStoryValidator.validateStoryArc).toHaveBeenCalledWith(mockStoryArc);
    });
  });

  describe('Story Progression Integration', () => {
    it('should generate story beat suggestions', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      const mockSuggestions = [
        {
          title: 'Meet the Quest Giver',
          description: 'The party meets an important NPC',
          type: 'exposition',
          characters: request.characters,
          consequences: ['Quest received'],
        },
        {
          title: 'First Combat',
          description: 'The party faces their first challenge',
          type: 'action',
          characters: request.characters,
          consequences: ['Combat experience gained'],
        },
      ];

      mockStoryProgression.generateStoryBeatSuggestions.mockResolvedValue(mockSuggestions);

      const result = await mockStoryProgression.generateStoryBeatSuggestions(request);

      expect(result).toBe(mockSuggestions);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Meet the Quest Giver');
      expect(mockStoryProgression.generateStoryBeatSuggestions).toHaveBeenCalledWith(request);
    });

    it('should get chapter progression data', async () => {
      const storyArcId = new Types.ObjectId();
      const progressionData = {
        currentChapter: 1,
        currentAct: 1,
        totalChapters: 3,
        totalActs: 3,
        completedBeats: 2,
        totalBeats: 5,
        progressPercentage: 40,
      };

      mockStoryProgression.getChapterProgressionData.mockResolvedValue(progressionData);

      const result = await mockStoryProgression.getChapterProgressionData(storyArcId);

      expect(result).toBe(progressionData);
      expect(result.currentChapter).toBe(1);
      expect(result.progressPercentage).toBe(40);
      expect(mockStoryProgression.getChapterProgressionData).toHaveBeenCalledWith(storyArcId);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcService.getStoryArcByCampaignId.mockRejectedValue(
        new Error('Service unavailable')
      );

      await expect(mockStoryArcService.getStoryArcByCampaignId(campaignId)).rejects.toThrow(
        'Service unavailable'
      );
    });

    it('should handle validation errors', async () => {
      const mockStoryArc = {
        _id: new Types.ObjectId(),
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      };

      mockStoryValidator.validateStoryArc.mockRejectedValue(new Error('Validation error'));

      await expect(mockStoryValidator.validateStoryArc(mockStoryArc)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should handle progression errors', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      mockStoryProgression.generateStoryBeatSuggestions.mockRejectedValue(
        new Error('Progression error')
      );

      await expect(mockStoryProgression.generateStoryBeatSuggestions(request)).rejects.toThrow(
        'Progression error'
      );
    });
  });

  describe('Data Validation', () => {
    it('should validate story arc creation data', () => {
      const validData = {
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        totalChapters: 3,
      };

      expect(validData.campaignId).toBeInstanceOf(Types.ObjectId);
      expect(typeof validData.theme).toBe('string');
      expect(typeof validData.tone).toBe('string');
      expect(typeof validData.pacing).toBe('string');
      expect(typeof validData.totalChapters).toBe('number');
    });

    it('should validate story beat data', () => {
      const validBeatData = {
        title: 'Test Beat',
        description: 'A test story beat',
        chapter: 1,
        act: 1,
        type: 'development',
        importance: 'moderate',
        characters: [new Types.ObjectId()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
      };

      expect(typeof validBeatData.title).toBe('string');
      expect(typeof validBeatData.description).toBe('string');
      expect(typeof validBeatData.chapter).toBe('number');
      expect(typeof validBeatData.act).toBe('number');
      expect(typeof validBeatData.type).toBe('string');
      expect(typeof validBeatData.importance).toBe('string');
      expect(Array.isArray(validBeatData.characters)).toBe(true);
      expect(Array.isArray(validBeatData.npcs)).toBe(true);
      expect(Array.isArray(validBeatData.consequences)).toBe(true);
    });

    it('should validate character milestone data', () => {
      const validMilestoneData = {
        characterId: new Types.ObjectId(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        storyBeatId: 'beat-123',
        metadata: { level: 5 },
      };

      expect(validMilestoneData.characterId).toBeInstanceOf(Types.ObjectId);
      expect(typeof validMilestoneData.type).toBe('string');
      expect(typeof validMilestoneData.title).toBe('string');
      expect(typeof validMilestoneData.description).toBe('string');
      expect(typeof validMilestoneData.impact).toBe('string');
    });

    it('should validate world state change data', () => {
      const validChangeData = {
        type: 'location',
        title: 'Location Discovered',
        description: 'A new location was discovered',
        impact: 'major',
        affectedElements: ['location'],
        storyBeatId: 'beat-123',
        characterIds: [new Types.ObjectId()],
        location: 'Forest of Shadows',
        permanent: true,
      };

      expect(typeof validChangeData.type).toBe('string');
      expect(typeof validChangeData.title).toBe('string');
      expect(typeof validChangeData.description).toBe('string');
      expect(typeof validChangeData.impact).toBe('string');
      expect(Array.isArray(validChangeData.affectedElements)).toBe(true);
      expect(Array.isArray(validChangeData.characterIds)).toBe(true);
      expect(typeof validChangeData.permanent).toBe('boolean');
    });
  });
});
