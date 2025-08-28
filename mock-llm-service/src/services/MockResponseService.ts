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

    return `{
  "name": "${name}",
  "race": "${race}",
  "class": "${className}",
  "archetype": "${className}",
  "attributes": {
    "strength": 14,
    "dexterity": 16,
    "constitution": 12,
    "intelligence": 10,
    "wisdom": 14,
    "charisma": 8
  },
  "personality": {
    "traits": ["Brave", "Determined", "Loyal"],
    "ideals": ["Protection", "Justice", "Honor"],
    "bonds": ["Homeland", "Companions", "Oath"],
    "flaws": ["Impatient", "Stubborn", "Reckless"],
    "background": "Former adventurer who left their homeland to seek fortune and glory. This character is perfectly suited for a fantasy campaign with their ${className.toLowerCase()} abilities and ${race.toLowerCase()} heritage providing unique advantages.",
    "alignment": "Lawful Good"
  }
}`;
  }

  /**
   * Generate campaign scenario response
   */
  private generateScenarioResponse(): string {
    return `{
  "summary": "A mystical fantasy campaign where ancient magic lingers in an enchanted forest. Players must recover a powerful artifact before it falls into evil hands, navigating through corrupted guardians and solving ancient puzzles.",
  "startingLocation": "The village of Eldertree, nestled at the edge of the Whispering Woods. This ancient settlement serves as the last bastion of civilization before the enchanted forest, with its mystical aura and mysterious inhabitants.",
  "factions": [
    {
      "name": "Circle of the Ancient Oak",
      "type": "religious order",
      "alignment": "Neutral Good",
      "influence": 85,
      "relationship": "friendly",
      "description": "A druidic order dedicated to preserving the natural balance and ancient knowledge of the forest."
    },
    {
      "name": "House Valerian",
      "type": "noble house",
      "alignment": "Lawful Good",
      "influence": 75,
      "relationship": "allied",
      "description": "A noble family that has protected the realm for generations, now leading the artifact hunt."
    },
    {
      "name": "The Shadow Syndicate",
      "type": "criminal syndicate",
      "alignment": "Chaotic Evil",
      "influence": 60,
      "relationship": "hostile",
      "description": "A secretive organization seeking the artifact's power for their own dark purposes."
    },
    {
      "name": "Mercenaries of the Iron Fist",
      "type": "mercenary company",
      "alignment": "Neutral",
      "influence": 45,
      "relationship": "neutral",
      "description": "A professional fighting force that can be hired for protection or hired by enemies."
    }
  ],
  "threats": [
    {
      "name": "Corrupted Guardian Spirits",
      "type": "monster",
      "threatLevel": "high",
      "description": "Ancient forest spirits corrupted by dark magic, now serving as guardians of the artifact's location.",
      "location": "Deep within the Whispering Woods",
      "status": "active"
    },
    {
      "name": "The Shadow Lord's Cult",
      "type": "organization",
      "threatLevel": "critical",
      "description": "A cult dedicated to an ancient evil entity, actively seeking the artifact to unleash its power.",
      "location": "Hidden throughout the realm",
      "status": "active"
    },
    {
      "name": "The Great Corruption",
      "type": "natural disaster",
      "threatLevel": "high",
      "description": "A spreading magical corruption that threatens to consume the entire forest and surrounding lands.",
      "location": "Spreading from the artifact's location",
      "status": "active"
    }
  ],
  "goals": [
    {
      "description": "Recover the Lost Artifact of the Ancients before it falls into evil hands",
      "completed": false,
      "progress": 0
    },
    {
      "description": "Uncover the ancient knowledge and secrets hidden within the artifact",
      "completed": false,
      "progress": 0
    },
    {
      "description": "Purify the corrupted guardian spirits and restore balance to the forest",
      "completed": false,
      "progress": 0
    },
    {
      "description": "Prevent the Shadow Lord's cult from gaining control of the artifact",
      "completed": false,
      "progress": 0
    },
    {
      "description": "Establish a safe haven in the forest for future adventurers and scholars",
      "completed": false,
      "progress": 0
    }
  ],
  "lore": [
    {
      "category": "History",
      "title": "The Age of the Ancients",
      "content": "Long before recorded history, powerful beings known as the Ancients ruled this land with wisdom and magic. They created the artifact as a repository of their knowledge and power.",
      "discoveredBy": [],
      "importance": "legendary"
    },
    {
      "category": "Legend",
      "title": "The Whispering Woods",
      "content": "The forest itself is said to be alive with ancient magic, its trees whispering secrets to those who know how to listen. The artifact's power is strongest here.",
      "discoveredBy": [],
      "importance": "rare"
    },
    {
      "category": "Mythology",
      "title": "The Guardian Pact",
      "content": "The Ancients made a pact with the forest spirits to protect the artifact. This pact has been corrupted over time, turning the guardians into dangerous foes.",
      "discoveredBy": [],
      "importance": "uncommon"
    },
    {
      "category": "Prophecy",
      "title": "The Chosen One",
      "content": "Ancient texts speak of a chosen one who will restore the artifact's power and bring balance back to the land. Many believe this prophecy is about to be fulfilled.",
      "discoveredBy": [],
      "importance": "rare"
    },
    {
      "category": "Geography",
      "title": "The Heart of the Forest",
      "content": "At the center of the Whispering Woods lies a sacred grove where the artifact was originally placed. This location is protected by the most powerful of the corrupted guardians.",
      "discoveredBy": [],
      "importance": "common"
    }
  ]
}`;
  }

  /**
   * Generate story response
   */
  private generateStoryResponse(): string {
    const storyTemplates = [
      "As you venture deeper into the ancient forest, you encounter a wise dwarf sage named Thrain Ironbeard. His weathered face and flowing beard speak of centuries of knowledge, and his eyes sparkle with ancient wisdom. \"Ah, a traveler seeking adventure,\" he says with a warm smile. \"I have been studying the ancient texts of this land for many years. Perhaps I can share some of what I've learned with you.\"\n\nThe forest around you seems to respond to his presence, the trees whispering ancient secrets and the air crackling with magical energy. Thrain gestures toward a hidden path that leads deeper into the woods. \"There are mysteries here that even I have not fully uncovered,\" he continues, his voice carrying the weight of countless discoveries.",

      "The path through the enchanted forest leads you to a clearing where you meet Sylvan Whisperwind, an elven ranger whose connection to nature is almost palpable. Her green eyes seem to see through the very essence of the forest, and her movements are as graceful as the wind through the trees. \"Welcome, wanderer,\" she greets you with a gentle nod. \"I am the guardian of these woods, and I sense that you carry the spirit of adventure within you.\"\n\nAround you, the forest comes alive with her presence - birds sing more sweetly, flowers bloom brighter, and the very air seems to shimmer with natural magic. Sylvan points toward a distant mountain peak. \"There are ancient secrets hidden in those peaks, secrets that could change the fate of this land.\"",

      "Deep in the shadowy depths of the forest, you encounter Grimtooth the Goblin, a crafty scout whose sharp eyes miss nothing. His small frame belies his cunning nature, and his quick movements suggest years of survival in dangerous territory. \"Well, well, what have we here?\" he says with a sly grin, his voice carrying the rough edge of one who has seen much. \"A brave adventurer, or perhaps just a foolish one?\"\n\nThe goblin's presence seems to make the shadows deeper and the forest more mysterious. He gestures toward a hidden cave entrance. \"There are treasures in those depths, treasures that could make you rich beyond your wildest dreams. But beware, for danger lurks in every shadow.\"",

      "The ancient castle looms before you, its dark stone walls telling tales of centuries past. As you approach the massive gates, you're greeted by a wise sage named Elara the Learned, whose knowledge of the castle's history is unmatched. Her flowing robes and kind eyes speak of years spent studying ancient texts and uncovering forgotten secrets. \"Welcome, seeker of knowledge,\" she says warmly. \"This castle holds many mysteries, and I would be honored to share what I've discovered with you.\"\n\nThe castle's ancient stones seem to whisper stories of knights, kings, and magical battles long forgotten. Elara leads you through the grand entrance, pointing out architectural details that tell the story of a bygone era. \"There are chambers here that have not been opened in centuries,\" she explains, \"and artifacts that could unlock the secrets of this land's past.\""
    ];

    // Randomly select a story template
    const randomIndex = Math.floor(Math.random() * storyTemplates.length);
    return storyTemplates[randomIndex]!; // Use non-null assertion since we know the array has elements
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
    const sampleCharacters = [
      {
        "name": "Thrain Ironbeard",
        "race": "Dwarf",
        "class": "Wizard",
        "level": 1,
        "characterType": "ai",
        "attributes": {
          "strength": 8, "dexterity": 12, "constitution": 14,
          "intelligence": 16, "wisdom": 10, "charisma": 8
        },
        "hitPoints": { "maximum": 6, "current": 6, "temporary": 0 },
        "armorClass": 12, "speed": 25,
        "personality": {
          "traits": ["Studious", "Traditional"],
          "ideals": ["Knowledge"],
          "bonds": ["Ancient Dwarven Lore"],
          "flaws": ["Stubborn"],
          "background": "Dwarven sage seeking lost knowledge",
          "alignment": "lawful neutral"
        },
        "aiPersonality": {
          "goals": ["Discover ancient secrets"],
          "fears": ["Losing precious knowledge"],
          "background": "Mentioned in story as a wise dwarf sage"
        }
      },
      {
        "name": "Sylvan Whisperwind",
        "race": "Elf",
        "class": "Ranger",
        "level": 1,
        "characterType": "ai",
        "attributes": {
          "strength": 10, "dexterity": 16, "constitution": 12,
          "intelligence": 12, "wisdom": 14, "charisma": 10
        },
        "hitPoints": { "maximum": 10, "current": 10, "temporary": 0 },
        "armorClass": 14, "speed": 35,
        "personality": {
          "traits": ["Nature-bound", "Vigilant"],
          "ideals": ["Protection"],
          "bonds": ["The natural world"],
          "flaws": ["Distrustful of civilization"],
          "background": "Elven guardian of the wilds",
          "alignment": "neutral good"
        },
        "aiPersonality": {
          "goals": ["Protect natural areas"],
          "fears": ["Environmental destruction"],
          "background": "Mentioned in story as a forest guardian"
        }
      },
      {
        "name": "Grimtooth the Goblin",
        "race": "Goblin",
        "class": "Rogue",
        "level": 1,
        "characterType": "ai",
        "attributes": {
          "strength": 8, "dexterity": 16, "constitution": 10,
          "intelligence": 10, "wisdom": 8, "charisma": 12
        },
        "hitPoints": { "maximum": 6, "current": 6, "temporary": 0 },
        "armorClass": 14, "speed": 30,
        "personality": {
          "traits": ["Sneaky", "Opportunistic"],
          "ideals": ["Freedom"],
          "bonds": ["Goblin tribe"],
          "flaws": ["Greedy"],
          "background": "Crafty goblin scout",
          "alignment": "chaotic neutral"
        },
        "aiPersonality": {
          "goals": ["Survive and prosper"],
          "fears": ["Being caught"],
          "background": "Mentioned in story as a goblin scout"
        }
      }
    ];

    // Randomly return 0-3 characters for variety
    const characterCount = Math.floor(Math.random() * 4);
    const selectedCharacters = sampleCharacters.slice(0, characterCount);
    return JSON.stringify(selectedCharacters);
  }

  /**
   * Generate location extraction response
   */
  private generateLocationExtractionResponse(): string {
    const sampleLocations = [
      {
        "name": "Castle Blackstone",
        "type": "castle",
        "description": "Ancient fortress perched on a rocky hill, its dark stone walls have withstood centuries of conflict",
        "importance": "major",
        "tags": ["castle", "fortress", "ancient", "strategic"],
        "climate": "temperate",
        "terrain": "hilltop",
        "lighting": "dim",
        "weather": "clear",
        "resources": ["stone", "iron", "defensive position"],
        "pointsOfInterest": [
          {
            "name": "Great Hall",
            "description": "Massive chamber with high vaulted ceilings",
            "type": "chamber",
            "isExplored": false
          }
        ]
      },
      {
        "name": "The Misty Forest",
        "type": "wilderness",
        "description": "Dense woodland shrouded in perpetual mist, home to ancient trees and mysterious creatures",
        "importance": "moderate",
        "tags": ["forest", "wilderness", "mysterious", "misty"],
        "climate": "humid",
        "terrain": "woodland",
        "lighting": "dim",
        "weather": "misty",
        "resources": ["wood", "herbs", "game"],
        "pointsOfInterest": [
          {
            "name": "Ancient Oak",
            "description": "Massive tree that seems to watch over the forest",
            "type": "landmark",
            "isExplored": false
          }
        ]
      },
      {
        "name": "The Red Dragon Inn",
        "type": "settlement",
        "description": "Cozy tavern with warm hearth and friendly atmosphere, a popular gathering place for adventurers",
        "importance": "minor",
        "tags": ["tavern", "inn", "settlement", "social"],
        "climate": "temperate",
        "terrain": "urban",
        "lighting": "warm",
        "weather": "indoor",
        "resources": ["food", "drink", "information", "lodging"],
        "pointsOfInterest": [
          {
            "name": "Common Room",
            "description": "Main gathering area with tables and bar",
            "type": "chamber",
            "isExplored": false
          }
        ]
      }
    ];

    // Randomly return 0-3 locations for variety
    const locationCount = Math.floor(Math.random() * 4);
    const selectedLocations = sampleLocations.slice(0, locationCount);
    return JSON.stringify(selectedLocations);
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
