# DEVLOG - iconic-duo App

## 2026-03-01 - Mejoras UX y Failsafe para Parsing de Preguntas

### Contexto
El usuario reportó dos problemas críticos:
1. Landing page no redirige a usuarios que ya completaron el cuestionario
2. **BLOCKER**: Errores al mostrar preguntas - a veces no aparecen respuestas, solo una respuesta, o preguntas incompletas

### Implementaciones

#### 1. Auto-redirect en Landing Page
**Archivo**: `src/components/Landing/Landing.jsx`

Agregado `useEffect` que verifica `localStorage` por session ID guardado y redirige automáticamente al dashboard del usuario.

```javascript
useEffect(() => {
  const savedSessionId = localStorage.getItem('iconic-duo-session-id')
  if (savedSessionId) {
    navigate(`/${savedSessionId}/dashboard`)
  }
}, [navigate])
```

También se agregó botón secundario "Ir a mi dashboard" visible cuando existe sesión guardada.

**Status**: ✅ Completado

---

#### 2. Parsing Robusto de Preguntas (BLOCKER FIX)
**Archivo**: `src/services/claudeApi.js:73-177`

**Problema**: La función `parseQuestionFromResponse()` original no manejaba bien todos los formatos de respuesta de Claude, resultando en preguntas sin opciones o incompletas.

**Solución Implementada**:

1. **Limpieza de texto mejorada**:
   - Elimina code blocks (```)
   - Elimina markdown bold (**) e italic (__)
   - Trim automático

2. **3 Estrategias para encontrar la pregunta**:
   - Estrategia 1: Primera línea que termina con `?`
   - Estrategia 2: Primera línea larga (>20 caracteres)
   - Estrategia 3: Fallback a primera línea

3. **8 Patrones para detectar opciones**:
   - `A)`, `B)`, `C)`
   - `A.`, `B.`, `C.`
   - `A:`, `B:`, `C:`
   - `A -`, `B -`, `C -`
   - `1)`, `2)`, `3)`
   - `1.`, `2.`, `3.`
   - `- opción`, `• opción`, `* opción`
   - `→ opción`, `► opción`

4. **Manejo especial para 1 opción encontrada**:
   - Si solo encuentra 1 opción con patrones, busca las siguientes 1-2 líneas válidas

5. **Validación integrada**:
   - Retorna flag `isValid` indicando si tiene 2-3 opciones válidas

**Nueva función**: `validateQuestion(question)`
- Verifica que pregunta tenga texto no vacío
- Verifica que tenga exactamente 2-3 opciones
- Verifica que todas las opciones tengan texto

**Status**: ✅ Completado

---

#### 3. Sistema de Reintentos Automáticos
**Archivo**: `src/services/questionnaireService.js:22-115`

**Problema**: Cuando Claude devolvía respuestas mal formateadas, la app mostraba preguntas inválidas.

**Solución Implementada**:

Agregado sistema de reintentos en ambos métodos:
- `getFirstQuestion()`
- `submitAnswer()`

**Lógica**:
1. Llama a Claude para obtener pregunta
2. Parsea la respuesta
3. **Valida** con `validateQuestion()`
4. Si es inválida:
   - Quita los últimos 2 mensajes del historial
   - Pide a Claude que reformatee: "Por favor reformatea la pregunta con exactamente 2 o 3 opciones claramente separadas"
   - Reintenta (máximo 2 intentos)
5. Si todos los intentos fallan, lanza error descriptivo

**Constante**: `MAX_RETRY_ATTEMPTS = 2`

**Status**: ✅ Completado

---

#### 4. Persistencia de Progreso en localStorage
**Archivo**: `src/components/Questionnaire/Questionnaire.jsx`

**Problema**: Al recargar la página (por error o por preguntas inválidas), el usuario pierde todo su progreso.

**Solución Implementada**:

**Funciones nuevas**:
- `getStorageKey()`: Genera clave única por usuario (A o B) y sesión
- `saveProgress()`: Guarda estado después de cada respuesta
- `loadProgress()`: Carga progreso guardado al inicializar
- `clearProgress()`: Limpia progreso al completar cuestionario

**Datos guardados**:
```javascript
{
  state: {
    messages: [...],
    currentQuestionNumber: N
  },
  currentQuestion: { text, options, questionNumber },
  questionNumber: N,
  timestamp: Date.now()
}
```

**Características**:
- Auto-guarda después de cada respuesta (useEffect watchea `questionNumber`)
- Expira después de 24 horas
- Claves únicas: `questionnaire-progress-A` o `questionnaire-progress-B-{sessionId}`
- Restaura sesión completa incluyendo historial de mensajes
- Se limpia automáticamente al completar cuestionario

**Bonus**: Ahora también guarda `iconic-duo-session-id` en localStorage al completar cuestionario (líneas 103, 117 de Questionnaire.jsx)

**Status**: ✅ Completado

---

### Impacto

**Antes**:
- Usuario recargaba → perdía todo el progreso
- Preguntas mal formateadas → app quedaba bloqueada
- Usuario con sesión → tenía que buscar link manualmente

**Después**:
- Usuario recarga → continúa desde donde estaba (hasta 24h)
- Pregunta mal formateada → 2 reintentos automáticos
- Si reintentos fallan → error descriptivo (en vez de pregunta rota)
- Usuario con sesión → auto-redirect al dashboard

### Archivos Modificados

1. `src/services/claudeApi.js` - Parsing robusto + validación
2. `src/services/questionnaireService.js` - Sistema de reintentos
3. `src/services/index.js` - Export de `validateQuestion`
4. `src/components/Questionnaire/Questionnaire.jsx` - Persistencia localStorage
5. `src/components/Landing/Landing.jsx` - Auto-redirect

### Testing Pendiente

- [ ] Verificar parsing con diferentes formatos de Claude en producción
- [ ] Confirmar que reintentos funcionan correctamente
- [ ] Validar que localStorage persiste entre reloads
- [ ] Verificar expiración de 24 horas
- [ ] Confirmar auto-redirect desde landing

### Notas

- El sistema de reintentos usa el historial de mensajes de Claude, por lo que puede "re-preguntar" reformateando la misma pregunta
- localStorage tiene límite de ~5-10MB dependiendo del browser, pero con 9 preguntas max no debería ser problema
- La expiración de 24h evita que usuarios vean progreso obsoleto días después
