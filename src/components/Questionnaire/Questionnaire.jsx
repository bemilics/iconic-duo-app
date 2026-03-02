import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  createQuestionnaireSession,
  getUserSession,
  createUserSession,
  createDuoResult,
  analyzeDuo
} from '../../services'
import './Questionnaire.css'

function Questionnaire({ userType }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [userName, setUserName] = useState('')
  const [error, setError] = useState(null)

  // Usar ref para mantener la sesión de cuestionario entre renders
  const questionnaireSession = useRef(null)
  const userAProfile = useRef(null)

  useEffect(() => {
    initializeQuestionnaire()
  }, [])

  // Guardar progreso después de cada respuesta
  useEffect(() => {
    if (questionnaireSession.current && questionNumber > 0) {
      saveProgress()
    }
  }, [questionNumber])

  const getStorageKey = () => {
    return userType === 'B' && sessionId
      ? `questionnaire-progress-B-${sessionId}`
      : 'questionnaire-progress-A'
  }

  const saveProgress = () => {
    try {
      if (!questionnaireSession.current) return

      const state = questionnaireSession.current.getState()
      const progress = {
        state,
        currentQuestion,
        questionNumber,
        timestamp: Date.now()
      }

      localStorage.setItem(getStorageKey(), JSON.stringify(progress))
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(getStorageKey())
      if (!saved) return null

      const progress = JSON.parse(saved)

      // Verificar que el progreso no sea muy antiguo (más de 24 horas)
      const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60)
      if (hoursSinceLastSave > 24) {
        localStorage.removeItem(getStorageKey())
        return null
      }

      return progress
    } catch (err) {
      console.error('Error loading progress:', err)
      return null
    }
  }

  const clearProgress = () => {
    try {
      localStorage.removeItem(getStorageKey())
    } catch (err) {
      console.error('Error clearing progress:', err)
    }
  }

  const initializeQuestionnaire = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Si es usuario B, verificar que existe la sesión y cargar perfil de A
      if (userType === 'B' && sessionId) {
        const session = await getUserSession(sessionId)
        if (!session) {
          setError('Esta sesión no existe o ha expirado.')
          return
        }
        userAProfile.current = session.profile
      }

      // Intentar cargar progreso guardado
      const savedProgress = loadProgress()

      if (savedProgress && savedProgress.state && savedProgress.questionNumber > 0) {
        // Restaurar sesión desde el progreso guardado
        questionnaireSession.current = createQuestionnaireSession()
        questionnaireSession.current.restore(savedProgress.state)

        setCurrentQuestion(savedProgress.currentQuestion)
        setQuestionNumber(savedProgress.questionNumber)

        console.log(`Progreso restaurado desde pregunta ${savedProgress.questionNumber}`)
      } else {
        // Crear nueva sesión de cuestionario e iniciar
        questionnaireSession.current = createQuestionnaireSession()
        const firstQuestion = await questionnaireSession.current.getFirstQuestion()

        setCurrentQuestion(firstQuestion)
        setQuestionNumber(firstQuestion.questionNumber)
      }

    } catch (err) {
      console.error('Error initializing questionnaire:', err)
      setError('Hubo un error al cargar el cuestionario. Por favor recarga la página.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer) => {
    setIsLoading(true)
    setError(null)

    try {
      // Enviar respuesta y obtener siguiente pregunta
      const nextQuestion = await questionnaireSession.current.submitAnswer(answer)

      if (!nextQuestion) {
        // Ya completó las 9 preguntas - mostrar input de nombre para A y B
        setShowNameInput(true)
      } else {
        // Mostrar siguiente pregunta
        setCurrentQuestion(nextQuestion)
        setQuestionNumber(nextQuestion.questionNumber)
      }

    } catch (err) {
      console.error('Error handling answer:', err)
      setError('Hubo un error procesando tu respuesta. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitName = async () => {
    if (!userName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      if (userType === 'A') {
        // Usuario A - crear su sesión con nombre
        const profile = await questionnaireSession.current.generateProfile()

        // Agregar nombre al perfil
        profile.name = userName.trim()

        // Guardar sesión en Supabase
        const session = await createUserSession(profile)

        // Guardar session ID en localStorage para auto-redirect
        localStorage.setItem('iconic-duo-session-id', session.sessionId)

        // Limpiar progreso del cuestionario
        clearProgress()

        // Navegar al dashboard
        navigate(`/${session.sessionId}/dashboard`)

      } else {
        // Usuario B - crear sesión y resultado
        const profileB = await questionnaireSession.current.generateProfile()

        // Agregar nombre al perfil
        profileB.name = userName.trim()

        // Crear sesión para Usuario B (para que tenga su propio dashboard)
        const sessionB = await createUserSession(profileB)

        // Guardar session ID en localStorage para auto-redirect
        localStorage.setItem('iconic-duo-session-id', sessionB.sessionId)

        // Cruzar con perfil A y generar resultado
        const result = await analyzeDuo(userAProfile.current, profileB)

        // Guardar resultado para Usuario A (en su dashboard)
        await createDuoResult({
          sessionId: sessionId, // sesión de A
          bName: userName.trim(),
          bProfile: profileB,
          result: result
        })

        // Guardar resultado para Usuario B (en su dashboard)
        // Obtener nombre de A desde la sesión
        const sessionA = await getUserSession(sessionId)
        const userAName = sessionA.profile.name || 'Otro usuario'

        await createDuoResult({
          sessionId: sessionB.sessionId, // sesión de B
          bName: userAName,
          bProfile: userAProfile.current,
          result: result
        })

        // Limpiar progreso del cuestionario
        clearProgress()

        // Navegar al dashboard de B
        navigate(`/${sessionB.sessionId}/dashboard`)
      }

    } catch (err) {
      console.error('Error submitting name:', err)
      setError('Hubo un error generando el resultado. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  // Pantalla de error
  if (error && !showNameInput && questionNumber === 0) {
    return (
      <div className="questionnaire">
        <div className="questionnaire-content">
          <div className="error-message">
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de input de nombre (Usuario B)
  if (showNameInput) {
    return (
      <div className="questionnaire">
        <div className="questionnaire-content">
          <h2 className="questionnaire-title">Última cosa</h2>
          <p className="questionnaire-subtitle">¿Cómo te llamas?</p>
          <input
            type="text"
            className="name-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Tu nombre"
            disabled={isLoading}
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
          <button
            className="submit-button"
            onClick={handleSubmitName}
            disabled={isLoading || !userName.trim()}
          >
            {isLoading
              ? (userType === 'A' ? 'Creando tu perfil...' : 'Generando resultado...')
              : (userType === 'A' ? 'Ir al dashboard' : 'Ver resultado')
            }
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de cuestionario
  return (
    <div className="questionnaire">
      <div className="questionnaire-content">
        <div className="question-progress">
          {questionNumber} / 9
        </div>

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : currentQuestion ? (
          <>
            <h2 className="question-text">{currentQuestion.text}</h2>
            {error && <p className="error-text">{error}</p>}
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswer(option)}
                  disabled={isLoading}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default Questionnaire
