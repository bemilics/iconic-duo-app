// Test de conexión a Supabase
// Ejecutar: node supabase/test-connection.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔄 Probando conexión a Supabase...\n')

  try {
    // Test 1: Verificar tablas
    console.log('1️⃣  Verificando tabla user_sessions...')
    const { count: sessionsCount, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })

    if (sessionsError) throw sessionsError
    console.log(`   ✅ Tabla user_sessions encontrada (${sessionsCount} registros)`)

    // Test 2: Verificar tabla duo_results
    console.log('\n2️⃣  Verificando tabla duo_results...')
    const { count: resultsCount, error: resultsError } = await supabase
      .from('duo_results')
      .select('*', { count: 'exact', head: true })

    if (resultsError) throw resultsError
    console.log(`   ✅ Tabla duo_results encontrada (${resultsCount} registros)`)

    // Test 3: Verificar función get_session_results
    console.log('\n3️⃣  Verificando función get_session_results...')
    const { error: funcError } = await supabase
      .rpc('get_session_results', { p_session_id: '00000000-0000-0000-0000-000000000000' })

    if (funcError && !funcError.message.includes('function')) {
      // Es ok si no encuentra resultados, solo queremos saber si la función existe
      console.log('   ✅ Función get_session_results disponible')
    } else if (funcError) {
      console.log('   ⚠️  Función get_session_results no encontrada (ejecutar 002_functions.sql)')
    } else {
      console.log('   ✅ Función get_session_results disponible')
    }

    // Test 4: Listar datos existentes
    console.log('\n4️⃣  Listando sesiones existentes...')
    const { data: sessions, error: listError } = await supabase
      .from('user_sessions')
      .select('id, created_at')
      .limit(5)

    if (listError) throw listError

    if (sessions.length === 0) {
      console.log('   ℹ️  No hay sesiones aún (ejecutar 003_seed_data.sql para datos de prueba)')
    } else {
      console.log(`   ✅ ${sessions.length} sesión(es) encontrada(s):`)
      sessions.forEach(s => {
        console.log(`      - ${s.id} (${new Date(s.created_at).toLocaleString()})`)
      })
    }

    console.log('\n✅ Conexión exitosa! Supabase está configurado correctamente.\n')

  } catch (error) {
    console.error('\n❌ Error en la conexión:')
    console.error(error.message)
    console.log('\n💡 Sugerencias:')
    console.log('   - Verifica que hayas ejecutado 001_initial_schema.sql')
    console.log('   - Verifica tus credenciales en .env')
    console.log('   - Revisa supabase/SETUP.md para más información\n')
    process.exit(1)
  }
}

testConnection()
