import LLMClientFactory from './LLMClientFactory';
import { ModelSelectionService } from './ModelSelectionService';
import { PerformanceTracker } from './PerformanceTracker';
import { Campaign } from '../models';
import logger from './LoggerService';
import { cacheService } from './CacheService';

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number; // 0-100
  requiredItems?: string[];
  requiredActions?: string[];
  timeLimit?: Date;
  location?: string;
  npcInteraction?: string;
}

export interface QuestReward {
  experience: number;
  gold: number;
  items: Array<{
    name: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
    quantity: number;
  }>;
  reputation: {
    faction: string;
    amount: number;
  }[];
  specialRewards?: string[];
}

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'faction' | 'exploration' | 'social' | 'combat';
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  levelRange: {
    min: number;
    max: number;
  };
  objectives: Omit<QuestObjective, 'id'>[];
  rewards: QuestReward;
  prerequisites?: {
    level?: number;
    completedQuests?: string[];
    factionStanding?: Array<{
      faction: string;
      minimumStanding: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
    }>;
    items?: string[];
  };
  timeLimit?: number; // in hours
  location: string;
  questGiver: string;
  tags: string[];
}

export interface GeneratedQuest {
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  type?: 'main' | 'side' | 'faction' | 'exploration' | 'social' | 'combat';
  estimatedDuration: number; // in hours
  location: string;
  questGiver: string;
  hooks: string[];
  consequences: {
    success: string[];
    failure: string[];
    partial: string[];
  };
}

export interface WorldExplorationData {
  location: string;
  discoveredAreas: string[];
  unexploredAreas: string[];
  pointsOfInterest: Array<{
    name: string;
    type: 'landmark' | 'dungeon' | 'settlement' | 'natural' | 'ruins';
    description: string;
    discovered: boolean;
    explored: boolean;
    danger: 'low' | 'medium' | 'high' | 'extreme';
  }>;
  resources: Array<{
    name: string;
    type: 'mineral' | 'herb' | 'water' | 'game' | 'magical';
    quantity: number;
    location: string;
    respawnTime?: number; // in hours
  }>;
}

export interface FactionData {
  name: string;
  type:
    | 'guild'
    | 'noble house'
    | 'religious order'
    | 'mercenary company'
    | 'criminal syndicate'
    | 'government'
    | 'academy';
  alignment: string;
  influence: number; // 0-100
  territory: string[];
  members: Array<{
    name: string;
    role: string;
    level: number;
    status: 'active' | 'inactive' | 'deceased';
  }>;
  relationships: Array<{
    faction: string;
    standing: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
    history: string[];
  }>;
  quests: string[];
  rewards: {
    titles: string[];
    items: string[];
    services: string[];
  };
}

export class QuestService {
  private static instance: QuestService;
  private geminiClient: any;
  private modelSelectionService: ModelSelectionService;
  private performanceTracker: PerformanceTracker;

  private questTemplates: Map<string, QuestTemplate> = new Map();
  private explorationData: Map<string, WorldExplorationData> = new Map();
  private factionData: Map<string, FactionData> = new Map();

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.modelSelectionService = ModelSelectionService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
    this.initializeQuestTemplates();
  }

  public static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService();
    }
    return QuestService.instance;
  }

  /**
   * Initialize default quest templates
   */
  private initializeQuestTemplates(): void {
    const templates: QuestTemplate[] = [
      {
        id: 'rescue_villager',
        name: 'Rescue the Missing Villager',
        description:
          'A local villager has gone missing in the nearby forest. Track them down and bring them back safely.',
        type: 'main',
        difficulty: 'easy',
        levelRange: { min: 1, max: 3 },
        objectives: [
          {
            description: 'Investigate the last known location of the villager',
            completed: false,
            progress: 0,
            location: 'Forest Edge',
          },
          {
            description: "Track the villager's trail through the forest",
            completed: false,
            progress: 0,
            requiredActions: ['survival_check', 'investigation_check'],
          },
          {
            description: 'Rescue the villager from danger',
            completed: false,
            progress: 0,
          },
          {
            description: 'Return the villager safely to the village',
            completed: false,
            progress: 0,
            location: 'Village',
          },
        ],
        rewards: {
          experience: 100,
          gold: 50,
          items: [
            {
              name: "Villager's Gratitude",
              description: 'A heartfelt thank you and a small reward',
              rarity: 'common',
              quantity: 1,
            },
          ],
          reputation: [
            {
              faction: 'Village Council',
              amount: 10,
            },
          ],
        },
        location: 'Forest',
        questGiver: 'Village Elder',
        tags: ['rescue', 'investigation', 'forest'],
      },
      {
        id: 'clear_dungeon',
        name: 'Clear the Ancient Dungeon',
        description:
          'An ancient dungeon has been discovered. Clear it of monsters and recover any valuable artifacts.',
        type: 'main',
        difficulty: 'medium',
        levelRange: { min: 3, max: 6 },
        objectives: [
          {
            description: 'Enter the dungeon and explore the first level',
            completed: false,
            progress: 0,
            location: 'Ancient Dungeon - Level 1',
          },
          {
            description: 'Defeat the dungeon guardians',
            completed: false,
            progress: 0,
            requiredActions: ['combat'],
          },
          {
            description: 'Find and recover the ancient artifact',
            completed: false,
            progress: 0,
            requiredItems: ['Ancient Artifact'],
          },
          {
            description: 'Return the artifact to the quest giver',
            completed: false,
            progress: 0,
            location: 'Town',
          },
        ],
        rewards: {
          experience: 300,
          gold: 200,
          items: [
            {
              name: 'Ancient Artifact',
              description: 'A mysterious artifact of great power',
              rarity: 'rare',
              quantity: 1,
            },
          ],
          reputation: [
            {
              faction: 'Archaeological Society',
              amount: 25,
            },
          ],
        },
        location: 'Ancient Dungeon',
        questGiver: 'Archaeologist',
        tags: ['dungeon', 'combat', 'exploration'],
      },
    ];

    templates.forEach(template => {
      this.questTemplates.set(template.id, template);
    });

    logger.info(`Initialized ${templates.length} quest templates`);
  }

  /**
   * Generate a new quest using AI
   */
  public async generateQuest(
    campaignId: string,
    questType: 'main' | 'side' | 'faction' | 'exploration' | 'social' | 'combat',
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly',
    partyLevel: number,
    partySize: number,
    currentLocation: string,
    worldState: any
  ): Promise<GeneratedQuest> {
    try {
      const startTime = Date.now();

      // Use Pro model for complex quest generation
      const modelType = 'pro';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `quest_${Date.now()}`,
        type: 'quest_generation',
        prompt: 'Generate a compelling quest for D&D campaign',
        context: worldState,
        complexity: 'complex',
      });

      const prompt = this.buildQuestGenerationPrompt(
        questType,
        difficulty,
        partyLevel,
        partySize,
        currentLocation,
        worldState
      );

      // Use the public sendPrompt method instead of private generateContent
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'quest_generation',
        temperature: 0.7,
        maxTokens: 800,
        forceModel: modelType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate quest');
      }

      const generatedQuest = this.parseQuestResponse(response.content);

      // Track performance using the new method
      const duration = Date.now() - startTime;
      this.performanceTracker.recordModelPerformance(modelType as 'flash-lite' | 'flash' | 'pro', {
        taskType: 'quest_generation',
        duration,
        success: true,
      });

      logger.info(`Generated quest: ${generatedQuest.name} in ${duration}ms`);
      return generatedQuest;
    } catch (error) {
      logger.error('Error generating quest:', error);
      throw error;
    }
  }

  /**
   * Build prompt for quest generation
   */
  private buildQuestGenerationPrompt(
    questType: string,
    difficulty: string,
    partyLevel: number,
    partySize: number,
    currentLocation: string,
    worldState: any
  ): string {
    return `You are the Dungeon Master creating a ${questType} quest for a D&D campaign.

Quest Type: ${questType}
Difficulty: ${difficulty}
Party Level: ${partyLevel}
Party Size: ${partySize}
Current Location: ${currentLocation}
World State: ${JSON.stringify(worldState, null, 2)}

Generate a compelling quest that includes:

1. Quest Name: A catchy, descriptive title
2. Description: A clear overview of what the quest involves
3. Objectives: 3-5 specific, achievable objectives with clear completion criteria
4. Rewards: Experience points, gold, items, and reputation gains
5. Difficulty: Appropriate for the party level and size
6. Estimated Duration: How long the quest should take (in hours)
7. Location: Where the quest takes place
8. Quest Giver: Who gives the quest
9. Hooks: 2-3 ways to introduce the quest to players
10. Consequences: What happens on success, failure, and partial completion

Format your response as JSON with the following structure:
{
  "name": "Quest Name",
  "description": "Quest description",
  "objectives": [
    {
      "description": "Objective description",
      "completed": false,
      "progress": 0,
      "location": "Location name (optional)",
      "requiredActions": ["action1", "action2"] (optional)
    }
  ],
  "rewards": {
    "experience": 100,
    "gold": 50,
    "items": [
      {
        "name": "Item name",
        "description": "Item description",
        "rarity": "common|uncommon|rare|very rare|legendary",
        "quantity": 1
      }
    ],
    "reputation": [
      {
        "faction": "Faction name",
        "amount": 10
      }
    ]
  },
  "difficulty": "easy|medium|hard|deadly",
  "estimatedDuration": 4,
  "location": "Quest location",
  "questGiver": "NPC name",
  "hooks": ["Hook 1", "Hook 2", "Hook 3"],
  "consequences": {
    "success": ["Consequence 1", "Consequence 2"],
    "failure": ["Consequence 1", "Consequence 2"],
    "partial": ["Consequence 1", "Consequence 2"]
  }
}

Make the quest engaging, appropriate for the difficulty level, and integrated with the world state.`;
  }

  /**
   * Parse AI response into quest structure
   */
  private parseQuestResponse(response: string): GeneratedQuest {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questData = JSON.parse(jsonMatch[0]);

      // Add IDs to objectives
      const objectives = questData.objectives.map((obj: any, index: number) => ({
        ...obj,
        id: `obj_${Date.now()}_${index}`,
      }));

      return {
        name: questData.name,
        description: questData.description,
        objectives,
        rewards: questData.rewards,
        difficulty: questData.difficulty,
        estimatedDuration: questData.estimatedDuration,
        location: questData.location,
        questGiver: questData.questGiver,
        hooks: questData.hooks,
        consequences: questData.consequences,
      };
    } catch (error) {
      logger.error('Error parsing quest response:', error);
      throw new Error('Failed to parse generated quest');
    }
  }

  /**
   * Add quest to campaign
   */
  public async addQuestToCampaign(campaignId: string, quest: GeneratedQuest): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const questToAdd = {
        name: quest.name,
        description: quest.description,
        objectives: quest.objectives,
        difficulty: quest.difficulty,
        experienceReward: quest.rewards.experience,
        location: quest.location,
        questGiver: quest.questGiver,
        rewards: quest.rewards,
        hooks: quest.hooks,
        consequences: quest.consequences,
        estimatedDuration: quest.estimatedDuration,
        startedAt: new Date(),
        status: 'active',
      };

      campaign.progress.activeQuests.push(questToAdd);
      await campaign.save();

      logger.info(`Added quest "${quest.name}" to campaign ${campaignId}`);
    } catch (error) {
      logger.error('Error adding quest to campaign:', error);
      throw error;
    }
  }

  /**
   * Update quest objective progress
   */
  public async updateQuestObjective(
    campaignId: string,
    questName: string,
    objectiveId: string,
    progress: number
  ): Promise<boolean> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const quest = campaign.progress.activeQuests.find(q => q.name === questName);
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Find the objective by description (since Campaign model doesn't have objective IDs)
      const objective = quest.objectives.find(obj => obj.description === objectiveId);
      if (!objective) {
        throw new Error('Objective not found');
      }

      // Update progress (Campaign model doesn't have progress field, so we'll mark as completed)
      if (progress >= 100) {
        objective.completed = true;
      }

      await campaign.save();

      // Invalidate related cache
      await this.invalidateQuestCache(campaignId);

      return true;
    } catch (error) {
      logger.error('Error updating quest objective:', error);
      return false;
    }
  }

  /**
   * Complete a quest
   */
  public async completeQuest(campaignId: string, questName: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const questIndex = campaign.progress.activeQuests.findIndex(q => q.name === questName);
      if (questIndex === -1) {
        throw new Error('Quest not found');
      }

      const quest = campaign.progress.activeQuests[questIndex];

      // Move to completed quests
      campaign.progress.completedQuests.push({
        name: quest.name,
        description: quest.description,
        completedAt: new Date(),
        experienceReward: quest.experienceReward,
        itemsRewarded: [], // Campaign model doesn't store items in activeQuests
      });

      // Remove from active quests
      campaign.progress.activeQuests.splice(questIndex, 1);

      // Note: Faction standings would need to be updated separately
      // as the Campaign model doesn't store reputation rewards in activeQuests

      await campaign.save();

      // Invalidate related cache
      await this.invalidateQuestCache(campaignId);

      logger.info(`Completed quest "${questName}" in campaign ${campaignId}`);
    } catch (error) {
      logger.error('Error completing quest:', error);
      throw error;
    }
  }

  // Private method to invalidate quest-related cache
  private async invalidateQuestCache(campaignId: string): Promise<void> {
    try {
      const patterns = [
        `quest:statistics:${campaignId}`,
        `quest:templates:*`,
        `campaign:${campaignId}`,
        `campaigns:all`,
        `campaigns:user:*`,
      ];

      for (const pattern of patterns) {
        await cacheService.deletePattern(pattern);
      }

      logger.debug(`Cache invalidated for quests in campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache for quests in campaign ${campaignId}:`, error);
    }
  }

  /**
   * Get world exploration data
   */
  public async getWorldExplorationData(
    campaignId: string,
    location: string
  ): Promise<WorldExplorationData> {
    try {
      const key = `${campaignId}_${location}`;

      if (!this.explorationData.has(key)) {
        // Generate exploration data using AI
        const explorationData = await this.generateExplorationData(campaignId, location);
        this.explorationData.set(key, explorationData);
      }

      return this.explorationData.get(key)!;
    } catch (error) {
      logger.error('Error getting world exploration data:', error);
      throw error;
    }
  }

  /**
   * Generate exploration data for a location
   */
  private async generateExplorationData(
    campaignId: string,
    location: string
  ): Promise<WorldExplorationData> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Use Flash model for exploration data generation
      const modelType = 'flash';

      // Use the public interface for model selection
      await this.modelSelectionService.selectOptimalModel({
        id: `exploration_${Date.now()}`,
        type: 'exploration_generation',
        prompt: 'Generate exploration data for location',
        context: JSON.stringify(campaign.worldState),
        complexity: 'moderate',
      });

      const prompt = `Generate exploration data for the location: ${location}

Campaign Theme: ${campaign.theme}
World State: ${JSON.stringify(campaign.worldState, null, 2)}

Create exploration data including:
1. Discovered and unexplored areas
2. Points of interest with descriptions and danger levels
3. Available resources with quantities and respawn times

Format as JSON with the structure:
{
  "location": "${location}",
  "discoveredAreas": ["area1", "area2"],
  "unexploredAreas": ["area3", "area4"],
  "pointsOfInterest": [
    {
      "name": "POI name",
      "type": "landmark|dungeon|settlement|natural|ruins",
      "description": "Description",
      "discovered": false,
      "explored": false,
      "danger": "low|medium|high|extreme"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "mineral|herb|water|game|magical",
      "quantity": 10,
      "location": "specific location",
      "respawnTime": 24
    }
  ]
}`;

      // Use the public sendPrompt method instead of private generateContent
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'exploration_generation',
        temperature: 0.6,
        maxTokens: 600,
        forceModel: modelType,
      });

      if (!response.success) {
        logger.warn('Exploration generation failed, using fallback data:', response.error);
        return this.getFallbackExplorationData(location);
      }

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No valid JSON found in exploration response, using fallback data');
        return this.getFallbackExplorationData(location);
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        logger.warn('Failed to parse exploration JSON, using fallback data:', parseError);
        return this.getFallbackExplorationData(location);
      }
    } catch (error) {
      logger.error('Error generating exploration data:', error);
      // Return fallback data instead of throwing
      logger.warn('Using fallback exploration data due to generation error');
      return this.getFallbackExplorationData(location);
    }
  }

  /**
   * Get fallback exploration data when AI generation fails
   */
  private getFallbackExplorationData(location: string): WorldExplorationData {
    return {
      location,
      discoveredAreas: ['Town Square', 'Main Road'],
      unexploredAreas: ['Ancient Ruins', 'Dark Forest', 'Mountain Pass'],
      pointsOfInterest: [
        {
          name: 'Town Square',
          description: 'The central gathering place of the settlement',
          type: 'settlement',
          danger: 'low',
          discovered: true,
          explored: true,
        },
        {
          name: 'Ancient Ruins',
          description: 'Mysterious ruins from a bygone era',
          type: 'ruins',
          danger: 'medium',
          discovered: false,
          explored: false,
        },
        {
          name: 'Dark Forest',
          description: 'A dense forest where few dare to venture',
          type: 'natural',
          danger: 'high',
          discovered: false,
          explored: false,
        },
      ],
      resources: [
        {
          name: 'Fresh Water',
          type: 'water',
          location: 'Town Well',
          quantity: 100,
          respawnTime: 6,
        },
        {
          name: 'Wild Berries',
          type: 'herb',
          location: 'Forest Edge',
          quantity: 25,
          respawnTime: 24,
        },
      ],
    };
  }

  /**
   * Update faction standing
   */
  public async updateFactionStanding(
    campaignId: string,
    factionName: string,
    amount: number
  ): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const faction = campaign.worldState.factions.find(f => f.name === factionName);
      if (faction) {
        faction.influence = Math.min(100, Math.max(0, faction.influence + amount));

        // Update relationship based on influence
        if (faction.influence >= 80) {
          faction.relationship = 'allied';
        } else if (faction.influence >= 60) {
          faction.relationship = 'friendly';
        } else if (faction.influence >= 40) {
          faction.relationship = 'neutral';
        } else if (faction.influence >= 20) {
          faction.relationship = 'unfriendly';
        } else {
          faction.relationship = 'hostile';
        }
      } else {
        // Create new faction
        campaign.worldState.factions.push({
          name: factionName,
          type: 'other',
          alignment: 'neutral',
          influence: Math.max(0, amount),
          relationship: amount >= 0 ? 'friendly' : 'hostile',
          description: `Faction discovered through quest completion`,
        });
      }

      await campaign.save();
      logger.info(`Updated faction ${factionName} standing by ${amount} in campaign ${campaignId}`);
    } catch (error) {
      logger.error('Error updating faction standing:', error);
      throw error;
    }
  }

  /**
   * Get quest templates by type and difficulty
   */
  public async getQuestTemplates(
    type?: string,
    difficulty?: string,
    levelRange?: { min: number; max: number }
  ): Promise<QuestTemplate[]> {
    try {
      // Create cache key based on filters
      const filterString = JSON.stringify({ type, difficulty, levelRange });
      const cacheKey = `quest:templates:${Buffer.from(filterString).toString('base64')}`;

      // Try to get from cache first
      const cached = await cacheService.get<QuestTemplate[]>(cacheKey);
      if (cached) {
        logger.debug('Cache hit for quest templates');
        return cached;
      }

      let templates = Array.from(this.questTemplates.values());

      if (type) {
        templates = templates.filter(t => t.type === type);
      }

      if (difficulty) {
        templates = templates.filter(t => t.difficulty === difficulty);
      }

      if (levelRange) {
        templates = templates.filter(
          t => t.levelRange.min <= levelRange.max && t.levelRange.max >= levelRange.min
        );
      }

      // Cache the result for 10 minutes (quest templates don't change often)
      await cacheService.set(cacheKey, templates, { ttl: 600 });
      logger.debug('Cached quest templates');

      return templates;
    } catch (error) {
      logger.error('Error getting quest templates:', error);
      // Fallback to non-cached version
      let templates = Array.from(this.questTemplates.values());

      if (type) {
        templates = templates.filter(t => t.type === type);
      }

      if (difficulty) {
        templates = templates.filter(t => t.difficulty === difficulty);
      }

      if (levelRange) {
        templates = templates.filter(
          t => t.levelRange.min <= levelRange.max && t.levelRange.max >= levelRange.min
        );
      }

      return templates;
    }
  }

  /**
   * Get quest statistics for a campaign
   */
  public async getQuestStatistics(campaignId: string): Promise<any> {
    try {
      // Try to get from cache first
      const cacheKey = `quest:statistics:${campaignId}`;
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for quest statistics: ${campaignId}`);
        return cached;
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const activeQuests = campaign.progress.activeQuests;
      const completedQuests = campaign.progress.completedQuests;

      // Calculate statistics
      const statistics = {
        totalQuests: activeQuests.length + completedQuests.length,
        activeQuests: activeQuests.length,
        completedQuests: completedQuests.length,
        completionRate: completedQuests.length / (activeQuests.length + completedQuests.length),
        averageExperiencePerQuest:
          completedQuests.length > 0
            ? completedQuests.reduce((sum, q) => sum + q.experienceReward, 0) /
              completedQuests.length
            : 0,
        totalExperienceRewarded: completedQuests.reduce((sum, q) => sum + q.experienceReward, 0),
        totalGoldRewarded: 0, // Campaign model doesn't store gold rewards
        totalItemsRewarded: completedQuests.reduce((sum, q) => sum + q.itemsRewarded.length, 0),
        questTypes: {
          main: 0,
          side: 0,
          faction: 0,
          exploration: 0,
          social: 0,
          combat: 0,
        },
        difficultyDistribution: {
          easy: 0,
          medium: 0,
          hard: 0,
          deadly: 0,
        },
      };

      // Count quest types and difficulties from active quests only
      [...activeQuests].forEach(_quest => {
        // Note: Campaign model doesn't store quest type or difficulty for completed quests
        // We can only analyze active quests for these statistics
      });

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, statistics, { ttl: 300 });
      logger.debug(`Cached quest statistics: ${campaignId}`);

      return statistics;
    } catch (error) {
      logger.error('Error getting quest statistics:', error);
      throw error;
    }
  }
}

export default QuestService;
