import { config } from '../config';
import GeminiClient from './GeminiClient';
import MockGeminiClient from './MockGeminiClient';
import logger from './LoggerService';

export class LLMClientFactory {
    private static instance: LLMClientFactory;
    private currentClient: GeminiClient | MockGeminiClient | null = null;

    private constructor() { }

    public static getInstance(): LLMClientFactory {
        if (!LLMClientFactory.instance) {
            LLMClientFactory.instance = new LLMClientFactory();
        }
        return LLMClientFactory.instance;
    }

    /**
     * Get the appropriate LLM client based on configuration
     */
    public getClient(): GeminiClient | MockGeminiClient {
        if (this.currentClient) {
            return this.currentClient;
        }

        if (config.gemini.useMockService) {
            logger.info('Initializing Mock LLM Client', {
                serviceUrl: config.gemini.serviceUrl,
                useMockService: config.gemini.useMockService
            });
            this.currentClient = new MockGeminiClient();
        } else {
            logger.info('Initializing Real Gemini Client', {
                useMockService: config.gemini.useMockService,
                hasApiKey: !!config.gemini.apiKey
            });
            this.currentClient = new GeminiClient();
        }

        return this.currentClient;
    }

    /**
     * Switch between real and mock clients
     */
    public switchClient(useMock: boolean): void {
        logger.info('Switching LLM client', { useMock });

        if (useMock) {
            this.currentClient = new MockGeminiClient();
        } else {
            this.currentClient = new GeminiClient();
        }
    }

    /**
     * Get current client type
     */
    public getCurrentClientType(): 'real' | 'mock' {
        return this.currentClient instanceof MockGeminiClient ? 'mock' : 'real';
    }

    /**
     * Test the current client connection
     */
    public async testConnection(): Promise<boolean> {
        try {
            const client = this.getClient();
            return await client.testConnection();
        } catch (error) {
            logger.error('Connection test failed:', error);
            return false;
        }
    }
}

export default LLMClientFactory;
