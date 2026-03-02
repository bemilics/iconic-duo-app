import { callClaude, parseJsonFromResponse, parseQuestionFromResponse } from './claudeApi'
import { QUESTIONNAIRE_SYSTEM_PROMPT } from '../config/prompts'

/**
 * Servicio para gestionar el cuestionario dinámico de 9 preguntas
 */

/**
 * Clase para manejar una sesión de cuestionario
 */
export class QuestionnaireSession {
  constructor() {
    this.messages = []
    this.currentQuestionNumber = 0
  }

  /**
   * Obtiene la primera pregunta del cuestionario
   * @returns {Promise<Object>} - { text: string, options: string[], questionNumber: number }
   */
  async getFirstQuestion() {
    try {
      // Agregar mensaje inicial del usuario pidiendo la primera pregunta
      this.messages.push({
        role: 'user',
        content: 'Empecemos. ¿Cuál es la primera pregunta?'
      })

      const response = await callClaude({
        systemPrompt: QUESTIONNAIRE_SYSTEM_PROMPT,
        messages: this.messages
      })

      // Agregar respuesta de Claude al historial
      this.messages.push({
        role: 'assistant',
        content: response
      })

      this.currentQuestionNumber = 1

      // Parsear pregunta y opciones
      const question = parseQuestionFromResponse(response)

      return {
        ...question,
        questionNumber: this.currentQuestionNumber
      }

    } catch (error) {
      console.error('Error getting first question:', error)
      throw error
    }
  }

  /**
   * Envía una respuesta y obtiene la siguiente pregunta
   * @param {string} answer - Respuesta del usuario a la pregunta actual
   * @returns {Promise<Object|null>} - Siguiente pregunta o null si es la última
   */
  async submitAnswer(answer) {
    try {
      // Agregar respuesta del usuario al historial
      this.messages.push({
        role: 'user',
        content: answer
      })

      // Si ya completó 9 preguntas, generar perfil
      if (this.currentQuestionNumber >= 9) {
        return null // Señal de que terminó
      }

      // Obtener siguiente pregunta
      const response = await callClaude({
        systemPrompt: QUESTIONNAIRE_SYSTEM_PROMPT,
        messages: this.messages
      })

      // Agregar respuesta de Claude al historial
      this.messages.push({
        role: 'assistant',
        content: response
      })

      this.currentQuestionNumber++

      // Parsear pregunta y opciones
      const question = parseQuestionFromResponse(response)

      return {
        ...question,
        questionNumber: this.currentQuestionNumber
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      throw error
    }
  }

  /**
   * Genera el perfil interno después de las 9 respuestas
   * @returns {Promise<Object>} - Perfil JSON del usuario
   */
  async generateProfile() {
    try {
      // Pedir a Claude que genere el perfil
      this.messages.push({
        role: 'user',
        content: 'He completado las 9 preguntas. Por favor genera mi perfil.'
      })

      const response = await callClaude({
        systemPrompt: QUESTIONNAIRE_SYSTEM_PROMPT,
        messages: this.messages,
        maxTokens: 1024
      })

      // Parsear JSON del perfil
      const profile = parseJsonFromResponse(response)

      // Validar que tenga los campos requeridos
      const requiredFields = [
        'archetype',
        'core_trait',
        'relational_role',
        'conflict_style',
        'narrative_tendency',
        'cultural_fingerprint',
        'raw_notes'
      ]

      for (const field of requiredFields) {
        if (!profile[field]) {
          throw new Error(`Missing required field in profile: ${field}`)
        }
      }

      return profile

    } catch (error) {
      console.error('Error generating profile:', error)
      throw error
    }
  }

  /**
   * Obtiene el número de pregunta actual
   * @returns {number}
   */
  getCurrentQuestionNumber() {
    return this.currentQuestionNumber
  }

  /**
   * Obtiene el historial completo de mensajes
   * @returns {Array}
   */
  getMessages() {
    return this.messages
  }

  /**
   * Restaura una sesión desde un estado guardado
   * @param {Object} state - Estado guardado { messages, currentQuestionNumber }
   */
  restore(state) {
    this.messages = state.messages || []
    this.currentQuestionNumber = state.currentQuestionNumber || 0
  }

  /**
   * Obtiene el estado actual para guardar
   * @returns {Object}
   */
  getState() {
    return {
      messages: this.messages,
      currentQuestionNumber: this.currentQuestionNumber
    }
  }
}

/**
 * Crea una nueva sesión de cuestionario
 * @returns {QuestionnaireSession}
 */
export function createQuestionnaireSession() {
  return new QuestionnaireSession()
}
