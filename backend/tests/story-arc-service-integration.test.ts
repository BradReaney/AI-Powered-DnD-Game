import request from 'supertest';
import { Types } from 'mongoose';
import App from '../src/app';
import { StoryArc } from '../src/models/StoryArc';
import Campaign from '../src/models/Campaign';

const app = new App();
const expressApp = app.app;

describe('Story Arc Integration Tests', () => {
  let testCampaignId: string;
  let testStoryArcId: string;
  let testCharacterId: string;
  let testQuestId: string;

  beforeAll(async () => {
    // Create a test campaign
    const campaign = await Campaign.create({
      name: 'Integration Test Campaign',
      theme: 'fantasy',
      description: 'A test campaign for integration testing',
      status: 'active',
      createdBy: 'test-user',
      settings: {
        aiBehavior: {
          creativity: 'medium',
          detailLevel: 'moderate',
          pacing: 'normal',
          combatStyle: 'balanced',
          roleplayDepth: 'moderate',
        },
        rules: {
          houseRules: [],
          customMechanics: [],
          variantRules: [],
          restrictions: [],
          bonuses: [],
        },
        playerSettings: {
          playerPermissions: {
            canCreateCharacters: true,
            canModifyWorld: false,
            canManageSessions: false,
            canInvitePlayers: false,
          },
          maxPlayers: 6,
          allowNewPlayers: true,
        },
        customization: {
          allowCharacterRespec: false,
          allowRetconning: false,
          allowTimeTravel: false,
          allowParallelTimelines: false,
          savePoints: false,
        },
        difficulty: 'easy',
        maxLevel: 10,
        startingLevel: 1,
        experienceRate: 'normal',
        magicLevel: 'medium',
        technologyLevel: 'medieval',
      },
      worldState: {
        currentLocation: 'Test Town',
        knownLocations: [],
        factions: [],
        activeThreats: [],
        worldEvents: [],
      },
      progress: {
        currentChapter: 1,
        totalChapters: 10,
        completedQuests: [],
        activeQuests: [],
        campaignGoals: [],
      },
      storyContext: {
        campaignSummary: 'A test campaign for integration testing',
        currentScene: 'The adventure begins...',
        storyHistory: [],
        npcDatabase: [],
        worldLore: [],
      },
    });

    testCampaignId = campaign._id.toString();

    // Create a test character
    const character = {
      name: 'Test Character',
      characterType: 'human',
      race: 'Human',
      class: 'Fighter',
      level: 1,
      experience: 0,
      armorClass: 12,
      initiative: 0,
      speed: 30,
      attributes: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      hitPoints: {
        maximum: 10,
        current: 10,
        temporary: 0,
      },
      personality: {
        traits: ['Brave', 'Determined'],
        ideals: ['Honor', 'Duty'],
        bonds: ['Loyal to companions'],
        flaws: ['Sometimes too trusting'],
        background: 'Adventurer',
        alignment: 'Neutral Good',
      },
      aiPersonality: {
        memory: {
          importantEvents: [],
          characterDevelopment: [],
          worldKnowledge: [],
        },
        goals: [],
        fears: [],
      },
      equipment: {
        weapons: [],
        armor: null,
        items: [],
      },
      currentLocation: {
        arrivedAt: new Date(),
      },
      campaignId: testCampaignId,
      sessionId: null,
      isActive: true,
      createdBy: 'test-user',
    };

    const characterResponse = await request(expressApp).post('/api/characters').send(character);

    testCharacterId = characterResponse.body._id;

    // Create a test quest
    const questResponse = await request(expressApp)
      .post(`/api/quests/campaign/${testCampaignId}`)
      .send({
        name: 'Test Quest',
        description: 'A test quest for integration testing',
        type: 'main',
        difficulty: 'medium',
        objectives: [
          {
            description: 'Complete the test objective',
            completed: false,
          },
        ],
        rewards: {
          experience: 500,
          items: ['Test Item'],
          reputation: 25,
        },
      });

    testQuestId = questResponse.body.questId;
  });

  afterAll(async () => {
    // Clean up test data
    await StoryArc.deleteOne({ campaignId: testCampaignId });
    await Campaign.deleteOne({ _id: testCampaignId });
  });

  describe('Story Arc Creation', () => {
    it('should create a story arc for a campaign', async () => {
      const response = await request(expressApp).post('/api/story-arcs').send({
        campaignId: testCampaignId,
        theme: 'The Test Quest',
        tone: 'serious',
        pacing: 'normal',
        totalChapters: 5,
        storyPhase: 'setup',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.theme).toBe('The Test Quest');
      expect(response.body.data.storyBeats).toHaveLength(2); // Auto-generated beats

      testStoryArcId = response.body.data._id;
    });

    it('should retrieve a story arc by campaign ID', async () => {
      const response = await request(expressApp).get(`/api/story-arcs/campaign/${testCampaignId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testStoryArcId);
    });
  });

  describe('Character Milestone Integration', () => {
    it('should add a character milestone to a story arc', async () => {
      // First get the story arc to get the story beat ID
      const storyArcResponse = await request(expressApp).get(
        `/api/story-arcs/campaign/${testCampaignId}`
      );

      const storyBeatId = storyArcResponse.body.data.storyBeats[0].id;

      const response = await request(expressApp)
        .post(`/api/story-arcs/${testStoryArcId}/character-milestones`)
        .send({
          characterId: testCharacterId,
          type: 'level',
          title: 'Level Up to 2',
          description: 'Character gained enough experience to reach level 2',
          impact: 'moderate',
          storyBeatId: storyBeatId,
          achievedAt: new Date(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.characterMilestones).toHaveLength(1);
      expect(response.body.data.characterMilestones[0].title).toBe('Level Up to 2');
    });
  });

  describe('Quest-Story Integration', () => {
    it('should add quest progress to a story arc', async () => {
      // First get the story arc to get the story beat ID
      const storyArcResponse = await request(expressApp).get(
        `/api/story-arcs/campaign/${testCampaignId}`
      );

      const storyBeatId = storyArcResponse.body.data.storyBeats[0].id;

      const response = await request(expressApp)
        .put(`/api/story-arcs/${testStoryArcId}/quest-progress`)
        .send({
          questId: testQuestId,
          name: 'Test Quest',
          type: 'setup',
          status: 'active',
          storyBeatId: storyBeatId,
          objectives: [
            {
              description: 'Complete the test objective',
              completed: false,
            },
          ],
          storyImpact: 'major',
          characterDevelopment: [testCharacterId],
          worldChanges: ['Quest started'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questProgress).toHaveLength(1);
      expect(response.body.data.questProgress[0].name).toBe('Test Quest');
    });
  });

  describe('Story Arc Validation', () => {
    it('should validate a story arc and return detailed results', async () => {
      const response = await request(expressApp).post(`/api/story-arcs/${testStoryArcId}/validate`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.results).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
    });
  });

  describe('Context Management Integration', () => {
    it('should select context including story arc data', async () => {
      const response = await request(expressApp)
        .post('/api/dynamic-context/select')
        .send({
          campaignId: testCampaignId,
          criteria: {
            includeStoryArc: true,
            includeCharacterMilestones: true,
            includeQuestProgress: true,
            includeWorldStateChanges: true,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.selectionReasoning).toBeDefined();
      expect(response.body.data.performanceMetrics).toBeDefined();
    });
  });

  describe('Performance Optimization Integration', () => {
    it('should optimize story arc performance', async () => {
      const response = await request(expressApp).post('/api/performance/optimize-story-arc').send({
        campaignId: testCampaignId,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.optimizations).toBeDefined();
      expect(response.body.data.performanceGain).toBeDefined();
    });
  });

  describe('Story Arc Progression', () => {
    it('should get story progression data', async () => {
      const response = await request(expressApp).get(
        `/api/story-arcs/${testStoryArcId}/progression`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get current story beat', async () => {
      const response = await request(expressApp).get(
        `/api/story-arcs/${testStoryArcId}/current-story-beat`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Story Arc Suggestions', () => {
    it('should generate story beat suggestions', async () => {
      const response = await request(expressApp)
        .post(`/api/story-arcs/${testStoryArcId}/suggestions`)
        .send({
          type: 'story-beat',
          context: 'The party is ready for their next adventure',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid story arc ID', async () => {
      const response = await request(expressApp).get('/api/story-arcs/campaign/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent story arc', async () => {
      const fakeId = new Types.ObjectId().toString();
      const response = await request(expressApp).get(`/api/story-arcs/campaign/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
