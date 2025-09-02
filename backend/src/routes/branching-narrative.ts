import express from 'express';
import { Types } from 'mongoose';
import BranchingNarrativeService from '../services/BranchingNarrativeService';
import logger from '../services/LoggerService';

const router = express.Router();

// Initialize service
let branchingNarrativeService: BranchingNarrativeService;

try {
  logger.info('Initializing branching narrative service...');
  branchingNarrativeService = new BranchingNarrativeService();
  logger.info('Branching narrative service initialized successfully');
} catch (error) {
  logger.error('Error initializing branching narrative service:', error);
  throw error;
}

/**
 * @route POST /api/branching-narrative/initialize
 * @desc Initialize branching narrative system for a campaign
 * @access Public
 */
router.post('/initialize', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required',
      });
    }

    // Validate campaign ID
    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    await branchingNarrativeService.initializeBranchingNarrative(campaignId);

    res.json({
      success: true,
      message: 'Branching narrative system initialized successfully',
    });
  } catch (error) {
    logger.error('Error initializing branching narrative system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize branching narrative system',
    });
  }
});

/**
 * @route POST /api/branching-narrative/choice
 * @desc Record a player choice
 * @access Public
 */
router.post('/choice', async (req, res) => {
  try {
    const { campaignId, choice } = req.body;

    if (!campaignId || !choice) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and choice data are required',
      });
    }

    // Validate required choice fields
    if (
      !choice.sessionId ||
      !choice.choiceText ||
      !choice.choiceType ||
      !choice.context ||
      !choice.availableOptions ||
      !Array.isArray(choice.availableOptions)
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Choice must include sessionId, choiceText, choiceType, context, and availableOptions array',
      });
    }

    const recordedChoice = await branchingNarrativeService.recordPlayerChoice(campaignId, choice);

    res.json({
      success: true,
      data: recordedChoice,
    });
  } catch (error) {
    logger.error('Error recording player choice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record player choice',
    });
  }
});

/**
 * @route GET /api/branching-narrative/choices/:campaignId
 * @desc Get player choices for a campaign
 * @access Public
 */
router.get('/choices/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const choices = branchingNarrativeService.getPlayerChoices(campaignId);

    res.json({
      success: true,
      data: choices,
    });
  } catch (error) {
    logger.error('Error getting player choices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get player choices',
    });
  }
});

/**
 * @route GET /api/branching-narrative/branches/:campaignId
 * @desc Get story branches for a campaign
 * @access Public
 */
router.get('/branches/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const branches = branchingNarrativeService.getStoryBranches(campaignId);

    res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    logger.error('Error getting story branches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get story branches',
    });
  }
});

/**
 * @route GET /api/branching-narrative/active-branches/:campaignId
 * @desc Get active story branches for a campaign
 * @access Public
 */
router.get('/active-branches/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const activeBranches = branchingNarrativeService.getActiveStoryBranches(campaignId);

    res.json({
      success: true,
      data: activeBranches,
    });
  } catch (error) {
    logger.error('Error getting active story branches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active story branches',
    });
  }
});

/**
 * @route GET /api/branching-narrative/coherence/:campaignId
 * @desc Get narrative coherence for a campaign
 * @access Public
 */
router.get('/coherence/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const coherence = branchingNarrativeService.getNarrativeCoherence(campaignId);

    res.json({
      success: true,
      data: coherence,
    });
  } catch (error) {
    logger.error('Error getting narrative coherence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get narrative coherence',
    });
  }
});

/**
 * @route POST /api/branching-narrative/merge-branches
 * @desc Merge two story branches
 * @access Public
 */
router.post('/merge-branches', async (req, res) => {
  try {
    const { campaignId, branchId1, branchId2, mergePoint } = req.body;

    if (!campaignId || !branchId1 || !branchId2 || !mergePoint) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID, both branch IDs, and merge point are required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const success = await branchingNarrativeService.mergeStoryBranches(
      campaignId,
      branchId1,
      branchId2,
      mergePoint
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'One or both branches not found',
      });
    }

    res.json({
      success: true,
      message: 'Story branches merged successfully',
    });
  } catch (error) {
    logger.error('Error merging story branches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to merge story branches',
    });
  }
});

/**
 * @route GET /api/branching-narrative/statistics/:campaignId
 * @desc Get choice statistics for a campaign
 * @access Public
 */
router.get('/statistics/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const statistics = branchingNarrativeService.getChoiceStatistics(campaignId);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Error getting choice statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get choice statistics',
    });
  }
});

/**
 * @route POST /api/branching-narrative/choice-suggestions
 * @desc Generate choice suggestions based on current story state
 * @access Public
 */
router.post('/choice-suggestions', async (req, res) => {
  try {
    const { campaignId, context, characterIds } = req.body;

    if (!campaignId || !context) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and context are required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const suggestions = await branchingNarrativeService.generateChoiceSuggestions(
      campaignId,
      context,
      characterIds || []
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Error generating choice suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate choice suggestions',
    });
  }
});

export default router;
