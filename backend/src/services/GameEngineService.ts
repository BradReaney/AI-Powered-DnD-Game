import { Server as SocketIOServer } from 'socket.io';
import logger from './LoggerService';
import { Campaign, Session, ISession, Character, ICharacter } from '../models';
import LLMClientFactory from './LLMClientFactory';
import { ContextManager } from './ContextManager';
import { cacheService } from './CacheService';

export interface GameState {
  currentScene: string;
  sceneDescription: string;
  activeCharacters: string[];
  currentTurn: number;
  initiativeOrder: Array<{
    characterId: string;
    initiative: number;
    hasActed: boolean;
  }>;
  combatState: {
    isActive: boolean;
    round: number;
    currentCharacter: string | null;
    conditions: Array<{
      characterId: string;
      condition: string;
      duration: number;
      source: string;
    }>;
  };
  worldState: {
    currentLocation: string;
    discoveredLocations: string[];
    activeEffects: Array<{
      name: string;
      description: string;
      duration: number;
      affectedCharacters: string[];
      source: string;
    }>;
  };
}

export interface StoryEvent {
  timestamp: Date;
  type:
  | 'action'
  | 'dialogue'
  | 'combat'
  | 'exploration'
  | 'skill_check'
  | 'story'
  | 'other'
  | 'ai-response';
  title: string;
  description: string;
  participants: string[];
  location: string;
  consequences: Array<{
    type: 'character' | 'world' | 'relationship' | 'quest' | 'other';
    description: string;
    impact: 'minor' | 'moderate' | 'major' | 'critical';
    resolved: boolean;
  }>;
  metadata?: {
    skillChecks?: Array<{
      skill: string;
      result: number;
      target: number;
      success: boolean;
      critical: boolean;
    }>;
    combatActions?: Array<{
      action: string;
      target: string;
      result: string;
      damage?: number;
    }>;
    items?: Array<{
      name: string;
      action: 'found' | 'used' | 'lost' | 'gained' | 'other';
      quantity: number;
    }>;
    aiResponse?: boolean;
    originalMessage?: string;
    characterId?: string;
  };
}

export interface SkillCheckRequest {
  characterId: string;
  sessionId: string;
  skill: string;
  difficulty: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'nearly_impossible';
  modifiers?: {
    advantage?: boolean;
    disadvantage?: boolean;
    circumstantial?: number;
  };
}

export interface SkillCheckResult {
  success: boolean;
  critical: boolean;
  result: number;
  target: number;
  modifiers: {
    attribute: number;
    proficiency: number;
    circumstantial: number;
    total: number;
  };
  description: string;
}

export interface CombatAction {
  characterId: string;
  sessionId: string;
  action:
  | 'attack'
  | 'spell'
  | 'move'
  | 'dash'
  | 'dodge'
  | 'help'
  | 'ready'
  | 'search'
  | 'use_object';
  target?: string;
  spell?: string;
  weapon?: string;
  description: string;
}

export interface CombatResult {
  success: boolean;
  damage?: number;
  effects?: string[];
  description: string;
  nextTurn?: string;
}

class GameEngineService {
  private static instance: GameEngineService;
  private io: SocketIOServer;
  private geminiClient: any;
  private activeSessions: Map<string, ISession> = new Map();
  private sessionGameStates: Map<string, GameState> = new Map();
  private contextManager: ContextManager;

  private constructor(io: SocketIOServer) {
    this.io = io;
    this.geminiClient = LLMClientFactory.getInstance().getClient();
    this.contextManager = new ContextManager();
    this.initializeSocketHandlers();
  }

  public static getInstance(io: SocketIOServer): GameEngineService {
    if (!GameEngineService.instance) {
      GameEngineService.instance = new GameEngineService(io);
    }
    return GameEngineService.instance;
  }

  private initializeSocketHandlers(): void {
    this.io.on('connection', socket => {
      logger.info(`Game client connected: ${socket.id}`);

      // Join game session
      socket.on('join-session', async (data: { sessionId: string; characterId: string }) => {
        try {
          await this.handleJoinSession(socket, data.sessionId, data.characterId);
        } catch (error) {
          logger.error('Error joining session:', error);
          socket.emit('error', { message: 'Failed to join session' });
        }
      });

      // Leave game session
      socket.on('leave-session', (data: { sessionId: string }) => {
        socket.leave(`session-${data.sessionId}`);
        logger.info(`Client ${socket.id} left session ${data.sessionId}`);
      });

      // Game actions
      socket.on('skill-check', async (data: SkillCheckRequest) => {
        try {
          const result = await this.performSkillCheck(data);
          socket.emit('skill-check-result', result);
          this.broadcastToSession(data.sessionId, 'skill-check-performed', {
            characterId: data.characterId,
            skill: data.skill,
            result: result.result,
            success: result.success,
            critical: result.critical,
          });
        } catch (error) {
          logger.error('Error performing skill check:', error);
          socket.emit('error', { message: 'Failed to perform skill check' });
        }
      });

      socket.on('combat-action', async (data: CombatAction) => {
        try {
          const result = await this.performCombatAction(data);
          socket.emit('combat-result', result);
          this.broadcastToSession(data.sessionId, 'combat-action-performed', {
            characterId: data.characterId,
            action: data.action,
            result: result.description,
            damage: result.damage,
          });
        } catch (error) {
          logger.error('Error performing combat action:', error);
          socket.emit('error', { message: 'Failed to perform combat action' });
        }
      });

      socket.on(
        'story-action',
        async (data: { sessionId: string; action: string; description: string }) => {
          try {
            await this.addStoryEvent(data.sessionId, {
              type: 'action',
              title: data.action,
              description: data.description,
              participants: [],
              location: '',
              consequences: [],
            });
            this.broadcastToSession(data.sessionId, 'story-event-added', {
              action: data.action,
              description: data.description,
            });
          } catch (error) {
            logger.error('Error adding story event:', error);
            socket.emit('error', { message: 'Failed to add story event' });
          }
        }
      );

      socket.on('disconnect', () => {
        logger.info(`Game client disconnected: ${socket.id}`);
      });
    });
  }

  private async handleJoinSession(
    socket: any,
    sessionId: string,
    characterId: string
  ): Promise<void> {
    try {
      const session = await Session.findOne({_id: sessionId}).populate('campaignId');
      if (!session) {
        throw new Error('Session not found');
      }

      // Join the session room
      socket.join(`session-${sessionId}`);

      // Add character to active characters if not already present
      if (!session.gameState.activeCharacters.includes(characterId as any)) {
        session.gameState.activeCharacters.push(characterId as any);
        await session.save();
      }

      // Send current game state
      const gameState = this.sessionGameStates.get(sessionId) || this.initializeGameState(session);
      socket.emit('session-joined', {
        sessionId,
        gameState,
        characterId,
      });

      // Notify other players
      socket.to(`session-${sessionId}`).emit('player-joined', {
        characterId,
        sessionId,
      });

      logger.info(`Client ${socket.id} joined session ${sessionId} as character ${characterId}`);
    } catch (error) {
      logger.error('Error handling join session:', error);
      throw error;
    }
  }

  private initializeGameState(session: ISession): GameState {
    const gameState: GameState = {
      currentScene: session.gameState.currentScene,
      sceneDescription: session.gameState.sceneDescription,
      activeCharacters: session.gameState.activeCharacters.map(id => id.toString()),
      currentTurn: session.gameState.currentTurn,
      initiativeOrder: session.gameState.initiativeOrder.map(item => ({
        characterId: item.characterId.toString(),
        initiative: item.initiative,
        hasActed: item.hasActed,
      })),
      combatState: {
        isActive: session.gameState.combatState.isActive,
        round: session.gameState.combatState.round,
        currentCharacter: session.gameState.combatState.currentCharacter?.toString() || null,
        conditions: session.gameState.combatState.conditions.map(condition => ({
          characterId: condition.characterId.toString(),
          condition: condition.condition,
          duration: condition.duration,
          source: condition.source,
        })),
      },
      worldState: {
        currentLocation: session.gameState.worldState.currentLocation,
        discoveredLocations: session.gameState.worldState.discoveredLocations,
        activeEffects: session.gameState.worldState.activeEffects.map(effect => ({
          name: effect.name,
          description: effect.description,
          duration: effect.duration,
          affectedCharacters: effect.affectedCharacters.map(id => id.toString()),
          source: effect.source,
        })),
      },
    };

    this.sessionGameStates.set(session._id as any, gameState);
    return gameState;
  }

  public async createSession(
    campaignId: string,
    sessionData: {
      name: string;
      dm: string;
      location: string;
      weather: string;
      timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight';
    }
  ): Promise<ISession> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get next session number
      const lastSession = await Session.findOne({ campaignId }).sort({ sessionNumber: -1 });
      const sessionNumber = lastSession ? lastSession.sessionNumber + 1 : 1;

      const session = new Session({
        campaignId,
        sessionNumber,
        name: sessionData.name,
        metadata: {
          startTime: new Date(),
          dm: sessionData.dm,
          location: sessionData.location,
          weather: sessionData.weather,
          timeOfDay: sessionData.timeOfDay,
          players: [],
        },
        gameState: {
          currentScene: 'Session Start',
          sceneDescription: `A new adventure begins in ${sessionData.location}. The weather is ${sessionData.weather} and it's ${sessionData.timeOfDay}.`,
          activeCharacters: [],
          currentTurn: 1,
          initiativeOrder: [],
          combatState: {
            isActive: false,
            round: 0,
            currentCharacter: null,
            conditions: [],
          },
          worldState: {
            currentLocation: sessionData.location,
            discoveredLocations: [sessionData.location],
            activeEffects: [],
          },
        },
        storyEvents: [],
        aiContext: {
          sessionSummary: '',
          keyDecisions: [],
          characterDevelopment: [],
          worldChanges: [],
          nextSessionHooks: [],
          aiNotes: '',
        },
        outcomes: {
          experienceGained: 0,
          itemsFound: [],
          questsStarted: [],
          questsCompleted: [],
          relationshipsChanged: [],
        },
        notes: {
          dmNotes: '',
          playerFeedback: [],
          highlights: [],
          areasForImprovement: [],
          nextSessionIdeas: [],
        },
        createdBy: sessionData.dm,
      });

      await session.save();

      // Add session to campaign
      campaign.sessions.push({
        sessionId: session._id as any,
        sessionNumber: session.sessionNumber,
        date: session.metadata.startTime,
        duration: 0,
        summary: '',
        keyEvents: [],
        experienceGained: 0,
        itemsFound: [],
        charactersPresent: [],
      });
      await campaign.save();

      logger.info(`Created new session ${session._id} for campaign ${campaignId}`);
      return session;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  public async addStoryEvent(
    sessionId: string,
    eventData: Omit<StoryEvent, 'timestamp'>
  ): Promise<void> {
    try {
      const session = await Session.findOne({_id: sessionId});
      if (!session) {
        throw new Error('Session not found');
      }

      const storyEvent: StoryEvent = {
        ...eventData,
        timestamp: new Date(),
      };

      // Convert string participants to ObjectId for Mongoose
      const storyEventForMongoose = {
        ...storyEvent,
        participants: storyEvent.participants.map(p => p as any),
        metadata: storyEvent.metadata || {},
      };

      session.storyEvents.push(storyEventForMongoose);
      await session.save();

      // Update AI context
      await this.updateAIContext(sessionId, storyEvent);

      logger.info(`Added story event to session ${sessionId}: ${eventData.title}`);
    } catch (error) {
      logger.error('Error adding story event:', error);
      throw error;
    }
  }

  private async updateAIContext(sessionId: string, event: StoryEvent): Promise<void> {
    try {
      const session = await Session.findOne({_id: sessionId}).populate('campaignId');
      if (!session) return;

      // Generate AI response based on the event
      const prompt = this.buildAIContextPrompt(session, event);
      const response = await this.generateAIResponse(prompt);

      // Update session AI context
      session.aiContext.keyDecisions.push(event.title);
      session.aiContext.aiNotes = response;
      await session.save();

      // Broadcast AI response to session
      this.broadcastToSession(sessionId, 'ai-response', {
        event: event.title,
        response: response,
      });
    } catch (error) {
      logger.error('Error updating AI context:', error);
    }
  }

  private buildAIContextPrompt(session: ISession, event: StoryEvent): string {
    const campaign = session.campaignId as any;
    return `
    You are the Dungeon Master for a D&D campaign called "${campaign.name}" with the theme "${campaign.theme}".

    Current session: ${session.name}
    Location: ${session.gameState.worldState.currentLocation}
    Scene: ${session.gameState.currentScene}

    A new story event has occurred:
    - Type: ${event.type}
    - Title: ${event.title}
    - Description: ${event.description}
    - Location: ${event.location}

    Based on this event and the campaign context, provide a brief DM response or suggestion for how to proceed.
    Keep it concise (2-3 sentences) and in character as the DM.

    Consider:
    - The campaign theme and tone
    - The current location and scene
    - How this event might affect the story
    - Potential consequences or opportunities
    `;
  }

  private async generateAIResponse(prompt: string): Promise<string> {
    try {
      // Try to get from cache first
      const promptHash = Buffer.from(prompt).toString('base64').substring(0, 32);
      const cacheKey = `ai:response:${promptHash}`;

      const cached = await cacheService.get<string>(cacheKey);
      if (cached) {
        logger.debug('Cache hit for AI response');
        return cached;
      }

      const response = await this.geminiClient.sendPrompt({
        prompt,
        taskType: 'story_response',
      });

      if (!response.success) {
        throw new Error('Failed to generate AI response: ' + response.error);
      }

      // Cache the response for 1 hour (AI responses can be reused for similar prompts)
      await cacheService.set(cacheKey, response.content, { ttl: 3600 });
      logger.debug('Cached AI response');

      return response.content;
    } catch (error) {
      logger.error('Error generating AI response:', error);
      return 'The DM considers the situation carefully...';
    }
  }

  public async performSkillCheck(request: SkillCheckRequest): Promise<SkillCheckResult> {
    try {
      const character = await Character.findById(request.characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Get skill modifier
      const skillModifier = (character as any).getSkillModifier(request.skill);

      // Determine target number based on difficulty
      const difficultyTargets = {
        very_easy: 5,
        easy: 10,
        medium: 15,
        hard: 20,
        very_hard: 25,
        nearly_impossible: 30,
      };

      const target = difficultyTargets[request.difficulty] || 15;

      // Apply modifiers
      let circumstantialMod = 0;
      if (request.modifiers?.circumstantial) {
        circumstantialMod = request.modifiers.circumstantial;
      }

      // Roll d20
      const roll = Math.floor(Math.random() * 20) + 1;

      // Calculate total result
      const totalResult = roll + skillModifier + circumstantialMod;

      // Determine success
      const success = totalResult >= target;
      const critical = roll === 20 || roll === 1;

      // Generate description
      const description = this.generateSkillCheckDescription(
        request.skill,
        roll,
        totalResult,
        target,
        success,
        critical
      );

      const result: SkillCheckResult = {
        success,
        critical,
        result: totalResult,
        target,
        modifiers: {
          attribute: skillModifier,
          proficiency: 0, // Will be calculated in getSkillModifier
          circumstantial: circumstantialMod,
          total: skillModifier + circumstantialMod,
        },
        description,
      };

      return result;
    } catch (error) {
      logger.error('Error performing skill check:', error);
      throw error;
    }
  }

  private generateSkillCheckDescription(
    skill: string,
    roll: number,
    _total: number,
    _target: number,
    success: boolean,
    critical: boolean
  ): string {
    const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);

    if (critical && roll === 20) {
      return `${skillName} check: Natural 20! An extraordinary success that goes beyond expectations.`;
    } else if (critical && roll === 1) {
      return `${skillName} check: Natural 1! A critical failure that leads to unexpected consequences.`;
    } else if (success) {
      return `${skillName} check: Success! The character accomplishes what they set out to do.`;
    } else {
      return `${skillName} check: Failure. The character doesn't achieve their goal this time.`;
    }
  }

  public async performCombatAction(action: CombatAction): Promise<CombatResult> {
    try {
      const character = await Character.findById(action.characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      let result: CombatResult;

      switch (action.action) {
        case 'attack':
          result = await this.performAttackAction(character, action);
          break;
        case 'spell':
          result = await this.performSpellAction(character, action);
          break;
        case 'move':
          result = await this.performMoveAction(character, action);
          break;
        default:
          result = {
            success: true,
            description: `${character.name} performs ${action.action}.`,
          };
      }

      return result;
    } catch (error) {
      logger.error('Error performing combat action:', error);
      throw error;
    }
  }

  private async performAttackAction(
    character: ICharacter,
    _action: CombatAction
  ): Promise<CombatResult> {
    // Simple attack calculation
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const attackModifier = Math.floor((character.attributes.strength - 10) / 2);
    const totalAttack = attackRoll + attackModifier;

    // Assume target AC of 15 for now
    const targetAC = 15;
    const hit = totalAttack >= targetAC;

    if (hit) {
      // Simple damage calculation
      const damage = Math.floor(Math.random() * 8) + 1 + attackModifier;
      return {
        success: true,
        damage: Math.max(1, damage),
        description: `${character.name} hits with their attack, dealing ${Math.max(1, damage)} damage!`,
      };
    } else {
      return {
        success: false,
        description: `${character.name} misses their attack.`,
      };
    }
  }

  private async performSpellAction(
    character: ICharacter,
    action: CombatAction
  ): Promise<CombatResult> {
    return {
      success: true,
      description: `${character.name} casts ${action.spell || 'a spell'}.`,
    };
  }

  private async performMoveAction(
    character: ICharacter,
    _action: CombatAction
  ): Promise<CombatResult> {
    return {
      success: true,
      description: `${character.name} moves to a new position.`,
    };
  }

  private broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(`session-${sessionId}`).emit(event, data);
  }

  public async endSession(sessionId: string, summary: string): Promise<void> {
    try {
      const session = await Session.findOne({_id: sessionId});
      if (!session) {
        throw new Error('Session not found');
      }

      await (session as any).endSession(new Date(), summary);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      this.sessionGameStates.delete(sessionId);

      // Notify all clients
      this.broadcastToSession(sessionId, 'session-ended', { summary });

      logger.info(`Session ${sessionId} ended successfully`);
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }

  public getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  public getSessionGameState(sessionId: string): GameState | undefined {
    return this.sessionGameStates.get(sessionId);
  }

  /**
   * Get AI response for a session
   */
  public async getAIResponse(
    sessionId: string,
    message: string,
    characterId?: string
  ): Promise<{
    content: string;
    metadata: any;
  }> {
    try {
      logger.info('Getting AI response', { sessionId, message, characterId });

      // Get current session state, load from database if not in memory
      let gameState = this.sessionGameStates.get(sessionId);
      if (!gameState) {
        logger.info('Session not found in memory, loading from database', { sessionId });
        const session = await Session.findOne({_id: sessionId});
        if (!session) {
          throw new Error('Session not found in database');
        }
        gameState = this.initializeGameState(session);
        logger.info('Session loaded from database and initialized in memory', { sessionId });
      }

      // Get campaign ID from session to build context for AI
      const session = await Session.findOne({_id: sessionId}).populate('campaignId');
      if (!session) {
        throw new Error('Session not found for context building');
      }

      const campaignId = session.campaignId.toString();
      const context = await this.contextManager.getContext(campaignId);

      // Get recent chat history for conversation context (max 10 messages)
      const { Message } = await import('../models');
      const chatHistory = await Message.getRecentContext(sessionId, 10, ['player', 'ai', 'system']);

      logger.info('Retrieved chat history', {
        sessionId,
        totalMessages: chatHistory.length,
        messageTypes: chatHistory.map(msg => msg.type),
        messageContents: chatHistory.map(msg => msg.content.substring(0, 100) + '...'),
      });

      // Build conversation context for AI
      const conversationContext = this.buildConversationContext(chatHistory, message);

      // Get AI response using Gemini with conversation context
      const aiResponse = await this.geminiClient.sendPrompt({
        prompt: message,
        context,
        taskType: 'story_response',
        conversationHistory: conversationContext,
      });

      // Update game state with AI response
      if (aiResponse.success) {
        // Add AI response to story events
        await this.addStoryEvent(sessionId, {
          type: 'ai-response',
          title: 'AI Response',
          description: aiResponse.content,
          participants: characterId ? [characterId] : [],
          location: 'Current Location',
          consequences: [],
          metadata: {
            aiResponse: true,
            originalMessage: message,
            ...(characterId && { characterId }),
          },
        });
      }

      return {
        content: aiResponse.success
          ? aiResponse.content
          : 'I apologize, but I am unable to respond at the moment.',
        metadata: {
          contextLength: context.length,
          responseTime: Date.now(),
          success: aiResponse.success,
          conversationHistoryLength: conversationContext.length,
        },
      };
    } catch (error) {
      logger.error('Error getting AI response:', error);
      return {
        content: 'I apologize, but I encountered an error while processing your request.',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now(),
          success: false,
        },
      };
    }
  }

  /**
   * Build conversation context from chat history for AI
   */
  private buildConversationContext(
    chatHistory: any[],
    currentMessage: string
  ): Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> {
    const conversationContext: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    // Limit conversation history to prevent context overflow
    // We'll take the most recent messages, ensuring we don't exceed reasonable limits
    const maxHistoryMessages = 8; // Keep this reasonable for AI context
    const recentHistory = chatHistory.slice(-maxHistoryMessages);

    // Add chat history messages in chronological order
    recentHistory.forEach(msg => {
      if (msg.type === 'player') {
        conversationContext.push({
          role: 'user',
          parts: [{ text: msg.content }],
        });
      } else if (msg.type === 'ai') {
        conversationContext.push({
          role: 'model',
          parts: [{ text: msg.content }],
        });
      }
    });

    // Add the current message
    conversationContext.push({
      role: 'user',
      parts: [{ text: currentMessage }],
    });

    // Log the conversation context for debugging
    logger.info('Building conversation context', {
      totalHistoryMessages: chatHistory.length,
      recentHistoryMessages: recentHistory.length,
      conversationContextLength: conversationContext.length,
      messageTypes: recentHistory.map(msg => msg.type),
    });

    return conversationContext;
  }

  /**
   * Get session state (alias for getSessionGameState for API compatibility)
   */
  public async getSessionState(sessionId: string): Promise<any> {
    try {
      // First, try to find the session in memory
      const gameState = this.getSessionGameState(sessionId);

      if (!gameState) {
        // If not in memory, try to find the session in the campaign data
        // The sessionId in the URL is actually the sessionId field from the campaign, not the Session _id
        const campaigns = await Campaign.find({ 'sessions.sessionId': sessionId });

        if (campaigns.length === 0) {
          return {
            sessionId,
            status: 'not_found',
            message: 'Session not found in any campaign',
          };
        }

        const campaign = campaigns[0];
        const sessionData = campaign.sessions.find(s => s.sessionId.toString() === sessionId);

        if (!sessionData) {
          return {
            sessionId,
            status: 'not_found',
            message: 'Session not found in campaign',
          };
        }

        // Initialize the session in memory with a proper GameState
        const gameState: GameState = {
          currentScene: campaign.storyContext.currentScene,
          sceneDescription: campaign.storyContext.currentScene,
          activeCharacters: [],
          currentTurn: 1,
          initiativeOrder: [],
          combatState: {
            isActive: false,
            round: 1,
            currentCharacter: null,
            conditions: [],
          },
          worldState: {
            currentLocation: campaign.worldState.currentLocation,
            discoveredLocations: campaign.worldState.knownLocations.map(l => l.name),
            activeEffects: [],
          },
        };

        // Store in memory
        this.sessionGameStates.set(sessionId, gameState);
      }

      return {
        sessionId,
        status: 'active',
        gameState,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting session state:', error);
      return {
        sessionId,
        status: 'error',
        message: 'Failed to get session state',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default GameEngineService;
