-- iconic-duo app - Funciones útiles
-- Funciones de base de datos para operaciones comunes

-- ========================================
-- FUNCIÓN: Obtener todos los resultados de una sesión
-- ========================================
-- Devuelve todos los dúos asociados a una sesión de Usuario A
-- Ordenados por fecha de creación (más reciente primero)

CREATE OR REPLACE FUNCTION get_session_results(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  b_name TEXT,
  duo_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.id,
    dr.b_name,
    dr.result->>'duo_name' as duo_name,
    dr.created_at
  FROM duo_results dr
  WHERE dr.session_id = p_session_id
  ORDER BY dr.created_at DESC;
END;
$$;

-- ========================================
-- FUNCIÓN: Contar resultados de una sesión
-- ========================================
-- Devuelve el número total de dúos generados para una sesión

CREATE OR REPLACE FUNCTION count_session_results(p_session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO result_count
  FROM duo_results
  WHERE session_id = p_session_id;

  RETURN result_count;
END;
$$;

-- ========================================
-- COMENTARIOS EN LAS FUNCIONES
-- ========================================

COMMENT ON FUNCTION get_session_results(UUID) IS 'Obtiene todos los resultados de dúo para una sesión dada, ordenados por fecha';
COMMENT ON FUNCTION count_session_results(UUID) IS 'Cuenta el número total de dúos generados para una sesión';
