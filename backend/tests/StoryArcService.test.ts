import { Types } from 'mongoose';
import StoryArcService from '../src/services/StoryArcService';
import { IStoryArc } from '../src/models/StoryArc';
import {
  StoryBeatData,
  CharacterMilestoneData,
  WorldStateChangeData,
  StoryArcCreationData,
} from '../src/services/StoryArcService';

// Mock the StoryArc model
const mockStoryArc = {
  _id: new Types.ObjectId(),
  campaignId: new Types.ObjectId(),
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
  addStoryBeat: jest.fn(),
  completeStoryBeat: jest.fn(),
  addCharacterMilestone: jest.fn(),
  addWorldStateChange: jest.fn(),
  updateQuestProgress: jest.fn(),
  advanceChapter: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
};

// Mock the StoryArc model constructor
jest.mock('../src/models/StoryArc', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe('StoryArcService', () => {
  let storyArcService: StoryArcService;
  let mockStoryArcModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    storyArcService = new StoryArcService();

    // Get the mocked model
    const StoryArc = require('../src/models/StoryArc').default;
    mockStoryArcModel = StoryArc;
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

      mockStoryArcModel.create.mockRejectedValue(new Error('Database error'));

      await expect(storyArcService.createStoryArc(storyArcData)).rejects.toThrow('Database error');
    });
  });

  describe('getStoryArcByCampaignId', () => {
    it('should retrieve story arc by campaign ID', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.getStoryArcByCampaignId(campaignId);

      expect(result).toBe(mockStoryArc);
      expect(mockStoryArcModel.findOne).toHaveBeenCalledWith({ campaignId });
    });

    it('should return null if story arc not found', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await storyArcService.getStoryArcByCampaignId(campaignId);

      expect(result).toBeNull();
    });
  });

  describe('addStoryBeat', () => {
    it('should add a story beat to existing story arc', async () => {
      const campaignId = new Types.ObjectId();
      const beatData: StoryBeatData = {
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
      mockStoryArc.addStoryBeat.mockReturnValue(mockBeatId);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.addStoryBeat(campaignId, beatData);

      expect(result).toBe(mockBeatId);
      expect(mockStoryArc.addStoryBeat).toHaveBeenCalledWith({
        ...beatData,
        completed: false,
      });
      expect(mockStoryArc.save).toHaveBeenCalled();
    });

    it('should throw error if story arc not found', async () => {
      const campaignId = new Types.ObjectId();
      const beatData: StoryBeatData = {
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

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(storyArcService.addStoryBeat(campaignId, beatData)).rejects.toThrow(
        'Story arc not found'
      );
    });
  });

  describe('completeStoryBeat', () => {
    it('should complete a story beat', async () => {
      const campaignId = new Types.ObjectId();
      const beatId = 'beat-123';
      const outcome = 'Success';
      const notes = 'Test notes';

      mockStoryArc.completeStoryBeat.mockReturnValue(true);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.completeStoryBeat(campaignId, beatId, outcome, notes);

      expect(result).toBe(true);
      expect(mockStoryArc.completeStoryBeat).toHaveBeenCalledWith(beatId, outcome, notes);
      expect(mockStoryArc.save).toHaveBeenCalled();
    });

    it('should complete a story beat without outcome and notes', async () => {
      const campaignId = new Types.ObjectId();
      const beatId = 'beat-123';

      mockStoryArc.completeStoryBeat.mockReturnValue(true);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.completeStoryBeat(campaignId, beatId);

      expect(result).toBe(true);
      expect(mockStoryArc.completeStoryBeat).toHaveBeenCalledWith(beatId);
    });

    it('should return false if beat not found', async () => {
      const campaignId = new Types.ObjectId();
      const beatId = 'non-existent-beat';

      mockStoryArc.completeStoryBeat.mockReturnValue(false);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.completeStoryBeat(campaignId, beatId);

      expect(result).toBe(false);
    });
  });

  describe('addCharacterMilestone', () => {
    it('should add a character milestone', async () => {
      const campaignId = new Types.ObjectId();
      const milestoneData: CharacterMilestoneData = {
        characterId: new Types.ObjectId(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        storyBeatId: 'beat-123',
        metadata: { level: 5 },
      };

      mockStoryArc.addCharacterMilestone.mockReturnValue(undefined);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.addCharacterMilestone(campaignId, milestoneData);

      expect(result).toBeUndefined();
      expect(mockStoryArc.addCharacterMilestone).toHaveBeenCalledWith(milestoneData);
      expect(mockStoryArc.save).toHaveBeenCalled();
    });
  });

  describe('addWorldStateChange', () => {
    it('should add a world state change', async () => {
      const campaignId = new Types.ObjectId();
      const changeData: WorldStateChangeData = {
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
      mockStoryArc.addWorldStateChange.mockReturnValue(mockChangeId);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.addWorldStateChange(campaignId, changeData);

      expect(result).toBe(mockChangeId);
      expect(mockStoryArc.addWorldStateChange).toHaveBeenCalledWith(changeData);
      expect(mockStoryArc.save).toHaveBeenCalled();
    });
  });

  describe('updateQuestProgress', () => {
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

      mockStoryArc.updateQuestProgress.mockReturnValue(true);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.updateQuestProgress(campaignId, questId, updates);

      expect(result).toBe(true);
      expect(mockStoryArc.updateQuestProgress).toHaveBeenCalledWith(questId, updates);
      expect(mockStoryArc.save).toHaveBeenCalled();
    });
  });

  describe('advanceChapter', () => {
    it('should advance to next chapter', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArc.currentChapter = 1;
      mockStoryArc.totalChapters = 3;

      mockStoryArc.advanceChapter.mockReturnValue(true);
      mockStoryArc.save.mockResolvedValue(mockStoryArc);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.advanceChapter(campaignId);

      expect(result).toBe(true);
      expect(mockStoryArc.advanceChapter).toHaveBeenCalled();
      expect(mockStoryArc.save).toHaveBeenCalled();
    });

    it('should not advance beyond total chapters', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArc.currentChapter = 3;
      mockStoryArc.totalChapters = 3;

      mockStoryArc.advanceChapter.mockReturnValue(false);

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.advanceChapter(campaignId);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentStoryBeat', () => {
    it('should return current story beat', async () => {
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

      mockStoryArc.storyBeats = [currentBeat];

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.getCurrentStoryBeat(campaignId);

      expect(result).toBe(currentBeat);
    });

    it('should return null if no current beat', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArc.storyBeats = [];

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.getCurrentStoryBeat(campaignId);

      expect(result).toBeNull();
    });
  });

  describe('validateStoryConsistency', () => {
    it('should validate story consistency', async () => {
      const campaignId = new Types.ObjectId();
      const validationResult = {
        isValid: true,
        issues: [],
        warnings: [],
        suggestions: [],
      };

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      // Mock the validation logic
      const result = await storyArcService.validateStoryConsistency(campaignId);

      expect(result).toBeDefined();
    });
  });

  describe('getStoryProgression', () => {
    it('should return story progression data', async () => {
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

      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.getStoryProgression(campaignId);

      expect(result).toBeDefined();
      expect(result.currentChapter).toBe(mockStoryArc.currentChapter);
      expect(result.currentAct).toBe(mockStoryArc.currentAct);
    });
  });

  describe('deleteStoryArc', () => {
    it('should delete a story arc', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoryArc),
      });

      const result = await storyArcService.deleteStoryArc(campaignId);

      expect(result).toBe(true);
      expect(mockStoryArcModel.findOneAndUpdate).toHaveBeenCalledWith(
        { campaignId },
        { $set: { deletedAt: expect.any(Date) } },
        { new: true }
      );
    });

    it('should return false if story arc not found', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await storyArcService.deleteStoryArc(campaignId);

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const campaignId = new Types.ObjectId();
      mockStoryArcModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      });

      await expect(storyArcService.getStoryArcByCampaignId(campaignId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      await expect(storyArcService.getStoryArcByCampaignId(invalidId as any)).rejects.toThrow();
    });
  });
});
