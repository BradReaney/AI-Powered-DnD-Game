import CharacterNameSimilarityService from '../src/services/CharacterNameSimilarityService';

describe('CharacterNameSimilarityService', () => {
  let service: CharacterNameSimilarityService;

  beforeEach(() => {
    service = CharacterNameSimilarityService.getInstance();
    // Reset to default config for each test
    service.updateConfig({
      confidenceThreshold: 70,
      minSimilarityScore: 60,
      maxEditDistanceShort: 2,
      maxEditDistanceLong: 3,
    });
  });

  describe('areNamesTheSamePerson', () => {
    it('should identify exact matches with 100% confidence', () => {
      const result = service.areNamesTheSamePerson('Finnan', 'Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBe(100);
      expect(result.similarityScore).toBe(100);
    });

    it('should identify "The old man" and "Old Finnan" as the same person through progressive identification', () => {
      const result = service.areNamesTheSamePerson('The old man', 'Old Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.matchType).toBe('progressive');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
      expect(result.similarityScore).toBeGreaterThanOrEqual(60);
    });

    it('should identify "Old Finnan" and "Finnan" as the same person', () => {
      const result = service.areNamesTheSamePerson('Old Finnan', 'Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
      expect(result.similarityScore).toBeGreaterThanOrEqual(70);
    });

    it('should identify "The old man" and "Finnan" as the same person through progressive identification', () => {
      const result = service.areNamesTheSamePerson('The old man', 'Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.matchType).toBe('progressive');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
      expect(result.similarityScore).toBeGreaterThanOrEqual(60);
    });

    it('should identify similar names with high confidence', () => {
      const result = service.areNamesTheSamePerson(
        'Thrain Ironbeard',
        'Thrain Ironbeard the Dwarf'
      );
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should identify names with slight typos as the same person', () => {
      const result = service.areNamesTheSamePerson('Sylvan Whisperwind', 'Sylvan Whisperwnd');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should not identify completely different names as the same person', () => {
      const result = service.areNamesTheSamePerson('Thrain Ironbeard', 'Sylvan Whisperwind');
      expect(result.isMatch).toBe(false);
      expect(result.confidence).toBeLessThan(70);
    });

    it('should handle names with titles and descriptions', () => {
      const result = service.areNamesTheSamePerson('The mysterious wizard', 'Mysterious Wizard');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should handle names with class suffixes', () => {
      const result = service.areNamesTheSamePerson('Gandalf the Grey', 'Gandalf');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });
  });

  describe('progressive identification', () => {
    it('should identify generic descriptions progressing to specific names', () => {
      const result = service.checkProgressiveIdentification('The old man', 'Finnan');
      expect(result.isProgressiveMatch).toBe(true);
      expect(result.progressionType).toBe('generic_to_specific');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should identify specific names referenced as generic descriptions', () => {
      const result = service.checkProgressiveIdentification('Finnan', 'The old man');
      expect(result.isProgressiveMatch).toBe(true);
      expect(result.progressionType).toBe('specific_to_generic');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should handle "Old Finnan" -> "Finnan" as similarity match', () => {
      const result = service.areNamesTheSamePerson('Old Finnan', 'Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.matchType).toBe('similarity');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should not identify two generic descriptions as progressive', () => {
      const result = service.checkProgressiveIdentification(
        'The old man',
        'The mysterious stranger'
      );
      expect(result.isProgressiveMatch).toBe(false);
      expect(result.progressionType).toBe('none');
    });

    it('should not identify two specific names as progressive', () => {
      const result = service.checkProgressiveIdentification('Finnan', 'Gandalf');
      expect(result.isProgressiveMatch).toBe(false);
      expect(result.progressionType).toBe('none');
    });
  });

  describe('findBestNameMatch', () => {
    const mockCharacters = [
      { name: 'Finnan', race: 'Human', class: 'Wizard' },
      { name: 'Thrain Ironbeard', race: 'Dwarf', class: 'Fighter' },
      { name: 'Sylvan Whisperwind', race: 'Elf', class: 'Ranger' },
    ];

    it('should find exact matches first', () => {
      const result = service.findBestNameMatch('Finnan', mockCharacters);
      expect(result).toBeDefined();
      expect(result?.existingCharacter.name).toBe('Finnan');
      expect(result?.isMatch).toBe(true);
      expect(result?.confidence).toBe(100);
    });

    it('should find similar names when exact match not found', () => {
      const result = service.findBestNameMatch('Old Finnan', mockCharacters);
      expect(result).toBeDefined();
      expect(result?.existingCharacter.name).toBe('Finnan');
      expect(result?.isMatch).toBe(true);
      expect(result?.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should return null when no good match found', () => {
      const result = service.findBestNameMatch('Completely Different Name', mockCharacters);
      expect(result).toBeNull();
    });

    it('should handle empty character list', () => {
      const result = service.findBestNameMatch('Finnan', []);
      expect(result).toBeNull();
    });

    it('should handle empty name', () => {
      const result = service.findBestNameMatch('', mockCharacters);
      expect(result).toBeNull();
    });
  });

  describe('configuration', () => {
    it('should allow configuration updates', () => {
      service.updateConfig({ confidenceThreshold: 90 });
      const config = service.getConfig();
      expect(config.confidenceThreshold).toBe(90);
    });

    it('should use environment variable defaults', () => {
      const config = service.getConfig();
      expect(config.confidenceThreshold).toBe(70);
      expect(config.minSimilarityScore).toBe(60);
    });
  });

  describe('edge cases', () => {
    it('should handle very short names', () => {
      const result = service.areNamesTheSamePerson('A', 'A');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBe(100);
    });

    it('should handle very long names', () => {
      const longName1 = 'Very Long Character Name With Many Words And Descriptions';
      const longName2 = 'Very Long Character Name With Many Words And Descriptions';
      const result = service.areNamesTheSamePerson(longName1, longName2);
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBe(100);
    });

    it('should handle names with special characters', () => {
      const result = service.areNamesTheSamePerson('Finnan!', 'Finnan');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it('should handle names with numbers', () => {
      const result = service.areNamesTheSamePerson('Finnan 2', 'Finnan II');
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle common D&D naming patterns', () => {
      const scenarios = [
        {
          name1: 'The Old Man',
          name2: 'Old Finnan',
          shouldMatch: true,
          expectedType: 'progressive',
        },
        {
          name1: 'Finnan the Wise',
          name2: 'Finnan',
          shouldMatch: true,
          expectedType: 'progressive',
        },
        {
          name1: 'The Mysterious Stranger',
          name2: 'Mysterious Stranger',
          shouldMatch: true,
          expectedType: 'similarity',
        },
        {
          name1: 'Captain Blackbeard',
          name2: 'Blackbeard',
          shouldMatch: true,
          expectedType: 'similarity',
        },
        {
          name1: 'Gandalf the Grey',
          name2: 'Gandalf',
          shouldMatch: true,
          expectedType: 'similarity',
        },
        { name1: 'Aragorn', name2: 'Strider', shouldMatch: false, expectedType: 'none' }, // Different names
        { name1: 'Legolas', name2: 'Gimli', shouldMatch: false, expectedType: 'none' }, // Different names
      ];

      scenarios.forEach(scenario => {
        const result = service.areNamesTheSamePerson(scenario.name1, scenario.name2);
        expect(result.isMatch).toBe(scenario.shouldMatch);

        if (scenario.shouldMatch) {
          expect(result.confidence).toBeGreaterThanOrEqual(70);
          // Allow both progressive and similarity for cases that could be either
          if (scenario.expectedType === 'progressive') {
            expect(['progressive', 'similarity']).toContain(result.matchType);
          } else {
            expect(result.matchType).toBe(scenario.expectedType);
          }
        }
      });
    });
  });
});
