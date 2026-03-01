import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/start')
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
      </div>
    </div>
  )
}

export default Landing
