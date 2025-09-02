import logger from './LoggerService';
import { IStoryArc, IStoryBeat } from '../models/StoryArc';
import { ILLMClient } from './GeminiClient';
import { Types } from 'mongoose';

export interface StoryProgressionOptions {
  autoAdvance?: boolean;
  requireMilestones?: boolean;
  requireWorldChanges?: boolean;
  maxBeatsPerChapter?: number;
  minBeatsPerChapter?: number;
}

export interface StoryBeatGenerationRequest {
  campaignId: Types.ObjectId;
  chapter: number;
  act: number;
  context: string;
  characters: Types.ObjectId[];
  location?: string;
  previousBeats: IStoryBeat[];
  worldState: string;
}

export interface StoryBeatSuggestion {
  title: string;
  description: string;
  type: 'setup' | 'development' | 'climax' | 'resolution' | 'twist' | 'character' | 'world';
  importance: 'minor' | 'moderate' | 'major' | 'critical';
  consequences: string[];
  npcs: string[];
  objectives: string[];
  reasoning: string;
}

export interface ChapterProgressionData {
  currentChapter: number;
  currentAct: number;
  storyPhase: 'setup' | 'development' | 'climax' | 'resolution';
  nextChapterRequirements: string[];
  actTransitionRequirements: string[];
  storyPhaseRequirements: string[];
  estimatedBeatsRemaining: number;
}

export class StoryProgression {
  private geminiClient: ILLMClient;
  private options: StoryProgressionOptions;

  constructor(geminiClient: ILLMClient, options: StoryProgressionOptions = {}) {
    this.geminiClient = geminiClient;
    this.options = {
      autoAdvance: false,
      requireMilestones: true,
      requireWorldChanges: true,
      maxBeatsPerChapter: 5,
      minBeatsPerChapter: 2,
      ...options,
    };
  }

  /**
   * Check if story can advance to next chapter
   */
  async canAdvanceChapter(storyArc: IStoryArc): Promise<{
    canAdvance: boolean;
    requirements: string[];
    missing: string[];
  }> {
    const requirements: string[] = [];
    const missing: string[] = [];

    // Check if current chapter has enough completed beats
    const currentChapterBeats = storyArc.storyBeats.filter(
      beat => beat.chapter === storyArc.currentChapter
    );
    const completedCurrentChapterBeats = currentChapterBeats.filter(beat => beat.completed);

    if (completedCurrentChapterBeats.length < this.options.minBeatsPerChapter!) {
      requirements.push(
        `Complete at least ${this.options.minBeatsPerChapter} story beats in current chapter`
      );
      missing.push(
        `Only ${completedCurrentChapterBeats.length}/${this.options.minBeatsPerChapter} beats completed`
      );
    }

    // Check if all major beats in current chapter are completed
    const majorBeatsInChapter = currentChapterBeats.filter(
      beat => beat.importance === 'major' || beat.importance === 'critical'
    );
    const completedMajorBeats = majorBeatsInChapter.filter(beat => beat.completed);

    if (completedMajorBeats.length < majorBeatsInChapter.length) {
      requirements.push('Complete all major story beats in current chapter');
      missing.push(
        `${completedMajorBeats.length}/${majorBeatsInChapter.length} major beats completed`
      );
    }

    // Check if character milestones are recorded (if required)
    if (this.options.requireMilestones) {
      const completedBeats = storyArc.storyBeats.filter(beat => beat.completed);
      const beatsWithMilestones = completedBeats.filter(beat =>
        storyArc.characterMilestones.some(milestone => milestone.storyBeatId === beat.id)
      );

      if (beatsWithMilestones.length < completedBeats.length * 0.8) {
        requirements.push('Record character milestones for most completed story beats');
        missing.push(
          `${beatsWithMilestones.length}/${completedBeats.length} completed beats have milestones`
        );
      }
    }

    // Check if world state changes are recorded (if required)
    if (this.options.requireWorldChanges) {
      const completedBeats = storyArc.storyBeats.filter(beat => beat.completed);
      const beatsWithWorldChanges = completedBeats.filter(beat =>
        storyArc.worldStateChanges.some(change => change.storyBeatId === beat.id)
      );

      if (beatsWithWorldChanges.length < completedBeats.length * 0.6) {
        requirements.push('Record world state changes for most completed story beats');
        missing.push(
          `${beatsWithWorldChanges.length}/${completedBeats.length} completed beats have world changes`
        );
      }
    }

    const canAdvance = missing.length === 0;

    return {
      canAdvance,
      requirements,
      missing,
    };
  }

  /**
   * Check if story can advance to next act
   */
  async canAdvanceAct(storyArc: IStoryArc): Promise<{
    canAdvance: boolean;
    requirements: string[];
    missing: string[];
  }> {
    const requirements: string[] = [];
    const missing: string[] = [];

    // Check if current act has enough completed beats
    const currentActBeats = storyArc.storyBeats.filter(beat => beat.act === storyArc.currentAct);
    const completedCurrentActBeats = currentActBeats.filter(beat => beat.completed);

    if (completedCurrentActBeats.length < 3) {
      requirements.push('Complete at least 3 story beats in current act');
      missing.push(`Only ${completedCurrentActBeats.length}/3 beats completed`);
    }

    // Check if act has appropriate story phase completion
    const actStoryPhase = this.getActStoryPhase(storyArc.currentAct);
    if (actStoryPhase === 'setup' && completedCurrentActBeats.length < 2) {
      requirements.push('Complete setup phase with at least 2 story beats');
      missing.push('Setup phase incomplete');
    } else if (actStoryPhase === 'development' && completedCurrentActBeats.length < 3) {
      requirements.push('Complete development phase with at least 3 story beats');
      missing.push('Development phase incomplete');
    } else if (actStoryPhase === 'climax' && completedCurrentActBeats.length < 2) {
      requirements.push('Complete climax phase with at least 2 story beats');
      missing.push('Climax phase incomplete');
    }

    // Check for major story beat completion in act
    const majorBeatsInAct = currentActBeats.filter(
      beat => beat.importance === 'major' || beat.importance === 'critical'
    );
    const completedMajorBeatsInAct = majorBeatsInAct.filter(beat => beat.completed);

    if (completedMajorBeatsInAct.length < majorBeatsInAct.length) {
      requirements.push('Complete all major story beats in current act');
      missing.push(
        `${completedMajorBeatsInAct.length}/${majorBeatsInAct.length} major beats completed`
      );
    }

    const canAdvance = missing.length === 0;

    return {
      canAdvance,
      requirements,
      missing,
    };
  }

  /**
   * Generate story beat suggestions using AI
   */
  async generateStoryBeatSuggestions(
    request: StoryBeatGenerationRequest
  ): Promise<StoryBeatSuggestion[]> {
    try {
      logger.info(
        `Generating story beat suggestions for chapter ${request.chapter}, act ${request.act}`
      );

      const prompt = this.buildStoryBeatPrompt(request);

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_beat_generation',
        temperature: 0.7,
      });

      if (!response.success || !response.content) {
        throw new Error('Failed to generate story beat suggestions');
      }

      // Parse AI response
      const suggestions = this.parseStoryBeatSuggestions(response.content);

      logger.info(`Generated ${suggestions.length} story beat suggestions`);
      return suggestions;
    } catch (error) {
      logger.error(`Error generating story beat suggestions: ${error}`);
      // Return fallback suggestions
      return this.generateFallbackSuggestions(request);
    }
  }

  /**
   * Get chapter progression data
   */
  async getChapterProgressionData(storyArc: IStoryArc): Promise<ChapterProgressionData> {
    const currentChapter = storyArc.currentChapter;
    const currentAct = storyArc.currentAct;
    const storyPhase = storyArc.storyPhase;

    // Calculate requirements for next chapter
    const nextChapterRequirements = await this.calculateNextChapterRequirements(storyArc);

    // Calculate requirements for act transition
    const actTransitionRequirements = await this.calculateActTransitionRequirements(storyArc);

    // Calculate requirements for story phase transition
    const storyPhaseRequirements = await this.calculateStoryPhaseRequirements(storyArc);

    // Estimate remaining beats
    const estimatedBeatsRemaining = this.estimateRemainingBeats(storyArc);

    return {
      currentChapter,
      currentAct,
      storyPhase,
      nextChapterRequirements,
      actTransitionRequirements,
      storyPhaseRequirements,
      estimatedBeatsRemaining,
    };
  }

  /**
   * Suggest story improvements
   */
  async suggestStoryImprovements(storyArc: IStoryArc): Promise<{
    pacing: string[];
    characterDevelopment: string[];
    worldBuilding: string[];
    plotStructure: string[];
  }> {
    try {
      const prompt = this.buildImprovementPrompt(storyArc);

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_progression',
        temperature: 0.5,
      });

      if (!response.success || !response.content) {
        return this.generateFallbackImprovements(storyArc);
      }

      // Parse AI response
      return this.parseImprovementSuggestions(response.content);
    } catch (error) {
      logger.error(`Error generating improvement suggestions: ${error}`);
      return this.generateFallbackImprovements(storyArc);
    }
  }

  /**
   * Build story beat generation prompt
   */
  private buildStoryBeatPrompt(request: StoryBeatGenerationRequest): string {
    const prompt = `Generate 3-5 story beat suggestions for a D&D campaign:

Campaign Context: ${request.context}
Chapter: ${request.chapter}
Act: ${request.act}
Characters: ${request.characters.length} characters involved
Location: ${request.location || 'Various locations'}

Previous Story Beats:
${request.previousBeats.map(beat => `- ${beat.title}: ${beat.description}`).join('\n')}

World State: ${request.worldState}

Generate story beats that:
1. Build upon previous events
2. Advance the plot naturally
3. Provide character development opportunities
4. Include meaningful consequences
5. Vary in importance and type

Respond with a JSON array of story beat objects:
[{
  "title": "string",
  "description": "string",
  "type": "setup|development|climax|resolution|twist|character|world",
  "importance": "minor|moderate|major|critical",
  "consequences": ["string"],
  "npcs": ["string"],
  "objectives": ["string"],
  "reasoning": "string"
}]`;

    return prompt;
  }

  /**
   * Parse story beat suggestions from AI response
   */
  private parseStoryBeatSuggestions(content: string): StoryBeatSuggestion[] {
    try {
      const suggestions = JSON.parse(content);
      if (Array.isArray(suggestions)) {
        return suggestions.map(suggestion => ({
          title: suggestion.title || 'Untitled Story Beat',
          description: suggestion.description || 'No description provided',
          type: suggestion.type || 'development',
          importance: suggestion.importance || 'moderate',
          consequences: Array.isArray(suggestion.consequences) ? suggestion.consequences : [],
          npcs: Array.isArray(suggestion.npcs) ? suggestion.npcs : [],
          objectives: Array.isArray(suggestion.objectives) ? suggestion.objectives : [],
          reasoning: suggestion.reasoning || 'AI-generated suggestion',
        }));
      }
    } catch (error) {
      logger.error(`Error parsing story beat suggestions: ${error}`);
    }

    return [];
  }

  /**
   * Generate fallback story beat suggestions
   */
  private generateFallbackSuggestions(request: StoryBeatGenerationRequest): StoryBeatSuggestion[] {
    const fallbackSuggestions: StoryBeatSuggestion[] = [
      {
        title: 'The Challenge',
        description: `A significant challenge related to ${request.context} that tests the party's abilities.`,
        type: 'development',
        importance: 'moderate',
        consequences: ['Character growth', 'Plot advancement', 'Skill development'],
        npcs: ['Challenger', 'Helper'],
        objectives: ['Overcome the challenge', 'Learn from the experience', 'Gain new insights'],
        reasoning: 'Fallback suggestion for story progression',
      },
      {
        title: 'The Discovery',
        description: 'An important discovery that reveals new information or opportunities.',
        type: 'setup',
        importance: 'minor',
        consequences: ['Information gain', 'New possibilities', 'Character motivation'],
        npcs: ['Informant', 'Witness'],
        objectives: ['Investigate the discovery', 'Understand its significance', 'Plan next steps'],
        reasoning: 'Fallback suggestion for information gathering',
      },
      {
        title: 'The Confrontation',
        description: "A confrontation that tests the party's resolve and teamwork.",
        type: 'climax',
        importance: 'major',
        consequences: ['Character development', 'Relationship changes', 'Plot resolution'],
        npcs: ['Antagonist', 'Ally'],
        objectives: ['Resolve the conflict', 'Protect allies', 'Achieve objectives'],
        reasoning: 'Fallback suggestion for dramatic tension',
      },
    ];

    return fallbackSuggestions;
  }

  /**
   * Build improvement suggestions prompt
   */
  private buildImprovementPrompt(storyArc: IStoryArc): string {
    const completedBeats = storyArc.storyBeats.filter(beat => beat.completed);
    const activeBeats = storyArc.storyBeats.filter(beat => !beat.completed);

    const prompt = `Analyze this D&D campaign story and suggest improvements:

Campaign Theme: ${storyArc.theme}
Current Progress: Chapter ${storyArc.currentChapter}/${storyArc.totalChapters}, Act ${storyArc.currentAct}
Story Phase: ${storyArc.storyPhase}

Completed Story Beats: ${completedBeats.length}
Active Story Beats: ${activeBeats.length}
Character Milestones: ${storyArc.characterMilestones.length}
World State Changes: ${storyArc.worldStateChanges.length}

Suggest improvements in these areas:
1. Pacing - story flow and chapter distribution
2. Character Development - character growth and relationships
3. World Building - setting consistency and development
4. Plot Structure - story logic and progression

Respond with JSON:
{
  "pacing": ["string"],
  "characterDevelopment": ["string"],
  "worldBuilding": ["string"],
  "plotStructure": ["string"]
}`;

    return prompt;
  }

  /**
   * Parse improvement suggestions from AI response
   */
  private parseImprovementSuggestions(content: string): {
    pacing: string[];
    characterDevelopment: string[];
    worldBuilding: string[];
    plotStructure: string[];
  } {
    try {
      const suggestions = JSON.parse(content);
      return {
        pacing: Array.isArray(suggestions.pacing) ? suggestions.pacing : [],
        characterDevelopment: Array.isArray(suggestions.characterDevelopment)
          ? suggestions.characterDevelopment
          : [],
        worldBuilding: Array.isArray(suggestions.worldBuilding) ? suggestions.worldBuilding : [],
        plotStructure: Array.isArray(suggestions.plotStructure) ? suggestions.plotStructure : [],
      };
    } catch (error) {
      logger.error(`Error parsing improvement suggestions: ${error}`);
      return {
        pacing: [],
        characterDevelopment: [],
        worldBuilding: [],
        plotStructure: [],
      };
    }
  }

  /**
   * Generate fallback improvement suggestions
   */
  private generateFallbackImprovements(_storyArc: IStoryArc): {
    pacing: string[];
    characterDevelopment: string[];
    worldBuilding: string[];
    plotStructure: string[];
  } {
    return {
      pacing: [
        'Consider adding more story beats to chapters with few events',
        'Balance story beats across all acts for better pacing',
      ],
      characterDevelopment: [
        'Add character milestones for completed story beats',
        'Include more relationship development opportunities',
      ],
      worldBuilding: [
        'Link world state changes to story events',
        'Add more environmental and faction developments',
      ],
      plotStructure: [
        'Ensure story beats build upon each other logically',
        'Add more plot twists and character motivations',
      ],
    };
  }

  /**
   * Calculate requirements for next chapter
   */
  private async calculateNextChapterRequirements(storyArc: IStoryArc): Promise<string[]> {
    const requirements: string[] = [];

    const currentChapterBeats = storyArc.storyBeats.filter(
      beat => beat.chapter === storyArc.currentChapter
    );
    const completedBeats = currentChapterBeats.filter(beat => beat.completed);

    if (completedBeats.length < this.options.minBeatsPerChapter!) {
      requirements.push(
        `Complete ${this.options.minBeatsPerChapter! - completedBeats.length} more story beats`
      );
    }

    const majorBeats = currentChapterBeats.filter(
      beat => beat.importance === 'major' || beat.importance === 'critical'
    );
    const completedMajorBeats = majorBeats.filter(beat => beat.completed);

    if (completedMajorBeats.length < majorBeats.length) {
      requirements.push(
        `Complete ${majorBeats.length - completedMajorBeats.length} major story beats`
      );
    }

    return requirements;
  }

  /**
   * Calculate requirements for act transition
   */
  private async calculateActTransitionRequirements(storyArc: IStoryArc): Promise<string[]> {
    const requirements: string[] = [];

    const currentActBeats = storyArc.storyBeats.filter(beat => beat.act === storyArc.currentAct);
    const completedActBeats = currentActBeats.filter(beat => beat.completed);

    if (completedActBeats.length < 3) {
      requirements.push(`Complete ${3 - completedActBeats.length} more story beats in current act`);
    }

    return requirements;
  }

  /**
   * Calculate requirements for story phase transition
   */
  private async calculateStoryPhaseRequirements(storyArc: IStoryArc): Promise<string[]> {
    const requirements: string[] = [];

    switch (storyArc.storyPhase) {
      case 'setup':
        if (storyArc.currentChapter < 3) {
          requirements.push('Complete setup phase with more introductory content');
        }
        break;
      case 'development':
        if (storyArc.currentChapter < storyArc.totalChapters * 0.6) {
          requirements.push('Continue developing plot and characters');
        }
        break;
      case 'climax':
        if (storyArc.currentChapter < storyArc.totalChapters * 0.8) {
          requirements.push('Build toward major confrontations and revelations');
        }
        break;
      case 'resolution':
        if (storyArc.currentChapter < storyArc.totalChapters) {
          requirements.push('Complete remaining story threads and provide closure');
        }
        break;
    }

    return requirements;
  }

  /**
   * Estimate remaining story beats
   */
  private estimateRemainingBeats(storyArc: IStoryArc): number {
    const totalBeats = storyArc.totalChapters * 3; // Assume 3 beats per chapter on average
    const completedBeats = storyArc.storyBeats.filter(beat => beat.completed).length;
    const remainingBeats = Math.max(0, totalBeats - completedBeats);

    return remainingBeats;
  }

  /**
   * Get act story phase
   */
  private getActStoryPhase(act: number): 'setup' | 'development' | 'climax' | 'resolution' {
    switch (act) {
      case 1:
        return 'setup';
      case 2:
        return 'development';
      case 3:
        return 'climax';
      case 4:
        return 'resolution';
      default:
        return 'development';
    }
  }
}

export default StoryProgression;
