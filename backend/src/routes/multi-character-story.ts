import express from 'express';
import { Types } from 'mongoose';
import MultiCharacterStoryService from '../services/MultiCharacterStoryService';
import logger from '../services/LoggerService';

const router = express.Router();

// Initialize service
let multiCharacterStoryService: MultiCharacterStoryService;

try {
  logger.info('Initializing multi-character story service...');
  multiCharacterStoryService = new MultiCharacterStoryService();
  logger.info('Multi-character story service initialized successfully');
} catch (error) {
  logger.error('Error initializing multi-character story service:', error);
  throw error;
}

/**
 * @route POST /api/multi-character-story/initialize
 * @desc Initialize multi-character story system for a campaign
 * @access Public
 */
router.post('/initialize', async (req, res) => {
  try {
    const { campaignId, characterIds } = req.body;

    if (!campaignId || !characterIds || !Array.isArray(characterIds)) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and character IDs array are required',
      });
    }

    // Validate campaign ID
    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    // Validate character IDs
    for (const characterId of characterIds) {
      if (!Types.ObjectId.isValid(characterId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid character ID format: ${characterId}`,
        });
      }
    }

    await multiCharacterStoryService.initializeMultiCharacterStory(campaignId, characterIds);

    res.json({
      success: true,
      message: 'Multi-character story system initialized successfully',
    });
  } catch (error) {
    logger.error('Error initializing multi-character story system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize multi-character story system',
    });
  }
});

/**
 * @route POST /api/multi-character-story/interaction
 * @desc Record a character interaction
 * @access Public
 */
router.post('/interaction', async (req, res) => {
  try {
    const { campaignId, interaction } = req.body;

    if (!campaignId || !interaction) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and interaction data are required',
      });
    }

    // Validate required interaction fields
    if (
      !interaction.characterIds ||
      !Array.isArray(interaction.characterIds) ||
      !interaction.interactionType ||
      !interaction.context ||
      !interaction.outcome
    ) {
      return res.status(400).json({
        success: false,
        error: 'Interaction must include characterIds, interactionType, context, and outcome',
      });
    }

    const recordedInteraction = await multiCharacterStoryService.recordCharacterInteraction(
      campaignId,
      interaction
    );

    res.json({
      success: true,
      data: recordedInteraction,
    });
  } catch (error) {
    logger.error('Error recording character interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record character interaction',
    });
  }
});

/**
 * @route GET /api/multi-character-story/relationships/:campaignId
 * @desc Get character relationships for a campaign
 * @access Public
 */
router.get('/relationships/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const relationships = multiCharacterStoryService.getCharacterRelationships(campaignId);

    res.json({
      success: true,
      data: relationships,
    });
  } catch (error) {
    logger.error('Error getting character relationships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character relationships',
    });
  }
});

/**
 * @route GET /api/multi-character-story/interactions/:campaignId
 * @desc Get character interactions for a campaign
 * @access Public
 */
router.get('/interactions/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const interactions = multiCharacterStoryService.getCharacterInteractions(campaignId);

    res.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    logger.error('Error getting character interactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character interactions',
    });
  }
});

/**
 * @route GET /api/multi-character-story/subplots/:campaignId
 * @desc Get character subplots for a campaign
 * @access Public
 */
router.get('/subplots/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const subplots = multiCharacterStoryService.getCharacterSubplots(campaignId);

    res.json({
      success: true,
      data: subplots,
    });
  } catch (error) {
    logger.error('Error getting character subplots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character subplots',
    });
  }
});

/**
 * @route GET /api/multi-character-story/group-dynamics/:campaignId
 * @desc Get group dynamics for a campaign
 * @access Public
 */
router.get('/group-dynamics/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const groupDynamics = multiCharacterStoryService.getGroupDynamics(campaignId);

    res.json({
      success: true,
      data: groupDynamics,
    });
  } catch (error) {
    logger.error('Error getting group dynamics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group dynamics',
    });
  }
});

/**
 * @route GET /api/multi-character-story/influences/:campaignId
 * @desc Get character influences for a campaign
 * @access Public
 */
router.get('/influences/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const influences = multiCharacterStoryService.getCharacterInfluences(campaignId);

    res.json({
      success: true,
      data: influences,
    });
  } catch (error) {
    logger.error('Error getting character influences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character influences',
    });
  }
});

/**
 * @route PUT /api/multi-character-story/subplot/:campaignId/:subplotId
 * @desc Update a character subplot
 * @access Public
 */
router.put('/subplot/:campaignId/:subplotId', async (req, res) => {
  try {
    const { campaignId, subplotId } = req.params;
    const { updates } = req.body;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    if (!updates) {
      return res.status(400).json({
        success: false,
        error: 'Updates are required',
      });
    }

    const success = await multiCharacterStoryService.updateCharacterSubplot(
      campaignId,
      subplotId,
      updates
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Subplot not found',
      });
    }

    res.json({
      success: true,
      message: 'Subplot updated successfully',
    });
  } catch (error) {
    logger.error('Error updating character subplot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update character subplot',
    });
  }
});

/**
 * @route POST /api/multi-character-story/milestone/:campaignId/:subplotId/:milestoneId
 * @desc Complete a subplot milestone
 * @access Public
 */
router.post('/milestone/:campaignId/:subplotId/:milestoneId', async (req, res) => {
  try {
    const { campaignId, subplotId, milestoneId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const success = await multiCharacterStoryService.completeSubplotMilestone(
      campaignId,
      subplotId,
      milestoneId
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Subplot or milestone not found',
      });
    }

    res.json({
      success: true,
      message: 'Milestone completed successfully',
    });
  } catch (error) {
    logger.error('Error completing subplot milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete subplot milestone',
    });
  }
});

/**
 * @route GET /api/multi-character-story/relationship/:campaignId/:characterId1/:characterId2
 * @desc Get relationship between two characters
 * @access Public
 */
router.get('/relationship/:campaignId/:characterId1/:characterId2', async (req, res) => {
  try {
    const { campaignId, characterId1, characterId2 } = req.params;

    if (
      !Types.ObjectId.isValid(campaignId) ||
      !Types.ObjectId.isValid(characterId1) ||
      !Types.ObjectId.isValid(characterId2)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
      });
    }

    const relationship = multiCharacterStoryService.getCharacterRelationship(
      campaignId,
      characterId1,
      characterId2
    );

    res.json({
      success: true,
      data: relationship,
    });
  } catch (error) {
    logger.error('Error getting character relationship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character relationship',
    });
  }
});

/**
 * @route GET /api/multi-character-story/analysis/:campaignId
 * @desc Analyze group dynamics and provide recommendations
 * @access Public
 */
router.get('/analysis/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const analysis = await multiCharacterStoryService.analyzeGroupDynamics(campaignId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error analyzing group dynamics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze group dynamics',
    });
  }
});

/**
 * @route GET /api/multi-character-story/suggestions/:campaignId
 * @desc Generate story suggestions based on character dynamics
 * @access Public
 */
router.get('/suggestions/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const suggestions = await multiCharacterStoryService.generateStorySuggestions(campaignId);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Error generating story suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate story suggestions',
    });
  }
});

export default router;
