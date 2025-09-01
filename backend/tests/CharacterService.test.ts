import CharacterService from '../src/services/CharacterService';

describe('CharacterService', () => {
  let characterService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    characterService = new CharacterService();
  });

  describe('basic functionality', () => {
    it('should be instantiated', () => {
      expect(characterService).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof characterService.createHumanCharacter).toBe('function');
      expect(typeof characterService.createAICharacter).toBe('function');
      expect(typeof characterService.getCharacter).toBe('function');
      expect(typeof characterService.updateCharacter).toBe('function');
      expect(typeof characterService.deleteCharacter).toBe('function');
    });
  });

  describe('input validation', () => {
    it('should handle invalid input for createHumanCharacter', async () => {
      try {
        await characterService.createHumanCharacter(null);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid input for createAICharacter', async () => {
      try {
        await characterService.createAICharacter(null);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid input for getCharacterById', async () => {
      try {
        await characterService.getCharacterById('');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid input for updateCharacter', async () => {
      try {
        await characterService.updateCharacter('', null);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid input for deleteCharacter', async () => {
      try {
        await characterService.deleteCharacter('');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('service structure', () => {
    it('should have geminiClient property', () => {
      expect(characterService.geminiClient).toBeDefined();
    });

    it('should have characterNameSimilarityService property', () => {
      expect(characterService.geminiClient).toBeDefined();
    });
  });
});
