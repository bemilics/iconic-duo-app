import { callClaude, parseJsonFromResponse, parseQuestionFromResponse, validateQuestion } from './claudeApi'
import { QUESTIONNAIRE_SYSTEM_PROMPT } from '../config/prompts'

const MAX_RETRY_ATTEMPTS = 2

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
    let attempts = 0

    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        // Solo agregar el mensaje inicial en el primer intento
        if (attempts === 0) {
          this.messages.push({
            role: 'user',
            content: 'Empecemos. ¿Cuál es la primera pregunta?'
          })
        } else {
          // En reintentos, pedir que reformatee la pregunta
          this.messages.push({
            role: 'user',
            content: 'Por favor reformatea la pregunta con exactamente 2 o 3 opciones claramente separadas.'
          })
        }

        const response = await callClaude({
          systemPrompt: QUESTIONNAIRE_SYSTEM_PROMPT,
          messages: this.messages
        })

        // Agregar respuesta de Claude al historial
        this.messages.push({
          role: 'assistant',
          content: response
        })

        // Parsear pregunta y opciones
        const question = parseQuestionFromResponse(response)

        // Validar que la pregunta sea válida
        if (validateQuestion(question)) {
          this.currentQuestionNumber = 1

          return {
            ...question,
            questionNumber: this.currentQuestionNumber
          }
        }

        console.warn(`Question parsing attempt ${attempts + 1} failed validation:`, question)
        attempts++

        // Si no es válida, quitar los últimos 2 mensajes para reintentar
        if (attempts < MAX_RETRY_ATTEMPTS) {
          this.messages.pop() // Quitar respuesta de Claude
          this.messages.pop() // Quitar pregunta del usuario
        }

      } catch (error) {
        console.error('Error getting first question:', error)
        attempts++

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          throw error
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw new Error('No se pudo obtener una pregunta válida después de varios intentos')
  }

  /**
   * Envía una respuesta y obtiene la siguiente pregunta
   * @param {string} answer - Respuesta del usuario a la pregunta actual
   * @returns {Promise<Object|null>} - Siguiente pregunta o null si es la última
   */
  async submitAnswer(answer) {
    let attempts = 0
    let answerSubmitted = false

    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        // Solo agregar la respuesta del usuario en el primer intento
        if (!answerSubmitted) {
          this.messages.push({
            role: 'user',
            content: answer
          })
          answerSubmitted = true
        } else {
          // En reintentos, pedir reformatear
          this.messages.push({
            role: 'user',
            content: 'Por favor reformatea la pregunta con exactamente 2 o 3 opciones claramente separadas.'
          })
        }

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

        // Parsear pregunta y opciones
        const question = parseQuestionFromResponse(response)

        // Validar que la pregunta sea válida
        if (validateQuestion(question)) {
          this.currentQuestionNumber++

          return {
            ...question,
            questionNumber: this.currentQuestionNumber
          }
        }

        console.warn(`Question parsing attempt ${attempts + 1} failed validation:`, question)
        attempts++

        // Si no es válida, quitar los últimos 2 mensajes para reintentar
        if (attempts < MAX_RETRY_ATTEMPTS) {
          this.messages.pop() // Quitar respuesta de Claude
          this.messages.pop() // Quitar mensaje del usuario
        }

      } catch (error) {
        console.error('Error submitting answer:', error)
        attempts++

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          throw error
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw new Error('No se pudo obtener una pregunta válida después de varios intentos')
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
