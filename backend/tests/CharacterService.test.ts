import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import CharacterService from '../src/services/CharacterService';
import { Character, Campaign, Session } from '../src/models';
import GeminiClient from '../src/services/GeminiClient';

// Mock the models
jest.mock('../src/models', () => {
  const mockCharacterInstance = {
    _id: 'character123',
    name: 'Test Character',
    characterType: 'human',
    race: 'Human',
    class: 'Fighter',
    level: 1,
    experience: 0,
    attributes: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    hitPoints: {
      maximum: 12,
      current: 12,
      temporary: 0,
    },
    armorClass: 12,
    initiative: 2,
    speed: 30,
    skills: {},
    personality: {
      traits: ['Brave'],
      ideals: ['Honor'],
      bonds: ['Loyal to friends'],
      flaws: ['Reckless'],
      background: 'Soldier',
      alignment: 'Lawful Good',
    },
    equipment: {
      weapons: [],
      armor: null,
      items: [],
    },
    campaignId: 'campaign123',
    sessionId: 'session123',
    isActive: true,
    createdBy: 'user123',
    save: (jest.fn() as any).mockResolvedValue(true),
  };

  const MockCharacter = jest.fn().mockImplementation((data: any) => ({
    ...data,
    _id: 'character123',
    save: (jest.fn() as any).mockResolvedValue(true),
  })) as any;

  // Add static methods to the constructor
  MockCharacter.findById = jest.fn();
  MockCharacter.findOneAndUpdate = jest.fn();
  MockCharacter.updateMany = jest.fn();
  MockCharacter.find = jest.fn();
  MockCharacter.create = jest.fn();

  return {
    Character: MockCharacter,
    Campaign: {
      findById: jest.fn(),
      updateOne: jest.fn(),
    },
    Session: {
      findById: jest.fn(),
      updateMany: jest.fn(),
      updateOne: jest.fn(),
    },
  };
});

// Mock GeminiClient
jest.mock('../src/services/GeminiClient');

describe('CharacterService', () => {
  let characterService: CharacterService;
  let mockCharacter: any;
  let mockCampaign: any;
  let mockSession: any;

  beforeEach(() => {
    characterService = new CharacterService();

    // Reset all mocks
    jest.clearAllMocks();

    // Mock character data
    mockCharacter = {
      _id: 'character123',
      name: 'Test Character',
      characterType: 'human',
      race: 'Human',
      class: 'Fighter',
      level: 1,
      experience: 0,
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
      hitPoints: {
        maximum: 12,
        current: 12,
        temporary: 0,
      },
      armorClass: 12,
      initiative: 2,
      speed: 30,
      skills: {},
      personality: {
        traits: ['Brave'],
        ideals: ['Honor'],
        bonds: ['Loyal to friends'],
        flaws: ['Reckless'],
        background: 'Soldier',
        alignment: 'Lawful Good',
      },
      equipment: {
        weapons: [],
        armor: null,
        items: [],
      },
      campaignId: 'campaign123',
      sessionId: 'session123',
      isActive: true,
      createdBy: 'user123',
      save: (jest.fn() as any).mockResolvedValue(true),
    };

    // Mock campaign data
    mockCampaign = {
      _id: 'campaign123',
      name: 'Test Campaign',
      theme: 'Fantasy Adventure',
      characters: [],
      save: (jest.fn() as any).mockResolvedValue(true),
    };

    // Mock session data
    mockSession = {
      _id: 'session123',
      gameState: {
        activeCharacters: [],
      },
      save: (jest.fn() as any).mockResolvedValue(true),
    };

    // Setup default mock implementations
    (Character.findById as any).mockResolvedValue(mockCharacter);
    (Campaign.findById as any).mockResolvedValue(mockCampaign);
    (Session.findById as any).mockResolvedValue(mockSession);
    (Character.create as any).mockResolvedValue(mockCharacter);
  });

  describe('createHumanCharacter', () => {
    const characterData = {
      name: 'Test Character',
      characterType: 'human' as const,
      race: 'Human',
      class: 'Fighter',
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
      personality: {
        traits: ['Brave'],
        ideals: ['Honor'],
        bonds: ['Loyal to friends'],
        flaws: ['Reckless'],
        background: 'Soldier',
        alignment: 'Lawful Good',
      },
      campaignId: 'campaign123',
      sessionId: 'session123',
      createdBy: 'user123',
    };

    it('should create a human character successfully', async () => {
      const result = await characterService.createHumanCharacter(characterData);

      expect(result).toBeDefined();
      expect(result.name).toBe(characterData.name);
      expect(result.characterType).toBe('human');
      expect(result.race).toBe(characterData.race);
      expect(result.class).toBe(characterData.class);
      expect(result.level).toBe(1);
      expect(result.experience).toBe(0);
      expect(result.hitPoints.maximum).toBe(8); // 6 (fighter base) + 2 (con mod)
      expect(result.armorClass).toBe(12); // 10 + 2 (dex mod)
      expect(result.speed).toBe(30);
    });

    it('should throw error if campaign not found', async () => {
      (Campaign.findById as any).mockResolvedValue(null);

      await expect(characterService.createHumanCharacter(characterData)).rejects.toThrow(
        'Campaign not found'
      );
    });

    it('should throw error if session not found', async () => {
      (Session.findById as any).mockResolvedValue(null);

      await expect(characterService.createHumanCharacter(characterData)).rejects.toThrow(
        'Session not found'
      );
    });

    it('should add character to campaign and session', async () => {
      await characterService.createHumanCharacter(characterData);

      expect(mockCampaign.characters).toHaveLength(1);
      expect(mockCampaign.characters[0].characterId).toBe(mockCharacter._id);
      expect(mockCampaign.characters[0].role).toBe('player');
      expect(mockCampaign.save).toHaveBeenCalled();

      expect(mockSession.gameState.activeCharacters).toHaveLength(1);
      expect(mockSession.gameState.activeCharacters[0]).toBe(mockCharacter._id);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });

  describe('createAICharacter', () => {
    const aiCharacterData = {
      campaignId: 'campaign123',
      sessionId: 'session123',
      race: 'Elf',
      class: 'Wizard',
      personality: {
        goals: ['Master magic'],
        fears: ['Losing knowledge'],
        background: 'Scholar',
      },
      createdBy: 'user123',
    };

    it('should create an AI character successfully', async () => {
      // Mock the GeminiClient response
      const mockGeminiClient = characterService['geminiClient'] as jest.Mocked<GeminiClient>;
      // Mock the private method directly
      jest.spyOn(mockGeminiClient as any, 'generateContent').mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(`
            Name: Elara
            Race: Elf
            Class: Wizard
            Attributes: 8, 14, 12, 16, 14, 10
            Personality: Studious, Curious, Loyal, Arrogant, Scholar, Neutral Good
          `),
        },
      } as any);

      const result = await characterService.createAICharacter(aiCharacterData);

      expect(result).toBeDefined();
      expect(result.characterType).toBe('ai');
      expect(result.race).toBe('Elf');
      expect(result.class).toBe('Wizard');
      expect(result.aiPersonality).toBeDefined();
      if (result.aiPersonality) {
        expect(result.aiPersonality.goals).toEqual(aiCharacterData.personality.goals);
        expect(result.aiPersonality.fears).toEqual(aiCharacterData.personality.fears);
      }
    });

    it('should throw error if campaign not found', async () => {
      (Campaign.findById as any).mockResolvedValue(null);

      await expect(characterService.createAICharacter(aiCharacterData)).rejects.toThrow(
        'Campaign not found'
      );
    });

    it('should throw error if session not found', async () => {
      (Session.findById as any).mockResolvedValue(null);

      await expect(characterService.createAICharacter(aiCharacterData)).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('updateCharacter', () => {
    const updateData = {
      name: 'Updated Name',
      level: 2,
      experience: 300,
      hitPoints: {
        maximum: 20,
        current: 18,
      },
    };

    it('should update character successfully', async () => {
      const result = await characterService.updateCharacter('character123', updateData);

      expect(result).toBeDefined();
      if (result) {
        expect(result.name).toBe(updateData.name);
        expect(result.level).toBe(updateData.level);
        expect(result.experience).toBe(updateData.experience);
        expect(result.hitPoints.maximum).toBe(updateData.hitPoints.maximum);
        expect(result.hitPoints.current).toBe(updateData.hitPoints.current);
      }
      expect(mockCharacter.save).toHaveBeenCalled();
    });

    it('should throw error if character not found', async () => {
      (Character.findById as any).mockResolvedValue(null);

      await expect(characterService.updateCharacter('nonexistent', updateData)).rejects.toThrow(
        'Character not found'
      );
    });

    it('should only update provided fields', async () => {
      const partialUpdate = { name: 'New Name' };
      await characterService.updateCharacter('character123', partialUpdate);

      expect(mockCharacter.name).toBe('New Name');
      expect(mockCharacter.level).toBe(1); // Should remain unchanged
      expect(mockCharacter.experience).toBe(0); // Should remain unchanged
    });
  });

  describe('deleteCharacter', () => {
    it('should soft delete character successfully', async () => {
      await characterService.deleteCharacter('character123');

      expect(mockCharacter.isActive).toBe(false);
      expect(mockCharacter.save).toHaveBeenCalled();
      expect(Session.updateMany).toHaveBeenCalledWith(
        { 'gameState.activeCharacters': 'character123' },
        { $pull: { 'gameState.activeCharacters': 'character123' } }
      );
    });

    it('should throw error if character not found', async () => {
      (Character.findById as any).mockResolvedValue(null);

      await expect(characterService.deleteCharacter('nonexistent')).rejects.toThrow(
        'Character not found'
      );
    });
  });

  describe('levelUpCharacter', () => {
    it('should level up character successfully', async () => {
      const result = await characterService.levelUpCharacter('character123');

      expect(result).toBeDefined();
      if (result) {
        expect(result.level).toBe(2);
        expect(result.hitPoints.maximum).toBeGreaterThan(12); // Should increase
        expect(result.hitPoints.current).toBe(result.hitPoints.maximum); // Should be full
      }
      expect(mockCharacter.save).toHaveBeenCalled();
    });

    it('should throw error if character not found', async () => {
      (Character.findById as any).mockResolvedValue(null);

      await expect(characterService.levelUpCharacter('nonexistent')).rejects.toThrow(
        'Character not found'
      );
    });

    it('should throw error if character is at maximum level', async () => {
      mockCharacter.level = 20;

      await expect(characterService.levelUpCharacter('character123')).rejects.toThrow(
        'Character is already at maximum level'
      );
    });
  });

  describe('addExperience', () => {
    it('should add experience successfully', async () => {
      const result = await characterService.addExperience('character123', 300);

      expect(result).toBeDefined();
      if (result) {
        expect(result.experience).toBe(300);
      }
      expect(mockCharacter.save).toHaveBeenCalled();
    });

    it('should level up character when experience threshold is met', async () => {
      const result = await characterService.addExperience('character123', 300);

      if (result) {
        expect(result.level).toBe(2); // 300 XP = level 2
      }
      expect(mockCharacter.save).toHaveBeenCalled();
    });

    it('should throw error if character not found', async () => {
      (Character.findById as any).mockResolvedValue(null);

      await expect(characterService.addExperience('nonexistent', 300)).rejects.toThrow(
        'Character not found'
      );
    });
  });

  describe('utility methods', () => {
    it('should calculate hit points correctly for different classes', () => {
      const fighterHP = characterService['calculateHitPoints']('Fighter', 15, 1);
      const wizardHP = characterService['calculateHitPoints']('Wizard', 12, 1);

      expect(fighterHP.maximum).toBe(8); // 6 (fighter base) + 2 (con mod)
      expect(wizardHP.maximum).toBe(5); // 6 (wizard base) + 1 (con mod)
    });

    it('should calculate level correctly from experience', () => {
      const level1 = characterService['calculateLevel'](0);
      const level2 = characterService['calculateLevel'](300);
      const level3 = characterService['calculateLevel'](900);

      expect(level1).toBe(1);
      expect(level2).toBe(2);
      expect(level3).toBe(3);
    });

    it('should initialize skills correctly for different classes', () => {
      const fighterSkills = characterService['initializeSkills']('Fighter');
      const wizardSkills = characterService['initializeSkills']('Wizard');

      expect(fighterSkills).toBeDefined();
      expect(wizardSkills).toBeDefined();
      expect(typeof fighterSkills).toBe('object');
      expect(typeof wizardSkills).toBe('object');
    });
  });
});
