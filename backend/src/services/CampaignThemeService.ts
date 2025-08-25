import logger from './LoggerService';
import LLMClientFactory from './LLMClientFactory';

export interface CampaignTheme {
  id: string;
  name: string;
  description: string;
  genre: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recommendedLevels: number[];
  keyElements: string[];
  atmosphere: string;
  commonEnemies: string[];
  uniqueMechanics: string[];
  scenarioTemplates: ScenarioTemplate[];
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  setup: string;
  keyLocations: string[];
  npcRoles: string[];
  potentialConflicts: string[];
  resolutionPaths: string[];
  difficulty: number;
  estimatedDuration: string;
}

export interface GeneratedScenario {
  title: string;
  description: string;
  setup: string;
  keyLocations: string[];
  npcs: NPC[];
  conflicts: Conflict[];
  objectives: Objective[];
  rewards: Reward[];
  estimatedDuration: string;
  difficulty: number;
}

export interface NPC {
  name: string;
  role: string;
  personality: string;
  goals: string[];
  secrets: string[];
  relationships: string[];
}

export interface Conflict {
  type: 'combat' | 'social' | 'exploration' | 'puzzle';
  description: string;
  stakes: string;
  resolution: string;
  consequences: string[];
}

export interface Objective {
  type: 'primary' | 'secondary' | 'hidden';
  description: string;
  requirements: string[];
  rewards: string[];
}

export interface Reward {
  type: 'experience' | 'treasure' | 'information' | 'relationship' | 'reputation';
  description: string;
  value: number;
}

export class CampaignThemeService {
  private geminiClient: any;
  private themes: Map<string, CampaignTheme> = new Map();

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.initializeThemes();
  }

  /**
   * Initialize all campaign themes
   */
  private initializeThemes(): void {
    // Fantasy Themes
    this.themes.set('high-fantasy', {
      id: 'high-fantasy',
      name: 'High Fantasy',
      description: 'Epic quests in a world of magic, dragons, and ancient kingdoms',
      genre: 'fantasy',
      difficulty: 'beginner',
      recommendedLevels: [1, 20],
      keyElements: ['magic', 'dragons', 'ancient ruins', 'noble quests', 'mythical creatures'],
      atmosphere: 'Majestic and wondrous, with a sense of epic scale and destiny',
      commonEnemies: ['dragons', 'orcs', 'goblins', 'undead', 'dark wizards'],
      uniqueMechanics: ['magic system', 'dragon encounters', 'ancient artifacts'],
      scenarioTemplates: [
        {
          id: 'dragon-hunt',
          name: 'Dragon Hunt',
          description: 'A village is terrorized by a young dragon',
          setup: 'A young dragon has claimed a nearby mountain and demands tribute',
          keyLocations: ['village', 'mountain lair', 'ancient temple', "dragon's hoard"],
          npcRoles: ['village elder', 'dragon hunter', 'local wizard', 'merchant'],
          potentialConflicts: ['Dragon attacks', 'Village politics', 'Treasure hunters'],
          resolutionPaths: ['Slay the dragon', 'Negotiate peace', 'Find new home'],
          difficulty: 3,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    this.themes.set('dark-fantasy', {
      id: 'dark-fantasy',
      name: 'Dark Fantasy',
      description: 'Grim tales of survival in a corrupted world',
      genre: 'fantasy',
      difficulty: 'intermediate',
      recommendedLevels: [3, 15],
      keyElements: ['corruption', 'survival', 'moral choices', 'dark magic', 'fallen kingdoms'],
      atmosphere: 'Oppressive and dangerous, with moral ambiguity and harsh consequences',
      commonEnemies: ['corrupted beings', 'dark cultists', 'fallen paladins', 'shadow creatures'],
      uniqueMechanics: ['corruption system', 'survival mechanics', 'moral consequences'],
      scenarioTemplates: [
        {
          id: 'corruption-spread',
          name: 'Corruption Spread',
          description: 'A dark force is corrupting the land and its people',
          setup: 'A mysterious corruption is spreading from an ancient ruin',
          keyLocations: ['corrupted village', 'ancient ruin', 'safe haven', 'corruption source'],
          npcRoles: ['corrupted leader', 'resistance fighter', 'fallen priest', 'survivor'],
          potentialConflicts: ['Corruption spread', 'Survivor rescue', 'Cult infiltration'],
          resolutionPaths: ['Destroy corruption source', 'Find cure', 'Evacuate survivors'],
          difficulty: 4,
          estimatedDuration: '3-4 sessions',
        },
      ],
    });

    this.themes.set('sword-and-sorcery', {
      id: 'sword-and-sorcery',
      name: 'Sword & Sorcery',
      description: 'Gritty adventures in a world of warriors and dark magic',
      genre: 'fantasy',
      difficulty: 'intermediate',
      recommendedLevels: [2, 12],
      keyElements: [
        'martial prowess',
        'dark magic',
        'ancient evils',
        'treasure hunting',
        'survival',
      ],
      atmosphere: 'Gritty and dangerous, emphasizing personal power and survival',
      commonEnemies: [
        'dark sorcerers',
        'ancient evils',
        'corrupted warriors',
        'monstrous creatures',
      ],
      uniqueMechanics: ['martial techniques', 'dark magic corruption', 'survival challenges'],
      scenarioTemplates: [
        {
          id: 'ancient-evil-awakened',
          name: 'Ancient Evil Awakened',
          description: 'An ancient evil has been awakened by treasure hunters',
          setup: 'Treasure hunters disturbed an ancient tomb, awakening a dark force',
          keyLocations: ['ancient tomb', 'corrupted temple', 'nearby village', 'dark altar'],
          npcRoles: ['treasure hunter', 'local guide', 'corrupted priest', 'survivor'],
          potentialConflicts: ['Dark force attacks', 'Rescue survivors', 'Destroy evil'],
          resolutionPaths: ['Seal the evil', 'Destroy the source', 'Sacrifice to contain'],
          difficulty: 4,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    // Sci-Fi Themes
    this.themes.set('space-opera', {
      id: 'space-opera',
      name: 'Space Opera',
      description: 'Epic adventures across the stars with advanced technology',
      genre: 'sci-fi',
      difficulty: 'intermediate',
      recommendedLevels: [3, 18],
      keyElements: [
        'space travel',
        'advanced technology',
        'alien races',
        'political intrigue',
        'cosmic threats',
      ],
      atmosphere: 'Grand and expansive, with a sense of wonder and cosmic scale',
      commonEnemies: ['alien invaders', 'corrupt corporations', 'cosmic horrors', 'rogue AI'],
      uniqueMechanics: ['space combat', 'technology systems', 'alien diplomacy'],
      scenarioTemplates: [
        {
          id: 'alien-invasion',
          name: 'Alien Invasion',
          description: 'A mysterious alien fleet threatens human colonies',
          setup: 'An unknown alien fleet has appeared and is systematically attacking colonies',
          keyLocations: ['space station', 'alien ship', 'colony world', 'command center'],
          npcRoles: ['fleet admiral', 'alien ambassador', 'colony leader', 'scientist'],
          potentialConflicts: ['Space battles', 'Diplomatic negotiations', 'Colony defense'],
          resolutionPaths: ['Military victory', 'Peace treaty', 'Evacuation'],
          difficulty: 5,
          estimatedDuration: '4-5 sessions',
        },
      ],
    });

    this.themes.set('cyberpunk', {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'High-tech, low-life adventures in a corporate dystopia',
      genre: 'sci-fi',
      difficulty: 'advanced',
      recommendedLevels: [5, 20],
      keyElements: [
        'corporate control',
        'cybernetics',
        'hacking',
        'street life',
        'technological addiction',
      ],
      atmosphere:
        'Gritty and neon-lit, with themes of corporate oppression and technological dependency',
      commonEnemies: ['corporate security', 'cyberpsychos', 'rival hackers', 'corrupt officials'],
      uniqueMechanics: ['hacking system', 'cybernetics', 'corporate politics'],
      scenarioTemplates: [
        {
          id: 'corporate-espionage',
          name: 'Corporate Espionage',
          description: 'Infiltrate a megacorporation to steal valuable data',
          setup: 'A rival corporation needs data from a powerful megacorp',
          keyLocations: [
            'corporate tower',
            'data center',
            'security office',
            'underground facility',
          ],
          npcRoles: ['corporate executive', 'security chief', 'hacker contact', 'rival agent'],
          potentialConflicts: ['Security systems', 'Corporate politics', 'Rival agents'],
          resolutionPaths: ['Steal data', 'Sabotage systems', 'Extract defector'],
          difficulty: 6,
          estimatedDuration: '3-4 sessions',
        },
      ],
    });

    // Horror Themes
    this.themes.set('cosmic-horror', {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: 'Terrifying encounters with incomprehensible cosmic entities',
      genre: 'horror',
      difficulty: 'advanced',
      recommendedLevels: [8, 20],
      keyElements: [
        'cosmic entities',
        'insanity',
        'ancient knowledge',
        'reality distortion',
        'cosmic scale',
      ],
      atmosphere: 'Overwhelming and terrifying, with a sense of cosmic insignificance',
      commonEnemies: [
        'cosmic entities',
        'cultists',
        'insane researchers',
        'reality-warping beings',
      ],
      uniqueMechanics: ['insanity system', 'reality distortion', 'cosmic knowledge'],
      scenarioTemplates: [
        {
          id: 'reality-breakdown',
          name: 'Reality Breakdown',
          description: 'Reality itself is breaking down due to cosmic influence',
          setup: 'A cosmic entity is slowly corrupting local reality',
          keyLocations: ['reality rift', 'corrupted area', 'research facility', 'cosmic portal'],
          npcRoles: ['insane researcher', 'cosmic cultist', 'reality anchor', 'victim'],
          potentialConflicts: ['Reality corruption', 'Insanity spread', 'Cosmic influence'],
          resolutionPaths: ['Seal the rift', 'Sacrifice to contain', 'Accept corruption'],
          difficulty: 7,
          estimatedDuration: '4-5 sessions',
        },
      ],
    });

    this.themes.set('gothic-horror', {
      id: 'gothic-horror',
      name: 'Gothic Horror',
      description: 'Classic horror in dark, atmospheric settings',
      genre: 'horror',
      difficulty: 'intermediate',
      recommendedLevels: [3, 15],
      keyElements: [
        'dark atmosphere',
        'supernatural elements',
        'psychological horror',
        'ancient curses',
        'family secrets',
      ],
      atmosphere: 'Dark and atmospheric, with a sense of dread and supernatural mystery',
      commonEnemies: ['undead', 'dark spirits', 'cursed beings', 'mad cultists', 'ancient evils'],
      uniqueMechanics: ['fear system', 'curse mechanics', 'supernatural investigation'],
      scenarioTemplates: [
        {
          id: 'haunted-mansion',
          name: 'Haunted Mansion',
          description: 'Investigate a mansion with a dark family history',
          setup: 'A wealthy family requests help with supernatural occurrences in their mansion',
          keyLocations: ['mansion', 'family crypt', 'hidden passages', 'dark basement'],
          npcRoles: ['family patriarch', 'haunted child', 'loyal servant', 'dark spirit'],
          potentialConflicts: ['Supernatural attacks', 'Family secrets', 'Dark history'],
          resolutionPaths: ['Exorcise spirits', 'Uncover truth', 'Destroy mansion'],
          difficulty: 4,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    // Historical Themes
    this.themes.set('medieval', {
      id: 'medieval',
      name: 'Medieval',
      description: 'Authentic historical adventures in medieval Europe',
      genre: 'historical',
      difficulty: 'beginner',
      recommendedLevels: [1, 10],
      keyElements: [
        'historical accuracy',
        'feudal politics',
        'religious conflict',
        'medieval warfare',
        'social hierarchy',
      ],
      atmosphere: 'Authentic and immersive, with attention to historical detail',
      commonEnemies: ['bandits', 'rival knights', 'corrupt officials', 'foreign invaders'],
      uniqueMechanics: ['social status', 'medieval combat', 'religious influence'],
      scenarioTemplates: [
        {
          id: 'knightly-quest',
          name: 'Knightly Quest',
          description: 'A noble quest to prove worth and honor',
          setup: "A noble requests aid in a quest that will determine their family's honor",
          keyLocations: ['castle', 'quest location', 'rival territory', 'sacred site'],
          npcRoles: ['noble patron', 'rival knight', 'local guide', 'religious figure'],
          potentialConflicts: ['Honor duels', 'Political intrigue', 'Religious conflict'],
          resolutionPaths: ['Complete quest', 'Prove honor', 'Resolve conflict'],
          difficulty: 3,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    this.themes.set('pirates', {
      id: 'pirates',
      name: 'Pirates',
      description: 'Swashbuckling adventures on the high seas',
      genre: 'historical',
      difficulty: 'intermediate',
      recommendedLevels: [2, 12],
      keyElements: [
        'naval combat',
        'treasure hunting',
        'island exploration',
        'pirate politics',
        'naval navigation',
      ],
      atmosphere: 'Romantic and adventurous, with the freedom of the open sea',
      commonEnemies: ['rival pirates', 'naval authorities', 'sea monsters', 'treasure hunters'],
      uniqueMechanics: ['naval combat', 'sailing mechanics', 'treasure hunting'],
      scenarioTemplates: [
        {
          id: 'treasure-hunt',
          name: 'Treasure Hunt',
          description: 'Search for legendary pirate treasure',
          setup: 'A map leads to legendary pirate treasure on a mysterious island',
          keyLocations: ['pirate port', 'mysterious island', 'treasure cave', 'shipwreck'],
          npcRoles: ['pirate captain', 'treasure hunter', 'local guide', 'rival crew'],
          potentialConflicts: ['Rival crews', 'Island dangers', 'Treasure guardians'],
          resolutionPaths: ['Find treasure', 'Defeat rivals', 'Escape with loot'],
          difficulty: 4,
          estimatedDuration: '3-4 sessions',
        },
      ],
    });

    // Modern Themes
    this.themes.set('urban-fantasy', {
      id: 'urban-fantasy',
      name: 'Urban Fantasy',
      description: 'Magic and supernatural elements in modern urban settings',
      genre: 'modern',
      difficulty: 'intermediate',
      recommendedLevels: [3, 15],
      keyElements: [
        'modern setting',
        'hidden magic',
        'supernatural politics',
        'urban exploration',
        'secret societies',
      ],
      atmosphere: 'Modern and mysterious, with hidden magic beneath the surface',
      commonEnemies: [
        'supernatural beings',
        'corrupt officials',
        'rival factions',
        'dark magic users',
      ],
      uniqueMechanics: ['modern technology', 'hidden magic', 'urban exploration'],
      scenarioTemplates: [
        {
          id: 'hidden-magic',
          name: 'Hidden Magic',
          description: 'Uncover a hidden magical conspiracy in the city',
          setup: 'Strange magical occurrences are happening throughout the city',
          keyLocations: [
            'city streets',
            'hidden magical sites',
            'secret society headquarters',
            'magical nexus',
          ],
          npcRoles: [
            'magical investigator',
            'secret society member',
            'corrupt official',
            'magical being',
          ],
          potentialConflicts: ['Magical battles', 'Political intrigue', 'Secret exposure'],
          resolutionPaths: ['Expose conspiracy', 'Join society', 'Maintain secrecy'],
          difficulty: 4,
          estimatedDuration: '3-4 sessions',
        },
      ],
    });

    this.themes.set('post-apocalyptic', {
      id: 'post-apocalyptic',
      name: 'Post-Apocalyptic',
      description: 'Survival in a world devastated by catastrophe',
      genre: 'modern',
      difficulty: 'advanced',
      recommendedLevels: [5, 18],
      keyElements: [
        'survival',
        'scavenging',
        'faction conflict',
        'environmental hazards',
        'resource management',
      ],
      atmosphere: 'Desperate and dangerous, with a focus on survival and rebuilding',
      commonEnemies: ['raiders', 'mutated creatures', 'rival factions', 'environmental hazards'],
      uniqueMechanics: ['survival system', 'scavenging', 'faction politics'],
      scenarioTemplates: [
        {
          id: 'faction-war',
          name: 'Faction War',
          description: 'Navigate conflict between rival survival factions',
          setup: 'Two powerful factions are on the brink of war over resources',
          keyLocations: ['faction bases', 'resource sites', 'neutral territory', 'battlefield'],
          npcRoles: ['faction leaders', 'diplomats', 'scouts', 'refugees'],
          potentialConflicts: ['Faction battles', 'Resource competition', 'Diplomatic tension'],
          resolutionPaths: ['Negotiate peace', 'Choose side', 'Create alliance'],
          difficulty: 5,
          estimatedDuration: '4-5 sessions',
        },
      ],
    });

    // Adventure Themes
    this.themes.set('exploration', {
      id: 'exploration',
      name: 'Exploration',
      description: 'Discover new lands and ancient mysteries',
      genre: 'adventure',
      difficulty: 'beginner',
      recommendedLevels: [1, 15],
      keyElements: [
        'discovery',
        'mapping',
        'ancient ruins',
        'natural wonders',
        'cultural exchange',
      ],
      atmosphere: 'Wonder and discovery, with a sense of adventure and exploration',
      commonEnemies: [
        'wild animals',
        'territorial natives',
        'ancient guardians',
        'environmental hazards',
      ],
      uniqueMechanics: ['mapping system', 'exploration rewards', 'cultural interaction'],
      scenarioTemplates: [
        {
          id: 'lost-civilization',
          name: 'Lost Civilization',
          description: 'Discover the ruins of an ancient, forgotten civilization',
          setup: 'Ancient maps lead to a lost civilization with valuable knowledge',
          keyLocations: ['ancient ruins', 'hidden temples', 'buried cities', 'sacred sites'],
          npcRoles: ['local guide', 'fellow explorer', 'ancient guardian', 'rival archaeologist'],
          potentialConflicts: ['Ancient traps', 'Rival explorers', 'Cultural misunderstandings'],
          resolutionPaths: ['Document discovery', 'Preserve knowledge', 'Share findings'],
          difficulty: 3,
          estimatedDuration: '3-4 sessions',
        },
      ],
    });

    this.themes.set('mystery', {
      id: 'mystery',
      name: 'Mystery',
      description: 'Solve puzzles and uncover hidden truths',
      genre: 'adventure',
      difficulty: 'intermediate',
      recommendedLevels: [2, 12],
      keyElements: [
        'investigation',
        'clue gathering',
        'logical deduction',
        'hidden motives',
        'social interaction',
      ],
      atmosphere: 'Intriguing and mysterious, with a focus on investigation and deduction',
      commonEnemies: [
        'corrupt officials',
        'criminal organizations',
        'hidden conspirators',
        'misguided individuals',
      ],
      uniqueMechanics: ['investigation system', 'clue tracking', 'social deduction'],
      scenarioTemplates: [
        {
          id: 'murder-mystery',
          name: 'Murder Mystery',
          description: 'Investigate a mysterious murder in a closed community',
          setup: 'A prominent figure is found dead under suspicious circumstances',
          keyLocations: ['crime scene', 'suspect locations', 'evidence rooms', 'witness homes'],
          npcRoles: ['victim', 'suspects', 'witnesses', 'authorities'],
          potentialConflicts: ['False accusations', 'Hidden evidence', 'Social pressure'],
          resolutionPaths: ['Identify killer', 'Prove innocence', 'Uncover conspiracy'],
          difficulty: 4,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    // Steampunk Theme
    this.themes.set('steampunk', {
      id: 'steampunk',
      name: 'Steampunk',
      description: 'Victorian-era adventures with steam-powered technology',
      genre: 'fantasy',
      difficulty: 'intermediate',
      recommendedLevels: [3, 15],
      keyElements: [
        'steam technology',
        'Victorian society',
        'industrial revolution',
        'airships',
        'clockwork devices',
      ],
      atmosphere: 'Victorian and industrial, with a sense of wonder and technological innovation',
      commonEnemies: [
        'corrupt industrialists',
        'rogue machines',
        'rival inventors',
        'social reformers',
      ],
      uniqueMechanics: ['steam technology', 'social status', 'invention system'],
      scenarioTemplates: [
        {
          id: 'invention-competition',
          name: 'Invention Competition',
          description: 'Compete in a grand invention competition with high stakes',
          setup: 'A prestigious invention competition offers fame and fortune',
          keyLocations: ['competition hall', 'workshop', 'exhibition area', "judges' chambers"],
          npcRoles: ['rival inventors', 'competition judges', 'patrons', 'saboteurs'],
          potentialConflicts: ['Invention sabotage', 'Judging bias', 'Industrial espionage'],
          resolutionPaths: ['Win competition', 'Expose corruption', 'Create alliance'],
          difficulty: 4,
          estimatedDuration: '2-3 sessions',
        },
      ],
    });

    logger.info('Campaign themes initialized', { themeCount: this.themes.size });
  }

  /**
   * Get all available campaign themes
   */
  getAllThemes(): CampaignTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get a specific theme by ID
   */
  getTheme(themeId: string): CampaignTheme | null {
    return this.themes.get(themeId) || null;
  }

  /**
   * Get themes by genre
   */
  getThemesByGenre(genre: string): CampaignTheme[] {
    return Array.from(this.themes.values()).filter(theme => theme.genre === genre);
  }

  /**
   * Get themes by difficulty
   */
  getThemesByDifficulty(difficulty: string): CampaignTheme[] {
    return Array.from(this.themes.values()).filter(theme => theme.difficulty === difficulty);
  }

  /**
   * Get themes suitable for a specific level range
   */
  getThemesByLevel(minLevel: number, maxLevel: number): CampaignTheme[] {
    return Array.from(this.themes.values()).filter(theme =>
      theme.recommendedLevels.some(level => level >= minLevel && level <= maxLevel)
    );
  }

  /**
   * Generate a custom scenario using AI
   */
  async generateCustomScenario(
    themeId: string,
    partyLevel: number,
    partySize: number,
    customElements: string[] = []
  ): Promise<GeneratedScenario> {
    try {
      const theme = this.getTheme(themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }

      const prompt = this.buildScenarioPrompt(theme, partyLevel, partySize, customElements);
      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'scenario_generation',
        forceModel: 'pro',
      });

      if (!response.success) {
        throw new Error('Failed to generate scenario');
      }

      // Parse the AI response into a structured scenario
      const scenario = this.parseScenarioResponse(response.content, theme);
      logger.info('Custom scenario generated', { themeId, partyLevel, partySize });

      return scenario;
    } catch (error) {
      logger.error('Error generating custom scenario:', error);
      throw error;
    }
  }

  /**
   * Build a prompt for AI scenario generation
   */
  private buildScenarioPrompt(
    theme: CampaignTheme,
    partyLevel: number,
    partySize: number,
    customElements: string[]
  ): string {
    return `Generate a D&D 5e scenario for a ${theme.name} campaign.

Theme Details:
- Genre: ${theme.genre}
- Atmosphere: ${theme.atmosphere}
- Key Elements: ${theme.keyElements.join(', ')}
- Common Enemies: ${theme.commonEnemies.join(', ')}

Party Details:
- Level: ${partyLevel}
- Size: ${partySize} characters

Custom Elements: ${customElements.length > 0 ? customElements.join(', ') : 'None specified'}

Generate a complete scenario including:
1. Title and description
2. Setup and background
3. Key locations (3-5 locations)
4. Important NPCs (3-5 NPCs with roles, personalities, and goals)
5. Main conflicts and challenges
6. Objectives (primary, secondary, and hidden)
7. Potential rewards
8. Estimated duration and difficulty

Format the response as a structured scenario that can be easily parsed.`;
  }

  /**
   * Parse AI response into a structured scenario
   */
  private parseScenarioResponse(response: string, _theme: CampaignTheme): GeneratedScenario {
    // This is a simplified parser - in a real implementation, you'd want more sophisticated parsing
    const lines = response.split('\n').filter(line => line.trim());

    // Extract basic information
    const title =
      lines
        .find(line => line.includes('Title:'))
        ?.split(':')[1]
        ?.trim() || 'Generated Scenario';
    const description =
      lines
        .find(line => line.includes('Description:'))
        ?.split(':')[1]
        ?.trim() || 'A custom scenario';

    // Create a basic scenario structure
    const scenario: GeneratedScenario = {
      title,
      description,
      setup: 'Custom scenario setup',
      keyLocations: ['Location 1', 'Location 2', 'Location 3'],
      npcs: [
        {
          name: 'NPC 1',
          role: 'Guide',
          personality: 'Helpful and knowledgeable',
          goals: ['Help the party'],
          secrets: ['Knows more than they let on'],
          relationships: ['Trusted by locals'],
        },
      ],
      conflicts: [
        {
          type: 'combat',
          description: 'Main conflict description',
          stakes: 'High stakes for the region',
          resolution: 'Multiple resolution paths available',
          consequences: ['Positive outcome', 'Negative outcome'],
        },
      ],
      objectives: [
        {
          type: 'primary',
          description: 'Main objective',
          requirements: ['Requirement 1', 'Requirement 2'],
          rewards: ['Experience', 'Treasure'],
        },
      ],
      rewards: [
        {
          type: 'experience',
          description: 'Experience points',
          value: 1000,
        },
      ],
      estimatedDuration: '2-3 sessions',
      difficulty: 4,
    };

    return scenario;
  }

  /**
   * Get a random scenario template for a theme
   */
  getRandomScenarioTemplate(themeId: string): ScenarioTemplate | null {
    const theme = this.getTheme(themeId);
    if (!theme || theme.scenarioTemplates.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * theme.scenarioTemplates.length);
    const template = theme.scenarioTemplates[randomIndex];
    return template || null;
  }

  /**
   * Validate theme consistency for an existing campaign
   */
  validateThemeConsistency(
    themeId: string,
    campaignElements: string[]
  ): {
    consistent: boolean;
    suggestions: string[];
    conflicts: string[];
  } {
    const theme = this.getTheme(themeId);
    if (!theme) {
      return { consistent: false, suggestions: [], conflicts: ['Theme not found'] };
    }

    const suggestions: string[] = [];
    const conflicts: string[] = [];

    // Check for theme-appropriate elements
    campaignElements.forEach(element => {
      if (
        !theme.keyElements.some(keyElement =>
          element.toLowerCase().includes(keyElement.toLowerCase())
        )
      ) {
        suggestions.push(`Consider adding ${element} to align with ${theme.name} theme`);
      }
    });

    // Check for conflicting elements
    if (
      theme.genre === 'fantasy' &&
      campaignElements.some(
        el => el.toLowerCase().includes('technology') || el.toLowerCase().includes('modern')
      )
    ) {
      conflicts.push('Modern technology conflicts with fantasy theme');
    }

    if (
      theme.genre === 'historical' &&
      campaignElements.some(
        el => el.toLowerCase().includes('magic') || el.toLowerCase().includes('supernatural')
      )
    ) {
      conflicts.push('Magic/supernatural elements conflict with historical theme');
    }

    return {
      consistent: conflicts.length === 0,
      suggestions,
      conflicts,
    };
  }
}

export default CampaignThemeService;
