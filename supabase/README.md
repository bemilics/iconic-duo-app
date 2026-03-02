# Supabase - Base de Datos

Configuración y migraciones de la base de datos para iconic-duo app.

## 📁 Archivos

### Migraciones SQL

1. **`001_initial_schema.sql`** (3.3 KB)
   - Crea las tablas `user_sessions` y `duo_results`
   - Configura índices para búsquedas rápidas
   - Habilita Row Level Security (RLS)
   - Define políticas de acceso público para INSERT/SELECT
   - **⚠️ REQUERIDO** - Ejecutar primero

2. **`002_functions.sql`** (1.7 KB)
   - Función `get_session_results(session_id)` - Lista resultados de una sesión
   - Función `count_session_results(session_id)` - Cuenta resultados
   - **Recomendado** - Facilita queries desde el frontend

3. **`003_seed_data.sql`** (8.7 KB)
   - Datos de prueba: 2 sesiones y 3 resultados de dúo
   - **OPCIONAL** - Solo para desarrollo/testing
   - NO ejecutar en producción

### Documentación

- **`SETUP.md`** - Guía completa de configuración paso a paso
- **`test-connection.js`** - Script para verificar que todo funciona

## 🚀 Quick Start

### 1. Crear proyecto en Supabase

```bash
# 1. Ir a https://supabase.com
# 2. Crear nuevo proyecto
# 3. Esperar ~2 minutos a que se inicialice
```

### 2. Ejecutar migraciones

En el dashboard de Supabase → **SQL Editor**:

1. Copiar y ejecutar `001_initial_schema.sql` ✅ REQUERIDO
2. Copiar y ejecutar `002_functions.sql` (recomendado)
3. Copiar y ejecutar `003_seed_data.sql` (opcional, solo testing)

### 3. Obtener credenciales

Supabase → **Project Settings** → **API**:

- Copiar **Project URL** → `VITE_SUPABASE_URL`
- Copiar **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configurar .env

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Verificar conexión

```bash
npm install
npm run test:db
```

Deberías ver:

```
✅ Conexión exitosa! Supabase está configurado correctamente.
```

## 📊 Estructura de Datos

### user_sessions

Almacena el perfil de Usuario A (quien comparte el link).

| Campo      | Tipo      | Descripción                          |
|------------|-----------|--------------------------------------|
| id         | UUID      | Session ID (también en la URL)       |
| profile    | JSONB     | Perfil psicológico generado          |
| created_at | TIMESTAMP | Fecha de creación                    |

**Ejemplo de `profile`:**
```json
{
  "archetype": "El observador silencioso",
  "core_trait": "Reflexivo y analítico",
  "relational_role": "El que escucha primero",
  "conflict_style": "Evita confrontación directa",
  "narrative_tendency": "Prefiere historias abiertas",
  "cultural_fingerprint": "Consume contenido independiente",
  "raw_notes": "..."
}
```

### duo_results

Almacena cada resultado de dúo (A + B).

| Campo      | Tipo      | Descripción                          |
|------------|-----------|--------------------------------------|
| id         | UUID      | Result ID                            |
| session_id | UUID      | FK a user_sessions                   |
| b_name     | TEXT      | Nombre de Usuario B                  |
| b_profile  | JSONB     | Perfil de Usuario B                  |
| result     | JSONB     | Análisis completo (7 secciones)      |
| created_at | TIMESTAMP | Fecha de creación                    |

**Ejemplo de `result`:**
```json
{
  "duo_name": "Los que llegan tarde pero llegan bien",
  "cultural_reference": {
    "reference": "Joel y Ellie de The Last of Us",
    "explanation": "Uno carga la experiencia, el otro carga el futuro"
  },
  "dynamic": "...",
  "individual_analysis": { ... },
  "green_flags": ["...", "..."],
  "red_flags": ["...", "..."],
  "probable_arc": "..."
}
```

## 🔒 Seguridad

### Row Level Security (RLS)

Ambas tablas tienen RLS habilitado con políticas públicas:

- ✅ **INSERT** - Cualquiera puede crear sesiones/resultados
- ✅ **SELECT** - Cualquiera puede leer (necesario para que B vea el perfil de A)
- ❌ **UPDATE** - Bloqueado (datos inmutables)
- ❌ **DELETE** - Bloqueado (solo CASCADE desde user_sessions)

### ¿Por qué políticas públicas?

La app no tiene autenticación de usuarios. La seguridad viene de:

1. **URLs no adivinables** - Los UUIDs son prácticamente imposibles de adivinar
2. **Datos no sensibles** - No se almacena información personal
3. **Inmutabilidad** - Una vez creado, no se puede modificar
4. **Anon key pública** - Las políticas RLS protegen incluso con la key expuesta

## 🛠️ Funciones Útiles

### get_session_results(session_id)

Lista todos los resultados de una sesión con info resumida.

```sql
SELECT * FROM get_session_results('uuid-aqui');
```

Retorna: `id`, `b_name`, `duo_name`, `created_at`

### count_session_results(session_id)

Cuenta cuántos dúos tiene una sesión.

```sql
SELECT count_session_results('uuid-aqui');
```

## 🧪 Testing

### Ejecutar test de conexión

```bash
npm run test:db
```

### Cargar datos de prueba

En SQL Editor, ejecutar `003_seed_data.sql`

Esto crea:
- 2 sesiones de Usuario A
- 3 resultados de dúo
- Datos realistas para probar la UI

### Queries útiles para debugging

```sql
-- Ver todas las sesiones
SELECT id, profile->>'archetype', created_at
FROM user_sessions
ORDER BY created_at DESC;

-- Ver todos los resultados
SELECT
  session_id,
  b_name,
  result->>'duo_name' as duo_name,
  created_at
FROM duo_results
ORDER BY created_at DESC;

-- Contar resultados por sesión
SELECT
  us.id,
  COUNT(dr.id) as duo_count
FROM user_sessions us
LEFT JOIN duo_results dr ON dr.session_id = us.id
GROUP BY us.id;
```

## 📖 Más Información

Ver [`SETUP.md`](SETUP.md) para:
- Guía paso a paso detallada
- Troubleshooting
- Configuración de Realtime
- Ejemplos de uso desde JavaScript

## ❓ Problemas Comunes

### "permission denied for table user_sessions"

→ Ejecutar `001_initial_schema.sql` para crear políticas RLS

### "relation 'user_sessions' does not exist"

→ Ejecutar `001_initial_schema.sql` primero

### Test de conexión falla

→ Verificar `.env` tiene las credenciales correctas de Supabase
