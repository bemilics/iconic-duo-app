import { supabase } from '../config/supabase'

/**
 * Servicio para gestionar datos en Supabase
 */

// ========================================
// USER SESSIONS (Usuario A)
// ========================================

/**
 * Crea una nueva sesión de Usuario A
 * @param {Object} profile - Perfil interno generado por Claude
 * @returns {Promise<Object>} - { sessionId, profile, createdAt }
 */
export async function createUserSession(profile) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([{ profile }])
      .select()
      .single()

    if (error) throw error

    return {
      sessionId: data.id,
      profile: data.profile,
      createdAt: data.created_at
    }

  } catch (error) {
    console.error('Error creating user session:', error)
    throw new Error('No se pudo crear la sesión. Por favor intenta de nuevo.')
  }
}

/**
 * Obtiene una sesión de Usuario A por su ID
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Object|null>} - { sessionId, profile, createdAt } o null si no existe
 */
export async function getUserSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw error
    }

    return {
      sessionId: data.id,
      profile: data.profile,
      createdAt: data.created_at
    }

  } catch (error) {
    console.error('Error getting user session:', error)
    throw new Error('No se pudo cargar la sesión.')
  }
}

/**
 * Verifica si una sesión existe
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<boolean>}
 */
export async function sessionExists(sessionId) {
  const session = await getUserSession(sessionId)
  return session !== null
}

// ========================================
// DUO RESULTS
// ========================================

/**
 * Crea un nuevo resultado de dúo
 * @param {Object} params
 * @param {string} params.sessionId - UUID de la sesión de Usuario A
 * @param {string} params.bName - Nombre de Usuario B
 * @param {Object} params.bProfile - Perfil interno de Usuario B
 * @param {Object} params.result - Resultado completo del análisis
 * @returns {Promise<Object>} - { resultId, sessionId, bName, result, createdAt }
 */
export async function createDuoResult({ sessionId, bName, bProfile, result }) {
  try {
    const { data, error } = await supabase
      .from('duo_results')
      .insert([{
        session_id: sessionId,
        b_name: bName,
        b_profile: bProfile,
        result
      }])
      .select()
      .single()

    if (error) throw error

    return {
      resultId: data.id,
      sessionId: data.session_id,
      bName: data.b_name,
      bProfile: data.b_profile,
      result: data.result,
      createdAt: data.created_at
    }

  } catch (error) {
    console.error('Error creating duo result:', error)
    throw new Error('No se pudo guardar el resultado. Por favor intenta de nuevo.')
  }
}

/**
 * Obtiene un resultado de dúo por su ID
 * @param {string} resultId - UUID del resultado
 * @returns {Promise<Object|null>} - Resultado completo o null si no existe
 */
export async function getDuoResult(resultId) {
  try {
    const { data, error } = await supabase
      .from('duo_results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return {
      resultId: data.id,
      sessionId: data.session_id,
      bName: data.b_name,
      bProfile: data.b_profile,
      result: data.result,
      createdAt: data.created_at
    }

  } catch (error) {
    console.error('Error getting duo result:', error)
    throw new Error('No se pudo cargar el resultado.')
  }
}

/**
 * Obtiene todos los resultados de una sesión (para el dashboard de A)
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Array>} - Array de resultados con preview
 */
export async function getSessionResults(sessionId) {
  try {
    const { data, error } = await supabase
      .from('duo_results')
      .select('id, b_name, result, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Mapear a formato más amigable con solo los campos necesarios para preview
    return data.map(item => ({
      resultId: item.id,
      bName: item.b_name,
      duoName: item.result.duo_name,
      culturalReference: item.result.cultural_reference?.reference || '',
      createdAt: item.created_at
    }))

  } catch (error) {
    console.error('Error getting session results:', error)
    throw new Error('No se pudieron cargar los resultados.')
  }
}

/**
 * Cuenta los resultados de una sesión
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<number>}
 */
export async function countSessionResults(sessionId) {
  try {
    const { count, error } = await supabase
      .from('duo_results')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)

    if (error) throw error

    return count || 0

  } catch (error) {
    console.error('Error counting session results:', error)
    return 0
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

/**
 * Suscribe a cambios en tiempo real de una sesión
 * @param {string} sessionId - UUID de la sesión
 * @param {Function} onNewResult - Callback cuando se crea un nuevo resultado
 * @returns {Object} - Subscription object (llamar .unsubscribe() para cancelar)
 */
export function subscribeToSessionResults(sessionId, onNewResult) {
  const channel = supabase
    .channel(`duo_results:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'duo_results',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        // Transformar payload al formato esperado
        const newResult = {
          resultId: payload.new.id,
          bName: payload.new.b_name,
          duoName: payload.new.result.duo_name,
          culturalReference: payload.new.result.cultural_reference?.reference || '',
          createdAt: payload.new.created_at
        }
        onNewResult(newResult)
      }
    )
    .subscribe()

  return channel
}

/**
 * Cancela una suscripción de realtime
 * @param {Object} subscription - Objeto retornado por subscribeToSessionResults
 */
export async function unsubscribe(subscription) {
  if (subscription) {
    await supabase.removeChannel(subscription)
  }
}
