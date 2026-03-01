import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './Result.css'

function Result() {
  const { sessionId, resultId } = useParams()
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadResult()
  }, [resultId])

  const loadResult = async () => {
    setIsLoading(true)
    try {
      // TODO: Cargar resultado desde Supabase
      // Mock data por ahora
      setResult({
        duo_name: 'Los que llegan tarde pero llegan bien',
        cultural_reference: {
          reference: 'Joel y Ellie de The Last of Us',
          explanation: 'Uno carga la experiencia, el otro carga el futuro'
        },
        dynamic: 'Uno genera velocidad, el otro genera dirección. El problema es que raramente están de acuerdo sobre cuándo ir rápido y hacia dónde. Lo que los sostiene es que los dos lo saben y ninguno lo dice.',
        individual_analysis: {
          person_a: {
            archetype_name: 'El que llega tarde con la respuesta correcta',
            role_in_duo: 'Aporta claridad cuando ya todo el mundo tomó una decisión'
          },
          person_b: {
            archetype_name: 'La que ya lo sabía pero esperó que lo descubrieras solo',
            role_in_duo: 'Mantiene el rumbo sin forzar el camino'
          }
        },
        green_flags: [
          'Como dúo generan una energía tan específica que el resto del grupo sabe que algo bueno está por pasar',
          'Tienen una forma de resolver problemas que parece caótica desde afuera pero funciona perfectamente para ellos'
        ],
        red_flags: [
          'Juntos tienen tanta claridad sobre ciertas cosas que pueden volverse difíciles de convencer desde afuera',
          'Como dúo pueden generar una burbuja tan cómoda que el resto del mundo se siente como ruido'
        ],
        probable_arc: 'En algún momento van a terminar siendo los que resuelven algo que nadie más quería resolver. Y van a disfrutarlo más de lo que admiten.'
      })
    } catch (error) {
      console.error('Error loading result:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    // TODO: Generar imagen compartible
    console.log('Compartir resultado')
  }

  if (isLoading) {
    return (
      <div className="result">
        <div className="loading">Cargando resultado...</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="result">
        <div className="error">No se encontró el resultado</div>
      </div>
    )
  }

  return (
    <div className="result">
      <div className="result-content">
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
