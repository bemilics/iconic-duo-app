# Deploy Rápido en Vercel

Guía para hacer deploy en producción en 10 minutos.

## 📋 Pre-requisitos

- [x] Proyecto Supabase creado
- [x] Migraciones SQL ejecutadas (`001_initial_schema.sql`)
- [x] API Key de Anthropic
- [ ] Cuenta en GitHub
- [ ] Cuenta en Vercel (puedes usar GitHub para login)

## 🚀 Pasos

### 1. Subir código a GitHub

```bash
# Inicializar git (si no lo hiciste ya)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - iconic-duo app"

# Crear repo en GitHub y conectarlo
# Ve a github.com/new y crea un repo llamado "iconic-duo-app"
# Luego ejecuta:

git remote add origin https://github.com/TU-USUARIO/iconic-duo-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy en Vercel

1. **Ir a Vercel**
   - Abrir [vercel.com/new](https://vercel.com/new)
   - Login con GitHub

2. **Importar Proyecto**
   - Click en "Import Git Repository"
   - Buscar y seleccionar `iconic-duo-app`
   - Click en "Import"

3. **Configurar Proyecto**
   - Vercel detectará automáticamente que es Vite
   - **NO CAMBIAR NADA** en Build & Development Settings
   - Ir directamente a "Environment Variables"

4. **Agregar Variables de Entorno**

   Click en "Add" para cada una:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-xxx...` | Production, Preview, Development |

   **IMPORTANTE:**
   - Variables con `VITE_` → son públicas (frontend)
   - `ANTHROPIC_API_KEY` sin `VITE_` → es privada (backend)

5. **Deploy**
   - Click en "Deploy"
   - Esperar ~2 minutos
   - ✅ Tu app estará en `https://iconic-duo-app.vercel.app`

### 3. Verificar

1. Abrir tu URL de Vercel
2. Click en "Empezar"
3. Completar cuestionario (9 preguntas)
4. Verificar que se genera el dashboard
5. Copiar link compartible
6. Abrir en ventana privada / otro navegador
7. Completar como Usuario B
8. Verificar que se genera el resultado

## 🔧 Troubleshooting

### Error durante el build

Ve a Vercel → tu proyecto → Deployments → [último deploy] → Build Logs

Errores comunes:
- Variables de entorno faltantes
- Error de sintaxis en código

### Error: "Missing ANTHROPIC_API_KEY"

1. Ir a Vercel → Settings → Environment Variables
2. Verificar que `ANTHROPIC_API_KEY` existe
3. Click en los 3 puntos → Edit
4. Verificar que está en "Production, Preview, Development"
5. Redeploy: Deployments → [último] → ... → Redeploy

### Error: "relation 'user_sessions' does not exist"

No ejecutaste las migraciones de Supabase:
1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar `supabase/migrations/001_initial_schema.sql`

### Las preguntas no cargan

1. Abrir DevTools → Console
2. Ver errores
3. Verificar que `/api/claude` responde (Network tab)
4. Verificar API key de Anthropic es válida

## 📊 Después del Deploy

### Ver logs en tiempo real

Vercel → tu proyecto → Functions → `/api/claude` → Logs

### Monitorear uso de Anthropic

[console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)

### Custom Domain (opcional)

Vercel → Settings → Domains → Add

## 🔄 Próximos Deploys

Cada vez que hagas `git push`, Vercel hace deploy automático:

```bash
# Hacer cambios en tu código
git add .
git commit -m "descripción de cambios"
git push
```

Vercel automáticamente:
1. Detecta el push
2. Ejecuta build
3. Deploya nueva versión
4. Actualiza `iconic-duo-app.vercel.app`

## ✅ Checklist Final

- [ ] Código en GitHub
- [ ] Proyecto importado en Vercel
- [ ] 3 variables de entorno configuradas
- [ ] Deploy exitoso (build verde)
- [ ] App abre sin errores
- [ ] Cuestionario funciona (9 preguntas)
- [ ] Dashboard se genera
- [ ] Link compartible funciona
- [ ] Usuario B puede completar
- [ ] Resultado se genera correctamente

## 💡 Tips

### Branch Previews

Cada branch que crees tendrá su propia URL de preview:
- `main` → `iconic-duo-app.vercel.app`
- `dev` → `iconic-duo-app-git-dev.vercel.app`

### Rollback

Si algo sale mal:
Vercel → Deployments → [deploy anterior que funcionaba] → ... → Promote to Production

### Variables de entorno por ambiente

Puedes tener diferentes valores para:
- Production (la app en vivo)
- Preview (branches)
- Development (local con `vercel dev`)

---

**¿Listo? Sube el código a GitHub y haz el deploy!** 🚀
