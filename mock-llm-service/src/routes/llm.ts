import { Router } from 'express';
import { MockResponseService } from '../services/MockResponseService';
import { MockServiceConfig } from '../types';

const router = Router();

// Initialize service
const config: MockServiceConfig = {
  port: parseInt(process.env['PORT'] || '5002'),
  delay: parseInt(process.env['MOCK_LLM_DELAY'] || '1000'),
  failureRate: parseFloat(process.env['MOCK_LLM_FAILURE_RATE'] || '0.05'),
  enableRandomization: process.env['MOCK_LLM_ENABLE_RANDOMIZATION'] === 'true'
};

const mockResponseService = new MockResponseService(config);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'mock-llm-service',
    timestamp: new Date().toISOString(),
    config
  });
});

// Test connection
router.get('/test', async (_req, res) => {
  try {
    const response = await mockResponseService.generateResponse({
      prompt: 'Respond with "OK" if you can read this message.',
      taskType: 'connection_test'
    });

    if (response.success && response.content.includes('OK')) {
      res.json({
        success: true,
        message: 'Mock LLM service is working correctly',
        response: response.content,
        modelUsed: response.modelUsed,
        responseTime: response.responseTime
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Mock LLM service test failed',
        error: response.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Mock LLM service test error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate response
router.post('/generate', async (req, res) => {
  try {
    const request = req.body;

    // Validate request
    if (!request.prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt'
      });
    }

    // Generate response
    const response = await mockResponseService.generateResponse(request);

    // Return response
    return res.json(response);
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({
      success: false,
      content: 'I apologize, but I am experiencing technical difficulties. Please try again in a moment.',
      error: error instanceof Error ? error.message : String(error),
      modelUsed: 'flash-lite',
      responseTime: 1000,
      fallbackUsed: false
    });
  }
});

// Gemini API compatibility
router.post('/v1/models/:model/generateContent', async (req, res) => {
  try {
    const { model } = req.params;
    const request = req.body;

    // Extract prompt from Gemini API format
    let prompt = '';
    if (request.contents && request.contents.length > 0) {
      prompt = request.contents[0].parts?.[0]?.text || '';
    } else if (request.prompt) {
      prompt = request.prompt;
    }

    if (!prompt) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Missing required field: prompt or contents',
          status: 'INVALID_ARGUMENT'
        }
      });
    }

    // Convert to our format
    const mockRequest = {
      prompt,
      context: request.context,
      temperature: request.generationConfig?.temperature,
      maxTokens: request.generationConfig?.maxOutputTokens,
      taskType: 'general',
      forceModel: (model.includes('flash-lite') ? 'flash-lite' :
        model.includes('flash') ? 'flash' : 'pro') as 'flash-lite' | 'flash' | 'pro',
      conversationHistory: request.contents
    };

    // Generate response
    const response = await mockResponseService.generateResponse(mockRequest);

    if (response.success) {
      // Return in Gemini API format
      return res.json({
        candidates: [{
          content: {
            parts: [{
              text: response.content
            }]
          },
          finishReason: 'STOP',
          index: 0,
          safetyRatings: []
        }],
        promptFeedback: {
          safetyRatings: []
        }
      });
    } else {
      return res.status(500).json({
        error: {
          code: 500,
          message: response.error || 'Internal server error',
          status: 'INTERNAL'
        }
      });
    }
  } catch (error) {
    console.error('Error in Gemini API endpoint:', error);
    return res.status(500).json({
      error: {
        code: 500,
        message: 'Internal server error',
        status: 'INTERNAL'
      }
    });
  }
});

export default router;
