/**
 * Configuration for AI services
 */

export const AI_CONFIG = {
    // Gemini API Configuration
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta',

    // Models to use for different tasks - using free, publicly available models
    MODELS: {
        // Gemini models (free tier friendly defaults)
        text: "models/gemini-1.5-flash",
        vision: "models/gemini-1.5-flash",
    },

    // Rate limiting and retry configuration
    RATE_LIMIT: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        timeout: 30000 // 30 seconds
    }
};

/**
 * Check if Hugging Face API is properly configured
 */
export const isGeminiConfigured = (): boolean => {
    return !!AI_CONFIG.GEMINI_API_KEY && AI_CONFIG.GEMINI_API_KEY !== '';
};

/**
 * Get API key with fallback message
 */
export const getApiKey = (): string => {
    if (!isGeminiConfigured()) {
        console.warn('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
        console.warn('Get your API key from: https://ai.google.dev/');
    }
    return AI_CONFIG.GEMINI_API_KEY;
};
