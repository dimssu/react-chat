// AI Guideline Prompt
export const AI_GUIDELINE_PROMPT = `
Do not include markdown formatting in your response.
Make your answers crisp and concise.
Avoid unnecessary explanations or repetition.
Respond in plain text only.
Focus on actionable steps or direct answers.
`;

export type LlmProvider = 'openai' | 'gemini' | 'claude';

interface DirectLlmConfig {
  apiEndpoint: string;
  apiKey: string;
  model?: string;
  headers?: Record<string, string>;
  formatMessages: (messages: any[], newMessage: string, context?: string) => any;
  parseResponse: (data: any) => string;
}

function prependGuideline(context?: string) {
  return context ? `${AI_GUIDELINE_PROMPT}\n${context}` : AI_GUIDELINE_PROMPT;
}

export function getLlmConfig(provider: LlmProvider, apiKey: string): DirectLlmConfig {
  switch (provider) {
    case 'openai':
      return {
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey,
        model: 'gpt-3.5-turbo',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        formatMessages: (messages, newMessage, context) => ({
          model: 'gpt-3.5-turbo',
          messages: [
            ...(context ? [{ role: 'system', content: prependGuideline(context) }] : [{ role: 'system', content: AI_GUIDELINE_PROMPT }]),
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: newMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ''
      };
    case 'gemini':
      return {
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey,
        apiKey,
        headers: {
          'Content-Type': 'application/json'
        },
        formatMessages: (messages, newMessage, context) => ({
          contents: [
            ...(context ? [{ role: 'user', parts: [{ text: prependGuideline(context) }] }] : [{ role: 'user', parts: [{ text: AI_GUIDELINE_PROMPT }] }]),
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: newMessage }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }),
        parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      };
    case 'claude':
      return {
        apiEndpoint: 'https://api.anthropic.com/v1/messages',
        apiKey,
        model: 'claude-3-opus-20240229',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey
        },
        formatMessages: (messages, newMessage, context) => ({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: newMessage }
          ],
          system: prependGuideline(context)
        }),
        parseResponse: (data) => data.content?.[0]?.text || ''
      };
    default:
      throw new Error('Unsupported LLM provider');
  }
} 