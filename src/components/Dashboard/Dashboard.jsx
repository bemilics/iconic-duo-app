import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [duoResults, setDuoResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    loadDuoResults()
    generateShareLink()

    // TODO: Configurar Supabase Realtime para actualizar automáticamente
  }, [sessionId])

  const loadDuoResults = async () => {
    setIsLoading(true)
    try {
      // TODO: Consultar duo_results desde Supabase por sessionId
      // Mock data por ahora
      setDuoResults([
        {
          id: '1',
          b_name: 'María',
          result: {
            duo_name: 'Los que llegan tarde pero llegan bien'
          }
        }
      ])
    } catch (error) {
      console.error('Error loading duo results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/${sessionId}`
    setShareLink(link)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    // TODO: Mostrar feedback visual
  }

  const handleResultClick = (resultId) => {
    navigate(`/${sessionId}/result/${resultId}`)
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
              Copiar
            </button>
          </div>
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
                key={result.id}
                className="result-item"
                onClick={() => handleResultClick(result.id)}
              >
                <div className="result-name">{result.b_name}</div>
                <div className="result-duo-name">{result.result.duo_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
