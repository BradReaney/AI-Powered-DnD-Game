import logger from './LoggerService';
import LLMClientFactory from './LLMClientFactory';
import { ModelSelectionService } from './ModelSelectionService';
import { PerformanceTracker } from './PerformanceTracker';
import { Types } from 'mongoose';

export interface PlayerChoice {
  id: string;
  campaignId: string;
  sessionId: string;
  choiceText: string;
  choiceType: 'dialogue' | 'action' | 'decision' | 'moral' | 'strategic' | 'exploration';
  context: string;
  availableOptions: ChoiceOption[];
  selectedOption?: ChoiceOption;
  consequences: ChoiceConsequence[];
  timestamp: Date;
  storyBeatId?: string;
  characterIds: string[];
}

export interface ChoiceOption {
  id: string;
  text: string;
  description: string;
  type: 'aggressive' | 'diplomatic' | 'stealthy' | 'creative' | 'cautious' | 'bold';
  riskLevel: 'low' | 'medium' | 'high';
  expectedOutcome: string;
  characterAlignment?: 'lawful' | 'neutral' | 'chaotic' | 'good' | 'evil';
  skillRequirements?: string[];
}

export interface ChoiceConsequence {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term' | 'story_changing';
  description: string;
  impact: {
    story: number; // -5 to +5
    character: number; // -5 to +5
    world: number; // -5 to +5
    relationship: number; // -5 to +5
  };
  affectedCharacters: string[];
  storyBranchId?: string;
  triggered: boolean;
  triggeredAt?: Date;
}

export interface StoryBranch {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  parentBranchId?: string;
  childBranches: string[];
  triggerChoiceId: string;
  status: 'active' | 'inactive' | 'completed' | 'abandoned';
  storyContent: {
    setup: string;
    development: string;
    climax: string;
    resolution: string;
  };
  characterPaths: Record<string, string>; // characterId -> path description
  worldChanges: string[];
  convergencePoints: string[]; // Points where this branch can merge with others
  divergencePoints: string[]; // Points where this branch can split further
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchingPoint {
  id: string;
  campaignId: string;
  storyBeatId: string;
  name: string;
  description: string;
  type: 'choice' | 'convergence' | 'divergence' | 'merge';
  branches: string[];
  convergenceCriteria?: {
    requiredBranches: string[];
    conditions: string[];
  };
  divergenceCriteria?: {
    triggerConditions: string[];
    newBranchTemplates: string[];
  };
  isActive: boolean;
  createdAt: Date;
}

export interface NarrativeCoherence {
  campaignId: string;
  coherenceScore: number; // 0-100
  issues: Array<{
    type: 'contradiction' | 'inconsistency' | 'plot_hole' | 'character_inconsistency';
    description: string;
    severity: 'low' | 'medium' | 'high';
    affectedBranches: string[];
    suggestedFix: string;
  }>;
  strengths: string[];
  lastAnalyzed: Date;
}

export class BranchingNarrativeService {
  private geminiClient: any;
  private modelSelectionService: ModelSelectionService;
  private performanceTracker: PerformanceTracker;

  // In-memory storage for branching narrative data
  private playerChoices: Map<string, PlayerChoice[]> = new Map();
  private storyBranches: Map<string, StoryBranch[]> = new Map();
  private branchingPoints: Map<string, BranchingPoint[]> = new Map();
  private narrativeCoherence: Map<string, NarrativeCoherence> = new Map();

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.modelSelectionService = ModelSelectionService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
  }

  /**
   * Initialize branching narrative system for a campaign
   */
  async initializeBranchingNarrative(campaignId: string): Promise<void> {
    try {
      logger.info('Initializing branching narrative system', { campaignId });

      // Create initial main branch
      const mainBranch: StoryBranch = {
        id: `branch_main_${Date.now()}`,
        campaignId,
        name: 'Main Story Path',
        description: 'The primary narrative path for the campaign',
        childBranches: [],
        triggerChoiceId: '',
        status: 'active',
        storyContent: {
          setup: 'Initial campaign setup and character introduction',
          development: 'Main story development and character growth',
          climax: 'Major confrontation and story climax',
          resolution: 'Story resolution and character conclusions',
        },
        characterPaths: {},
        worldChanges: [],
        convergencePoints: [],
        divergencePoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.storyBranches.set(campaignId, [mainBranch]);

      // Initialize narrative coherence tracking
      this.narrativeCoherence.set(campaignId, {
        campaignId,
        coherenceScore: 100,
        issues: [],
        strengths: ['Clean narrative start'],
        lastAnalyzed: new Date(),
      });

      logger.info('Branching narrative system initialized successfully', { campaignId });
    } catch (error) {
      logger.error('Error initializing branching narrative system:', error);
      throw error;
    }
  }

  /**
   * Record a player choice
   */
  async recordPlayerChoice(
    campaignId: string,
    choice: Omit<PlayerChoice, 'id' | 'timestamp'>
  ): Promise<PlayerChoice> {
    const fullChoice: PlayerChoice = {
      ...choice,
      id: `choice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    if (!this.playerChoices.has(campaignId)) {
      this.playerChoices.set(campaignId, []);
    }

    const choices = this.playerChoices.get(campaignId)!;
    choices.push(fullChoice);

    // Process choice consequences
    await this.processChoiceConsequences(campaignId, fullChoice);

    // Check for branch creation
    await this.checkForBranchCreation(campaignId, fullChoice);

    // Update narrative coherence
    await this.updateNarrativeCoherence(campaignId);

    logger.info('Player choice recorded', {
      campaignId,
      choiceId: fullChoice.id,
      choiceType: choice.choiceType,
      optionsCount: choice.availableOptions.length,
    });

    return fullChoice;
  }

  /**
   * Process consequences of a player choice
   */
  private async processChoiceConsequences(campaignId: string, choice: PlayerChoice): Promise<void> {
    if (!choice.selectedOption) {
      return;
    }

    // Generate consequences based on the selected option
    const consequences = await this.generateChoiceConsequences(choice);

    // Update the choice with consequences
    choice.consequences = consequences;

    // Trigger immediate consequences
    for (const consequence of consequences) {
      if (consequence.type === 'immediate') {
        await this.triggerConsequence(campaignId, consequence);
      }
    }

    // Schedule future consequences
    await this.scheduleFutureConsequences(campaignId, choice, consequences);
  }

  /**
   * Generate consequences for a player choice
   */
  private async generateChoiceConsequences(choice: PlayerChoice): Promise<ChoiceConsequence[]> {
    if (!choice.selectedOption) {
      return [];
    }

    try {
      const prompt = `Generate consequences for this player choice:

Choice Context: ${choice.context}
Selected Option: ${choice.selectedOption.text}
Option Type: ${choice.selectedOption.type}
Risk Level: ${choice.selectedOption.riskLevel}
Expected Outcome: ${choice.selectedOption.expectedOutcome}

Generate realistic consequences that could result from this choice. Consider:
1. Immediate effects
2. Short-term consequences (next few sessions)
3. Long-term consequences (campaign-spanning)
4. Story-changing consequences (major plot shifts)

Return as JSON array:
[
  {
    "type": "immediate|short_term|long_term|story_changing",
    "description": "string",
    "impact": {
      "story": number,
      "character": number,
      "world": number,
      "relationship": number
    },
    "affectedCharacters": ["characterId1", "characterId2"]
  }
]`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'consequence_generation',
        temperature: 0.7,
        maxTokens: 600,
        forceModel: 'flash',
      });

      if (response.success) {
        try {
          const consequencesData = JSON.parse(response.content);
          return consequencesData.map((c: any, index: number) => ({
            id: `consequence_${Date.now()}_${index}`,
            type: c.type || 'immediate',
            description: c.description || 'Consequence description',
            impact: {
              story: Math.max(-5, Math.min(5, c.impact?.story || 0)),
              character: Math.max(-5, Math.min(5, c.impact?.character || 0)),
              world: Math.max(-5, Math.min(5, c.impact?.world || 0)),
              relationship: Math.max(-5, Math.min(5, c.impact?.relationship || 0)),
            },
            affectedCharacters: c.affectedCharacters || choice.characterIds,
            triggered: c.type === 'immediate',
            triggeredAt: c.type === 'immediate' ? new Date() : undefined,
          }));
        } catch (parseError) {
          logger.error('Error parsing consequences response:', parseError);
        }
      }
    } catch (error) {
      logger.error('Error generating choice consequences:', error);
    }

    // Fallback consequences
    return [
      {
        id: `consequence_${Date.now()}_0`,
        type: 'immediate',
        description: `Choice: ${choice.selectedOption.text}`,
        impact: {
          story: 0,
          character: 0,
          world: 0,
          relationship: 0,
        },
        affectedCharacters: choice.characterIds,
        triggered: true,
        triggeredAt: new Date(),
      },
    ];
  }

  /**
   * Trigger a consequence
   */
  private async triggerConsequence(
    campaignId: string,
    consequence: ChoiceConsequence
  ): Promise<void> {
    consequence.triggered = true;
    consequence.triggeredAt = new Date();

    logger.info('Consequence triggered', {
      campaignId,
      consequenceId: consequence.id,
      type: consequence.type,
      description: consequence.description,
    });

    // Here you would integrate with other services to apply the consequence
    // For example, update character relationships, world state, etc.
  }

  /**
   * Schedule future consequences
   */
  private async scheduleFutureConsequences(
    campaignId: string,
    choice: PlayerChoice,
    consequences: ChoiceConsequence[]
  ): Promise<void> {
    const futureConsequences = consequences.filter(c => c.type !== 'immediate');

    for (const consequence of futureConsequences) {
      // In a real implementation, you might use a job queue or scheduler
      // For now, we'll just mark them as pending
      logger.info('Future consequence scheduled', {
        campaignId,
        choiceId: choice.id,
        consequenceId: consequence.id,
        type: consequence.type,
      });
    }
  }

  /**
   * Check if a choice should create a new story branch
   */
  private async checkForBranchCreation(campaignId: string, choice: PlayerChoice): Promise<void> {
    if (!choice.selectedOption) {
      return;
    }

    // Determine if this choice is significant enough to create a branch
    const shouldCreateBranch = await this.shouldCreateBranch(choice);

    if (shouldCreateBranch) {
      await this.createNewBranch(campaignId, choice);
    }
  }

  /**
   * Determine if a choice should create a new branch
   */
  private async shouldCreateBranch(choice: PlayerChoice): Promise<boolean> {
    // Check if choice has story-changing consequences
    const hasStoryChangingConsequences = choice.consequences.some(
      c => c.type === 'story_changing' || Math.abs(c.impact.story) >= 3
    );

    // Check if choice type is significant
    const significantChoiceTypes = ['moral', 'strategic', 'decision'];
    const isSignificantType = significantChoiceTypes.includes(choice.choiceType);

    // Check if risk level is high
    const isHighRisk = choice.selectedOption?.riskLevel === 'high';

    return hasStoryChangingConsequences || isSignificantType || isHighRisk;
  }

  /**
   * Create a new story branch
   */
  private async createNewBranch(campaignId: string, choice: PlayerChoice): Promise<StoryBranch> {
    const branches = this.storyBranches.get(campaignId) || [];
    const parentBranch = branches.find(b => b.status === 'active');

    const newBranch: StoryBranch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId,
      name: `Branch: ${choice.selectedOption?.text || 'New Path'}`,
      description: `Story branch created from choice: ${choice.choiceText}`,
      parentBranchId: parentBranch?.id,
      childBranches: [],
      triggerChoiceId: choice.id,
      status: 'active',
      storyContent: {
        setup: `Branch setup based on choice: ${choice.selectedOption?.text}`,
        development: 'Branch development to be determined',
        climax: 'Branch climax to be determined',
        resolution: 'Branch resolution to be determined',
      },
      characterPaths: {},
      worldChanges: [],
      convergencePoints: [],
      divergencePoints: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add as child to parent branch
    if (parentBranch) {
      parentBranch.childBranches.push(newBranch.id);
      parentBranch.updatedAt = new Date();
    }

    branches.push(newBranch);
    this.storyBranches.set(campaignId, branches);

    logger.info('New story branch created', {
      campaignId,
      branchId: newBranch.id,
      parentBranchId: parentBranch?.id,
      triggerChoiceId: choice.id,
    });

    return newBranch;
  }

  /**
   * Update narrative coherence
   */
  private async updateNarrativeCoherence(campaignId: string): Promise<void> {
    const coherence = this.narrativeCoherence.get(campaignId);
    if (!coherence) {
      return;
    }

    // Analyze current narrative state
    const analysis = await this.analyzeNarrativeCoherence(campaignId);

    coherence.coherenceScore = analysis.score;
    coherence.issues = analysis.issues;
    coherence.strengths = analysis.strengths;
    coherence.lastAnalyzed = new Date();

    this.narrativeCoherence.set(campaignId, coherence);
  }

  /**
   * Analyze narrative coherence
   */
  private async analyzeNarrativeCoherence(campaignId: string): Promise<{
    score: number;
    issues: Array<{
      type: 'contradiction' | 'inconsistency' | 'plot_hole' | 'character_inconsistency';
      description: string;
      severity: 'low' | 'medium' | 'high';
      affectedBranches: string[];
      suggestedFix: string;
    }>;
    strengths: string[];
  }> {
    const branches = this.storyBranches.get(campaignId) || [];
    const choices = this.playerChoices.get(campaignId) || [];

    let score = 100;
    const issues: any[] = [];
    const strengths: string[] = [];

    // Check for contradictions between branches
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        const branch1 = branches[i];
        const branch2 = branches[j];

        // Check for world state contradictions
        const worldConflicts = this.findWorldStateConflicts(branch1, branch2);
        if (worldConflicts.length > 0) {
          issues.push({
            type: 'contradiction',
            description: `World state conflicts between branches: ${worldConflicts.join(', ')}`,
            severity: 'high',
            affectedBranches: [branch1.id, branch2.id],
            suggestedFix:
              'Reconcile conflicting world states or mark branches as mutually exclusive',
          });
          score -= 20;
        }
      }
    }

    // Check for character consistency
    const characterIssues = this.findCharacterConsistencyIssues(choices);
    issues.push(...characterIssues);
    score -= characterIssues.length * 10;

    // Check for plot holes
    const plotHoles = this.findPlotHoles(branches, choices);
    issues.push(...plotHoles);
    score -= plotHoles.length * 15;

    // Identify strengths
    if (branches.length > 1) {
      strengths.push('Multiple story paths available');
    }
    if (choices.length > 0) {
      strengths.push('Active player choice system');
    }
    if (issues.length === 0) {
      strengths.push('No narrative inconsistencies detected');
    }

    return {
      score: Math.max(0, score),
      issues,
      strengths,
    };
  }

  /**
   * Find world state conflicts between branches
   */
  private findWorldStateConflicts(branch1: StoryBranch, branch2: StoryBranch): string[] {
    const conflicts: string[] = [];

    // Simple conflict detection - in a real implementation, this would be more sophisticated
    for (const change1 of branch1.worldChanges) {
      for (const change2 of branch2.worldChanges) {
        if (this.areConflictingChanges(change1, change2)) {
          conflicts.push(`${change1} vs ${change2}`);
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two world changes are conflicting
   */
  private areConflictingChanges(change1: string, change2: string): boolean {
    // Simple heuristic - look for contradictory keywords
    const contradictions = [
      ['destroyed', 'built'],
      ['killed', 'alive'],
      ['enemy', 'ally'],
      ['peace', 'war'],
    ];

    return contradictions.some(
      ([word1, word2]) =>
        (change1.toLowerCase().includes(word1) && change2.toLowerCase().includes(word2)) ||
        (change1.toLowerCase().includes(word2) && change2.toLowerCase().includes(word1))
    );
  }

  /**
   * Find character consistency issues
   */
  private findCharacterConsistencyIssues(choices: PlayerChoice[]): any[] {
    const issues: any[] = [];

    // Group choices by character
    const characterChoices: Record<string, PlayerChoice[]> = {};
    for (const choice of choices) {
      for (const characterId of choice.characterIds) {
        if (!characterChoices[characterId]) {
          characterChoices[characterId] = [];
        }
        characterChoices[characterId].push(choice);
      }
    }

    // Check for character consistency
    for (const [characterId, charChoices] of Object.entries(characterChoices)) {
      const alignmentChoices = charChoices.filter(c => c.selectedOption?.characterAlignment);

      if (alignmentChoices.length > 1) {
        const alignments = alignmentChoices.map(c => c.selectedOption!.characterAlignment!);
        const uniqueAlignments = [...new Set(alignments)];

        if (uniqueAlignments.length > 1) {
          issues.push({
            type: 'character_inconsistency',
            description: `Character ${characterId} has inconsistent alignment choices: ${uniqueAlignments.join(', ')}`,
            severity: 'medium',
            affectedBranches: [],
            suggestedFix: 'Review character choices for alignment consistency',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Find plot holes in the narrative
   */
  private findPlotHoles(branches: StoryBranch[], choices: PlayerChoice[]): any[] {
    const issues: any[] = [];

    // Check for unresolved story threads
    for (const branch of branches) {
      if (branch.status === 'active' && branch.convergencePoints.length === 0) {
        // Check if branch has been active for too long without convergence
        const daysSinceCreation = (Date.now() - branch.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 7) {
          issues.push({
            type: 'plot_hole',
            description: `Branch "${branch.name}" has been active for ${Math.floor(daysSinceCreation)} days without convergence`,
            severity: 'low',
            affectedBranches: [branch.id],
            suggestedFix: 'Consider adding convergence points or resolving the branch',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Get player choices for a campaign
   */
  getPlayerChoices(campaignId: string): PlayerChoice[] {
    return this.playerChoices.get(campaignId) || [];
  }

  /**
   * Get story branches for a campaign
   */
  getStoryBranches(campaignId: string): StoryBranch[] {
    return this.storyBranches.get(campaignId) || [];
  }

  /**
   * Get active story branches for a campaign
   */
  getActiveStoryBranches(campaignId: string): StoryBranch[] {
    return this.getStoryBranches(campaignId).filter(b => b.status === 'active');
  }

  /**
   * Get narrative coherence for a campaign
   */
  getNarrativeCoherence(campaignId: string): NarrativeCoherence | null {
    return this.narrativeCoherence.get(campaignId) || null;
  }

  /**
   * Merge two story branches
   */
  async mergeStoryBranches(
    campaignId: string,
    branchId1: string,
    branchId2: string,
    mergePoint: string
  ): Promise<boolean> {
    const branches = this.storyBranches.get(campaignId) || [];
    const branch1 = branches.find(b => b.id === branchId1);
    const branch2 = branches.find(b => b.id === branchId2);

    if (!branch1 || !branch2) {
      return false;
    }

    // Create merged branch
    const mergedBranch: StoryBranch = {
      id: `branch_merged_${Date.now()}`,
      campaignId,
      name: `Merged: ${branch1.name} + ${branch2.name}`,
      description: `Merged branches at: ${mergePoint}`,
      parentBranchId: branch1.parentBranchId,
      childBranches: [...branch1.childBranches, ...branch2.childBranches],
      triggerChoiceId: '',
      status: 'active',
      storyContent: {
        setup: `Merged setup from both branches`,
        development: `Merged development converging at: ${mergePoint}`,
        climax: 'Merged climax to be determined',
        resolution: 'Merged resolution to be determined',
      },
      characterPaths: { ...branch1.characterPaths, ...branch2.characterPaths },
      worldChanges: [...branch1.worldChanges, ...branch2.worldChanges],
      convergencePoints: [mergePoint],
      divergencePoints: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mark original branches as completed
    branch1.status = 'completed';
    branch2.status = 'completed';
    branch1.updatedAt = new Date();
    branch2.updatedAt = new Date();

    branches.push(mergedBranch);
    this.storyBranches.set(campaignId, branches);

    logger.info('Story branches merged', {
      campaignId,
      branchId1,
      branchId2,
      mergedBranchId: mergedBranch.id,
      mergePoint,
    });

    return true;
  }

  /**
   * Get choice statistics for a campaign
   */
  getChoiceStatistics(campaignId: string): {
    totalChoices: number;
    choicesByType: Record<string, number>;
    averageConsequences: number;
    branchCreationRate: number;
    mostCommonChoiceType: string;
  } {
    const choices = this.getPlayerChoices(campaignId);
    const branches = this.getStoryBranches(campaignId);

    const choicesByType: Record<string, number> = {};
    let totalConsequences = 0;

    for (const choice of choices) {
      choicesByType[choice.choiceType] = (choicesByType[choice.choiceType] || 0) + 1;
      totalConsequences += choice.consequences.length;
    }

    const mostCommonChoiceType =
      Object.entries(choicesByType).sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    return {
      totalChoices: choices.length,
      choicesByType,
      averageConsequences: choices.length > 0 ? totalConsequences / choices.length : 0,
      branchCreationRate: choices.length > 0 ? branches.length / choices.length : 0,
      mostCommonChoiceType,
    };
  }

  /**
   * Generate choice suggestions based on current story state
   */
  async generateChoiceSuggestions(
    campaignId: string,
    context: string,
    characterIds: string[]
  ): Promise<ChoiceOption[]> {
    try {
      const prompt = `Generate meaningful choice options for this situation:

Context: ${context}
Involved Characters: ${characterIds.join(', ')}

Current Story State:
- Active Branches: ${this.getActiveStoryBranches(campaignId).length}
- Recent Choices: ${this.getPlayerChoices(campaignId)
        .slice(-3)
        .map(c => c.choiceText)
        .join(', ')}

Generate 3-5 choice options that:
1. Are meaningful and impactful
2. Fit the current context
3. Allow for different character approaches
4. Have clear consequences
5. Advance the story

Return as JSON array:
[
  {
    "text": "string",
    "description": "string",
    "type": "aggressive|diplomatic|stealthy|creative|cautious|bold",
    "riskLevel": "low|medium|high",
    "expectedOutcome": "string",
    "characterAlignment": "lawful|neutral|chaotic|good|evil"
  }
]`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'choice_generation',
        temperature: 0.8,
        maxTokens: 500,
        forceModel: 'flash',
      });

      if (response.success) {
        try {
          const optionsData = JSON.parse(response.content);
          return optionsData.map((option: any, index: number) => ({
            id: `option_${Date.now()}_${index}`,
            text: option.text || 'Choice option',
            description: option.description || 'Option description',
            type: option.type || 'neutral',
            riskLevel: option.riskLevel || 'medium',
            expectedOutcome: option.expectedOutcome || 'Outcome to be determined',
            characterAlignment: option.characterAlignment,
          }));
        } catch (parseError) {
          logger.error('Error parsing choice suggestions response:', parseError);
        }
      }
    } catch (error) {
      logger.error('Error generating choice suggestions:', error);
    }

    // Fallback options
    return [
      {
        id: `option_${Date.now()}_0`,
        text: 'Take a cautious approach',
        description: 'Proceed carefully and gather more information',
        type: 'cautious',
        riskLevel: 'low',
        expectedOutcome: 'Safe but potentially slower progress',
      },
      {
        id: `option_${Date.now()}_1`,
        text: 'Take bold action',
        description: 'Make a decisive move to advance the situation',
        type: 'bold',
        riskLevel: 'high',
        expectedOutcome: 'High risk, high reward outcome',
      },
    ];
  }
}

export default BranchingNarrativeService;
