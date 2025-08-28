import logger from './LoggerService';
import { ContextManager } from './ContextManager';
import { CombatEncounter } from '../models/CombatEncounter';

// Plain interface for service layer (without Mongoose Document properties)
interface CombatEncounterData {
  id: string;
  campaignId: string;
  sessionId: string;
  name: string;
  description: string;
  location: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  participants: Array<{
    id: string;
    name: string;
    type: 'character' | 'npc' | 'enemy';
    initiative: number;
    initiativeModifier: number;
    currentHP: number;
    maxHP: number;
    armorClass: number;
    status: 'active' | 'unconscious' | 'dead' | 'fleeing';
    conditions: string[];
    position: {
      x: number;
      y: number;
      z?: number;
    };
    actions: {
      action: boolean;
      bonusAction: boolean;
      reaction: boolean;
      movement: number;
    };
  }>;
  rounds: Array<{
    roundNumber: number;
    currentTurn: number;
    participants: Array<{
      id: string;
      name: string;
      type: 'character' | 'npc' | 'enemy';
      initiative: number;
      initiativeModifier: number;
      currentHP: number;
      maxHP: number;
      armorClass: number;
      status: 'active' | 'unconscious' | 'dead' | 'fleeing';
      conditions: string[];
      position: {
        x: number;
        y: number;
        z?: number;
      };
      actions: {
        action: boolean;
        bonusAction: boolean;
        reaction: boolean;
        movement: number;
      };
    }>;
    turnOrder: string[];
    actions: Array<{
      id: string;
      roundNumber: number;
      turnNumber: number;
      actorId: string;
      targetId?: string;
      actionType:
        | 'attack'
        | 'spell'
        | 'move'
        | 'dash'
        | 'dodge'
        | 'help'
        | 'hide'
        | 'ready'
        | 'search'
        | 'use-object';
      description: string;
      attackRoll?: number;
      attackModifier?: number;
      damageRoll?: number;
      damageType?: string;
      success: boolean;
      critical: boolean;
      consequences: string[];
      timestamp: Date;
    }>;
    environmentalEffects: string[];
    roundStartTime: Date;
    roundEndTime?: Date;
  }>;
  currentRound: number;
  currentTurn: number;
  status: 'preparing' | 'active' | 'paused' | 'completed';
  startTime: Date;
  endTime?: Date;
  environmentalFactors: string[];
  victoryConditions: string[];
  defeatConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CombatParticipant {
  id: string;
  name: string;
  type: 'character' | 'npc' | 'enemy';
  initiative: number;
  initiativeModifier: number;
  currentHP: number;
  maxHP: number;
  armorClass: number;
  status: 'active' | 'unconscious' | 'dead' | 'fleeing';
  conditions: string[];
  position: {
    x: number;
    y: number;
    z?: number;
  };
  actions: {
    action: boolean;
    bonusAction: boolean;
    reaction: boolean;
    movement: number;
  };
}

export interface CombatRound {
  roundNumber: number;
  currentTurn: number;
  participants: CombatParticipant[];
  turnOrder: string[]; // Array of participant IDs in initiative order
  actions: CombatAction[];
  environmentalEffects: string[];
  roundStartTime: Date;
  roundEndTime?: Date;
}

export interface CombatAction {
  id: string;
  roundNumber: number;
  turnNumber: number;
  actorId: string;
  targetId?: string;
  actionType:
    | 'attack'
    | 'spell'
    | 'move'
    | 'dash'
    | 'dodge'
    | 'help'
    | 'hide'
    | 'ready'
    | 'search'
    | 'use-object';
  description: string;
  attackRoll?: number;
  attackModifier?: number;
  damageRoll?: number;
  damageType?: string;
  success: boolean;
  critical: boolean;
  consequences: string[];
  timestamp: Date;
}

export interface AttackResult {
  success: boolean;
  critical: boolean;
  hit: boolean;
  damage: number;
  damageType: string;
  consequences: string[];
  description: string;
}

export class CombatService {
  private contextManager: ContextManager;

  constructor() {
    this.contextManager = new ContextManager();
  }

  /**
   * Create a new combat encounter
   */
  async createEncounter(
    encounterData: Omit<
      CombatEncounterData,
      | 'id'
      | 'rounds'
      | 'currentRound'
      | 'currentTurn'
      | 'status'
      | 'startTime'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Promise<CombatEncounterData> {
    try {
      const encounter = new CombatEncounter({
        ...encounterData,
        rounds: [],
        currentRound: 0,
        currentTurn: 0,
        status: 'preparing',
        startTime: new Date(),
      });

      // Save to database
      await encounter.save();

      logger.info('Combat encounter created and saved to database', {
        encounterId: encounter.id,
        campaignId: encounter.campaignId,
        participantCount: encounter.participants.length,
      });

      return encounter.toObject() as CombatEncounterData;
    } catch (error) {
      logger.error('Error creating combat encounter:', error);
      throw error;
    }
  }

  /**
   * Start combat encounter
   */
  async startEncounter(encounterId: string): Promise<CombatEncounterData> {
    try {
      // First try to get existing encounter
      let encounter = await this.getEncounterById(encounterId);

      if (!encounter) {
        // Create a new encounter if none exists
        encounter = {
          id: encounterId,
          campaignId: 'mock_campaign',
          sessionId: 'mock_session',
          name: 'Mock Encounter',
          description: 'A mock combat encounter',
          location: 'Mock Location',
          difficulty: 'medium',
          participants: [],
          rounds: [],
          currentRound: 0,
          currentTurn: 0,
          status: 'active',
          startTime: new Date(),
          environmentalFactors: [],
          victoryConditions: [],
          defeatConditions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Roll initiative for all participants
      encounter.participants = await this.rollInitiative(encounter.participants);

      // Create first round
      const firstRound = await this.createCombatRound(encounter, 1);
      encounter.rounds.push(firstRound);
      encounter.currentRound = 1;
      encounter.currentTurn = 1;
      encounter.status = 'active';

      // Save state changes to database
      await this.saveCombatState(encounter.id, {
        participants: encounter.participants,
        rounds: encounter.rounds,
        currentRound: encounter.currentRound,
        currentTurn: encounter.currentTurn,
        status: encounter.status,
      });

      // Add encounter start to context
      this.contextManager.addContextLayer(
        encounter.campaignId,
        'immediate',
        `Combat encounter started: ${encounter.name} at ${encounter.location}`,
        9
      );

      logger.info('Combat encounter started', {
        encounterId: encounter.id,
        roundNumber: encounter.currentRound,
        turnNumber: encounter.currentTurn,
      });

      return encounter;
    } catch (error) {
      logger.error('Error starting combat encounter:', error);
      throw error;
    }
  }

  /**
   * Roll initiative for all participants
   */
  private async rollInitiative(participants: CombatParticipant[]): Promise<CombatParticipant[]> {
    try {
      const updatedParticipants = participants.map(participant => {
        const d20Roll = Math.floor(Math.random() * 20) + 1;
        const initiative = d20Roll + participant.initiativeModifier;

        return {
          ...participant,
          initiative,
        };
      });

      // Sort by initiative (highest first)
      return updatedParticipants.sort((a, b) => b.initiative - a.initiative);
    } catch (error) {
      logger.error('Error rolling initiative:', error);
      return participants;
    }
  }

  /**
   * Create a new combat round
   */
  private async createCombatRound(
    encounter: CombatEncounterData,
    roundNumber: number
  ): Promise<CombatRound> {
    try {
      const round: CombatRound = {
        roundNumber,
        currentTurn: 1,
        participants: [...encounter.participants],
        turnOrder: encounter.participants.map(p => p.id),
        actions: [],
        environmentalEffects: [],
        roundStartTime: new Date(),
      };

      logger.info('Combat round created', {
        encounterId: encounter.id,
        roundNumber,
        participantCount: round.participants.length,
      });

      return round;
    } catch (error) {
      logger.error('Error creating combat round:', error);
      throw error;
    }
  }

  /**
   * Process a combat action
   */
  async processCombatAction(
    encounterId: string,
    action: Omit<CombatAction, 'id' | 'roundNumber' | 'turnNumber' | 'timestamp'>
  ): Promise<CombatAction> {
    try {
      // In a real implementation, this would fetch the encounter and validate the action
      const combatAction: CombatAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roundNumber: 1, // Mock round number
        turnNumber: 1, // Mock turn number
        timestamp: new Date(),
      };

      // Process the action based on type
      switch (action.actionType) {
        case 'attack':
          await this.processAttackAction(combatAction);
          break;
        case 'move':
          await this.processMoveAction(combatAction);
          break;
        case 'spell':
          await this.processSpellAction(combatAction);
          break;
        default:
          // Process other action types
          break;
      }

      logger.info('Combat action processed', {
        encounterId,
        actionId: combatAction.id,
        actionType: combatAction.actionType,
        actorId: combatAction.actorId,
      });

      return combatAction;
    } catch (error) {
      logger.error('Error processing combat action:', error);
      throw error;
    }
  }

  /**
   * Process an attack action with full D&D 5e mechanics
   */
  private async processAttackAction(action: CombatAction): Promise<void> {
    try {
      if (action.actionType !== 'attack' || !action.targetId) {
        return;
      }

      // Get attacker and target (in real implementation, fetch from database)
      const attacker = await this.getParticipantById(action.actorId);
      const target = await this.getParticipantById(action.targetId);

      if (!attacker || !target) {
        logger.error('Attacker or target not found', {
          attackerId: action.actorId,
          targetId: action.targetId,
        });
        return;
      }

      // Calculate attack roll with modifiers
      const d20Roll = Math.floor(Math.random() * 20) + 1;
      const attackModifier = action.attackModifier || 0;
      const totalAttackRoll = d20Roll + attackModifier;

      // Determine hit/miss
      const isCritical = d20Roll === 20;
      const isCriticalMiss = d20Roll === 1;
      const hits = isCritical || (!isCriticalMiss && totalAttackRoll >= target.armorClass);

      // Calculate damage if hit
      let damage = 0;
      const damageType = action.damageType || 'bludgeoning';
      const consequences: string[] = [];

      if (hits) {
        if (isCritical) {
          // Critical hit - double damage dice
          damage = (action.damageRoll || 0) * 2;
          consequences.push('Critical hit!');
        } else {
          damage = action.damageRoll || 0;
        }

        // Apply damage to target
        target.currentHP = Math.max(0, target.currentHP - damage);
        consequences.push(`Dealt ${damage} ${damageType} damage`);

        // Check if target is unconscious or dead
        if (target.currentHP === 0) {
          if (damage >= target.maxHP) {
            target.status = 'dead';
            consequences.push('Target killed instantly');
          } else {
            target.status = 'unconscious';
            consequences.push('Target knocked unconscious');
          }
        }
      } else {
        if (isCriticalMiss) {
          consequences.push('Critical miss!');
        } else {
          consequences.push('Attack missed');
        }
      }

      // Update action with results
      action.success = hits;
      action.critical = isCritical;
      action.attackRoll = totalAttackRoll;
      action.damageRoll = damage;
      action.consequences = consequences;

      logger.info('Attack action processed', {
        actionId: action.id,
        targetId: action.targetId,
        hit: hits,
        critical: isCritical,
        damage,
        targetHP: target.currentHP,
      });
    } catch (error) {
      logger.error('Error processing attack action:', error);
    }
  }

  /**
   * Get participant by ID (helper method)
   */
  private async getParticipantById(participantId: string): Promise<CombatParticipant | null> {
    try {
      // Search through all encounters to find the participant
      const encounters = await CombatEncounter.find({}).lean();
      for (const encounter of encounters) {
        const participant = encounter.participants.find(p => p.id === participantId);
        if (participant) {
          return participant;
        }
      }
      return null;
    } catch (error) {
      logger.error('Error finding participant by ID:', error);
      return null;
    }
  }

  /**
   * Process a move action with D&D 5e movement mechanics
   */
  private async processMoveAction(action: CombatAction): Promise<void> {
    try {
      if (action.actionType !== 'move') {
        return;
      }

      const participant = await this.getParticipantById(action.actorId);
      if (!participant) {
        logger.error('Participant not found for move action', { participantId: action.actorId });
        return;
      }

      // Get movement data from action description or metadata
      const moveData = this.parseMoveAction(action.description);
      if (!moveData) {
        logger.error('Invalid move action data', { actionId: action.id });
        return;
      }

      // Check if participant has enough movement left
      if (moveData.distance > participant.actions.movement) {
        action.success = false;
        action.consequences = ['Not enough movement remaining'];
        logger.info('Move action failed - insufficient movement', {
          actionId: action.id,
          required: moveData.distance,
          available: participant.actions.movement,
        });
        return;
      }

      // Check for difficult terrain (would need terrain data in real implementation)
      const terrainModifier = this.getTerrainMovementModifier(moveData.toPosition);
      const actualMovementCost = moveData.distance * terrainModifier;

      if (actualMovementCost > participant.actions.movement) {
        action.success = false;
        action.consequences = ['Difficult terrain prevents movement'];
        return;
      }

      // Update participant position and movement
      participant.position = moveData.toPosition;
      participant.actions.movement -= actualMovementCost;

      // Check for opportunity attacks (simplified)
      const opportunityAttack = this.checkOpportunityAttack(participant, moveData);
      if (opportunityAttack) {
        action.consequences.push('Triggered opportunity attack');
      }

      action.success = true;
      action.consequences.push(
        `Moved ${moveData.distance} feet to (${moveData.toPosition.x}, ${moveData.toPosition.y})`
      );

      logger.info('Move action processed successfully', {
        actionId: action.id,
        participantId: action.actorId,
        distance: moveData.distance,
        newPosition: moveData.toPosition,
      });
    } catch (error) {
      logger.error('Error processing move action:', error);
    }
  }

  /**
   * Parse move action description to extract movement data
   */
  private parseMoveAction(
    description: string
  ): { distance: number; toPosition: { x: number; y: number; z?: number } } | null {
    try {
      // Simple parsing - in real implementation, this would be more sophisticated
      const moveMatch = description.match(/move\s+(\d+)\s+feet?\s+to\s*\((\d+),\s*(\d+)\)/i);
      if (moveMatch) {
        return {
          distance: parseInt(moveMatch[1]),
          toPosition: {
            x: parseInt(moveMatch[2]),
            y: parseInt(moveMatch[3]),
          },
        };
      }
      return null;
    } catch (error) {
      logger.error('Error parsing move action', { description, error });
      return null;
    }
  }

  /**
   * Get terrain movement modifier
   */
  private getTerrainMovementModifier(_position: { x: number; y: number; z?: number }): number {
    // In real implementation, this would query terrain data
    // For now, return 1.0 (normal terrain)
    return 1.0;
  }

  /**
   * Check for opportunity attacks during movement
   */
  private checkOpportunityAttack(_mover: CombatParticipant, _moveData: any): boolean {
    // In real implementation, this would check for enemies in range
    // For now, return false
    return false;
  }

  /**
   * Process a spell action with D&D 5e spell mechanics
   */
  private async processSpellAction(action: CombatAction): Promise<void> {
    try {
      if (action.actionType !== 'spell') {
        return;
      }

      const caster = await this.getParticipantById(action.actorId);
      if (!caster) {
        logger.error('Caster not found for spell action', { participantId: action.actorId });
        return;
      }

      // Parse spell information from action description
      const spellData = this.parseSpellAction(action.description);
      if (!spellData) {
        action.success = false;
        action.consequences = ['Invalid spell description'];
        return;
      }

      // Check if caster has actions available
      if (!caster.actions.action) {
        action.success = false;
        action.consequences = ['No action available'];
        return;
      }

      // Validate spell casting (simplified)
      const spellValidation = this.validateSpellCasting(caster, spellData);
      if (!spellValidation.valid) {
        action.success = false;
        action.consequences = [spellValidation.reason];
        return;
      }

      // Apply spell effects
      const spellResult = await this.applySpellEffects(caster, spellData, action);

      // Update caster actions
      caster.actions.action = false;
      if (spellData.usesBonusAction) {
        caster.actions.bonusAction = false;
      }

      // Handle concentration if needed
      if (spellData.requiresConcentration) {
        this.handleConcentration(caster, spellData);
      }

      action.success = true;
      action.consequences = spellResult.consequences;

      logger.info('Spell action processed successfully', {
        actionId: action.id,
        casterId: action.actorId,
        spellName: spellData.name,
        targetCount: spellResult.targetCount,
      });
    } catch (error) {
      logger.error('Error processing spell action:', error);
    }
  }

  /**
   * Parse spell action description
   */
  private parseSpellAction(description: string): {
    name: string;
    level: number;
    school: string;
    requiresConcentration: boolean;
    usesBonusAction: boolean;
    targets: string[];
  } | null {
    try {
      // Simple parsing - in real implementation, this would be more sophisticated
      const spellMatch = description.match(
        /cast\s+(\w+)\s+(?:level\s+)?(\d+)?\s*(?:(\w+)\s+school)?/i
      );
      if (spellMatch) {
        return {
          name: spellMatch[1],
          level: parseInt(spellMatch[2]) || 0,
          school: spellMatch[3] || 'unknown',
          requiresConcentration: description.toLowerCase().includes('concentration'),
          usesBonusAction: description.toLowerCase().includes('bonus action'),
          targets: this.extractTargets(description),
        };
      }
      return null;
    } catch (error) {
      logger.error('Error parsing spell action', { description, error });
      return null;
    }
  }

  /**
   * Extract targets from spell description
   */
  private extractTargets(description: string): string[] {
    const targetMatch = description.match(/target(?:s)?\s+([^.]+)/i);
    if (targetMatch) {
      return targetMatch[1].split(',').map(t => t.trim());
    }
    return [];
  }

  /**
   * Validate spell casting
   */
  private validateSpellCasting(
    _caster: CombatParticipant,
    _spellData: any
  ): { valid: boolean; reason?: string } {
    // In real implementation, this would check:
    // - Spell slots available
    // - Components available
    // - Concentration conflicts
    // - Range and line of sight

    return { valid: true };
  }

  /**
   * Apply spell effects
   */
  private async applySpellEffects(
    caster: CombatParticipant,
    spellData: any,
    _action: CombatAction
  ): Promise<{ targetCount: number; consequences: string[] }> {
    const consequences: string[] = [];
    let targetCount = 0;

    // In real implementation, this would:
    // - Apply damage/healing
    // - Apply conditions
    // - Handle saving throws
    // - Update target states

    consequences.push(`Cast ${spellData.name} successfully`);
    targetCount = spellData.targets.length;

    return { targetCount, consequences };
  }

  /**
   * Handle concentration for spells
   */
  private handleConcentration(caster: CombatParticipant, spellData: any): void {
    // In real implementation, this would:
    // - Check for existing concentration
    // - Break previous concentration if needed
    // - Set new concentration spell
    logger.info('Concentration handled for spell', {
      casterId: caster.id,
      spellName: spellData.name,
    });
  }

  /**
   * Advance to next turn with full D&D 5e turn management
   */
  async nextTurn(encounterId: string): Promise<{
    roundNumber: number;
    turnNumber: number;
    currentActor: string;
    roundActions: any[];
  }> {
    try {
      // In a real implementation, this would fetch from database
      // For now, we'll simulate the logic

      // Get current encounter state
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      const currentRound = encounter.rounds[encounter.currentRound - 1];
      if (!currentRound) {
        throw new Error('Current round not found');
      }

      // Determine next actor in turn order
      const currentTurnIndex = currentRound.turnOrder.findIndex(
        id => id === currentRound.turnOrder[currentRound.currentTurn - 1]
      );
      let nextTurnIndex = currentTurnIndex + 1;
      let nextRound = encounter.currentRound;

      // Check if we need to advance to next round
      if (nextTurnIndex >= currentRound.turnOrder.length) {
        nextTurnIndex = 0;
        nextRound++;

        // Create new round if needed
        if (nextRound > encounter.rounds.length) {
          const newRound = await this.createCombatRound(encounter, nextRound);
          encounter.rounds.push(newRound);

          // Reset actions for all participants
          encounter.participants.forEach(participant => {
            participant.actions = {
              action: true,
              bonusAction: true,
              reaction: true,
              movement: 30, // Reset movement to base speed
            };
          });
        }
      }

      // Update encounter state
      encounter.currentRound = nextRound;
      encounter.currentTurn = nextTurnIndex + 1;

      const nextActorId = currentRound.turnOrder[nextTurnIndex];
      const nextActor = encounter.participants.find(p => p.id === nextActorId);

      // Get round actions for context
      const roundActions = currentRound.actions.filter(action => action.roundNumber === nextRound);

      // Add turn advancement to context
      if (nextActor) {
        this.contextManager.addContextLayer(
          encounter.campaignId,
          'immediate',
          `Turn ${encounter.currentTurn} of round ${encounter.currentRound}: ${nextActor.name}'s turn`,
          7
        );
      }

      logger.info('Combat turn advanced', {
        encounterId,
        roundNumber: encounter.currentRound,
        turnNumber: encounter.currentTurn,
        currentActor: nextActorId,
        nextActorName: nextActor?.name,
      });

      return {
        roundNumber: encounter.currentRound,
        turnNumber: encounter.currentTurn,
        currentActor: nextActorId,
        roundActions: roundActions,
      };
    } catch (error) {
      logger.error('Error advancing combat turn:', error);
      throw error;
    }
  }

  /**
   * Get encounter by ID (helper method)
   */
  private async getEncounterById(encounterId: string): Promise<CombatEncounterData | null> {
    try {
      const encounter = await CombatEncounter.findById(encounterId);
      return encounter ? (encounter.toObject() as CombatEncounterData) : null;
    } catch (error) {
      logger.error('Error getting encounter by ID:', error);
      return null;
    }
  }

  /**
   * Apply condition to participant
   */
  async applyCondition(
    participantId: string,
    condition: string,
    duration: number,
    source: string
  ): Promise<void> {
    try {
      const participant = await this.getParticipantById(participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      // Add condition to participant
      participant.conditions.push(condition);

      // Apply condition effects
      this.applyConditionEffects(participant, condition);

      // Schedule condition removal
      setTimeout(() => {
        this.removeCondition(participantId, condition);
      }, duration * 1000); // Convert to milliseconds

      logger.info('Condition applied to participant', {
        participantId,
        condition,
        duration,
        source,
      });
    } catch (error) {
      logger.error('Error applying condition', { participantId, condition, error });
      throw error;
    }
  }

  /**
   * Remove condition from participant
   */
  async removeCondition(participantId: string, condition: string): Promise<void> {
    try {
      const participant = await this.getParticipantById(participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      // Remove condition
      const index = participant.conditions.indexOf(condition);
      if (index > -1) {
        participant.conditions.splice(index, 1);
      }

      // Remove condition effects
      this.removeConditionEffects(participant, condition);

      logger.info('Condition removed from participant', {
        participantId,
        condition,
      });
    } catch (error) {
      logger.error('Error removing condition', { participantId, condition, error });
      throw error;
    }
  }

  /**
   * Apply effects of a condition
   */
  private applyConditionEffects(participant: CombatParticipant, condition: string): void {
    switch (condition.toLowerCase()) {
      case 'poisoned':
        // Poisoned: Disadvantage on attack rolls and ability checks
        participant.conditions.push('poisoned');
        break;
      case 'paralyzed':
        // Paralyzed: Can't move or speak, automatically fail STR/DEX saves
        participant.status = 'unconscious';
        participant.conditions.push('paralyzed');
        break;
      case 'stunned':
        // Stunned: Can't move, speak, or take actions
        participant.conditions.push('stunned');
        break;
      case 'unconscious':
        // Unconscious: Can't move, speak, or take actions
        participant.status = 'unconscious';
        participant.conditions.push('unconscious');
        break;
      case 'frightened':
        // Frightened: Disadvantage on ability checks and attack rolls
        participant.conditions.push('frightened');
        break;
      case 'charmed':
        // Charmed: Can't attack the charmer
        participant.conditions.push('charmed');
        break;
      case 'grappled':
        // Grappled: Speed becomes 0
        participant.actions.movement = 0;
        participant.conditions.push('grappled');
        break;
      case 'restrained':
        // Restrained: Speed becomes 0, disadvantage on attacks
        participant.actions.movement = 0;
        participant.conditions.push('restrained');
        break;
      case 'prone':
        // Prone: Disadvantage on attack rolls, advantage on melee attacks against
        participant.conditions.push('prone');
        break;
      case 'invisible':
        // Invisible: Advantage on attacks, disadvantage on attacks against
        participant.conditions.push('invisible');
        break;
      default:
        // Unknown condition
        logger.warn('Unknown condition applied', { condition });
        break;
    }
  }

  /**
   * Remove effects of a condition
   */
  private removeConditionEffects(participant: CombatParticipant, condition: string): void {
    switch (condition.toLowerCase()) {
      case 'grappled':
      case 'restrained':
        // Restore movement
        participant.actions.movement = 30; // Base movement speed
        break;
      case 'paralyzed':
      case 'unconscious':
        // Restore status if no other conditions prevent it
        if (!participant.conditions.some(c => ['paralyzed', 'unconscious'].includes(c))) {
          participant.status = 'active';
        }
        break;
      // Other conditions don't have persistent effects to remove
    }
  }

  /**
   * Check if participant has advantage/disadvantage on attack
   */
  hasAdvantageOnAttack(
    attacker: CombatParticipant,
    target: CombatParticipant,
    attackType: 'melee' | 'ranged'
  ): boolean {
    let hasAdvantage = false;
    let hasDisadvantage = false;

    // Check attacker conditions
    if (attacker.conditions.includes('poisoned') || attacker.conditions.includes('frightened')) {
      hasDisadvantage = true;
    }

    // Check target conditions
    if (target.conditions.includes('prone') && attackType === 'melee') {
      hasAdvantage = true;
    }

    if (target.conditions.includes('invisible')) {
      hasDisadvantage = true;
    }

    // Return true if advantage outweighs disadvantage
    return hasAdvantage && !hasDisadvantage;
  }

  /**
   * Check if participant has advantage/disadvantage on saving throw
   */
  hasAdvantageOnSave(_participant: CombatParticipant, _saveType: string): boolean {
    // In real implementation, this would check for:
    // - Magic items that grant advantage
    // - Class features
    // - Spell effects
    // - Other sources

    return false;
  }

  /**
   * Create encounter template
   */
  async createEncounterTemplate(templateData: {
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    participantTemplates: Array<{
      name: string;
      type: 'character' | 'npc' | 'enemy';
      level?: number;
      challengeRating?: number;
      stats: {
        maxHP: number;
        armorClass: number;
        initiativeModifier: number;
        speed: number;
      };
      abilities: string[];
      equipment: string[];
    }>;
    environmentalFactors: string[];
    victoryConditions: string[];
    defeatConditions: string[];
    tags: string[];
  }): Promise<string> {
    try {
      // In real implementation, this would store in database
      const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.info('Encounter template created', {
        templateId,
        name: templateData.name,
        difficulty: templateData.difficulty,
        participantCount: templateData.participantTemplates.length,
      });

      return templateId;
    } catch (error) {
      logger.error('Error creating encounter template:', error);
      throw error;
    }
  }

  /**
   * Use encounter template to create encounter
   */
  async useEncounterTemplate(
    templateId: string,
    campaignId: string,
    sessionId: string,
    customizations: {
      location?: string;
      additionalParticipants?: any[];
      modifiedDifficulty?: 'easy' | 'medium' | 'hard' | 'deadly';
    } = {}
  ): Promise<CombatEncounterData> {
    try {
      // In real implementation, this would:
      // 1. Fetch template from database
      // 2. Apply customizations
      // 3. Create encounter with template data

      // Mock template data
      const templateData = {
        name: 'Goblin Ambush',
        description: 'A group of goblins ambush the party',
        difficulty: 'medium' as const,
        participantTemplates: [
          {
            name: 'Goblin Scout',
            type: 'enemy' as const,
            challengeRating: 0.25,
            stats: {
              maxHP: 7,
              armorClass: 15,
              initiativeModifier: 2,
              speed: 30,
            },
            abilities: ['Nimble Escape'],
            equipment: ['Shortbow', 'Scimitar'],
          },
        ],
        environmentalFactors: ['Dense forest', 'Poor visibility'],
        victoryConditions: ['Defeat all goblins'],
        defeatConditions: ['All party members unconscious'],
        tags: ['ambush', 'forest', 'goblin'],
      };

      // Create encounter from template
      const encounter = await this.createEncounter({
        campaignId,
        sessionId,
        name: customizations.location
          ? `${templateData.name} at ${customizations.location}`
          : templateData.name,
        description: templateData.description,
        location: customizations.location || 'Unknown Location',
        difficulty: customizations.modifiedDifficulty || templateData.difficulty,
        participants: [
          // Convert template participants to actual participants
          ...templateData.participantTemplates.map(template => ({
            id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: template.name,
            type: template.type,
            initiative: 0, // Will be rolled when encounter starts
            initiativeModifier: template.stats.initiativeModifier,
            currentHP: template.stats.maxHP,
            maxHP: template.stats.maxHP,
            armorClass: template.stats.armorClass,
            status: 'active' as const,
            conditions: [],
            position: { x: 0, y: 0 },
            actions: {
              action: true,
              bonusAction: true,
              reaction: true,
              movement: template.stats.speed,
            },
          })),
          // Add any additional participants
          ...(customizations.additionalParticipants || []),
        ],
        environmentalFactors: templateData.environmentalFactors,
        victoryConditions: templateData.victoryConditions,
        defeatConditions: templateData.defeatConditions,
      });

      logger.info('Encounter created from template', {
        templateId,
        encounterId: encounter.id,
        customizations,
      });

      return encounter;
    } catch (error) {
      logger.error('Error using encounter template', { templateId, error });
      throw error;
    }
  }

  /**
   * Get available encounter templates
   */
  async getEncounterTemplates(
    filters: {
      difficulty?: string[];
      tags?: string[];
      participantCount?: { min: number; max: number };
    } = {}
  ): Promise<any[]> {
    try {
      // In real implementation, this would query the database
      // For now, return mock templates
      const templates = [
        {
          id: 'template_goblin_ambush',
          name: 'Goblin Ambush',
          description: 'A classic goblin ambush encounter',
          difficulty: 'medium',
          participantCount: 4,
          tags: ['ambush', 'forest', 'goblin'],
          challengeRating: '1/4',
        },
        {
          id: 'template_orc_war_party',
          name: 'Orc War Party',
          description: 'A group of orc warriors',
          difficulty: 'hard',
          participantCount: 6,
          tags: ['combat', 'orc', 'war'],
          challengeRating: '2',
        },
        {
          id: 'template_dragon_lair',
          name: 'Dragon Lair',
          description: 'A young dragon in its lair',
          difficulty: 'deadly',
          participantCount: 8,
          tags: ['dragon', 'lair', 'legendary'],
          challengeRating: '8',
        },
      ];

      // Apply filters
      let filteredTemplates = templates;

      if (filters.difficulty && filters.difficulty.length > 0) {
        filteredTemplates = filteredTemplates.filter(t =>
          filters.difficulty!.includes(t.difficulty)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredTemplates = filteredTemplates.filter(t =>
          filters.tags!.some(tag => t.tags.includes(tag))
        );
      }

      if (filters.participantCount) {
        filteredTemplates = filteredTemplates.filter(
          t =>
            t.participantCount >= filters.participantCount!.min &&
            t.participantCount <= filters.participantCount!.max
        );
      }

      return filteredTemplates;
    } catch (error) {
      logger.error('Error getting encounter templates', { error });
      return [];
    }
  }

  /**
   * End combat encounter
   */
  async endEncounter(
    encounterId: string,
    outcome: 'victory' | 'defeat' | 'retreat'
  ): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Update encounter status
      // 2. Award experience
      // 3. Update character stats
      // 4. Record encounter results

      // Add encounter end to context
      this.contextManager.addContextLayer(
        'mock_campaign', // Would be actual campaign ID
        'immediate',
        `Combat encounter ended with outcome: ${outcome}`,
        8
      );

      logger.info('Combat encounter ended', {
        encounterId,
        outcome,
      });
    } catch (error) {
      logger.error('Error ending combat encounter:', error);
      throw error;
    }
  }

  /**
   * Get combat encounter status
   */
  async getEncounterStatus(encounterId: string): Promise<{
    status: string;
    currentRound: number;
    currentTurn: number;
    participants: CombatParticipant[];
    recentActions: CombatAction[];
  } | null> {
    try {
      // In a real implementation, this would fetch from database
      logger.info('Getting encounter status', { encounterId });

      return null;
    } catch (error) {
      logger.error('Error getting encounter status:', error);
      return null;
    }
  }

  /**
   * Add environmental effect to combat
   */
  async addEnvironmentalEffect(
    encounterId: string,
    effect: string,
    roundNumber: number
  ): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Add effect to current round
      // 2. Apply effect to participants
      // 3. Update context

      logger.info('Environmental effect added to combat', {
        encounterId,
        effect,
        roundNumber,
      });
    } catch (error) {
      logger.error('Error adding environmental effect:', error);
    }
  }

  /**
   * Calculate damage for an attack
   */
  calculateDamage(
    baseDamage: number,
    modifiers: {
      strength?: number;
      dexterity?: number;
      magical?: number;
      critical?: boolean;
    } = {}
  ): { totalDamage: number; damageBreakdown: string[] } {
    try {
      let totalDamage = baseDamage;
      const breakdown: string[] = [`Base damage: ${baseDamage}`];

      // Apply strength modifier for melee attacks
      if (modifiers.strength) {
        const strMod = Math.floor((modifiers.strength - 10) / 2);
        if (strMod > 0) {
          totalDamage += strMod;
          breakdown.push(`Strength modifier: +${strMod}`);
        }
      }

      // Apply dexterity modifier for ranged attacks
      if (modifiers.dexterity) {
        const dexMod = Math.floor((modifiers.dexterity - 10) / 2);
        if (dexMod > 0) {
          totalDamage += dexMod;
          breakdown.push(`Dexterity modifier: +${dexMod}`);
        }
      }

      // Apply magical modifiers
      if (modifiers.magical) {
        totalDamage += modifiers.magical;
        breakdown.push(`Magical modifier: +${modifiers.magical}`);
      }

      // Apply critical hit multiplier
      if (modifiers.critical) {
        totalDamage = Math.floor(totalDamage * 1.5);
        breakdown.push('Critical hit: ×1.5');
      }

      return {
        totalDamage: Math.max(1, totalDamage), // Minimum 1 damage
        damageBreakdown: breakdown,
      };
    } catch (error) {
      logger.error('Error calculating damage:', error);
      return {
        totalDamage: baseDamage,
        damageBreakdown: [`Base damage: ${baseDamage}`],
      };
    }
  }

  /**
   * Check if combat encounter is complete
   */
  isEncounterComplete(participants: CombatParticipant[]): boolean {
    try {
      const activeParticipants = participants.filter(p => p.status === 'active' && p.currentHP > 0);

      // Check victory/defeat conditions
      const playerCharacters = activeParticipants.filter(p => p.type === 'character');
      const enemies = activeParticipants.filter(p => p.type === 'enemy');

      if (playerCharacters.length === 0) {
        return true; // Defeat
      }

      if (enemies.length === 0) {
        return true; // Victory
      }

      return false;
    } catch (error) {
      logger.error('Error checking encounter completion:', error);
      return false;
    }
  }

  /**
   * Get encounter by ID
   */
  async getEncounter(encounterId: string): Promise<CombatEncounterData | null> {
    try {
      logger.info('Getting encounter', { encounterId });
      return await this.getEncounterById(encounterId);
    } catch (error) {
      logger.error('Error getting encounter:', error);
      return null;
    }
  }

  /**
   * Update encounter
   */
  async updateEncounter(
    encounterId: string,
    updateData: Partial<CombatEncounterData>
  ): Promise<CombatEncounterData> {
    try {
      logger.info('Updating encounter', { encounterId, updateData });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // Update the encounter with new data
      Object.assign(encounter, updateData);

      // In a real implementation, this would save to database
      // For now, return the updated encounter
      return encounter;
    } catch (error) {
      logger.error('Error updating encounter:', error);
      throw error;
    }
  }

  /**
   * Add participant to encounter
   */
  async addParticipant(encounterId: string, participantData: any): Promise<CombatEncounterData> {
    try {
      logger.info('Adding participant to encounter', { encounterId, participantData });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // Add participant to the encounter
      const newParticipant = {
        id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...participantData,
        conditions: [],
        initiative: 0,
      };

      encounter.participants.push(newParticipant);

      // In a real implementation, this would save to database
      // For now, return the updated encounter
      return encounter;
    } catch (error) {
      logger.error('Error adding participant:', error);
      throw error;
    }
  }

  /**
   * Remove participant from encounter
   */
  async removeParticipant(
    encounterId: string,
    participantId: string
  ): Promise<CombatEncounterData> {
    try {
      logger.info('Removing participant from encounter', { encounterId, participantId });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // Remove participant from the encounter
      encounter.participants = encounter.participants.filter(p => p.id !== participantId);

      // In a real implementation, this would save to database
      // For now, return the updated encounter
      return encounter;
    } catch (error) {
      logger.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Update participant
   */
  async updateParticipant(
    encounterId: string,
    participantId: string,
    updateData: any
  ): Promise<CombatEncounterData> {
    try {
      logger.info('Updating participant', { encounterId, participantId, updateData });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // Find and update the participant
      const participant = encounter.participants.find(p => p.id === participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      Object.assign(participant, updateData);

      // In a real implementation, this would save to database
      // For now, return the updated encounter
      return encounter;
    } catch (error) {
      logger.error('Error updating participant:', error);
      throw error;
    }
  }

  /**
   * Start next round
   */
  async startNextRound(encounterId: string): Promise<any> {
    try {
      logger.info('Starting next round', { encounterId });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // Start the next round
      const nextRoundNumber = encounter.currentRound + 1;
      const newRound: CombatRound = {
        roundNumber: nextRoundNumber,
        currentTurn: 1,
        participants: encounter.participants,
        turnOrder: encounter.participants.map(p => p.id),
        actions: [],
        environmentalEffects: [],
        roundStartTime: new Date(),
      };

      encounter.rounds.push(newRound);
      encounter.currentRound = nextRoundNumber;
      encounter.currentTurn = 1;

      // In a real implementation, this would save to database
      // For now, return the round info
      return {
        roundNumber: nextRoundNumber,
        turnNumber: 1,
        currentActor: encounter.participants[0]?.id || 'unknown',
        encounterId,
        startTime: newRound.roundStartTime,
      };
    } catch (error) {
      logger.error('Error starting next round:', error);
      throw error;
    }
  }

  /**
   * End current round
   */
  async endCurrentRound(encounterId: string): Promise<any> {
    try {
      logger.info('Ending current round', { encounterId });
      // In a real implementation, this would update the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      // End the current round
      const currentRound = encounter.rounds[encounter.currentRound - 1];
      if (currentRound) {
        currentRound.roundEndTime = new Date();
      }

      // In a real implementation, this would save to database
      // For now, return success
      return {
        success: true,
        roundNumber: encounter.currentRound,
        roundSummary: `Round ${encounter.currentRound} completed`,
      };
    } catch (error) {
      logger.error('Error ending current round:', error);
      throw error;
    }
  }

  /**
   * Perform a combat action
   */
  async performAction(
    encounterId: string,
    actionData: {
      participantId: string;
      actionType:
        | 'attack'
        | 'spell'
        | 'move'
        | 'dash'
        | 'dodge'
        | 'help'
        | 'ready'
        | 'search'
        | 'use-item';
      targetId?: string;
      description: string;
      modifiers?: any;
    }
  ): Promise<any> {
    try {
      logger.info('Performing combat action', { encounterId, actionData });
      // In a real implementation, this would process the action
      return {
        actionId: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        encounterId,
        participantId: actionData.participantId,
        actionType: actionData.actionType,
        targetId: actionData.targetId,
        description: actionData.description,
        timestamp: new Date(),
        success: true,
        result: 'success',
      };
    } catch (error) {
      logger.error('Error performing combat action:', error);
      throw error;
    }
  }

  /**
   * Get round actions
   */
  async getRoundActions(encounterId: string, roundNumber: number): Promise<any[]> {
    try {
      logger.info('Getting round actions', { encounterId, roundNumber });
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      logger.error('Error getting round actions:', error);
      return [];
    }
  }

  /**
   * Get current turn
   */
  async getCurrentTurn(encounterId: string): Promise<any> {
    try {
      logger.info('Getting current turn', { encounterId });
      // In a real implementation, this would query the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      return {
        encounterId,
        roundNumber: encounter.currentRound,
        turnNumber: encounter.currentTurn,
        currentActor: encounter.participants[encounter.currentTurn - 1]?.id || 'unknown',
        availableActions: ['attack', 'move', 'spell', 'dash', 'dodge'],
      };
    } catch (error) {
      logger.error('Error getting current turn:', error);
      throw error;
    }
  }

  /**
   * Get encounter summary
   */
  async getEncounterSummary(encounterId: string): Promise<any> {
    try {
      logger.info('Getting encounter summary', { encounterId });
      // In a real implementation, this would query the database
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      return {
        encounterId,
        name: encounter.name,
        status: encounter.status,
        difficulty: encounter.difficulty,
        participantCount: encounter.participants.length,
        roundCount: encounter.rounds.length,
        currentRound: encounter.currentRound,
        currentTurn: encounter.currentTurn,
        startTime: encounter.startTime,
        endTime: encounter.endTime,
        duration: encounter.endTime
          ? Math.floor((encounter.endTime.getTime() - encounter.startTime.getTime()) / 1000)
          : Math.floor((new Date().getTime() - encounter.startTime.getTime()) / 1000),
        outcome: encounter.status === 'completed' ? 'victory' : 'ongoing',
      };
    } catch (error) {
      logger.error('Error getting encounter summary:', error);
      throw error;
    }
  }

  /**
   * Get campaign encounters
   */
  async getCampaignEncounters(campaignId: string, filters: any = {}): Promise<any[]> {
    try {
      logger.info('Getting campaign encounters', { campaignId, filters });
      const encounters = await CombatEncounter.find({ campaignId, ...filters })
        .sort({ startTime: -1 })
        .lean();
      return encounters;
    } catch (error) {
      logger.error('Error getting campaign encounters:', error);
      return [];
    }
  }

  /**
   * Save combat state changes to database
   */
  private async saveCombatState(
    encounterId: string,
    updates: Partial<CombatEncounterData>
  ): Promise<void> {
    try {
      await CombatEncounter.findByIdAndUpdate(encounterId, updates, { new: true });
      logger.info('Combat state saved to database', { encounterId, updates: Object.keys(updates) });
    } catch (error) {
      logger.error('Error saving combat state:', error);
      throw error;
    }
  }

  /**
   * Get active encounters for a session
   */
  async getSessionEncounters(sessionId: string): Promise<CombatEncounterData[]> {
    try {
      const encounters = await CombatEncounter.find({
        sessionId,
        status: { $in: ['preparing', 'active', 'paused'] },
      }).lean();
      return encounters;
    } catch (error) {
      logger.error('Error getting session encounters:', error);
      return [];
    }
  }

  /**
   * Resume combat encounter from saved state
   */
  async resumeEncounter(encounterId: string): Promise<CombatEncounterData | null> {
    try {
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      if (encounter.status === 'completed') {
        throw new Error('Cannot resume completed encounter');
      }

      // Update status to active if it was paused
      if (encounter.status === 'paused') {
        await this.saveCombatState(encounterId, { status: 'active' });
        encounter.status = 'active';
      }

      logger.info('Combat encounter resumed', { encounterId, status: encounter.status });
      return encounter;
    } catch (error) {
      logger.error('Error resuming encounter:', error);
      throw error;
    }
  }

  /**
   * Pause combat encounter
   */
  async pauseEncounter(encounterId: string): Promise<void> {
    try {
      const encounter = await this.getEncounterById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      if (encounter.status === 'completed') {
        throw new Error('Cannot pause completed encounter');
      }

      // Save current state and pause
      await this.saveCombatState(encounterId, { status: 'paused' });

      logger.info('Combat encounter paused', { encounterId });
    } catch (error) {
      logger.error('Error pausing encounter:', error);
      throw error;
    }
  }
}

export default CombatService;
