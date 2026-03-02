# Servicios - iconic-duo app

Documentación de todos los servicios de la aplicación.

## 📁 Estructura

```
services/
├── claudeApi.js              # Cliente base de Claude API
├── questionnaireService.js   # Cuestionario dinámico de 9 preguntas
├── duoAnalysisService.js     # Análisis de dinámica entre dos personas
├── databaseService.js        # Operaciones de Supabase
└── index.js                  # Exports centralizados
```

## 🤖 Claude API

### claudeApi.js

Servicio base para comunicarse con Anthropic Claude API.

#### `callClaude(options)`

Realiza una llamada a Claude API.

```javascript
import { callClaude } from './services'

const response = await callClaude({
  systemPrompt: 'Eres un asistente útil',
  messages: [
    { role: 'user', content: 'Hola' }
  ],
  maxTokens: 1024 // opcional
})
```

**Parámetros:**
- `systemPrompt` (string): System prompt para Claude
- `messages` (array): Historial de mensajes (formato Anthropic)
- `maxTokens` (number): Máximo de tokens en respuesta (default: 2048)

**Retorna:** String con la respuesta de Claude

#### `parseJsonFromResponse(text)`

Extrae y parsea JSON de una respuesta de Claude.

```javascript
const json = parseJsonFromResponse(response)
```

Maneja casos donde Claude envuelve el JSON en:
- Code blocks markdown (```json ... ```)
- Texto adicional antes/después del JSON

#### `parseQuestionFromResponse(text)`

Extrae pregunta y opciones de la respuesta de Claude.

```javascript
const question = parseQuestionFromResponse(response)
// { text: "¿Pregunta?", options: ["A", "B", "C"] }
```

## 📝 Cuestionario Dinámico

### questionnaireService.js

Gestiona el cuestionario adaptativo de 9 preguntas.

#### `createQuestionnaireSession()`

Crea una nueva sesión de cuestionario.

```javascript
import { createQuestionnaireSession } from './services'

const session = createQuestionnaireSession()
```

#### Clase: `QuestionnaireSession`

**Métodos principales:**

##### `getFirstQuestion()`

Obtiene la primera pregunta del cuestionario.

```javascript
const firstQuestion = await session.getFirstQuestion()
// {
//   text: "¿Qué hacés cuando...?",
//   options: ["Opción A", "Opción B"],
//   questionNumber: 1
// }
```

##### `submitAnswer(answer)`

Envía una respuesta y obtiene la siguiente pregunta.

```javascript
const nextQuestion = await session.submitAnswer("Opción A")
// Retorna la siguiente pregunta, o null si ya completó las 9
```

##### `generateProfile()`

Genera el perfil interno después de las 9 respuestas.

```javascript
const profile = await session.generateProfile()
// {
//   archetype: "...",
//   core_trait: "...",
//   relational_role: "...",
//   conflict_style: "...",
//   narrative_tendency: "...",
//   cultural_fingerprint: "...",
//   raw_notes: "..."
// }
```

##### `getState()` / `restore(state)`

Guardar y restaurar el estado de la sesión.

```javascript
// Guardar
const state = session.getState()
localStorage.setItem('session', JSON.stringify(state))

// Restaurar
const savedState = JSON.parse(localStorage.getItem('session'))
session.restore(savedState)
```

## 🔀 Análisis de Dúo

### duoAnalysisService.js

Analiza la dinámica entre dos personas.

#### `analyzeDuo(profileA, profileB)`

Genera el análisis completo del dúo.

```javascript
import { analyzeDuo } from './services'

const result = await analyzeDuo(profileA, profileB)
// {
//   duo_name: "...",
//   cultural_reference: {
//     reference: "...",
//     explanation: "..."
//   },
//   dynamic: "...",
//   individual_analysis: {
//     person_a: { archetype_name: "...", role_in_duo: "..." },
//     person_b: { archetype_name: "...", role_in_duo: "..." }
//   },
//   green_flags: ["...", "..."],
//   red_flags: ["...", "..."],
//   probable_arc: "..."
// }
```

**Parámetros:**
- `profileA` (object): Perfil interno de Usuario A
- `profileB` (object): Perfil interno de Usuario B

**Retorna:** Objeto con las 7 secciones del resultado

#### `getResultPreview(result)`

Extrae información resumida para el dashboard.

```javascript
const preview = getResultPreview(result)
// { duo_name: "...", cultural_reference_short: "..." }
```

## 💾 Base de Datos

### databaseService.js

Operaciones de Supabase.

### User Sessions (Usuario A)

#### `createUserSession(profile)`

Crea una nueva sesión de Usuario A.

```javascript
import { createUserSession } from './services'

const session = await createUserSession(profile)
// {
//   sessionId: "uuid",
//   profile: {...},
//   createdAt: "timestamp"
// }
```

#### `getUserSession(sessionId)`

Obtiene una sesión por su ID.

```javascript
const session = await getUserSession(sessionId)
// null si no existe
```

#### `sessionExists(sessionId)`

Verifica si una sesión existe.

```javascript
const exists = await sessionExists(sessionId)
// true o false
```

### Duo Results

#### `createDuoResult({ sessionId, bName, bProfile, result })`

Crea un nuevo resultado de dúo.

```javascript
import { createDuoResult } from './services'

const duoResult = await createDuoResult({
  sessionId: 'uuid-de-sesion',
  bName: 'María',
  bProfile: profileB,
  result: analysisResult
})
// {
//   resultId: "uuid",
//   sessionId: "uuid",
//   bName: "María",
//   result: {...},
//   createdAt: "timestamp"
// }
```

#### `getDuoResult(resultId)`

Obtiene un resultado por su ID.

```javascript
const duoResult = await getDuoResult(resultId)
```

#### `getSessionResults(sessionId)`

Obtiene todos los resultados de una sesión (para dashboard).

```javascript
const results = await getSessionResults(sessionId)
// [
//   {
//     resultId: "uuid",
//     bName: "María",
//     duoName: "Los que...",
//     culturalReference: "Joel y Ellie",
//     createdAt: "timestamp"
//   }
// ]
```

#### `countSessionResults(sessionId)`

Cuenta los resultados de una sesión.

```javascript
const count = await countSessionResults(sessionId)
// número
```

### Realtime

#### `subscribeToSessionResults(sessionId, onNewResult)`

Suscribe a nuevos resultados en tiempo real.

```javascript
import { subscribeToSessionResults, unsubscribe } from './services'

const subscription = subscribeToSessionResults(
  sessionId,
  (newResult) => {
    console.log('Nuevo resultado:', newResult)
  }
)

// Cleanup
await unsubscribe(subscription)
```

**Callback recibe:**
```javascript
{
  resultId: "uuid",
  bName: "María",
  duoName: "Los que...",
  culturalReference: "Joel y Ellie",
  createdAt: "timestamp"
}
```

## 🔄 Flujo Completo

### Usuario A - Iniciar sesión

```javascript
import {
  createQuestionnaireSession,
  createUserSession
} from './services'

// 1. Crear sesión de cuestionario
const session = createQuestionnaireSession()

// 2. Obtener primera pregunta
const firstQuestion = await session.getFirstQuestion()

// 3. Loop de 9 preguntas
for (let i = 0; i < 9; i++) {
  const answer = await getUserAnswer() // tu lógica
  const nextQuestion = await session.submitAnswer(answer)
  if (!nextQuestion) break
}

// 4. Generar perfil
const profile = await session.generateProfile()

// 5. Guardar en Supabase
const userSession = await createUserSession(profile)

// 6. Compartir link: /${userSession.sessionId}
```

### Usuario B - Completar y generar resultado

```javascript
import {
  getUserSession,
  createQuestionnaireSession,
  analyzeDuo,
  createDuoResult
} from './services'

// 1. Cargar perfil de A
const sessionA = await getUserSession(sessionId)
const profileA = sessionA.profile

// 2. Completar cuestionario (igual que Usuario A)
const session = createQuestionnaireSession()
// ... 9 preguntas ...
const profileB = await session.generateProfile()

// 3. Generar análisis
const result = await analyzeDuo(profileA, profileB)

// 4. Guardar resultado
const duoResult = await createDuoResult({
  sessionId,
  bName: userName,
  bProfile: profileB,
  result
})

// 5. Mostrar resultado
```

## ⚠️ Manejo de Errores

Todos los servicios lanzan errores descriptivos:

```javascript
try {
  await createUserSession(profile)
} catch (error) {
  // Muestra mensaje user-friendly
  console.error(error.message)
}
```

Los errores incluyen:
- Problemas de conexión con Claude API
- Errores de autenticación (API key faltante)
- Errores de parseo JSON
- Errores de validación de datos
- Errores de Supabase (sesión no existe, etc.)

## 🧪 Testing

Los servicios están diseñados para ser fáciles de testear:

```javascript
// Mock de Claude API
jest.mock('./services/claudeApi', () => ({
  callClaude: jest.fn(() => Promise.resolve('mocked response'))
}))

// Mock de Supabase
jest.mock('./config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn() }))
    }))
  }
}))
```

## 📝 Notas

- **Reintentos**: Los servicios NO implementan reintentos automáticos. El componente debe manejar los reintentos.
- **Rate Limits**: Claude API tiene rate limits. Considera implementar throttling si es necesario.
- **Caché**: Los resultados no se cachean. Implementar caché si es necesario para reducir llamadas.
- **Timeout**: Las llamadas a Claude pueden tardar 5-15 segundos. Mostrar loading states apropiados.
