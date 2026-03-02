-- iconic-duo app - Initial Schema
-- Tablas para gestionar sesiones de usuarios y resultados de dúos

-- ========================================
-- TABLA: user_sessions
-- ========================================
-- Almacena el perfil de Usuario A (quien inicia y comparte el link)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por id
CREATE INDEX idx_user_sessions_id ON user_sessions(id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at DESC);

-- ========================================
-- TABLA: duo_results
-- ========================================
-- Almacena cada resultado de dúo (A + B)
CREATE TABLE IF NOT EXISTS duo_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  b_name TEXT NOT NULL,
  b_profile JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_duo_results_session_id ON duo_results(session_id);
CREATE INDEX idx_duo_results_created_at ON duo_results(created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Habilitar RLS en ambas tablas
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE duo_results ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS: user_sessions
-- ========================================

-- Permitir a cualquiera crear una sesión (Usuario A inicia el cuestionario)
CREATE POLICY "Permitir crear sesiones"
  ON user_sessions
  FOR INSERT
  WITH CHECK (true);

-- Permitir a cualquiera leer sesiones (Usuario B necesita el perfil de A)
CREATE POLICY "Permitir leer sesiones"
  ON user_sessions
  FOR SELECT
  USING (true);

-- ========================================
-- POLÍTICAS: duo_results
-- ========================================

-- Permitir a cualquiera crear resultados (Usuario B completa el cuestionario)
CREATE POLICY "Permitir crear resultados"
  ON duo_results
  FOR INSERT
  WITH CHECK (true);

-- Permitir a cualquiera leer resultados (Usuario A ve su dashboard, Usuario B ve su resultado)
CREATE POLICY "Permitir leer resultados"
  ON duo_results
  FOR SELECT
  USING (true);

-- ========================================
-- COMENTARIOS EN LAS TABLAS
-- ========================================

COMMENT ON TABLE user_sessions IS 'Almacena el perfil de Usuario A y sirve como base para el link compartible';
COMMENT ON COLUMN user_sessions.id IS 'ID único de sesión - también es el sessionId en la URL';
COMMENT ON COLUMN user_sessions.profile IS 'Perfil interno generado por Claude API después de las 9 preguntas';

COMMENT ON TABLE duo_results IS 'Almacena cada resultado de dúo generado (A + B)';
COMMENT ON COLUMN duo_results.session_id IS 'Referencia al user_session (Usuario A)';
COMMENT ON COLUMN duo_results.b_name IS 'Nombre ingresado por Usuario B al finalizar el cuestionario';
COMMENT ON COLUMN duo_results.b_profile IS 'Perfil interno de Usuario B generado por Claude API';
COMMENT ON COLUMN duo_results.result IS 'Resultado completo del análisis de dúo con las 7 secciones';
