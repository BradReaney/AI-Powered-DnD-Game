import logger from './LoggerService';
import {
  IStoryArc,
  IStoryBeat,
  ICharacterMilestone,
  IWorldStateChange,
  IQuestProgress,
} from '../models/StoryArc';
import { ILLMClient } from './GeminiClient';
import { Types } from 'mongoose';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (storyArc: IStoryArc) => ValidationResult;
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface StoryValidationReport {
  overallScore: number;
  valid: boolean;
  results: ValidationResult[];
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    warnings: number;
    suggestions: number;
  };
  recommendations: string[];
}

export class StoryValidator {
  private rules: ValidationRule[] = [];
  private geminiClient: ILLMClient;

  constructor(geminiClient: ILLMClient) {
    this.geminiClient = geminiClient;
    this.initializeRules();
  }

  /**
   * Initialize validation rules
   */
  private initializeRules(): void {
    this.rules = [
      // Story Structure Rules
      {
        id: 'story_structure_progression',
        name: 'Story Structure Progression',
        description: 'Ensures story beats follow logical chapter and act progression',
        severity: 'error',
        validate: this.validateStoryStructureProgression.bind(this),
      },
      {
        id: 'story_beat_completion',
        name: 'Story Beat Completion',
        description: 'Checks that completed story beats have appropriate consequences',
        severity: 'warning',
        validate: this.validateStoryBeatCompletion.bind(this),
      },
      {
        id: 'character_development_tracking',
        name: 'Character Development Tracking',
        description: 'Ensures character milestones are recorded for significant story events',
        severity: 'warning',
        validate: this.validateCharacterDevelopmentTracking.bind(this),
      },
      {
        id: 'world_state_consistency',
        name: 'World State Consistency',
        description: 'Checks for contradictions in world state changes',
        severity: 'error',
        validate: this.validateWorldStateConsistency.bind(this),
      },
      {
        id: 'quest_story_integration',
        name: 'Quest-Story Integration',
        description: 'Ensures quests are properly integrated with story progression',
        severity: 'warning',
        validate: this.validateQuestStoryIntegration.bind(this),
      },
      {
        id: 'story_pacing',
        name: 'Story Pacing',
        description: 'Analyzes story pacing and chapter distribution',
        severity: 'info',
        validate: this.validateStoryPacing.bind(this),
      },
      {
        id: 'character_relationship_development',
        name: 'Character Relationship Development',
        description: 'Tracks character relationship changes throughout the story',
        severity: 'info',
        validate: this.validateCharacterRelationshipDevelopment.bind(this),
      },
      {
        id: 'narrative_coherence',
        name: 'Narrative Coherence',
        description: 'Uses AI to analyze overall narrative coherence',
        severity: 'warning',
        validate: this.validateNarrativeCoherence.bind(this),
      },
    ];
  }

  /**
   * Validate story arc using all rules
   */
  async validateStoryArc(storyArc: IStoryArc): Promise<StoryValidationReport> {
    const startTime = Date.now();
    logger.info(`Starting story validation for campaign ${storyArc.campaignId}`);

    try {
      const results: ValidationResult[] = [];

      // Debug: Check if rules are properly initialized
      logger.debug(`Number of validation rules: ${this.rules ? this.rules.length : 'undefined'}`);
      if (!this.rules || this.rules.length === 0) {
        logger.warn('No validation rules found, using fallback validation');
        return this.createFallbackValidationReport(storyArc);
      }

      // Run all validation rules
      for (const rule of this.rules) {
        try {
          logger.debug(`Running validation rule: ${rule.name} (${rule.id})`);
          const result = rule.validate(storyArc);
          results.push(result);
          logger.debug(`Rule ${rule.name} completed: ${result.passed ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
          logger.error(`Error running validation rule ${rule.name} (${rule.id}): ${error}`);
          logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            passed: false,
            issues: [`Validation rule error: ${error}`],
            warnings: [],
            suggestions: [],
            score: 0,
          });
        }
      }

      // Calculate overall score
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const overallScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

      // Generate summary
      const summary = {
        totalRules: results.length,
        passedRules: results.filter(r => r.passed).length,
        failedRules: results.filter(r => !r.passed).length,
        warnings: results.reduce((sum, r) => sum + (r.warnings ? r.warnings.length : 0), 0),
        suggestions: results.reduce(
          (sum, r) => sum + (r.suggestions ? r.suggestions.length : 0),
          0
        ),
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations(results);

      const validationTime = Date.now() - startTime;
      logger.info(
        `Story validation completed in ${validationTime}ms. Overall score: ${overallScore}`
      );

      return {
        overallScore,
        valid: overallScore >= 70, // Consider valid if score is 70% or higher
        results,
        summary,
        recommendations,
      };
    } catch (error) {
      logger.error(`Error during story validation: ${error}`);
      throw error;
    }
  }

  /**
   * Validate story structure progression
   */
  private validateStoryStructureProgression(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Sort story beats by chapter and act
    const storyBeats = [...(storyArc.storyBeats || [])].sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.act - b.act;
    });

    // Check for invalid progression
    for (let i = 1; i < storyBeats.length; i++) {
      const prevBeat = storyBeats[i - 1];
      const currentBeat = storyBeats[i];

      if (currentBeat.chapter < prevBeat.chapter) {
        issues.push(
          `Story beat "${currentBeat.title}" has invalid chapter progression (${currentBeat.chapter} < ${prevBeat.chapter})`
        );
      }

      if (currentBeat.act < prevBeat.act) {
        issues.push(
          `Story beat "${currentBeat.title}" has invalid act progression (${currentBeat.act} < ${prevBeat.act})`
        );
      }

      // Check for large gaps in chapters
      if (currentBeat.chapter - prevBeat.chapter > 2) {
        warnings.push(`Large gap between chapters ${prevBeat.chapter} and ${currentBeat.chapter}`);
      }
    }

    // Check act distribution
    const actDistribution = (storyArc.storyBeats || []).reduce(
      (acc, beat) => {
        acc[beat.act] = (acc[beat.act] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    if (actDistribution[1] && actDistribution[1] < 2) {
      suggestions.push('Consider adding more setup story beats in Act 1');
    }

    if (actDistribution[2] && actDistribution[2] < 3) {
      suggestions.push('Consider adding more development story beats in Act 2');
    }

    if (actDistribution[3] && actDistribution[3] < 2) {
      suggestions.push('Consider adding more climax story beats in Act 3');
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'story_structure_progression',
      ruleName: 'Story Structure Progression',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate story beat completion
   */
  private validateStoryBeatCompletion(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const completedBeats = (storyArc.storyBeats || []).filter(beat => beat.completed);

    for (const beat of completedBeats) {
      // Check if completed beat has consequences
      if ((beat.consequences || []).length === 0) {
        warnings.push(`Completed story beat "${beat.title}" has no consequences defined`);
      }

      // Check if completed beat has character involvement
      if ((beat.characters || []).length === 0) {
        warnings.push(`Completed story beat "${beat.title}" has no characters involved`);
      }

      // Check if completed beat has location
      if (!beat.location) {
        warnings.push(`Completed story beat "${beat.title}" has no location specified`);
      }
    }

    // Check completion rate
    const completionRate = completedBeats.length / (storyArc.storyBeats || []).length;
    if (completionRate < 0.2) {
      suggestions.push('Consider completing more story beats to advance the narrative');
    } else if (completionRate > 0.8) {
      suggestions.push(
        'Most story beats are completed. Consider adding new story beats or advancing to the next chapter'
      );
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'story_beat_completion',
      ruleName: 'Story Beat Completion',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate character development tracking
   */
  private validateCharacterDevelopmentTracking(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const completedBeats = (storyArc.storyBeats || []).filter(beat => beat.completed);

    // Check if completed beats have character milestones
    for (const beat of completedBeats) {
      const hasMilestone = (storyArc.characterMilestones || []).some(
        milestone => milestone.storyBeatId === beat.id
      );

      if (!hasMilestone) {
        warnings.push(`Completed story beat "${beat.title}" has no character milestones recorded`);
      }
    }

    // Check milestone distribution by type
    const milestoneTypes = (storyArc.characterMilestones || []).reduce(
      (acc, milestone) => {
        acc[milestone.type] = (acc[milestone.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (!milestoneTypes['level'] || milestoneTypes['level'] < 2) {
      suggestions.push('Consider adding more level progression milestones');
    }

    if (!milestoneTypes['relationship'] || milestoneTypes['relationship'] < 2) {
      suggestions.push('Consider adding more relationship development milestones');
    }

    if (!milestoneTypes['story'] || milestoneTypes['story'] < 3) {
      suggestions.push('Consider adding more story impact milestones');
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'character_development_tracking',
      ruleName: 'Character Development Tracking',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate world state consistency
   */
  private validateWorldStateConsistency(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Sort world changes by occurrence time
    const worldChanges = [...(storyArc.worldStateChanges || [])].sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
    );

    // Check for contradictory changes
    for (let i = 1; i < worldChanges.length; i++) {
      const prevChange = worldChanges[i - 1];
      const currentChange = worldChanges[i];

      // Check for overlapping affected elements
      const overlappingElements = prevChange.affectedElements.filter(element =>
        currentChange.affectedElements.includes(element)
      );

      if (overlappingElements.length > 0) {
        // Check for potential contradictions
        if (prevChange.impact === 'catastrophic' && currentChange.impact === 'minor') {
          issues.push(
            `World state change "${currentChange.title}" may contradict previous catastrophic change "${prevChange.title}"`
          );
        }

        if (prevChange.permanent && !currentChange.permanent) {
          warnings.push(
            `Permanent world change "${prevChange.title}" may be affected by temporary change "${currentChange.title}"`
          );
        }
      }
    }

    // Check for orphaned world changes
    const worldChangesWithStoryBeats = worldChanges.filter(change => change.storyBeatId);
    if (worldChangesWithStoryBeats.length < worldChanges.length * 0.7) {
      suggestions.push('Consider linking more world state changes to specific story beats');
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'world_state_consistency',
      ruleName: 'World State Consistency',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate quest-story integration
   */
  private validateQuestStoryIntegration(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const activeQuests = (storyArc.questProgress || []).filter(quest => quest.status === 'active');
    const completedQuests = (storyArc.questProgress || []).filter(
      quest => quest.status === 'completed'
    );

    // Check if active quests are linked to story beats
    for (const quest of activeQuests) {
      if (!quest.storyBeatId) {
        warnings.push(`Active quest "${quest.name}" is not linked to a story beat`);
      }
    }

    // Check quest type distribution
    const questTypes = (storyArc.questProgress || []).reduce(
      (acc, quest) => {
        acc[quest.type] = (acc[quest.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (!questTypes['setup'] || questTypes['setup'] < 1) {
      suggestions.push('Consider adding setup quests to introduce story elements');
    }

    if (!questTypes['development'] || questTypes['development'] < 2) {
      suggestions.push('Consider adding more development quests to advance the plot');
    }

    if (!questTypes['climax'] || questTypes['climax'] < 1) {
      suggestions.push('Consider adding climax quests for major confrontations');
    }

    // Check quest completion rate
    const questCompletionRate = completedQuests.length / (storyArc.questProgress || []).length;
    if (questCompletionRate < 0.3) {
      suggestions.push('Consider completing more quests to advance the story');
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'quest_story_integration',
      ruleName: 'Quest-Story Integration',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate story pacing
   */
  private validateStoryPacing(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const totalChapters = storyArc.totalChapters;
    const currentChapter = storyArc.currentChapter;
    const completedBeats = (storyArc.storyBeats || []).filter(beat => beat.completed);

    // Check chapter progression
    const expectedProgress = (currentChapter / totalChapters) * 100;
    const actualProgress = (completedBeats.length / (storyArc.storyBeats || []).length) * 100;

    if (Math.abs(expectedProgress - actualProgress) > 20) {
      warnings.push(
        `Story progress (${actualProgress.toFixed(1)}%) doesn't match chapter progression (${expectedProgress.toFixed(1)}%)`
      );
    }

    // Check pacing based on campaign settings
    if (storyArc.pacing === 'fast' && actualProgress < 30) {
      suggestions.push('Fast-paced campaign should have more story progression');
    } else if (storyArc.pacing === 'slow' && actualProgress > 70) {
      suggestions.push('Slow-paced campaign may be progressing too quickly');
    }

    // Check chapter distribution
    const chapterDistribution = (storyArc.storyBeats || []).reduce(
      (acc, beat) => {
        acc[beat.chapter] = (acc[beat.chapter] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const averageBeatsPerChapter = (storyArc.storyBeats || []).length / totalChapters;
    for (let chapter = 1; chapter <= totalChapters; chapter++) {
      const beatsInChapter = chapterDistribution[chapter] || 0;
      if (beatsInChapter < averageBeatsPerChapter * 0.5) {
        suggestions.push(`Chapter ${chapter} has fewer story beats than average`);
      } else if (beatsInChapter > averageBeatsPerChapter * 2) {
        suggestions.push(`Chapter ${chapter} has more story beats than average`);
      }
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'story_pacing',
      ruleName: 'Story Pacing',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate character relationship development
   */
  private validateCharacterRelationshipDevelopment(storyArc: IStoryArc): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const relationshipMilestones = (storyArc.characterMilestones || []).filter(
      milestone => milestone.type === 'relationship'
    );

    if (relationshipMilestones.length < 2) {
      suggestions.push('Consider adding more character relationship development milestones');
    }

    // Check for character interaction patterns
    const characterInteractions = new Map<string, number>();
    for (const beat of storyArc.storyBeats || []) {
      for (const charId of beat.characters || []) {
        const charKey = charId.toString();
        characterInteractions.set(charKey, (characterInteractions.get(charKey) || 0) + 1);
      }
    }

    if (characterInteractions.size < 2) {
      warnings.push('Story has limited character interaction opportunities');
    }

    // Check for character development balance
    const characterDevelopment = (storyArc.characterMilestones || []).reduce(
      (acc, milestone) => {
        const charKey = milestone.characterId.toString();
        acc[charKey] = (acc[charKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const developmentCounts = Object.values(characterDevelopment);
    if (developmentCounts.length > 0) {
      const maxDev = Math.max(...developmentCounts);
      const minDev = Math.min(...developmentCounts);
      if (maxDev - minDev > 3) {
        suggestions.push('Consider balancing character development across all characters');
      }
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'character_relationship_development',
      ruleName: 'Character Relationship Development',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Validate narrative coherence using AI
   */
  private async validateNarrativeCoherence(storyArc: IStoryArc): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // Prepare story summary for AI analysis
      const storySummary = this.prepareStorySummary(storyArc);

      const prompt = `Analyze the following D&D campaign story arc for narrative coherence:

${storySummary}

Please identify any narrative inconsistencies, plot holes, or areas that could be improved. Focus on:
1. Story logic and flow
2. Character motivation consistency
3. World-building coherence
4. Plot progression logic

Respond with a JSON object containing:
{
  "coherent": boolean,
  "issues": [string],
  "warnings": [string],
  "suggestions": [string],
  "overallAssessment": string
}`;

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_consistency_check',
        temperature: 0.3,
      });

      if (response.success && response.content) {
        try {
          const analysis = JSON.parse(response.content);

          if (analysis.issues && Array.isArray(analysis.issues)) {
            issues.push(...analysis.issues);
          }
          if (analysis.warnings && Array.isArray(analysis.warnings)) {
            warnings.push(...analysis.warnings);
          }
          if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
            suggestions.push(...analysis.suggestions);
          }
        } catch (parseError) {
          warnings.push('AI analysis response could not be parsed');
        }
      } else {
        warnings.push('AI analysis was not available');
      }
    } catch (error) {
      logger.error(`Error during AI narrative coherence validation: ${error}`);
      warnings.push('AI analysis failed - using fallback validation');
    }

    const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

    return {
      ruleId: 'narrative_coherence',
      ruleName: 'Narrative Coherence',
      passed: issues.length === 0,
      issues,
      warnings,
      suggestions,
      score,
    };
  }

  /**
   * Create a fallback validation report when rules are not available
   */
  private createFallbackValidationReport(storyArc: IStoryArc): StoryValidationReport {
    return {
      valid: true,
      overallScore: 50,
      summary: {
        totalRules: 0,
        passedRules: 0,
        failedRules: 0,
        warnings: 0,
        suggestions: 0,
      },
      results: [],
      recommendations: ['Validation rules not available - using fallback validation'],
    };
  }

  /**
   * Prepare story summary for AI analysis
   */
  private prepareStorySummary(storyArc: IStoryArc): string {
    const completedBeats = (storyArc.storyBeats || []).filter(beat => beat.completed);
    const activeBeats = (storyArc.storyBeats || []).filter(beat => !beat.completed);

    let summary = `Campaign Theme: ${storyArc.theme}\n`;
    summary += `Current Chapter: ${storyArc.currentChapter}/${storyArc.totalChapters}\n`;
    summary += `Current Act: ${storyArc.currentAct}\n`;
    summary += `Story Phase: ${storyArc.storyPhase}\n\n`;

    summary += `Completed Story Beats:\n`;
    for (const beat of completedBeats) {
      summary += `- ${beat.title} (Chapter ${beat.chapter}, Act ${beat.act}): ${beat.description}\n`;
    }

    summary += `\nActive Story Beats:\n`;
    for (const beat of activeBeats) {
      summary += `- ${beat.title} (Chapter ${beat.chapter}, Act ${beat.act}): ${beat.description}\n`;
    }

    summary += `\nCharacter Milestones: ${(storyArc.characterMilestones || []).length}\n`;
    summary += `World State Changes: ${(storyArc.worldStateChanges || []).length}\n`;
    summary += `Active Quests: ${(storyArc.questProgress || []).filter(q => q.status === 'active').length}\n`;

    return summary;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];

    // Collect all suggestions and warnings
    const allSuggestions = results.flatMap(r => r.suggestions);
    const allWarnings = results.flatMap(r => r.warnings);

    // Add high-priority suggestions
    const highPrioritySuggestions = allSuggestions.filter(
      suggestion => suggestion.includes('Consider') || suggestion.includes('Review')
    );
    recommendations.push(...highPrioritySuggestions.slice(0, 3));

    // Add warnings as recommendations
    const warningRecommendations = allWarnings.slice(0, 2);
    recommendations.push(...warningRecommendations);

    // Add general recommendations based on overall score
    const overallScore =
      results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;
    if (overallScore < 70) {
      recommendations.push(
        'Overall story quality needs improvement. Focus on addressing critical issues first.'
      );
    } else if (overallScore < 85) {
      recommendations.push(
        'Story is good but could be enhanced. Address warnings and implement suggestions.'
      );
    } else {
      recommendations.push(
        'Story is well-crafted. Continue maintaining quality and consider advanced storytelling techniques.'
      );
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
}

export default StoryValidator;
