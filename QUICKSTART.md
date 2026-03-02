# Quick Start - iconic-duo app

Guía rápida para empezar a desarrollar en 5 minutos.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará:
- React, Vite, React Router
- Supabase client
- Vercel CLI (para desarrollo local)

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Supabase (obtener de supabase.com → tu proyecto → Settings → API)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic (obtener de console.anthropic.com → Settings → API Keys)
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
```

### 3. Configurar Supabase (primera vez)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor
3. Ejecutar el contenido de `supabase/migrations/001_initial_schema.sql`
4. (Opcional) Ejecutar `002_functions.sql` y `003_seed_data.sql`

Ver guía completa: [`supabase/SETUP.md`](supabase/SETUP.md)

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Esto ejecuta Vercel Dev que:
- Inicia Vite en `http://localhost:3000`
- Ejecuta las API Routes en `/api/*`
- Recarga automáticamente en cambios

### 5. Abrir en navegador

```
http://localhost:3000
```

Click en "Empezar" y completa el cuestionario.

## ✅ Verificación

Si todo funciona correctamente:

1. ✅ Landing page carga sin errores
2. ✅ Click en "Empezar" inicia el cuestionario
3. ✅ Las preguntas se generan dinámicamente (llaman a Claude API)
4. ✅ Después de 9 preguntas, te redirige al dashboard
5. ✅ El dashboard muestra un link compartible

## 🐛 Problemas Comunes

### Error: "Missing ANTHROPIC_API_KEY"

**Solución:** Verifica que el archivo `.env` existe y tiene la API key correcta (sin prefijo `VITE_`).

### Error: "POST /api/claude 404"

**Problema:** Estás usando `npm run dev:vite` en lugar de `npm run dev`

**Solución:** Usa `npm run dev` (que ejecuta Vercel Dev)

### Error: "relation 'user_sessions' does not exist"

**Problema:** No ejecutaste las migraciones de Supabase

**Solución:** Ir a Supabase SQL Editor y ejecutar `supabase/migrations/001_initial_schema.sql`

### Vercel Dev no encuentra las variables de entorno

**Problema:** `.env` no está en la raíz del proyecto

**Solución:** Asegúrate de que `.env` está en `/home/branko/Proyectos/GitHub/iconic-duo-app/.env`

### Las preguntas tardan mucho en cargar

**Normal:** Claude API puede tardar 5-15 segundos por pregunta. Es esperado.

## 📖 Próximos Pasos

### Para desarrollo:
- Ver [`src/services/README.md`](src/services/README.md) - Documentación de servicios
- Ver componentes en `src/components/`
- Modificar prompts en `src/config/prompts.js`

### Para deploy:
- Ver [`DEPLOYMENT.md`](DEPLOYMENT.md) - Guía completa de deployment en Vercel

### Para entender el proyecto:
- Ver [`spec_doc_v2.txt`](spec_doc_v2.txt) - Especificaciones técnicas
- Ver [`content_bible_v2.txt`](content_bible_v2.txt) - Guía de tono y contenido

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con Vercel Dev (RECOMENDADO)
npm run dev:vite     # Solo Vite (sin API routes - no usar)
npm run build        # Build para producción
npm run preview      # Preview del build
npm run test:db      # Test de conexión a Supabase
```

## 🎯 Estructura del Flujo

### Usuario A (quien comparte):
1. Completa 9 preguntas
2. Claude genera su perfil
3. Se guarda en Supabase
4. Recibe un link: `http://localhost:3000/[uuid]`
5. Comparte el link con otros

### Usuario B (quien recibe el link):
1. Abre el link
2. Completa 9 preguntas (a ciegas)
3. Ingresa su nombre
4. Claude genera perfil de B
5. Claude cruza ambos perfiles → genera resultado
6. Ve el resultado con las 7 secciones
7. A recibe notificación en su dashboard (Realtime)

## 💡 Tips

### Hot Reload
Vercel Dev detecta cambios automáticamente:
- Cambios en `src/` → Vite recarga
- Cambios en `api/` → Serverless functions se recargan

### Ver logs de API
Los logs de `/api/claude` aparecen en la terminal donde ejecutaste `npm run dev`

### Debugging
Usa Chrome DevTools:
- Network tab: ver llamadas a `/api/claude`
- Console: ver errores de JavaScript
- Application → Local Storage: ver datos guardados

### Base de datos
Usa Supabase Dashboard → Table Editor para ver los datos en tiempo real:
- `user_sessions`: Sesiones de Usuario A
- `duo_results`: Resultados generados

## ❓ Ayuda

Si algo no funciona:
1. Revisar esta guía
2. Ver [`DEPLOYMENT.md`](DEPLOYMENT.md) - Troubleshooting
3. Ver logs en terminal
4. Verificar variables de entorno en `.env`

Happy coding! 🚀
