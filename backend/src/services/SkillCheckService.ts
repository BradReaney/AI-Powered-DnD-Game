import logger from './LoggerService';
import Character from '../models/Character';
import StoryEvent from '../models/StoryEvent';

export interface SkillCheckRequest {
  characterId: string;
  skillName: string;
  d20Roll: number;
  targetDC: number;
  actionDescription: string;
  campaignId: string;
  sessionId: string;
  location: string;
  advantage?: boolean;
  disadvantage?: boolean;
  customModifiers?: {
    circumstantial?: number;
    magical?: number;
    environmental?: number;
    other?: number;
  };
}

export interface SkillCheckResult {
  success: boolean;
  critical: boolean;
  totalResult: number;
  breakdown: {
    d20Roll: number;
    baseModifier: number;
    proficiencyBonus: number;
    circumstantialModifier: number;
    magicalModifier: number;
    environmentalModifier: number;
    otherModifier: number;
    totalModifier: number;
  };
  skillInfo: {
    skillName: string;
    abilityScore: string;
    abilityModifier: number;
    proficiency: boolean;
    expertise: boolean;
  };
  consequences: string[];
  experienceGained: number;
}

export interface SkillCheckHistory {
  characterId: string;
  skillName: string;
  totalResults: number[];
  successes: number;
  failures: number;
  criticalSuccesses: number;
  criticalFailures: number;
  averageResult: number;
  lastUsed: Date;
}

export class SkillCheckService {
  private skillToAbilityMap: Map<string, string> = new Map();
  private skillDifficultyClasses: Map<
    string,
    { easy: number; medium: number; hard: number; veryHard: number }
  > = new Map();

  constructor() {
    this.initializeSkillMappings();
    this.initializeDifficultyClasses();
  }

  /**
   * Initialize skill to ability score mappings
   */
  private initializeSkillMappings(): void {
    this.skillToAbilityMap = new Map([
      // Strength-based skills
      ['athletics', 'strength'],

      // Dexterity-based skills
      ['acrobatics', 'dexterity'],
      ['sleight-of-hand', 'dexterity'],
      ['stealth', 'dexterity'],

      // Intelligence-based skills
      ['arcana', 'intelligence'],
      ['history', 'intelligence'],
      ['investigation', 'intelligence'],
      ['nature', 'intelligence'],
      ['religion', 'intelligence'],

      // Wisdom-based skills
      ['animal-handling', 'wisdom'],
      ['insight', 'wisdom'],
      ['medicine', 'wisdom'],
      ['perception', 'wisdom'],
      ['survival', 'wisdom'],

      // Charisma-based skills
      ['deception', 'charisma'],
      ['intimidation', 'charisma'],
      ['performance', 'charisma'],
      ['persuasion', 'charisma'],
    ]);
  }

  /**
   * Initialize difficulty classes for different skill check types
   */
  private initializeDifficultyClasses(): void {
    this.skillDifficultyClasses = new Map([
      ['athletics', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['acrobatics', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['stealth', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['perception', { easy: 6, medium: 10, hard: 14, veryHard: 18 }],
      ['investigation', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['insight', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['persuasion', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['deception', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['intimidation', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['arcana', { easy: 10, medium: 14, hard: 18, veryHard: 22 }],
      ['history', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['religion', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['nature', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['medicine', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['animal-handling', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['survival', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['sleight-of-hand', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
      ['performance', { easy: 8, medium: 12, hard: 16, veryHard: 20 }],
    ]);
  }

  /**
   * Perform a skill check
   */
  async performSkillCheck(request: SkillCheckRequest): Promise<SkillCheckResult> {
    try {
      logger.info('Performing skill check', {
        characterId: request.characterId,
        skillName: request.skillName,
        d20Roll: request.d20Roll,
        targetDC: request.targetDC,
      });

      // Get character information
      const character = await Character.findById(request.characterId);
      if (!character) {
        throw new Error(`Character not found: ${request.characterId}`);
      }

      // Calculate skill check result
      const result = this.calculateSkillCheckResult(request, character);

      // Record the skill check in story events
      await this.recordSkillCheckEvent(request, result);

      // Update character experience if applicable
      if (result.experienceGained > 0) {
        await this.updateCharacterExperience(character, result.experienceGained);
      }

      logger.info('Skill check completed', {
        characterId: request.characterId,
        skillName: request.skillName,
        success: result.success,
        totalResult: result.totalResult,
      });

      return result;
    } catch (error) {
      logger.error('Error performing skill check:', error);
      throw error;
    }
  }

  /**
   * Calculate skill check result with all modifiers
   */
  private calculateSkillCheckResult(request: SkillCheckRequest, character: any): SkillCheckResult {
    const skillName = request.skillName.toLowerCase();
    const abilityScore = this.skillToAbilityMap.get(skillName) || 'strength';

    // Get ability modifier
    const abilityModifier = this.getAbilityModifier(character, abilityScore);

    // Get proficiency bonus
    const proficiencyBonus = this.getProficiencyBonus(character);
    const hasProficiency = this.hasSkillProficiency(character, skillName);
    const hasExpertise = this.hasSkillExpertise(character, skillName);

    // Calculate proficiency modifier
    let proficiencyModifier = 0;
    if (hasProficiency) {
      proficiencyModifier = hasExpertise ? proficiencyBonus * 2 : proficiencyBonus;
    }

    // Get custom modifiers
    const customMods = request.customModifiers || {};
    const circumstantialModifier = customMods.circumstantial || 0;
    const magicalModifier = customMods.magical || 0;
    const environmentalModifier = customMods.environmental || 0;
    const otherModifier = customMods.other || 0;

    // Calculate total modifier
    const totalModifier =
      abilityModifier +
      proficiencyModifier +
      circumstantialModifier +
      magicalModifier +
      environmentalModifier +
      otherModifier;

    // Calculate final result
    const finalRoll = request.d20Roll;

    // Handle advantage/disadvantage
    if (request.advantage && !request.disadvantage) {
      // For advantage, we assume the player rolled the higher of two dice
      // In practice, this would be handled by the frontend
      logger.info('Advantage applied to skill check');
    } else if (request.disadvantage && !request.advantage) {
      // For disadvantage, we assume the player rolled the lower of two dice
      // In practice, this would be handled by the frontend
      logger.info('Disadvantage applied to skill check');
    }

    const totalResult = finalRoll + totalModifier;
    const success = totalResult >= request.targetDC;
    const critical = finalRoll === 20 || finalRoll === 1;

    // Determine consequences and experience
    const consequences = this.determineConsequences(skillName, success, critical);
    const experienceGained = this.calculateExperienceGained(skillName, success, critical);

    return {
      success,
      critical,
      totalResult,
      breakdown: {
        d20Roll: finalRoll,
        baseModifier: abilityModifier,
        proficiencyBonus: proficiencyModifier,
        circumstantialModifier,
        magicalModifier,
        environmentalModifier,
        otherModifier,
        totalModifier,
      },
      skillInfo: {
        skillName,
        abilityScore,
        abilityModifier,
        proficiency: hasProficiency,
        expertise: hasExpertise,
      },
      consequences,
      experienceGained,
    };
  }

  /**
   * Get ability modifier for a character
   */
  private getAbilityModifier(character: any, abilityScore: string): number {
    const score = character.attributes?.[abilityScore] || 10;
    return Math.floor((score - 10) / 2);
  }

  /**
   * Get proficiency bonus for a character
   */
  private getProficiencyBonus(character: any): number {
    const level = character.level || 1;
    return Math.floor((level - 1) / 4) + 2;
  }

  /**
   * Check if character has proficiency in a skill
   */
  private hasSkillProficiency(character: any, skillName: string): boolean {
    const proficiencies = character.skillProficiencies || [];
    return proficiencies.includes(skillName);
  }

  /**
   * Check if character has expertise in a skill
   */
  private hasSkillExpertise(character: any, skillName: string): boolean {
    const expertise = character.skillExpertise || [];
    return expertise.includes(skillName);
  }

  /**
   * Determine consequences based on skill check result
   */
  private determineConsequences(skillName: string, success: boolean, critical: boolean): string[] {
    const consequences: string[] = [];

    if (critical && success) {
      consequences.push('Critical success! Exceptional outcome achieved.');
    } else if (critical && !success) {
      consequences.push('Critical failure! Significant setback occurs.');
    } else if (success) {
      consequences.push('Success! Goal achieved as intended.');
    } else {
      consequences.push('Failure! Goal not achieved, but progress may still be possible.');
    }

    // Add skill-specific consequences
    switch (skillName) {
      case 'stealth':
        if (success) {
          consequences.push('Successfully avoided detection.');
        } else {
          consequences.push('Detection risk increased.');
        }
        break;
      case 'perception':
        if (success) {
          consequences.push('Noticed important details.');
        } else {
          consequences.push('May have missed crucial information.');
        }
        break;
      case 'persuasion':
        if (success) {
          consequences.push('Successfully influenced the target.');
        } else {
          consequences.push('Target may be less receptive to future attempts.');
        }
        break;
      case 'athletics':
        if (success) {
          consequences.push('Physical challenge overcome.');
        } else {
          consequences.push('Physical strain or setback encountered.');
        }
        break;
    }

    return consequences;
  }

  /**
   * Calculate experience gained from skill check
   */
  private calculateExperienceGained(
    skillName: string,
    success: boolean,
    critical: boolean
  ): number {
    let baseXP = 0;

    if (critical && success) {
      baseXP = 25;
    } else if (success) {
      baseXP = 10;
    } else {
      baseXP = 2; // Learning from failure
    }

    // Skill-specific XP modifiers
    const skillXPModifiers: Record<string, number> = {
      arcana: 1.5,
      history: 1.3,
      investigation: 1.4,
      perception: 1.2,
      insight: 1.3,
      persuasion: 1.2,
      deception: 1.2,
      intimidation: 1.1,
      stealth: 1.1,
      athletics: 1.0,
      acrobatics: 1.0,
    };

    const modifier = skillXPModifiers[skillName] || 1.0;
    return Math.round(baseXP * modifier);
  }

  /**
   * Record skill check in story events
   */
  private async recordSkillCheckEvent(
    request: SkillCheckRequest,
    result: SkillCheckResult
  ): Promise<void> {
    try {
      const event = new StoryEvent({
        campaignId: request.campaignId,
        sessionId: request.sessionId,
        eventType: 'skill-check',
        title: `${result.skillInfo.skillName} Check: ${request.actionDescription}`,
        description: `Character attempted ${request.actionDescription} using ${result.skillInfo.skillName}. Result: ${result.totalResult} vs DC ${request.targetDC}. ${result.success ? 'Success' : 'Failure'}${result.critical ? ' (Critical!)' : ''}.`,
        timestamp: new Date(),
        participants: [request.characterId],
        location: request.location,
        importance: result.critical ? 8 : result.success ? 6 : 4,
        consequences: result.consequences,
        metadata: {
          skillChecks: [
            {
              skill: result.skillInfo.skillName,
              result: result.totalResult,
              targetDC: request.targetDC,
              success: result.success,
              critical: result.critical,
            },
          ],
        },
        tags: ['skill-check', result.skillInfo.skillName, result.success ? 'success' : 'failure'],
      });

      await event.save();
      logger.info('Skill check event recorded', { eventId: event._id });
    } catch (error) {
      logger.error('Error recording skill check event:', error);
      // Don't throw here as the skill check itself succeeded
    }
  }

  /**
   * Update character experience
   */
  private async updateCharacterExperience(character: any, experienceGained: number): Promise<void> {
    try {
      character.experience = (character.experience || 0) + experienceGained;
      await character.save();

      logger.info('Character experience updated', {
        characterId: character._id,
        experienceGained,
        newTotal: character.experience,
      });
    } catch (error) {
      logger.error('Error updating character experience:', error);
      // Don't throw here as the skill check itself succeeded
    }
  }

  /**
   * Get suggested difficulty class for a skill check
   */
  getSuggestedDC(
    skillName: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'veryHard' = 'medium'
  ): number {
    const skillDCs = this.skillDifficultyClasses.get(skillName.toLowerCase());
    if (!skillDCs) {
      // Default DCs if skill not found
      const defaultDCs = { easy: 8, medium: 12, hard: 16, veryHard: 20 };
      return defaultDCs[difficulty];
    }
    return skillDCs[difficulty];
  }

  /**
   * Get skill check history for a character
   */
  async getSkillCheckHistory(
    characterId: string,
    skillName?: string
  ): Promise<SkillCheckHistory[]> {
    try {
      const query: any = {
        'metadata.skillChecks': { $exists: true },
        participants: characterId,
      };

      if (skillName) {
        query['metadata.skillChecks.skill'] = skillName;
      }

      const events = await StoryEvent.find(query).sort({ timestamp: -1 }).limit(100);

      const skillHistory = new Map<string, SkillCheckHistory>();

      events.forEach(event => {
        event.metadata.skillChecks?.forEach(skillCheck => {
          const skill = skillCheck.skill;

          if (!skillHistory.has(skill)) {
            skillHistory.set(skill, {
              characterId,
              skillName: skill,
              totalResults: [],
              successes: 0,
              failures: 0,
              criticalSuccesses: 0,
              criticalFailures: 0,
              averageResult: 0,
              lastUsed: new Date(0),
            });
          }

          const history = skillHistory.get(skill)!;
          history.totalResults.push(skillCheck.result);

          if (skillCheck.success) {
            history.successes++;
            if (skillCheck.critical) history.criticalSuccesses++;
          } else {
            history.failures++;
            if (skillCheck.critical) history.criticalFailures++;
          }

          if (event.timestamp > history.lastUsed) {
            history.lastUsed = event.timestamp;
          }
        });
      });

      // Calculate averages
      skillHistory.forEach(history => {
        if (history.totalResults.length > 0) {
          history.averageResult = Math.round(
            history.totalResults.reduce((sum, result) => sum + result, 0) /
              history.totalResults.length
          );
        }
      });

      return Array.from(skillHistory.values());
    } catch (error) {
      logger.error('Error getting skill check history:', error);
      return [];
    }
  }

  /**
   * Get all available skills
   */
  getAllSkills(): string[] {
    return Array.from(this.skillToAbilityMap.keys());
  }

  /**
   * Get ability score for a skill
   */
  getSkillAbilityScore(skillName: string): string | null {
    return this.skillToAbilityMap.get(skillName.toLowerCase()) || null;
  }
}

export default SkillCheckService;
