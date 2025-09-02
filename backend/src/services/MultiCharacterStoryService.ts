import logger from './LoggerService';
import LLMClientFactory from './LLMClientFactory';
import { ModelSelectionService } from './ModelSelectionService';
import { PerformanceTracker } from './PerformanceTracker';
import { Types } from 'mongoose';
import Character from '../models/Character';
import { IStoryArc } from '../models/StoryArc';

export interface CharacterRelationship {
  characterId: string;
  targetCharacterId: string;
  relationshipType:
    | 'friend'
    | 'ally'
    | 'rival'
    | 'enemy'
    | 'mentor'
    | 'student'
    | 'family'
    | 'romantic'
    | 'neutral';
  strength: number; // 1-10 scale
  description: string;
  history: string[];
  lastInteraction: Date;
  mutualInfluence: number; // How much they influence each other
}

export interface CharacterInteraction {
  id: string;
  characterIds: string[];
  interactionType: 'dialogue' | 'conflict' | 'cooperation' | 'competition' | 'bonding' | 'betrayal';
  context: string;
  outcome: string;
  relationshipChanges: Array<{
    characterId: string;
    targetCharacterId: string;
    change: number; // -5 to +5
    reason: string;
  }>;
  storyImpact: string;
  timestamp: Date;
}

export interface CharacterSubplot {
  id: string;
  characterId: string;
  title: string;
  description: string;
  type:
    | 'personal_growth'
    | 'relationship_development'
    | 'skill_advancement'
    | 'backstory_revelation'
    | 'conflict_resolution';
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  relatedCharacters: string[];
  storyIntegration: {
    mainStoryConnection: string;
    impactOnMainStory: string;
    triggers: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupDynamics {
  campaignId: string;
  groupCohesion: number; // 1-10 scale
  leadership: {
    primaryLeader?: string;
    secondaryLeaders: string[];
    leadershipStyle: 'democratic' | 'autocratic' | 'laissez-faire' | 'situational';
  };
  communication: {
    openCommunication: number; // 1-10 scale
    conflictResolution: number; // 1-10 scale
    informationSharing: number; // 1-10 scale
  };
  roles: Record<string, string[]>; // characterId -> roles
  tensions: Array<{
    characterIds: string[];
    tensionType: string;
    severity: number; // 1-10 scale
    description: string;
    resolution?: string;
  }>;
  lastUpdated: Date;
}

export interface CharacterInfluence {
  characterId: string;
  influenceAreas: {
    decisionMaking: number; // 1-10 scale
    storyDirection: number; // 1-10 scale
    groupDynamics: number; // 1-10 scale
    worldBuilding: number; // 1-10 scale
  };
  influenceHistory: Array<{
    area: string;
    change: number;
    reason: string;
    timestamp: Date;
  }>;
  lastUpdated: Date;
}

export class MultiCharacterStoryService {
  private geminiClient: any;
  private modelSelectionService: ModelSelectionService;
  private performanceTracker: PerformanceTracker;

  // In-memory storage for relationships and interactions
  private characterRelationships: Map<string, CharacterRelationship[]> = new Map();
  private characterInteractions: Map<string, CharacterInteraction[]> = new Map();
  private characterSubplots: Map<string, CharacterSubplot[]> = new Map();
  private groupDynamics: Map<string, GroupDynamics> = new Map();
  private characterInfluences: Map<string, CharacterInfluence[]> = new Map();

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.modelSelectionService = ModelSelectionService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
  }

  /**
   * Initialize multi-character story system for a campaign
   */
  async initializeMultiCharacterStory(campaignId: string, characterIds: string[]): Promise<void> {
    try {
      logger.info('Initializing multi-character story system', {
        campaignId,
        characterCount: characterIds.length,
      });

      // Initialize group dynamics
      await this.initializeGroupDynamics(campaignId, characterIds);

      // Initialize character relationships
      await this.initializeCharacterRelationships(campaignId, characterIds);

      // Initialize character influences
      await this.initializeCharacterInfluences(campaignId, characterIds);

      // Generate initial subplots
      await this.generateInitialSubplots(campaignId, characterIds);

      logger.info('Multi-character story system initialized successfully', { campaignId });
    } catch (error) {
      logger.error('Error initializing multi-character story system:', error);
      throw error;
    }
  }

  /**
   * Initialize group dynamics for the campaign
   */
  private async initializeGroupDynamics(campaignId: string, characterIds: string[]): Promise<void> {
    const groupDynamics: GroupDynamics = {
      campaignId,
      groupCohesion: 5, // Start neutral
      leadership: {
        secondaryLeaders: [],
        leadershipStyle: 'democratic',
      },
      communication: {
        openCommunication: 5,
        conflictResolution: 5,
        informationSharing: 5,
      },
      roles: {},
      tensions: [],
      lastUpdated: new Date(),
    };

    // Assign initial roles based on character classes/types
    for (const characterId of characterIds) {
      try {
        const character = await Character.findById(characterId);
        if (character) {
          const roles = this.determineCharacterRoles(character);
          groupDynamics.roles[characterId] = roles;
        }
      } catch (error) {
        logger.error('Error fetching character for role assignment:', error);
      }
    }

    this.groupDynamics.set(campaignId, groupDynamics);
  }

  /**
   * Determine character roles based on character data
   */
  private determineCharacterRoles(character: any): string[] {
    const roles: string[] = [];

    // Base roles on character class
    if (character.class) {
      switch (character.class.toLowerCase()) {
        case 'fighter':
        case 'paladin':
        case 'barbarian':
          roles.push('tank', 'combat_leader');
          break;
        case 'rogue':
        case 'ranger':
          roles.push('scout', 'stealth_specialist');
          break;
        case 'wizard':
        case 'sorcerer':
        case 'warlock':
          roles.push('spellcaster', 'knowledge_keeper');
          break;
        case 'cleric':
        case 'druid':
          roles.push('healer', 'spiritual_guide');
          break;
        case 'bard':
          roles.push('face', 'entertainer', 'diplomat');
          break;
      }
    }

    // Add personality-based roles
    if (character.personality) {
      if (
        character.personality.includes('charismatic') ||
        character.personality.includes('leader')
      ) {
        roles.push('leader');
      }
      if (
        character.personality.includes('wise') ||
        character.personality.includes('knowledgeable')
      ) {
        roles.push('advisor');
      }
      if (
        character.personality.includes('protective') ||
        character.personality.includes('caring')
      ) {
        roles.push('protector');
      }
    }

    return roles.length > 0 ? roles : ['generalist'];
  }

  /**
   * Initialize character relationships
   */
  private async initializeCharacterRelationships(
    campaignId: string,
    characterIds: string[]
  ): Promise<void> {
    const relationships: CharacterRelationship[] = [];

    // Generate initial relationships between characters
    for (let i = 0; i < characterIds.length; i++) {
      for (let j = i + 1; j < characterIds.length; j++) {
        const relationship = await this.generateInitialRelationship(
          characterIds[i],
          characterIds[j]
        );
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }

    this.characterRelationships.set(campaignId, relationships);
  }

  /**
   * Generate initial relationship between two characters
   */
  private async generateInitialRelationship(
    characterId1: string,
    characterId2: string
  ): Promise<CharacterRelationship | null> {
    try {
      const [character1, character2] = await Promise.all([
        Character.findById(characterId1),
        Character.findById(characterId2),
      ]);

      if (!character1 || !character2) {
        return null;
      }

      // Use LLM to determine initial relationship
      const prompt = `Determine the initial relationship between these two characters:

Character 1: ${character1.name}
Class: ${character1.class}
Personality: ${character1.personality}
Background: ${character1.personality.background}

Character 2: ${character2.name}
Class: ${character2.class}
Personality: ${character2.personality}
Background: ${character2.personality.background}

Determine their initial relationship type, strength (1-10), and a brief description. Consider their classes, personalities, and backgrounds.

Return as JSON:
{
  "relationshipType": "friend|ally|rival|enemy|mentor|student|family|romantic|neutral",
  "strength": number,
  "description": "string",
  "mutualInfluence": number
}`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'relationship_generation',
        temperature: 0.7,
        maxTokens: 300,
        forceModel: 'flash',
      });

      if (response.success) {
        try {
          const relationshipData = JSON.parse(response.content);
          return {
            characterId: characterId1,
            targetCharacterId: characterId2,
            relationshipType: relationshipData.relationshipType || 'neutral',
            strength: relationshipData.strength || 5,
            description: relationshipData.description || 'Initial relationship',
            history: [],
            lastInteraction: new Date(),
            mutualInfluence: relationshipData.mutualInfluence || 3,
          };
        } catch (parseError) {
          logger.error('Error parsing relationship response:', parseError);
        }
      }
    } catch (error) {
      logger.error('Error generating initial relationship:', error);
    }

    // Fallback to neutral relationship
    return {
      characterId: characterId1,
      targetCharacterId: characterId2,
      relationshipType: 'neutral',
      strength: 5,
      description: 'Initial neutral relationship',
      history: [],
      lastInteraction: new Date(),
      mutualInfluence: 3,
    };
  }

  /**
   * Initialize character influences
   */
  private async initializeCharacterInfluences(
    campaignId: string,
    characterIds: string[]
  ): Promise<void> {
    const influences: CharacterInfluence[] = [];

    for (const characterId of characterIds) {
      const influence: CharacterInfluence = {
        characterId,
        influenceAreas: {
          decisionMaking: 5,
          storyDirection: 5,
          groupDynamics: 5,
          worldBuilding: 5,
        },
        influenceHistory: [],
        lastUpdated: new Date(),
      };

      influences.push(influence);
    }

    this.characterInfluences.set(campaignId, influences);
  }

  /**
   * Generate initial subplots for characters
   */
  private async generateInitialSubplots(campaignId: string, characterIds: string[]): Promise<void> {
    const subplots: CharacterSubplot[] = [];

    for (const characterId of characterIds) {
      try {
        const character = await Character.findById(characterId);
        if (character) {
          const subplot = await this.generateCharacterSubplot(characterId, character);
          if (subplot) {
            subplots.push(subplot);
          }
        }
      } catch (error) {
        logger.error('Error generating subplot for character:', error);
      }
    }

    this.characterSubplots.set(campaignId, subplots);
  }

  /**
   * Generate a subplot for a specific character
   */
  private async generateCharacterSubplot(
    characterId: string,
    character: any
  ): Promise<CharacterSubplot | null> {
    try {
      const prompt = `Create a character subplot for this character:

Name: ${character.name}
Class: ${character.class}
Personality: ${character.personality}
Background: ${character.personality.background}

Generate a subplot that:
1. Fits the character's personality and background
2. Has potential for growth and development
3. Can integrate with a main story
4. Involves other characters when appropriate

Return as JSON:
{
  "title": "string",
  "description": "string",
  "type": "personal_growth|relationship_development|skill_advancement|backstory_revelation|conflict_resolution",
  "milestones": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "relatedCharacters": ["characterId1", "characterId2"],
  "mainStoryConnection": "string",
  "impactOnMainStory": "string"
}`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'subplot_generation',
        temperature: 0.8,
        maxTokens: 500,
        forceModel: 'flash',
      });

      if (response.success) {
        try {
          const subplotData = JSON.parse(response.content);
          return {
            id: `subplot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            characterId,
            title: subplotData.title,
            description: subplotData.description,
            type: subplotData.type || 'personal_growth',
            status: 'active',
            milestones: subplotData.milestones.map((m: any, index: number) => ({
              id: `milestone_${index}`,
              title: m.title,
              description: m.description,
              completed: false,
            })),
            relatedCharacters: subplotData.relatedCharacters || [],
            storyIntegration: {
              mainStoryConnection: subplotData.mainStoryConnection,
              impactOnMainStory: subplotData.impactOnMainStory,
              triggers: [],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        } catch (parseError) {
          logger.error('Error parsing subplot response:', parseError);
        }
      }
    } catch (error) {
      logger.error('Error generating character subplot:', error);
    }

    return null;
  }

  /**
   * Record a character interaction
   */
  async recordCharacterInteraction(
    campaignId: string,
    interaction: Omit<CharacterInteraction, 'id' | 'timestamp'>
  ): Promise<CharacterInteraction> {
    const fullInteraction: CharacterInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    if (!this.characterInteractions.has(campaignId)) {
      this.characterInteractions.set(campaignId, []);
    }

    const interactions = this.characterInteractions.get(campaignId)!;
    interactions.push(fullInteraction);

    // Update relationships based on interaction
    await this.updateRelationshipsFromInteraction(campaignId, fullInteraction);

    // Update group dynamics
    await this.updateGroupDynamicsFromInteraction(campaignId, fullInteraction);

    // Update character influences
    await this.updateCharacterInfluencesFromInteraction(campaignId, fullInteraction);

    logger.info('Character interaction recorded', {
      campaignId,
      interactionId: fullInteraction.id,
      characterCount: interaction.characterIds.length,
      type: interaction.interactionType,
    });

    return fullInteraction;
  }

  /**
   * Update relationships based on interaction
   */
  private async updateRelationshipsFromInteraction(
    campaignId: string,
    interaction: CharacterInteraction
  ): Promise<void> {
    const relationships = this.characterRelationships.get(campaignId) || [];

    for (const change of interaction.relationshipChanges) {
      const relationship = relationships.find(
        r =>
          (r.characterId === change.characterId &&
            r.targetCharacterId === change.targetCharacterId) ||
          (r.characterId === change.targetCharacterId && r.targetCharacterId === change.characterId)
      );

      if (relationship) {
        // Update relationship strength
        relationship.strength = Math.max(1, Math.min(10, relationship.strength + change.change));

        // Add to history
        relationship.history.push(
          `${interaction.timestamp.toISOString()}: ${change.reason} (${change.change > 0 ? '+' : ''}${change.change})`
        );

        // Update last interaction
        relationship.lastInteraction = interaction.timestamp;

        // Update relationship type if strength changes significantly
        if (relationship.strength <= 2) {
          relationship.relationshipType = 'enemy';
        } else if (relationship.strength >= 8) {
          relationship.relationshipType = 'friend';
        }
      }
    }

    this.characterRelationships.set(campaignId, relationships);
  }

  /**
   * Update group dynamics based on interaction
   */
  private async updateGroupDynamicsFromInteraction(
    campaignId: string,
    interaction: CharacterInteraction
  ): Promise<void> {
    const groupDynamics = this.groupDynamics.get(campaignId);
    if (!groupDynamics) return;

    // Update communication metrics based on interaction type
    switch (interaction.interactionType) {
      case 'dialogue':
      case 'cooperation':
        groupDynamics.communication.openCommunication = Math.min(
          10,
          groupDynamics.communication.openCommunication + 0.5
        );
        groupDynamics.communication.informationSharing = Math.min(
          10,
          groupDynamics.communication.informationSharing + 0.3
        );
        break;
      case 'conflict':
        groupDynamics.communication.openCommunication = Math.max(
          1,
          groupDynamics.communication.openCommunication - 0.5
        );
        groupDynamics.communication.conflictResolution = Math.min(
          10,
          groupDynamics.communication.conflictResolution + 0.2
        );
        break;
      case 'betrayal':
        groupDynamics.groupCohesion = Math.max(1, groupDynamics.groupCohesion - 2);
        groupDynamics.communication.openCommunication = Math.max(
          1,
          groupDynamics.communication.openCommunication - 1
        );
        break;
      case 'bonding':
        groupDynamics.groupCohesion = Math.min(10, groupDynamics.groupCohesion + 1);
        groupDynamics.communication.openCommunication = Math.min(
          10,
          groupDynamics.communication.openCommunication + 0.5
        );
        break;
    }

    groupDynamics.lastUpdated = new Date();
    this.groupDynamics.set(campaignId, groupDynamics);
  }

  /**
   * Update character influences based on interaction
   */
  private async updateCharacterInfluencesFromInteraction(
    campaignId: string,
    interaction: CharacterInteraction
  ): Promise<void> {
    const influences = this.characterInfluences.get(campaignId) || [];

    for (const characterId of interaction.characterIds) {
      const influence = influences.find(i => i.characterId === characterId);
      if (influence) {
        // Update influence based on interaction type and outcome
        const influenceChange = this.calculateInfluenceChange(interaction, characterId);

        influence.influenceAreas.decisionMaking = Math.max(
          1,
          Math.min(10, influence.influenceAreas.decisionMaking + influenceChange.decisionMaking)
        );
        influence.influenceAreas.storyDirection = Math.max(
          1,
          Math.min(10, influence.influenceAreas.storyDirection + influenceChange.storyDirection)
        );
        influence.influenceAreas.groupDynamics = Math.max(
          1,
          Math.min(10, influence.influenceAreas.groupDynamics + influenceChange.groupDynamics)
        );
        influence.influenceAreas.worldBuilding = Math.max(
          1,
          Math.min(10, influence.influenceAreas.worldBuilding + influenceChange.worldBuilding)
        );

        // Record influence change
        influence.influenceHistory.push({
          area: 'interaction',
          change: Object.values(influenceChange).reduce((sum, val) => sum + val, 0),
          reason: `${interaction.interactionType}: ${interaction.outcome}`,
          timestamp: interaction.timestamp,
        });

        influence.lastUpdated = new Date();
      }
    }

    this.characterInfluences.set(campaignId, influences);
  }

  /**
   * Calculate influence change based on interaction
   */
  private calculateInfluenceChange(
    interaction: CharacterInteraction,
    characterId: string
  ): {
    decisionMaking: number;
    storyDirection: number;
    groupDynamics: number;
    worldBuilding: number;
  } {
    const change = {
      decisionMaking: 0,
      storyDirection: 0,
      groupDynamics: 0,
      worldBuilding: 0,
    };

    switch (interaction.interactionType) {
      case 'dialogue':
        change.decisionMaking = 0.2;
        change.groupDynamics = 0.1;
        break;
      case 'conflict':
        change.decisionMaking = 0.3;
        change.groupDynamics = -0.2;
        break;
      case 'cooperation':
        change.decisionMaking = 0.1;
        change.groupDynamics = 0.3;
        change.storyDirection = 0.1;
        break;
      case 'competition':
        change.decisionMaking = 0.2;
        change.groupDynamics = -0.1;
        break;
      case 'bonding':
        change.groupDynamics = 0.4;
        change.storyDirection = 0.2;
        break;
      case 'betrayal':
        change.groupDynamics = -0.5;
        change.storyDirection = 0.3;
        break;
    }

    return change;
  }

  /**
   * Get character relationships for a campaign
   */
  getCharacterRelationships(campaignId: string): CharacterRelationship[] {
    return this.characterRelationships.get(campaignId) || [];
  }

  /**
   * Get character interactions for a campaign
   */
  getCharacterInteractions(campaignId: string): CharacterInteraction[] {
    return this.characterInteractions.get(campaignId) || [];
  }

  /**
   * Get character subplots for a campaign
   */
  getCharacterSubplots(campaignId: string): CharacterSubplot[] {
    return this.characterSubplots.get(campaignId) || [];
  }

  /**
   * Get group dynamics for a campaign
   */
  getGroupDynamics(campaignId: string): GroupDynamics | null {
    return this.groupDynamics.get(campaignId) || null;
  }

  /**
   * Get character influences for a campaign
   */
  getCharacterInfluences(campaignId: string): CharacterInfluence[] {
    return this.characterInfluences.get(campaignId) || [];
  }

  /**
   * Update a character subplot
   */
  async updateCharacterSubplot(
    campaignId: string,
    subplotId: string,
    updates: Partial<CharacterSubplot>
  ): Promise<boolean> {
    const subplots = this.characterSubplots.get(campaignId) || [];
    const subplotIndex = subplots.findIndex(s => s.id === subplotId);

    if (subplotIndex === -1) {
      return false;
    }

    subplots[subplotIndex] = {
      ...subplots[subplotIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.characterSubplots.set(campaignId, subplots);
    return true;
  }

  /**
   * Complete a subplot milestone
   */
  async completeSubplotMilestone(
    campaignId: string,
    subplotId: string,
    milestoneId: string
  ): Promise<boolean> {
    const subplots = this.characterSubplots.get(campaignId) || [];
    const subplot = subplots.find(s => s.id === subplotId);

    if (!subplot) {
      return false;
    }

    const milestone = subplot.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return false;
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    subplot.updatedAt = new Date();

    // Check if all milestones are completed
    const allCompleted = subplot.milestones.every(m => m.completed);
    if (allCompleted) {
      subplot.status = 'completed';
    }

    return true;
  }

  /**
   * Get relationship between two characters
   */
  getCharacterRelationship(
    campaignId: string,
    characterId1: string,
    characterId2: string
  ): CharacterRelationship | null {
    const relationships = this.characterRelationships.get(campaignId) || [];
    return (
      relationships.find(
        r =>
          (r.characterId === characterId1 && r.targetCharacterId === characterId2) ||
          (r.characterId === characterId2 && r.targetCharacterId === characterId1)
      ) || null
    );
  }

  /**
   * Analyze group dynamics and provide recommendations
   */
  async analyzeGroupDynamics(campaignId: string): Promise<{
    analysis: string;
    recommendations: string[];
    concerns: string[];
    strengths: string[];
  }> {
    const groupDynamics = this.groupDynamics.get(campaignId);
    const relationships = this.characterRelationships.get(campaignId) || [];
    const interactions = this.characterInteractions.get(campaignId) || [];

    if (!groupDynamics) {
      return {
        analysis: 'No group dynamics data available',
        recommendations: [],
        concerns: [],
        strengths: [],
      };
    }

    const analysis = `Group Cohesion: ${groupDynamics.groupCohesion}/10
Leadership Style: ${groupDynamics.leadership.leadershipStyle}
Open Communication: ${groupDynamics.communication.openCommunication}/10
Conflict Resolution: ${groupDynamics.communication.conflictResolution}/10
Information Sharing: ${groupDynamics.communication.informationSharing}/10

Total Relationships: ${relationships.length}
Recent Interactions: ${
      interactions.filter(i => Date.now() - i.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000).length
    } in last week`;

    const recommendations: string[] = [];
    const concerns: string[] = [];
    const strengths: string[] = [];

    // Analyze cohesion
    if (groupDynamics.groupCohesion < 4) {
      concerns.push('Low group cohesion - consider team-building activities');
    } else if (groupDynamics.groupCohesion > 7) {
      strengths.push('High group cohesion - team works well together');
    }

    // Analyze communication
    if (groupDynamics.communication.openCommunication < 4) {
      concerns.push('Poor communication - encourage more dialogue');
      recommendations.push('Create opportunities for character interaction');
    } else if (groupDynamics.communication.openCommunication > 7) {
      strengths.push('Excellent communication within the group');
    }

    // Analyze conflict resolution
    if (groupDynamics.communication.conflictResolution < 4) {
      concerns.push('Poor conflict resolution - conflicts may escalate');
      recommendations.push('Introduce conflict resolution scenarios');
    } else if (groupDynamics.communication.conflictResolution > 7) {
      strengths.push('Strong conflict resolution skills');
    }

    // Analyze tensions
    if (groupDynamics.tensions.length > 0) {
      concerns.push(`${groupDynamics.tensions.length} active tensions in the group`);
      recommendations.push('Address existing tensions through story events');
    }

    return {
      analysis,
      recommendations,
      concerns,
      strengths,
    };
  }

  /**
   * Generate story suggestions based on character dynamics
   */
  async generateStorySuggestions(campaignId: string): Promise<{
    characterFocused: string[];
    relationshipFocused: string[];
    groupFocused: string[];
    subplotFocused: string[];
  }> {
    const relationships = this.characterRelationships.get(campaignId) || [];
    const subplots = this.characterSubplots.get(campaignId) || [];
    const groupDynamics = this.groupDynamics.get(campaignId);

    const characterFocused: string[] = [];
    const relationshipFocused: string[] = [];
    const groupFocused: string[] = [];
    const subplotFocused: string[] = [];

    // Character-focused suggestions
    const activeSubplots = subplots.filter(s => s.status === 'active');
    for (const subplot of activeSubplots) {
      characterFocused.push(`Develop ${subplot.title} subplot for character growth`);
    }

    // Relationship-focused suggestions
    const strongRelationships = relationships.filter(r => r.strength >= 7);
    const weakRelationships = relationships.filter(r => r.strength <= 3);

    for (const relationship of strongRelationships) {
      relationshipFocused.push(
        `Explore the strong ${relationship.relationshipType} relationship between characters`
      );
    }

    for (const relationship of weakRelationships) {
      relationshipFocused.push(
        `Address the strained ${relationship.relationshipType} relationship`
      );
    }

    // Group-focused suggestions
    if (groupDynamics) {
      if (groupDynamics.groupCohesion < 5) {
        groupFocused.push('Create team-building scenarios to improve group cohesion');
      }
      if (groupDynamics.communication.openCommunication < 5) {
        groupFocused.push('Introduce scenarios that require group communication');
      }
      if (groupDynamics.tensions.length > 0) {
        groupFocused.push('Resolve existing group tensions through story events');
      }
    }

    // Subplot-focused suggestions
    for (const subplot of activeSubplots) {
      const incompleteMilestones = subplot.milestones.filter(m => !m.completed);
      if (incompleteMilestones.length > 0) {
        subplotFocused.push(
          `Progress the ${subplot.title} subplot: ${incompleteMilestones[0].title}`
        );
      }
    }

    return {
      characterFocused,
      relationshipFocused,
      groupFocused,
      subplotFocused,
    };
  }
}

export default MultiCharacterStoryService;
