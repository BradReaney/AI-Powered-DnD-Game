export interface GeminiResponse {
    success: boolean;
    content: string;
    error?: string;
    usage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
    };
    modelUsed?: 'flash-lite' | 'flash' | 'pro';
    responseTime?: number;
    fallbackUsed?: boolean;
}

export interface GeminiRequest {
    prompt: string;
    context?: string;
    temperature?: number;
    maxTokens?: number;
    taskType?: string;
    forceModel?: 'flash-lite' | 'flash' | 'pro';
    conversationHistory?: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
    }>;
}

export interface MockServiceConfig {
    port: number;
    delay: number;
    failureRate: number;
    enableRandomization: boolean;
}

export interface StoryTemplate {
    id: string;
    type: string;
    templates: string[];
    variables: string[];
}

export interface CharacterTemplate {
    id: string;
    race: string;
    class: string;
    personality: string[];
    background: string[];
}

export interface LocationTemplate {
    id: string;
    type: string;
    descriptions: string[];
    features: string[];
}
