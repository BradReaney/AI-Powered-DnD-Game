import { QuestService } from '../src/services/QuestService';
import { GeminiClient } from '../src/services/GeminiClient';

// Mock the models
jest.mock('../src/models/Quest', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('../src/models/Campaign', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../src/models/Session', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../src/services/GeminiClient', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendPrompt: jest.fn().mockResolvedValue({
      success: true,
      content: 'Mocked AI response',
      modelUsed: 'flash',
      responseTime: 100,
    }),
    generateQuest: jest.fn().mockResolvedValue({
      success: true,
      content: 'Mocked quest response',
      modelUsed: 'flash',
      responseTime: 100,
    }),
  })),
}));

describe('QuestService', () => {
  let questService: QuestService;
  let mockQuest: any;
  let mockCampaign: any;
  let mockSession: any;
  let mockGeminiClient: jest.Mocked<GeminiClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuest = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockCampaign = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn(),
    };

    mockSession = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn(),
    };

    const { default: MockQuest } = require('../src/models/Quest');
    const { default: MockCampaign } = require('../src/models/Campaign');
    const { default: MockSession } = require('../src/models/Session');

    Object.assign(MockQuest, mockQuest);
    Object.assign(MockCampaign, mockCampaign);
    Object.assign(MockSession, mockSession);

    questService = new QuestService();
    mockGeminiClient = questService['geminiClient'] as jest.Mocked<GeminiClient>;
  });

  describe('createQuest', () => {
    it('should create a quest successfully', async () => {
      const questData = {
        name: 'Test Quest',
        description: 'A test quest',
        campaignId: 'campaign123',
        sessionId: 'session123',
        difficulty: 'medium',
        rewards: {
          experience: 100,
          gold: 50,
          items: ['sword'],
        },
      };

      const mockCreatedQuest = {
        _id: 'quest123',
        ...questData,
        status: 'active',
        createdAt: new Date(),
      };

      mockQuest.create.mockResolvedValue(mockCreatedQuest);
      mockCampaign.findByIdAndUpdate.mockResolvedValue({ _id: 'campaign123' });

      const result = await questService.createQuest(questData);

      expect(result.success).toBe(true);
      expect(result.quest).toBeDefined();
      expect(mockQuest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: questData.name,
          description: questData.description,
          campaignId: questData.campaignId,
          sessionId: questData.sessionId,
          difficulty: questData.difficulty,
          rewards: questData.rewards,
        })
      );
    });

    it('should fail if campaign not found', async () => {
      const questData = {
        name: 'Test Quest',
        description: 'A test quest',
        campaignId: 'nonexistent',
        sessionId: 'session123',
        difficulty: 'medium',
        rewards: {
          experience: 100,
          gold: 50,
          items: [],
        },
      };

      mockCampaign.findByIdAndUpdate.mockResolvedValue(null);

      const result = await questService.createQuest(questData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Campaign not found');
    });
  });

  describe('getQuestById', () => {
    it('should return quest if found', async () => {
      const mockQuestData = {
        _id: 'quest123',
        name: 'Test Quest',
        description: 'A test quest',
        campaignId: 'campaign123',
        sessionId: 'session123',
        difficulty: 'medium',
        rewards: {
          experience: 100,
          gold: 50,
          items: [],
        },
      };

      mockQuest.findById.mockResolvedValue(mockQuestData);

      const result = await questService.getQuestById('quest123');

      expect(result.success).toBe(true);
      expect(result.quest).toEqual(mockQuestData);
    });

    it('should return null if quest not found', async () => {
      mockQuest.findById.mockResolvedValue(null);

      const result = await questService.getQuestById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quest not found');
    });
  });

  describe('updateQuest', () => {
    it('should update quest successfully', async () => {
      const updateData = { name: 'Updated Quest Name' };
      const mockUpdatedQuest = {
        _id: 'quest123',
        name: 'Updated Quest Name',
        description: 'A test quest',
        campaignId: 'campaign123',
        sessionId: 'session123',
        difficulty: 'medium',
        rewards: {
          experience: 100,
          gold: 50,
          items: [],
        },
      };

      mockQuest.findByIdAndUpdate.mockResolvedValue(mockUpdatedQuest);

      const result = await questService.updateQuest('quest123', updateData);

      expect(result.success).toBe(true);
      expect(result.quest).toEqual(mockUpdatedQuest);
      expect(mockQuest.findByIdAndUpdate).toHaveBeenCalledWith('quest123', updateData);
    });

    it('should fail if quest not found', async () => {
      mockQuest.findByIdAndUpdate.mockResolvedValue(null);

      const result = await questService.updateQuest('nonexistent', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quest not found');
    });
  });

  describe('getQuestTemplates', () => {
    it('should return quest templates successfully', async () => {
      const mockTemplates = [
        {
          name: 'Goblin Hunt',
          description: 'Hunt down goblins',
          difficulty: 'easy',
          rewards: {
            experience: 50,
            gold: 25,
            items: [],
          },
        },
        {
          name: 'Dragon Slayer',
          description: 'Slay the dragon',
          difficulty: 'hard',
          rewards: {
            experience: 500,
            gold: 1000,
            items: ['dragon-scale-armor'],
          },
        },
      ];

      const result = await questService.getQuestTemplates();

      expect(result.success).toBe(true);
      expect(result.templates).toBeDefined();
      expect(result.templates).toHaveLength(2);
      expect(result.templates[0].name).toBe('Goblin Hunt');
      expect(result.templates[1].name).toBe('Dragon Slayer');
    });
  });

  describe('generateQuestWithAI', () => {
    it('should generate quest with AI successfully', async () => {
      const prompt = 'Generate a quest about exploring a dungeon';

      const mockAIResponse = {
        success: true,
        content: 'Generated quest content',
        modelUsed: 'flash',
        responseTime: 100,
      };

      mockGeminiClient.sendPrompt.mockResolvedValue(mockAIResponse);

      const result = await questService.generateQuestWithAI(prompt);

      expect(result.success).toBe(true);
      expect(result.content).toBe(mockAIResponse.content);
      expect(mockGeminiClient.sendPrompt).toHaveBeenCalledWith(prompt);
    });

    it('should fail if AI generation fails', async () => {
      const prompt = 'Generate a quest about exploring a dungeon';

      mockGeminiClient.sendPrompt.mockResolvedValue({
        success: false,
        error: 'AI generation failed',
      });

      const result = await questService.generateQuestWithAI(prompt);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI generation failed');
    });
  });

  describe('deleteQuest', () => {
    it('should delete quest successfully', async () => {
      mockQuest.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await questService.deleteQuest('quest123');

      expect(result.success).toBe(true);
      expect(mockQuest.deleteOne).toHaveBeenCalledWith({ _id: 'quest123' });
    });

    it('should fail if quest not found', async () => {
      mockQuest.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await questService.deleteQuest('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quest not found');
    });
  });
});
