# iconic-duo app

Aplicación web que analiza la dinámica entre dos personas a través de un cuestionario de cultura y entretenimiento.

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
```

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
- `VITE_ANTHROPIC_API_KEY`: API key de Anthropic Claude

5. Ejecutar en desarrollo:
```bash
npm run dev
```

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

## Pendientes

- [x] Configurar esquema de Supabase
- [ ] Implementar llamadas a Claude API
- [ ] Implementar servicios de base de datos
- [ ] Implementar generación de imágenes compartibles
- [ ] Configurar Supabase Realtime para dashboard
- [ ] Deploy en Vercel

## Documentación Adicional

- [Configuración de Supabase](supabase/SETUP.md) - Guía completa de setup de base de datos
- [Especificaciones Técnicas](spec_doc_v2.txt) - Documento de especificaciones
- [Content Bible](content_bible_v2.txt) - Guía de tono y contenido
