import logger from './LoggerService';
import { ContextManager } from './ContextManager';

export interface CharacterMemory {
  id: string;
  characterId: string;
  title: string;
  description: string;
  type:
    | 'combat'
    | 'social'
    | 'exploration'
    | 'achievement'
    | 'failure'
    | 'discovery'
    | 'relationship';
  importance: number; // 1-10 scale
  timestamp: Date;
  associatedCharacters: string[];
  location: string;
  emotionalImpact: 'positive' | 'negative' | 'neutral' | 'mixed';
  archived: boolean;
}

export interface CharacterRelationship {
  characterId: string;
  targetCharacterId: string;
  relationshipType:
    | 'ally'
    | 'enemy'
    | 'mentor'
    | 'student'
    | 'friend'
    | 'rival'
    | 'family'
    | 'romantic'
    | 'neutral';
  strength: number; // -10 to 10 scale
  trust: number; // 0 to 10 scale
  history: string[];
  currentStatus: string;
  lastInteraction: Date;
}

export interface CharacterKnowledge {
  characterId: string;
  category:
    | 'combat'
    | 'magic'
    | 'history'
    | 'geography'
    | 'culture'
    | 'religion'
    | 'nature'
    | 'arcana'
    | 'other';
  topic: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  source: string; // How they learned it
  confidence: number; // 0 to 10 scale
  lastUsed: Date;
  usageCount: number;
}

export interface CharacterDevelopmentNote {
  characterId: string;
  sessionId: string;
  timestamp: Date;
  type: 'growth' | 'challenge' | 'achievement' | 'relationship' | 'goal' | 'fear' | 'motivation';
  title: string;
  description: string;
  impact: 'major' | 'moderate' | 'minor';
  goals: string[];
  fears: string[];
  motivations: string[];
  personalityChanges: string[];
}

export interface CharacterArc {
  characterId: string;
  campaignId: string;
  currentPhase: 'introduction' | 'development' | 'crisis' | 'resolution' | 'transformation';
  phaseDescription: string;
  goals: {
    shortTerm: string[];
    longTerm: string[];
    completed: string[];
  };
  challenges: {
    current: string[];
    overcome: string[];
    failed: string[];
  };
  relationships: {
    developing: string[];
    stable: string[];
    deteriorating: string[];
  };
  lastUpdated: Date;
}

export class CharacterDevelopmentService {
  private contextManager: ContextManager;

  constructor() {
    this.contextManager = new ContextManager();
  }

  /**
   * Add a memory for a character
   */
  async addMemory(memory: Omit<CharacterMemory, 'id' | 'timestamp'>): Promise<CharacterMemory> {
    try {
      const newMemory: CharacterMemory = {
        ...memory,
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      // Add to context for AI awareness
      this.contextManager.addContextLayer(
        memory.characterId, // Using characterId as campaignId for character-specific context
        'character',
        `Memory: ${memory.title} - ${memory.description}`,
        memory.importance
      );

      logger.info('Character memory added', {
        characterId: memory.characterId,
        memoryType: memory.type,
        importance: memory.importance,
      });

      return newMemory;
    } catch (error) {
      logger.error('Error adding character memory:', error);
      throw error;
    }
  }

  /**
   * Get character memories with filtering
   */
  async getCharacterMemories(
    characterId: string,
    options: {
      types?: CharacterMemory['type'][];
      minImportance?: number;
      limit?: number;
      includeArchived?: boolean;
    } = {}
  ): Promise<CharacterMemory[]> {
    try {
      // In a real implementation, this would query a database
      // For now, we'll return an empty array as placeholder
      logger.info('Getting character memories', { characterId, options });
      return [];
    } catch (error) {
      logger.error('Error getting character memories:', error);
      return [];
    }
  }

  /**
   * Update or create a character relationship
   */
  async updateRelationship(
    characterId: string,
    targetCharacterId: string,
    changes: Partial<CharacterRelationship>
  ): Promise<CharacterRelationship> {
    try {
      // In a real implementation, this would update/upsert in database
      const relationship: CharacterRelationship = {
        characterId,
        targetCharacterId,
        relationshipType: changes.relationshipType || 'neutral',
        strength: changes.strength || 0,
        trust: changes.trust || 5,
        history: changes.history || [],
        currentStatus: changes.currentStatus || 'Active',
        lastInteraction: changes.lastInteraction || new Date(),
      };

      // Add relationship change to context
      this.contextManager.addContextLayer(
        characterId,
        'character',
        `Relationship with ${targetCharacterId} updated: ${relationship.relationshipType} (strength: ${relationship.strength}, trust: ${relationship.trust})`,
        6
      );

      logger.info('Character relationship updated', {
        characterId,
        targetCharacterId,
        relationshipType: relationship.relationshipType,
        strength: relationship.strength,
      });

      return relationship;
    } catch (error) {
      logger.error('Error updating character relationship:', error);
      throw error;
    }
  }

  /**
   * Get character relationships
   */
  async getCharacterRelationships(characterId: string): Promise<CharacterRelationship[]> {
    try {
      // In a real implementation, this would query a database
      logger.info('Getting character relationships', { characterId });
      return [];
    } catch (error) {
      logger.error('Error getting character relationships:', error);
      return [];
    }
  }

  /**
   * Add or update character knowledge
   */
  async updateKnowledge(
    knowledge: Omit<CharacterKnowledge, 'lastUsed' | 'usageCount'>
  ): Promise<CharacterKnowledge> {
    try {
      const updatedKnowledge: CharacterKnowledge = {
        ...knowledge,
        lastUsed: new Date(),
        usageCount: 0,
      };

      // Add knowledge gain to context
      this.contextManager.addContextLayer(
        knowledge.characterId,
        'character',
        `Knowledge gained: ${knowledge.topic} (${knowledge.category}, level: ${knowledge.level})`,
        5
      );

      logger.info('Character knowledge updated', {
        characterId: knowledge.characterId,
        topic: knowledge.topic,
        level: knowledge.level,
      });

      return updatedKnowledge;
    } catch (error) {
      logger.error('Error updating character knowledge:', error);
      throw error;
    }
  }

  /**
   * Get character knowledge by category
   */
  async getCharacterKnowledge(
    characterId: string,
    category?: CharacterKnowledge['category']
  ): Promise<CharacterKnowledge[]> {
    try {
      // In a real implementation, this would query a database
      logger.info('Getting character knowledge', { characterId, category });
      return [];
    } catch (error) {
      logger.error('Error getting character knowledge:', error);
      return [];
    }
  }

  /**
   * Add a development note
   */
  async addDevelopmentNote(
    note: Omit<CharacterDevelopmentNote, 'timestamp'>
  ): Promise<CharacterDevelopmentNote> {
    try {
      const newNote: CharacterDevelopmentNote = {
        ...note,
        timestamp: new Date(),
      };

      // Add development note to context
      this.contextManager.addContextLayer(
        note.characterId,
        'character',
        `Development: ${note.title} - ${note.description} (${note.type}, impact: ${note.impact})`,
        7
      );

      logger.info('Character development note added', {
        characterId: note.characterId,
        type: note.type,
        impact: note.impact,
      });

      return newNote;
    } catch (error) {
      logger.error('Error adding development note:', error);
      throw error;
    }
  }

  /**
   * Process story event for character development
   */
  async processStoryEventForCharacter(characterId: string, event: any): Promise<void> {
    try {
      // Analyze event for character development opportunities
      const developmentOpportunities = this.analyzeEventForDevelopment(event, characterId);

      // Add each opportunity to character development
      for (const opportunity of developmentOpportunities) {
        switch (opportunity.type) {
          case 'memory':
            await this.addMemory({
              characterId,
              title: opportunity.title,
              description: opportunity.description,
              type: opportunity.memoryType,
              importance: opportunity.importance,
              associatedCharacters: [],
              location: 'Unknown',
              emotionalImpact: opportunity.emotionalImpact,
              archived: false,
            });
            break;

          case 'relationship':
            await this.addOrUpdateRelationship({
              characterId,
              targetCharacterId: opportunity.targetId,
              relationshipType: opportunity.relationshipType,
              strength: opportunity.strengthChange || 0,
              trust: opportunity.trustChange || 0,
              history: [opportunity.event],
              currentStatus: 'Active',
            });
            break;

          case 'knowledge':
            await this.updateKnowledge({
              characterId,
              category: opportunity.category,
              topic: opportunity.topic,
              level: opportunity.level,
              description: opportunity.description,
              source: opportunity.source,
              confidence: opportunity.confidence,
            });
            break;

          case 'development':
            await this.addDevelopmentNote({
              characterId,
              sessionId: event.sessionId,
              type: opportunity.noteType,
              title: opportunity.title,
              description: opportunity.description,
              impact: opportunity.impact,
              goals: opportunity.goals || [],
              fears: opportunity.fears || [],
              motivations: opportunity.motivations || [],
              personalityChanges: opportunity.personalityChanges || [],
            });
            break;
        }
      }

      logger.info('Story event processed for character development', {
        characterId,
        eventId: event._id,
        opportunitiesFound: developmentOpportunities.length,
      });
    } catch (error) {
      logger.error('Error processing story event for character development:', error);
    }
  }

  /**
   * Analyze a story event for character development opportunities
   */
  private analyzeEventForDevelopment(event: any, characterId: string): any[] {
    const opportunities: any[] = [];

    // Check if character participated in the event
    if (!event.participants?.includes(characterId)) {
      return opportunities;
    }

    // Analyze event type for opportunities
    switch (event.eventType) {
      case 'skill-check':
        opportunities.push({
          type: 'memory',
          memoryType: 'achievement',
          title: `Skill Check: ${event.title}`,
          description: event.description,
          importance: event.importance,
          emotionalImpact: 'positive',
          tags: ['skill-check', 'achievement'],
        });
        break;

      case 'combat':
        opportunities.push({
          type: 'memory',
          memoryType: 'event',
          title: `Combat: ${event.title}`,
          description: event.description,
          importance: event.importance,
          emotionalImpact: event.importance > 7 ? 'negative' : 'neutral',
          tags: ['combat', 'battle'],
        });
        break;

      case 'social':
        opportunities.push({
          type: 'relationship',
          targetId: event.participants.find((id: string) => id !== characterId),
          targetType: 'character',
          relationshipType: 'friend',
          strengthChange: 1,
          trustChange: 1,
          event: event.title,
          impact: 2,
        });
        break;

      case 'discovery':
        opportunities.push({
          type: 'knowledge',
          category: 'location',
          topic: event.location,
          level: 'basic',
          description: `Discovered: ${event.description}`,
          source: 'exploration',
          confidence: 8,
        });
        break;
    }

    return opportunities;
  }

  /**
   * Get character development summary
   */
  async getCharacterDevelopmentSummary(
    characterId: string,
    campaignId: string
  ): Promise<{
    memories: number;
    relationships: number;
    knowledge: number;
    developmentNotes: number;
    currentPhase: string;
    recentGrowth: string[];
  }> {
    try {
      // In a real implementation, this would aggregate data from multiple sources
      logger.info('Getting character development summary', { characterId, campaignId });

      return {
        memories: 0,
        relationships: 0,
        knowledge: 0,
        developmentNotes: 0,
        currentPhase: 'introduction',
        recentGrowth: [],
      };
    } catch (error) {
      logger.error('Error getting character development summary:', error);
      return {
        memories: 0,
        relationships: 0,
        knowledge: 0,
        developmentNotes: 0,
        currentPhase: 'unknown',
        recentGrowth: [],
      };
    }
  }

  /**
   * Get memories for a character
   */
  async getMemories(characterId: string, filters: any = {}): Promise<CharacterMemory[]> {
    try {
      logger.info('Getting character memories', { characterId, filters });
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      logger.error('Error getting character memories:', error);
      return [];
    }
  }

  /**
   * Get relationships for a character
   */
  async getRelationships(characterId: string, filters: any = {}): Promise<CharacterRelationship[]> {
    try {
      logger.info('Getting character relationships', { characterId, filters });
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      logger.error('Error getting character relationships:', error);
      return [];
    }
  }

  /**
   * Add or update a relationship
   */
  async addOrUpdateRelationship(
    relationshipData: Omit<CharacterRelationship, 'lastInteraction'>
  ): Promise<CharacterRelationship> {
    try {
      logger.info('Adding or updating relationship', { relationshipData });
      // In a real implementation, this would save to the database
      const relationship: CharacterRelationship = {
        ...relationshipData,
        lastInteraction: new Date(),
      };
      return relationship;
    } catch (error) {
      logger.error('Error adding or updating relationship:', error);
      throw error;
    }
  }

  /**
   * Get knowledge for a character
   */
  async getKnowledge(characterId: string, filters: any = {}): Promise<CharacterKnowledge[]> {
    try {
      logger.info('Getting character knowledge', { characterId, filters });
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      logger.error('Error getting character knowledge:', error);
      return [];
    }
  }

  /**
   * Add knowledge for a character
   */
  async addKnowledge(
    knowledgeData: Omit<CharacterKnowledge, 'lastUsed' | 'usageCount'>
  ): Promise<CharacterKnowledge> {
    try {
      logger.info('Adding character knowledge', { knowledgeData });
      // In a real implementation, this would save to the database
      const knowledge: CharacterKnowledge = {
        ...knowledgeData,
        lastUsed: new Date(),
        usageCount: 0,
      };
      return knowledge;
    } catch (error) {
      logger.error('Error adding character knowledge:', error);
      throw error;
    }
  }

  /**
   * Get development notes for a character
   */
  async getDevelopmentNotes(
    characterId: string,
    filters: any = {}
  ): Promise<CharacterDevelopmentNote[]> {
    try {
      logger.info('Getting character development notes', { characterId, filters });
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      logger.error('Error getting character development notes:', error);
      return [];
    }
  }

  /**
   * Get character arc
   */
  async getCharacterArc(characterId: string, campaignId: string): Promise<CharacterArc | null> {
    try {
      logger.info('Getting character arc', { characterId, campaignId });
      // In a real implementation, this would query the database
      return null;
    } catch (error) {
      logger.error('Error getting character arc:', error);
      return null;
    }
  }

  /**
   * Update character arc
   */
  async updateCharacterArc(
    characterId: string,
    arcData: Partial<CharacterArc>
  ): Promise<CharacterArc> {
    try {
      logger.info('Updating character arc', { characterId, arcData });
      // In a real implementation, this would update the database
      const arc: CharacterArc = {
        characterId,
        campaignId: '',
        currentPhase: 'introduction',
        phaseDescription: '',
        goals: { shortTerm: [], longTerm: [], completed: [] },
        challenges: { current: [], overcome: [], failed: [] },
        relationships: { developing: [], stable: [], deteriorating: [] },
        lastUpdated: new Date(),
        ...arcData,
      };
      return arc;
    } catch (error) {
      logger.error('Error updating character arc:', error);
      throw error;
    }
  }
}

export default CharacterDevelopmentService;
