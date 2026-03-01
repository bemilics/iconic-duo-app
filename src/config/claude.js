export const CLAUDE_CONFIG = {
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-6',
  maxTokens: 2048,
  apiUrl: 'https://api.anthropic.com/v1/messages'
}

if (!CLAUDE_CONFIG.apiKey) {
  console.warn('Missing Anthropic API key')
}
