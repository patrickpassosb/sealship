// Sealship — Generic OpenAI-Compatible LLM Provider
// Supports: Mistral, Cerebras, OpenRouter, Grok, OpenAI, and any OpenAI-compatible API

import { LLMConfig, LLMMessage, LLMResponse } from '@/types';

// Default configurations for known providers
// Source: Official API documentation for each provider
const PROVIDER_DEFAULTS: Record<string, Partial<LLMConfig>> = {
    mistral: {
        baseUrl: 'https://api.mistral.ai/v1',
        model: 'mistral-large-latest',
    },
    cerebras: {
        baseUrl: 'https://api.cerebras.ai/v1',
        model: 'llama-4-scout-17b-16e-instruct',
    },
    openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'mistralai/mistral-large-latest',
    },
    grok: {
        baseUrl: 'https://api.x.ai/v1',
        model: 'grok-3',
    },
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
    },
    groq: {
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'llama-3.3-70b-versatile',
    },
    together: {
        baseUrl: 'https://api.together.xyz/v1',
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
    },
};

/**
 * Resolves LLM configuration by merging provider defaults with user overrides.
 * Supports adding new providers by simply providing baseUrl and model.
 */
export function resolveLLMConfig(partial: Partial<LLMConfig> & { provider: string; apiKey: string }): LLMConfig {
    const defaults = PROVIDER_DEFAULTS[partial.provider.toLowerCase()] || {};

    return {
        provider: partial.provider,
        apiKey: partial.apiKey,
        baseUrl: partial.baseUrl || defaults.baseUrl || '',
        model: partial.model || defaults.model || '',
        maxTokens: partial.maxTokens || 2048,
        temperature: partial.temperature ?? 0.3,
    };
}

/**
 * Get LLM configuration from environment variables.
 * Reads: LLM_PROVIDER, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_MAX_TOKENS
 */
export function getLLMConfigFromEnv(): LLMConfig {
    const provider = process.env.LLM_PROVIDER || 'mistral';
    const apiKey = process.env.LLM_API_KEY || '';

    return resolveLLMConfig({
        provider,
        apiKey,
        baseUrl: process.env.LLM_BASE_URL || undefined,
        model: process.env.LLM_MODEL || undefined,
        maxTokens: process.env.LLM_MAX_TOKENS ? parseInt(process.env.LLM_MAX_TOKENS) : undefined,
    });
}

/**
 * Sends a chat completion request to any OpenAI-compatible API.
 * All supported providers (Mistral, Cerebras, OpenRouter, Grok, etc.)
 * use the same /v1/chat/completions endpoint format.
 */
export async function chatCompletion(
    config: LLMConfig,
    messages: LLMMessage[]
): Promise<LLMResponse> {
    const url = `${config.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
    };

    // OpenRouter requires additional headers
    if (config.provider.toLowerCase() === 'openrouter') {
        headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'https://sealship.dev';
        headers['X-Title'] = 'Sealship';
    }

    const body = {
        model: config.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens,
        temperature: config.temperature,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `LLM API error (${config.provider}): ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data = await response.json();

        return {
            content: data.choices?.[0]?.message?.content || '',
            model: data.model || config.model,
            usage: data.usage
                ? {
                    promptTokens: data.usage.prompt_tokens || 0,
                    completionTokens: data.usage.completion_tokens || 0,
                    totalTokens: data.usage.total_tokens || 0,
                }
                : undefined,
        };
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('LLM API error')) {
            throw error;
        }
        throw new Error(
            `Failed to connect to LLM provider (${config.provider}): ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * List of all supported provider names.
 * New providers can be added by extending PROVIDER_DEFAULTS
 * or by passing a custom baseUrl in the config.
 */
export function getSupportedProviders(): string[] {
    return Object.keys(PROVIDER_DEFAULTS);
}

/**
 * Check if a provider is supported out of the box.
 */
export function isKnownProvider(provider: string): boolean {
    return provider.toLowerCase() in PROVIDER_DEFAULTS;
}
