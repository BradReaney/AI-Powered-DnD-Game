import { SessionService } from '../src/services/SessionService';

// Mock the models
jest.mock('../src/models/Session', () => ({
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

jest.mock('../src/models/Character', () => ({
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

describe('SessionService', () => {
  let sessionService: SessionService;
  let mockSession: any;
  let mockCampaign: any;
  let mockCharacter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSession = {
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

    mockCharacter = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn(),
    };

    const {
      Session: MockSession,
      Campaign: MockCampaign,
      Character: MockCharacter,
    } = require('../src/models');

    // Properly assign the mock functions
    Object.assign(MockSession, mockSession);
    Object.assign(MockCampaign, mockCampaign);
    Object.assign(MockCharacter, mockCharacter);

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
        tags: ['tag1', 'tag2', 'tag3'],
      };

      mockSession.findOneAndUpdate.mockResolvedValue({
        ...mockSessionData,
        tags: ['tag1'],
      });

      await expect(
        sessionService.removeSessionTags('session123', ['tag2', 'tag3'])
      ).resolves.not.toThrow();

      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session123' },
        { $pull: { tags: { $in: ['tag2', 'tag3'] } } }
      );
    });

    it('should throw error if session not found', async () => {
      mockSession.findOneAndUpdate.mockRejectedValue(new Error('Session not found'));

      await expect(sessionService.removeSessionTags('nonexistent', ['tag1'])).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('updateSessionActivity', () => {
    it('should update session activity successfully', async () => {
      const mockSessionData = {
        _id: 'session123',
        lastActivity: new Date('2023-01-01'),
      };

      mockSession.findOneAndUpdate.mockResolvedValue({
        ...mockSessionData,
        lastActivity: new Date(),
      });

      await expect(sessionService.updateSessionActivity('session123')).resolves.not.toThrow();

      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session123' },
        { $set: { lastActivity: expect.any(Date) } }
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const mockSessionData = {
        _id: 'session123',
        campaignId: 'campaign123',
        characterIds: ['char1', 'char2'],
      };

      mockSession.findById.mockResolvedValue(mockSessionData);
      mockSession.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Mock the models index to return our mocked models
      const models = require('../src/models');
      models.Character = mockCharacter;
      models.Campaign = mockCampaign;

      await expect(sessionService.deleteSession('session123')).resolves.not.toThrow();

      expect(mockSession.findById).toHaveBeenCalledWith('session123');
      expect(mockSession.deleteOne).toHaveBeenCalledWith({ _id: 'session123' });
    });

    it('should throw error if session not found', async () => {
      mockSession.findById.mockResolvedValue(null);

      await expect(sessionService.deleteSession('nonexistent')).rejects.toThrow(
        'Session not found'
      );
    });
  });
});
