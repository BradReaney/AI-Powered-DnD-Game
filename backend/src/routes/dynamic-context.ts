import express from 'express';
import { Types } from 'mongoose';
import ContextManager from '../services/ContextManager';
import DynamicContextSelector from '../services/DynamicContextSelector';
import logger from '../services/LoggerService';

const router = express.Router();

// Initialize services
let contextManager: ContextManager;
let dynamicContextSelector: DynamicContextSelector;

try {
  logger.info('Initializing dynamic context services...');
  contextManager = new ContextManager();
  dynamicContextSelector = new DynamicContextSelector(contextManager);
  logger.info('Dynamic context services initialized successfully');
} catch (error) {
  logger.error('Error initializing dynamic context services:', error);
  throw error;
}

/**
 * @route POST /api/dynamic-context/select
 * @desc Select optimal context based on criteria
 * @access Public
 */
router.post('/select', async (req, res) => {
  try {
    const { campaignId, criteria } = req.body;

    if (!campaignId || !criteria) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and criteria are required',
      });
    }

    // Validate campaign ID
    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    // Set default criteria if not provided
    const defaultCriteria = {
      taskType: 'general',
      currentSituation: '',
      characterIds: [],
      storyPhase: 'development' as const,
      maxTokens: 4000,
      priorityWeights: {
        storyRelevance: 0.3,
        characterRelevance: 0.3,
        recency: 0.2,
        importance: 0.1,
        questRelevance: 0.1,
      },
    };

    const finalCriteria = { ...defaultCriteria, ...criteria };

    const result = await dynamicContextSelector.selectOptimalContext(campaignId, finalCriteria);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error selecting dynamic context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select dynamic context',
    });
  }
});

/**
 * @route POST /api/dynamic-context/adapt-strategy
 * @desc Adapt context selection strategy
 * @access Public
 */
router.post('/adapt-strategy', async (req, res) => {
  try {
    const { campaignId, config } = req.body;

    if (!campaignId || !config) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and config are required',
      });
    }

    await dynamicContextSelector.adaptContextStrategy(campaignId, config);

    res.json({
      success: true,
      message: 'Context strategy adapted successfully',
    });
  } catch (error) {
    logger.error('Error adapting context strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adapt context strategy',
    });
  }
});

/**
 * @route POST /api/dynamic-context/record-effectiveness
 * @desc Record effectiveness metrics for context selection
 * @access Public
 */
router.post('/record-effectiveness', async (req, res) => {
  try {
    const {
      campaignId,
      taskType,
      effectivenessScore,
      userSatisfaction,
      contextRelevance,
      responseQuality,
    } = req.body;

    if (!campaignId || !taskType) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and task type are required',
      });
    }

    dynamicContextSelector.recordEffectivenessMetrics(
      campaignId,
      taskType,
      effectivenessScore || 0.5,
      userSatisfaction || 0.5,
      contextRelevance || 0.5,
      responseQuality || 0.5
    );

    res.json({
      success: true,
      message: 'Effectiveness metrics recorded successfully',
    });
  } catch (error) {
    logger.error('Error recording effectiveness metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record effectiveness metrics',
    });
  }
});

/**
 * @route GET /api/dynamic-context/analytics/:campaignId
 * @desc Get effectiveness analytics for a campaign
 * @access Public
 */
router.get('/analytics/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const analytics = dynamicContextSelector.getEffectivenessAnalytics(campaignId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting effectiveness analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get effectiveness analytics',
    });
  }
});

/**
 * @route GET /api/dynamic-context/cache-stats
 * @desc Get cache statistics
 * @access Public
 */
router.get('/cache-stats', async (req, res) => {
  try {
    const stats = dynamicContextSelector.getCacheStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
    });
  }
});

/**
 * @route POST /api/dynamic-context/clear-cache
 * @desc Clear expired cache entries
 * @access Public
 */
router.post('/clear-cache', async (req, res) => {
  try {
    dynamicContextSelector.clearExpiredCache();

    res.json({
      success: true,
      message: 'Expired cache entries cleared successfully',
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

export default router;
