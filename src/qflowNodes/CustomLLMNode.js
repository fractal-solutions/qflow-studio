import { AsyncNode } from '@fractal-solutions/qflow';

export class CustomLLMNode extends AsyncNode {
    constructor(maxRetries = 3, wait = 2) {
        super(maxRetries, wait);
    }

    // Define provider configurations
    static providerConfigs = {
        OpenRouter: {
            apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
            defaultModel: 'mistralai/mistral-7b-instruct-v0.2',
            requestBody: (prompt, model) => ({
                model: model,
                messages: [{ role: 'user', content: prompt }],
            }),
            responsePath: 'choices[0].message.content',
            apiKeyRequired: true,
        },
        DeepSeek: {
            apiUrl: 'https://api.deepseek.com/chat/completions',
            defaultModel: 'deepseek-chat',
            requestBody: (prompt, model) => ({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2048,
                temperature: 0.7,
            }),
            responsePath: 'choices[0].message.content',
            apiKeyRequired: true,
        },
        OpenAI: {
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            defaultModel: 'gpt-3.5-turbo',
            requestBody: (prompt, model) => ({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
            }),
            responsePath: 'choices[0].message.content',
            apiKeyRequired: true,
        },
        Gemini: {
            apiUrl: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            defaultModel: 'gemini-pro',
            requestBody: (prompt) => ({
                contents: [{ parts: [{ text: prompt }] }],
            }),
            responsePath: 'candidates[0].content.parts[0].text',
            apiKeyRequired: true,
        },
        Ollama: {
            apiUrl: (baseUrl = 'http://localhost:11434') => `${baseUrl}/api/generate`,
            defaultModel: 'llama2',
            requestBody: (prompt, model) => ({
                model: model,
                prompt: prompt,
                stream: false,
            }),
            responsePath: 'response',
            apiKeyRequired: false,
        },
        HuggingFace: {
            apiUrl: (baseUrl = 'https://router.huggingface.co/v1') => `${baseUrl}/chat/completions`,
            defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
            requestBody: (prompt, model) => ({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
            }),
            responsePath: 'choices[0].message.content',
            apiKeyRequired: true,
        },
    };

    async execAsync() {
        let { provider, apiUrl, apiKey, model, prompt, requestBody, responsePath, baseUrl } = this.params;

        let currentApiUrl = apiUrl;
        let currentModel = model;
        let currentRequestBody = requestBody;
        let currentResponsePath = responsePath;
        let currentApiKey = apiKey;

        if (provider && CustomLLMNode.providerConfigs[provider]) {
            const config = CustomLLMNode.providerConfigs[provider];

            // Use provider's API URL if not explicitly provided by user
            if (!currentApiUrl) {
                currentApiUrl = typeof config.apiUrl === 'function' ? config.apiUrl(baseUrl || currentApiKey) : config.apiUrl;
            }

            // Use provider's default model if not explicitly provided by user
            if (!currentModel) {
                currentModel = config.defaultModel;
            }

            // Construct request body using provider's function and merge with user's requestBody
            const providerRequestBody = config.requestBody(prompt, currentModel);
            currentRequestBody = { ...providerRequestBody, ...currentRequestBody };

            // Replace {{prompt}} placeholder with actual prompt value
            if (currentRequestBody.messages && Array.isArray(currentRequestBody.messages)) {
                currentRequestBody.messages = currentRequestBody.messages.map(msg => ({
                    ...msg,
                    content: String(msg.content).replace(/\{\{prompt\}\}/g, prompt) // Replace {{prompt}} with actual prompt
                }));
            }

            // Ensure messages content is always a string
            if (currentRequestBody.messages && Array.isArray(currentRequestBody.messages)) {
                currentRequestBody.messages = currentRequestBody.messages.map(msg => ({
                    ...msg,
                    content: String(msg.content) // Ensure content is always a string
                }));
            }

            // Use provider's response path if not explicitly provided by user
            if (!currentResponsePath) {
                currentResponsePath = config.responsePath;
            }

            // Check for API key requirement
            if (config.apiKeyRequired && !currentApiKey) {
                throw new Error(`${provider} LLM requires an 'apiKey'.`);
            }
        }

        if (!currentApiUrl) {
            throw new Error('CustomLLMNode requires an `apiUrl`.');
        }
        if (!currentModel) {
            throw new Error('CustomLLMNode requires a `model`.');
        }
        if (!currentRequestBody) {
            throw new Error('CustomLLMNode requires a `requestBody`.');
        }

        const headers = {
            'Content-Type': 'application/json',
        };

        // Add Authorization header only if apiKey is present and not for Gemini (as it's in URL)
        if (currentApiKey && provider !== 'Gemini') {
            headers['Authorization'] = `Bearer ${currentApiKey}`;
        }

        console.log(`[CustomLLMNode] Sending request to ${currentApiUrl} with model ${currentModel}...`);
        console.log(`[CustomLLMNode] Request Body:`, JSON.stringify(currentRequestBody, null, 2));

        try {
            const response = await fetch(currentApiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(currentRequestBody),
            });

            if (!response.ok) {
                let errorData;
                const rawErrorText = await response.text(); // Read body as text first
                try {
                    errorData = JSON.parse(rawErrorText); // Try parsing as JSON
                } catch (e) {
                    errorData = rawErrorText; // If JSON parsing fails, use raw text
                }
                throw new Error(`CustomLLM API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();

            // Extract response based on responsePath, or return full data
            let result = data;
            if (currentResponsePath) {
                try {
                    result = currentResponsePath.split('.').reduce((o, i) => o[i], data);
                } catch (e) {
                    console.warn(`[CustomLLMNode] Could not resolve responsePath: ${currentResponsePath}. Returning full response data.`, e);
                }
            }

            console.log(`[CustomLLMNode] Received response.`);
            return result;

        } catch (error) {
            console.error('CustomLLMNode: Error during API call:', error);
            throw error;
        }
    }

    async postAsync(shared, prepRes, execRes) {
        shared.llmResponse = execRes;
        return 'default';
    }
}

export const providerConfigs = CustomLLMNode.providerConfigs;