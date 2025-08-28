import logger from './LoggerService';
import { Character, ICharacter, Campaign, ICampaign, Session } from '../models';
import LLMClientFactory from './LLMClientFactory';
import { cacheService } from './CacheService';

export interface CharacterCreationData {
  name: string;
  characterType: 'human' | 'ai';
  race: string;
  class: string;
  archetype?: string;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  personality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
    background: string;
    alignment: string;
  };
  campaignId: string;
  sessionId: string;
  createdBy: string;
}

export interface AICharacterGenerationRequest {
  campaignId: string;
  sessionId: string;
  race: string;
  class: string;
  archetype?: string;
  personality: {
    goals: string[];
    fears: string[];
    background: string;
  };
  createdBy: string;
}

export interface ExtractedCharacterData {
  name: string;
  race: string;
  class: string;
  archetype?: string;
  attributes?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  personality?: {
    traits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
    background?: string;
    alignment?: string;
  };
  campaignId: string;
  sessionId: string;
  createdBy: string;
}

export interface CharacterUpdateData {
  name?: string;
  level?: number;
  experience?: number;
  hitPoints?: {
    maximum?: number;
    current?: number;
    temporary?: number;
  };
  armorClass?: number;
  initiative?: number;
  speed?: number;
  skills?: {
    [key: string]: {
      proficient?: boolean;
      expertise?: boolean;
      modifier?: number;
    };
  };
  equipment?: {
    weapons?: Array<{
      name: string;
      type: string;
      damage: string;
      properties: string[];
      equipped: boolean;
    }>;
    armor?: {
      name: string;
      type: string;
      ac: number;
      equipped: boolean;
    } | null;
    items?: Array<{
      name: string;
      description: string;
      quantity: number;
      weight: number;
      magical: boolean;
    }>;
  };
  personality?: {
    goals?: string[];
    fears?: string[];
    background?: string;
    traits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
}

class CharacterService {
  private geminiClient: any;

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
  }

  public async createHumanCharacter(data: CharacterCreationData): Promise<ICharacter> {
    try {
      // Validate campaign exists
      const campaign = await Campaign.findById(data.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Calculate hit points based on class and constitution
      const hitPoints = this.calculateHitPoints(data.class, data.attributes.constitution, 1);

      // Calculate armor class (base 10 + dex modifier, minimum 10)
      const armorClass = Math.max(10, 10 + Math.floor((data.attributes.dexterity - 10) / 2));

      // Calculate speed (base 30 for most races)
      const speed = 30;

      // Initialize skills map
      const skills = this.initializeSkills(data.class);

      const character = new Character({
        name: data.name,
        characterType: 'human',
        race: data.race,
        class: data.class,
        archetype: data.archetype,
        level: 1,
        experience: 0,
        attributes: data.attributes,
        hitPoints,
        armorClass,
        initiative: 0,
        speed,
        skills,
        personality: data.personality,
        equipment: {
          weapons: [],
          armor: null,
          items: [],
        },
        campaignId: data.campaignId,
        sessionId: data.sessionId,
        isActive: true,
        createdBy: data.createdBy,
      });

      await character.save();

      // Add character to campaign
      campaign.characters.push({
        characterId: character._id as any,
        role: 'player',
        joinedAt: new Date(),
        isActive: true,
      });
      await campaign.save();

      logger.info(
        `Created human character: ${character.name} (${character.race} ${character.class})`
      );
      return character;
    } catch (error) {
      logger.error('Error creating human character:', error);
      throw error;
    }
  }

  public async createAICharacter(data: ExtractedCharacterData): Promise<ICharacter> {
    try {
      // Validate campaign exists
      const campaign = await Campaign.findById(data.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Use the provided character data directly instead of generating new data
      // This preserves the character names and details extracted from the story
      const aiCharacterData = {
        name: data.name,
        race: data.race,
        class: data.class,
        archetype: data.archetype,
        attributes: data.attributes || {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        personality: data.personality || {
          traits: ['Mysterious'],
          ideals: ['Unknown'],
          bonds: ['Unknown'],
          flaws: ['Unknown'],
          background: 'Recently encountered',
          alignment: 'neutral',
        },
      };

      // Calculate hit points, armor class, and speed
      const hitPoints = this.calculateHitPoints(
        aiCharacterData.class,
        aiCharacterData.attributes.constitution,
        1
      );
      const armorClass = Math.max(
        10,
        10 + Math.floor((aiCharacterData.attributes.dexterity - 10) / 2)
      );
      const speed = 30;

      // Initialize skills
      const skills = this.initializeSkills(aiCharacterData.class);

      const character = new Character({
        name: aiCharacterData.name,
        characterType: 'ai',
        race: aiCharacterData.race,
        class: aiCharacterData.class,
        archetype: aiCharacterData.archetype,
        level: 1,
        experience: 0,
        attributes: aiCharacterData.attributes,
        hitPoints,
        armorClass,
        initiative: 0,
        speed,
        skills,
        personality: aiCharacterData.personality,
        aiPersonality: {
          goals: data.personality?.traits || ['Unknown'],
          fears: data.personality?.flaws || ['Unknown'],
          relationships: {},
          memory: {
            importantEvents: [],
            characterDevelopment: [],
            worldKnowledge: [],
          },
        },
        equipment: {
          weapons: [],
          armor: null,
          items: [],
        },
        campaignId: data.campaignId,
        sessionId: data.sessionId, // Optional now
        isActive: true,
        createdBy: data.createdBy,
      });

      await character.save();

      // Add character to campaign
      campaign.characters.push({
        characterId: character._id as any,
        role: 'npc',
        joinedAt: new Date(),
        isActive: true,
      });
      await campaign.save();

      logger.info(`Created AI character: ${character.name} (${character.race} ${character.class})`);
      return character;
    } catch (error) {
      logger.error('Error creating AI character:', error);
      throw error;
    }
  }

  /**
   * Create an NPC character met during gameplay and add to campaign
   */
  public async createGameplayNPC(data: {
    name: string;
    race: string;
    class: string;
    role: string;
    personality: string;
    description: string;
    campaignId: string;
    sessionId?: string; // Made optional
    currentLocation: string;
    relationshipToParty: string;
  }): Promise<ICharacter> {
    try {
      // Validate campaign exists
      const campaign = await Campaign.findById(data.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Generate basic stats for the NPC
      const attributes = this.generateNPCStats(data.class);

      // Calculate hit points, armor class, and speed
      const hitPoints = this.calculateHitPoints(data.class, attributes.constitution, 1);
      const armorClass = Math.max(10, 10 + Math.floor((attributes.dexterity - 10) / 2));
      const speed = 30;

      // Initialize skills
      const skills = this.initializeSkills(data.class);

      // Create personality structure
      const personality = {
        traits: [data.personality],
        ideals: ['NPC ideals'],
        bonds: ['NPC bonds'],
        flaws: ['NPC flaws'],
        background: data.description,
        alignment: 'Neutral',
      };

      const character = new Character({
        name: data.name,
        characterType: 'ai',
        race: data.race,
        class: data.class,
        level: 1,
        experience: 0,
        attributes,
        hitPoints,
        armorClass,
        initiative: 0,
        speed,
        skills,
        personality,
        aiPersonality: {
          goals: [],
          fears: [],
          relationships: {},
          memory: {
            importantEvents: [],
            characterDevelopment: [],
            worldKnowledge: [],
          },
        },
        equipment: {
          weapons: [],
          armor: null,
          items: [],
        },
        campaignId: data.campaignId,
        sessionId: data.sessionId,
        isActive: true,
        createdBy: 'gameplay',
      });

      await character.save();

      // Add character to campaign
      campaign.characters.push({
        characterId: character._id as any,
        role: 'npc',
        joinedAt: new Date(),
        isActive: true,
      });

      // Add to campaign's NPC database
      campaign.storyContext.npcDatabase.push({
        name: data.name,
        role: data.role,
        description: data.description,
        personality: data.personality,
        currentLocation: data.currentLocation,
        relationshipToParty: data.relationshipToParty,
        lastSeen: new Date(),
      });

      await campaign.save();

      logger.info(
        `Created gameplay NPC: ${character.name} (${character.race} ${character.class}) in campaign ${data.campaignId}`
      );
      return character;
    } catch (error) {
      logger.error('Error creating gameplay NPC:', error);
      throw error;
    }
  }

  private async generateAICharacterData(
    request: AICharacterGenerationRequest,
    campaign: ICampaign
  ): Promise<{
    name: string;
    race: string;
    class: string;
    archetype?: string;
    attributes: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    personality: {
      traits: string[];
      ideals: string[];
      bonds: string[];
      flaws: string[];
      background: string;
      alignment: string;
    };
  }> {
    try {
      const prompt = `
      Create a D&D 5e character for a campaign called "${campaign.name}" with the theme "${campaign.theme}".

      Requirements:
      - Race: ${request.race}
      - Class: ${request.class}
      - Archetype: ${request.archetype || 'any appropriate'}

      Personality traits:
      - Goals: ${request.personality.goals.join(', ')}
      - Fears: ${request.personality.fears.join(', ')}
      - Background: ${request.personality.background}

      Generate a character with:
      1. A fitting name for the race and class
      2. Balanced D&D 5e attributes (3-18 range, total around 72-78)
      3. Personality traits, ideals, bonds, and flaws that match the goals and fears
      4. A background story that fits the campaign theme
      5. An appropriate alignment

      Return the response as a JSON object with this exact structure:
      {
        "name": "Character Name",
        "race": "Race Name",
        "class": "Class Name",
        "archetype": "Archetype Name",
        "attributes": {
          "strength": 14,
          "dexterity": 16,
          "constitution": 12,
          "intelligence": 10,
          "wisdom": 14,
          "charisma": 8
        },
        "personality": {
          "traits": ["trait1", "trait2"],
          "ideals": ["ideal1", "ideal2"],
          "bonds": ["bond1", "bond2"],
          "flaws": ["flaw1", "flaw2"],
          "background": "Background story...",
          "alignment": "Lawful Good"
        }
      }
      `;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'character_generation',
        forceModel: 'pro',
      });

      if (!response.success) {
        throw new Error('Failed to generate character: ' + response.error);
      }

      const text = response.content;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid character data');
      }

      const characterData = JSON.parse(jsonMatch[0]);

      // Validate the generated data
      this.validateGeneratedCharacterData(characterData);

      return characterData;
    } catch (error) {
      logger.error('Error generating AI character data:', error);

      // Fallback to default character
      return this.generateFallbackCharacter(request);
    }
  }

  private validateGeneratedCharacterData(data: any): void {
    const requiredFields = ['name', 'race', 'class', 'attributes', 'personality'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const requiredAttributes = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ];
    for (const attr of requiredAttributes) {
      if (
        typeof data.attributes[attr] !== 'number' ||
        data.attributes[attr] < 3 ||
        data.attributes[attr] > 18
      ) {
        throw new Error(`Invalid attribute value for ${attr}: ${data.attributes[attr]}`);
      }
    }
  }

  private generateFallbackCharacter(request: AICharacterGenerationRequest): any {
    // Generate a simple fallback character with balanced stats
    const attributes = {
      strength: 14,
      dexterity: 14,
      constitution: 14,
      intelligence: 12,
      wisdom: 12,
      charisma: 10,
    };

    return {
      name: `AI ${request.race} ${request.class}`,
      race: request.race,
      class: request.class,
      archetype: request.archetype || 'Default',
      attributes,
      personality: {
        traits: ['Adaptable', 'Curious'],
        ideals: ['Knowledge', 'Balance'],
        bonds: ['The party', 'The campaign world'],
        flaws: ['Overthinking', 'Indecisive'],
        background: `A ${request.race} ${request.class} created to assist the party in their adventures.`,
        alignment: 'Neutral Good',
      },
    };
  }

  /**
   * Generate basic stats for NPCs based on their class
   */
  private generateNPCStats(characterClass: string): {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  } {
    const baseStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // Adjust stats based on class
    switch (characterClass.toLowerCase()) {
      case 'fighter':
      case 'barbarian':
      case 'paladin':
        baseStats.strength = 14;
        baseStats.constitution = 12;
        break;
      case 'rogue':
      case 'ranger':
      case 'monk':
        baseStats.dexterity = 14;
        baseStats.wisdom = 12;
        break;
      case 'wizard':
      case 'sorcerer':
        baseStats.intelligence = 14;
        baseStats.constitution = 12;
        break;
      case 'cleric':
      case 'druid':
        baseStats.wisdom = 14;
        baseStats.constitution = 12;
        break;
      case 'bard':
      case 'warlock':
        baseStats.charisma = 14;
        baseStats.constitution = 12;
        break;
    }

    return baseStats;
  }

  private calculateHitPoints(
    characterClass: string,
    constitution: number,
    level: number
  ): { maximum: number; current: number; temporary: number } {
    const conModifier = Math.floor((constitution - 10) / 2);

    // Base hit points by class (using average values)
    const classHitDice: { [key: string]: number } = {
      barbarian: 12,
      fighter: 10,
      paladin: 10,
      ranger: 10,
      warlock: 8,
      wizard: 6,
      sorcerer: 6,
      monk: 8,
      rogue: 8,
      druid: 8,
      cleric: 8,
      bard: 8,
    };

    const hitDie = classHitDice[characterClass.toLowerCase()] || 8;
    const baseHP = Math.floor(hitDie / 2) + 1; // Average roll
    const maximum = baseHP + conModifier * level;

    return {
      maximum: Math.max(1, maximum),
      current: Math.max(1, maximum),
      temporary: 0,
    };
  }

  private initializeSkills(characterClass: string): {
    [key: string]: { proficient: boolean; expertise: boolean; modifier: number };
  } {
    const skills: { [key: string]: { proficient: boolean; expertise: boolean; modifier: number } } =
      {};

    // All D&D skills
    const allSkills = [
      'acrobatics',
      'animal handling',
      'arcana',
      'athletics',
      'deception',
      'history',
      'insight',
      'intimidation',
      'investigation',
      'medicine',
      'nature',
      'perception',
      'performance',
      'persuasion',
      'religion',
      'sleight of hand',
      'stealth',
      'survival',
    ];

    // Class skill proficiencies
    const classSkills: { [key: string]: string[] } = {
      fighter: ['athletics', 'intimidation'],
      wizard: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
      rogue: [
        'acrobatics',
        'athletics',
        'deception',
        'insight',
        'intimidation',
        'investigation',
        'perception',
        'performance',
        'persuasion',
        'sleight of hand',
        'stealth',
      ],
      cleric: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
      ranger: [
        'animal handling',
        'athletics',
        'insight',
        'investigation',
        'nature',
        'perception',
        'stealth',
        'survival',
      ],
      paladin: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
      barbarian: [
        'animal handling',
        'athletics',
        'intimidation',
        'nature',
        'perception',
        'survival',
      ],
      monk: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
      druid: [
        'animal handling',
        'arcana',
        'insight',
        'medicine',
        'nature',
        'perception',
        'religion',
        'survival',
      ],
      warlock: [
        'arcana',
        'deception',
        'history',
        'intimidation',
        'investigation',
        'nature',
        'religion',
      ],
      sorcerer: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
      bard: [
        'acrobatics',
        'animal handling',
        'arcana',
        'athletics',
        'deception',
        'history',
        'insight',
        'intimidation',
        'investigation',
        'medicine',
        'nature',
        'perception',
        'performance',
        'persuasion',
        'religion',
        'sleight of hand',
        'stealth',
        'survival',
      ],
    };

    const proficientSkills = classSkills[characterClass.toLowerCase()] || [
      'athletics',
      'perception',
    ];

    allSkills.forEach(skill => {
      skills[skill] = {
        proficient: proficientSkills.includes(skill),
        expertise: false,
        modifier: 0,
      };
    });

    return skills;
  }

  /**
   * Update a character's current location
   */
  async updateCharacterLocation(
    characterId: string,
    locationId: string,
    locationName: string
  ): Promise<ICharacter | null> {
    try {
      const updatedCharacter = await Character.findByIdAndUpdate(
        characterId,
        {
          currentLocation: {
            locationId,
            locationName,
            arrivedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      );

      if (updatedCharacter) {
        logger.info('Character location updated successfully', {
          characterId: updatedCharacter._id,
          characterName: updatedCharacter.name,
          locationId,
          locationName,
        });
      }

      return updatedCharacter;
    } catch (error) {
      logger.error('Error updating character location:', error);
      throw error;
    }
  }

  /**
   * Get character by ID
   */
  public async getCharacter(characterId: string): Promise<ICharacter | null> {
    try {
      // Try to get from cache first
      const cacheKey = `character:${characterId}`;
      const cached = await cacheService.get<ICharacter>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for character: ${characterId}`);
        return cached;
      }

      // If not in cache, get from database
      const character = await Character.findById(characterId);

      if (character) {
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, character, { ttl: 300 });
        logger.debug(`Cached character: ${characterId}`);
      }

      return character;
    } catch (error) {
      logger.error('Error getting character:', error);
      throw error;
    }
  }

  public async getCharactersByCampaign(campaignId: string): Promise<ICharacter[]> {
    try {
      // Try to get from cache first
      const cacheKey = `characters:campaign:${campaignId}`;
      const cached = await cacheService.get<ICharacter[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for characters by campaign: ${campaignId}`);
        return cached;
      }

      // If not in cache, get from database
      const characters = await Character.find({ campaignId, isActive: true });

      // Cache the result for 3 minutes
      await cacheService.set(cacheKey, characters, { ttl: 180 });
      logger.debug(`Cached characters for campaign: ${campaignId}`);

      return characters;
    } catch (error) {
      logger.error('Error getting characters by campaign:', error);
      throw error;
    }
  }

  public async getCharactersBySession(sessionId: string): Promise<ICharacter[]> {
    try {
      // Try to get from cache first
      const cacheKey = `characters:session:${sessionId}`;
      const cached = await cacheService.get<ICharacter[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for characters by session: ${sessionId}`);
        return cached;
      }

      // If not in cache, get from database
      // Note: sessionId is now optional, so we need to handle characters without sessions
      const characters = await Character.find({
        $or: [
          { sessionId, isActive: true },
          { sessionId: { $exists: false }, isActive: true },
        ],
      });

      // Cache the result for 3 minutes
      await cacheService.set(cacheKey, characters, { ttl: 180 });
      logger.debug(`Cached characters for session: ${sessionId}`);

      return characters;
    } catch (error) {
      logger.error('Error getting characters by session:', error);
      throw error;
    }
  }

  public async getCharacterByName(name: string, campaignId: string): Promise<ICharacter | null> {
    try {
      // Try to get from cache first
      const cacheKey = `character:name:${name}:campaign:${campaignId}`;
      const cached = await cacheService.get<ICharacter>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for character by name: ${name} in campaign: ${campaignId}`);
        return cached;
      }

      // If not in cache, get from database
      const character = await Character.findOne({ name, campaignId, isActive: true });

      if (character) {
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, character, { ttl: 300 });
        logger.debug(`Cached character by name: ${name} in campaign: ${campaignId}`);
      }

      return character;
    } catch (error) {
      logger.error('Error getting character by name:', error);
      throw error;
    }
  }

  public async updateCharacter(
    characterId: string,
    updateData: CharacterUpdateData
  ): Promise<ICharacter | null> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof CharacterUpdateData] !== undefined) {
          (character as any)[key] = updateData[key as keyof CharacterUpdateData];
        }
      });

      await character.save();

      // Invalidate related cache
      await this.invalidateCharacterCache(
        characterId,
        character.campaignId.toString(),
        character.sessionId
      );

      logger.info(`Updated character: ${character.name}`);
      return character;
    } catch (error) {
      logger.error('Error updating character:', error);
      throw error;
    }
  }

  /**
   * Update character details as the campaign progresses
   */
  public async updateCharacterProgress(
    characterId: string,
    updates: {
      experience?: number;
      level?: number;
      hitPoints?: any;
      equipment?: any;
      personality?: any;
      aiPersonality?: any;
    }
  ): Promise<ICharacter | null> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return null;
      }

      // Update fields if provided
      if (updates.experience !== undefined) {
        character.experience = updates.experience;
      }
      if (updates.level !== undefined) {
        character.level = updates.level;
      }
      if (updates.hitPoints !== undefined) {
        character.hitPoints = updates.hitPoints;
      }
      if (updates.equipment !== undefined) {
        character.equipment = updates.equipment;
      }
      if (updates.personality !== undefined) {
        character.personality = updates.personality;
      }
      if (updates.aiPersonality !== undefined) {
        character.aiPersonality = updates.aiPersonality;
      }

      await character.save();

      // Invalidate related cache
      await this.invalidateCharacterCache(
        characterId,
        character.campaignId.toString(),
        character.sessionId
      );

      logger.info(`Updated character progress: ${character.name}`);
      return character;
    } catch (error) {
      logger.error('Error updating character progress:', error);
      throw error;
    }
  }

  // Private method to invalidate character-related cache
  private async invalidateCharacterCache(
    characterId: string,
    campaignId: string,
    sessionId?: string
  ): Promise<void> {
    try {
      const patterns = [
        `character:${characterId}`,
        `characters:campaign:${campaignId}`,
        `character:name:*:campaign:${campaignId}`,
      ];

      // Only add session cache invalidation if sessionId exists
      if (sessionId) {
        patterns.push(`characters:session:${sessionId}`);
      }

      for (const pattern of patterns) {
        await cacheService.deletePattern(pattern);
      }

      logger.debug(`Cache invalidated for character: ${characterId}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache for character ${characterId}:`, error);
    }
  }

  public async deleteCharacter(characterId: string): Promise<void> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Soft delete - mark as inactive
      character.isActive = false;
      await character.save();

      // Remove from active sessions
      await Session.updateMany(
        { 'gameState.activeCharacters': characterId },
        { $pull: { 'gameState.activeCharacters': characterId } }
      );

      logger.info(`Deleted character: ${character.name}`);
    } catch (error) {
      logger.error('Error deleting character:', error);
      throw error;
    }
  }

  public async hardDeleteCharacter(characterId: string): Promise<void> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Import required models for cascading delete
      const { Session, Location } = require('../models');

      // Remove character from all related data
      await Promise.all([
        // Remove from active sessions
        Session.updateMany(
          { 'gameState.activeCharacters': characterId },
          { $pull: { 'gameState.activeCharacters': characterId } }
        ),

        // Remove from session participants
        Session.updateMany(
          { 'metadata.players.characterId': characterId },
          { $pull: { 'metadata.players': { characterId } } }
        ),

        // Remove from locations
        Location.updateMany(
          { currentOccupants: character.name },
          { $pull: { currentOccupants: character.name } }
        ),

        // Remove from discovered locations
        Location.updateMany(
          { discoveredBy: character.name },
          { $pull: { discoveredBy: character.name } }
        ),

        // Finally delete the character itself
        Character.findByIdAndDelete(characterId),
      ]);

      logger.info(`Hard deleted character: ${character.name} and all related data`);
    } catch (error) {
      logger.error('Error hard deleting character:', error);
      throw error;
    }
  }

  public async levelUpCharacter(characterId: string): Promise<ICharacter | null> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      if (character.level >= 20) {
        throw new Error('Character is already at maximum level');
      }

      // Increase level
      character.level += 1;

      // Increase hit points
      const conModifier = Math.floor((character.attributes.constitution - 10) / 2);
      const classHitDice: { [key: string]: number } = {
        barbarian: 12,
        fighter: 10,
        paladin: 10,
        ranger: 10,
        warlock: 8,
        wizard: 6,
        sorcerer: 6,
        monk: 8,
        rogue: 8,
        druid: 8,
        cleric: 8,
        bard: 8,
      };

      const hitDie = classHitDice[character.class.toLowerCase()] || 8;
      const newHP = Math.floor(hitDie / 2) + 1 + conModifier;
      character.hitPoints.maximum += Math.max(1, newHP);
      character.hitPoints.current = character.hitPoints.maximum;

      await character.save();
      logger.info(`Character ${character.name} leveled up to level ${character.level}`);
      return character;
    } catch (error) {
      logger.error('Error leveling up character:', error);
      throw error;
    }
  }

  public async addExperience(characterId: string, experience: number): Promise<ICharacter | null> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      character.experience += experience;

      // Check for level up
      const newLevel = this.calculateLevel(character.experience);
      if (newLevel > character.level) {
        character.level = newLevel;
        logger.info(
          `Character ${character.name} leveled up to level ${character.level} from experience`
        );
      }

      await character.save();
      return character;
    } catch (error) {
      logger.error('Error adding experience:', error);
      throw error;
    }
  }

  private calculateLevel(experience: number): number {
    // D&D 5e experience thresholds
    const levelThresholds = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000,
      165000, 195000, 225000, 265000, 305000, 355000,
    ];

    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (experience >= levelThresholds[i]!) {
        return i + 1;
      }
    }

    return 1;
  }
}

export default CharacterService;
