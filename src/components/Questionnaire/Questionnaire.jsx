import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Questionnaire.css'

function Questionnaire({ userType }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Si es usuario B, verificar que existe la sesión
    if (userType === 'B' && sessionId) {
      // TODO: Verificar sesión en Supabase
      console.log('Verificando sesión:', sessionId)
    }

    // Cargar primera pregunta
    loadFirstQuestion()
  }, [])

  const loadFirstQuestion = async () => {
    setIsLoading(true)
    try {
      // TODO: Llamar a Claude API para obtener primera pregunta
      // Por ahora, mock
      setCurrentQuestion({
        text: '¿Qué hacés cuando una película que amás tiene un final malo?',
        options: [
          'Lo acepto — el final forma parte de la obra',
          'Lo ignoro mentalmente y me quedo con la versión que prefiero'
        ]
      })
    } catch (error) {
      console.error('Error loading question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer) => {
    setIsLoading(true)

    try {
      // Agregar respuesta al historial
      const newHistory = [
        ...conversationHistory,
        { question: currentQuestion.text, answer }
      ]
      setConversationHistory(newHistory)

      if (questionNumber === 9) {
        // Última pregunta - mostrar input de nombre para usuario B
        if (userType === 'B') {
          setShowNameInput(true)
        } else {
          // Usuario A - generar perfil y crear sesión
          await finishQuestionnaireA(newHistory)
        }
      } else {
        // Cargar siguiente pregunta
        setQuestionNumber(questionNumber + 1)
        // TODO: Llamar a Claude API con el historial para obtener siguiente pregunta
        // Por ahora, mock
        setCurrentQuestion({
          text: 'Pregunta ' + (questionNumber + 1),
          options: ['Opción A', 'Opción B', 'Opción C']
        })
      }
    } catch (error) {
      console.error('Error handling answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const finishQuestionnaireA = async (history) => {
    try {
      // TODO: Generar perfil con Claude API
      // TODO: Guardar en Supabase user_sessions
      // TODO: Navegar a dashboard con sessionId
      console.log('Finalizando cuestionario A')
    } catch (error) {
      console.error('Error finishing questionnaire A:', error)
    }
  }

  const handleSubmitName = async () => {
    if (!userName.trim()) return

    setIsLoading(true)
    try {
      // TODO: Generar perfil B con Claude API
      // TODO: Cruzar con perfil A y generar resultado
      // TODO: Guardar en Supabase duo_results
      // TODO: Navegar a resultado
      console.log('Generando resultado para:', userName)
    } catch (error) {
      console.error('Error submitting name:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
          />
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
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswer(option)}
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
