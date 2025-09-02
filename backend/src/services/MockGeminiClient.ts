import { GeminiResponse, GeminiRequest, ILLMClient } from './GeminiClient';
import logger from './LoggerService';
import { config } from '../config';
import PerformanceTracker from './PerformanceTracker';

export class MockGeminiClient implements ILLMClient {
  private performanceTracker: PerformanceTracker;

  constructor() {
    this.performanceTracker = PerformanceTracker.getInstance();
  }

  /**
   * Send a prompt with automatic three-model selection and fallback
   */
  async sendPrompt(request: GeminiRequest): Promise<GeminiResponse> {
    const taskId = this.generateTaskId();
    let selectedModel: 'flash-lite' | 'flash' | 'pro';
    const fallbackUsed = false;
    const startTime = Date.now();

    try {
      // Determine which model to use
      if (request.forceModel) {
        selectedModel = request.forceModel;
        logger.info('Using forced model selection', {
          taskId,
          model: selectedModel,
        });
      } else if (config.gemini.modelSelectionEnabled) {
        // Use the same model selection logic as the real client
        selectedModel = this.selectModelForTask(request.taskType || 'unknown');
        logger.info('Model selection completed', {
          taskId,
          selectedModel,
          reason: 'Mock service model selection',
        });
      } else {
        // Fallback to Flash-Lite if model selection is disabled (most cost-effective)
        selectedModel = 'flash-lite';
        logger.info('Model selection disabled, using Flash-Lite model', { taskId });
      }

      // Start performance tracking
      this.performanceTracker.startTask(taskId, request.taskType || 'unknown', selectedModel);

      // Make request to mock service
      const response = await this.callMockService(request, selectedModel);

      // Track performance
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.performanceTracker.completeTask(taskId, responseTime, true);

      logger.info('Mock LLM response generated successfully', {
        taskId,
        model: selectedModel,
        responseTime,
        fallbackUsed,
        tokenCount: response.content.length,
      });

      return {
        ...response,
        modelUsed: selectedModel,
        responseTime,
        fallbackUsed,
      };
    } catch (error) {
      // Track failed performance
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.performanceTracker.completeTask(taskId, responseTime, false);

      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error communicating with Mock LLM service:', error);

      return {
        success: false,
        content:
          'I apologize, but I am experiencing technical difficulties. Please try again in a moment.',
        error: errorMessage,
        modelUsed: selectedModel,
        responseTime,
        fallbackUsed,
      };
    }
  }

  /**
   * Call the mock LLM service
   */
  private async callMockService(
    request: GeminiRequest,
    model: 'flash-lite' | 'flash' | 'pro'
  ): Promise<GeminiResponse> {
    const mockServiceUrl = config.gemini.serviceUrl;
    const startTime = Date.now();

    try {
      const response = await fetch(`${mockServiceUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          forceModel: model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mock service error: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as any;

      // Ensure the response matches GeminiResponse interface
      if (result.success === false) {
        return {
          success: false,
          content: result.error || 'Unknown error',
          error: result.error,
          modelUsed: model,
          responseTime: Date.now() - startTime,
          fallbackUsed: false,
        };
      }

      return {
        success: true,
        content: result.content || result.message || 'Generated content',
        modelUsed: model,
        responseTime: Date.now() - startTime,
        fallbackUsed: false,
        usage: {
          promptTokens: 0,
          responseTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to call mock service:', error);
      throw error;
    }
  }

  /**
   * Select model based on task type
   */
  private selectModelForTask(taskType: string): 'flash-lite' | 'flash' | 'pro' {
    const modelMapping: Record<string, 'flash-lite' | 'flash' | 'pro'> = {
      character_generation: 'flash',
      campaign_scenario_generation: 'flash',
      story_response: 'pro',
      skill_check_result: 'flash-lite',
      context_compression: 'flash-lite',
      character_extraction: 'flash-lite',
      location_extraction: 'flash-lite',
      connection_test: 'flash-lite',
    };

    return modelMapping[taskType] || 'flash-lite';
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `mock_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a character description based on role and campaign theme
   */
  async generateCharacter(
    role: string,
    campaignTheme: string,
    partyComposition: string[]
  ): Promise<GeminiResponse> {
    const prompt = `You are a Dungeon Master creating a D&D 5e character for a ${campaignTheme} campaign.

Role: ${role}
Existing party members: ${partyComposition.join(', ')}

Generate a complete character with:
1. Name, race, class, and background
2. Personality traits and motivations
3. Brief backstory (2-3 sentences)
4. Key abilities and specializations
5. Character voice/style for roleplay

Make the character fit the campaign theme and complement the existing party. Keep the response concise but detailed enough for gameplay.`;

    return this.sendPrompt({
      prompt,
      temperature: 0.8,
      taskType: 'character_generation',
    });
  }

  /**
   * Generate a campaign scenario based on theme
   */
  async generateScenario(
    campaignTheme: string,
    partyLevel: number,
    partySize: number
  ): Promise<GeminiResponse> {
    const prompt = `You are a Dungeon Master creating a D&D 5e scenario for a ${campaignTheme} campaign.

Party Details:
- Level: ${partyLevel}
- Size: ${partySize} characters

Generate a compelling scenario including:
1. Setting and atmosphere
2. Main objective or quest
3. Key NPCs and their motivations
4. Potential challenges and encounters
5. Hooks for character engagement

Make it appropriate for the party level and theme. Keep the response focused and actionable for immediate gameplay.`;

    return this.sendPrompt({
      prompt,
      temperature: 0.7,
      taskType: 'campaign_scenario_generation',
    });
  }

  /**
   * Generate a story response based on player action
   */
  async generateStoryResponse(
    playerAction: string,
    campaignContext: string,
    characterContext: string,
    worldState: string
  ): Promise<GeminiResponse> {
    const prompt = `You are the Dungeon Master responding to a player's action in a D&D campaign.

Player Action: "${playerAction}"

Campaign Context: ${campaignContext}
Character Context: ${characterContext}
Current World State: ${worldState}

Respond with a vivid, engaging story description that:
1. Describes the immediate consequences of the player's action
2. Paints a vivid picture of the scene and surroundings
3. Introduces any new characters or NPCs naturally
4. Provides clear next steps or choices for the player
5. Maintains the campaign's tone and atmosphere

Focus on storytelling and immersion. Don't worry about extracting character information - that will be handled separately.`;

    return this.sendPrompt({
      prompt,
      temperature: 0.8,
      taskType: 'story_response',
    });
  }

  /**
   * Generate a skill check result description
   */
  async generateSkillCheckResult(
    skillName: string,
    rollResult: number,
    targetDC: number,
    actionDescription: string,
    context: string
  ): Promise<GeminiResponse> {
    const success = rollResult >= targetDC;
    const critical = rollResult === 20 || rollResult === 1;

    const prompt = `You are the Dungeon Master describing the result of a skill check.

Skill: ${skillName}
Roll Result: ${rollResult}
Target DC: ${targetDC}
Action: ${actionDescription}
Context: ${context}

Result: ${success ? 'Success' : 'Failure'}${critical ? ' (Critical!)' : ''}

Generate a vivid, engaging description of what happens as a result of this ${skillName} check. Include:
1. Immediate visual and sensory details
2. Consequences of success/failure
3. How this affects the current situation
4. What the player learns or discovers
5. Clear next steps or choices

Make it cinematic and engaging while maintaining game balance.`;

    return this.sendPrompt({
      prompt,
      temperature: 0.7,
      taskType: 'skill_check_result',
    });
  }

  /**
   * Summarize story events for context compression
   */
  async summarizeStoryEvents(events: string[], maxLength: number = 500): Promise<GeminiResponse> {
    const prompt = `You are summarizing key story events for a D&D campaign to maintain context.

Events to summarize:
${events.map((event, i) => `${i + 1}. ${event}`).join('\n')}

Create a concise summary (max ${maxLength} characters) that:
1. Captures the most important story beats
2. Maintains character development details
3. Preserves key world state changes
4. Highlights consequences and relationships
5. Sets up the current situation

Focus on what's most relevant for continuing the story.`;

    return this.sendPrompt({
      prompt,
      temperature: 0.5,
      taskType: 'context_compression',
    });
  }

  /**
   * Check if the API key is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendPrompt({
        prompt: 'Respond with "OK" if you can read this message.',
        taskType: 'connection_test',
      });
      return response.success && response.content.includes('OK');
    } catch (error) {
      logger.error('Mock LLM service connection test failed:', error);
      return false;
    }
  }

  /**
   * Extract character information from a story response using Mock LLM service
   */
  async extractCharacterInformation(
    storyContent: string,
    originalPrompt: string
  ): Promise<GeminiResponse> {
    const prompt = `You are analyzing a D&D story response to extract character information.

STORY CONTENT:
${storyContent}

ORIGINAL PROMPT:
${originalPrompt}

Your task is to identify any NEW characters mentioned in the story and extract their information.

IMPORTANT RULES:
1. Only extract characters that are NEWLY mentioned (not existing party members)
2. Use the EXACT character name as mentioned in the story
3. Infer race and class from context clues in the story
4. If no new characters are mentioned, return an empty array
5. **CRITICAL: Do NOT extract location names, building names, or place names as characters**
6. **CRITICAL: Only extract living beings (people, creatures, monsters, NPCs) that can act and interact**
7. **CRITICAL: Exclude: castles, towns, cities, dungeons, temples, shops, taverns, landmarks, or any place names**

Examples of what to EXCLUDE:
- "Castle Blackstone" (this is a location, not a character)
- "The Red Dragon Inn" (this is a building, not a character)
- "The Misty Forest" (this is a place, not a character)
- "The Ancient Temple" (this is a structure, not a character)

Examples of what to INCLUDE:
- "Thrain Ironbeard" (dwarf wizard - this is a character)
- "Sylvan Whisperwind" (elven ranger - this is a character)
- "The mysterious figure" (if described as a person/creature)
- "A goblin scout" (if described as a creature)

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Exact Character Name as Mentioned",
    "race": "Inferred Race",
    "class": "Inferred Class",
    "level": 1,
    "characterType": "ai",
    "attributes": {
      "strength": 10,
      "dexterity": 10,
      "constitution": 10,
      "intelligence": 10,
      "wisdom": 10,
      "charisma": 10
    },
    "hitPoints": {
      "maximum": 4,
      "current": 4,
      "temporary": 0
    },
    "armorClass": 10,
    "speed": 30,
    "personality": {
      "traits": ["Inferred trait from story"],
      "ideals": ["Inferred ideal from story"],
      "bonds": ["Inferred bond from story"],
      "flaws": ["Inferred flaw from story"],
      "background": "Brief background inferred from story context",
      "alignment": "neutral"
    },
    "aiPersonality": {
      "goals": ["Inferred goal from story"],
      "fears": ["Inferred fear from story"],
      "background": "Brief background based on story mention"
    }
  }
]

If no new characters, return: []

Be precise and only extract living beings that can act and interact. Do not extract place names, building names, or location references.`;

    return this.sendPrompt({
      prompt,
      taskType: 'character_extraction',
      forceModel: 'flash-lite', // Use Flash-Lite for this specific task
    });
  }

  /**
   * Extract location information from a story response using Mock LLM service
   */
  async extractLocationInformation(
    storyContent: string,
    originalPrompt: string
  ): Promise<GeminiResponse> {
    const prompt = `You are analyzing a D&D story response to extract ONLY SIGNIFICANT location information.

STORY CONTENT:
${storyContent}

ORIGINAL PROMPT:
${originalPrompt}

Your task is to identify any NEW SIGNIFICANT locations mentioned in the story and extract their information.

IMPORTANT RULES:
1. Only extract locations that are NEWLY mentioned (not previously visited places)
2. Use the EXACT location name as mentioned in the story
3. Infer location type and details from context clues in the story
4. If no new significant locations are mentioned, return an empty array
5. **CRITICAL: Extract ONLY SIGNIFICANT locations, including:**
   - Castles, fortresses, towers, citadels (e.g., "Castle Blackstone", "The Iron Tower", "Citadel of the Sun")
   - Towns, cities, villages, settlements, metropolises (e.g., "Waterdeep", "The Village of Hommlet", "Neverwinter", "Baldur's Gate")
   - Dungeons, caves, ruins, ancient complexes (e.g., "The Lost Mine of Phandelver", "Ancient Ruins", "The Underdark")
   - Major wilderness areas, forests, mountains, regions (e.g., "The Misty Forest", "Mount Hotenow", "The Sword Coast")
   - Notable shops, taverns, inns with names (e.g., "The Red Dragon Inn", "Blacksmith's Forge", "The Prancing Pony")
   - Temples, shrines, religious sites, holy places (e.g., "The Temple of Lathander", "Sacred Grove", "The High Cathedral")
   - Landmarks, monuments, special places of importance (e.g., "The Standing Stones", "The Crystal Cave", "The World Tree")

6. **CRITICAL: DO NOT extract generic or insignificant locations:**
   - Generic alleys, streets, or paths (e.g., "narrow alley", "dark street", "hidden path", "King's Way")
   - Generic walls, doors, or architectural features (e.g., "warehouse wall", "stone door", "wooden gate", "warehouse")
   - Generic rooms or areas within buildings (e.g., "main hall", "storage room", "corridor")
   - Generic outdoor areas (e.g., "clearing", "meadow", "hillside", "nearby harbor")
   - Temporary or transient locations (e.g., "camp", "resting place", "stopping point")
   - Generic city areas without specific names (e.g., "the Gutters", "downtown", "market district")

7. **CRITICAL: Look for both explicit names and descriptive significant locations**
8. **CRITICAL: If a location is mentioned with a name, extract it only if it's significant**

Examples of what to INCLUDE (significant locations):
- "Castle Blackstone" (named fortress)
- "The City of Neverwinter" (named city)
- "The Red Dragon Inn" (named establishment)
- "The Temple of Lathander" (named religious site)
- "The Misty Forest" (named wilderness region)
- "Baldur's Gate" (major city)
- "Myth Drannor" (ancient ruins)

Examples of what to EXCLUDE (insignificant locations):
- "narrow alley" (generic feature)
- "warehouse wall" (generic architectural element)
- "warehouse" (generic building)
- "King's Way" (generic path/road)
- "nearby harbor" (generic area)
- "the Gutters" (generic city area)
- "dark corner" (generic area)
- "stone path" (generic path)
- "small clearing" (generic outdoor area)

**CRITICAL: You MUST return ONLY a valid JSON array. Do NOT include any text before or after the JSON.**

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Exact Location Name as Mentioned",
    "description": "Brief description of the location based on story context",
    "type": "settlement|dungeon|wilderness|landmark|shop|tavern|temple|castle|other",
    "importance": "minor|moderate|major|critical",
    "tags": ["tag1", "tag2"],
    "coordinates": {
      "x": 0,
      "y": 0,
      "region": "Inferred region name"
    },
    "climate": "Inferred climate from story context",
    "terrain": "Inferred terrain type from story context",
    "lighting": "Inferred lighting conditions",
    "weather": "Inferred weather conditions",
    "resources": ["resource1", "resource2"],
    "pointsOfInterest": [
      {
        "name": "Point of interest name",
        "description": "Brief description",
        "type": "Type of point of interest",
        "isExplored": false
      }
    ]
  }
]

**CRITICAL: The response must be ONLY the JSON array. No explanations, no additional text.**
**CRITICAL: Ensure all arrays and objects are properly formatted as JSON.**
**CRITICAL: If no new significant locations, return exactly: []**

Be selective and only extract locations that are truly significant to the story and world-building. Focus on named places, major landmarks, and locations that characters would remember and return to.`;

    return this.sendPrompt({
      prompt,
      taskType: 'location_extraction',
      forceModel: 'flash-lite', // Use Flash-Lite for this specific task
    });
  }
}

export default MockGeminiClient;
