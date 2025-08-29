import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import QuestService from '../src/services/QuestService';
import { GeneratedQuest, QuestObjective } from '../src/services/QuestService';

// Mock the GeminiClient
jest.mock('../src/services/GeminiClient', () => {
  const mockGeminiClient = {
    generateContent: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockGeminiClient),
  };
});

// Mock the models
jest.mock('../src/models', () => ({
  Campaign: {
    findById: jest.fn(),
  },
}));

describe('QuestService', () => {
  let questService: QuestService;
  let mockGeminiClient: any;
  let mockCampaignFindById: jest.Mock;

  beforeEach(() => {
    questService = QuestService.getInstance();

    // Get the mocked GeminiClient instance from the service
    mockGeminiClient = (questService as any).geminiClient;

    // Ensure the mock has the generateContent method
    if (mockGeminiClient && mockGeminiClient.generateContent) {
      mockGeminiClient.generateContent.mockResolvedValue(`
{
  "name": "Test Quest",
  "description": "A test quest for testing purposes",
  "objectives": [
    {
      "description": "Complete the test objective",
      "completed": false,
      "progress": 0
    }
  ],
  "rewards": {
    "experience": 100,
    "gold": 50,
    "items": [
      {
        "name": "Test Item",
        "description": "A test item",
        "rarity": "common",
        "quantity": 1
      }
    ],
    "reputation": [
      {
        "faction": "Test Faction",
        "amount": 10
      }
    ]
  },
  "difficulty": "medium",
  "estimatedDuration": 2,
  "location": "Test Location",
  "questGiver": "Test NPC",
  "hooks": ["Test hook 1", "Test hook 2"],
  "consequences": {
    "success": ["Success consequence"],
    "failure": ["Failure consequence"],
    "partial": ["Partial consequence"]
  }
}
            `);
    }

    // Get the mocked Campaign.findById
    const { Campaign } = require('../src/models');
    mockCampaignFindById = Campaign.findById;
  });

  afterEach(() => {
    // Clean up any test data if needed
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = QuestService.getInstance();
      const instance2 = QuestService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getQuestTemplates', () => {
    it('should return quest templates', async () => {
      const templates = await questService.getQuestTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should filter templates by type', async () => {
      const mainTemplates = await questService.getQuestTemplates('main');
      expect(mainTemplates.every(t => t.type === 'main')).toBe(true);
    });

    it('should filter templates by difficulty', async () => {
      const easyTemplates = await questService.getQuestTemplates(undefined, 'easy');
      expect(easyTemplates.every(t => t.difficulty === 'easy')).toBe(true);
    });

    it('should filter templates by level range', async () => {
      const levelRange = { min: 1, max: 3 };
      const templates = await questService.getQuestTemplates(undefined, undefined, levelRange);
      expect(
        templates.every(
          t => t.levelRange.min <= levelRange.max && t.levelRange.max >= levelRange.min
        )
      ).toBe(true);
    });
  });

  describe('Quest Template Structure', () => {
    it('should have valid quest template structure', async () => {
      const templates = await questService.getQuestTemplates();
      const template = templates[0];

      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('difficulty');
      expect(template).toHaveProperty('levelRange');
      expect(template).toHaveProperty('objectives');
      expect(template).toHaveProperty('rewards');
      expect(template).toHaveProperty('location');
      expect(template).toHaveProperty('questGiver');
      expect(template).toHaveProperty('tags');

      expect(typeof template.id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.description).toBe('string');
      expect(['main', 'side', 'faction', 'exploration', 'social', 'combat']).toContain(
        template.type
      );
      expect(['easy', 'medium', 'hard', 'deadly']).toContain(template.difficulty);
      expect(Array.isArray(template.objectives)).toBe(true);
      expect(Array.isArray(template.tags)).toBe(true);
    });

    it('should have valid objective structure', async () => {
      const templates = await questService.getQuestTemplates();
      const template = templates[0];
      const objective = template.objectives[0];

      expect(objective).toHaveProperty('description');
      expect(objective).toHaveProperty('completed');
      expect(objective).toHaveProperty('progress');

      expect(typeof objective.description).toBe('string');
      expect(typeof objective.completed).toBe('boolean');
      expect(typeof objective.progress).toBe('number');
      expect(objective.progress).toBeGreaterThanOrEqual(0);
      expect(objective.progress).toBeLessThanOrEqual(100);
    });

    it('should have valid reward structure', () => {
      const templates = questService.getQuestTemplates();
      const template = templates[0];
      const reward = template.rewards;

      expect(reward).toHaveProperty('experience');
      expect(reward).toHaveProperty('gold');
      expect(reward).toHaveProperty('items');
      expect(reward).toHaveProperty('reputation');

      expect(typeof reward.experience).toBe('number');
      expect(typeof reward.gold).toBe('number');
      expect(Array.isArray(reward.items)).toBe(true);
      expect(Array.isArray(reward.reputation)).toBe(true);
    });
  });

  describe('Quest Generation', () => {
    it('should generate quest with valid structure', async () => {
      const mockCampaignId = 'test-campaign-id';
      const mockWorldState = {
        currentLocation: 'Test Town',
        knownLocations: ['Test Town'],
        factions: [],
      };

      // Mock the GeminiClient response
      mockGeminiClient.generateContent.mockResolvedValue(`
{
  "name": "Test Quest",
  "description": "A test quest for testing purposes",
  "objectives": [
    {
      "description": "Complete the test objective",
      "completed": false,
      "progress": 0
    }
  ],
  "rewards": {
    "experience": 100,
    "gold": 50,
    "items": [
      {
        "name": "Test Item",
        "description": "A test item",
        "rarity": "common",
        "quantity": 1
      }
    ],
    "reputation": [
      {
        "faction": "Test Faction",
        "amount": 10
      }
    ]
  },
  "difficulty": "medium",
  "estimatedDuration": 2,
  "location": "Test Location",
  "questGiver": "Test NPC",
  "hooks": ["Test hook 1", "Test hook 2"],
  "consequences": {
    "success": ["Success consequence"],
    "failure": ["Failure consequence"],
    "partial": ["Partial consequence"]
  }
}
            `);

      const generatedQuest = await questService.generateQuest(
        mockCampaignId,
        'main',
        'medium',
        3,
        4,
        'Test Town',
        mockWorldState
      );

      expect(generatedQuest).toHaveProperty('name');
      expect(generatedQuest).toHaveProperty('description');
      expect(generatedQuest).toHaveProperty('objectives');
      expect(generatedQuest).toHaveProperty('rewards');
      expect(generatedQuest).toHaveProperty('difficulty');
      expect(generatedQuest).toHaveProperty('estimatedDuration');
      expect(generatedQuest).toHaveProperty('location');
      expect(generatedQuest).toHaveProperty('questGiver');
      expect(generatedQuest).toHaveProperty('hooks');
      expect(generatedQuest).toHaveProperty('consequences');

      expect(typeof generatedQuest.name).toBe('string');
      expect(typeof generatedQuest.description).toBe('string');
      expect(Array.isArray(generatedQuest.objectives)).toBe(true);
      expect(Array.isArray(generatedQuest.hooks)).toBe(true);
      expect(['easy', 'medium', 'hard', 'deadly']).toContain(generatedQuest.difficulty);

      // Check that objectives have IDs
      generatedQuest.objectives.forEach((objective: QuestObjective) => {
        expect(objective).toHaveProperty('id');
        expect(typeof objective.id).toBe('string');
      });
    });
  });

  describe('Quest Statistics', () => {
    it('should return valid statistics structure', async () => {
      const mockCampaignId = 'test-campaign-id';

      // Mock the Campaign model to avoid database calls
      (mockCampaignFindById as any).mockResolvedValue({
        progress: {
          activeQuests: [],
          completedQuests: [],
        },
      });

      const statistics = await questService.getQuestStatistics(mockCampaignId);

      expect(statistics).toBeDefined();
      expect(statistics).toHaveProperty('totalQuests');
      expect(statistics).toHaveProperty('activeQuests');
      expect(statistics).toHaveProperty('completedQuests');
      expect(statistics).toHaveProperty('completionRate');
      expect(statistics).toHaveProperty('averageExperiencePerQuest');
      expect(statistics).toHaveProperty('questTypes');
      expect(statistics).toHaveProperty('difficultyDistribution');
      expect(statistics).toHaveProperty('totalExperienceRewarded');
      expect(statistics).toHaveProperty('totalGoldRewarded');
      expect(statistics).toHaveProperty('totalItemsRewarded');

      // Check that the statistics have the correct structure
      expect(typeof statistics.totalQuests).toBe('number');
      expect(typeof statistics.activeQuests).toBe('number');
      expect(typeof statistics.completedQuests).toBe('number');
      expect(typeof statistics.completionRate).toBe('number');
      expect(typeof statistics.averageExperiencePerQuest).toBe('number');
      expect(typeof statistics.totalExperienceRewarded).toBe('number');
      expect(typeof statistics.totalGoldRewarded).toBe('number');
      expect(typeof statistics.totalItemsRewarded).toBe('number');

      // Check quest types structure
      expect(statistics.questTypes).toHaveProperty('main');
      expect(statistics.questTypes).toHaveProperty('side');
      expect(statistics.questTypes).toHaveProperty('faction');
      expect(statistics.questTypes).toHaveProperty('exploration');
      expect(statistics.questTypes).toHaveProperty('social');
      expect(statistics.questTypes).toHaveProperty('combat');

      // Check difficulty distribution structure
      expect(statistics.difficultyDistribution).toHaveProperty('easy');
      expect(statistics.difficultyDistribution).toHaveProperty('medium');
      expect(statistics.difficultyDistribution).toHaveProperty('hard');
      expect(statistics.difficultyDistribution).toHaveProperty('deadly');
    });
  });
});
