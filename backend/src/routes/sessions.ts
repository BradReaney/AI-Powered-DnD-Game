import express from 'express';
import GameEngineService from '../services/GameEngineService';
import SessionService from '../services/SessionService';
import logger from '../services/LoggerService';
import { Server as SocketIOServer } from 'socket.io';
import { Session } from '../models';

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

// Get all sessions for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { campaignId } = req.params;

    // Validate ObjectId format
    if (!campaignId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid campaign ID format',
        message: 'Campaign ID must be a valid ObjectId',
      });
    }

    const sessions = await sessionService.searchSessions({ campaignId });

    res.json({
      message: 'Sessions for campaign retrieved successfully',
      campaignId,
      sessions,
    });
  } catch (error) {
    logger.error('Error getting sessions for campaign:', error);
    res.status(500).json({ error: 'Failed to get sessions for campaign' });
  }
});

// Create new session - CONSOLIDATED ENDPOINT
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

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
        message: 'Please correct the following errors and try again',
      });
    }

    // Get campaign to find latest location and next session number
    const Campaign = require('../models').Campaign;
    const campaign = await Campaign.findById(sessionData.campaignId);
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found',
        message: 'The specified campaign does not exist',
      });
    }

    // Check if there's already an active session for this campaign
    const activeSession = await Session.findOne({
      campaignId: sessionData.campaignId,
      status: 'active',
    }).sort({ createdAt: -1 });

    if (activeSession) {
      // Return the existing active session instead of creating a new one
      logger.info(
        `Active session found for campaign ${sessionData.campaignId}, returning existing session: ${activeSession._id}`,
        {
          sessionId: activeSession._id,
          campaignId: sessionData.campaignId,
          status: activeSession.status,
        }
      );

      return res.status(200).json({
        message: 'Active session already exists for this campaign',
        session: {
          _id: activeSession._id,
          name: activeSession.name,
          sessionNumber: activeSession.sessionNumber,
          status: activeSession.status,
          metadata: {
            dm: activeSession.metadata.dm,
            location: activeSession.metadata.location,
            startTime: activeSession.metadata.startTime,
          },
        },
      });
    }

    // Get next session number
    const lastSession = await Session.findOne({ campaignId: sessionData.campaignId }).sort({
      sessionNumber: -1,
    });
    const nextSessionNumber = lastSession ? lastSession.sessionNumber + 1 : 1;

    // Generate session name
    const sessionName = `Session ${nextSessionNumber} - ${new Date().toLocaleDateString('en-GB')}`;

    // Get latest location from campaign or use default
    let location = 'Starting Location';
    if (campaign.locations && campaign.locations.length > 0) {
      // Sort by creation date and get the latest
      const sortedLocations = campaign.locations.sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.date || 0).getTime() -
          new Date(a.createdAt || a.date || 0).getTime()
      );
      location = sortedLocations[0].name || 'Starting Location';
    }

    // Create session configuration
    const sessionConfig = {
      name: sessionName,
      dm: 'AI Dungeon Master',
      location: location,
      weather: 'Clear', // Default weather
      timeOfDay: 'morning' as const, // Default time of day
    };

    const session = await gameEngineService.createSession(sessionData.campaignId, sessionConfig);

    // Log successful session creation
    logger.info(
      `Session created successfully: ${session._id} for campaign ${sessionData.campaignId}`,
      {
        sessionId: session._id,
        campaignId: sessionData.campaignId,
        dm: sessionConfig.dm,
        name: sessionConfig.name,
        location: sessionConfig.location,
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

// Get all sessions
router.get('/', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { status, campaignId, search } = req.query;

    const query: any = {};
    if (status && typeof status === 'string') query.status = status;
    if (campaignId && typeof campaignId === 'string') query.campaignId = campaignId;
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'metadata.dm': { $regex: search, $options: 'i' } },
        { 'metadata.location': { $regex: search, $options: 'i' } },
      ];
    }

    const sessions = await sessionService.searchSessions(query);

    res.json({
      message: 'Sessions retrieved successfully',
      sessions,
    });
  } catch (error) {
    logger.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get session by ID
router.get('/:sessionId', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;

    // Use searchSessions to find the session
    const sessions = await sessionService.searchSessions({ campaignId: 'temp' });
    const session = sessions.find((s: any) => s._id === sessionId) || null;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The specified session does not exist',
      });
    }

    res.json({
      message: 'Session retrieved successfully',
      session,
    });
  } catch (error) {
    logger.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Update session
router.put('/:sessionId', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;

    // For now, just return success since updateSession method doesn't exist
    res.json({
      message: 'Session update not implemented yet',
      sessionId,
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:sessionId', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;

    await sessionService.deleteSession(sessionId);

    res.json({
      message: 'Session deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ============================================================================
// SESSION ACTIVITY & CONTINUITY
// ============================================================================

// Get active sessions for a campaign
router.get('/active', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { campaignId } = req.query;

    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({
        error: 'Campaign ID is required',
        message: 'Please provide a campaign ID to get active sessions',
      });
    }

    const sessions = await sessionService.searchSessions({ campaignId });
    const activeSessions = sessions.filter((s: any) => s.status === 'active');

    res.json({
      message: 'Active sessions retrieved successfully',
      campaignId,
      sessions: activeSessions,
      count: activeSessions.length,
    });
  } catch (error) {
    logger.error('Error getting active sessions:', error);
    res.status(500).json({ error: 'Failed to get active sessions' });
  }
});

// Get session continuity data
router.get('/active/continuity', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { campaignId } = req.query;

    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({
        error: 'Campaign ID is required',
        message: 'Please provide a campaign ID to get session continuity',
      });
    }

    // Get active sessions for the campaign
    const sessions = await sessionService.searchSessions({ campaignId });
    const activeSessions = sessions.filter((s: any) => s.status === 'active');

    res.json({
      message: 'Session continuity data retrieved successfully',
      campaignId,
      sessions: activeSessions,
    });
  } catch (error) {
    logger.error('Error getting session continuity data:', error);
    res.status(500).json({ error: 'Failed to get session continuity data' });
  }
});

// Update session activity timestamp
router.post('/:sessionId/activity', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const { sessionId } = req.params;

    // Validate UUID format (36 characters with hyphens)
    if (
      !sessionId.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
      )
    ) {
      return res.status(400).json({
        error: 'Invalid session ID format',
        message: 'Session ID must be a valid UUID',
      });
    }

    await sessionService.updateSessionActivity(sessionId);

    res.json({
      message: 'Session activity updated successfully',
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating session activity:', error);
    res.status(500).json({ error: 'Failed to update session activity' });
  }
});

// Close inactive sessions manually
router.post('/close-inactive', async (req, res) => {
  try {
    if (!sessionService) {
      return res.status(500).json({ error: 'Session service not initialized' });
    }

    const closedCount = await sessionService.closeInactiveSessions();

    res.json({
      message: 'Session cleanup completed',
      closedSessions: closedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error closing inactive sessions:', error);
    res.status(500).json({ error: 'Failed to close inactive sessions' });
  }
});

export default router;
