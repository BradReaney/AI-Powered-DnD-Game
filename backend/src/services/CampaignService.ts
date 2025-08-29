import logger from './LoggerService';
import { Campaign, ICampaign } from '../models';
import LLMClientFactory from './LLMClientFactory';
import { cacheService } from './CacheService';

export interface CampaignCreationData {
  name: string;
  theme: string;
  description: string;
  settings?: {
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    maxLevel: number;
    startingLevel: number;
    experienceRate: 'slow' | 'normal' | 'fast';
    magicLevel: 'low' | 'medium' | 'high';
    technologyLevel: 'primitive' | 'medieval' | 'renaissance' | 'modern' | 'futuristic';
  };
  createdBy: string;
}

export interface CampaignUpdateData {
  name?: string;
  theme?: string;
  description?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  settings?: Partial<CampaignCreationData['settings']>;
  worldState?: {
    currentLocation?: string;
    knownLocations?: Array<{
      name: string;
      type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other';
      description: string;
      discovered: boolean;
      visited: boolean;
    }>;
    factions?: Array<{
      name: string;
      type:
        | 'guild'
        | 'noble house'
        | 'religious order'
        | 'mercenary company'
        | 'criminal syndicate'
        | 'other';
      alignment: string;
      influence: number;
      relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
      description: string;
    }>;
    activeThreats?: Array<{
      name: string;
      type: 'monster' | 'organization' | 'natural disaster' | 'political' | 'other';
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      status: 'active' | 'defeated' | 'resolved';
    }>;
  };
  storyContext?: {
    campaignSummary?: string;
    currentScene?: string;
    worldLore?: Array<{
      category: string;
      title: string;
      content: string;
      discoveredBy: string[];
      importance: 'common' | 'uncommon' | 'rare' | 'legendary';
    }>;
  };
}

export interface QuestData {
  name: string;
  description: string;
  objectives: Array<{
    description: string;
    completed: boolean;
  }>;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  experienceReward: number;
  timeLimit?: Date;
  location: string;
  questGiver: string;
  rewards: {
    items: string[];
    gold: number;
    reputation: number;
  };
}

export interface WorldEventData {
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'catastrophic';
  location: string;
  affectedFactions: string[];
  consequences: string[];
  duration: number; // in days
}

class CampaignService {
  private geminiClient: any;

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
  }

  public async createCampaign(data: CampaignCreationData): Promise<ICampaign> {
    try {
      // Generate initial world state and story context using AI
      const aiGeneratedContent = await this.generateInitialCampaignContent(data);

      const campaign = new Campaign({
        name: data.name,
        theme: data.theme,
        description: data.description,
        status: 'active',
        settings: data.settings || {
          difficulty: 'easy',
          maxLevel: 10,
          startingLevel: 1,
          experienceRate: 'normal',
          magicLevel: 'medium',
          technologyLevel: 'medieval',
        },
        worldState: {
          currentLocation: 'Starting Town',
          knownLocations: [
            {
              name: 'Starting Town',
              type: 'town',
              description: aiGeneratedContent.startingLocation,
              discovered: true,
              visited: true,
            },
          ],
          factions: aiGeneratedContent.factions,
          activeThreats: aiGeneratedContent.threats,
          worldEvents: [],
        },
        progress: {
          currentChapter: 1,
          totalChapters: 10,
          completedQuests: [],
          activeQuests: [],
          campaignGoals: aiGeneratedContent.goals,
        },
        sessions: [],
        characters: [],
        storyContext: {
          campaignSummary: aiGeneratedContent.summary,
          currentScene: 'The adventure begins...',
          storyHistory: [],
          npcDatabase: [],
          worldLore: aiGeneratedContent.lore,
        },
        createdBy: data.createdBy,
        lastPlayed: new Date(),
        totalPlayTime: 0,
      });

      await campaign.save();
      logger.info(`Created campaign: ${campaign.name} with theme: ${campaign.theme}`);
      return campaign;
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  private async generateInitialCampaignContent(data: CampaignCreationData): Promise<{
    summary: string;
    startingLocation: string;
    factions: Array<{
      name: string;
      type:
        | 'guild'
        | 'noble house'
        | 'religious order'
        | 'mercenary company'
        | 'criminal syndicate'
        | 'other';
      alignment: string;
      influence: number;
      relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
      description: string;
    }>;
    threats: Array<{
      name: string;
      type: 'monster' | 'organization' | 'natural disaster' | 'political' | 'other';
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      status: 'active' | 'defeated' | 'resolved';
    }>;
    goals: Array<{
      description: string;
      completed: boolean;
      progress: number;
    }>;
    lore: Array<{
      category: string;
      title: string;
      content: string;
      discoveredBy: string[];
      importance: 'common' | 'uncommon' | 'rare' | 'legendary';
    }>;
  }> {
    try {
      const prompt = `
      Create initial content for a D&D campaign called "${data.name}" with the theme "${data.theme}".

      Campaign description: ${data.description}
      Difficulty: ${data.settings?.difficulty || 'N/A'}
      Magic level: ${data.settings?.magicLevel || 'N/A'}
      Technology level: ${data.settings?.technologyLevel || 'N/A'}

      Generate:
      1. A brief campaign summary (2-3 sentences)
      2. A description of the starting town/location
      3. 3-5 major factions in the world with their alignments and influence
      4. 2-3 active threats or conflicts
      5. 3-5 campaign goals for the players
      6. 3-5 pieces of world lore (history, legends, etc.)

      IMPORTANT: Use ONLY these exact enum values:
      - Faction types: "guild", "noble house", "religious order", "mercenary company", "criminal syndicate", "other"
      - Threat types: "monster", "organization", "natural disaster", "political", "other"
      - Threat levels: "low", "medium", "high", "critical"
      - Threat status: "active", "defeated", "resolved"
      - Lore importance: "common", "uncommon", "rare", "legendary"

      Return as JSON with this structure:
      {
        "summary": "Campaign summary...",
        "startingLocation": "Description of starting town...",
        "factions": [
          {
            "name": "Faction Name",
            "type": "guild",
            "alignment": "Lawful Good",
            "influence": 75,
            "relationship": "friendly",
            "description": "Faction description..."
          }
        ],
        "threats": [
          {
            "name": "Threat Name",
            "type": "monster",
            "threatLevel": "medium",
            "description": "Threat description...",
            "location": "Location name",
            "status": "active"
          }
        ],
        "goals": [
          {
            "description": "Goal description...",
            "completed": false,
            "progress": 0
          }
        ],
        "lore": [
          {
            "category": "History",
            "title": "Lore title",
            "content": "Lore content...",
            "discoveredBy": [],
            "importance": "common"
          }
        ]
      }
      `;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'campaign_scenario_generation',
        forceModel: 'pro',
      });

      if (!response.success) {
        throw new Error('Failed to generate campaign content: ' + response.error);
      }

      const text = response.content;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid campaign content');
      }

      const content = JSON.parse(jsonMatch[0]);

      // Validate the generated content
      this.validateGeneratedCampaignContent(content);

      return content;
    } catch (error) {
      logger.error('Error generating campaign content:', error);

      // Return fallback content
      return this.generateFallbackCampaignContent(data);
    }
  }

  private validateGeneratedCampaignContent(content: any): void {
    const requiredFields = ['summary', 'startingLocation', 'factions', 'threats', 'goals', 'lore'];
    for (const field of requiredFields) {
      if (!content[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate enum values
    this.validateEnumValues(content);
  }

  private validateEnumValues(content: any): void {
    // Valid enum values from Campaign model
    const validFactionTypes = [
      'guild',
      'noble house',
      'religious order',
      'mercenary company',
      'criminal syndicate',
      'other',
    ];
    const validThreatTypes = ['monster', 'organization', 'natural disaster', 'political', 'other'];
    const validThreatLevels = ['low', 'medium', 'high', 'critical'];
    const validThreatStatuses = ['active', 'defeated', 'resolved'];
    const validLoreImportance = ['common', 'uncommon', 'rare', 'legendary'];

    // Validate factions
    if (content.factions && Array.isArray(content.factions)) {
      content.factions.forEach((faction: any, index: number) => {
        if (faction.type && !validFactionTypes.includes(faction.type)) {
          throw new Error(
            `Invalid faction type at index ${index}: "${faction.type}". Valid types are: ${validFactionTypes.join(', ')}`
          );
        }
      });
    }

    // Validate threats
    if (content.threats && Array.isArray(content.threats)) {
      content.threats.forEach((threat: any, index: number) => {
        if (threat.type && !validThreatTypes.includes(threat.type)) {
          throw new Error(
            `Invalid threat type at index ${index}: "${threat.type}". Valid types are: ${validThreatTypes.join(', ')}`
          );
        }
        if (threat.threatLevel && !validThreatLevels.includes(threat.threatLevel)) {
          throw new Error(
            `Invalid threat level at index ${index}: "${threat.threatLevel}". Valid levels are: ${validThreatLevels.join(', ')}`
          );
        }
        if (threat.status && !validThreatStatuses.includes(threat.status)) {
          throw new Error(
            `Invalid threat status at index ${index}: "${threat.status}". Valid statuses are: ${validThreatStatuses.join(', ')}`
          );
        }
      });
    }

    // Validate lore
    if (content.lore && Array.isArray(content.lore)) {
      content.lore.forEach((lore: any, index: number) => {
        if (lore.importance && !validLoreImportance.includes(lore.importance)) {
          throw new Error(
            `Invalid lore importance at index ${index}: "${lore.importance}". Valid importance levels are: ${validLoreImportance.join(', ')}`
          );
        }
      });
    }
  }

  private generateFallbackCampaignContent(data: CampaignCreationData): any {
    return {
      summary: `A ${data.theme} campaign where adventurers explore a mysterious world filled with danger and opportunity.`,
      startingLocation:
        'A bustling town at the crossroads of several trade routes, where rumors of adventure abound.',
      factions: [
        {
          name: 'Merchants Guild',
          type: 'guild',
          alignment: 'Neutral',
          influence: 60,
          relationship: 'neutral',
          description: 'A powerful guild controlling trade in the region.',
        },
        {
          name: 'Royal Guard',
          type: 'noble house',
          alignment: 'Lawful Good',
          influence: 80,
          relationship: 'friendly',
          description: "The kingdom's military force maintaining order.",
        },
      ],
      threats: [
        {
          name: 'Bandit Raiders',
          type: 'organization',
          threatLevel: 'medium',
          description: 'Organized bandits preying on travelers.',
          location: 'Forest roads',
          status: 'active',
        },
      ],
      goals: [
        {
          description: 'Establish a base of operations in the region',
          completed: false,
          progress: 0,
        },
        {
          description: 'Uncover the source of recent disturbances',
          completed: false,
          progress: 0,
        },
      ],
      lore: [
        {
          category: 'History',
          title: 'The Founding',
          content: 'The town was founded by settlers seeking new opportunities.',
          discoveredBy: [],
          importance: 'common',
        },
      ],
    };
  }

  public async getCampaign(campaignId: string): Promise<ICampaign | null> {
    try {
      // Try to get from cache first
      const cacheKey = `campaign:${campaignId}`;
      const cached = await cacheService.get<ICampaign>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for campaign: ${campaignId}`);
        return cached;
      }

      // If not in cache, get from database
      const campaign = await Campaign.findById(campaignId);

      if (campaign) {
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, campaign, { ttl: 300 });
        logger.debug(`Cached campaign: ${campaignId}`);
      }

      return campaign;
    } catch (error) {
      logger.error('Error getting campaign:', error);
      throw error;
    }
  }

  public async getAllCampaigns(): Promise<ICampaign[]> {
    try {
      // Try to get from cache first
      const cacheKey = 'campaigns:all';
      const cached = await cacheService.get<ICampaign[]>(cacheKey);
      if (cached) {
        logger.debug('Cache hit for all campaigns');
        return cached;
      }

      // If not in cache, get from database
      const campaigns = await Campaign.find().sort({ createdAt: -1 });

      // Cache the result for 2 minutes
      await cacheService.set(cacheKey, campaigns, { ttl: 120 });
      logger.debug('Cached all campaigns');

      return campaigns;
    } catch (error) {
      logger.error('Error getting all campaigns:', error);
      throw error;
    }
  }

  public async getCampaignsByUser(userId: string): Promise<ICampaign[]> {
    try {
      // Try to get from cache first
      const cacheKey = `campaigns:user:${userId}`;
      const cached = await cacheService.get<ICampaign[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for campaigns by user: ${userId}`);
        return cached;
      }

      // If not in cache, get from database
      const campaigns = await Campaign.find({ createdBy: userId }).sort({ lastPlayed: -1 });

      // Cache the result for 3 minutes
      await cacheService.set(cacheKey, campaigns, { ttl: 180 });
      logger.debug(`Cached campaigns for user: ${userId}`);

      return campaigns;
    } catch (error) {
      logger.error('Error getting campaigns by user:', error);
      throw error;
    }
  }

  public async updateCampaign(
    campaignId: string,
    updateData: CampaignUpdateData
  ): Promise<ICampaign | null> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof CampaignUpdateData] !== undefined) {
          (campaign as any)[key] = updateData[key as keyof CampaignUpdateData];
        }
      });

      await campaign.save();

      // Invalidate related cache
      await this.invalidateCampaignCache(campaignId);

      logger.info(`Updated campaign: ${campaign.name}`);
      return campaign;
    } catch (error) {
      logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  public async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Soft delete - mark as archived
      campaign.status = 'archived';
      await campaign.save();

      // Invalidate related cache
      await this.invalidateCampaignCache(campaignId);

      logger.info(`Archived campaign: ${campaign.name}`);
    } catch (error) {
      logger.error('Error deleting campaign:', error);
      throw error;
    }
  }

  public async hardDeleteCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Import required models for cascading delete
      const { Session, Character, Location, Message, StoryEvent } = require('../models');

      // Delete all related data
      await Promise.all([
        Session.deleteMany({ campaignId }),
        Character.deleteMany({ campaignId }),
        Location.deleteMany({ campaignId }),
        Message.deleteMany({ campaignId }),
        StoryEvent.deleteMany({ campaignId }),
        Campaign.findByIdAndDelete(campaignId),
      ]);

      // Invalidate all related cache
      await this.invalidateCampaignCache(campaignId);

      logger.info(`Hard deleted campaign: ${campaign.name}`);
    } catch (error) {
      logger.error('Error hard deleting campaign:', error);
      throw error;
    }
  }

  // Private method to invalidate campaign-related cache
  private async invalidateCampaignCache(campaignId: string): Promise<void> {
    try {
      const patterns = [
        `campaign:${campaignId}`,
        'campaigns:all',
        'campaigns:user:*',
        `sessions:campaign:${campaignId}:*`,
        `characters:campaign:${campaignId}:*`,
        `quests:campaign:${campaignId}:*`,
      ];

      for (const pattern of patterns) {
        await cacheService.deletePattern(pattern);
      }

      logger.debug(`Cache invalidated for campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache for campaign ${campaignId}:`, error);
    }
  }

  public async addQuest(campaignId: string, questData: QuestData): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const questToAdd: any = {
        name: questData.name,
        description: questData.description,
        objectives: questData.objectives,
        difficulty: questData.difficulty,
        experienceReward: questData.experienceReward,
      };

      if (questData.timeLimit) {
        questToAdd.timeLimit = questData.timeLimit;
      }

      campaign.progress.activeQuests.push(questToAdd);

      await campaign.save();
      logger.info(`Added quest to campaign ${campaignId}: ${questData.name}`);
    } catch (error) {
      logger.error('Error adding quest:', error);
      throw error;
    }
  }

  public async completeQuest(campaignId: string, questName: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const questIndex = campaign.progress.activeQuests.findIndex((q: any) => q.name === questName);
      if (questIndex === -1) {
        throw new Error('Quest not found');
      }

      const quest = campaign.progress.activeQuests[questIndex];
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Move to completed quests
      campaign.progress.completedQuests.push({
        name: quest.name,
        description: quest.description,
        completedAt: new Date(),
        experienceReward: quest.experienceReward,
        itemsRewarded: [],
      });

      // Remove from active quests
      campaign.progress.activeQuests.splice(questIndex, 1);

      await campaign.save();
      logger.info(`Completed quest in campaign ${campaignId}: ${questName}`);
    } catch (error) {
      logger.error('Error completing quest:', error);
      throw error;
    }
  }

  public async addWorldEvent(campaignId: string, eventData: WorldEventData): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.worldState.worldEvents.push({
        title: eventData.title,
        description: eventData.description,
        impact: eventData.impact,
        resolved: false,
        timestamp: new Date(),
      });

      await campaign.save();
      logger.info(`Added world event to campaign ${campaignId}: ${eventData.title}`);
    } catch (error) {
      logger.error('Error adding world event:', error);
      throw error;
    }
  }

  public async resolveWorldEvent(campaignId: string, eventTitle: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const event = campaign.worldState.worldEvents.find((e: any) => e.title === eventTitle);
      if (!event) {
        throw new Error('World event not found');
      }

      event.resolved = true;
      await campaign.save();
      logger.info(`Resolved world event in campaign ${campaignId}: ${eventTitle}`);
    } catch (error) {
      logger.error('Error resolving world event:', error);
      throw error;
    }
  }

  public async addLocation(
    campaignId: string,
    locationData: {
      name: string;
      type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other';
      description: string;
      discovered: boolean;
      visited: boolean;
    }
  ): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.worldState.knownLocations.push(locationData);
      await campaign.save();
      logger.info(`Added location to campaign ${campaignId}: ${locationData.name}`);
    } catch (error) {
      logger.error('Error adding location:', error);
      throw error;
    }
  }

  public async updateLocation(
    campaignId: string,
    locationName: string,
    updateData: Partial<{
      description: string;
      discovered: boolean;
      visited: boolean;
    }>
  ): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const location = campaign.worldState.knownLocations.find((l: any) => l.name === locationName);
      if (!location) {
        throw new Error('Location not found');
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] !== undefined) {
          (location as any)[key] = updateData[key as keyof typeof updateData];
        }
      });

      await campaign.save();
      logger.info(`Updated location in campaign ${campaignId}: ${locationName}`);
    } catch (error) {
      logger.error('Error updating location:', error);
      throw error;
    }
  }

  public async addFaction(
    campaignId: string,
    factionData: {
      name: string;
      type:
        | 'guild'
        | 'noble house'
        | 'religious order'
        | 'mercenary company'
        | 'criminal syndicate'
        | 'other';
      alignment: string;
      influence: number;
      relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
      description: string;
    }
  ): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.worldState.factions.push(factionData);
      await campaign.save();
      logger.info(`Added faction to campaign ${campaignId}: ${factionData.name}`);
    } catch (error) {
      logger.error('Error adding faction:', error);
      throw error;
    }
  }

  public async updateFactionRelationship(
    campaignId: string,
    factionName: string,
    newRelationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied'
  ): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const faction = campaign.worldState.factions.find((f: any) => f.name === factionName);
      if (!faction) {
        throw new Error('Faction not found');
      }

      faction.relationship = newRelationship;
      await campaign.save();
      logger.info(
        `Updated faction relationship in campaign ${campaignId}: ${factionName} is now ${newRelationship}`
      );
    } catch (error) {
      logger.error('Error updating faction relationship:', error);
      throw error;
    }
  }

  public async getCampaignStats(campaignId: string): Promise<{
    totalSessions: number;
    totalPlayTime: number;
    characterCount: number;
    questsCompleted: number;
    questsActive: number;
    locationsDiscovered: number;
    worldEvents: number;
  }> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return {
        totalSessions: campaign.sessions.length,
        totalPlayTime: campaign.totalPlayTime,
        characterCount: campaign.characters.length,
        questsCompleted: campaign.progress.completedQuests.length,
        questsActive: campaign.progress.activeQuests.length,
        locationsDiscovered: campaign.worldState.knownLocations.filter((l: any) => l.discovered)
          .length,
        worldEvents: campaign.worldState.worldEvents.length,
      };
    } catch (error) {
      logger.error('Error getting campaign stats:', error);
      throw error;
    }
  }

  public async generateStoryHook(campaignId: string, context: string): Promise<string> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const prompt = `
      You are the Dungeon Master for a D&D campaign called "${campaign.name}" with the theme "${campaign.theme}".

      Current context: ${context}

      Generate a brief story hook or plot development (2-3 sentences) that fits the campaign theme and current situation.
      Make it engaging and provide clear direction for the players.
      `;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_response',
      });

      if (!response.success) {
        throw new Error('Failed to generate story hook: ' + response.error);
      }

      return response.content;
    } catch (error) {
      logger.error('Error generating story hook:', error);
      return 'The adventure continues with new challenges and opportunities...';
    }
  }

  public async initializeCampaign(
    campaignId: string,
    sessionId: string,
    characterIds?: string[]
  ): Promise<{
    message: string;
    content: string;
    metadata: any;
  }> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get character information if provided
      let characterContext = '';
      if (characterIds && characterIds.length > 0) {
        const Character = require('../models').Character;
        const characters = await Promise.all(characterIds.map(id => Character.findById(id)));
        const validCharacters = characters.filter(char => char !== null);

        if (validCharacters.length > 0) {
          characterContext = `
          The party consists of:
          ${validCharacters
            .map(char => `- ${char.name}, a ${char.race} ${char.class} (Level ${char.level})`)
            .join('\n')}
          `;
        }
      }

      const prompt = `
      You are the Dungeon Master for a new D&D campaign called "${campaign.name}".

      Campaign Theme: ${campaign.theme}
      Campaign Description: ${campaign.description}

      ${characterContext}

      This is the very beginning of the campaign. Create an engaging opening scene that:
      1. Sets the atmosphere and tone for the campaign theme with vivid descriptions
      2. Introduces the starting location and immediate surroundings in detail
      3. Presents an initial hook or situation that draws the characters in
      4. Gives the players a clear sense of what they can do next
      5. Makes them excited to start their adventure
      6. Includes sensory details (sights, sounds, smells, atmosphere)
      7. Mentions any immediate NPCs or creatures they might encounter
      8. Hints at the broader world and potential adventures ahead

      Write this as a Dungeon Master would speak to players at the start of a session.
      Be descriptive, engaging, atmospheric, and immersive.
      End with a question or prompt for player action.
      Keep it to 4-5 paragraphs for a rich opening experience.

      For fantasy campaigns, include elements like:
      - Weather and time of day
      - Local landmarks and points of interest
      - Sounds of the environment (wind, water, wildlife, etc.)
      - Cultural details and local customs
      - Potential dangers or opportunities
      `;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_response',
        forceModel: 'pro',
      });

      if (!response.success) {
        throw new Error('Failed to initialize campaign: ' + response.error);
      }

      // Check if the AI response content is empty and provide a fallback
      let campaignContent = response.content;
      if (!campaignContent || campaignContent.trim() === '') {
        campaignContent = `Welcome to your adventure in ${campaign.name}!

The campaign begins in a world of ${campaign.theme.toLowerCase()}. ${campaign.description}

Your journey starts now. What would you like to do first?`;
      }

      // Don't create a new Session here - the session should already exist
      // Just return the campaign initialization content
      logger.info(`Campaign ${campaignId} initialized successfully for session ${sessionId}`);

      return {
        message: 'Campaign initialized successfully',
        content: campaignContent,
        metadata: {
          campaignId,
          sessionId,
          characterIds,
          theme: campaign.theme,
          description: campaign.description,
        },
      };
    } catch (error) {
      logger.error('Error initializing campaign:', error);
      return {
        message: 'Failed to initialize campaign',
        content:
          'Welcome to your adventure! The journey begins now, though the details remain shrouded in mystery. What would you like to do first?',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        },
      };
    }
  }
}

export default CampaignService;
