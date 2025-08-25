import { GeminiRequest, GeminiResponse, MockServiceConfig } from '../types';

export class MockResponseService {
  private config: MockServiceConfig;

  constructor(config: MockServiceConfig) {
    this.config = config;
  }

  /**
   * Generate a mock response based on the request
   */
  async generateResponse(request: GeminiRequest): Promise<GeminiResponse> {
    // Simulate processing delay
    if (this.config.delay > 0) {
      await this.sleep(this.config.delay);
    }

    // Simulate random failures
    if (Math.random() < this.config.failureRate) {
      return this.generateErrorResponse();
    }

    const startTime = Date.now();
    let content: string;
    let modelUsed: 'flash-lite' | 'flash' | 'pro' = 'flash-lite';

    try {
      // Determine which model to use
      if (request.forceModel) {
        modelUsed = request.forceModel;
      } else if (request.taskType) {
        modelUsed = this.selectModelForTask(request.taskType);
      }

      // Generate content based on task type
      content = await this.generateContentByTaskType(request, modelUsed);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        content,
        modelUsed,
        responseTime,
        fallbackUsed: false,
        usage: {
          promptTokens: Math.floor(request.prompt.length / 4),
          responseTokens: Math.floor(content.length / 4),
          totalTokens: Math.floor((request.prompt.length + content.length) / 4)
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        content: 'I apologize, but I am experiencing technical difficulties. Please try again in a moment.',
        error: error instanceof Error ? error.message : String(error),
        modelUsed,
        responseTime,
        fallbackUsed: false
      };
    }
  }

  /**
   * Generate content based on task type
   */
  private async generateContentByTaskType(request: GeminiRequest, model: 'flash-lite' | 'flash' | 'pro'): Promise<string> {
    const taskType = request.taskType || 'general';

    switch (taskType) {
      case 'character_generation':
        return this.generateCharacterResponse();
      case 'campaign_scenario_generation':
        return this.generateScenarioResponse();
      case 'story_response':
        return this.generateStoryResponse();
      case 'skill_check_result':
        return this.generateSkillCheckResult();
      case 'context_compression':
        return this.generateContextCompressionResponse();
      case 'character_extraction':
        return this.generateCharacterExtractionResponse();
      case 'location_extraction':
        return this.generateLocationExtractionResponse();
      case 'connection_test':
        return 'OK';
      default:
        return this.generateGeneralResponse(model);
    }
  }

  /**
   * Generate character generation response
   */
  private generateCharacterResponse(): string {
    const names = ['Aldric', 'Seraphina', 'Marcus', 'Isabella', 'Thaddeus'];
    const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling'];
    const classes = ['Fighter', 'Wizard', 'Cleric', 'Rogue', 'Paladin', 'Warlock'];

    const name = names[Math.floor(Math.random() * names.length)] || 'Adventurer';
    const race = races[Math.floor(Math.random() * races.length)] || 'Human';
    const className = classes[Math.floor(Math.random() * classes.length)] || 'Fighter';

    return `**${name}** - ${race} ${className}

**Personality:** Brave and determined, always ready to face danger head-on

**Background:** Former adventurer who left their homeland to seek fortune and glory

**Campaign Fit:** This character is perfectly suited for a fantasy campaign. Their ${className.toLowerCase()} abilities and ${race.toLowerCase()} heritage provide unique advantages in this setting.

**Roleplay Style:** Direct and action-oriented, preferring deeds over words

**Key Abilities:** Combat mastery, tactical thinking, and physical resilience

**Motivation:** To become a legendary hero and protect the realm`;
  }

  /**
   * Generate campaign scenario response
   */
  private generateScenarioResponse(): string {
    return `**The Lost Artifact of the Ancients** - A fantasy scenario for 4 level 5 characters

**Setting:** A mystical forest where ancient magic still lingers

**Main Objective:** Recover a powerful artifact before it falls into evil hands

**Key NPCs:**
- **Elder Thorne**: A wise druid who knows the forest's secrets
- **Captain Valeria**: A noble knight leading the artifact hunt

**Challenges & Encounters:**
- Navigate the enchanted forest
- Solve ancient puzzles
- Face corrupted guardians

**Character Engagement Hooks:**
- The artifact's power could save the realm
- Ancient knowledge awaits discovery

**Expected Duration:** 2-3 sessions

**Difficulty:** Challenging for a party of this level`;
  }

  /**
   * Generate story response
   */
  private generateStoryResponse(): string {
    return `The ancient forest stretches before you, its towering trees creating a natural canopy that filters the sunlight into dappled patterns on the forest floor. The air is thick with the scent of earth and the distant sound of rustling leaves echoes through the undergrowth.

As you move forward, the world around you responds with the weight of your quest. Every choice you make shapes the story, and the consequences of your actions ripple through the narrative like stones cast into a still pond.

The path ahead splits into three directions, each leading to different possibilities and challenges. Your decision will determine not only your immediate fate but also the course of the entire adventure.`;
  }

  /**
   * Generate skill check result response
   */
  private generateSkillCheckResult(): string {
    const skills = ['Perception', 'Investigation', 'Athletics', 'Stealth', 'Persuasion', 'Arcana'];
    const skillName = skills[Math.floor(Math.random() * skills.length)];

    return `Your ${skillName} expertise proves invaluable as you spot the hidden detail. The careful observation reveals a hidden passage that could lead to your goal.

**Critical Success!** Your ${skillName} mastery shines through, achieving results beyond normal expectations.`;
  }

  /**
   * Generate context compression response
   */
  private generateContextCompressionResponse(): string {
    return 'The party successfully navigated the enchanted forest, discovered the ancient temple, and recovered the first artifact. They learned about the dark forces seeking the remaining items and must now decide whether to continue their quest or return to safety.';
  }

  /**
   * Generate character extraction response
   */
  private generateCharacterExtractionResponse(): string {
    return '[]';
  }

  /**
   * Generate location extraction response
   */
  private generateLocationExtractionResponse(): string {
    return '[]';
  }

  /**
   * Generate general response
   */
  private generateGeneralResponse(model: 'flash-lite' | 'flash' | 'pro'): string {
    let content = 'The mystical realm unfolds before you, filled with endless possibilities and wondrous discoveries waiting to be made.';

    // Adjust complexity based on model
    if (model === 'pro') {
      content += '\n\nThe situation is more complex than it initially appears, with layers of meaning and consequence that will become clear as the story unfolds.';
    }

    return content;
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(): GeminiResponse {
    const errorTypes = [
      'API quota exceeded',
      'Network timeout',
      'Service temporarily unavailable',
      'Rate limit exceeded',
      'Internal server error'
    ];

    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)] || 'Unknown error';

    return {
      success: false,
      content: 'I apologize, but I am experiencing technical difficulties. Please try again in a moment.',
      error: errorType,
      modelUsed: 'flash-lite',
      responseTime: 1000,
      fallbackUsed: false
    };
  }

  /**
   * Helper methods
   */
  private selectModelForTask(taskType: string): 'flash-lite' | 'flash' | 'pro' {
    const modelMapping: Record<string, 'flash-lite' | 'flash' | 'pro'> = {
      'character_generation': 'flash',
      'campaign_scenario_generation': 'flash',
      'story_response': 'pro',
      'skill_check_result': 'flash-lite',
      'context_compression': 'flash-lite',
      'character_extraction': 'flash-lite',
      'location_extraction': 'flash-lite',
      'connection_test': 'flash-lite'
    };

    return modelMapping[taskType] || 'flash-lite';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
