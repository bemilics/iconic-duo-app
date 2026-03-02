# iconic-duo app

Aplicación web que analiza la dinámica entre dos personas a través de un cuestionario de cultura y entretenimiento.

**🚀 [Deploy en Vercel AHORA](DEPLOY_NOW.md)** - Sube a producción en 10 minutos

**💻 [Quick Start Local](QUICKSTART.md)** - Desarrollo local (requiere Vercel CLI)

## Stack Técnico

- **Frontend**: React + Vite
- **Hosting**: Vercel
- **Base de datos**: Supabase
- **API**: Anthropic Claude API (claude-sonnet-4-6)

## Estructura del Proyecto

```
src/
├── components/
│   ├── Landing/        # Página inicial
│   ├── Questionnaire/  # Cuestionario dinámico
│   ├── Dashboard/      # Dashboard de resultados
│   ├── Result/         # Vista de resultado individual
│   └── shared/         # Componentes compartidos
├── services/           # Servicios (Claude API, Supabase)
├── hooks/              # Custom hooks
├── utils/              # Utilidades
├── styles/             # Estilos globales
└── config/             # Configuración (Supabase, Claude, prompts)

api/
└── claude.js           # Serverless function - Proxy a Claude API
```

## Arquitectura

### Frontend → Backend → Claude API

Por seguridad, las llamadas a Claude API se hacen desde el backend:

1. **Frontend** (`src/services/claudeApi.js`) → llama a `/api/claude`
2. **Backend** (`api/claude.js`) → llama a `api.anthropic.com`
3. La API key de Anthropic **nunca se expone** al navegador

Esto resuelve:
- ✅ CORS (mismo origen)
- ✅ Seguridad (API key en servidor)
- ✅ Rate limiting centralizado

## URLs

- `/` - Landing page
- `/start` - Cuestionario para Usuario A
- `/:sessionId` - Cuestionario para Usuario B (link compartible)
- `/:sessionId/dashboard` - Dashboard de A con todos sus resultados
- `/:sessionId/result/:resultId` - Resultado individual de un dúo

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Supabase:
```bash
# Ver guía completa en supabase/SETUP.md
# 1. Crear proyecto en supabase.com
# 2. Ejecutar scripts en supabase/migrations/
# 3. Copiar credenciales a .env
```

3. Copiar `.env.example` a `.env` y configurar las variables:
```bash
cp .env.example .env
```

4. Configurar variables de entorno:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Anon key de Supabase
- `ANTHROPIC_API_KEY`: API key de Anthropic Claude (sin prefijo VITE_)

5. Instalar Vercel CLI (primera vez):
```bash
npm install
```

6. Ejecutar en desarrollo:
```bash
npm run dev
```

Esto inicia Vercel Dev que ejecuta:
- Frontend en `http://localhost:3000` (Vite)
- API Routes en `/api/*` (serverless functions locales)

## Base de Datos (Supabase)

**Ver guía completa de configuración en [`supabase/SETUP.md`](supabase/SETUP.md)**

### Tablas

**user_sessions** - Perfiles de Usuario A
- `id` (UUID, PK): ID único de sesión (también es el sessionId en la URL)
- `profile` (JSONB): Perfil interno generado por Claude
- `created_at` (TIMESTAMP)

**duo_results** - Resultados de dúos
- `id` (UUID, PK): ID único del resultado
- `session_id` (UUID, FK): Referencia a user_sessions
- `b_name` (TEXT): Nombre de Usuario B
- `b_profile` (JSONB): Perfil interno de B
- `result` (JSONB): Resultado completo del dúo (7 secciones)
- `created_at` (TIMESTAMP)

### Migraciones Disponibles

1. `001_initial_schema.sql` - Tablas y políticas RLS
2. `002_functions.sql` - Funciones útiles (get_session_results, count_session_results)
3. `003_seed_data.sql` - Datos de prueba (opcional, solo desarrollo)

## Servicios Implementados

### Claude API
- ✅ Cliente base de Claude API (`services/claudeApi.js`)
- ✅ Cuestionario dinámico de 9 preguntas (`services/questionnaireService.js`)
- ✅ Análisis de dúo (`services/duoAnalysisService.js`)

### Supabase
- ✅ Gestión de sesiones de usuario (`services/databaseService.js`)
- ✅ CRUD de resultados de dúo
- ✅ Supabase Realtime para dashboard

Ver documentación completa en [`src/services/README.md`](src/services/README.md)

## Pendientes

- [x] Configurar esquema de Supabase
- [x] Implementar llamadas a Claude API
- [x] Implementar servicios de base de datos
- [x] Configurar Supabase Realtime para dashboard
- [ ] Implementar generación de imágenes compartibles
- [ ] Deploy en Vercel

## Documentación Adicional

- [Deployment en Vercel](DEPLOYMENT.md) - Guía completa de deploy y configuración
- [Configuración de Supabase](supabase/SETUP.md) - Setup de base de datos
- [Servicios](src/services/README.md) - Documentación de servicios y API
- [Especificaciones Técnicas](spec_doc_v2.txt) - Documento de especificaciones
- [Content Bible](content_bible_v2.txt) - Guía de tono y contenido
