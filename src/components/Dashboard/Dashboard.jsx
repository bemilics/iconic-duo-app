import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSessionResults, subscribeToSessionResults, unsubscribe } from '../../services'
import './Dashboard.css'

function Dashboard() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [duoResults, setDuoResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDuoResults()
    generateShareLink()

    // Configurar Supabase Realtime para actualizar automáticamente
    const subscription = subscribeToSessionResults(sessionId, handleNewResult)

    // Cleanup al desmontar
    return () => {
      unsubscribe(subscription)
    }
  }, [sessionId])

  const loadDuoResults = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await getSessionResults(sessionId)
      setDuoResults(results)
    } catch (err) {
      console.error('Error loading duo results:', err)
      setError('No se pudieron cargar los resultados.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/${sessionId}`
    setShareLink(link)
  }

  const handleNewResult = (newResult) => {
    // Agregar nuevo resultado al principio de la lista
    setDuoResults(prev => [newResult, ...prev])
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying link:', err)
    }
  }

  const handleResultClick = (resultId) => {
    navigate(`/${sessionId}/result/${resultId}`)
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={loadDuoResults}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Tus dúos</h1>

        <div className="share-section">
          <p className="share-label">Comparte tu link:</p>
          <div className="share-link-container">
            <input
              type="text"
              className="share-link-input"
              value={shareLink}
              readOnly
            />
            <button className="copy-button" onClick={handleCopyLink}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className="share-hint">
            Cualquier persona que abra este link podrá completar el cuestionario y generar un resultado contigo.
          </p>
          <p className="realtime-hint">
            💫 Los nuevos resultados aparecerán automáticamente (o recarga si no ves cambios)
          </p>
        </div>

        {isLoading ? (
          <div className="loading">Cargando resultados...</div>
        ) : duoResults.length === 0 ? (
          <div className="empty-state">
            <p>Aún no tienes resultados.</p>
            <p className="empty-state-subtitle">
              Comparte tu link para que otros completen el cuestionario.
            </p>
          </div>
        ) : (
          <div className="results-list">
            {duoResults.map((result) => (
              <div
                key={result.resultId}
                className="result-item"
                onClick={() => handleResultClick(result.resultId)}
              >
                <div className="result-name">{result.bName}</div>
                <div className="result-duo-name">{result.duoName}</div>
                {result.culturalReference && (
                  <div className="result-reference">{result.culturalReference}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
