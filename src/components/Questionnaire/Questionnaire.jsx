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

      // Crear sesión de cuestionario e iniciar
      questionnaireSession.current = createQuestionnaireSession()
      const firstQuestion = await questionnaireSession.current.getFirstQuestion()

      setCurrentQuestion(firstQuestion)
      setQuestionNumber(firstQuestion.questionNumber)

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
        // Ya completó las 9 preguntas
        if (userType === 'B') {
          // Usuario B - mostrar input de nombre
          setShowNameInput(true)
        } else {
          // Usuario A - generar perfil y crear sesión
          await finishQuestionnaireA()
        }
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

  const finishQuestionnaireA = async () => {
    try {
      setIsLoading(true)

      // Generar perfil con Claude API
      const profile = await questionnaireSession.current.generateProfile()

      // Guardar sesión en Supabase
      const session = await createUserSession(profile)

      // Navegar al dashboard
      navigate(`/${session.sessionId}/dashboard`)

    } catch (err) {
      console.error('Error finishing questionnaire A:', err)
      setError('Hubo un error guardando tu perfil. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  const handleSubmitName = async () => {
    if (!userName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Generar perfil B con Claude API
      const profileB = await questionnaireSession.current.generateProfile()

      // Cruzar con perfil A y generar resultado
      const result = await analyzeDuo(userAProfile.current, profileB)

      // Guardar resultado en Supabase
      const duoResult = await createDuoResult({
        sessionId: sessionId,
        bName: userName.trim(),
        bProfile: profileB,
        result: result
      })

      // Navegar al resultado
      navigate(`/${sessionId}/result/${duoResult.resultId}`)

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
            {isLoading ? 'Generando resultado...' : 'Ver resultado'}
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
