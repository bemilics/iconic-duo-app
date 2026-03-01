import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing/Landing'
import Questionnaire from './components/Questionnaire/Questionnaire'
import Dashboard from './components/Dashboard/Dashboard'
import Result from './components/Result/Result'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Usuario A - Cuestionario inicial */}
        <Route path="/start" element={<Questionnaire userType="A" />} />

        {/* Usuario B - Cuestionario desde link compartible */}
        <Route path="/:sessionId" element={<Questionnaire userType="B" />} />

        {/* Dashboard de A con todos sus resultados */}
        <Route path="/:sessionId/dashboard" element={<Dashboard />} />

        {/* Resultado individual de un dúo */}
        <Route path="/:sessionId/result/:resultId" element={<Result />} />
      </Routes>
    </Router>
  )
}

export default App
