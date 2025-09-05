import request from 'supertest';
import { Types } from 'mongoose';
import App from '../src/app';

const app = new App();
const expressApp = app.app;

// Mock all the services and dependencies
jest.mock('../src/services/StoryArcService');
jest.mock('../src/services/StoryValidator');
jest.mock('../src/services/StoryProgression');
jest.mock('../src/services/LLMClientFactory');
jest.mock('../src/services/CampaignService');
jest.mock('../src/services/LoggerService');
jest.mock('../src/services/CacheService');

describe('Story Arc Routes Integration Tests', () => {
  let mockStoryArcService: any;
  let mockStoryValidator: any;
  let mockStoryProgression: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock services
    mockStoryArcService = {
      createStoryArc: jest.fn(),
      getStoryArcByCampaignId: jest.fn(),
      updateStoryArc: jest.fn(),
      addStoryBeat: jest.fn(),
      completeStoryBeat: jest.fn(),
      addCharacterMilestone: jest.fn(),
      addWorldStateChange: jest.fn(),
      updateQuestProgress: jest.fn(),
      advanceChapter: jest.fn(),
      getCurrentStoryBeat: jest.fn(),
      validateStoryConsistency: jest.fn(),
      getStoryProgression: jest.fn(),
      generateStoryBeatSuggestions: jest.fn(),
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

  describe('POST /api/story-arcs', () => {
    it('should create a new story arc', async () => {
      const storyArcData = {
        campaignId: new Types.ObjectId().toString(),
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

      const response = await request(expressApp)
        .post('/api/story-arcs')
        .send(storyArcData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockStoryArcService.createStoryArc).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignId: expect.any(Types.ObjectId),
          theme: storyArcData.theme,
          tone: storyArcData.tone,
          pacing: storyArcData.pacing,
          totalChapters: storyArcData.totalChapters,
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        theme: 'fantasy',
        // Missing campaignId
      };

      const response = await request(expressApp)
        .post('/api/story-arcs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 500 for service errors', async () => {
      const storyArcData = {
        campaignId: new Types.ObjectId().toString(),
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        totalChapters: 3,
      };

      mockStoryArcService.createStoryArc.mockRejectedValue(new Error('Service error'));

      const response = await request(expressApp)
        .post('/api/story-arcs')
        .send(storyArcData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/story-arcs/campaign/:campaignId', () => {
    it('should get story arc by campaign ID', async () => {
      const campaignId = new Types.ObjectId().toString();
      const mockStoryArc = {
        _id: new Types.ObjectId(),
        campaignId: new Types.ObjectId(campaignId),
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

      const response = await request(expressApp)
        .get(`/api/story-arcs/campaign/${campaignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockStoryArcService.getStoryArcByCampaignId).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
    });

    it('should return 400 for invalid campaign ID', async () => {
      const invalidCampaignId = 'invalid-id';

      const response = await request(expressApp)
        .get(`/api/story-arcs/campaign/${invalidCampaignId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid campaign ID format');
    });

    it('should return 404 when story arc not found', async () => {
      const campaignId = new Types.ObjectId().toString();

      mockStoryArcService.getStoryArcByCampaignId.mockResolvedValue(null);

      const response = await request(expressApp)
        .get(`/api/story-arcs/campaign/${campaignId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/story-arcs/:storyArcId', () => {
    it('should update a story arc', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const updateData = {
        theme: 'updated-fantasy',
        tone: 'light',
        pacing: 'fast',
      };

      const mockUpdatedStoryArc = {
        _id: new Types.ObjectId(storyArcId),
        ...updateData,
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

      mockStoryArcService.updateStoryArc.mockResolvedValue(mockUpdatedStoryArc);

      const response = await request(expressApp)
        .put(`/api/story-arcs/${storyArcId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockStoryArcService.updateStoryArc).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        updateData
      );
    });
  });

  describe('POST /api/story-arcs/:storyArcId/story-beats', () => {
    it('should add a story beat', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const beatData = {
        title: 'Test Beat',
        description: 'A test story beat',
        chapter: 1,
        act: 1,
        type: 'development',
        importance: 'moderate',
        characters: [new Types.ObjectId().toString()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
      };

      const mockBeatId = 'beat-123';
      mockStoryArcService.addStoryBeat.mockResolvedValue(mockBeatId);

      const response = await request(expressApp)
        .post(`/api/story-arcs/${storyArcId}/story-beats`)
        .send(beatData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(mockBeatId);
      expect(mockStoryArcService.addStoryBeat).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({
          title: beatData.title,
          description: beatData.description,
          chapter: beatData.chapter,
          act: beatData.act,
          type: beatData.type,
          importance: beatData.importance,
        })
      );
    });
  });

  describe('PUT /api/story-arcs/:storyArcId/story-beats/:beatId/complete', () => {
    it('should complete a story beat', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const beatId = 'beat-123';
      const completionData = {
        outcome: 'Success',
        notes: 'Test completion notes',
      };

      mockStoryArcService.completeStoryBeat.mockResolvedValue(true);

      const response = await request(expressApp)
        .put(`/api/story-arcs/${storyArcId}/story-beats/${beatId}/complete`)
        .send(completionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStoryArcService.completeStoryBeat).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        beatId,
        completionData.outcome,
        completionData.notes
      );
    });
  });

  describe('POST /api/story-arcs/:storyArcId/character-milestones', () => {
    it('should add a character milestone', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const milestoneData = {
        characterId: new Types.ObjectId().toString(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        storyBeatId: 'beat-123',
        metadata: { level: 5 },
      };

      mockStoryArcService.addCharacterMilestone.mockResolvedValue(undefined);

      const response = await request(expressApp)
        .post(`/api/story-arcs/${storyArcId}/character-milestones`)
        .send(milestoneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockStoryArcService.addCharacterMilestone).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({
          characterId: expect.any(Types.ObjectId),
          type: milestoneData.type,
          title: milestoneData.title,
          description: milestoneData.description,
          impact: milestoneData.impact,
        })
      );
    });
  });

  describe('POST /api/story-arcs/:storyArcId/world-state-changes', () => {
    it('should add a world state change', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const changeData = {
        type: 'location',
        title: 'Location Discovered',
        description: 'A new location was discovered',
        impact: 'major',
        affectedElements: ['location'],
        storyBeatId: 'beat-123',
        characterIds: [new Types.ObjectId().toString()],
        location: 'Forest of Shadows',
        permanent: true,
      };

      const mockChangeId = 'change-123';
      mockStoryArcService.addWorldStateChange.mockResolvedValue(mockChangeId);

      const response = await request(expressApp)
        .post(`/api/story-arcs/${storyArcId}/world-state-changes`)
        .send(changeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(mockChangeId);
      expect(mockStoryArcService.addWorldStateChange).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({
          type: changeData.type,
          title: changeData.title,
          description: changeData.description,
          impact: changeData.impact,
        })
      );
    });
  });

  describe('PUT /api/story-arcs/:storyArcId/quest-progress', () => {
    it('should update quest progress', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const questProgressData = {
        questId: new Types.ObjectId().toString(),
        updates: {
          status: 'completed',
          objectives: [
            {
              description: 'Find the artifact',
              completed: true,
              completedAt: new Date(),
            },
          ],
        },
      };

      mockStoryArcService.updateQuestProgress.mockResolvedValue(true);

      const response = await request(expressApp)
        .put(`/api/story-arcs/${storyArcId}/quest-progress`)
        .send(questProgressData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStoryArcService.updateQuestProgress).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.any(Types.ObjectId),
        questProgressData.updates
      );
    });
  });

  describe('PUT /api/story-arcs/:storyArcId/advance-chapter', () => {
    it('should advance chapter', async () => {
      const storyArcId = new Types.ObjectId().toString();

      mockStoryArcService.advanceChapter.mockResolvedValue(true);

      const response = await request(expressApp)
        .put(`/api/story-arcs/${storyArcId}/advance-chapter`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStoryArcService.advanceChapter).toHaveBeenCalledWith(expect.any(Types.ObjectId));
    });
  });

  describe('GET /api/story-arcs/:storyArcId/current-story-beat', () => {
    it('should get current story beat', async () => {
      const storyArcId = new Types.ObjectId().toString();
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

      const response = await request(expressApp)
        .get(`/api/story-arcs/${storyArcId}/current-story-beat`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(currentBeat);
      expect(mockStoryArcService.getCurrentStoryBeat).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
    });
  });

  describe('POST /api/story-arcs/:storyArcId/validate', () => {
    it('should validate story consistency', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const validationResult = {
        isValid: true,
        issues: [],
        warnings: [],
        suggestions: [],
      };

      mockStoryArcService.validateStoryConsistency.mockResolvedValue(validationResult);

      const response = await request(expressApp)
        .post(`/api/story-arcs/${storyArcId}/validate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(validationResult);
      expect(mockStoryArcService.validateStoryConsistency).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
    });
  });

  describe('GET /api/story-arcs/:storyArcId/progression', () => {
    it('should get story progression', async () => {
      const storyArcId = new Types.ObjectId().toString();
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

      const response = await request(expressApp)
        .get(`/api/story-arcs/${storyArcId}/progression`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(progressionData);
      expect(mockStoryArcService.getStoryProgression).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
    });
  });

  describe('POST /api/story-arcs/:storyArcId/suggestions', () => {
    it('should generate story beat suggestions', async () => {
      const storyArcId = new Types.ObjectId().toString();
      const suggestionRequest = {
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId().toString()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      const mockSuggestions = [
        {
          title: 'Meet the Quest Giver',
          description: 'The party meets an important NPC',
          type: 'exposition',
          characters: suggestionRequest.characters,
          consequences: ['Quest received'],
        },
      ];

      mockStoryArcService.generateStoryBeatSuggestions.mockResolvedValue(mockSuggestions);

      const response = await request(expressApp)
        .post(`/api/story-arcs/${storyArcId}/suggestions`)
        .send(suggestionRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(mockSuggestions);
      expect(mockStoryArcService.generateStoryBeatSuggestions).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({
          chapter: suggestionRequest.chapter,
          act: suggestionRequest.act,
          context: suggestionRequest.context,
        })
      );
    });
  });

  describe('DELETE /api/story-arcs/:storyArcId', () => {
    it('should delete a story arc', async () => {
      const storyArcId = new Types.ObjectId().toString();

      mockStoryArcService.deleteStoryArc.mockResolvedValue(true);

      const response = await request(expressApp)
        .delete(`/api/story-arcs/${storyArcId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStoryArcService.deleteStoryArc).toHaveBeenCalledWith(expect.any(Types.ObjectId));
    });
  });
});
