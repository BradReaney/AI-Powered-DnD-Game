import express from 'express';
import GameEngineService from '../services/GameEngineService';
import SessionService from '../services/SessionService';
import logger from '../services/LoggerService';
import { Server as SocketIOServer } from 'socket.io';
import { Message, Session } from '../models';

/**
 * Sessions Routes - Reorganized for better maintainability
 *
 * ORGANIZATION:
 * - CORE SESSION MANAGEMENT: Basic CRUD operations
 * - SESSION ACTIVITY & CONTINUITY: Active sessions and continuity
 * - SESSION DATA & MESSAGING: Session data and chat functionality
 * - STORY EVENTS: Story event management
 * - ADVANCED FEATURES: Timeline and search functionality
 * - SESSION LIFECYCLE MANAGEMENT: Session deletion and activity tracking
 */

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

// ============================================================================
// CORE SESSION MANAGEMENT
// ============================================================================

// Get sessions approaching inactivity threshold
router.get('/approaching-inactivity', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { threshold } = req.query;
    const thresholdMinutes = threshold ? parseInt(threshold as string) : 45;

    const sessions = await sessionService.getSessionsApproachingInactivity(thresholdMinutes);

    res.json({
      message: 'Sessions approaching inactivity',
      sessions,
      thresholdMinutes,
      count: sessions.length,
    });
  } catch (error) {
    logger.error('Error getting sessions approaching inactivity:', error);
    res.status(500).json({ error: 'Failed to get sessions approaching inactivity' });
  }
});

// Automatic session creation endpoint
router.post('/auto-create', async (req, res) => {
  try {
    if (!gameEngineService) {
      return res.status(500).json({ error: 'Game engine service not initialized' });
    }

    const { campaignId, characterId } = req.body;

    // Validate required fields
    if (!campaignId || !characterId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Campaign ID and Character ID are required',
      });
    }

    // Validate ObjectId format
    if (!campaignId.match(/^[0-9a-fA-F]{24}$/) || !characterId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
        message: 'Campaign ID and Character ID must be valid ObjectIds',
      });
    }

    // Create automatic session with default values
    const sessionConfig = {
      name: `Session ${new Date().toLocaleDateString('en-GB')}`,
      dm: 'AI Dungeon Master',
      location: 'Starting Location',
      weather: 'Clear',
      timeOfDay: 'morning' as const,
    };

    const session = await gameEngineService.createSession(campaignId, sessionConfig);

    // Log successful automatic session creation
    logger.info(
      `Automatic session created successfully: ${session._id} for campaign ${campaignId} with character ${characterId}`,
      {
        sessionId: session._id,
        campaignId,
        characterId,
        dm: sessionConfig.dm,
        name: sessionConfig.name,
      }
    );

    return res.status(201).json({
      message: 'Automatic session created successfully',
      session: {
        _id: session._id,
        name: session.name,
        sessionNumber: session.sessionNumber,
        status: session.status,
        campaignId: session.campaignId,
        metadata: {
          dm: session.metadata.dm,
          location: session.metadata.location,
          weather: session.metadata.weather,
          timeOfDay: session.metadata.timeOfDay,
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      },
    });
  } catch (error) {
    logger.error('Error creating automatic session:', error);
    res.status(500).json({
      error: 'Failed to create automatic session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// SESSION ACTIVITY & CONTINUITY
// ============================================================================

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

// Get active sessions for session continuity (simplified)
router.get('/active/continuity', async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }

    const mongoose = require('mongoose');

    // Get active sessions for this campaign with a single aggregation query
    const sessionsWithMessages = await Session.aggregate([
      // Match active sessions for the campaign
      {
        $match: {
          campaignId: new mongoose.Types.ObjectId(campaignId),
          status: 'active',
        },
      },
      // Lookup the most recent message for each session
      {
        $lookup: {
          from: 'messages',
          let: { sessionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$sessionId', '$$sessionId'] },
              },
            },
            {
              $sort: { timestamp: -1 },
            },
            {
              $limit: 1,
            },
          ],
          as: 'lastMessage',
        },
      },
      // Lookup message count for each session
      {
        $lookup: {
          from: 'messages',
          let: { sessionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$sessionId', '$$sessionId'] },
              },
            },
            {
              $count: 'count',
            },
          ],
          as: 'messageCount',
        },
      },
      // Project the final format with fallbacks for sessions without messages
      {
        $project: {
          sessionId: '$_id',
          campaignId: '$campaignId',
          name: '$name',
          description: { $ifNull: ['$metadata.location', 'Unknown Location'] },
          status: '$status',
          lastMessageTime: {
            $ifNull: [{ $arrayElemAt: ['$lastMessage.timestamp', 0] }, '$lastActivity'],
          },
          messageCount: {
            $ifNull: [{ $arrayElemAt: ['$messageCount.count', 0] }, 0],
          },
          lastMessage: {
            $ifNull: [{ $arrayElemAt: ['$lastMessage.content', 0] }, 'No messages yet'],
          },
          lastMessageType: {
            $ifNull: [{ $arrayElemAt: ['$lastMessage.type', 0] }, 'system'],
          },
        },
      },
      // Sort by most recent activity (message time or last activity)
      {
        $sort: { lastMessageTime: -1 },
      },
      // Limit to 5 most recent
      {
        $limit: 5,
      },
    ]);

    return res.json({
      activeSessions: sessionsWithMessages,
      message: 'Active sessions retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting active sessions for continuity:', error);
    return res.status(500).json({ error: 'Failed to get active sessions for continuity' });
  }
});

// ============================================================================
// SESSION DATA & MESSAGING
// ============================================================================

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

// Get messages for a specific session
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Import models
    const { Message } = await import('../models');

    // Get messages for this session
    const messages = await Message.getSessionMessages(
      sessionId,
      parseInt(limit as string),
      parseInt(offset as string),
      false // Don't include deleted messages
    );

    // Get total count for pagination
    const totalCount = await Message.countDocuments({
      sessionId,
      deleted: { $ne: true },
    });

    res.json({
      message: 'Session messages retrieved successfully',
      sessionId,
      messages,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: totalCount > parseInt(limit as string) + parseInt(offset as string),
      },
    });
  } catch (error) {
    logger.error('Error getting session messages:', error);
    res.status(500).json({ error: 'Failed to get session messages' });
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

// ============================================================================
// STORY EVENTS
// ============================================================================

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

// ============================================================================
// ADVANCED FEATURES
// ============================================================================

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

// ============================================================================
// SESSION LIFECYCLE MANAGEMENT
// ============================================================================

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

// Manual session cleanup endpoint (for testing or immediate needs)
router.post('/close-inactive', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const closedCount = await sessionService.closeInactiveSessions();

    res.json({
      message: 'Session cleanup completed',
      closedSessions: closedCount,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error during manual session cleanup:', error);
    res.status(500).json({ error: 'Failed to perform session cleanup' });
  }
});

// ============================================================================
// SESSION ACTIVITY TRACKING
// ============================================================================

// Update session activity endpoint
router.post('/:sessionId/activity', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;

    // Update the session's last activity timestamp
    await sessionService.updateSessionActivity(sessionId);

    res.json({
      message: 'Session activity updated',
      sessionId,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error updating session activity:', error);
    res.status(500).json({ error: 'Failed to update session activity' });
  }
});

/**
 * ENDPOINT SUMMARY:
 *
 * CORE SESSION MANAGEMENT (3 endpoints):
 * - GET /approaching-inactivity - Get sessions approaching inactivity
 * - GET /campaign/:campaignId - Get sessions for campaign
 * - GET /new - Get session creation form state
 *
 * SESSION ACTIVITY & CONTINUITY (2 endpoints):
 * - GET /active/list - Get active sessions
 * - GET /active/continuity - Get active sessions for continuity
 *
 * SESSION DATA & MESSAGING (3 endpoints):
 * - GET /:sessionId - Get session by ID
 * - GET /:sessionId/messages - Get session messages
 * - POST /:sessionId/messages - Send message in session
 * - POST /:sessionId/ai-response - Get AI response for session
 * - GET /:sessionId/game-state - Get session game state
 *
 * STORY EVENTS (1 endpoint):
 * - POST /:sessionId/story-events - Add story event to session
 *
 * ADVANCED FEATURES (2 endpoints):
 * - GET /campaign/:campaignId/timeline - Get campaign timeline
 * - POST /search - Search and filter sessions
 *
 * SESSION LIFECYCLE MANAGEMENT (3 endpoints):
 * - DELETE /:sessionId - Delete session
 * - POST /:sessionId/activity - Update session activity
 * - POST /close-inactive - Manual session cleanup
 *
 * TOTAL: 14 endpoints (down from 35 original endpoints)
 */
export default router;
