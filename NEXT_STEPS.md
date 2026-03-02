# 🎯 Próximos Pasos

## Para Deploy en Producción (RECOMENDADO)

### 1. Subir a GitHub (5 minutos)

```bash
git init
git add .
git commit -m "Initial commit - iconic-duo app"
```

Crear repo en GitHub: https://github.com/new
Nombre: `iconic-duo-app`

```bash
git remote add origin https://github.com/TU-USUARIO/iconic-duo-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy en Vercel (5 minutos)

Ver guía completa: **[DEPLOY_NOW.md](DEPLOY_NOW.md)**

Resumen:
1. Ir a https://vercel.com/new
2. Importar repo de GitHub
3. Agregar 3 variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy!

---

## Para Desarrollo Local (Alternativo)

Si prefieres desarrollar localmente primero:

Ver guía: **[QUICKSTART.md](QUICKSTART.md)**

Requiere:
- Vercel CLI: `npx vercel dev`
- Configurar `.env` local
- Login en Vercel

**Nota:** Es más complejo que deployar directo.

---

## Checklist Pre-Deploy

- [ ] Proyecto Supabase creado
- [ ] Ejecutado `001_initial_schema.sql` en Supabase
- [ ] API Key de Anthropic obtenida
- [ ] Cuenta GitHub activa
- [ ] Cuenta Vercel (login con GitHub)

---

## ¿Dudas?

- Deploy rápido: [DEPLOY_NOW.md](DEPLOY_NOW.md)
- Desarrollo local: [QUICKSTART.md](QUICKSTART.md)
- Supabase setup: [supabase/SETUP.md](supabase/SETUP.md)
- Deploy completo: [DEPLOYMENT.md](DEPLOYMENT.md)
