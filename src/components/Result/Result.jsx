import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDuoResult } from '../../services'
import './Result.css'

function Result() {
  const { sessionId, resultId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadResult()
  }, [resultId])

  const loadResult = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const duoResult = await getDuoResult(resultId)

      if (!duoResult) {
        setError('Este resultado no existe o ha sido eliminado.')
        return
      }

      setResult(duoResult.result)

    } catch (err) {
      console.error('Error loading result:', err)
      setError('No se pudo cargar el resultado.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    // TODO: Generar imagen compartible
    console.log('Compartir resultado')
    alert('La funcionalidad de compartir como imagen está en desarrollo.')
  }

  const handleBackToDashboard = () => {
    navigate(`/${sessionId}/dashboard`)
  }

  if (isLoading) {
    return (
      <div className="result">
        <div className="loading">Cargando resultado...</div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="result">
        <div className="error-message">
          <p>{error || 'No se encontró el resultado'}</p>
          <button
            className="retry-button"
            onClick={() => window.history.back()}
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="result">
      <div className="result-content">
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Volver al dashboard
        </button>

        <div className="result-section">
          <h1 className="duo-name">{result.duo_name}</h1>
        </div>

        <div className="result-section">
          <h2 className="section-title">Referencia cultural</h2>
          <p className="cultural-reference">{result.cultural_reference.reference}</p>
          <p className="cultural-explanation">{result.cultural_reference.explanation}</p>
        </div>

        <div className="result-section">
          <h2 className="section-title">Dinámica</h2>
          <p className="dynamic-text">{result.dynamic}</p>
        </div>

        <div className="result-section">
          <h2 className="section-title">Análisis individual</h2>
          <div className="individual-analysis">
            <div className="person-analysis">
              <h3 className="archetype-name">{result.individual_analysis.person_a.archetype_name}</h3>
              <p className="role-text">{result.individual_analysis.person_a.role_in_duo}</p>
            </div>
            <div className="person-analysis">
              <h3 className="archetype-name">{result.individual_analysis.person_b.archetype_name}</h3>
              <p className="role-text">{result.individual_analysis.person_b.role_in_duo}</p>
            </div>
          </div>
        </div>

        <div className="result-section">
          <h2 className="section-title">Green flags</h2>
          <ul className="flags-list green">
            {result.green_flags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>

        <div className="result-section">
          <h2 className="section-title">Red flags</h2>
          <ul className="flags-list red">
            {result.red_flags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>

        <div className="result-section">
          <h2 className="section-title">Arco probable</h2>
          <p className="arc-text">{result.probable_arc}</p>
        </div>

        <button className="share-button" onClick={handleShare}>
          Compartir resultado
        </button>
      </div>
    </div>
  )
}

export default Result
