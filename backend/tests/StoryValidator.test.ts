import { Types } from 'mongoose';
import StoryValidator from '../src/services/StoryValidator';
import { IStoryArc } from '../src/models/StoryArc';

// Mock LLM client
const mockLLMClient = {
  sendPrompt: jest.fn(),
  testConnection: jest.fn(),
  generateStoryResponse: jest.fn(),
  extractCharacterInformation: jest.fn(),
  extractLocationInformation: jest.fn(),
};

// Mock story arc data
const mockStoryArc = {
  _id: new Types.ObjectId(),
  campaignId: new Types.ObjectId(),
  title: 'Test Story Arc',
  description: 'A test story arc for validation testing',
  theme: 'fantasy',
  currentChapter: 1,
  currentAct: 1,
  storyPhase: 'setup',
  totalChapters: 3,
  totalActs: 3,
  storyBeats: [
    {
      id: 'beat-1',
      title: 'Opening Scene',
      description: 'The story begins',
      chapter: 1,
      act: 1,
      type: 'setup',
      importance: 'major',
      characters: [new Types.ObjectId()],
      consequences: ['Story begins'],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'beat-2',
      title: 'First Action',
      description: 'First major action',
      chapter: 1,
      act: 1,
      type: 'development',
      importance: 'moderate',
      characters: [new Types.ObjectId()],
      consequences: ['Action taken'],
      completed: true,
      completedAt: new Date(),
      outcome: 'Success',
      notes: 'Action completed successfully',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  characterMilestones: [
    {
      characterId: new Types.ObjectId(),
      type: 'story',
      title: 'Character Growth',
      description: 'Character development milestone',
      impact: 'moderate',
      storyBeatId: 'beat-2',
      achievedAt: new Date(),
    },
  ],
  worldStateChanges: [
    {
      id: 'change-1',
      type: 'location',
      title: 'Location Change',
      description: 'Location changed',
      impact: 'major',
      affectedElements: ['village'],
      storyBeatId: 'beat-1',
      characterIds: [new Types.ObjectId()],
      location: 'Test Village',
      permanent: true,
      occurredAt: new Date(),
    },
  ],
  questProgress: [
    {
      questId: new Types.ObjectId(),
      name: 'Test Quest',
      type: 'setup',
      status: 'active',
      storyBeatId: 'beat-1',
      objectives: [
        {
          description: 'Complete the quest',
          completed: false,
        },
      ],
      storyImpact: 'moderate',
      characterDevelopment: [new Types.ObjectId()],
      worldChanges: ['quest started'],
    },
  ],
  completedStoryBeats: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  addStoryBeat: jest.fn(),
  completeStoryBeat: jest.fn(),
  addCharacterMilestone: jest.fn(),
  addWorldStateChange: jest.fn(),
  updateQuestProgress: jest.fn(),
  advanceChapter: jest.fn(),
  save: jest.fn(),
};

describe('StoryValidator', () => {
  let storyValidator: StoryValidator;

  beforeEach(() => {
    jest.clearAllMocks();
    storyValidator = new StoryValidator(mockLLMClient);
  });

  describe('Service Instantiation', () => {
    it('should be instantiated with LLM client', () => {
      expect(storyValidator).toBeDefined();
    });

    it('should initialize validation rules', () => {
      // Access private property for testing
      const rules = (storyValidator as any).rules;
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('validateStoryArc', () => {
    it('should validate a story arc successfully', async () => {
      const validationResult = await storyValidator.validateStoryArc(mockStoryArc as any);

      expect(validationResult).toBeDefined();
      expect(validationResult.valid).toBeDefined();
      expect(validationResult.overallScore).toBeDefined();
      expect(validationResult.results).toBeDefined();
      expect(validationResult.summary).toBeDefined();
      expect(validationResult.recommendations).toBeDefined();
    });

    it('should handle validation with empty arrays', async () => {
      const emptyStoryArc = {
        ...mockStoryArc,
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      };

      const validationResult = await storyValidator.validateStoryArc(emptyStoryArc as any);

      expect(validationResult).toBeDefined();
      expect(validationResult.valid).toBeDefined();
      expect(validationResult.overallScore).toBeDefined();
    });

    it('should handle validation with undefined arrays', async () => {
      const undefinedStoryArc = {
        ...mockStoryArc,
        storyBeats: undefined,
        characterMilestones: undefined,
        worldStateChanges: undefined,
        questProgress: undefined,
      } as any;

      const validationResult = await storyValidator.validateStoryArc(undefinedStoryArc);

      expect(validationResult).toBeDefined();
      expect(validationResult.valid).toBeDefined();
      expect(validationResult.overallScore).toBeDefined();
    });
  });

  describe('Validation Rules', () => {
    it('should have story structure progression rule', () => {
      const rules = (storyValidator as any).rules;
      const structureRule = rules.find((rule: any) => rule.id === 'story_structure_progression');

      expect(structureRule).toBeDefined();
      expect(structureRule.name).toBe('Story Structure Progression');
      expect(structureRule.severity).toBe('error');
    });

    it('should have story beat completion rule', () => {
      const rules = (storyValidator as any).rules;
      const completionRule = rules.find((rule: any) => rule.id === 'story_beat_completion');

      expect(completionRule).toBeDefined();
      expect(completionRule.name).toBe('Story Beat Completion');
      expect(completionRule.severity).toBe('warning');
    });

    it('should have character development tracking rule', () => {
      const rules = (storyValidator as any).rules;
      const characterRule = rules.find((rule: any) => rule.id === 'character_development_tracking');

      expect(characterRule).toBeDefined();
      expect(characterRule.name).toBe('Character Development Tracking');
      expect(characterRule.severity).toBe('warning');
    });

    it('should have world state consistency rule', () => {
      const rules = (storyValidator as any).rules;
      const worldStateRule = rules.find((rule: any) => rule.id === 'world_state_consistency');

      expect(worldStateRule).toBeDefined();
      expect(worldStateRule.name).toBe('World State Consistency');
      expect(worldStateRule.severity).toBe('error');
    });

    it('should have quest story integration rule', () => {
      const rules = (storyValidator as any).rules;
      const questRule = rules.find((rule: any) => rule.id === 'quest_story_integration');

      expect(questRule).toBeDefined();
      expect(questRule.name).toBe('Quest-Story Integration');
      expect(questRule.severity).toBe('warning');
    });
  });

  describe('Story Structure Validation', () => {
    it('should validate story structure progression', () => {
      const rules = (storyValidator as any).rules;
      const structureRule = rules.find((rule: any) => rule.id === 'story_structure_progression');

      const result = structureRule.validate(mockStoryArc);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('story_structure_progression');
      expect(result.ruleName).toBe('Story Structure Progression');
      expect(result.passed).toBeDefined();
      expect(result.score).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle story beats with undefined characters', () => {
      const storyArcWithUndefinedCharacters = {
        ...mockStoryArc,
        storyBeats: [
          {
            ...mockStoryArc.storyBeats[0],
            characters: undefined,
          },
        ],
      };

      const rules = (storyValidator as any).rules;
      const structureRule = rules.find((rule: any) => rule.id === 'story_structure_progression');

      const result = structureRule.validate(storyArcWithUndefinedCharacters);

      expect(result).toBeDefined();
      expect(result.passed).toBeDefined();
    });
  });

  describe('Story Beat Completion Validation', () => {
    it('should validate story beat completion', () => {
      const rules = (storyValidator as any).rules;
      const completionRule = rules.find((rule: any) => rule.id === 'story_beat_completion');

      const result = completionRule.validate(mockStoryArc);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('story_beat_completion');
      expect(result.ruleName).toBe('Story Beat Completion');
      expect(result.passed).toBeDefined();
      expect(result.score).toBeDefined();
    });

    it('should handle completed beats with undefined consequences', () => {
      const storyArcWithUndefinedConsequences = {
        ...mockStoryArc,
        storyBeats: [
          {
            ...mockStoryArc.storyBeats[1],
            consequences: undefined,
          },
        ],
      };

      const rules = (storyValidator as any).rules;
      const completionRule = rules.find((rule: any) => rule.id === 'story_beat_completion');

      const result = completionRule.validate(storyArcWithUndefinedConsequences);

      expect(result).toBeDefined();
      expect(result.passed).toBeDefined();
    });
  });

  describe('Character Development Validation', () => {
    it('should validate character development tracking', () => {
      const rules = (storyValidator as any).rules;
      const characterRule = rules.find((rule: any) => rule.id === 'character_development_tracking');

      const result = characterRule.validate(mockStoryArc);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('character_development_tracking');
      expect(result.ruleName).toBe('Character Development Tracking');
      expect(result.passed).toBeDefined();
      expect(result.score).toBeDefined();
    });
  });

  describe('World State Consistency Validation', () => {
    it('should validate world state consistency', () => {
      const rules = (storyValidator as any).rules;
      const worldStateRule = rules.find((rule: any) => rule.id === 'world_state_consistency');

      const result = worldStateRule.validate(mockStoryArc);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('world_state_consistency');
      expect(result.ruleName).toBe('World State Consistency');
      expect(result.passed).toBeDefined();
      expect(result.score).toBeDefined();
    });
  });

  describe('Quest Story Integration Validation', () => {
    it('should validate quest story integration', () => {
      const rules = (storyValidator as any).rules;
      const questRule = rules.find((rule: any) => rule.id === 'quest_story_integration');

      const result = questRule.validate(mockStoryArc);

      expect(result).toBeDefined();
      expect(result.ruleId).toBe('quest_story_integration');
      expect(result.ruleName).toBe('Quest-Story Integration');
      expect(result.passed).toBeDefined();
      expect(result.score).toBeDefined();
    });
  });

  describe('Narrative Coherence Validation', () => {
    it('should validate narrative coherence with LLM', async () => {
      const mockLLMResponse = {
        content: JSON.stringify({
          coherent: true,
          issues: [],
          warnings: ['Minor pacing issue'],
          suggestions: ['Consider adding more character development'],
        }),
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const rules = (storyValidator as any).rules;
      const coherenceRule = rules.find((rule: any) => rule.id === 'narrative_coherence');

      if (coherenceRule) {
        const result = await coherenceRule.validate(mockStoryArc);

        expect(result).toBeDefined();
        expect(result.ruleId).toBe('narrative_coherence');
        expect(result.ruleName).toBe('Narrative Coherence');
        expect(result.passed).toBeDefined();
        expect(result.score).toBeDefined();
      }
    });

    it('should handle LLM response parsing errors', async () => {
      const mockLLMResponse = {
        success: true,
        content: 'Invalid JSON response',
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const rules = (storyValidator as any).rules;
      const coherenceRule = rules.find((rule: any) => rule.id === 'narrative_coherence');

      if (coherenceRule) {
        const result = await coherenceRule.validate(mockStoryArc);

        expect(result).toBeDefined();
        expect(result.passed).toBe(true); // Should still pass with warnings
        expect(result.warnings).toContain('AI analysis response could not be parsed');
      }
    });

    it('should handle LLM client errors', async () => {
      mockLLMClient.sendPrompt.mockRejectedValue(new Error('LLM service unavailable'));

      const rules = (storyValidator as any).rules;
      const coherenceRule = rules.find((rule: any) => rule.id === 'narrative_coherence');

      if (coherenceRule) {
        const result = await coherenceRule.validate(mockStoryArc);

        expect(result).toBeDefined();
        expect(result.passed).toBe(true); // Should still pass with warnings
        expect(result.warnings).toContain('AI analysis failed - using fallback validation');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle validation rule errors gracefully', async () => {
      const rules = (storyValidator as any).rules;
      const errorRule = {
        id: 'error_rule',
        name: 'Error Rule',
        description: 'A rule that throws an error',
        severity: 'error' as const,
        validate: () => {
          throw new Error('Validation rule error');
        },
      };

      // Temporarily add error rule
      rules.push(errorRule);

      const validationResult = await storyValidator.validateStoryArc(mockStoryArc as any);

      expect(validationResult).toBeDefined();
      expect(validationResult.results).toBeDefined();

      // Find the error result
      const errorResult = validationResult.results.find((r: any) => r.ruleId === 'error_rule');
      expect(errorResult).toBeDefined();
      expect(errorResult.passed).toBe(false);
      expect(errorResult.issues).toContain('Validation rule error: Error: Validation rule error');

      // Remove error rule
      rules.pop();
    });

    it('should handle empty validation results', async () => {
      // Mock empty rules array
      (storyValidator as any).rules = [];

      const validationResult = await storyValidator.validateStoryArc(mockStoryArc as any);

      expect(validationResult).toBeDefined();
      expect(validationResult.valid).toBe(true);
      expect(validationResult.overallScore).toBe(50);
      expect(validationResult.results).toEqual([]);
      expect(validationResult.recommendations).toContain(
        'Validation rules not available - using fallback validation'
      );
    });
  });

  describe('Validation Summary', () => {
    it('should generate correct validation summary', async () => {
      const validationResult = await storyValidator.validateStoryArc(mockStoryArc as any);

      expect(validationResult.summary).toBeDefined();
      expect(typeof validationResult.summary.totalRules).toBe('number');
      expect(typeof validationResult.summary.passedRules).toBe('number');
      expect(typeof validationResult.summary.failedRules).toBe('number');
      expect(typeof validationResult.summary.warnings).toBe('number');
      expect(typeof validationResult.summary.suggestions).toBe('number');

      expect(validationResult.summary.totalRules).toBeGreaterThan(0);
      expect(validationResult.summary.passedRules + validationResult.summary.failedRules).toBe(
        validationResult.summary.totalRules
      );
    });
  });

  describe('Recommendations Generation', () => {
    it('should generate recommendations based on validation results', async () => {
      const validationResult = await storyValidator.validateStoryArc(mockStoryArc as any);

      expect(validationResult.recommendations).toBeDefined();
      expect(Array.isArray(validationResult.recommendations)).toBe(true);
    });
  });
});
