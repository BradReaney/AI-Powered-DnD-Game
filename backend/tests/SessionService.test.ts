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

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      const sessionData = {
        name: 'Test Session',
        campaignId: 'campaign123',
        description: 'A test session',
      };

      const mockCreatedSession = {
        _id: 'session123',
        ...sessionData,
        participants: [],
        status: 'active',
      };

      mockSession.create.mockResolvedValue(mockCreatedSession);
      mockCampaign.findByIdAndUpdate.mockResolvedValue({ _id: 'campaign123' });

      const result = await sessionService.createSession(sessionData);

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(mockSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: sessionData.name,
          campaignId: sessionData.campaignId,
          description: sessionData.description,
        })
      );
    });

    it('should fail if campaign not found', async () => {
      const sessionData = {
        name: 'Test Session',
        campaignId: 'nonexistent',
        description: 'A test session',
      };

      mockCampaign.findByIdAndUpdate.mockResolvedValue(null);

      const result = await sessionService.createSession(sessionData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Campaign not found');
    });
  });

  describe('getSessionById', () => {
    it('should return session if found', async () => {
      const mockSessionData = {
        _id: 'session123',
        name: 'Test Session',
        campaignId: 'campaign123',
        participants: [],
      };

      mockSession.findById.mockResolvedValue(mockSessionData);

      const result = await sessionService.getSessionById('session123');

      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockSessionData);
    });

    it('should return null if session not found', async () => {
      mockSession.findById.mockResolvedValue(null);

      const result = await sessionService.getSessionById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('updateSession', () => {
    it('should update session successfully', async () => {
      const updateData = { name: 'Updated Session Name' };
      const mockUpdatedSession = {
        _id: 'session123',
        name: 'Updated Session Name',
        campaignId: 'campaign123',
        participants: [],
      };

      mockSession.findByIdAndUpdate.mockResolvedValue(mockUpdatedSession);

      const result = await sessionService.updateSession('session123', updateData);

      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockUpdatedSession);
      expect(mockSession.findByIdAndUpdate).toHaveBeenCalledWith('session123', updateData);
    });

    it('should fail if session not found', async () => {
      mockSession.findByIdAndUpdate.mockResolvedValue(null);

      const result = await sessionService.updateSession('nonexistent', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
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
        lastActivity: expect.any(Date),
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
        status: 'active',
      };

      mockSession.findOne.mockResolvedValue(mockSessionData);
      mockSession.findOneAndUpdate.mockResolvedValue({
        ...mockSessionData,
        status: 'archived',
        'metadata.archivedAt': expect.any(Date),
        'metadata.archiveReason': 'Test deletion',
      });

      // Mock the Character model that deleteSession uses
      const mockCharacter = {
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      };

      // Mock the Campaign model that deleteSession uses
      const mockCampaign = {
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      };

      // Mock the models index to return our mocked models
      const { models } = require('../src/models');
      models.Character = mockCharacter;
      models.Campaign = mockCampaign;

      await expect(sessionService.deleteSession('session123')).resolves.not.toThrow();

      expect(mockSession.findOne).toHaveBeenCalledWith({ _id: 'session123' });
      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'session123' },
        {
          $set: {
            status: 'archived',
            'metadata.archivedAt': expect.any(Date),
            'metadata.archiveReason': 'Test deletion',
          },
        }
      );
    });

    it('should throw error if session not found', async () => {
      mockSession.findOne.mockResolvedValue(null);

      await expect(sessionService.deleteSession('nonexistent')).rejects.toThrow(
        'Session not found'
      );
    });
  });
});
