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

2. Copiar `.env.example` a `.env` y configurar las variables:
```bash
cp .env.example .env
```

3. Configurar variables de entorno:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Anon key de Supabase
- `VITE_ANTHROPIC_API_KEY`: API key de Anthropic Claude

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## Base de Datos (Supabase)

### Tabla: user_sessions
- `id` (string, PK): ID único de sesión de A
- `profile` (jsonb): Perfil interno generado por Claude
- `created_at` (timestamp)

### Tabla: duo_results
- `id` (string, PK): ID único del resultado
- `session_id` (string, FK): Referencia a user_sessions
- `b_name` (string): Nombre de Usuario B
- `b_profile` (jsonb): Perfil interno de B
- `result` (jsonb): Resultado completo del dúo
- `created_at` (timestamp)

## Pendientes

- [ ] Implementar llamadas a Claude API
- [ ] Configurar esquema de Supabase
- [ ] Implementar servicios de base de datos
- [ ] Implementar generación de imágenes compartibles
- [ ] Configurar Supabase Realtime para dashboard
- [ ] Deploy en Vercel
