import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { MockResponseService } from './services/MockResponseService';
import { MockServiceConfig } from './types';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env['PORT'] || 5002;

// Configuration
const config: MockServiceConfig = {
    port: parseInt(process.env['PORT'] || '5002'),
    delay: parseInt(process.env['MOCK_LLM_DELAY'] || '1000'),
    failureRate: parseFloat(process.env['MOCK_LLM_FAILURE_RATE'] || '0.05'),
    enableRandomization: process.env['MOCK_LLM_ENABLE_RANDOMIZATION'] === 'true'
};

// Initialize services
const mockResponseService = new MockResponseService(config);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'mock-llm-service',
        timestamp: new Date().toISOString(),
        config: {
            delay: config.delay,
            failureRate: config.failureRate,
            enableRandomization: config.enableRandomization
        }
    });
});

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        service: 'Mock LLM Service',
        version: '1.0.0',
        description: 'Mock service for D&D game development and testing',
        endpoints: {
            '/health': 'Health check',
            '/generate': 'Generate mock responses (POST)',
            '/test': 'Test connection (GET)'
        },
        config: {
            delay: config.delay,
            failureRate: config.failureRate,
            enableRandomization: config.enableRandomization
        }
    });
});

// Test connection endpoint
app.get('/test', async (_req, res) => {
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

// Main generation endpoint
app.post('/generate', async (req, res) => {
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

// Gemini API compatibility endpoint
app.post('/v1/models/:model/generateContent', async (req, res) => {
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

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        content: 'I apologize, but I am experiencing technical difficulties. Please try again in a moment.',
        error: 'Internal server error',
        modelUsed: 'flash-lite',
        responseTime: 1000,
        fallbackUsed: false
    });
});

// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: ['/health', '/test', '/generate', '/v1/models/:model/generateContent']
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Mock LLM Service running on port ${port}`);
    console.log(`📊 Configuration:`, config);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
    console.log(`🎯 Generation endpoint: http://localhost:${port}/generate`);
    console.log(`🔄 Gemini API compatibility: http://localhost:${port}/v1/models/:model/generateContent`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

export default app;
