import logger from './LoggerService';
import { ContextManager } from './ContextManager';
import { IStoryBeat } from '../models/StoryArc';
import { QuestService, QuestTemplate, GeneratedQuest } from './QuestService';
import { CharacterDevelopmentService } from './CharacterDevelopmentService';

export interface StoryQuestTemplate extends QuestTemplate {
  storyType: 'setup' | 'development' | 'climax' | 'resolution';
  storyBeatConnection: {
    requiredStoryBeat?: string;
    unlocksStoryBeat?: string;
    advancesStoryBeat?: string;
  };
  storyImpact: 'minor' | 'moderate' | 'major' | 'critical';
  characterDevelopmentOpportunities: string[];
  worldStateChanges: string[];
  relationshipImpacts: Array<{
    characterId: string;
    relationshipChange: number;
    relationshipType: string;
  }>;
}

export interface QuestStoryLink {
  questId: string;
  storyBeatId: string;
  linkType: 'prerequisite' | 'unlocks' | 'advances' | 'parallel';
  storyImpact: 'minor' | 'moderate' | 'major' | 'critical';
  characterDevelopment: string[];
  worldChanges: string[];
}

export class QuestStoryIntegrationService {
  private static instance: QuestStoryIntegrationService;
  private contextManager: ContextManager;
  private questService: QuestService;
  private characterDevelopmentService: CharacterDevelopmentService;

  private constructor() {
    this.contextManager = new ContextManager();
    this.questService = QuestService.getInstance();
    this.characterDevelopmentService = new CharacterDevelopmentService();
  }

  public static getInstance(): QuestStoryIntegrationService {
    if (!QuestStoryIntegrationService.instance) {
      QuestStoryIntegrationService.instance = new QuestStoryIntegrationService();
    }
    return QuestStoryIntegrationService.instance;
  }

  /**
   * Create story-integrated quest templates
   */
  createStoryQuestTemplates(): StoryQuestTemplate[] {
    return [
      // Setup Quest Templates
      {
        id: 'story_setup_introduction',
        name: 'Introduction to the Main Plot',
        description: 'A quest that introduces the main story elements and key characters',
        type: 'main',
        storyType: 'setup',
        difficulty: 'easy',
        levelRange: { min: 1, max: 3 },
        objectives: [
          {
            description: 'Meet the quest giver and learn about the main conflict',
            completed: false,
            progress: 0,
            location: 'Starting town',
            npcInteraction: 'Quest giver introduction',
          },
          {
            description: 'Gather initial information about the threat',
            completed: false,
            progress: 0,
            location: 'Library or information source',
            requiredActions: ['research', 'investigation'],
          },
        ],
        rewards: {
          experience: 100,
          gold: 50,
          items: [],
          reputation: [],
        },
        location: 'Starting town',
        questGiver: 'Story NPC',
        tags: ['story', 'setup', 'introduction'],
        storyBeatConnection: {
          unlocksStoryBeat: 'main_plot_introduction',
        },
        storyImpact: 'major',
        characterDevelopmentOpportunities: [
          'First encounter with main antagonist',
          'Introduction to key allies',
          'Discovery of personal connection to plot',
        ],
        worldStateChanges: [
          'Main plot thread introduced',
          'Key locations revealed',
          'Important NPCs established',
        ],
        relationshipImpacts: [
          {
            characterId: 'quest_giver',
            relationshipChange: 2,
            relationshipType: 'trust',
          },
        ],
      },

      // Development Quest Templates
      {
        id: 'story_development_character_growth',
        name: 'Character Development Arc',
        description: 'A quest focused on character growth and relationship building',
        type: 'main',
        storyType: 'development',
        difficulty: 'medium',
        levelRange: { min: 3, max: 6 },
        objectives: [
          {
            description: 'Face a personal challenge or fear',
            completed: false,
            progress: 0,
            requiredActions: ['personal_confrontation'],
          },
          {
            description: 'Help an ally with their own challenge',
            completed: false,
            progress: 0,
            requiredActions: ['support_ally'],
          },
        ],
        rewards: {
          experience: 200,
          gold: 100,
          items: [],
          reputation: [],
        },
        location: 'Various',
        questGiver: 'Party member or ally',
        tags: ['story', 'development', 'character'],
        storyBeatConnection: {
          advancesStoryBeat: 'character_development',
        },
        storyImpact: 'moderate',
        characterDevelopmentOpportunities: [
          'Personal growth milestone',
          'Relationship strengthening',
          'Skill development',
        ],
        worldStateChanges: ['Character relationships deepened', 'Personal stakes raised'],
        relationshipImpacts: [
          {
            characterId: 'ally',
            relationshipChange: 3,
            relationshipType: 'friendship',
          },
        ],
      },

      // Climax Quest Templates
      {
        id: 'story_climax_major_confrontation',
        name: 'Major Story Confrontation',
        description: 'The climactic battle or confrontation with the main antagonist',
        type: 'main',
        storyType: 'climax',
        difficulty: 'deadly',
        levelRange: { min: 8, max: 12 },
        objectives: [
          {
            description: 'Confront the main antagonist',
            completed: false,
            progress: 0,
            requiredActions: ['final_battle', 'confrontation'],
          },
          {
            description: 'Resolve the main conflict',
            completed: false,
            progress: 0,
            requiredActions: ['resolution'],
          },
        ],
        rewards: {
          experience: 1000,
          gold: 500,
          items: [
            {
              name: 'Legendary Item',
              description: 'A powerful artifact from the final confrontation',
              rarity: 'legendary',
              quantity: 1,
            },
          ],
          reputation: [],
        },
        location: 'Final location',
        questGiver: 'Story progression',
        tags: ['story', 'climax', 'final_battle'],
        storyBeatConnection: {
          advancesStoryBeat: 'story_climax',
        },
        storyImpact: 'critical',
        characterDevelopmentOpportunities: [
          'Ultimate test of character growth',
          'Final character arc resolution',
          'Heroic moment achievement',
        ],
        worldStateChanges: [
          'Main conflict resolved',
          'World state permanently changed',
          'New era begins',
        ],
        relationshipImpacts: [
          {
            characterId: 'party_members',
            relationshipChange: 5,
            relationshipType: 'bond',
          },
        ],
      },

      // Resolution Quest Templates
      {
        id: 'story_resolution_epilogue',
        name: 'Story Resolution and Epilogue',
        description: 'Tie up loose ends and show the consequences of the main story',
        type: 'main',
        storyType: 'resolution',
        difficulty: 'easy',
        levelRange: { min: 10, max: 15 },
        objectives: [
          {
            description: 'Deal with remaining loose ends',
            completed: false,
            progress: 0,
            requiredActions: ['cleanup'],
          },
          {
            description: 'Witness the consequences of your actions',
            completed: false,
            progress: 0,
            requiredActions: ['reflection'],
          },
        ],
        rewards: {
          experience: 500,
          gold: 200,
          items: [],
          reputation: [],
        },
        location: 'Various',
        questGiver: 'Story completion',
        tags: ['story', 'resolution', 'epilogue'],
        storyBeatConnection: {
          advancesStoryBeat: 'story_resolution',
        },
        storyImpact: 'major',
        characterDevelopmentOpportunities: [
          'Final character reflection',
          'Legacy establishment',
          'Future goal setting',
        ],
        worldStateChanges: [
          'Story consequences realized',
          'New status quo established',
          'Future possibilities opened',
        ],
        relationshipImpacts: [
          {
            characterId: 'all_npcs',
            relationshipChange: 2,
            relationshipType: 'respect',
          },
        ],
      },
    ];
  }

  /**
   * Generate a story-integrated quest based on current story beat
   */
  async generateStoryIntegratedQuest(
    campaignId: string,
    storyBeat: IStoryBeat,
    partyLevel: number,
    partySize: number
  ): Promise<GeneratedQuest> {
    try {
      const templates = this.createStoryQuestTemplates();
      const relevantTemplate = templates.find(
        template => template.storyType === this.getStoryTypeFromBeat(storyBeat)
      );

      if (!relevantTemplate) {
        throw new Error(`No template found for story beat type: ${storyBeat.type}`);
      }

      // Generate quest based on template
      const generatedQuest = await this.questService.generateQuest(
        campaignId,
        relevantTemplate.type,
        relevantTemplate.difficulty,
        partyLevel,
        partySize,
        storyBeat.location || 'Unknown',
        { storyBeat: storyBeat.title }
      );

      // Enhance with story integration
      const storyIntegratedQuest: GeneratedQuest = {
        ...generatedQuest,
        storyIntegration: {
          storyBeatId: storyBeat.id,
          storyType: relevantTemplate.storyType,
          storyImpact: relevantTemplate.storyImpact,
          characterDevelopmentOpportunities: relevantTemplate.characterDevelopmentOpportunities,
          worldStateChanges: relevantTemplate.worldStateChanges,
          relationshipImpacts: relevantTemplate.relationshipImpacts,
        },
      };

      // Add to story context
      this.contextManager.addStoryContextLayer(
        campaignId,
        'quest',
        `Story Quest Generated: ${generatedQuest.name} (${relevantTemplate.storyType}, ${relevantTemplate.storyImpact} impact)`,
        8,
        storyBeat.id
      );

      logger.info('Story-integrated quest generated', {
        campaignId,
        questName: generatedQuest.name,
        storyBeatId: storyBeat.id,
        storyType: relevantTemplate.storyType,
      });

      return storyIntegratedQuest;
    } catch (error) {
      logger.error('Error generating story-integrated quest:', error);
      throw error;
    }
  }

  /**
   * Link a quest to a story beat
   */
  async linkQuestToStoryBeat(
    campaignId: string,
    questId: string,
    storyBeatId: string,
    linkType: QuestStoryLink['linkType'],
    storyImpact: QuestStoryLink['storyImpact']
  ): Promise<QuestStoryLink> {
    try {
      const link: QuestStoryLink = {
        questId,
        storyBeatId,
        linkType,
        storyImpact,
        characterDevelopment: [],
        worldChanges: [],
      };

      // Add quest-story link to context
      this.contextManager.addStoryContextLayer(
        campaignId,
        'quest',
        `Quest-Story Link: ${questId} ${linkType} ${storyBeatId} (${storyImpact} impact)`,
        7,
        storyBeatId,
        questId
      );

      logger.info('Quest linked to story beat', {
        campaignId,
        questId,
        storyBeatId,
        linkType,
        storyImpact,
      });

      return link;
    } catch (error) {
      logger.error('Error linking quest to story beat:', error);
      throw error;
    }
  }

  /**
   * Process quest completion for story progression
   */
  async processQuestCompletionForStory(
    campaignId: string,
    questId: string,
    questName: string,
    characterIds: string[]
  ): Promise<void> {
    try {
      // Find the quest-story link
      const questStoryLink = await this.findQuestStoryLink(campaignId, questId);

      if (!questStoryLink) {
        logger.warn('No story link found for quest completion', { campaignId, questId });
        return;
      }

      // Process character development opportunities
      for (const characterId of characterIds) {
        await this.characterDevelopmentService.trackStoryImpactMilestone(
          characterId,
          `Quest Completion: ${questName}`,
          questStoryLink.storyImpact,
          questStoryLink.storyBeatId
        );
      }

      // Add world state changes
      this.contextManager.addWorldStateChange(
        campaignId,
        `Quest completed: ${questName} - ${questStoryLink.storyImpact} story impact`
      );

      // Update story context
      this.contextManager.addStoryContextLayer(
        campaignId,
        'quest',
        `Quest Completed: ${questName} - Advances story beat ${questStoryLink.storyBeatId}`,
        8,
        questStoryLink.storyBeatId,
        questId,
        true // Permanent
      );

      // Determine quest status based on quest name or other factors
      let questStatus = 'completed';
      if (questName.toLowerCase().includes('partial')) {
        questStatus = 'in_progress';
      }

      // Update story beat status
      await this.contextManager.updateStoryBeat(campaignId, questStoryLink.storyBeatId, {
        status: questStatus,
      });

      logger.info('Quest completion processed for story progression', {
        campaignId,
        questId,
        questName,
        storyBeatId: questStoryLink.storyBeatId,
        storyImpact: questStoryLink.storyImpact,
      });
    } catch (error) {
      logger.error('Error processing quest completion for story:', error);
    }
  }

  /**
   * Process quest failure for story consequences
   */
  async processQuestFailureForStory(
    campaignId: string,
    questId: string,
    questName: string,
    characterIds: string[],
    failureReason: string
  ): Promise<void> {
    try {
      const questStoryLink = await this.findQuestStoryLink(campaignId, questId);

      if (!questStoryLink) {
        logger.warn('No story link found for quest failure', { campaignId, questId });
        return;
      }

      // Process character development from failure
      for (const characterId of characterIds) {
        await this.characterDevelopmentService.trackPersonalGrowthMilestone(
          characterId,
          'Quest Failure',
          `Failed quest: ${questName} - ${failureReason}`,
          questStoryLink.storyBeatId
        );
      }

      // Add world state changes from failure
      this.contextManager.addWorldStateChange(
        campaignId,
        `Quest failed: ${questName} - ${failureReason} - Story consequences`
      );

      // Update story context
      this.contextManager.addStoryContextLayer(
        campaignId,
        'quest',
        `Quest Failed: ${questName} - Story consequences for beat ${questStoryLink.storyBeatId}`,
        6,
        questStoryLink.storyBeatId,
        questId,
        true // Permanent
      );

      // Update story beat status to failed
      await this.contextManager.updateStoryBeat(campaignId, questStoryLink.storyBeatId, {
        status: 'failed',
      });

      logger.info('Quest failure processed for story consequences', {
        campaignId,
        questId,
        questName,
        failureReason,
        storyBeatId: questStoryLink.storyBeatId,
      });
    } catch (error) {
      logger.error('Error processing quest failure for story:', error);
    }
  }

  /**
   * Get quests that advance story progression
   */
  async getStoryAdvancingQuests(campaignId: string): Promise<QuestStoryLink[]> {
    try {
      // In a real implementation, this would query the database
      logger.info('Getting story advancing quests', { campaignId });
      return [];
    } catch (error) {
      logger.error('Error getting story advancing quests:', error);
      return [];
    }
  }

  /**
   * Get quest templates by story type
   */
  getQuestTemplatesByStoryType(
    storyType: 'setup' | 'development' | 'climax' | 'resolution'
  ): StoryQuestTemplate[] {
    const templates = this.createStoryQuestTemplates();
    return templates.filter(template => template.storyType === storyType);
  }

  /**
   * Helper method to determine story type from story beat
   */
  private getStoryTypeFromBeat(
    storyBeat: IStoryBeat
  ): 'setup' | 'development' | 'climax' | 'resolution' {
    switch (storyBeat.type) {
      case 'setup':
        return 'setup';
      case 'development':
      case 'character':
        return 'development';
      case 'climax':
        return 'climax';
      case 'resolution':
        return 'resolution';
      default:
        return 'development';
    }
  }

  /**
   * Helper method to find quest-story link
   */
  public async findQuestStoryLink(
    campaignId: string,
    questId: string
  ): Promise<QuestStoryLink | null> {
    try {
      // In a real implementation, this would query the database
      logger.info('Finding quest-story link', { campaignId, questId });

      // For testing purposes, return a mock link
      // TODO: This should be replaced with actual database query
      return {
        questId,
        storyBeatId: 'test-story-beat-789',
        linkType: 'advances',
        storyImpact: 'major',
        characterDevelopment: ['Combat skills'],
        worldChanges: ['Quest completed'],
      };
    } catch (error) {
      logger.error('Error finding quest-story link:', error);
      return null;
    }
  }
}

export default QuestStoryIntegrationService;
