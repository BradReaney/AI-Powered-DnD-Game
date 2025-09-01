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

    const { default: MockSession } = require('../src/models/Session');
    const { default: MockCampaign } = require('../src/models/Campaign');
    const { default: MockCharacter } = require('../src/models/Character');

    Object.assign(MockSession, mockSession);
    Object.assign(MockCampaign, mockCampaign);
    Object.assign(MockCharacter, mockCharacter);

    sessionService = new SessionService();
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
    it('should add tags to session successfully', async () => {
      const sessionId = 'session1';
      const tags = ['new-tag', 'important'];

      const mockUpdatedSession = {
        _id: sessionId,
        tags: ['existing-tag', 'new-tag', 'important'],
      };

      mockSession.findOneAndUpdate.mockResolvedValue(mockUpdatedSession);

      const result = await sessionService.addSessionTags(sessionId, tags);

      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockUpdatedSession);
      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: sessionId },
        {
          $addToSet: { tags: { $each: tags } },
        }
      );
    });

    it('should fail if session not found', async () => {
      mockSession.findOneAndUpdate.mockResolvedValue(null);

      const result = await sessionService.addSessionTags('nonexistent', ['tag1']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('removeSessionTags', () => {
    it('should remove tags from session successfully', async () => {
      const sessionId = 'session1';
      const tags = ['tag-to-remove'];

      const mockUpdatedSession = {
        _id: sessionId,
        tags: ['remaining-tag'],
      };

      mockSession.findOneAndUpdate.mockResolvedValue(mockUpdatedSession);

      const result = await sessionService.removeSessionTags(sessionId, tags);

      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockUpdatedSession);
      expect(mockSession.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: sessionId },
        {
          $pull: { tags: { $in: tags } },
        }
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      mockSession.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await sessionService.deleteSession('session123');

      expect(result.success).toBe(true);
      expect(mockSession.deleteOne).toHaveBeenCalledWith({ _id: 'session123' });
    });

    it('should fail if session not found', async () => {
      mockSession.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await sessionService.deleteSession('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });
});
