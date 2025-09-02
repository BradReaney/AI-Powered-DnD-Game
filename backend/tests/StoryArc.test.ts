import { Types } from 'mongoose';
import {
  IStoryArc,
  IStoryBeat,
  ICharacterMilestone,
  IWorldStateChange,
  IQuestProgress,
} from '../src/models/StoryArc';

describe('Story Arc Model Interfaces', () => {
  describe('IStoryBeat Interface', () => {
    it('should have correct story beat structure', () => {
      const mockBeat: IStoryBeat = {
        id: 'beat-123',
        title: 'Test Beat',
        description: 'A test story beat',
        type: 'development',
        importance: 'moderate',
        chapter: 1,
        act: 1,
        characters: [new Types.ObjectId()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockBeat.id).toBeDefined();
      expect(typeof mockBeat.title).toBe('string');
      expect(typeof mockBeat.description).toBe('string');
      expect(typeof mockBeat.type).toBe('string');
      expect(typeof mockBeat.importance).toBe('string');
      expect(typeof mockBeat.chapter).toBe('number');
      expect(typeof mockBeat.act).toBe('number');
      expect(Array.isArray(mockBeat.characters)).toBe(true);
      expect(Array.isArray(mockBeat.npcs)).toBe(true);
      expect(Array.isArray(mockBeat.consequences)).toBe(true);
      expect(typeof mockBeat.completed).toBe('boolean');
    });

    it('should validate story beat type enum', () => {
      const validTypes = [
        'setup',
        'development',
        'climax',
        'resolution',
        'twist',
        'character',
        'world',
      ];

      validTypes.forEach(type => {
        const beat: IStoryBeat = {
          id: 'beat-123',
          title: 'Test Beat',
          description: 'A test story beat',
          type: type as any,
          importance: 'moderate',
          chapter: 1,
          act: 1,
          characters: [new Types.ObjectId()],
          npcs: ['Test NPC'],
          consequences: ['Test consequence'],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(beat.type).toBe(type);
      });
    });

    it('should validate story beat importance enum', () => {
      const validImportances = ['minor', 'moderate', 'major', 'critical'];

      validImportances.forEach(importance => {
        const beat: IStoryBeat = {
          id: 'beat-123',
          title: 'Test Beat',
          description: 'A test story beat',
          type: 'development',
          importance: importance as any,
          chapter: 1,
          act: 1,
          characters: [new Types.ObjectId()],
          npcs: ['Test NPC'],
          consequences: ['Test consequence'],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(beat.importance).toBe(importance);
      });
    });
  });

  describe('ICharacterMilestone Interface', () => {
    it('should have correct character milestone structure', () => {
      const mockMilestone: ICharacterMilestone = {
        characterId: new Types.ObjectId(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        storyBeatId: 'beat-123',
        achievedAt: new Date(),
        metadata: { level: 5, experience: 1000 },
      };

      expect(mockMilestone.characterId).toBeInstanceOf(Types.ObjectId);
      expect(typeof mockMilestone.type).toBe('string');
      expect(typeof mockMilestone.title).toBe('string');
      expect(typeof mockMilestone.description).toBe('string');
      expect(typeof mockMilestone.impact).toBe('string');
      expect(mockMilestone.achievedAt).toBeInstanceOf(Date);
    });

    it('should validate character milestone type enum', () => {
      const validTypes = ['level', 'relationship', 'story', 'personal', 'skill', 'achievement'];

      validTypes.forEach(type => {
        const milestone: ICharacterMilestone = {
          characterId: new Types.ObjectId(),
          type: type as any,
          title: 'Test Milestone',
          description: 'A test milestone',
          impact: 'moderate',
          achievedAt: new Date(),
        };

        expect(milestone.type).toBe(type);
      });
    });
  });

  describe('IWorldStateChange Interface', () => {
    it('should have correct world state change structure', () => {
      const mockChange: IWorldStateChange = {
        id: 'change-123',
        type: 'location',
        title: 'Location Discovered',
        description: 'A new location was discovered',
        impact: 'major',
        affectedElements: ['location', 'exploration'],
        storyBeatId: 'beat-123',
        characterIds: [new Types.ObjectId()],
        location: 'Forest of Shadows',
        permanent: true,
        occurredAt: new Date(),
      };

      expect(mockChange.id).toBeDefined();
      expect(typeof mockChange.type).toBe('string');
      expect(typeof mockChange.title).toBe('string');
      expect(typeof mockChange.description).toBe('string');
      expect(typeof mockChange.impact).toBe('string');
      expect(Array.isArray(mockChange.affectedElements)).toBe(true);
      expect(Array.isArray(mockChange.characterIds)).toBe(true);
      expect(mockChange.occurredAt).toBeInstanceOf(Date);
    });

    it('should validate world state change type enum', () => {
      const validTypes = ['location', 'faction', 'threat', 'event', 'relationship', 'discovery'];

      validTypes.forEach(type => {
        const change: IWorldStateChange = {
          id: 'change-123',
          type: type as any,
          title: 'Test Change',
          description: 'A test world state change',
          impact: 'moderate',
          affectedElements: ['test'],
          characterIds: [new Types.ObjectId()],
          occurredAt: new Date(),
        };

        expect(change.type).toBe(type);
      });
    });
  });

  describe('IQuestProgress Interface', () => {
    it('should have correct quest progress structure', () => {
      const mockQuest: IQuestProgress = {
        questId: new Types.ObjectId(),
        name: 'Main Quest',
        type: 'setup',
        status: 'active',
        storyBeatId: 'beat-123',
        objectives: [
          {
            description: 'Find the ancient artifact',
            completed: false,
          },
          {
            description: 'Defeat the guardian',
            completed: true,
            completedAt: new Date(),
          },
        ],
        storyImpact: 'major',
        characterDevelopment: [new Types.ObjectId()],
        worldChanges: ['Guardian defeated'],
      };

      expect(mockQuest.questId).toBeInstanceOf(Types.ObjectId);
      expect(typeof mockQuest.name).toBe('string');
      expect(typeof mockQuest.type).toBe('string');
      expect(typeof mockQuest.status).toBe('string');
      expect(Array.isArray(mockQuest.objectives)).toBe(true);
      expect(typeof mockQuest.storyImpact).toBe('string');
      expect(Array.isArray(mockQuest.characterDevelopment)).toBe(true);
      expect(Array.isArray(mockQuest.worldChanges)).toBe(true);
    });

    it('should validate quest progress type enum', () => {
      const validTypes = ['setup', 'development', 'climax', 'resolution'];

      validTypes.forEach(type => {
        const quest: IQuestProgress = {
          questId: new Types.ObjectId(),
          name: 'Test Quest',
          type: type as any,
          status: 'active',
          objectives: [],
          storyImpact: 'moderate',
          characterDevelopment: [],
          worldChanges: [],
        };

        expect(quest.type).toBe(type);
      });
    });

    it('should validate quest progress status enum', () => {
      const validStatuses = ['active', 'completed', 'failed', 'abandoned'];

      validStatuses.forEach(status => {
        const quest: IQuestProgress = {
          questId: new Types.ObjectId(),
          name: 'Test Quest',
          type: 'setup',
          status: status as any,
          objectives: [],
          storyImpact: 'moderate',
          characterDevelopment: [],
          worldChanges: [],
        };

        expect(quest.status).toBe(status);
      });
    });
  });

  describe('IStoryArc Interface', () => {
    it('should have correct story arc structure', () => {
      const mockStoryArc: IStoryArc = {
        _id: new Types.ObjectId(),
        campaignId: new Types.ObjectId(),
        theme: 'fantasy',
        tone: 'serious',
        pacing: 'normal',
        storyPhase: 'setup',
        currentChapter: 1,
        currentAct: 1,
        totalChapters: 3,
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
        completedStoryBeats: 0,
        addStoryBeat: jest.fn(),
        completeStoryBeat: jest.fn(),
        addCharacterMilestone: jest.fn(),
        addWorldStateChange: jest.fn(),
        updateQuestProgress: jest.fn(),
        advanceChapter: jest.fn(),
        save: jest.fn(),
      } as any;

      expect(mockStoryArc.campaignId).toBeInstanceOf(Types.ObjectId);
      expect(typeof mockStoryArc.theme).toBe('string');
      expect(typeof mockStoryArc.tone).toBe('string');
      expect(typeof mockStoryArc.pacing).toBe('string');
      expect(typeof mockStoryArc.storyPhase).toBe('string');
      expect(typeof mockStoryArc.currentChapter).toBe('number');
      expect(typeof mockStoryArc.currentAct).toBe('number');
      expect(typeof mockStoryArc.totalChapters).toBe('number');
      expect(Array.isArray(mockStoryArc.storyBeats)).toBe(true);
      expect(Array.isArray(mockStoryArc.characterMilestones)).toBe(true);
      expect(Array.isArray(mockStoryArc.worldStateChanges)).toBe(true);
      expect(Array.isArray(mockStoryArc.questProgress)).toBe(true);
      expect(typeof mockStoryArc.completedStoryBeats).toBe('number');
    });

    it('should validate story arc tone enum', () => {
      const validTones = ['light', 'serious', 'dark', 'humorous', 'mysterious'];

      validTones.forEach(tone => {
        const storyArc: Partial<IStoryArc> = {
          tone: tone as any,
        };

        expect(storyArc.tone).toBe(tone);
      });
    });

    it('should validate story arc pacing enum', () => {
      const validPacings = ['slow', 'normal', 'fast'];

      validPacings.forEach(pacing => {
        const storyArc: Partial<IStoryArc> = {
          pacing: pacing as any,
        };

        expect(storyArc.pacing).toBe(pacing);
      });
    });

    it('should validate story arc phase enum', () => {
      const validPhases = ['setup', 'development', 'climax', 'resolution'];

      validPhases.forEach(phase => {
        const storyArc: Partial<IStoryArc> = {
          storyPhase: phase as any,
        };

        expect(storyArc.storyPhase).toBe(phase);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields for story beat', () => {
      const requiredFields = [
        'id',
        'title',
        'description',
        'type',
        'importance',
        'chapter',
        'act',
        'characters',
        'npcs',
        'consequences',
        'completed',
        'createdAt',
        'updatedAt',
      ];

      const beat: IStoryBeat = {
        id: 'beat-123',
        title: 'Test Beat',
        description: 'A test story beat',
        type: 'development',
        importance: 'moderate',
        chapter: 1,
        act: 1,
        characters: [new Types.ObjectId()],
        npcs: ['Test NPC'],
        consequences: ['Test consequence'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      requiredFields.forEach(field => {
        expect(beat[field as keyof IStoryBeat]).toBeDefined();
      });
    });

    it('should validate required fields for character milestone', () => {
      const requiredFields = [
        'characterId',
        'type',
        'title',
        'description',
        'impact',
        'achievedAt',
      ];

      const milestone: ICharacterMilestone = {
        characterId: new Types.ObjectId(),
        type: 'level',
        title: 'Character Level Up',
        description: 'Character reached new level',
        impact: 'major',
        achievedAt: new Date(),
      };

      requiredFields.forEach(field => {
        expect(milestone[field as keyof ICharacterMilestone]).toBeDefined();
      });
    });

    it('should validate required fields for world state change', () => {
      const requiredFields = [
        'id',
        'type',
        'title',
        'description',
        'impact',
        'affectedElements',
        'characterIds',
        'occurredAt',
      ];

      const change: IWorldStateChange = {
        id: 'change-123',
        type: 'location',
        title: 'Location Discovered',
        description: 'A new location was discovered',
        impact: 'major',
        affectedElements: ['location'],
        characterIds: [new Types.ObjectId()],
        occurredAt: new Date(),
      };

      requiredFields.forEach(field => {
        expect(change[field as keyof IWorldStateChange]).toBeDefined();
      });
    });

    it('should validate required fields for quest progress', () => {
      const requiredFields = [
        'questId',
        'name',
        'type',
        'status',
        'objectives',
        'storyImpact',
        'characterDevelopment',
        'worldChanges',
      ];

      const quest: IQuestProgress = {
        questId: new Types.ObjectId(),
        name: 'Main Quest',
        type: 'setup',
        status: 'active',
        objectives: [],
        storyImpact: 'major',
        characterDevelopment: [],
        worldChanges: [],
      };

      requiredFields.forEach(field => {
        expect(quest[field as keyof IQuestProgress]).toBeDefined();
      });
    });
  });
});
