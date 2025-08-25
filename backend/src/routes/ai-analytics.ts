import express from 'express';
import PerformanceTracker from '../services/PerformanceTracker';
import LLMClientFactory from '../services/LLMClientFactory';

const router = express.Router();
const performanceTracker = PerformanceTracker.getInstance();

// Test Gemini API connection
router.get('/test-gemini', async (req, res) => {
  try {
    const geminiClient = LLMClientFactory.getInstance().getClient();
    const isConnected = await geminiClient.testConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: 'Gemini API connection successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Gemini API connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test Gemini connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get performance summary
router.get('/performance/summary', (req, res) => {
  try {
    const comparison = performanceTracker.getModelPerformanceComparison();
    const summary = {
      totalTasks: performanceTracker.getMetrics().length,
      modelComparison: comparison,
      averageResponseTime: performanceTracker.getAverageResponseTime(),
      successRate: performanceTracker.getSuccessRate(),
      totalCost: performanceTracker.getTotalCost(),
    };
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get performance summary',
    });
  }
});

// Get model comparison
router.get('/performance/model-comparison', (req, res) => {
  try {
    const comparison = performanceTracker.getModelPerformanceComparison();
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get model comparison',
    });
  }
});

// Get metrics by time range (simplified - get all metrics)
router.get('/performance/metrics', (req, res) => {
  try {
    const metrics = performanceTracker.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
    });
  }
});

// Get metrics by model
router.get('/performance/metrics/:model', (req, res) => {
  try {
    const { model } = req.params;
    if (model !== 'flash-lite' && model !== 'flash' && model !== 'pro') {
      return res.status(400).json({
        success: false,
        error: 'Invalid model. Must be "flash-lite", "flash", or "pro"',
      });
    }

    const metrics = performanceTracker.getMetricsByModel(model as 'flash-lite' | 'flash' | 'pro');
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics for model',
    });
  }
});

// Get metrics by task type
router.get('/performance/task-type/:taskType', (req, res) => {
  try {
    const { taskType } = req.params;
    const metrics = performanceTracker.getMetricsByTaskType(taskType);
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics for task type',
    });
  }
});

// Export all metrics
router.get('/performance/export', (req, res) => {
  try {
    const metrics = performanceTracker.exportMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export metrics',
    });
  }
});

// Clear all metrics
router.delete('/performance/clear', (req, res) => {
  try {
    performanceTracker.clearMetrics();
    res.json({ success: true, message: 'All metrics cleared' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear metrics',
    });
  }
});

// Get specific model performance
router.get('/performance/model/:model/summary', (req, res) => {
  try {
    const { model } = req.params;
    if (model !== 'flash-lite' && model !== 'flash' && model !== 'pro') {
      return res.status(400).json({
        success: false,
        error: 'Invalid model. Must be "flash-lite", "flash", or "pro"',
      });
    }

    const modelType = model as 'flash-lite' | 'flash' | 'pro';
    const summary = {
      model: modelType,
      averageResponseTime: performanceTracker.getAverageResponseTime(modelType),
      successRate: performanceTracker.getSuccessRate(modelType),
      totalCost: performanceTracker.getTotalCost(modelType),
      totalTasks: performanceTracker.getMetricsByModel(modelType).length,
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get model summary',
    });
  }
});

export default router;
