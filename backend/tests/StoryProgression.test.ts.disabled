import { Types } from 'mongoose';
import StoryProgression from '../src/services/StoryProgression';
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
const mockStoryArc: IStoryArc = {
  _id: new Types.ObjectId(),
  campaignId: new Types.ObjectId(),
  title: 'Test Story Arc',
  description: 'A test story arc for progression testing',
  theme: 'fantasy',
  currentChapter: 1,
  currentAct: 1,
  storyPhase: 'beginning',
  totalChapters: 3,
  totalActs: 3,
  storyBeats: [
    {
      id: 'beat-1',
      title: 'Opening Scene',
      description: 'The story begins',
      chapter: 1,
      act: 1,
      type: 'exposition',
      characters: [new Types.ObjectId()],
      consequences: ['Story begins'],
      completed: true,
      completedAt: new Date(),
      outcome: 'Success',
      notes: 'Opening completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'beat-2',
      title: 'First Action',
      description: 'First major action',
      chapter: 1,
      act: 1,
      type: 'action',
      characters: [new Types.ObjectId()],
      consequences: ['Action taken'],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  characterMilestones: [
    {
      id: 'milestone-1',
      characterId: new Types.ObjectId(),
      storyBeatId: 'beat-1',
      type: 'development',
      description: 'Character development milestone',
      occurredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  worldStateChanges: [
    {
      id: 'change-1',
      type: 'location',
      description: 'Location changed',
      occurredAt: new Date(),
      impact: 'major',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  questProgress: [
    {
      id: 'quest-1',
      questId: new Types.ObjectId(),
      type: 'main',
      status: 'active',
      progress: 50,
      notes: 'Quest in progress',
      createdAt: new Date(),
      updatedAt: new Date(),
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

describe('StoryProgression', () => {
  let storyProgression: StoryProgression;

  beforeEach(() => {
    jest.clearAllMocks();
    storyProgression = new StoryProgression(mockLLMClient);
  });

  describe('Service Instantiation', () => {
    it('should be instantiated with LLM client', () => {
      expect(storyProgression).toBeDefined();
    });

    it('should be instantiated with custom options', () => {
      const customOptions = {
        maxSuggestions: 10,
        includeCharacterDevelopment: true,
        includeWorldBuilding: true,
      };

      const customStoryProgression = new StoryProgression(mockLLMClient, customOptions);
      expect(customStoryProgression).toBeDefined();
    });
  });

  describe('checkAdvancementRequirements', () => {
    it('should check advancement requirements for story arc', () => {
      const requirements = storyProgression.checkAdvancementRequirements(mockStoryArc);

      expect(requirements).toBeDefined();
      expect(requirements.canAdvanceChapter).toBeDefined();
      expect(requirements.canAdvanceAct).toBeDefined();
      expect(requirements.canAdvancePhase).toBeDefined();
      expect(requirements.requirements).toBeDefined();
      expect(Array.isArray(requirements.requirements)).toBe(true);
    });

    it('should identify missing requirements', () => {
      const emptyStoryArc = {
        ...mockStoryArc,
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      };

      const requirements = storyProgression.checkAdvancementRequirements(emptyStoryArc);

      expect(requirements).toBeDefined();
      expect(requirements.canAdvanceChapter).toBe(false);
      expect(requirements.requirements.length).toBeGreaterThan(0);
    });

    it('should allow advancement when requirements are met', () => {
      const completeStoryArc = {
        ...mockStoryArc,
        storyBeats: [
          ...mockStoryArc.storyBeats,
          {
            id: 'beat-3',
            title: 'Chapter End',
            description: 'End of chapter',
            chapter: 1,
            act: 1,
            type: 'climax',
            characters: [new Types.ObjectId()],
            consequences: ['Chapter complete'],
            completed: true,
            completedAt: new Date(),
            outcome: 'Success',
            notes: 'Chapter completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        completedStoryBeats: 2,
      };

      const requirements = storyProgression.checkAdvancementRequirements(completeStoryArc);

      expect(requirements).toBeDefined();
      expect(requirements.canAdvanceChapter).toBe(true);
    });
  });

  describe('generateStoryBeatSuggestions', () => {
    it('should generate story beat suggestions', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [mockStoryArc.storyBeats[0]],
        worldState: 'Beginning of adventure',
      };

      const mockLLMResponse = {
        content: JSON.stringify({
          suggestions: [
            {
              title: 'Meet the Quest Giver',
              description: 'The party meets an important NPC',
              type: 'exposition',
              characters: [request.characters[0]],
              consequences: ['Quest received'],
            },
            {
              title: 'First Combat',
              description: 'The party faces their first challenge',
              type: 'action',
              characters: request.characters,
              consequences: ['Combat experience gained'],
            },
          ],
        }),
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const suggestions = await storyProgression.generateStoryBeatSuggestions(request);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(2);
      expect(suggestions[0].title).toBe('Meet the Quest Giver');
      expect(suggestions[1].title).toBe('First Combat');
    });

    it('should handle LLM response parsing errors', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      const mockLLMResponse = {
        content: 'Invalid JSON response',
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const suggestions = await storyProgression.generateStoryBeatSuggestions(request);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should handle LLM client errors', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      mockLLMClient.sendPrompt.mockRejectedValue(new Error('LLM service unavailable'));

      const suggestions = await storyProgression.generateStoryBeatSuggestions(request);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should handle empty LLM response', async () => {
      const request = {
        campaignId: new Types.ObjectId(),
        chapter: 1,
        act: 1,
        context: 'Fantasy adventure beginning',
        characters: [new Types.ObjectId()],
        location: 'Tavern',
        previousBeats: [],
        worldState: 'Beginning of adventure',
      };

      const mockLLMResponse = {
        content: JSON.stringify({
          suggestions: [],
        }),
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const suggestions = await storyProgression.generateStoryBeatSuggestions(request);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('getImprovementSuggestions', () => {
    it('should get improvement suggestions for story arc', async () => {
      const mockLLMResponse = {
        content: JSON.stringify({
          suggestions: [
            'Add more character development moments',
            'Include more world-building details',
            'Consider adding subplots for depth',
          ],
        }),
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const suggestions = await storyProgression.getImprovementSuggestions(mockStoryArc);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(3);
      expect(suggestions[0]).toBe('Add more character development moments');
    });

    it('should handle LLM response parsing errors', async () => {
      const mockLLMResponse = {
        content: 'Invalid JSON response',
      };

      mockLLMClient.sendPrompt.mockResolvedValue(mockLLMResponse);

      const suggestions = await storyProgression.getImprovementSuggestions(mockStoryArc);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should handle LLM client errors', async () => {
      mockLLMClient.sendPrompt.mockRejectedValue(new Error('LLM service unavailable'));

      const suggestions = await storyProgression.getImprovementSuggestions(mockStoryArc);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('analyzeStoryPacing', () => {
    it('should analyze story pacing', () => {
      const pacingAnalysis = storyProgression.analyzeStoryPacing(mockStoryArc);

      expect(pacingAnalysis).toBeDefined();
      expect(pacingAnalysis.overallPacing).toBeDefined();
      expect(pacingAnalysis.chapterDistribution).toBeDefined();
      expect(pacingAnalysis.actDistribution).toBeDefined();
      expect(pacingAnalysis.recommendations).toBeDefined();
      expect(Array.isArray(pacingAnalysis.recommendations)).toBe(true);
    });

    it('should handle empty story beats', () => {
      const emptyStoryArc = {
        ...mockStoryArc,
        storyBeats: [],
      };

      const pacingAnalysis = storyProgression.analyzeStoryPacing(emptyStoryArc);

      expect(pacingAnalysis).toBeDefined();
      expect(pacingAnalysis.overallPacing).toBeDefined();
      expect(pacingAnalysis.chapterDistribution).toBeDefined();
      expect(pacingAnalysis.actDistribution).toBeDefined();
    });

    it('should identify pacing issues', () => {
      const unbalancedStoryArc = {
        ...mockStoryArc,
        storyBeats: [
          {
            id: 'beat-1',
            title: 'All Beats in Chapter 1',
            description: 'All beats in first chapter',
            chapter: 1,
            act: 1,
            type: 'exposition',
            characters: [new Types.ObjectId()],
            consequences: ['Story begins'],
            completed: true,
            completedAt: new Date(),
            outcome: 'Success',
            notes: 'Opening completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'beat-2',
            title: 'Another Beat in Chapter 1',
            description: 'Another beat in first chapter',
            chapter: 1,
            act: 1,
            type: 'action',
            characters: [new Types.ObjectId()],
            consequences: ['Action taken'],
            completed: true,
            completedAt: new Date(),
            outcome: 'Success',
            notes: 'Action completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'beat-3',
            title: 'Yet Another Beat in Chapter 1',
            description: 'Yet another beat in first chapter',
            chapter: 1,
            act: 1,
            type: 'climax',
            characters: [new Types.ObjectId()],
            consequences: ['Climax reached'],
            completed: true,
            completedAt: new Date(),
            outcome: 'Success',
            notes: 'Climax completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        totalChapters: 3,
      };

      const pacingAnalysis = storyProgression.analyzeStoryPacing(unbalancedStoryArc);

      expect(pacingAnalysis).toBeDefined();
      expect(pacingAnalysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getCharacterDevelopmentOpportunities', () => {
    it('should identify character development opportunities', () => {
      const opportunities = storyProgression.getCharacterDevelopmentOpportunities(mockStoryArc);

      expect(opportunities).toBeDefined();
      expect(Array.isArray(opportunities)).toBe(true);
    });

    it('should handle story arcs with no character milestones', () => {
      const noMilestonesStoryArc = {
        ...mockStoryArc,
        characterMilestones: [],
      };

      const opportunities =
        storyProgression.getCharacterDevelopmentOpportunities(noMilestonesStoryArc);

      expect(opportunities).toBeDefined();
      expect(Array.isArray(opportunities)).toBe(true);
    });

    it('should identify missing character development', () => {
      const characterId = new Types.ObjectId();
      const storyArcWithCharacters = {
        ...mockStoryArc,
        storyBeats: [
          {
            ...mockStoryArc.storyBeats[0],
            characters: [characterId],
          },
        ],
        characterMilestones: [],
      };

      const opportunities =
        storyProgression.getCharacterDevelopmentOpportunities(storyArcWithCharacters);

      expect(opportunities).toBeDefined();
      expect(Array.isArray(opportunities)).toBe(true);
    });
  });

  describe('getWorldBuildingOpportunities', () => {
    it('should identify world building opportunities', () => {
      const opportunities = storyProgression.getWorldBuildingOpportunities(mockStoryArc);

      expect(opportunities).toBeDefined();
      expect(Array.isArray(opportunities)).toBe(true);
    });

    it('should handle story arcs with no world state changes', () => {
      const noChangesStoryArc = {
        ...mockStoryArc,
        worldStateChanges: [],
      };

      const opportunities = storyProgression.getWorldBuildingOpportunities(noChangesStoryArc);

      expect(opportunities).toBeDefined();
      expect(Array.isArray(opportunities)).toBe(true);
    });
  });

  describe('validateStoryConsistency', () => {
    it('should validate story consistency', () => {
      const consistency = storyProgression.validateStoryConsistency(mockStoryArc);

      expect(consistency).toBeDefined();
      expect(consistency.isConsistent).toBeDefined();
      expect(consistency.issues).toBeDefined();
      expect(Array.isArray(consistency.issues)).toBe(true);
      expect(consistency.recommendations).toBeDefined();
      expect(Array.isArray(consistency.recommendations)).toBe(true);
    });

    it('should identify consistency issues', () => {
      const inconsistentStoryArc = {
        ...mockStoryArc,
        storyBeats: [
          {
            id: 'beat-1',
            title: 'Beat in Chapter 2',
            description: 'Beat in wrong chapter',
            chapter: 2,
            act: 1,
            type: 'exposition',
            characters: [new Types.ObjectId()],
            consequences: ['Story begins'],
            completed: true,
            completedAt: new Date(),
            outcome: 'Success',
            notes: 'Opening completed',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        currentChapter: 1,
      };

      const consistency = storyProgression.validateStoryConsistency(inconsistentStoryArc);

      expect(consistency).toBeDefined();
      expect(consistency.isConsistent).toBe(false);
      expect(consistency.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle null story arc gracefully', () => {
      expect(() => storyProgression.checkAdvancementRequirements(null as any)).not.toThrow();
      expect(() => storyProgression.analyzeStoryPacing(null as any)).not.toThrow();
      expect(() =>
        storyProgression.getCharacterDevelopmentOpportunities(null as any)
      ).not.toThrow();
      expect(() => storyProgression.getWorldBuildingOpportunities(null as any)).not.toThrow();
      expect(() => storyProgression.validateStoryConsistency(null as any)).not.toThrow();
    });

    it('should handle undefined story arc gracefully', () => {
      expect(() => storyProgression.checkAdvancementRequirements(undefined as any)).not.toThrow();
      expect(() => storyProgression.analyzeStoryPacing(undefined as any)).not.toThrow();
      expect(() =>
        storyProgression.getCharacterDevelopmentOpportunities(undefined as any)
      ).not.toThrow();
      expect(() => storyProgression.getWorldBuildingOpportunities(undefined as any)).not.toThrow();
      expect(() => storyProgression.validateStoryConsistency(undefined as any)).not.toThrow();
    });

    it('should handle story arc with undefined arrays', () => {
      const undefinedArraysStoryArc = {
        ...mockStoryArc,
        storyBeats: undefined,
        characterMilestones: undefined,
        worldStateChanges: undefined,
        questProgress: undefined,
      } as any;

      expect(() =>
        storyProgression.checkAdvancementRequirements(undefinedArraysStoryArc)
      ).not.toThrow();
      expect(() => storyProgression.analyzeStoryPacing(undefinedArraysStoryArc)).not.toThrow();
      expect(() =>
        storyProgression.getCharacterDevelopmentOpportunities(undefinedArraysStoryArc)
      ).not.toThrow();
      expect(() =>
        storyProgression.getWorldBuildingOpportunities(undefinedArraysStoryArc)
      ).not.toThrow();
      expect(() =>
        storyProgression.validateStoryConsistency(undefinedArraysStoryArc)
      ).not.toThrow();
    });
  });
});
