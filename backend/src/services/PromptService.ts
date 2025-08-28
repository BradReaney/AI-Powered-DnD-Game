import logger from './LoggerService';

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: 'character' | 'story' | 'combat' | 'skill-check' | 'world-building';
  temperature: number;
  maxTokens: number;
}

export interface PromptRequest {
  templateId: string;
  variables: Record<string, string | number>;
  customContext?: string;
  temperature?: number;
  maxTokens?: number;
}

export class PromptService {
  private templates: Map<string, PromptTemplate> = new Map();
  private defaultTemplates: PromptTemplate[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default prompt templates
   */
  private initializeDefaultTemplates(): void {
    this.defaultTemplates = [
      // Character Generation Templates
      {
        id: 'character_generation',
        name: 'Character Generation',
        template: `You are a Dungeon Master creating a D&D 5e character for a {campaignTheme} campaign.

Role: {role}
Existing party members: {partyComposition}
Campaign tone: {campaignTone}

Generate a complete character with:
1. Name, race, class, and background
2. Personality traits and motivations (3-4 traits)
3. Brief backstory (2-3 sentences)
4. Key abilities and specializations
5. Character voice/style for roleplay
6. One memorable quirk or habit

Make the character fit the campaign theme and complement the existing party. Keep the response concise but detailed enough for immediate gameplay.`,
        variables: ['campaignTheme', 'role', 'partyComposition', 'campaignTone'],
        category: 'character',
        temperature: 0.8,
        maxTokens: 500,
      },

      // Story Response Templates
      {
        id: 'story_response',
        name: 'Story Response',
        template: `You are the Dungeon Master responding to a player's action in a D&D campaign.

Player Action: "{playerAction}"

Campaign Context: {campaignContext}
Character Context: {characterContext}
Current World State: {worldState}
Current Location: {currentLocation}

Respond as the DM with:
1. Immediate consequences of the action (visual, sensory details)
2. Environmental or NPC reactions
3. Clear next steps or choices for the player
4. Any relevant skill checks needed (specify skill and DC)
5. Story progression details
6. Ask the player what they want to do next

Keep your response engaging, clear, and actionable. Use descriptive language to set the scene.`,
        variables: [
          'playerAction',
          'campaignContext',
          'characterContext',
          'worldState',
          'currentLocation',
        ],
        category: 'story',
        temperature: 0.8,
        maxTokens: 400,
      },

      // Skill Check Result Templates
      {
        id: 'skill_check_result',
        name: 'Skill Check Result',
        template: `You are the Dungeon Master describing the result of a skill check.

Skill: {skillName}
Roll Result: {rollResult}
Target DC: {targetDC}
Action: {actionDescription}
Context: {context}
Character: {characterName}

Result: {success ? 'Success' : 'Failure'}{critical ? ' (Critical!)' : ''}

Generate a vivid, engaging description of what happens as a result of this {skillName} check. Include:
1. Immediate visual and sensory details
2. Consequences of success/failure
3. How this affects the current situation
4. What the character learns or discovers
5. Clear next steps or choices

Make it cinematic and engaging while maintaining game balance. Keep the response focused and actionable.`,
        variables: [
          'skillName',
          'rollResult',
          'targetDC',
          'actionDescription',
          'context',
          'characterName',
          'success',
          'critical',
        ],
        category: 'skill-check',
        temperature: 0.7,
        maxTokens: 300,
      },

      // Combat Description Templates
      {
        id: 'combat_description',
        name: 'Combat Description',
        template: `You are the Dungeon Master describing a combat encounter in a D&D campaign.

Current Situation: {situation}
Initiative Order: {initiativeOrder}
Character Actions: {characterActions}
Enemy Actions: {enemyActions}
Environmental Factors: {environment}

Describe the combat round with:
1. Vivid action descriptions
2. Environmental interactions
3. Tactical positioning details
4. Consequences of actions
5. Current status of all participants
6. Clear next steps for players

Make it exciting and cinematic while maintaining clarity for gameplay.`,
        variables: [
          'situation',
          'initiativeOrder',
          'characterActions',
          'enemyActions',
          'environment',
        ],
        category: 'combat',
        temperature: 0.7,
        maxTokens: 400,
      },

      // World Building Templates
      {
        id: 'world_description',
        name: 'World Description',
        template: `You are the Dungeon Master describing a location or setting in a D&D campaign.

Location: {locationName}
Campaign Theme: {campaignTheme}
Previous Context: {previousContext}
Character Knowledge: {characterKnowledge}

Describe this location with:
1. Visual atmosphere and mood
2. Key features and points of interest
3. Potential dangers or opportunities
4. NPCs present and their activities
5. Hooks for character interaction
6. Clear paths forward

Make it immersive and provide clear choices for the players.`,
        variables: ['locationName', 'campaignTheme', 'previousContext', 'characterKnowledge'],
        category: 'world-building',
        temperature: 0.6,
        maxTokens: 350,
      },

      // NPC Interaction Templates
      {
        id: 'npc_interaction',
        name: 'NPC Interaction',
        template: `You are roleplaying an NPC in a D&D campaign.

NPC: {npcName}
NPC Role: {npcRole}
Personality: {npcPersonality}
Current Situation: {currentSituation}
Player Approach: {playerApproach}
Character Context: {characterContext}

Respond as the NPC with:
1. Appropriate personality and voice
2. Reaction to the player's approach
3. Relevant information or dialogue
4. Potential quest hooks or assistance
5. Clear next steps for interaction

Stay in character and provide meaningful responses that advance the story.`,
        variables: [
          'npcName',
          'npcRole',
          'npcPersonality',
          'currentSituation',
          'playerApproach',
          'characterContext',
        ],
        category: 'story',
        temperature: 0.8,
        maxTokens: 300,
      },

      // Quest Generation Templates
      {
        id: 'quest_generation',
        name: 'Quest Generation',
        template: `You are the Dungeon Master creating a quest for a D&D campaign.

Campaign Theme: {campaignTheme}
Party Level: {partyLevel}
Party Size: {partySize}
Current Location: {currentLocation}
World State: {worldState}

Generate a compelling quest including:
1. Quest hook and motivation
2. Main objective and goals
3. Key NPCs and their roles
4. Potential challenges and encounters
5. Rewards and consequences
6. Hooks for character engagement

Make it appropriate for the party level and theme. Keep the response focused and actionable.`,
        variables: ['campaignTheme', 'partyLevel', 'partySize', 'currentLocation', 'worldState'],
        category: 'story',
        temperature: 0.7,
        maxTokens: 400,
      },
    ];

    // Add all default templates to the map
    this.defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    logger.info('Default prompt templates initialized', {
      templateCount: this.defaultTemplates.length,
    });
  }

  /**
   * Get a prompt template by ID
   */
  getTemplate(templateId: string): PromptTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add a custom template
   */
  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    logger.info('Custom prompt template added', {
      templateId: template.id,
      category: template.category,
    });
  }

  /**
   * Remove a custom template
   */
  removeTemplate(templateId: string): boolean {
    // Don't allow removal of default templates
    if (this.defaultTemplates.find(t => t.id === templateId)) {
      logger.warn('Attempted to remove default template', { templateId });
      return false;
    }

    const removed = this.templates.delete(templateId);
    if (removed) {
      logger.info('Custom prompt template removed', { templateId });
    }
    return removed;
  }

  /**
   * Build a prompt from a template
   */
  buildPrompt(request: PromptRequest): string {
    const template = this.getTemplate(request.templateId);
    if (!template) {
      throw new Error(`Template not found: ${request.templateId}`);
    }

    let prompt = template.template;

    // Replace variables in the template
    for (const [variable, value] of Object.entries(request.variables)) {
      const placeholder = `{${variable}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Add custom context if provided
    if (request.customContext) {
      prompt = `Additional Context:\n${request.customContext}\n\n${prompt}`;
    }

    logger.info('Prompt built from template', {
      templateId: request.templateId,
      promptLength: prompt.length,
      variablesUsed: Object.keys(request.variables).length,
    });

    return prompt;
  }

  /**
   * Validate that all required variables are provided
   */
  validatePromptRequest(request: PromptRequest): { valid: boolean; missingVariables: string[] } {
    const template = this.getTemplate(request.templateId);
    if (!template) {
      return { valid: false, missingVariables: [] };
    }

    const missingVariables = template.variables.filter(
      variable => !(variable in request.variables)
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Get template metadata for a category
   */
  getTemplateMetadata(category?: PromptTemplate['category']): {
    totalTemplates: number;
    categories: Record<string, number>;
    averageTokens: number;
  } {
    const templates = category ? this.getTemplatesByCategory(category) : this.getAllTemplates();

    const categories: Record<string, number> = {};
    let totalTokens = 0;

    templates.forEach(template => {
      categories[template.category] = (categories[template.category] || 0) + 1;
      totalTokens += template.maxTokens;
    });

    return {
      totalTemplates: templates.length,
      categories,
      averageTokens: templates.length > 0 ? Math.round(totalTokens / templates.length) : 0,
    };
  }
}

export default PromptService;
