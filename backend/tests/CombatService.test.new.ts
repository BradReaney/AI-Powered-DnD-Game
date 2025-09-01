import { CombatService } from '../src/services/CombatService';
import { CharacterService } from '../src/services/CharacterService';
import { SessionService } from '../src/services/SessionService';

// Mock the models
jest.mock('../src/models/CombatEncounter', () => {
  const MockCombatEncounter = jest.fn().mockImplementation(data => {
    return {
      ...data,
      _id: 'encounter123',
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
        ...data,
        _id: 'encounter123',
      }),
    };
  });

  // Add static methods to the constructor
  MockCombatEncounter.findById = jest.fn();
  MockCombatEncounter.findOneAndUpdate = jest.fn();
  MockCombatEncounter.updateMany = jest.fn();
  MockCombatEncounter.find = jest.fn();
  MockCombatEncounter.create = jest.fn();

  return {
    __esModule: true,
    default: MockCombatEncounter,
    CombatEncounter: MockCombatEncounter,
  };
});

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

jest.mock('../src/services/CharacterService');
jest.mock('../src/services/SessionService');

describe('CombatService', () => {
  let combatService: CombatService;
  let mockCharacterService: jest.Mocked<CharacterService>;
  let mockSessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCharacterService = {
      getCharacterById: jest.fn(),
      updateCharacter: jest.fn(),
    } as any;

    mockSessionService = {
      getSessionById: jest.fn(),
      updateSession: jest.fn(),
    } as any;

    (CharacterService as jest.MockedClass<typeof CharacterService>).mockImplementation(
      () => mockCharacterService
    );
    (SessionService as jest.MockedClass<typeof SessionService>).mockImplementation(
      () => mockSessionService
    );

    combatService = new CombatService();
  });

  describe('startCombat', () => {
    it('should start combat successfully', async () => {
      const sessionId = 'session123';
      const participants = ['char1', 'char2'];

      mockSessionService.getSessionById.mockResolvedValue({
        _id: sessionId,
        participants: participants.map(id => ({ characterId: id, isActive: true })),
      } as any);

      participants.forEach(id => {
        mockCharacterService.getCharacterById.mockResolvedValue({
          _id: id,
          name: `Character ${id}`,
          stats: { health: 100, maxHealth: 100 },
        } as any);
      });

      const result = await combatService.startCombat(sessionId, participants);

      expect(result.success).toBe(true);
      expect(result.encounter).toBeDefined();
    });

    it('should fail if session not found', async () => {
      mockSessionService.getSessionById.mockResolvedValue(null);

      const result = await combatService.startCombat('nonexistent', ['char1']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('processTurn', () => {
    it('should process turn successfully', async () => {
      const encounterId = 'encounter123';
      const characterId = 'char1';

      const mockEncounter = {
        _id: encounterId,
        participants: [{ characterId, initiative: 15 }],
        currentTurn: 0,
        round: 1,
      };

      const { default: MockCombatEncounter } = require('../src/models/CombatEncounter');
      MockCombatEncounter.findById.mockResolvedValue(mockEncounter);

      const result = await combatService.processTurn(encounterId, characterId);

      expect(result.success).toBe(true);
    });

    it('should fail if encounter not found', async () => {
      const { default: MockCombatEncounter } = require('../src/models/CombatEncounter');
      MockCombatEncounter.findById.mockResolvedValue(null);

      const result = await combatService.processTurn('nonexistent', 'char1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Encounter not found');
    });
  });

  describe('endCombat', () => {
    it('should end combat successfully', async () => {
      const encounterId = 'encounter123';

      const mockEncounter = {
        _id: encounterId,
        status: 'active',
        participants: [],
      };

      const { default: MockCombatEncounter } = require('../src/models/CombatEncounter');
      MockCombatEncounter.findById.mockResolvedValue(mockEncounter);
      MockCombatEncounter.findOneAndUpdate.mockResolvedValue({
        ...mockEncounter,
        status: 'completed',
      });

      const result = await combatService.endCombat(encounterId);

      expect(result.success).toBe(true);
    });
  });
});
