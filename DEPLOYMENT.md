# Guía de Deployment - iconic-duo app

## 🌐 Deploy en Vercel

### Requisitos previos

1. Cuenta en [Vercel](https://vercel.com)
2. Proyecto en [Supabase](https://supabase.com) configurado
3. API Key de [Anthropic](https://console.anthropic.com/)

### Paso 1: Preparar el proyecto

El proyecto ya está configurado para Vercel:
- ✅ `vercel.json` - Configuración de build
- ✅ `/api/claude.js` - Serverless function para Claude API
- ✅ Vite configurado correctamente

### Paso 2: Deploy desde GitHub (Recomendado)

1. **Push tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/iconic-duo-app.git
   git push -u origin main
   ```

2. **Importar en Vercel**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Seleccionar "Import Git Repository"
   - Conectar tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configurar Variables de Entorno**

   En el dashboard de Vercel → Settings → Environment Variables:

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | URL de tu proyecto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Anon/public key de Supabase |
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-xxx...` | Tu API key de Anthropic Claude |

   **IMPORTANTE:**
   - Variables con prefijo `VITE_` son públicas (van al frontend)
   - `ANTHROPIC_API_KEY` SIN prefijo `VITE_` es privada (solo backend)

4. **Deploy**
   - Click en "Deploy"
   - Esperar ~2 minutos
   - Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Paso 3: Verificar el deployment

1. Abrir la URL de tu app
2. Completar el cuestionario como Usuario A
3. Verificar que las preguntas se generen correctamente (llaman a Claude API)
4. Copiar el link compartible
5. Abrir en otra ventana/navegador
6. Completar como Usuario B
7. Verificar que el resultado se genera correctamente

## 🔧 Desarrollo Local

### Configuración

1. **Copiar variables de entorno**
   ```bash
   cp .env.example .env
   ```

2. **Completar el archivo `.env`**
   ```env
   # Supabase (Frontend)
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Anthropic Claude API (Backend - API Routes)
   ANTHROPIC_API_KEY=sk-ant-api03-xxx...
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en navegador**
   ```
   http://localhost:5173
   ```

### Cómo funciona en local

Vite tiene un proxy integrado que maneja las rutas `/api/*`:
- Frontend: `http://localhost:5173` (Vite dev server)
- API Routes: Se ejecutan como serverless functions simuladas
- La API key de Anthropic se lee de `.env` y **NO se expone** al navegador

## 🔒 Seguridad

### Variables de Entorno

**Frontend (con prefijo `VITE_`):**
- ✅ Se incluyen en el bundle JavaScript
- ✅ Son visibles en el navegador
- ✅ Usar solo para URLs públicas y keys anon de Supabase

**Backend (sin prefijo `VITE_`):**
- ✅ Solo disponibles en serverless functions (`/api/*`)
- ✅ NO se incluyen en el bundle del frontend
- ✅ Usar para API keys secretas (Anthropic)

### CORS

El problema de CORS se resuelve porque:
1. El frontend llama a `/api/claude` (mismo origen)
2. El backend serverless llama a `api.anthropic.com`
3. El navegador nunca llama directamente a Anthropic

### Rate Limiting

Considera implementar rate limiting en `/api/claude` si la app es pública:

```javascript
// api/claude.js
const rateLimit = new Map()

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  // Limitar a 10 llamadas por minuto por IP
  const now = Date.now()
  const userRequests = rateLimit.get(ip) || []
  const recentRequests = userRequests.filter(time => now - time < 60000)

  if (recentRequests.length >= 10) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  // ... resto del código
}
```

## 🐛 Troubleshooting

### Error: "Missing ANTHROPIC_API_KEY"

**Causa:** La variable de entorno no está configurada en Vercel

**Solución:**
1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Agregar `ANTHROPIC_API_KEY` con tu API key
3. Redeploy el proyecto

### Error: "Failed to fetch"

**Causa:** El endpoint `/api/claude` no está respondiendo

**Solución:**
1. Verificar que el archivo `api/claude.js` existe
2. Verificar logs en Vercel Dashboard → Deployments → [tu deploy] → Functions
3. Verificar que la API key de Anthropic es válida

### Error: "CORS policy"

**Causa:** Estás llamando directamente a `api.anthropic.com` desde el frontend

**Solución:**
1. Asegurarte de que `src/services/claudeApi.js` llama a `/api/claude`
2. NO llamar directamente a `https://api.anthropic.com`

### Dashboard vacío después de completar cuestionario

**Causa:** Variables de Supabase no configuradas

**Solución:**
1. Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel
2. Verificar que las tablas existen en Supabase
3. Ejecutar `supabase/migrations/001_initial_schema.sql`

## 📊 Monitoreo

### Logs en Vercel

Ver logs en tiempo real:
```bash
vercel logs [deployment-url]
```

O en el dashboard:
- Vercel → Deployments → [tu deploy] → Runtime Logs

### Costos de Anthropic

Monitorear uso en:
- [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)

Estimación aproximada:
- 9 preguntas + análisis = ~11 llamadas por dúo completo
- Modelo: `claude-sonnet-4-20250514`
- ~2000-3000 tokens por sesión completa

## 🚀 Optimizaciones

### Caché de resultados

Los resultados ya están en Supabase, no es necesario cachear.

### Reducir llamadas a Claude

Si quieres reducir costos:
1. Reducir de 9 a 6-7 preguntas
2. Usar modelo más económico para preguntas iniciales
3. Solo usar Sonnet 4 para el análisis final

### Edge Functions

Para mejor rendimiento global:
1. Vercel automáticamente distribuye las serverless functions
2. Las llamadas a Claude se hacen desde el edge más cercano al usuario

## 📝 Comandos útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy manual (requiere Vercel CLI)
npm install -g vercel
vercel

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls
```

## ✅ Checklist de Deploy

- [ ] Proyecto en Supabase creado
- [ ] Migraciones SQL ejecutadas
- [ ] API key de Anthropic obtenida
- [ ] Código pusheado a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Verificar flujo completo (A → B → resultado)
- [ ] Verificar que Claude genera preguntas correctamente
- [ ] Verificar que el dashboard muestra resultados
- [ ] Verificar Realtime updates en dashboard
