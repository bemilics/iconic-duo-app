/**
 * Servicio base para interactuar con Claude API a través de nuestro backend
 */

/**
 * Realiza una llamada a Claude API a través de nuestro endpoint serverless
 * @param {Object} options - Opciones de la llamada
 * @param {string} options.systemPrompt - System prompt para Claude
 * @param {Array} options.messages - Historial de mensajes
 * @param {number} [options.maxTokens] - Máximo de tokens en la respuesta
 * @returns {Promise<string>} - Respuesta de Claude
 */
export async function callClaude({ systemPrompt, messages, maxTokens = 2048 }) {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemPrompt,
        messages,
        maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Claude API error: ${error.error || response.statusText}`)
    }

    const data = await response.json()

    if (!data.text) {
      throw new Error('No text in response')
    }

    return data.text

  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
  }
}

/**
 * Parsea un JSON de la respuesta de Claude
 * Claude a veces envuelve el JSON en markdown code blocks
 * @param {string} text - Texto que contiene JSON
 * @returns {Object} - Objeto parseado
 */
export function parseJsonFromResponse(text) {
  try {
    // Intentar parsear directamente
    return JSON.parse(text)
  } catch {
    // Si falla, buscar JSON dentro de code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    // Buscar cualquier objeto JSON en el texto
    const objectMatch = text.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    throw new Error('Could not parse JSON from Claude response')
  }
}

/**
 * Extrae pregunta y opciones de la respuesta de Claude
 * @param {string} text - Respuesta de Claude
 * @returns {Object} - { text: string, options: string[] }
 */
export function parseQuestionFromResponse(text) {
  // Buscar pregunta (generalmente termina con ?)
  const lines = text.trim().split('\n').filter(line => line.trim())

  // La pregunta es típicamente la primera línea o párrafo que termina en ?
  let questionText = ''
  let optionsStart = 0

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('?')) {
      questionText = lines[i].trim()
      optionsStart = i + 1
      break
    }
  }

  if (!questionText) {
    // Si no encuentra ?, toma la primera línea no vacía
    questionText = lines[0]
    optionsStart = 1
  }

  // Extraer opciones (generalmente con formato A), B), C) o numeradas)
  const options = []
  const optionPatterns = [
    /^[A-C]\)\s*(.+)$/i,           // A) opción
    /^[A-C]\.\s*(.+)$/i,           // A. opción
    /^[A-C]:\s*(.+)$/i,            // A: opción
    /^\d+\)\s*(.+)$/,              // 1) opción
    /^\d+\.\s*(.+)$/,              // 1. opción
    /^[-•]\s*(.+)$/,               // - opción o • opción
  ]

  for (let i = optionsStart; i < lines.length; i++) {
    const line = lines[i].trim()

    for (const pattern of optionPatterns) {
      const match = line.match(pattern)
      if (match) {
        options.push(match[1].trim())
        break
      }
    }
  }

  // Si no encontró opciones con formato, buscar líneas después de la pregunta
  if (options.length === 0) {
    for (let i = optionsStart; i < Math.min(optionsStart + 3, lines.length); i++) {
      const line = lines[i].trim()
      if (line && line !== questionText) {
        options.push(line)
      }
    }
  }

  return {
    text: questionText,
    options: options.slice(0, 3) // Máximo 3 opciones
  }
}
