import logger from './LoggerService';
import {
  StoryArc,
  IStoryArc,
  IStoryBeat,
  ICharacterMilestone,
  IWorldStateChange,
  IQuestProgress,
} from '../models/StoryArc';
import { Campaign, ICampaign } from '../models';
import { Types } from 'mongoose';

export interface StoryArcCreationData {
  campaignId: Types.ObjectId;
  theme: string;
  tone?: 'light' | 'serious' | 'dark' | 'humorous' | 'mysterious';
  pacing?: 'slow' | 'normal' | 'fast';
  totalChapters?: number;
}

export interface StoryBeatData {
  title: string;
  description: string;
  type: 'setup' | 'development' | 'climax' | 'resolution' | 'twist' | 'character' | 'world';
  importance: 'minor' | 'moderate' | 'major' | 'critical';
  chapter: number;
  act: number;
  characters: Types.ObjectId[];
  location?: string;
  npcs: string[];
  consequences: string[];
}

export interface CharacterMilestoneData {
  characterId: Types.ObjectId;
  type: 'level' | 'relationship' | 'story' | 'personal' | 'skill' | 'achievement';
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  storyBeatId?: string;
  metadata?: Record<string, any>;
}

export interface WorldStateChangeData {
  type: 'location' | 'faction' | 'threat' | 'event' | 'relationship' | 'discovery';
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'catastrophic';
  affectedElements: string[];
  storyBeatId?: string;
  characterIds: Types.ObjectId[];
  location?: string;
  permanent?: boolean;
}

export interface QuestProgressData {
  questId: Types.ObjectId;
  name: string;
  type: 'setup' | 'development' | 'climax' | 'resolution';
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  storyBeatId?: string;
  objectives: Array<{
    description: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  storyImpact: 'minor' | 'moderate' | 'major' | 'critical';
  characterDevelopment: Types.ObjectId[];
  worldChanges: string[];
}

export interface StoryArcValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  consistencyScore: number;
  validationTime: number;
}

export interface StoryProgressionData {
  currentChapter: number;
  currentAct: number;
  storyPhase: 'setup' | 'development' | 'climax' | 'resolution';
  nextStoryBeat?: {
    title: string;
    description: string;
    type: string;
    importance: string;
    characters: string[];
    location?: string;
    objectives: string[];
  };
  characterDevelopment: Array<{
    character: string;
    milestone: string;
    impact: string;
  }>;
  worldChanges: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
}

export class StoryArcService {
  /**
   * Create a new story arc for a campaign
   */
  async createStoryArc(data: StoryArcCreationData): Promise<IStoryArc> {
    try {
      logger.info(`Creating story arc for campaign ${data.campaignId}`);

      // Check if campaign exists
      const campaign = await Campaign.findById(data.campaignId);
      if (!campaign) {
        throw new Error(`Campaign with ID ${data.campaignId} not found`);
      }

      // Check if story arc already exists
      const existingStoryArc = await StoryArc.findOne({ campaignId: data.campaignId });
      if (existingStoryArc) {
        throw new Error(`Story arc already exists for campaign ${data.campaignId}`);
      }

      // Generate initial story beats based on campaign theme
      const initialStoryBeats = await this.generateInitialStoryBeats(data);

      const storyArc = new StoryArc({
        campaignId: data.campaignId,
        theme: data.theme,
        tone: data.tone || 'serious',
        pacing: data.pacing || 'normal',
        totalChapters: data.totalChapters || 10,
        storyBeats: initialStoryBeats,
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      });

      const savedStoryArc = await storyArc.save();
      logger.info(`Story arc created successfully for campaign ${data.campaignId}`);

      return savedStoryArc;
    } catch (error) {
      logger.error(`Error creating story arc: ${error}`);
      throw error;
    }
  }

  /**
   * Get story arc by campaign ID
   */
  async getStoryArcByCampaignId(campaignId: Types.ObjectId): Promise<IStoryArc | null> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId }).populate(
        'storyBeats.characters',
        'name race class'
      );
      return storyArc;
    } catch (error) {
      logger.error(`Error getting story arc: ${error}`);
      throw error;
    }
  }

  /**
   * Add a new story beat to the story arc
   */
  async addStoryBeat(campaignId: Types.ObjectId, beatData: StoryBeatData): Promise<string> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const beatId = storyArc.addStoryBeat({
        ...beatData,
        completed: false,
      });
      await storyArc.save();

      logger.info(`Story beat "${beatData.title}" added to campaign ${campaignId}`);
      return beatId;
    } catch (error) {
      logger.error(`Error adding story beat: ${error}`);
      throw error;
    }
  }

  /**
   * Complete a story beat
   */
  async completeStoryBeat(
    campaignId: Types.ObjectId,
    beatId: string,
    outcome?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const success = storyArc.completeStoryBeat(beatId, outcome, notes);
      if (success) {
        await storyArc.save();
        logger.info(`Story beat ${beatId} completed for campaign ${campaignId}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error completing story beat: ${error}`);
      throw error;
    }
  }

  /**
   * Add a character milestone
   */
  async addCharacterMilestone(
    campaignId: Types.ObjectId,
    milestoneData: CharacterMilestoneData
  ): Promise<void> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      storyArc.addCharacterMilestone({
        ...milestoneData,
        achievedAt: new Date(),
      });

      await storyArc.save();
      logger.info(`Character milestone "${milestoneData.title}" added to campaign ${campaignId}`);
    } catch (error) {
      logger.error(`Error adding character milestone: ${error}`);
      throw error;
    }
  }

  /**
   * Add a world state change
   */
  async addWorldStateChange(
    campaignId: Types.ObjectId,
    changeData: WorldStateChangeData
  ): Promise<string> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const changeId = storyArc.addWorldStateChange({
        ...changeData,
        occurredAt: new Date(),
      });

      await storyArc.save();
      logger.info(`World state change "${changeData.title}" added to campaign ${campaignId}`);
      return changeId;
    } catch (error) {
      logger.error(`Error adding world state change: ${error}`);
      throw error;
    }
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    campaignId: Types.ObjectId,
    questId: Types.ObjectId,
    updates: Partial<IQuestProgress>
  ): Promise<boolean> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const success = storyArc.updateQuestProgress(questId, updates);
      if (success) {
        await storyArc.save();
        logger.info(`Quest progress updated for quest ${questId} in campaign ${campaignId}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error updating quest progress: ${error}`);
      throw error;
    }
  }

  /**
   * Advance story to next chapter
   */
  async advanceChapter(campaignId: Types.ObjectId): Promise<boolean> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const success = storyArc.advanceChapter();
      if (success) {
        await storyArc.save();
        logger.info(
          `Story advanced to chapter ${storyArc.currentChapter} for campaign ${campaignId}`
        );
      }

      return success;
    } catch (error) {
      logger.error(`Error advancing chapter: ${error}`);
      throw error;
    }
  }

  /**
   * Get current story beat
   */
  async getCurrentStoryBeat(campaignId: Types.ObjectId): Promise<IStoryBeat | null> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        return null;
      }

      const currentBeat = storyArc.storyBeats.find(
        beat =>
          beat.chapter === storyArc.currentChapter &&
          beat.act === storyArc.currentAct &&
          !beat.completed
      );

      return currentBeat || null;
    } catch (error) {
      logger.error(`Error getting current story beat: ${error}`);
      throw error;
    }
  }

  /**
   * Validate story arc consistency
   */
  async validateStoryConsistency(campaignId: Types.ObjectId): Promise<StoryArcValidationResult> {
    const startTime = Date.now();
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const issues: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Check story beat progression
      const storyBeats = storyArc.storyBeats.sort((a, b) => a.chapter - b.chapter);
      for (let i = 1; i < storyBeats.length; i++) {
        const prevBeat = storyBeats[i - 1];
        const currentBeat = storyBeats[i];

        if (currentBeat.chapter < prevBeat.chapter) {
          issues.push(`Story beat "${currentBeat.title}" has invalid chapter progression`);
        }

        if (currentBeat.act < prevBeat.act) {
          issues.push(`Story beat "${currentBeat.title}" has invalid act progression`);
        }
      }

      // Check character milestone consistency
      const completedBeats = storyArc.storyBeats.filter(beat => beat.completed);
      for (const beat of completedBeats) {
        const hasMilestone = storyArc.characterMilestones.some(
          milestone => milestone.storyBeatId === beat.id
        );
        if (!hasMilestone) {
          warnings.push(`Completed story beat "${beat.title}" has no character milestones`);
        }
      }

      // Check world state consistency
      const worldChanges = storyArc.worldStateChanges.sort(
        (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
      );
      for (let i = 1; i < worldChanges.length; i++) {
        const prevChange = worldChanges[i - 1];
        const currentChange = worldChanges[i];

        // Check for contradictory changes
        if (
          prevChange.affectedElements.some(element =>
            currentChange.affectedElements.includes(element)
          )
        ) {
          if (prevChange.impact === 'catastrophic' && currentChange.impact === 'minor') {
            warnings.push(
              `World state change "${currentChange.title}" may contradict previous major change`
            );
          }
        }
      }

      // Generate suggestions
      if (storyArc.characterMilestones.length < storyArc.completedStoryBeats) {
        suggestions.push('Add more character development milestones for completed story beats');
      }

      if (storyArc.worldStateChanges.length < storyArc.completedStoryBeats) {
        suggestions.push('Add more world state changes to reflect story progression');
      }

      const consistencyScore = Math.max(0, 100 - issues.length * 10 - warnings.length * 5);
      const validationTime = Date.now() - startTime;

      return {
        valid: issues.length === 0,
        issues,
        warnings,
        suggestions,
        consistencyScore,
        validationTime,
      };
    } catch (error) {
      logger.error(`Error validating story consistency: ${error}`);
      throw error;
    }
  }

  /**
   * Get story progression data
   */
  async getStoryProgression(campaignId: Types.ObjectId): Promise<StoryProgressionData> {
    try {
      const storyArc = await StoryArc.findOne({ campaignId });
      if (!storyArc) {
        throw new Error(`Story arc not found for campaign ${campaignId}`);
      }

      const nextStoryBeat = await this.getCurrentStoryBeat(campaignId);

      // Get recent character development
      const recentMilestones = storyArc.characterMilestones
        .sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime())
        .slice(0, 3);

      const characterDevelopment = recentMilestones.map(milestone => ({
        character: milestone.characterId.toString(), // In a real app, you'd populate this
        milestone: milestone.title,
        impact: milestone.impact,
      }));

      // Get recent world changes
      const recentWorldChanges = storyArc.worldStateChanges
        .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
        .slice(0, 3);

      const worldChanges = recentWorldChanges.map(change => ({
        type: change.type,
        description: change.description,
        impact: change.impact,
      }));

      return {
        currentChapter: storyArc.currentChapter,
        currentAct: storyArc.currentAct,
        storyPhase: storyArc.storyPhase,
        nextStoryBeat: nextStoryBeat
          ? {
              title: nextStoryBeat.title,
              description: nextStoryBeat.description,
              type: nextStoryBeat.type,
              importance: nextStoryBeat.importance,
              characters: nextStoryBeat.characters.map(id => id.toString()),
              location: nextStoryBeat.location,
              objectives: nextStoryBeat.consequences,
            }
          : undefined,
        characterDevelopment,
        worldChanges,
      };
    } catch (error) {
      logger.error(`Error getting story progression: ${error}`);
      throw error;
    }
  }

  /**
   * Generate initial story beats based on campaign theme
   */
  private async generateInitialStoryBeats(data: StoryArcCreationData): Promise<IStoryBeat[]> {
    const initialBeats: IStoryBeat[] = [];

    // Generate setup beat
    initialBeats.push({
      id: `beat_${Date.now()}_setup`,
      title: 'The Beginning',
      description: `The adventure begins in ${data.theme.toLowerCase()} setting. The party gathers and learns about their quest.`,
      type: 'setup',
      importance: 'major',
      chapter: 1,
      act: 1,
      characters: [],
      location: 'Starting Location',
      npcs: ['Quest Giver'],
      consequences: ['Party formation', 'Quest introduction', 'Initial goal setting'],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate development beat
    initialBeats.push({
      id: `beat_${Date.now()}_development`,
      title: 'First Challenge',
      description: `The party faces their first significant challenge related to ${data.theme.toLowerCase()}.`,
      type: 'development',
      importance: 'moderate',
      chapter: 2,
      act: 1,
      characters: [],
      location: 'Challenge Location',
      npcs: ['Antagonist', 'Helper NPC'],
      consequences: ['Skill development', 'Team building', 'Plot advancement'],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return initialBeats;
  }

  /**
   * Delete story arc (for cleanup)
   */
  async deleteStoryArc(campaignId: Types.ObjectId): Promise<boolean> {
    try {
      const result = await StoryArc.deleteOne({ campaignId });
      if (result.deletedCount > 0) {
        logger.info(`Story arc deleted for campaign ${campaignId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error deleting story arc: ${error}`);
      throw error;
    }
  }
}

export default StoryArcService;
