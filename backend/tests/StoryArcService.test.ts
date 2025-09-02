import { Types } from 'mongoose';
import StoryArcService from '../src/services/StoryArcService';
import {
  StoryBeatData,
  CharacterMilestoneData,
  WorldStateChangeData,
  StoryArcCreationData,
} from '../src/services/StoryArcService';

// Mock the StoryArc model
const mockStoryArcModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
};

// Mock the Campaign model
const mockCampaignModel = {
  findById: jest.fn(),
};

// Mock the models module
jest.mock('../src/models/StoryArc', () => ({
  __esModule: true,
  StoryArc: mockStoryArcModel,
}));

jest.mock('../src/models', () => ({
  __esModule: true,
  Campaign: mockCampaignModel,
}));

describe('StoryArcService', () => {
  let storyArcService: StoryArcService;

  beforeEach(() => {
    jest.clearAllMocks();
    storyArcService = new StoryArcService();
  });

  describe('Service Instantiation', () => {
    it('should be instantiated', () => {
      expect(storyArcService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof storyArcService.createStoryArc).toBe('function');
      expect(typeof storyArcService.getStoryArcByCampaignId).toBe('function');
      expect(typeof storyArcService.addStoryBeat).toBe('function');
      expect(typeof storyArcService.completeStoryBeat).toBe('function');
      expect(typeof storyArcService.addCharacterMilestone).toBe('function');
      expect(typeof storyArcService.addWorldStateChange).toBe('function');
      expect(typeof storyArcService.updateQuestProgress).toBe('function');
      expect(typeof storyArcService.advanceChapter).toBe('function');
      expect(typeof storyArcService.getCurrentStoryBeat).toBe('function');
      expect(typeof storyArcService.validateStoryConsistency).toBe('function');
      expect(typeof storyArcService.getStoryProgression).toBe('function');
      expect(typeof storyArcService.deleteStoryArc).toBe('function');
    });
  });

  describe('createStoryArc', () => {
    it('should create a new story arc', async () => {
      const storyArcData: StoryArcCreationData = {
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

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockStoryArcModel.create.mockResolvedValue(mockStoryArc);

      const result = await storyArcService.createStoryArc(storyArcData);

      expect(result).toBeDefined();
      expect(mockStoryArcModel.create).toHaveBeenCalledWith({
        ...storyArcData,
        currentChapter: 1,
        currentAct: 1,
        storyPhase: 'setup',
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
        completedStoryBeats: 0,
      });
    });

    it('should handle creation errors', async () => {
      const storyArcData: StoryArcCreationData = {
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        totalChapters: 3,
      };

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockStoryArcModel.create.mockRejectedValue(new Error('Database error'));

      await expect(storyArcService.createStoryArc(storyArcData)).rejects.toThrow('Database error');
    });
  });

  describe('getStoryArcByCampaignId', () => {
    it('should retrieve story arc by campaign ID', async () => {
      const campaignId = new Types.ObjectId();
      const mockStoryArc = {
        _id: new Types.ObjectId(),
        campaignId,
        theme: 'fantasy',
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      };

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStoryArc),
        }),
      });

      const result = await storyArcService.getStoryArcByCampaignId(campaignId);

      expect(result).toBe(mockStoryArc);
    });

    it('should return null if story arc not found', async () => {
      const campaignId = new Types.ObjectId();

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await storyArcService.getStoryArcByCampaignId(campaignId);

      expect(result).toBeNull();
    });
  });

  describe('deleteStoryArc', () => {
    it('should delete a story arc', async () => {
      const campaignId = new Types.ObjectId();

      mockStoryArcModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await storyArcService.deleteStoryArc(campaignId);

      expect(result).toBe(true);
      expect(mockStoryArcModel.deleteOne).toHaveBeenCalledWith({ campaignId });
    });

    it('should return false if story arc not found', async () => {
      const campaignId = new Types.ObjectId();

      mockStoryArcModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await storyArcService.deleteStoryArc(campaignId);

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ObjectId', () => {
      const invalidId = 'invalid-id';

      expect(() => {
        storyArcService.validateObjectId(invalidId);
      }).toThrow('Invalid ObjectId');
    });
  });
});
