import { SessionService } from '../src/services/SessionService';

// Mock the models
jest.mock('../src/models', () => ({
  Character: {
    deleteMany: jest.fn(),
  },
  Campaign: {
    findByIdAndUpdate: jest.fn(),
  },
  Session: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
  Location: {
    deleteMany: jest.fn(),
  },
  Message: {
    deleteMany: jest.fn(),
  },
  StoryEvent: {
    deleteMany: jest.fn(),
  },
}));

describe('SessionService', () => {
  let sessionService: any;
  let mockSession: any;
  let mockCharacter: any;
  let mockLocation: any;
  let mockMessage: any;
  let mockStoryEvent: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const models = require('../src/models');
    mockSession = models.Session;
    mockCharacter = models.Character;
    mockLocation = models.Location;
    mockMessage = models.Message;
    mockStoryEvent = models.StoryEvent;

    sessionService = SessionService.getInstance();
  });

  describe('addSessionTags', () => {
    it('should add session tags successfully', async () => {
      const mockSessionData = {
        _id: 'session123',
        tags: ['existing-tag'],
      };

      mockSession.findOneAndUpdate.mockResolvedValue({
        ...mockSessionData,
        tags: ['existing-tag', 'new-tag1', 'new-tag2'],
      });

      await expect(
        sessionService.addSessionTags('session123', ['new-tag1', 'new-tag2'])
      ).resolves.not.toThrow();

      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session123' },
        { $addToSet: { tags: { $each: ['new-tag1', 'new-tag2'] } } }
      );
    });

    it('should throw error if session not found', async () => {
      mockSession.findOneAndUpdate.mockRejectedValue(new Error('Session not found'));
      await expect(sessionService.addSessionTags('nonexistent', ['new-tag'])).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('removeSessionTags', () => {
    it('should remove session tags successfully', async () => {
      const mockSessionData = {
        _id: 'session123',
        tags: ['existing-tag', 'tag-to-remove'],
      };

      mockSession.findOneAndUpdate.mockResolvedValue({
        ...mockSessionData,
        tags: ['existing-tag'],
      });

      await expect(
        sessionService.removeSessionTags('session123', ['tag-to-remove'])
      ).resolves.not.toThrow();

      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session123' },
        { $pullAll: { tags: ['tag-to-remove'] } }
      );
    });

    it('should throw error if session not found', async () => {
      mockSession.findOneAndUpdate.mockRejectedValue(new Error('Session not found'));
      await expect(sessionService.removeSessionTags('nonexistent', ['tag'])).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('updateSessionActivity', () => {
    it('should update session activity successfully', async () => {
      mockSession.findByIdAndUpdate.mockResolvedValue({
        _id: 'session123',
        lastActivity: new Date(),
      });

      await expect(sessionService.updateSessionActivity('session123')).resolves.not.toThrow();

      expect(mockSession.findByIdAndUpdate).toHaveBeenCalledWith('session123', {
        lastActivity: expect.any(Date),
      });
    });

    it('should throw error if session not found', async () => {
      mockSession.findByIdAndUpdate.mockRejectedValue(new Error('Session not found'));
      await expect(sessionService.updateSessionActivity('nonexistent')).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const mockSessionData = {
        _id: 'session123',
        name: 'Test Session',
        campaignId: 'campaign123',
        characterIds: ['char1', 'char2'],
      };

      mockSession.findOne.mockResolvedValue(mockSessionData);

      mockCharacter.deleteMany.mockResolvedValue({ deletedCount: 2 });
      mockLocation.deleteMany.mockResolvedValue({ deletedCount: 1 });
      mockMessage.deleteMany.mockResolvedValue({ deletedCount: 5 });
      mockStoryEvent.deleteMany.mockResolvedValue({ deletedCount: 3 });
      mockSession.findOneAndDelete.mockResolvedValue({ deletedCount: 1 });

      await expect(sessionService.deleteSession('session123')).resolves.not.toThrow();

      expect(mockSession.findOne).toHaveBeenCalledWith({ _id: 'session123' });
      expect(mockCharacter.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockLocation.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockMessage.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockStoryEvent.deleteMany).toHaveBeenCalledWith({ sessionId: 'session123' });
      expect(mockSession.findOneAndDelete).toHaveBeenCalledWith({ _id: 'session123' });
    });

    it('should throw error if session not found', async () => {
      mockSession.findOne.mockResolvedValue(null);

      await expect(sessionService.deleteSession('nonexistent')).rejects.toThrow(
        'Session not found'
      );
    });
  });
});
