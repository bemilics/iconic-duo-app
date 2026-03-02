# Configuración de Supabase

Guía para configurar la base de datos de iconic-duo app en Supabase.

## 1. Crear Proyecto en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Crear una cuenta o iniciar sesión
3. Crear un nuevo proyecto
4. Esperar a que el proyecto se inicialice (puede tomar 1-2 minutos)

## 2. Ejecutar Migraciones SQL

### Opción A: SQL Editor (Recomendado)

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Crear una nueva query
3. Copiar y pegar el contenido de `migrations/001_initial_schema.sql`
4. Ejecutar el script (botón "Run")
5. Repetir con `migrations/002_functions.sql`

### Opción B: Desde la terminal (requiere Supabase CLI)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref <tu-project-ref>

# Aplicar migraciones
supabase db push
```

## 3. Verificar Tablas Creadas

En el dashboard de Supabase:

1. Ir a **Table Editor**
2. Deberías ver dos tablas:
   - `user_sessions` - Perfiles de Usuario A
   - `duo_results` - Resultados de dúos

## 4. Verificar RLS (Row Level Security)

1. Ir a **Authentication** → **Policies**
2. Deberías ver políticas activas para ambas tablas:
   - `user_sessions`: 2 políticas (INSERT, SELECT)
   - `duo_results`: 2 políticas (INSERT, SELECT)

## 5. Obtener Credenciales

1. Ir a **Project Settings** → **API**
2. Copiar:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

3. Agregar a tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6. Estructura de las Tablas

### user_sessions

| Campo      | Tipo      | Descripción                                    |
|------------|-----------|------------------------------------------------|
| id         | UUID      | ID único de sesión (PK, auto-generado)        |
| profile    | JSONB     | Perfil interno generado por Claude            |
| created_at | TIMESTAMP | Fecha de creación                              |

**Ejemplo de profile JSONB:**
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

| Campo      | Tipo      | Descripción                                    |
|------------|-----------|------------------------------------------------|
| id         | UUID      | ID único del resultado (PK, auto-generado)    |
| session_id | UUID      | FK a user_sessions                             |
| b_name     | TEXT      | Nombre de Usuario B                            |
| b_profile  | JSONB     | Perfil interno de Usuario B                    |
| result     | JSONB     | Resultado completo del análisis                |
| created_at | TIMESTAMP | Fecha de creación                              |

**Ejemplo de result JSONB:**
```json
{
  "duo_name": "Los que llegan tarde pero llegan bien",
  "cultural_reference": {
    "reference": "Joel y Ellie de The Last of Us",
    "explanation": "Uno carga la experiencia, el otro carga el futuro"
  },
  "dynamic": "...",
  "individual_analysis": {
    "person_a": {
      "archetype_name": "...",
      "role_in_duo": "..."
    },
    "person_b": {
      "archetype_name": "...",
      "role_in_duo": "..."
    }
  },
  "green_flags": ["...", "..."],
  "red_flags": ["...", "..."],
  "probable_arc": "..."
}
```

## 7. Funciones Disponibles

### get_session_results(session_id)

Obtiene todos los resultados de una sesión con información resumida:

```sql
SELECT * FROM get_session_results('uuid-de-sesion');
```

Retorna: `id`, `b_name`, `duo_name`, `created_at`

### count_session_results(session_id)

Cuenta los resultados de una sesión:

```sql
SELECT count_session_results('uuid-de-sesion');
```

## 8. Test de Conexión

Puedes probar la conexión desde JavaScript:

```javascript
import { supabase } from './src/config/supabase'

// Test de conexión
const { data, error } = await supabase
  .from('user_sessions')
  .select('count')

console.log('Supabase conectado:', !error)
```

## 9. Consideraciones de Seguridad

- **RLS habilitado**: Las políticas permiten operaciones públicas (INSERT/SELECT) porque la app no tiene autenticación de usuarios
- **No hay UPDATE/DELETE público**: Los datos son inmutables una vez creados
- **CASCADE en FK**: Si se borra una sesión, se borran todos sus resultados asociados
- **Anon key es pública**: Está bien exponerla en el frontend, las políticas RLS protegen los datos

## 10. Realtime (Opcional)

Para actualizar el dashboard en tiempo real cuando llega un nuevo resultado:

1. Ir a **Database** → **Replication**
2. Habilitar Realtime para la tabla `duo_results`
3. Usar en el código:

```javascript
const channel = supabase
  .channel('duo_results')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'duo_results',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    console.log('Nuevo resultado:', payload.new)
  })
  .subscribe()
```

## Troubleshooting

### Error: "permission denied for table user_sessions"
- Verificar que RLS esté habilitado
- Verificar que las políticas estén creadas correctamente

### Error: "relation 'user_sessions' does not exist"
- Ejecutar el script de migración `001_initial_schema.sql`

### Error: "invalid input syntax for type uuid"
- Verificar que estás usando UUIDs válidos, no strings arbitrarios
