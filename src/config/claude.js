/**
 * Configuración de Claude API
 * Las llamadas se hacen a través de /api/claude (serverless function)
 * La API key se maneja en el backend por seguridad
 */

export const CLAUDE_CONFIG = {
  // Modelo usado en el backend
  model: 'claude-sonnet-4-20250514',
  // Tokens por defecto
  maxTokens: 2048
}
