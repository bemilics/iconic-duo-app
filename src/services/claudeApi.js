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
 * @returns {Object} - { text: string, options: string[], isValid: boolean }
 */
export function parseQuestionFromResponse(text) {
  // Limpiar el texto de marcadores innecesarios
  const cleanText = text
    .replace(/```/g, '')           // Eliminar code blocks
    .replace(/\*\*/g, '')          // Eliminar bold markdown
    .replace(/\_\_/g, '')          // Eliminar italic markdown
    .trim()

  const lines = cleanText.split('\n').filter(line => line.trim())

  // Buscar la pregunta - debe terminar con ?
  let questionText = ''
  let optionsStart = 0

  // Estrategia 1: Buscar la primera línea que termina con ?
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.endsWith('?')) {
      questionText = line
      optionsStart = i + 1
      break
    }
  }

  // Estrategia 2: Si no hay ?, buscar una línea larga (probable pregunta)
  if (!questionText) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim()
      if (line.length > 20) { // Preguntas típicamente > 20 caracteres
        questionText = line
        optionsStart = i + 1
        break
      }
    }
  }

  // Estrategia 3: Fallback - primera línea
  if (!questionText && lines.length > 0) {
    questionText = lines[0].trim()
    optionsStart = 1
  }

  // Extraer opciones con múltiples patrones
  const options = []
  const optionPatterns = [
    /^[A-C]\)\s*(.+)$/i,           // A) opción
    /^[A-C]\.\s*(.+)$/i,           // A. opción
    /^[A-C]:\s*(.+)$/i,            // A: opción
    /^[A-C]\s+[-–—]\s*(.+)$/i,     // A - opción
    /^\d+\)\s*(.+)$/,              // 1) opción
    /^\d+\.\s*(.+)$/,              // 1. opción
    /^[-•*]\s*(.+)$/,              // - opción, • opción, * opción
    /^[►▸→]\s*(.+)$/,              // → opción
  ]

  // Buscar opciones desde optionsStart hasta el final
  for (let i = optionsStart; i < lines.length; i++) {
    const line = lines[i].trim()

    // Ignorar líneas muy cortas (probablemente no son opciones)
    if (line.length < 3) continue

    let matched = false
    for (const pattern of optionPatterns) {
      const match = line.match(pattern)
      if (match) {
        const optionText = match[1].trim()
        if (optionText.length > 0) {
          options.push(optionText)
          matched = true
          break
        }
      }
    }

    // Si no coincide con ningún patrón pero parece una opción válida
    if (!matched && options.length < 3) {
      // Evitar añadir la pregunta de nuevo
      if (line !== questionText && !line.startsWith('¿') && line.length > 5) {
        options.push(line)
      }
    }

    // Máximo 3 opciones
    if (options.length >= 3) break
  }

  // Si solo encontramos 1 opción, intentar buscar mejor
  if (options.length === 1) {
    const remainingLines = lines.slice(optionsStart).filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 5 &&
             trimmed !== questionText &&
             !options.includes(trimmed)
    })

    // Tomar las siguientes 1-2 líneas como opciones
    for (let i = 0; i < Math.min(2, remainingLines.length); i++) {
      options.push(remainingLines[i].trim())
    }
  }

  // Validar que tenemos una pregunta y 2-3 opciones
  const isValid = questionText.length > 0 && options.length >= 2 && options.length <= 3

  return {
    text: questionText,
    options: options.slice(0, 3), // Asegurar máximo 3
    isValid: isValid
  }
}

/**
 * Valida que una pregunta parseada sea válida para mostrar
 * @param {Object} question - Pregunta parseada
 * @returns {boolean}
 */
export function validateQuestion(question) {
  if (!question || !question.text || !question.options) {
    return false
  }

  // Debe tener texto de pregunta no vacío
  if (question.text.trim().length === 0) {
    return false
  }

  // Debe tener 2-3 opciones
  if (question.options.length < 2 || question.options.length > 3) {
    return false
  }

  // Todas las opciones deben tener texto
  for (const option of question.options) {
    if (!option || option.trim().length === 0) {
      return false
    }
  }

  return true
}
