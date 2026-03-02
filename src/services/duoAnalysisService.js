import { callClaude, parseJsonFromResponse } from './claudeApi'
import { DUO_ANALYSIS_SYSTEM_PROMPT } from '../config/prompts'

/**
 * Servicio para analizar la dinámica entre dos personas
 */

/**
 * Genera el análisis de dúo cruzando los perfiles de A y B
 * @param {Object} profileA - Perfil interno de Usuario A
 * @param {Object} profileB - Perfil interno de Usuario B
 * @returns {Promise<Object>} - Resultado del análisis con las 7 secciones
 */
export async function analyzeDuo(profileA, profileB) {
  try {
    // Construir el mensaje con ambos perfiles
    const userMessage = `Analiza la dinámica entre estas dos personas:

PERSONA A:
${JSON.stringify(profileA, null, 2)}

PERSONA B:
${JSON.stringify(profileB, null, 2)}

Por favor genera el análisis del dúo en formato JSON.`

    const response = await callClaude({
      systemPrompt: DUO_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      maxTokens: 2048 // Más tokens para el análisis completo
    })

    // Parsear el JSON de resultado
    const result = parseJsonFromResponse(response)

    // Validar estructura del resultado
    validateDuoResult(result)

    return result

  } catch (error) {
    console.error('Error analyzing duo:', error)
    throw error
  }
}

/**
 * Valida que el resultado tenga la estructura correcta
 * @param {Object} result - Resultado a validar
 * @throws {Error} Si falta algún campo requerido
 */
function validateDuoResult(result) {
  // Validar campos de primer nivel
  const requiredTopLevel = [
    'duo_name',
    'cultural_reference',
    'dynamic',
    'individual_analysis',
    'green_flags',
    'red_flags',
    'probable_arc'
  ]

  for (const field of requiredTopLevel) {
    if (!result[field]) {
      throw new Error(`Missing required field in duo result: ${field}`)
    }
  }

  // Validar cultural_reference
  if (!result.cultural_reference.reference || !result.cultural_reference.explanation) {
    throw new Error('Invalid cultural_reference structure')
  }

  // Validar individual_analysis
  if (!result.individual_analysis.person_a || !result.individual_analysis.person_b) {
    throw new Error('Invalid individual_analysis structure')
  }

  if (!result.individual_analysis.person_a.archetype_name ||
      !result.individual_analysis.person_a.role_in_duo) {
    throw new Error('Invalid person_a analysis')
  }

  if (!result.individual_analysis.person_b.archetype_name ||
      !result.individual_analysis.person_b.role_in_duo) {
    throw new Error('Invalid person_b analysis')
  }

  // Validar green_flags y red_flags
  if (!Array.isArray(result.green_flags) || result.green_flags.length !== 2) {
    throw new Error('green_flags must be an array of 2 elements')
  }

  if (!Array.isArray(result.red_flags) || result.red_flags.length !== 2) {
    throw new Error('red_flags must be an array of 2 elements')
  }

  // Validar que no haya strings vacíos
  for (const flag of result.green_flags) {
    if (!flag || typeof flag !== 'string') {
      throw new Error('Invalid green flag')
    }
  }

  for (const flag of result.red_flags) {
    if (!flag || typeof flag !== 'string') {
      throw new Error('Invalid red flag')
    }
  }
}

/**
 * Genera un preview del resultado (para mostrar en el dashboard)
 * @param {Object} result - Resultado completo del análisis
 * @returns {Object} - { duo_name, cultural_reference_short }
 */
export function getResultPreview(result) {
  return {
    duo_name: result.duo_name,
    cultural_reference_short: result.cultural_reference.reference
  }
}
