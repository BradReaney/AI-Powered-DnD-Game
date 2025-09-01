import { QuestService } from '../src/services/QuestService';

// Simple mocks for models
jest.mock('../src/models', () => ({
  __esModule: true,
  Campaign: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('QuestService', () => {
  let questService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    questService = QuestService.getInstance();
  });

  describe('basic functionality', () => {
    it('should be instantiated', () => {
      expect(questService).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof questService.getQuestTemplates).toBe('function');
      expect(typeof questService.addQuestToCampaign).toBe('function');
      expect(typeof questService.getWorldExplorationData).toBe('function');
    });
  });

  describe('getQuestTemplates', () => {
    it('should return quest templates successfully', async () => {
      const result = await questService.getQuestTemplates();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
