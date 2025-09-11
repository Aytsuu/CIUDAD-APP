/**
 * Configuration for AI services
 */

export const AI_CONFIG = {
    // Hugging Face API Configuration
    HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',

    // API URLs
    HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models',

    // Models to use for different tasks - using free, publicly available models
    MODELS: {
        summarization: 'facebook/bart-large-cnn',
        textAnalysis: 't5-small',
        similarity: 'sentence-transformers/all-MiniLM-L6-v2',
        comparison: 't5-small' // Use T5 small for comparison text generation
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
export const isHuggingFaceConfigured = (): boolean => {
    return !!AI_CONFIG.HUGGINGFACE_API_KEY && AI_CONFIG.HUGGINGFACE_API_KEY !== '';
};

/**
 * Get API key with fallback message
 */
export const getApiKey = (): string => {
    if (!isHuggingFaceConfigured()) {
        console.warn('Hugging Face API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment variables.');
        console.warn('Get your free API key from: https://huggingface.co/settings/tokens');
    }
    return AI_CONFIG.HUGGINGFACE_API_KEY;
};
