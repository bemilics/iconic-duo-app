import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si el usuario ya tiene una sesión guardada
    const savedSessionId = localStorage.getItem('iconic-duo-session-id')
    if (savedSessionId) {
      // Redirigir automáticamente al dashboard
      navigate(`/${savedSessionId}/dashboard`)
    }
  }, [navigate])

  const handleStart = () => {
    navigate('/start')
  }

  const handleGoToDashboard = () => {
    const savedSessionId = localStorage.getItem('iconic-duo-session-id')
    if (savedSessionId) {
      navigate(`/${savedSessionId}/dashboard`)
    }
  }

  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">iconic-duo</h1>
        <p className="landing-subtitle">
          Descubre la dinámica entre dos personas a través de cultura y entretenimiento
        </p>
        <button className="landing-button" onClick={handleStart}>
          Empezar
        </button>

        {localStorage.getItem('iconic-duo-session-id') && (
          <button className="secondary-button" onClick={handleGoToDashboard}>
            Ir a mi dashboard
          </button>
        )}
      </div>
    </div>
  )
}

export default Landing
