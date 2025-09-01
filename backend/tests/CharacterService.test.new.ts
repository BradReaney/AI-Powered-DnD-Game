import { CharacterService } from '../src/services/CharacterService';
import { GeminiClient } from '../src/services/GeminiClient';

// Mock the models
jest.mock('../src/models/Character', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
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
    generateCharacter: jest.fn().mockResolvedValue({
      success: true,
      content: 'Mocked character response',
      modelUsed: 'flash',
      responseTime: 100,
    }),
  })),
}));

describe('CharacterService', () => {
  let characterService: CharacterService;
  let mockCharacter: any;
  let mockCampaign: any;
  let mockSession: any;
  let mockGeminiClient: jest.Mocked<GeminiClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCharacter = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
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

    const { default: MockCharacter } = require('../src/models/Character');
    const { default: MockCampaign } = require('../src/models/Campaign');
    const { default: MockSession } = require('../src/models/Session');

    Object.assign(MockCharacter, mockCharacter);
    Object.assign(MockCampaign, mockCampaign);
    Object.assign(MockSession, mockSession);

    characterService = new CharacterService();
    mockGeminiClient = characterService['geminiClient'] as jest.Mocked<GeminiClient>;
  });

  describe('createHumanCharacter', () => {
    it('should create a human character successfully', async () => {
      const characterData = {
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
        level: 1,
        campaignId: 'campaign123',
        sessionId: 'session123',
      };

      const mockCreatedCharacter = {
        _id: 'char123',
        ...characterData,
        stats: { health: 100, maxHealth: 100 },
      };

      mockCharacter.create.mockResolvedValue(mockCreatedCharacter);
      mockCampaign.findByIdAndUpdate.mockResolvedValue({ _id: 'campaign123' });

      const result = await characterService.createHumanCharacter(characterData);

      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(mockCharacter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: characterData.name,
          race: characterData.race,
          class: characterData.class,
          level: characterData.level,
        })
      );
    });

    it('should add character to campaign and session', async () => {
      const characterData = {
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
        level: 1,
        campaignId: 'campaign123',
        sessionId: 'session123',
      };

      const mockCreatedCharacter = {
        _id: 'char123',
        ...characterData,
      };

      mockCharacter.create.mockResolvedValue(mockCreatedCharacter);
      mockCampaign.findByIdAndUpdate.mockResolvedValue({ _id: 'campaign123' });

      await characterService.createHumanCharacter(characterData);

      expect(mockCampaign.findByIdAndUpdate).toHaveBeenCalledWith('campaign123', {
        $push: { characters: 'char123' },
      });
    });

    it('should fail if campaign not found', async () => {
      const characterData = {
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
        level: 1,
        campaignId: 'nonexistent',
        sessionId: 'session123',
      };

      mockCampaign.findByIdAndUpdate.mockResolvedValue(null);

      const result = await characterService.createHumanCharacter(characterData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Campaign not found');
    });
  });

  describe('createAICharacter', () => {
    it('should create an AI character successfully', async () => {
      const characterData = {
        name: 'AI Character',
        race: 'Elf',
        class: 'Wizard',
        level: 5,
        campaignId: 'campaign123',
        sessionId: 'session123',
      };

      const mockCreatedCharacter = {
        _id: 'char456',
        ...characterData,
        isAI: true,
      };

      mockCharacter.create.mockResolvedValue(mockCreatedCharacter);
      mockCampaign.findByIdAndUpdate.mockResolvedValue({ _id: 'campaign123' });

      const result = await characterService.createAICharacter(characterData);

      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(result.character.isAI).toBe(true);
    });
  });

  describe('getCharacterById', () => {
    it('should return character if found', async () => {
      const mockCharacterData = {
        _id: 'char123',
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
      };

      mockCharacter.findById.mockResolvedValue(mockCharacterData);

      const result = await characterService.getCharacterById('char123');

      expect(result.success).toBe(true);
      expect(result.character).toEqual(mockCharacterData);
    });

    it('should return null if character not found', async () => {
      mockCharacter.findById.mockResolvedValue(null);

      const result = await characterService.getCharacterById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Character not found');
    });
  });

  describe('updateCharacter', () => {
    it('should update character successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedCharacter = {
        _id: 'char123',
        name: 'Updated Name',
        race: 'Human',
        class: 'Fighter',
      };

      mockCharacter.findByIdAndUpdate.mockResolvedValue(mockUpdatedCharacter);

      const result = await characterService.updateCharacter('char123', updateData);

      expect(result.success).toBe(true);
      expect(result.character).toEqual(mockUpdatedCharacter);
      expect(mockCharacter.findByIdAndUpdate).toHaveBeenCalledWith('char123', updateData);
    });

    it('should fail if character not found', async () => {
      mockCharacter.findByIdAndUpdate.mockResolvedValue(null);

      const result = await characterService.updateCharacter('nonexistent', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Character not found');
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character successfully', async () => {
      mockCharacter.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await characterService.deleteCharacter('char123');

      expect(result.success).toBe(true);
      expect(mockCharacter.deleteOne).toHaveBeenCalledWith({ _id: 'char123' });
    });

    it('should fail if character not found', async () => {
      mockCharacter.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await characterService.deleteCharacter('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Character not found');
    });
  });
});
