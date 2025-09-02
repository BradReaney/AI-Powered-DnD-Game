import express from 'express';
import { Types } from 'mongoose';
import ContextManager from '../services/ContextManager';
import DynamicContextSelector from '../services/DynamicContextSelector';
import MultiCharacterStoryService from '../services/MultiCharacterStoryService';
import BranchingNarrativeService from '../services/BranchingNarrativeService';
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';
import logger from '../services/LoggerService';

const router = express.Router();

// Initialize services
let contextManager: ContextManager;
let dynamicContextSelector: DynamicContextSelector;
let multiCharacterStoryService: MultiCharacterStoryService;
let branchingNarrativeService: BranchingNarrativeService;
let performanceOptimizationService: PerformanceOptimizationService;

try {
  logger.info('Initializing performance optimization services...');
  contextManager = new ContextManager();
  dynamicContextSelector = new DynamicContextSelector(contextManager);
  multiCharacterStoryService = new MultiCharacterStoryService();
  branchingNarrativeService = new BranchingNarrativeService();
  performanceOptimizationService = new PerformanceOptimizationService(
    contextManager,
    dynamicContextSelector,
    multiCharacterStoryService,
    branchingNarrativeService
  );
  logger.info('Performance optimization services initialized successfully');
} catch (error) {
  logger.error('Error initializing performance optimization services:', error);
  throw error;
}

/**
 * @route POST /api/performance-optimization/initialize
 * @desc Initialize performance optimization for a campaign
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

    await performanceOptimizationService.initializePerformanceOptimization(campaignId);

    res.json({
      success: true,
      message: 'Performance optimization initialized successfully',
    });
  } catch (error) {
    logger.error('Error initializing performance optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize performance optimization',
    });
  }
});

/**
 * @route POST /api/performance-optimization/optimize-context
 * @desc Optimize context management performance
 * @access Public
 */
router.post('/optimize-context', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const result = await performanceOptimizationService.optimizeContextManagement(campaignId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error optimizing context management:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize context management',
    });
  }
});

/**
 * @route POST /api/performance-optimization/optimize-story-arc
 * @desc Optimize story arc performance
 * @access Public
 */
router.post('/optimize-story-arc', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const result = await performanceOptimizationService.optimizeStoryArcPerformance(campaignId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error optimizing story arc performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize story arc performance',
    });
  }
});

/**
 * @route POST /api/performance-optimization/add-scalability-features
 * @desc Add scalability features
 * @access Public
 */
router.post('/add-scalability-features', async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const result = await performanceOptimizationService.addScalabilityFeatures(campaignId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error adding scalability features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add scalability features',
    });
  }
});

/**
 * @route POST /api/performance-optimization/record-metrics
 * @desc Record performance metrics
 * @access Public
 */
router.post('/record-metrics', async (req, res) => {
  try {
    const {
      campaignId,
      responseTime,
      memoryUsage,
      contextSize,
      tokenUsage,
      cacheHitRate,
      errorRate,
      throughput,
    } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    performanceOptimizationService.recordPerformanceMetrics(
      campaignId,
      responseTime || 0,
      memoryUsage || 0,
      contextSize || 0,
      tokenUsage || 0,
      cacheHitRate || 0,
      errorRate || 0,
      throughput || 0
    );

    res.json({
      success: true,
      message: 'Performance metrics recorded successfully',
    });
  } catch (error) {
    logger.error('Error recording performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record performance metrics',
    });
  }
});

/**
 * @route GET /api/performance-optimization/analytics/:campaignId
 * @desc Get performance analytics for a campaign
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

    const analytics = performanceOptimizationService.getPerformanceAnalytics(campaignId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting performance analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance analytics',
    });
  }
});

/**
 * @route GET /api/performance-optimization/alerts/:campaignId
 * @desc Get performance alerts for a campaign
 * @access Public
 */
router.get('/alerts/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const alerts = performanceOptimizationService.getPerformanceAlerts(campaignId);

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    logger.error('Error getting performance alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance alerts',
    });
  }
});

/**
 * @route GET /api/performance-optimization/scalability/:campaignId
 * @desc Get scalability metrics for a campaign
 * @access Public
 */
router.get('/scalability/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const metrics = performanceOptimizationService.getScalabilityMetrics(campaignId);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error getting scalability metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scalability metrics',
    });
  }
});

/**
 * @route POST /api/performance-optimization/resolve-alert
 * @desc Resolve a performance alert
 * @access Public
 */
router.post('/resolve-alert', async (req, res) => {
  try {
    const { campaignId, alertId } = req.body;

    if (!campaignId || !alertId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and alert ID are required',
      });
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    const success = performanceOptimizationService.resolvePerformanceAlert(campaignId, alertId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or already resolved',
      });
    }

    res.json({
      success: true,
      message: 'Performance alert resolved successfully',
    });
  } catch (error) {
    logger.error('Error resolving performance alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve performance alert',
    });
  }
});

/**
 * @route PUT /api/performance-optimization/config/:campaignId
 * @desc Update optimization configuration
 * @access Public
 */
router.put('/config/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { config } = req.body;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format',
      });
    }

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Configuration is required',
      });
    }

    performanceOptimizationService.updateOptimizationConfig(campaignId, config);

    res.json({
      success: true,
      message: 'Optimization configuration updated successfully',
    });
  } catch (error) {
    logger.error('Error updating optimization configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update optimization configuration',
    });
  }
});

export default router;
