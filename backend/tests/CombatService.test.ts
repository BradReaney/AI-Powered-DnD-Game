import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CombatService, CombatEncounter, CombatAction } from '../src/services/CombatService';
import { ContextManager } from '../src/services/ContextManager';

// Mock ContextManager
jest.mock('../src/services/ContextManager');

describe('CombatService', () => {
  let combatService: CombatService;
  let mockContextManager: jest.Mocked<ContextManager>;

  // Helper function to create test encounters
  const createTestEncounter = async (participants: any[] = []) => {
    const encounterData = {
      campaignId: 'campaign123',
      sessionId: 'session123',
      name: 'Test Encounter',
      description: 'A test combat encounter',
      location: 'Test Location',
      difficulty: 'medium' as const,
      participants,
      environmentalFactors: [],
      victoryConditions: ['Defeat all enemies'],
      defeatConditions: ['All party members unconscious'],
    };

    return await combatService.createEncounter(encounterData);
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock ContextManager
    mockContextManager = {
      addContextLayer: jest.fn(),
      getContext: jest.fn(),
      updateContext: jest.fn(),
      clearContext: jest.fn(),
      compressContext: jest.fn(),
      getContextStats: jest.fn(),
      getContextLayers: jest.fn(),
      removeContextLayer: jest.fn(),
      mergeContexts: jest.fn(),
      validateContext: jest.fn(),
      optimizeContext: jest.fn(),
      getContextSummary: jest.fn(),
      addStoryEvent: jest.fn(),
      getStoryEvents: jest.fn(),
      updateStoryEvent: jest.fn(),
      removeStoryEvent: jest.fn(),
      getEventRelationships: jest.fn(),
      compressStoryEvents: jest.fn(),
      getEventTimeline: jest.fn(),
      addCharacterMemory: jest.fn(),
      getCharacterMemories: jest.fn(),
      updateCharacterMemory: jest.fn(),
      removeCharacterMemory: jest.fn(),
      getMemorySummary: jest.fn(),
      compressMemories: jest.fn(),
      getMemoryTimeline: jest.fn(),
      addWorldState: jest.fn(),
      getWorldState: jest.fn(),
      updateWorldState: jest.fn(),
      removeWorldState: jest.fn(),
      getWorldSummary: jest.fn(),
      compressWorldState: jest.fn(),
      getWorldTimeline: jest.fn(),
      addRelationship: jest.fn(),
      getRelationships: jest.fn(),
      updateRelationship: jest.fn(),
      removeRelationship: jest.fn(),
      getRelationshipSummary: jest.fn(),
      compressRelationships: jest.fn(),
      getRelationshipTimeline: jest.fn(),
      addKnowledge: jest.fn(),
      getKnowledge: jest.fn(),
      updateKnowledge: jest.fn(),
      removeKnowledge: jest.fn(),
      getKnowledgeSummary: jest.fn(),
      compressKnowledge: jest.fn(),
      getKnowledgeTimeline: jest.fn(),
      addEmotionalState: jest.fn(),
      getEmotionalState: jest.fn(),
      updateEmotionalState: jest.fn(),
      removeEmotionalState: jest.fn(),
      getEmotionalSummary: jest.fn(),
      compressEmotionalState: jest.fn(),
      getEmotionalTimeline: jest.fn(),
      addCharacterArc: jest.fn(),
      getCharacterArc: jest.fn(),
      updateCharacterArc: jest.fn(),
      removeCharacterArc: jest.fn(),
      getArcSummary: jest.fn(),
      compressCharacterArc: jest.fn(),
      getArcTimeline: jest.fn(),
    } as any;

    // Create CombatService with mocked ContextManager
    combatService = new CombatService();
    (combatService as any).contextManager = mockContextManager;
  });

  describe('createEncounter', () => {
    const encounterData = {
      campaignId: 'campaign123',
      sessionId: 'session123',
      name: 'Goblin Ambush',
      description: 'A group of goblins ambush the party',
      location: 'Forest Path',
      difficulty: 'medium' as const,
      participants: [],
      environmentalFactors: ['Dense foliage', 'Uneven ground'],
      victoryConditions: ['Defeat all goblins'],
      defeatConditions: ['All party members unconscious'],
    };

    it('should create a new combat encounter successfully', async () => {
      const result = await combatService.createEncounter(encounterData);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^encounter_\d+_[a-z0-9]+$/);
      expect(result.campaignId).toBe(encounterData.campaignId);
      expect(result.sessionId).toBe(encounterData.sessionId);
      expect(result.name).toBe(encounterData.name);
      expect(result.description).toBe(encounterData.description);
      expect(result.location).toBe(encounterData.location);
      expect(result.difficulty).toBe(encounterData.difficulty);
      expect(result.participants).toEqual(encounterData.participants);
      expect(result.rounds).toEqual([]);
      expect(result.currentRound).toBe(0);
      expect(result.currentTurn).toBe(0);
      expect(result.status).toBe('preparing');
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.environmentalFactors).toEqual(encounterData.environmentalFactors);
      expect(result.victoryConditions).toEqual(encounterData.victoryConditions);
      expect(result.defeatConditions).toEqual(encounterData.defeatConditions);
    });

    it('should generate unique IDs for different encounters', async () => {
      const result1 = await combatService.createEncounter(encounterData);
      const result2 = await combatService.createEncounter(encounterData);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('startEncounter', () => {
    it('should start a combat encounter successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      const result = await combatService.startEncounter(encounterId);

      expect(result).toBeDefined();
      expect(result.id).toBe(encounterId);
      expect(result.status).toBe('active');
      expect(result.currentRound).toBe(1);
      expect(result.currentTurn).toBe(1);
      expect(result.rounds).toHaveLength(1);
      if (result.rounds[0]) {
        expect(result.rounds[0].roundNumber).toBe(1);
        expect(result.rounds[0].currentTurn).toBe(1);
      }
    });

    it('should add encounter start to context', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      await combatService.startEncounter(encounterId);

      expect(mockContextManager.addContextLayer).toHaveBeenCalledWith(
        'campaign123',
        'immediate',
        expect.stringContaining('Combat encounter started: Test Encounter'),
        9
      );
    });
  });

  describe('processCombatAction', () => {
    let testEncounter: CombatEncounter;
    let testEncounterId: string;

    beforeEach(async () => {
      // Create a test encounter for these tests
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [
          {
            id: 'char1',
            name: 'Fighter',
            type: 'character' as const,
            initiative: 15,
            initiativeModifier: 2,
            currentHP: 20,
            maxHP: 20,
            armorClass: 16,
            status: 'active' as const,
            conditions: [],
            position: { x: 0, y: 0 },
            actions: {
              action: true,
              bonusAction: true,
              reaction: true,
              movement: 30,
            },
          },
          {
            id: 'enemy1',
            name: 'Goblin',
            type: 'enemy' as const,
            initiative: 12,
            initiativeModifier: 1,
            currentHP: 7,
            maxHP: 7,
            armorClass: 15,
            status: 'active' as const,
            conditions: [],
            position: { x: 10, y: 0 },
            actions: {
              action: true,
              bonusAction: false,
              reaction: true,
              movement: 30,
            },
          },
        ],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      testEncounter = await combatService.createEncounter(encounterData);
      testEncounterId = testEncounter.id;
    });

    const attackAction: CombatAction = {
      id: 'action1',
      roundNumber: 1,
      turnNumber: 1,
      actorId: 'char1',
      targetId: 'enemy1',
      actionType: 'attack',
      description: 'Fighter attacks Goblin with sword',
      attackRoll: 18,
      attackModifier: 5,
      damageRoll: 8,
      damageType: 'slashing',
      success: true,
      critical: false,
      consequences: [],
      timestamp: new Date(),
    };

    it('should process attack action successfully', async () => {
      // Mock the private method
      const mockProcessAttackAction = jest.spyOn(combatService as any, 'processAttackAction');
      mockProcessAttackAction.mockResolvedValue(undefined);

      await combatService.processCombatAction(testEncounterId, attackAction);

      // Check that the method was called with an action that has the expected properties
      expect(mockProcessAttackAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'attack',
          description: 'Fighter attacks Goblin with sword',
          actorId: 'char1',
          targetId: 'enemy1',
        })
      );
    });

    it('should process move action successfully', async () => {
      const moveAction: CombatAction = {
        ...attackAction,
        actionType: 'move',
        description: 'Fighter moves to new position',
      };

      const mockProcessMoveAction = jest.spyOn(combatService as any, 'processMoveAction');
      mockProcessMoveAction.mockResolvedValue(undefined);

      await combatService.processCombatAction(testEncounterId, moveAction);

      expect(mockProcessMoveAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'move',
          description: 'Fighter moves to new position',
          actorId: 'char1',
          targetId: 'enemy1',
        })
      );
    });

    it('should process spell action successfully', async () => {
      const spellAction: CombatAction = {
        ...attackAction,
        actionType: 'spell',
        description: 'Wizard casts Fireball',
      };

      const mockProcessSpellAction = jest.spyOn(combatService as any, 'processSpellAction');
      mockProcessSpellAction.mockResolvedValue(undefined);

      await combatService.processCombatAction(testEncounterId, spellAction);

      expect(mockProcessSpellAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'spell',
          description: 'Wizard casts Fireball',
          actorId: 'char1',
          targetId: 'enemy1',
        })
      );
    });

    it('should handle unknown action types gracefully', async () => {
      const unknownAction: CombatAction = {
        ...attackAction,
        actionType: 'unknown' as any,
        description: 'Unknown action type',
      };

      await expect(
        combatService.processCombatAction(testEncounterId, unknownAction)
      ).resolves.not.toThrow();
    });
  });

  describe('nextTurn', () => {
    it('should advance to next turn successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [
          {
            id: 'char1',
            name: 'Test Character',
            type: 'character' as const,
            initiative: 15,
            initiativeModifier: 2,
            currentHP: 20,
            maxHP: 20,
            armorClass: 16,
            status: 'active' as const,
            conditions: [],
            position: { x: 0, y: 0 },
            actions: {
              action: true,
              bonusAction: true,
              reaction: true,
              movement: 30,
            },
          },
        ],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      // Start the encounter to initialize rounds
      await combatService.startEncounter(encounterId);

      const result = await combatService.nextTurn(encounterId);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBeGreaterThan(0);
      expect(result.turnNumber).toBeGreaterThan(0);
      expect(result.currentActor).toBeDefined();
      expect(result.roundActions).toBeDefined();
    });
  });

  describe('applyCondition', () => {
    it('should apply condition to participant successfully', async () => {
      // Create a test encounter with participants first
      const encounter = await createTestEncounter([
        {
          id: 'char1',
          name: 'Test Character',
          type: 'player' as const,
          maxHP: 20,
          currentHP: 20,
          armorClass: 15,
          initiativeModifier: 2,
          speed: 30,
          conditions: [],
        },
      ]);

      const participantId = 'char1';
      const condition = 'poisoned';
      const duration = 3;
      const source = 'poison dart';

      await expect(
        combatService.applyCondition(participantId, condition, duration, source)
      ).resolves.not.toThrow();
    });
  });

  describe('removeCondition', () => {
    it('should remove condition from participant successfully', async () => {
      // Create a test encounter with participants first
      const encounter = await createTestEncounter([
        {
          id: 'char1',
          name: 'Test Character',
          type: 'player' as const,
          maxHP: 20,
          currentHP: 20,
          armorClass: 15,
          initiativeModifier: 2,
          speed: 30,
          conditions: ['poisoned'],
        },
      ]);

      const participantId = 'char1';
      const condition = 'poisoned';

      await expect(combatService.applyCondition(participantId, condition, 3, 'poison dart'));
      await expect(combatService.removeCondition(participantId, condition)).resolves.not.toThrow();
    });
  });

  describe('createEncounterTemplate', () => {
    const templateData = {
      name: 'Goblin Ambush Template',
      description: 'Template for goblin ambush encounters',
      difficulty: 'medium' as const,
      participantTemplates: [
        {
          name: 'Goblin',
          type: 'enemy' as const,
          level: 1,
          challengeRating: 0.25,
          stats: {
            maxHP: 7,
            armorClass: 15,
            initiativeModifier: 1,
            speed: 30,
          },
          abilities: ['Nimble Escape'],
          equipment: ['Scimitar', 'Shortbow'],
        },
      ],
      estimatedDuration: 45,
      location: 'Forest',
      environmentalFactors: ['Dense foliage', 'Uneven ground'],
      victoryConditions: ['Defeat all goblins'],
      defeatConditions: ['All party members unconscious'],
      tags: ['ambush', 'goblin', 'forest'],
      createdBy: 'user123',
    };

    it('should create encounter template successfully', async () => {
      const result = await combatService.createEncounterTemplate({
        name: templateData.name,
        description: templateData.description,
        difficulty: templateData.difficulty,
        participantTemplates: templateData.participantTemplates,
        environmentalFactors: templateData.environmentalFactors,
        victoryConditions: templateData.victoryConditions,
        defeatConditions: templateData.defeatConditions,
        tags: templateData.tags,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^template_\d+_[a-z0-9]+$/);
    });
  });

  describe('useEncounterTemplate', () => {
    it('should use encounter template successfully', async () => {
      const templateId = 'template123';
      const campaignId = 'campaign123';
      const sessionId = 'session123';
      const customizations = {
        location: 'Custom Forest',
        modifiedDifficulty: 'hard' as const,
      };

      const result = await combatService.useEncounterTemplate(
        templateId,
        campaignId,
        sessionId,
        customizations
      );

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^encounter_\d+_[a-z0-9]+$/);
      expect(result.campaignId).toBe(campaignId);
      expect(result.sessionId).toBe(sessionId);
      expect(result.location).toBe(customizations.location);
      expect(result.difficulty).toBe(customizations.modifiedDifficulty);
      expect(result.status).toBe('preparing');
    });
  });

  describe('getEncounterTemplates', () => {
    it('should return encounter templates with filters', async () => {
      const filters = {
        difficulty: ['easy', 'medium'],
        tags: ['ambush'],
        participantCount: { min: 3, max: 6 },
      };

      const result = await combatService.getEncounterTemplates(filters);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all templates when no filters provided', async () => {
      const result = await combatService.getEncounterTemplates();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('endEncounter', () => {
    it('should end encounter successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      const outcome = 'victory' as const;

      await expect(combatService.endEncounter(encounterId, outcome)).resolves.not.toThrow();
    });
  });

  describe('getEncounterStatus', () => {
    it('should return encounter status successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      const result = await combatService.getEncounterStatus(encounterId);

      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBeDefined();
        expect(result.currentRound).toBeDefined();
        expect(result.currentTurn).toBeDefined();
        expect(result.participants).toBeDefined();
        expect(result.recentActions).toBeDefined();
      }
    });
  });

  describe('addEnvironmentalEffect', () => {
    it('should add environmental effect successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      const effect = 'Heavy rain reduces visibility';
      const duration = 5;

      await expect(
        combatService.addEnvironmentalEffect(encounterId, effect, duration)
      ).resolves.not.toThrow();
    });
  });

  describe('getEncounter', () => {
    it('should return encounter by ID successfully', async () => {
      // First create an encounter
      const encounterData = {
        campaignId: 'campaign123',
        sessionId: 'session123',
        name: 'Test Encounter',
        description: 'A test combat encounter',
        location: 'Test Location',
        difficulty: 'medium' as const,
        participants: [],
        environmentalFactors: [],
        victoryConditions: ['Defeat all enemies'],
        defeatConditions: ['All party members unconscious'],
      };

      const encounter = await combatService.createEncounter(encounterData);
      const encounterId = encounter.id;

      const result = await combatService.getEncounter(encounterId);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(encounterId);
      }
    });
  });

  describe('updateEncounter', () => {
    it('should update encounter successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const updateData = {
        name: 'Updated Encounter Name',
        difficulty: 'hard' as const,
      };

      const result = await combatService.updateEncounter(encounterId, updateData);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(encounterId);
      }
    });
  });

  describe('addParticipant', () => {
    it('should add participant to encounter successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const participantData = {
        name: 'New Goblin',
        type: 'enemy' as const,
        maxHP: 7,
        armorClass: 15,
      };

      const result = await combatService.addParticipant(encounterId, participantData);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(encounterId);
      }
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from encounter successfully', async () => {
      // Create a test encounter with participants first
      const encounter = await createTestEncounter([
        {
          id: 'enemy1',
          name: 'Test Enemy',
          type: 'enemy' as const,
          maxHP: 10,
          currentHP: 10,
          armorClass: 12,
          initiativeModifier: 0,
          speed: 25,
          conditions: [],
        },
      ]);
      const encounterId = encounter.id;
      const participantId = 'enemy1';

      const result = await combatService.removeParticipant(encounterId, participantId);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(encounterId);
      }
    });
  });

  describe('updateParticipant', () => {
    it('should update participant successfully', async () => {
      // Create a test encounter with participants first
      const encounter = await createTestEncounter([
        {
          id: 'char1',
          name: 'Test Character',
          type: 'player' as const,
          maxHP: 20,
          currentHP: 20,
          armorClass: 15,
          initiativeModifier: 2,
          speed: 30,
          conditions: [],
        },
      ]);
      const encounterId = encounter.id;
      const participantId = 'char1';
      const updateData = {
        currentHP: 15,
        conditions: ['poisoned'],
      };

      const result = await combatService.updateParticipant(encounterId, participantId, updateData);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(encounterId);
      }
    });
  });

  describe('startNextRound', () => {
    it('should start next round successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const result = await combatService.startNextRound(encounterId);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBeDefined();
      expect(result.turnNumber).toBeDefined();
      expect(result.currentActor).toBeDefined();
    });
  });

  describe('endCurrentRound', () => {
    it('should end current round successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const result = await combatService.endCurrentRound(encounterId);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBeDefined();
      expect(result.roundSummary).toBeDefined();
    });
  });

  describe('performAction', () => {
    it('should perform action successfully', async () => {
      // Create a test encounter with participants first
      const encounter = await createTestEncounter([
        {
          id: 'char1',
          name: 'Test Character',
          type: 'player' as const,
          maxHP: 20,
          currentHP: 20,
          armorClass: 15,
          initiativeModifier: 2,
          speed: 30,
          conditions: [],
        },
        {
          id: 'enemy1',
          name: 'Test Enemy',
          type: 'enemy' as const,
          maxHP: 10,
          currentHP: 10,
          armorClass: 12,
          initiativeModifier: 0,
          speed: 25,
          conditions: [],
        },
      ]);
      const encounterId = encounter.id;
      const actionData = {
        participantId: 'char1',
        actionType: 'attack' as const,
        targetId: 'enemy1',
        description: 'Attack with sword',
      };

      const result = await combatService.performAction(encounterId, actionData);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.actionId).toBeDefined();
    });
  });

  describe('getRoundActions', () => {
    it('should return round actions successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const roundNumber = 1;
      const result = await combatService.getRoundActions(encounterId, roundNumber);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCurrentTurn', () => {
    it('should return current turn information successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const result = await combatService.getCurrentTurn(encounterId);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBeDefined();
      expect(result.turnNumber).toBeDefined();
      expect(result.currentActor).toBeDefined();
      expect(result.availableActions).toBeDefined();
    });
  });

  describe('getEncounterSummary', () => {
    it('should return encounter summary successfully', async () => {
      // Create a test encounter first
      const encounter = await createTestEncounter();
      const encounterId = encounter.id;
      const result = await combatService.getEncounterSummary(encounterId);

      expect(result).toBeDefined();
      if (result) {
        expect(result.encounterId).toBe(encounterId);
        expect(result.name).toBeDefined();
        expect(result.duration).toBeDefined();
        expect(result.participantCount).toBeDefined();
        expect(result.roundCount).toBeDefined();
        expect(result.outcome).toBeDefined();
      }
    });
  });

  describe('getCampaignEncounters', () => {
    it('should return campaign encounters with filters', async () => {
      const campaignId = 'campaign123';
      const filters = {
        difficulty: ['medium', 'hard'],
        status: ['completed'],
      };

      const result = await combatService.getCampaignEncounters(campaignId, filters);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all campaign encounters when no filters provided', async () => {
      const campaignId = 'campaign123';
      const result = await combatService.getCampaignEncounters(campaignId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
