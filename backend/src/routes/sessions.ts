import express from 'express';
import GameEngineService from '../services/GameEngineService';
import SessionService from '../services/SessionService';
import logger from '../services/LoggerService';
import { Server as SocketIOServer } from 'socket.io';
import { Message } from '../models';

const router = express.Router();

// Note: GameEngineService needs to be initialized with Socket.IO instance
// This will be set up in the main app.ts file
let gameEngineService: GameEngineService | null = null;
let sessionService: SessionService | null = null;

export const initializeGameEngineService = (io: SocketIOServer) => {
  gameEngineService = GameEngineService.getInstance(io);
  sessionService = SessionService.getInstance();
  sessionService.setGameEngineService(gameEngineService);
  sessionService.setSocketIO(io);
};

// Get all sessions for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const sessions = await sessionService.searchSessions({ campaignId });
    res.json({
      message: 'Sessions for campaign',
      campaignId,
      sessions,
    });
  } catch (error) {
    logger.error('Error getting sessions for campaign:', error);
    res.status(500).json({ error: 'Failed to get sessions for campaign' });
  }
});

// Get session creation form state
router.get('/new', async (req, res) => {
  try {
    // Return enhanced session creation form data with better defaults and validation
    const sessionFormState = {
      name: '',
      dm: '',
      location: 'Starting Location',
      weather: 'Clear',
      timeOfDay: 'morning',
      availableLocations: [
        'Starting Location',
        'Town Square',
        'Tavern',
        'Marketplace',
        'Temple',
        'Castle',
        'Forest',
        'Cave',
        'Dungeon',
        'Mountain Pass',
        'Desert Oasis',
        'Coastal Village',
        'Ancient Ruins',
        'Mystical Grove',
        'Underground Caverns',
        'Floating Islands',
        'Crystal Mines',
        'Frozen Wasteland',
        'Volcanic Region',
        'Swamp Lands',
        'Elven City',
        'Dwarven Stronghold',
        'Orc Camp',
        'Goblin Village',
        'Dragon Lair',
        'Wizard Tower',
        'Sacred Shrine',
        'Hidden Valley',
        'Stormy Cliffs',
        'Peaceful Meadow',
      ],
      availableWeather: [
        'Clear',
        'Cloudy',
        'Rainy',
        'Stormy',
        'Foggy',
        'Windy',
        'Misty',
        'Overcast',
        'Partly Cloudy',
        'Light Rain',
        'Heavy Rain',
        'Thunderstorm',
        'Snow',
        'Blizzard',
        'Hail',
        'Sandstorm',
        'Heat Wave',
        'Cold Snap',
        'Mystical Aura',
        'Ethereal Winds',
      ],
      availableTimeOfDay: ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight'],
      validation: {
        name: {
          minLength: 3,
          maxLength: 100,
          required: true,
          pattern: '^[a-zA-Z0-9\\s\\-\'"]+$',
          message:
            'Session name must be 3-100 characters and contain only letters, numbers, spaces, hyphens, apostrophes, and quotes',
        },
        dm: {
          minLength: 2,
          maxLength: 50,
          required: true,
          pattern: "^[a-zA-Z\\s\\-']+$",
          message:
            'DM name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes',
        },
        location: {
          minLength: 2,
          maxLength: 100,
          required: true,
          pattern: '^[a-zA-Z0-9\\s\\-\'"]+$',
          message:
            'Location must be 2-100 characters and contain only letters, numbers, spaces, hyphens, apostrophes, and quotes',
        },
        weather: {
          minLength: 2,
          maxLength: 50,
          required: true,
          pattern: "^[a-zA-Z\\s\\-']+$",
          message:
            'Weather must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes',
        },
      },
      tips: {
        name: 'Choose a descriptive name that captures the session\'s theme or main event (e.g., "The Goblin Ambush", "Secrets of the Ancient Temple")',
        dm: 'Enter the name of the person running this session',
        location:
          'Select where the session begins. This helps set the scene and atmosphere for your players',
        weather: 'Weather conditions can affect gameplay, atmosphere, and encounter difficulty',
        timeOfDay:
          'Time affects lighting, NPC behavior, and encounter difficulty. Consider how it impacts your story',
      },
    };

    res.json(sessionFormState);
  } catch (error) {
    logger.error('Error getting session creation form state:', error);
    res.status(500).json({
      error: 'Failed to get session creation form state',
      message: 'Unable to load session creation form. Please try again later.',
    });
  }
});

// Get active sessions - moved to after template routes
router.get('/active/list', async (_req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const activeSessions = gameEngineService.getActiveSessions();
    return res.json({ activeSessions });
  } catch (error) {
    logger.error('Error getting active sessions:', error);
    return res.status(500).json({ error: 'Failed to get active sessions' });
  }
});

// Data quality and integrity routes (must be before /:sessionId route)
router.get('/data-quality-report', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const report = await sessionService.getSessionDataQualityReport();

    return res.json({
      message: 'Data quality report generated successfully',
      report,
    });
  } catch (error) {
    logger.error('Error generating data quality report:', error);
    return res.status(500).json({
      error: 'Failed to generate data quality report',
      message: 'An error occurred while generating the report',
    });
  }
});

router.get('/validate-integrity', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const integrityReport = await sessionService.validateSessionDataIntegrity();

    return res.json({
      message: 'Data integrity validation completed',
      integrityReport,
    });
  } catch (error) {
    logger.error('Error validating data integrity:', error);
    return res.status(500).json({
      error: 'Failed to validate data integrity',
      message: 'An error occurred during validation',
    });
  }
});

// Get session by ID (must be after specific routes)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const session = await sessionService.getSessionAnalytics(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      message: 'Session details',
      sessionId,
      session,
    });
  } catch (error) {
    logger.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const sessionData = req.body;

    // Enhanced validation with detailed error messages
    const validationErrors: string[] = [];

    if (!sessionData.campaignId) {
      validationErrors.push('Campaign ID is required');
    } else if (!sessionData.campaignId.match(/^[0-9a-fA-F]{24}$/)) {
      validationErrors.push('Campaign ID must be a valid ObjectId');
    }

    if (!sessionData.name) {
      validationErrors.push('Session name is required');
    } else if (sessionData.name.trim().length < 3) {
      validationErrors.push('Session name must be at least 3 characters');
    } else if (sessionData.name.trim().length > 100) {
      validationErrors.push('Session name cannot exceed 100 characters');
    }

    if (!sessionData.dm) {
      validationErrors.push('Dungeon Master name is required');
    } else if (sessionData.dm.trim().length < 2) {
      validationErrors.push('DM name must be at least 2 characters');
    } else if (sessionData.dm.trim().length > 50) {
      validationErrors.push('DM name cannot exceed 50 characters');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
        message: 'Please correct the following errors and try again',
      });
    }

    // Sanitize and set default values for optional fields
    const sessionConfig = {
      name: sessionData.name.trim(),
      dm: sessionData.dm.trim(),
      location: sessionData.location?.trim() || 'Starting Location',
      weather: sessionData.weather?.trim() || 'Clear',
      timeOfDay: sessionData.timeOfDay || 'morning',
    };

    // Validate timeOfDay enum
    const validTimeOfDay = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight'];
    if (!validTimeOfDay.includes(sessionConfig.timeOfDay)) {
      return res.status(400).json({
        error: 'Invalid time of day',
        message: `Time of day must be one of: ${validTimeOfDay.join(', ')}`,
      });
    }

    // Validate location and weather length
    if (sessionConfig.location.length < 2 || sessionConfig.location.length > 100) {
      return res.status(400).json({
        error: 'Invalid location',
        message: 'Location must be between 2 and 100 characters',
      });
    }

    if (sessionConfig.weather.length < 2 || sessionConfig.weather.length > 50) {
      return res.status(400).json({
        error: 'Invalid weather',
        message: 'Weather must be between 2 and 50 characters',
      });
    }

    const session = await gameEngineService.createSession(sessionData.campaignId, sessionConfig);

    // Log successful session creation
    logger.info(
      `Session created successfully: ${session._id} for campaign ${sessionData.campaignId}`,
      {
        sessionId: session._id,
        campaignId: sessionData.campaignId,
        dm: sessionConfig.dm,
        name: sessionConfig.name,
      }
    );

    return res.status(201).json({
      message: 'Session created successfully',
      session: {
        _id: session._id,
        name: session.name,
        sessionNumber: session.sessionNumber,
        status: session.status,
        metadata: {
          dm: session.metadata.dm,
          location: session.metadata.location,
          weather: session.metadata.weather,
          timeOfDay: session.metadata.timeOfDay,
          startTime: session.metadata.startTime,
        },
      },
    });
  } catch (error) {
    logger.error('Error creating session:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Campaign not found')) {
        return res.status(404).json({
          error: 'Campaign not found',
          message: 'The specified campaign does not exist',
        });
      }
      if (error.message.includes('duplicate key')) {
        return res.status(409).json({
          error: 'Session already exists',
          message: 'A session with this name already exists in this campaign',
        });
      }
    }

    return res.status(500).json({
      error: 'Failed to create session',
      message: 'An internal server error occurred while creating the session',
    });
  }
});

// End session
router.put('/:sessionId/end', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ error: 'Session summary is required' });
    }

    await gameEngineService.endSession(sessionId, summary);
    return res.json({ message: 'Session ended successfully' });
  } catch (error) {
    logger.error('Error ending session:', error);
    return res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get session game state
router.get('/:sessionId/game-state', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;
    const gameState = gameEngineService.getSessionGameState(sessionId);

    if (!gameState) {
      return res.status(404).json({ error: 'Game state not found for session' });
    }

    return res.json(gameState);
  } catch (error) {
    logger.error('Error getting session game state:', error);
    return res.status(500).json({ error: 'Failed to get session game state' });
  }
});

// Add story event to session
router.post('/:sessionId/story-events', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;
    const eventData = req.body;

    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.type) {
      return res
        .status(400)
        .json({ error: 'Missing required event fields: title, description, type' });
    }

    // Validate event type
    const validTypes = [
      'action',
      'dialogue',
      'combat',
      'exploration',
      'skill_check',
      'story',
      'other',
    ];
    if (!validTypes.includes(eventData.type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    await gameEngineService.addStoryEvent(sessionId, eventData);
    return res.status(201).json({ message: 'Story event added successfully' });
  } catch (error) {
    logger.error('Error adding story event:', error);
    return res.status(500).json({ error: 'Failed to add story event' });
  }
});

// Get session story events
router.get('/:sessionId/story-events', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // This would typically come from a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Story events for session',
      sessionId,
      events: [],
    });
  } catch (error) {
    logger.error('Error getting story events:', error);
    return res.status(500).json({ error: 'Failed to get story events' });
  }
});

// Update session metadata
router.put('/:sessionId/metadata', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.body;

    // This would typically go through a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session metadata updated',
      sessionId,
      updates: updateData,
    });
  } catch (error) {
    logger.error('Error updating session metadata:', error);
    return res.status(500).json({ error: 'Failed to update session metadata' });
  }
});

// Get session participants
router.get('/:sessionId/participants', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // This would typically come from a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session participants',
      sessionId,
      participants: [],
    });
  } catch (error) {
    logger.error('Error getting session participants:', error);
    return res.status(500).json({ error: 'Failed to get session participants' });
  }
});

// Add participant to session
router.post('/:sessionId/participants', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { characterId, playerId } = req.body;

    if (!characterId || !playerId) {
      return res.status(400).json({ error: 'Missing required fields: characterId, playerId' });
    }

    // This would typically go through a SessionService
    // For now, return a placeholder response
    return res.status(201).json({
      message: 'Participant added to session',
      sessionId,
      characterId,
      playerId,
    });
  } catch (error) {
    logger.error('Error adding participant to session:', error);
    return res.status(500).json({ error: 'Failed to add participant to session' });
  }
});

// Remove participant from session
router.delete('/:sessionId/participants/:characterId', async (req, res) => {
  try {
    const { sessionId, characterId } = req.params;

    // This would typically go through a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Participant removed from session',
      sessionId,
      characterId,
    });
  } catch (error) {
    logger.error('Error removing participant from session:', error);
    return res.status(500).json({ error: 'Failed to remove participant from session' });
  }
});

// Get session notes
router.get('/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // This would typically come from a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session notes',
      sessionId,
      notes: {
        dmNotes: '',
        playerFeedback: [],
        highlights: [],
        areasForImprovement: [],
        nextSessionIdeas: [],
      },
    });
  } catch (error) {
    logger.error('Error getting session notes:', error);
    return res.status(500).json({ error: 'Failed to get session notes' });
  }
});

// Update session notes
router.put('/:sessionId/notes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const notesData = req.body;

    // This would typically go through a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session notes updated',
      sessionId,
      notes: notesData,
    });
  } catch (error) {
    logger.error('Error updating session notes:', error);
    return res.status(500).json({ error: 'Failed to update session notes' });
  }
});

// Get session outcomes
router.get('/:sessionId/outcomes', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // This would typically come from a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session outcomes',
      sessionId,
      outcomes: {
        experienceGained: 0,
        itemsFound: [],
        questsStarted: [],
        questsCompleted: [],
        relationshipsChanged: [],
      },
    });
  } catch (error) {
    logger.error('Error getting session outcomes:', error);
    return res.status(500).json({ error: 'Failed to get session outcomes' });
  }
});

// Update session outcomes
router.put('/:sessionId/outcomes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const outcomesData = req.body;

    // This would typically go through a SessionService
    // For now, return a placeholder response
    return res.json({
      message: 'Session outcomes updated',
      sessionId,
      outcomes: outcomesData,
    });
  } catch (error) {
    logger.error('Error updating session outcomes:', error);
    return res.status(500).json({ error: 'Failed to update session outcomes' });
  }
});

// Send message in session
router.post('/:sessionId/messages', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;
    const { content, characterId, campaignId } = req.body;

    if (!content || !characterId) {
      return res.status(400).json({ error: 'Message content and character ID are required' });
    }

    // Get character name for the sender
    const Character = require('../models').Character;
    const character = await Character.findById(characterId);
    const senderName = character ? character.name : 'Unknown Character';

    // Create and save message to MongoDB
    const message = new Message({
      sessionId,
      campaignId,
      type: 'player',
      sender: senderName,
      characterId,
      content,
      timestamp: new Date(),
      metadata: {
        aiResponse: false,
        originalMessage: content,
        characterId: characterId,
      },
    });

    await message.save();

    // Return the saved message
    return res.status(201).json({
      id: message._id,
      type: message.type,
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
      sessionId: message.sessionId,
      metadata: message.metadata,
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get AI response for session
router.post('/:sessionId/ai-response', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;
    const { message, characterId, campaignId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Get AI response using the game engine service
    const aiResponse = await gameEngineService.getAIResponse(sessionId, message, characterId);

    // Create and save AI message to MongoDB
    const aiMessage = new Message({
      sessionId,
      campaignId,
      type: 'ai',
      sender: 'Dungeon Master',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        aiResponse: true,
        originalMessage: message,
        characterId: characterId,
        ...aiResponse.metadata,
      },
    });

    await aiMessage.save();

    // Return the saved AI message
    return res.status(201).json({
      id: aiMessage._id,
      type: aiMessage.type,
      sender: aiMessage.sender,
      content: aiMessage.content,
      timestamp: aiMessage.timestamp,
      sessionId: aiMessage.sessionId,
      metadata: aiMessage.metadata,
    });
  } catch (error) {
    logger.error('Error getting AI response:', error);
    return res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Get chat history for a session
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get messages from MongoDB using the Message model's static method
    const messages = await Message.getSessionMessages(
      sessionId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    // Get total count for pagination
    const totalCount = await Message.countDocuments({
      sessionId,
      deleted: { $ne: true },
    });

    return res.json({
      messages,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: totalCount > parseInt(limit as string) + parseInt(offset as string),
      },
    });
  } catch (error) {
    logger.error('Error getting chat history:', error);
    return res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get session state
router.get('/:sessionId/state', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { sessionId } = req.params;

    // Get current session state
    const sessionState = await gameEngineService.getSessionState(sessionId);

    return res.json(sessionState);
  } catch (error) {
    logger.error('Error getting session state:', error);
    return res.status(500).json({ error: 'Failed to get session state' });
  }
});

// Advanced session management endpoints

// Compare two sessions
router.post('/compare', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { session1Id, session2Id } = req.body;

    if (!session1Id || !session2Id) {
      return res.status(400).json({ error: 'Both session1Id and session2Id are required' });
    }

    const comparison = await sessionService.compareSessions(session1Id, session2Id);
    res.json(comparison);
  } catch (error) {
    logger.error('Error comparing sessions:', error);
    res.status(500).json({ error: 'Failed to compare sessions' });
  }
});

// Transfer character between sessions
router.post('/transfer-character', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { characterId, fromSessionId, toSessionId } = req.body;

    if (!characterId || !fromSessionId || !toSessionId) {
      return res
        .status(400)
        .json({ error: 'characterId, fromSessionId, and toSessionId are required' });
    }

    const success = await sessionService.transferCharacterToSession(
      characterId,
      fromSessionId,
      toSessionId
    );
    res.json({ success, message: 'Character transferred successfully' });
  } catch (error) {
    logger.error('Error transferring character:', error);
    res.status(500).json({ error: 'Failed to transfer character' });
  }
});

// Get campaign timeline
router.get('/campaign/:campaignId/timeline', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { campaignId } = req.params;
    const timeline = await sessionService.getCampaignTimeline(campaignId);
    res.json({ timeline });
  } catch (error) {
    logger.error('Error getting campaign timeline:', error);
    res.status(500).json({ error: 'Failed to get campaign timeline' });
  }
});

// Search and filter sessions
router.post('/search', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const filters = req.body;
    const sessions = await sessionService.searchSessions(filters);
    res.json({ sessions, count: sessions.length });
  } catch (error) {
    logger.error('Error searching sessions:', error);
    res.status(500).json({ error: 'Failed to search sessions' });
  }
});

// Add tags to session
router.post('/:sessionId/tags', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'tags array is required' });
    }

    await sessionService.addSessionTags(sessionId, tags);
    res.json({ message: 'Tags added successfully' });
  } catch (error) {
    logger.error('Error adding session tags:', error);
    res.status(500).json({ error: 'Failed to add session tags' });
  }
});

// Remove tags from session
router.delete('/:sessionId/tags', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'tags array is required' });
    }

    await sessionService.removeSessionTags(sessionId, tags);
    res.json({ message: 'Tags removed successfully' });
  } catch (error) {
    logger.error('Error removing session tags:', error);
    res.status(500).json({ error: 'Failed to remove session tags' });
  }
});

// Archive session
router.post('/:sessionId/archive', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    const { archiveReason } = req.body;

    if (!archiveReason) {
      return res.status(400).json({ error: 'archiveReason is required' });
    }

    await sessionService.archiveSession(sessionId, archiveReason);
    res.json({ message: 'Session archived successfully' });
  } catch (error) {
    logger.error('Error archiving session:', error);
    res.status(500).json({ error: 'Failed to archive session' });
  }
});

// Restore archived session
router.post('/:sessionId/restore', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    await sessionService.restoreSession(sessionId);
    res.json({ message: 'Session restored successfully' });
  } catch (error) {
    logger.error('Error restoring session:', error);
    res.status(500).json({ error: 'Failed to restore session' });
  }
});

// Share session
router.post('/:sessionId/share', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    const { shareWith, permissions } = req.body;

    if (!shareWith || !Array.isArray(shareWith) || !permissions) {
      return res.status(400).json({ error: 'shareWith array and permissions are required' });
    }

    await sessionService.shareSession(sessionId, shareWith, permissions);
    res.json({ message: 'Session shared successfully' });
  } catch (error) {
    logger.error('Error sharing session:', error);
    res.status(500).json({ error: 'Failed to share session' });
  }
});

// Data migration routes
router.post('/migrate-data', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const result = await sessionService.migrateSessionData();

    logger.info(`Data migration completed: ${result.updated} updated, ${result.errors} errors`);

    return res.json({
      message: 'Data migration completed successfully',
      result,
    });
  } catch (error) {
    logger.error('Error during data migration:', error);
    return res.status(500).json({
      error: 'Failed to migrate session data',
      message: 'An error occurred during data migration',
    });
  }
});

// Delete session (hard delete)
router.delete('/:sessionId', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;
    await sessionService.deleteSession(sessionId);
    res.json({ message: 'Session and all related data deleted successfully' });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
